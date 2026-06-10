from flask import Blueprint, request, jsonify
from datetime import datetime
from app.extensions import mongo

profiles_bp = Blueprint(
    "authority_profiles",
    __name__,
    url_prefix="/api/v1/authority-profiles"
)

def generate_authority_id():

    # Fetch existing authority IDs
    docs = list(
        mongo.db.authorities.find(
            {"authority_id": {"$regex": r"^A\d+$"}},
            {"authority_id": 1}
        )
    )

    # Find highest existing number
    last_num = 0
    for doc in docs:
        authority_id = str(doc.get("authority_id", ""))
        try:
            num = int(authority_id.replace("A", ""))
            if num > last_num:
                last_num = num
        except Exception:
            continue

    # Get current counter value
    counter = mongo.db.counters.find_one({"_id": "authority_id"})
    counter_num = int(counter.get("seq", 0)) if counter else 0

    # Compute next ID
    next_num = max(last_num, counter_num) + 1

    # Update counter in database
    mongo.db.counters.update_one(
        {"_id": "authority_id"},
        {"$set": {"seq": next_num}},
        upsert=True
    )

    # Return formatted ID
    return f"A{next_num:03d}"


# Normalize authority type values
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


# Register a new authority profile
@profiles_bp.post("/register")
def register_profile():

    # Extract and clean input data
    data = request.get_json(force=True) or {}

    password = (data.get("password") or "").strip()
    authority_type = (data.get("authority_type") or data.get("type") or "").strip()
    name = (data.get("name") or data.get("unit_name") or "").strip()
    district = (data.get("district") or "").strip()
    address = (data.get("address") or "").strip()
    phone = (data.get("phone") or data.get("emergency_phone") or "").strip()
    email = (data.get("email") or data.get("email_address") or "").strip().lower()

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    # Validate required fields
    if not password:
        return jsonify({"error": "password required"}), 400

    if not authority_type or not name:
        return jsonify({"error": "authority_type and name required"}), 400

    if latitude is None or longitude is None:
        return jsonify({"error": "latitude and longitude required"}), 400

    # Convert coordinates to float
    try:
        lat = float(latitude)
        lon = float(longitude)
    except Exception:
        return jsonify({"error": "latitude/longitude must be numbers"}), 400

    # Generate or use provided authority ID
    authority_id = (data.get("authority_id") or "").strip()
    if not authority_id:
        authority_id = generate_authority_id()

    # Check for duplicate authority ID
    if mongo.db.authorities.find_one({"authority_id": authority_id}):
        return jsonify({"error": "authority_id already exists"}), 409

    # Check for duplicate email
    if email and mongo.db.authorities.find_one({"email_address": email}):
        return jsonify({"error": "email already registered"}), 409

    # Build authority document
    doc = {
        "authority_id": authority_id,
        "type": normalize_type(authority_type),
        "unit_name": name,
        "district": district,
        "address": address,
        "latitude": lat,
        "longitude": lon,
        "emergency_phone": phone,
        "email_address": email,
        "password": password,
        "is_active": True,
        "source": "manual_register",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "osm": data.get("osm", {}),
    }

    # Insert into database
    res = mongo.db.authorities.insert_one(doc)

    # Return success response
    return jsonify({
        "message": "Registered successfully",
        "authority_id": authority_id,
        "_id": str(res.inserted_id),
        "authority": {
            "authority_id": authority_id,
            "type": doc["type"],
            "unit_name": doc["unit_name"],
            "district": doc["district"],
            "latitude": doc["latitude"],
            "longitude": doc["longitude"],
            "is_active": doc["is_active"],
        }
    }), 201

# Authenticate authority login
@profiles_bp.post("/login")
def login_profile():

    # Extract login credentials
    data = request.get_json(force=True) or {}

    email_address = (data.get("email_address") or "").strip()
    password = (data.get("password") or "").strip()

    # Validate input
    if not email_address or not password:
        return jsonify({"error": "email_address and password required"}), 400

    # Find active user
    user = mongo.db.authorities.find_one({
        "email_address": email_address,
        "is_active": True
    })

    if not user:
        return jsonify({"error": "invalid credentials"}), 401

    # Check password
    saved_password = (user.get("password") or "").strip()
    if saved_password != password:
        return jsonify({"error": "invalid credentials"}), 401

    # Return successful login response
    return jsonify({
        "message": "Login successful",
        "authority_id": user.get("authority_id"),
        "authority_type": user.get("type"),
        "unit_name": user.get("unit_name"),
        "district": user.get("district"),
        "email": user.get("email_address"),
        "phone": user.get("emergency_phone"),
    }), 200