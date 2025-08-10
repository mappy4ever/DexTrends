import React, { useState, useEffect } from 'react';

import { useIntersectionObserver } from './PerformanceMonitor.hooks';

// Type extensions for performance API
interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface NavigationTiming {
  navigationStart?: number;
  loadEventEnd?: number;
  domComplete?: number;
  loadEventStart?: number;
}

// Re-export hook for backward compatibility
export { useIntersectionObserver } from './PerformanceMonitor.hooks';

// Performance monitoring component
interface PerformanceMonitorProps {
  showInDev?: boolean;
}

export const PerformanceMonitor = ({ showInDev = true }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0,
    renderTime: 0
  });
  const [showMetrics, setShowMetrics] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  useEffect(() => {
    if (!showInDev || !isDev) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    // FPS monitoring
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime))
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      rafId = requestAnimationFrame(measureFPS);
    };

    // Memory monitoring (if supported)
    const measureMemory = (): void => {
      if ((performance as PerformanceWithMemory).memory) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round((performance as PerformanceWithMemory).memory.usedJSHeapSize / 1048576) // MB
        }));
      }
    };

    // Load time measurement using modern PerformanceNavigationTiming API
    const measureLoadTime = (): void => {
      try {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const navTiming = navigationEntries[0];
          const loadTime = navTiming.loadEventEnd - navTiming.loadEventStart;
          setMetrics(prev => ({
            ...prev,
            loadTime: loadTime
          }));
        }
      } catch (error) {
        // Fallback for older browsers - just use current timestamp
        setMetrics(prev => ({ ...prev, loadTime: Date.now() }));
      }
    };

    measureFPS();
    measureMemory();
    measureLoadTime();

    const memoryInterval = setInterval(measureMemory, 2000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(memoryInterval);
    };
  }, [showInDev, isDev]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = (): string[] => {
    const suggestions = [];
    
    if (metrics.fps < 30) {
      suggestions.push('⚡ Low FPS detected - Consider reducing animations');
    }
    
    if (metrics.memory > 100) {
      suggestions.push('🧠 High memory usage - Check for memory leaks');
    }
    
    if (metrics.loadTime > 3000) {
      suggestions.push('🚀 Slow load time - Optimize images and code splitting');
    }

    return suggestions;
  };

  if (!showInDev || !isDev) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowMetrics(!showMetrics)}
        className="fixed top-32 right-4 z-30 bg-gray-800 text-white p-2 rounded-full text-xs font-mono"
        title="Performance Metrics"
      >
        📊
      </button>

      {/* Metrics panel */}
      {showMetrics && (
        <div className="fixed top-16 right-4 z-30 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
          <h4 className="font-bold mb-2 text-green-400">⚡ Performance Monitor</h4>
          
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>
                {metrics.fps}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={metrics.memory > 100 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.memory} MB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Load Time:</span>
              <span className={metrics.loadTime > 3000 ? 'text-red-400' : 'text-green-400'}>
                {metrics.loadTime}ms
              </span>
            </div>
          </div>

          {/* Optimization suggestions */}
          {getOptimizationSuggestions().length > 0 && (
            <div className="border-t border-gray-600 pt-2">
              <h5 className="font-bold text-yellow-400 mb-1">Suggestions:</h5>
              {getOptimizationSuggestions().map((suggestion: string, index: number) => (
                <div key={index} className="text-yellow-300 text-xs mb-1">
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Image optimization helper
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  [key: string]: unknown;
}

export const OptimizedImage = ({ src, alt, className, priority = false, ...props }: OptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`} {...props}>
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 rounded">
          <span className="text-2xl">📷</span>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

// Intersection Observer hook for lazy loading

export default { PerformanceMonitor, OptimizedImage, useIntersectionObserver };