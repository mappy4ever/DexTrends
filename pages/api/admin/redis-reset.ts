import type { NextApiRequest, NextApiResponse } from 'next';
import { disconnectRedis, isRedisHealthy } from '../../../lib/redis';
import logger from '../../../utils/logger';
import { validateAdminAuth } from '../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security: Only accept Bearer token from Authorization header
  if (!validateAdminAuth(req, res, 'Redis Reset')) {
    return; // Response already sent by validateAdminAuth
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
    
  } catch (error: unknown) {
    logger.error('[Redis Reset] Failed:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Redis reset failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}