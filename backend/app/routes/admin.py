from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from app.models.news import News
from app.models.category import Category
from app.models.tag import Tag
from app.utils.decorators import role_required
from app.utils.slugify import slugify

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ---------- AUTHORS ----------

@admin_bp.route("/authors", methods=["GET"])
@role_required("admin")
def list_authors():
    authors = User.query.filter_by(role="author").order_by(User.name).all()
    return jsonify([a.to_dict(include_email=True) for a in authors]), 200


@admin_bp.route("/authors", methods=["POST"])
@role_required("admin")
def add_author():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "A user with this email already exists"}), 409

    author = User(name=name, email=email, role="author", bio=data.get("bio"))
    author.set_password(password)
    db.session.add(author)
    db.session.commit()
    return jsonify(author.to_dict(include_email=True)), 201


@admin_bp.route("/authors/<int:author_id>", methods=["PUT"])
@role_required("admin")
def edit_author(author_id):
    author = User.query.filter_by(id=author_id, role="author").first()
    if not author:
        return jsonify({"error": "Author not found"}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data and data["name"].strip():
        author.name = data["name"].strip()
    if "bio" in data:
        author.bio = data["bio"]
    if "is_active" in data:
        author.is_active = bool(data["is_active"])
    if "password" in data and data["password"]:
        if len(data["password"]) < 8:
            return jsonify({"error": "Password must be at least 8 characters"}), 400
        author.set_password(data["password"])

    db.session.commit()
    return jsonify(author.to_dict(include_email=True)), 200


@admin_bp.route("/authors/<int:author_id>", methods=["DELETE"])
@role_required("admin")
def delete_author(author_id):
    author = User.query.filter_by(id=author_id, role="author").first()
    if not author:
        return jsonify({"error": "Author not found"}), 404
    db.session.delete(author)
    db.session.commit()
    return jsonify({"message": "Author deleted"}), 200


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
