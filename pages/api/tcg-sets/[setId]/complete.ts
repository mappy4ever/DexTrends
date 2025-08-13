import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../../utils/unifiedFetch';
import logger from '../../../../utils/logger';
import { tcgCache } from '../../../../lib/tcg-cache';
import type { TCGCard, CardSet, PriceData } from '../../../../types/api/cards';

// In-memory cache for pending requests to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

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
        // Fire and forget background refresh - don't wait for it
        setImmediate(async () => {
          try {
            logger.info(`[Background Refresh] Starting stale cache refresh for set ${id}`);
            await refreshSetInBackground(id);
          } catch (error) {
            logger.error(`[Background Refresh] Failed for set ${id}:`, { error: error instanceof Error ? error.message : String(error) });
            // If refresh fails, extend the existing cache TTL to prevent frequent failures
            await tcgCache.extendCacheTTL(id, 24 * 60 * 60); // Extend by 24 hours
          }
        });
      }
      
      // Return cached data IMMEDIATELY - don't wait for anything
      return res.status(200).json(cached);
    }
    
    // No cache found - check if there's already a pending request for this set
    if (pendingRequests.has(id)) {
      logger.info('Reusing pending request for set', { setId: id });
      try {
        // Wait for the existing request to complete
        const result = await pendingRequests.get(id);
        
        res.setHeader('X-Cache-Status', 'coalesced');
        res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
        res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');
        
        return res.status(200).json(result);
      } catch (error) {
        logger.error('Coalesced request failed', { setId: id, error });
        // Continue to make a new request if the coalesced one failed
      }
    }
    
    // No cache and no pending request - now try to load from API
    logger.info('No cache found, loading complete set from API', { setId: id });
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Create a function to fetch the data
    const fetchSetData = async () => {
      // Fetch set info first
      let setInfo;
      try {
        setInfo = await fetchJSON<{ data: CardSet }>(
        `https://api.pokemontcg.io/v2/sets/${id}`, 
        { 
          headers,
          useCache: true,
          cacheTime: 60 * 60 * 1000,
          timeout: 30000,
          retries: 3, // More retries for sets endpoint
          retryDelay: 2000 // 2 second delay between retries
        }
      );
    } catch (fetchError: unknown) {
      // Check if this is a known subset pattern that often has 404 issues
      const isKnownSubset = /^sv\d+pt5$/.test(id) || /^swsh\d+pt5$/.test(id);
      
      const fetchErrorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      if (fetchErrorMessage.includes('404') && isKnownSubset) {
        logger.warn(`Known subset ${id} returned 404, will retry with longer timeout`, {
          setId: id,
          error: fetchErrorMessage
        });
        
        // Try once more with longer timeout for known problematic sets
        try {
          setInfo = await fetchJSON<{ data: CardSet }>(
            `https://api.pokemontcg.io/v2/sets/${id}`,
            {
              headers,
              useCache: true,
              cacheTime: 60 * 60 * 1000,
              timeout: 60000, // 60 second timeout
              retries: 5, // More retries
              retryDelay: 5000 // 5 second delay
            }
          );
        } catch (retryError) {
          logger.error(`Failed to fetch known subset ${id} after extended retry`, {
            setId: id,
            error: retryError
          });
          throw retryError;
        }
      } else {
        throw fetchError;
      }
    }
    
    if (!setInfo?.data) {
      return res.status(404).json({ error: 'Set not found' });
    }
    
    const set = setInfo.data;
    const totalCards = set.total || 0;
    
    // Load all cards in parallel batches
    const pageSize = 250; // Maximum allowed by API
    const totalPages = Math.ceil(totalCards / pageSize);
    const pagePromises: Promise<{ data: TCGCard[] } | null>[] = [];
    
    logger.info(`Loading ${totalCards} cards in ${totalPages} parallel requests`, { setId: id });
    
    // Determine timeout based on set size
    const isLargeSet = totalCards > 200;
    const timeout = isLargeSet ? 60000 : 45000; // 60s for large sets, 45s for normal
    
    // Create promises for all pages
    for (let page = 1; page <= totalPages; page++) {
      const pagePromise = fetchJSON<{ data: TCGCard[] }>(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${page}&pageSize=${pageSize}`,
        {
          headers,
          useCache: true,
          cacheTime: 60 * 60 * 1000,
          timeout: timeout, // Dynamic timeout based on set size
          retries: 3, // More retries for reliability
          retryDelay: 2000 // 2 second delay between retries
        }
      );
      pagePromises.push(pagePromise);
    }
    
    // Wait for all pages to load
    const pageResults = await Promise.all(pagePromises);
    
    // Combine all cards
    const allCards: TCGCard[] = [];
    for (const result of pageResults) {
      if (result?.data) {
        allCards.push(...result.data);
      }
    }
    
    logger.info(`Loaded ${allCards.length} cards for set ${id}`, {
      setId: id,
      expectedCount: totalCards,
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
    
    // Cache individual cards, image URLs, and price data for faster lookups
    await Promise.all([
      tcgCache.cacheCards(allCards),
      tcgCache.bulkCacheImageUrls(allCards),
      tcgCache.bulkCachePriceData(allCards)
    ]);
    
      // Calculate and cache statistics
      const stats = calculateSetStatistics(allCards);
      await tcgCache.cacheSetStats(id, stats);
      
      // Return consistent structure
      const response = {
        set,
        cards: allCards,
        cachedAt: new Date().toISOString(),
        cardCount: allCards.length,
        stats,
        loadTime: Date.now() - startTime
      };
      
      return response;
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
      // Clean up the pending request
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
      
      // Extend the cache TTL since we can't get fresh data
      await tcgCache.extendCacheTTL(id, 48 * 60 * 60); // Extend by 48 hours
      
      res.setHeader('X-Cache-Status', 'stale-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=172800'); // More aggressive stale-while-revalidate
      
      // Ensure consistent structure when returning stale cache
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
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Fetch set info first
    const setInfo = await fetchJSON<{ data: CardSet }>(
      `https://api.pokemontcg.io/v2/sets/${setId}`, 
      { 
        headers,
        timeout: 30000,
        retries: 2
      }
    );
    
    if (!setInfo?.data) {
      logger.warn(`[Background Refresh] Set ${setId} not found, keeping existing cache`);
      return; // Don't throw - just keep using cached data
    }
    
    const set = setInfo.data;
    const totalCards = set.total || 0;
    
    // Load all cards in parallel batches
    const pageSize = 250;
    const totalPages = Math.ceil(totalCards / pageSize);
    const pagePromises: Promise<{ data: TCGCard[] } | null>[] = [];
    
    logger.info(`[Background Refresh] Loading ${totalCards} cards in ${totalPages} parallel requests`, { setId });
    
    // Determine timeout based on set size
    const isLargeSet = totalCards > 200;
    const timeout = isLargeSet ? 60000 : 45000; // 60s for large sets, 45s for normal
    
    // Create promises for all pages
    for (let page = 1; page <= totalPages; page++) {
      const pagePromise = fetchJSON<{ data: TCGCard[] }>(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`,
        {
          headers,
          timeout: timeout, // Dynamic timeout based on set size
          retries: 3, // More retries for reliability
          retryDelay: 2000 // 2 second delay between retries
        }
      );
      pagePromises.push(pagePromise);
    }
    
    // Wait for all pages to load
    const pageResults = await Promise.all(pagePromises);
    
    // Combine all cards
    const allCards: TCGCard[] = [];
    for (const result of pageResults) {
      if (result?.data) {
        allCards.push(...result.data);
      }
    }
    
    // Sort cards by number
    allCards.sort((a: TCGCard, b: TCGCard) => {
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      return numA - numB;
    });
    
    // Update cache with fresh data
    await tcgCache.cacheCompleteSet(setId, set, allCards);
    
    // Cache individual cards, image URLs, and price data for faster lookups
    await Promise.all([
      tcgCache.cacheCards(allCards),
      tcgCache.bulkCacheImageUrls(allCards),
      tcgCache.bulkCachePriceData(allCards)
    ]);
    
    // Calculate and cache statistics
    const stats = calculateSetStatistics(allCards);
    await tcgCache.cacheSetStats(setId, stats);
    
    logger.info(`[Background Refresh] Successfully refreshed set ${setId}`, {
      cardCount: allCards.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[Background Refresh] Failed to refresh set ${setId}:`, {
      error: errorMessage,
      setId
    });
    // Don't throw - just log the error and continue using cached data
    // The main handler will extend the cache TTL
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
    // Count rarities
    if (card.rarity) {
      rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
    }
    
    // Count types
    if (card.types) {
      for (const type of card.types) {
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    }
    
    // Calculate price stats
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