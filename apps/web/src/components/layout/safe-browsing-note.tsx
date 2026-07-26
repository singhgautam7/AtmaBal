import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

/**
 * The honest "browsing safely" note for sensitive pages: quick exit leaves at
 * once, but it can't erase history. Every DV resource stresses this, so we do too.
 */
export function SafeBrowsingNote({ className }: { className?: string }) {
  const t = useTranslations('quickExit');
  return (
    <p className={cn('text-center text-[11px] leading-snug text-ink-faint', className)}>
      {t('safeBrowsing')}
    </p>
  );
}
