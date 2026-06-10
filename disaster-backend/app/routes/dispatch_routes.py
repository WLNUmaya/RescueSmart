from flask import Blueprint, jsonify, request
from bson import ObjectId
from app.extensions import mongo
from app.services.escalation_service import mark_dispatch_response


dispatch_bp = Blueprint("dispatches", __name__)


# Convert MongoDB documents into JSON-safe format
def serialize_doc(doc):
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# Return recent dispatches assigned to a specific authority
@dispatch_bp.route("/authority/<authority_id>", methods=["GET", "OPTIONS"])
def list_dispatches_for_authority(authority_id):
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    # Fetch recent dispatches for the selected authority
    dispatches = list(
        mongo.db.dispatches
        .find({"authority_id": str(authority_id)})
        .sort("created_at", -1)
        .limit(50)
    )

    results = []

    # Attach related victim details to each dispatch
    for d in dispatches:
        victim = None
        victim_id = d.get("victim_id")

        if victim_id:
            try:
                victim = mongo.db.victims.find_one({"_id": ObjectId(victim_id)})
            except Exception:
                victim = None

        victim = serialize_doc(victim)

        # Build structured response for each dispatch
        out = {
            "_id": str(d["_id"]),
            "dispatch": {
                "_id": str(d["_id"]),
                "victim_id": str(d.get("victim_id")) if d.get("victim_id") else None,
                "authority_id": d.get("authority_id"),
                "authority_type": d.get("authority_type"),
                "authority_name": d.get("authority_name"),
                "email_address": d.get("email_address"),
                "authority_address": d.get("authority_address"),
                "authority_phone": d.get("authority_phone"),
                "authority_district": d.get("authority_district"),
                "latitude": d.get("latitude"),
                "longitude": d.get("longitude"),
                "status": d.get("status"),
               "priority_level": d.get("priority_level"),
            "priority_label": d.get("priority_label"),
            "priority_predictions": d.get("priority_predictions", {}),

            "authorities": d.get("authority_list", []),
            "authority_predictions": d.get("authority_predictions", {}),
                
                "source": d.get("source"),
                "created_at": d.get("created_at"),
                "updated_at": d.get("updated_at"),
                "distance_km": d.get("distance_km"),
            },
            "victim": victim,
        }

        results.append(out)

    return jsonify(results), 200


# Accept or reject a dispatch response from an authority
@dispatch_bp.route("/<dispatch_id>/respond", methods=["POST", "OPTIONS"])
def respond_to_dispatch(dispatch_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    try:
        payload = request.get_json(force=True) or {}
        response_status = payload.get("response_status")

        if not response_status:
            return jsonify({"error": "response_status is required"}), 400

        # Update dispatch response using escalation logic
        result = mark_dispatch_response(
            dispatch_id=ObjectId(dispatch_id),
            response_status=response_status,
        )

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({
            "error": "Failed to respond to dispatch",
            "details": str(e),
        }), 500