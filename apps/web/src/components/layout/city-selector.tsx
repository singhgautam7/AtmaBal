'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getCities } from '@/data/loaders';
import { IconPin, IconChevronDown } from '@/components/icons';

/**
 * Global city selector — lists every city with data; choosing one opens its
 * crime dashboard (/crime?city=<id>). Includes a search box (19 cities). No
 * "Live" badge — the map-availability nuance is noted in the footer line.
 */
export function CitySelector({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const t = useTranslations('city');
  const router = useRouter();
  const locale = useLocale();
  const cities = getCities();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('bengaluru');
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('city');
    if (c && cities.some((x) => x.id === c)) setCurrent(c);
  }, [cities]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [cities, query]);

  const currentName = cities.find((c) => c.id === current)?.name ?? t('current');
  const big = size === 'lg';

  const choose = (id: string) => {
    setOpen(false);
    setQuery('');
    setCurrent(id);
    router.push(`/${locale}/crime/?city=${id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('changeLabel')}
        className={`inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface font-sans font-semibold text-ink ${
          big ? 'px-3.5 py-[7px] text-[13px]' : 'px-[11px] py-1.5 text-[12.5px]'
        }`}
      >
        <IconPin size={big ? 13 : 12} className="text-accent" strokeWidth={1.7} />
        {currentName}
        <IconChevronDown size={big ? 11 : 10} className="text-ink-faint" strokeWidth={1.7} />
      </button>

      {open && (
        <div role="listbox" className="absolute right-0 top-[42px] z-20 w-[240px] rounded-md border border-line-strong bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="mb-1.5 w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] text-ink outline-none placeholder:text-ink-faint focus-visible:border-accent-line"
          />
          <div className="max-h-[280px] overflow-y-auto">
            {filtered.map((c) => {
              const active = c.id === current;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(c.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-[11px] py-[9px] text-left ${active ? 'bg-accent-soft' : 'hover:bg-paper'}`}
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-medium text-ink">{c.name}</span>
                    {c.state && <span className="block text-[11px] text-ink-faint">{c.state}</span>}
                  </span>
                  {c.hasHelp && <IconPin size={12} className="ml-2 flex-none text-accent" strokeWidth={1.8} />}
                </button>
              );
            })}
            {filtered.length === 0 && <div className="px-[11px] py-3 text-[12.5px] text-ink-faint">{t('noMatch')}</div>}
          </div>
          <div className="mt-1 border-t border-line px-[11px] pb-1 pt-2 text-[11px] leading-snug text-ink-faint">{t('mapNote')}</div>
        </div>
      )}
    </div>
  );
}
