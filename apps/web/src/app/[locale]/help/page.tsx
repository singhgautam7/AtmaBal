import { setRequestLocale } from 'next-intl/server';
import { HelpNearYou } from '@/components/help/help-near-you';
import { getPlaces } from '@/data/loaders';

/**
 * Get-help page — a full-bleed real map (MapLibre + free tiles) with real
 * Bengaluru stations, One Stop Centre and helplines. All chrome (title,
 * quick-exit, filters, results) floats over the map, so the page itself is just
 * the map surface.
 */
export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { places } = getPlaces();
  return (
    <main id="main">
      <HelpNearYou places={places} />
    </main>
  );
}
