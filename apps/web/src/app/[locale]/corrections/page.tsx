import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';

export default async function CorrectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[720px] flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-display text-[30px] font-normal leading-tight text-ink">
          Corrections
        </h1>

        {/* Honest disclaimer about sources + processing. */}
        <div
          className="mt-5 rounded-md px-4 py-3.5 text-[13.5px] leading-relaxed text-ink"
          style={{ border: '1px solid var(--accent-line)', background: 'var(--accent-soft)' }}
        >
          A quick, honest note: the information here is pulled together from public
          sources - <strong className="font-semibold">crime figures from NCRB &ldquo;Crime
          in India&rdquo;</strong> (via OpenCity), <strong className="font-semibold">station
          locations from OpenStreetMap</strong>, government helpline directories, and the
          text of the relevant Acts - and then processed and presented by me. I&apos;ve tried
          hard to keep it accurate, but data can be stale or wrong. If something here is
          incorrect, I&apos;m sorry - and I&apos;m here to fix it. Please write to me.
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
          Every legal point, helpline and station on this site carries a source and a
          date it was last checked. Laws change and numbers go dead - if you spot
          something wrong or out of date, please tell us so we can fix it.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Email corrections to{' '}
          <a
            href="mailto:singhgautam.dev@gmail.com?subject=Atma%20Bal%20correction"
            className="font-semibold text-accent-deep underline underline-offset-2"
          >
            singhgautam.dev@gmail.com
          </a>
          . Please include the page and what looks wrong or out of date.
        </p>
      </main>
      <TrustFooter />
    </div>
  );
}
