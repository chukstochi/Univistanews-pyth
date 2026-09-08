"""
Run this ONCE after setting up the MySQL database and running migrations,
to create the strict admin account and default categories/tags.

    python seed_admin.py

Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from your .env file.
After running this, it's strongly recommended to log in as admin and
change the password from the dashboard, then blank out those two lines
in your .env file.
"""
import os
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category
from app.utils.slugify import slugify

DEFAULT_CATEGORIES = [
    "NG News", "US News", "Politics", "Sports",
    "Technology", "Entertainment", "Business", "Health",
]

app = create_app()

with app.app_context():
    email = os.getenv("SEED_ADMIN_EMAIL")
    password = os.getenv("SEED_ADMIN_PASSWORD")

    if not email or not password:
        raise SystemExit("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set in .env")

    existing = User.query.filter_by(email=email.strip().lower()).first()
    if existing:
        print(f"Admin already exists for {email}. Skipping admin creation.")
    else:
        admin = User(
            name="Univista News Admin",
            email=email.strip().lower(),
            role="admin",
        )
        admin.set_password(password)
        db.session.add(admin)
        print(f"Created strict admin account: {email}")

    for name in DEFAULT_CATEGORIES:
        if not Category.query.filter_by(name=name).first():
            db.session.add(Category(name=name, slug=slugify(name)))
            print(f"Created category: {name}")

    db.session.commit()
    print("Seeding complete.")
