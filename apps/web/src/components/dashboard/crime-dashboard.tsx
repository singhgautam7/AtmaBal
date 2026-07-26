'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CityMeta, CrimeData, JusticeData } from '@/data/types';
import { fmtN } from '@/lib/format';
import { IconInfo, IconTrendArrow, IconChevronRight, IconChevronDown } from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { TrendLine, YearBars, Ring } from './charts';
import { ChartFrame } from './chart-frame';

type TrendDir = 'up' | 'down' | 'flat';

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
  const selectable = cities.filter((c) => c.hasCrime);

  const [cityId, setCityId] = useState('bengaluru');
  const crime = allCrime[cityId]!;
  const years = crime.years;
  const [focusYear, setFocusYear] = useState<number>(years[years.length - 1]!);

  // Initial city from the URL (?city=), so the header dropdown and deep links work.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('city');
    if (c && allCrime[c]) {
      setCityId(c);
      const ys = allCrime[c].years;
      setFocusYear(ys[ys.length - 1]!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep focusYear valid when the city changes, and reflect it in the URL.
  const changeCity = (id: string) => {
    setCityId(id);
    const ys = allCrime[id]!.years;
    setFocusYear(ys[ys.length - 1]!);
    const url = new URL(window.location.href);
    url.searchParams.set('city', id);
    window.history.replaceState(null, '', url);
  };

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
    const dir: TrendDir = spanPct >= 8 ? 'up' : spanPct <= -8 ? 'down' : 'flat';
    return { values, fi, pi, cur, prev, yoy, first, last, spanPct, dir };
  }, [crime, years, focusYear]);

  const { values, pi, cur, yoy, first, last, spanPct, dir } = model;
  const prevYear = years[pi]!;
  const y0 = years[0]!;
  const y1 = years[years.length - 1]!;
  const justice = justiceByCity[cityId] ?? null;

  const headline = t(`trend.${dir}`, {
    city: crime.cityName,
    from: fmtN(first),
    to: fmtN(last),
    y0,
    y1,
    pct: Math.abs(Math.round(spanPct)),
  });

  return (
    <div>
      {/* Header + city switcher */}
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
        <div className="flex items-center gap-2">
          <CitySwitch cities={selectable} value={cityId} onChange={changeCity} label={t('changeCity')} />
          <LocaleLink
            href="/methodology"
            className="inline-flex flex-none items-center gap-1.5 rounded-full border border-accent-line px-3.5 py-2 text-[13px] font-semibold text-accent-deep"
          >
            <IconInfo size={14} strokeWidth={1.7} />
            {t('methodology')}
          </LocaleLink>
        </div>
      </div>

      {/* Year slider */}
      <div className="mt-5 flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3.5">
        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {t('filters.year')}
        </span>
        <input
          type="range"
          min={y0}
          max={y1}
          step={1}
          value={focusYear}
          onChange={(e) => setFocusYear(+e.target.value)}
          aria-label={t('filters.year')}
          className="h-[22px] flex-1 cursor-pointer accent-accent"
        />
        <span className="min-w-[44px] font-display text-[19px] font-semibold text-accent-deep">
          {focusYear}
        </span>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard label={t('stats.total', { year: focusYear })} value={fmtN(cur)} sub={t('stats.reportedCases')} />
        <StatCard
          label={t('stats.ratePerLakh')}
          value={crime.ratePerLakh != null ? crime.ratePerLakh.toFixed(1) : '—'}
          sub={t('stats.censusBase')}
        />
        <StatCard
          label={t('stats.changeVs', { year: prevYear })}
          value={`${yoy >= 0 ? '+' : '−'}${Math.abs(Math.round(yoy))}%`}
          sub={yoy >= 0 ? t('stats.moreReported') : t('stats.fewerReported')}
          dir={yoy >= 2 ? 'up' : yoy <= -2 ? 'down' : 'flat'}
        />
        <StatCard
          label={t('stats.chargesheet')}
          value={crime.chargesheetRate != null ? `${crime.chargesheetRate.toFixed(0)}%` : '—'}
          sub={t('stats.chargesheetSub', { year: y1 })}
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

      {/* Charts: real total trend + real year bars */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ChartFrame title={t('trendChartTitle', { y0, y1 })} filename={`${cityId}-total-trend`}>
          <TrendLine
            values={values}
            years={years}
            measure="cases"
            focusYear={focusYear}
            width={520}
            height={220}
            ariaLabel={t('trendChartTitle', { y0, y1 })}
          />
        </ChartFrame>
        <ChartFrame title={t('byYearTitle')} filename={`${cityId}-by-year`}>
          <YearBars years={years} values={values} focusYear={focusYear} width={520} height={220} ariaLabel={t('byYearTitle')} />
        </ChartFrame>
      </div>

      {/* Honest per-head note (breakdown pending from NCRB head-wise tables) */}
      <div className="mt-4 flex items-start gap-3 rounded-md border border-line bg-surface px-4 py-4">
        <IconInfo size={18} className="mt-0.5 flex-none text-ink-faint" strokeWidth={1.7} />
        <div>
          <div className="text-[13px] font-semibold text-ink-soft">{t('perHead.title')}</div>
          <p className="mt-1 max-w-[720px] text-[12px] leading-snug text-ink-soft">
            {crime.headBreakdownNote}
          </p>
        </div>
      </div>

      {justice && <JusticeSection justice={justice} />}

      {/* Footer / sources */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="max-w-[720px] text-[11.5px] leading-relaxed text-ink-faint">
          {crime.source}. {crime.populationBaseNote} No safety score, no city-vs-city comparison.{' '}
          <LocaleLink href="/methodology" className="underline underline-offset-2">
            {t('footer.methodologyLink')}
          </LocaleLink>
        </span>
        <span className="whitespace-nowrap text-[11.5px] text-ink-faint">
          {t('footer.lastUpdated', { date: crime.lastUpdated })}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- bits ---- */

function CitySwitch({
  cities,
  value,
  onChange,
  label,
}: {
  cities: CityMeta[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none rounded-full border border-line-strong bg-surface py-2 pl-3.5 pr-8 text-[13px] font-semibold text-ink"
      >
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <IconChevronDown
        size={12}
        strokeWidth={1.8}
        className="pointer-events-none absolute right-3 text-ink-faint"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  dir,
}: {
  label: string;
  value: string;
  sub: string;
  dir?: 'up' | 'down' | 'flat';
}) {
  return (
    <div className="rounded-md border border-line bg-surface px-[18px] py-4">
      <div className="min-h-[26px] text-[10.5px] font-semibold uppercase leading-tight tracking-[0.04em] text-ink-faint">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="font-display text-[31px] font-semibold leading-none text-ink">{value}</span>
        {dir && (
          <span className="inline-flex text-ink-soft">
            <IconTrendArrow dir={dir} />
          </span>
        )}
      </div>
      <div className="mt-1.5 text-[11.5px] text-ink-soft">{sub}</div>
    </div>
  );
}

function JusticeSection({ justice }: { justice: JusticeData }) {
  const t = useTranslations('crime.justice');
  return (
    <section className="mt-8 border-t border-line pt-6">
      <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {t('eyebrow')}
      </span>
      <h2 className="mt-2 max-w-[640px] font-display text-[22px] font-normal leading-snug text-ink">
        {t('title')}
      </h2>
      <div className="mt-4 grid gap-3.5 md:grid-cols-[1.1fr_1fr_1fr]">
        <div className="flex items-center gap-4 rounded-md border border-line bg-surface p-[18px]">
          <div className="relative flex h-[132px] w-[132px] flex-none items-center justify-center">
            <Ring pct={justice.convictionRate} color="var(--conv)" size={132} ariaLabel={t('convictionRate')} />
            <div className="absolute text-center">
              <div className="font-display text-[28px] font-semibold leading-none text-ink">
                {justice.convictionRate}%
              </div>
              <div className="mt-0.5 text-[10px] text-ink-faint">{t('convicted')}</div>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[13px] font-semibold text-ink-soft">{t('convictionRate')}</div>
            <p className="text-[12px] leading-relaxed text-ink-soft">{t('convictionBody')}</p>
          </div>
        </div>
        <ProgressCard
          label={t('pendingInvestigation')}
          value={`~${justice.pendingInvestigationRate}%`}
          pct={justice.pendingInvestigationRate}
          color="var(--cat-4)"
          body={t('pendingInvestigationBody')}
        />
        <ProgressCard
          label={t('pendingTrial')}
          value={`~${justice.pendingTrialRate}%`}
          pct={justice.pendingTrialRate}
          color="var(--data-domestic)"
          body={t('pendingTrialBody')}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent-line bg-accent-soft px-[18px] py-4">
        <p className="max-w-[620px] text-[14px] leading-snug text-ink">{t('callout')}</p>
        <LocaleLink
          href="/options"
          className="inline-flex flex-none items-center gap-1.5 rounded-sm bg-accent px-4 py-[11px] text-[14px] font-semibold text-white hover:bg-accent-deep"
        >
          {t('exploreOptions')}
          <IconChevronRight size={15} strokeWidth={1.8} />
        </LocaleLink>
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">{t('provisional')}</p>
    </section>
  );
}

function ProgressCard({
  label,
  value,
  pct,
  color,
  body,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  body: string;
}) {
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
