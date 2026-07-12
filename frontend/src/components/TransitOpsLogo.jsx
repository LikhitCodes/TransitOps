/**
 * TransitOps Logo — SVG bus/transit icon with orange checkered pattern.
 * Matches the wireframe's logo square. Reusable across pages.
 */
export default function TransitOpsLogo({ size = 56, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TransitOps logo"
    >
      {/* Background rounded square */}
      <rect width="56" height="56" rx="12" fill="#ff6b00" />

      {/* Checkered grid pattern */}
      <rect x="4"  y="4"  width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="22" y="4"  width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="40" y="4"  width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="13" y="13" width="12" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="31" y="13" width="12" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="4"  y="22" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="22" y="22" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="40" y="22" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="13" y="31" width="12" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="31" y="31" width="12" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="4"  y="40" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="22" y="40" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="40" y="40" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}
