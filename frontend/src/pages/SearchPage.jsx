import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import NewsCard from "../components/NewsCard";
import client from "../api/client";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    client
      .get(`/news?q=${encodeURIComponent(q)}&per_page=20`)
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <Layout>
      <div className="container">
        <h2 className="section-title">
          {q ? `Search results for "${q}"` : "Search Univista News"}
        </h2>
        {loading && <div className="loading">Searching…</div>}
        {!loading && q && items.length === 0 && (
          <p className="empty-state">No articles matched your search.</p>
        )}
        <div className="cat-grid">
          {items.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
