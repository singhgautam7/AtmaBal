import { useTranslations } from 'next-intl';
import { LocaleLink } from './locale-link';
import { DiyaMark } from './diya-mark';

/**
 * Wordmark with the diya brand mark (HANDOFF v2). Uses the display serif. Kept as
 * text + inline SVG (not a raster) so it re-themes with tokens and stays crisp.
 */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const t = useTranslations('brand');
  const wordCls =
    size === 'lg' ? 'text-[22px]' : size === 'sm' ? 'text-[17px]' : 'text-[19px]';
  const markSize = size === 'lg' ? 30 : size === 'sm' ? 24 : 26;
  return (
    <LocaleLink
      href="/"
      className="inline-flex items-center gap-2 font-display font-semibold text-ink hover:text-ink"
      aria-label={t('name')}
    >
      <DiyaMark size={markSize} />
      <span className={wordCls}>Atma&nbsp;Bal</span>
    </LocaleLink>
  );
}
