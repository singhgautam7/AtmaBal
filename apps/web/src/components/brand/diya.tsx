/** The Atma Bal diya mark (in-app brand use). Decorative. */
export function Diya({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="Atma Bal" style={{ display: 'block' }}>
      <path d="M100 24 C138 84 124 128 100 150 C76 128 62 84 100 24 Z" fill="#BE5A38" />
      <path d="M100 66 C120 98 113 128 100 142 C87 128 80 98 100 66 Z" fill="#E3A24C" />
      <rect x="94" y="140" width="12" height="30" rx="6" fill="#7A3A20" />
      <path d="M34 150 Q100 210 166 150 Q150 186 100 190 Q50 186 34 150 Z" fill="#9B4526" />
    </svg>
  );
}
