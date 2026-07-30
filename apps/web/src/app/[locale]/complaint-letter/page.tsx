import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { ReviewBanner } from '@/components/tools/review-banner';
import { ComplaintTool } from '@/components/tools/complaint-tool';

export default async function ComplaintPage({ params }: { params: Promise<{ locale: string }> }) {
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
          <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">
            Written complaint to the police (FIR request)
          </h1>
          <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
            A fill-in-the-blank letter to the Station House Officer asking for an FIR to be registered.
            It works on your device only - print it, download it, or fill it by hand.
          </p>
          <ReviewBanner className="mt-5" />
        </div>
        <ComplaintTool />
      </main>
      <div data-noprint>
        <TrustFooter />
      </div>
    </div>
  );
}
