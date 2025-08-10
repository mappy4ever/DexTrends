/**
 * Metrics endpoint for monitoring and observability
 * Provides Prometheus-compatible metrics and dashboard data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { withSecurity } from '../../utils/securityHeaders';
import { monitoring } from '../../utils/monitoring';
import { globalRegistry } from '../../utils/circuitBreaker';
import { getRateLimiterStats } from '../../utils/rateLimiter';
import logger from '../../utils/logger';

interface MetricsError {
  error: string;
  message: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  lastCheck: string | null;
  responseTime?: number;
  error?: string;
}

interface Alert {
  id: string;
  type: string; // More flexible to handle all alert types from monitoring
  message: string;
  timestamp: string;
  resolved?: boolean;
}

interface CircuitBreakerStatus {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  threshold: number;
  timeout: number;
  lastFailure?: string;
}

interface CircuitBreakersData {
  breakers: CircuitBreakerStatus[];
  totalBreakers: number;
  openBreakers: number;
}

interface MetricsData {
  timestamp: string;
  timeRange: string;
  health: HealthStatus;
  performance: {
    totalRequests: number | null;
    totalErrors: number | null;
    averageResponseTime: number;
    errorRate: number | null;
    memoryUsage: number | null;
  };
  alerts: {
    active: Alert[];
    recent: Alert[];
  };
  circuitBreakers: CircuitBreakersData;
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    nodeVersion: string;
    platform: string;
    environment: string | undefined;
  };
}

/**
 * Metrics handler
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetricsData | MetricsError | string>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed' 
    });
  }

  try {
    const { format = 'json', timeRange = '1h' } = req.query;
    
    // Parse time range
    const timeRangeStr = Array.isArray(timeRange) ? timeRange[0] : timeRange;
    const timeRangeMs = parseTimeRange(timeRangeStr);
    
    // Get metrics based on format
    if (format === 'prometheus') {
      return handlePrometheusFormat(req, res);
    } else if (format === 'dashboard') {
      return handleDashboardFormat(req, res, timeRangeMs);
    } else {
      return handleJsonFormat(req, res, timeRangeMs, timeRangeStr);
    }

  } catch (error) {
    logger.error('Metrics endpoint error', {
      error: error.message,
      stack: error.stack,
      url: req.url
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to retrieve metrics'
    });
  }
}

/**
 * Parse time range string to milliseconds
 */
function parseTimeRange(timeRange: string): number {
  const match = timeRange.match(/^(\d+)([smhd])$/);
  if (!match) return 3600000; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 3600000;
  }
}

/**
 * Handle Prometheus format
 */
function handlePrometheusFormat(req: NextApiRequest, res: NextApiResponse<string>) {
  try {
    let metrics = '';
    
    // Basic application metrics
    const dashboardData = monitoring.getDashboardData();
    
    // Health status
    metrics += `# HELP dextrends_health Application health status (1=healthy, 0=unhealthy)\n`;
    metrics += `# TYPE dextrends_health gauge\n`;
    metrics += `dextrends_health{status="${dashboardData.status}"} ${dashboardData.status === 'healthy' ? 1 : 0}\n\n`;
    
    // Uptime
    metrics += `# HELP dextrends_uptime_seconds Application uptime in seconds\n`;
    metrics += `# TYPE dextrends_uptime_seconds counter\n`;
    metrics += `dextrends_uptime_seconds ${Math.floor(dashboardData.uptime)}\n\n`;
    
    // Memory usage
    if (dashboardData.metrics.memoryUsage) {
      metrics += `# HELP dextrends_memory_usage_percent Memory usage percentage\n`;
      metrics += `# TYPE dextrends_memory_usage_percent gauge\n`;
      metrics += `dextrends_memory_usage_percent ${dashboardData.metrics.memoryUsage}\n\n`;
    }
    
    // API requests
    if (dashboardData.metrics.totalRequests) {
      metrics += `# HELP dextrends_requests_total Total number of API requests\n`;
      metrics += `# TYPE dextrends_requests_total counter\n`;
      metrics += `dextrends_requests_total ${dashboardData.metrics.totalRequests}\n\n`;
    }
    
    // API errors
    if (dashboardData.metrics.totalErrors) {
      metrics += `# HELP dextrends_errors_total Total number of API errors\n`;
      metrics += `# TYPE dextrends_errors_total counter\n`;
      metrics += `dextrends_errors_total ${dashboardData.metrics.totalErrors}\n\n`;
    }
    
    // Response time
    if (dashboardData.metrics.averageResponseTime) {
      metrics += `# HELP dextrends_response_time_avg Average response time in milliseconds\n`;
      metrics += `# TYPE dextrends_response_time_avg gauge\n`;
      metrics += `dextrends_response_time_avg ${dashboardData.metrics.averageResponseTime}\n\n`;
    }
    
    // Error rate
    if (dashboardData.metrics.errorRate !== undefined) {
      metrics += `# HELP dextrends_error_rate Error rate (0-1)\n`;
      metrics += `# TYPE dextrends_error_rate gauge\n`;
      metrics += `dextrends_error_rate ${dashboardData.metrics.errorRate}\n\n`;
    }
    
    // Active alerts
    metrics += `# HELP dextrends_alerts_active Number of active alerts\n`;
    metrics += `# TYPE dextrends_alerts_active gauge\n`;
    metrics += `dextrends_alerts_active{level="critical"} ${dashboardData.alerts.critical}\n`;
    metrics += `dextrends_alerts_active{level="warning"} ${dashboardData.alerts.warnings}\n\n`;
    
    // Circuit breakers
    if (dashboardData.circuitBreakers.breakers) {
      metrics += `# HELP dextrends_circuit_breaker_state Circuit breaker state (0=closed, 1=half-open, 2=open)\n`;
      metrics += `# TYPE dextrends_circuit_breaker_state gauge\n`;
      
      dashboardData.circuitBreakers.breakers.forEach((breaker: { name: string; status: string }) => {
        const stateValue = breaker.status === 'closed' ? 0 : 
                          breaker.status === 'half-open' ? 1 : 2;
        metrics += `dextrends_circuit_breaker_state{name="${breaker.name || 'unknown'}"} ${stateValue}\n`;
      });
      metrics += '\n';
    }
    
    // Add custom monitoring metrics
    const monitoringMetrics = monitoring.exportPrometheusMetrics();
    metrics += monitoringMetrics;
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).send(metrics);
    
  } catch (error) {
    logger.error('Prometheus metrics error', { error: error.message });
    return res.status(500).send('# Error generating metrics\n');
  }
}

/**
 * Handle dashboard format
 */
function handleDashboardFormat(req: NextApiRequest, res: NextApiResponse<any>, timeRangeMs: number) {
  try {
    const dashboardData = monitoring.getDashboardData();
    
    // Add additional dashboard-specific data
    const enhancedData = {
      ...dashboardData,
      
      // System information
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: process.env.NODE_ENV as string | undefined,
        pid: process.pid
      },
      
      // Recent performance data
      recentMetrics: {
        responseTime: monitoring.getMetricSamples('api_requests_duration', timeRangeMs),
        memoryUsage: monitoring.getMetricSamples('memory_usage_percent', timeRangeMs),
        errorRate: monitoring.getMetricSamples('error_rate', timeRangeMs)
      },
      
      // Alert history
      alertHistory: monitoring.getAlerts(timeRangeMs),
      
      // Circuit breaker details
      circuitBreakerDetails: (globalRegistry as any).getMetrics ? (globalRegistry as any).getMetrics() : {},
      
      // Rate limiter information
      rateLimiterStats: {} // getRateLimiterStats requires a limiter instance
    };
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(enhancedData);
    
  } catch (error) {
    logger.error('Dashboard metrics error', { error: error.message });
    return res.status(500).json({
      error: 'Failed to generate dashboard data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Handle JSON format
 */
function handleJsonFormat(req: NextApiRequest, res: NextApiResponse<MetricsData | MetricsError>, timeRangeMs: number, timeRangeStr: string) {
  try {
    const data = {
      timestamp: new Date().toISOString(),
      timeRange: timeRangeStr || '1h',
      
      // Basic metrics
      health: monitoring.getHealthSummary(),
      
      // Performance metrics
      performance: {
        totalRequests: monitoring.getMetricValue('api_requests_total'),
        totalErrors: monitoring.getMetricValue('api_errors_total'),
        averageResponseTime: monitoring.getMetricAverage('api_requests_duration', timeRangeMs),
        errorRate: monitoring.getMetricValue('error_rate'),
        memoryUsage: monitoring.getMetricValue('memory_usage_percent')
      },
      
      // Alerts
      alerts: {
        active: monitoring.getActiveAlerts(),
        recent: monitoring.getAlerts(timeRangeMs).slice(0, 20)
      },
      
      // Circuit breakers
      circuitBreakers: (globalRegistry as any).getHealth ? (globalRegistry as any).getHealth() : {},
      
      // System info
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV as string | undefined
      }
    };
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(data);
    
  } catch (error) {
    logger.error('JSON metrics error', { error: error.message });
    return res.status(500).json({
      error: 'Failed to generate metrics',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// Apply security with basic authentication for metrics
export default withSecurity(handler, {
  customSecurityHeaders: {
    includeCSP: false,
    strictMode: false
  }
} as any);