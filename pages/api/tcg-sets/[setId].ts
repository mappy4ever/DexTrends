import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { tcgCache } from '../../../lib/tcg-cache';
import type { TCGApiResponse, TCGCardListApiResponse } from '../../../types/api/enhanced-responses';
import type { UnknownError } from '../../../types/common';
import type { CardSet, TCGCard } from '../../../types/api/cards';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { setId, page = '1', pageSize = '100' } = req.query; // Reduced to 100 for better reliability
  const id = Array.isArray(setId) ? setId[0] : setId;
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 100); // Max 100 per request for stability

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
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Try smaller page size first if request is large
    const effectivePageSize = pageSizeNum > 50 ? 50 : pageSizeNum;
    
    // Fetch set info and cards (with pagination) in parallel
    let setInfo, cardsData;
    
    // Debug: Log the actual URL being called
    const cardsUrl = `https://api.pokemontcg.io/v2/cards?q=set.id:${id}&page=${pageNum}&pageSize=${effectivePageSize}`;
    logger.info('Fetching cards from Pokemon TCG API', {
      url: cardsUrl,
      setId: id,
      requestedPageSize: effectivePageSize,
      page: pageNum
    });
    
    try {
      [setInfo, cardsData] = await Promise.all([
        // Get set information (always needed)
        fetchJSON<TCGApiResponse<CardSet>>(`https://api.pokemontcg.io/v2/sets/${id}`, { 
          headers,
          useCache: true,
          cacheTime: 60 * 60 * 1000, // Cache for 1 hour (increased)
          retries: 3, // Increased retries
          retryDelay: 1000, // Increased delay
          timeout: 30000 // 30 seconds (increased)
        }),
        // Get cards for this set with pagination
        fetchJSON<TCGApiResponse<TCGCard[]> & { page?: number; pageSize?: number; count?: number; totalCount?: number }>(
          cardsUrl, 
          { 
            headers,
            useCache: true,
            cacheTime: 60 * 60 * 1000, // Cache for 1 hour (increased)
            retries: 3, // Increased retries
            retryDelay: 1000, // Increased delay
            timeout: 30000 // 30 seconds per request (increased)
          }
        )
      ]);
    } catch (fetchError) {
      logger.error('Failed to fetch from Pokemon TCG API', {
        setId: id,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        type: fetchError instanceof Error ? fetchError.name : typeof fetchError
      });
      
      // Try to provide more specific error messages
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      if (errorMessage?.includes('404')) {
        return res.status(404).json({ 
          error: 'Set not found',
          message: `Set "${id}" does not exist in the Pokemon TCG database.`,
          setId: id
        });
      }
      
      // Handle timeout and connection errors
      if (errorMessage?.includes('timeout') || errorMessage?.includes('ETIMEDOUT')) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'The Pokemon TCG API is currently experiencing issues. Please try again later.',
          setId: id,
          retryAfter: 60
        });
      }
      
      // Handle network errors
      if (errorMessage?.includes('ECONNREFUSED') || errorMessage?.includes('ENOTFOUND')) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'Unable to connect to the Pokemon TCG API. Please try again later.',
          setId: id,
          retryAfter: 120
        });
      }
      
      throw fetchError; // Re-throw for general error handling
    }
    
    const set = setInfo?.data || null;
    const cards = cardsData?.data || [];
    
    // Log the response data
    logger.info('API responses received', {
      setId: id,
      hasSetInfo: !!setInfo,
      hasSetData: !!set,
      hasCardsData: !!cardsData,
      cardsCount: cards.length,
      setInfoKeys: setInfo ? Object.keys(setInfo) : [],
      setName: set?.name || 'N/A',
      // Log raw responses for debugging
      rawSetInfo: process.env.NODE_ENV === 'development' ? setInfo : undefined,
      firstCard: cards[0] || null
    });
    
    // Check if set not found
    if (!set) {
      logger.warn('Set not found in API', { 
        setId: id, 
        setInfoResponse: setInfo,
        setInfoKeys: setInfo ? Object.keys(setInfo) : []
      });
      return res.status(404).json({ 
        error: 'Set not found',
        message: `Set "${id}" was not found in the Pokemon TCG database.`,
        setId: id,
        debugInfo: process.env.NODE_ENV === 'development' ? {
          requestedId: id,
          apiResponse: setInfo
        } : undefined
      });
    }
    
    logger.debug('TCG set API response received', { 
      setId: id, 
      page: pageNum,
      pageSize: pageSizeNum,
      cardCount: cards.length,
      totalCount: cardsData?.totalCount 
    });
    
    // Prepare response
    const response = { 
      set, 
      cards,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: cardsData?.count || cards.length,
        totalCount: cardsData?.totalCount || cards.length,
        hasMore: (cardsData?.count || cards.length) === pageSizeNum
      }
    };
    
    // Cache the response asynchronously (cast to expected type)
    tcgCache.cacheSetWithCards(id, pageNum, pageSizeNum, response as TCGCardListApiResponse).catch(err => {
      logger.error('Failed to cache set details', { error: err, setId: id });
    });
    
    // If this is page 1 and we potentially have all cards, check if we should cache complete set
    if (pageNum === 1 && cardsData?.totalCount && cards.length === cardsData.totalCount) {
      logger.info('Caching complete set', { setId: id, cardCount: cards.length });
      tcgCache.cacheCompleteSet(id, set as CardSet, cards as TCGCard[]).catch(err => {
        logger.error('Failed to cache complete set', { error: err, setId: id });
      });
    }
    
    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400'); // 1hr cache, 24hr stale
    res.setHeader('X-Cache-Status', 'miss');
    
    logger.info('Sending response', {
      setId: id,
      hasSet: !!response.set,
      cardsCount: response.cards.length,
      setName: response.set?.name,
      requestedPageSize: pageSizeNum,
      actualDataCount: cardsData?.data?.length || 0,
      paginationInfo: response.pagination
    });
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch TCG set details', { 
      setId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined, // Limit stack trace size
      apiUrl: `https://api.pokemontcg.io/v2/sets/${id}`,
      errorType: error instanceof Error ? error.name : typeof error
    });
    
    // Provide user-friendly error messages
    let userMessage = 'An unexpected error occurred while fetching set details.';
    let statusCode = 500;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage?.includes('timeout') || errorMessage?.includes('ETIMEDOUT')) {
      userMessage = 'Request timed out. The Pokemon TCG API is responding slowly.';
      statusCode = 504;
    } else if (errorMessage?.includes('ECONNREFUSED') || errorMessage?.includes('ENOTFOUND')) {
      userMessage = 'Unable to connect to the Pokemon TCG API.';
      statusCode = 503;
    } else if (errorMessage?.includes('429')) {
      userMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      statusCode = 429;
    } else if (errorMessage?.includes('401') || errorMessage?.includes('403')) {
      userMessage = 'API authentication failed. Please check configuration.';
      statusCode = 502;
    }
    
    res.status(statusCode).json({ 
      error: 'Failed to fetch TCG set details',
      message: userMessage,
      setId: id,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        debug: {
          originalError: errorMessage,
          errorType: error instanceof Error ? error.name : typeof error
        }
      })
    });
  }
}