from app.extensions import mongo
import requests
import math
from typing import List, Dict, Optional

# Define Overpass API endpoint
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


# Map authority types for the old database schema
DB_TYPE_MAP_OLD = {
    "navy": ["Navy"],
    "fire": ["Fire", "Fire Station", "Fire Rescue" , "Fire Department"],
    "ambulance": ["Ambulance", "Hospital"],
    "police": ["Police"],
    "army": ["Army"],
    "hospital": ["Hospital"],
}

# Map authority types for the new database schema
DB_TYPE_MAP_NEW = {
    "navy": ["navy"],
    "fire": ["fire", "fire_rescue", "fire_station" ,"Fire Department"],
    "ambulance": ["ambulance", "hospital"],
    "police": ["police"],
    "army": ["army"],
    "hospital": ["hospital"],
}

# Define Overpass fallback tags for each authority type
OVERPASS_TAG_MAP = {
    "navy": [
        '["military"="naval_base"]',
        '["office"="government"]["government"="navy"]',
    ],
    "fire": [
        '["amenity"="fire_station"] ',
    ],
    "ambulance": [
        '["amenity"="hospital"]',
        '["emergency"="ambulance_station"]',
    ],
    "police": [
        '["amenity"="police"]',
    ],
    "army": [
        '["military"="base"]',
        '["landuse"="military"]',
        '["office"="government"]["government"="army"]',
    ],
    "hospital": [
        '["amenity"="hospital"]',
    ],
}


# Calculate distance between two coordinates in meters
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
    p = math.pi / 180.0
    a = (
        0.5
        - math.cos((lat2 - lat1) * p) / 2
        + math.cos(lat1 * p)
        * math.cos(lat2 * p)
        * (1 - math.cos((lon2 - lon1) * p))
        / 2
    )
    return 2 * R * math.asin(math.sqrt(a))


# Convert authority records from old or new schema into one common format
def _normalize_authority_doc(
    doc: Dict,
    requested_type: str,
    victim_lat: float,
    victim_lon: float,
) -> Optional[Dict]:
    """
    Supports:
    OLD schema:
      {
        "authority_id": "...",
        "type": "Police",
        "unit_name": "...",
        "latitude": 6.x,
        "longitude": 79.x,
        ...
      }

    NEW schema:
      {
        "authority_id": "...",
        "authority_type": "police",
        "name": "...",
        "location": {"type":"Point","coordinates":[lon,lat]},
        ...
      }
    """

    # Handle new schema using GeoJSON location
    location = doc.get("location")
    if isinstance(location, dict):
        coords = location.get("coordinates", [])
        if isinstance(coords, list) and len(coords) == 2:
            lon = coords[0]
            lat = coords[1]
            if lat is not None and lon is not None:
                lat = float(lat)
                lon = float(lon)
                dist_m = haversine_m(victim_lat, victim_lon, lat, lon)
                return {
                    "source": "mongodb",
                    "authority_id": doc.get("authority_id"),
                    "authority_type": requested_type,
                    "db_type": doc.get("authority_type"),
                    "name": doc.get("name", "Unknown"),
                    "district": doc.get("district"),
                    "address": doc.get("address"),
                    "latitude": lat,
                    "longitude": lon,
                    "phone": doc.get("emergency_phone"),
                    "emergency_phone": doc.get("emergency_phone"),
                    "email": doc.get("email_address"),
                    "email_address": doc.get("email_address"),
                    "distance_m": round(dist_m, 2),
                    "distance_km": round(dist_m / 1000.0, 3),
                }

    # Handle old schema using latitude and longitude fields
    lat = doc.get("latitude")
    lon = doc.get("longitude")
    if lat is not None and lon is not None:
        lat = float(lat)
        lon = float(lon)
        dist_m = haversine_m(victim_lat, victim_lon, lat, lon)
        return {
            "source": "mongodb",
            "authority_id": doc.get("authority_id"),
            "authority_type": requested_type,
            "db_type": doc.get("type"),
            "name": doc.get("unit_name", "Unknown"),
            "district": doc.get("district"),
            "address": doc.get("address"),
            "latitude": lat,
            "longitude": lon,
            "phone": doc.get("emergency_phone"),
            "emergency_phone": doc.get("emergency_phone"),
            "email": doc.get("email_address"),
            "email_address": doc.get("email_address"),
            "distance_m": round(dist_m, 2),
            "distance_km": round(dist_m / 1000.0, 3),
            "osm": doc.get("osm", {}),
        }

    return None


# Search the MongoDB database for nearest matching authorities
def find_nearest_from_db(
    lat: float,
    lon: float,
    authority_type: str,
    max_distance_m: int = 15000,
    limit: int = 3,
) -> List[Dict]:
    old_types = DB_TYPE_MAP_OLD.get(authority_type, [authority_type.title()])
    new_types = DB_TYPE_MAP_NEW.get(authority_type, [authority_type.lower()])

    # Query both old and new schemas
    query = {
        "$or": [
            {"type": {"$in": old_types}},
            {"authority_type": {"$in": new_types}},
        ]
    }

    docs = list(mongo.db.authorities.find(query))

    print(f"DB SEARCH [{authority_type}] raw docs: {len(docs)}")

    if not docs:
        return []

    candidates = []
    for doc in docs:
        item = _normalize_authority_doc(doc, authority_type, lat, lon)
        if not item:
            continue

        # Ignore inactive authorities if field exists
        if "is_active" in doc and not bool(doc.get("is_active")):
            continue

        # Keep only authorities inside the allowed distance
        if item["distance_m"] <= max_distance_m:
            candidates.append(item)

    # Sort by nearest distance
    candidates.sort(key=lambda x: x["distance_m"])
    result = candidates[:limit]

    print(f"DB SEARCH [{authority_type}] final results: {len(result)}")
    for r in result:
        print("DB MATCH ->", r.get("authority_id"), r.get("name"), r.get("distance_km"), "km")

    return result


# Build an Overpass query for fallback nearest-authority search
def _build_overpass_query(lat: float, lon: float, radius: int, authority_type: str) -> Optional[str]:
    tag_list = OVERPASS_TAG_MAP.get(authority_type)
    if not tag_list:
        return None

    parts = []
    for tag in tag_list:
        parts.append(f'node{tag}(around:{radius},{lat},{lon});')
        parts.append(f'way{tag}(around:{radius},{lat},{lon});')
        parts.append(f'relation{tag}(around:{radius},{lat},{lon});')

    joined = "\n".join(parts)

    return f"""
    [out:json][timeout:20];
    (
      {joined}
    );
    out center tags;
    """


# Search Overpass API for nearest authorities when DB results are unavailable
def find_nearest_from_overpass(
    lat: float,
    lon: float,
    authority_type: str,
    radius: int = 15000,
    limit: int = 3,
) -> List[Dict]:
    query = _build_overpass_query(lat, lon, radius, authority_type)
    if not query:
        return []

    try:
        res = requests.post(OVERPASS_URL, data=query, timeout=25)
        res.raise_for_status()
        data = res.json() or {}
    except Exception as e:
        print(f"OVERPASS ERROR [{authority_type}]: {e}")
        return []

    elements = data.get("elements") or []
    if not elements:
        return []

    out = []
    for e in elements:
        center = e.get("center") or {}
        elat = center.get("lat", e.get("lat"))
        elon = center.get("lon", e.get("lon"))

        if elat is None or elon is None:
            continue

        elat = float(elat)
        elon = float(elon)

        dist_m = haversine_m(lat, lon, elat, elon)
        if dist_m > radius:
            continue

        tags = e.get("tags") or {}
        name = tags.get("name") or tags.get("operator") or "Unknown"

        # Build normalized fallback authority record
        out.append({
            "source": "overpass",
            "authority_id": None,
            "authority_type": authority_type,
            "name": name,
            "address": tags.get("addr:full") or tags.get("addr:street"),
            "latitude": elat,
            "longitude": elon,
            "distance_m": round(dist_m, 2),
            "distance_km": round(dist_m / 1000.0, 3),
            "osm_type": e.get("type"),
            "osm_id": e.get("id"),
        })

    # Sort fallback results by nearest distance
    out.sort(key=lambda x: x["distance_m"])
    return out[:limit]


# Main nearest-authority resolver using DB first and Overpass as fallback
def find_nearest(
    lat: float,
    lon: float,
    authority_type: str,
    max_distance_m: int = 15000,
    limit: int = 3,
) -> List[Dict]:
    # Try MongoDB authority lookup first
    db_results = find_nearest_from_db(
        lat=lat,
        lon=lon,
        authority_type=authority_type,
        max_distance_m=max_distance_m,
        limit=limit,
    )
    if db_results:
        return db_results

    # Fall back to Overpass if DB has no matches
    print(f"FALLBACK TO OVERPASS [{authority_type}]")
    return find_nearest_from_overpass(
        lat=lat,
        lon=lon,
        authority_type=authority_type,
        radius=max_distance_m,
        limit=limit,
    )