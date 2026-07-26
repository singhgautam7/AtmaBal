import { ImageResponse } from 'next/og';

/**
 * Branded link-preview card (WhatsApp / Instagram / Snapchat / X).
 *
 * This is DELIBERATELY branded, unlike the neutral browser-tab chrome: a link is
 * shared on purpose (to recommend the tool), so the preview should look like a
 * real, trustworthy product rather than a blank "Local Info" card. Generated to a
 * real PNG at build time (scrapers do not render SVG), and Next auto-wires it to
 * both og:image and twitter:image via this file-convention.
 */
// Generated once at build time (required for `output: export`).
export const dynamic = 'force-static';

export const alt = 'Atma Bal - know your rights, find help';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The diya brand mark, inlined as a data-URI SVG so Satori can rasterise it.
const DIYA = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <path d="M100 20 C142 84 126 130 100 154 C74 130 58 84 100 20 Z" fill="#BE5A38"/>
    <path d="M100 64 C122 98 114 130 100 146 C86 130 78 98 100 64 Z" fill="#E3A24C"/>
    <rect x="93" y="144" width="14" height="32" rx="7" fill="#7A3A20"/>
    <path d="M28 156 Q100 224 172 156 Q154 196 100 200 Q46 196 28 156 Z" fill="#9B4526"/>
  </svg>`,
)}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FBF8F2 0%, #F1E1CE 100%)',
          padding: '76px 88px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={DIYA} width={92} height={92} alt="" />
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3A2E26', letterSpacing: -0.5 }}>
            Atma Bal
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 74, fontWeight: 700, color: '#BE5A38', lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 940 }}>
            Know your rights. Find help.
          </div>
          <div style={{ fontSize: 33, color: '#6B5A4C', lineHeight: 1.3, maxWidth: 900 }}>
            Understand crime in your city, know your legal options, and find verified
            helplines and stations. For women in India.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#8A7A6C' }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: '#BE5A38', display: 'flex' }} />
          We store nothing you do here. Everything runs on your device.
        </div>
      </div>
    ),
    { ...size },
  );
}
