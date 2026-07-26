import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { CrimeDashboard } from '@/components/dashboard/crime-dashboard';
import { getCrime, getJustice } from '@/data/loaders';

export default async function CrimePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const crime = getCrime();
  const justice = getJustice();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-8 sm:px-8">
        <CrimeDashboard crime={crime} justice={justice} />
      </main>
      <TrustFooter />
    </div>
  );
}
