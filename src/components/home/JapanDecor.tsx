/** Reusable Japanese decorative SVGs for hero sections */

export function FujiSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sky gradient */}
      <defs>
        <linearGradient id="fuji-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a12" />
          <stop offset="100%" stopColor="#1a0a0a" />
        </linearGradient>
        <linearGradient id="fuji-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0e8d8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f0e8d8" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="fuji-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2020" />
          <stop offset="100%" stopColor="#2a1010" />
        </linearGradient>
      </defs>

      {/* Mountain body */}
      <polygon points="200,20 320,180 80,180" fill="url(#fuji-body)" />
      {/* Snow cap */}
      <polygon points="200,20 248,90 152,90" fill="url(#fuji-snow)" />
      {/* Snow detail lines */}
      <line x1="200" y1="20" x2="230" y2="78" stroke="#f0e8d8" strokeWidth="0.5" strokeOpacity="0.3" />
      <line x1="200" y1="20" x2="172" y2="82" stroke="#f0e8d8" strokeWidth="0.5" strokeOpacity="0.3" />
      {/* Base ground */}
      <rect x="0" y="178" width="400" height="42" fill="#1a0808" />
      {/* Subtle mist line */}
      <line x1="60" y1="155" x2="340" y2="155" stroke="#f0e8d8" strokeWidth="0.5" strokeOpacity="0.08" />
    </svg>
  )
}

export function BlossomSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Five petals */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx="60"
          cy="60"
          rx="18"
          ry="30"
          fill="#C45570"
          fillOpacity="0.7"
          transform={`rotate(${deg} 60 60) translate(0 -18)`}
        />
      ))}
      {/* Center */}
      <circle cx="60" cy="60" r="8" fill="#f0e8d8" fillOpacity="0.9" />
      <circle cx="60" cy="60" r="3" fill="#C45570" />
    </svg>
  )
}

export function ToriiSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Top rail (curved) */}
      <path d="M10,55 Q80,30 150,55" stroke="#CC0000" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Second rail */}
      <line x1="24" y1="80" x2="136" y2="80" stroke="#CC0000" strokeWidth="7" strokeLinecap="round" />
      {/* Left post */}
      <line x1="38" y1="68" x2="38" y2="200" stroke="#CC0000" strokeWidth="9" strokeLinecap="round" />
      {/* Right post */}
      <line x1="122" y1="68" x2="122" y2="200" stroke="#CC0000" strokeWidth="9" strokeLinecap="round" />
      {/* Top extension caps */}
      <line x1="10" y1="55" x2="10" y2="38" stroke="#CC0000" strokeWidth="8" strokeLinecap="round" />
      <line x1="150" y1="55" x2="150" y2="38" stroke="#CC0000" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}
