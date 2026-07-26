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
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Every legal point, helpline and station on this site carries a source and a
          date it was last checked. Laws change and numbers go dead — if you spot
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
