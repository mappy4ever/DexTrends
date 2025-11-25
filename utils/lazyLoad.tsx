import React, { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import logger from '@/utils/logger';

/**
 * Unified Lazy Loading System
 * 
 * Features:
 * - Automatic code splitting
 * - Error boundaries
 * - Loading states
 * - Preloading support
 * - Performance tracking
 */

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  preload?: boolean;
  chunkName?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: Error) => void;
}

// Track loaded components
const loadedComponents = new Set<string>();
const loadingComponents = new Map<string, Promise<void>>();

/**
 * Enhanced lazy loading with error handling
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: Error | undefined;
    
    for (let i = 0; i < retries; i++) {
      try {
        const start = performance.now();
        const module = await importFn();
        const loadTime = performance.now() - start;
        
        logger.debug(`Lazy loaded ${componentName}`, { loadTime });
        loadedComponents.add(componentName);
        
        return module;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Failed to load ${componentName}, attempt ${i + 1}/${retries}`, { error });
        
        // Wait before retry with exponential backoff
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    logger.error(`Failed to load ${componentName} after ${retries} attempts`, { error: lastError });
    throw lastError;
  });
}

/**
 * Wrapper component with Suspense and error boundary
 */
export function LazyBoundary({
  children,
  fallback,
  componentName = 'Component'
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary componentName={componentName}>
      <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Simple error boundary for lazy components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Lazy component error in ${this.props.componentName}`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Failed to load component
          </h3>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Preload a lazy component
 */
export async function preloadComponent(
  importFn: () => Promise<any>,
  componentName: string
): Promise<void> {
  if (loadedComponents.has(componentName)) {
    return;
  }

  if (loadingComponents.has(componentName)) {
    return loadingComponents.get(componentName)!;
  }

  const loadPromise = importFn()
    .then(() => {
      loadedComponents.add(componentName);
      loadingComponents.delete(componentName);
    })
    .catch(error => {
      logger.error(`Failed to preload ${componentName}`, { error });
      loadingComponents.delete(componentName);
      throw error;
    });

  loadingComponents.set(componentName, loadPromise);
  return loadPromise;
}

/**
 * Hook to preload components on hover/focus
 */
export function usePreload(
  importFn: () => Promise<any>,
  componentName: string
) {
  const preload = React.useCallback(() => {
    preloadComponent(importFn, componentName);
  }, [importFn, componentName]);

  return {
    onMouseEnter: preload,
    onFocus: preload,
    onTouchStart: preload
  };
}

/**
 * Lazy load heavy components
 */
export const LazyComponents = {
  // Battle Simulator - removed MobileBattleSimulator in Phase 8
  BattleSimulator: lazyWithRetry(
    () => import('@/pages/battle-simulator'),
    'BattleSimulator'
  ),
  
  // Card Preview Modal
  CardPreviewModal: lazyWithRetry(
    () => import('@/components/ui/Modal'),
    'CardPreviewModal'
  ),
  
  // 3D Card View
  Advanced3DCard: lazyWithRetry(
    () => import('@/components/ui/cards/TCGCard').then(m => ({ default: m.TCGCard })),
    'Advanced3DCard'
  ),
  
  // Pack Opening
  PackOpening: lazyWithRetry(
    () => import('@/components/ui/PackOpening'),
    'PackOpening'
  ),
  
  // Data Analytics - removed in Phase 8
  DataAnalyticsDashboard: lazyWithRetry(
    () => import('@/pages/analytics'),
    'DataAnalyticsDashboard'
  ),
  
  // Social Platform
  SocialPlatform: lazyWithRetry(
    () => import('@/components/ui/SocialPlatform'),
    'SocialPlatform'
  ),
  
  // Collection Dashboard
  CollectionDashboard: lazyWithRetry(
    () => import('@/components/ui/layout/CollectionDashboard'),
    'CollectionDashboard'
  ),
  
  // CardComparisonTool removed - unused component
  // CardComparisonTool: lazyWithRetry(
  //   () => import('@/components/ui/cards/CardComparisonTool'),
  //   'CardComparisonTool'
  // ),
  
  // PriceIntelligenceSystem removed - unused component
  // PriceIntelligenceSystem: lazyWithRetry(
  //   () => import('@/components/ui/PriceIntelligenceSystem'),
  //   'PriceIntelligenceSystem'
  // ),
  
  // Recommendation Engine
  // SmartRecommendationEngine removed - unused component
  // SmartRecommendationEngine: lazyWithRetry(
  //   () => import('@/components/ui/SmartRecommendationEngine'),
  //   'SmartRecommendationEngine'
  // )
};

/**
 * Route-based code splitting
 */
export const LazyPages = {
  // Heavy pages that should be lazy loaded
  BattleSimulatorPage: lazyWithRetry(
    () => import('@/pages/battle-simulator'),
    'BattleSimulatorPage'
  ),
  
  CollectionsPage: lazyWithRetry(
    () => import('@/pages/collections'),
    'CollectionsPage'
  ),
  
  AnalyticsPage: lazyWithRetry(
    () => import('@/pages/analytics'),
    'AnalyticsPage'
  )
};

/**
 * Intersection Observer for lazy loading on scroll
 */
export function useLazyLoad(
  ref: React.RefObject<HTMLElement>,
  onIntersect: () => void,
  options?: IntersectionObserverInit
) {
  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, onIntersect, options]);
}

/**
 * Prefetch components for next likely navigation
 */
export function prefetchNextComponents(currentRoute: string) {
  const prefetchMap: Record<string, (() => Promise<any>)[]> = {
    '/pokedex': [
      () => import('@/components/ui/Modal'), // CardPreviewModal removed
      // () => import('@/components/ui/cards/Advanced3DCard') // removed in Phase 8
    ],
    '/tcgexpansions': [
      () => import('@/components/ui/Modal'), // CardPreviewModal removed
      // () => import('@/components/ui/cards/CardComparisonTool') // removed
    ],
    '/': [
      () => import('@/pages/pokedex'),
      () => import('@/pages/tcgexpansions')
    ]
  };

  const toPrefetch = prefetchMap[currentRoute] || [];
  
  // Prefetch after idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      toPrefetch.forEach(importFn => {
        importFn().catch(error => {
          logger.debug('Prefetch failed', { error });
        });
      });
    });
  }
}