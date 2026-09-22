import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await client.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      updateUser({ must_change_password: false });
      navigate(user?.role === "admin" ? "/admin" : "/author");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout showTicker={false}>
      <div className="auth-page">
        <h1>Set a New Password</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: -8, marginBottom: 20 }}>
          {user?.must_change_password
            ? "For security, you need to set a new password before continuing."
            : "Update your password below."}
        </p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <PasswordField
            id="current_password"
            label="Current (temporary) Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <PasswordField
            id="new_password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <PasswordField
            id="confirm_password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Saving…" : "Save New Password"}
          </button>
        </form>
      </div>
    </Layout>
  );
}