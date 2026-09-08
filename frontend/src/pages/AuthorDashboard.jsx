import { useEffect, useState } from "react";
import { Routes, Route, NavLink, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

function AuthorArticleList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/author/news/mine").then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>My Articles</h1>
      <p style={{ marginBottom: 20 }}>
        <NavLink to="/author/new" className="btn">+ Write New Article</NavLink>
      </p>
      {loading && <div className="loading">Loading…</div>}
      {!loading && items.length === 0 && <p className="empty-state">You haven't published anything yet.</p>}
      {items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.category?.name}</td>
                <td>{a.is_published ? "Published" : "Draft"}</td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td>
                  <NavLink to={`/author/edit/${a.id}`} className="action-link edit">Edit</NavLink>
                  {/* No delete link: authors cannot delete news, per site policy */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ArticleForm({ editing }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({
    title: "", summary: "", body: "", image_url: "",
    category_id: "", tag_ids: [], is_breaking: false, is_published: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(!!editing);

  useEffect(() => {
    client.get("/news/categories").then((res) => setCategories(res.data));
    client.get("/news/tags").then((res) => setTags(res.data));
  }, []);

  useEffect(() => {
    if (editing && id) {
      client.get("/author/news/mine").then((res) => {
        const article = res.data.find((a) => String(a.id) === id);
        if (article) {
          setForm({
            title: article.title,
            summary: article.summary || "",
            body: article.body,
            image_url: article.image_url || "",
            category_id: article.category?.id || "",
            tag_ids: article.tags.map((t) => t.id),
            is_breaking: article.is_breaking,
            is_published: article.is_published,
          });
        }
        setLoading(false);
      });
    }
  }, [editing, id]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleTag(tagId) {
    setForm((f) => ({
      ...f,
      tag_ids: f.tag_ids.includes(tagId) ? f.tag_ids.filter((t) => t !== tagId) : [...f.tag_ids, tagId],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await client.put(`/author/news/${id}`, form);
        setSuccess("Article updated.");
      } else {
        await client.post("/author/news", form);
        setSuccess("Article published.");
        setTimeout(() => navigate("/author"), 800);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <h1>{editing ? "Edit Article" : "Write New Article"}</h1>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="form-field">
          <label>Title</label>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div className="form-field">
          <label>Summary</label>
          <input value={form.summary} onChange={(e) => update("summary", e.target.value)} maxLength={500} />
        </div>
        <div className="form-field">
          <label>Image URL</label>
          <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://…" />
        </div>
        <div className="form-field">
          <label>Category</label>
          <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Tags</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((t) => (
              <label key={t.id} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={form.tag_ids.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Body</label>
          <textarea value={form.body} onChange={(e) => update("body", e.target.value)} required />
        </div>
        <div className="form-field">
          <label><input type="checkbox" checked={form.is_breaking} onChange={(e) => update("is_breaking", e.target.checked)} /> Mark as Breaking News (shows in ticker)</label>
        </div>
        <div className="form-field">
          <label><input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)} /> Published (visible to readers)</label>
        </div>
        <button type="submit" className="btn">{editing ? "Save Changes" : "Publish Article"}</button>
      </form>
    </div>
  );
}

export default function AuthorDashboard() {
  const { logout, user } = useAuth();
  return (
    <>
      <Header />
      <div className="dashboard">
        <aside className="dash-sidebar">
          <NavLink to="/author" end>My Articles</NavLink>
          <NavLink to="/author/new">Write New Article</NavLink>
          <button onClick={logout}>Logout ({user?.name})</button>
        </aside>
        <div className="dash-main">
          <Routes>
            <Route index element={<AuthorArticleList />} />
            <Route path="new" element={<ArticleForm editing={false} />} />
            <Route path="edit/:id" element={<ArticleForm editing={true} />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </>
  );
}
