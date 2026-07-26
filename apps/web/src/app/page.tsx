'use client';

import { useEffect } from 'react';
import { defaultLocale } from '@/i18n/routing';

/**
 * Root `/` → default locale. Statically exported (no middleware), so this
 * redirects on the client and offers a plain link as the no-JS fallback.
 */
export default function RootRedirect() {
  const target = `/${defaultLocale}/`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return (
    <main style={{ padding: 24 }}>
      <a href={target}>Continue</a>
    </main>
  );
}
