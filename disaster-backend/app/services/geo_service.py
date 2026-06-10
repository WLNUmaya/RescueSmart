# Import type hints and geospatial helper functions
from typing import Dict, Optional
from app.services.google_maps_service import places_nearby, haversine_m, route_google


# Get route information between two coordinates
def get_route(engine: str, lat1: float, lon1: float, lat2: float, lon2: float) -> Optional[Dict]:
    return route_google(lat1, lon1, lat2, lon2, mode="driving")


# Extract nearby river and bridge features around a given location
def get_river_bridge_features(lat: float, lon: float, radius_m: int = 2000) -> Dict:

    # Search for nearby rivers
    river_candidates = places_nearby(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        keyword="river",
        limit=10,
    )

    nearest_river_dist = None
    nearest_river_name = None
    nearest_river_lat = None
    nearest_river_lon = None

    # Get the nearest river and compute its distance
    if river_candidates:
        nearest = river_candidates[0]
        nearest_river_name = nearest.get("name")
        nearest_river_lat = nearest.get("latitude")
        nearest_river_lon = nearest.get("longitude")

        if nearest_river_lat is not None and nearest_river_lon is not None:
            nearest_river_dist = haversine_m(
                lat,
                lon,
                float(nearest_river_lat),
                float(nearest_river_lon),
            )

    # Search for nearby bridges
    bridge_candidates = places_nearby(
        lat=lat,
        lon=lon,
        radius_m=radius_m,
        keyword="bridge",
        limit=20,
    )

    bridge_names = []

    # Collect bridge names
    for b in bridge_candidates:
        nm = b.get("name")
        if nm:
            bridge_names.append(nm)

    # Remove duplicate bridge names
    bridge_names = list(dict.fromkeys(bridge_names))

    # Return extracted geospatial features
    return {
        "dist_nearest_river_m": nearest_river_dist,
        "nearest_river_name": nearest_river_name,
        "nearest_river_lat": nearest_river_lat,
        "nearest_river_lon": nearest_river_lon,
        "bridges_2km": len(bridge_names),
        "nearby_bridge_names": bridge_names,
        "geo_source": "osm_overpass",
        "geo_note": "River/bridge features resolved using OpenStreetMap Overpass data.",
    }