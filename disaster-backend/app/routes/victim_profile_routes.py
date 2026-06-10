from flask import Blueprint, request, jsonify
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import mongo
from pymongo import ReturnDocument

victim_auth_bp = Blueprint("victim_auth", __name__, url_prefix="/api/v1/victim")

def generate_victim_id():
    counter = mongo.db.counters.find_one_and_update(
        {"_id": "victim_id"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    seq = counter["seq"]
    return f"V{seq:03d}"


@victim_auth_bp.post("/register")
def register_victim():
    data = request.get_json(force=True) or {}

    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()
    phone = (data.get("phone") or "").strip()
    district = (data.get("district") or "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    # Validate required fields
    if not full_name or not email or not password:
        return jsonify({"error": "full_name, email, password required"}), 400

    # Build location object if coordinates provided
    location = None
    if latitude is not None and longitude is not None:
        try:
            lat = float(latitude)
            lon = float(longitude)
            location = {"type": "Point", "coordinates": [lon, lat]}
        except Exception:
            return jsonify({"error": "latitude/longitude must be numbers"}), 400

    # Prevent duplicate email registration
    if mongo.db.victim_profiles.find_one({"email": email}):
        return jsonify({"error": "email already registered"}), 409

    victim_id = generate_victim_id()

    # Build victim profile document
    victim_doc = {
        "victim_id": victim_id,
        "full_name": full_name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "phone": phone,
        "district": district,
        "location": location,
        "role": "victim",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    # Insert victim profile into database
    res = mongo.db.victim_profiles.insert_one(victim_doc)
    return jsonify({
        "message": "Victim registered successfully",
        "victim_id": victim_id,
        "profile_doc_id": str(res.inserted_id),
    }), 201


# Authenticate victim login
@victim_auth_bp.post("/login")
def login_victim():
    data = request.get_json(force=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    # Validate input
    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    # Find active user
    user = mongo.db.victim_profiles.find_one({"email": email, "is_active": True})
    if not user:
        return jsonify({"error": "invalid credentials"}), 401

    # Verify password
    if not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "invalid credentials"}), 401

    # Return login success response
    return jsonify({
        "victim_id": user["victim_id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user.get("phone"),
        "district": user.get("district"),
        "role": user.get("role", "victim"),
    }), 200


# Retrieve victim profile details
@victim_auth_bp.get("/profile/<victim_id>")
def get_victim_profile(victim_id):
    profile = mongo.db.victim_profiles.find_one({
        "victim_id": victim_id,
        "is_active": True
    })

    # Handle profile not found
    if not profile:
        return jsonify({"error": "Victim profile not found"}), 404

    # Format response and remove sensitive data
    profile["_id"] = str(profile["_id"])
    profile.pop("password_hash", None)

    return jsonify(profile), 200


# Update victim profile details
@victim_auth_bp.put("/profile/<victim_id>")
def update_victim_profile(victim_id):
    data = request.get_json(force=True) or {}

    profile = mongo.db.victim_profiles.find_one({
        "victim_id": victim_id,
        "is_active": True
    })

    # Handle profile not found
    if not profile:
        return jsonify({"error": "Victim profile not found"}), 404

    updates = {}
    allowed_fields = ["full_name", "phone", "district"]

    # Update allowed fields only
    for field in allowed_fields:
        if field in data:
            updates[field] = data[field]

    # Update location if provided
    if "latitude" in data and "longitude" in data:
        try:
            lat = float(data["latitude"])
            lon = float(data["longitude"])
            updates["location"] = {"type": "Point", "coordinates": [lon, lat]}
        except Exception:
            return jsonify({"error": "latitude/longitude must be numbers"}), 400

    # Validate updates exist
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    updates["updated_at"] = datetime.utcnow()

    # Apply updates in database
    mongo.db.victim_profiles.update_one(
        {"victim_id": victim_id},
        {"$set": updates}
    )

    # Fetch updated profile
    updated = mongo.db.victim_profiles.find_one({"victim_id": victim_id})
    updated["_id"] = str(updated["_id"])
    updated.pop("password_hash", None)

    return jsonify(updated), 200


# Retrieve all reports submitted by a victim
@victim_auth_bp.get("/<victim_id>/reports")
def get_victim_reports(victim_id):
    # Fetch victim reports sorted by newest first
    reports = list(
        mongo.db.victims.find({"victim_profile_id": victim_id}).sort("created_at", -1)
    )

    for r in reports:
        r["_id"] = str(r["_id"])

    return jsonify({
        "victim_id": victim_id,
        "reports": reports
    }), 200