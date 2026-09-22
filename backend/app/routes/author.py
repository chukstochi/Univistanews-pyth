from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.news import News
from app.models.category import Category
from app.models.tag import Tag
from app.utils.decorators import role_required, get_current_user
from app.utils.slugify import slugify

author_bp = Blueprint("author", __name__, url_prefix="/api/author")


def _unique_slug(base_title):
    base = slugify(base_title)
    slug = base
    i = 1
    while News.query.filter_by(slug=slug).first():
        i += 1
        slug = f"{base}-{i}"
    return slug


@author_bp.route("/news", methods=["POST"])
@role_required("admin", "author")
def create_news():
    """Both admins and authors can create news."""
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    body = (data.get("body") or "").strip()
    category_id = data.get("category_id")

    if not title or not body or not category_id:
        return jsonify({"error": "title, body and category_id are required"}), 400

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Invalid category_id"}), 400

    news = News(
        title=title,
        slug=_unique_slug(title),
        summary=data.get("summary"),
        body=body,
        image_url=data.get("image_url"),
        video_url=data.get("video_url"),
        is_breaking=bool(data.get("is_breaking", False)),
        is_published=bool(data.get("is_published", True)),
        category_id=category_id,
        author_id=user.id,
    )

    tag_ids = data.get("tag_ids") or []
    if tag_ids:
        news.tags = Tag.query.filter(Tag.id.in_(tag_ids)).all()

    db.session.add(news)
    db.session.commit()
    return jsonify(news.to_dict(detailed=True)), 201


@author_bp.route("/news/<int:news_id>", methods=["PUT"])
@role_required("admin", "author")
def update_news(news_id):
    """
    Authors may only edit their OWN articles.
    Admins may edit any article.
    """
    user = get_current_user()
    news = News.query.get(news_id)
    if not news:
        return jsonify({"error": "Article not found"}), 404

    if user.role == "author" and news.author_id != user.id:
        return jsonify({"error": "Forbidden: you can only edit your own articles"}), 403

    data = request.get_json(silent=True) or {}

    if "title" in data and data["title"].strip() and data["title"] != news.title:
        news.title = data["title"].strip()
        news.slug = _unique_slug(news.title)

    for field in ["summary", "body", "image_url", "video_url"]:
        if field in data:
            setattr(news, field, data[field])

    if "category_id" in data:
        category = Category.query.get(data["category_id"])
        if not category:
            return jsonify({"error": "Invalid category_id"}), 400
        news.category_id = data["category_id"]

    if "is_breaking" in data:
        news.is_breaking = bool(data["is_breaking"])

    if "is_published" in data:
        news.is_published = bool(data["is_published"])

    if "tag_ids" in data:
        news.tags = Tag.query.filter(Tag.id.in_(data["tag_ids"] or [])).all()

    db.session.commit()
    return jsonify(news.to_dict(detailed=True)), 200


@author_bp.route("/news/mine", methods=["GET"])
@role_required("admin", "author")
def my_news():
    user = get_current_user()
    items = News.query.filter_by(author_id=user.id).order_by(News.created_at.desc()).all()
    return jsonify([n.to_dict(detailed=True) for n in items]), 200


# NOTE: Deliberately NO DELETE route in this blueprint.
# Deletion of news is only available to admins, in routes/admin.py.