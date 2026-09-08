import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function NewsTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    client.get("/news/breaking").then((res) => setItems(res.data)).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // Duplicate the list so the CSS animation (-50%) loops seamlessly
  const looped = [...items, ...items];

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">News Flash</div>
      <div className="ticker-track-outer">
        <div className="ticker-track">
          {looped.map((item, i) => (
            <span key={`${item.id}-${i}`}>
              <Link to={`/article/${item.slug}`}>{item.title}</Link>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
