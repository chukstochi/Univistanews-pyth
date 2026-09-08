import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="brand">Univista<span>News</span></div>
        <div className="footer-grid">
          <p style={{ color: "#aebdd0", maxWidth: 360 }}>
            Univista News delivers accurate, timely reporting across Nigeria, the US,
            and the world — politics, sports, technology, entertainment, business and health.
          </p>
          <div>
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <div>
            <Link to="/category/politics">Politics</Link>
            <Link to="/category/sports">Sports</Link>
            <Link to="/category/technology">Technology</Link>
            <Link to="/login">Staff Login</Link>
          </div>
        </div>
        <p style={{ marginTop: 30, color: "#7e8ea3" }}>
          © {new Date().getFullYear()} Univista News. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
