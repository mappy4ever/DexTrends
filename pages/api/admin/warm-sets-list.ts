import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { fetchJSON } from '../../../utils/unifiedFetch';
import logger from '../../../utils/logger';
import type { CardSet } from '../../../types/api/cards';

interface WarmSetsListRequest extends NextApiRequest {
  query: {
    token?: string;
    comprehensive?: string;
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
      logger.info('[Warm Sets List] Also fetching comprehensive sets list from TCGDex');

      try {
        // Check if comprehensive list is already cached
        const existingComprehensive = await tcgCache.getComprehensiveSetsList();
        if (existingComprehensive) {
          comprehensiveResults = {
            status: 'already-cached',
            totalSets: (existingComprehensive as { totalCount?: number; sets?: unknown[] }).totalCount || (existingComprehensive as { sets?: unknown[] }).sets?.length || 0
          };
        } else {
          // Fetch ALL sets from TCGDex (no API key required)
          const response = await fetchJSON<Array<{
            id: string;
            name: string;
            logo?: string;
            symbol?: string;
            cardCount?: { total?: number; official?: number };
            releaseDate?: string;
            serie?: { id: string; name: string };
          }>>(
            'https://api.tcgdex.net/v2/en/sets',
            { timeout: 30000, retries: 2 }
          );

          if (Array.isArray(response)) {
            // Transform to our format
            const allSets: CardSet[] = response.map(set => ({
              id: set.id,
              name: set.name,
              series: set.serie?.name || '',
              printedTotal: set.cardCount?.official || 0,
              total: set.cardCount?.total || 0,
              releaseDate: set.releaseDate || '',
              updatedAt: new Date().toISOString(),
              images: {
                symbol: set.symbol || '',
                logo: set.logo || ''
              }
            }));

            // Sort by release date (newest first)
            allSets.sort((a, b) => {
              const dateA = a.releaseDate || '';
              const dateB = b.releaseDate || '';
              return dateB.localeCompare(dateA);
            });

            // Cache the comprehensive list
            await tcgCache.cacheComprehensiveSetsList(allSets);

            comprehensiveResults = {
              status: 'cached',
              totalSets: allSets.length
            };

            logger.info('[Warm Sets List] Cached comprehensive sets list from TCGDex', {
              totalSets: allSets.length
            });
          } else {
            comprehensiveResults = {
              status: 'failed',
              error: 'Invalid response from TCGDex'
            };
          }
        }
      } catch (comprehensiveError: unknown) {
        logger.error('[Warm Sets List] Failed to cache comprehensive sets list:', {
          error: comprehensiveError instanceof Error ? comprehensiveError.message : String(comprehensiveError)
        });
        comprehensiveResults = {
          status: 'failed',
          error: comprehensiveError instanceof Error ? comprehensiveError.message : 'Unknown error'
        };
      }
    }

    const duration = Date.now() - startTime;

    logger.info('[Warm Sets List] Completed sets list cache warming', {
      duration,
      warmingResults,
      comprehensiveResults
    });

    res.status(200).json({
      success: true,
      message: 'Sets list cache warming completed (using TCGDex)',
      duration,
      results: warmingResults,
      comprehensive: comprehensiveResults,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[Warm Sets List] Failed:', { error: errorMessage });

    res.status(500).json({
      error: 'Sets list cache warming failed',
      message: errorMessage
    });
  }
}
