import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../../utils/unifiedFetch';
import logger from '../../../../utils/logger';
import { tcgCache } from '../../../../lib/tcg-cache';

// This endpoint loads ALL cards for a set at once (optimized for performance)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId } = req.query;
  const id = Array.isArray(setId) ? setId[0] : setId;
  
  if (!id) {
    return res.status(400).json({ error: 'Set ID is required' });
  }
  
  const startTime = Date.now();
  
  try {
    // Check complete set cache first with TTL info
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
      
      // If cache is getting stale, trigger background refresh (but still return cached data)
      if (isStale && ttl > 0) {
        // Fire and forget background refresh
        setImmediate(async () => {
          try {
            logger.info(`[Background Refresh] Starting stale cache refresh for set ${id}`);
            await refreshSetInBackground(id);
          } catch (error) {
            logger.error(`[Background Refresh] Failed for set ${id}:`, error);
            // If refresh fails, extend the existing cache TTL to prevent frequent failures
            await tcgCache.extendCacheTTL(id, 24 * 60 * 60); // Extend by 24 hours
          }
        });
      }
      
      return res.status(200).json(cached);
    }
    
    logger.info('Loading complete set from API', { setId: id });
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    // Fetch set info first
    let setInfo;
    try {
      setInfo = await fetchJSON<{ data: any }>(
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
    } catch (fetchError: any) {
      // Check if this is a known subset pattern that often has 404 issues
      const isKnownSubset = /^sv\d+pt5$/.test(id) || /^swsh\d+pt5$/.test(id);
      
      if (fetchError.message?.includes('404') && isKnownSubset) {
        logger.warn(`Known subset ${id} returned 404, will retry with longer timeout`, {
          setId: id,
          error: fetchError.message
        });
        
        // Try once more with longer timeout for known problematic sets
        try {
          setInfo = await fetchJSON<{ data: any }>(
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
    const pagePromises: Promise<any>[] = [];
    
    logger.info(`Loading ${totalCards} cards in ${totalPages} parallel requests`, { setId: id });
    
    // Create promises for all pages
    for (let page = 1; page <= totalPages; page++) {
      const pagePromise = fetchJSON<{ data: any[] }>(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${page}&pageSize=${pageSize}`,
        {
          headers,
          useCache: true,
          cacheTime: 60 * 60 * 1000,
          timeout: 30000,
          retries: 2
        }
      );
      pagePromises.push(pagePromise);
    }
    
    // Wait for all pages to load
    const pageResults = await Promise.all(pagePromises);
    
    // Combine all cards
    const allCards: any[] = [];
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
    allCards.sort((a, b) => {
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
    
    const responseTime = Date.now() - startTime;
    
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('Cache-Control', 'public, s-maxage=7200, stale-while-revalidate=86400');
    
    // Return consistent structure
    const response = {
      set,
      cards: allCards,
      cachedAt: new Date().toISOString(),
      cardCount: allCards.length,
      stats,
      loadTime: responseTime
    };
    
    res.status(200).json(response);
    
  } catch (error: any) {
    logger.error('Failed to fetch complete set', { 
      setId: id,
      error: error.message,
      stack: error.stack
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
      message: error.message,
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
    const setInfo = await fetchJSON<{ data: any }>(
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
    const pagePromises: Promise<any>[] = [];
    
    logger.info(`[Background Refresh] Loading ${totalCards} cards in ${totalPages} parallel requests`, { setId });
    
    // Create promises for all pages
    for (let page = 1; page <= totalPages; page++) {
      const pagePromise = fetchJSON<{ data: any[] }>(
        `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`,
        {
          headers,
          timeout: 30000,
          retries: 2
        }
      );
      pagePromises.push(pagePromise);
    }
    
    // Wait for all pages to load
    const pageResults = await Promise.all(pagePromises);
    
    // Combine all cards
    const allCards: any[] = [];
    for (const result of pageResults) {
      if (result?.data) {
        allCards.push(...result.data);
      }
    }
    
    // Sort cards by number
    allCards.sort((a, b) => {
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
  } catch (error: any) {
    logger.error(`[Background Refresh] Failed to refresh set ${setId}:`, {
      error: error.message,
      setId
    });
    // Don't throw - just log the error and continue using cached data
    // The main handler will extend the cache TTL
  }
}

// Calculate statistics for the set
function calculateSetStatistics(cards: any[]) {
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
          const price = (priceData as any).market || (priceData as any).mid || 0;
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