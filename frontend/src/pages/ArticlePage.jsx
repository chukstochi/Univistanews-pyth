import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import client from "../api/client";
import { getYouTubeEmbedUrl, hasVideo } from "../utils/youtube";
import AdSlot from "../components/AdSlot";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    client
      .get(`/news/${slug}`)
      .then((res) => setArticle(res.data))
      .catch(() => setError("This article could not be found."))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Layout>
      <div className="article-page">
        {loading && <div className="loading">Loading article…</div>}
        {error && (
          <div>
            <p className="error-msg">{error}</p>
            <Link to="/" className="btn btn-secondary">Back to Home</Link>
          </div>
        )}

        {article && !loading && (
          <>
            <div className="article-category">
              <Link to={`/category/${article.category?.slug}`}>{article.category?.name}</Link>
            </div>
            <h1 className="article-title">{article.title}</h1>
            {article.summary && <p className="article-summary">{article.summary}</p>}

            <div className="article-meta">
              <span>By <strong>{article.author?.name || "Univista News"}</strong></span>
              <span>{formatDateTime(article.created_at)}</span>
              {article.updated_at && article.updated_at !== article.created_at && (
                <span>Updated {formatDateTime(article.updated_at)}</span>
              )}
            </div>

            {hasVideo(article) ? (
              <div className="article-video">
                <iframe
                  src={getYouTubeEmbedUrl(article.video_url)}
                  title={article.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              article.image_url && (
                <img className="article-image" src={article.image_url} alt={article.title} />
              )
            )}

            {/* <AdSlot size="inArticle" /> */}

            <div className="article-body">{article.body}</div>

            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map((t) => (
                  <span key={t.id} className="tag-chip">#{t.name}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}