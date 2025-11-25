// Organized UI Components Export

// Card Components
export * from './cards';

// Navigation Components  
// navigation removed - directory doesn't exist

// Modal Components
export * from './modals';

// Form Components - Enhanced with animations
export * from './forms';
export { default as EnhancedSearchBox } from './forms/EnhancedSearchBox';
export { default as TypeFilter } from './forms/TypeFilter';
// VisualSearchFilters removed - unused component

// Progress Indicators
export * from './progress';

// Design System Components - replaced with direct imports
export * from './glass-components';

// Layout Components
// ListContainer removed - unused component
export { default as CollectionDashboard } from './layout/CollectionDashboard';

// Loading Components
export * from './loading';
// Alias for backward compatibility
export { SkeletonGrid as SkeletonLoader } from './Skeleton';
export { SkeletonGrid as CardGridSkeleton } from './Skeleton';

// Animation Components
// Export all animation components
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
// EnhancedAnimationSystem removed in Stage 8 - use AnimationSystem instead
// useEnhancedAnimation removed in Stage 8 - use useAnimation from animations/AnimationSystem.hooks

// Mobile components merged into unified responsive components
export { PullToRefresh } from './gestures/PullToRefresh';

// Chart Components
export { default as PriceHistoryChart } from './charts/PriceHistoryChart';
// chartcontainer removed - component doesn't exist

// Common Components (remaining in root)
export { TypeBadge, default as TypeBadgeDefault } from './TypeBadge';
export { default as Tooltip } from './Tooltip';
export { default as ErrorMessage } from './ErrorMessage';
// KpiCard removed - unused component
// LevelTag removed - unused component
export { default as PriceIndicator } from './PriceIndicator';
export { default as PokeballSVG } from './PokeballSVG';
export { FullBleedWrapper, PageBackground } from './FullBleedWrapper';

// Frequently used components
export { default as Button } from './Button';
// UIPanel removed - unused component
export { default as PokeballLoader } from './PokeballLoader';
// SkeletonLoader removed - use CardGridSkeleton from './Skeleton' instead
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
// RegionalEvolutionHandler removed - unused component
// PokemonEasterEggs removed - unused component
// PokemonSoundEffects removed in Stage 6 - unused component

// Enhancement Components
export { default as OptimizationEnhancer } from './OptimizationEnhancer';
export { default as UserExperienceEnhancer } from './UserExperienceEnhancer';
// ComparisonFAB removed - component doesn't exist