// Enhanced Pocket Data utility with intelligent caching and error handling
let pocketDataCache = null;
let cacheTimestamp = null;
let fetchPromise = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const STORAGE_KEY = 'pocketDataCache';

export async function fetchPocketData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pocketDataCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return pocketDataCache;
  }
  
  // Return existing fetch promise if already in progress (prevents duplicate requests)
  if (fetchPromise) {
    return fetchPromise;
  }
  
  // Create new fetch promise
  fetchPromise = fetch("https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch Pocket data: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      pocketDataCache = data;
      cacheTimestamp = now;
      fetchPromise = null;
      
      // Cache in localStorage for persistence across sessions
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          data,
          timestamp: now
        }));
      } catch (e) {
        console.warn('Could not cache to localStorage:', e);
      }
      
      return data;
    })
    .catch(error => {
      fetchPromise = null;
      
      // Try to use localStorage cache as fallback
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (data && Array.isArray(data)) {
            console.warn('Using cached Pocket data due to fetch error:', error);
            pocketDataCache = data;
            cacheTimestamp = timestamp;
            return data;
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      
      throw error;
    });
  
  return fetchPromise;
}

// Initialize cache from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (data && timestamp && (now - timestamp < CACHE_DURATION)) {
        pocketDataCache = data;
        cacheTimestamp = timestamp;
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
}

// Utility functions for cache management
export function clearPocketCache() {
  pocketDataCache = null;
  cacheTimestamp = null;
  fetchPromise = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isPocketCacheValid() {
  if (!pocketDataCache || !cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}
