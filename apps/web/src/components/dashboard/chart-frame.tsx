'use client';

import { useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { IconDownload } from '@/components/icons';

/**
 * A titled chart card with a real "download / share" affordance: it serialises
 * the contained <svg> and downloads it, so a figure can be cited (design.md
 * "small per-chart download/share"). No network, no tracking.
 */
export function ChartFrame({
  title,
  filename,
  children,
  controls,
  className,
}: {
  title: ReactNode;
  filename: string;
  children: ReactNode;
  /** Optional controls (e.g. year steppers) shown in the header before download. */
  controls?: ReactNode;
  className?: string;
}) {
  const t = useTranslations('crime.charts');
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-md border border-line bg-surface p-4 ${className ?? ''}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink-soft">{title}</span>
        <div className="flex items-center gap-2">
          {controls}
          <button
            type="button"
            onClick={download}
            title={t('download')}
            aria-label={t('download')}
            className="inline-flex p-0.5 text-ink-faint hover:text-accent-deep"
          >
            <IconDownload />
          </button>
        </div>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}
