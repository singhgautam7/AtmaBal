/**
 * Hand-rolled SVG charts, ported faithfully from the design concept so they
 * match pixel-for-pixel and add no chart-library weight (3G perf budget).
 * Colour-blind-safe: orange = focus/current, teal = comparison; every value is
 * also printed as text, so meaning is never carried by colour alone.
 *
 * Each chart is role="img" with an aria-label summarising it for screen readers.
 */
import type { CrimeHead, Measure } from '@/data/types';
import { nice, measureValue, shortName, fmtMeasure } from '@/lib/crime';

const FAM = 'var(--font-sans)';

/* ---------------------------------------------------------------- line ---- */

export function TrendLine({
  values,
  years,
  measure,
  focusYear,
  width,
  height,
  ariaLabel,
}: {
  values: number[];
  years: number[];
  measure: Measure;
  focusYear: number;
  width: number;
  height: number;
  ariaLabel: string;
}) {
  const w = width;
  const h = height;
  const x0 = 44;
  const x1 = w - 30;
  const y0 = 16;
  const y1 = h - 28;
  const nm = nice(Math.max(...values) * 1.14 || 1);
  const n = values.length;
  const fmt = (v: number) => fmtMeasure(v, measure);
  const small = w < 340;

  const pts = values.map((v, i) => ({
    cx: +(x0 + (x1 - x0) * (i / (n - 1))).toFixed(1),
    cy: +(y1 - (v / nm) * (y1 - y0)).toFixed(1),
    v,
    year: years[i]!,
  }));
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p.cx + ' ' + p.cy).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={ariaLabel} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
      {[0, 1, 2, 3].map((k) => {
        const t = (nm / 3) * k;
        const y = +(y1 - (t / nm) * (y1 - y0)).toFixed(1);
        return (
          <g key={`g${k}`}>
            <line x1={x0} x2={w - 12} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
            <text x={x0 - 6} y={y + 3.4} textAnchor="end" fontSize={small ? 9 : 9.5} fill="var(--ink-faint)" fontFamily={FAM}>
              {fmt(t)}
            </text>
          </g>
        );
      })}
      <path d={`${line} L ${x1} ${y1} L ${x0} ${y1} Z`} fill="rgba(190,90,56,0.08)" />
      <path d={line} fill="none" stroke="var(--data-public)" strokeWidth={small ? 2.3 : 2.6} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const foc = p.year === focusYear;
        return (
          <g key={`p${i}`}>
            {foc && <line x1={p.cx} x2={p.cx} y1={y0 - 2} y2={y1} stroke="var(--accent-line)" strokeWidth={1} strokeDasharray="2 3" />}
            <circle cx={p.cx} cy={p.cy} r={foc ? (small ? 4 : 4.6) : small ? 2.8 : 3.2} fill={foc ? 'var(--accent)' : 'var(--surface)'} stroke="var(--data-public)" strokeWidth={2.2} />
            {(foc || i === 0 || i === n - 1) && (
              <text x={p.cx} y={p.cy - 8} textAnchor="middle" fontSize={small ? 9 : 10} fontWeight={700} fill="var(--ink)" fontFamily={FAM}>
                {fmt(p.v)}
              </text>
            )}
            <text x={p.cx} y={h - 6} textAnchor="middle" fontSize={small ? 8.5 : 9.5} fontWeight={foc ? 700 : 400} fill={foc ? 'var(--accent-deep)' : 'var(--ink-faint)'} fontFamily={FAM}>
              {p.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- grouped ---- */

export function GroupedBars({
  heads,
  iCur,
  iPrev,
  yearCur,
  yearPrev,
  measure,
  populationLakh,
  width,
  height,
  ariaLabel,
}: {
  heads: CrimeHead[];
  iCur: number;
  iPrev: number;
  yearCur: number;
  yearPrev: number;
  measure: Measure;
  populationLakh: number;
  width: number;
  height: number;
  ariaLabel: string;
}) {
  const w = width;
  const h = height;
  const small = w < 340;
  const top = heads
    .map((c) => ({
      c,
      cur: measureValue(c, iCur, measure, populationLakh),
      prev: measureValue(c, iPrev, measure, populationLakh),
    }))
    .sort((a, b) => b.cur - a.cur)
    .slice(0, 6);

  const x0 = 40;
  const x1 = w - 8;
  const y0 = 16;
  const y1 = h - 26;
  const nm = nice(Math.max(...top.map((t) => Math.max(t.cur, t.prev))) * 1.18 || 1);
  const fmt = (v: number) => fmtMeasure(v, measure);
  const gw = (x1 - x0) / (top.length || 1);
  const bw = Math.min(13, gw / 3.2);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={ariaLabel} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
      {[0, 1, 2, 3].map((k) => {
        const t = (nm / 3) * k;
        const y = +(y1 - (t / nm) * (y1 - y0)).toFixed(1);
        return (
          <g key={`g${k}`}>
            <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
            <text x={x0 - 5} y={y + 3.2} textAnchor="end" fontSize={small ? 8 : 9} fill="var(--ink-faint)" fontFamily={FAM}>
              {fmt(t)}
            </text>
          </g>
        );
      })}
      {top.map((t, i) => {
        const gx = x0 + gw * i + gw / 2;
        const hp = (t.prev / nm) * (y1 - y0);
        const hc = (t.cur / nm) * (y1 - y0);
        const xp = +(gx - bw - 1.5).toFixed(1);
        const xc = +(gx + 1.5).toFixed(1);
        const sn = shortName(t.c);
        // Both years live in a hover/tap tooltip instead of noisy printed labels (HANDOFF v2).
        const tip = `${sn} — ${yearCur}: ${fmt(t.cur)}  ·  ${yearPrev}: ${fmt(t.prev)}`;
        return (
          <g key={`b${i}`}>
            {/* cur = year A (public/orange), prev = year B (domestic/teal) */}
            <rect x={xc} y={+(y1 - hc).toFixed(1)} width={bw} height={+hc.toFixed(1)} rx={2} fill="var(--data-public)" style={{ cursor: 'pointer' }}>
              <title>{tip}</title>
            </rect>
            <rect x={xp} y={+(y1 - hp).toFixed(1)} width={bw} height={+hp.toFixed(1)} rx={2} fill="var(--data-domestic)" style={{ cursor: 'pointer' }}>
              <title>{tip}</title>
            </rect>
            {/* invisible full-column hit area so the tooltip is easy to hover/tap */}
            <rect x={+(gx - gw / 2).toFixed(1)} y={y0} width={+gw.toFixed(1)} height={y1 - y0} fill="transparent" style={{ cursor: 'pointer' }}>
              <title>{tip}</title>
            </rect>
            <text x={+gx.toFixed(1)} y={y1 + 14} textAnchor="middle" fontSize={small ? 8 : 8.5} fill="var(--ink-faint)" fontFamily={FAM}>
              {sn}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------- donut ---- */

export interface DonutItem {
  name: string;
  val: number;
  fill: string;
}

export function Donut({ items, size, ariaLabel }: { items: DonutItem[]; size: number; ariaLabel: string }) {
  const total = items.reduce((s, it) => s + it.val, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const ir = r * 0.56;
  let a0 = -Math.PI / 2;
  const arcs = items.map((it, idx) => {
    const frac = it.val / total;
    let a1 = a0 + frac * Math.PI * 2;
    if (idx === items.length - 1) a1 = -Math.PI / 2 + Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + ir * Math.cos(a1);
    const yi1 = cy + ir * Math.sin(a1);
    const xi0 = cx + ir * Math.cos(a0);
    const yi0 = cy + ir * Math.sin(a0);
    const d = `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ir} ${ir} 0 ${large} 0 ${xi0} ${yi0} Z`;
    a0 = a1;
    return <path key={idx} d={d} fill={it.fill} stroke="var(--surface)" strokeWidth={1.5} />;
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={ariaLabel} style={{ display: 'block' }}>
      {arcs}
    </svg>
  );
}

/* ---------------------------------------------------------------- ring ---- */

export function Ring({ pct, color, size, ariaLabel }: { pct: number; color: string; size: number; ariaLabel: string }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const m = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={ariaLabel} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
      <circle cx={m} cy={m} r={r} fill="none" stroke="var(--line)" strokeWidth={10} />
      <circle cx={m} cy={m} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} />
    </svg>
  );
}
