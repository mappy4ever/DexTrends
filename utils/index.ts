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
// pokemonSDK removed - migrated to TCGDex (see utils/tcgdex-adapter.ts)
export * from './pocketData';

// === Pokemon-specific utilities ===
// Export existing functions from pokemonutils with aliases where needed
export {
  getOfficialArtworkSpriteUrl as getPokemonOfficialArtwork,
  getGeneration as getGenerationFromId
} from './pokemonutils';
export { sanitizePokemonName } from './pokemonNameSanitizer';
export * from './pokemonHelpers';
export { getTypeUIColors } from './pokemonTheme';
export { tcgTypeColors, typeColors } from './unifiedTypeColors';
export * from './pokemonTypeGradients';
export * from './evolutionUtils';
export * from './moveUtils';

// === UI & Animation utilities ===
export * from './motion';
export { 
  PageLoader, 
  InlineLoader, 
  SectionLoader, 
  ProgressLoader, 
  UnifiedLoader 
} from '../components/ui/SkeletonLoadingSystem';
export * from './cn';
export * from './icons';
export * from './formatters';

// === Performance & Optimization ===
export * from './performanceMonitor';
export * from './requestIdleCallback';
// Import hooks from correct location
export { useDebounce } from '../hooks/useDebounce';
export { useInfiniteScroll } from '../hooks/useInfiniteScroll';

// === State Management & Hooks ===
// Note: These hooks don't exist yet and have been removed

// === Data Processing ===
export * from './typeEffectiveness';
export * from './statCalculations';
// Note: damageCalculator, natureModifiers, searchUtils, teamAnalysis don't exist

// === Theme & Styling ===
export * from './theme';

// === Authentication & Security ===
// Note: auth module doesn't exist yet

// === Analytics & Logging ===
export * from './analyticsEngine';
export * from './logger';

// === Error Handling & Type Guards ===
export * from './typeGuards';

// === Database & Storage ===
// Export from correct location
export * from '../lib/supabase';
// Note: databaseOperations doesn't exist

// === Miscellaneous ===
// Note: These utilities don't exist yet and have been removed

