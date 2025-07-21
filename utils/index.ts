// Main utility exports for DexTrends
// Organized by category for better developer experience

// === Core API & Data Fetching ===
export * from './apiutils';
export * from './unifiedFetch';
export * from './UnifiedCacheManager';
export * from './pokemonSDK';
export * from './pocketData';

// === Pokemon-specific utilities ===
export * from './pokemonutils';
export * from './pokemonHelpers';
export * from './pokemonNameSanitizer';
export * from './pokemonTheme';
export * from './pokemonTypeColors';
export * from './pokemonTypeGradients';
export * from './evolutionUtils';
export * from './moveUtils';

// === UI & Animation utilities ===
export * from './motion';
export * from './unifiedLoading';
export * from './cn';
export * from './icons';
export * from './formatters';

// === Performance & Optimization ===
export * from './performanceMonitor';
export * from './componentPreloader';
export * from './imageOptimization';
export * from './batteryOptimization';

// === Mobile & Platform-specific ===
export * from './mobileUtils';
export * from './hapticFeedback';
export * from './iosFixes';

// === Security & Validation ===
export * from './inputValidation';
export * from './securityHeaders';

// === Analytics & Monitoring ===
export * from './logger';
export * from './monitoring';
export * from './analyticsEngine';
export * from './mobileAnalytics';

// === Feature Management ===
export * from './featureFlags';
export * from './deepLinking';

// === Data Processing ===
export * from './dataTools';
export * from './priceDataHelper';
export * from './notificationHelpers';

// Legacy exports (consider migrating away from these)
export * from './cacheManager';
export * from './retryFetch';