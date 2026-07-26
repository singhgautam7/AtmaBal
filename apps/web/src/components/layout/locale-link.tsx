'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { ComponentProps } from 'react';

/**
 * A next/link that prefixes internal hrefs with the active locale (e.g.
 * `/crime` → `/en/crime`). We prefix routes ourselves rather than run
 * middleware, because the site is statically exported (no server).
 */
export function LocaleLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const locale = useLocale();
  const isInternal = href.startsWith('/') && !href.startsWith(`/${locale}/`);
  const resolved = isInternal ? `/${locale}${href}` : href;
  return <Link href={resolved} {...props} />;
}
