'use client';

import { useState } from 'react';
import { IconPhone } from '@/components/icons';
import { HELPLINES, CATEGORY_LABELS, type HelpCategory } from '@/data/helplines';

const CATS = Object.keys(CATEGORY_LABELS) as HelpCategory[];

function isOld(iso: string | null): boolean {
  if (!iso) return true;
  const d = new Date(iso).getTime();
  return Number.isNaN(d) || Date.now() - d > 1000 * 60 * 60 * 24 * 365; // > 1 year
}

export function HelplineDirectory() {
  const [cat, setCat] = useState<HelpCategory | 'all'>('all');
  const shown = cat === 'all' ? HELPLINES : HELPLINES.filter((h) => h.categories.includes(cat));

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <FilterChip active={cat === 'all'} onClick={() => setCat('all')} label="All" />
        {CATS.map((c) => (
          <FilterChip key={c} active={cat === c} onClick={() => setCat(c)} label={CATEGORY_LABELS[c]} />
        ))}
      </div>

      <ul className="mt-5 flex flex-col gap-2.5">
        {shown.map((h) => {
          const stale = isOld(h.lastVerified);
          return (
            <li key={h.id} className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-[16px] font-medium text-ink">{h.name}</span>
                  {h.categories.map((c) => (
                    <span key={c} className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-accent-deep">
                      {CATEGORY_LABELS[c]}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-[13px] leading-snug text-ink-soft">{h.whatFor}</p>
                <p className="mt-1 text-[11px] text-ink-faint">
                  {h.lastVerified && !stale ? (
                    <>Last verified {h.lastVerified}</>
                  ) : (
                    <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>
                      ⚠ Number not yet verified - please confirm before relying on it
                    </span>
                  )}
                </p>
              </div>
              <a
                href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                className="inline-flex min-h-[44px] flex-none items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-accent-deep"
                aria-label={`Call ${h.name} at ${h.number}`}
              >
                <IconPhone size={16} />
                {h.number}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[38px] rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${
        active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-soft hover:bg-accent-soft'
      }`}
    >
      {label}
    </button>
  );
}
