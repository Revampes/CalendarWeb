const CACHE_NAME = 'calendar-app-v4';
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
  // Removed external CDNs to prevent CORS issues during SW install
  // 'https://cdn.tailwindcss.com',
  // 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'
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

// Push Notification Handler
self.addEventListener('push', (event) => {
  let title = 'Calendar Reminder';
  let options = {
    body: 'You have an upcoming event.',
    icon: './assets/icons/icon.svg',
    badge: './assets/icons/icon.svg',
    vibrate: [100, 50, 100],
    data: { url: './' }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      options = { ...options, ...data };
    } catch (e) {
      options.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
