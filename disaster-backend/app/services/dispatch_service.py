from .nearest_authority_service import find_nearest


# Find and return the nearest authorities based on predicted response flags
def dispatch_authorities(victim, flags):
    lat = victim.get("latitude")
    lon = victim.get("longitude")

    # Validate victim location
    if lat is None or lon is None:
        print("DISPATCH ERROR: victim latitude/longitude missing")
        return []

    # Validate authority flag input
    if not isinstance(flags, dict):
        print("DISPATCH ERROR: flags must be a dict")
        return []

    dispatched = []

    # Find nearest navy units if navy is predicted
    if flags.get("navy", 0):
        dispatched.extend(find_nearest(lat, lon, "navy"))

  
    if flags.get("fire", 0):
        dispatched.extend(find_nearest(lat, lon, "fire"))

  
    if flags.get("ambulance", 0):
        dispatched.extend(find_nearest(lat, lon, "ambulance"))


    if flags.get("police", 0):
        dispatched.extend(find_nearest(lat, lon, "police"))

  
    if flags.get("army", 0):
        dispatched.extend(find_nearest(lat, lon, "army"))

    # Remove duplicate authority entries
    unique = []
    seen = set()

    for item in dispatched:
        key = (
            item.get("authority_type"),
            item.get("authority_id"),
            round(float(item.get("latitude", 0.0)), 6),
            round(float(item.get("longitude", 0.0)), 6),
            item.get("name"),
            item.get("source"),
        )
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)

    # Sort authorities by nearest distance first
    unique.sort(key=lambda x: x.get("distance_m", 999999))
    return unique