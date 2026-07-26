'use client';

/**
 * Hand-rolled SVG charts, ported from the design concept so they match and add
 * no chart-library weight (3G budget). Colour-blind-safe: orange = focus/current,
 * teal = comparison; every value is also printed/tooltipped, so meaning is never
 * carried by colour alone. Line & bar charts show a vertical guide + a custom
 * tooltip on hover/tap for a premium feel.
 */
import { useRef, useState } from 'react';
import type { Measure } from '@/data/types';
import { nice, fmtMeasure } from '@/lib/crime';
import { fmtN } from '@/lib/format';

const FAM = 'var(--font-sans)';

function useHoverIndex(count: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const onMove = (e: React.MouseEvent<SVGSVGElement>, xs: number[]) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vbW = svg.viewBox.baseVal.width || rect.width;
    const x = ((e.clientX - rect.left) / rect.width) * vbW;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const d = Math.abs((xs[i] ?? 0) - x);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    setIdx(best);
  };
  return { ref, idx, setIdx, onMove, count };
}

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
  const hover = useHoverIndex(n);
  const hp = hover.idx != null ? pts[hover.idx] : null;

  return (
    <svg
      ref={hover.ref}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      onMouseMove={(e) => hover.onMove(e, pts.map((p) => p.cx))}
      onMouseLeave={() => hover.setIdx(null)}
    >
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
            <circle cx={p.cx} cy={p.cy} r={foc ? (small ? 4 : 4.6) : small ? 2.8 : 3.2} fill={foc ? 'var(--accent)' : 'var(--surface)'} stroke="var(--data-public)" strokeWidth={2.2} />
            <text x={p.cx} y={h - 6} textAnchor="middle" fontSize={small ? 8.5 : 9.5} fontWeight={foc ? 700 : 400} fill={foc ? 'var(--accent-deep)' : 'var(--ink-faint)'} fontFamily={FAM}>
              {p.year}
            </text>
          </g>
        );
      })}
      {hp && <HoverGuide p={hp} label={`${hp.year}`} value={fmt(hp.v)} w={w} y0={y0} y1={y1} />}
    </svg>
  );
}

function HoverGuide({
  p,
  label,
  value,
  w,
  y0,
  y1,
}: {
  p: { cx: number; cy: number };
  label: string;
  value: string;
  w: number;
  y0: number;
  y1: number;
}) {
  const boxW = Math.max(52, value.length * 7 + 20);
  const bx = Math.min(Math.max(p.cx - boxW / 2, 2), w - boxW - 2);
  const by = Math.max(y0, p.cy - 40);
  return (
    <g pointerEvents="none">
      <line x1={p.cx} x2={p.cx} y1={y0} y2={y1} stroke="var(--accent-line)" strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={p.cx} cy={p.cy} r={4.5} fill="var(--accent)" stroke="#fff" strokeWidth={2} />
      <g transform={`translate(${bx},${by})`}>
        <rect width={boxW} height={30} rx={6} fill="var(--ink)" opacity={0.94} />
        <text x={boxW / 2} y={12.5} textAnchor="middle" fontSize={9} fill="#E7E0D4" fontFamily={FAM}>
          {label}
        </text>
        <text x={boxW / 2} y={24} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" fontFamily={FAM}>
          {value}
        </text>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------- grouped ---- */

export interface GroupBar {
  name: string;
  short: string;
  cur: number;
  prev: number;
}

export function GroupedBars({
  bars,
  yearCur,
  yearPrev,
  measure,
  width,
  height,
  ariaLabel,
}: {
  bars: GroupBar[];
  yearCur: number;
  yearPrev: number;
  measure: Measure;
  width: number;
  height: number;
  ariaLabel: string;
}) {
  const w = width;
  const h = height;
  const small = w < 340;
  const top = [...bars].sort((a, b) => b.cur - a.cur).slice(0, 6);
  const x0 = 40;
  const x1 = w - 8;
  const y0 = 16;
  const y1 = h - 26;
  const nm = nice(Math.max(...top.map((t) => Math.max(t.cur, t.prev)), 1) * 1.18);
  const fmt = (v: number) => fmtMeasure(v, measure);
  const gw = (x1 - x0) / (top.length || 1);
  const bw = Math.min(13, gw / 3.2);
  const centers = top.map((_, i) => x0 + gw * i + gw / 2);
  const hover = useHoverIndex(top.length);
  const ht = hover.idx != null ? top[hover.idx] : null;

  return (
    <svg
      ref={hover.ref}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      onMouseMove={(e) => hover.onMove(e, centers)}
      onMouseLeave={() => hover.setIdx(null)}
    >
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
        const gx = centers[i]!;
        const bhp = (t.prev / nm) * (y1 - y0);
        const bhc = (t.cur / nm) * (y1 - y0);
        const xc = +(gx + 1.5).toFixed(1);
        const xp = +(gx - bw - 1.5).toFixed(1);
        const active = hover.idx === i;
        return (
          <g key={`b${i}`}>
            {active && <rect x={+(gx - gw / 2).toFixed(1)} y={y0} width={gw} height={y1 - y0} fill="var(--accent-soft)" opacity={0.5} />}
            <rect x={xc} y={+(y1 - bhc).toFixed(1)} width={bw} height={+bhc.toFixed(1)} rx={2} fill="var(--data-public)" />
            <rect x={xp} y={+(y1 - bhp).toFixed(1)} width={bw} height={+bhp.toFixed(1)} rx={2} fill="var(--data-domestic)" />
            <text x={+gx.toFixed(1)} y={y1 + 14} textAnchor="middle" fontSize={small ? 8 : 8.5} fill="var(--ink-faint)" fontFamily={FAM}>
              {t.short}
            </text>
          </g>
        );
      })}
      {ht && hover.idx != null && (
        <GroupTooltip
          cx={centers[hover.idx]!}
          w={w}
          y0={y0}
          title={ht.short}
          lines={[`${yearCur}: ${fmt(ht.cur)}`, `${yearPrev}: ${fmt(ht.prev)}`]}
        />
      )}
    </svg>
  );
}

function GroupTooltip({
  cx,
  w,
  y0,
  title,
  lines,
}: {
  cx: number;
  w: number;
  y0: number;
  title: string;
  lines: string[];
}) {
  const boxW = Math.max(84, title.length * 6 + 24, ...lines.map((l) => l.length * 6 + 20));
  const bx = Math.min(Math.max(cx - boxW / 2, 2), w - boxW - 2);
  const boxH = 14 + lines.length * 13;
  return (
    <g pointerEvents="none" transform={`translate(${bx},${y0})`}>
      <rect width={boxW} height={boxH} rx={6} fill="var(--ink)" opacity={0.94} />
      <text x={boxW / 2} y={12} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fff" fontFamily={FAM}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={i} x={boxW / 2} y={25 + i * 12} textAnchor="middle" fontSize={9} fill="#E7E0D4" fontFamily={FAM}>
          {l}
        </text>
      ))}
    </g>
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
    return (
      <path key={idx} d={d} fill={it.fill} stroke="var(--surface)" strokeWidth={1.5}>
        <title>{`${it.name}: ${fmtN(it.val)}`}</title>
      </path>
    );
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
