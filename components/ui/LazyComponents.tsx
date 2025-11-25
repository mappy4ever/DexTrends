import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from './SkeletonLoadingSystem';

// Loading components for different types of content
const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
      <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
      <Skeleton variant="rectangular" width="100%" height={120} animation="wave" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
      <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />
    </div>
  </div>
);

const ModalSkeleton = () => (
  <div className="space-y-4">
    <Skeleton variant="text" width="60%" height={32} animation="wave" />
    <div className="space-y-2">
      <Skeleton variant="text" width="100%" height={20} animation="wave" />
      <Skeleton variant="text" width="80%" height={20} animation="wave" />
      <Skeleton variant="text" width="90%" height={20} animation="wave" />
    </div>
    <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
  </div>
);

const FormSkeleton = () => (
  <div className="space-y-4">
    <Skeleton variant="text" width="30%" height={24} animation="wave" />
    <Skeleton variant="rectangular" width="100%" height={40} animation="wave" />
    <Skeleton variant="text" width="30%" height={24} animation="wave" />
    <Skeleton variant="rectangular" width="100%" height={40} animation="wave" />
    <Skeleton variant="rectangular" width="120px" height={40} animation="wave" />
  </div>
);

// Dashboard Components - Removed in Stage 5, replaced with simple div placeholders
export const MarketInsightsDashboard = () => (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Market Insights</h3>
    <p className="text-gray-600 dark:text-gray-400">Market data display coming soon</p>
  </div>
);

export const DataAnalyticsDashboard = () => (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Data Analytics</h3>
    <p className="text-gray-600 dark:text-gray-400">Analytics display coming soon</p>
  </div>
);

export const PerformanceDashboard = () => (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
    <p className="text-gray-600 dark:text-gray-400">Performance metrics coming soon</p>
  </div>
);

// PortfolioManager removed - unused component

// PriceIntelligenceSystem removed - unused component
// Use individual price components instead

// CollectionTracker removed in Stage 7 - use CollectionManager instead

// Modal and Overlay Components
// AdvancedModalSystem removed - using unified Modal
// export const AdvancedModalSystem = dynamic(
//   () => import('./AdvancedModalSystem').then(mod => ({ default: mod.default.ModalProvider })),
//   {
//     loading: () => <ModalSkeleton />,
//     ssr: false
//   }
// );

export const EnhancedCardModal = dynamic(
  () => import('./EnhancedCardModal'),
  {
    loading: () => <ModalSkeleton />,
    ssr: false
  }
);

// CardSharingSystem removed in Stage 7 - use share functionality in card components

// Complex Form Components
// AdvancedDeckBuilder removed in Stage 10 - use DeckBuilder or PocketDeckBuilder instead
// export const AdvancedDeckBuilder = dynamic(
//   () => import('./AdvancedDeckBuilder'),
//   {
//     loading: () => <FormSkeleton />,
//     ssr: false
//   }
// );

export const PocketDeckBuilder = dynamic(
  () => import('./PocketDeckBuilder'),
  {
    loading: () => <FormSkeleton />,
    ssr: false
  }
);

// AdvancedSearchSystem removed in Stage 10 - use UnifiedSearchBar or EnhancedSearch instead
// export const AdvancedSearchSystem = dynamic(
//   () => import('./AdvancedSearchSystem'),
//   {
//     loading: () => <FormSkeleton />,
//     ssr: false
//   }
// );

// Animation and Interactive Components
export const PackOpening = dynamic(
  () => import('./PackOpening'),
  {
    loading: () => <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />,
    ssr: false
  }
);

export const AchievementSystem = dynamic(
  () => import('./AchievementSystem'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false
  }
);

// Team Builder Components
export const EVHeatMap = dynamic(
  () => import('../team-builder/EVHeatMap'),
  {
    loading: () => <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />,
    ssr: false
  }
);

export const TeamSynergyGraph = dynamic(
  () => import('../team-builder/TeamSynergyGraph'),
  {
    loading: () => <Skeleton variant="rectangular" width="100%" height={400} animation="wave" />,
    ssr: false
  }
);

// Pokemon Visualization Components
export const TypeEffectivenessWheel = dynamic(
  () => import('../pokemon/TypeEffectivenessWheel'),
  {
    loading: () => <Skeleton variant="circular" width={300} height={300} animation="wave" />,
    ssr: false
  }
);

// PokemonStatRadar removed - replaced with simple stat display
export const PokemonStatRadar = ({ stats }: { stats: any }) => (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Pokemon Stats</h3>
    <div className="space-y-2">
      {stats && Object.entries(stats).map(([key, value]: [string, any]) => (
        <div key={key} className="flex justify-between">
          <span className="capitalize">{key}:</span>
          <span className="font-bold">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

// Chart Components
export const PriceHistoryChart = dynamic(
  () => import('./charts/PriceHistoryChart'),
  {
    loading: () => <Skeleton variant="rectangular" width="100%" height={280} animation="wave" />,
    ssr: false
  }
);

export const PokemonRadarChart = dynamic(
  () => import('../pocket/PokemonRadarChart'),
  {
    loading: () => <Skeleton variant="circular" width={250} height={250} animation="wave" />,
    ssr: false
  }
);

// Heavy Animation Components  
export const PokemonTypeWheel = dynamic(
  () => import('../pocket/PokemonTypeWheel'),
  {
    loading: () => <Skeleton variant="circular" width={300} height={300} animation="wave" />,
    ssr: false
  }
);

export const PokemonEvolutionFlow = dynamic(
  () => import('../pocket/PokemonEvolutionFlow'),
  {
    loading: () => <Skeleton variant="rectangular" width="100%" height={300} animation="wave" />,
    ssr: false
  }
);

// Battle Simulator Components - Removed (component doesn't exist)

// Large Feature Components  
// EnhancedPokemonSelector removed in Stage 6 consolidation - use PokemonFormSelector instead

// Third-party heavy components wrapper
export const LazyVirtualizedGrid = dynamic(
  () => import('./VirtualizedCardGrid'),
  {
    loading: () => <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" width="100%" height={200} animation="wave" />
      ))}
    </div>,
    ssr: false
  }
);

// Utility function to wrap any component with Suspense and loading state
export const withLazyLoading = <T extends Record<string, any>>(
  importFunc: () => Promise<{ default: React.ComponentType<T> }>,
  LoadingComponent: React.ComponentType = () => <Skeleton variant="rectangular" width="100%" height={200} animation="wave" />
) => {
  const LazyComponent = dynamic(importFunc, {
    loading: () => <LoadingComponent />,
    ssr: false
  });
  
  return (props: T) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};