'use client';

import { useEffect, useRef, useState } from 'react';
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
 * A small "leave this site quickly" hint shows on first appearance (per session)
 * so it isn't a mystery button. sessionStorage is used only to not repeat the
 * hint within a tab session — it tracks nothing about the user.
 */
export function QuickExit({
  cityName = 'Bengaluru',
  size = 'sm',
}: {
  cityName?: string;
  size?: 'sm' | 'lg';
}) {
  const t = useTranslations('quickExit');
  const [showHint, setShowHint] = useState(false);
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

    try {
      if (!sessionStorage.getItem('ab_qe_hint')) {
        setShowHint(true);
        sessionStorage.setItem('ab_qe_hint', '1');
      }
    } catch {
      // sessionStorage unavailable (private mode edge case) — show the hint once.
      setShowHint(true);
    }

    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex flex-col items-end">
      <button
        type="button"
        onClick={exit}
        title={t('hint')}
        aria-label={t('hint')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-transparent font-sans font-semibold text-ink-soft transition-colors hover:border-accent-line hover:text-accent-deep',
          size === 'lg' ? 'px-3.5 py-[7px] text-[13px]' : 'px-3 py-1.5 text-xs',
        )}
      >
        {t('label')}
        <IconExit />
      </button>
      {showHint && (
        <span className="mt-1 whitespace-nowrap rounded-full border border-line bg-surface px-2.5 py-[3px] text-[11px] text-ink-faint">
          {t('firstHint')}
        </span>
      )}
    </div>
  );
}
