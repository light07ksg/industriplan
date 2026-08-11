/**
 * Line-art floor plan built from the same visual vocabulary as the editor itself (thick wall
 * lines, a door swing arc, a window break, a dimension line) — so the login screen's hero reads
 * as "this is what the product draws," not generic stock art.
 */
export function BlueprintHero() {
  return (
    <svg viewBox="0 0 640 480" className="h-auto w-full max-w-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hero-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#7dd3fc" fillOpacity="0.16" />
        </pattern>
        <linearGradient id="hero-accent-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#67e8f9" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="640" height="480" fill="url(#hero-dots)" />

      {/* Outer walls */}
      <rect x="80" y="60" width="480" height="320" stroke="#e2e8f0" strokeWidth="7" strokeLinejoin="round" />

      {/* Partition wall with a door gap */}
      <line x1="340" y1="60" x2="340" y2="252" stroke="#e2e8f0" strokeWidth="7" />
      <line x1="340" y1="316" x2="340" y2="380" stroke="#e2e8f0" strokeWidth="7" />
      {/* Door leaf + swing arc */}
      <line x1="340" y1="316" x2="405" y2="316" stroke="#67e8f9" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M340,252 A64,64 0 0 1 405,316" stroke="#67e8f9" strokeWidth="1.6" strokeDasharray="4 4" />

      {/* Window break on the top wall */}
      <line x1="145" y1="60" x2="235" y2="60" stroke="#0f172a" strokeWidth="9" />
      <line x1="145" y1="60" x2="235" y2="60" stroke="#e2e8f0" strokeWidth="2.5" />
      <line x1="145" y1="52" x2="235" y2="52" stroke="#e2e8f0" strokeWidth="2.5" />
      <line x1="145" y1="68" x2="235" y2="68" stroke="#e2e8f0" strokeWidth="2.5" />

      {/* Furniture-ish rects to sell "this is a real plan" */}
      <rect x="118" y="256" width="90" height="130" rx="4" stroke="#94a3b8" strokeWidth="2" />
      <rect x="118" y="256" width="90" height="34" rx="3" stroke="#94a3b8" strokeWidth="1.4" />
      <rect x="392" y="96" width="112" height="56" rx="4" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="500" cy="330" r="16" stroke="#94a3b8" strokeWidth="2" />

      {/* Column */}
      <circle cx="120" cy="96" r="10" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />

      {/* Dimension line */}
      <line x1="80" y1="410" x2="80" y2="392" stroke="#67e8f9" strokeWidth="1.4" />
      <line x1="560" y1="410" x2="560" y2="392" stroke="#67e8f9" strokeWidth="1.4" />
      <line x1="80" y1="404" x2="560" y2="404" stroke="url(#hero-accent-line)" strokeWidth="1.6" />
      <path d="M80,404 l10,-4 M80,404 l10,4" stroke="#67e8f9" strokeWidth="1.6" />
      <path d="M560,404 l-10,-4 M560,404 l-10,4" stroke="#67e8f9" strokeWidth="1.6" />
      <rect x="278" y="412" width="64" height="20" rx="3" fill="#0f172a" />
      <text x="310" y="426" textAnchor="middle" fontSize="12" fill="#cbd5e1" fontFamily="ui-monospace, monospace">
        12.00 m
      </text>
    </svg>
  )
}
