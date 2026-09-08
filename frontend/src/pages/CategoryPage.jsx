import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import NewsCard from "../components/NewsCard";
import client from "../api/client";

export default function CategoryPage() {
  const { slug } = useParams();
  const [items, setItems] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
  }, [slug]);

  useEffect(() => {
    client
      .get(`/news?category=${slug}&page=${page}&per_page=9`)
      .then((res) => {
        setItems(res.data.items);
        setPages(res.data.pages || 1);
        if (res.data.items[0]) setCategoryName(res.data.items[0].category.name);
      })
      .finally(() => setLoading(false));
  }, [slug, page]);

  return (
    <Layout>
      <div className="container">
        <h2 className="section-title">{categoryName || slug.replace(/-/g, " ")}</h2>

        {loading && <div className="loading">Loading…</div>}

        {!loading && items.length === 0 && (
          <p className="empty-state">No articles in this category yet.</p>
        )}

        <div className="cat-grid">
          {items.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {pages > 1 && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "30px 0" }}>
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: 14 }}>Page {page} of {pages}</span>
            <button className="btn btn-outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
