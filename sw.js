const CACHE_NAME = 'siskeu-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install Service Worker dan lakukan Caching
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktivasi dan hapus cache lama jika ada update
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategi Fetch: Network First, Fallback to Cache (Cocok untuk aplikasi berbasis Database realtime)
self.addEventListener('fetch', (e) => {
  // Biarkan request Firebase bypass cache agar data tetap realtime saat online
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Jika berhasil mendapat respons dari jaringan, simpan kloningannya ke cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline atau jaringan gagal, ambil dari cache
        return caches.match(e.request);
      })
  );
});