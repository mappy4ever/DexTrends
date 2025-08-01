import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const { page = '1', pageSize = '25', forceRefresh = 'false' } = req.query; // Reduced default pageSize
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 50); // Reduced max to 50
  const shouldForceRefresh = (Array.isArray(forceRefresh) ? forceRefresh[0] : forceRefresh) === 'true';
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Use pagination parameters for the Pokemon TCG API
    // Add orderBy to ensure we get sets in release date order
    const apiUrl = `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}&orderBy=-releaseDate`;
    logger.info('Fetching TCG sets from API', { 
      url: apiUrl, 
      page: pageNum, 
      pageSize: pageSizeNum,
      hasApiKey: !!apiKey
    });
    
    const data = await fetchJSON<{ data: any[], page?: number, pageSize?: number, count?: number, totalCount?: number }>(apiUrl, { 
      headers,
      useCache: true,
      cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
      forceRefresh: pageNum === 1 && shouldForceRefresh,
      timeout: 60000, // 60 seconds timeout
      retries: 3,
      retryDelay: 2000, // 2 second delay between retries
      throwOnError: false // Don't throw, we'll handle errors
    });
    
    // Extra validation
    if (!data) {
      logger.error('fetchJSON returned null', { url: apiUrl });
      throw new Error('No data returned from API - fetchJSON returned null. This usually means the API request failed.');
    }
    
    if (!data.data) {
      logger.error('API response missing data array', { response: data });
      throw new Error('API response is missing the data array');
    }
    
    const sets = data?.data || [];
    logger.debug('TCG API response received', { 
      page: pageNum, 
      pageSize: pageSizeNum,
      setCount: sets.length,
      totalCount: data?.totalCount 
    });
    
    // Log the newest sets on page 1
    if (pageNum === 1 && sets.length > 0) {
      const sortedByDate = [...sets].sort((a, b) => 
        new Date(b.releaseDate || '1970-01-01').getTime() - new Date(a.releaseDate || '1970-01-01').getTime()
      );
      logger.info('Newest 5 sets from API page 1:', sortedByDate.slice(0, 5).map(s => ({ 
        id: s.id, 
        name: s.name, 
        releaseDate: s.releaseDate,
        series: s.series
      })));
    }
    
    logger.info('TCG sets API response summary', { 
      setsReturned: sets.length,
      totalAvailable: data?.totalCount || 'unknown',
      cacheStatus: 'fresh',
      responseTimeMs: Date.now() - startTime
    });
    
    // Add cache-control headers for better edge caching
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400'); // 6hr cache, 24hr stale
    
    // Add performance headers
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Log slow responses
    if (responseTime > 2000) {
      logger.warn('Slow TCG sets API response', { 
        responseTime, 
        page: pageNum, 
        pageSize: pageSizeNum,
        setCount: sets.length 
      });
    }
    
    res.status(200).json({
      data: sets,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: data?.count || sets.length,
        totalCount: data?.totalCount || sets.length,
        hasMore: (data?.count || sets.length) === pageSizeNum
      },
      meta: {
        responseTime,
        cached: false // This would need to be determined from fetchJSON
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch TCG sets', { 
      error: error.message,
      stack: error.stack,
      url: `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}`,
      apiKey: !!apiKey
    });
    
    // Try to return cached data if available
    try {
      const fallbackUrl = `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}&orderBy=-releaseDate`;
      const cacheKey = `fetch-${fallbackUrl}`;
      const cachedData = await (global as any).cacheManager?.get(cacheKey);
      
      if (cachedData) {
        logger.warn('Returning stale cached data due to API error', {
          page: pageNum,
          error: error.message
        });
        
        res.setHeader('X-Cache-Status', 'stale');
        res.setHeader('X-Error', error.message);
        
        return res.status(200).json({
          ...cachedData,
          _stale: true,
          _error: error.message
        });
      }
    } catch (cacheError) {
      logger.error('Failed to retrieve cached data', { error: cacheError });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch TCG sets',
      message: error.message 
    });
  }
}