from app.extensions import db

news_tags = db.Table(
    "news_tags",
    db.Column("news_id", db.Integer, db.ForeignKey("news.id", ondelete="CASCADE"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True, nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "slug": self.slug}
