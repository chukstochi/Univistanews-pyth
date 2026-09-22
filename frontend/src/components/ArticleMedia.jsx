import { getYouTubeEmbedUrl, getThumbnailUrl, hasVideo } from "../utils/youtube";

const SIZES = {
  featured: { height: 340 },
  trio: { height: 120 },
  card: { height: 130 },
  sidebar: { width: 72, height: 56 },
};

export default function ArticleMedia({ article, variant }) {
  const size = SIZES[variant] || {};
  const style = {
    width: size.width ? size.width : "100%",
    height: size.height,
    flexShrink: size.width ? 0 : undefined,
    background: "#d8d6d0",
    border: 0,
    display: "block",
    objectFit: "cover",
  };

  if (hasVideo(article)) {
    return (
      <iframe
        style={style}
        src={getYouTubeEmbedUrl(article.video_url)}
        title={article.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const thumb = getThumbnailUrl(article);
  if (!thumb) return null;

  return <img style={style} src={thumb} alt={article.title} />;
}