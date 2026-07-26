import { setRequestLocale, getTranslations } from 'next-intl/server';
import { QuickExit } from '@/components/layout/quick-exit';
import { LocaleLink } from '@/components/layout/locale-link';
import { Logo } from '@/components/layout/logo';
import { IconPhone, IconMindfulness } from '@/components/icons';

/**
 * Grounding page - "Take a moment". A calm space reached DELIBERATELY from the
 * help/options pages (design.md). This is NOT what quick exit triggers; quick
 * exit still leaves the site entirely, so it's present here too.
 */
export default async function GroundingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('grounding');

  return (
    <main
      id="main"
      className="relative isolate min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg,#F6EFE4,#F1E7D7)' }}
    >
      <GroundingBackdrop />
      <div className="relative z-10 mx-auto max-w-[900px] px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[12.5px] font-semibold text-ink-faint sm:inline">
              / {t('eyebrow')}
            </span>
          </div>
          <QuickExit />
        </div>

        <div className="grid items-center gap-12 py-12 sm:py-16 md:grid-cols-[300px_1fr]">
          <BreathingGuide labels={{ in: t('breatheIn'), hold: t('hold'), out: t('breatheOut') }} />

          <div>
            <h1 className="font-display text-[32px] font-normal leading-tight text-ink sm:text-[40px]">
              {t('title')}
            </h1>
            <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
              {t('body')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LocaleLink
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-3.5 text-[15px] font-semibold text-ink"
              >
                {t('backHome')}
              </LocaleLink>
              <a
                href="tel:181"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-accent-deep"
              >
                <IconPhone size={16} />
                {t('callWomen')}
              </a>
              <a
                href="tel:14416"
                className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-3.5 text-[15px] font-semibold text-ink"
              >
                <IconMindfulness size={16} className="text-accent-deep" />
                {t('callTeleManas')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Slow drifting, pulsing ambient blobs behind the grounding content - a living,
 * calming background (matches the design's intent). Decorative; disabled under
 * prefers-reduced-motion (globals.css), leaving a still, soft wash.
 */
function GroundingBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span
        className="absolute -left-[10%] top-[8%] h-[46vmax] w-[46vmax] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(190,90,56,0.30), rgba(190,90,56,0) 66%)',
          animation: 'gFloatA 16s ease-in-out infinite',
        }}
      />
      <span
        className="absolute -right-[12%] top-[24%] h-[42vmax] w-[42vmax] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(47,111,123,0.22), rgba(47,111,123,0) 66%)',
          animation: 'gFloatB 20s ease-in-out infinite',
        }}
      />
      <span
        className="absolute bottom-[-14%] left-[28%] h-[40vmax] w-[40vmax] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(122,101,145,0.20), rgba(122,101,145,0) 66%)',
          animation: 'gFloatC 24s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/**
 * Guided box-breathing: three bars fill in sequence with a rotating label,
 * over a 12s loop. Pure CSS (see globals.css @keyframes); honours reduced-motion.
 */
function BreathingGuide({ labels }: { labels: { in: string; hold: string; out: string } }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[300px] max-w-full">
        <span
          className="pointer-events-none absolute left-1/2 top-3.5 h-[150px] w-[340px] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(190,90,56,0.26), rgba(47,111,123,0.13) 55%, rgba(190,90,56,0) 75%)',
            filter: 'blur(18px)',
            animation: 'brGlow 12s ease-in-out infinite',
          }}
        />
        <div className="relative flex gap-2">
          <BreatheBar track="var(--accent-soft)" fill="var(--accent)" anim="brFill0" />
          <BreatheBar track="rgba(47,111,123,0.16)" fill="var(--data-domestic)" anim="brFill1" />
          <BreatheBar track="rgba(122,101,145,0.16)" fill="var(--cat-3)" anim="brFill2" />
        </div>
        <div className="relative mt-[18px] h-7">
          <BreatheLabel anim="brLbl0" color="var(--accent-deep)">{labels.in}</BreatheLabel>
          <BreatheLabel anim="brLbl1" color="var(--data-domestic)">{labels.hold}</BreatheLabel>
          <BreatheLabel anim="brLbl2" color="#6A557F">{labels.out}</BreatheLabel>
        </div>
      </div>
    </div>
  );
}

function BreatheBar({ track, fill, anim }: { track: string; fill: string; anim: string }) {
  return (
    <div className="h-[9px] flex-1 overflow-hidden rounded-full" style={{ background: track }}>
      <span
        className="block h-full rounded-full"
        style={{ width: 0, background: fill, animation: `${anim} 12s linear infinite` }}
      />
    </div>
  );
}

function BreatheLabel({
  anim,
  color,
  children,
}: {
  anim: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className="absolute inset-0 text-center font-display text-[19px] font-medium uppercase tracking-[0.08em]"
      style={{ opacity: 0, color, animation: `${anim} 12s linear infinite` }}
    >
      {children}
    </span>
  );
}
