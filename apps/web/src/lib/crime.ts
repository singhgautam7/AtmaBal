/**
 * Crime dashboard math - ported faithfully from the design concept so the
 * numbers, aggregation and "nice" axis rounding match the mockup exactly.
 * Pure functions, unit-tested; no rendering here.
 */
import type { CrimeHead, Measure, Scope, ScopeFilter } from '@/data/types';
import { fmtMeasure } from './format';

/** Categorical palette for the composition donut (tokenised, colour-blind-safe). */
export const CAT_COLORS = [
  'var(--accent)',
  'var(--data-domestic)',
  'var(--cat-3)',
  'var(--cat-4)',
  'var(--cat-5)',
  'var(--cat-6)',
  'var(--cat-7)',
  'var(--cat-8)',
] as const;

export function catColor(i: number): string {
  return CAT_COLORS[i % CAT_COLORS.length]!;
}

/** Short chip labels for long crime-head names (keyed by stable head id). */
const SHORT_NAMES: Record<string, string> = {
  rape: 'Rape',
  molestation: 'Molest.',
  insult_to_modesty: 'Insult',
  kidnapping_abduction: 'Kidnap',
  acid_attack: 'Acid',
  trafficking: 'Traffick',
  cyber: 'Cyber',
  pocso: 'POCSO',
  cruelty_husband_relatives: 'Cruelty',
  dowry_deaths: 'Dowry',
  abetment_suicide: 'Abetmt',
};

export function shortName(head: Pick<CrimeHead, 'id' | 'name'>): string {
  return SHORT_NAMES[head.id] ?? head.name.slice(0, 7);
}

/** Round up to a "nice" axis maximum (1, 2, 5, 10 × 10^n). */
export function nice(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  const n = (v || 1) / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * p;
}

/** One head's value at year-index `i` under the chosen measure. */
export function measureValue(
  head: CrimeHead,
  i: number,
  measure: Measure,
  populationLakh: number,
): number {
  const c = head.cases[i] ?? 0;
  if (measure === 'victims') return Math.round(c * head.victimFactor);
  if (measure === 'rate') return +(c / populationLakh).toFixed(1);
  return c;
}

export function measureLabel(measure: Measure): string {
  return measure === 'rate'
    ? 'Rate per lakh women'
    : measure === 'victims'
      ? 'Victims'
      : 'Cases registered';
}

/** Heads that belong to the chosen scope filter (public / domestic / all). */
export function headsInScope(heads: CrimeHead[], scope: ScopeFilter): CrimeHead[] {
  return heads.filter((h) => scope === 'all' || h.scope === (scope as Scope));
}

/** Aggregate (sum) of the given heads at year-index `i` under a measure. */
export function aggregateAt(
  heads: CrimeHead[],
  i: number,
  measure: Measure,
  populationLakh: number,
): number {
  return heads.reduce((s, h) => s + measureValue(h, i, measure, populationLakh), 0);
}

export interface PieItem {
  name: string;
  val: number;
  fill: string;
  pct: number;
}

/** Composition by head at a year: top 6 + an "Other heads" bucket. */
export function pieData(
  heads: CrimeHead[],
  i: number,
  measure: Measure,
  populationLakh: number,
  otherLabel = 'Other heads',
): PieItem[] {
  const rows = heads
    .map((h) => ({ name: h.name, val: measureValue(h, i, measure, populationLakh) }))
    .sort((a, b) => b.val - a.val);

  const top = rows.slice(0, 6);
  const rest = rows.slice(6).reduce((s, r) => s + r.val, 0);

  const items: PieItem[] = top.map((r, idx) => ({
    name: r.name,
    val: r.val,
    fill: catColor(idx),
    pct: 0,
  }));
  if (rest > 0) items.push({ name: otherLabel, val: rest, fill: 'var(--line-strong)', pct: 0 });

  const total = items.reduce((s, it) => s + it.val, 0) || 1;
  for (const it of items) it.pct = Math.round((it.val / total) * 100);
  return items;
}

export type TrendDir = 'up' | 'down' | 'flat';

/** Year-on-year direction for the stat card, matching the concept's ±2% band. */
export function yoyDir(cur: number, prev: number): TrendDir {
  const yoy = prev ? ((cur - prev) / prev) * 100 : 0;
  return yoy >= 2 ? 'up' : yoy <= -2 ? 'down' : 'flat';
}

export { fmtMeasure };
