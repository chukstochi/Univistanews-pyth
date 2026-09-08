import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";

export default function AdminNewsForm({ editing }) {
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
      client.get("/admin/news").then((res) => {
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
        await client.put(`/author/news/${id}`, form); // admins are authorized on this route too
        setSuccess("Article updated.");
      } else {
        await client.post("/author/news", form);
        setSuccess("Article published.");
        setTimeout(() => navigate("/admin/news"), 800);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <h1>{editing ? "Edit News" : "Add News"}</h1>
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
                <input type="checkbox" checked={form.tag_ids.includes(t.id)} onChange={() => toggleTag(t.id)} />
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
