'use client';

import { useEffect } from 'react';
import { defaultLocale } from '@/i18n/routing';

/**
 * Root `/` -> default locale. Statically exported (no middleware), so the
 * redirect happens on the client. Instead of a bare "Continue" link (which
 * flashed and looked broken), show a calm brand loader while it redirects;
 * the <noscript> link is the no-JS fallback.
 */
export default function RootRedirect() {
  const target = `/${defaultLocale}/`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'var(--paper, #fbf8f2)',
      }}
      aria-busy="true"
      aria-label="Loading"
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '3px solid var(--line-strong, #d9cbb6)',
          borderTopColor: 'var(--accent, #be5a38)',
          animation: 'atmabal-spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 13, letterSpacing: '0.04em', color: 'var(--ink-faint, #8a7a6c)' }}>Loading…</span>
      <style>{`@keyframes atmabal-spin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: reduce){[aria-busy] span{animation-duration:2s}}`}</style>
      <noscript>
        <a href={target} style={{ color: 'var(--accent, #be5a38)' }}>Continue</a>
      </noscript>
    </main>
  );
}
