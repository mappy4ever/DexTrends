/**
 * Component preloader utility for optimizing dynamic imports
 */

import logger from './logger';

class ComponentPreloader {
  constructor() {
    this.preloadedComponents = new Set();
    this.loadingPromises = new Map();
    this.preloadQueue = [];
    this.isProcessingQueue = false;
    this.userInteracted = false;
    
    if (typeof window !== 'undefined') {
      this.initializeUserInteractionTracking();
    }
  }

  /**
   * Track user interactions to optimize preloading timing
   */
  initializeUserInteractionTracking() {
    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    
    const markUserInteraction = () => {
      this.userInteracted = true;
      events.forEach(event => {
        document.removeEventListener(event, markUserInteraction);
      });
      this.processPreloadQueue();
    };

    events.forEach(event => {
      document.addEventListener(event, markUserInteraction, { 
        once: true, 
        passive: true 
      });
    });

    // Auto-trigger after 3 seconds if no interaction
    setTimeout(() => {
      if (!this.userInteracted) {
        markUserInteraction();
      }
    }, 3000);
  }

  /**
   * Preload a component with priority levels
   */
  async preloadComponent(importFunc, priority = 'normal', componentName = 'unknown') {
    const key = importFunc.toString();
    
    if (this.preloadedComponents.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Queue the component if user hasn't interacted yet
    if (!this.userInteracted && priority !== 'critical') {
      this.preloadQueue.push({ importFunc, priority, componentName, key });
      return Promise.resolve();
    }

    return this.loadComponent(importFunc, componentName, key);
  }

  /**
   * Actually load the component
   */
  async loadComponent(importFunc, componentName, key) {
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    const loadingPromise = this.executeImport(importFunc, componentName);
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      this.preloadedComponents.add(key);
      logger.debug(`Component preloaded: ${componentName}`);
      return result;
    } catch (error) {
      logger.error(`Failed to preload component: ${componentName}`, { error });
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  /**
   * Execute the import with error handling
   */
  async executeImport(importFunc, componentName) {
    const startTime = performance.now();
    
    try {
      const module = await importFunc();
      const loadTime = performance.now() - startTime;
      
      logger.debug(`Component loaded in ${loadTime.toFixed(2)}ms: ${componentName}`);
      return module;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      logger.error(`Component failed to load after ${loadTime.toFixed(2)}ms: ${componentName}`, { error });
      throw error;
    }
  }

  /**
   * Process the preload queue in order of priority
   */
  async processPreloadQueue() {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    // Sort by priority: critical > high > normal > low
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    this.preloadQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Process components in batches to avoid blocking
    const batchSize = 3;
    
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, batchSize);
      
      await Promise.allSettled(
        batch.map(({ importFunc, componentName, key }) => 
          this.loadComponent(importFunc, componentName, key)
        )
      );

      // Small delay between batches to avoid blocking main thread
      await new Promise(resolve => setTimeout(resolve, 16)); // ~1 frame
    }

    this.isProcessingQueue = false;
  }

  /**
   * Preload components based on route
   */
  preloadForRoute(route) {
    const routeComponents = {
      '/': [
        () => import('../components/AdvancedSearchModal'),
        () => import('../components/MarketAnalytics'),
      ],
      '/pokedex': [
        () => import('../components/ui/TypeBadge'),
        () => import('../components/ui/PokemonLoadingScreen'),
      ],
      '/cards': [
        () => import('../components/ui/PriceHistoryChart'),
        () => import('../components/ui/PriceIndicator'),
      ],
      '/trending': [
        () => import('../components/ui/PriceHistoryChart'),
        () => import('echarts-for-react'),
      ],
      '/tcgsets': [
        () => import('../components/CardList'),
      ]
    };

    const componentsToPreload = routeComponents[route] || [];
    
    componentsToPreload.forEach((importFunc, index) => {
      const priority = index === 0 ? 'high' : 'normal';
      this.preloadComponent(importFunc, priority, `route-${route}-${index}`);
    });
  }

  /**
   * Preload critical components that are likely to be used
   */
  preloadCriticalComponents() {
    const criticalComponents = [
      {
        import: () => import('../components/ui/Modal'),
        name: 'Modal',
        priority: 'critical'
      },
      {
        import: () => import('../components/ui/LoadingSpinner'),
        name: 'LoadingSpinner',
        priority: 'critical'
      },
      {
        import: () => import('../components/ui/TypeBadge'),
        name: 'TypeBadge',
        priority: 'high'
      }
    ];

    criticalComponents.forEach(({ import: importFunc, name, priority }) => {
      this.preloadComponent(importFunc, priority, name);
    });
  }

  /**
   * Preload components on hover (for interactive elements)
   */
  preloadOnHover(element, importFunc, componentName) {
    if (!element || this.preloadedComponents.has(importFunc.toString())) {
      return;
    }

    const handleMouseEnter = () => {
      this.preloadComponent(importFunc, 'high', componentName);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };

    element.addEventListener('mouseenter', handleMouseEnter, { 
      once: true, 
      passive: true 
    });
  }

  /**
   * Get preload statistics
   */
  getStats() {
    return {
      preloadedCount: this.preloadedComponents.size,
      queuedCount: this.preloadQueue.length,
      loadingCount: this.loadingPromises.size,
      userInteracted: this.userInteracted
    };
  }

  /**
   * Clear preload cache
   */
  clearCache() {
    this.preloadedComponents.clear();
    this.loadingPromises.clear();
    this.preloadQueue.length = 0;
  }
}

// Global instance
const preloader = new ComponentPreloader();

// React hook for component preloading
export const useComponentPreloader = () => {
  return {
    preloadComponent: preloader.preloadComponent.bind(preloader),
    preloadForRoute: preloader.preloadForRoute.bind(preloader),
    preloadCriticalComponents: preloader.preloadCriticalComponents.bind(preloader),
    preloadOnHover: preloader.preloadOnHover.bind(preloader),
    getStats: preloader.getStats.bind(preloader)
  };
};

// Utility functions
export const preloadComponent = (importFunc, priority = 'normal', componentName = 'unknown') => {
  return preloader.preloadComponent(importFunc, priority, componentName);
};

export const preloadForRoute = (route) => {
  return preloader.preloadForRoute(route);
};

export const preloadCriticalComponents = () => {
  return preloader.preloadCriticalComponents();
};

export default preloader;