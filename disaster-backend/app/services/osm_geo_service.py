import math
import requests
from typing import Dict, List, Optional

# Define Overpass API endpoint
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


# Calculate distance between two coordinates in meters
def haversine_m(lat1, lon1, lat2, lon2):
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


# Extract nearby river and bridge features from OpenStreetMap Overpass
def get_river_bridge_features(lat: float, lon: float, radius_m: int = 2000) -> Dict:
    # Build Overpass query for waterways and bridges
    query = f"""
    [out:json];
    (
      way(around:{radius_m},{lat},{lon})["waterway"];
      way(around:{radius_m},{lat},{lon})["bridge"="yes"];
      node(around:{radius_m},{lat},{lon})["bridge"="yes"];
    );
    out center tags;
    """

    try:
        # Send Overpass request
        r = requests.post(OVERPASS_URL, data=query, timeout=15)
        r.raise_for_status()
        elements = r.json().get("elements", [])
    except Exception:
        # Return default values if the request fails
        return {
            "dist_nearest_river_m": None,
            "nearest_river_name": None,
            "nearest_river_lat": None,
            "nearest_river_lon": None,
            "bridges_2km": 0,
            "nearby_bridge_names": [],
            "geo_source": "osm_overpass",
        }

    rivers = []
    bridges = []

    # Process returned OSM elements
    for e in elements:
        center = e.get("center", {})
        elat = center.get("lat", e.get("lat"))
        elon = center.get("lon", e.get("lon"))
        if elat is None or elon is None:
            continue

        tags = e.get("tags", {})
        name = tags.get("name") or tags.get("ref")

        dist = haversine_m(lat, lon, float(elat), float(elon))

        # Store river candidates
        if "waterway" in tags:
            rivers.append((dist, name, float(elat), float(elon)))

        # Store bridge names
        if tags.get("bridge") == "yes":
            bridges.append(name if name else "Unnamed bridge")

    nearest_river_dist = None
    nearest_river_name = None
    nearest_river_lat = None
    nearest_river_lon = None

    # Find nearest river if available
    if rivers:
        nearest_river_dist, nearest_river_name, nearest_river_lat, nearest_river_lon = min(
            rivers, key=lambda x: x[0]
        )

    # Return extracted geospatial features
    return {
        "dist_nearest_river_m": nearest_river_dist,
        "nearest_river_name": nearest_river_name,
        "nearest_river_lat": nearest_river_lat,
        "nearest_river_lon": nearest_river_lon,
        "bridges_2km": len(set(bridges)),
        "nearby_bridge_names": list(set(bridges)),
        "geo_source": "osm_overpass",
    }