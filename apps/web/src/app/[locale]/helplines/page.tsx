import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { HelplineDirectory } from '@/components/tools/helpline-directory';

export default async function HelplinesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[820px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Helplines</span>
        <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">Helpline directory</h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          National helplines you can call directly. Filter by what you need. Each shows the date it was
          last checked - tap a number to call. This page works offline once it has loaded.
        </p>
        <HelplineDirectory />
      </main>
      <TrustFooter />
    </div>
  );
}
