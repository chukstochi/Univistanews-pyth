import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from app.extensions import db
from app.models.user import User
from app.models.news import News
from app.models.category import Category
from app.models.tag import Tag
from app.utils.decorators import role_required, get_current_user
from app.utils.slugify import slugify
from app.utils.mailer import send_email

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ---------- STAFF (authors + admins) ----------

@admin_bp.route("/authors", methods=["GET"])
@role_required("admin")
def list_authors():
    """Lists all staff — authors AND admins — so this one page manages the whole team."""
    staff = User.query.filter(User.role.in_(["author", "admin"])).order_by(User.role, User.name).all()
    return jsonify([a.to_dict(include_email=True) for a in staff]), 200


@admin_bp.route("/authors", methods=["POST"])
@role_required("admin")
def add_author():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    role = (data.get("role") or "author").strip().lower()

    if role not in ("author", "admin"):
        return jsonify({"error": "role must be 'author' or 'admin'"}), 400
    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "A user with this email already exists"}), 409

    # Auto-generate a strong temporary password instead of the admin typing one
    temp_password = secrets.token_urlsafe(9)  # ~12 readable characters

    new_user = User(name=name, email=email, role=role, bio=data.get("bio"))
    new_user.set_password(temp_password)
    new_user.must_change_password = True
    new_user.password_deadline = datetime.utcnow() + timedelta(hours=24)

    db.session.add(new_user)
    db.session.commit()

    login_url = f"{current_app.config['FRONTEND_ORIGIN']}/login"
    role_label = "an administrator" if role == "admin" else "an author"
    send_email(
        to_email=email,
        subject="Welcome to Univista News — your account is ready",
        html_body=f"""
            <p>Hi {name},</p>
            <p>Congratulations — you've been added as {role_label} on <strong>Univista News</strong>.</p>
            <p>Here are your login details:</p>
            <p>
                Email: <strong>{email}</strong><br>
                Temporary password: <strong>{temp_password}</strong>
            </p>
            <p><a href="{login_url}">Click here to log in</a></p>
            <p><strong>Important:</strong> for security, you must change this password within
            24 hours of receiving this email. If you don't, you'll need to use the
            "Forgot password" link on the login page to reset it instead.</p>
        """,
    )

    return jsonify(new_user.to_dict(include_email=True)), 201


@admin_bp.route("/authors/<int:author_id>", methods=["PUT"])
@role_required("admin")
def edit_author(author_id):
    current = get_current_user()
    target = User.query.filter(User.id == author_id, User.role.in_(["author", "admin"])).first()
    if not target:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}

    if "role" in data:
        new_role = (data["role"] or "").strip().lower()
        if new_role not in ("author", "admin"):
            return jsonify({"error": "role must be 'author' or 'admin'"}), 400
        if target.id == current.id and new_role != "admin":
            return jsonify({"error": "You can't remove your own admin access"}), 400
        target.role = new_role

    if "name" in data and data["name"].strip():
        target.name = data["name"].strip()
    if "bio" in data:
        target.bio = data["bio"]
    if "is_active" in data:
        if target.id == current.id and not data["is_active"]:
            return jsonify({"error": "You can't deactivate your own account"}), 400
        target.is_active = bool(data["is_active"])
    if "password" in data and data["password"]:
        if len(data["password"]) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        target.set_password(data["password"])
        target.must_change_password = False
        target.password_deadline = None

    db.session.commit()
    return jsonify(target.to_dict(include_email=True)), 200


@admin_bp.route("/authors/<int:author_id>", methods=["DELETE"])
@role_required("admin")
def delete_author(author_id):
    current = get_current_user()
    if author_id == current.id:
        return jsonify({"error": "You can't delete your own account"}), 400

    target = User.query.filter(User.id == author_id, User.role.in_(["author", "admin"])).first()
    if not target:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(target)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200


# ---------- CATEGORIES ----------

@admin_bp.route("/categories", methods=["POST"])
@role_required("admin")
def add_category():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    if Category.query.filter_by(name=name).first():
        return jsonify({"error": "Category already exists"}), 409

    category = Category(name=name, slug=slugify(name), description=data.get("description"))
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@admin_bp.route("/categories/<int:cat_id>", methods=["PUT"])
@role_required("admin")
def edit_category(cat_id):
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data and data["name"].strip():
        category.name = data["name"].strip()
        category.slug = slugify(category.name)
    if "description" in data:
        category.description = data["description"]
    db.session.commit()
    return jsonify(category.to_dict()), 200


@admin_bp.route("/categories/<int:cat_id>", methods=["DELETE"])
@role_required("admin")
def delete_category(cat_id):
    category = Category.query.get(cat_id)
    if not category:
        return jsonify({"error": "Category not found"}), 404
    if category.news_items.count() > 0:
        return jsonify({"error": "Cannot delete a category that still has news articles"}), 400
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted"}), 200


# ---------- TAGS ----------

@admin_bp.route("/tags", methods=["POST"])
@role_required("admin")
def add_tag():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    if Tag.query.filter_by(name=name).first():
        return jsonify({"error": "Tag already exists"}), 409

    tag = Tag(name=name, slug=slugify(name))
    db.session.add(tag)
    db.session.commit()
    return jsonify(tag.to_dict()), 201


@admin_bp.route("/tags/<int:tag_id>", methods=["PUT"])
@role_required("admin")
def edit_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({"error": "Tag not found"}), 404
    data = request.get_json(silent=True) or {}
    if "name" in data and data["name"].strip():
        tag.name = data["name"].strip()
        tag.slug = slugify(tag.name)
    db.session.commit()
    return jsonify(tag.to_dict()), 200


@admin_bp.route("/tags/<int:tag_id>", methods=["DELETE"])
@role_required("admin")
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({"error": "Tag not found"}), 404
    db.session.delete(tag)
    db.session.commit()
    return jsonify({"message": "Tag deleted"}), 200


# ---------- NEWS (admin has full control, including delete) ----------

@admin_bp.route("/news", methods=["GET"])
@role_required("admin")
def list_all_news():
    items = News.query.order_by(News.created_at.desc()).all()
    return jsonify([n.to_dict(detailed=True) for n in items]), 200


@admin_bp.route("/news/<int:news_id>", methods=["DELETE"])
@role_required("admin")
def delete_news(news_id):
    """Only the admin can delete news. Authors can add/edit but never delete (see routes/author.py)."""
    news = News.query.get(news_id)
    if not news:
        return jsonify({"error": "Article not found"}), 404
    db.session.delete(news)
    db.session.commit()
    return jsonify({"message": "Article deleted"}), 200
