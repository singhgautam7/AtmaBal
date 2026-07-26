import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Spectral, IBM_Plex_Sans } from 'next/font/google';
import '@/styles/globals.css';

/**
 * Root layout — owns the <html>/<body> document shell (Next requires this here).
 *
 * `lang="en"`: English is the only populated locale at launch, and the hi/kn
 * routes deliberately serve English content (specs/i18n.md fallback), so "en" is
 * the honest language of every shipped page for now.
 *
 * Neutral browser chrome (design.md "keep the plumbing discreet"): the tab title,
 * description and icon reveal nothing about the subject.
 */
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
  display: 'swap',
});

const TITLE = 'Atma Bal — know your rights, find help';
const DESCRIPTION =
  'For women in India: understand what local crime data really says, know your rights in plain language, and find verified help. Private — stores nothing.';

export const metadata: Metadata = {
  metadataBase: new URL('https://atmabal.in'),
  title: { default: TITLE, template: '%s · Atma Bal' },
  description: DESCRIPTION,
  applicationName: 'Atma Bal',
  robots: { index: true, follow: true },
  // Browser tab icon kept neutral (plumbing rule); the diya is the installed-app
  // / home-screen icon in the web manifest. (Tab title is now meaningful per the
  // owner's request — see the safety note in the trust footer.)
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Atma Bal',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_IN',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Atma Bal — the courage to stand for yourself.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#fbf8f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spectral.variable} ${plex.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
