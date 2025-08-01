import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheWarmer } from '../../../lib/background-cache-warmer';
import logger from '../../../utils/logger';

interface StartupWarmingRequest extends NextApiRequest {
  query: {
    token?: string;
  };
}

export default async function handler(req: StartupWarmingRequest, res: NextApiResponse) {
  // Enhanced auth check
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const expectedToken = process.env.CACHE_WARM_TOKEN;
  
  const providedToken = authHeader?.replace('Bearer ', '') || queryToken;
  
  if (expectedToken && providedToken !== expectedToken) {
    logger.warn('[Startup Warming] Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    logger.info('[Startup Warming] Manual startup warming triggered');
    
    // Get current status
    const statusBefore = cacheWarmer.getStatus();
    
    // Initialize the warmer if not already running
    if (!statusBefore.isRunning) {
      await cacheWarmer.initialize();
    }
    
    // Get status after initialization
    const statusAfter = cacheWarmer.getStatus();
    
    const result = {
      success: true,
      message: 'Startup warming initiated',
      statusBefore,
      statusAfter,
      timestamp: new Date().toISOString()
    };
    
    logger.info('[Startup Warming] Warming initiated', result);
    
    res.status(200).json(result);
    
  } catch (error: any) {
    logger.error('[Startup Warming] Failed:', error);
    
    res.status(500).json({
      error: 'Startup warming failed',
      message: error.message
    });
  }
}