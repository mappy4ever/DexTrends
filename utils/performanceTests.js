/**
 * Automated performance testing suite
 * Provides comprehensive performance testing, benchmarking, and regression detection
 */

import performanceMonitor from './performanceMonitor';
import { getAPIPerformanceReport } from './apiOptimizations';
import logger from './logger';

// Performance test configuration
const TEST_CONFIG = {
  RENDER_TEST_ITERATIONS: 100,
  API_TEST_REQUESTS: 50,
  MEMORY_TEST_DURATION: 30000, // 30 seconds
  LOAD_TEST_CONCURRENT_USERS: 10,
  PERFORMANCE_BUDGETS: {
    fcp: 1800, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    ttfb: 800, // Time to First Byte
    renderTime: 16, // Component render time
    apiResponseTime: 1000, // API response time
    bundleSize: 500000, // 500KB
    memoryUsage: 50000000 // 50MB
  }
};

// Performance test result structure
class TestResult {
  constructor(testName, passed = false, metrics = {}, details = {}) {
    this.testName = testName;
    this.passed = passed;
    this.metrics = metrics;
    this.details = details;
    this.timestamp = Date.now();
  }

  addMetric(name, value, threshold = null) {
    this.metrics[name] = {
      value,
      threshold,
      passed: threshold ? value <= threshold : true
    };
  }

  addDetail(key, value) {
    this.details[key] = value;
  }
}

// Core Web Vitals testing
export class CoreWebVitalsTest {
  constructor(budgets = TEST_CONFIG.PERFORMANCE_BUDGETS) {
    this.budgets = budgets;
    this.results = [];
  }

  async runTest() {
    const testResult = new TestResult('Core Web Vitals');
    
    try {
      // Wait for metrics to be collected
      await this.waitForMetrics();
      
      const vitals = performanceMonitor.getWebVitalsReport();
      let allPassed = true;

      // Test each vital against budget
      Object.entries(this.budgets).forEach(([vital, budget]) => {
        if (vitals[vital]) {
          const value = vitals[vital].value;
          const passed = value <= budget;
          testResult.addMetric(vital, value, budget);
          
          if (!passed) {
            allPassed = false;
            logger.warn(`Core Web Vital ${vital} failed budget`, {
              value,
              budget,
              difference: value - budget
            });
          }
        }
      });

      testResult.passed = allPassed;
      testResult.addDetail('vitalsReport', vitals);
      
    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('Core Web Vitals test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }

  async waitForMetrics(timeout = 10000) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkMetrics = () => {
        const vitals = performanceMonitor.getWebVitalsReport();
        
        if (Object.keys(vitals).length > 0 || Date.now() - startTime > timeout) {
          resolve();
        } else {
          setTimeout(checkMetrics, 100);
        }
      };
      
      checkMetrics();
    });
  }
}

// Render performance testing
export class RenderPerformanceTest {
  constructor(component, iterations = TEST_CONFIG.RENDER_TEST_ITERATIONS) {
    this.component = component;
    this.iterations = iterations;
    this.results = [];
  }

  async runTest() {
    const testResult = new TestResult('Render Performance');
    
    try {
      const renderTimes = [];
      
      for (let i = 0; i < this.iterations; i++) {
        const startTime = performance.now();
        
        // Simulate component render
        await this.simulateRender();
        
        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);
      }

      const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      const maxRenderTime = Math.max(...renderTimes);
      const slowRenders = renderTimes.filter(time => time > TEST_CONFIG.PERFORMANCE_BUDGETS.renderTime).length;

      testResult.addMetric('averageRenderTime', avgRenderTime, TEST_CONFIG.PERFORMANCE_BUDGETS.renderTime);
      testResult.addMetric('maxRenderTime', maxRenderTime);
      testResult.addMetric('slowRenders', slowRenders, 0);

      testResult.passed = avgRenderTime <= TEST_CONFIG.PERFORMANCE_BUDGETS.renderTime && slowRenders === 0;
      
      testResult.addDetail('renderTimes', renderTimes);
      testResult.addDetail('iterations', this.iterations);

    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('Render performance test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }

  async simulateRender() {
    // This would simulate actual component rendering
    // For now, we'll create a simple delay to simulate work
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        // Simulate some computational work
        let result = 0;
        for (let i = 0; i < 1000; i++) {
          result += Math.random();
        }
        resolve(result);
      });
    });
  }
}

// API performance testing
export class APIPerformanceTest {
  constructor(endpoints = [], requestCount = TEST_CONFIG.API_TEST_REQUESTS) {
    this.endpoints = endpoints;
    this.requestCount = requestCount;
    this.results = [];
  }

  async runTest() {
    const testResult = new TestResult('API Performance');
    
    try {
      const apiReport = getAPIPerformanceReport();
      const responseTimes = [];
      const errors = [];

      // Test each endpoint
      for (const endpoint of this.endpoints) {
        for (let i = 0; i < this.requestCount; i++) {
          try {
            const startTime = performance.now();
            const response = await fetch(endpoint);
            const responseTime = performance.now() - startTime;
            
            responseTimes.push(responseTime);
            
            if (!response.ok) {
              errors.push({
                endpoint,
                status: response.status,
                statusText: response.statusText
              });
            }
          } catch (error) {
            errors.push({
              endpoint,
              error: error.message
            });
          }
        }
      }

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;
      
      const errorRate = errors.length / (this.requestCount * this.endpoints.length) * 100;

      testResult.addMetric('averageResponseTime', avgResponseTime, TEST_CONFIG.PERFORMANCE_BUDGETS.apiResponseTime);
      testResult.addMetric('errorRate', errorRate, 5); // 5% error rate threshold
      testResult.addMetric('totalRequests', this.requestCount * this.endpoints.length);

      testResult.passed = avgResponseTime <= TEST_CONFIG.PERFORMANCE_BUDGETS.apiResponseTime && errorRate <= 5;
      
      testResult.addDetail('responseTimes', responseTimes);
      testResult.addDetail('errors', errors);
      testResult.addDetail('apiReport', apiReport);

    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('API performance test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }
}

// Memory leak testing
export class MemoryLeakTest {
  constructor(testDuration = TEST_CONFIG.MEMORY_TEST_DURATION) {
    this.testDuration = testDuration;
    this.results = [];
  }

  async runTest() {
    const testResult = new TestResult('Memory Leak Detection');
    
    if (!('memory' in performance)) {
      testResult.passed = false;
      testResult.addDetail('error', 'Memory API not supported');
      this.results.push(testResult);
      return testResult;
    }

    try {
      const memorySnapshots = [];
      const startTime = Date.now();
      const initialMemory = performance.memory.usedJSHeapSize;

      // Take memory snapshots over time
      const interval = setInterval(() => {
        memorySnapshots.push({
          timestamp: Date.now() - startTime,
          usedMemory: performance.memory.usedJSHeapSize,
          totalMemory: performance.memory.totalJSHeapSize
        });
      }, 1000);

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, this.testDuration));
      clearInterval(interval);

      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryGrowthRate = memoryIncrease / (this.testDuration / 1000); // bytes per second

      testResult.addMetric('memoryIncrease', memoryIncrease, TEST_CONFIG.PERFORMANCE_BUDGETS.memoryUsage);
      testResult.addMetric('memoryGrowthRate', memoryGrowthRate);
      testResult.addMetric('finalMemoryUsage', finalMemory);

      // Check for potential memory leaks
      const leakThreshold = 1000000; // 1MB increase is considered a potential leak
      testResult.passed = memoryIncrease < leakThreshold;

      testResult.addDetail('snapshots', memorySnapshots);
      testResult.addDetail('testDuration', this.testDuration);

    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('Memory leak test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }
}

// Load testing simulator
export class LoadTest {
  constructor(testFunction, concurrentUsers = TEST_CONFIG.LOAD_TEST_CONCURRENT_USERS) {
    this.testFunction = testFunction;
    this.concurrentUsers = concurrentUsers;
    this.results = [];
  }

  async runTest() {
    const testResult = new TestResult('Load Test');
    
    try {
      const userPromises = [];
      const results = [];

      // Simulate concurrent users
      for (let i = 0; i < this.concurrentUsers; i++) {
        userPromises.push(this.simulateUser(i, results));
      }

      await Promise.all(userPromises);

      const responseTimes = results.map(r => r.responseTime);
      const errors = results.filter(r => r.error);
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const errorRate = errors.length / results.length * 100;

      testResult.addMetric('averageResponseTime', avgResponseTime);
      testResult.addMetric('maxResponseTime', maxResponseTime);
      testResult.addMetric('errorRate', errorRate, 5);
      testResult.addMetric('throughput', results.length / (Math.max(...responseTimes) / 1000));

      testResult.passed = errorRate <= 5 && avgResponseTime <= TEST_CONFIG.PERFORMANCE_BUDGETS.apiResponseTime * 2;
      
      testResult.addDetail('results', results);
      testResult.addDetail('concurrentUsers', this.concurrentUsers);

    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('Load test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }

  async simulateUser(userId, results) {
    try {
      const startTime = performance.now();
      await this.testFunction();
      const responseTime = performance.now() - startTime;
      
      results.push({
        userId,
        responseTime,
        success: true
      });
    } catch (error) {
      results.push({
        userId,
        responseTime: 0,
        success: false,
        error: error.message
      });
    }
  }
}

// Performance regression testing
export class RegressionTest {
  constructor(baselineMetrics = {}) {
    this.baselineMetrics = baselineMetrics;
    this.results = [];
  }

  async runTest(currentMetrics) {
    const testResult = new TestResult('Performance Regression');
    const regressions = [];
    
    try {
      Object.entries(this.baselineMetrics).forEach(([metric, baselineValue]) => {
        const currentValue = currentMetrics[metric];
        
        if (currentValue !== undefined) {
          const regressionThreshold = baselineValue * 1.1; // 10% regression threshold
          const hasRegression = currentValue > regressionThreshold;
          
          if (hasRegression) {
            regressions.push({
              metric,
              baseline: baselineValue,
              current: currentValue,
              regression: ((currentValue - baselineValue) / baselineValue) * 100
            });
          }
          
          testResult.addMetric(metric, currentValue, regressionThreshold);
        }
      });

      testResult.passed = regressions.length === 0;
      testResult.addDetail('regressions', regressions);
      testResult.addDetail('baselineMetrics', this.baselineMetrics);

    } catch (error) {
      testResult.passed = false;
      testResult.addDetail('error', error.message);
      logger.error('Regression test failed', { error });
    }

    this.results.push(testResult);
    return testResult;
  }
}

// Main performance test suite
export class PerformanceTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(test) {
    this.tests.push(test);
  }

  async runAllTests() {
    logger.info('Starting performance test suite', { testCount: this.tests.length });
    
    this.results = [];
    const startTime = performance.now();

    for (const test of this.tests) {
      try {
        const result = await test.runTest();
        this.results.push(result);
        
        logger.info(`Test completed: ${result.testName}`, {
          passed: result.passed,
          metrics: result.metrics
        });
      } catch (error) {
        logger.error(`Test failed: ${test.constructor.name}`, { error });
        this.results.push(new TestResult(test.constructor.name, false, {}, { error: error.message }));
      }
    }

    const totalTime = performance.now() - startTime;
    const passedTests = this.results.filter(r => r.passed).length;
    
    logger.info('Performance test suite completed', {
      totalTests: this.results.length,
      passedTests,
      failedTests: this.results.length - passedTests,
      totalTime
    });

    return this.generateReport();
  }

  generateReport() {
    const passedTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);
    
    const report = {
      summary: {
        totalTests: this.results.length,
        passedTests: passedTests.length,
        failedTests: failedTests.length,
        successRate: (passedTests.length / this.results.length) * 100,
        timestamp: Date.now()
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    this.results.forEach(result => {
      if (!result.passed) {
        Object.entries(result.metrics).forEach(([metric, data]) => {
          if (!data.passed && data.threshold) {
            recommendations.push({
              type: 'performance',
              priority: this.getRecommendationPriority(metric, data.value, data.threshold),
              metric,
              message: `${metric} (${data.value.toFixed(2)}) exceeds threshold (${data.threshold})`,
              suggestions: this.getMetricSuggestions(metric)
            });
          }
        });
      }
    });

    return recommendations;
  }

  getRecommendationPriority(metric, value, threshold) {
    const ratio = value / threshold;
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  getMetricSuggestions(metric) {
    const suggestions = {
      fcp: ['Optimize critical rendering path', 'Inline critical CSS', 'Reduce render-blocking resources'],
      lcp: ['Optimize images', 'Improve server response times', 'Remove render-blocking JavaScript'],
      fid: ['Reduce JavaScript execution time', 'Code split large bundles', 'Use web workers for heavy tasks'],
      cls: ['Include size attributes on images and videos', 'Never insert content above existing content', 'Use CSS transform animations'],
      renderTime: ['Use React.memo for expensive components', 'Implement virtualization for large lists', 'Optimize re-renders with useMemo'],
      apiResponseTime: ['Implement request caching', 'Use CDN for static assets', 'Optimize database queries'],
      memoryUsage: ['Check for memory leaks', 'Implement proper cleanup in useEffect', 'Use WeakMap/WeakSet when appropriate']
    };

    return suggestions[metric] || ['Review and optimize this metric'];
  }
}

// Export convenience function to run basic performance tests
export const runBasicPerformanceTests = async () => {
  const suite = new PerformanceTestSuite();
  
  suite.addTest(new CoreWebVitalsTest());
  suite.addTest(new MemoryLeakTest(10000)); // 10 second test
  
  // Add API test if we have endpoints
  const commonEndpoints = ['/api/filters', '/api/collect-prices'];
  suite.addTest(new APIPerformanceTest(commonEndpoints, 10));

  return await suite.runAllTests();
};

export default {
  CoreWebVitalsTest,
  RenderPerformanceTest,
  APIPerformanceTest,
  MemoryLeakTest,
  LoadTest,
  RegressionTest,
  PerformanceTestSuite,
  runBasicPerformanceTests
};