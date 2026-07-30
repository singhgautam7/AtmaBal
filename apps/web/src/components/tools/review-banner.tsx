/**
 * Shared "pending human review" banner + a small "the law behind this" line.
 * Every legal claim on the site must carry a source + last_reviewed date AND be
 * flagged as a first draft awaiting a qualified human's check before launch
 * (CLAUDE.md / specs/legal-content.md).
 */

export function ReviewBanner({ className = '' }: { className?: string }) {
  return (
    <p
      className={`rounded-md px-3.5 py-2.5 text-[12px] leading-snug text-ink ${className}`}
      style={{ border: '1px solid rgba(201,154,46,0.45)', background: 'rgba(201,154,46,0.12)' }}
    >
      <strong className="font-semibold">Draft, pending review.</strong> The legal points here are
      an authored first draft with their sources noted, but they still need checking by a
      qualified person (a lawyer, DLSA volunteer or One Stop Centre) before launch. Treat them as
      a starting point, not final legal advice.
    </p>
  );
}

export interface LawBasis {
  act: string;
  section?: string;
  text: string;
  source: string;
  lastReviewed: string;
}

/** Compact, sourced "the law behind this" block shown under a card/step. */
export function LawBehind({ law }: { law: LawBasis }) {
  return (
    <div className="mt-3 rounded-sm border border-line bg-paper px-3 py-2.5 text-[11.5px] leading-snug text-ink-soft">
      <div className="mb-0.5 font-semibold uppercase tracking-[0.08em] text-ink-faint">The law behind this</div>
      <div className="text-ink">
        {law.act}
        {law.section ? ` · ${law.section}` : ''}
      </div>
      <p className="mt-1">{law.text}</p>
      <p className="mt-1.5 text-ink-faint">
        Source: {law.source} · last reviewed {law.lastReviewed}
      </p>
    </div>
  );
}
