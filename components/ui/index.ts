// Organized UI Components Export

// Card Components
export * from './cards';

// Navigation Components (empty - navigation removed in consolidation)
// export * from './navigation';

// Modal Components
export * from './modals';

// Form Components
export { default as Select } from './Select';
export { default as Checkbox } from './Checkbox';
export { StandardInput, SearchInput, FormInput } from './StandardInput';
// EnhancedSearchBox and TypeFilter moved/removed in consolidation

// Design System Components
export * from './design-system';

// Layout Components
// ListContainer removed - unused component
export { default as CollectionDashboard } from './layout/CollectionDashboard';

// Loading Components
export * from './loading';
export { CardGridSkeleton as SkeletonLoader } from './Skeleton';

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
// useEnhancedAnimation hook removed - using EnhancedAnimationSystem directly

// Mobile components merged into unified responsive components
export { PullToRefresh } from './gestures/PullToRefresh';

// Chart Components
export { default as PriceHistoryChart } from './charts/PriceHistoryChart';
// chartcontainer removed - unused component

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
// SkeletonLoader export is from ./Skeleton (line 27)
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

// Empty State Components
export { EmptyState, NoSearchResults, EmptyCollection, ErrorState } from './EmptyState';

// Battle Effects
export {
  DamageNumber,
  HitFlash,
  AnimatedHPBar,
  BattleAnnouncement,
  VSBadge,
  TurnIndicator,
  PokemonEntry,
  StatusBadge,
  MoveButton,
  VictoryCelebration
} from './BattleEffects';

// Modern Card Component
export { ModernCard, StatCard, FeatureCard, EmptyStateCard, GradientBorderCard } from './ModernCard';

// Feature Components
export { default as AchievementSystem } from './AchievementSystem';
export { default as PackOpening } from './PackOpening';
export { default as PocketDeckBuilder } from './PocketDeckBuilder';
// RegionalEvolutionHandler removed - unused component
// PokemonEasterEggs removed - unused component
export { default as PokemonSoundEffects } from './PokemonSoundEffects';

// Enhancement Components
export { default as OptimizationEnhancer } from './OptimizationEnhancer';
export { default as UserExperienceEnhancer } from './UserExperienceEnhancer';
// ComparisonFAB removed - unused component