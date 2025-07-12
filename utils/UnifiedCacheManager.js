/**
 * UnifiedCacheManager - Consolidated caching system for DexTrends
 * Combines memory, localStorage, and database caching with intelligent tiering
 */

// Cache configuration
const CONFIG = {
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
};

/**
 * Base cache storage interface
 */
class CacheStorage {
  async get(key) {
    throw new Error('get() must be implemented');
  }
  
  async set(key, value, ttl) {
    throw new Error('set() must be implemented');
  }
  
  async delete(key) {
    throw new Error('delete() must be implemented');
  }
  
  async clear() {
    throw new Error('clear() must be implemented');
  }
  
  async getStats() {
    return { hits: 0, misses: 0, size: 0 };
  }
}

/**
 * Memory cache implementation with LRU eviction
 */
class MemoryCache extends CacheStorage {
  constructor(maxSize = CONFIG.MEMORY_MAX_SIZE) {
    super();
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
    this.accessOrder = new Map(); // For LRU tracking
  }
  
  async get(key) {
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
    return entry.data;
  }
  
  async set(key, value, ttl = CONFIG.MEMORY_TTL) {
    // Evict LRU if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.keys().next().value;
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
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
  
  async delete(key) {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }
  
  async clear() {
    this.cache.clear();
    this.accessOrder.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  async getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0
    };
  }
  
  // Cleanup expired entries
  async cleanup() {
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
  constructor(prefix = CONFIG.LOCAL_PREFIX) {
    super();
    this.prefix = prefix;
  }
  
  generateKey(key) {
    return `${this.prefix}${key}`;
  }
  
  async get(key) {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.generateKey(key));
      if (!item) return null;
      
      const entry = JSON.parse(item);
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
  
  async set(key, value, ttl = CONFIG.LOCAL_TTL) {
    if (typeof window === 'undefined') return;
    
    try {
      const entry = {
        data: value,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.generateKey(key), JSON.stringify(entry));
    } catch (error) {
      console.warn('LocalStorage set error:', error);
      // Try to clear some space
      if (error.name === 'QuotaExceededError') {
        await this.cleanup();
        try {
          localStorage.setItem(this.generateKey(key), JSON.stringify(entry));
        } catch {
          // Still failed, give up
        }
      }
    }
  }
  
  async delete(key) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.generateKey(key));
  }
  
  async clear() {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  async cleanup() {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          const entry = JSON.parse(item);
          if (now > entry.expiry) {
            localStorage.removeItem(key);
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
  constructor() {
    super();
    this.supabase = null;
  }
  
  async initialize() {
    if (!this.supabase) {
      const { supabase } = await import('../lib/supabase');
      this.supabase = supabase;
    }
  }
  
  async get(key) {
    await this.initialize();
    
    try {
      const { data, error } = await this.supabase
        .from('unified_cache')
        .select('cache_data')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) return null;
      return data.cache_data;
    } catch (error) {
      console.warn('Database cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = CONFIG.DB_TTL) {
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
  
  async delete(key) {
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
  
  async clear() {
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
  
  getCategoryFromKey(key) {
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
      setInterval(() => this.cleanup(), 5 * 60 * 1000); // Every 5 minutes
    }
  }
  
  /**
   * Generate a cache key from various inputs
   */
  generateKey(identifier, params = {}) {
    if (typeof identifier === 'object') {
      identifier = JSON.stringify(identifier);
    }
    
    const paramString = Object.keys(params).length > 0 
      ? '_' + JSON.stringify(params) 
      : '';
    
    return btoa(identifier + paramString).replace(/[^a-zA-Z0-9]/g, '');
  }
  
  /**
   * Get data from cache with waterfall strategy
   */
  async get(key, options = {}) {
    const { priority = CONFIG.PRIORITY.NORMAL } = options;
    this.metrics.requests++;
    
    // Try memory cache first (fastest)
    let data = await this.memory.get(key);
    if (data !== null) {
      this.metrics.hits++;
      return data;
    }
    
    // Try local storage if priority is HIGH or CRITICAL
    if (priority >= CONFIG.PRIORITY.HIGH) {
      data = await this.local.get(key);
      if (data !== null) {
        // Promote to memory cache
        await this.memory.set(key, data);
        this.metrics.hits++;
        return data;
      }
    }
    
    // Try database if priority is CRITICAL
    if (priority === CONFIG.PRIORITY.CRITICAL) {
      data = await this.database.get(key);
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
  async set(key, value, options = {}) {
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
  async delete(key) {
    await Promise.all([
      this.memory.delete(key),
      this.local.delete(key),
      this.database.delete(key)
    ]);
  }
  
  /**
   * Clear all caches
   */
  async clear() {
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
  async getStats() {
    const [memoryStats, localStats, dbStats] = await Promise.all([
      this.memory.getStats(),
      this.local.getStats(),
      this.database.getStats()
    ]);
    
    return {
      memory: memoryStats,
      localStorage: localStats,
      database: dbStats,
      overall: {
        requests: this.metrics.requests,
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate: this.metrics.requests > 0 
          ? (this.metrics.hits / this.metrics.requests) * 100 
          : 0
      }
    };
  }
  
  /**
   * Cleanup expired entries
   */
  async cleanup() {
    await Promise.all([
      this.memory.cleanup(),
      this.local.cleanup(),
      this.database.clear() // Only clears expired
    ]);
  }
  
  /**
   * Cached fetch with automatic retry and fallback
   */
  async cachedFetch(url, fetcher, options = {}) {
    const key = this.generateKey(url, options.params);
    const cacheOptions = {
      priority: options.priority || CONFIG.PRIORITY.NORMAL,
      ttl: options.ttl
    };
    
    // Check cache first
    const cached = await this.get(key, cacheOptions);
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
        const stale = await this.get(key, { ...cacheOptions, ignoreExpiry: true });
        if (stale !== null) {
          console.warn('Returning stale data due to fetch error:', error);
          return stale;
        }
      }
      throw error;
    }
  }
}

// Singleton instance
const cacheManager = new UnifiedCacheManager();

// Specialized cache interfaces for backward compatibility
export const pokemonCache = {
  async getPokemon(id) {
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
  
  async getSpecies(id) {
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
  async getCards(pokemonName) {
    const key = cacheManager.generateKey('tcg-cards', { name: pokemonName });
    return cacheManager.cachedFetch(
      `cards-${pokemonName}`,
      async () => {
        const pokemon = await import('pokemontcgsdk');
        return pokemon.card.where({ q: `name:${pokemonName}` });
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
  }
};

// Export main interface
export default cacheManager;
export { CONFIG };

// Legacy API compatibility
export const cachedFetchData = (url, options) => {
  return cacheManager.cachedFetch(url, async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }, options);
};

export const requestCache = {
  get: (key) => cacheManager.get(key),
  set: (key, data) => cacheManager.set(key, data),
  generateKey: (url, options) => cacheManager.generateKey(url, options),
  getStats: () => cacheManager.getStats(),
  cleanup: () => cacheManager.cleanup()
};