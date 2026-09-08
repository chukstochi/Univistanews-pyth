import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import client from "../../api/client";

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    client.get("/admin/news").then((res) => setItems(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/admin/news/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete article.");
    }
  }

  return (
    <div>
      <h1>All News</h1>
      {error && <p className="error-msg">{error}</p>}
      <p style={{ marginBottom: 20 }}>
        <NavLink to="/admin/news/new" className="btn">+ Add News</NavLink>
      </p>
      {loading && <div className="loading">Loading…</div>}
      {!loading && items.length === 0 && <p className="empty-state">No articles yet.</p>}
      {items.length > 0 && (
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Author</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.category?.name}</td>
                <td>{a.author?.name}</td>
                <td>{a.is_published ? "Published" : "Draft"}{a.is_breaking ? " · Breaking" : ""}</td>
                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                <td>
                  <NavLink to={`/admin/news/edit/${a.id}`} className="action-link edit">Edit</NavLink>
                  <a href="#" className="action-link delete" onClick={(e) => { e.preventDefault(); handleDelete(a.id, a.title); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
