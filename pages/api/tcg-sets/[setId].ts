import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

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
        fetchJSON<{ data: any }>(`https://api.pokemontcg.io/v2/sets/${id}`, { 
          headers,
          useCache: true,
          cacheTime: 60 * 60 * 1000, // Cache for 1 hour (increased)
          retries: 3, // Increased retries
          retryDelay: 1000, // Increased delay
          timeout: 30000 // 30 seconds (increased)
        }),
        // Get cards for this set with pagination
        fetchJSON<{ data: any[], page?: number, pageSize?: number, count?: number, totalCount?: number }>(
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
    } catch (fetchError: any) {
      logger.error('Failed to fetch from Pokemon TCG API', {
        setId: id,
        error: fetchError.message,
        type: fetchError.name
      });
      
      // Try to provide more specific error messages
      if (fetchError.message?.includes('404')) {
        return res.status(404).json({ 
          error: 'Set not found',
          message: `Set "${id}" does not exist in the Pokemon TCG database.`,
          setId: id
        });
      }
      
      // Handle timeout and connection errors
      if (fetchError.message?.includes('timeout') || fetchError.message?.includes('ETIMEDOUT')) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          message: 'The Pokemon TCG API is currently experiencing issues. Please try again later.',
          setId: id,
          retryAfter: 60
        });
      }
      
      // Handle network errors
      if (fetchError.message?.includes('ECONNREFUSED') || fetchError.message?.includes('ENOTFOUND')) {
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
    
    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400'); // 1hr cache, 24hr stale
    
    // Log what we're sending back
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
  } catch (error: any) {
    logger.error('Failed to fetch TCG set details', { 
      setId: id,
      error: error.message,
      stack: error.stack?.substring(0, 500), // Limit stack trace size
      apiUrl: `https://api.pokemontcg.io/v2/sets/${id}`,
      errorType: error.name || 'UnknownError'
    });
    
    // Provide user-friendly error messages
    let userMessage = 'An unexpected error occurred while fetching set details.';
    let statusCode = 500;
    
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      userMessage = 'Request timed out. The Pokemon TCG API is responding slowly.';
      statusCode = 504;
    } else if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      userMessage = 'Unable to connect to the Pokemon TCG API.';
      statusCode = 503;
    } else if (error.message?.includes('429')) {
      userMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      statusCode = 429;
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
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
          originalError: error.message,
          errorType: error.name
        }
      })
    });
  }
}