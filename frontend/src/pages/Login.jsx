import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/author");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout showTicker={false}>
      <div className="auth-page">
        <h1>Staff Login</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: -8, marginBottom: 20 }}>
          For Univista News admin and authors only.
        </p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="btn" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
