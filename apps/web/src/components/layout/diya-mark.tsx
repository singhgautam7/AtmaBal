/**
 * Diya (oil lamp) brand mark — "warmth and courage lit from within" (HANDOFF v2).
 * One clear silhouette, terracotta on warm cream. Used in the in-app header and
 * the installed-app (home-screen) icon only.
 *
 * NOTE (plumbing rule): the diya is NOT the browser favicon — the tab icon stays
 * neutral so the subject isn't flagged to someone glancing at the tab or history.
 */
export function DiyaMark({ size = 28 }: { size?: number }) {
  const inner = Math.round(size * 0.62);
  return (
    <span
      aria-hidden
      style={{
        flex: 'none',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.26),
        background: 'linear-gradient(157deg,#FBF3E7,#F1E1CE)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 200 200" width={inner} height={inner} style={{ display: 'block' }}>
        <path d="M100 12 C134 68 122 108 100 128 C78 108 66 68 100 12 Z" fill="#BE5A38" />
        <path d="M100 52 C117 80 111 106 100 118 C89 106 83 80 100 52 Z" fill="#E3A24C" />
        <rect x="95" y="118" width="10" height="34" rx="5" fill="#7A3A20" />
        <path d="M28 138 Q100 196 172 138 Q157 176 100 180 Q43 176 28 138 Z" fill="#9B4526" />
      </svg>
    </span>
  );
}
