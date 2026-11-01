export default function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <g className="fill-primary-foreground" opacity=".55">
        <rect x="3.5" y="7" width="2.5" height="3" rx=".8" />
        <rect x="3.5" y="14.5" width="2.5" height="3" rx=".8" />
        <rect x="3.5" y="22" width="2.5" height="3" rx=".8" />
        <rect x="26" y="7" width="2.5" height="3" rx=".8" />
        <rect x="26" y="14.5" width="2.5" height="3" rx=".8" />
        <rect x="26" y="22" width="2.5" height="3" rx=".8" />
      </g>
      <path className="fill-primary-foreground" d="M13 10.5v11l8.5-5.5z" />
    </svg>
  );
}
