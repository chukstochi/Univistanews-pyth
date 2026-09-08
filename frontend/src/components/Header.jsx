import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/news/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <header>
      <div className="utility-bar">
        <div className="container">
          <span>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          <span>Trusted news, every hour of the day</span>
        </div>
      </div>

      <div className="masthead">
        <div className="container">
          <NavLink to="/" className="brand">Univista<span>News</span></NavLink>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search news…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid var(--rule)", width: 220, fontSize: 14 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: "9px 16px" }}>Search</button>
          </form>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container">
          <ul>
            <li><NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink></li>
            <li><NavLink to="/services" className={({ isActive }) => (isActive ? "active" : "")}>Services</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About Us</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>Contact Us</NavLink></li>
            <li className="nav-right">
              {isAuthenticated ? (
                <>
                  <NavLink to={isAdmin ? "/admin" : "/author"} className={({ isActive }) => (isActive ? "active" : "")}>
                    {isAdmin ? "Admin Dashboard" : `Hi, ${user?.name?.split(" ")[0]}`}
                  </NavLink>
                </>
              ) : (
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>Login</NavLink>
              )}
            </li>
            {isAuthenticated && (
              <li><button onClick={logout}>Logout</button></li>
            )}
          </ul>
        </div>
      </nav>

      <div className="category-strip">
        <div className="container">
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <NavLink to={`/category/${c.slug}`} className={({ isActive }) => (isActive ? "active" : "")}>
                  {c.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
