import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Spectral, IBM_Plex_Sans } from 'next/font/google';
import '@/styles/globals.css';

/**
 * Root layout - owns the <html>/<body> document shell (Next requires this here).
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

// DISCREET PLUMBING (design.md, safety-critical): the browser tab title, favicon
// and share preview must NOT flag the subject of this app to someone glancing at
// a shared device, its history, or a shared link. So the chrome is deliberately
// neutral/boring. The diya brand mark is used only INSIDE the app (hero header)
// and as the installed-app icon in the web manifest - never as the favicon.
const NEUTRAL_TITLE = 'Local Info & Resources';
const NEUTRAL_DESCRIPTION = 'Local information, guides and resources.';

export const metadata: Metadata = {
  metadataBase: new URL('https://atmabal.in'),
  title: { default: NEUTRAL_TITLE, template: '%s · Local Info' },
  description: NEUTRAL_DESCRIPTION,
  // Neutral tab icon via the app/icon.svg file convention (a plain document glyph).
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: NEUTRAL_TITLE,
    description: NEUTRAL_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: NEUTRAL_TITLE,
    description: NEUTRAL_DESCRIPTION,
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
