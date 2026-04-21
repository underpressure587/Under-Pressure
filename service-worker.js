const CACHE_NAME = 'up-admin-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/mainBeta.js',
  '/admin.js',
  '/firebase-config.js',
  '/sala-mode-new.js',
  '/logo.jpg',
  '/manifest.json'
];

// Instalação — faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Ativação — remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve do cache, tenta rede se não tiver
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
