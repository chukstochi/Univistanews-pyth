from datetime import datetime
from app.extensions import db
from app.models.tag import news_tags


class News(db.Model):
    __tablename__ = "news"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(300), unique=True, nullable=False, index=True)
    summary = db.Column(db.String(500), nullable=True)
    body = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    is_breaking = db.Column(db.Boolean, default=False)   # shows in the news-flash ticker
    is_published = db.Column(db.Boolean, default=True)

    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)   # first published date/time
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = db.relationship("Category", back_populates="news_items")
    author = db.relationship("User", back_populates="news_items")
    tags = db.relationship("Tag", secondary=news_tags, backref="news_items")

    def to_dict(self, detailed=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "summary": self.summary,
            "image_url": self.image_url,
            "is_breaking": self.is_breaking,
            "is_published": self.is_published,
            "category": self.category.to_dict() if self.category else None,
            "author": {
                "id": self.author.id,
                "name": self.author.name,
            } if self.author else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tags": [t.to_dict() for t in self.tags],
        }
        if detailed:
            data["body"] = self.body
        return data
