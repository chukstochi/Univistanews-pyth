from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db


class User(db.Model):
    """
    A single table for both admins and authors, distinguished by `role`.
    role: 'admin' or 'author'
    Only ONE admin is expected to exist (the strict admin account), but the
    schema allows more than one in case Univista News wants to add a second
    admin later.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="author")  # 'admin' | 'author'
    bio = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    news_items = db.relationship("News", back_populates="author", lazy="dynamic")

    def set_password(self, raw_password: str):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"

    def to_dict(self, include_email=False):
        data = {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "bio": self.bio,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_email:
            data["email"] = self.email
        return data
