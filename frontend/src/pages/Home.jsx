import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import NewsCard from "../components/NewsCard";
import client from "../api/client";
import { getThumbnailUrl, hasVideo } from "../utils/youtube";
import AdSlot from "../components/AdSlot";

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
      client.get("/news/by-category-preview?limit=5"),
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
        <h2 className="section-title">Latest News</h2>
        {latest.length > 0 && (
          <div className="latest-layout">
            <div className="latest-main">
              <article className="latest-featured">
                {getThumbnailUrl(latest[0]) && (
                  <div className="thumb-wrap">
                    <img src={getThumbnailUrl(latest[0])} alt={latest[0].title} />
                    {hasVideo(latest[0]) && <span className="play-badge" />}
                  </div>
                )}
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
                    {getThumbnailUrl(article) && (
                      <div className="thumb-wrap">
                        <img src={getThumbnailUrl(article)} alt={article.title} />
                        {hasVideo(article) && <span className="play-badge small" />}
                      </div>
                    )}
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
                  {getThumbnailUrl(article) && (
                    <div className="thumb-wrap">
                      <img src={getThumbnailUrl(article)} alt={article.title} className="sidebar-thumb" />
                      {hasVideo(article) && <span className="play-badge small" />}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* <AdSlot size="banner" /> */}

        {latest.length === 0 && (
          <p className="empty-state">No articles published yet. Check back soon.</p>
        )}

        {categoryPreviews.map(({ category, items }, index) => (
          <div key={category.id}>
            <section>
              <div className="cat-section-head">
                <h2>{category.name}</h2>
                <Link to={`/category/${category.slug}`}>See all →</Link>
              </div>
              {items.length > 0 ? (
                <>
                  <article className="cat-featured">
                    <Link to={`/article/${items[0].slug}`} className="cat-featured-media">
                      {getThumbnailUrl(items[0]) && (
                        <div className="thumb-wrap">
                          <img src={getThumbnailUrl(items[0])} alt={items[0].title} />
                          {hasVideo(items[0]) && <span className="play-badge" />}
                        </div>
                      )}
                    </Link>
                    <div className="cat-featured-body">
                      <h3><Link to={`/article/${items[0].slug}`}>{items[0].title}</Link></h3>
                      <p>{items[0].summary}</p>
                    </div>
                  </article>

                  {items.length > 1 && (
                    <div className="cat-grid">
                      {items.slice(1, 5).map((article) => (
                        <NewsCard key={article.id} article={article} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="empty-state" style={{ padding: "10px 0" }}>No {category.name} articles yet.</p>
              )}
            </section>
            {index % 2 === 1 && <AdSlot size="rectangle" />}
          </div>
        ))}
      </div>
    </Layout>
  );
}