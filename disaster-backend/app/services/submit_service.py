from datetime import datetime
from typing import Dict, Any, List, Optional
from pymongo import ReturnDocument
from app.extensions import socketio, mongo
from app.repositories import victim_repository
from app.repositories.dispatch_repository import save_dispatch
from app.services.nlp_service import predict_nlp_features
from app.services.priority_model_service import predict_priority_from_payload
from app.services.authority_model_service import (
    predict_authorities_from_payload,
    authority_binary_to_list,
)
from app.services.osm_geo_service import get_river_bridge_features
from app.services.nearest_authority_service import find_nearest
from app.services.escalation_service import (
    build_authority_escalation_queue,
    dispatch_first_round,
)
from app.services.google_maps_service import geocode_address_google


def _serialize(doc):
    """
    Convert MongoDB document into JSON-friendly format.
    Changes ObjectId to string.
    """
    if not doc:
        return None
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


def _get_lat_lon(payload: dict):
    """
    Extract latitude and longitude from payload.
    Supports both:
    - latitude / longitude
    - lat / lon
    """
    lat = payload.get("latitude", payload.get("lat"))
    lon = payload.get("longitude", payload.get("lon"))

    if lat is not None and lon is not None:
        try:
            return float(lat), float(lon)
        except Exception:
            return None, None

    return None, None


def _get_address(payload: dict, profile: dict | None = None):
    """
    Try to find a usable address from payload first,
    then from victim profile if needed.
    """
    candidates = [
        payload.get("address"),
        payload.get("manual_address"),
        payload.get("location_address"),
        payload.get("formatted_address"),
        payload.get("current_address"),
    ]

    # Also check saved profile addresses if a profile is provided
    if profile:
        candidates.extend(
            [
                profile.get("address"),
                profile.get("location_address"),
                profile.get("formatted_address"),
                profile.get("current_address"),
            ]
        )

    # Return the first non-empty address found
    for value in candidates:
        if value and str(value).strip():
            return str(value).strip()

    return None


def has_profile(authority_id: str) -> bool:
    """
    Check whether the given authority exists and is active.
    """
    if not authority_id:
        return False

    return mongo.db.authorities.count_documents(
        {"authority_id": str(authority_id), "is_active": True}
    ) > 0


def flood_risk(distance_to_river_m: Optional[float], rainfall_mm: float) -> str:
    """
    Estimate flood risk using nearest river distance and rainfall.
    """
    if distance_to_river_m is None:
        return "unknown"
    if distance_to_river_m < 100 and rainfall_mm > 50:
        return "high"
    if distance_to_river_m < 300 and rainfall_mm > 30:
        return "medium"
    return "low"


def generate_report_id():
    """
    Generate the next victim report ID using MongoDB counter.
    Example: R001, R002, R003
    """
    counter = mongo.db.counters.find_one_and_update(
        {"_id": "victim_report_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    seq = counter["seq"]
    return f"R{seq:03d}"


def bridge_status(name: str, blocked_bridges: List[str]) -> str:
    """
    Mark a bridge as blocked if its name appears in blocked_bridges list.
    """
    return "blocked" if name in blocked_bridges else "unknown"


def predict_priority_and_authorities(payload: dict, geo_feats: dict | None = None) -> dict:
    """
    Run the full ML pipeline:
    1. NLP prediction from report text
    2. Priority prediction
    3. Authority prediction
    4. Return combined result
    """
    text = payload.get("additional_text", "") or ""

    # Get NLP-based labels, probabilities, and thresholds
    nlp_result = predict_nlp_features(text)

    # Create a new payload that includes predicted NLP labels
    payload2 = dict(payload)
    payload2.update(nlp_result.get("labels", {}))

    # Add geo features if available
    if geo_feats:
        payload2.update(geo_feats)

    # Predict report priority
    priority_result = predict_priority_from_payload(payload2)
    priority_level = int(priority_result["priority_level"])
    priority_label = priority_result["priority_label"]
    priority_predictions = priority_result.get("priority_predictions", {})

    # Predict which authorities should respond
    authorities_binary = predict_authorities_from_payload(payload2)
    authorities = authority_binary_to_list(authorities_binary)

    return {
        "priority_level": priority_level,
        "priority_label": priority_label,
        "priority_predictions": priority_predictions,
        "authorities": authorities,
        "authorities_binary": authorities_binary,
        "nlp_labels": nlp_result.get("labels", {}),
        "nlp_probabilities": nlp_result.get("probabilities", {}),
        "nlp_thresholds": nlp_result.get("thresholds", {}),
        "geo_features": geo_feats or {},
    }


def submit_victim(
    payload: Dict[str, Any],
    selected_authority: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Main function to submit a victim report.

    Steps:
    1. Validate victim profile
    2. Add profile and report details
    3. Resolve location
    4. Extract geo features
    5. Predict NLP, priority, and authorities
    6. Find nearest authorities
    7. Save report
    8. Create dispatch if needed
    9. Return saved report
    """
    payload = dict(payload)

    # Victim profile id is required
    victim_profile_id = (payload.get("victim_profile_id") or "").strip()
    if not victim_profile_id:
        raise ValueError("victim_profile_id is required")

    # Load active victim profile from database
    profile = mongo.db.victim_profiles.find_one(
        {
            "victim_id": victim_profile_id,
            "is_active": True,
        }
    )
    if not profile:
        raise ValueError("Victim profile not found")

    # Add report metadata and victim profile details to payload
    payload["report_id"] = generate_report_id()
    payload["victim_profile_id"] = victim_profile_id
    payload["victim_name"] = profile.get("full_name")
    payload["victim_email"] = profile.get("email")
    payload["victim_phone"] = profile.get("phone")
    payload["victim_district"] = profile.get("district")
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    # Try to get latitude and longitude directly from payload
    lat, lon = _get_lat_lon(payload)

    # If coordinates are missing, try geocoding an address
    if lat is None or lon is None:
        address = _get_address(payload, profile)
        if address:
            payload["original_address"] = address
            try:
                geo = geocode_address_google(address)
                if geo:
                    lat = (
                        float(geo.get("latitude"))
                        if geo.get("latitude") is not None
                        else None
                    )
                    lon = (
                        float(geo.get("longitude"))
                        if geo.get("longitude") is not None
                        else None
                    )

                    payload["resolved_address"] = geo.get("formatted_address") or address
                    payload["location_source"] = geo.get("source", "google_geocoding")
                    payload["geocoded_place_id"] = geo.get("place_id")
                else:
                    payload["location_source"] = "address_geocoding_failed"
            except Exception:
                payload["location_source"] = "address_geocoding_failed"

    # If still missing, try using saved profile location
    if (lat is None or lon is None) and profile.get("location"):
        try:
            coords = profile["location"].get("coordinates", [])
            if len(coords) == 2:
                lon = float(coords[0])
                lat = float(coords[1])
                payload["location_source"] = "profile_location"
        except Exception:
            pass

    # Store final coordinates in payload
    payload["latitude"] = lat
    payload["longitude"] = lon

    # Extract geo features only if valid location exists
    geo_feats = None
    if lat is not None and lon is not None:
        geo_feats = get_river_bridge_features(lat, lon, radius_m=2000) or {}
        geo_feats["nearby_bridge_names"] = list(
            geo_feats.get("nearby_bridge_names", [])
        )

    # Run full prediction pipeline
    result = predict_priority_and_authorities(payload, geo_feats=geo_feats)

    # Debug logs
    print("RESULT FROM PIPELINE:")
    print(result)
    print("PRIORITY PREDICTIONS:")
    print(result.get("priority_predictions"))

    nearest_authorities: List[dict] = []
    authority_escalation: Dict[str, Any] = {}

    # Find nearest authorities only if victim location exists
    if lat is not None and lon is not None:
        for predicted_type in result["authorities"]:
            nearest_list = find_nearest(
                lat=lat,
                lon=lon,
                authority_type=predicted_type,
                max_distance_m=15000,
                limit=5,
            ) or []

            for a in nearest_list:
                if not isinstance(a, dict):
                    continue

                # Keep only authorities matching the predicted type
                if a.get("authority_type") != predicted_type:
                    continue

                try:
                    a_lat = (
                        float(a.get("latitude"))
                        if a.get("latitude") is not None
                        else None
                    )
                    a_lon = (
                        float(a.get("longitude"))
                        if a.get("longitude") is not None
                        else None
                    )
                except Exception:
                    a_lat, a_lon = None, None

                # Skip invalid authority coordinates
                if a_lat is None or a_lon is None:
                    continue

                a["latitude"] = a_lat
                a["longitude"] = a_lon
                nearest_authorities.append(a)

    # Remove duplicate nearest authorities
    seen = set()
    unique = []
    for a in nearest_authorities:
        try:
            key = (
                a.get("authority_type"),
                a.get("authority_id"),
                round(float(a.get("latitude", 0.0)), 6),
                round(float(a.get("longitude", 0.0)), 6),
                a.get("name"),
                a.get("source"),
            )
        except Exception:
            continue

        if key in seen:
            continue

        seen.add(key)
        unique.append(a)

    # Sort by nearest distance first
    nearest_authorities = sorted(unique, key=lambda x: x.get("distance_m", 999999))

    # Build escalation queue if location exists
    if lat is not None and lon is not None:
        authority_escalation = build_authority_escalation_queue(
            lat=lat,
            lon=lon,
            predicted_types=result["authorities"],
        )

    rainfall_mm = payload.get("rainfall_mm", 0)

    # Add flood risk and bridge status into geo features
    if geo_feats:
        geo_feats["flood_risk"] = flood_risk(
            geo_feats.get("dist_nearest_river_m"),
            rainfall_mm,
        )

        blocked_bridges = payload.get("blocked_bridges", [])
        geo_feats["bridge_status"] = {
            bridge_name: bridge_status(bridge_name, blocked_bridges)
            for bridge_name in geo_feats.get("nearby_bridge_names", [])
        }

    # Save initial victim report
    new_id = victim_repository.create(payload)

    dispatches: List[dict] = []
    saved_dispatches: List[dict] = []
    dispatch_status = "not_dispatched"

    # Case 1: User manually selected an authority
    if lat is not None and lon is not None and selected_authority:
        authority_id = selected_authority.get("authority_id")
        authority_type = selected_authority.get("authority_type")
        authority_name = (
            selected_authority.get("authority_name")
            or selected_authority.get("name")
        )

        auth_lat = selected_authority.get("latitude")
        auth_lon = selected_authority.get("longitude")

        # Validate selected authority details
        if (
            authority_id
            and authority_type
            and authority_name
            and auth_lat is not None
            and auth_lon is not None
        ):
            if not has_profile(authority_id):
                dispatch_status = "no_profile_for_selected_authority"
            else:
                # Save dispatch record
                dispatch_doc = save_dispatch(
                    victim_id=new_id,
                    priority=int(result["priority_level"]),
                    authority={
                        "authority_id": authority_id,
                        "authority_type": authority_type,
                        "name": authority_name,
                        "latitude": float(auth_lat),
                        "longitude": float(auth_lon),
                        "source": "selected",
                    },
                )

                saved_dispatches.append(dispatch_doc)
                dispatches.append(dispatch_doc)

                # Send real-time socket notification to authority room
                socketio.emit(
                    "new_dispatch",
                    {
                        "_id": str(dispatch_doc.get("_id")),
                        "victim_id": str(new_id),
                        "victim_profile_id": victim_profile_id,
                        "priority_level": int(result["priority_level"]),
                        "priority_label": result.get("priority_label"),
                        "victim_latitude": lat,
                        "victim_longitude": lon,
                        "authority_id": authority_id,
                        "authority_type": authority_type,
                        "authority_name": authority_name,
                        "authority_latitude": float(auth_lat),
                        "authority_longitude": float(auth_lon),
                        "nlp_labels": result.get("nlp_labels"),
                        "geo_features": geo_feats,
                        "status": dispatch_doc.get("status", "pending"),
                        "source": dispatch_doc.get("source", "selected"),
                    },
                    room=str(authority_id),
                )

                dispatch_status = "dispatched_to_selected"
        else:
            dispatch_status = "invalid_selected_authority"

    # Case 2: No valid location available
    elif lat is None or lon is None:
        dispatch_status = "missing_location"

    # Case 3: Ready for automatic dispatch
    else:
        dispatch_status = "ready_to_dispatch"

    # Update saved report with model outputs and dispatch details
    victim_repository.update(
        new_id,
        {
            "priority_level": int(result["priority_level"]),
            "priority_label": result.get("priority_label"),
            "priority_predictions": result.get("priority_predictions", {}),
            "priority_source": "ml+nlp",
            "nlp_labels": result.get("nlp_labels"),
            "nlp_probabilities": result.get("nlp_probabilities"),
            "nlp_thresholds": result.get("nlp_thresholds"),
            "geo_features": geo_feats,
            "authority_predictions": result["authorities_binary"],
            "authority_list": result["authorities"],
            "nearest_authorities": nearest_authorities,
            "authority_escalation": authority_escalation,
            "dispatch_status": dispatch_status,
            "dispatches": dispatches,
            "saved_dispatches": saved_dispatches,
            "latitude": lat,
            "longitude": lon,
            "original_address": payload.get("original_address"),
            "resolved_address": payload.get("resolved_address"),
            "location_source": payload.get("location_source"),
            "geocoded_place_id": payload.get("geocoded_place_id"),
            "updated_at": datetime.utcnow(),
        },
    )

    # If no manual authority was selected, do first round automatic dispatch
    if (
        lat is not None
        and lon is not None
        and not selected_authority
        and authority_escalation
    ):
        report_doc = victim_repository.get_by_id(new_id)
        if report_doc:
            first_round = dispatch_first_round(report_doc)
            if first_round:
                victim_repository.update(
                    new_id,
                    {
                        "dispatch_status": "dispatched",
                        "updated_at": datetime.utcnow(),
                    },
                )

    # Return final saved victim report
    return _serialize(victim_repository.get_by_id(new_id))