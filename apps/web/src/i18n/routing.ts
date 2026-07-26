/**
 * i18n routing configuration.
 *
 * Locale-prefixed routes (`/en`, `/hi`, `/kn`) exist from day one so adding a
 * language later is drop-in, not a refactor. **English is the only populated
 * locale at launch** — see specs/i18n.md. Hindi and Kannada resolve to English
 * with a visible "not yet available" note; we never mix languages on a page.
 */
export const locales = ['en', 'hi', 'kn'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Locales whose UI strings are actually translated and ready to serve. */
export const readyLocales: readonly Locale[] = ['en'];

/** Human-readable, in-language names for the (future) language switcher. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function isLocaleReady(locale: Locale): boolean {
  return readyLocales.includes(locale);
}
