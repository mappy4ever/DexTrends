// utils/apiutils.ts
import cacheManager, { cachedFetchData, pokemonCache, tcgCache, CONFIG } from './UnifiedCacheManager';
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

// Sanitize Pokemon names for API calls
export const sanitizePokemonName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[':.\s]/g, '-')
    .replace(/--+/g, '-')
    .replace(/-$/, '');
};

// Fetch options interface
export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Legacy fetchData function (now with unified caching and TypeScript)
export async function fetchData<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  try {
    // Use cached version for GET requests (most common)
    if (!options.method || options.method.toUpperCase() === 'GET') {
      // cachedFetchData doesn't use fetch options directly, it just needs cache options
      // For now, we'll use default cache options since cachedFetchData does its own fetch
      return await cachedFetchData(url) as T;
    }
    
    // For non-GET requests, use direct fetch
    const response = await fetch(url, options);
    if (!response.ok) {
      // Attempt to get more detailed error info, falling back gracefully
      let errorInfo = `Request failed with status ${response.status}`;
      let errorDetails: any;
      
      try {
        const errorBody = await response.text(); // Read as text first
        // Try to parse as JSON for structured error, but don't fail if not JSON
        try {
          const jsonError = JSON.parse(errorBody);
          errorInfo = jsonError.message || jsonError.error || errorBody || errorInfo;
          errorDetails = jsonError;
        } catch (e) {
          // errorBody wasn't JSON, use it as is if not empty
          errorInfo = errorBody || errorInfo;
        }
      } catch (e) {
        // Failed to get error body, stick with status text
        errorInfo = response.statusText || errorInfo;
      }
      
      throw new ApiError(errorInfo, response.status, errorDetails);
    }
    return await response.json() as T;
  } catch (error) {
    // Re-throw error for caller to handle
    if (error instanceof ApiError) {
      throw error;
    }
    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      error
    );
  }
}

// Export unified cache components
export { cacheManager, pokemonCache, tcgCache, cachedFetchData, CONFIG };

// Pokemon-specific fetch functions with optimized caching and proper types
export const fetchPokemon = async (id: string | number): Promise<Pokemon> => {
  return pokemonCache.getPokemon(id);
};

export const fetchPokemonSpecies = async (id: string | number): Promise<PokemonSpecies> => {
  return pokemonCache.getSpecies(id);
};

export const fetchNature = async (name: string): Promise<Nature> => {
  const key = cacheManager.generateKey('nature', { name });
  return cacheManager.cachedFetch<Nature>(
    `https://pokeapi.co/api/v2/nature/${name}`,
    async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/nature/${name}`);
      if (!response.ok) throw new ApiError(`Failed to fetch nature ${name}`, response.status);
      return response.json();
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

export const fetchMove = async (name: string): Promise<Move> => {
  const key = cacheManager.generateKey('move', { name });
  return cacheManager.cachedFetch<Move>(
    `https://pokeapi.co/api/v2/move/${name}`,
    async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
      if (!response.ok) throw new ApiError(`Failed to fetch move ${name}`, response.status);
      return response.json();
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

// TCG-specific fetch functions with aggressive caching
export const fetchTCGCards = async (pokemonName: string): Promise<TCGCard[]> => {
  try {
    // Sanitize the Pokemon name for API compatibility
    const sanitizedName = sanitizePokemonName(pokemonName);
    console.log('[TCG Fetch] Fetching cards for sanitized name:', sanitizedName);
    
    // Use our API endpoint instead of SDK directly
    const key = cacheManager.generateKey('tcg-cards', { name: sanitizedName });
    const cards = await cacheManager.cachedFetch<TCGCard[]>(
      `tcg-${sanitizedName}`,
      async () => {
        const response = await fetch(`/api/tcg-cards?name=${encodeURIComponent(sanitizedName)}`);
        if (!response.ok) {
          throw new ApiError(`Failed to fetch TCG cards for ${sanitizedName}`, response.status);
        }
        const data = await response.json();
        console.log('[TCG Fetch] API returned cards:', data?.length || 0);
        return data || [];
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
    
    console.log('[TCG Fetch] Found TCG cards:', cards?.length || 0);
    return cards || [];
  } catch (error) {
    console.error(`[TCG Fetch] Failed to fetch TCG cards for ${pokemonName}:`, error);
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
        const response = await fetch(`/api/pocket-cards?name=${encodeURIComponent(sanitizedName)}`);
        if (!response.ok) throw new ApiError(`Failed to fetch pocket cards for ${sanitizedName}`, response.status);
        return response.json();
      },
      { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
    );
  } catch (error) {
    console.error(`Failed to fetch pocket cards for ${pokemonName}:`, error);
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