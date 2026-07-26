import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { isLocale, isLocaleReady, locales, type Locale } from '@/i18n/routing';
import { LocaleNotice } from '@/components/layout/locale-notice';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Locale segment - providers only. The document shell lives in the root layout;
 * here we set the request locale (for static rendering), load the (English-
 * fallback) messages, and show the "not yet in this language" notice for any
 * not-ready locale.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const ready = isLocaleReady(locale as Locale);

  return (
    <NextIntlClientProvider messages={messages}>
      {!ready && <LocaleNotice locale={locale as Locale} />}
      {children}
    </NextIntlClientProvider>
  );
}
