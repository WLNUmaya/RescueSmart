from app.extensions import mongo
from datetime import datetime

# Save a new dispatch record for a victim-authority assignment
def save_dispatch(victim_id, priority, authority):

    # Extract authority location values with fallback key names
    latitude = authority.get("latitude") or authority.get("lat")
    longitude = authority.get("longitude") or authority.get("lon")

    # Build the dispatch document to store in MongoDB
    doc = {
        "victim_id": str(victim_id),
        "authority_id": authority.get("authority_id"),
        "authority_type": authority.get("authority_type"),
        "authority_name": authority.get("name"),
        "email_address": authority.get("email_address") or authority.get("email"),
        "authority_address": authority.get("address"),
        "authority_phone": authority.get("emergency_phone") or authority.get("phone"),
        "authority_district": authority.get("district"),
        "latitude": latitude,
        "longitude": longitude,
        "distance_m": authority.get("distance_m"),
        "distance_km": authority.get("distance_km"),
        "source": authority.get("source", "unknown"),
        "priority_level": int(priority),
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

  
    res = mongo.db.dispatches.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    return doc