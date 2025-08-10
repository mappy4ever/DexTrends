// Cache Manager type definitions

// Cache entry
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  expiry?: number;
  size?: number;
  hits?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Cache options
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
  maxEntries?: number; // Maximum number of entries
  strategy?: CacheStrategy;
  persistence?: CachePersistence;
  compression?: boolean;
  encryption?: boolean;
}

// Cache strategies
export type CacheStrategy = 'lru' | 'lfu' | 'fifo' | 'lifo' | 'ttl';

// Cache persistence options
export interface CachePersistence {
  enabled: boolean;
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'database';
  key?: string;
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

// Cache statistics
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  entries: number;
  evictions: number;
  avgAccessTime: number;
  lastReset: number;
}

// Cache layers
export interface CacheLayer {
  name: string;
  priority: number;
  options: CacheOptions;
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, options?: CacheSetOptions) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
  size: () => Promise<number>;
}

// Multi-tier cache configuration
export interface MultiTierCacheConfig {
  layers: CacheLayer[];
  fallbackBehavior?: 'next' | 'all' | 'none';
  writeThrough?: boolean;
  readThrough?: boolean;
  invalidationStrategy?: 'cascade' | 'selective' | 'none';
}

// Cache set options
export interface CacheSetOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  compress?: boolean;
  encrypt?: boolean;
  metadata?: Record<string, unknown>;
}

// Cache get options
export interface CacheGetOptions {
  refresh?: boolean;
  includeMetadata?: boolean;
  decompress?: boolean;
  decrypt?: boolean;
}

// Cache invalidation options
export interface CacheInvalidationOptions {
  pattern?: string | RegExp;
  tags?: string[];
  olderThan?: number;
  newerThan?: number;
  cascade?: boolean;
}

// Cache manager interface
export interface CacheManager {
  // Basic operations
  get: <T>(key: string, options?: CacheGetOptions) => Promise<T | null>;
  set: <T>(key: string, value: T, options?: CacheSetOptions) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  clear: () => Promise<void>;
  has: (key: string) => Promise<boolean>;
  
  // Bulk operations
  getMany: <T>(keys: string[]) => Promise<Map<string, T>>;
  setMany: <T>(entries: Map<string, T>, options?: CacheSetOptions) => Promise<void>;
  deleteMany: (keys: string[]) => Promise<number>;
  
  // Advanced operations
  invalidate: (options: CacheInvalidationOptions) => Promise<number>;
  refresh: (key: string) => Promise<void>;
  touch: (key: string) => Promise<void>;
  expire: (key: string, ttl: number) => Promise<void>;
  
  // Tag operations
  getByTag: <T>(tag: string) => Promise<Map<string, T>>;
  deleteByTag: (tag: string) => Promise<number>;
  addTag: (key: string, tag: string) => Promise<void>;
  removeTag: (key: string, tag: string) => Promise<void>;
  
  // Statistics and monitoring
  getStats: () => CacheStats;
  resetStats: () => void;
  getSize: () => Promise<number>;
  getKeys: (pattern?: string | RegExp) => Promise<string[]>;
  
  // Configuration
  configure: (options: Partial<CacheOptions>) => void;
  getConfig: () => CacheOptions;
}

// Unified cache manager specific types
export interface UnifiedCacheManager extends CacheManager {
  // Layer management
  addLayer: (layer: CacheLayer) => void;
  removeLayer: (name: string) => void;
  getLayer: (name: string) => CacheLayer | undefined;
  getLayers: () => CacheLayer[];
  
  // Data migration
  migrate: (fromLayer: string, toLayer: string, filter?: (key: string) => boolean) => Promise<number>;
  
  // Synchronization
  sync: () => Promise<void>;
  syncLayer: (name: string) => Promise<void>;
  
  // Events
  on: (event: CacheEvent, handler: CacheEventHandler) => void;
  off: (event: CacheEvent, handler: CacheEventHandler) => void;
  once: (event: CacheEvent, handler: CacheEventHandler) => void;
}

// Cache events
export type CacheEvent = 
  | 'hit'
  | 'miss'
  | 'set'
  | 'delete'
  | 'clear'
  | 'evict'
  | 'expire'
  | 'error'
  | 'sync';

export type CacheEventHandler = (data: CacheEventData) => void;

export interface CacheEventData {
  event: CacheEvent;
  key?: string;
  value?: unknown;
  layer?: string;
  error?: Error;
  metadata?: Record<string, unknown>;
}

// Cache decorators (for method caching)
export interface CacheDecoratorOptions {
  key?: string | ((args: unknown[]) => string);
  ttl?: number;
  condition?: (result: unknown) => boolean;
  tags?: string[];
}

// Cache key builders
export interface CacheKeyBuilder {
  build: (...parts: unknown[]) => string;
  parse: (key: string) => unknown[];
  pattern: (template: string) => RegExp;
}

// Specific cache implementations
export interface MemoryCache extends CacheLayer {
  maxMemory: number;
  memoryUsage: () => number;
  compress: (value: unknown) => unknown;
  decompress: (value: unknown) => unknown;
}

export interface LocalStorageCache extends CacheLayer {
  prefix: string;
  quota: () => Promise<{ usage: number; quota: number }>;
}

export interface DatabaseCache extends CacheLayer {
  tableName: string;
  connection: unknown; // Database connection object
  vacuum: () => Promise<void>;
}

// Cache serialization
export interface CacheSerializer {
  serialize: (value: unknown) => string | Buffer;
  deserialize: (data: string | Buffer) => unknown;
  contentType: string;
}

// Cache compression
export interface CacheCompressor {
  compress: (data: string | Buffer) => Promise<Buffer>;
  decompress: (data: Buffer) => Promise<string | Buffer>;
  algorithm: string;
}

// Cache encryption
export interface CacheEncryptor {
  encrypt: (data: string | Buffer) => Promise<Buffer>;
  decrypt: (data: Buffer) => Promise<string | Buffer>;
  algorithm: string;
}

// Preloading and warming
export interface CacheWarmer {
  warmUp: (keys: string[]) => Promise<void>;
  preload: (patterns: string[]) => Promise<void>;
  schedule: (config: WarmUpConfig) => void;
}

export interface WarmUpConfig {
  keys?: string[];
  patterns?: string[];
  interval?: number;
  priority?: 'low' | 'normal' | 'high';
  maxConcurrent?: number;
}