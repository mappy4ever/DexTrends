// Service Worker for DexTrends PWA - v3.0.0
// Enhanced version with comprehensive PWA features

const CACHE_VERSION = '3.0.0';
const STATIC_CACHE = `dextrends-static-v${CACHE_VERSION}`;
const API_CACHE = `dextrends-api-v${CACHE_VERSION}`;
const IMAGE_CACHE = `dextrends-images-v${CACHE_VERSION}`;
const FALLBACK_CACHE = `dextrends-fallback-v${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/dextrendslogo.png',
  '/back-card.png',
  '/_next/static/css/',  // CSS files
  '/_next/static/chunks/framework-', // Core framework files
  '/_next/static/chunks/main-',
  '/_next/static/chunks/polyfills-'
];

// API patterns to cache with different strategies
const API_PATTERNS = [
  /api\.pokemontcg\.io/,
  /images\.pokemontcg\.io/,
  /raw\.githubusercontent\.com.*pokemon-tcg-pocket-cards/,
  /pokeapi\.co/,
  /api\/.*$/  // Local API routes
];

// Image patterns for aggressive caching
const IMAGE_PATTERNS = [
  /images\.pokemontcg\.io/,
  /.*\.(png|jpg|jpeg|gif|webp|svg)$/
];

// Offline fallback pages
const OFFLINE_FALLBACK_PAGE = '/offline.html';
const FALLBACK_IMAGE = '/back-card.png';

// Cache limits
const MAX_API_CACHE_SIZE = 100;
const MAX_IMAGE_CACHE_SIZE = 200;
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Background sync tags
const SYNC_TAGS = {
  FAVORITES: 'sync-favorites',
  COLLECTION: 'sync-collection',
  ANALYTICS: 'sync-analytics'
};

// Utility functions for cache management
async function cleanupCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    const sortedKeys = keys.sort((a, b) => {
      // Sort by request timestamp if available, otherwise by URL
      return (a.url || '').localeCompare(b.url || '');
    });
    
    const keysToDelete = sortedKeys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`[ServiceWorker] Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
  }
}

async function isResponseExpired(response) {
  if (!response) return true;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  return (now - responseDate) > CACHE_EXPIRY_TIME;
}

// Install event - cache critical assets and offline fallbacks
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(asset => !asset.includes('_next')))
          .catch((err) => {
            console.warn('[ServiceWorker] Failed to cache some static assets:', err);
            return Promise.resolve();
          });
      }),
      
      // Cache offline fallback
      caches.open(FALLBACK_CACHE).then((cache) => {
        console.log('[ServiceWorker] Caching fallback resources');
        return cache.addAll([FALLBACK_IMAGE]).catch((err) => {
          console.warn('[ServiceWorker] Failed to cache fallback resources:', err);
          return Promise.resolve();
        });
      }),
      
      // Create offline page
      caches.open(FALLBACK_CACHE).then((cache) => {
        const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DexTrends - Offline</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      max-width: 400px;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
    p { margin: 0 0 2rem 0; opacity: 0.9; }
    button {
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid white;
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    button:hover { background: rgba(255, 255, 255, 0.3); transform: translateY(-2px); }
    .features {
      margin-top: 2rem;
      text-align: left;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .features li { margin: 0.5rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔌</div>
    <h1>You're Offline</h1>
    <p>DexTrends is currently offline. Check your internet connection to access the latest card data and prices.</p>
    <button onclick="location.reload()">Try Again</button>
    
    <div class="features">
      <p><strong>Available when online:</strong></p>
      <ul>
        <li>Real-time card prices</li>
        <li>Complete Pokedex</li>
        <li>TCG set browsing</li>
        <li>Pocket mode cards</li>
        <li>Collection tracking</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
        
        return cache.put(OFFLINE_FALLBACK_PAGE, new Response(offlineHtml, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ])
  );
  
  // Auto activate new service worker
  self.skipWaiting();
});

// Activate event - clean up old caches and initialize background sync
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activated version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Delete all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Clean up oversized caches
      cleanupCache(API_CACHE, MAX_API_CACHE_SIZE),
      cleanupCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE),
      
      // Take control of all pages immediately
      self.clients.claim()
    ])
  );
});

// Enhanced fetch event with comprehensive caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome extension and development requests
  if (url.protocol === 'chrome-extension:' || 
      url.pathname.includes('_next/webpack-hmr') ||
      url.pathname.includes('__nextjs') ||
      url.hostname === 'localhost' && url.port === '3001') {
    return;
  }
  
  // Handle navigation requests (HTML pages)
  const acceptHeader = request.headers.get('accept');
  if (request.mode === 'navigate' || (acceptHeader && acceptHeader.includes('text/html'))) {
    event.respondWith(handleNavigationRequest(request, url));
    return;
  }
  
  // Handle image requests with cache-first strategy
  if (IMAGE_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle API requests with stale-while-revalidate strategy
  if (API_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (url.pathname.match(/\.(css|js|woff2?|ttf|eot|ico)$/) || 
      url.pathname.includes('_next/static/')) {
    event.respondWith(handleStaticAsset(request));
    return;
  }
  
  // Default: Network only for everything else
  event.respondWith(fetch(request).catch(() => {
    // Return offline fallback for failed requests
    return caches.match(OFFLINE_FALLBACK_PAGE);
  }));
});

// Navigation request handler with offline fallback
async function handleNavigationRequest(request, url) {
  try {
    // Always try network first for HTML to get fresh content
    const response = await fetch(request);
    
    // Cache successful HTML responses for offline access
    if (response.ok && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Navigation request failed, serving offline page:', error);
    
    // Try to return cached version first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback page
    const offlineResponse = await caches.match(OFFLINE_FALLBACK_PAGE);
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Image request handler with aggressive caching
async function handleImageRequest(request) {
  try {
    // Try cache first for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !await isResponseExpired(cachedResponse)) {
      return cachedResponse;
    }
    
    // Fetch from network
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
      
      // Clean up cache if it gets too large
      await cleanupCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Image request failed:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return fallback image
    return caches.match(FALLBACK_IMAGE);
  }
}

// API request handler with stale-while-revalidate strategy
async function handleApiRequest(request) {
  try {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    // If we have a cached response, return it immediately
    if (cachedResponse && !await isResponseExpired(cachedResponse)) {
      // Update cache in background
      fetch(request).then(async (response) => {
        if (response.ok) {
          await cache.put(request, response.clone());
          await cleanupCache(API_CACHE, MAX_API_CACHE_SIZE);
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
    
    // No valid cache, fetch from network
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await cleanupCache(API_CACHE, MAX_API_CACHE_SIZE);
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] API request failed:', error);
    
    // Return stale cache if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: 'Network unavailable', 
      message: 'Please check your connection and try again.' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static asset handler with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[ServiceWorker] Static asset request failed:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Asset unavailable', { status: 503 });
  }
}

// Background sync event handler
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.FAVORITES:
      event.waitUntil(syncFavorites());
      break;
    case SYNC_TAGS.COLLECTION:
      event.waitUntil(syncCollection());
      break;
    case SYNC_TAGS.ANALYTICS:
      event.waitUntil(syncAnalytics());
      break;
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received:', event);
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available!',
      icon: '/dextrendslogo.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: data.tag || 'dextrends-notification',
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/dextrendslogo.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'DexTrends', options)
    );
  } catch (error) {
    console.error('[ServiceWorker] Push notification error:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // No existing window, open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync functions
async function syncFavorites() {
  try {
    console.log('[ServiceWorker] Syncing favorites...');
    // Implement favorites sync logic here
    // This would typically sync with your backend API
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Favorites sync failed:', error);
    throw error;
  }
}

async function syncCollection() {
  try {
    console.log('[ServiceWorker] Syncing collection...');
    // Implement collection sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Collection sync failed:', error);
    throw error;
  }
}

async function syncAnalytics() {
  try {
    console.log('[ServiceWorker] Syncing analytics...');
    // Implement analytics sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Analytics sync failed:', error);
    throw error;
  }
}

// Enhanced message handler
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[ServiceWorker] Skip waiting requested');
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      console.log('[ServiceWorker] Clearing all caches');
      event.waitUntil(clearAllCaches());
      break;
      
    case 'CACHE_WARMUP':
      console.log('[ServiceWorker] Cache warmup requested');
      event.waitUntil(warmupCache(payload?.urls || []));
      break;
      
    case 'BACKGROUND_SYNC':
      console.log('[ServiceWorker] Background sync requested:', payload?.tag);
      if (payload?.tag && self.registration.sync) {
        self.registration.sync.register(payload.tag);
      }
      break;
      
    default:
      console.log('[ServiceWorker] Unknown message type:', type);
  }
});

// Cache management functions
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        console.log('[ServiceWorker] Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    console.log('[ServiceWorker] All caches cleared');
  } catch (error) {
    console.error('[ServiceWorker] Failed to clear caches:', error);
  }
}

async function warmupCache(urls) {
  try {
    if (!Array.isArray(urls) || urls.length === 0) return;
    
    console.log('[ServiceWorker] Warming up cache with URLs:', urls);
    
    const cache = await caches.open(STATIC_CACHE);
    const responses = await Promise.allSettled(
      urls.map(url => fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response.clone());
        }
      }))
    );
    
    const successful = responses.filter(r => r.status === 'fulfilled').length;
    console.log(`[ServiceWorker] Cache warmup completed: ${successful}/${urls.length} successful`);
  } catch (error) {
    console.error('[ServiceWorker] Cache warmup failed:', error);
  }
}

// Periodic cleanup task
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PERIODIC_CLEANUP') {
    event.waitUntil(performPeriodicCleanup());
  }
});

async function performPeriodicCleanup() {
  try {
    console.log('[ServiceWorker] Performing periodic cleanup...');
    
    // Clean up oversized caches
    await Promise.all([
      cleanupCache(API_CACHE, MAX_API_CACHE_SIZE),
      cleanupCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE)
    ]);
    
    // Remove expired responses
    const cacheNames = [API_CACHE, IMAGE_CACHE, STATIC_CACHE];
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (await isResponseExpired(response)) {
          await cache.delete(request);
        }
      }
    }
    
    console.log('[ServiceWorker] Periodic cleanup completed');
  } catch (error) {
    console.error('[ServiceWorker] Periodic cleanup failed:', error);
  }
}

console.log('[ServiceWorker] Enhanced version loaded:', CACHE_VERSION);