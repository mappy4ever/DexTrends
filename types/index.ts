// Central type definitions export
// Re-export all type definitions for easy importing

// === API Types ===
export * from './api/pokemon';
export * from './api/cards';
export * from './api/pocket-cards';
export * from './api/api-responses';

// === Component Types ===
export * from './components/common';
export * from './components/events';
export * from './components/navigation';

// === Context Types ===
export * from './context/favorites';
export type { 
  // Theme types
  ThemeMode,
  ThemeColor,
  ThemeConfig,
  // User types
  User,
  UserPreferences,
  NotificationPreferences,
  PrivacySettings,
  DisplayPreferences,
  GameplayPreferences,
  UserStats,
  SubscriptionInfo,
  // Settings types
  AppSettings,
  GeneralSettings,
  AppearanceSettings,
  PerformanceSettings,
  AccessibilitySettings,
  AdvancedSettings,
  // Collection types
  CollectionState,
  CollectionStats,
  CollectionFilters
} from './context/unified-app-context';

// === Utility Types ===
export * from './utils/cache';
export * from './utils/performance';

// === Speech Recognition Types ===
export * from './speech-recognition';

// === Third-party Types ===
// Module declarations are in pokemontcgsdk.d.ts and graphql-subscriptions.d.ts
// They are automatically available when imported

// === Global Types ===
export * from './global';