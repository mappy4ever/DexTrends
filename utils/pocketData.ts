// Enhanced Pocket Data utility with intelligent caching and Supabase integration
import { SupabaseCache } from '../lib/supabase';
import { fetchJSON } from './unifiedFetch';
import type { PocketCard } from '../types/api/pocket-cards';

let pocketDataCache: PocketCard[] | null = null;
let cacheTimestamp: number | null = null;
let fetchPromise: Promise<PocketCard[]> | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache (extended)
const STORAGE_KEY = 'pocketDataCache';
const SUPABASE_CACHE_KEY = 'pocket_data_full';
const SUPABASE_CACHE_ID = 8888888; // Special ID for pocket data cache

interface LocalStorageCache {
  data: PocketCard[];
  timestamp: number;
}

export async function fetchPocketData(): Promise<PocketCard[]> {
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
    const supabaseCached = await SupabaseCache.getCachedPokemon(SUPABASE_CACHE_ID) as PocketCard[] | null;
    if (supabaseCached && Array.isArray(supabaseCached)) {
      pocketDataCache = supabaseCached;
      cacheTimestamp = now;
      return supabaseCached;
    }
  } catch (error) {
    // Supabase cache unavailable, continue with fetch
  }
  
  // Create new fetch promise using unifiedFetch
  fetchPromise = fetchJSON<PocketCard[]>("https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json", {
    useCache: false, // We handle caching at this level
    timeout: 15000, // 15 second timeout for large JSON file
    retries: 3 // More retries for critical data
  })
    .then(async (data) => {
      if (!data) {
        throw new Error('Received null/undefined data from pocket cards API');
      }
      pocketDataCache = data;
      cacheTimestamp = now;
      fetchPromise = null;
      
      // Cache in Supabase for 4 hours
      try {
        await SupabaseCache.setCachedPokemon(SUPABASE_CACHE_ID, data as Record<string, unknown>, SUPABASE_CACHE_KEY, 4);
      } catch (error) {
        // Failed to cache in Supabase, continue normally
      }
      
      // Cache in localStorage for persistence across sessions
      try {
        const cacheData: LocalStorageCache = {
          data,
          timestamp: now
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      } catch (e) {
        // Could not cache to localStorage, continue normally
      }
      
      return data;
    })
    .catch(async (error) => {
      fetchPromise = null;
      
      // Try Supabase cache as fallback (even if expired)
      try {
        const supabaseFallback = await SupabaseCache.getCachedPokemon(SUPABASE_CACHE_ID) as PocketCard[] | null;
        if (supabaseFallback && Array.isArray(supabaseFallback)) {
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
          const { data, timestamp }: LocalStorageCache = JSON.parse(cached);
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
      const { data, timestamp }: LocalStorageCache = JSON.parse(cached);
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
export function clearPocketCache(): void {
  pocketDataCache = null;
  cacheTimestamp = null;
  fetchPromise = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isPocketCacheValid(): boolean {
  if (!pocketDataCache || !cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}