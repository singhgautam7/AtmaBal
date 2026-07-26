import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale, isLocaleReady, type Locale } from './routing';

/**
 * next-intl request config for the App Router.
 *
 * Fallback policy (specs/i18n.md): a half-translated page is dangerous on a
 * legal tool, so any locale that isn't fully ready serves the **English**
 * message catalog. The UI shows a "not yet available in this language" banner
 * (see LocaleNotice) rather than mixing languages.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale =
    requested && isLocale(requested) ? requested : defaultLocale;

  // Serve English messages for any not-yet-ready locale.
  const messagesLocale: Locale = isLocaleReady(locale) ? locale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${messagesLocale}.json`)).default,
  };
});
