const SIZES = {
  leaderboard: { width: 728, height: 90, label: "728 × 90 Leaderboard" },
  rectangle: { width: 300, height: 250, label: "300 × 250 Rectangle" },
  banner: { width: "100%", height: 100, label: "Responsive Banner" },
  inArticle: { width: "100%", height: 250, label: "In-Article Ad" },
};

/**
 * Placeholder ad slot for local development/testing layout.
 * Once live and approved for AdSense, replace the placeholder <div> below
 * with the real <ins class="adsbygoogle" ...> snippet Google gives you,
 * keeping the same wrapping <div className="ad-slot"> for consistent spacing.
 */
export default function AdSlot({ size = "rectangle" }) {
  const { width, height, label } = SIZES[size] || SIZES.rectangle;

  return (
    <div className="ad-slot" style={{ maxWidth: width === "100%" ? "100%" : width }}>
      <div className="ad-slot-inner" style={{ height }}>
        <span>Advertisement</span>
        <span className="ad-slot-size">{label}</span>
      </div>
    </div>
  );
}