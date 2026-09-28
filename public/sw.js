const CACHE_NAME = 'petpedia-cache-v5';
const STATIC_ASSETS = [
  '/manifest.json',
  '/manifest-admin.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

function safeCachePut(cacheName, req, res) {
  try {
    if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) return;
    caches.open(cacheName).then((cache) => {
      cache.put(req, res).catch(() => {});
    }).catch(() => {});
  } catch {
    // Ignore any caching exceptions
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle standard HTTP/HTTPS GET requests (ignore chrome-extension://, moz-extension://, etc.)
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  const url = new URL(request.url);

  // Don't cache admin API mutations, Vite dev modules, or external analytics
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('googletagmanager')
  ) {
    return;
  }

  // Static images & assets: Cache First
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            safeCachePut(CACHE_NAME, request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse || new Response(null, { status: 404 }));
      })
    );
    return;
  }

  // Navigation requests (HTML pages): Network First, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            safeCachePut(CACHE_NAME, request, response.clone());
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Never fallback an admin route to the client storefront page
            if (url.pathname.startsWith('/admin')) {
              return caches.match('/admin').then((adminCached) => {
                return adminCached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
              });
            }
            return caches.match('/').then((rootCached) => {
              return rootCached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
            });
          });
        })
    );
    return;
  }

  // Default: Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          safeCachePut(CACHE_NAME, request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse || new Response(null, { status: 504 }));

      return cachedResponse || fetchPromise;
    })
  );
});

// Push notification event listener (Exclusively for Merchant Admin PWA order alerts)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Petpedia Admin: New Order! 🛍️',
    body: 'A new customer order has arrived on Petpedia.',
    url: '/admin/orders',
    tag: 'petpedia-admin-order'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    vibrate: [300, 100, 300, 100, 400],
    tag: payload.tag || 'petpedia-admin-order',
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url || '/admin/orders'
    },
    actions: [
      { action: 'open_orders', title: 'View Orders' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification click listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin/orders') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
