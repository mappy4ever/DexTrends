import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { redisHelpers } from '../../../lib/redis';
import { cacheWarmer } from '../../../lib/background-cache-warmer';
import logger from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get cache statistics
    const stats = tcgCache.getStats();
    
    // Try to get Redis info if available
    let redisInfo = null;
    try {
      // Get some sample cache keys to check what's cached
      const sampleKeys = [
        'tcg:set:cards:sv8:complete',
        'tcg:set:cards:sv7:complete',
        'tcg:sets:list:1:25',
        'tcg:card:sv8-1',
        'tcg:images:sv8-1',
        'tcg:prices:sv8-1',
        'tcg:market:trends',
      ];
      
      const cachedSamples = await Promise.all(
        sampleKeys.map(async (key) => {
          const exists = await redisHelpers.exists(key);
          const ttl = exists ? await redisHelpers.ttl(key) : -1;
          return { key, exists, ttl };
        })
      );

      redisInfo = {
        samples: cachedSamples,
        totalSamples: cachedSamples.filter(s => s.exists).length
      };
    } catch (error) {
      logger.error('Error getting Redis info:', error);
    }

    // Get background warmer status
    const warmerStatus = cacheWarmer.getStatus();

    res.status(200).json({
      status: 'active',
      cache: {
        stats,
        redis: redisInfo,
        performance: {
          hitRate: stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%' : '0%',
          totalRequests: stats.hits + stats.misses,
          errorRate: stats.errors > 0 ? (stats.errors / (stats.hits + stats.misses + stats.errors) * 100).toFixed(2) + '%' : '0%'
        }
      },
      backgroundWarmer: {
        isRunning: warmerStatus.isRunning,
        startupWarmed: warmerStatus.startupWarmed,
        warmedSetsCount: warmerStatus.warmedSets.length,
        warmedSets: warmerStatus.warmedSets
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Error getting cache status:', error);
    res.status(500).json({
      error: 'Failed to get cache status',
      message: error.message
    });
  }
}