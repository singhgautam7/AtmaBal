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

export const metadata: Metadata = {
  title: 'Local City Info',
  description: 'Local city information and reference.',
  robots: { index: true, follow: true },
  // Browser tab icon stays NEUTRAL (plumbing rule). The diya is only the
  // installed-app / home-screen icon, declared in the web manifest.
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Local City Info',
    description: 'Local city information and reference.',
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
