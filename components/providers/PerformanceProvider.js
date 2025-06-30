/**
 * Performance Provider - Integrates all performance optimizations across the app
 * Provides centralized performance monitoring, automatic optimizations, and reporting
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import performanceMonitor from '../../utils/performanceMonitor';
import { cleanupAPIOptimizations, getAPIPerformanceReport } from '../../utils/apiOptimizations';
import { runBasicPerformanceTests } from '../../utils/performanceTests';
import logger from '../../utils/logger';

// Performance context
const PerformanceContext = createContext({
  vitals: {},
  apiMetrics: {},
  isMonitoring: false,
  enableOptimizations: () => {},
  disableOptimizations: () => {},
  runPerformanceTests: () => {},
  getReport: () => {},
  suggestions: []
});

// Performance provider component
export const PerformanceProvider = ({ children, enabledByDefault = true, testingMode = false }) => {
  const [vitals, setVitals] = useState({});
  const [apiMetrics, setApiMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(enabledByDefault);
  const [suggestions, setSuggestions] = useState([]);
  const [testResults, setTestResults] = useState(null);
  
  const cleanupRef = useRef(null);
  const reportInterval = useRef(null);
  const testInterval = useRef(null);

  // Initialize performance monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    logger.info('Performance monitoring initialized');

    // Subscribe to vitals changes
    const unsubscribeVitals = performanceMonitor.onVitalsChange((metric) => {
      setVitals(prev => ({
        ...prev,
        [metric.name]: metric
      }));
    });

    // Update API metrics periodically
    const updateApiMetrics = () => {
      const report = getAPIPerformanceReport();
      setApiMetrics(report);
    };

    // Set up intervals
    const apiMetricsInterval = setInterval(updateApiMetrics, 5000);
    
    // Performance report generation
    reportInterval.current = setInterval(() => {
      generatePerformanceReport();
    }, 60000); // Every minute

    // Automated testing in development
    if (testingMode && process.env.NODE_ENV === 'development') {
      testInterval.current = setInterval(async () => {
        try {
          const results = await runBasicPerformanceTests();
          setTestResults(results);
          updateSuggestions(results);
        } catch (error) {
          logger.error('Automated performance test failed', { error });
        }
      }, 300000); // Every 5 minutes
    }

    // Cleanup function
    cleanupRef.current = () => {
      unsubscribeVitals();
      clearInterval(apiMetricsInterval);
      if (reportInterval.current) clearInterval(reportInterval.current);
      if (testInterval.current) clearInterval(testInterval.current);
    };

    return cleanupRef.current;
  }, [isMonitoring, testingMode]);

  // Generate performance suggestions
  const updateSuggestions = (testResults) => {
    const newSuggestions = [];
    
    if (testResults && testResults.recommendations) {
      newSuggestions.push(...testResults.recommendations);
    }

    // Add real-time suggestions based on current metrics
    Object.entries(vitals).forEach(([metric, data]) => {
      if (data.metadata && !data.metadata.good) {
        newSuggestions.push({
          type: 'realtime',
          priority: data.metadata.needsImprovement ? 'medium' : 'high',
          metric,
          message: `${metric.toUpperCase()} is ${data.metadata.needsImprovement ? 'needs improvement' : 'poor'}`,
          value: data.value,
          suggestions: getMetricSuggestions(metric)
        });
      }
    });

    setSuggestions(newSuggestions);
  };

  // Generate performance report
  const generatePerformanceReport = () => {
    const report = {
      timestamp: Date.now(),
      vitals: vitals,
      api: apiMetrics,
      suggestions: suggestions,
      testResults: testResults,
      system: {
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null,
        memory: performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null
      }
    };

    // Send to analytics if configured
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      sendPerformanceAnalytics(report);
    }

    logger.debug('Performance report generated', report);
    return report;
  };

  // Send performance data to analytics
  const sendPerformanceAnalytics = (report) => {
    // This would integrate with your analytics service
    // For example, Google Analytics 4, Mixpanel, etc.
    try {
      if (window.gtag) {
        // Google Analytics 4 example
        window.gtag('event', 'performance_report', {
          custom_parameters: {
            fcp: report.vitals.fcp?.value,
            lcp: report.vitals.lcp?.value,
            fid: report.vitals.fid?.value,
            cls: report.vitals.cls?.value,
            api_success_rate: report.api.requests?.successful / report.api.requests?.total * 100,
            api_avg_response_time: report.api.requests?.averageResponseTime
          }
        });
      }
    } catch (error) {
      logger.error('Failed to send performance analytics', { error });
    }
  };

  // Enable optimizations
  const enableOptimizations = () => {
    setIsMonitoring(true);
    logger.info('Performance optimizations enabled');
  };

  // Disable optimizations
  const disableOptimizations = () => {
    setIsMonitoring(false);
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    cleanupAPIOptimizations();
    logger.info('Performance optimizations disabled');
  };

  // Run performance tests manually
  const runPerformanceTests = async () => {
    try {
      logger.info('Running manual performance tests');
      const results = await runBasicPerformanceTests();
      setTestResults(results);
      updateSuggestions(results);
      return results;
    } catch (error) {
      logger.error('Manual performance test failed', { error });
      throw error;
    }
  };

  // Get comprehensive performance report
  const getReport = () => {
    return generatePerformanceReport();
  };

  // Automatic optimizations based on metrics
  useEffect(() => {
    if (!isMonitoring) return;

    // Auto-optimize based on performance metrics
    const autoOptimize = () => {
      // Enable virtualization for large lists
      if (vitals.lcp && vitals.lcp.value > 4000) {
        logger.info('LCP is slow, enabling virtualization recommendations');
        // This could automatically enable virtualization features
      }

      // Suggest image optimization
      if (vitals.fcp && vitals.fcp.value > 3000) {
        logger.info('FCP is slow, image optimization recommended');
        // This could automatically optimize images
      }

      // Memory cleanup
      if (performance.memory) {
        const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
        if (memoryUsage > 85) {
          logger.warn('High memory usage detected, running cleanup');
          cleanupAPIOptimizations();
        }
      }
    };

    const autoOptimizeInterval = setInterval(autoOptimize, 30000); // Every 30 seconds

    return () => clearInterval(autoOptimizeInterval);
  }, [isMonitoring, vitals]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupAPIOptimizations();
    };
  }, []);

  const contextValue = {
    vitals,
    apiMetrics,
    isMonitoring,
    suggestions,
    testResults,
    enableOptimizations,
    disableOptimizations,
    runPerformanceTests,
    getReport
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Hook to use performance context
export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Hook for component-specific performance monitoring
export const useComponentPerformance = (componentName) => {
  const { isMonitoring } = usePerformance();
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());

  useEffect(() => {
    if (!isMonitoring) return;

    renderCount.current++;
    
    const renderTime = performance.now() - mountTime.current;
    
    performanceMonitor.recordMetric('component-render', renderTime, {
      component: componentName,
      renderCount: renderCount.current
    });

    if (renderTime > 50) {
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime,
        renderCount: renderCount.current
      });
    }
  });

  return {
    renderCount: renderCount.current,
    isMonitoring
  };
};

// Performance-aware component wrapper
export const withPerformanceMonitoring = (WrappedComponent, options = {}) => {
  const {
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component',
    enableAutoOptimization = true
  } = options;

  const PerformanceMonitoredComponent = React.forwardRef((props, ref) => {
    useComponentPerformance(componentName);

    // Auto-optimization based on component usage
    const { suggestions, isMonitoring } = usePerformance();
    
    useEffect(() => {
      if (!enableAutoOptimization || !isMonitoring) return;

      const componentSuggestions = suggestions.filter(s => 
        s.message.toLowerCase().includes(componentName.toLowerCase())
      );

      if (componentSuggestions.length > 0) {
        logger.info(`Performance suggestions for ${componentName}`, componentSuggestions);
      }
    }, [suggestions, isMonitoring]);

    return React.createElement(WrappedComponent, { ...props, ref });
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  return PerformanceMonitoredComponent;
};

// Utility functions
const getMetricSuggestions = (metric) => {
  const suggestions = {
    fcp: [
      'Optimize critical rendering path',
      'Inline critical CSS',
      'Reduce render-blocking resources',
      'Use resource hints (preload, prefetch)'
    ],
    lcp: [
      'Optimize largest element (usually images)',
      'Improve server response times',
      'Remove render-blocking JavaScript',
      'Use CDN for faster content delivery'
    ],
    fid: [
      'Reduce JavaScript execution time',
      'Code split large bundles',
      'Use web workers for heavy tasks',
      'Optimize third-party scripts'
    ],
    cls: [
      'Include size attributes on images and videos',
      'Never insert content above existing content',
      'Use CSS transform animations instead of layout changes',
      'Preload fonts with font-display: swap'
    ],
    ttfb: [
      'Improve server performance',
      'Use CDN',
      'Enable server-side caching',
      'Optimize database queries'
    ]
  };

  return suggestions[metric] || ['Review and optimize this metric'];
};

export default {
  PerformanceProvider,
  usePerformance,
  useComponentPerformance,
  withPerformanceMonitoring
};