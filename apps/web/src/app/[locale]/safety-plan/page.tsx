import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { QuickExit } from '@/components/layout/quick-exit';
import { SafeBrowsingNote } from '@/components/layout/safe-browsing-note';
import { SafetyChecklist } from '@/components/tools/safety-checklist';

export default async function SafetyPlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <div data-noprint>
        <SiteHeader />
      </div>
      <main id="main" className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10 sm:px-8">
        <div data-noprint className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Safety planning</span>
            <h1 className="mt-2 font-display text-[28px] font-normal leading-tight text-ink sm:text-[30px]">
              A calm safety-planning checklist
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              For when things at home feel unsafe. This is a gentle set of ideas some people find helpful -
              for staying safer now, and for leaving safely if and when you choose to. Go at your own pace.
            </p>
          </div>
          <QuickExit />
        </div>
        <SafetyChecklist />
        <div data-noprint>
          <SafeBrowsingNote className="mt-8" />
        </div>
      </main>
      <div data-noprint>
        <TrustFooter />
      </div>
    </div>
  );
}
