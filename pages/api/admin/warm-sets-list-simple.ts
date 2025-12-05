import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { TCGApiResponse, TCGSetListApiResponse } from '../../../types/api/enhanced-responses';
import type { AnyObject } from '../../../types/common';

interface TCGSet {
  id: string;
  name: string;
  releaseDate?: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  legalities?: AnyObject;
  ptcgoCode?: string;
  updatedAt?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
  [key: string]: unknown;
}

interface SetsListResponse {
  data: TCGSet[];
  count?: number;
  totalCount?: number;
}

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
    
    // Fetch fresh data from TCGDex (no API key required)
    const apiUrl = `https://api.tcgdex.net/v2/en/sets`;

    logger.info(`[Warm Sets Simple] Fetching from TCGDex: ${apiUrl}`);

    const tcgdexSets = await fetchJSON<Array<{ id: string; name: string; logo?: string; symbol?: string }>>(apiUrl, {
      timeout: 60000,
      retries: 2
    });

    if (!tcgdexSets || !Array.isArray(tcgdexSets)) {
      throw new Error('Invalid API response from TCGDex');
    }

    // TCGDex returns all sets, so we paginate client-side
    const startIndex = (page - 1) * pageSize;
    const paginatedSets = tcgdexSets.slice(startIndex, startIndex + pageSize);

    // Transform TCGDex format to match expected format
    const data = {
      data: paginatedSets.map(set => ({
        id: set.id,
        name: set.name,
        images: {
          symbol: set.symbol || '',
          logo: set.logo || ''
        }
      })),
      count: paginatedSets.length,
      totalCount: tcgdexSets.length
    };
    
    // Format response like the main API does
    // Add updatedAt field to each set to match CardSet interface
    const processedData = data.data.map(set => ({
      ...set,
      updatedAt: new Date().toISOString()
    }));
    
    const response = {
      data: processedData,
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
    
    // Cache the response (cast as compatible)
    await tcgCache.cacheSetsList(page, pageSize, response as TCGSetListApiResponse);
    
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Warm Sets Simple] Failed:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Sets list cache warming failed',
      message: errorMessage,
      page,
      pageSize
    });
  }
}