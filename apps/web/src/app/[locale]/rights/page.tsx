import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';
import { Diya } from '@/components/brand/diya';
import { ReviewBanner, LawBehind } from '@/components/tools/review-banner';
import { RIGHTS } from '@/data/rights';

export default async function RightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[900px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">Know your rights</span>
        <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">
          The rights you carry into a police station
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          Short, self-contained cards - one right each. Save or screenshot any card to keep it on
          your phone; they work offline once this page has loaded. Each card names the law behind it.
        </p>

        <ReviewBanner className="mt-5" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RIGHTS.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-lg border border-line bg-surface p-5"
              style={{ breakInside: 'avoid' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em] text-accent-deep">
                  {r.tag}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-faint">
                  <Diya size={16} />
                  Atma Bal
                </span>
              </div>
              <h2 className="mt-3 font-display text-[19px] font-medium leading-snug text-ink">{r.title}</h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{r.body}</p>
              <LawBehind law={r.law} />
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
          <LocaleLink href="/first-24-hours" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            First 24 hours: a calm checklist
          </LocaleLink>
          <LocaleLink href="/map?city=bengaluru" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Find help near you
          </LocaleLink>
          <LocaleLink href="/options" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Explore your options
          </LocaleLink>
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
