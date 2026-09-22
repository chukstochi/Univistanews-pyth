import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem("univista_login_email") || "");
  const [password, setPassword] = useState(""); // never persisted, always starts blank
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("univista_login_email", email);
  }, [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setExpired(false);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.must_change_password) {
        navigate("/change-password");
      } else {
        navigate(user.role === "admin" ? "/admin" : "/author");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
      setExpired(!!err.response?.data?.expired_temp_password);
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
        <p style={{ marginTop: 16, fontSize: 14 }}>
          {expired ? (
            <Link to="/forgot-password"><strong>Reset your password →</strong></Link>
          ) : (
            <Link to="/forgot-password">Forgot password?</Link>
          )}
        </p>
      </div>
    </Layout>
  );
}