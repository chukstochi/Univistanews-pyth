import { useState, useEffect } from "react";
import client from "../../api/client";
import PasswordField from "../../components/PasswordField";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useAuth } from "../../context/AuthContext";

export default function AdminAuthors() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [draft, setDraft, clearDraft] = usePersistedForm("draft:staff-form", { name: "", email: "", bio: "", role: "author" });
  const [password, setPassword] = useState("");

  function load() {
    setLoading(true);
    client.get("/admin/authors").then((res) => setStaff(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openAddForm() {
    setEditingUser(null);
    setDraft({ name: "", email: "", bio: "", role: "author" });
    setPassword("");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function openEditForm(person) {
    setEditingUser(person);
    setDraft({ name: person.name, email: person.email, bio: person.bio || "", role: person.role });
    setPassword("");
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingUser) {
        const payload = { name: draft.name, bio: draft.bio, role: draft.role };
        if (password) payload.password = password;
        await client.put(`/admin/authors/${editingUser.id}`, payload);
        setSuccess("Updated.");
      } else {
        await client.post("/admin/authors", { name: draft.name, email: draft.email, bio: draft.bio, role: draft.role });
        setSuccess("Team member added. A welcome email with their login details has been sent.");
      }
      clearDraft();
      setPassword("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? Their articles will remain but should be reassigned first if needed.`)) return;
    try {
      await client.delete(`/admin/authors/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete this user.");
    }
  }

  return (
    <div>
      <h1>Team</h1>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {!showForm && (
        <p style={{ marginBottom: 20 }}>
          <button className="btn" onClick={openAddForm}>+ Add Team Member</button>
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 460, marginBottom: 30, background: "#fff", padding: 24, border: "1px solid var(--rule)" }}>
          <h3 style={{ marginTop: 0 }}>{editingUser ? `Edit ${editingUser.name}` : "New Team Member"}</h3>
          <div className="form-field">
            <label>Name</label>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              required
              disabled={!!editingUser}
            />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              disabled={editingUser && editingUser.id === currentUser?.id}
            >
              <option value="author">Author</option>
              <option value="admin">Admin</option>
            </select>
            {editingUser && editingUser.id === currentUser?.id && (
              <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                You can't change your own role.
              </p>
            )}
          </div>

          {!editingUser && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: -6, marginBottom: 16 }}>
              A temporary password will be generated automatically and emailed to this
              person, along with instructions to set their own password within 24 hours.
            </p>
          )}

          {editingUser && (
            <PasswordField
              id="staff-password"
              label="New Password (leave blank to keep current)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          )}

          <div className="form-field">
            <label>Bio</label>
            <input value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn">{editingUser ? "Save Changes" : "Create"}</button>
          <button type="button" className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => { setShowForm(false); clearDraft(); setPassword(""); }}>Cancel</button>
        </form>
      )}

      {loading && <div className="loading">Loading…</div>}
      {!loading && staff.length === 0 && <p className="empty-state">No team members yet.</p>}
      {staff.length > 0 && (
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.name}{s.id === currentUser?.id ? " (you)" : ""}</td>
                <td>{s.email}</td>
                <td><span className={`badge ${s.role}`}>{s.role}</span></td>
                <td>{s.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <a href="#" className="action-link edit" onClick={(e) => { e.preventDefault(); openEditForm(s); }}>Edit</a>
                  {s.id !== currentUser?.id && (
                    <a href="#" className="action-link delete" onClick={(e) => { e.preventDefault(); handleDelete(s.id, s.name); }}>Delete</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}