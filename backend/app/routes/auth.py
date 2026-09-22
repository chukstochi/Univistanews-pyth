import logging
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db, limiter
from app.models.user import User
from app.utils.decorators import get_current_user
from app.utils.mailer import send_email

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
        return jsonify({"error": "Invalid credentials"}), 401

    # If this account still has a temporary password past its 24-hour deadline,
    # block login entirely and point them to the reset-password flow instead.
    if user.must_change_password and user.password_deadline and datetime.utcnow() > user.password_deadline:
        security_logger.warning(
            "Login blocked (expired temp password) for user_id=%s from ip=%s",
            user.id, request.remote_addr,
        )
        return jsonify({
            "error": "Your temporary password has expired. Please use 'Forgot password' to reset it.",
            "expired_temp_password": True,
        }), 401

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


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """
    Used both for the forced first-login change, and for a logged-in user
    voluntarily changing their password later.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Not found"}), 404

    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user.set_password(new_password)
    user.must_change_password = False
    user.password_deadline = None
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
@limiter.limit("3 per minute")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    user = User.query.filter_by(email=email).first()

    # Always return the same response whether or not the email exists,
    # so we don't leak which emails are registered.
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_url = f"{current_app.config['FRONTEND_ORIGIN']}/reset-password?token={token}"
        send_email(
            to_email=email,
            subject="Reset your Univista News password",
            html_body=f"""
                <p>Hi {user.name},</p>
                <p>We received a request to reset your password.</p>
                <p><a href="{reset_url}">Click here to set a new password</a></p>
                <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
            """,
        )

    return jsonify({"message": "If that email exists, a reset link has been sent."}), 200


@auth_bp.route("/reset-password", methods=["POST"])
@limiter.limit("5 per minute")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expires or datetime.utcnow() > user.reset_token_expires:
        return jsonify({"error": "This reset link is invalid or has expired"}), 400

    user.set_password(new_password)
    user.must_change_password = False
    user.password_deadline = None
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()

    return jsonify({"message": "Password reset successfully. You can now log in."}), 200