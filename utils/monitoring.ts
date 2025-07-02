/**
 * Comprehensive monitoring and alerting system
 * Tracks application health, performance, and security metrics
 */

import logger from './logger';
import { globalRegistry } from './circuitBreaker';
import performanceMonitor from './performanceMonitor';

/**
 * Monitoring levels
 */
const MONITORING_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Alert types
 */
const ALERT_TYPES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  AVAILABILITY: 'availability',
  ERROR: 'error',
  RESOURCE: 'resource'
};

/**
 * Monitoring configuration
 */
const MONITORING_CONFIG = {
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

/**
 * Monitoring system class
 */
class MonitoringSystem {
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
  initializeMetrics() {
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
  start() {
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
  stop() {
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
  recordMetric(name, value, labels = {}) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        value: 0,
        samples: [],
        lastUpdate: Date.now()
      });
    }

    const metric = this.metrics.get(name);
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
  incrementMetric(name, amount = 1, labels = {}) {
    const current = this.getMetricValue(name) || 0;
    this.recordMetric(name, current + amount, labels);
  }

  /**
   * Get metric value
   */
  getMetricValue(name) {
    const metric = this.metrics.get(name);
    return metric ? metric.value : null;
  }

  /**
   * Get metric samples within time range
   */
  getMetricSamples(name, timeRangeMs = 3600000) { // Default 1 hour
    const metric = this.metrics.get(name);
    if (!metric) return [];

    const cutoff = Date.now() - timeRangeMs;
    return metric.samples.filter(sample => sample.timestamp > cutoff);
  }

  /**
   * Calculate average for a metric
   */
  getMetricAverage(name, timeRangeMs = 3600000) {
    const samples = this.getMetricSamples(name, timeRangeMs);
    if (samples.length === 0) return 0;

    const sum = samples.reduce((acc, sample) => acc + sample.value, 0);
    return sum / samples.length;
  }

  /**
   * Health monitoring
   */
  async checkHealth() {
    try {
      const startTime = Date.now();
      
      // Check circuit breakers
      const circuitBreakerHealth = globalRegistry.getHealth();
      const openBreakers = circuitBreakerHealth.breakers.filter(b => b.status === 'unhealthy');
      
      if (openBreakers.length > 0) {
        this.createAlert(ALERT_TYPES.AVAILABILITY, MONITORING_LEVELS.WARNING, 
          `${openBreakers.length} circuit breaker(s) open`, {
          breakers: openBreakers.map(b => b.name)
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
      logger.error('Health check failed', { error: error.message });
      this.createAlert(ALERT_TYPES.AVAILABILITY, MONITORING_LEVELS.ERROR,
        'Health check failed', { error: error.message });
    }
  }

  /**
   * Performance monitoring
   */
  checkPerformance() {
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
      logger.error('Performance check failed', { error: error.message });
    }
  }

  /**
   * Security monitoring
   */
  checkSecurity() {
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
      logger.error('Security check failed', { error: error.message });
    }
  }

  /**
   * Resource monitoring
   */
  checkResources() {
    try {
      // Check uptime
      const uptime = process.uptime();
      this.recordMetric('uptime_seconds', uptime);

      // Check active handles and requests
      if (process._getActiveHandles) {
        this.recordMetric('active_handles', process._getActiveHandles().length);
      }
      if (process._getActiveRequests) {
        this.recordMetric('active_requests', process._getActiveRequests().length);
      }

    } catch (error) {
      logger.error('Resource check failed', { error: error.message });
    }
  }

  /**
   * Create an alert
   */
  createAlert(type, level, message, metadata = {}) {
    const alertId = `${type}_${level}_${Date.now()}`;
    const alert = {
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
  resolveAlert(alertId) {
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
  getActiveAlerts() {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get all alerts within time range
   */
  getAlerts(timeRangeMs = 86400000) { // Default 24 hours
    const cutoff = Date.now() - timeRangeMs;
    return Array.from(this.alerts.values())
      .filter(alert => new Date(alert.timestamp).getTime() > cutoff)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Subscribe to alerts
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify subscribers
   */
  notifySubscribers(alert) {
    for (const callback of this.subscribers) {
      try {
        callback(alert);
      } catch (error) {
        logger.error('Error notifying subscriber', { error: error.message });
      }
    }
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData() {
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
      
      circuitBreakers: globalRegistry.getHealth(),
      
      performance: performanceMonitor.generateReport()
    };
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics() {
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
  getHealthSummary() {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.level === MONITORING_LEVELS.CRITICAL);
    
    let status = 'healthy';
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
const monitoring = new MonitoringSystem();

/**
 * Middleware to track API requests
 */
export function trackRequest(req, res, next) {
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
export function trackAuthFailure(reason = 'unknown') {
  monitoring.incrementMetric('auth_failures_total', 1, { reason });
}

/**
 * Track rate limit exceeded
 */
export function trackRateLimitExceeded(identifier) {
  monitoring.incrementMetric('rate_limit_exceeded_total', 1, { identifier });
}

/**
 * Track circuit breaker trips
 */
export function trackCircuitBreakerTrip(breakerName) {
  monitoring.incrementMetric('circuit_breaker_trips_total', 1, { breaker: breakerName });
}

export {
  MonitoringSystem,
  MONITORING_LEVELS,
  ALERT_TYPES,
  monitoring
};

export default monitoring;