/**
 * UnifiedCacheManager - Consolidated caching system for DexTrends
 * Combines memory, localStorage, and database caching with intelligent tiering
 */

import type { 
  CacheEntry, 
  CacheOptions, 
  CacheStats,
  CacheSetOptions,
  CacheGetOptions,
  CacheManager,
  CacheStrategy,
  CachePersistence,
  CacheInvalidationOptions
} from '../types/utils/cache';

// Cache configuration
export const CONFIG = {
  // Memory cache settings
  MEMORY_MAX_SIZE: 100,
  MEMORY_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Local storage settings
  LOCAL_TTL: 60 * 60 * 1000, // 1 hour
  LOCAL_PREFIX: 'dextrends_cache_',
  
  // Database cache settings (for critical data)
  DB_TTL: 24 * 60 * 60 * 1000, // 24 hours
  
  // Cache priorities
  PRIORITY: {
    CRITICAL: 3,    // DB + Local + Memory
    HIGH: 2,        // Local + Memory
    NORMAL: 1,      // Memory only
  }
} as const;

// Type for cache priority
export type CachePriority = typeof CONFIG.PRIORITY[keyof typeof CONFIG.PRIORITY];

// Internal cache entry type
interface InternalCacheEntry<T = any> {
  data: T;
  expiry: number;
  timestamp: number;
  version?: string;
}

// Extended cache options for this implementation
interface ExtendedCacheOptions {
  priority?: CachePriority;
  ttl?: number;
  ignoreExpiry?: boolean;
  staleWhileRevalidate?: boolean;
  params?: Record<string, any>;
  tags?: string[];
  compress?: boolean;
  encrypt?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Base cache storage interface
 */
abstract class CacheStorage {
  abstract get<T = any>(key: string): Promise<T | null>;
  abstract set<T = any>(key: string, value: T, ttl: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  
  async getStats(): Promise<Partial<CacheStats>> {
    return { hits: 0, misses: 0, size: 0, entries: 0, evictions: 0, avgAccessTime: 0, lastReset: 0, hitRate: 0 };
  }
}

/**
 * Memory cache implementation with LRU eviction
 */
class MemoryCache extends CacheStorage {
  private cache: Map<string, InternalCacheEntry>;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;
  private accessOrder: Map<string, number>;
  
  constructor(maxSize: number = CONFIG.MEMORY_MAX_SIZE) {
    super();
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = new Map();
  }
  
  override async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.misses++;
      return null;
    }
    
    // Update access time for LRU
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());
    
    this.hits++;
    return entry.data as T;
  }
  
  override async set<T = any>(key: string, value: T, ttl: number = CONFIG.MEMORY_TTL): Promise<void> {
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessOrder.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data: value,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });
    
    // Update access order
    this.accessOrder.delete(key);
    this.accessOrder.set(key, Date.now());
  }
  
  override async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }
  
  override async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  override async getStats(): Promise<Partial<CacheStats>> {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      entries: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      evictions: 0,
      avgAccessTime: 0,
      lastReset: Date.now()
    };
  }
  
  // Cleanup expired entries
  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }
}

/**
 * LocalStorage cache implementation
 */
class LocalStorageCache extends CacheStorage {
  private prefix: string;
  
  constructor(prefix: string = CONFIG.LOCAL_PREFIX) {
    super();
    this.prefix = prefix;
  }
  
  private generateKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  override async get<T = any>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.generateKey(key));
      if (!item) return null;
      
      const entry: InternalCacheEntry<T> = JSON.parse(item);
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(this.generateKey(key));
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('LocalStorage get error:', error);
      return null;
    }
  }
  
  override async set<T = any>(key: string, value: T, ttl: number = CONFIG.LOCAL_TTL): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: InternalCacheEntry<T> = {
        data: value,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.generateKey(key), JSON.stringify(entry));
    } catch (error: any) {
      console.warn('LocalStorage set error:', error);
      // Try to clear some space
      if (error.name === 'QuotaExceededError') {
        await this.cleanup();
        try {
          const entry: InternalCacheEntry<T> = {
            data: value,
            expiry: Date.now() + ttl,
            timestamp: Date.now(),
            version: '1.0'
          };
          localStorage.setItem(this.generateKey(key), JSON.stringify(entry));
        } catch {
          // Still failed, give up
        }
      }
    }
  }
  
  override async delete(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.generateKey(key));
  }
  
  override async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  async cleanup(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry: InternalCacheEntry = JSON.parse(item);
            if (now > entry.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }
}

/**
 * Database cache implementation (using Supabase)
 */
class DatabaseCache extends CacheStorage {
  private supabase: any = null;
  
  async initialize(): Promise<void> {
    if (!this.supabase) {
      const { supabase } = await import('../lib/supabase');
      this.supabase = supabase;
    }
  }
  
  override async get<T = any>(key: string): Promise<T | null> {
    await this.initialize();
    
    try {
      const { data, error } = await this.supabase
        .from('unified_cache')
        .select('cache_data')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) return null;
      return data.cache_data as T;
    } catch (error) {
      console.warn('Database cache get error:', error);
      return null;
    }
  }
  
  override async set<T = any>(key: string, value: T, ttl: number = CONFIG.DB_TTL): Promise<void> {
    await this.initialize();
    
    try {
      const expiresAt = new Date(Date.now() + ttl);
      
      await this.supabase
        .from('unified_cache')
        .upsert({
          cache_key: key,
          cache_data: value,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
          category: this.getCategoryFromKey(key)
        });
    } catch (error) {
      console.warn('Database cache set error:', error);
    }
  }
  
  override async delete(key: string): Promise<void> {
    await this.initialize();
    
    try {
      await this.supabase
        .from('unified_cache')
        .delete()
        .eq('cache_key', key);
    } catch (error) {
      console.warn('Database cache delete error:', error);
    }
  }
  
  override async clear(): Promise<void> {
    await this.initialize();
    
    try {
      await this.supabase
        .from('unified_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.warn('Database cache clear error:', error);
    }
  }
  
  private getCategoryFromKey(key: string): string {
    if (key.includes('pokemon')) return 'pokemon';
    if (key.includes('card') || key.includes('tcg')) return 'cards';
    if (key.includes('price')) return 'prices';
    return 'general';
  }
}

/**
 * Main UnifiedCacheManager class
 */
class UnifiedCacheManager {
  private memory: MemoryCache;
  private local: LocalStorageCache;
  private database: DatabaseCache;
  private metrics: {
    requests: number;
    hits: number;
    misses: number;
  };
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.memory = new MemoryCache();
    this.local = new LocalStorageCache();
    this.database = new DatabaseCache();
    this.metrics = {
      requests: 0,
      hits: 0,
      misses: 0
    };
    
    // Setup periodic cleanup
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
    }
  }
  
  /**
   * Generate a cache key from various inputs
   */
  generateKey(identifier: string | object, params: Record<string, any> = {}): string {
    if (typeof identifier === 'object') {
      identifier = JSON.stringify(identifier);
    }
    
    const paramString = Object.keys(params).length > 0 
      ? '_' + JSON.stringify(params) 
      : '';
    
    // Use btoa only if available (browser environment)
    if (typeof btoa !== 'undefined') {
      return btoa(identifier + paramString).replace(/[^a-zA-Z0-9]/g, '');
    } else {
      // Node.js fallback
      return Buffer.from(identifier + paramString).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    }
  }
  
  /**
   * Get data from cache with waterfall strategy
   */
  async get<T = any>(key: string, options: ExtendedCacheOptions = {}): Promise<T | null> {
    const { priority = CONFIG.PRIORITY.NORMAL } = options;
    this.metrics.requests++;
    
    // Try memory cache first (fastest)
    let data = await this.memory.get<T>(key);
    if (data !== null) {
      this.metrics.hits++;
      return data;
    }
    
    // Try local storage if priority is HIGH or CRITICAL
    if (priority >= CONFIG.PRIORITY.HIGH) {
      data = await this.local.get<T>(key);
      if (data !== null) {
        // Promote to memory cache
        await this.memory.set(key, data);
        this.metrics.hits++;
        return data;
      }
    }
    
    // Try database if priority is CRITICAL
    if (priority === CONFIG.PRIORITY.CRITICAL) {
      data = await this.database.get<T>(key);
      if (data !== null) {
        // Promote to lower tiers
        await this.local.set(key, data);
        await this.memory.set(key, data);
        this.metrics.hits++;
        return data;
      }
    }
    
    this.metrics.misses++;
    return null;
  }
  
  /**
   * Set data in cache based on priority
   */
  async set<T = any>(key: string, value: T, options: ExtendedCacheOptions = {}): Promise<void> {
    const {
      priority = CONFIG.PRIORITY.NORMAL,
      ttl = null
    } = options;
    
    // Always set in memory cache
    await this.memory.set(key, value, ttl || CONFIG.MEMORY_TTL);
    
    // Set in local storage if HIGH or CRITICAL priority
    if (priority >= CONFIG.PRIORITY.HIGH) {
      await this.local.set(key, value, ttl || CONFIG.LOCAL_TTL);
    }
    
    // Set in database if CRITICAL priority
    if (priority === CONFIG.PRIORITY.CRITICAL) {
      await this.database.set(key, value, ttl || CONFIG.DB_TTL);
    }
  }
  
  /**
   * Delete from all cache tiers
   */
  async delete(key: string): Promise<boolean> {
    await Promise.all([
      this.memory.delete(key),
      this.local.delete(key),
      this.database.delete(key)
    ]);
    return true;
  }
  
  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    await Promise.all([
      this.memory.clear(),
      this.local.clear(),
      this.database.clear()
    ]);
    
    this.metrics = {
      requests: 0,
      hits: 0,
      misses: 0
    };
  }
  
  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const [memoryStats, localStats, dbStats] = await Promise.all([
      this.memory.getStats(),
      this.local.getStats(),
      this.database.getStats()
    ]);
    
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: this.metrics.requests > 0 
        ? (this.metrics.hits / this.metrics.requests) * 100 
        : 0,
      size: 0,
      entries: 0,
      evictions: 0,
      avgAccessTime: 0,
      lastReset: Date.now()
    };
  }
  
  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.memory.cleanup(),
      this.local.cleanup(),
      this.database.clear() // Only clears expired
    ]);
  }
  
  /**
   * Cached fetch with automatic retry and fallback
   */
  async cachedFetch<T = any>(
    url: string, 
    fetcher: () => Promise<T>, 
    options: ExtendedCacheOptions = {}
  ): Promise<T> {
    const key = this.generateKey(url, options.params || {});
    const cacheOptions: ExtendedCacheOptions = {
      priority: options.priority || CONFIG.PRIORITY.NORMAL,
      ttl: options.ttl
    };
    
    // Check cache first
    const cached = await this.get<T>(key, cacheOptions);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch fresh data
    try {
      const data = await fetcher();
      await this.set(key, data, cacheOptions);
      return data;
    } catch (error) {
      // On error, try to return stale data if available
      if (options.staleWhileRevalidate) {
        const stale = await this.get<T>(key, { ...cacheOptions, ignoreExpiry: true });
        if (stale !== null) {
          console.warn('Returning stale data due to fetch error:', error);
          return stale;
        }
      }
      throw error;
    }
  }

  // Partial CacheManager implementation
  async has(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }
  
  /**
   * Destroy the cache manager and clean up resources
   */
  destroy(): void {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Clear all caches
    this.clear().catch(error => {
      console.warn('Error clearing caches during destroy:', error);
    });
  }
}

// Singleton instance
const cacheManager = new UnifiedCacheManager();

// Specialized cache interfaces for backward compatibility
export const pokemonCache = {
  async getPokemon(id: string | number) {
    const key = cacheManager.generateKey('pokemon', { id });
    return cacheManager.cachedFetch(
      `https://pokeapi.co/api/v2/pokemon/${id}`,
      async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch pokemon ${id}`);
        return response.json();
      },
      { priority: CONFIG.PRIORITY.HIGH, ttl: CONFIG.LOCAL_TTL }
    );
  },
  
  async getSpecies(id: string | number) {
    const key = cacheManager.generateKey('species', { id });
    return cacheManager.cachedFetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`,
      async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch species ${id}`);
        return response.json();
      },
      { priority: CONFIG.PRIORITY.HIGH, ttl: CONFIG.LOCAL_TTL }
    );
  }
};

export const tcgCache = {
  async getCards(pokemonName: string) {
    const key = cacheManager.generateKey('tcg-cards', { name: pokemonName });
    return cacheManager.cachedFetch(
      `cards-${pokemonName}`,
      async () => {
        // Use dynamic import to ensure proper loading
        const pokemonModule = await import('pokemontcgsdk');
        const pokemon = pokemonModule.default || pokemonModule;
        
        // Configure the SDK with API key if available
        const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
        if (apiKey) {
          try {
            pokemon.configure({ apiKey });
          } catch (e) {
            console.warn('[TCG Cache] Failed to configure SDK:', e);
          }
        }
        
        console.log('[TCG Cache] Querying Pokemon TCG API for:', pokemonName);
        try {
          const result = await pokemon.card.where({ q: `name:${pokemonName}` });
          console.log('[TCG Cache] API Response:', result);
          // The SDK returns an object with data property containing the cards array
          const cards = (result as any).data || [];
          console.log('[TCG Cache] Extracted cards:', cards.length);
          return cards;
        } catch (error) {
          console.error('[TCG Cache] API Error:', error);
          return [];
        }
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
  }
};

// Export main interface
export default cacheManager;

// Legacy API compatibility
export const cachedFetchData = (url: string, options?: ExtendedCacheOptions) => {
  return cacheManager.cachedFetch(url, async () => {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after 30 seconds: ${url}`);
      }
      throw error;
    }
  }, options);
};

export const requestCache = {
  get: <T = any>(key: string) => cacheManager.get<T>(key),
  set: <T = any>(key: string, data: T) => cacheManager.set(key, data),
  generateKey: (url: string, options?: Record<string, any>) => cacheManager.generateKey(url, options),
  getStats: () => cacheManager.getStats(),
  cleanup: () => cacheManager.cleanup()
};