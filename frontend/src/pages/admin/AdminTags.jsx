import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  function load() {
    setLoading(true);
    client.get("/news/tags").then((res) => setTags(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setEditing(null);
    setName("");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(tag) {
    setEditing(tag);
    setName(tag.name);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editing) {
        await client.put(`/admin/tags/${editing.id}`, { name });
        setSuccess("Tag updated.");
      } else {
        await client.post("/admin/tags", { name });
        setSuccess("Tag added.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  async function handleDelete(id, tagName) {
    if (!window.confirm(`Delete tag "${tagName}"?`)) return;
    try {
      await client.delete(`/admin/tags/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete tag.");
    }
  }

  return (
    <div>
      <h1>Tags</h1>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {!showForm && (
        <p style={{ marginBottom: 20 }}>
          <button className="btn" onClick={openAdd}>+ Add Tag</button>
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginBottom: 30, background: "#fff", padding: 24, border: "1px solid var(--rule)" }}>
          <h3 style={{ marginTop: 0 }}>{editing ? `Edit ${editing.name}` : "New Tag"}</h3>
          <div className="form-field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button type="submit" className="btn">{editing ? "Save Changes" : "Create Tag"}</button>
          <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading && <div className="loading">Loading…</div>}
      {!loading && tags.length === 0 && <p className="empty-state">No tags yet.</p>}
      {tags.length > 0 && (
        <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
          <tbody>
            {tags.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.slug}</td>
                <td>
                  <a href="#" className="action-link edit" onClick={(e) => { e.preventDefault(); openEdit(t); }}>Edit</a>
                  <a href="#" className="action-link delete" onClick={(e) => { e.preventDefault(); handleDelete(t.id, t.name); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
