const CACHE_NAME = 'tripnest-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png'
];

// Install Event — Cache static core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA] Caching App Shell & Core Assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA] Asset caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event — Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event — Network-first for API, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or chrome-extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // API Requests: Network First, fallback to cache or offline response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ offline: true, message: 'You are currently offline. Showing cached data.' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static Assets / Navigation: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and navigating to a page, return cached index.html (SPA Fallback)
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          throw err;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
