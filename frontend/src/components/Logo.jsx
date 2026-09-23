export default function Logo({ variant = "full", className = "" }) {
  return (
    <span className={`logo logo-${variant} ${className}`}>
      <svg className="logo-icon" viewBox="-25 -25 240 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <path id="logoTopArc" d="M 12,95 A 78,78 0 0 1 168,95" fill="none" />
          <path id="logoBottomArc" d="M 190,95 A 100,100 0 0 1 -10,95" fill="none" />
        </defs>

          <text fontFamily="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="12" fontWeight="700" letterSpacing="2" className="logo-tag" stroke="currentColor" strokeWidth="0.6" paintOrder="stroke fill">
           <textPath href="#logoTopArc" startOffset="50%" textAnchor="middle">EDGE OF THE TRUTH</textPath>
          </text>
           <text fontFamily="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="12" fontWeight="700" letterSpacing="2" className="logo-tag" stroke="currentColor" strokeWidth="0.6" paintOrder="stroke fill">
            <textPath href="#logoBottomArc" startOffset="50%" textAnchor="middle">DEPTH OF THE NEWS</textPath>
          </text>

        <circle cx="90" cy="95" r="58" fill="none" stroke="currentColor" strokeWidth="6" />
        <ellipse cx="90" cy="95" rx="58" ry="18" fill="none" stroke="currentColor" strokeWidth="4" />
        <ellipse cx="90" cy="95" rx="24" ry="58" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M32 95 A58 30 0 0 0 148 95" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M32 95 A58 30 0 0 1 148 95" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M114 45 A70 32 -28 0 1 136 111" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 167 L78 153 L102 153 L112 167 Z" fill="currentColor" />
        <rect x="58" y="167" width="64" height="8" rx="2" fill="currentColor" />
      </svg>

      <span className="logo-wordmark">
        UNIVISTA<br />
        NEWS <span className="logo-accent">HUB</span>
      </span>
    </span>
  );
}