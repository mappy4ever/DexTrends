/**
 * Storage Monitor - Utility for monitoring and managing localStorage usage
 */

export interface StorageInfo {
  totalSize: number;
  usedSize: number;
  percentUsed: number;
  itemCount: number;
  breakdown: {
    pokemonTabs: number;
    cache: number;
    other: number;
  };
}

/**
 * Get the size of a string in bytes
 */
const getByteSize = (str: string): number => {
  return new Blob([str]).size;
};

/**
 * Calculate the total size of localStorage
 */
export const getStorageInfo = (): StorageInfo => {
  if (typeof window === 'undefined') {
    return {
      totalSize: 0,
      usedSize: 0,
      percentUsed: 0,
      itemCount: 0,
      breakdown: { pokemonTabs: 0, cache: 0, other: 0 }
    };
  }

  let totalSize = 0;
  let pokemonTabsSize = 0;
  let cacheSize = 0;
  let otherSize = 0;
  let itemCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = getByteSize(key) + getByteSize(value);
        totalSize += size;
        itemCount++;

        if (key.startsWith('pokemon-tab-')) {
          pokemonTabsSize += size;
        } else if (key.startsWith('dextrends_cache_')) {
          cacheSize += size;
        } else {
          otherSize += size;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating storage size:', error);
  }

  // Estimate max storage (usually 5-10MB, we'll use 5MB as conservative estimate)
  const maxStorage = 5 * 1024 * 1024; // 5MB in bytes
  const percentUsed = (totalSize / maxStorage) * 100;

  return {
    totalSize: maxStorage,
    usedSize: totalSize,
    percentUsed: Math.round(percentUsed * 100) / 100,
    itemCount,
    breakdown: {
      pokemonTabs: pokemonTabsSize,
      cache: cacheSize,
      other: otherSize
    }
  };
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if storage is getting full and warn
 */
export const checkStorageHealth = (): { healthy: boolean; message: string } => {
  const info = getStorageInfo();
  
  if (info.percentUsed > 90) {
    return {
      healthy: false,
      message: `Storage is critically full (${info.percentUsed}%). Consider clearing cache.`
    };
  } else if (info.percentUsed > 75) {
    return {
      healthy: false,
      message: `Storage is getting full (${info.percentUsed}%). Some features may not work properly.`
    };
  }
  
  return {
    healthy: true,
    message: `Storage usage is healthy (${info.percentUsed}%).`
  };
};

/**
 * Clear specific types of storage
 */
export const clearStorageByType = (type: 'cache' | 'pokemonTabs' | 'all'): number => {
  if (typeof window === 'undefined') return 0;
  
  let clearedCount = 0;
  const keysToRemove: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      switch (type) {
        case 'cache':
          if (key.startsWith('dextrends_cache_')) {
            keysToRemove.push(key);
          }
          break;
        case 'pokemonTabs':
          if (key.startsWith('pokemon-tab-')) {
            keysToRemove.push(key);
          }
          break;
        case 'all':
          keysToRemove.push(key);
          break;
      }
    }
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        clearedCount++;
      } catch {
        // Ignore errors
      }
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
  
  return clearedCount;
};

/**
 * Smart cleanup - remove oldest/expired items first
 */
export const smartCleanup = (): number => {
  if (typeof window === 'undefined') return 0;
  
  let clearedCount = 0;
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  try {
    // First, remove expired cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dextrends_cache_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.expiry && now > data.expiry) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    // If we need more space, remove old Pokemon tabs
    if (keysToRemove.length < 10) {
      const tabEntries: { key: string; timestamp: number }[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pokemon-tab-')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const data = JSON.parse(item);
              tabEntries.push({ key, timestamp: data.timestamp || 0 });
            }
          } catch {
            // Old format, mark for removal
            tabEntries.push({ key, timestamp: 0 });
          }
        }
      }
      
      // Sort by timestamp and remove oldest
      tabEntries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(tabEntries.length * 0.3); // Remove oldest 30%
      keysToRemove.push(...tabEntries.slice(0, toRemove).map(e => e.key));
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        clearedCount++;
      } catch {
        // Ignore errors
      }
    });
  } catch (error) {
    console.error('Error during smart cleanup:', error);
  }
  
  return clearedCount;
};