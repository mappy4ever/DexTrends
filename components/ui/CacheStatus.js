import React, { useState, useEffect } from 'react';
import { pokemonCache, tcgCache } from '../../utils/cacheManager';

// Developer/Admin component to show cache statistics
export const CacheStatus = ({ showDetails = false }) => {
  const [stats, setStats] = useState({
    pokemon: { memoryCache: 0, localStorage: 0, totalSize: '0 KB' },
    tcg: { memoryCache: 0, localStorage: 0, totalSize: '0 KB' }
  });

  const updateStats = () => {
    try {
      setStats({
        pokemon: pokemonCache.getStats(),
        tcg: tcgCache.getStats()
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

  const clearAllCaches = () => {
    if (confirm('Are you sure you want to clear all cached data? This will require fresh API calls.')) {
      pokemonCache.clearAll();
      tcgCache.clearAll();
      updateStats();
    }
  };

  if (!showDetails) {
    // Simple indicator
    const totalCached = stats.pokemon.memoryCache + stats.pokemon.localStorage + 
                       stats.tcg.memoryCache + stats.tcg.localStorage;
    
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
        {/* Pokemon Cache */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-semibold text-blue-800 mb-2">Pokémon Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Memory:</span>
              <span className="font-medium ml-1">{stats.pokemon.memoryCache}</span>
            </div>
            <div>
              <span className="text-gray-600">Storage:</span>
              <span className="font-medium ml-1">{stats.pokemon.localStorage}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium ml-1">{stats.pokemon.totalSize}</span>
            </div>
          </div>
        </div>

        {/* TCG Cache */}
        <div className="bg-purple-50 rounded-lg p-3">
          <h4 className="font-semibold text-purple-800 mb-2">TCG Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Memory:</span>
              <span className="font-medium ml-1">{stats.tcg.memoryCache}</span>
            </div>
            <div>
              <span className="text-gray-600">Storage:</span>
              <span className="font-medium ml-1">{stats.tcg.localStorage}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium ml-1">{stats.tcg.totalSize}</span>
            </div>
          </div>
        </div>

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

// Toast notification for cache hits (dev mode)
export const CacheHitToast = ({ show, type = 'pokemon', onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 2000);
      return () => clearTimeout(timer);
    }
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