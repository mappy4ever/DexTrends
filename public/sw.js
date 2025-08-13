// Service Worker for DexTrends PWA - v2.0.0
// Fixed version with no HTML caching to prevent white screen issues

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `dextrends-cache-v${CACHE_VERSION}`;
const STATIC_CACHE = `dextrends-static-v${CACHE_VERSION}`;
const API_CACHE = `dextrends-api-v${CACHE_VERSION}`;

// Only cache static assets, NOT HTML pages
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/dextrendslogo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/back-card.png'
];

// API patterns to cache
const API_PATTERNS = [
  /api\.pokemontcg\.io/,
  /images\.pokemontcg\.io/,
  /raw\.githubusercontent\.com.*pokemon-tcg-pocket-cards/,
  /pokeapi\.co/
];

// Install event - cache only static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Failed to cache some assets:', err);
        // Continue installation even if some assets fail
        return Promise.resolve();
      });
    })
  );
  
  // Auto activate new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activated version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - Network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') return;
  
  // Skip Next.js hot reload
  if (url.pathname.includes('_next/webpack-hmr')) return;
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      // Always try network first for HTML
      fetch(request)
        .then((response) => {
          // Don't cache HTML responses to prevent stale content
          return response;
        })
        .catch((error) => {
          console.error('[ServiceWorker] Navigation request failed:', error);
          // Return a simple offline page
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>DexTrends - Offline</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-align: center;
                }
                .content { max-width: 400px; padding: 20px; }
                button {
                  background: rgba(255,255,255,0.2);
                  border: 2px solid white;
                  color: white;
                  padding: 12px 24px;
                  border-radius: 25px;
                  cursor: pointer;
                  font-size: 16px;
                  margin-top: 20px;
                }
                button:hover { background: rgba(255,255,255,0.3); }
              </style>
            </head>
            <body>
              <div class="content">
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
                <button onclick="location.reload()">Retry</button>
              </div>
            </body>
            </html>`,
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }
  
  // Handle API requests
  if (API_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached response if available, otherwise fetch
          if (cachedResponse) {
            // Update cache in background
            fetch(request).then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            }).catch(() => {});
            return cachedResponse;
          }
          
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Handle static assets (images, fonts, etc)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            return caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
          }
          return response;
        });
      })
    );
    return;
  }
  
  // Default: Network only for everything else
  event.respondWith(fetch(request));
});

// Message handler for updates and cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing all caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[ServiceWorker] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('[ServiceWorker] Loaded version:', CACHE_VERSION);