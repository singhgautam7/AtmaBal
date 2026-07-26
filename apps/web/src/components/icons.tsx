import type { SVGProps } from 'react';

/**
 * Shared line-icon set, matching the design concept's inline SVGs. All are
 * `stroke="currentColor"` so colour follows text; decorative by default
 * (aria-hidden) — pair with a text label for meaning, never colour/shape alone.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, strokeWidth = 1.7, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

export function IconChart(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 20V4M4 20h16" />
      <path d="M7 15l3.5-4 3 2.2L20 7" />
    </svg>
  );
}

export function IconRights(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3v18M6 7h12" />
      <path d="M6 7l-2.6 5a2.6 2.6 0 0 0 5.2 0L6 7zM18 7l-2.6 5a2.6 2.6 0 0 0 5.2 0L18 7z" />
    </svg>
  );
}

export function IconHelp(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z" />
    </svg>
  );
}

/** Phone / tap-to-call. */
export const IconPhone = IconHelp;

export function IconDoc(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 16h6" />
    </svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconChat(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 5h16v11H9l-4 4V5z" />
    </svg>
  );
}

export function IconCam(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </svg>
  );
}

export function IconChevronRight(p: IconProps) {
  return (
    <svg {...base({ size: 20, strokeWidth: 1.7, ...p })}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...base({ size: 20, strokeWidth: 1.8, ...p })}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconChevronLeft(p: IconProps) {
  return (
    <svg {...base({ size: 20, strokeWidth: 1.7, ...p })}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function IconPin(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 8c0 4.6 6 10 6 10z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

export function IconInfo(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8.2v.1" />
    </svg>
  );
}

export function IconDownload(p: IconProps) {
  return (
    <svg {...base({ size: 18, strokeWidth: 1.6, ...p })}>
      <path d="M12 3v11M7.5 10.5 12 15l4.5-4.5M5 19h14" />
    </svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <svg {...base({ size: 16, strokeWidth: 1.5, ...p })}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconExit(p: IconProps) {
  return (
    <svg {...base({ size: 12, strokeWidth: 1.6, ...p })} viewBox="0 0 12 12">
      <path d="M3 9L9 3M5 3h4v4" />
    </svg>
  );
}

export function IconHeart(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 20s-7-4.7-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.3-7 10-7 10z" />
    </svg>
  );
}

export function IconMindfulness(p: IconProps) {
  return (
    <svg {...base({ size: 24, strokeWidth: 1.8, ...p })}>
      <path d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H7v-1a5 5 0 0 1 10 0v1h-2v6h1a3 3 0 0 0 3-3v-4a7 7 0 0 0-7-7z" />
    </svg>
  );
}

/** A trend arrow: rotates up/down/flat. */
export function IconTrendArrow({ dir, ...p }: IconProps & { dir: 'up' | 'down' | 'flat' }) {
  const deg = dir === 'up' ? -32 : dir === 'down' ? 32 : 0;
  return (
    <svg
      {...base({ size: 15, strokeWidth: 2, ...p })}
      style={{ transform: `rotate(${deg}deg)`, ...(p.style ?? {}) }}
    >
      <path d="M4 12h13" />
      <path d="M13 7l5 5-5 5" />
    </svg>
  );
}
