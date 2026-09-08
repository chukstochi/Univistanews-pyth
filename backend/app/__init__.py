from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, cors


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    allowed_origins = [o.strip() for o in app.config["FRONTEND_ORIGIN"].split(",") if o.strip()]
    cors.init_app(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

    from app.routes.auth import auth_bp
    from app.routes.news_public import news_public_bp
    from app.routes.author import author_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(news_public_bp)
    app.register_blueprint(author_bp)
    app.register_blueprint(admin_bp)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "Univista News API"}), 200

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({"error": "Authentication required"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"error": "Invalid or expired token"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(header, payload):
        return jsonify({"error": "Session expired, please log in again"}), 401

    return app
