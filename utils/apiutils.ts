// utils/apiutils.ts
import cacheManager, { cachedFetchData, pokemonCache, tcgCache, CONFIG } from './UnifiedCacheManager';
import { sanitizePokemonName } from './pokemonNameSanitizer';
import { fetchJSON, postJSON } from './unifiedFetch';
import logger from './logger';
import type { Pokemon, PokemonSpecies, Nature, Move } from '../types/api/pokemon';
import type { TCGCard } from '../types/api/cards';
import type { PocketCard } from '../types/api/pocket-cards';
import type { ApiError as ApiErrorType, CachedResponse } from '../types/api/api-responses';

// Custom error class with status code
export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Re-export sanitizePokemonName to maintain backward compatibility
export { sanitizePokemonName };

// Fetch options interface
export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Legacy fetchData function (now using unifiedFetch internally)
export async function fetchData<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
  try {
    // Map FetchOptions to UnifiedFetchOptions
    const result = await fetchJSON<T>(url, {
      timeout: options.timeout || 10000,
      retries: options.retries || 2,
      retryDelay: options.retryDelay || 1000,
      useCache: !options.method || options.method.toUpperCase() === 'GET',
      method: options.method,
      headers: options.headers as Record<string, string>,
      body: options.body,
      throwOnError: false
    });
    
    if (!result) throw new ApiError('No data received', 204);
    return result;
  } catch (error) {
    logger.error('Fetch error in apiutils.ts', { url, error: (error as Error).message });
    throw error;
  }
}

// Export unified cache components
export { cacheManager, pokemonCache, tcgCache, cachedFetchData, CONFIG };

// Pokemon-specific fetch functions with optimized caching and proper types
export const fetchPokemon = async (id: string | number): Promise<Pokemon> => {
  const result = await pokemonCache.getPokemon(id);
  return result as Pokemon;
};

export const fetchPokemonSpecies = async (id: string | number): Promise<PokemonSpecies> => {
  const result = await pokemonCache.getSpecies(id);
  return result as PokemonSpecies;
};

export const fetchNature = async (name: string): Promise<Nature> => {
  const key = cacheManager.generateKey('nature', { name });
  return cacheManager.cachedFetch<Nature>(
    `https://pokeapi.co/api/v2/nature/${name}`,
    async () => {
      const result = await fetchJSON<Nature>(`https://pokeapi.co/api/v2/nature/${name}`, {
        useCache: false, // Let cacheManager handle caching
        timeout: 8000,
        retries: 3 // Nature data is critical for calculations
      });
      if (!result) throw new ApiError(`No nature data received for ${name}`, 204);
      return result;
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

export const fetchMove = async (name: string): Promise<Move> => {
  const key = cacheManager.generateKey('move', { name });
  return cacheManager.cachedFetch<Move>(
    `https://pokeapi.co/api/v2/move/${name}`,
    async () => {
      const result = await fetchJSON<Move>(`https://pokeapi.co/api/v2/move/${name}`, {
        useCache: false, // Let cacheManager handle caching
        timeout: 8000,
        retries: 3 // Move data is critical for battle calculations
      });
      if (!result) throw new ApiError(`No move data received for ${name}`, 204);
      return result;
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

// TCG-specific fetch functions with aggressive caching
export const fetchTCGCards = async (pokemonName: string): Promise<TCGCard[]> => {
  try {
    // Sanitize the Pokemon name for API compatibility
    const sanitizedName = sanitizePokemonName(pokemonName);
    logger.debug('Fetching TCG cards', { pokemonName, sanitizedName });
    
    // Use our API endpoint instead of SDK directly
    const key = cacheManager.generateKey('tcg-cards', { name: sanitizedName });
    const cards = await cacheManager.cachedFetch<TCGCard[]>(
      `tcg-${sanitizedName}`,
      async () => {
        const response = await fetchJSON<{ data: TCGCard[], meta?: any }>(`/api/tcg-cards?name=${encodeURIComponent(sanitizedName)}`, {
          useCache: false, // Let cacheManager handle caching
          timeout: 12000, // Longer timeout for TCG API
          retries: 2
        });
        
        // Handle new API response structure
        const data = response?.data || response || [];
        logger.debug('TCG API response', { 
          sanitizedName, 
          cardCount: Array.isArray(data) ? data.length : 0,
          responseTime: response?.meta?.responseTime 
        });
        return Array.isArray(data) ? data : [];
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
    
    logger.debug('TCG cards retrieved', { pokemonName, cardCount: cards?.length || 0 });
    return cards || [];
  } catch (error) {
    logger.error('Failed to fetch TCG cards', { pokemonName, error });
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const fetchPocketCards = async (pokemonName: string): Promise<PocketCard[]> => {
  try {
    // Sanitize the Pokemon name for API compatibility
    const sanitizedName = sanitizePokemonName(pokemonName);
    
    const key = cacheManager.generateKey('pocket-cards', { name: sanitizedName });
    return await cacheManager.cachedFetch<PocketCard[]>(
      `pocket-${sanitizedName}`,
      async () => {
        // Implementation for pocket cards fetch
        const result = await fetchJSON<PocketCard[]>(`/api/pocket-cards?name=${encodeURIComponent(sanitizedName)}`, {
          useCache: false, // Let cacheManager handle caching
          timeout: 10000,
          retries: 2
        });
        return result || [];
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
  } catch (error) {
    logger.error('Failed to fetch pocket cards', { pokemonName, error });
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

// Type guard for API errors
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// Helper to extract error status
export function getErrorStatus(error: unknown): number {
  if (isApiError(error)) {
    return error.status;
  }
  return 500; // Default to internal server error
}