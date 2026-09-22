import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import client from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await client.post("/auth/forgot-password", { email });
    } finally {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <Layout showTicker={false}>
      <div className="auth-page">
        <h1>Reset Password</h1>
        {sent ? (
          <>
            <p className="success-msg">
              If that email exists in our system, a reset link has been sent. Check your inbox.
            </p>
            <p style={{ fontSize: 14 }}><Link to="/login">← Back to login</Link></p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}