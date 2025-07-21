/**
 * Health check endpoint for monitoring system status
 * Provides comprehensive system health information
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { withSecurity } from '../../utils/securityHeaders';
import { globalRegistry } from '../../utils/circuitBreaker';
import { getRateLimiterHealth } from '../../utils/rateLimiter';
import logger from '../../utils/logger';
import { unifiedFetch } from '../../utils/unifiedFetch';

interface DatabaseHealth {
  status: 'healthy' | 'unhealthy';
  error?: string;
  responseTime: number | null;
  tables?: string[];
}

interface APIHealth {
  status: 'healthy' | 'unhealthy';
  statusCode?: number;
  responseTime: number | null;
  url: string;
  error?: string;
}

interface SystemResources {
  memory: {
    status: 'healthy' | 'warning' | 'critical';
    usage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    heapUsagePercentage: number;
  };
  uptime: {
    seconds: number;
    formatted: string;
  };
  nodeVersion: string;
  platform: string;
  environment: string | undefined;
}

interface Configuration {
  status: 'healthy' | 'warning';
  environment: string | undefined;
  missingVars: string[];
  presentVars: string[];
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  service: string;
  system?: SystemResources;
  configuration?: Configuration;
  database?: DatabaseHealth;
  circuitBreakers?: any;
  rateLimiter?: any;
  externalAPIs?: Record<string, APIHealth>;
  responseTime?: number;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<DatabaseHealth> {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('card_cache')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
      tables: ['card_cache', 'pokemon_cache', 'user_favorites', 'session_favorites']
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: null
    };
  }
}

/**
 * Check external API connectivity
 */
async function checkExternalAPIs(): Promise<Record<string, APIHealth>> {
  const apis = {
    pokemonTCG: {
      url: 'https://api.pokemontcg.io/v2/cards?pageSize=1',
      timeout: 5000
    },
    pokeAPI: {
      url: 'https://pokeapi.co/api/v2/pokemon/1',
      timeout: 5000
    }
  };

  const results: Record<string, APIHealth> = {};

  for (const [name, config] of Object.entries(apis)) {
    try {
      const start = Date.now();
      
      const response = await unifiedFetch(config.url, {
        timeout: config.timeout,
        headers: {
          'User-Agent': 'DexTrends-HealthCheck/1.0'
        },
        useCache: false, // Don't cache health checks
        retries: 0, // Don't retry health checks
        throwOnError: false
      });

      const responseTime = Date.now() - start;

      results[name] = {
        status: response.error ? 'unhealthy' : 'healthy',
        statusCode: response.status || 0,
        responseTime,
        url: config.url,
        error: response.error?.message
      } as APIHealth;
    } catch (error) {
      results[name] = {
        status: 'unhealthy',
        error: error.name === 'AbortError' ? 'timeout' : error.message,
        responseTime: null,
        url: config.url
      } as APIHealth;
    }
  }

  return results;
}

/**
 * Check system resources
 */
function checkSystemResources(): SystemResources {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  // Convert bytes to MB
  const memoryInMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024)
  };

  const heapUsagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  let memoryStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (heapUsagePercentage > 90) {
    memoryStatus = 'critical';
  } else if (heapUsagePercentage > 75) {
    memoryStatus = 'warning';
  }

  return {
    memory: {
      status: memoryStatus,
      usage: memoryInMB,
      heapUsagePercentage: Math.round(heapUsagePercentage)
    },
    uptime: {
      seconds: Math.round(uptime),
      formatted: formatUptime(uptime)
    },
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV as string | undefined
  };
}

/**
 * Format uptime in human readable format
 */
function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get application configuration status
 */
function checkConfiguration(): Configuration {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY'
  ];

  const configuration: Configuration = {
    status: 'healthy',
    environment: process.env.NODE_ENV,
    missingVars: [],
    presentVars: []
  };

  for (const varName of requiredEnvVars) {
    if (process.env[varName]) {
      configuration.presentVars.push(varName);
    } else {
      configuration.missingVars.push(varName);
    }
  }

  if (configuration.missingVars.length > 0) {
    configuration.status = 'warning' as Configuration['status'];
  }

  return configuration;
}

/**
 * Main health check handler
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthData | { error: string } | string>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Determine check level based on query parameter
    const { level = 'basic', format = 'json' } = req.query;
    
    let healthData: HealthData = {
      status: 'healthy',
      timestamp,
      version: '1.0.0',
      service: 'DexTrends API'
    };

    // Basic health check
    healthData.system = checkSystemResources();
    healthData.configuration = checkConfiguration();

    // Extended health check
    if (level === 'detailed' || level === 'full') {
      try {
        healthData.database = await checkDatabase();
        healthData.circuitBreakers = (globalRegistry as any).getHealth ? (globalRegistry as any).getHealth() : {};
        healthData.rateLimiter = getRateLimiterHealth();
      } catch (error) {
        logger.error('Error in detailed health check', { error: error.message });
        healthData.database = { status: 'unhealthy', error: error.message, responseTime: null };
      }
    }

    // Full health check includes external APIs
    if (level === 'full') {
      try {
        healthData.externalAPIs = await checkExternalAPIs();
      } catch (error) {
        logger.error('Error checking external APIs', { error: error.message });
        healthData.externalAPIs = { 
          error: { 
            status: 'unhealthy', 
            error: error.message,
            responseTime: 0,
            url: 'N/A'
          } 
        };
      }
    }

    // Determine overall status
    const components: string[] = [
      healthData.system?.memory?.status,
      healthData.database?.status,
      healthData.configuration?.status
    ].filter(Boolean) as string[];

    if (healthData.externalAPIs) {
      const apiStatuses = Object.values(healthData.externalAPIs).map((api) => (api as APIHealth).status);
      components.push(...apiStatuses);
    }

    if (components.includes('critical') || components.includes('unhealthy')) {
      healthData.status = 'unhealthy';
    } else if (components.includes('warning')) {
      healthData.status = 'degraded';
    }

    // Add response time
    healthData.responseTime = Date.now() - startTime;

    // Log health check
    logger.info('Health check completed', {
      status: healthData.status,
      level,
      responseTime: healthData.responseTime,
      ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress
    });

    // Set appropriate status code
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;

    // Return response based on format
    if (format === 'prometheus') {
      // Prometheus metrics format
      let metrics = `# HELP dextrends_health Health status of DexTrends service\n`;
      metrics += `# TYPE dextrends_health gauge\n`;
      metrics += `dextrends_health{status="${healthData.status}"} ${healthData.status === 'healthy' ? 1 : 0}\n`;
      
      if (healthData.system?.memory) {
        metrics += `# HELP dextrends_memory_usage Memory usage percentage\n`;
        metrics += `# TYPE dextrends_memory_usage gauge\n`;
        metrics += `dextrends_memory_usage ${healthData.system.memory.heapUsagePercentage}\n`;
      }

      if (healthData.responseTime) {
        metrics += `# HELP dextrends_health_response_time Health check response time in milliseconds\n`;
        metrics += `# TYPE dextrends_health_response_time gauge\n`;
        metrics += `dextrends_health_response_time ${healthData.responseTime}\n`;
      }

      res.setHeader('Content-Type', 'text/plain');
      return res.status(statusCode).send(metrics);
    }

    // Default JSON response
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(statusCode).json(healthData);

  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });

    const errorResponse = {
      status: 'unhealthy',
      timestamp,
      error: 'Health check failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      responseTime: Date.now() - startTime
    };

    return res.status(503).json(errorResponse);
  }
}

// Apply minimal security (no rate limiting for health checks)
export default withSecurity(handler, {
  customSecurityHeaders: {
    includeCSP: false,
    strictMode: false
  }
} as any);