// Context types module - extracted from UnifiedAppContext.tsx

export type ThemeMode = 'light' | 'dark';
export type SortDirection = 'asc' | 'desc';
export type ViewType = 'grid' | 'list';
export type CardSize = 'small' | 'regular' | 'large';

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  focusIndicators: boolean;
  autoPlay: boolean;
  skipLinks: boolean;
  altTextAlways: boolean;
}

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  colorContrast: 'normal' | 'high';
  autoplayMedia: boolean;
  tooltips: boolean;
  accessibility: AccessibilitySettings;
}

export interface UserAction {
  action: string;
  timestamp: number;
  page: string;
  [key: string]: unknown;
}

export interface UserBehavior {
  interactionCount: number;
  scrollDepth: number;
  timeOnPage: number;
  lastInteraction: number | null;
  visitCount: number;
  preferredCardView: ViewType;
  favoriteCategories: string[];
  searchHistory: string[];
  recentActions: UserAction[];
  dismissedTooltips: string[];
}

// Favorite item types
export interface FavoritePokemon {
  id: number;
  name: string;
  types?: string[];
  sprite?: string;
  addedAt: number;
}

export interface FavoriteCard {
  id: string;
  name: string;
  set?: {
    id: string;
    name: string;
  };
  images?: {
    small: string;
    large: string;
  };
  addedAt: number;
}

export interface FavoriteDeck {
  id: string;
  name: string;
  format: string;
  cards?: number;
  addedAt: number;
}

export interface FavoritesState {
  pokemon: FavoritePokemon[];
  cards: FavoriteCard[];
  decks: FavoriteDeck[];
}

export interface UserState {
  preferences: UserPreferences;
  favorites: FavoritesState;
  behavior: UserBehavior;
}

export interface SortingState {
  pokemon: { field: string; direction: SortDirection };
  cards: { field: string; direction: SortDirection };
}

export interface ViewSettings {
  pokemonView: ViewType;
  cardSize: CardSize;
  cardView: ViewType;
  showAnimations: boolean;
}

export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: unknown;
}

export interface ContextualHelp {
  showOnboarding: boolean;
  showTooltips: boolean;
  currentStep: number;
  completedTours: string[];
  currentTour: string | null;
}

export interface UIState {
  sorting: SortingState;
  view: ViewSettings;
  modal: ModalState;
  contextualHelp: ContextualHelp;
}

export interface PerformanceMetrics {
  [key: string]: unknown;
}

export interface PerformanceState {
  metrics: PerformanceMetrics;
  monitoring: boolean;
  vitals: PerformanceMetrics;
  apiMetrics: PerformanceMetrics;
  isMonitoring: boolean;
  suggestions: string[];
  testResults: unknown;
}

export interface AppState {
  ui: UIState;
  performance: PerformanceState;
}

export interface LoadingState {
  favorites: boolean;
  theme: boolean;
  view: boolean;
}

export interface State {
  user: UserState;
  app: AppState;
  loading: LoadingState;
}

export interface PersonalizedRecommendations {
  suggestedView: ViewType;
  recommendedCategories: string[];
  suggestedSearches: string[];
  adaptiveLayout: 'advanced' | 'beginner';
}

export interface PerformanceOptimizations {
  enablePrefetching: boolean;
  enableAnimations: boolean;
  lazyLoadImages: boolean;
  virtualizeGrids: boolean;
  cacheStrategy: 'aggressive' | 'conservative';
}

export interface AccessibilityEnhancements {
  focusVisible: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface UnifiedAppContextValue {
  // State
  state: State;
  mounted: boolean;
  
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  updateTheme: (newTheme: ThemeMode) => void;
  
  // Favorites
  favorites: FavoritesState;
  addToFavorites: (type: keyof FavoritesState, item: FavoritePokemon | FavoriteCard | FavoriteDeck) => void;
  removeFromFavorites: (type: keyof FavoritesState, itemId: string | number) => void;
  updateFavorites: (favorites: Partial<FavoritesState>) => void;
  
  // View Settings
  viewSettings: ViewSettings;
  updateViewSettings: (viewSettings: Partial<ViewSettings>) => void;
  
  // Sorting
  sorting: SortingState;
  updateSorting: (sorting: Partial<SortingState>) => void;
  
  // Modal
  modal: ModalState;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Performance
  performance: PerformanceState;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updatePerformanceVitals: (vitals: Partial<PerformanceMetrics>) => void;
  updateApiMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  enablePerformanceMonitoring: () => void;
  disablePerformanceMonitoring: () => void;
  
  // Behavior
  behavior: UserBehavior;
  trackInteraction: () => void;
  trackUserAction: (action: string, data?: Record<string, unknown>) => void;
  
  // UX and Preferences
  userPreferences: UserPreferences;
  updatePreference: (key: keyof UserPreferences, value: unknown) => void;
  updateAccessibilitySettings: (key: keyof AccessibilitySettings, value: unknown) => void;
  
  // Contextual Help and Onboarding
  contextualHelp: ContextualHelp;
  startOnboarding: (tourId: string) => void;
  completeOnboardingStep: () => void;
  completeOnboarding: (tourId: string) => void;
  shouldShowTooltip: (tooltipId: string) => boolean;
  dismissTooltip: (tooltipId: string) => void;
  
  // Personalization
  getPersonalizedRecommendations: () => PersonalizedRecommendations;
  optimizeForPerformance: () => PerformanceOptimizations;
  getAccessibilityEnhancements: () => AccessibilityEnhancements;
  
  // Loading states
  loading: LoadingState;
}