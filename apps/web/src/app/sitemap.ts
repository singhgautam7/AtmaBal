import type { MetadataRoute } from 'next';

/**
 * Sitemap (emitted as out/sitemap.xml by the static export). English routes only
 * for launch - hi/kn fall back to English and are not advertised yet.
 */
const BASE = 'https://atmabal.in';

const ROUTES = [
  '', 'start', 'search', 'crime', 'options', 'map', 'helplines', 'tools',
  'first-24-hours', 'rights', 'complaint-letter', 'incident-log', 'safety-plan',
  'how-it-works', 'grounding', 'methodology', 'about', 'corrections',
];

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${BASE}/en/${r ? `${r}/` : ''}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: r === '' ? 1 : 0.7,
  }));
}
