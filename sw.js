const CACHE_NAME = 'calendar-app-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './calendar.html',
  './intro.html',
  './css/style.css',
  './css/calendar-page.css',
  './js/app.js',
  './js/calendar.js',
  './js/calendar-page.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Strategy: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the new response if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
          // Fallback if offline and nothing in cache (optional)
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's an already open window, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
