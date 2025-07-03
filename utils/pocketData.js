// Enhanced Pocket Data utility with intelligent caching and Supabase integration
import { SupabaseCache } from '../lib/supabase';

let pocketDataCache = null;
let cacheTimestamp = null;
let fetchPromise = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache (extended)
const STORAGE_KEY = 'pocketDataCache';
const SUPABASE_CACHE_KEY = 'pocket_data_full';

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
  
  // Try Supabase cache first
  try {
    const supabaseCached = await SupabaseCache.getCachedPokemon(SUPABASE_CACHE_KEY);
    if (supabaseCached) {
      pocketDataCache = supabaseCached;
      cacheTimestamp = now;
      return supabaseCached;
    }
  } catch (error) {
    // Supabase cache unavailable, continue with fetch
  }
  
  // Create new fetch promise
  fetchPromise = fetch("https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`Failed to fetch Pocket data: ${res.status}`);
      }
      return res.json();
    })
    .then(async (data) => {
      pocketDataCache = data;
      cacheTimestamp = now;
      fetchPromise = null;
      
      // Cache in Supabase for 4 hours
      try {
        await SupabaseCache.setCachedPokemon(SUPABASE_CACHE_KEY, data, 'pocket_full_dataset', 4);
      } catch (error) {
        // Failed to cache in Supabase, continue normally
      }
      
      // Cache in localStorage for persistence across sessions
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          data,
          timestamp: now
        }));
      } catch (e) {
        // Could not cache to localStorage, continue normally
      }
      
      return data;
    })
    .catch(async (error) => {
      fetchPromise = null;
      
      // Try Supabase cache as fallback (even if expired)
      try {
        const supabaseFallback = await SupabaseCache.getCachedPokemon(SUPABASE_CACHE_KEY);
        if (supabaseFallback) {
          // Using Supabase fallback cache due to fetch error
          pocketDataCache = supabaseFallback;
          cacheTimestamp = now - (CACHE_DURATION / 2); // Mark as half-expired
          return supabaseFallback;
        }
      } catch (supabaseError) {
        // Supabase fallback also failed
      }
      
      // Try to use localStorage cache as final fallback
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (data && Array.isArray(data)) {
            // Using localStorage fallback due to fetch error
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
