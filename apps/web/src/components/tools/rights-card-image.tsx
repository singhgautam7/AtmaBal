'use client';

import type { RightCard } from '@/data/rights';
import { IconDownload } from '@/components/icons';

/**
 * "Save as image" - renders a rights card to a self-contained PNG entirely in the
 * browser (Canvas API, no libraries, works offline). The image carries the Atma
 * Bal mark, the sourced "law behind this" line, and the visible "Draft, pending
 * review" strip (stays until human review clears it). Nothing leaves the device.
 */
const C = {
  paper: '#FBF8F2', white: '#FFFFFF', ink: '#2A2420', soft: '#6B5A4C', faint: '#8A7A6C',
  accent: '#BE5A38', accentDeep: '#9B4526', accentSoft: '#F1E1CE', line: '#E4D8C7',
  amberBg: '#F6ECD5', amberBd: '#D8B65C', amberInk: '#6E5518',
};
const DISP = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    let cur = '';
    for (const w of para.split(' ')) {
      const t = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(t).width > maxW && cur) {
        out.push(cur);
        cur = w;
      } else cur = t;
    }
    out.push(cur);
  }
  return out;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function diya(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 200;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = '#BE5A38';
  ctx.fill(new Path2D('M100 24 C138 84 124 128 100 150 C76 128 62 84 100 24 Z'));
  ctx.fillStyle = '#E3A24C';
  ctx.fill(new Path2D('M100 66 C120 98 113 128 100 142 C87 128 80 98 100 66 Z'));
  ctx.fillStyle = '#7A3A20';
  ctx.fillRect(94, 140, 12, 30);
  ctx.fillStyle = '#9B4526';
  ctx.fill(new Path2D('M34 150 Q100 210 166 150 Q150 186 100 190 Q50 186 34 150 Z'));
  ctx.restore();
}

/** Walk the layout; measures when draw=false, paints when draw=true. Returns height. */
function render(ctx: CanvasRenderingContext2D, card: RightCard, draw: boolean): number {
  const W = 1080;
  const pad = 76;
  const cw = W - pad * 2;
  let y = pad;

  if (draw) {
    ctx.fillStyle = C.white;
    ctx.fillRect(0, 0, W, ctx.canvas.height / 2);
  }

  // Header: diya + wordmark + tag
  if (draw) {
    diya(ctx, pad, y - 6, 52);
    ctx.fillStyle = C.ink;
    ctx.font = `600 30px ${SANS}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Atma Bal', pad + 66, y + 30);
  }
  y += 64;

  // tag chip
  ctx.font = `700 20px ${SANS}`;
  const tagW = ctx.measureText(card.tag.toUpperCase()).width + 36;
  if (draw) {
    ctx.fillStyle = C.accentSoft;
    roundRect(ctx, pad, y, tagW, 40, 20);
    ctx.fill();
    ctx.fillStyle = C.accentDeep;
    ctx.fillText(card.tag.toUpperCase(), pad + 18, y + 27);
  }
  y += 40 + 32;

  // title
  ctx.font = `500 46px ${DISP}`;
  const titleLines = wrap(ctx, card.title, cw);
  if (draw) {
    ctx.fillStyle = C.ink;
    for (const l of titleLines) {
      ctx.fillText(l, pad, y + 40);
      y += 58;
    }
  } else y += titleLines.length * 58;
  y += 14;

  // body
  ctx.font = `400 27px ${SANS}`;
  const bodyLines = wrap(ctx, card.body, cw);
  if (draw) {
    ctx.fillStyle = C.soft;
    for (const l of bodyLines) {
      ctx.fillText(l, pad, y + 26);
      y += 40;
    }
  } else y += bodyLines.length * 40;
  y += 26;

  // law box
  const lawPad = 30;
  ctx.font = `400 24px ${SANS}`;
  const lawText = wrap(ctx, card.law.text, cw - lawPad * 2);
  ctx.font = `400 22px ${SANS}`;
  const srcLine = `Source: ${card.law.source} · last reviewed ${card.law.lastReviewed}`;
  const srcLines = wrap(ctx, srcLine, cw - lawPad * 2);
  const boxH = lawPad + 26 + 8 + 30 + 6 + lawText.length * 34 + 12 + srcLines.length * 30 + lawPad;
  if (draw) {
    ctx.fillStyle = C.paper;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    roundRect(ctx, pad, y, cw, boxH, 12);
    ctx.fill();
    ctx.stroke();
    let ly = y + lawPad;
    ctx.fillStyle = C.faint;
    ctx.font = `700 19px ${SANS}`;
    ctx.fillText('THE LAW BEHIND THIS', pad + lawPad, ly + 20);
    ly += 34;
    ctx.fillStyle = C.ink;
    ctx.font = `600 24px ${SANS}`;
    ctx.fillText(`${card.law.act}${card.law.section ? ` · ${card.law.section}` : ''}`, pad + lawPad, ly + 22);
    ly += 36;
    ctx.fillStyle = C.soft;
    ctx.font = `400 24px ${SANS}`;
    for (const l of lawText) {
      ctx.fillText(l, pad + lawPad, ly + 22);
      ly += 34;
    }
    ly += 12;
    ctx.fillStyle = C.faint;
    ctx.font = `400 22px ${SANS}`;
    for (const l of srcLines) {
      ctx.fillText(l, pad + lawPad, ly + 20);
      ly += 30;
    }
  }
  y += boxH + 26;

  // review strip
  ctx.font = `600 22px ${SANS}`;
  const rvLines = wrap(ctx, 'Draft, pending human review - a sourced first draft; confirm before relying on it.', cw - 44);
  const rvH = 24 + rvLines.length * 30;
  if (draw) {
    ctx.fillStyle = C.amberBg;
    ctx.strokeStyle = C.amberBd;
    ctx.lineWidth = 2;
    roundRect(ctx, pad, y, cw, rvH, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.amberInk;
    let ry = y + 20;
    for (const l of rvLines) {
      ctx.fillText(l, pad + 22, ry + 20);
      ry += 30;
    }
  }
  y += rvH + pad;

  return y;
}

export function SaveCardImage({ card }: { card: RightCard }) {
  const save = () => {
    const W = 1080;
    const dpr = 2;
    const measure = document.createElement('canvas').getContext('2d')!;
    const H = render(measure, card, false);
    const canvas = document.createElement('canvas');
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = C.white;
    ctx.fillRect(0, 0, W, H);
    render(ctx, card, true);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atma-bal-${card.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <button
      type="button"
      onClick={save}
      className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:bg-accent-soft"
    >
      <IconDownload size={14} />
      Save as image
    </button>
  );
}
