import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';

interface WarmSetsListRequest extends NextApiRequest {
  query: {
    token?: string;
    page?: string;
    pageSize?: string;
  };
}

export default async function handler(req: WarmSetsListRequest, res: NextApiResponse) {
  // Enhanced auth check - accept token via query param or header
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const expectedToken = process.env.CACHE_WARM_TOKEN;
  
  const providedToken = authHeader?.replace('Bearer ', '') || queryToken;
  
  if (expectedToken && providedToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 25;
  const startTime = Date.now();
  
  try {
    logger.info(`[Warm Sets Simple] Warming sets list cache for page ${page}, pageSize ${pageSize}`);
    
    // Check if already cached
    const existing = await tcgCache.getSetsList(page, pageSize);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Sets list already cached',
        page,
        pageSize,
        status: 'already-cached',
        duration: Date.now() - startTime
      });
    }
    
    // Fetch fresh data
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    
    const apiUrl = `https://api.pokemontcg.io/v2/sets?page=${page}&pageSize=${pageSize}&orderBy=-releaseDate`;
    
    logger.info(`[Warm Sets Simple] Fetching from ${apiUrl}`);
    
    const data = await fetchJSON<{ data: any[], count?: number, totalCount?: number }>(apiUrl, { 
      headers,
      timeout: 60000,
      retries: 2
    });
    
    if (!data?.data) {
      throw new Error('Invalid API response');
    }
    
    // Format response like the main API does
    const response = {
      data: data.data,
      pagination: {
        page: page,
        pageSize: pageSize,
        count: data.count || data.data.length,
        totalCount: data.totalCount || data.data.length,
        hasMore: (data.count || data.data.length) === pageSize
      },
      meta: {
        responseTime: Date.now() - startTime,
        cached: false
      }
    };
    
    // Cache the response
    await tcgCache.cacheSetsList(page, pageSize, response);
    
    const duration = Date.now() - startTime;
    
    logger.info(`[Warm Sets Simple] Successfully cached sets list`, {
      page,
      pageSize,
      setCount: data.data.length,
      totalCount: data.totalCount,
      duration
    });
    
    res.status(200).json({
      success: true,
      message: 'Sets list cached successfully',
      page,
      pageSize,
      setCount: data.data.length,
      totalCount: data.totalCount,
      status: 'cached',
      duration
    });
    
  } catch (error: any) {
    logger.error('[Warm Sets Simple] Failed:', error);
    
    res.status(500).json({
      error: 'Sets list cache warming failed',
      message: error.message,
      page,
      pageSize
    });
  }
}