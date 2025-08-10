/**
 * Comprehensive monitoring and alerting system
 * Tracks application health, performance, and security metrics
 */

import logger from './logger';
import { globalRegistry } from './circuitBreaker';
import performanceMonitor from './performanceMonitor';

// Simple Express-like type definitions for Next.js API routes
interface Request {
  method: string;
  url: string;
  [key: string]: unknown;
}

interface Response {
  statusCode: number;
  on(event: string, callback: () => void): void;
  [key: string]: unknown;
}

type NextFunction = () => void;

/**
 * Monitoring levels
 */
export const MONITORING_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export type MonitoringLevel = typeof MONITORING_LEVELS[keyof typeof MONITORING_LEVELS];

/**
 * Alert types
 */
export const ALERT_TYPES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  AVAILABILITY: 'availability',
  ERROR: 'error',
  RESOURCE: 'resource'
} as const;

export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

// Interfaces
interface MetricSample {
  value: number;
  timestamp: number;
  labels: Record<string, unknown>;
}

interface Metric {
  value: number;
  samples: MetricSample[];
  lastUpdate: number;
}

interface Alert {
  id: string;
  type: AlertType;
  level: MonitoringLevel;
  message: string;
  metadata: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

interface MonitoringThreshold {
  warning: number;
  critical: number;
}

interface MonitoringConfig {
  performance: {
    responseTime: MonitoringThreshold;
    memoryUsage: MonitoringThreshold;
    errorRate: MonitoringThreshold;
  };
  security: {
    failedAuthAttempts: MonitoringThreshold;
    rateLimitExceeded: MonitoringThreshold;
    suspiciousRequests: MonitoringThreshold;
  };
  resources: {
    cpuUsage: MonitoringThreshold;
    diskUsage: MonitoringThreshold;
  };
  intervals: {
    health: number;
    performance: number;
    security: number;
    resources: number;
  };
}

interface DashboardData {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  lastHealthCheck: string | null;
  uptime: number;
  metrics: {
    totalRequests: number | null;
    totalErrors: number | null;
    averageResponseTime: number;
    memoryUsage: number | null;
    errorRate: number | null;
    activeConnections: number | null;
  };
  alerts: {
    active: number;
    critical: number;
    warnings: number;
    recent: Alert[];
  };
  circuitBreakers: {
    status: string;
    breakers: Array<{
      name: string;
      status: string;
    }>;
  };
  performance: Record<string, unknown>;
}

interface HealthSummary {
  status: 'healthy' | 'degraded' | 'critical';
  activeAlerts: number;
  criticalAlerts: number;
  lastCheck: string | null;
  uptime: number;
}

/**
 * Monitoring configuration
 */
const MONITORING_CONFIG: MonitoringConfig = {
  // Performance thresholds
  performance: {
    responseTime: {
      warning: 2000,   // 2 seconds
      critical: 5000   // 5 seconds
    },
    memoryUsage: {
      warning: 75,     // 75%
      critical: 90     // 90%
    },
    errorRate: {
      warning: 0.05,   // 5%
      critical: 0.1    // 10%
    }
  },
  
  // Security thresholds
  security: {
    failedAuthAttempts: {
      warning: 10,
      critical: 50
    },
    rateLimitExceeded: {
      warning: 5,
      critical: 20
    },
    suspiciousRequests: {
      warning: 3,
      critical: 10
    }
  },
  
  // Resource thresholds
  resources: {
    cpuUsage: {
      warning: 70,
      critical: 90
    },
    diskUsage: {
      warning: 80,
      critical: 95
    }
  },
  
  // Check intervals (in milliseconds)
  intervals: {
    health: 30000,      // 30 seconds
    performance: 60000, // 1 minute
    security: 10000,    // 10 seconds
    resources: 120000   // 2 minutes
  }
};

// Type for alert callback
type AlertCallback = (alert: Alert) => void;

/**
 * Monitoring system class
 */
export class MonitoringSystem {
  private alerts: Map<string, Alert>;
  private metrics: Map<string, Metric>;
  private subscribers: Set<AlertCallback>;
  private intervals: Map<string, NodeJS.Timeout>;
  private isRunning: boolean;
  private lastHealthCheck: string | null;

  constructor() {
    this.alerts = new Map();
    this.metrics = new Map();
    this.subscribers = new Set();
    this.intervals = new Map();
    this.isRunning = false;
    this.lastHealthCheck = null;
    
    // Initialize metric counters
    this.initializeMetrics();
  }

  /**
   * Initialize metric tracking
   */
  private initializeMetrics(): void {
    const metrics = [
      'api_requests_total',
      'api_requests_duration',
      'api_errors_total',
      'auth_failures_total',
      'rate_limit_exceeded_total',
      'circuit_breaker_trips_total',
      'memory_usage_percent',
      'response_time_avg',
      'active_connections'
    ];

    metrics.forEach(metric => {
      this.metrics.set(metric, {
        value: 0,
        samples: [],
        lastUpdate: Date.now()
      });
    });
  }

  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    logger.info('Monitoring system started');

    // Start health monitoring
    this.intervals.set('health', setInterval(() => {
      this.checkHealth();
    }, MONITORING_CONFIG.intervals.health));

    // Start performance monitoring
    this.intervals.set('performance', setInterval(() => {
      this.checkPerformance();
    }, MONITORING_CONFIG.intervals.performance));

    // Start security monitoring
    this.intervals.set('security', setInterval(() => {
      this.checkSecurity();
    }, MONITORING_CONFIG.intervals.security));

    // Start resource monitoring
    this.intervals.set('resources', setInterval(() => {
      this.checkResources();
    }, MONITORING_CONFIG.intervals.resources));
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isRunning = false;
    
    // Clear all intervals
    for (const [name, intervalId] of this.intervals.entries()) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
    
    logger.info('Monitoring system stopped');
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, labels: Record<string, unknown> = {}): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        value: 0,
        samples: [],
        lastUpdate: Date.now()
      });
    }

    const metric = this.metrics.get(name)!;
    metric.value = value;
    metric.samples.push({
      value,
      timestamp: Date.now(),
      labels
    });
    metric.lastUpdate = Date.now();

    // Keep only last 1000 samples
    if (metric.samples.length > 1000) {
      metric.samples = metric.samples.slice(-1000);
    }

    this.metrics.set(name, metric);
  }

  /**
   * Increment a counter metric
   */
  incrementMetric(name: string, amount = 1, labels: Record<string, unknown> = {}): void {
    const current = this.getMetricValue(name) || 0;
    this.recordMetric(name, current + amount, labels);
  }

  /**
   * Get metric value
   */
  getMetricValue(name: string): number | null {
    const metric = this.metrics.get(name);
    return metric ? metric.value : null;
  }

  /**
   * Get metric samples within time range
   */
  getMetricSamples(name: string, timeRangeMs = 3600000): MetricSample[] { // Default 1 hour
    const metric = this.metrics.get(name);
    if (!metric) return [];

    const cutoff = Date.now() - timeRangeMs;
    return metric.samples.filter(sample => sample.timestamp > cutoff);
  }

  /**
   * Calculate average for a metric
   */
  getMetricAverage(name: string, timeRangeMs = 3600000): number {
    const samples = this.getMetricSamples(name, timeRangeMs);
    if (samples.length === 0) return 0;

    const sum = samples.reduce((acc, sample) => acc + sample.value, 0);
    return sum / samples.length;
  }

  /**
   * Health monitoring
   */
  private async checkHealth(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Check circuit breakers - create a mock getHealth if it doesn't exist
      const circuitBreakerHealth = (globalRegistry as { getHealth?: () => { status: string; breakers: Array<{ name: string; status: string }> } }).getHealth?.() || {
        status: 'healthy',
        breakers: []
      };
      
      const openBreakers = circuitBreakerHealth.breakers?.filter((b) => b.status === 'unhealthy') || [];
      
      if (openBreakers.length > 0) {
        this.createAlert(ALERT_TYPES.AVAILABILITY, MONITORING_LEVELS.WARNING, 
          `${openBreakers.length} circuit breaker(s) open`, {
          breakers: openBreakers.map((b) => b.name)
        });
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      this.recordMetric('memory_usage_percent', heapUsagePercent);

      if (heapUsagePercent > MONITORING_CONFIG.performance.memoryUsage.critical) {
        this.createAlert(ALERT_TYPES.RESOURCE, MONITORING_LEVELS.CRITICAL,
          `Critical memory usage: ${heapUsagePercent.toFixed(1)}%`);
      } else if (heapUsagePercent > MONITORING_CONFIG.performance.memoryUsage.warning) {
        this.createAlert(ALERT_TYPES.RESOURCE, MONITORING_LEVELS.WARNING,
          `High memory usage: ${heapUsagePercent.toFixed(1)}%`);
      }

      const responseTime = Date.now() - startTime;
      this.recordMetric('health_check_duration', responseTime);
      this.lastHealthCheck = new Date().toISOString();

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Health check failed', { error: errorMsg });
      this.createAlert(ALERT_TYPES.AVAILABILITY, MONITORING_LEVELS.ERROR,
        'Health check failed', { error: errorMsg });
    }
  }

  /**
   * Performance monitoring
   */
  private checkPerformance(): void {
    try {
      // Check average response time
      const avgResponseTime = this.getMetricAverage('api_requests_duration', 300000); // 5 minutes
      
      if (avgResponseTime > MONITORING_CONFIG.performance.responseTime.critical) {
        this.createAlert(ALERT_TYPES.PERFORMANCE, MONITORING_LEVELS.CRITICAL,
          `Critical response time: ${avgResponseTime.toFixed(0)}ms`);
      } else if (avgResponseTime > MONITORING_CONFIG.performance.responseTime.warning) {
        this.createAlert(ALERT_TYPES.PERFORMANCE, MONITORING_LEVELS.WARNING,
          `High response time: ${avgResponseTime.toFixed(0)}ms`);
      }

      // Check error rate
      const totalRequests = this.getMetricValue('api_requests_total') || 0;
      const totalErrors = this.getMetricValue('api_errors_total') || 0;
      const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

      this.recordMetric('error_rate', errorRate);

      if (errorRate > MONITORING_CONFIG.performance.errorRate.critical) {
        this.createAlert(ALERT_TYPES.ERROR, MONITORING_LEVELS.CRITICAL,
          `Critical error rate: ${(errorRate * 100).toFixed(1)}%`);
      } else if (errorRate > MONITORING_CONFIG.performance.errorRate.warning) {
        this.createAlert(ALERT_TYPES.ERROR, MONITORING_LEVELS.WARNING,
          `High error rate: ${(errorRate * 100).toFixed(1)}%`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Performance check failed', { error: errorMsg });
    }
  }

  /**
   * Security monitoring
   */
  private checkSecurity(): void {
    try {
      // Check authentication failures
      const authFailures = this.getMetricValue('auth_failures_total') || 0;
      
      if (authFailures > MONITORING_CONFIG.security.failedAuthAttempts.critical) {
        this.createAlert(ALERT_TYPES.SECURITY, MONITORING_LEVELS.CRITICAL,
          `Critical number of auth failures: ${authFailures}`);
      } else if (authFailures > MONITORING_CONFIG.security.failedAuthAttempts.warning) {
        this.createAlert(ALERT_TYPES.SECURITY, MONITORING_LEVELS.WARNING,
          `High number of auth failures: ${authFailures}`);
      }

      // Check rate limit exceeded
      const rateLimitExceeded = this.getMetricValue('rate_limit_exceeded_total') || 0;
      
      if (rateLimitExceeded > MONITORING_CONFIG.security.rateLimitExceeded.critical) {
        this.createAlert(ALERT_TYPES.SECURITY, MONITORING_LEVELS.CRITICAL,
          `Critical rate limit violations: ${rateLimitExceeded}`);
      } else if (rateLimitExceeded > MONITORING_CONFIG.security.rateLimitExceeded.warning) {
        this.createAlert(ALERT_TYPES.SECURITY, MONITORING_LEVELS.WARNING,
          `High rate limit violations: ${rateLimitExceeded}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Security check failed', { error: errorMsg });
    }
  }

  /**
   * Resource monitoring
   */
  private checkResources(): void {
    try {
      // Check uptime
      const uptime = process.uptime();
      this.recordMetric('uptime_seconds', uptime);

      // Check active handles and requests
      const processWithInternals = process as NodeJS.Process & {
        _getActiveHandles?: () => unknown[];
        _getActiveRequests?: () => unknown[];
      };
      
      if (processWithInternals._getActiveHandles) {
        this.recordMetric('active_handles', processWithInternals._getActiveHandles().length);
      }
      if (processWithInternals._getActiveRequests) {
        this.recordMetric('active_requests', processWithInternals._getActiveRequests().length);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Resource check failed', { error: errorMsg });
    }
  }

  /**
   * Create an alert
   */
  createAlert(type: AlertType, level: MonitoringLevel, message: string, metadata: Record<string, unknown> = {}): string {
    const alertId = `${type}_${level}_${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      type,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    this.alerts.set(alertId, alert);

    // Log the alert
    const logLevel = level === MONITORING_LEVELS.CRITICAL ? 'error' :
                    level === MONITORING_LEVELS.ERROR ? 'error' :
                    level === MONITORING_LEVELS.WARNING ? 'warn' : 'info';

    logger[logLevel](`ALERT [${type}]: ${message}`, metadata);

    // Notify subscribers
    this.notifySubscribers(alert);

    // Auto-resolve info alerts after 5 minutes
    if (level === MONITORING_LEVELS.INFO) {
      setTimeout(() => {
        this.resolveAlert(alertId);
      }, 300000);
    }

    return alertId;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      this.alerts.set(alertId, alert);
      
      logger.info(`Alert resolved: ${alert.message}`, { alertId });
      return true;
    }
    return false;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts within time range
   */
  getAlerts(timeRangeMs = 86400000): Alert[] { // Default 24 hours
    const cutoff = Date.now() - timeRangeMs;
    return Array.from(this.alerts.values())
      .filter(alert => new Date(alert.timestamp).getTime() > cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Subscribe to alerts
   */
  subscribe(callback: AlertCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(alert: Alert): void {
    for (const callback of this.subscribers) {
      try {
        callback(alert);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.error('Error notifying subscriber', { error: errorMsg });
      }
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): DashboardData {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    return {
      status: this.getActiveAlerts().length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      lastHealthCheck: this.lastHealthCheck,
      uptime: process.uptime(),
      
      metrics: {
        totalRequests: this.getMetricValue('api_requests_total'),
        totalErrors: this.getMetricValue('api_errors_total'),
        averageResponseTime: this.getMetricAverage('api_requests_duration', 3600000),
        memoryUsage: this.getMetricValue('memory_usage_percent'),
        errorRate: this.getMetricValue('error_rate'),
        activeConnections: this.getMetricValue('active_connections')
      },
      
      alerts: {
        active: this.getActiveAlerts().length,
        critical: this.getActiveAlerts().filter(a => a.level === MONITORING_LEVELS.CRITICAL).length,
        warnings: this.getActiveAlerts().filter(a => a.level === MONITORING_LEVELS.WARNING).length,
        recent: this.getAlerts(3600000).slice(0, 10)
      },
      
      circuitBreakers: (globalRegistry as { getHealth?: () => { status: string; breakers: Array<{ name: string; status: string }> } }).getHealth?.() || { status: 'unknown', breakers: [] },
      
      performance: performanceMonitor.generateReport() as unknown as Record<string, unknown> || {}
    };
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(): string {
    let output = '';
    
    for (const [name, metric] of this.metrics.entries()) {
      output += `# HELP ${name} ${name.replace(/_/g, ' ')}\n`;
      output += `# TYPE ${name} gauge\n`;
      output += `${name} ${metric.value}\n`;
    }
    
    return output;
  }

  /**
   * Get health summary
   */
  getHealthSummary(): HealthSummary {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.level === MONITORING_LEVELS.CRITICAL);
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.length > 0) {
      status = 'degraded';
    }
    
    return {
      status,
      activeAlerts: activeAlerts.length,
      criticalAlerts: criticalAlerts.length,
      lastCheck: this.lastHealthCheck,
      uptime: process.uptime()
    };
  }
}

// Global monitoring instance
export const monitoring = new MonitoringSystem();

/**
 * Middleware to track API requests
 */
export function trackRequest(req: Request, res: Response, next?: NextFunction): void {
  const startTime = Date.now();
  
  // Increment request counter
  monitoring.incrementMetric('api_requests_total', 1, {
    method: req.method,
    path: req.url
  });

  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    monitoring.recordMetric('api_requests_duration', duration, {
      method: req.method,
      path: req.url,
      statusCode: res.statusCode
    });

    if (res.statusCode >= 400) {
      monitoring.incrementMetric('api_errors_total', 1, {
        method: req.method,
        path: req.url,
        statusCode: res.statusCode
      });
    }
  });

  if (next) next();
}

/**
 * Track authentication failures
 */
export function trackAuthFailure(reason = 'unknown'): void {
  monitoring.incrementMetric('auth_failures_total', 1, { reason });
}

/**
 * Track rate limit exceeded
 */
export function trackRateLimitExceeded(identifier: string): void {
  monitoring.incrementMetric('rate_limit_exceeded_total', 1, { identifier });
}

/**
 * Track circuit breaker trips
 */
export function trackCircuitBreakerTrip(breakerName: string): void {
  monitoring.incrementMetric('circuit_breaker_trips_total', 1, { breaker: breakerName });
}

export default monitoring;