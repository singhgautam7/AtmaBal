import { useTranslations } from 'next-intl';
import { LocaleLink } from './locale-link';
import { IconLock } from '@/components/icons';

/**
 * Trust footer (design.md): the "we store nothing" statement - architecturally
 * true here (static site, no server, no analytics) - plus a corrections link.
 * No contact email at launch, per the owner's decision. Kept compact (one row on
 * desktop) so it doesn't dominate a short page.
 */
export function TrustFooter() {
  const t = useTranslations('footer');
  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-start gap-2 text-[12px] leading-snug text-ink-soft">
          <IconLock className="mt-0.5 flex-none text-accent-deep" />
          <span className="max-w-[640px]">{t('storeNothing')}</span>
        </p>
        <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-1.5">
          <LocaleLink
            href="/tools"
            className="whitespace-nowrap text-[12px] font-semibold text-accent-deep underline underline-offset-2"
          >
            {t('tools')}
          </LocaleLink>
          <LocaleLink
            href="/about"
            className="whitespace-nowrap text-[12px] font-semibold text-accent-deep underline underline-offset-2"
          >
            {t('about')}
          </LocaleLink>
          <LocaleLink
            href="/methodology"
            className="whitespace-nowrap text-[12px] font-semibold text-accent-deep underline underline-offset-2"
          >
            {t('dataSources')}
          </LocaleLink>
          <LocaleLink
            href="/corrections"
            className="whitespace-nowrap text-[12px] font-semibold text-accent-deep underline underline-offset-2"
          >
            {t('corrections')}
          </LocaleLink>
        </div>
      </div>
    </footer>
  );
}
