import type { NextApiRequest, NextApiResponse } from 'next';
import { tcgCache } from '../../../lib/tcg-cache';
import { getRedisClient, redisHelpers } from '../../../lib/redis';
import logger from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get TCG cache stats
    const tcgStats = tcgCache.getStats();
    
    // Get Redis connection info
    const redisClient = await getRedisClient();
    let redisInfo = {
      connected: false,
      memoryUsage: 'N/A',
      totalKeys: 0,
      uptimeSeconds: 0,
      cacheHitRate: 'N/A'
    };
    
    if (redisClient) {
      try {
        // Get Redis server info
        const info = await redisClient.info('stats');
        const memory = await redisClient.info('memory');
        const keyCount = await redisClient.dbsize();
        
        // Parse info strings
        const stats = parseRedisInfo(info);
        const memInfo = parseRedisInfo(memory);
        
        redisInfo = {
          connected: true,
          memoryUsage: formatBytes(parseInt(memInfo.used_memory || '0')),
          totalKeys: keyCount,
          uptimeSeconds: parseInt(stats.uptime_in_seconds || '0'),
          cacheHitRate: calculateHitRate(stats)
        };
      } catch (error) {
        logger.error('Failed to get Redis info:', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    // Sample some cache keys for debugging
    let sampleKeys: string[] = [];
    if (redisClient) {
      try {
        // Get a few sample keys
        const keys = await redisClient.keys('tcg:*');
        sampleKeys = keys.slice(0, 10);
      } catch (error) {
        logger.error('Failed to get sample keys:', { error: error instanceof Error ? error.message : String(error) });
      }
    }
    
    // Calculate overall hit rate
    const totalRequests = tcgStats.hits + tcgStats.misses;
    const hitRate = totalRequests > 0 ? ((tcgStats.hits / totalRequests) * 100).toFixed(2) : '0';
    
    res.status(200).json({
      tcgCache: {
        ...tcgStats,
        hitRate: `${hitRate}%`,
        totalRequests
      },
      redis: redisInfo,
      sampleKeys,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    logger.error('Failed to get cache stats:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// Parse Redis INFO command output
function parseRedisInfo(info: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = info.split('\r\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      result[key] = value;
    }
  }
  
  return result;
}

// Calculate cache hit rate from Redis stats
function calculateHitRate(stats: Record<string, string>): string {
  const hits = parseInt(stats.keyspace_hits || '0');
  const misses = parseInt(stats.keyspace_misses || '0');
  const total = hits + misses;
  
  if (total === 0) return 'N/A';
  
  const rate = (hits / total) * 100;
  return `${rate.toFixed(2)}%`;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}