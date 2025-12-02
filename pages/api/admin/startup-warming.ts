import type { NextApiRequest, NextApiResponse } from 'next';
import { cacheWarmer } from '../../../lib/background-cache-warmer';
import logger from '../../../utils/logger';
import { validateAdminAuth } from '../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security: Only accept Bearer token from Authorization header
  if (!validateAdminAuth(req, res, 'Startup Warming')) {
    return; // Response already sent by validateAdminAuth
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
    
  } catch (error: unknown) {
    logger.error('[Startup Warming] Failed:', { error: error instanceof Error ? error.message : String(error) });
    
    res.status(500).json({
      error: 'Startup warming failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}