'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconPin, IconChevronDown } from '@/components/icons';

/**
 * Global city selector (design.md — a site-wide control on every page).
 *
 * Bengaluru is the only live city. Per the owner's decision, we do NOT name
 * unbuilt cities; the menu shows Bengaluru (Live) and a single honest
 * "More cities coming soon." line — scope, not a promise.
 */
export function CitySelector({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const t = useTranslations('city');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const big = size === 'lg';

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
        {t('current')}
        <IconChevronDown size={big ? 11 : 10} className="text-ink-faint" strokeWidth={1.7} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[42px] z-20 w-[210px] rounded-md border border-line-strong bg-surface p-1.5 shadow-[var(--shadow-pop)]"
        >
          <div
            role="option"
            aria-selected="true"
            className="flex items-center justify-between rounded-lg bg-accent-soft px-[11px] py-[9px]"
          >
            <span className="text-[14px] font-medium text-ink">{t('current')}</span>
            <span className="rounded-full bg-accent px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.06em] text-white">
              {t('live')}
            </span>
          </div>
          <div className="mt-1 border-t border-line px-[11px] pb-1 pt-2 text-[11.5px] leading-snug text-ink-faint">
            {t('comingSoon')}
          </div>
        </div>
      )}
    </div>
  );
}
