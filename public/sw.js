/* Service worker for the Klinik Cikidang Medika dashboard.
 *
 * Only build output and icons are cached. HTML pages and Supabase responses are
 * deliberately never cached: a stored authenticated page could show one user's
 * patient data to the next person who opens the device.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `cikidang-shell-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const CACHEABLE_PREFIXES = ['/_next/static/', '/assets/'];

const PRECACHE_URLS = [
  OFFLINE_URL,
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/images/logo-mark.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (CACHEABLE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    // Next.js fingerprints build filenames, so a cached entry can never go stale.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) =>
            cached ||
            new Response('Tidak ada koneksi internet.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
        )
      )
    );
  }
});
