/**
 * Dynamic imports for code splitting
 * This file centralizes all dynamic imports to reduce initial bundle size
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Loading component for dynamic imports
const DynamicLoader = ({ children, ...props }) => (
  <div className="flex items-center justify-center p-4" {...props}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    {children && <span className="ml-2 text-sm text-gray-600">{children}</span>}
  </div>
);

// Chart components (heavy dependencies)
export const DynamicEchartsReact = dynamic(
  () => import('echarts-for-react'),
  {
    loading: () => <DynamicLoader>Loading chart...</DynamicLoader>,
    ssr: false // Charts don't need SSR
  }
);

export const DynamicPriceHistoryChart = dynamic(
  () => import('../ui/PriceHistoryChart'),
  {
    loading: () => <DynamicLoader>Loading price chart...</DynamicLoader>,
    ssr: false
  }
);

// Map components (very heavy - leaflet)
export const DynamicReactLeaflet = dynamic(
  () => import('react-leaflet').then(mod => ({ 
    MapContainer: mod.MapContainer,
    TileLayer: mod.TileLayer,
    Marker: mod.Marker,
    Popup: mod.Popup
  })),
  {
    loading: () => <DynamicLoader>Loading map...</DynamicLoader>,
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

// Price alerts component
export const DynamicPriceAlerts = dynamic(
  () => import('../PriceAlerts'),
  {
    loading: () => <DynamicLoader>Loading alerts...</DynamicLoader>
  }
);

// Icons and heavy UI components
export const DynamicFontAwesome = dynamic(
  () => import('@fortawesome/react-fontawesome').then(mod => mod.FontAwesomeIcon),
  {
    loading: () => <span className="inline-block w-4 h-4 bg-gray-200 rounded animate-pulse"></span>,
    ssr: false
  }
);

// Date picker (heavy component)
export const DynamicDatePicker = dynamic(
  () => import('react-datepicker'),
  {
    loading: () => <DynamicLoader>Loading date picker...</DynamicLoader>,
    ssr: false
  }
);

// React Select (heavy component)
export const DynamicReactSelect = dynamic(
  () => import('react-select'),
  {
    loading: () => <DynamicLoader>Loading selector...</DynamicLoader>,
    ssr: false
  }
);

// File processing components
export const DynamicHtml2Canvas = dynamic(
  () => import('html2canvas'),
  {
    loading: () => null,
    ssr: false
  }
);

export const DynamicFileSaver = dynamic(
  () => import('file-saver'),
  {
    loading: () => null,
    ssr: false
  }
);

// Particles effect (decorative, can be loaded later)
export const DynamicParticles = dynamic(
  () => import('react-tsparticles'),
  {
    loading: () => null,
    ssr: false
  }
);

// Framer Motion components (can be loaded on demand)
export const DynamicMotion = {
  div: dynamic(
    () => import('framer-motion').then(mod => mod.motion.div),
    {
      loading: () => <div />,
      ssr: false
    }
  ),
  span: dynamic(
    () => import('framer-motion').then(mod => mod.motion.span),
    {
      loading: () => <span />,
      ssr: false
    }
  ),
  button: dynamic(
    () => import('framer-motion').then(mod => mod.motion.button),
    {
      loading: () => <button />,
      ssr: false
    }
  )
};

// Analytics components (non-critical)
export const DynamicAnalytics = dynamic(
  () => import('@vercel/analytics').then(mod => mod.Analytics),
  {
    loading: () => null,
    ssr: false
  }
);

export const DynamicSpeedInsights = dynamic(
  () => import('@vercel/speed-insights').then(mod => mod.SpeedInsights),
  {
    loading: () => null,
    ssr: false
  }
);

// Error boundary with dynamic loading
export const DynamicErrorBoundary = dynamic(
  () => import('../layout/errorboundary'),
  {
    loading: () => <div>Loading error handler...</div>
  }
);

// Utility function to preload components
export const preloadComponent = (componentImport) => {
  if (typeof window !== 'undefined') {
    componentImport();
  }
};

// Preload critical components on user interaction
export const preloadCriticalComponents = () => {
  // Preload search modal when user starts typing
  preloadComponent(() => import('../AdvancedSearchModal'));
  
  // Preload charts when user visits pages with data
  preloadComponent(() => import('../ui/PriceHistoryChart'));
  
  // Preload analytics when user interacts with data
  preloadComponent(() => import('../MarketAnalytics'));
};

// Component factory for creating dynamically imported components
export const createDynamicComponent = (importFunc, options = {}) => {
  const defaultOptions = {
    loading: () => <DynamicLoader>{options.loadingText || 'Loading...'}</DynamicLoader>,
    ssr: options.ssr !== false // SSR enabled by default unless explicitly disabled
  };

  return dynamic(importFunc, { ...defaultOptions, ...options });
};

export default {
  DynamicEchartsReact,
  DynamicPriceHistoryChart,
  DynamicReactLeaflet,
  DynamicAdvancedSearchModal,
  DynamicMarketAnalytics,
  DynamicCollectionManager,
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