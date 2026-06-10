from flask import request
from flask_socketio import join_room, leave_room


# Register Socket.IO event handlers for dispatch communication
def register_dispatch_socket(socketio):

    # Handle new socket connection
    @socketio.on("connect")
    def on_connect():
        print(f" socket connected: {request.sid}")

    # Handle socket disconnection
    @socketio.on("disconnect")
    def on_disconnect():
        print(f" socket disconnected: {request.sid}")

    # Join an authority-specific room for dispatch updates
    @socketio.on("join_authority")
    def join_authority(data):
        authority_id = str((data or {}).get("authority_id", "")).strip()
        if not authority_id:
            return {"ok": False, "error": "authority_id required"}

        join_room(authority_id)
        print(f" joined room authority_id={authority_id}, sid={request.sid}")
        return {"ok": True, "room": authority_id, "type": "authority"}

    # Leave an authority-specific room
    @socketio.on("leave_authority")
    def leave_authority(data):
        authority_id = str((data or {}).get("authority_id", "")).strip()
        if not authority_id:
            return {"ok": False, "error": "authority_id required"}

        leave_room(authority_id)
        print(f" left room authority_id={authority_id}, sid={request.sid}")
        return {"ok": True, "room": authority_id, "type": "authority"}

    # Join a victim-specific room for rescue updates
    @socketio.on("join_victim")
    def join_victim(data):
        victim_id = str((data or {}).get("victim_id", "")).strip()
        if not victim_id:
            return {"ok": False, "error": "victim_id required"}

        join_room(victim_id)
        print(f" joined room victim_id={victim_id}, sid={request.sid}")
        return {"ok": True, "room": victim_id, "type": "victim"}

    # Leave a victim-specific room
    @socketio.on("leave_victim")
    def leave_victim(data):
        victim_id = str((data or {}).get("victim_id", "")).strip()
        if not victim_id:
            return {"ok": False, "error": "victim_id required"}

        leave_room(victim_id)
        print(f" left room victim_id={victim_id}, sid={request.sid}")
        return {"ok": True, "room": victim_id, "type": "victim"}