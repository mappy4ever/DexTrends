/**
 * Comprehensive performance monitoring dashboard
 * Displays real-time performance metrics, Core Web Vitals, and optimization insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { usePerformanceMonitor } from '../../utils/performanceMonitor';
import { useAPIPerformance, getAPIPerformanceReport } from '../../utils/apiOptimizations';
import { useImagePerformance } from './OptimizedImage';
import logger from '../../utils/logger';

// Performance metric card component
const MetricCard = ({ title, value, unit = '', status = 'good', trend = null, description = '' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        {trend && <span className="text-xs">{getTrendIcon(trend)}</span>}
      </div>
      <div className="text-2xl font-bold mb-1">
        {typeof value === 'number' ? value.toFixed(1) : value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      {description && (
        <p className="text-xs opacity-75">{description}</p>
      )}
    </div>
  );
};

// Core Web Vitals component
const CoreWebVitals = ({ vitals }) => {
  const getVitalStatus = (name, value) => {
    const thresholds = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      ttfb: { good: 800, needsImprovement: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold || value === undefined) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const vitalDisplayNames = {
    fcp: 'First Contentful Paint',
    lcp: 'Largest Contentful Paint',
    fid: 'First Input Delay',
    cls: 'Cumulative Layout Shift',
    ttfb: 'Time to First Byte'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Core Web Vitals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(vitalDisplayNames).map(([key, name]) => {
          const vital = vitals[key];
          const value = vital?.value;
          const status = getVitalStatus(key, value);
          
          return (
            <MetricCard
              key={key}
              title={name}
              value={value !== undefined ? value : 'N/A'}
              unit={key === 'cls' ? '' : 'ms'}
              status={status}
              description={status === 'good' ? 'Excellent' : status === 'needs-improvement' ? 'Could be better' : 'Needs attention'}
            />
          );
        })}
      </div>
    </div>
  );
};

// API Performance component
const APIPerformance = ({ apiMetrics }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">API Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={apiMetrics.totalRequests}
          status="good"
        />
        <MetricCard
          title="Success Rate"
          value={apiMetrics.successRate}
          unit="%"
          status={apiMetrics.successRate > 95 ? 'good' : apiMetrics.successRate > 90 ? 'needs-improvement' : 'poor'}
        />
        <MetricCard
          title="Avg Response Time"
          value={apiMetrics.averageResponseTime}
          unit="ms"
          status={apiMetrics.averageResponseTime < 1000 ? 'good' : apiMetrics.averageResponseTime < 3000 ? 'needs-improvement' : 'poor'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={apiMetrics.cacheHitRate}
          unit="%"
          status={apiMetrics.cacheHitRate > 80 ? 'good' : apiMetrics.cacheHitRate > 60 ? 'needs-improvement' : 'poor'}
        />
      </div>
    </div>
  );
};

// Component Performance component
const ComponentPerformance = ({ performanceData }) => {
  const [componentMetrics, setComponentMetrics] = useState({});

  useEffect(() => {
    const metrics = performanceData.getMetrics();
    const componentData = {};

    // Aggregate component metrics
    Object.entries(metrics).forEach(([key, values]) => {
      if (key.includes('component-')) {
        const metricType = key.replace('component-', '');
        if (!componentData[metricType]) {
          componentData[metricType] = [];
        }
        componentData[metricType].push(...values);
      }
    });

    setComponentMetrics(componentData);
  }, [performanceData]);

  const renderTimes = componentMetrics['render-time'] || [];
  const avgRenderTime = renderTimes.length > 0 
    ? renderTimes.reduce((acc, m) => acc + m.value, 0) / renderTimes.length 
    : 0;

  const slowRenders = renderTimes.filter(m => m.value > 16).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Component Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Avg Render Time"
          value={avgRenderTime}
          unit="ms"
          status={avgRenderTime < 16 ? 'good' : avgRenderTime < 50 ? 'needs-improvement' : 'poor'}
          description="Target: < 16ms for 60fps"
        />
        <MetricCard
          title="Slow Renders"
          value={slowRenders}
          status={slowRenders === 0 ? 'good' : slowRenders < 5 ? 'needs-improvement' : 'poor'}
          description="Renders > 16ms"
        />
        <MetricCard
          title="Total Renders"
          value={renderTimes.length}
          status="good"
        />
      </div>
    </div>
  );
};

// Memory Usage component
const MemoryUsage = ({ performanceData }) => {
  const [memoryMetrics, setMemoryMetrics] = useState(null);

  useEffect(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      setMemoryMetrics({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      });
    }
  }, []);

  if (!memoryMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
        <p className="text-gray-500">Memory API not supported in this browser</p>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Memory Usage</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Used Memory"
          value={formatBytes(memoryMetrics.used)}
          status={memoryMetrics.percentage < 70 ? 'good' : memoryMetrics.percentage < 85 ? 'needs-improvement' : 'poor'}
        />
        <MetricCard
          title="Total Available"
          value={formatBytes(memoryMetrics.total)}
          status="good"
        />
        <MetricCard
          title="Usage Percentage"
          value={memoryMetrics.percentage}
          unit="%"
          status={memoryMetrics.percentage < 70 ? 'good' : memoryMetrics.percentage < 85 ? 'needs-improvement' : 'poor'}
        />
      </div>
    </div>
  );
};

// Performance optimization suggestions
const OptimizationSuggestions = ({ performanceData }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const generateSuggestions = () => {
      const metrics = performanceData.getMetrics();
      const newSuggestions = [];

      // Check render performance
      const renderTimes = metrics['component-render-time'] || [];
      const slowRenders = renderTimes.filter(m => m.value > 16);
      if (slowRenders.length > 0) {
        newSuggestions.push({
          type: 'performance',
          priority: 'high',
          title: 'Slow Component Renders Detected',
          description: `${slowRenders.length} components are rendering slowly (>16ms)`,
          actions: [
            'Add React.memo to frequently updating components',
            'Use useMemo for expensive calculations',
            'Consider component code splitting'
          ]
        });
      }

      // Check API performance
      const apiErrors = metrics['api-request-error'] || [];
      if (apiErrors.length > 0) {
        const errorRate = (apiErrors.length / (apiErrors.length + (metrics['api-request-success'] || []).length)) * 100;
        if (errorRate > 5) {
          newSuggestions.push({
            type: 'api',
            priority: 'medium',
            title: 'High API Error Rate',
            description: `${errorRate.toFixed(1)}% of API requests are failing`,
            actions: [
              'Review API error handling',
              'Implement better retry logic',
              'Check network connectivity issues'
            ]
          });
        }
      }

      // Check memory usage
      if ('memory' in performance) {
        const memory = performance.memory;
        const usage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        if (usage > 85) {
          newSuggestions.push({
            type: 'memory',
            priority: 'high',
            title: 'High Memory Usage',
            description: `Memory usage is at ${usage.toFixed(1)}%`,
            actions: [
              'Check for memory leaks',
              'Implement virtual scrolling for large lists',
              'Clean up event listeners and timers'
            ]
          });
        }
      }

      setSuggestions(newSuggestions);
    };

    const timer = setTimeout(generateSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [performanceData]);

  if (suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Optimization Suggestions</h2>
        <div className="text-center py-8">
          <div className="text-green-500 text-4xl mb-2">✅</div>
          <p className="text-gray-600 dark:text-gray-400">No performance issues detected!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4">Optimization Suggestions</h2>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className={`p-4 rounded-lg border-l-4 ${
            suggestion.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
            suggestion.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          }`}>
            <h3 className="font-semibold text-sm mb-2">{suggestion.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{suggestion.description}</p>
            <ul className="text-sm space-y-1">
              {suggestion.actions.map((action, actionIndex) => (
                <li key={actionIndex} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Performance Dashboard component
const PerformanceDashboard = ({ isOpen = false, onClose = () => {} }) => {
  const performanceData = usePerformanceMonitor();
  const apiMetrics = useAPIPerformance();
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // This will trigger re-renders and update metrics
      setIsVisible(prev => prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Toggle visibility
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors">
        >
          📊 Performance
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performance Dashboard
                </h1>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="mr-2" />
                    <span className="text-sm">Auto-refresh</span>
                  </label>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">

                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <CoreWebVitals vitals={performanceData.vitals} />
              <APIPerformance apiMetrics={apiMetrics} />
              <ComponentPerformance performanceData={performanceData} />
              <MemoryUsage performanceData={performanceData} />
              <OptimizationSuggestions performanceData={performanceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;