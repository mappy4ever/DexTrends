/**
 * TCG Cache Wrapper
 * Compatibility layer for migrating from TCGCacheService to unified cache
 * DEPRECATED: Use cache.tcg directly from @/utils/cache
 */

import cache from '../utils/cache';
import logger from '../utils/logger';
import type { TCGCard, CardSet } from '../types/api/cards';
import type { TCGSetListApiResponse, TCGCardListApiResponse } from '../types/api/enhanced-responses';

interface TCGCacheStats {
  hits: number;
  misses: number;
  errors: number;
  lastReset: Date;
}

class TCGCacheServiceWrapper {
  private stats: TCGCacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    lastReset: new Date(),
  };

  // Get TCG sets list from cache
  async getSetsList(page: number, pageSize: number): Promise<TCGSetListApiResponse | null> {
    try {
      const cached = await cache.tcg.getSetsList(page, pageSize);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Sets list hit', { page, pageSize });
        return cached;
      }
      
      this.stats.misses++;
      logger.debug('[TCG Cache] Sets list miss', { page, pageSize });
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting sets list:', error);
      return null;
    }
  }

  // Cache TCG sets list
  async cacheSetsList(page: number, pageSize: number, data: TCGSetListApiResponse): Promise<void> {
    try {
      await cache.tcg.setSetsList(page, pageSize, data);
      logger.debug('[TCG Cache] Sets list cached', { page, pageSize });
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error caching sets list:', error);
    }
  }

  // Get TCG set detail from cache
  async getSetDetail(setId: string): Promise<CardSet | null> {
    try {
      const cached = await cache.tcg.getSet(setId);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Set detail hit', { setId });
        return cached;
      }
      
      this.stats.misses++;
      logger.debug('[TCG Cache] Set detail miss', { setId });
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting set detail:', error);
      return null;
    }
  }

  // Cache TCG set detail
  async cacheSetDetail(setId: string, data: CardSet): Promise<void> {
    try {
      await cache.tcg.setSet(setId, data);
      logger.debug('[TCG Cache] Set detail cached', { setId });
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error caching set detail:', error);
    }
  }

  // Get set with cards
  async getSetWithCards(setId: string, page: number, pageSize: number): Promise<TCGCardListApiResponse | null> {
    const key = `tcg:set:cards:${setId}:${page}:${pageSize}`;
    try {
      const cached = await cache.get(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Set with cards hit', { setId, page, pageSize });
        return cached;
      }
      
      this.stats.misses++;
      logger.debug('[TCG Cache] Set with cards miss', { setId, page, pageSize });
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting set with cards:', error);
      return null;
    }
  }

  // Cache set with cards
  async cacheSetWithCards(setId: string, page: number, pageSize: number, data: TCGCardListApiResponse): Promise<void> {
    const key = `tcg:set:cards:${setId}:${page}:${pageSize}`;
    try {
      await cache.set(key, data, { priority: 2, ttl: 6 * 60 * 60 * 1000 });
      logger.debug('[TCG Cache] Set with cards cached', { setId, page, pageSize });
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error caching set with cards:', error);
    }
  }

  // Get individual card
  async getCard(cardId: string): Promise<TCGCard | null> {
    try {
      const cached = await cache.tcg.getCard(cardId);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Card hit', { cardId });
        return cached;
      }
      
      this.stats.misses++;
      logger.debug('[TCG Cache] Card miss', { cardId });
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting card:', error);
      return null;
    }
  }

  // Cache individual card
  async cacheCard(cardId: string, data: TCGCard): Promise<void> {
    try {
      await cache.tcg.setCard(cardId, data);
      logger.debug('[TCG Cache] Card cached', { cardId });
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error caching card:', error);
    }
  }

  // Get cache stats
  getStats(): TCGCacheStats {
    return { ...this.stats };
  }

  // Reset stats
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: new Date(),
    };
  }

  // Clear all TCG cache
  async clearCache(): Promise<void> {
    try {
      await cache.clear();
      logger.info('[TCG Cache] Cache cleared');
    } catch (error) {
      logger.error('[TCG Cache] Error clearing cache:', error);
    }
  }
}

// Export singleton instance for backward compatibility
export const tcgCache = new TCGCacheServiceWrapper();

// Also export the class for testing
export { TCGCacheServiceWrapper };

// Default export
export default tcgCache;