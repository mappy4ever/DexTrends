import logger from './logger';

/**
 * Safe wrapper for browser storage (localStorage/sessionStorage)
 * Handles QuotaExceededError and provides fallback behavior
 */

class SafeStorage {
  private storage: Storage | null = null;
  private memoryFallback: Map<string, string> = new Map();
  private storageType: 'localStorage' | 'sessionStorage';

  constructor(storageType: 'localStorage' | 'sessionStorage') {
    this.storageType = storageType;
    
    // Check if storage is available
    if (typeof window !== 'undefined') {
      try {
        this.storage = window[storageType];
        // Test if storage is actually writable
        const testKey = '__storage_test__';
        this.storage.setItem(testKey, 'test');
        this.storage.removeItem(testKey);
      } catch (e) {
        logger.warn(`${storageType} is not available, using memory fallback`, { error: e });
        this.storage = null;
      }
    }
  }

  /**
   * Clear old items if storage is getting full
   * Removes items older than specified age (in milliseconds)
   */
  private clearOldItems(maxAge: number = 24 * 60 * 60 * 1000): void {
    if (!this.storage) return;
    
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      // Find old items
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (!key) continue;
        
        // Skip non-data keys
        if (!key.startsWith('card-') && !key.startsWith('set-') && !key.startsWith('cache-')) {
          continue;
        }
        
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            // Check if item has timestamp and is old
            if (data._timestamp && (now - data._timestamp) > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // If we can't parse it, it's probably old format, remove it
          keysToRemove.push(key);
        }
      }
      
      // Remove old items
      keysToRemove.forEach(key => {
        this.storage?.removeItem(key);
        logger.debug('Removed old storage item', { key });
      });
      
      if (keysToRemove.length > 0) {
        logger.info('Cleared old storage items', { count: keysToRemove.length });
      }
    } catch (error) {
      logger.error('Error clearing old storage items', { error });
    }
  }

  /**
   * Get storage size in bytes
   */
  private getStorageSize(): number {
    if (!this.storage) return 0;
    
    let size = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        const value = this.storage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
    return size;
  }

  /**
   * Set item with automatic cleanup on quota exceeded
   */
  setItem(key: string, value: any): boolean {
    const stringValue = typeof value === 'string' ? value : JSON.stringify({
      ...value,
      _timestamp: Date.now()
    });
    
    // Try to use actual storage
    if (this.storage) {
      try {
        this.storage.setItem(key, stringValue);
        return true;
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          logger.warn('Storage quota exceeded, attempting cleanup', {
            storageType: this.storageType,
            currentSize: this.getStorageSize()
          });
          
          // Try to clear old items
          this.clearOldItems();
          
          // Try again after cleanup
          try {
            this.storage.setItem(key, stringValue);
            logger.info('Successfully stored after cleanup');
            return true;
          } catch (retryError) {
            // If still failing, clear more aggressively
            logger.warn('Still failing after cleanup, clearing all cache items');
            this.clearAllCacheItems();
            
            // Final attempt
            try {
              this.storage.setItem(key, stringValue);
              return true;
            } catch (finalError) {
              logger.error('Cannot store even after aggressive cleanup', { 
                key, 
                valueSize: stringValue.length,
                error: finalError 
              });
            }
          }
        } else {
          logger.error('Storage error', { error: e });
        }
      }
    }
    
    // Fallback to memory storage
    this.memoryFallback.set(key, stringValue);
    logger.debug('Using memory fallback for storage', { key });
    return false;
  }

  /**
   * Get item from storage
   */
  getItem(key: string): any {
    // Try actual storage first
    if (this.storage) {
      try {
        const value = this.storage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            // Remove timestamp before returning
            if (parsed._timestamp) {
              delete parsed._timestamp;
            }
            return parsed;
          } catch {
            // Return as string if not JSON
            return value;
          }
        }
      } catch (e) {
        logger.error('Error reading from storage', { key, error: e });
      }
    }
    
    // Fallback to memory storage
    const memValue = this.memoryFallback.get(key);
    if (memValue) {
      try {
        const parsed = JSON.parse(memValue);
        if (parsed._timestamp) {
          delete parsed._timestamp;
        }
        return parsed;
      } catch {
        return memValue;
      }
    }
    
    return null;
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    if (this.storage) {
      try {
        this.storage.removeItem(key);
      } catch (e) {
        logger.error('Error removing from storage', { key, error: e });
      }
    }
    this.memoryFallback.delete(key);
  }

  /**
   * Clear all cache items (preserve user preferences)
   */
  clearAllCacheItems(): void {
    if (!this.storage) return;
    
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (!key) continue;
      
      // Only remove cache-related items, preserve user settings
      if (key.startsWith('card-') || 
          key.startsWith('set-') || 
          key.startsWith('cache-') ||
          key.startsWith('temp-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      this.storage?.removeItem(key);
    });
    
    logger.info('Cleared all cache items', { count: keysToRemove.length });
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    const keys: string[] = [];
    
    if (this.storage) {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) keys.push(key);
      }
    }
    
    // Add memory fallback keys
    this.memoryFallback.forEach((_, key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    
    return keys;
  }

  /**
   * Clear all storage
   */
  clear(): void {
    if (this.storage) {
      try {
        this.storage.clear();
      } catch (e) {
        logger.error('Error clearing storage', { error: e });
      }
    }
    this.memoryFallback.clear();
  }
}

// Export singleton instances
export const safeLocalStorage = new SafeStorage('localStorage');
export const safeSessionStorage = new SafeStorage('sessionStorage');

// Default export for convenience
export default {
  local: safeLocalStorage,
  session: safeSessionStorage
};