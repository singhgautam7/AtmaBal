'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CityMeta, CrimeData, CrimeHeadYear, JusticeData } from '@/data/types';
import { fmtN } from '@/lib/format';
import { catColor } from '@/lib/crime';
import { IconInfo, IconTrendArrow, IconChevronRight } from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { TrendLine, Donut, Ring } from './charts';
import { ChartFrame } from './chart-frame';

// Short chip labels for the head ids in NCRB Table 3B.2 (keyed to data ids).
const HEAD_SHORT: Record<string, string> = {
  cruelty: 'Cruelty (husband/family)',
  molestation: 'Assault on modesty',
  kidnap_abduction: 'Kidnap & abduction',
  rape: 'Rape',
  stalking: 'Stalking',
  insult_modesty: 'Insult to modesty',
  sexual_harassment: 'Sexual harassment',
  dowry_deaths: 'Dowry deaths',
  acid_attack: 'Acid attack',
  trafficking: 'Trafficking (ITPA)',
  cyber: 'Cyber crimes',
  pocso_girls: 'POCSO (girls <18)',
};
// Deliberately NOT a head colour: "Other offences" (the real principal-offence
// remainder) must read as its own neutral category, distinct from every head.
const OTHER_FILL = 'var(--ink-faint)';

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
    const first = values[0] ?? 0;
    const last = values[values.length - 1] ?? 0;
    const spanPct = first ? ((last - first) / first) * 100 : 0;
    const dir = spanPct >= 8 ? 'up' : spanPct <= -8 ? 'down' : 'flat';
    return { values, pi, cur, yoy, first, last, spanPct, dir };
  }, [crime.totals, years, focusYear]);

  const { values, pi, cur, yoy, first, last, spanPct, dir } = model;
  const prevYear = years[pi]!;
  // Rate & charge-sheeting come STRAIGHT from the data per year - a missing year
  // key means NCRB published no figure, so we show "not available" (never a
  // backfilled or recomputed value). Rate is computed once in the pipeline as
  // cases / 2011-female-population (NCRB's own base); see populationBaseNote.
  const rateY = crime.ratePerLakh[String(focusYear)];
  const csY = crime.chargesheetRate[String(focusYear)];
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
        <StatCard
          label={t('stats.ratePerLakh')}
          value={rateY != null ? rateY.toFixed(1) : t('stats.na')}
          sub={t('stats.censusBase', { year: crime.populationBaseYear })}
        />
        <StatCard
          label={t('stats.changeVs', { year: prevYear })}
          value={`${yoy >= 0 ? '+' : '-'}${Math.abs(Math.round(yoy))}%`}
          sub={yoy >= 0 ? t('stats.moreReported') : t('stats.fewerReported')}
          dir={yoy >= 2 ? 'up' : yoy <= -2 ? 'down' : 'flat'}
        />
        <StatCard
          label={t('stats.chargesheet')}
          value={csY != null ? `${csY.toFixed(0)}%` : t('stats.na')}
          sub={csY != null ? t('stats.chargesheetSub', { year: focusYear }) : t('stats.chargesheetNA', { year: focusYear })}
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

        <HeadBreakdown crime={crime} year={focusYear} />
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

function HeadBreakdown({ crime, year }: { crime: CrimeData; year: number }) {
  const t = useTranslations('crime');
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const yd: CrimeHeadYear | undefined = crime.heads?.byYear?.[String(year)];
  const avail = crime.heads?.availableYears ?? [];

  // No real head-wise split for this year: SUPPRESS the chart (rule - never draw
  // a misleading or empty composition) and say plainly where the data does exist.
  if (!yd) {
    return (
      <div className="rounded-md border border-line bg-surface p-4">
        <div className="mb-2 text-[13px] font-semibold text-ink-soft">{t('breakdownTitle')}</div>
        <div className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line px-5 text-center">
          <span className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft">
            {t('heads.naYearBadge')}
          </span>
          <p className="max-w-[320px] text-[11.5px] leading-snug text-ink-soft">
            {t('heads.naYear', { year, years: avail.join(', ') })}
          </p>
        </div>
      </div>
    );
  }

  const known = yd.items.filter((i): i is { id: string; name: string; cases: number } => i.cases !== null);
  const notAvail = yd.items.filter((i) => i.cases === null);
  const total = yd.total || 1;

  // PRINCIPAL-OFFENCE RULE (do not "fix" this into a false equality):
  // NCRB counts every FIR under a single, most-serious head, so heads never
  // double-count and (all listed heads + "Other offences") == the city total.
  // "Other offences" is the REAL remainder - the minor heads NCRB lists but we
  // don't chart individually - NOT missing data. A head whose value is null is
  // ABSENCE (shown separately below), and must never be folded into "Other".
  let hiddenSum = 0;
  const slices: { name: string; val: number; fill: string }[] = [];
  known.forEach((h, i) => {
    if (hidden.has(h.id)) { hiddenSum += h.cases; return; }
    if (h.cases > 0) slices.push({ name: HEAD_SHORT[h.id] ?? h.name, val: h.cases, fill: catColor(i) });
  });
  if (hiddenSum > 0) slices.push({ name: t('heads.hidden'), val: hiddenSum, fill: 'var(--line-strong)' });
  if (yd.otherCases > 0) slices.push({ name: t('heads.other'), val: yd.otherCases, fill: OTHER_FILL });

  const pct = (v: number) => `${((v / total) * 100).toFixed(v / total < 0.1 ? 1 : 0)}%`;
  const toggle = (id: string) =>
    setHidden((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="text-[13px] font-semibold text-ink-soft">{t('breakdownTitle')}</div>
        <span className="text-[11px] text-ink-faint">{t('heads.yearTag', { year })}</span>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="flex-none pt-0.5">
          <Donut items={slices} size={148} ariaLabel={t('breakdownTitle')} />
        </div>
        <ul className="w-full min-w-0 flex-1 space-y-0.5">
          {known.map((h, i) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => toggle(h.id)}
                aria-pressed={!hidden.has(h.id)}
                title={h.name}
                className={`flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-[11.5px] hover:bg-accent-soft ${hidden.has(h.id) ? 'opacity-40' : ''}`}
              >
                <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: catColor(i) }} />
                <span className="flex-1 truncate text-ink">{HEAD_SHORT[h.id] ?? h.name}</span>
                <span className="tabular-nums text-ink-soft">{fmtN(h.cases)}</span>
                <span className="w-9 text-right tabular-nums text-ink-faint">{pct(h.cases)}</span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-2 px-1 py-0.5 text-[11.5px]" title={crime.heads.principalOffenceNote}>
            <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: OTHER_FILL }} />
            <span className="flex-1 text-ink">{t('heads.other')}</span>
            <span className="tabular-nums text-ink-soft">{fmtN(yd.otherCases)}</span>
            <span className="w-9 text-right tabular-nums text-ink-faint">{pct(yd.otherCases)}</span>
          </li>
        </ul>
      </div>
      {notAvail.length > 0 && (
        <p className="mt-2.5 border-t border-line pt-2 text-[11px] leading-snug text-ink-faint">
          {t('heads.notAvailableList', { heads: notAvail.map((h) => HEAD_SHORT[h.id] ?? h.name).join(', ') })}
        </p>
      )}
      <p className="mt-2.5 text-[10.5px] leading-snug text-ink-faint">{t('heads.principalOffence')}</p>
    </div>
  );
}

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
