from datetime import datetime
from typing import Dict, Any
from app.repositories import victim_repository


# Convert MongoDB document into a JSON-safe dictionary
def _serialize(doc: Dict[str, Any] | None) -> Dict[str, Any] | None:
    if not doc:
        return None
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    return doc


# Create a new victim record with timestamps
def create_victim(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = dict(payload)
    payload["created_at"] = datetime.utcnow()
    payload["updated_at"] = datetime.utcnow()

    new_id = victim_repository.create(payload)
    return _serialize(victim_repository.get_by_id(new_id))


# Retrieve a victim record by ID
def get_victim(victim_id: str) -> Dict[str, Any] | None:
    return _serialize(victim_repository.get_by_id(victim_id))


# Update an existing victim record and refresh the updated timestamp
def update_victim(victim_id: str, updates: Dict[str, Any]) -> Dict[str, Any] | None:
    updates = dict(updates)
    updates["updated_at"] = datetime.utcnow()
    victim_repository.update(victim_id, updates)
    return get_victim(victim_id)


# Delete a victim record by ID
def delete_victim(victim_id: str) -> bool:
    return victim_repository.delete(victim_id)