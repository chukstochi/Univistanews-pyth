import { useEffect, useState } from "react";
import client from "../../api/client";
import PasswordField from "../../components/PasswordField";

export default function AdminAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "" });

  function load() {
    setLoading(true);
    client.get("/admin/authors").then((res) => setAuthors(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAddForm() {
    setEditingAuthor(null);
    setForm({ name: "", email: "", password: "", bio: "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEditForm(author) {
    setEditingAuthor(author);
    setForm({ name: author.name, email: author.email, password: "", bio: author.bio || "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingAuthor) {
        const payload = { name: form.name, bio: form.bio };
        if (form.password) payload.password = form.password;
        await client.put(`/admin/authors/${editingAuthor.id}`, payload);
        setSuccess("Author updated.");
      } else {
        await client.post("/admin/authors", form);
        setSuccess("Author added.");
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete author "${name}"? Their articles will remain but should be reassigned first if needed.`)) return;
    try {
      await client.delete(`/admin/authors/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete author.");
    }
  }

  return (
    <div>
      <h1>Authors</h1>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {!showForm && (
        <p style={{ marginBottom: 20 }}>
          <button className="btn" onClick={openAddForm}>+ Add Author</button>
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 460, marginBottom: 30, background: "#fff", padding: 24, border: "1px solid var(--rule)" }}>
          <h3 style={{ marginTop: 0 }}>{editingAuthor ? `Edit ${editingAuthor.name}` : "New Author"}</h3>
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              disabled={!!editingAuthor}
            />
          </div>
          <PasswordField
            id="author-password"
            label={editingAuthor ? "New Password (leave blank to keep current)" : "Password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
            required={!editingAuthor}
            minLength={8}
          />
          <div className="form-field">
            <label>Bio</label>
            <input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn">{editingAuthor ? "Save Changes" : "Create Author"}</button>
          <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading && <div className="loading">Loading…</div>}
      {!loading && authors.length === 0 && <p className="empty-state">No authors yet.</p>}
      {authors.length > 0 && (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {authors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <a href="#" className="action-link edit" onClick={(e) => { e.preventDefault(); openEditForm(a); }}>Edit</a>
                  <a href="#" className="action-link delete" onClick={(e) => { e.preventDefault(); handleDelete(a.id, a.name); }}>Delete</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
