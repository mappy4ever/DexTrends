/**
 * Advanced React optimization utilities
 * Provides automatic memoization, performance detection, and optimization suggestions
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  ComponentType,
  ReactElement,
  RefObject,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  RefAttributes
} from 'react';
import performanceMonitor from './performanceMonitor';
import logger from './logger';

// Type definitions
interface PerformanceThresholds {
  RENDER_TIME: number;
  SLOW_RENDER_TIME: number;
  PROP_COMPARISON_TIME: number;
  HOOK_EXECUTION_TIME: number;
}

interface AutoMemoOptions {
  displayName?: string;
  enableProfiling?: boolean;
  logSlowRenders?: boolean;
  autoOptimize?: boolean;
}

interface SmartMemoOptions {
  enableProfiling?: boolean;
  maxComputationTime?: number;
}

interface SmartCallbackOptions {
  enableProfiling?: boolean;
  stableCallback?: boolean;
}

interface PerformanceProfilerOptions {
  trackRenders?: boolean;
  trackUpdates?: boolean;
  logThreshold?: number;
}

interface OptimizedListOptions<T> {
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  keyExtractor?: (item: T, index: number) => string | number;
}

interface VisibleItem<T> {
  item: T;
  index: number;
  key: string | number;
}

interface OptimizationSuggestion {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  suggestions: string[];
}

interface WithOptimizationsOptions {
  enableMemo?: boolean;
  enableProfiling?: boolean;
  enableSuggestions?: boolean;
}

// Performance threshold constants
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  RENDER_TIME: 16, // 60fps threshold
  SLOW_RENDER_TIME: 50,
  PROP_COMPARISON_TIME: 5,
  HOOK_EXECUTION_TIME: 10
};

// Utility function for shallow comparison
const shallowEqual = <T extends Record<string, any>>(obj1: T, obj2: T): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
};

// Automatic memoization wrapper with performance monitoring
export function autoMemo<P extends object>(
  Component: ComponentType<P>,
  customCompare?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
  options: AutoMemoOptions = {}
): ComponentType<P> {
  const {
    displayName = Component.displayName || Component.name || 'AnonymousComponent',
    enableProfiling = process.env.NODE_ENV === 'development',
    logSlowRenders = true,
    autoOptimize = true
  } = options;

  // Custom comparison function that monitors performance
  const performanceCompare = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
    if (!enableProfiling) {
      return customCompare ? customCompare(prevProps, nextProps) : false;
    }

    const startTime = performance.now();
    const shouldUpdate = customCompare ? 
      customCompare(prevProps, nextProps) : 
      !shallowEqual(prevProps, nextProps);
    const compareTime = performance.now() - startTime;

    // Log slow prop comparisons
    if (compareTime > PERFORMANCE_THRESHOLDS.PROP_COMPARISON_TIME) {
      logger.warn('Slow prop comparison', {
        component: displayName,
        compareTime,
        propsCount: Object.keys(nextProps).length
      });
    }

    performanceMonitor.recordMetric('prop-comparison-time', compareTime, {
      component: displayName,
      shouldUpdate
    });

    return shouldUpdate;
  };

  const MemoizedComponent = memo(Component, performanceCompare);
  MemoizedComponent.displayName = `AutoMemo(${displayName})`;

  // Wrap with render performance monitoring
  if (enableProfiling) {
    const ProfiledComponent = React.forwardRef<any, P>((props, ref) => {
      const renderCount = useRef(0);
      const lastRenderTime = useRef(0);

      useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - lastRenderTime.current;
        renderCount.current++;

        if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME && logSlowRenders) {
          logger.warn('Slow render detected', {
            component: displayName,
            renderTime,
            renderCount: renderCount.current,
            props: Object.keys(props)
          });
        }

        performanceMonitor.recordMetric('component-render-time', renderTime, {
          component: displayName,
          renderCount: renderCount.current
        });
      });

      lastRenderTime.current = performance.now();
      return React.createElement(MemoizedComponent, { ...props, ref } as P);
    });
    
    ProfiledComponent.displayName = `Profiled(${displayName})`;
    return ProfiledComponent as unknown as ComponentType<P>;
  }

  return MemoizedComponent;
}

// Smart useMemo that automatically determines dependencies
export function useSmartMemo<T>(
  factory: () => T,
  deps: React.DependencyList = [],
  options: SmartMemoOptions = {}
): T {
  const {
    enableProfiling = process.env.NODE_ENV === 'development',
    maxComputationTime = PERFORMANCE_THRESHOLDS.HOOK_EXECUTION_TIME
  } = options;

  const computationTimeRef = useRef(0);
  const callCountRef = useRef(0);

  const memoizedValue = useMemo(() => {
    const startTime = enableProfiling ? performance.now() : 0;
    const result = factory();
    
    if (enableProfiling) {
      const computationTime = performance.now() - startTime;
      computationTimeRef.current = computationTime;
      callCountRef.current++;

      if (computationTime > maxComputationTime) {
        logger.warn('Expensive useMemo computation detected', {
          computationTime,
          callCount: callCountRef.current,
          dependencies: deps.length
        });
      }

      performanceMonitor.recordMetric('useMemo-computation-time', computationTime, {
        callCount: callCountRef.current,
        dependencyCount: deps.length
      });
    }

    return result;
  }, deps);

  return memoizedValue;
}

// Smart useCallback with dependency optimization
export function useSmartCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList = [],
  options: SmartCallbackOptions = {}
): T {
  const {
    enableProfiling = process.env.NODE_ENV === 'development',
    stableCallback = false
  } = options;

  const callCountRef = useRef(0);
  const lastDepsRef = useRef(deps);

  // Check if dependencies actually changed
  const depsChanged = !shallowEqual(
    lastDepsRef.current as any,
    deps as any
  );
  
  if (enableProfiling && depsChanged) {
    callCountRef.current++;
    performanceMonitor.recordMetric('useCallback-recreation', 1, {
      callCount: callCountRef.current,
      dependencyCount: deps.length
    });
  }

  lastDepsRef.current = deps;

  // If stableCallback is true, create a stable reference
  const stableCallbackRef = useRef<T | undefined>(undefined);
  if (stableCallback) {
    stableCallbackRef.current = callback;
    return useCallback((...args: Parameters<T>) => 
      stableCallbackRef.current!(...args), []
    ) as T;
  }

  return useCallback(callback, deps);
}

// Performance monitoring hook for components
export function usePerformanceProfiler(
  componentName: string,
  options: PerformanceProfilerOptions = {}
) {
  const {
    trackRenders = true,
    trackUpdates = true,
    logThreshold = PERFORMANCE_THRESHOLDS.SLOW_RENDER_TIME
  } = options;

  const renderCount = useRef(0);
  const updateCount = useRef(0);
  const mountTime = useRef(performance.now());
  const lastRenderTime = useRef(0);

  // Track renders
  useEffect(() => {
    if (!trackRenders) return;

    const renderTime = performance.now() - lastRenderTime.current;
    renderCount.current++;

    if (renderTime > logThreshold) {
      logger.warn('Slow render', {
        component: componentName,
        renderTime,
        renderCount: renderCount.current
      });
    }

    performanceMonitor.recordMetric('component-render', renderTime, {
      component: componentName,
      renderCount: renderCount.current
    });
  });

  // Track updates
  useEffect(() => {
    if (!trackUpdates) return;
    
    updateCount.current++;
    performanceMonitor.recordMetric('component-update', 1, {
      component: componentName,
      updateCount: updateCount.current
    });
  });

  // Track mount time
  useEffect(() => {
    const mountDuration = performance.now() - mountTime.current;
    performanceMonitor.recordMetric('component-mount-time', mountDuration, {
      component: componentName
    });

    return () => {
      const unmountTime = performance.now();
      const lifespan = unmountTime - mountTime.current;
      performanceMonitor.recordMetric('component-lifespan', lifespan, {
        component: componentName,
        renderCount: renderCount.current,
        updateCount: updateCount.current
      });
    };
  }, [componentName]);

  lastRenderTime.current = performance.now();

  return {
    renderCount: renderCount.current,
    updateCount: updateCount.current,
    mountTime: mountTime.current
  };
}

// Optimized list rendering hook
export function useOptimizedList<T>(
  items: T[],
  renderItem: (item: T, index: number) => ReactElement,
  options: OptimizedListOptions<T> = {}
) {
  const {
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5,
    keyExtractor = (item: T, index: number) => 
      (item as any).id || index
  } = options;

  const [startIndex, setStartIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible items
  const visibleItems = useMemo((): VisibleItem<T>[] => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const end = Math.min(items.length, start + visibleCount);
    
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      key: keyExtractor(item, start + index)
    }));
  }, [items, scrollTop, itemHeight, containerHeight, overscan, keyExtractor]);

  // Scroll handler
  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll,
    containerProps: {
      style: { height: containerHeight, overflowY: 'auto' as const },
      onScroll: handleScroll
    }
  };
}

// Bundle size analyzer utility
export function analyzeBundleSize<P extends object>(
  componentName: string,
  Component: ComponentType<P>
): ComponentType<P> {
  if (process.env.NODE_ENV !== 'development') return Component;

  // Estimate component size
  const componentString = Component.toString();
  const estimatedSize = new Blob([componentString]).size;

  performanceMonitor.recordMetric('component-bundle-size', estimatedSize, {
    component: componentName,
    complexity: componentString.split('\n').length
  });

  if (estimatedSize > 5000) { // 5KB threshold
    logger.warn('Large component detected', {
      component: componentName,
      estimatedSize,
      suggestion: 'Consider code splitting or reducing component complexity'
    });
  }

  return Component;
}

// Automatic optimization suggestions
export function useOptimizationSuggestions(componentName: string): OptimizationSuggestion[] {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  
  useEffect(() => {
    const checkOptimizations = () => {
      const allMetrics = performanceMonitor.getMetrics();
      
      // Handle the case where getMetrics returns an array
      if (Array.isArray(allMetrics)) {
        return;
      }
      
      const componentMetrics = Object.entries(allMetrics)
        .filter(([key]) => key.includes(componentName))
        .reduce((acc, [key, values]) => {
          acc[key] = values;
          return acc;
        }, {} as Record<string, any[]>);

      const newSuggestions: OptimizationSuggestion[] = [];

      // Check render performance
      const renderTimes = componentMetrics['component-render-time'] || [];
      if (renderTimes.length > 0) {
        const avgRenderTime = renderTimes.reduce((sum, m) => sum + m.value, 0) / renderTimes.length;
        if (avgRenderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME) {
          newSuggestions.push({
            type: 'performance',
            severity: 'warning',
            message: `${componentName} has slow render times (${avgRenderTime.toFixed(2)}ms avg)`,
            suggestions: [
              'Add React.memo',
              'Optimize expensive calculations with useMemo',
              'Split component into smaller parts'
            ]
          });
        }
      }

      // Check update frequency
      const updates = componentMetrics['component-update'] || [];
      if (updates.length > 10) {
        newSuggestions.push({
          type: 'updates',
          severity: 'info',
          message: `${componentName} updates frequently (${updates.length} times)`,
          suggestions: [
            'Check if all props changes are necessary',
            'Use useCallback for event handlers',
            'Consider component splitting'
          ]
        });
      }

      setSuggestions(newSuggestions);
    };

    // Check optimizations after component has had time to render
    const timer = setTimeout(checkOptimizations, 5000);
    return () => clearTimeout(timer);
  }, [componentName]);

  return suggestions;
}

// HOC for automatic optimization
export function withOptimizations<P extends object>(
  Component: ComponentType<P>,
  options: WithOptimizationsOptions = {}
): ComponentType<P> {
  const {
    enableMemo = true,
    enableProfiling = process.env.NODE_ENV === 'development',
    enableSuggestions = true
  } = options;

  const componentName = Component.displayName || Component.name || 'Component';
  
  let OptimizedComponent: ComponentType<P> = Component;
  
  if (enableMemo) {
    OptimizedComponent = autoMemo(OptimizedComponent, undefined, { 
      enableProfiling,
      displayName: componentName 
    }) as ComponentType<P>;
  }

  if (enableProfiling || enableSuggestions) {
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
      if (enableProfiling) {
        usePerformanceProfiler(componentName);
      }
      
      if (enableSuggestions) {
        const suggestions = useOptimizationSuggestions(componentName);
        if (suggestions.length > 0) {
          logger.debug(`Optimization Suggestions for ${componentName}`);
          suggestions.forEach(suggestion => {
            logger.debug(`${suggestion.severity.toUpperCase()}: ${suggestion.message}`, { suggestions: suggestion.suggestions });
          });
        }
      }
      
      return React.createElement(OptimizedComponent, { ...props, ref } as P);
    });

    WrappedComponent.displayName = `Optimized(${componentName})`;
    return WrappedComponent as unknown as ComponentType<P>;
  }

  return OptimizedComponent;
}

export default {
  autoMemo,
  useSmartMemo,
  useSmartCallback,
  usePerformanceProfiler,
  useOptimizedList,
  analyzeBundleSize,
  useOptimizationSuggestions,
  withOptimizations
};