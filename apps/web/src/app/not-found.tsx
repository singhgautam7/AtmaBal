import { defaultLocale } from '@/i18n/routing';

/**
 * 404 (also emitted as 404.html for the static host). Renders inside the root
 * layout's document shell, so no <html> here. Neutral wording.
 */
export default function NotFound() {
  return (
    <main id="main" style={{ padding: 40, color: '#2a2420', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontWeight: 500 }}>Page not found</h1>
      <p>
        <a href={`/${defaultLocale}/`} style={{ color: '#9b4526' }}>
          Go to the start
        </a>
      </p>
    </main>
  );
}
