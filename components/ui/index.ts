// Organized UI Components Export

// Card Components
export * from './cards';

// Navigation Components  
export * from './navigation';

// Modal Components
export * from './modals';

// Form Components
export { default as EnhancedSearchBox } from './forms/EnhancedSearchBox';
export { default as TypeFilter } from './forms/TypeFilter';
export { default as VisualSearchFilters } from './forms/VisualSearchFilters';

// Layout Components
export { default as ListContainer } from './layout/ListContainer';
export { default as CollectionDashboard } from './layout/CollectionDashboard';

// Loading Components
export * from './loading';

// Animation Components
export { default as AnimationSystem } from './animations/AnimationSystem';
// Temporarily disable the TypeScript animations export to avoid conflicts
// export * from './animations/animations';

// Chart Components
export { default as PriceHistoryChart } from './charts/PriceHistoryChart';
export { default as chartcontainer } from './charts/chartcontainer';

// Common Components (remaining in root)
export { TypeBadge, TypeBadgeWithIcon, TypeBadgeSelector } from './TypeBadge';
export { default as Tooltip } from './Tooltip';
export { default as ErrorMessage } from './ErrorMessage';
export { default as KpiCard } from './KpiCard';
export { default as LevelTag } from './LevelTag';
export { default as PriceIndicator } from './PriceIndicator';
export { default as PokeballSVG } from './PokeballSVG';
export { FullBleedWrapper, PageBackground } from './FullBleedWrapper';

// Frequently used components
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as PokeballLoader } from './PokeballLoader';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as StyledBackButton } from './StyledBackButton';
export { default as VirtualizedCardGrid } from './VirtualizedCardGrid';
export { default as PageErrorBoundary } from './PageErrorBoundary';

// System Components
export { default as AccessibilityProvider } from './AccessibilityProvider';
export { default as PerformanceMonitor } from './PerformanceMonitor';
export { default as PremiumComponents } from './PremiumComponents';

// Feature Components
export { default as AchievementSystem } from './AchievementSystem';
export { default as PackOpening } from './PackOpening';
export { default as PocketDeckBuilder } from './PocketDeckBuilder';
export * from './RegionalEvolutionHandler';
export { default as PokemonEasterEggs } from './PokemonEasterEggs';
export { default as PokemonSoundEffects } from './PokemonSoundEffects';

// Enhancement Components
export { default as OptimizationEnhancer } from './OptimizationEnhancer';
export { default as UserExperienceEnhancer } from './UserExperienceEnhancer';
export { default as ComparisonFAB } from './ComparisonFAB';