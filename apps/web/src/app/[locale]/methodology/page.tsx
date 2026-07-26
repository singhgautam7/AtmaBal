import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { getCrime } from '@/data/loaders';

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const crime = getCrime();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[720px] flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-display text-[30px] font-normal leading-tight text-ink">
          Methodology &amp; how to read the data
        </h1>
        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-ink-soft">
          <p>
            <strong className="font-semibold text-ink">Reported crime is not danger.</strong>{' '}
            Every number here is <em>reported cases</em>, not total incidents. A rising line
            often means more women are reporting — better access and trust — not that a place
            has become more dangerous. Where reports rose sharply in Bengaluru, police and
            activists attributed it to easier reporting, not a real surge.
          </p>
          <p>
            <strong className="font-semibold text-ink">Rate per lakh is the fairest
            comparison.</strong>{' '}
            As the city grows, raw counts climb even if risk doesn&apos;t. Rates use a base of
            about {crime.populationLakh} lakh women. {crime.populationBaseNote}
          </p>
          <p>
            <strong className="font-semibold text-ink">Public vs domestic are kept
            separate.</strong>{' '}
            Cruelty and dowry offences are domestic and dominate the totals; keeping them out
            of the travel-focused public view stops it being swamped.
          </p>
          <p>
            <strong className="font-semibold text-ink">No comparisons between cities, no
            safety scores.</strong>{' '}
            NCRB warns that crime rates of different cities are not comparable. We compare
            Bengaluru only to itself over time, and never paint areas red.
          </p>
          <p>
            <strong className="font-semibold text-ink">What is real here, and what
            isn&apos;t (yet).</strong>{' '}
            The <em>Get help</em> map is real: police-station locations come live from
            OpenStreetMap and the One Stop Centre is geocoded, all committed and citable.
            The <em>crime charts are illustrative placeholders</em> for now — the data
            pipeline (built) replaces them with parsed, validated NCRB rows, and no number
            ships without a source. One verified anchor while that lands: NCRB recorded{' '}
            <strong className="font-semibold text-ink">3,924 crimes against women in
            Bengaluru in 2022</strong> (chargesheeting rate ~74%).
          </p>
          <p className="text-[13px] text-ink-faint">
            Sources: NCRB &ldquo;Crime in India&rdquo; (2022, via reporting on the metro-city
            tables) and Bengaluru City Police / OpenStreetMap. Disposal figures are
            state-level (Karnataka) and provisional. Data last updated: {crime.lastUpdated}.
          </p>
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
