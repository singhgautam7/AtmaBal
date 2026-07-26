'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CityMeta, CrimeData, JusticeData } from '@/data/types';
import { fmtN } from '@/lib/format';
import { IconInfo, IconTrendArrow, IconChevronRight } from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { TrendLine, Ring } from './charts';
import { ChartFrame } from './chart-frame';

// A purely decorative donut for the blurred "data not available" placeholder.
// Deliberately renders NO numbers, labels, or tooltips - it must never read as
// data, even when partially visible behind the overlay.
function DecorDonut({ size = 168 }: { size?: number }) {
  const fracs = [0.34, 0.2, 0.14, 0.12, 0.11, 0.09];
  const fills = ['var(--data-domestic)', 'var(--accent)', 'var(--cat-3)', 'var(--cat-4)', 'var(--cat-5)', 'var(--line-strong)'];
  const cx = size / 2, cy = size / 2, r = size / 2 - 2, ir = r * 0.56;
  let a0 = -Math.PI / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden style={{ display: 'block' }}>
      {fracs.map((frac, i) => {
        const a1 = i === fracs.length - 1 ? -Math.PI / 2 + Math.PI * 2 : a0 + frac * Math.PI * 2;
        const large = frac > 0.5 ? 1 : 0;
        const d = `M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} L ${cx + ir * Math.cos(a1)} ${cy + ir * Math.sin(a1)} A ${ir} ${ir} 0 ${large} 0 ${cx + ir * Math.cos(a0)} ${cy + ir * Math.sin(a0)} Z`;
        a0 = a1;
        return <path key={i} d={d} fill={fills[i]} stroke="var(--surface)" strokeWidth={1.5} />;
      })}
    </svg>
  );
}

export function CrimeDashboard({
  allCrime,
  cities,
  justiceByCity,
}: {
  allCrime: Record<string, CrimeData>;
  cities: CityMeta[];
  justiceByCity: Record<string, JusticeData | null>;
}) {
  const t = useTranslations('crime');
  const searchParams = useSearchParams();
  void cities;

  // City is driven entirely by the header dropdown via ?city= (single control).
  const urlCity = searchParams.get('city');
  const cityId = urlCity && allCrime[urlCity] ? urlCity : 'bengaluru';
  const crime = allCrime[cityId]!;
  const pop = crime.populationLakh ?? 40.6;
  const years = crime.years;
  const firstYear = years[0]!;
  const lastYear = years[years.length - 1]!;

  const [focusYear, setFocusYear] = useState<number>(lastYear);
  // Reset the year when the city changes (cityId comes from the URL, not state).
  const [cityKey, setCityKey] = useState<string>(cityId);
  if (cityKey !== cityId) {
    setCityKey(cityId);
    setFocusYear(lastYear);
  }

  const model = useMemo(() => {
    const values = years.map((y) => crime.totals[String(y)] ?? 0);
    const fi = years.indexOf(focusYear);
    const pi = Math.max(0, fi - 1);
    const cur = values[fi] ?? 0;
    const prev = values[pi] ?? 0;
    const yoy = prev ? ((cur - prev) / prev) * 100 : 0;
    const rate = pop ? cur / pop : 0;
    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    const spanPct = first ? ((last - first) / first) * 100 : 0;
    const dir = spanPct >= 8 ? 'up' : spanPct <= -8 ? 'down' : 'flat';
    return { values, pi, cur, yoy, rate, first, last, spanPct, dir };
  }, [crime.totals, years, focusYear, pop]);

  const { values, pi, cur, yoy, rate, first, last, spanPct, dir } = model;
  const prevYear = years[pi]!;
  const justice = justiceByCity[cityId] ?? null;

  const headline = t(`trend.${dir}`, {
    city: crime.cityName,
    from: fmtN(first),
    to: fmtN(last),
    y0: firstYear,
    y1: lastYear,
    pct: Math.abs(Math.round(spanPct)),
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[600px]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {t('eyebrow')}
            {crime.state ? ` · ${crime.state}` : ''}
          </span>
          <h1 className="mt-2.5 font-display text-[27px] font-medium leading-tight text-ink">
            {t('title', { city: crime.cityName })}
          </h1>
          <p className="mt-2 max-w-[600px] text-[12.5px] leading-snug text-ink-soft">
            {t.rich('howToRead', { strong: (c) => <strong className="font-semibold">{c}</strong> })}
          </p>
        </div>
        <LocaleLink
          href="/methodology"
          className="inline-flex flex-none items-center gap-1.5 rounded-full border border-accent-line px-3.5 py-2 text-[13px] font-semibold text-accent-deep"
        >
          <IconInfo size={14} strokeWidth={1.7} />
          {t('methodology')}
        </LocaleLink>
      </div>

      {/* Year slider */}
      <div className="mt-5 flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3.5">
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {t('filters.year')}
        </span>
        <input
          type="range"
          min={firstYear}
          max={lastYear}
          step={1}
          value={focusYear}
          onChange={(e) => setFocusYear(+e.target.value)}
          aria-label={t('filters.year')}
          className="h-[22px] flex-1 cursor-pointer accent-accent"
        />
        <span className="min-w-[44px] font-display text-[19px] font-semibold text-accent-deep">{focusYear}</span>
      </div>

      {/* Real KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label={t('stats.total', { year: focusYear })} value={fmtN(cur)} sub={t('stats.reportedCases')} />
        <StatCard label={t('stats.ratePerLakh')} value={rate.toFixed(1)} sub={t('stats.censusBase')} />
        <StatCard
          label={t('stats.changeVs', { year: prevYear })}
          value={`${yoy >= 0 ? '+' : '-'}${Math.abs(Math.round(yoy))}%`}
          sub={yoy >= 0 ? t('stats.moreReported') : t('stats.fewerReported')}
          dir={yoy >= 2 ? 'up' : yoy <= -2 ? 'down' : 'flat'}
        />
        <StatCard
          label={t('stats.chargesheet')}
          value={crime.chargesheetRate != null ? `${crime.chargesheetRate.toFixed(0)}%` : '-'}
          sub={t('stats.chargesheetSub', { year: lastYear })}
        />
      </div>

      {/* Headline + caveat */}
      <div className="mt-6 flex flex-wrap items-start gap-6">
        <h2 className="min-w-[300px] max-w-[580px] flex-1 font-display text-[22px] font-normal leading-snug text-ink sm:text-[24px]">
          {headline}
        </h2>
        <div className="flex min-w-[280px] max-w-[400px] flex-1 gap-2.5 rounded-md bg-accent-soft px-4 py-3.5">
          <IconInfo size={17} className="mt-0.5 flex-none text-accent-deep" strokeWidth={1.7} />
          <p className="text-[13px] leading-snug text-ink">{t('caveat')}</p>
        </div>
      </div>

      {/* Real total trend + honest "not available" breakdown */}
      <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <ChartFrame title={t('totalOverTime', { y0: firstYear, y1: lastYear })} filename={`${cityId}-total-trend`}>
          <TrendLine values={values} years={years} measure="cases" focusYear={focusYear} width={560} height={220} ariaLabel={t('totalOverTime', { y0: firstYear, y1: lastYear })} />
        </ChartFrame>

        <div className="rounded-md border border-line bg-surface p-4">
          <div className="mb-2 text-[13px] font-semibold text-ink-soft">{t('breakdownTitle')}</div>
          <div className="relative flex items-center justify-center py-3">
            <div style={{ filter: 'blur(7px)', opacity: 0.5 }} aria-hidden>
              <DecorDonut size={168} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-paper shadow">
                {t('notAvailable.badge')}
              </span>
              <p className="max-w-[300px] text-[11.5px] leading-snug text-ink-soft">{t('notAvailable.note')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compare any two years - uses only the REAL totals, so it needs no
          per-offence breakdown. This is what "Compare two years" now means. */}
      <div className="mt-4">
        <CompareTwoYears totals={crime.totals} years={years} cityId={cityId} />
      </div>

      {justice && <JusticeSection justice={justice} />}

      {/* Footer / sources */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="max-w-[720px] text-[11.5px] leading-relaxed text-ink-faint">
          {crime.source}. {crime.populationBaseNote} No safety score, no city-vs-city comparison.{' '}
          <LocaleLink href="/methodology" className="underline underline-offset-2">{t('footer.methodologyLink')}</LocaleLink>
        </span>
        <span className="whitespace-nowrap text-[11.5px] text-ink-faint">{t('footer.lastUpdated', { date: crime.lastUpdated })}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- bits ---- */

function CompareTwoYears({ totals, years, cityId }: { totals: Record<string, number>; years: number[]; cityId: string }) {
  const t = useTranslations('crime.charts');
  const first = years[0]!;
  const last = years[years.length - 1]!;
  const [a, setA] = useState<number>(first);
  const [b, setB] = useState<number>(last);
  // Reset the picked years when the city changes.
  const [ck, setCk] = useState<string>(cityId);
  if (ck !== cityId) {
    setCk(cityId);
    setA(first);
    setB(last);
  }

  const va = totals[String(a)] ?? 0;
  const vb = totals[String(b)] ?? 0;
  const max = Math.max(va, vb, 1);
  const pct = va ? Math.round(((vb - va) / va) * 100) : 0;

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-ink-soft">{t('compareTwoYears')}</div>
        <div className="flex items-center gap-2 text-[13px]">
          <YearPicker label={t('earlierYear')} value={a} years={years} onChange={setA} />
          <span className="text-ink-faint">vs</span>
          <YearPicker label={t('laterYear')} value={b} years={years} onChange={setB} />
        </div>
      </div>
      <div className="space-y-3.5">
        <CompareBar year={a} value={va} frac={va / max} tone="prev" />
        <CompareBar year={b} value={vb} frac={vb / max} tone="cur" />
      </div>
      <p className="mt-3.5 text-[12.5px] leading-snug text-ink-soft">
        {pct === 0
          ? t('compareSame', { y0: a, y1: b })
          : t('compareChange', { pct: Math.abs(pct), dir: pct > 0 ? t('compareMore') : t('compareFewer'), y0: a, y1: b })}
      </p>
    </div>
  );
}

function YearPicker({ label, value, years, onChange }: { label: string; value: number; years: number[]; onChange: (y: number) => void }) {
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        aria-label={label}
        className="cursor-pointer rounded-md border border-line bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-ink"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareBar({ year, value, frac, tone }: { year: number; value: number; frac: number; tone: 'cur' | 'prev' }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
        <span className="font-display text-[15px] font-semibold text-ink">{year}</span>
        <span className="text-ink-soft">{fmtN(value)} reported</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${Math.max(2, frac * 100)}%`, background: tone === 'cur' ? 'var(--data-public)' : 'var(--data-domestic)' }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, dir }: { label: string; value: string; sub: string; dir?: 'up' | 'down' | 'flat' }) {
  return (
    <div className="rounded-md border border-line bg-surface px-[18px] py-4">
      <div className="min-h-[26px] text-[10.5px] font-semibold uppercase leading-tight tracking-[0.04em] text-ink-faint">{label}</div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="font-display text-[31px] font-semibold leading-none text-ink">{value}</span>
        {dir && <span className="inline-flex text-ink-soft"><IconTrendArrow dir={dir} /></span>}
      </div>
      <div className="mt-1.5 text-[11.5px] text-ink-soft">{sub}</div>
    </div>
  );
}

function JusticeSection({ justice }: { justice: JusticeData }) {
  const t = useTranslations('crime.justice');
  return (
    <section className="mt-8 border-t border-line pt-6">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-faint">{t('eyebrow')}</span>
      <h2 className="mt-2 max-w-[640px] font-display text-[22px] font-normal leading-snug text-ink">{t('title')}</h2>
      <div className="mt-4 grid gap-3.5 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="flex items-center gap-4 rounded-md border border-line bg-surface p-[18px]">
          <div className="relative flex h-[132px] w-[132px] flex-none items-center justify-center">
            <Ring pct={justice.convictionRate} color="var(--conv)" size={132} ariaLabel={t('convictionRate')} />
            <div className="absolute text-center">
              <div className="font-display text-[28px] font-semibold leading-none text-ink">{justice.convictionRate}%</div>
              <div className="mt-0.5 text-[10px] text-ink-faint">{t('convicted')}</div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[13px] font-semibold text-ink-soft">{t('convictionRate')}</div>
            <p className="text-[12px] leading-relaxed text-ink-soft">{t('convictionBody')}</p>
          </div>
        </div>
        <ProgressCard label={t('pendingInvestigation')} value={`~${justice.pendingInvestigationRate}%`} pct={justice.pendingInvestigationRate} color="var(--cat-4)" body={t('pendingInvestigationBody')} />
        <ProgressCard label={t('pendingTrial')} value={`~${justice.pendingTrialRate}%`} pct={justice.pendingTrialRate} color="var(--data-domestic)" body={t('pendingTrialBody')} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent-line bg-accent-soft px-[18px] py-4">
        <p className="max-w-[620px] text-[14px] leading-snug text-ink">{t('callout')}</p>
        <LocaleLink href="/options" className="inline-flex flex-none items-center gap-1.5 rounded-sm bg-accent px-4 py-[11px] text-[14px] font-semibold text-white hover:bg-accent-deep">
          {t('exploreOptions')}
          <IconChevronRight size={15} strokeWidth={1.8} />
        </LocaleLink>
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">{t('provisional')}</p>
    </section>
  );
}

function ProgressCard({ label, value, pct, color, body }: { label: string; value: string; pct: number; color: string; body: string }) {
  return (
    <div className="flex flex-col justify-center rounded-md border border-line bg-surface p-[18px]">
      <div className="mb-2 flex justify-between text-[12.5px] text-ink-soft">
        <span className="font-semibold">{label}</span>
        <span className="font-bold text-ink">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="mt-3 text-[11.5px] leading-snug text-ink-soft">{body}</p>
    </div>
  );
}
