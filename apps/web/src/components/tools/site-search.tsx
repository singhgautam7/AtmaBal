'use client';

import { useMemo, useState } from 'react';
import { LocaleLink } from '@/components/layout/locale-link';
import { SEARCH_INDEX } from '@/data/search-index';

/**
 * Fully client-side search over a prebuilt static index. Runs in the browser,
 * offline, and logs nothing - the query never leaves the device.
 */
export function SiteSearch() {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const terms = query.split(/\s+/);
    return SEARCH_INDEX.map((e) => {
      const hay = `${e.title} ${e.snippet} ${e.keywords}`.toLowerCase();
      const title = e.title.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return { e, score: -1 };
        if (title.includes(t)) score += 3;
        else score += 1;
        if (title.startsWith(t)) score += 2;
      }
      return { e, score };
    })
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map((r) => r.e);
  }, [q]);

  return (
    <div className="mt-6">
      <input
        type="search"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search rights, tools, guides, helplines…"
        aria-label="Search this site"
        className="w-full rounded-md border border-line-strong bg-paper px-4 py-3 text-[16px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />

      {q.trim() && (
        <p className="mt-3 text-[12px] text-ink-faint">
          {results.length} {results.length === 1 ? 'result' : 'results'} · searched on your device, nothing sent
        </p>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {results.map((e, i) => (
          <li key={`${e.href}-${i}`}>
            <LocaleLink
              href={e.href}
              className="block rounded-md border border-line bg-surface px-4 py-3 hover:border-accent-line hover:bg-accent-soft"
            >
              <div className="font-display text-[15.5px] font-medium text-ink">{e.title}</div>
              <div className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-ink-soft">{e.snippet}</div>
            </LocaleLink>
          </li>
        ))}
        {q.trim() && results.length === 0 && (
          <li className="rounded-md border border-dashed border-line px-4 py-6 text-center text-[13px] text-ink-soft">
            Nothing matched. Try a simpler word - like “FIR”, “helpline”, “rights” or “medical”.
          </li>
        )}
      </ul>
    </div>
  );
}
