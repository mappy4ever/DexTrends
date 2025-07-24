// Main utility exports for DexTrends
// Organized by category for better developer experience

// === Core API & Data Fetching ===
export { 
  fetchData,
  fetchPokemon,
  fetchPokemonSpecies,
  fetchNature,
  fetchMove,
  fetchTCGCards,
  fetchPocketCards,
  isApiError,
  getErrorMessage,
  getErrorStatus
} from './apiutils';
export * from './unifiedFetch';
export * from './UnifiedCacheManager';
export * from './pokemonSDK';
export * from './pocketData';

// === Pokemon-specific utilities ===
export {
  getPokemonSprite,
  getPokemonOfficialArtwork,
  getShinySprite,
  formatStatName,
  getStatColor,
  calculateCatchRate,
  calculateExperienceToNext,
  getGenerationFromId,
  formatHeight,
  formatWeight,
  getNationalDexNumber,
  getPokemonCry,
  getHiddenPowerType,
  formatPokemonId
} from './pokemonutils';
export { sanitizePokemonName } from './pokemonNameSanitizer';
export * from './pokemonHelpers';
export { getTypeUIColors } from './pokemonTheme';
export { tcgTypeColors, typeColors } from './pokemonTypeColors';
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
export * from './requestIdleCallback';
export * from './useDebounce';
export * from './useInfiniteScroll';
export * from './useIntersectionObserver';
export * from './useMediaQuery';

// === State Management & Hooks ===
export * from './useLocalStorage';
export * from './usePrevious';
export * from './useInterval';
export * from './useOnClickOutside';

// === Data Processing ===
export * from './typeEffectiveness';
export * from './damageCalculator';
export * from './statCalculations';
export * from './natureModifiers';
export * from './searchUtils';
export * from './teamAnalysis';

// === Theme & Styling ===
export * from './theme';

// === Authentication & Security ===
export * from './auth';

// === Analytics & Logging ===
export * from './analytics';
export * from './logger';

// === Error Handling ===
export * from './errorHandling';

// === Database & Storage ===
export * from './supabaseClient';
export * from './databaseOperations';

// === Miscellaneous ===
export * from './getBaseUrl';
export * from './dataCleaner';
export * from './constants';
export * from './generateUniqueId';

// === Deprecated - Use specific imports above ===
// export * from './cacheManager'; // Use UnifiedCacheManager instead