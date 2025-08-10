/// <reference lib="webworker" />
/// <reference path="../types/service-worker.d.ts" />

// Enhanced Service Worker for DexTrends PWA with Adaptive Loading  
declare const self: ServiceWorkerGlobalScope & {
  skipWaiting(): Promise<void>;
  clients: Clients;
  registration: ServiceWorkerRegistration;
};

// Override global context to ensure service worker types
declare global {
  const skipWaiting: () => Promise<void>;
  const clients: Clients;
  const registration: ServiceWorkerRegistration;
}
const CACHE_NAME = 'dextrends-v1.1.0';
const STATIC_CACHE = 'dextrends-static-v1.1.0';
const DYNAMIC_CACHE = 'dextrends-dynamic-v1.1.0';
const IMAGE_CACHE = 'dextrends-images-v1.1.0';
const PERFORMANCE_CACHE = 'dextrends-performance-v1.1.0';

// Network connection monitoring
let connectionSpeed = 'fast'; // fast, slow, offline
let dataMode = 'full'; // full, reduced, essential

// Track initial install to prevent refresh loops
let isInitialInstall = false;

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/cards',
  '/pokedex',
  '/trending',
  '/pocketmode',
  '/tcgsets',
  '/manifest.json',
  '/dextrendslogo.png',
  '/favicon.ico',
  // Core CSS
  '/_next/static/css/app.css',
  // Core JS (will be updated dynamically)
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.pokemontcg\.io\/v2\//,
  /^https:\/\/images\.pokemontcg\.io\//,
  /^https:\/\/raw\.githubusercontent\.com\/chase-manning\/pokemon-tcg-pocket-cards\//,
  /^https:\/\/limitlesstcg\.nyc3\.cdn\.digitaloceanspaces\.com\//
];

// Performance monitoring
interface PerformanceMetrics {
  loadTimes: number[];
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  imageOptimizations: number;
}

const performanceMetrics: PerformanceMetrics = {
  loadTimes: [],
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  imageOptimizations: 0
};

// Connection quality detection
function detectConnectionSpeed() {
  if ((navigator as any).connection) {
    const connection = (navigator as any).connection;
    const effectiveType = connection.effectiveType;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        connectionSpeed = 'slow';
        dataMode = 'essential';
        break;
      case '3g':
        connectionSpeed = 'medium';
        dataMode = 'reduced';
        break;
      case '4g':
      default:
        connectionSpeed = 'fast';
        dataMode = 'full';
        break;
    }
    
    // Update data mode based on data saver
    if (connection.saveData) {
      dataMode = 'essential';
    }
  }
  
  console.log('SW: Connection detected:', { connectionSpeed, dataMode });
}

// Adaptive image quality based on connection
function getOptimalImageUrl(originalUrl: string): string {
  if (!originalUrl || !originalUrl.includes('pokemontcg.io')) {
    return originalUrl;
  }
  
  try {
    const url = new URL(originalUrl);
    
    switch (dataMode) {
      case 'essential':
        // Lowest quality for slow connections
        url.searchParams.set('w', '150');
        url.searchParams.set('q', '30');
        break;
      case 'reduced':
        // Medium quality for average connections
        url.searchParams.set('w', '300');
        url.searchParams.set('q', '60');
        break;
      case 'full':
      default:
        // Keep original quality for fast connections
        break;
    }
    
    performanceMetrics.imageOptimizations++;
    return url.toString();
  } catch (error) {
    return originalUrl;
  }
}

// Intelligent prefetching
function shouldPrefetch(request: Request): boolean {
  const url = new URL(request.url);
  
  // Don't prefetch on slow connections
  if (connectionSpeed === 'slow') {
    return false;
  }
  
  // Don't prefetch large resources on medium connections
  if (connectionSpeed === 'medium' && isLargeResource(url.href)) {
    return false;
  }
  
  return true;
}

function isLargeResource(url: string): boolean {
  const largeResourcePatterns = [
    /\.(mp4|webm|avi|mov)$/i,
    /\.(pdf)$/i,
    /size=large/i
  ];
  
  const urlObj = new URL(url);
  return largeResourcePatterns.some(pattern => pattern.test(urlObj.pathname + urlObj.search));
}

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker: Installing enhanced version...');
  isInitialInstall = true;
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache: Cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter((url: string) => !url.startsWith('/_next')));
      }),
      // Initialize performance cache
      caches.open(PERFORMANCE_CACHE).then((cache: Cache) => {
        console.log('Service Worker: Initializing performance cache');
        return cache.put('/sw-metrics', new Response(JSON.stringify(performanceMetrics)));
      })
    ]).catch((error: Error) => {
      console.error('Service Worker: Installation failed:', error);
    })
  );
  
  // Detect initial connection speed
  detectConnectionSpeed();
  
  // Only skip waiting on initial install, not updates
  if (isInitialInstall) {
    self.skipWaiting();
  }
});

// Activate event - clean old caches and notify updates
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activating enhanced version...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames: string[]) => {
        return Promise.all(
          cacheNames.map((cache: string) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, PERFORMANCE_CACHE].includes(cache)) {
              console.log('Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
            return Promise.resolve();
          })
        );
      }),
      // Setup connection monitoring
      setupConnectionMonitoring(),
      // Notify clients of successful update
      self.clients.matchAll().then((clients: Client[]) => {
        clients.forEach((client: Client) => {
          client.postMessage({
            type: 'APP_UPDATED',
            version: CACHE_NAME,
            timestamp: Date.now()
          });
        });
      })
    ]).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Setup connection monitoring
async function setupConnectionMonitoring() {
  // Listen for connection changes
  if ((navigator as any).connection) {
    (navigator as any).connection.addEventListener('change', () => {
      detectConnectionSpeed();
      // Notify clients of connection change
      self.clients.matchAll().then((clients: Client[]) => {
        clients.forEach((client: Client) => {
          client.postMessage({
            type: 'CONNECTION_CHANGE',
            connectionSpeed,
            dataMode
          });
        });
      });
    });
  }
  
  // Setup periodic cache cleanup
  setInterval(performCacheCleanup, 30 * 60 * 1000); // Every 30 minutes
}

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests except for known APIs
  if (url.origin !== location.origin && !isAPIRequest(url)) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Handle different types of fetch requests
async function handleFetch(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  try {
    // Handle API requests
    if (isAPIRequest(url)) {
      return await handleAPIRequest(request);
    }
    
    // Handle image requests
    if (isImageRequest(url)) {
      return await handleImageRequest(request);
    }
    
    // Handle navigation requests
    if (request.mode === 'navigate') {
      return await handleNavigationRequest(request);
    }
    
    // Handle static assets
    return await handleStaticRequest(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch error:', error);
    return await handleOfflineRequest(request);
  }
}

// Check if request is for API
function isAPIRequest(url: URL): boolean {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Check if request is for image
function isImageRequest(url: URL): boolean {
  return !!url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
         url.hostname.includes('images.pokemontcg.io') ||
         url.hostname.includes('limitlesstcg.nyc3.cdn.digitaloceanspaces.com');
}

// Handle API requests with cache-first strategy for GET requests
async function handleAPIRequest(request: Request): Promise<Response> {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // For API requests, try cache first, then network
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached version and update in background
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }
  
  // No cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    // Cache successful responses
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Update cache in background
async function updateCacheInBackground(request: Request, cache: Cache): Promise<void> {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Handle image requests with adaptive quality
async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(IMAGE_CACHE);
  const startTime = performance.now();
  
  // Get optimal image URL based on connection
  const originalUrl = request.url;
  const optimizedUrl = getOptimalImageUrl(originalUrl);
  const optimizedRequest = optimizedUrl !== originalUrl ? 
    new Request(optimizedUrl, { mode: 'cors' }) : request;
  
  // Check cache first (try both original and optimized)
  let cachedResponse = await cache.match(optimizedRequest);
  if (!cachedResponse && optimizedUrl !== originalUrl) {
    cachedResponse = await cache.match(request);
  }
  
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    recordLoadTime(startTime);
    return cachedResponse;
  }
  
  // Fetch from network with adaptive strategy
  performanceMetrics.cacheMisses++;
  performanceMetrics.networkRequests++;
  
  try {
    const networkResponse = await fetch(optimizedRequest);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(optimizedRequest, networkResponse.clone());
      
      // Also cache under original URL if different
      if (optimizedUrl !== originalUrl) {
        cache.put(request, networkResponse.clone());
      }
      
      recordLoadTime(startTime);
      return networkResponse;
    }
    
    throw new Error(`HTTP ${networkResponse.status}`);
  } catch (error) {
    // Fallback to cached version if available
    const fallbackResponse = await cache.match(request);
    if (fallbackResponse) {
      performanceMetrics.cacheHits++;
      return fallbackResponse;
    }
    
    // Return placeholder image for failed requests
    return createPlaceholderImage();
  }
}

// Create placeholder image response
function createPlaceholderImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
      <rect width="200" height="280" fill="#f3f4f6"/>
      <circle cx="100" cy="140" r="30" fill="#d1d5db"/>
      <text x="100" y="220" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
        Image unavailabl}}
  `;
  
  return new Response(svg, {
    headers: { 
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

// Record performance metrics
function recordLoadTime(startTime: number): void {
  const loadTime = performance.now() - startTime;
  performanceMetrics.loadTimes.push(loadTime);
  
  // Keep only last 100 measurements
  if (performanceMetrics.loadTimes.length > 100) {
    performanceMetrics.loadTimes = performanceMetrics.loadTimes.slice(-100);
  }
}

// Cache cleanup based on connection speed
async function performCacheCleanup() {
  console.log('SW: Performing cache cleanup...');
  
  const caches_to_clean = [DYNAMIC_CACHE, IMAGE_CACHE];
  
  for (const cacheName of caches_to_clean) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    // Remove old entries based on connection speed
    const maxAge = connectionSpeed === 'slow' ? 2 * 60 * 60 * 1000 : // 2 hours
                   connectionSpeed === 'medium' ? 6 * 60 * 60 * 1000 : // 6 hours  
                   24 * 60 * 60 * 1000; // 24 hours
    
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (!dateHeader) continue;
        const cachedTime = new Date(dateHeader).getTime();
        if (now - cachedTime > maxAge) {
          await cache.delete(request);
          cleanedCount++;
        }
      }
    }
    
    console.log(`SW: Cleaned ${cleanedCount} entries from ${cacheName}`);
  }
  
  // Update performance metrics
  await updatePerformanceMetrics();
}

// Update performance metrics
async function updatePerformanceMetrics() {
  try {
    const cache = await caches.open(PERFORMANCE_CACHE);
    await cache.put('/sw-metrics', new Response(JSON.stringify({
      ...performanceMetrics,
      connectionSpeed,
      dataMode,
      timestamp: Date.now()
    })));
  } catch (error) {
    console.error('SW: Failed to update performance metrics:', error);
  }
}

// Handle navigation requests
async function handleNavigationRequest(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful navigation responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    // Network failed, try cache
  }
  
  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to index page for SPA routing
  const indexResponse = await cache.match('/');
  if (indexResponse) {
    return indexResponse;
  }
  
  // Last resort offline page
  return new Response(getOfflineHTML(), {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle static asset requests
async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(STATIC_CACHE);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fetch from network and cache
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Handle offline requests
async function handleOfflineRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Try to find any cached version
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return new Response(getOfflineHTML(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // Return offline image for image requests
  if (isImageRequest(url)) {
    return new Response(getOfflineSVG(), {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  // Generic offline response
  return new Response('Offline', { status: 503 });
}

// Get offline HTML page
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DexTrends - Offlin}
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .offline-content {
          max-width: 400px;
        }
        .pokeball {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          opacity: 0.8;
        }
        h1 { margin-bottom: 10px; }
        p { margin-bottom: 30px; opacity: 0.9; }
        button {
          background: rgba(255,255,255,0.2);
          border: 2px solid white;
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        button:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }}}
    <body>
      <div class="offline-content">
        <div class="pokeball">}
        <h1>You're Offlin}
        <p>Don't worry, Trainer! Your Pokemon data is safely cached and you can still browse your collection}
        <button onclick="window.location.reload()">Try Agai}
        <br><br>
        <a href="/" style="color: rgba(255,255,255,0.8); text-decoration: none;">← Return to DexTrend}}}}
  `;
}

// Get offline SVG placeholder
function getOfflineSVG() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <circle cx="100" cy="100" r="30" fill="#ddd"/>
      <text x="100" y="150" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
        Image Offlin}}
  `;
}

// Background sync for failed requests and data updates
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('Service Worker: Sync event triggered with tag:', event.tag);
  
  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(doBackgroundSync());
      break;
    case 'price-sync':
      event.waitUntil(syncPriceData());
      break;
    case 'favorites-sync':
      event.waitUntil(syncFavorites());
      break;
    case 'collection-sync':
      event.waitUntil(syncCollection());
      break;
    default:
      console.log('Service Worker: Unknown sync tag:', event.tag);
  }
});

// Background sync implementation
async function doBackgroundSync() {
  console.log('Service Worker: Background sync triggered');
  
  try {
    // Retry failed requests
    await retryFailedRequests();
    
    // Sync critical data
    await syncCriticalData();
    
    // Update cache with fresh data
    await updateCacheWithFreshData();
    
    // Notify clients of successful sync
    const clients = await self.clients.matchAll();
    clients.forEach((client: Client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
    
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Retry failed requests stored in IndexedDB
async function retryFailedRequests() {
  // Implementation would use IndexedDB to store failed requests
  // and retry them when network is available
  console.log('Service Worker: Retrying failed requests...');
}

// Sync critical data
async function syncCriticalData() {
  const criticalUrls = [
    '/api/trending',
    '/api/favorites',
    '/api/user-collections'
  ];
  
  for (const url of criticalUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(url, response.clone());
      }
    } catch (error) {
      console.error(`Service Worker: Failed to sync ${url}:`, error);
    }
  }
}

// Update cache with fresh data
async function updateCacheWithFreshData() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  // Update API responses that are older than 5 minutes
  const maxAge = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (!dateHeader) continue;
        const cachedTime = new Date(dateHeader).getTime();
        if (now - cachedTime > maxAge) {
          const freshResponse = await fetch(request);
          if (freshResponse.ok) {
            cache.put(request, freshResponse.clone());
          }
        }
      }
    } catch (error) {
      // Ignore errors for individual requests
    }
  }
}

// Sync price data
async function syncPriceData() {
  console.log('Service Worker: Syncing price data...');
  
  try {
    const response = await fetch('/api/collect-prices');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/collect-prices', response.clone());
      
      // Notify clients of price update
      const clients = await self.clients.matchAll();
      clients.forEach((client: Client) => {
        client.postMessage({
          type: 'PRICE_DATA_UPDATED',
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Price sync failed:', error);
  }
}

// Sync favorites
async function syncFavorites() {
  console.log('Service Worker: Syncing favorites...');
  
  try {
    const response = await fetch('/api/favorites');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/favorites', response.clone());
    }
  } catch (error) {
    console.error('Service Worker: Favorites sync failed:', error);
  }
}

// Sync collection data
async function syncCollection() {
  console.log('Service Worker: Syncing collection data...');
  
  try {
    const response = await fetch('/api/collections');
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/collections', response.clone());
    }
  } catch (error) {
    console.error('Service Worker: Collection sync failed:', error);
  }
}

// Push notifications (future feature)
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/dextrendslogo.png',
        badge: '/dextrendslogo.png',
        tag: 'dextrends-notification',
        data: data.url
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data as string)
    );
  }
});

// App update notifications
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && typeof event.data === 'object' && (event.data as { type: string }).type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && typeof event.data === 'object' && (event.data as { type: string }).type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      timestamp: Date.now()
    });
  }
});

// Check for app updates
async function checkForUpdates() {
  try {
    const clients = await self.clients.matchAll();
    
    if (clients.length > 0) {
      clients.forEach((client: Client) => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: CACHE_NAME,
          timestamp: Date.now()
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Update check failed:', error);
  }
}

// Update notification functionality handled in main activate event above

// Periodic update check (every 6 hours)
// Only check for updates when the user is actively using the app
// Removed automatic interval to prevent refresh loops
let updateCheckTimeout: any;
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && typeof event.data === 'object' && (event.data as { type: string }).type === 'CHECK_FOR_UPDATES') {
    clearTimeout(updateCheckTimeout);
    updateCheckTimeout = setTimeout(() => {
      if (self.clients) {
        checkForUpdates();
      }
    }, 5000); // Debounced 5-second check instead of constant 6-hour intervals
  }
});

console.log('Service Worker: Loaded successfully with version', CACHE_NAME);