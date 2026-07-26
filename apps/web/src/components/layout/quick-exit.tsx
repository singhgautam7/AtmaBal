'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { quickExit } from '@/lib/safety';
import { cn } from '@/lib/cn';
import { IconExit } from '@/components/icons';

/**
 * Quick exit — a true panic button (design.md "Quick exit vs the grounding page").
 *
 * Appears only on sensitive pages. On tap OR the Esc key it INSTANTLY replaces
 * the tab with a neutral weather search — no interstitial, no animation, nothing
 * that references this site. Speed and camouflage are the whole point.
 *
 * The purpose is conveyed by the `title` tooltip (per owner's request — no visible
 * hint label). `variant="floating"` gives it a solid surface background + shadow
 * for use over the map.
 */
export function QuickExit({
  cityName = 'Bengaluru',
  size = 'sm',
  variant = 'default',
}: {
  cityName?: string;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'floating';
}) {
  const t = useTranslations('quickExit');
  const firedRef = useRef(false);

  const exit = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    quickExit(cityName);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      onClick={exit}
      title={t('firstHint')}
      aria-label={t('hint')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors',
        size === 'lg' ? 'px-3.5 py-[7px] text-[13px]' : 'px-3 py-1.5 text-xs',
        variant === 'floating'
          ? 'border-line-strong bg-surface text-ink shadow-[0_3px_10px_rgba(42,36,32,0.14)] hover:text-accent-deep'
          : 'border-line-strong bg-transparent text-ink-soft hover:border-accent-line hover:text-accent-deep',
      )}
    >
      {t('label')}
      <IconExit />
    </button>
  );
}
