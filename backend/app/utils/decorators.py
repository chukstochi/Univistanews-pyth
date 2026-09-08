from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.models.user import User


def role_required(*allowed_roles):
    """
    Restricts a route to specific roles (e.g. 'admin', or 'admin', 'author').
    Must be used together with @jwt_required-style verification (handled here).
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return jsonify({"error": "Forbidden: insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))
