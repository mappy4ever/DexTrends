/**
 * Minimal Safari-compatible Service Worker
 * This service worker is designed to work reliably with Safari's stricter implementation
 * It avoids aggressive caching and skipWaiting to prevent blank screens and refresh loops
 */

const CACHE_NAME = 'dextrends-safari-v1';
const OFFLINE_URL = '/';

// Minimal list of essential assets to cache
const ESSENTIAL_ASSETS = [
  '/',
  '/manifest.json',
  '/dextrendslogo.png',
  '/favicon.ico'
];

// Install event - cache only essential assets
self.addEventListener('install', (event) => {
  console.log('[Safari SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Safari SW] Caching essential assets');
        // Don't cache all at once, do it gracefully
        return Promise.allSettled(
          ESSENTIAL_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[Safari SW] Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[Safari SW] Installation complete');
        // DO NOT call skipWaiting() - let the user control updates
      })
      .catch((error) => {
        console.error('[Safari SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Safari SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('dextrends-')) {
              console.log('[Safari SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Safari SW] Activation complete');
        // Claim clients gracefully
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('[Safari SW] Activation failed:', error);
      })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extension and non-http requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip cross-origin requests except for known CDNs
  const isKnownCDN = url.hostname.includes('pokemontcg.io') || 
                     url.hostname.includes('githubusercontent.com');
  if (url.origin !== location.origin && !isKnownCDN) {
    return;
  }
  
  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Cache the response asynchronously
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache HTML pages and essential assets
              const shouldCache = event.request.mode === 'navigate' ||
                                ESSENTIAL_ASSETS.includes(url.pathname);
              
              if (shouldCache) {
                cache.put(event.request, responseToCache);
              }
            })
            .catch(err => {
              console.warn('[Safari SW] Failed to cache response:', err);
            });
        }
        
        return response;
      })
      .catch((error) => {
        // Network failed, try cache
        console.log('[Safari SW] Network failed, trying cache:', error.message);
        
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For navigation requests, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Return a basic error response
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Message event - handle skip waiting requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Safari SW] Skip waiting requested');
    // Only skip waiting when explicitly requested by user
    self.skipWaiting();
  }
});

// Log service worker version for debugging
console.log('[Safari SW] Service worker loaded - Version:', CACHE_NAME);