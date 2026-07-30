import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Spectral, IBM_Plex_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { SwRegister } from '@/components/sw-register';

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

// Two audiences, two identities (deliberate):
//   - BROWSER CHROME stays neutral - the tab title / history entry must not flag
//     the subject to someone glancing at a shared device. (design.md discreet plumbing.)
//   - The LINK PREVIEW is branded - a link is shared on purpose (to recommend the
//     tool), so the WhatsApp/Instagram/Snapchat card should look like a real,
//     trustworthy product, not a blank "Local Info" card. The share image comes
//     from app/opengraph-image.tsx (auto-wired to og:image + twitter:image).
const NEUTRAL_TITLE = 'Local Info & Resources';
const NEUTRAL_DESCRIPTION = 'Local information, guides and resources.';
const BRAND_TITLE = 'Atma Bal - know your rights, find help';
const BRAND_DESCRIPTION =
  'Understand crime in your city, know your legal options, and find verified helplines and stations. For women in India. We store nothing.';

export const metadata: Metadata = {
  metadataBase: new URL('https://atmabal.in'),
  // Tab title / document title stay neutral.
  title: { default: NEUTRAL_TITLE, template: '%s · Local Info' },
  description: NEUTRAL_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  // Share preview is branded.
  openGraph: {
    type: 'website',
    siteName: 'Atma Bal',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
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
        <SwRegister />
      </body>
    </html>
  );
}
