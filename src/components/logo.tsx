import { useId } from 'react';

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const fill = `em-logo-fill-${id}`;
  const clip = `em-logo-clip-${id}`;
  const sheen = `em-logo-sheen-${id}`;
  return (
    <svg
      className={['em-logo', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="English Mastery"
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2bb59c" />
          <stop offset="1" stopColor="#0f6f5f" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <rect width="48" height="48" rx="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="48" height="48" fill={`url(#${fill})`} />
        <path className="em-logo-sheen" d="M-4 -6h12L-4 54h-12Z" fill={`url(#${sheen})`} />
      </g>
      <g fill="none" stroke="#f4fffb" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        <path className="em-logo-letters" d="M21 15h-8.5v18H21M12.5 24h7.5M25.5 33V15l5.75 10L37 15v18" />
      </g>
    </svg>
  );
}
