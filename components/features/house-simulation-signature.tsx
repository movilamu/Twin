/**
 * The page's signature visual: a cross-section of a home with a
 * water level that rises on load. This is the one visceral image
 * that embodies the product's core idea — not a generic dashboard
 * mockup, but a simulated consequence inside a specific house.
 */
export function HouseSimulationSignature(): JSX.Element {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto max-w-md mx-auto lg:mx-0"
      role="img"
      aria-label="Illustration of a house cross-section with a simulated rising flood line reaching the ground floor"
    >
      <defs>
        <clipPath id="houseClip">
          <path d="M60 340 V170 L240 60 L420 170 V340 Z" />
        </clipPath>
        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F86C6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4F86C6" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* roofline + walls */}
      <path
        d="M60 340 V170 L240 60 L420 170 V340 Z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* floor divider (upper floor / ground floor) */}
      <line x1="60" y1="255" x2="420" y2="255" stroke="#E2E8F0" strokeWidth="2" />

      {/* windows */}
      <rect x="150" y="190" width="42" height="42" rx="4" fill="none" stroke="#94A3B8" strokeWidth="2" />
      <rect x="288" y="190" width="42" height="42" rx="4" fill="none" stroke="#94A3B8" strokeWidth="2" />

      {/* door */}
      <rect x="215" y="290" width="50" height="50" rx="3" fill="none" stroke="#94A3B8" strokeWidth="2" />

      {/* rising water, clipped to house silhouette, animates from floor to ~40% height */}
      <g clipPath="url(#houseClip)">
        <rect
          x="60"
          y="340"
          width="360"
          height="120"
          fill="url(#waterGradient)"
          className="origin-bottom animate-rise"
        />
      </g>

      {/* waterline marker + label */}
      <line
        x1="60"
        y1="290"
        x2="420"
        y2="290"
        stroke="#F4A261"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <rect x="330" y="265" width="118" height="24" rx="6" fill="#F4A261" />
      <text
        x="389"
        y="281"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#1E293B"
      >
        ~40 min out
      </text>
    </svg>
  );
}
