/*
 * Atma Bal service worker - offline support for the safety-critical pages
 * (helplines/map, rights, first-24-hours, complaint + log templates, options).
 *
 * Strategy: static assets (_next, fonts, images) are cache-first; page
 * navigations are network-first, falling back to cache when offline - so a page
 * you have opened once stays available with no connection. No user data is
 * cached: the templates keep what you type in memory only, never in a request.
 * Bump CACHE to invalidate on deploy.
 */
const CACHE = 'atmabal-v1';
const PRECACHE = [
  '/', '/en/', '/en/tools/', '/en/rights/', '/en/first-24-hours/',
  '/en/complaint-letter/', '/en/incident-log/', '/en/map/', '/en/options/',
  '/en/crime/', '/manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  const isAsset =
    url.pathname.startsWith('/_next/') ||
    /\.(?:js|css|woff2?|ttf|png|jpe?g|svg|webp|ico|json)$/.test(url.pathname);

  if (isAsset) {
    // Cache-first: hashed assets are immutable; fill the cache on first fetch.
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
  } else {
    // Navigation: network-first, fall back to cache (then the app shell) offline.
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/en/'))),
    );
  }
});
