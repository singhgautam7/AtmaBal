import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { QuickExit } from '@/components/layout/quick-exit';
import { SafeBrowsingNote } from '@/components/layout/safe-browsing-note';
import { StartFlow } from '@/components/tools/start-flow';

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[640px] flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Where do I start</span>
            <h1 className="mt-2 font-display text-[28px] font-normal leading-tight text-ink sm:text-[30px]">
              What would help most right now?
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              There is no wrong answer, and nothing here is saved. Pick whatever feels closest - you can
              always come back and choose again.
            </p>
          </div>
          <QuickExit />
        </div>
        <StartFlow />
        <SafeBrowsingNote className="mt-8" />
      </main>
      <TrustFooter />
    </div>
  );
}
