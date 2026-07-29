import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';

const EMAIL = 'singhgautam.dev@gmail.com';

export default async function AboutPage({
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
        <h1 className="font-display text-[30px] font-normal leading-tight text-ink">About</h1>

        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-soft">
          <p>
            <strong className="font-semibold text-ink">Atma Bal</strong> (आत्मबल / ಆತ್ಮಬಲ -
            &ldquo;inner strength&rdquo;) is a calm reference tool for women in India. It helps
            you understand, in your own time: what crime against women actually looks like in a
            city (reported honestly, never as a danger ranking), what your legal options and
            rights are, and where to find verified help now.
          </p>
          <p>
            It is <strong className="font-semibold text-ink">not an SOS or live-tracking
            app.</strong> There is no panic button and nothing follows your location. The tone is
            meant to be a steady, informed friend - it assumes you are capable and just need clear,
            trustworthy information to act for yourself.
          </p>
          <p>
            <strong className="font-semibold text-ink">Independent and non-commercial.</strong>{' '}
            This is an independent project, not run for profit. There are no ads, no sponsors, and
            nothing is sold. It is served as static files with no server, no account, no cookies
            and no analytics - so there is architecturally nothing that records what you read or
            select here. You can read more in the{' '}
            <LocaleLink href="/methodology" className="font-semibold text-accent-deep underline underline-offset-2">
              methodology
            </LocaleLink>
            .
          </p>
          <p>
            <strong className="font-semibold text-ink">Where the information comes from.</strong>{' '}
            Crime figures are real NCRB &ldquo;Crime in India&rdquo; data; station locations come
            from OpenStreetMap; helplines from government directories; and every legal point traces
            to the Act and section it comes from, with a review date. Sources and their limits are
            listed on the{' '}
            <LocaleLink href="/methodology" className="font-semibold text-accent-deep underline underline-offset-2">
              methodology page
            </LocaleLink>
            .
          </p>
        </div>

        <div
          className="mt-8 rounded-md px-4 py-4 text-[14px] leading-relaxed text-ink"
          style={{ border: '1px solid var(--accent-line)', background: 'var(--accent-soft)' }}
        >
          <strong className="font-semibold">Found something wrong?</strong> Data can go stale or
          be incorrect - a dead helpline, a moved station, a number that looks off. If you spot
          anything, please tell me so I can fix it. Email{' '}
          <a
            href={`mailto:${EMAIL}?subject=Atma%20Bal%20correction`}
            className="font-semibold text-accent-deep underline underline-offset-2"
          >
            {EMAIL}
          </a>
          {' '}or see the{' '}
          <LocaleLink href="/corrections" className="font-semibold text-accent-deep underline underline-offset-2">
            corrections page
          </LocaleLink>
          .
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
