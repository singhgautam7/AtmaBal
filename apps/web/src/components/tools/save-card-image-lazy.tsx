'use client';

import dynamic from 'next/dynamic';
import type { RightCard } from '@/data/rights';

/**
 * Loads the PNG-export button CLIENT-SIDE ONLY (ssr: false). The button uses the
 * Canvas API, so it must never run during SSR / the static export - the rights
 * cards render fully without it, and this appears after hydration. This is the
 * boundary that keeps `window`/`document` out of the render/export path.
 */
const SaveCardImage = dynamic(
  () => import('./rights-card-image').then((m) => m.SaveCardImage),
  { ssr: false, loading: () => null },
);

export function SaveCardImageLazy({ card }: { card: RightCard }) {
  return <SaveCardImage card={card} />;
}
