export function extractYouTubeId(url) {
  if (!url) return null;
  const srcMatch = url.match(/src="([^"]+)"/);
  const cleanUrl = srcMatch ? srcMatch[1] : url;
  const match = cleanUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getThumbnailUrl(article) {
  return article.image_url || getYouTubeThumbnail(article.video_url) || null;
}

export function hasVideo(article) {
  return !!extractYouTubeId(article.video_url);
}