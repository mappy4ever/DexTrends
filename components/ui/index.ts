// Organized UI Components Export

// Card Components
export * from './cards';

// Navigation Components  
export * from './navigation';

// Modal Components
export * from './modals';

// Form Components - Enhanced with animations
export * from './forms';
export { default as EnhancedSearchBox } from './forms/EnhancedSearchBox';
export { default as TypeFilter } from './forms/TypeFilter';
export { default as VisualSearchFilters } from './forms/VisualSearchFilters';

// Progress Indicators
export * from './progress';

// Design System Components
export * from './design-system';

// Layout Components
export { default as ListContainer } from './layout/ListContainer';
export { default as CollectionDashboard } from './layout/CollectionDashboard';

// Loading Components
export * from './loading';

// Animation Components
// Export all except HoverCard to avoid conflict with design-system
export { 
  FadeIn, 
  SlideUp, 
  Scale,
  CardHover, 
  StaggeredChildren,
  Bounce,
  Pulse,
  AnimationProvider,
  PageTransition,
  StaggerContainer,
  StaggerItem,
  FloatingElement,
  RevealElement,
  PulseElement,
  LoadingDots,
  ModalAnimation,
  PressableButton,
  useAnimation
} from './animations';
export { default as AnimationSystem, HoverCard as AnimatedHoverCard } from './animations/AnimationSystem';
export { default as EnhancedAnimationSystem } from './EnhancedAnimationSystem';
export { useEnhancedAnimation } from './EnhancedAnimationSystem.hooks';

// Mobile Components
export * from '../mobile';

// Chart Components
export { default as PriceHistoryChart } from './charts/PriceHistoryChart';
export { default as chartcontainer } from './charts/chartcontainer';

// Common Components (remaining in root)
export { TypeBadge, default as TypeBadgeDefault } from './TypeBadge';
export { default as Tooltip } from './Tooltip';
export { default as ErrorMessage } from './ErrorMessage';
export { default as KpiCard } from './KpiCard';
export { default as LevelTag } from './LevelTag';
export { default as PriceIndicator } from './PriceIndicator';
export { default as PokeballSVG } from './PokeballSVG';
export { FullBleedWrapper, PageBackground } from './FullBleedWrapper';

// Frequently used components
export { default as Button } from './Button';
export { default as UIPanel } from './UIPanel';
export { default as PokeballLoader } from './PokeballLoader';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as StyledBackButton } from './StyledBackButton';
export { default as VirtualizedCardGrid } from './VirtualizedCardGrid';
export { default as PageErrorBoundary } from './PageErrorBoundary';

// System Components
export { default as AccessibilityProvider } from './AccessibilityProvider';
export { default as PerformanceMonitor } from './PerformanceMonitor';
export { default as PremiumComponents } from './PremiumComponents';

// Feedback Components
export { Toast, ToastContainer } from './Toast';
export { ContextMenu, useContextMenu } from './ContextMenu';

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