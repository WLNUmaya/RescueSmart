

from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import mongo, socketio
from .routes.admin_routes import dispatch_bp
from .routes.victim_routes import victim_bp
from .routes.authority_routes import authority_bp
from .routes.authority_profile_routes import profiles_bp
from .routes.victim_profile_routes import victim_auth_bp
from .socket.dispatch_socket import register_dispatch_socket


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mongo.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}},
        supports_credentials=True,
    )

    socketio.init_app(
        app,
        cors_allowed_origins=app.config.get("CORS_ORIGINS", "*"),
    )

    app.register_blueprint(victim_bp)
    app.register_blueprint(dispatch_bp, url_prefix="/api/v1/dispatches")
    app.register_blueprint(authority_bp, url_prefix="/api/v1/authorities")
    app.register_blueprint(victim_auth_bp)
    app.register_blueprint(profiles_bp)

    register_dispatch_socket(socketio)

    @app.get("/health")
    def health():
        return {"status": "ok"}, 200

    return app