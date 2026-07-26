import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { CrimeDashboard } from '@/components/dashboard/crime-dashboard';
import { getAllCrime, getCities, getJustice } from '@/data/loaders';
import type { JusticeData } from '@/data/types';

export default async function CrimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allCrime = getAllCrime();
  const cities = getCities();
  // Disposal is state-level; only Bengaluru/Karnataka is populated for now.
  const justiceByCity: Record<string, JusticeData | null> = {
    bengaluru: getJustice('bengaluru'),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-8 sm:px-8">
        <CrimeDashboard allCrime={allCrime} cities={cities} justiceByCity={justiceByCity} />
      </main>
      <TrustFooter />
    </div>
  );
}
