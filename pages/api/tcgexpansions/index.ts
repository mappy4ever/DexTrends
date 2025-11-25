import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { createFallbackResponse } from '../../../lib/static-sets-fallback';
import type { TCGApiResponse, TCGSetListApiResponse } from '../../../types/api/enhanced-responses';

// Lazy import tcgCache to avoid module loading errors
let tcgCacheModule: typeof import('../../../lib/tcg-cache') | null = null;
async function getTcgCache() {
  if (!tcgCacheModule) {
    try {
      tcgCacheModule = await import('../../../lib/tcg-cache');
    } catch (error) {
      logger.warn('Failed to load tcg-cache module, caching disabled', { error });
      return null;
    }
  }
  return tcgCacheModule.tcgCache;
}

// TCG Sets list endpoint - /api/tcgexpansions
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  // Parse query params with defaults
  const { page = '1', pageSize = '25', forceRefresh = 'false' } = req.query;
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1;
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10) || 25, 50);
  const shouldForceRefresh = (Array.isArray(forceRefresh) ? forceRefresh[0] : forceRefresh) === 'true';
  const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

  // Set CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Try to get tcgCache (lazy loaded to handle import failures)
    const tcgCache = await getTcgCache();

    // Check Redis cache first (unless force refresh)
    if (!shouldForceRefresh && tcgCache) {
      try {
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
      } catch (cacheError) {
        logger.warn('Cache lookup failed, continuing to API', { error: cacheError });
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const apiUrl = `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}&orderBy=-releaseDate`;
    logger.info('Fetching TCG sets from API', {
      url: apiUrl,
      page: pageNum,
      pageSize: pageSizeNum,
      hasApiKey: !!apiKey
    });

    let data;
    try {
      data = await fetchJSON<TCGApiResponse<unknown[]> & { page?: number; pageSize?: number; count?: number; totalCount?: number }>(apiUrl, {
        headers,
        useCache: true,
        cacheTime: 30 * 60 * 1000,
        forceRefresh: pageNum === 1 && shouldForceRefresh,
        timeout: 15000,
        retries: 1,
        retryDelay: 1000,
        throwOnError: true
      });
    } catch (apiError) {
      logger.warn('Pokemon TCG API slow/unavailable, using fallback', {
        error: apiError instanceof Error ? apiError.message : String(apiError),
        duration: Date.now() - startTime
      });

      const fallback = createFallbackResponse(pageNum, pageSizeNum);

      res.setHeader('X-Cache-Status', 'fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return res.status(200).json(fallback);
    }

    if (!data || !data.data) {
      logger.warn('API returned invalid data, using fallback');
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

    // Cache the response asynchronously (if cache is available)
    if (tcgCache) {
      tcgCache.cacheSetsList(pageNum, pageSizeNum, response as TCGSetListApiResponse).catch(err => {
        logger.error('Failed to cache TCG sets', { error: err });
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
    res.setHeader('X-Cache-Status', 'miss');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);

    res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch TCG sets', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Try to return stale cache first
    try {
      const tcgCache = await getTcgCache();
      if (tcgCache) {
        const staleCache = await tcgCache.getSetsList(pageNum, pageSizeNum);
        if (staleCache) {
          res.setHeader('X-Cache-Status', 'stale-fallback');
          return res.status(200).json(staleCache);
        }
      }
    } catch (cacheError) {
      logger.warn('Stale cache lookup failed', { error: cacheError });
    }

    // Use static fallback as last resort - this should ALWAYS succeed
    logger.info('Using static fallback for TCG sets', { page: pageNum, pageSize: pageSizeNum });
    const fallback = createFallbackResponse(pageNum, pageSizeNum);
    res.setHeader('X-Cache-Status', 'static-fallback');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    return res.status(200).json(fallback);
  }
}
