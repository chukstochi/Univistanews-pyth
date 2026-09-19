import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import NewsCard from "../components/NewsCard";
import client from "../api/client";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [categoryPreviews, setCategoryPreviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get("/news/latest"),
      client.get("/news/by-category-preview?limit=4"),
    ])
      .then(([latestRes, catRes]) => {
        setLatest(latestRes.data);
        setCategoryPreviews(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container"><div className="loading">Loading the latest news…</div></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        {/* Latest news — up to 6 articles, alternating image-left / image-right layout */}
        <h2 className="section-title">Latest News</h2>
        <div className="latest-grid">
          {latest.slice(0, 6).map((article, idx) => (
            <article
              className={`latest-card${idx % 2 === 1 ? " reverse" : ""}`}
              key={article.id}
            >
              {article.image_url && <img src={article.image_url} alt={article.title} />}
              <div className="latest-body">
                <h3><Link to={`/article/${article.slug}`}>{article.title}</Link></h3>
                <div className="byline">
                  By {article.author?.name || "Univista News"} · {formatDateTime(article.created_at)}
                </div>
                <p>{article.summary}</p>
              </div>
            </article>
          ))}
        </div>

        {latest.length === 0 && (
          <p className="empty-state">No articles published yet. Check back soon.</p>
        )}

        {/* One section per category */}
        {categoryPreviews.map(({ category, items }) => (
          <section key={category.id}>
            <div className="cat-section-head">
              <h2>{category.name}</h2>
              <Link to={`/category/${category.slug}`}>See all →</Link>
            </div>
            {items.length > 0 ? (
              <div className="cat-grid">
                {items.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="empty-state" style={{ padding: "10px 0" }}>No {category.name} articles yet.</p>
            )}
          </section>
        ))}
      </div>
    </Layout>
  );
}