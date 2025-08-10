import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';
import { tcgCache } from '../../lib/tcg-cache';
import { createFallbackResponse } from '../../lib/static-sets-fallback';
import type { TCGApiResponse } from '../../types/api/enhanced-responses';
import { isTCGSet, isString, hasProperty } from '../../utils/typeGuards';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  const { page = '1', pageSize = '25', forceRefresh = 'false' } = req.query; // Reduced default pageSize
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 50); // Reduced max to 50
  const shouldForceRefresh = (Array.isArray(forceRefresh) ? forceRefresh[0] : forceRefresh) === 'true';
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
  
  try {
    // Check Redis cache first (unless force refresh)
    if (!shouldForceRefresh) {
      const cached = await tcgCache.getSetsList(pageNum, pageSizeNum);
      if (cached) {
        logger.info('Returning cached TCG sets', {
          page: pageNum,
          pageSize: pageSizeNum,
          responseTime: Date.now() - startTime
        });
        
        res.setHeader('X-Cache-Status', 'hit');
        res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
        
        return res.status(200).json(cached);
      }
    }

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
    
    // Try API with aggressive timeout - if it's slow, fall back immediately
    let data;
    try {
      data = await fetchJSON<TCGApiResponse<unknown[]> & { page?: number; pageSize?: number; count?: number; totalCount?: number }>(apiUrl, { 
        headers,
        useCache: true,
        cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
        forceRefresh: pageNum === 1 && shouldForceRefresh,
        timeout: 15000, // Reduced to 15 seconds - if it's slower than this, use fallback
        retries: 1, // Only 1 retry to avoid long waits
        retryDelay: 1000,
        throwOnError: false
      });
    } catch (apiError) {
      logger.warn('Pokemon TCG API slow/unavailable, using fallback', { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        duration: Date.now() - startTime
      });
      
      // Return static fallback immediately
      const fallback = createFallbackResponse(pageNum, pageSizeNum);
      
      res.setHeader('X-Cache-Status', 'fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400'); // Shorter cache for fallback
      
      return res.status(200).json(fallback);
    }
    
    // Extra validation - if API fails, use fallback
    if (!data || !data.data) {
      logger.warn('API returned invalid data, using fallback', { 
        hasData: !!data,
        hasDataArray: !!data?.data,
        url: apiUrl
      });
      
      // Return static fallback immediately
      const fallback = createFallbackResponse(pageNum, pageSizeNum);
      
      res.setHeader('X-Cache-Status', 'fallback-invalid-data');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      
      return res.status(200).json(fallback);
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
      const validSets = sets.filter(isTCGSet);
      const sortedByDate = validSets.sort((a, b) => 
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
    // Cache the response in Redis
    const response = {
      data: sets,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: data?.count || sets.length,
        totalCount: data?.totalCount || sets.length,
        hasMore: (data?.count || sets.length) === pageSizeNum
      },
      meta: {
        responseTime: Date.now() - startTime,
        cached: false
      }
    };
    
    // Cache the response asynchronously
    tcgCache.cacheSetsList(pageNum, pageSizeNum, response).catch(err => {
      logger.error('Failed to cache TCG sets', { error: err });
    });
    
    // Background task: Pre-warm commonly requested pages  
    if (pageNum === 1 && pageSizeNum === 25) {
      // Fire and forget - warm the next few pages in background
      setImmediate(async () => {
        try {
          const pagesToWarm = [
            { page: 2, pageSize: 25 },
            { page: 1, pageSize: 50 },
            { page: 3, pageSize: 25 }
          ];
          
          for (const { page, pageSize } of pagesToWarm) {
            const existing = await tcgCache.getSetsList(page, pageSize);
            if (!existing) {
              logger.info(`[Background] Pre-warming sets list page ${page}:${pageSize}`);
              // Don't await - fire and forget
              tcgCache.warmSetsListCache().catch(err => 
                logger.debug('[Background] Sets warming failed:', err)
              );
              break; // Only warm one at a time to avoid overwhelming
            }
          }
        } catch (error) {
          logger.debug('[Background] Pre-warming failed:', error);
        }
      });
    }
    
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000'); // 7 day cache, 30 day stale
    res.setHeader('X-Cache-Status', 'miss');
    
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
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch TCG sets', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}`,
      apiKey: !!apiKey
    });
    
    // Try to return stale cache first
    const staleCache = await tcgCache.getSetsList(pageNum, pageSizeNum);
    if (staleCache) {
      logger.warn('Returning stale cached sets due to API error', {
        page: pageNum,
        pageSize: pageSizeNum,
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.setHeader('X-Cache-Status', 'stale-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('X-Error', error instanceof Error ? error.message : String(error));
      res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=172800');
      
      return res.status(200).json({
        ...staleCache,
        warning: 'Data may be outdated due to API issues'
      });
    }
    
    // If no stale cache, use static fallback as last resort
    logger.warn('No stale cache available, using static fallback', {
      page: pageNum,
      pageSize: pageSizeNum,
      error: error instanceof Error ? error.message : String(error)
    });
    
    const fallback = createFallbackResponse(pageNum, pageSizeNum);
    
    res.setHeader('X-Cache-Status', 'static-fallback');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    res.setHeader('X-Error', error instanceof Error ? error.message : String(error));
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).json({
      ...fallback,
      warning: 'Using fallback data due to API unavailability'
    });
  }
}