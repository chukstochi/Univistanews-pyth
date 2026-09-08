# Univista News

A full-stack news website: React frontend, Python/Flask backend, MySQL database.

## What's included

- **Public site**: masthead, nav (Home / Services / About Us / Contact Us / Login),
  category strip (NG News, US News, Politics, Sports, Technology, Entertainment,
  Business, Health) with active-tab highlighting, a right-to-left sliding
  "News Flash" ticker (titles only), a two-up "Latest News" hero (left:
  image-top / right: image-right), and one section per category on the homepage.
- **Search** across all published articles.
- **Article pages** showing author name, date and time.
- **Author accounts**: can add and edit their own news, but cannot delete it.
- **Admin account**: full control — add/edit/delete authors, news, categories, tags.
  Only the admin can access `/admin/*`; only logged-in staff can access `/author/*`.
- Content updates (new/edited articles) appear on the site immediately because
  the homepage and category pages always fetch fresh data from the API.

## 1. Set up MySQL

Create the database (the app will create the tables for you via migrations):

```sql
CREATE DATABASE univista_news CHARACTER SET utf8mb4;
```

(A reference copy of the resulting schema is in `backend/schema_reference.sql`
if you ever want to inspect it — you don't need to run it by hand.)

## 2. Backend setup (Python/Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env: set your real MySQL password, and generate random values for
# SECRET_KEY and JWT_SECRET_KEY (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`)

# Create and apply the database tables
flask db init
flask db migrate -m "initial schema"
flask db upgrade

# Create the strict admin account + default categories (ONE TIME ONLY)
python seed_admin.py

# Run the API
python run.py
```

The API now runs at `http://localhost:5000`.

**Important:** after running `seed_admin.py`, log in as admin and consider
changing the password from a future "change password" feature, or directly
in the database — the credentials were shared in plain text during setup and
should be treated as no longer fully secret. Then blank out
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in your `.env` file so the seed
script can't be re-run accidentally.

## 3. Frontend setup (React)

```bash
cd frontend
npm install
npm run dev
```

The site runs at `http://localhost:5173` and proxies `/api/*` requests to
the Flask backend at `http://localhost:5000` (see `vite.config.js`).

## 4. Logging in

Go to `/login` and sign in with the admin account you seeded. From the
admin dashboard (`/admin`) you can:

- **Authors** → add new author accounts (they log in at the same `/login` page)
- **News** → add/edit/delete any article
- **Categories** → add/edit/delete categories
- **Tags** → add/edit/delete tags

Authors log in at `/login` too and land on `/author`, where they can write
and edit their own articles but have no delete option — matching the access
rules you asked for.

## 5. Adding real images

Articles take an **image URL** (upload your images somewhere — e.g. a cloud
storage bucket, Cloudinary, or your own server — and paste the link into the
"Image URL" field when adding/editing news). This keeps the project simple;
if you'd like actual file uploads handled by the backend instead, that's a
reasonable next step to add.

## Project structure

```
univista-news/
  backend/
    app/
      models/        User, Category, Tag, News
      routes/        auth, public news, author, admin
      utils/         decorators (role checks), slugify
      config.py, extensions.py, __init__.py (app factory)
    run.py
    seed_admin.py
    requirements.txt
    schema_reference.sql
  frontend/
    src/
      components/    Header, Footer, NewsTicker, NewsCard, Layout, ProtectedRoute
      pages/          Home, CategoryPage, ArticlePage, SearchPage, Services,
                       About, Contact, Login, AuthorDashboard, AdminDashboard
      pages/admin/    AdminNews, AdminNewsForm, AdminAuthors, AdminCategories, AdminTags
      context/        AuthContext (login state, JWT storage)
      api/            axios client
    index.html, vite.config.js, package.json
```

## Notes on security

- Passwords are hashed (never stored in plain text) using Werkzeug's
  `generate_password_hash`.
- Authentication uses JWTs; role checks (`admin` vs `author`) are enforced
  **server-side** on every protected route, not just hidden in the UI.
- There is no public registration endpoint — only the admin can create
  author accounts.
- CORS is currently open (`origins: "*"`) for local development. Before
  deploying to production, restrict it to your real domain in
  `backend/app/__init__.py`.
