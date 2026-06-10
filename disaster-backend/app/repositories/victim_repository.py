from typing import Dict, Any, List, Tuple
from bson import ObjectId
from app.extensions import mongo

COLLECTION = "victims"

# Convert a string ID into MongoDB ObjectId format
def _oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except Exception:
        raise ValueError("Invalid victim id")

# Insert a new victim document into the database
def create(doc: Dict[str, Any]) -> str:
    res = mongo.db[COLLECTION].insert_one(doc)
    return str(res.inserted_id)

# Retrieve a victim record by its MongoDB ID
def get_by_id(victim_id: str) -> Dict[str, Any] | None:
    return mongo.db[COLLECTION].find_one({"_id": _oid(victim_id)})

# Update an existing victim record with new field values
def update(victim_id: str, updates: Dict[str, Any]) -> bool:
    res = mongo.db[COLLECTION].update_one({"_id": _oid(victim_id)}, {"$set": updates})
    return res.matched_count > 0

# Delete a victim record from the database
def delete(victim_id: str) -> bool:
    res = mongo.db[COLLECTION].delete_one({"_id": _oid(victim_id)})
    return res.deleted_count > 0

# Return a paginated list of victim records with optional filters
def list_page(filters: Dict[str, Any], page: int, limit: int) -> Tuple[List[Dict[str, Any]], int]:
    query = {k: v for k, v in filters.items() if v not in (None, "", [])}

    cursor = (
        mongo.db[COLLECTION]
        .find(query)
        .sort("created_at", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )

    items = list(cursor)
    total = mongo.db[COLLECTION].count_documents(query)
    return items, total