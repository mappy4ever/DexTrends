// Main types export file

// API types
export * from './api/pokemon';
export * from './api/cards';
export * from './api/pocket-cards';
export * from './api/api-responses';

// Component types
export * from './components/common';
export * from './components/events';
export * from './components/navigation';

// Context types
export * from './context/unified-app-context';
export * from './context/favorites';

// Utility types
export * from './utils/cache';
export * from './utils/performance';

// Re-export commonly used types for convenience
export type {
  // Pokemon
  Pokemon,
  SimplePokemon,
  PokemonType,
  PokemonSprites,
  EvolutionChain,
  
  // Cards
  TCGCard,
  SimpleCard,
  CardSet,
  Deck,
  DeckCard,
  CollectionCard,
  
  // Pocket Cards
  PocketCard,
  PocketDeck,
  PocketCollection,
  PocketRarity,
  
  // API
  ApiResponse,
  PaginatedResponse,
  ApiError,
  
  // Components
  BaseComponentProps,
  ComponentSize,
  ColorScheme,
  ButtonProps,
  InputProps,
  ModalProps,
  
  // Events
  ClickHandler,
  ChangeEventHandler,
  SubmitHandler,
  
  // Context
  User,
  ThemeConfig,
  FavoritesState,
  AppState,
  UnifiedAppContextValue,
  
  // Utils
  CacheManager,
  PerformanceMonitor,
  PerformanceMetrics,
} from './index';