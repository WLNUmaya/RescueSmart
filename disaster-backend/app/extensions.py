
import certifi
from pymongo import MongoClient
from flask_socketio import SocketIO
from flask_pymongo import PyMongo

class Mongo:
    def __init__(self):
        self.client = None
        self.db = None

    def init_app(self, app):
        uri = (app.config.get("MONGO_URI") or "").strip()
        db_name = (app.config.get("DB_NAME") or "").strip()

        if not uri:
            raise ValueError("MONGO_URI is empty in .env")
        if not db_name:
            raise ValueError("DB_NAME is empty/missing in .env or Config")

       
        self.client = MongoClient(
            uri,
            tls=True,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
        )

        self.db = self.client[db_name]

# mongo = Mongo()
mongo = PyMongo()
socketio = SocketIO(cors_allowed_origins="*") 
async_mode="threading" 
