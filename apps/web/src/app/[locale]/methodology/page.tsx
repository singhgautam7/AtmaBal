import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { getCrime } from '@/data/loaders';

const SOURCES = [
  {
    kind: 'Crime totals & rate',
    source: 'NCRB “Crime in India” metro-city tables (Table 3B.1), 2022 & 2024 volumes, via OpenCity (data.opencity.in)',
    verified: 'Machine-read from NCRB’s published CSV/XLSX. Case counts cover 2020-2024. Charge-sheeting rate is stored only for the years NCRB actually publishes it (2022 and 2024); other years show “not available” rather than a copied figure.',
  },
  {
    kind: 'Per-offence split',
    source: 'NCRB “Crime in India 2024”, Table 3B.2 (Crime against Women, crime head-wise, metropolitan cities)',
    verified: 'Parsed from the NCRB master PDF for all 19 metros; every head’s figure is cross-checked so our 19-city sum equals NCRB’s printed “Total Cities”. Available for 2024 only so far; earlier years show the total and mark the split “not available”.',
  },
  {
    kind: 'Rate calculation',
    source: 'Reported cases ÷ Census-2011 female population (NCRB’s own base)',
    verified: 'Computed once, per year, from the real case count and the fixed 2011 base; our 2022 and 2024 figures reproduce NCRB’s published rates. Because the base does not move, later-year rates run slightly high vs today’s population.',
  },
  {
    kind: 'Court/police disposal',
    source: 'NCRB “Crime in India” disposal tables (state level - Karnataka)',
    verified: 'State-level and provisional; labelled as such. City-level disposal to be added and marked separately.',
  },
  {
    kind: 'Police & women’s stations',
    source: 'OpenStreetMap (Overpass, amenity=police), Bengaluru',
    verified: 'Fetched live from OSM; women’s (Mahila) stations are sparsely tagged, so those are hand-checked against Bengaluru City Police.',
  },
  {
    kind: 'One Stop Centre',
    source: 'Nominatim geocode of the Sakhi centre (Vani Vilas Hospital)',
    verified: 'Hand-checked location; carries a last-verified date.',
  },
  {
    kind: 'Helplines',
    source: 'Government of India / Karnataka published helpline numbers',
    verified: 'Each number shows a visible last-verified date; dead numbers are the #1 failure mode, so the date forces maintenance.',
  },
  {
    kind: 'Legal rights & options',
    source: 'The Acts themselves (BNS/BNSS 2023, DV Act 2005, POSH 2013, Legal Services Authorities Act 1987, IT Act 2000)',
    verified: 'Each “law behind this” card names its Act, section, source and a review date; date-branched for the IPC→BNS change (1 July 2024).',
  },
  {
    kind: 'Population base (rates)',
    source: 'Census 2011 (as used by NCRB for its rate calculations)',
    verified: 'Stated openly; rates are “per lakh women” on this base.',
  },
];

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
            often means more women are reporting - better access and trust - not that a place
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
            <strong className="font-semibold text-ink">Where these numbers come
            from.</strong>{' '}
            The city totals, rates and charge-sheeting rates are <em>real NCRB &ldquo;Crime
            in India&rdquo; data</em> (2020-2024) for 19 metropolitan cities, pulled from
            NCRB&apos;s published metro-city tables via OpenCity (data.opencity.in) and
            validated in the pipeline. For Bengaluru, reported crimes against women went from{' '}
            <strong className="font-semibold text-ink">2,730 in 2020 to 4,748 in 2024</strong>.
          </p>
          <p>
            <strong className="font-semibold text-ink">Why the offence heads don&apos;t add up
            to the total.</strong>{' '}
            NCRB records each case under a single, most-serious offence (the &ldquo;principal
            offence&rdquo; rule), so the heads never double-count. We chart the major heads
            individually; everything else NCRB lists is shown honestly as{' '}
            <em>Other offences</em> - a real remainder, not a guess. Together the listed heads
            plus <em>Other offences</em> equal the city total. A head with no published figure
            is marked <em>not available</em> and is never folded into <em>Other offences</em> or
            shown as zero.
          </p>
          <p>
            <strong className="font-semibold text-ink">Where the per-offence split comes from,
            and what&apos;s missing.</strong>{' '}
            The breakdown is real NCRB data (Table 3B.2, crime head-wise, metropolitan cities),
            parsed from the 2024 volume for all 19 metros and validated against NCRB&apos;s own
            printed totals. NCRB publishes this split by year, so it is currently available for{' '}
            <strong className="font-semibold text-ink">2024 only</strong>; for earlier years we
            show the city total and mark the breakdown &ldquo;not available&rdquo; rather than
            estimate one. The <em>Get help</em> map is also real: station locations from
            OpenStreetMap, the One Stop Centre geocoded.
          </p>
        </div>

        {/* Per-kind data sources - so every figure on the site is traceable. */}
        <h2 className="mt-10 font-display text-[22px] font-normal leading-tight text-ink">
          Data &amp; sources
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">
          Every kind of data on this site, where it comes from, and how it&apos;s kept honest.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line-strong text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                <th className="py-2 pr-4 font-semibold">Data</th>
                <th className="py-2 pr-4 font-semibold">Source</th>
                <th className="py-2 font-semibold">How it&apos;s verified</th>
              </tr>
            </thead>
            <tbody className="text-ink-soft">
              {SOURCES.map((s) => (
                <tr key={s.kind} className="border-b border-line align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">{s.kind}</td>
                  <td className="py-3 pr-4">{s.source}</td>
                  <td className="py-3">{s.verified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-ink-faint">
          Data source: {crime.lastUpdated}. Last reviewed: {crime.lastReviewed}. Something wrong
          or out of date? Use the corrections link in the footer - every legal point, helpline
          and station also carries its own source and review date in the app.
        </p>
      </main>
      <TrustFooter />
    </div>
  );
}
