import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PasswordField from "../components/PasswordField";
import client from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await client.post("/auth/reset-password", { token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Layout showTicker={false}>
        <div className="auth-page">
          <p className="error-msg">This reset link is missing its token. Please use the link from your email.</p>
          <p style={{ fontSize: 14 }}><Link to="/forgot-password">Request a new link</Link></p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showTicker={false}>
      <div className="auth-page">
        <h1>Set a New Password</h1>
        {error && <p className="error-msg">{error}</p>}
        {success ? (
          <p className="success-msg">Password reset! Redirecting to login…</p>
        ) : (
          <form onSubmit={handleSubmit}>
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
              {loading ? "Saving…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}