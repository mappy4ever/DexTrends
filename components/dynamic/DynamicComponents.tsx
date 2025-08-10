/**
 * Dynamic imports for code splitting
 * This file centralizes all dynamic imports to reduce initial bundle size
 */

import dynamic from 'next/dynamic';
import React, { ReactNode, ComponentType } from 'react';
import type { DynamicOptions } from 'next/dynamic';

// Type definitions
interface DynamicLoaderProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

// Loading component for dynamic imports
const DynamicLoader: React.FC<DynamicLoaderProps> = ({ children, ...props }) => (
  <div className="flex items-center justify-center p-4" {...props}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    {children && <span className="ml-2 text-sm text-gray-600">{children}</span>}
  </div>
);

// Chart components
export const DynamicPriceHistoryChart = dynamic(
  () => import('../ui/charts/PriceHistoryChart'),
  {
    loading: () => <DynamicLoader>Loading price chart...</DynamicLoader>,
    ssr: false
  }
);


// Advanced modals and forms
export const DynamicAdvancedSearchModal = dynamic(
  () => import('../AdvancedSearchModal'),
  {
    loading: () => <DynamicLoader>Loading search...</DynamicLoader>
  }
);

export const DynamicMarketAnalytics = dynamic(
  () => import('../MarketAnalytics'),
  {
    loading: () => <DynamicLoader>Loading analytics...</DynamicLoader>,
    ssr: false
  }
);


// Collection manager (heavy component)
export const DynamicCollectionManager = dynamic(
  () => import('../CollectionManager'),
  {
    loading: () => <DynamicLoader>Loading collection...</DynamicLoader>
  }
);

// Advanced features (currently unused but available for future)
export const DynamicAdvancedDeckBuilder = dynamic(
  () => import('../ui/AdvancedDeckBuilder'),
  {
    loading: () => <DynamicLoader>Loading deck builder...</DynamicLoader>,
    ssr: false
  }
);

export const DynamicTradingMarketplace = dynamic(
  () => import('../ui/TradingMarketplace'),
  {
    loading: () => <DynamicLoader>Loading marketplace...</DynamicLoader>,
    ssr: false
  }
);

export const DynamicTournamentSystem = dynamic(
  () => import('../ui/TournamentSystem'),
  {
    loading: () => <DynamicLoader>Loading tournament system...</DynamicLoader>,
    ssr: false
  }
);

// Price alerts component
export const DynamicPriceAlerts = dynamic(
  () => import('../PriceAlerts'),
  {
    loading: () => <DynamicLoader>Loading alerts...</DynamicLoader>
  }
);

// Icons and heavy UI components
export const DynamicFontAwesome = dynamic(
  () => import('./FontAwesomeIcon'),
  {
    loading: () => <span className="inline-block w-4 h-4 bg-gray-200 rounded animate-pulse"></span>,
    ssr: false
  }
) as ComponentType<any>; // FontAwesome icon component

// Date picker (heavy component)
export const DynamicDatePicker = dynamic(
  () => import('react-datepicker').then(mod => ({ default: mod.default })),
  {
    loading: () => <DynamicLoader>Loading date picker...</DynamicLoader>,
    ssr: false
  }
) as ComponentType<any>;

// React Select (heavy component)
export const DynamicReactSelect = dynamic(
  () => import('react-select').then(mod => ({ default: mod.default })),
  {
    loading: () => <DynamicLoader>Loading selector...</DynamicLoader>,
    ssr: false
  }
) as ComponentType<any>; // react-select component

// File processing components - These are not React components but utilities
// Commenting out dynamic imports for non-component libraries
// Use regular imports in components that need these utilities
export const DynamicHtml2Canvas = null; // Use regular import instead
export const DynamicFileSaver = null; // Use regular import instead

// Particles effect (decorative, can be loaded later)
export const DynamicParticles = dynamic(
  () => import('@tsparticles/react').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false
  }
);

// Framer Motion components (can be loaded on demand)
export const DynamicMotion = {
  div: dynamic(
    () => import('./MotionDiv'),
    {
      loading: () => <div />,
      ssr: false
    }
  ) as ComponentType<any>,
  span: dynamic(
    () => import('./MotionSpan'),
    {
      loading: () => <span />,
      ssr: false
    }
  ) as ComponentType<any>,
  button: dynamic(
    () => import('./MotionButton'),
    {
      loading: () => <button />,
      ssr: false
    }
  ) as ComponentType<any>
};

// Analytics components (non-critical)
export const DynamicAnalytics = dynamic(
  () => import('./Analytics'),
  {
    loading: () => null,
    ssr: false
  }
);

export const DynamicSpeedInsights = dynamic(
  () => import('./SpeedInsights'),
  {
    loading: () => null,
    ssr: false
  }
);

// Error boundary with dynamic loading
export const DynamicErrorBoundary = dynamic(
  () => import('../layout/ErrorBoundary'),
  {
    loading: () => <div>Loading error handler...</div>
  }
);

// Utility function to preload components
export const preloadComponent = (componentImport: () => Promise<unknown>) => {
  if (typeof window !== 'undefined') {
    componentImport();
  }
};

// Preload critical components on user interaction
export const preloadCriticalComponents = () => {
  // Preload search modal when user starts typing
  preloadComponent(() => import('../AdvancedSearchModal'));
  
  // Preload charts when user visits pages with data
  preloadComponent(() => import('../ui/charts/PriceHistoryChart'));
  
  // Preload analytics when user interacts with data
  preloadComponent(() => import('../MarketAnalytics'));
};

// Component factory for creating dynamically imported components
interface CreateDynamicComponentOptions extends Partial<DynamicOptions<ComponentType<any>>> {
  loadingText?: string;
}

export const createDynamicComponent = (
  importFunc: () => Promise<{ default: ComponentType<any> }>, 
  options: CreateDynamicComponentOptions = {}
) => {
  const defaultOptions: DynamicOptions<ComponentType<any>> = {
    loading: () => <DynamicLoader>{options.loadingText || 'Loading...'}</DynamicLoader>,
    ssr: options.ssr !== false // SSR enabled by default unless explicitly disabled
  };

  return dynamic(importFunc, { ...defaultOptions, ...options });
};

export default {
  DynamicPriceHistoryChart,
  DynamicAdvancedSearchModal,
  DynamicMarketAnalytics,
  DynamicCollectionManager,
  DynamicAdvancedDeckBuilder,
  DynamicTradingMarketplace,
  DynamicTournamentSystem,
  DynamicPriceAlerts,
  DynamicFontAwesome,
  DynamicDatePicker,
  DynamicReactSelect,
  DynamicHtml2Canvas,
  DynamicFileSaver,
  DynamicParticles,
  DynamicMotion,
  DynamicAnalytics,
  DynamicSpeedInsights,
  DynamicErrorBoundary,
  preloadComponent,
  preloadCriticalComponents,
  createDynamicComponent
};