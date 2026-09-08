import { useEffect, useState } from "react";
import client from "../../api/client";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  function load() {
    setLoading(true);
    client.get("/news/categories").then((res) => setCategories(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "" });
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
        await client.put(`/admin/categories/${editing.id}`, form);
        setSuccess("Category updated.");
      } else {
        await client.post("/admin/categories", form);
        setSuccess("Category added.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await client.delete(`/admin/categories/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete category.");
    }
  }

  return (
    <div>
      <h1>Categories</h1>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {!showForm && (
        <p style={{ marginBottom: 20 }}>
          <button className="btn" onClick={openAdd}>+ Add Category</button>
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 460, marginBottom: 30, background: "#fff", padding: 24, border: "1px solid var(--rule)" }}>
          <h3 style={{ marginTop: 0 }}>{editing ? `Edit ${editing.name}` : "New Category"}</h3>
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button type="submit" className="btn">{editing ? "Save Changes" : "Create Category"}</button>
          <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading && <div className="loading">Loading…</div>}
      {!loading && categories.length === 0 && <p className="empty-state">No categories yet.</p>}
      {categories.length > 0 && (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.description}</td>
                <td>
                  <a href="#" className="action-link edit" onClick={(e) => { e.preventDefault(); openEdit(c); }}>Edit</a>
                  <a href="#" className="action-link delete" onClick={(e) => { e.preventDefault(); handleDelete(c.id, c.name); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
