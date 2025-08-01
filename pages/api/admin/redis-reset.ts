import type { NextApiRequest, NextApiResponse } from 'next';
import { disconnectRedis, isRedisHealthy } from '../../../lib/redis';
import logger from '../../../utils/logger';

interface RedisResetRequest extends NextApiRequest {
  query: {
    token?: string;
  };
}

export default async function handler(req: RedisResetRequest, res: NextApiResponse) {
  // Enhanced auth check
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const expectedToken = process.env.CACHE_WARM_TOKEN;
  
  const providedToken = authHeader?.replace('Bearer ', '') || queryToken;
  
  if (expectedToken && providedToken !== expectedToken) {
    logger.warn('[Redis Reset] Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    logger.info('[Redis Reset] Starting Redis connection reset');
    
    // Check current health
    const healthBefore = await isRedisHealthy();
    
    // Disconnect existing connection
    await disconnectRedis();
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check health after reset (will create new connection)
    const healthAfter = await isRedisHealthy();
    
    const result = {
      success: true,
      message: 'Redis connection reset completed',
      healthBefore,
      healthAfter,
      timestamp: new Date().toISOString()
    };
    
    logger.info('[Redis Reset] Reset completed', result);
    
    res.status(200).json(result);
    
  } catch (error: any) {
    logger.error('[Redis Reset] Failed:', error);
    
    res.status(500).json({
      error: 'Redis reset failed',
      message: error.message
    });
  }
}