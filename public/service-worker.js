// Service Worker for NextOS PWA
const CACHE_NAME = 'nextos-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/apple-touch-icon.svg'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache addAll error:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Define cacheable file extensions
          const cacheableExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.css', '.js']);
          const url = new URL(event.request.url);
          const shouldCache = url.pathname.includes('/_next/') || 
            Array.from(cacheableExtensions).some(ext => url.pathname.endsWith(ext));
          
          // Cache the new response for next-data.json requests and static assets
          if (shouldCache) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Cache put error:', error);
              });
          }
          
          return response;
        }).catch(() => {
          // Return a fallback if both cache and network fail
          return caches.match('/');
        });
      })
  );
});
