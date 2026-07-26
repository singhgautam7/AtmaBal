import type { ReactNode } from 'react';
import { QuickExit } from './quick-exit';

/**
 * Header for sensitive pages (get-help, options, grounding): a title/left slot
 * and the persistent quick-exit button. The quick-exit sits top-right on every
 * sensitive page, as annotated in the concept.
 */
export function SensitiveHeader({
  title,
  left,
  quickExitSize = 'sm',
}: {
  title?: string;
  left?: ReactNode;
  quickExitSize?: 'sm' | 'lg';
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {left}
        {title && (
          <span className="font-display text-[17px] font-semibold text-ink">{title}</span>
        )}
      </div>
      <QuickExit size={quickExitSize} />
    </div>
  );
}
