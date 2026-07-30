import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';
import { ReviewBanner, LawBehind } from '@/components/tools/review-banner';
import { EXPLAINERS } from '@/data/explainers';

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">How it works</span>
        <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">
          What actually happens when you&hellip;
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          Knowing what to expect can take some of the fear out of a step. These are plain-language walk-throughs -
          each one is a choice you can make, in your own time.
        </p>

        <ReviewBanner className="mt-5" />

        <div className="mt-6 flex flex-col gap-6">
          {EXPLAINERS.map((e) => (
            <section key={e.id} id={e.id} className="scroll-mt-24 rounded-lg border border-line bg-surface p-5">
              <h2 className="font-display text-[21px] font-normal leading-snug text-ink">{e.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{e.intro}</p>
              <ol className="mt-3 flex flex-col gap-2.5">
                {e.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-deep">
                      {i + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed text-ink">{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 rounded-md bg-accent-soft px-3.5 py-2.5 text-[13px] leading-snug text-ink">{e.reassure}</p>
              {e.law && <LawBehind law={e.law} />}
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
          <LocaleLink href="/rights" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Know your rights
          </LocaleLink>
          <LocaleLink href="/complaint-letter" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Complaint template
          </LocaleLink>
          <LocaleLink href="/map?city=bengaluru" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Find help near you
          </LocaleLink>
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
