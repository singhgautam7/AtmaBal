import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// A per-build id used to version the service-worker cache, so every deploy
// auto-busts the offline cache (the SW is registered as /sw.js?v=<this>).
const BUILD_ID = process.env.SOURCE_VERSION || process.env.CF_PAGES_COMMIT_SHA || String(Date.now());

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { NEXT_PUBLIC_SW_VERSION: BUILD_ID },
  // Statically exported: no runtime server, no backend, no database in production.
  // This is what makes "we store nothing" an architectural fact. See specs/deployment.md.
  output: 'export',
  reactStrictMode: true,
  // Static export can't optimise images on a server; serve them as-is.
  images: { unoptimized: true },
  // Trailing slashes keep the exported static routes tidy on Cloudflare Pages.
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
