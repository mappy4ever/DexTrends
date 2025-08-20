import logger from './logger';

// Types for data persistence
export interface PersistenceOptions {
  storage?: 'localStorage' | 'sessionStorage' | 'indexedDB';
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface StoredData<T = any> {
  data: T;
  timestamp: number;
  version?: string;
  metadata?: Record<string, any>;
}

class DataManager {
  private version = '1.0.0';
  private dbName = 'DexTrendsDB';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
  }

  // Initialize IndexedDB
  private async initIndexedDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      logger.warn('IndexedDB not supported');
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => {
        logger.error('Failed to open IndexedDB', { error: request.error });
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('IndexedDB initialized successfully');
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    } catch (error) {
      logger.error('Failed to initialize IndexedDB', { error });
    }
  }

  // Save data with options
  async save<T>(
    key: string,
    data: T,
    options: PersistenceOptions = {}
  ): Promise<boolean> {
    const {
      storage = 'localStorage',
      encrypt = false,
      compress = false,
      ttl,
    } = options;

    try {
      const storedData: StoredData<T> = {
        data,
        timestamp: Date.now(),
        version: this.version,
        metadata: { ttl },
      };

      let serializedData = JSON.stringify(storedData);

      // Compress if needed
      if (compress) {
        serializedData = this.compress(serializedData);
      }

      // Encrypt if needed
      if (encrypt) {
        serializedData = await this.encrypt(serializedData);
      }

      switch (storage) {
        case 'localStorage':
          localStorage.setItem(key, serializedData);
          break;
          
        case 'sessionStorage':
          sessionStorage.setItem(key, serializedData);
          break;
          
        case 'indexedDB':
          await this.saveToIndexedDB('userData', { id: key, ...storedData });
          break;
          
        default:
          throw new Error(`Unsupported storage type: ${storage}`);
      }

      logger.debug('Data saved successfully', { key, storage });
      return true;
    } catch (error) {
      logger.error('Failed to save data', { error, key, storage });
      return false;
    }
  }

  // Load data with options
  async load<T>(
    key: string,
    options: PersistenceOptions = {}
  ): Promise<T | null> {
    const {
      storage = 'localStorage',
      encrypt = false,
      compress = false,
    } = options;

    try {
      let serializedData: string | null = null;

      switch (storage) {
        case 'localStorage':
          serializedData = localStorage.getItem(key);
          break;
          
        case 'sessionStorage':
          serializedData = sessionStorage.getItem(key);
          break;
          
        case 'indexedDB':
          const idbData = await this.loadFromIndexedDB('userData', key);
          if (idbData) {
            serializedData = JSON.stringify(idbData);
          }
          break;
          
        default:
          throw new Error(`Unsupported storage type: ${storage}`);
      }

      if (!serializedData) {
        return null;
      }

      // Decrypt if needed
      if (encrypt) {
        serializedData = await this.decrypt(serializedData);
      }

      // Decompress if needed
      if (compress) {
        serializedData = this.decompress(serializedData);
      }

      const storedData: StoredData<T> = JSON.parse(serializedData);

      // Check TTL
      if (storedData.metadata?.ttl) {
        const elapsed = Date.now() - storedData.timestamp;
        if (elapsed > storedData.metadata.ttl) {
          logger.debug('Data expired', { key, elapsed, ttl: storedData.metadata.ttl });
          await this.remove(key, { storage });
          return null;
        }
      }

      return storedData.data;
    } catch (error) {
      logger.error('Failed to load data', { error, key, storage });
      return null;
    }
  }

  // Remove data
  async remove(
    key: string,
    options: { storage?: 'localStorage' | 'sessionStorage' | 'indexedDB' } = {}
  ): Promise<boolean> {
    const { storage = 'localStorage' } = options;

    try {
      switch (storage) {
        case 'localStorage':
          localStorage.removeItem(key);
          break;
          
        case 'sessionStorage':
          sessionStorage.removeItem(key);
          break;
          
        case 'indexedDB':
          await this.removeFromIndexedDB('userData', key);
          break;
      }

      logger.debug('Data removed successfully', { key, storage });
      return true;
    } catch (error) {
      logger.error('Failed to remove data', { error, key, storage });
      return false;
    }
  }

  // Clear all data
  async clear(
    options: { storage?: 'localStorage' | 'sessionStorage' | 'indexedDB' } = {}
  ): Promise<boolean> {
    const { storage = 'localStorage' } = options;

    try {
      switch (storage) {
        case 'localStorage':
          localStorage.clear();
          break;
          
        case 'sessionStorage':
          sessionStorage.clear();
          break;
          
        case 'indexedDB':
          await this.clearIndexedDB();
          break;
      }

      logger.info('Storage cleared successfully', { storage });
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', { error, storage });
      return false;
    }
  }

  // IndexedDB operations
  private async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async loadFromIndexedDB(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async removeFromIndexedDB(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const storeNames = Array.from(this.db.objectStoreNames);
      const transaction = this.db.transaction(storeNames, 'readwrite');
      
      storeNames.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Compression (simple base64 for now, could use pako for real compression)
  private compress(data: string): string {
    return btoa(data);
  }

  private decompress(data: string): string {
    return atob(data);
  }

  // Encryption (simple base64 for now, should use Web Crypto API for real encryption)
  private async encrypt(data: string): Promise<string> {
    // In production, use Web Crypto API
    return btoa(encodeURIComponent(data));
  }

  private async decrypt(data: string): Promise<string> {
    // In production, use Web Crypto API
    return decodeURIComponent(atob(data));
  }

  // Specific data persistence methods
  async saveUserPreferences(preferences: Record<string, any>): Promise<boolean> {
    return this.save('userPreferences', preferences, {
      storage: 'localStorage',
      compress: true,
    });
  }

  async loadUserPreferences(): Promise<Record<string, any> | null> {
    return this.load('userPreferences', {
      storage: 'localStorage',
      compress: true,
    });
  }

  async saveCollection(collectionId: string, data: any[]): Promise<boolean> {
    return this.save(`collection_${collectionId}`, data, {
      storage: 'indexedDB',
      compress: true,
    });
  }

  async loadCollection(collectionId: string): Promise<any[] | null> {
    return this.load(`collection_${collectionId}`, {
      storage: 'indexedDB',
      compress: true,
    });
  }

  async saveFavorites(favorites: any[]): Promise<boolean> {
    return this.save('favorites', favorites, {
      storage: 'localStorage',
      compress: true,
    });
  }

  async loadFavorites(): Promise<any[] | null> {
    return this.load('favorites', {
      storage: 'localStorage',
      compress: true,
    });
  }

  async saveSearchHistory(searches: string[]): Promise<boolean> {
    return this.save('searchHistory', searches, {
      storage: 'localStorage',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async loadSearchHistory(): Promise<string[] | null> {
    return this.load('searchHistory', {
      storage: 'localStorage',
    });
  }

  async saveViewSettings(settings: Record<string, any>): Promise<boolean> {
    return this.save('viewSettings', settings, {
      storage: 'localStorage',
    });
  }

  async loadViewSettings(): Promise<Record<string, any> | null> {
    return this.load('viewSettings', {
      storage: 'localStorage',
    });
  }
}

// Export singleton instance
export const dataManager = new DataManager();
export default dataManager;