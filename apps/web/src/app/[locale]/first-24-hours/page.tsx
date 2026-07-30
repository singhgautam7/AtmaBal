import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';
import { IconChevronRight } from '@/components/icons';
import { ReviewBanner, LawBehind } from '@/components/tools/review-banner';
import { FIRST_24 } from '@/data/first24';

export default async function First24Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[720px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">First 24 hours</span>
        <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">
          A calm checklist for the first hours
        </h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          These are options, not orders - a few things that are only possible while they are fresh,
          and the ones that can wait. Do as much or as little as feels right. There is no wrong pace.
        </p>

        <ReviewBanner className="mt-5" />

        <ol className="mt-6 flex flex-col gap-3.5">
          {FIRST_24.map((s, i) => (
            <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent-soft font-display text-[14px] font-semibold text-accent-deep">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-[18px] font-medium leading-snug text-ink">{s.title}</h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
                  {s.link && (
                    <LocaleLink
                      href={s.link.href}
                      className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-accent-deep"
                    >
                      {s.link.label}
                      <IconChevronRight size={14} strokeWidth={1.8} />
                    </LocaleLink>
                  )}
                  {s.law && <LawBehind law={s.law} />}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3 text-[13px]">
          <LocaleLink href="/rights" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Know your rights
          </LocaleLink>
          <LocaleLink href="/complaint-letter" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Written-complaint template
          </LocaleLink>
          <LocaleLink href="/incident-log" className="rounded-sm border border-accent-line px-3.5 py-2 font-semibold text-accent-deep">
            Incident log
          </LocaleLink>
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
