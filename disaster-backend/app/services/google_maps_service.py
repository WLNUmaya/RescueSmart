import math
from typing import Dict, List, Optional, Tuple
import requests

# Define OpenStreetMap and routing service endpoints
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Define request headers for external API calls
HEADERS = {
    "User-Agent": "RescueSmart/1.0 (contact: your-email@example.com)"
}

# Calculate straight-line distance between two coordinates in meters
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = (
        math.sin(dp / 2) ** 2
        + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

# Geocode an address using OpenStreetMap Nominatim
def geocode_address_google(address: str) -> Optional[Dict]:
    """
    Kept same function name for backward compatibility.
    Now uses OpenStreetMap Nominatim instead of Google Geocoding.
    """
    # Validate input address
    if not address or not str(address).strip():
        return None

    params = {
        "q": str(address).strip(),
        "format": "jsonv2",
        "limit": 1,
        "countrycodes": "lk",
        "addressdetails": 1,
    }

    try:
        # Send geocoding request
        r = requests.get(
            NOMINATIM_SEARCH_URL,
            params=params,
            headers=HEADERS,
            timeout=20,
        )
        r.raise_for_status()
        data = r.json()

        # Return nothing if no result found
        if not data:
            return None

        item = data[0]

        # Return normalized location result
        return {
            "latitude": float(item["lat"]),
            "longitude": float(item["lon"]),
            "formatted_address": item.get("display_name"),
            "place_id": str(item.get("place_id")) if item.get("place_id") else None,
            "source": "osm_nominatim",
        }

    except Exception as e:
        print("geocode_address_osm error:", e)
        return None


# Get a driving route between two coordinates using OSRM
def route_google(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
    mode: str = "driving",
) -> Optional[Dict]:
    """
    Kept same function name for backward compatibility.
    Now uses OSRM instead of Google Directions.
    """
    try:
        # Build OSRM route request
        url = f"{OSRM_ROUTE_URL}/{lon1},{lat1};{lon2},{lat2}"
        params = {
            "overview": "full",
            "geometries": "polyline",
            "steps": "false",
        }

        # Send route request
        r = requests.get(url, params=params, headers=HEADERS, timeout=20)
        r.raise_for_status()
        data = r.json()

        routes = data.get("routes", [])
        if not routes:
            return None

        route = routes[0]

        # Return normalized route output
        return {
            "distance_m": float(route.get("distance", 0)),
            "duration_s": float(route.get("duration", 0)),
            "start_address": None,
            "end_address": None,
            "polyline": route.get("geometry"),
            "mode": mode,
            "source": "osrm",
            "engine": "OSRM",
        }

    except Exception as e:
        print("route_osrm error:", e)
        return None


# Send an Overpass query and return matching OSM elements
def _overpass_query(query: str) -> List[Dict]:
    try:
        r = requests.get(
            OVERPASS_URL,
            params={"data": query},
            headers=HEADERS,
            timeout=30,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("elements", [])
    except Exception as e:
        print("overpass query error:", e)
        return []


# Find nearby places using OSM Overpass based on keyword or place type
def places_nearby(
    lat: float,
    lon: float,
    radius_m: int = 2000,
    keyword: Optional[str] = None,
    place_type: Optional[str] = None,
    limit: int = 10,
) -> List[Dict]:
    """
    OSM/Overpass replacement for Google Places Nearby.

    Supported best-effort keywords/types:
    - river
    - bridge
    - hospital
    - police
    - fire_station / fire
    - ambulance
    - army
    - navy
    """
    query_parts = []

    # Resolve search keyword
    kw = (keyword or place_type or "").strip().lower()

    # Build Overpass search patterns by place type
    if kw == "river":
        query_parts.extend([
            f'way(around:{radius_m},{lat},{lon})["waterway"="river"];',
            f'way(around:{radius_m},{lat},{lon})["waterway"="stream"];',
            f'relation(around:{radius_m},{lat},{lon})["waterway"="river"];',
            f'way(around:{radius_m},{lat},{lon})["natural"="water"];',
        ])
    elif kw == "bridge":
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["bridge"];',
            f'way(around:{radius_m},{lat},{lon})["bridge"];',
        ])
    elif kw in ("hospital",):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["amenity"="hospital"];',
            f'way(around:{radius_m},{lat},{lon})["amenity"="hospital"];',
        ])
    elif kw in ("police",):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["amenity"="police"];',
            f'way(around:{radius_m},{lat},{lon})["amenity"="police"];',
        ])
    elif kw in ("fire", "fire_station", "fire_rescue"):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["amenity"="fire_station"];',
            f'way(around:{radius_m},{lat},{lon})["amenity"="fire_station"];',
        ])
    elif kw in ("ambulance",):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["emergency"="ambulance_station"];',
            f'way(around:{radius_m},{lat},{lon})["emergency"="ambulance_station"];',
            f'node(around:{radius_m},{lat},{lon})["amenity"="hospital"];',
            f'way(around:{radius_m},{lat},{lon})["amenity"="hospital"];',
        ])
    elif kw in ("army",):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["military"="base"];',
            f'way(around:{radius_m},{lat},{lon})["military"="base"];',
            f'node(around:{radius_m},{lat},{lon})["landuse"="military"];',
            f'way(around:{radius_m},{lat},{lon})["landuse"="military"];',
        ])
    elif kw in ("navy",):
        query_parts.extend([
            f'node(around:{radius_m},{lat},{lon})["military"="naval_base"];',
            f'way(around:{radius_m},{lat},{lon})["military"="naval_base"];',
            f'node(around:{radius_m},{lat},{lon})["military"="base"];',
            f'way(around:{radius_m},{lat},{lon})["military"="base"];',
        ])
    else:
        return []

    # Build final Overpass query
    overpass = f"""
    [out:json][timeout:25];
    (
      {' '.join(query_parts)}
    );
    out center tags;
    """

    # Fetch matching OSM elements
    elements = _overpass_query(overpass)

    results = []
    for item in elements:
        i_lat = item.get("lat")
        i_lon = item.get("lon")

        # Fall back to center coordinates for ways relations
        if i_lat is None or i_lon is None:
            center = item.get("center", {})
            i_lat = center.get("lat")
            i_lon = center.get("lon")

        if i_lat is None or i_lon is None:
            continue

        name = (item.get("tags") or {}).get("name") or kw.title()

        # Build normalized nearby-place record
        results.append(
            {
                "name": name,
                "latitude": float(i_lat),
                "longitude": float(i_lon),
                "place_id": str(item.get("id")),
                "vicinity": None,
                "distance_m": haversine_m(lat, lon, float(i_lat), float(i_lon)),
                "source": "osm_overpass",
            }
        )

    # Sort by nearest distance first
    results.sort(key=lambda x: x.get("distance_m", 999999999))

    # Remove duplicate nearby places
    unique = []
    seen = set()
    for r in results:
        key = (
            r["name"],
            round(r["latitude"], 6),
            round(r["longitude"], 6),
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(r)

    # Return limited unique results
    return unique[:limit]