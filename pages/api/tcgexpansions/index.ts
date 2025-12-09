import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import { createFallbackResponse } from '../../../lib/static-sets-fallback';
import type { TCGSetListApiResponse } from '../../../types/api/enhanced-responses';
import type { TCGDexSetBrief } from '../../../types/api/tcgdex';
import { transformSetBrief, transformSetsFromSeries, TCGDexEndpoints, type TCGDexSeriesWithSets } from '../../../utils/tcgdex-adapter';
import { withRateLimit, RateLimitPresets } from '../../../lib/api-middleware';
import { TcgCardManager } from '../../../lib/supabase';

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

// Allowed origins for CORS - security: prevent cross-origin abuse
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_APP_URL,
  'https://dextrends.vercel.app',
  'https://dextrends.com',
  'https://www.dextrends.com',
].filter(Boolean) as string[];

// TCG Sets list endpoint - /api/tcgexpansions
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  // Parse query params with defaults - allow up to 300 sets per page (TCGDex has ~200)
  const { page = '1', pageSize = '300', forceRefresh = 'false' } = req.query;
  const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10) || 1;
  const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10) || 300, 300);
  const shouldForceRefresh = (Array.isArray(forceRefresh) ? forceRefresh[0] : forceRefresh) === 'true';

  // Set CORS headers with origin whitelist (security: prevent cross-origin abuse)
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
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

    // Try Supabase first (local database) - much faster than external API
    const supabaseSets = await TcgCardManager.getSets();
    if (supabaseSets && supabaseSets.length > 0) {
      logger.debug('Using Supabase data for TCG sets', { count: supabaseSets.length });

      // Filter out TCG Pocket sets - they have their own dedicated page at /pocketmode
      const POCKET_SET_PATTERNS = /^(A[0-9]|P-A)/i;
      let allSets = supabaseSets
        .filter(set => !POCKET_SET_PATTERNS.test(set.id))
        .map(set => ({
          id: set.id,
          name: set.name,
          series: set.series_id || '',
          releaseDate: set.release_date || '',
          total: set.total_cards || 0,
          printedTotal: set.total_cards || 0,
          images: {
            symbol: set.symbol_url || '',
            logo: set.logo_url || ''
          },
          legalities: { standard: 'Legal', expanded: 'Legal' }
        }));

      // Sort by release date (newest first)
      allSets.sort((a, b) => {
        if (a.releaseDate && b.releaseDate) {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
        return b.id.localeCompare(a.id);
      });

      // Paginate the results
      const startIndex = (pageNum - 1) * pageSizeNum;
      const sets = allSets.slice(startIndex, startIndex + pageSizeNum);

      const responseTime = Date.now() - startTime;
      res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('X-Cache-Status', 'supabase');
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Data-Source', 'supabase');

      return res.status(200).json({
        data: sets,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          count: sets.length,
          totalCount: allSets.length,
          hasMore: startIndex + pageSizeNum < allSets.length
        },
        meta: {
          responseTime,
          cached: false,
          source: 'supabase'
        }
      });
    }

    logger.debug('Supabase returned no sets, falling back to TCGDex');

    // TCGDex API - fetch all series in parallel to get complete set data
    // This gives us series names and release dates for proper sorting
    const seriesListUrl = TCGDexEndpoints.series('en');
    logger.info('Fetching TCG series list from TCGDex', {
      url: seriesListUrl,
      page: pageNum,
      pageSize: pageSizeNum
    });

    // First get the list of all series
    const seriesList = await fetchJSON<{ id: string; name: string }[]>(seriesListUrl, {
      useCache: true,
      cacheTime: 24 * 60 * 60 * 1000,
      forceRefresh: shouldForceRefresh,
      timeout: 10000,
      retries: 2,
      throwOnError: false
    });

    // If API failed, use static fallback
    if (!seriesList || !Array.isArray(seriesList)) {
      logger.info('TCGDex API unavailable, using static fallback', {
        duration: Date.now() - startTime
      });

      const fallback = createFallbackResponse(pageNum, pageSizeNum);
      res.setHeader('X-Cache-Status', 'static-fallback');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

      return res.status(200).json(fallback);
    }

    // Fetch all series details in parallel (21 series = 21 calls, but parallel)
    const seriesPromises = seriesList.map(async (series) => {
      try {
        const seriesDetail = await fetchJSON<TCGDexSeriesWithSets>(
          TCGDexEndpoints.serie(series.id, 'en'),
          {
            useCache: true,
            cacheTime: 24 * 60 * 60 * 1000,
            timeout: 10000,
            throwOnError: false
          }
        );
        return seriesDetail;
      } catch (err) {
        logger.warn(`Failed to fetch series ${series.id}`, { error: err });
        return null;
      }
    });

    const seriesDetails = await Promise.all(seriesPromises);
    const validSeries = seriesDetails.filter((s): s is TCGDexSeriesWithSets => s !== null);

    logger.debug('Fetched series details', {
      requested: seriesList.length,
      received: validSeries.length
    });

    // Transform all sets from series (includes series name and release date)
    let allSets = transformSetsFromSeries(validSeries);

    // Filter out TCG Pocket sets - they have their own dedicated page at /pocketmode
    // Pocket set IDs start with: A1, A2, A3, A4, P-A (promos)
    const POCKET_SET_PATTERNS = /^(A[0-9]|P-A)/i;
    allSets = allSets.filter(set => !POCKET_SET_PATTERNS.test(set.id));

    logger.debug('Filtered out Pocket sets', {
      beforeFilter: transformSetsFromSeries(validSeries).length,
      afterFilter: allSets.length
    });

    // Sort by set ID (which correlates with release order for recent sets)
    // Modern sets: sv10, sv09, sv08 etc - higher = newer
    allSets.sort((a, b) => {
      // Try to sort by release date first if available
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      // Fall back to ID comparison (reverse alphabetical puts newer sets first)
      return b.id.localeCompare(a.id);
    });

    // Paginate the results (TCGDex returns all sets at once)
    const startIndex = (pageNum - 1) * pageSizeNum;
    const sets = allSets.slice(startIndex, startIndex + pageSizeNum);

    logger.debug('TCGDex response transformed', {
      page: pageNum,
      pageSize: pageSizeNum,
      setCount: sets.length,
      totalCount: allSets.length
    });

    const response = {
      data: sets,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        count: sets.length,
        totalCount: allSets.length,
        hasMore: startIndex + pageSizeNum < allSets.length
      },
      meta: {
        responseTime: Date.now() - startTime,
        cached: false,
        source: 'tcgdex'
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

// Export with rate limiting: 30 requests/minute (heavy endpoint - makes 21 parallel API calls)
export default withRateLimit(handler, { ...RateLimitPresets.heavy, keyPrefix: 'tcgexpansions' });
