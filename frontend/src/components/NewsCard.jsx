import { Link } from "react-router-dom";
import { getThumbnailUrl, hasVideo } from "../utils/youtube";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsCard({ article }) {
  return (
    <div className="news-card">
      {getThumbnailUrl(article) && (
        <div className="thumb-wrap">
          <img src={getThumbnailUrl(article)} alt={article.title} />
          {hasVideo(article) && <span className="play-badge small" />}
        </div>
      )}
      <h4><Link to={`/article/${article.slug}`}>{article.title}</Link></h4>
      <div className="byline">
        By {article.author?.name || "Univista News"} · {formatDate(article.created_at)}
      </div>
    </div>
  );
}