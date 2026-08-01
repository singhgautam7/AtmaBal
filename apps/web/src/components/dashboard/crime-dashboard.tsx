'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { CityMeta, CrimeData, CrimeHeadItem, CrimeHeadYear, JusticeData } from '@/data/types';
import { fmtN } from '@/lib/format';
import { catColor } from '@/lib/crime';
import { IconInfo, IconTrendArrow, IconChevronRight } from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { TrendLine, GroupedBars, Donut, Ring } from './charts';
import { ChartFrame } from './chart-frame';

type Scope = 'all' | 'public' | 'domestic';
type Head = CrimeHeadItem & { cases: number };

// "Other offences" = the real principal-offence remainder. "Filtered out" = heads
// the viewer hid or excluded by scope. Both are deliberately NON-head colours so
// neither is mistaken for an offence category.
const OTHER_FILL = 'var(--ink-faint)';
const FILTERED_FILL = 'var(--line-strong)';

// Measure a container so charts render at their real pixel width (labels stay
// readable instead of being scaled down to nothing on a phone).
function useWidth(): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(Math.round(cw));
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
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

  const urlCity = searchParams.get('city');
  const cityId = urlCity && allCrime[urlCity] ? urlCity : 'bengaluru';
  const crime = allCrime[cityId]!;
  const years = crime.years;
  const firstYear = years[0]!;
  const lastYear = years[years.length - 1]!;

  const headYears = crime.heads?.availableYears ?? [];
  const hasCategories = headYears.length > 0;
  // The full, stable head list (union) - the latest head-year has the most heads.
  const headCatalog: CrimeHeadItem[] = useMemo(() => {
    const latest = headYears[headYears.length - 1];
    return (latest != null && crime.heads.byYear[String(latest)]?.items) || [];
  }, [crime.heads, headYears]);

  // Default the year to the newest head-year (never a suppressed/empty pie).
  const defaultYear = hasCategories ? headYears[headYears.length - 1]! : lastYear;
  const [focusYear, setFocusYear] = useState<number>(defaultYear);
  const [scope, setScope] = useState<Scope>('all');
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // Reset the controls when the city changes (city comes from the URL).
  const [cityKey, setCityKey] = useState<string>(cityId);
  if (cityKey !== cityId) {
    setCityKey(cityId);
    setFocusYear(defaultYear);
    setScope('all');
    setHidden(new Set());
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
  const justice = justiceByCity[cityId] ?? null;
  const rateY = crime.ratePerLakh[String(focusYear)];
  const csY = crime.chargesheetRate[String(focusYear)];

  const headline = t(`trend.${dir}`, {
    city: crime.cityName, from: fmtN(first), to: fmtN(last), y0: firstYear, y1: lastYear,
    pct: Math.abs(Math.round(spanPct)),
  });

  const inScope = (h: CrimeHeadItem) => scope === 'all' || h.scope === scope;
  const toggle = (id: string) =>
    setHidden((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[600px]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {t('eyebrow')}{crime.state ? ` · ${crime.state}` : ''}
          </span>
          <h1 className="mt-2.5 font-display text-[27px] font-medium leading-tight text-ink">
            {t('title', { city: crime.cityName })}
          </h1>
          <p className="mt-2 max-w-[600px] text-[12.5px] leading-snug text-ink-soft">
            {t.rich('howToRead', { strong: (c) => <strong className="font-semibold">{c}</strong> })}
          </p>
        </div>
        <LocaleLink href="/methodology" className="inline-flex flex-none items-center gap-1.5 rounded-full border border-accent-line px-3.5 py-2 text-[13px] font-semibold text-accent-deep">
          <IconInfo size={14} strokeWidth={1.7} />
          {t('methodology')}
        </LocaleLink>
      </div>

      {/* Year slider */}
      <div className="mt-5 flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3.5">
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{t('filters.year')}</span>
        <input type="range" min={firstYear} max={lastYear} step={1} value={focusYear}
          onChange={(e) => setFocusYear(+e.target.value)} aria-label={t('filters.year')}
          className="h-[22px] flex-1 cursor-pointer accent-accent" />
        <span className="min-w-[44px] font-display text-[19px] font-semibold text-accent-deep">{focusYear}</span>
      </div>

      {/* Real KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label={t('stats.total', { year: focusYear })} value={fmtN(cur)} sub={t('stats.reportedCases')} />
        <StatCard label={t('stats.ratePerLakh')} value={rateY != null ? rateY.toFixed(1) : t('stats.na')} sub={t('stats.censusBase', { year: crime.populationBaseYear })} />
        <StatCard label={t('stats.changeVs', { year: prevYear })} value={`${yoy >= 0 ? '+' : '-'}${Math.abs(Math.round(yoy))}%`}
          sub={yoy >= 0 ? t('stats.moreReported') : t('stats.fewerReported')} dir={yoy >= 2 ? 'up' : yoy <= -2 ? 'down' : 'flat'} />
        <StatCard label={t('stats.chargesheet')} value={csY != null ? `${csY.toFixed(0)}%` : t('stats.na')}
          sub={csY != null ? t('stats.chargesheetSub', { year: focusYear }) : t('stats.chargesheetNA', { year: focusYear })} />
      </div>

      {/* Headline + caveat */}
      <div className="mt-6 flex flex-wrap items-start gap-4 sm:gap-6">
        <h2 className="w-full font-display text-[21px] font-normal leading-snug text-ink sm:w-auto sm:min-w-[300px] sm:max-w-[580px] sm:flex-1 sm:text-[24px]">{headline}</h2>
        <div className="flex w-full gap-2.5 rounded-md bg-accent-soft px-4 py-3.5 sm:w-auto sm:min-w-[280px] sm:max-w-[400px] sm:flex-1">
          <IconInfo size={17} className="mt-0.5 flex-none text-accent-deep" strokeWidth={1.7} />
          <p className="text-[13px] leading-snug text-ink">{t('caveat')}</p>
        </div>
      </div>

      {hasCategories ? (
        <>
          {/* Filters (design handoff): scope, then a full-width wrapping chip group.
              Stacks vertically on mobile so chips never squeeze into a side column. */}
          <div className="mt-6 flex flex-col gap-3 rounded-md border border-line bg-surface px-4 py-3 sm:flex-row sm:items-start sm:gap-5">
            <div className="flex flex-none items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{t('filters.scope')}</span>
              <ScopeSeg value={scope} onChange={setScope} labels={{ all: t('scope.all'), public: t('scope.public'), domestic: t('scope.domestic') }} />
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">{t('filters.crimeHead')}</span>
              {headCatalog.filter(inScope).map((h) => {
                const off = hidden.has(h.id);
                return (
                  <button key={h.id} type="button" onClick={() => toggle(h.id)} aria-pressed={!off}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] ${off ? 'border-line text-ink-faint opacity-60' : 'border-accent-line text-ink'}`}>
                    <span className="h-2 w-2 flex-none rounded-full" style={{ background: catFor(crime, h.id) }} />
                    {HEAD_SHORT[h.id] ?? h.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 1: selected-heads line (filter-dependent) + share-by-head pie. */}
          <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <SelectedHeadsTrend crime={crime} focusYear={focusYear} scope={scope} hidden={hidden} inScope={inScope} />
            <ShareByHead crime={crime} year={focusYear} scope={scope} hidden={hidden} inScope={inScope} />
          </div>
          {/* Row 2: compare two years by head, full width so the axis labels breathe. */}
          <div className="mt-4">
            <CompareByHead crime={crime} scope={scope} hidden={hidden} inScope={inScope} />
          </div>
          {crime.heads.scopeNote && (
            <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">{crime.heads.scopeNote} {crime.heads.regimeNote}</p>
          )}
        </>
      ) : (
        // No categories for this city: keep the simple total trend + year-on-year view.
        <>
          <div className="mt-6">
            <ChartFrame title={t('totalOverTime', { y0: firstYear, y1: lastYear })} filename={`${cityId}-total-trend`}>
              <TrendLine values={values} years={years} measure="cases" focusYear={focusYear} width={880} height={230} ariaLabel={t('totalOverTime', { y0: firstYear, y1: lastYear })} />
            </ChartFrame>
          </div>
          <div className="mt-4">
            <CompareTwoYears totals={crime.totals} years={years} cityId={cityId} />
          </div>
        </>
      )}

      {justice && <JusticeSection justice={justice} />}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="max-w-[720px] text-[11.5px] leading-relaxed text-ink-faint">
          {crime.source} {crime.populationBaseNote}{' '}
          <LocaleLink href="/methodology" className="underline underline-offset-2">{t('footer.methodologyLink')}</LocaleLink>
        </span>
        <span className="whitespace-nowrap text-[11.5px] text-ink-faint">{t('footer.lastUpdated', { date: crime.lastUpdated })}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ head charts -- */

const HEAD_SHORT: Record<string, string> = {
  cruelty: 'Cruelty (husband/family)', molestation: 'Assault on modesty', kidnap_abduction: 'Kidnap & abduction',
  rape: 'Rape', pocso_girls: 'POCSO (girls <18)', trafficking: 'Trafficking (ITPA)', sexual_harassment: 'Sexual harassment',
  stalking: 'Stalking', insult_modesty: 'Insult to modesty', cyber: 'Cyber crimes', dowry_deaths: 'Dowry deaths', acid_attack: 'Acid attack',
};

// Short x-axis labels for the grouped bars (the full names overlap/merge).
const HEAD_ABBR: Record<string, string> = {
  cruelty: 'Cruelty', molestation: 'Molest.', kidnap_abduction: 'Kidnap', rape: 'Rape',
  pocso_girls: 'POCSO', trafficking: 'Traffick', sexual_harassment: 'Harass', stalking: 'Stalk',
  insult_modesty: 'Insult', cyber: 'Cyber', dowry_deaths: 'Dowry', acid_attack: 'Acid',
};

function catFor(crime: CrimeData, id: string): string {
  const latest = crime.heads.availableYears[crime.heads.availableYears.length - 1];
  const cat = (latest != null && crime.heads.byYear[String(latest)]?.items) || [];
  return catColor(Math.max(0, cat.findIndex((h) => h.id === id)));
}

// The trend line is FILTER-DEPENDENT (design: "total of selected heads"). With no
// filter active it shows the full real city total across all years (2020-2024);
// once you narrow the scope or heads it switches to the sum of the selected heads,
// over the years that actually have a head-wise split (never interpolated).
function SelectedHeadsTrend({
  crime, focusYear, scope, hidden, inScope,
}: { crime: CrimeData; focusYear: number; scope: Scope; hidden: Set<string>; inScope: (h: CrimeHeadItem) => boolean }) {
  const t = useTranslations('crime');
  const avail = crime.heads.availableYears;
  const allSelected = hidden.size === 0 && scope === 'all';

  let years: number[];
  let values: number[];
  let title: string;
  if (allSelected) {
    years = crime.years;
    values = years.map((y) => crime.totals[String(y)] ?? 0);
    title = t('totalOverTime', { y0: years[0], y1: years[years.length - 1] });
  } else {
    years = avail;
    values = avail.map((y) =>
      (crime.heads.byYear[String(y)]?.items ?? [])
        .filter((h) => h.cases != null && inScope(h) && !hidden.has(h.id))
        .reduce((s, h) => s + (h.cases as number), 0));
    title = t('heads.selectedTrend', { y0: avail[0], y1: avail[avail.length - 1] });
  }
  const fy = years.includes(focusYear) ? focusYear : years[years.length - 1]!;
  const [ref, w] = useWidth();
  const chartW = Math.max(240, w || 520);
  return (
    <ChartFrame title={title} filename={`${crime.city}-trend`}>
      <div ref={ref}>
        <TrendLine values={values} years={years} measure="cases" focusYear={fy} width={chartW} height={220} ariaLabel={title} />
      </div>
    </ChartFrame>
  );
}

function ShareByHead({
  crime, year, scope, hidden, inScope,
}: { crime: CrimeData; year: number; scope: Scope; hidden: Set<string>; inScope: (h: CrimeHeadItem) => boolean }) {
  const t = useTranslations('crime');
  const yd: CrimeHeadYear | undefined = crime.heads.byYear[String(year)];

  if (!yd) {
    return (
      <div className="rounded-md border border-line bg-surface p-4">
        <div className="mb-2 text-[13px] font-semibold text-ink-soft">{t('breakdownTitle')}</div>
        <div className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line px-5 text-center">
          <span className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft">{t('heads.naYearBadge')}</span>
          <p className="max-w-[320px] text-[11.5px] leading-snug text-ink-soft">{t('heads.naYear', { year, years: crime.heads.availableYears.join(', ') })}</p>
        </div>
      </div>
    );
  }

  const known = yd.items.filter((i): i is Head => i.cases !== null);
  const notAvail = yd.items.filter((i) => i.cases === null);
  const total = yd.total || 1;

  // PRINCIPAL-OFFENCE RULE (do not "fix" into a false equality): NCRB counts one
  // most-serious head per FIR, so heads never double-count and (all heads +
  // "Other offences") == the city total. "Other offences" (yd.otherCases) is the
  // REAL remainder of smaller heads - never invented. Heads hidden by the viewer
  // or excluded by the scope filter go into a SEPARATE "Filtered out" wedge, so
  // "Other offences" stays the true remainder. A null head is ABSENCE (listed
  // below), never a zero slice and never folded into either bucket.
  let filteredSum = 0;
  const slices: { name: string; val: number; fill: string }[] = [];
  known.forEach((h) => {
    const shown = inScope(h) && !hidden.has(h.id);
    if (!shown) { filteredSum += h.cases; return; }
    if (h.cases > 0) slices.push({ name: HEAD_SHORT[h.id] ?? h.name, val: h.cases, fill: catFor(crime, h.id) });
  });
  if (filteredSum > 0) slices.push({ name: t('heads.filtered'), val: filteredSum, fill: FILTERED_FILL });
  if (yd.otherCases > 0) slices.push({ name: t('heads.other'), val: yd.otherCases, fill: OTHER_FILL });

  const pct = (v: number) => `${((v / total) * 100).toFixed(v / total < 0.1 ? 1 : 0)}%`;
  const shownHeads = known.filter((h) => inScope(h) && !hidden.has(h.id) && h.cases > 0);

  return (
    <div className="min-w-0 rounded-md border border-line bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className="text-[13px] font-semibold text-ink-soft">{t('heads.shareTitle', { year })}</div>
        <span className="text-[11px] text-ink-faint">{t('heads.sourceTag')}</span>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="flex-none pt-0.5"><Donut items={slices.length ? slices : [{ name: t('heads.other'), val: total, fill: OTHER_FILL }]} size={148} ariaLabel={t('heads.shareTitle', { year })} /></div>
        <ul className="w-full min-w-0 flex-1 space-y-0.5">
          {shownHeads.map((h) => (
            <li key={h.id} className="flex items-center gap-2 px-1 py-0.5 text-[11.5px]">
              <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: catFor(crime, h.id) }} />
              <span className="flex-1 truncate text-ink">{HEAD_SHORT[h.id] ?? h.name}</span>
              <span className="tabular-nums text-ink-soft">{fmtN(h.cases)}</span>
              <span className="w-9 text-right tabular-nums text-ink-faint">{pct(h.cases)}</span>
            </li>
          ))}
          {filteredSum > 0 && (
            <LegendRow fill={FILTERED_FILL} name={t('heads.filtered')} val={filteredSum} pct={pct(filteredSum)} />
          )}
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

function LegendRow({ fill, name, val, pct }: { fill: string; name: string; val: number; pct: string }) {
  return (
    <li className="flex items-center gap-2 px-1 py-0.5 text-[11.5px]">
      <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: fill }} />
      <span className="flex-1 text-ink-soft">{name}</span>
      <span className="tabular-nums text-ink-soft">{fmtN(val)}</span>
      <span className="w-9 text-right tabular-nums text-ink-faint">{pct}</span>
    </li>
  );
}

function CompareByHead({
  crime, scope, hidden, inScope,
}: { crime: CrimeData; scope: Scope; hidden: Set<string>; inScope: (h: CrimeHeadItem) => boolean }) {
  const t = useTranslations('crime');
  const avail = crime.heads.availableYears;
  const [b, setB] = useState<number>(avail[avail.length - 1]!); // later year
  const [a, setA] = useState<number>(avail[0]!); // earlier year

  const ydA = crime.heads.byYear[String(a)];
  const ydB = crime.heads.byYear[String(b)];

  // Compare only heads present (real) in BOTH selected years, in scope, not hidden.
  const bars = useMemo(() => {
    if (!ydA || !ydB) return [];
    const mapB = new Map(ydB.items.filter((i) => i.cases !== null).map((i) => [i.id, i.cases as number]));
    return ydA.items
      .filter((h) => h.cases !== null && inScope(h) && !hidden.has(h.id) && mapB.has(h.id))
      .map((h) => ({ name: HEAD_SHORT[h.id] ?? h.name, short: HEAD_ABBR[h.id] ?? HEAD_SHORT[h.id] ?? h.name, cur: mapB.get(h.id)!, prev: h.cases as number }));
  }, [ydA, ydB, scope, hidden, inScope]);

  const [ref, cw] = useWidth();
  // Grouped bars need room per head to stay readable; when the card is narrower
  // than that (mobile), the CHART scrolls inside its card - never the page.
  const chartW = Math.max(cw || 320, Math.min(bars.length, 6) * 92 + 56);
  const scrolls = chartW > (cw || 0) + 4;

  return (
    <div className="min-w-0 rounded-md border border-line bg-surface p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-ink-soft">{t('heads.compareTitle')}</div>
        <div className="flex items-center gap-2 text-[13px]">
          <YearPicker label={t('charts.earlierYear')} value={a} years={avail} onChange={setA} />
          <span className="text-ink-faint">vs</span>
          <YearPicker label={t('charts.laterYear')} value={b} years={avail} onChange={setB} />
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] text-ink-faint">{t('heads.compareHint')}</p>
        {scrolls && <span className="flex-none text-[10.5px] font-semibold text-accent-deep">scroll →</span>}
      </div>
      {bars.length ? (
        <>
          <div ref={ref} className="-mx-1 overflow-x-auto px-1">
            <GroupedBars bars={bars} yearCur={b} yearPrev={a} measure="cases" width={chartW} height={250} ariaLabel={t('heads.compareTitle')} />
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--data-domestic)' }} />{a}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--data-public)' }} />{b}</span>
          </div>
        </>
      ) : (
        <p className="flex min-h-[210px] items-center justify-center px-4 text-center text-[11.5px] leading-snug text-ink-soft">{t('heads.compareEmpty')}</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- bits ---- */

function ScopeSeg({ value, onChange, labels }: { value: Scope; onChange: (s: Scope) => void; labels: Record<Scope, string> }) {
  const opts: Scope[] = ['all', 'public', 'domestic'];
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line">
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} aria-pressed={value === o}
          className={`px-3 py-1 text-[12px] font-semibold ${value === o ? 'bg-accent text-white' : 'bg-surface text-ink-soft hover:bg-accent-soft'}`}>
          {labels[o]}
        </button>
      ))}
    </div>
  );
}

function CompareTwoYears({ totals, years, cityId }: { totals: Record<string, number>; years: number[]; cityId: string }) {
  const t = useTranslations('crime.charts');
  const first = years[0]!;
  const last = years[years.length - 1]!;
  const [a, setA] = useState<number>(first);
  const [b, setB] = useState<number>(last);
  const [ck, setCk] = useState<string>(cityId);
  if (ck !== cityId) { setCk(cityId); setA(first); setB(last); }

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
        {pct === 0 ? t('compareSame', { y0: a, y1: b }) : t('compareChange', { pct: Math.abs(pct), dir: pct > 0 ? t('compareMore') : t('compareFewer'), y0: a, y1: b })}
      </p>
    </div>
  );
}

function YearPicker({ label, value, years, onChange }: { label: string; value: number; years: number[]; onChange: (y: number) => void }) {
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(+e.target.value)} aria-label={label}
        className="cursor-pointer rounded-md border border-line bg-paper px-2.5 py-1.5 text-[13px] font-semibold text-ink">
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
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
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${Math.max(2, frac * 100)}%`, background: tone === 'cur' ? 'var(--data-public)' : 'var(--data-domestic)' }} />
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
