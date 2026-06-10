from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from app.extensions import mongo

authority_bp = Blueprint("authorities", __name__, url_prefix="/api/v1/authorities")


# Normalize authority type values into a consistent format
def normalize_type(authority_type: str) -> str:
    authority_type = (authority_type or "").strip().lower()

    mapping = {
        "police": "Police",
        "army": "Army",
        "navy": "Navy",
        "fire": "Fire",
        "ambulance": "Ambulance",
        "hospital": "Hospital",
    }
    return mapping.get(authority_type, authority_type.title())


# Create a new authority record
@authority_bp.post("/")
def create_authority():
    # Read JSON request data
    data = request.get_json(force=True) or {}

    # Extract coordinates
    lat = data.get("latitude")
    lon = data.get("longitude")

    # Validate required coordinates
    if lat is None or lon is None:
        return jsonify({"error": "latitude and longitude are required"}), 400

    # Convert coordinates to numeric values
    try:
        lat = float(lat)
        lon = float(lon)
    except Exception:
        return jsonify({"error": "latitude/longitude must be numeric"}), 400

    # Read authority ID
    authority_id = (data.get("authority_id") or "").strip()
    if not authority_id:
        return jsonify({"error": "authority_id is required"}), 400

    # Prevent duplicate authority IDs
    if mongo.db.authorities.find_one({"authority_id": authority_id}):
        return jsonify({"error": "authority_id already exists"}), 409

    # Build authority document
    doc = {
        "authority_id": authority_id,
        "type": normalize_type(data.get("authority_type") or data.get("type")),
        "unit_name": data.get("name") or data.get("unit_name"),
        "district": data.get("district"),
        "address": data.get("address"),
        "latitude": lat,
        "longitude": lon,
        "emergency_phone": data.get("phone") or data.get("emergency_phone"),
        "email_address": data.get("email") or data.get("email_address"),
        "password": data.get("password"),
        "is_active": bool(data.get("is_active", True)),
        "source": data.get("source", "manual_create"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "osm": data.get("osm", {}),
    }

    # Insert the new authority into MongoDB
    res = mongo.db.authorities.insert_one(doc)

    # Return created authority details
    return jsonify({"_id": str(res.inserted_id), "authority_id": authority_id}), 201


# Return authority records with optional type filtering
@authority_bp.get("/")
def list_authorities():
    # Build filter query
    q = {}

    # Apply authority type filter if provided
    t = request.args.get("authority_type") or request.args.get("type")
    if t:
        q["type"] = normalize_type(t)

    # Fetch authority records
    docs = list(mongo.db.authorities.find(q).limit(200))
    for d in docs:
        d["_id"] = str(d["_id"])

   
    return jsonify(docs), 200


# Update an existing authority record
@authority_bp.put("/<id>")
def update_authority(id):
    data = request.get_json(force=True) or {}
    updates = {}

    if "authority_id" in data:
        updates["authority_id"] = data["authority_id"]

    if "authority_type" in data or "type" in data:
        updates["type"] = normalize_type(data.get("authority_type") or data.get("type"))

    if "name" in data or "unit_name" in data:
        updates["unit_name"] = data.get("name") or data.get("unit_name")

    if "phone" in data or "emergency_phone" in data:
        updates["emergency_phone"] = data.get("phone") or data.get("emergency_phone")

    if "email" in data or "email_address" in data:
        updates["email_address"] = data.get("email") or data.get("email_address")

    if "district" in data:
        updates["district"] = data["district"]

    if "address" in data:
        updates["address"] = data["address"]

    if "password" in data:
        updates["password"] = data["password"]

    if "is_active" in data:
        updates["is_active"] = bool(data["is_active"])

    if "latitude" in data:
        try:
            updates["latitude"] = float(data["latitude"])
        except Exception:
            return jsonify({"error": "latitude must be numeric"}), 400

    if "longitude" in data:
        try:
            updates["longitude"] = float(data["longitude"])
        except Exception:
            return jsonify({"error": "longitude must be numeric"}), 400

    updates["updated_at"] = datetime.utcnow()

   
    mongo.db.authorities.update_one({"_id": ObjectId(id)}, {"$set": updates})
    return jsonify({"updated": True}), 200