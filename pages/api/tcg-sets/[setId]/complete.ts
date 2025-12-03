import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../../utils/unifiedFetch';
import logger from '../../../../utils/logger';
import { tcgCache } from '../../../../lib/tcg-cache';
import type { TCGCard, CardSet, PriceData } from '../../../../types/api/cards';

// In-memory cache for pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<unknown>>();

// This endpoint loads ALL cards for a set at once (optimized for performance)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId } = req.query;
  const id = Array.isArray(setId) ? setId[0] : setId;

  if (!id) {
    return res.status(400).json({ error: 'Set ID is required' });
  }

  const startTime = Date.now();

  try {
    // Check complete set cache first with TTL info - ALWAYS return cache if available
    const cachedResult = await tcgCache.getCompleteSetWithTTL(id);
    if (cachedResult) {
      const { data: cached, ttl } = cachedResult;

      logger.info('Returning complete cached set', {
        setId: id,
        cardCount: cached.cards.length,
        responseTime: Date.now() - startTime,
        cacheTTL: ttl
      });

      // Determine cache status based on TTL
      const isStale = ttl < 3600; // Consider stale if less than 1 hour remaining
      const cacheStatus = isStale ? 'stale-hit' : 'hit';

      res.setHeader('X-Cache-Status', cacheStatus);
      res.setHeader('X-Cache-TTL', ttl.toString());
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');

      // If cache is getting stale, trigger background refresh (but still return cached data immediately)
      if (isStale && ttl > 0) {
        setImmediate(async () => {
          try {
            logger.info(`[Background Refresh] Starting stale cache refresh for set ${id}`);
            await refreshSetInBackground(id);
          } catch (error) {
            logger.error(`[Background Refresh] Failed for set ${id}:`, { error: error instanceof Error ? error.message : String(error) });
            await tcgCache.extendCacheTTL(id, 24 * 60 * 60);
          }
        });
      }

      return res.status(200).json(cached);
    }

    // No cache found - check if there's already a pending request for this set
    if (pendingRequests.has(id)) {
      logger.info('Reusing pending request for set', { setId: id });
      try {
        const result = await pendingRequests.get(id);

        res.setHeader('X-Cache-Status', 'coalesced');
        res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
        res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');

        return res.status(200).json(result);
      } catch (error) {
        logger.error('Coalesced request failed', { setId: id, error });
      }
    }

    // No cache and no pending request - now try to load from TCGDex
    logger.info('No cache found, loading complete set from TCGDex', { setId: id });

    const fetchSetData = async () => {
      // Fetch set info from TCGDex (includes cards!)
      const setData = await fetchJSON<{
        id: string;
        name: string;
        logo?: string;
        symbol?: string;
        cardCount?: { total?: number; official?: number };
        releaseDate?: string;
        serie?: { id: string; name: string };
        cards?: Array<{
          id: string;
          localId: string;
          name: string;
          image?: string;
          category?: string;
          illustrator?: string;
          rarity?: string;
          types?: string[];
          hp?: number;
        }>;
      }>(
        `https://api.tcgdex.net/v2/en/sets/${id}`,
        {
          useCache: true,
          cacheTime: 60 * 60 * 1000,
          timeout: 60000,
          retries: 3,
          retryDelay: 2000
        }
      );

      if (!setData) {
        throw new Error('Set not found');
      }

      // Transform TCGDex set to our format
      const set: CardSet = {
        id: setData.id,
        name: setData.name,
        series: setData.serie?.name || '',
        printedTotal: setData.cardCount?.official || 0,
        total: setData.cardCount?.total || 0,
        releaseDate: setData.releaseDate || '',
        updatedAt: new Date().toISOString(),
        images: {
          symbol: setData.symbol || '',
          logo: setData.logo || ''
        }
      };

      // Transform TCGDex cards to our format
      const allCards: TCGCard[] = (setData.cards || []).map(card => ({
        id: card.id,
        name: card.name,
        supertype: (card.category as 'Pokémon' | 'Trainer' | 'Energy') || 'Pokémon',
        number: card.localId,
        artist: card.illustrator || '',
        rarity: card.rarity || '',
        types: card.types || [],
        hp: card.hp ? String(card.hp) : undefined,
        images: {
          small: card.image ? `${card.image}/low.png` : '',
          large: card.image ? `${card.image}/high.png` : ''
        },
        set: set
      }));

      logger.info(`Loaded ${allCards.length} cards for set ${id} from TCGDex`, {
        setId: id,
        expectedCount: setData.cardCount?.total || 0,
        actualCount: allCards.length,
        loadTime: Date.now() - startTime
      });

      // Sort cards by number
      allCards.sort((a: TCGCard, b: TCGCard) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });

      // Cache the complete set
      await tcgCache.cacheCompleteSet(id, set, allCards);

      // Cache individual cards and image URLs for faster lookups
      await Promise.all([
        tcgCache.cacheCards(allCards),
        tcgCache.bulkCacheImageUrls(allCards)
      ]);

      // Calculate and cache statistics
      const stats = calculateSetStatistics(allCards);
      await tcgCache.cacheSetStats(id, stats);

      return {
        set,
        cards: allCards,
        cachedAt: new Date().toISOString(),
        cardCount: allCards.length,
        stats,
        loadTime: Date.now() - startTime
      };
    };

    // Store the promise in the pending requests map
    const fetchPromise = fetchSetData();
    pendingRequests.set(id, fetchPromise);

    try {
      const response = await fetchPromise;

      res.setHeader('X-Cache-Status', 'miss');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');

      res.status(200).json(response);
    } finally {
      pendingRequests.delete(id);
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Failed to fetch complete set', {
      setId: id,
      error: errorMessage,
      stack: errorStack
    });

    // Try to return stale cache if available as fallback
    const staleCache = await tcgCache.getCompleteSet(id);
    if (staleCache) {
      logger.info('Returning stale cache due to API failure', {
        setId: id,
        cardCount: staleCache.cards.length
      });

      await tcgCache.extendCacheTTL(id, 48 * 60 * 60);

      res.setHeader('X-Cache-Status', 'stale-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=172800');

      const response = {
        set: staleCache.set || staleCache,
        cards: staleCache.cards || [],
        cachedAt: staleCache.cachedAt || new Date().toISOString(),
        cardCount: staleCache.cardCount || staleCache.cards?.length || 0,
        warning: 'Data may be outdated due to API issues'
      };

      return res.status(200).json(response);
    }

    res.status(500).json({
      error: 'Failed to fetch complete set',
      message: errorMessage,
      setId: id
    });
  }
}

// Background refresh function for stale cache updates
async function refreshSetInBackground(setId: string) {
  try {
    // Fetch set info from TCGDex
    const setData = await fetchJSON<{
      id: string;
      name: string;
      logo?: string;
      symbol?: string;
      cardCount?: { total?: number; official?: number };
      releaseDate?: string;
      serie?: { id: string; name: string };
      cards?: Array<{
        id: string;
        localId: string;
        name: string;
        image?: string;
        category?: string;
        illustrator?: string;
        rarity?: string;
        types?: string[];
        hp?: number;
      }>;
    }>(
      `https://api.tcgdex.net/v2/en/sets/${setId}`,
      {
        timeout: 60000,
        retries: 3
      }
    );

    if (!setData) {
      logger.warn(`[Background Refresh] Set ${setId} not found, keeping existing cache`);
      return;
    }

    // Transform TCGDex set to our format
    const set: CardSet = {
      id: setData.id,
      name: setData.name,
      series: setData.serie?.name || '',
      printedTotal: setData.cardCount?.official || 0,
      total: setData.cardCount?.total || 0,
      releaseDate: setData.releaseDate || '',
      updatedAt: new Date().toISOString(),
      images: {
        symbol: setData.symbol || '',
        logo: setData.logo || ''
      }
    };

    // Transform TCGDex cards to our format
    const allCards: TCGCard[] = (setData.cards || []).map(card => ({
      id: card.id,
      name: card.name,
      supertype: (card.category as 'Pokémon' | 'Trainer' | 'Energy') || 'Pokémon',
      number: card.localId,
      artist: card.illustrator || '',
      rarity: card.rarity || '',
      types: card.types || [],
      hp: card.hp ? String(card.hp) : undefined,
      images: {
        small: card.image ? `${card.image}/low.png` : '',
        large: card.image ? `${card.image}/high.png` : ''
      },
      set: set
    }));

    // Sort cards by number
    allCards.sort((a: TCGCard, b: TCGCard) => {
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      return numA - numB;
    });

    // Update cache with fresh data
    await tcgCache.cacheCompleteSet(setId, set, allCards);

    // Cache individual cards and image URLs
    await Promise.all([
      tcgCache.cacheCards(allCards),
      tcgCache.bulkCacheImageUrls(allCards)
    ]);

    // Calculate and cache statistics
    const stats = calculateSetStatistics(allCards);
    await tcgCache.cacheSetStats(setId, stats);

    logger.info(`[Background Refresh] Successfully refreshed set ${setId} from TCGDex`, {
      cardCount: allCards.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[Background Refresh] Failed to refresh set ${setId}:`, {
      error: errorMessage,
      setId
    });
  }
}

interface SetStatistics {
  totalCards: number;
  rarityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  priceStats: {
    total: number;
    highest: number;
    average: number;
    cardWithPrices: number;
  };
  calculatedAt: string;
}

// Calculate statistics for the set
function calculateSetStatistics(cards: TCGCard[]): SetStatistics {
  const rarityCount: Record<string, number> = {};
  const typeCount: Record<string, number> = {};
  const priceStats = {
    total: 0,
    highest: 0,
    average: 0,
    cardWithPrices: 0
  };

  for (const card of cards) {
    if (card.rarity) {
      rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    }

    if (card.types) {
      for (const type of card.types) {
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    }

    if (card.tcgplayer?.prices) {
      const prices = Object.values(card.tcgplayer.prices);
      let highestPrice = 0;

      for (const priceData of prices) {
        if (priceData && typeof priceData === 'object') {
          const typedPriceData = priceData as PriceData;
          const price = typedPriceData.market || typedPriceData.mid || 0;
          if (price > highestPrice) {
            highestPrice = price;
          }
        }
      }

      if (highestPrice > 0) {
        priceStats.total += highestPrice;
        priceStats.cardWithPrices++;
        if (highestPrice > priceStats.highest) {
          priceStats.highest = highestPrice;
        }
      }
    }
  }

  if (priceStats.cardWithPrices > 0) {
    priceStats.average = priceStats.total / priceStats.cardWithPrices;
  }

  return {
    totalCards: cards.length,
    rarityDistribution: rarityCount,
    typeDistribution: typeCount,
    priceStats,
    calculatedAt: new Date().toISOString()
  };
}
