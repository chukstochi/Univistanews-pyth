import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.utils.decorators import get_current_user
from app.extensions import limiter

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

security_logger = logging.getLogger("security")


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    """
    Single login endpoint used for BOTH admin and authors.
    There is intentionally NO public self-registration route —
    only the admin can create author accounts (see routes/admin.py).
    """
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.is_active or not user.check_password(password):
        security_logger.warning(
            "Failed login attempt for email=%s from ip=%s",
            email, request.remote_addr,
        )
        # Deliberately vague message so we don't leak whether the email exists
        return jsonify({"error": "Invalid credentials"}), 401

    security_logger.info(
        "Successful login for user_id=%s from ip=%s",
        user.id, request.remote_addr,
    )

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "name": user.name},
    )

    return jsonify({
        "access_token": token,
        "user": user.to_dict(include_email=True),
    }), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not found"}), 404
    return jsonify(user.to_dict(include_email=True)), 200