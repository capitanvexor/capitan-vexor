// ==========================================
// Capitan Vexor - Service Worker v2
// استراتژی: Network First برای HTML
// ==========================================

const CACHE_NAME = 'capitan-vexor-v2';
const urlsToCache = [
  './',
  './index.html',
  './category.html',
  './product.html',
  './manifest.json',
  './support-avatar.png',
  './icon-512.png'
];

// نصب
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => Promise.resolve());
    })
  );
  self.skipWaiting();
});

// فعال‌سازی - پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // درخواست‌های خارجی (Supabase, Google Fonts و ...) → مستقیم
  if (!url.origin.includes(location.origin)) {
    return;
  }

  // ✅ Network First برای HTML
  if (event.request.mode === 'navigate' ||
      (event.request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // ✅ Cache First برای عکس‌ها، CSS، JS
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});

// گوش دادن به پیام از صفحه
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
