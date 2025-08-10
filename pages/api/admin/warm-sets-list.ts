import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { UnknownError } from '../../../types/common';
import type { TCGApiResponse } from '../../../types/api/enhanced-responses';

interface WarmSetsListRequest extends NextApiRequest {
  query: {
    token?: string;
    comprehensive?: string; // Also fetch all sets for comprehensive cache
  };
}

export default async function handler(req: WarmSetsListRequest, res: NextApiResponse) {
  // Enhanced auth check - accept token via query param or header
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const expectedToken = process.env.CACHE_WARM_TOKEN;
  
  const providedToken = authHeader?.replace('Bearer ', '') || queryToken;
  
  if (expectedToken && providedToken !== expectedToken) {
    logger.warn('[Warm Sets List] Unauthorized access attempt', { 
      providedToken: providedToken ? 'provided' : 'missing',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const startTime = Date.now();
  const comprehensive = req.query.comprehensive === 'true';
  
  try {
    logger.info('[Warm Sets List] Starting sets list cache warming', { comprehensive });
    
    // Warm common page combinations
    const warmingResults = await tcgCache.warmSetsListCache();
    
    let comprehensiveResults = null;
    
    // Optionally warm comprehensive sets list (all sets)
    if (comprehensive) {
      logger.info('[Warm Sets List] Also fetching comprehensive sets list');
      
      try {
        // Check if comprehensive list is already cached
        const existingComprehensive = await tcgCache.getComprehensiveSetsList();
        if (existingComprehensive) {
          comprehensiveResults = {
            status: 'already-cached',
            totalSets: (existingComprehensive as { totalCount?: number; sets?: unknown[] }).totalCount || (existingComprehensive as { sets?: unknown[] }).sets?.length || 0
          };
        } else {
          // Fetch ALL sets using the existing logic from warm-cache.ts
          const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (apiKey) {
            headers['X-Api-Key'] = apiKey;
          }

          // First, get total count
          const countResponse = await fetchJSON<TCGApiResponse<never> & { totalCount: number }>(
            `https://api.pokemontcg.io/v2/sets?pageSize=1`,
            { headers, timeout: 30000, retries: 2 }
          );

          const totalSets = countResponse?.totalCount || 200;
          
          // Fetch all sets in batches
          const allSets: unknown[] = [];
          const pageSize = 250;
          const totalPages = Math.ceil(totalSets / pageSize);

          for (let page = 1; page <= totalPages; page++) {
            const response = await fetchJSON<TCGApiResponse<unknown[]>>(
              `https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&page=${page}&pageSize=${pageSize}`,
              { headers, timeout: 30000, retries: 2 }
            );

            if (response?.data) {
              allSets.push(...response.data);
            }

            // Small delay between requests
            if (page < totalPages) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          // Cache comprehensive list
          await tcgCache.cacheComprehensiveSetsList(allSets);
          
          comprehensiveResults = {
            status: 'cached',
            totalSets: allSets.length
          };
        }
      } catch (error) {
        logger.error('[Warm Sets List] Failed to cache comprehensive sets list:', { error: error instanceof Error ? error.message : String(error) });
        comprehensiveResults = {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    const duration = Date.now() - startTime;
    
    const results = {
      success: true,
      message: 'Sets list cache warming completed',
      duration,
      paginatedCaching: warmingResults,
      comprehensiveCaching: comprehensiveResults,
      timestamp: new Date().toISOString()
    };
    
    logger.info('[Warm Sets List] Cache warming completed', results);
    
    res.status(200).json(results);
    
  } catch (error) {
    logger.error('[Warm Sets List] Failed:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Sets list cache warming failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}