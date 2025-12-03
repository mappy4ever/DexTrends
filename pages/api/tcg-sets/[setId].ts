import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import { createSetDetailFallback } from '../../../lib/static-sets-fallback';
import type { TCGCardListApiResponse } from '../../../types/api/enhanced-responses';
import type { CardSet, TCGCard } from '../../../types/api/cards';
import type { TCGDexSet } from '../../../types/api/tcgdex';
import { transformSet, TCGDexEndpoints } from '../../../utils/tcgdex-adapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId, page = '1', pageSize = '250' } = req.query; // Increased default
  const id = Array.isArray(setId) ? setId[0] : setId;
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 250); // Max 250 per request

  if (!id) {
    return res.status(400).json({ error: 'Set ID is required' });
  }
  
  // Log the set ID being requested
  logger.info('Set detail requested', { setId: id, rawSetId: setId });

  try {
    logger.info('Fetching TCG set details', { setId: id, page: pageNum, pageSize: pageSizeNum });
    
    // First, check if we have the complete set cached (best performance)
    if (pageNum === 1) {
      const completeSet = await tcgCache.getCompleteSet(id);
      if (completeSet) {
        logger.info('Returning complete cached set', {
          setId: id,
          cardCount: completeSet.cards.length,
          cachedAt: completeSet.cachedAt
        });
        
        // Return paginated subset from complete cache
        const startIdx = (pageNum - 1) * pageSizeNum;
        const endIdx = startIdx + pageSizeNum;
        const paginatedCards = completeSet.cards.slice(startIdx, endIdx);
        
        res.setHeader('X-Cache-Status', 'hit-complete');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        
        return res.status(200).json({
          set: completeSet.set,
          cards: paginatedCards,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            count: paginatedCards.length,
            totalCount: completeSet.cards.length,
            hasMore: endIdx < completeSet.cards.length
          }
        });
      }
    }
    
    // Check page-specific cache
    const cachedPage = await tcgCache.getSetWithCards(id, pageNum, pageSizeNum);
    if (cachedPage) {
      logger.info('Returning cached page', { setId: id, page: pageNum });
      res.setHeader('X-Cache-Status', 'hit-page');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(cachedPage);
    }
    
    // TCGDex API - single call returns set + all cards
    const apiUrl = TCGDexEndpoints.set(id, 'en');
    logger.info('Fetching set from TCGDex', {
      url: apiUrl,
      setId: id,
      page: pageNum,
      pageSize: pageSizeNum
    });

    // TCGDex returns set info with cards in one call
    const tcgdexData = await fetchJSON<TCGDexSet>(apiUrl, {
      useCache: true,
      cacheTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
      timeout: 15000,
      retries: 2,
      retryDelay: 1000,
      throwOnError: false
    });

    // Handle API failure
    if (!tcgdexData) {
      logger.info('TCGDex API unavailable, trying static fallback', { setId: id });

      const fallback = createSetDetailFallback(id);
      if (fallback) {
        res.setHeader('X-Cache-Status', 'static-fallback');
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
        return res.status(200).json(fallback);
      }

      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The TCGDex API is currently unavailable. Please try again later.',
        setId: id,
        retryAfter: 60
      });
    }

    // Transform TCGDex data to app format
    const set = transformSet(tcgdexData);

    // TCGDex set response includes brief card info - use directly for fast loading
    // Full card details can be fetched when user clicks on a specific card
    let allCards: TCGCard[] = [];

    if (tcgdexData.cards && tcgdexData.cards.length > 0) {
      // Transform brief cards directly - much faster than fetching each card individually
      allCards = tcgdexData.cards.map(briefCard => {
        // Construct image URL if missing
        const imageBase = briefCard.image || `https://assets.tcgdex.net/en/sv/${briefCard.id.split('-')[0]}/${briefCard.localId}`;
        const bc = briefCard as any;

        return {
          id: briefCard.id,
          name: briefCard.name,
          supertype: 'Pokémon' as const,
          set: set,
          number: briefCard.localId,
          rarity: bc.rarity || undefined,
          images: {
            small: `${imageBase}/low.png`,
            large: `${imageBase}/high.png`,
          },
          // Include pricing if available in the set response
          pricing: bc.pricing || undefined,
        };
      });

      logger.info('Transformed brief cards from set response', {
        setId: id,
        cardCount: allCards.length
      });

      // PERFORMANCE FIX: Don't fetch prices during initial load
      // Prices are fetched when viewing individual card details
      // This removes 50 blocking API calls that were adding 5-15s to load time
    }

    logger.info('TCGDex response transformed', {
      setId: id,
      setName: set.name,
      totalCards: allCards.length
    });
    
    // Paginate cards (TCGDex returns all cards at once)
    const startIndex = (pageNum - 1) * pageSizeNum;
    const paginatedCards = allCards.slice(startIndex, startIndex + pageSizeNum);

    // Prepare response
    const response = {
      set,
      cards: paginatedCards,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: paginatedCards.length,
        totalCount: allCards.length,
        hasMore: startIndex + pageSizeNum < allCards.length
      }
    };

    // Cache the response asynchronously
    tcgCache.cacheSetWithCards(id, pageNum, pageSizeNum, response as TCGCardListApiResponse).catch(err => {
      logger.error('Failed to cache set details', { error: err, setId: id });
    });

    // Cache complete set for future requests
    if (allCards.length > 0) {
      tcgCache.cacheCompleteSet(id, set as CardSet, allCards as TCGCard[]).catch(err => {
        logger.error('Failed to cache complete set', { error: err, setId: id });
      });
    }

    // Add cache-control headers
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Data-Source', 'tcgdex');

    logger.info('Sending response', {
      setId: id,
      setName: set?.name,
      cardsCount: paginatedCards.length,
      totalCards: allCards.length,
      pagination: response.pagination
    });

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch TCG set details', {
      setId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      errorType: error instanceof Error ? error.name : typeof error
    });

    // Provide user-friendly error messages
    let userMessage = 'An unexpected error occurred while fetching set details.';
    let statusCode = 500;

    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage?.includes('timeout') || errorMessage?.includes('ETIMEDOUT')) {
      userMessage = 'Request timed out. The TCGDex API is responding slowly.';
      statusCode = 504;
    } else if (errorMessage?.includes('ECONNREFUSED') || errorMessage?.includes('ENOTFOUND')) {
      userMessage = 'Unable to connect to the TCGDex API.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      error: 'Failed to fetch TCG set details',
      message: userMessage,
      setId: id,
      timestamp: new Date().toISOString()
    });
  }
}