import { Routes, Route, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import AdminNews from "./admin/AdminNews";
import AdminNewsForm from "./admin/AdminNewsForm";
import AdminAuthors from "./admin/AdminAuthors";
import AdminCategories from "./admin/AdminCategories";
import AdminTags from "./admin/AdminTags";

function AdminOverview() {
  return (
    <div>
      <h1>Welcome, Admin</h1>
      <p style={{ color: "var(--ink-soft)", maxWidth: 560 }}>
        From here you can manage every part of Univista News: publish and edit
        news, control categories and tags, and add or remove authors. Authors
        can post and edit their own articles but cannot delete them — only
        you can.
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  return (
    <>
      <Header />
      <div className="dashboard">
        <aside className="dash-sidebar">
          <NavLink to="/admin" end>Overview</NavLink>
          <NavLink to="/admin/news">News</NavLink>
          <NavLink to="/admin/authors">Authors</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/tags">Tags</NavLink>
          <button onClick={logout}>Logout ({user?.name})</button>
        </aside>
        <div className="dash-main">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/new" element={<AdminNewsForm editing={false} />} />
            <Route path="news/edit/:id" element={<AdminNewsForm editing={true} />} />
            <Route path="authors" element={<AdminAuthors />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="tags" element={<AdminTags />} />
          </Routes>
        </div>
      </div>
      <Footer />
    </>
  );
}
