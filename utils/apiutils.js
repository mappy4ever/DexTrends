// utils/apiutils.js
import { cachedFetchData } from './cacheManager';

// Legacy fetchData function (now with caching)
export async function fetchData(url, options = {}) {
  try {
    // Use cached version for GET requests (most common)
    if (!options.method || options.method.toUpperCase() === 'GET') {
      return await cachedFetchData(url);
    }
    
    // For non-GET requests, use direct fetch
    const response = await fetch(url, options);
    if (!response.ok) {
      // Attempt to get more detailed error info, falling back gracefully
      let errorInfo = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.text(); // Read as text first
        // Store error body for structured error response
        // Try to parse as JSON for structured error, but don't fail if not JSON
        try {
          const jsonError = JSON.parse(errorBody);
          errorInfo = jsonError.message || jsonError.error || errorBody || errorInfo;
        } catch (e) {
          // errorBody wasn't JSON, use it as is if not empty
          errorInfo = errorBody || errorInfo;
        }
      } catch (e) {
        // Failed to get error body, stick with status text
        errorInfo = response.statusText || errorInfo;
      }
      const error = new Error(errorInfo);
      error.status = response.status; // Attach status code to the error object
      throw error;
    }
    return await response.json();
  } catch (error) {
    // Re-throw error for caller to handle
    throw error; // Re-throw to allow caller to handle
  }
}

// Enhanced API utilities with specific caching strategies
export { pokemonCache, tcgCache, cachedFetchData } from './cacheManager';

// Pokemon-specific fetch functions with optimized caching
export const fetchPokemon = async (id) => {
  const { pokemonCache } = await import('./cacheManager');
  return pokemonCache.getPokemon(id);
};

export const fetchPokemonSpecies = async (id) => {
  const { pokemonCache } = await import('./cacheManager');
  return pokemonCache.getSpecies(id);
};

export const fetchNature = async (name) => {
  const { pokemonCache } = await import('./cacheManager');
  return pokemonCache.getNature(name);
};

export const fetchMove = async (name) => {
  const { pokemonCache } = await import('./cacheManager');
  return pokemonCache.getMove(name);
};

// TCG-specific fetch functions with aggressive caching
export const fetchTCGCards = async (pokemonName) => {
  const { tcgCache } = await import('./cacheManager');
  return tcgCache.getCards(pokemonName);
};

export const fetchPocketCards = async (pokemonName) => {
  const { tcgCache } = await import('./cacheManager');
  return tcgCache.getPocketCards(pokemonName);
};