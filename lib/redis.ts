import Redis from 'ioredis';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

// Redis connection configuration
const getRedisConfig = (redisUrl: string) => {
  const baseConfig = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.info(`[Redis] Retrying connection attempt ${times}`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    },
    lazyConnect: false, // Connect immediately for singleton
    enableReadyCheck: true,
    enableOfflineQueue: true,
    // Connection pool settings to prevent "max clients reached"
    connectionName: 'DexTrends',
    keepAlive: 10000, // 10 seconds keepalive
    connectTimeout: 30000, // 30 seconds connection timeout
  };

  // Only add TLS configuration if using rediss:// protocol
  if (redisUrl.startsWith('rediss://')) {
    try {
      const certPath = path.join(process.cwd(), 'redis_ca.pem');
      if (fs.existsSync(certPath)) {
        const ca = fs.readFileSync(certPath, 'utf8');
        logger.info('[Redis] Using TLS configuration with certificate');
        
        return {
          ...baseConfig,
          tls: {
            ca: ca,
            rejectUnauthorized: true,
            servername: 'redis-10199.c11.us-east-1-3.ec2.redns.redis-cloud.com'
          }
        };
      }
    } catch (error) {
      logger.warn('[Redis] Could not load TLS certificate, using standard connection:', error);
    }
  } else {
    logger.info('[Redis] Using standard Redis connection (no TLS)');
  }

  return baseConfig;
};

// Create Redis client singleton
let redisClient: Redis | null = null;
let isConnecting = false;
let connectionPromise: Promise<Redis | null> | null = null;

export async function getRedisClient(): Promise<Redis | null> {
  // Return existing ready client
  if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')) {
    return redisClient;
  }

  // If already connecting, wait for that connection
  if (connectionPromise) {
    return connectionPromise;
  }

  // Check if Redis URL is configured
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn('[Redis] REDIS_URL not configured, caching disabled');
    return null;
  }

  // Create connection promise to prevent multiple connections
  connectionPromise = (async () => {
    try {
      // Double-check we don't already have a client
      if (redisClient && redisClient.status !== 'end') {
        return redisClient;
      }

      isConnecting = true;
      logger.info('[Redis] Initializing connection...');
      
      // Create new Redis client with appropriate config
      const config = getRedisConfig(redisUrl);
      const newClient = new Redis(redisUrl, config);

      // Set up event handlers
      newClient.on('connect', () => {
        logger.info('[Redis] Connected successfully');
      });

      newClient.on('ready', () => {
        logger.info('[Redis] Ready to accept commands');
      });

      newClient.on('error', (err) => {
        logger.error('[Redis] Connection error:', err);
        // Don't null out client on errors - let it retry
      });

      newClient.on('close', () => {
        logger.warn('[Redis] Connection closed');
      });

      newClient.on('reconnecting', (delay: number) => {
        logger.info(`[Redis] Reconnecting in ${delay}ms...`);
      });

      // Test connection with ping
      await newClient.ping();
      logger.info('[Redis] Connection test successful');

      // Only set singleton after successful connection
      redisClient = newClient;
      return redisClient;
    } catch (error) {
      logger.error('[Redis] Failed to initialize:', error);
      // Reset connection promise so we can retry
      connectionPromise = null;
      return null;
    } finally {
      isConnecting = false;
    }
  })();

  return connectionPromise;
}

// Helper functions for common operations
export const redisHelpers = {
  // Get with JSON parsing
  async getJSON<T = any>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    if (!client) return null;

    try {
      const value = await client.get(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch (error) {
      logger.error(`[Redis] Error getting JSON for key ${key}:`, error);
      return null;
    }
  },

  // Set with JSON stringification
  async setJSON<T = any>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, stringValue);
      } else {
        await client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`[Redis] Error setting JSON for key ${key}:`, error);
      return false;
    }
  },

  // Delete key
  async del(key: string): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`[Redis] Error deleting key ${key}:`, error);
      return false;
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`[Redis] Error checking existence of key ${key}:`, error);
      return false;
    }
  },

  // Get TTL for a key
  async ttl(key: string): Promise<number> {
    const client = await getRedisClient();
    if (!client) return -1;

    try {
      return await client.ttl(key);
    } catch (error) {
      logger.error(`[Redis] Error getting TTL for key ${key}:`, error);
      return -1;
    }
  },

  // Set expiry on existing key
  async expire(key: string, seconds: number): Promise<boolean> {
    const client = await getRedisClient();
    if (!client) return false;

    try {
      const result = await client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`[Redis] Error setting expiry for key ${key}:`, error);
      return false;
    }
  },

  // Get multiple keys at once
  async mgetJSON<T = any>(keys: string[]): Promise<(T | null)[]> {
    const client = await getRedisClient();
    if (!client || keys.length === 0) return keys.map(() => null);

    try {
      const values = await client.mget(...keys);
      return values.map(value => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error(`[Redis] Error in mget:`, error);
      return keys.map(() => null);
    }
  },

  // Increment counter
  async incr(key: string): Promise<number> {
    const client = await getRedisClient();
    if (!client) return 0;

    try {
      return await client.incr(key);
    } catch (error) {
      logger.error(`[Redis] Error incrementing key ${key}:`, error);
      return 0;
    }
  },
};

// Function to gracefully disconnect Redis
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      logger.info('[Redis] Closing connection...');
      await redisClient.quit();
      redisClient = null;
      connectionPromise = null;
    } catch (error) {
      logger.error('[Redis] Error during disconnect:', error);
    }
  }
}

// Function to check Redis health
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client) return false;
    
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
}

// Clean up on application shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectRedis();
  });
  
  process.on('SIGTERM', async () => {
    await disconnectRedis();
  });
}

export default getRedisClient;