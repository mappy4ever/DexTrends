import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchJSON } from '../../utils/unifiedFetch';
import logger from '../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  try {
    const { page = '1', pageSize = '30' } = req.query;
    const pageNum = parseInt(Array.isArray(page) ? page[0] : page, 10);
    const pageSizeNum = Math.min(parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize, 10), 50); // Max 50 per page
    
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    // Use pagination parameters for the Pokemon TCG API
    const apiUrl = `https://api.pokemontcg.io/v2/sets?page=${pageNum}&pageSize=${pageSizeNum}`;
    logger.debug('Fetching TCG sets from API', { url: apiUrl, page: pageNum, pageSize: pageSizeNum });
    
    const data = await fetchJSON<{ data: any[], page?: number, pageSize?: number, count?: number, totalCount?: number }>(apiUrl, { 
      headers,
      useCache: true,
      cacheTime: 6 * 60 * 60 * 1000, // Cache for 6 hours (sets don't change often)
      timeout: 20000, // Reduced timeout for better UX
      retries: 2
    });
    
    const sets = data?.data || [];
    logger.debug('TCG API response received', { 
      page: pageNum, 
      pageSize: pageSizeNum,
      setCount: sets.length,
      totalCount: data?.totalCount 
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
      stack: error.stack 
    });
    res.status(500).json({ 
      error: 'Failed to fetch TCG sets',
      message: error.message 
    });
  }
}