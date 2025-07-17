import React, { useState, useEffect } from 'react';
import cacheManager from '../../utils/UnifiedCacheManager';
import type { CacheStats } from '../../types/utils/cache';

interface CacheStatusProps {
  showDetails?: boolean;
}

interface ExtendedCacheStats {
  memory?: Partial<CacheStats> & { sizeKB?: string };
  localStorage?: Partial<CacheStats> & { sizeKB?: string };
  database?: Partial<CacheStats> & { active?: number };
  overall?: Partial<CacheStats>;
}

// Developer/Admin component to show cache statistics
export const CacheStatus: React.FC<CacheStatusProps> = ({ showDetails = false }) => {
  const [stats, setStats] = useState<ExtendedCacheStats>({
    memory: {},
    localStorage: {},
    database: {},
    overall: {}
  });

  const updateStats = async (): Promise<void> => {
    try {
      const cacheStats = await cacheManager.getStats();
      // For now, we'll just use the overall stats
      // In a real implementation, you'd need to extend the cache manager
      // to provide per-tier statistics
      setStats({
        memory: { size: cacheStats.entries, hitRate: cacheStats.hitRate },
        localStorage: { size: 0, sizeKB: '0' },
        database: { size: 0, active: 0 },
        overall: cacheStats
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const clearAllCaches = async (): Promise<void> => {
    if (confirm('Are you sure you want to clear all cached data? This will require fresh API calls.')) {
      await cacheManager.clear();
      updateStats();
    }
  };

  if (!showDetails) {
    // Simple indicator
    const totalCached = 
      (stats.memory?.size || 0) + 
      (stats.localStorage?.size || 0) + 
      (stats.database?.size || 0);
    
    if (totalCached === 0) return null;
    
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
        📊 {totalCached} cached
      </div>
    );
  }

  // Detailed view
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Cache Status</h3>
        <button
          onClick={updateStats}
          className="text-blue-600 hover:text-blue-800 text-sm"
          title="Refresh stats"
        >
          🔄
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Memory Cache */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">Memory Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Items:</span>
              <span className="font-medium ml-1">{stats.memory?.size || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Hit Rate:</span>
              <span className="font-medium ml-1">{(stats.memory?.hitRate || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* LocalStorage Cache */}
        <div className="bg-purple-50 rounded-lg p-3">
          <h4 className="font-semibold text-purple-800 mb-2">LocalStorage Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Items:</span>
              <span className="font-medium ml-1">{stats.localStorage?.size || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>
              <span className="font-medium ml-1">{stats.localStorage?.sizeKB || '0'} KB</span>
            </div>
          </div>
        </div>

        {/* Database Cache */}
        {(stats.database?.size ?? 0) > 0 && (
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="font-semibold text-green-800 mb-2">Database Cache</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Items:</span>
                <span className="font-medium ml-1">{stats.database?.size || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Active:</span>
                <span className="font-medium ml-1">{stats.database?.active || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Cache Benefits */}
        <div className="bg-green-50 rounded-lg p-3">
          <h4 className="font-semibold text-green-800 mb-2">Benefits</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Faster loading times</li>
            <li>• Reduced API calls</li>
            <li>• Works offline (cached data)</li>
            <li>• Saves API quota</li>
          </ul>
        </div>

        {/* Clear Cache Button */}
        <button
          onClick={clearAllCaches}
          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Clear All Caches
        </button>
      </div>
    </div>
  );
};

interface CacheHitToastProps {
  show: boolean;
  type?: string;
  onHide: () => void;
}

// Toast notification for cache hits (dev mode)
export const CacheHitToast: React.FC<CacheHitToastProps> = ({ show, type = 'pokemon', onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span className="font-medium">Cache Hit!</span>
        <span className="text-sm opacity-90">({type})</span>
      </div>
    </div>
  );
};

export default CacheStatus;