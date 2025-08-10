// Enhanced Background Sync API for PWA
import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../utils/logger';
import cacheManager from '../../utils/UnifiedCacheManager';
import { ErrorResponse } from '@/types/api/api-responses';

interface SyncChanges {
  prices: {
    hasUpdates: boolean;
    lastUpdate?: number;
    updateCount?: number;
    error?: string;
  };
  favorites: {
    hasUpdates: boolean;
    items?: string[];
    lastUpdate?: number | string;
    error?: string;
  };
  collections: {
    hasUpdates: boolean;
    collections?: string[];
    lastUpdate?: number | string;
    error?: string;
  };
  trending: {
    hasUpdates: boolean;
    lastUpdate?: number;
    updateInterval?: number;
    error?: string;
  };
}

interface SyncCheckResponse {
  timestamp: number;
  changes: SyncChanges;
  cacheStatus: Record<string, unknown>;
  networkStatus: string;
  hasChanges: boolean;
  nextSyncRecommended: number;
}

interface SyncRequestResponse {
  success: boolean;
  syncType: string;
  result: Record<string, unknown>;
  timestamp: number;
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncCheckResponse | SyncRequestResponse | ErrorResponse>
) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleSyncCheck(req, res);
      case 'POST':
        return await handleSyncRequest(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Background sync API error:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Check sync status and return what needs to be synced
async function handleSyncCheck(
  req: NextApiRequest,
  res: NextApiResponse<SyncCheckResponse | ErrorResponse>
) {
  const { lastSync, userId } = req.query;
  const lastSyncStr = Array.isArray(lastSync) ? lastSync[0] : lastSync;
  const userIdStr = Array.isArray(userId) ? userId[0] : userId;
  
  try {
    const syncData = {
      timestamp: Date.now(),
      changes: {
        prices: await checkPriceUpdates(lastSyncStr),
        favorites: await checkFavoritesUpdates(userIdStr, lastSyncStr),
        collections: await checkCollectionUpdates(userIdStr, lastSyncStr),
        trending: await checkTrendingUpdates(lastSyncStr)
      },
      cacheStatus: await getCacheStatus(),
      networkStatus: 'online'
    };

    // Return only what has actually changed
    const hasChanges = Object.values(syncData.changes).some(change => 
      change.hasUpdates || ('items' in change && Array.isArray(change.items) && change.items.length > 0)
    );

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({
      ...syncData,
      hasChanges,
      nextSyncRecommended: Date.now() + (5 * 60 * 1000) // 5 minutes
    });
  } catch (error) {
    logger.error('Sync check failed:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: 'Failed to check sync status' });
  }
}

// Handle sync requests from service worker
async function handleSyncRequest(
  req: NextApiRequest,
  res: NextApiResponse<SyncRequestResponse | ErrorResponse>
) {
  const { syncType, data, userId } = req.body;
  
  try {
    let syncResult;

    switch (syncType) {
      case 'price-sync':
        syncResult = await syncPriceData();
        break;
      case 'favorites-sync':
        syncResult = await syncFavorites(userId, data);
        break;
      case 'collection-sync':
        syncResult = await syncCollections(userId, data);
        break;
      case 'full-sync':
        syncResult = await performFullSync(userId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid sync type' });
    }

    return res.status(200).json({
      success: true,
      syncType,
      result: syncResult,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`${syncType} failed:`, { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ 
      error: 'Sync failed',
      syncType,
      message: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Check for price updates since last sync
async function checkPriceUpdates(lastSync: string | undefined) {
  try {
    // This would check your price database for updates
    // For now, we'll simulate this
    const lastSyncTime = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Mock implementation - replace with actual database query
    const hasUpdates = Math.random() > 0.7; // 30% chance of updates
    
    return {
      hasUpdates,
      lastUpdate: hasUpdates ? Date.now() : lastSyncTime.getTime(),
      updateCount: hasUpdates ? Math.floor(Math.random() * 50) + 1 : 0
    };
  } catch (error) {
    logger.error('Price update check failed:', { error: error instanceof Error ? error.message : String(error) });
    return { hasUpdates: false, error: error.message };
  }
}

// Check for favorites updates
async function checkFavoritesUpdates(userId: string | undefined, lastSync: string | undefined) {
  try {
    if (!userId) {
      return { hasUpdates: false };
    }

    // Mock implementation - replace with actual database query
    const hasUpdates = Math.random() > 0.8; // 20% chance of updates
    
    return {
      hasUpdates,
      items: hasUpdates ? ['charizard-base-4', 'pikachu-xy-promo'] : [],
      lastUpdate: hasUpdates ? Date.now() : lastSync
    };
  } catch (error) {
    logger.error('Favorites update check failed:', { error: error instanceof Error ? error.message : String(error) });
    return { hasUpdates: false, error: error.message };
  }
}

// Check for collection updates
async function checkCollectionUpdates(userId: string | undefined, lastSync: string | undefined) {
  try {
    if (!userId) {
      return { hasUpdates: false };
    }

    // Mock implementation - replace with actual database query
    const hasUpdates = Math.random() > 0.9; // 10% chance of updates
    
    return {
      hasUpdates,
      collections: hasUpdates ? ['base-set', 'neo-genesis'] : [],
      lastUpdate: hasUpdates ? Date.now() : lastSync
    };
  } catch (error) {
    logger.error('Collection update check failed:', { error: error instanceof Error ? error.message : String(error) });
    return { hasUpdates: false, error: error.message };
  }
}

// Check for trending updates
async function checkTrendingUpdates(lastSync: string | undefined) {
  try {
    // Trending data updates more frequently
    const lastSyncTime = lastSync ? new Date(lastSync) : new Date(Date.now() - 60 * 60 * 1000); // 1 hour
    const timeSinceLastSync = Date.now() - lastSyncTime.getTime();
    
    // Update trending if it's been more than 15 minutes
    const hasUpdates = timeSinceLastSync > 15 * 60 * 1000;
    
    return {
      hasUpdates,
      lastUpdate: hasUpdates ? Date.now() : lastSyncTime.getTime(),
      updateInterval: 15 * 60 * 1000 // 15 minutes
    };
  } catch (error) {
    logger.error('Trending update check failed:', { error: error instanceof Error ? error.message : String(error) });
    return { hasUpdates: false, error: error.message };
  }
}

// Get cache status
async function getCacheStatus() {
  try {
    const stats = await cacheManager.getStats() as { memory?: { size: number }, localStorage?: { size: number }, database?: { size: number }, overall?: { hitRate: number } };
    return {
      size: `${((stats.memory?.size || 0) + (stats.localStorage?.size || 0)) * 0.001}MB`, // Rough estimate
      entries: (stats.memory?.size || 0) + (stats.localStorage?.size || 0) + (stats.database?.size || 0),
      lastCleanup: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      hitRate: stats.overall?.hitRate || 0
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Sync price data
async function syncPriceData() {
  try {
    // Mock implementation - replace with actual price collection logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async work
    
    return {
      pricesUpdated: Math.floor(Math.random() * 100) + 50,
      newPrices: Math.floor(Math.random() * 20) + 5,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error('Price sync failed: ' + error.message);
  }
}

// Sync favorites
async function syncFavorites(userId: string | undefined, data: { favorites?: string[] }) {
  try {
    if (!userId) {
      throw new Error('User ID required for favorites sync');
    }

    // Mock implementation - replace with actual database operations
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      favoritesUpdated: data?.favorites?.length || 0,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error('Favorites sync failed: ' + error.message);
  }
}

// Sync collections
async function syncCollections(userId: string | undefined, data: { collections?: string[], cards?: string[] }) {
  try {
    if (!userId) {
      throw new Error('User ID required for collections sync');
    }

    // Mock implementation - replace with actual database operations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      collectionsUpdated: data?.collections?.length || 0,
      cardsUpdated: data?.cards?.length || 0,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error('Collections sync failed: ' + error.message);
  }
}

// Perform full sync
async function performFullSync(userId: string | undefined) {
  try {
    const results = await Promise.allSettled([
      syncPriceData(),
      syncFavorites(userId, {}),
      syncCollections(userId, {}),
    ]);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason),
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error('Full sync failed: ' + error.message);
  }
}