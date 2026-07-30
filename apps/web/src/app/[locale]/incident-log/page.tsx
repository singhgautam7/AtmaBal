import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { IncidentLogTool } from '@/components/tools/incident-log-tool';

export default async function IncidentLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <div data-noprint>
        <SiteHeader />
      </div>
      <main id="main" className="mx-auto w-full max-w-[980px] flex-1 px-5 py-10 sm:px-8">
        <div data-noprint>
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Template</span>
          <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">Incident log</h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
            A simple log you can keep over time - one row per incident, with dates, witnesses and any
            evidence you have kept. It stays on your device; nothing is saved or sent.
          </p>
        </div>
        <IncidentLogTool />
      </main>
      <div data-noprint>
        <TrustFooter />
      </div>
    </div>
  );
}
