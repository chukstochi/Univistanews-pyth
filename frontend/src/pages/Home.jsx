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
        {/* Latest news — two sections, left image-top / right image-right */}
        <h2 className="section-title">Latest News</h2>
        <div className="latest-grid">
          {latest[0] && (
            <article className="latest-card">
              {latest[0].image_url && <img src={latest[0].image_url} alt={latest[0].title} />}
              <div className="latest-body">
                <h3><Link to={`/article/${latest[0].slug}`}>{latest[0].title}</Link></h3>
                <div className="byline">
                  By {latest[0].author?.name || "Univista News"} · {formatDateTime(latest[0].created_at)}
                </div>
                <p>{latest[0].summary}</p>
              </div>
            </article>
          )}
          {latest[1] && (
            <article className="latest-card reverse">
              {latest[1].image_url && <img src={latest[1].image_url} alt={latest[1].title} />}
              <div className="latest-body">
                <h3><Link to={`/article/${latest[1].slug}`}>{latest[1].title}</Link></h3>
                <div className="byline">
                  By {latest[1].author?.name || "Univista News"} · {formatDateTime(latest[1].created_at)}
                </div>
                <p>{latest[1].summary}</p>
              </div>
            </article>
          )}
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
