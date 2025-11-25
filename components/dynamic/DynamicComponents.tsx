/**
 * Dynamic imports for code splitting
 * This file centralizes all dynamic imports to reduce initial bundle size
 */

import dynamic from 'next/dynamic';
import type { DynamicOptions } from 'next/dynamic';
import React, { ReactNode, ComponentType } from 'react';

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
// AdvancedSearchModal removed in Stage 10 - use SearchModal or UnifiedSearchBar instead
// export const DynamicAdvancedSearchModal = dynamic(
//   () => import('../AdvancedSearchModal'),
//   {
//     loading: () => <DynamicLoader>Loading search...</DynamicLoader>
//   }
// );

// MarketAnalytics removed in Stage 7 - use individual analytics components
// export const DynamicMarketAnalytics = dynamic...


// Collection manager (heavy component)
export const DynamicCollectionManager = dynamic(
  () => import('../CollectionManager'),
  {
    loading: () => <DynamicLoader>Loading collection...</DynamicLoader>
  }
);

// Advanced features (currently unused but available for future)
// AdvancedDeckBuilder removed in Stage 10 - use DeckBuilder instead
// export const DynamicAdvancedDeckBuilder = dynamic(
//   () => import('../ui/AdvancedDeckBuilder'),
//   {
//     loading: () => <DynamicLoader>Loading deck builder...</DynamicLoader>,
//     ssr: false
//   }
// );

// TradingMarketplace removed in Stage 7 - functionality merged to collection components
// export const DynamicTradingMarketplace = dynamic...

export const DynamicTournamentSystem = dynamic(
  () => import('../ui/TournamentSystem'),
  {
    loading: () => <DynamicLoader>Loading tournament system...</DynamicLoader>,
    ssr: false
  }
);

// Price alerts component
// PriceAlerts removed in Stage 7 - use price tracking in collection components
// PriceAlerts removed - use DynamicCollectionManager instead
export const DynamicPriceAlerts = DynamicCollectionManager;

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

// Framer Motion components removed in Stage 8 - use LazyMotion directly
// MotionDiv and MotionSpan were just re-exports of motion.div and motion.span
// Use import { motion } from '../ui/LazyMotion' instead
export const DynamicMotion = {
  div: dynamic(
    () => import('../ui/LazyMotion').then(mod => ({ default: mod.motion.div })),
    {
      loading: () => <div />,
      ssr: false
    }
  ) as ComponentType<any>,
  span: dynamic(
    () => import('../ui/LazyMotion').then(mod => ({ default: mod.motion.span })),
    {
      loading: () => <span />,
      ssr: false
    }
  ) as ComponentType<any>,
  button: dynamic(
    () => import('../ui/Button'),
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
  () => import('../ui/ErrorBoundary'),
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
  // preloadComponent(() => import('../AdvancedSearchModal')); // Removed in Stage 10
  
  // Preload charts when user visits pages with data
  preloadComponent(() => import('../ui/charts/PriceHistoryChart'));
  
  // Preload analytics when user interacts with data
  // MarketAnalytics removed in Stage 7
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
  // DynamicAdvancedSearchModal, // Removed in Stage 10
  // DynamicMarketAnalytics removed in Stage 7
  DynamicCollectionManager,
  // DynamicAdvancedDeckBuilder, // Removed in Stage 10
  // DynamicTradingMarketplace removed in Stage 7
  DynamicTournamentSystem,
  // DynamicPriceAlerts removed in Stage 7
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