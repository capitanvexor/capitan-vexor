// ==========================================
// Capitan Vexor - Service Worker
// ==========================================

const CACHE_NAME = 'capitan-vexor-v1';
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
      return cache.addAll(urlsToCache).catch(() => {
        // اگه یه فایل نبود، مشکلی نیست
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// فعال‌سازی
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

// fetch
self.addEventListener('fetch', (event) => {
  // فقط GET رو کش کن
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگه توی کش بود، از کش بده
      if (response) return response;
      
      // اگه نبود، از شبکه بگیر و کش کن
      return fetch(event.request).then((networkResponse) => {
        // فقط پاسخ‌های معتبر رو کش کن
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // اگه آفلاین بودی
        return caches.match('./index.html');
      });
    })
  );
});
