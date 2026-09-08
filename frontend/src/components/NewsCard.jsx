import { Link } from "react-router-dom";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsCard({ article }) {
  return (
    <div className="news-card">
      {article.image_url && <img src={article.image_url} alt={article.title} />}
      <h4><Link to={`/article/${article.slug}`}>{article.title}</Link></h4>
      <div className="byline">
        By {article.author?.name || "Univista News"} · {formatDate(article.created_at)}
      </div>
    </div>
  );
}
