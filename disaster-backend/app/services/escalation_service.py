from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from app.extensions import mongo, socketio
from app.repositories.dispatch_repository import save_dispatch
from app.services.nearest_authority_service import find_nearest
from bson import ObjectId

# Define escalation timing and nearest-authority search limits
ESCALATION_MINUTES = 1
MAX_NEAREST_PER_TYPE = 5


# Check whether an authority has an active profile in the system
def has_profile(authority_id: str) -> bool:
    if not authority_id:
        return False

    return mongo.db.authorities.count_documents(
        {"authority_id": str(authority_id), "is_active": True}
    ) > 0


# Build escalation queues for each predicted authority type
def build_authority_escalation_queue(lat: float, lon: float, predicted_types: List[str]) -> Dict[str, Dict[str, Any]]:
    queues = {}

    # Process each predicted authority type separately
    for authority_type in predicted_types:
        nearest = find_nearest(
            lat=lat,
            lon=lon,
            authority_type=authority_type,
            max_distance_m=15000,
            limit=MAX_NEAREST_PER_TYPE,
        ) or []

        valid_queue = []
        seen = set()

        # Keep only valid and unique authorities with active profiles
        for item in nearest:
            authority_id = item.get("authority_id")
            if not authority_id:
                continue
            if not has_profile(authority_id):
                continue

            key = (authority_type, authority_id)
            if key in seen:
                continue
            seen.add(key)

            valid_queue.append({
                "authority_id": authority_id,
                "authority_type": authority_type,
                "name": item.get("name"),
                "latitude": item.get("latitude"),
                "longitude": item.get("longitude"),
                "distance_m": item.get("distance_m"),
                "distance_km": item.get("distance_km"),
                "source": item.get("source", "mongodb"),
                "email_address": item.get("email_address") or item.get("email"),
                "address": item.get("address"),
                "district": item.get("district"),
                "emergency_phone": item.get("emergency_phone") or item.get("phone"),
            })

        # Sort nearest authorities by distance
        valid_queue.sort(key=lambda x: x.get("distance_m", 999999))

        # Store escalation state for this authority type
        queues[authority_type] = {
            "queue": valid_queue,
            "current_index": -1,
            "status": "ready" if valid_queue else "exhausted",
            "last_dispatched_at": None,
            "accepted_by": None,
        }

    return queues


# Emit a real-time dispatch notification to the assigned authority
def _emit_dispatch(dispatch_doc: dict, report_doc: dict, authority: dict):
    socketio.emit(
        "new_dispatch",
        {
            "_id": str(dispatch_doc.get("_id")),
            "victim_id": str(report_doc.get("_id")),
            "victim_profile_id": report_doc.get("victim_profile_id"),
            "priority_level": report_doc.get("priority_level"),
            "priority_label": report_doc.get("priority_label"),
            "email_address": report_doc.get("email_address"),
            "victim_latitude": report_doc.get("latitude"),
            "victim_longitude": report_doc.get("longitude"),
            "authority_id": authority.get("authority_id"),
            "authority_type": authority.get("authority_type"),
            "authority_name": authority.get("name"),
            "authority_latitude": authority.get("latitude"),
            "authority_longitude": authority.get("longitude"),
            "distance_km": authority.get("distance_km"),
            "nlp_labels": report_doc.get("nlp_labels"),
            "geo_features": report_doc.get("geo_features"),
            "status": dispatch_doc.get("status", "pending"),
            "source": authority.get("source", "mongodb"),
        },
        room=str(authority.get("authority_id")),
    )


# Emit a rescue-accepted update to the victim
def _emit_victim_rescue_update(report_doc: dict, authority_doc: dict, dispatch_doc: dict):
    victim_profile_id = str(report_doc.get("victim_profile_id") or "").strip()
    if not victim_profile_id:
        return

    socketio.emit(
        "rescue_accepted",
        {
            "message": f"{authority_doc.get('name') or authority_doc.get('authority_name') or 'Rescue authority'} is coming to rescue you.",
            "victim_profile_id": victim_profile_id,
            "victim_report_id": str(report_doc.get("_id")),
            "dispatch_id": str(dispatch_doc.get("_id")),
            "authority_id": authority_doc.get("authority_id"),
            "authority_type": authority_doc.get("authority_type"),
            "authority_name": authority_doc.get("name") or authority_doc.get("authority_name"),
            "authority_phone": authority_doc.get("phone") or authority_doc.get("emergency_phone"),
            "authority_latitude": authority_doc.get("latitude"),
            "authority_longitude": authority_doc.get("longitude"),
            "priority_level": report_doc.get("priority_level"),
            "priority_label": report_doc.get("priority_label"),
            "status": "accepted",
        },
        room=victim_profile_id,
    )


# Dispatch the next available authority in the escalation queue for a specific type
def dispatch_next_authority_for_type(report_doc: dict, authority_type: str) -> Optional[dict]:
    escalation = report_doc.get("authority_escalation", {}) or {}
    info = escalation.get(authority_type)

    # Stop if no escalation info or already accepted
    if not info:
        return None

    if info.get("status") == "accepted":
        return None

    queue = info.get("queue", [])
    next_index = int(info.get("current_index", -1)) + 1

    # Mark queue as exhausted when all authorities have been tried
    if next_index >= len(queue):
        mongo.db.victims.update_one(
            {"_id": report_doc["_id"]},
            {
                "$set": {
                    f"authority_escalation.{authority_type}.status": "exhausted",
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        return None

    authority = queue[next_index]

    # Save the dispatch record
    dispatch_doc = save_dispatch(
        victim_id=report_doc["_id"],
        priority=int(report_doc.get("priority_level", 0)),
        authority=authority,
    )

    # Update victim report with dispatch progress
    mongo.db.victims.update_one(
        {"_id": report_doc["_id"]},
        {
            "$set": {
                f"authority_escalation.{authority_type}.current_index": next_index,
                f"authority_escalation.{authority_type}.status": "pending",
                f"authority_escalation.{authority_type}.last_dispatched_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            "$push": {
                "dispatches": dispatch_doc,
                "saved_dispatches": dispatch_doc,
            },
        },
    )

    # Notify the authority in real time
    _emit_dispatch(dispatch_doc, report_doc, authority)
    return dispatch_doc


# Dispatch the first authority for each predicted type
def dispatch_first_round(report_doc: dict) -> List[dict]:
    created = []

    escalation = report_doc.get("authority_escalation", {}) or {}
    for authority_type, info in escalation.items():
        if info.get("status") != "ready":
            continue

        d = dispatch_next_authority_for_type(report_doc, authority_type)
        if d:
            created.append(d)

    # Update overall dispatch status after first round
    mongo.db.victims.update_one(
        {"_id": report_doc["_id"]},
        {
            "$set": {
                "dispatch_status": "dispatched" if created else "no_nearby_found_or_no_profiles",
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return created


# Record an authority response and trigger escalation if needed
def mark_dispatch_response(dispatch_id, response_status: str):
    dispatch_doc = mongo.db.dispatches.find_one({"_id": dispatch_id})
    if not dispatch_doc:
        raise ValueError("Dispatch not found")

    response_status = (response_status or "").strip().lower()
    if response_status not in ("accepted", "rejected"):
        raise ValueError("response must be 'accepted' or 'rejected'")

    now = datetime.utcnow()

    mongo.db.dispatches.update_one(
        {"_id": dispatch_id},
        {
            "$set": {
                "status": response_status,
                "updated_at": now,
                "responded_at": now,
            }
        },
    )

    victim_id = dispatch_doc.get("victim_id")
    authority_type = dispatch_doc.get("authority_type")
    authority_id = dispatch_doc.get("authority_id")

    # Convert victim ID into ObjectId
    try:
        victim_oid = ObjectId(victim_id)
    except Exception:
        raise ValueError("Invalid victim_id stored in dispatch")

    report_doc = mongo.db.victims.find_one({"_id": victim_oid})
    if not report_doc:
        raise ValueError("Related victim report not found")

    authority_doc = mongo.db.authorities.find_one({"authority_id": authority_id}) or {}

    # Handle accepted dispatch response
    if response_status == "accepted":
        mongo.db.victims.update_one(
            {"_id": victim_oid},
            {
                "$set": {
                    f"authority_escalation.{authority_type}.status": "accepted",
                    f"authority_escalation.{authority_type}.accepted_by": authority_id,
                    "dispatch_status": "accepted",
                    "accepted_authority_id": authority_id,
                    "accepted_authority_type": authority_type,
                    "accepted_at": now,
                    "updated_at": now,
                }
            },
        )

        refreshed_report = mongo.db.victims.find_one({"_id": victim_oid}) or report_doc

        # Notify victim that rescue has been accepted
        _emit_victim_rescue_update(
            report_doc=refreshed_report,
            authority_doc={
                "authority_id": authority_id,
                "authority_type": authority_type,
                "authority_name": authority_doc.get("unit_name"),
                "name": authority_doc.get("unit_name"),
                "phone": authority_doc.get("emergency_phone"),
                "latitude": authority_doc.get("latitude"),
                "longitude": authority_doc.get("longitude"),
            },
            dispatch_doc={
                "_id": dispatch_id,
            },
        )

        return {
            "status": "accepted",
            "escalated": False,
            "victim_notified": True,
            "accepted_authority_id": authority_id,
        }

    # Handle rejected dispatch response and escalate to the next candidate
    mongo.db.victims.update_one(
        {"_id": victim_oid},
        {
            "$set": {
                f"authority_escalation.{authority_type}.status": "rejected",
                "updated_at": now,
            }
        },
    )

    refreshed = mongo.db.victims.find_one({"_id": victim_oid})
    next_dispatch = dispatch_next_authority_for_type(refreshed, authority_type)

    return {
        "status": "rejected",
        "escalated": bool(next_dispatch),
        "next_dispatch_id": str(next_dispatch.get("_id")) if next_dispatch else None,
        "victim_notified": False,
    }


# Process timeout-based escalation for pending dispatches
def process_dispatch_escalations():
    now = datetime.utcnow()

    # Find active reports still waiting for dispatch resolution
    reports = list(
        mongo.db.victims.find({
            "dispatch_status": {"$in": ["dispatched", "pending", "partially_dispatched", "ready_to_dispatch"]}
        })
    )

    for report in reports:
        escalation = report.get("authority_escalation", {}) or {}
        changed = False

        # Check each authority type for timeout
        for authority_type, info in escalation.items():
            if info.get("status") != "pending":
                continue

            last_dispatched_at = info.get("last_dispatched_at")
            if not last_dispatched_at:
                continue

            # Wait until escalation timeout is reached
            if now - last_dispatched_at < timedelta(minutes=ESCALATION_MINUTES):
                continue

            queue = info.get("queue", [])
            current_index = int(info.get("current_index", -1))
            if current_index < 0 or current_index >= len(queue):
                continue

            current_authority = queue[current_index]
            current_authority_id = current_authority.get("authority_id")

            # Mark existing pending dispatch as timed out
            mongo.db.dispatches.update_many(
                {
                    "victim_id": report["_id"],
                    "authority_type": authority_type,
                    "authority_id": current_authority_id,
                    "status": "pending",
                },
                {
                    "$set": {
                        "status": "timed_out",
                        "updated_at": now,
                    }
                },
            )

            # Update escalation state to timed out
            mongo.db.victims.update_one(
                {"_id": report["_id"]},
                {
                    "$set": {
                        f"authority_escalation.{authority_type}.status": "timed_out",
                        "updated_at": now,
                    }
                },
            )

            # Dispatch the next nearest authority
            refreshed = mongo.db.victims.find_one({"_id": report["_id"]})
            dispatch_next_authority_for_type(refreshed, authority_type)
            changed = True

        # Recalculate overall dispatch status after escalation changes
        if changed:
            refreshed = mongo.db.victims.find_one({"_id": report["_id"]})
            statuses = [v.get("status") for v in (refreshed.get("authority_escalation", {}) or {}).values()]

            if statuses and all(s in ("accepted", "exhausted") for s in statuses):
                overall = "completed"
            elif any(s == "pending" for s in statuses):
                overall = "dispatched"
            else:
                overall = refreshed.get("dispatch_status", "dispatched")

            mongo.db.victims.update_one(
                {"_id": report["_id"]},
                {"$set": {"dispatch_status": overall, "updated_at": now}},
            )