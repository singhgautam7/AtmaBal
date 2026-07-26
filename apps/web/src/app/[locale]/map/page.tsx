import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { HelpNearYou } from '@/components/help/help-near-you';
import { getAllPlaces, getCities } from '@/data/loaders';

/**
 * Get-help map - a full-bleed real map (MapLibre + free tiles). Real stations for
 * all metros (OpenStreetMap; Bengaluru's women's stations + OSC hand-verified),
 * national helplines. City is chosen via the map's dropdown (?city=).
 */
export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const allPlaces = getAllPlaces();
  const cities = getCities();
  return (
    <main id="main">
      <Suspense fallback={<div className="grid h-[100dvh] place-items-center text-ink-faint">Loading map…</div>}>
        <HelpNearYou allPlaces={allPlaces} cities={cities} />
      </Suspense>
    </main>
  );
}
