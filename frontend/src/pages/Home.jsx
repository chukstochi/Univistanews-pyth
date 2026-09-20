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
               {/* Latest news — featured story + 3 below it on the left, headline list on the right */}
        <h2 className="section-title">Latest News</h2>
        {latest.length > 0 && (
          <div className="latest-layout">
            <div className="latest-main">
              <article className="latest-featured">
                {latest[0].image_url && <img src={latest[0].image_url} alt={latest[0].title} />}
                <div className="latest-body">
                  <h3><Link to={`/article/${latest[0].slug}`}>{latest[0].title}</Link></h3>
                  <div className="byline">
                    By {latest[0].author?.name || "Univista News"} · {formatDateTime(latest[0].created_at)}
                  </div>
                  <p>{latest[0].summary}</p>
                </div>
              </article>

              <div className="latest-trio">
                {latest.slice(1, 4).map((article) => (
                  <article className="trio-card" key={article.id}>
                    {article.image_url && <img src={article.image_url} alt={article.title} />}
                    <div className="latest-body">
                      <h4><Link to={`/article/${article.slug}`}>{article.title}</Link></h4>
                      <div className="byline">{formatDateTime(article.created_at)}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="latest-sidebar">
              {latest.slice(4, 10).map((article) => (
                <Link to={`/article/${article.slug}`} className="sidebar-item" key={article.id}>
                  <div className="sidebar-text">
                    <h4>{article.title}</h4>
                    <span className="byline">{formatDateTime(article.created_at)}</span>
                  </div>
                  {article.image_url && (
                    <img src={article.image_url} alt={article.title} className="sidebar-thumb" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

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