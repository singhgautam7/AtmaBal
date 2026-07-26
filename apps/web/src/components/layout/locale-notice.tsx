import { useTranslations } from 'next-intl';
import { localeNames, type Locale } from '@/i18n/routing';

/**
 * Shown when a not-yet-ready locale falls back to English (specs/i18n.md).
 * We never mix languages on a page; we say plainly what happened.
 */
export function LocaleNotice({ locale }: { locale: Locale }) {
  const t = useTranslations('localeNotice');
  return (
    <div className="border-b border-line bg-accent-soft px-4 py-2 text-center text-[12.5px] text-ink">
      {t('message', { language: localeNames[locale] })}
    </div>
  );
}
