import { cacheWarmer } from './background-cache-warmer';
import logger from '../utils/logger';

/**
 * Initialize cache warming on server startup
 * This should be imported in pages/_app.tsx or server.js
 */
export async function initializeCacheWarming(): Promise<void> {
  // Only run in server environment
  if (typeof window !== 'undefined') {
    return;
  }

  // Skip in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEV_CACHE_WARMING !== 'true') {
    logger.info('[Cache Warming] Skipping in development mode');
    return;
  }

  try {
    logger.info('[Cache Warming] Initializing on server startup');
    await cacheWarmer.initialize();
    logger.info('[Cache Warming] Successfully initialized');
  } catch (error) {
    logger.error('[Cache Warming] Failed to initialize on startup:', error);
  }
}

// Auto-initialize when this module is imported
initializeCacheWarming();