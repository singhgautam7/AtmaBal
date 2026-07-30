import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { SiteSearch } from '@/components/tools/site-search';

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[680px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Search</span>
        <h1 className="mt-2 font-display text-[28px] font-normal leading-tight text-ink">Search Atma Bal</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Find a right, a tool, a guide or a helpline. Everything runs on your device.
        </p>
        <SiteSearch />
      </main>
      <TrustFooter />
    </div>
  );
}
