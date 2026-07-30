'use client';

import { useEffect } from 'react';

/**
 * Registers the offline service worker (public/sw.js). Best-effort and silent:
 * if the browser doesn't support it, or registration fails, the site still works
 * fully online. No data is collected.
 */
export function SwRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    // By the time React hydrates a static page, `load` has usually already fired,
    // so register now if the document is ready, else wait for load.
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);
  return null;
}
