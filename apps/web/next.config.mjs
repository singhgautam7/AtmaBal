import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
