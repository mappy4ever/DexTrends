// Service Worker for DexTrends PWA
// Version 1.0.0

const CACHE_VERSION = 'v1';
const CACHE_NAME = `dextrends-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/dextrendslogo.png',
  '/back-card.png'
];

// API endpoints to cache
const API_PATTERNS = [
  /^https:\/\/pokeapi\.co\/api\/v2\/(pokemon|type|ability|move)/,
  /^https:\/\/api\.pokemontcg\.io\/v2\/(cards|sets)/,
  /^https:\/\/raw\.githubusercontent\.com\/PokeAPI/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[ServiceWorker] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle API requests
  if (API_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              // Return cached response if available, otherwise fetch
              if (cachedResponse) {
                // Fetch in background to update cache
                fetch(request)
                  .then(response => {
                    if (response.ok) {
                      cache.put(request, response.clone());
                    }
                  })
                  .catch(() => {});
                  
                return cachedResponse;
              }
              
              return fetch(request)
                .then((response) => {
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
  
  // Handle image requests
  if (request.destination === 'image' || 
      url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/)) {
    event.respondWith(
      caches.open(IMAGE_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              return fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => {
                  // Return fallback image if fetch fails
                  return cache.match('/back-card.png');
                });
            });
        })
    );
    return;
  }
  
  // Handle navigation requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(request);
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/');
        })
    );
    return;
  }
  
  // Default strategy: Network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && request.url.startsWith('http')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Try cache on network failure
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Helper function to sync favorites
async function syncFavorites() {
  try {
    // Get pending actions from IndexedDB
    const pending = await getPendingActions();
    
    // Process each action
    for (const action of pending) {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      
      // Remove from pending after success
      await removePendingAction(action.id);
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// IndexedDB helpers (simplified)
async function getPendingActions() {
  // Implementation would go here
  return [];
}

async function removePendingAction(id) {
  // Implementation would go here
}

// Cache size management
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              return caches.delete(cacheName);
            })
          );
        })
        .then(() => {
          console.log('[ServiceWorker] All caches cleared');
        })
    );
  }
});

// Periodic cache cleanup (every 7 days)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

async function cleanupCache() {
  const now = Date.now();
  
  // Clean API cache
  const apiCache = await caches.open(API_CACHE);
  const apiRequests = await apiCache.keys();
  
  for (const request of apiRequests) {
    const response = await apiCache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const cacheTime = new Date(dateHeader).getTime();
        if (now - cacheTime > CACHE_EXPIRY) {
          await apiCache.delete(request);
        }
      }
    }
  }
}

// Run cleanup periodically
setInterval(cleanupCache, 24 * 60 * 60 * 1000); // Daily