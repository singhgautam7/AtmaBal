'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CrimeData, JusticeData, Measure, ScopeFilter } from '@/data/types';
import {
  aggregateAt,
  headsInScope,
  measureLabel,
  measureValue,
  pieData,
  shortName,
  fmtMeasure,
  yoyDir,
} from '@/lib/crime';
import { cn } from '@/lib/cn';
import {
  IconInfo,
  IconTrendArrow,
  IconChevronRight,
  IconChevronLeft,
} from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { TrendLine, GroupedBars, Donut, Ring } from './charts';
import { ChartFrame } from './chart-frame';

export function CrimeDashboard({
  crime,
  justice,
}: {
  crime: CrimeData;
  justice: JusticeData;
}) {
  const t = useTranslations('crime');
  const pop = crime.populationLakh;

  const firstYear = crime.years[0]!;
  const lastYear = crime.years[crime.years.length - 1]!;

  const [scope, setScope] = useState<ScopeFilter>('all');
  const [measure, setMeasure] = useState<Measure>('cases');
  const [focusYear, setFocusYear] = useState<number>(lastYear);
  // Grouped-bar comparison: any two years (HANDOFF v2 — steppers, not a fixed pair).
  const [cmpA, setCmpA] = useState<number>(lastYear);
  const [cmpB, setCmpB] = useState<number>(crime.years[crime.years.length - 2] ?? firstYear);
  // null = "all heads in the current scope selected"
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);

  const clampYear = (y: number) => Math.min(lastYear, Math.max(firstYear, y));

  const model = useMemo(() => {
    const scopeCats = headsInScope(crime.heads, scope);
    const allIds = scopeCats.map((h) => h.id);
    const sel = selectedIds ?? allIds;
    let selCats = scopeCats.filter((h) => sel.includes(h.id));
    if (!selCats.length) selCats = scopeCats;

    const fi = crime.years.indexOf(focusYear);
    const pi = Math.max(0, fi - 1);

    const totals = crime.years.map(
      (_, i) => +aggregateAt(selCats, i, measure, pop).toFixed(measure === 'rate' ? 1 : 0),
    );

    const curTotal = aggregateAt(selCats, fi, measure, pop);
    const prevTotal = aggregateAt(selCats, pi, measure, pop);
    const yoy = prevTotal ? ((curTotal - prevTotal) / prevTotal) * 100 : 0;
    const rateTotal = selCats.reduce((s, c) => s + (c.cases[fi] ?? 0), 0) / pop;
    const topHead =
      selCats
        .map((c) => ({ head: c, v: measureValue(c, fi, measure, pop) }))
        .sort((a, b) => b.v - a.v)[0] ?? null;

    const pie = pieData(selCats, fi, measure, pop, t('charts.otherHeads'));

    return { scopeCats, selCats, allIds, sel, fi, pi, totals, curTotal, prevTotal, yoy, rateTotal, topHead, pie };
  }, [crime, scope, measure, focusYear, selectedIds, pop, t]);

  const { scopeCats, selCats, sel, pi, totals, curTotal, yoy, rateTotal, topHead, pie } = model;
  const prevYear = crime.years[pi]!;
  const mLabel = measureLabel(measure);

  const toggleHead = (id: string) => {
    setSelectedIds((prev) => {
      const base = prev ?? model.allIds;
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
      return next.length ? next : null;
    });
  };

  const headline =
    scope === 'domestic' ? t('headline.domestic') : scope === 'public' ? t('headline.public') : t('headline.all');

  const unit = measure === 'rate' ? '/ lakh' : measure === 'victims' ? 'victims' : 'cases';

  return (
    <div>
      {/* Header + how to read */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[560px]">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {t('eyebrow')}
          </span>
          <h1 className="mt-2.5 font-display text-[27px] font-medium leading-tight text-ink">
            {t('title')}
          </h1>
          <div
            className="mt-2 flex items-start gap-2 rounded-md px-3 py-2"
            style={{ border: '1px solid rgba(201,154,46,0.4)', background: 'rgba(201,154,46,0.1)' }}
          >
            <span
              className="mt-px flex-none rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-white"
              style={{ background: 'var(--cat-4)' }}
            >
              {t('illustrativeBadge')}
            </span>
            <p className="text-[11.5px] leading-snug text-ink-soft">{t('illustrativeNote')}</p>
          </div>
          <p className="mt-2 max-w-[560px] text-[12.5px] leading-snug text-ink-soft">
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

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-md border border-line bg-surface px-4 py-3.5">
        <FilterGroup label={t('filters.scope')}>
          <Segmented
            options={[
              { id: 'all', label: t('scope.all') },
              { id: 'public', label: t('scope.public') },
              { id: 'domestic', label: t('scope.domestic') },
            ]}
            value={scope}
            onChange={(v) => {
              setScope(v as ScopeFilter);
              setSelectedIds(null);
            }}
          />
        </FilterGroup>
        <FilterGroup label={t('filters.measure')}>
          <Segmented
            options={[
              { id: 'cases', label: t('measure.cases') },
              { id: 'victims', label: t('measure.victims') },
              { id: 'rate', label: t('measure.rate') },
            ]}
            value={measure}
            onChange={(v) => setMeasure(v as Measure)}
          />
        </FilterGroup>
        <div className="flex min-w-[230px] flex-1 items-center gap-3">
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            {t('filters.year')}
          </span>
          <input
            type="range"
            min={crime.years[0]}
            max={crime.years[crime.years.length - 1]}
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
      </div>

      {/* Crime head chips */}
      <div className="mt-3 flex items-start gap-2.5">
        <span className="whitespace-nowrap pt-[7px] text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {t('filters.crimeHead')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {scopeCats.map((h) => {
            const active = sel.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleHead(h.id)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-[11px] py-1.5 text-[12px] font-semibold',
                  active
                    ? 'border-accent bg-accent-soft text-accent-deep'
                    : 'border-line-strong bg-surface text-ink-soft',
                )}
              >
                {shortName(h)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <StatCard
          label={t('stats.measureYear', { measure: mLabel, year: focusYear })}
          value={fmtMeasure(curTotal, measure)}
          sub={t('stats.headsSelected', { selected: selCats.length, total: scopeCats.length })}
        />
        <StatCard
          label={t('stats.ratePerLakh', { year: focusYear })}
          value={rateTotal.toFixed(1)}
          sub={t('stats.perWomen')}
        />
        <StatCard
          label={t('stats.changeVs', { year: prevYear })}
          value={`${yoy >= 0 ? '+' : '−'}${Math.abs(Math.round(yoy))}%`}
          sub={yoy >= 0 ? t('stats.moreReported') : t('stats.fewerReported')}
          dir={yoyDir(model.curTotal, model.prevTotal)}
        />
        <StatCard
          label={t('stats.mostReported', { year: focusYear })}
          value={topHead ? shortName(topHead.head) : '—'}
          sub={topHead ? `${fmtMeasure(topHead.v, measure)} ${unit}` : ''}
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

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <ChartFrame
          title={t('charts.overTime', { measure: mLabel })}
          filename={`bengaluru-${measure}-over-time`}
        >
          <TrendLine
            values={totals}
            years={crime.years}
            measure={measure}
            focusYear={focusYear}
            width={560}
            height={220}
            ariaLabel={t('charts.overTime', { measure: mLabel })}
          />
        </ChartFrame>

        <ChartFrame title={t('charts.shareByHead', { year: focusYear })} filename={`bengaluru-share-${focusYear}`}>
          <div className="flex items-center gap-4">
            <span className="flex-none">
              <Donut items={pie} size={168} ariaLabel={t('charts.shareByHead', { year: focusYear })} />
            </span>
            <ul className="flex min-w-[150px] flex-1 flex-col gap-1.5">
              {pie.map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px] text-ink-soft">
                  <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ background: l.fill }} />
                  <span className="flex-1 leading-tight">{l.name}</span>
                  <span className="font-bold text-ink">{l.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartFrame>
      </div>

      <div className="mt-4">
        <ChartFrame
          title={t('charts.compareTwoYears')}
          filename={`bengaluru-compare-${cmpA}-${cmpB}`}
          controls={
            <div className="flex items-center gap-2">
              <YearStepper
                value={cmpA}
                min={firstYear}
                max={lastYear}
                onChange={(y) => setCmpA(clampYear(y))}
                label={t('charts.compareA')}
                decLabel={t('charts.earlierYear')}
                incLabel={t('charts.laterYear')}
              />
              <span className="text-[11px] text-ink-faint">vs</span>
              <YearStepper
                value={cmpB}
                min={firstYear}
                max={lastYear}
                onChange={(y) => setCmpB(clampYear(y))}
                label={t('charts.compareB')}
                decLabel={t('charts.earlierYear')}
                incLabel={t('charts.laterYear')}
              />
            </div>
          }
        >
          <GroupedBars
            heads={selCats}
            iCur={crime.years.indexOf(cmpA)}
            iPrev={crime.years.indexOf(cmpB)}
            yearCur={cmpA}
            yearPrev={cmpB}
            measure={measure}
            populationLakh={pop}
            width={880}
            height={230}
            ariaLabel={t('charts.compareTwoYears')}
          />
          <div className="mt-1 flex gap-4 text-[11.5px] text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-data-public" />
              {cmpA}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-data-domestic" />
              {cmpB}
            </span>
          </div>
        </ChartFrame>
      </div>

      <JusticeSection justice={justice} />

      {/* Footer / sources */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="max-w-[680px] text-[11.5px] leading-relaxed text-ink-faint">
          {t('footer.source')}{' '}
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="tablist" className="flex rounded-full border border-line bg-paper p-[3px]">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'whitespace-nowrap rounded-full px-3.5 py-[7px] text-[13px] font-semibold transition-colors',
              active ? 'bg-ink text-paper' : 'bg-transparent text-ink-soft',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function YearStepper({
  value,
  min,
  max,
  onChange,
  label,
  decLabel,
  incLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (y: number) => void;
  label: string;
  decLabel: string;
  incLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-px overflow-hidden rounded-lg border border-line-strong bg-paper"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={decLabel}
        className="inline-flex items-center px-[7px] py-1.5 text-ink-soft disabled:opacity-30"
      >
        <IconChevronLeft size={11} strokeWidth={1.8} />
      </button>
      <span
        className="min-w-[36px] text-center text-[13px] font-semibold tabular-nums text-ink"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={incLabel}
        className="inline-flex items-center px-[7px] py-1.5 text-ink-soft disabled:opacity-30"
      >
        <IconChevronRight size={11} strokeWidth={1.8} />
      </button>
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
