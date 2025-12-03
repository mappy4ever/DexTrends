import { redisHelpers } from './redis';
import logger from '../utils/logger';
import cache from '../utils/cache';
import type { TCGCard, CardSet, SetListResponse, CardListResponse, TCGPlayer } from '../types/api/cards';

// Cache key prefixes
const CACHE_KEYS = {
  TCG_SETS_LIST: 'tcg:sets:list',
  TCG_SET_DETAIL: 'tcg:set:detail:',
  TCG_SET_CARDS: 'tcg:set:cards:',
  TCG_INDIVIDUAL_CARD: 'tcg:card:',
  TCG_STATS: 'tcg:stats:',
  TCG_SEARCH: 'tcg:search:',
  TCG_PRICES: 'tcg:prices:',
  TCG_IMAGES: 'tcg:images:',
} as const;

// Cache TTLs (in seconds)
const CACHE_TTL = {
  SETS_LIST: 7 * 24 * 60 * 60,   // 7 days for sets list (weekly updates)
  SET_DETAIL: 48 * 60 * 60,      // 48 hours for set details
  SET_CARDS: 48 * 60 * 60,       // 48 hours for cards
  INDIVIDUAL_CARD: 72 * 60 * 60, // 72 hours for individual cards
  STATS: 24 * 60 * 60,           // 24 hours for statistics
  SEARCH: 6 * 60 * 60,           // 6 hours for search results
  PRICES: 4 * 60 * 60,           // 4 hours for price data
  IMAGES: 7 * 24 * 60 * 60,      // 7 days for image URLs (they rarely change)
} as const;

// Popular sets that should be pre-warmed (TCGDex format)
export const POPULAR_SETS = [
  'base1',           // Base Set
  'base2',           // Jungle
  'base3',           // Fossil
  'swsh12.5',        // Crown Zenith
  'swsh10',          // Astral Radiance
  'swsh11',          // Lost Origin
  'swsh9',           // Brilliant Stars
  'sm12',            // Cosmic Eclipse
  'xy12',            // Evolutions
  'swsh1',           // Sword & Shield Base
  'sv01',            // Scarlet & Violet Base
  'sv02',            // Paldea Evolved
  'sv03',            // Obsidian Flames
  'sv03.5',          // 151
  'sv04',            // Paradox Rift
  'sv04.5',          // Paldean Fates
  'sv05',            // Temporal Forces
  'sv06',            // Twilight Masquerade
  'sv06.5',          // Shrouded Fable
  'sv07',            // Stellar Crown
  'sv08',            // Surging Sparks
  'sv08.5',          // Prismatic Evolutions
  'sv09',            // Journey Together
  'sv10',            // Destined Rivals
];

// Core cache interfaces
export interface CacheEntry<T = unknown> {
  data: T;
  cachedAt: string;
  ttl?: number;
}

export interface CacheOptions {
  ttl?: number;
  extend?: boolean;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  errors: number;
  lastReset: Date;
}

// TCG-specific data types
export interface TCGSetData {
  set: CardSet;
  cards: TCGCard[];
  cachedAt: string;
  cardCount: number;
}

// API Response wrappers (for caching responses with pagination)
export interface TCGSetListApiResponse {
  data: CardSet[];
  pagination: {
    page: number;
    pageSize: number;
    count: number;
    totalCount: number;
    hasMore: boolean;
  };
  meta: {
    responseTime: number;
    cached: boolean;
  };
}

export interface TCGCardListApiResponse {
  set?: CardSet;
  cards?: TCGCard[];
  data?: TCGCard[];
  pagination: {
    page: number;
    pageSize: number;
    count: number;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface TCGPrice {
  cardId: string;
  prices: TCGPlayer['prices'];
  cachedAt: string;
}

export interface TCGSearchResult {
  query: string;
  results: TCGCard[];
  cachedAt: string;
}

export interface TCGMarketTrends {
  trending: MarketCard[];
  mostExpensive: MarketCard[];
  priceChanges: PriceChange[];
  setAnalysis: SetAnalysis[];
  cachedAt: string;
}

export interface MarketCard {
  id: string;
  name: string;
  set: string;
  setId: string;
  rarity?: string;
  marketPrice: number;
  priceData: TCGPlayer['prices'];
  lastUpdated: string;
}

export interface PriceChange {
  cardId: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
  period: string;
}

export interface SetAnalysis {
  setId?: string;
  avgPrice?: number;
  cardCount?: number;
  totalValue?: number;
  topCards?: MarketCard[];
  // Additional properties found in actual usage
  totalCards?: number;
  rarityDistribution?: Record<string, number>;
  typeDistribution?: Record<string, number>;
  priceStats?: {
    total: number;
    highest: number;
    average: number;
    cardWithPrices: number;
  };
  calculatedAt?: string;
}

export interface ImageUrls {
  small?: string;
  large?: string;
  cachedAt?: string;
}

export interface CacheWarmingResult {
  successful: number;
  failed: number;
  cached: number;
}

// Legacy alias for backwards compatibility
export interface TCGCacheStats extends CacheStatistics {}

class TCGCacheService {
  private stats: CacheStatistics = {
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
    const key = `${CACHE_KEYS.TCG_SETS_LIST}:${page}:${pageSize}`;
    
    try {
      await redisHelpers.setJSON(key, data, CACHE_TTL.SETS_LIST);
      logger.info('[TCG Cache] Cached sets list', { page, pageSize });
    } catch (error) {
      logger.error('[TCG Cache] Error caching sets list:', error);
    }
  }

  // Get set detail with cards
  async getSetWithCards(setId: string, page: number, pageSize: number): Promise<TCGCardListApiResponse | null> {
    const key = `${CACHE_KEYS.TCG_SET_DETAIL}${setId}:${page}:${pageSize}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Set detail hit', { setId, page });
        return cached;
      }
      
      this.stats.misses++;
      logger.debug('[TCG Cache] Set detail miss', { setId, page });
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting set detail:', error);
      return null;
    }
  }

  // Cache set detail with cards
  async cacheSetWithCards(setId: string, page: number, pageSize: number, data: TCGCardListApiResponse): Promise<void> {
    const key = `${CACHE_KEYS.TCG_SET_DETAIL}${setId}:${page}:${pageSize}`;
    
    try {
      await redisHelpers.setJSON(key, data, CACHE_TTL.SET_DETAIL);
      logger.info('[TCG Cache] Cached set detail', { setId, page });
    } catch (error) {
      logger.error('[TCG Cache] Error caching set detail:', error);
    }
  }

  // Get complete set (all cards combined)
  async getCompleteSet(setId: string): Promise<TCGSetData | null> {
    const key = `${CACHE_KEYS.TCG_SET_CARDS}${setId}:complete`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Complete set hit', { setId });
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting complete set:', error);
      return null;
    }
  }

  // Get complete set with TTL info for stale-while-revalidate
  async getCompleteSetWithTTL(setId: string): Promise<{ data: TCGSetData; ttl: number } | null> {
    const key = `${CACHE_KEYS.TCG_SET_CARDS}${setId}:complete`;
    
    try {
      const [cached, ttl] = await Promise.all([
        redisHelpers.getJSON(key),
        redisHelpers.ttl(key)
      ]);

      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Complete set hit with TTL', { setId, ttl });
        return { data: cached, ttl };
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting complete set with TTL:', error);
      return null;
    }
  }

  // Cache complete set
  async cacheCompleteSet(setId: string, setInfo: CardSet, allCards: TCGCard[]): Promise<void> {
    const key = `${CACHE_KEYS.TCG_SET_CARDS}${setId}:complete`;
    
    try {
      const data = {
        set: setInfo,
        cards: allCards,
        cachedAt: new Date().toISOString(),
        cardCount: allCards.length,
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.SET_CARDS);
      logger.info('[TCG Cache] Cached complete set', { setId, cardCount: allCards.length });
    } catch (error) {
      logger.error('[TCG Cache] Error caching complete set:', error);
    }
  }

  // Extend TTL for existing cache entry (when new fetch fails)
  async extendCacheTTL(setId: string, extensionSeconds: number = 24 * 60 * 60): Promise<boolean> {
    const key = `${CACHE_KEYS.TCG_SET_CARDS}${setId}:complete`;
    
    try {
      const extended = await redisHelpers.expire(key, extensionSeconds);
      if (extended) {
        logger.info('[TCG Cache] Extended cache TTL due to fetch failure', { 
          setId, 
          extensionSeconds,
          extensionHours: extensionSeconds / 3600
        });
      }
      return extended;
    } catch (error) {
      logger.error('[TCG Cache] Error extending cache TTL:', error);
      return false;
    }
  }

  // Cache set statistics
  async cacheSetStats(setId: string, stats: SetAnalysis): Promise<void> {
    const key = `${CACHE_KEYS.TCG_STATS}${setId}`;
    
    try {
      await redisHelpers.setJSON(key, stats, CACHE_TTL.STATS);
      logger.debug('[TCG Cache] Cached set statistics', { setId });
    } catch (error) {
      logger.error('[TCG Cache] Error caching set stats:', error);
    }
  }

  // Get set statistics
  async getSetStats(setId: string): Promise<SetAnalysis | null> {
    const key = `${CACHE_KEYS.TCG_STATS}${setId}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        logger.debug('[TCG Cache] Set stats hit', { setId });
        return cached;
      }
      
      return null;
    } catch (error) {
      logger.error('[TCG Cache] Error getting set stats:', error);
      return null;
    }
  }

  // Invalidate all caches for a specific set
  async invalidateSet(setId: string): Promise<void> {
    try {
      const patterns = [
        `${CACHE_KEYS.TCG_SET_DETAIL}${setId}:*`,
        `${CACHE_KEYS.TCG_SET_CARDS}${setId}:*`,
        `${CACHE_KEYS.TCG_STATS}${setId}`,
      ];
      
      // Note: Redis pattern deletion would require SCAN command
      // For now, we'll delete known keys
      await Promise.all([
        redisHelpers.del(`${CACHE_KEYS.TCG_SET_DETAIL}${setId}:1:50`),
        redisHelpers.del(`${CACHE_KEYS.TCG_SET_CARDS}${setId}:complete`),
        redisHelpers.del(`${CACHE_KEYS.TCG_STATS}${setId}`),
      ]);
      
      logger.info('[TCG Cache] Invalidated set caches', { setId });
    } catch (error) {
      logger.error('[TCG Cache] Error invalidating set:', error);
    }
  }

  // Invalidate sets list cache
  async invalidateSetsList(): Promise<void> {
    try {
      // Delete common page sizes
      const commonPages = [
        { page: 1, pageSize: 25 },
        { page: 1, pageSize: 50 },
        { page: 2, pageSize: 25 },
        { page: 2, pageSize: 50 },
      ];
      
      await Promise.all(
        commonPages.map(({ page, pageSize }) => 
          redisHelpers.del(`${CACHE_KEYS.TCG_SETS_LIST}:${page}:${pageSize}`)
        )
      );
      
      logger.info('[TCG Cache] Invalidated sets list caches');
    } catch (error) {
      logger.error('[TCG Cache] Error invalidating sets list:', error);
    }
  }

  // Get cache statistics
  getStats(): CacheStatistics {
    return { ...this.stats };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      lastReset: new Date(),
    };
  }

  // Get individual card from cache
  async getCard(cardId: string): Promise<TCGCard | null> {
    const key = `${CACHE_KEYS.TCG_INDIVIDUAL_CARD}${cardId}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Individual card hit', { cardId });
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting individual card:', error);
      return null;
    }
  }

  // Cache individual card
  async cacheCard(cardId: string, cardData: TCGCard): Promise<void> {
    const key = `${CACHE_KEYS.TCG_INDIVIDUAL_CARD}${cardId}`;
    
    try {
      const data = {
        ...cardData,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.INDIVIDUAL_CARD);
      logger.debug('[TCG Cache] Cached individual card', { cardId });
    } catch (error) {
      logger.error('[TCG Cache] Error caching individual card:', error);
    }
  }

  // Cache multiple cards at once (bulk operation)
  async cacheCards(cards: TCGCard[]): Promise<number> {
    let cached = 0;
    
    // Process in batches to avoid overwhelming Redis
    const BATCH_SIZE = 50;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (card) => {
        try {
          await this.cacheCard(card.id, card);
          cached++;
        } catch (error) {
          logger.error(`[TCG Cache] Failed to cache card ${card.id}:`, error);
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches
      if (i + BATCH_SIZE < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    logger.info(`[TCG Cache] Bulk cached ${cached} individual cards`);
    return cached;
  }

  // Cache search results
  async cacheSearchResults(query: string, results: TCGCard[]): Promise<void> {
    const key = `${CACHE_KEYS.TCG_SEARCH}${Buffer.from(query).toString('base64')}`;
    
    try {
      const data = {
        query,
        results,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.SEARCH);
      logger.debug('[TCG Cache] Cached search results', { query, resultCount: results.length });
    } catch (error) {
      logger.error('[TCG Cache] Error caching search results:', error);
    }
  }

  // Get cached search results
  async getSearchResults(query: string): Promise<TCGSearchResult | null> {
    const key = `${CACHE_KEYS.TCG_SEARCH}${Buffer.from(query).toString('base64')}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Search results hit', { query });
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting search results:', error);
      return null;
    }
  }

  // Cache price data for a card
  async cachePriceData(cardId: string, priceData: TCGPlayer['prices']): Promise<void> {
    const key = `${CACHE_KEYS.TCG_PRICES}${cardId}`;
    
    try {
      const data = {
        ...priceData,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.PRICES);
      logger.debug('[TCG Cache] Cached price data', { cardId });
    } catch (error) {
      logger.error('[TCG Cache] Error caching price data:', error);
    }
  }

  // Get cached price data
  async getPriceData(cardId: string): Promise<TCGPrice | null> {
    const key = `${CACHE_KEYS.TCG_PRICES}${cardId}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Price data hit', { cardId });
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting price data:', error);
      return null;
    }
  }

  // Extract and cache price data from cards in bulk
  async bulkCachePriceData(cards: TCGCard[]): Promise<number> {
    let cached = 0;
    
    const BATCH_SIZE = 100;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (card) => {
        if (card.id && card.tcgplayer?.prices) {
          try {
            await this.cachePriceData(card.id, card.tcgplayer.prices);
            cached++;
          } catch (error) {
            logger.error(`[TCG Cache] Failed to cache price data for card ${card.id}:`, error);
          }
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches
      if (i + BATCH_SIZE < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    logger.info(`[TCG Cache] Bulk cached ${cached} price data entries`);
    return cached;
  }

  // Cache market trends and analytics
  async cacheMarketTrends(trendData: {
    trending: MarketCard[];
    mostExpensive: MarketCard[];
    priceChanges: PriceChange[];
    setAnalysis: SetAnalysis[];
  }): Promise<void> {
    const key = 'tcg:market:trends';
    
    try {
      const data = {
        ...trendData,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.PRICES);
      logger.info('[TCG Cache] Cached market trends data');
    } catch (error) {
      logger.error('[TCG Cache] Error caching market trends:', error);
    }
  }

  // Get cached market trends
  async getMarketTrends(): Promise<TCGMarketTrends | null> {
    const key = 'tcg:market:trends';
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Market trends hit');
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting market trends:', error);
      return null;
    }
  }

  // Generate market analytics from cached price data
  async generateMarketAnalytics(setIds: string[] = []): Promise<{
    trending: MarketCard[];
    mostExpensive: MarketCard[];
    priceChanges: PriceChange[];
    setAnalysis: SetAnalysis[];
  }> {
    const analytics = {
      trending: [] as MarketCard[],
      mostExpensive: [] as MarketCard[],
      priceChanges: [] as PriceChange[],
      setAnalysis: [] as SetAnalysis[]
    };

    try {
      // Get trending cards (cards with high recent price activity)
      const trendingCards: MarketCard[] = [];
      const expensiveCards: MarketCard[] = [];
      
      // Analyze cached sets for price data
      for (const setId of setIds.length > 0 ? setIds : ['sv8', 'sv7', 'sv6', 'sv5']) {
        const setData = await this.getCompleteSet(setId);
        if (setData?.cards) {
          for (const card of setData.cards) {
            if (card.tcgplayer?.prices) {
              const marketPrice = this.extractHighestMarketPrice(card.tcgplayer.prices);
              
              if (marketPrice > 0) {
                const cardAnalysis = {
                  id: card.id,
                  name: card.name,
                  set: setData.set.name,
                  setId: setId,
                  rarity: card.rarity,
                  marketPrice,
                  priceData: card.tcgplayer.prices,
                  lastUpdated: new Date().toISOString()
                };
                
                // Track expensive cards (>$10)
                if (marketPrice >= 10) {
                  expensiveCards.push(cardAnalysis);
                }
                
                // Track trending candidates (decent price with potential)
                if (marketPrice >= 1 && marketPrice <= 50) {
                  trendingCards.push(cardAnalysis);
                }
              }
            }
          }
        }
      }
      
      // Sort and limit results
      analytics.mostExpensive = expensiveCards
        .sort((a, b) => b.marketPrice - a.marketPrice)
        .slice(0, 20);
        
      analytics.trending = trendingCards
        .sort((a, b) => b.marketPrice - a.marketPrice)
        .slice(0, 30);
        
      // Generate set analysis
      analytics.setAnalysis = setIds.map(setId => ({
        setId,
        avgPrice: trendingCards
          .filter(card => card.setId === setId)
          .reduce((sum, card, _, arr) => sum + card.marketPrice / arr.length, 0),
        cardCount: trendingCards.filter(card => card.setId === setId).length
      }));
      
      logger.info('[TCG Cache] Generated market analytics', {
        trending: analytics.trending.length,
        expensive: analytics.mostExpensive.length,
        sets: analytics.setAnalysis.length
      });
      
    } catch (error) {
      logger.error('[TCG Cache] Error generating market analytics:', error);
    }

    return analytics;
  }

  // Helper to extract highest market price from price data
  private extractHighestMarketPrice(prices: TCGPlayer['prices']): number {
    if (!prices || typeof prices !== 'object') return 0;
    
    let highestPrice = 0;
    
    for (const variant of Object.values(prices)) {
      if (variant && typeof variant === 'object' && 'market' in variant) {
        const marketData = variant as { market?: number };
        const market = marketData.market;
        if (typeof market === 'number' && market > highestPrice) {
          highestPrice = market;
        }
      }
    }
    
    return highestPrice;
  }

  // Warm sets list cache for common page combinations
  async warmSetsListCache(): Promise<CacheWarmingResult> {
    const results = { successful: 0, failed: 0, cached: 0 };
    
    // Common page/pageSize combinations that users typically request
    const commonCombinations = [
      { page: 1, pageSize: 25 },   // Default first page
      { page: 1, pageSize: 50 },   // Larger first page
      { page: 2, pageSize: 25 },   // Second page
      { page: 2, pageSize: 50 },   // Second page larger
      { page: 1, pageSize: 10 },   // Mobile/small screens
      { page: 1, pageSize: 100 },  // Show all main sets
    ];
    
    logger.info('[TCG Cache] Starting sets list cache warming', {
      combinations: commonCombinations.length
    });
    
    for (const { page, pageSize } of commonCombinations) {
      try {
        // Check if already cached
        const existing = await this.getSetsList(page, pageSize);
        if (existing) {
          results.cached++;
          logger.debug(`[TCG Cache] Sets list ${page}:${pageSize} already cached`);
          continue;
        }

        // Fetch fresh data from TCGDex API (no API key required)
        const apiUrl = `https://api.tcgdex.net/v2/en/sets`;

        const data = await fetch(apiUrl, {
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());

        if (!Array.isArray(data)) {
          throw new Error('Invalid API response from TCGDex');
        }

        // TCGDex returns array directly, sort by release date (newest first)
        const sortedSets = data.sort((a: { releaseDate?: string }, b: { releaseDate?: string }) => {
          const dateA = a.releaseDate || '';
          const dateB = b.releaseDate || '';
          return dateB.localeCompare(dateA);
        });

        // Apply pagination
        const startIdx = (page - 1) * pageSize;
        const paginatedSets = sortedSets.slice(startIdx, startIdx + pageSize);

        // Format response like the main API does
        const response = {
          data: paginatedSets,
          pagination: {
            page: page,
            pageSize: pageSize,
            count: paginatedSets.length,
            totalCount: sortedSets.length,
            hasMore: startIdx + pageSize < sortedSets.length
          },
          meta: {
            responseTime: 0,
            cached: false
          }
        };

        // Cache the response
        await this.cacheSetsList(page, pageSize, response);
        results.successful++;

        logger.info(`[TCG Cache] Warmed sets list cache ${page}:${pageSize} from TCGDex`, {
          setCount: paginatedSets.length
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: unknown) {
        results.failed++;
        logger.error(`[TCG Cache] Failed to warm sets list ${page}:${pageSize}:`,
          error instanceof Error ? { error: error.message, stack: error.stack } : { error: String(error) });
      }
    }
    
    logger.info('[TCG Cache] Completed sets list cache warming', results);
    return results;
  }

  // Get comprehensive sets list (all sets, cached for a week)
  async getComprehensiveSetsList(): Promise<CardSet[] | null> {
    const key = 'tcg:sets:comprehensive';
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Comprehensive sets list hit');
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting comprehensive sets list:', error);
      return null;
    }
  }

  // Cache comprehensive sets list (all sets)
  async cacheComprehensiveSetsList(allSets: CardSet[]): Promise<void> {
    const key = 'tcg:sets:comprehensive';
    
    try {
      const data = {
        sets: allSets,
        totalCount: allSets.length,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.SETS_LIST);
      logger.info('[TCG Cache] Cached comprehensive sets list', { 
        totalSets: allSets.length 
      });
    } catch (error) {
      logger.error('[TCG Cache] Error caching comprehensive sets list:', error);
    }
  }

  // Check if a set is popular
  isPopularSet(setId: string): boolean {
    return POPULAR_SETS.includes(setId);
  }

  // Warm cache for a specific set
  async warmCacheForSet(setId: string, fetcher: () => Promise<TCGSetData>): Promise<void> {
    try {
      logger.info(`[TCG Cache] Warming cache for set: ${setId}`);
      
      const data = await fetcher();
      if (data?.set && data?.cards) {
        await this.cacheCompleteSet(setId, data.set, data.cards);
      }
    } catch (error) {
      logger.error(`[TCG Cache] Error warming cache for set ${setId}:`, error);
    }
  }

  // Cache image metadata and URLs
  async cacheImageUrls(cardId: string, imageUrls: ImageUrls): Promise<void> {
    const key = `${CACHE_KEYS.TCG_IMAGES}${cardId}`;
    
    try {
      const data = {
        ...imageUrls,
        cachedAt: new Date().toISOString(),
      };
      
      await redisHelpers.setJSON(key, data, CACHE_TTL.IMAGES);
      logger.debug('[TCG Cache] Cached image URLs', { cardId, imageUrls });
    } catch (error) {
      logger.error('[TCG Cache] Error caching image URLs:', error);
    }
  }

  // Get cached image URLs
  async getImageUrls(cardId: string): Promise<ImageUrls | null> {
    const key = `${CACHE_KEYS.TCG_IMAGES}${cardId}`;
    
    try {
      const cached = await redisHelpers.getJSON(key);
      if (cached) {
        this.stats.hits++;
        logger.debug('[TCG Cache] Image URLs hit', { cardId });
        return cached;
      }
      
      this.stats.misses++;
      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error('[TCG Cache] Error getting image URLs:', error);
      return null;
    }
  }

  // Extract and cache image URLs from cards in bulk
  async bulkCacheImageUrls(cards: TCGCard[]): Promise<number> {
    let cached = 0;
    
    const BATCH_SIZE = 100;
    for (let i = 0; i < cards.length; i += BATCH_SIZE) {
      const batch = cards.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(async (card) => {
        if (card.id && card.images) {
          try {
            await this.cacheImageUrls(card.id, {
              small: card.images.small,
              large: card.images.large
            });
            cached++;
          } catch (error) {
            logger.error(`[TCG Cache] Failed to cache image URLs for card ${card.id}:`, error);
          }
        }
      });
      
      await Promise.all(promises);
      
      // Small delay between batches
      if (i + BATCH_SIZE < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    logger.info(`[TCG Cache] Bulk cached ${cached} image URL entries`);
    return cached;
  }

  // Preload and validate image URLs
  async preloadImageUrls(imageUrls: string[], timeout: number = 5000): Promise<string[]> {
    const validUrls: string[] = [];
    
    const promises = imageUrls.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          validUrls.push(url);
        }
      } catch (error) {
        logger.debug(`[TCG Cache] Image URL validation failed: ${url}`, error);
      }
    });
    
    await Promise.allSettled(promises);
    
    logger.info(`[TCG Cache] Validated ${validUrls.length}/${imageUrls.length} image URLs`);
    return validUrls;
  }

  // Get cache key info (for debugging)
  getCacheKey(type: string, ...params: (string | number)[]): string {
    switch (type) {
      case 'sets':
        return `${CACHE_KEYS.TCG_SETS_LIST}:${params.join(':')}`;
      case 'set':
        return `${CACHE_KEYS.TCG_SET_DETAIL}${params.join(':')}`;
      case 'cards':
        return `${CACHE_KEYS.TCG_SET_CARDS}${params[0]}:complete`;
      case 'stats':
        return `${CACHE_KEYS.TCG_STATS}${params[0]}`;
      case 'images':
        return `${CACHE_KEYS.TCG_IMAGES}${params[0]}`;
      case 'prices':
        return `${CACHE_KEYS.TCG_PRICES}${params[0]}`;
      case 'trends':
        return 'tcg:market:trends';
      default:
        return '';
    }
  }
}

// Export singleton instance
export const tcgCache = new TCGCacheService();

// Export cache warming utility
export async function warmPopularSets(fetcher: (setId: string) => Promise<TCGSetData>): Promise<void> {
  logger.info('[TCG Cache] Starting cache warming for popular sets');
  
  // Warm caches in batches to avoid overwhelming the API
  const batchSize = 3;
  for (let i = 0; i < POPULAR_SETS.length; i += batchSize) {
    const batch = POPULAR_SETS.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(setId => tcgCache.warmCacheForSet(setId, () => fetcher(setId)))
    );
    
    // Small delay between batches
    if (i + batchSize < POPULAR_SETS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  logger.info('[TCG Cache] Completed cache warming');
}