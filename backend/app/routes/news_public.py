from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app.extensions import db
from app.models.news import News
from app.models.category import Category
from app.models.tag import Tag

news_public_bp = Blueprint("news_public", __name__, url_prefix="/api/news")


@news_public_bp.route("", methods=["GET"])
def list_news():
    """
    General feed with optional filters: ?category=slug&tag=slug&q=search&page=1&per_page=10
    Used by the homepage sections and category pages.
    """
    query = News.query.filter_by(is_published=True)

    category_slug = request.args.get("category")
    if category_slug:
        query = query.join(Category).filter(Category.slug == category_slug)

    tag_slug = request.args.get("tag")
    if tag_slug:
        query = query.join(News.tags).filter(Tag.slug == tag_slug)

    q = request.args.get("q")
    if q:
        like = f"%{q}%"
        query = query.filter(or_(News.title.ilike(like), News.summary.ilike(like), News.body.ilike(like)))

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 50)

    query = query.order_by(News.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [n.to_dict() for n in pagination.items],
        "page": pagination.page,
        "pages": pagination.pages,
        "total": pagination.total,
    }), 200


@news_public_bp.route("/breaking", methods=["GET"])
def breaking_news():
    """Powers the right-to-left sliding news-flash ticker (titles only)."""
    items = (News.query
             .filter_by(is_published=True, is_breaking=True)
             .order_by(News.created_at.desc())
             .limit(15)
             .all())
    return jsonify([{"id": n.id, "title": n.title, "slug": n.slug} for n in items]), 200


@news_public_bp.route("/latest", methods=["GET"])
def latest_two():
    """Powers the two 'latest news' hero sections (left image-top, right image-right)."""
    items = (News.query
             .filter_by(is_published=True)
             .order_by(News.created_at.desc())
             .limit(2)
             .all())
    return jsonify([n.to_dict() for n in items]), 200


@news_public_bp.route("/by-category-preview", methods=["GET"])
def by_category_preview():
    """
    Returns a small preview list per category, for the homepage category sections.
    ?limit=4 per category
    """
    limit = request.args.get("limit", 4, type=int)
    categories = Category.query.all()
    result = []
    for c in categories:
        items = (News.query
                 .filter_by(is_published=True, category_id=c.id)
                 .order_by(News.created_at.desc())
                 .limit(limit)
                 .all())
        result.append({
            "category": c.to_dict(),
            "items": [n.to_dict() for n in items],
        })
    return jsonify(result), 200


@news_public_bp.route("/<string:slug>", methods=["GET"])
def get_news_detail(slug):
    item = News.query.filter_by(slug=slug, is_published=True).first()
    if not item:
        return jsonify({"error": "Article not found"}), 404
    return jsonify(item.to_dict(detailed=True)), 200


@news_public_bp.route("/categories", methods=["GET"])
def list_categories():
    return jsonify([c.to_dict() for c in Category.query.order_by(Category.name).all()]), 200


@news_public_bp.route("/tags", methods=["GET"])
def list_tags():
    return jsonify([t.to_dict() for t in Tag.query.order_by(Tag.name).all()]), 200
