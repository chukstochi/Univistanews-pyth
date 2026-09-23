import { Link } from "react-router-dom";
import Logo from "./Logo";

const SOCIAL_LINKS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/PHONE_NUMBER_HERE",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.5-.6-2.5-1.4-3.5-3-.3-.4 0-.4.2-.7.2-.2.4-.5.5-.7.2-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.6 2.5 4 3.4 2 .8 2.4.6 2.8.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/YOUR_HANDLE_HERE",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.9 2H22l-7.2 8.2L22.6 22h-6.9l-5.4-7-6.1 7H1l7.7-8.8L1.7 2h7l4.9 6.4L18.9 2zm-2.4 18h2L8.6 4h-2l9.9 16z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/YOUR_HANDLE_HERE",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.8 6.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/YOUR_PAGE_HERE",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V9c0-.9.3-1.5 1.7-1.5h1.5V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.2H7.3V14H10v8h3.5z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="brand"><Logo variant="full" /></div>
      {/* <div className="brand"><img src="/logo.jpg" alt="Univista News Hub" /></div> */}
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
            {/* <Link to="/login">Staff Login</Link> */}
          </div>
        </div>

        <div className="footer-social">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              title={s.name}
            >
              {s.icon}
            </a>
          ))}
        </div>

        <p style={{ marginTop: 30, color: "#7e8ea3" }}>
          © {new Date().getFullYear()} Univista News. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
