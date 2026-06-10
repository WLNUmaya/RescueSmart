from flask import Blueprint, request, jsonify
from app.services.submit_service import submit_victim
from app.services.victim_service import (
    get_victim,
    update_victim,
    delete_victim,
)

victim_bp = Blueprint("victims", __name__, url_prefix="/api/v1/victims")


# Submit a new victim report for processing and dispatching
@victim_bp.post("/submit")
def submit_victim_route():
    try:
        payload = request.get_json(force=True) or {}

        if not isinstance(payload, dict):
            return jsonify({"error": "Invalid payload"}), 400

        # Ensure linked victim profile is provided
        if not payload.get("victim_profile_id"):
            return jsonify({"error": "victim_profile_id is required"}), 400

        # Process victim submission through the service layer
        doc = submit_victim(payload)

        # Return prediction and dispatch results
        return jsonify({
            "id": doc.get("_id"),
            "report_id": doc.get("report_id"),
            "victim_profile_id": doc.get("victim_profile_id"),

            "priority_level": doc.get("priority_level"),
            "priority_label": doc.get("priority_label"),
            "priority_predictions": doc.get("priority_predictions", {}),

            "authorities": doc.get("authority_list", []),
            "authority_predictions": doc.get("authority_predictions", {}),

            "disaster_type": doc.get("disaster_type"),
            "nlp_labels": doc.get("nlp_labels", {}),
            "nlp_probabilities": doc.get("nlp_probabilities", {}),
            "nlp_thresholds": doc.get("nlp_thresholds", {}),
            "geo_features": doc.get("geo_features", {}),
            "nearest_authorities": doc.get("nearest_authorities", []),
            "dispatch_status": doc.get("dispatch_status"),
        }), 201
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception as e:
        return jsonify({
            "error": "Failed to submit victim",
            "details": str(e)
        }), 500


# Retrieve a victim report by ID
@victim_bp.get("/<victim_id>")
def get_victim_route(victim_id):
    try:
        # Fetch victim report from service layer
        doc = get_victim(victim_id)
        if not doc:
            return jsonify({"error": "Victim not found"}), 404
        return jsonify(doc), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch victim",
            "details": str(e)
        }), 500


# Update an existing victim report
@victim_bp.put("/<victim_id>")
def update_victim_route(victim_id):
    try:
        payload = request.get_json(force=True) or {}
        doc = update_victim(victim_id, payload)
        if not doc:
            return jsonify({"error": "Victim not found"}), 404
        return jsonify(doc), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to update victim",
            "details": str(e)
        }), 500


# Delete a victim report by ID
@victim_bp.delete("/<victim_id>")
def delete_victim_route(victim_id):
    try:
      
        ok = delete_victim(victim_id)
        if not ok:
            return jsonify({"error": "Victim not found"}), 404
        return jsonify({"deleted": True}), 200
    except Exception as e:
        return jsonify({
            "error": "Failed to delete victim",
            "details": str(e)
        }), 500