/**
 * Consolidated Cache Interface
 * Single entry point for all caching needs in DexTrends
 * Wraps UnifiedCacheManager and provides specialized methods
 */

import UnifiedCacheManager, { type CachePriority } from './UnifiedCacheManager';
import logger from './logger';
import type { Pokemon, PokemonSpecies, EvolutionChain, TCGCard, CardSet } from '@/types';
import type { TCGSetListApiResponse } from '@/types/api/enhanced-responses';
import type { CacheSetOptions } from '@/types/utils/cache';
import type { AnyObject } from '@/types/common';
import type { UserPreferences } from '@/types/context/unified-app-context';
import type { FavoritesState } from '@/types/context/favorites';

// Use the ExtendedCacheOptions type from UnifiedCacheManager
interface CacheOptions {
  priority?: CachePriority;
  ttl?: number;
  params?: Record<string, unknown>;
}

// Re-export the main cache manager
export { UnifiedCacheManager };

// Use the existing singleton instance
const cacheManager = UnifiedCacheManager;

/**
 * Main cache interface - use this for all caching needs
 */
export const cache = {
  // Basic cache operations
  get: (key: string) => cacheManager.get(key),
  set: (key: string, value: unknown, options?: CacheOptions) => cacheManager.set(key, value, options),
  delete: (key: string) => cacheManager.delete(key),
  clear: () => cacheManager.clear(),
  
  // Specialized cache methods for different domains
  
  /**
   * Pokemon-specific caching
   */
  pokemon: {
    get: (pokemonId: number | string) => 
      cacheManager.get(`pokemon:${pokemonId}`),
    set: (pokemonId: number | string, data: Pokemon) => 
      cacheManager.set(`pokemon:${pokemonId}`, data, { 
        priority: 2, // HIGH priority for Pokemon data
        ttl: 6 * 60 * 60 * 1000 // 6 hours
      }),
    getSpecies: (speciesId: number | string) =>
      cacheManager.get(`species:${speciesId}`),
    setSpecies: (speciesId: number | string, data: PokemonSpecies) =>
      cacheManager.set(`species:${speciesId}`, data, {
        priority: 2,
        ttl: 12 * 60 * 60 * 1000 // 12 hours - species data changes less frequently
      }),
    getEvolution: (chainId: number | string) =>
      cacheManager.get(`evolution:${chainId}`),
    setEvolution: (chainId: number | string, data: EvolutionChain) =>
      cacheManager.set(`evolution:${chainId}`, data, {
        priority: 1,
        ttl: 24 * 60 * 60 * 1000 // 24 hours - evolution data is static
      })
  },
  
  /**
   * TCG card caching
   */
  tcg: {
    getSet: (setId: string) => 
      cacheManager.get(`tcg:set:${setId}`),
    setSet: (setId: string, data: CardSet) =>
      cacheManager.set(`tcg:set:${setId}`, data, {
        priority: 2,
        ttl: 12 * 60 * 60 * 1000 // 12 hours
      }),
    getCard: (cardId: string) =>
      cacheManager.get(`tcg:card:${cardId}`),
    setCard: (cardId: string, data: TCGCard) =>
      cacheManager.set(`tcg:card:${cardId}`, data, {
        priority: 1,
        ttl: 6 * 60 * 60 * 1000 // 6 hours
      }),
    getSetsList: (page: number, pageSize: number) =>
      cacheManager.get(`tcg:sets:list:${page}:${pageSize}`),
    setSetsList: (page: number, pageSize: number, data: TCGSetListApiResponse) =>
      cacheManager.set(`tcg:sets:list:${page}:${pageSize}`, data, {
        priority: 2,
        ttl: 3 * 60 * 60 * 1000 // 3 hours
      }),
    getMarketData: (cardId: string) =>
      cacheManager.get(`tcg:market:${cardId}`),
    setMarketData: (cardId: string, data: Record<string, unknown>) =>
      cacheManager.set(`tcg:market:${cardId}`, data, {
        priority: 1,
        ttl: 60 * 60 * 1000 // 1 hour - price data changes frequently
      })
  },
  
  /**
   * API request caching
   */
  request: {
    get: (url: string, options?: RequestInit) => {
      const key = cache.request.generateKey(url, options);
      return cacheManager.get(key);
    },
    set: (url: string, data: unknown, options?: RequestInit, ttl?: number) => {
      const key = cache.request.generateKey(url, options);
      return cacheManager.set(key, data, {
        priority: 1,
        ttl: ttl || 5 * 60 * 1000 // Default 5 minutes for API responses
      });
    },
    generateKey: (url: string, options: RequestInit = {}) => {
      const { method = 'GET', body, headers = {} } = options;
      const keyData = {
        url,
        method,
        body: body ? JSON.stringify(body) : null,
        headers: Object.keys(headers).sort().reduce((acc: Record<string, string>, key) => {
          acc[key] = (headers as Record<string, string>)[key];
          return acc;
        }, {})
      };
      return `request:${btoa(JSON.stringify(keyData))}`;
    }
  },
  
  /**
   * Search results caching
   */
  search: {
    get: (query: string, type?: string) =>
      cacheManager.get(`search:${type || 'all'}:${query.toLowerCase()}`),
    set: (query: string, results: unknown[], type?: string) =>
      cacheManager.set(`search:${type || 'all'}:${query.toLowerCase()}`, results, {
        priority: 1,
        ttl: 10 * 60 * 1000 // 10 minutes for search results
      })
  },
  
  /**
   * User preferences and session data
   */
  user: {
    getPreferences: (userId?: string) =>
      cacheManager.get(`user:prefs:${userId || 'default'}`),
    setPreferences: (preferences: UserPreferences, userId?: string) =>
      cacheManager.set(`user:prefs:${userId || 'default'}`, preferences, {
        priority: 2, // Store locally
        ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
      }),
    getFavorites: (userId?: string) =>
      cacheManager.get(`user:favorites:${userId || 'default'}`),
    setFavorites: (favorites: FavoritesState, userId?: string) =>
      cacheManager.set(`user:favorites:${userId || 'default'}`, favorites, {
        priority: 2,
        ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
      })
  },
  
  /**
   * Stats and monitoring
   */
  getStats: () => cacheManager.getStats(),
  
  /**
   * Preload critical data
   */
  preload: async (keys: string[]) => {
    const promises = keys.map(key => cacheManager.get(key));
    const results = await Promise.allSettled(promises);
    return results.map((result, index) => ({
      key: keys[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null
    }));
  },
  
  /**
   * Batch operations
   */
  batch: {
    get: async (keys: string[]) => {
      const promises = keys.map(key => cacheManager.get(key));
      const results = await Promise.allSettled(promises);
      return keys.reduce((acc, key, index) => {
        acc[key] = results[index].status === 'fulfilled' ? results[index].value : null;
        return acc;
      }, {} as Record<string, unknown>);
    },
    set: async (items: Array<{ key: string; value: unknown; options?: CacheOptions }>) => {
      const promises = items.map(item => 
        cacheManager.set(item.key, item.value, item.options)
      );
      return Promise.allSettled(promises);
    }
  }
};

// Export default for convenience
export default cache;