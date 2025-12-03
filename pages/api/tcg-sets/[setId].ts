import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import { createSetDetailFallback } from '../../../lib/static-sets-fallback';
import type { TCGCardListApiResponse } from '../../../types/api/enhanced-responses';
import type { CardSet, TCGCard } from '../../../types/api/cards';
import type { TCGDexSet, TCGDexCard } from '../../../types/api/tcgdex';
import { transformSet, transformCards, TCGDexEndpoints } from '../../../utils/tcgdex-adapter';

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

    // TCGDex set response has brief card info - fetch full card details for better display
    let allCards: TCGCard[] = [];

    if (tcgdexData.cards && tcgdexData.cards.length > 0) {
      // Fetch full card data in batches for better display (rarity, pricing, HP, types)
      const BATCH_SIZE = 50;
      const cardIds = tcgdexData.cards.map(c => c.id);

      // Fetch cards in parallel batches
      const fetchFullCards = async (ids: string[]): Promise<TCGCard[]> => {
        const results = await Promise.all(
          ids.map(async (cardId) => {
            try {
              const cardUrl = TCGDexEndpoints.card(cardId, 'en');
              const fullCard = await fetchJSON<TCGDexCard>(cardUrl, {
                useCache: true,
                cacheTime: 24 * 60 * 60 * 1000,
                timeout: 8000,
                throwOnError: false
              });
              if (fullCard) {
                return transformCards([fullCard])[0];
              }
              return null;
            } catch {
              return null;
            }
          })
        );
        return results.filter((c): c is TCGCard => c !== null);
      };

      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < cardIds.length; i += BATCH_SIZE) {
        const batch = cardIds.slice(i, i + BATCH_SIZE);
        const batchCards = await fetchFullCards(batch);
        allCards.push(...batchCards);
      }

      // If fetching full cards failed, fall back to brief cards
      if (allCards.length === 0) {
        logger.warn('Full card fetch failed, using brief cards', { setId: id });
        allCards = tcgdexData.cards.map(briefCard => ({
          id: briefCard.id,
          name: briefCard.name,
          supertype: 'Pokémon' as const,
          set: set,
          number: briefCard.localId,
          images: {
            small: briefCard.image ? `${briefCard.image}/low.png` : '',
            large: briefCard.image ? `${briefCard.image}/high.png` : '',
          },
        }));
      }
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