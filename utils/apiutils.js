// utils/apiutils.js
import cacheManager, { cachedFetchData, pokemonCache, tcgCache, CONFIG } from './UnifiedCacheManager';

// Legacy fetchData function (now with unified caching)
export async function fetchData(url, options = {}) {
  try {
    // Use cached version for GET requests (most common)
    if (!options.method || options.method.toUpperCase() === 'GET') {
      return await cachedFetchData(url, options);
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

// Export unified cache components
export { cacheManager, pokemonCache, tcgCache, cachedFetchData, CONFIG };

// Pokemon-specific fetch functions with optimized caching
export const fetchPokemon = async (id) => {
  return pokemonCache.getPokemon(id);
};

export const fetchPokemonSpecies = async (id) => {
  return pokemonCache.getSpecies(id);
};

export const fetchNature = async (name) => {
  const key = cacheManager.generateKey('nature', { name });
  return cacheManager.cachedFetch(
    `https://pokeapi.co/api/v2/nature/${name}`,
    async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/nature/${name}`);
      if (!response.ok) throw new Error(`Failed to fetch nature ${name}`);
      return response.json();
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

export const fetchMove = async (name) => {
  const key = cacheManager.generateKey('move', { name });
  return cacheManager.cachedFetch(
    `https://pokeapi.co/api/v2/move/${name}`,
    async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
      if (!response.ok) throw new Error(`Failed to fetch move ${name}`);
      return response.json();
    },
    { priority: CONFIG.PRIORITY.HIGH }
  );
};

// TCG-specific fetch functions with aggressive caching
export const fetchTCGCards = async (pokemonName) => {
  return tcgCache.getCards(pokemonName);
};

export const fetchPocketCards = async (pokemonName) => {
  const key = cacheManager.generateKey('pocket-cards', { name: pokemonName });
  return cacheManager.cachedFetch(
    `pocket-${pokemonName}`,
    async () => {
      // Implementation for pocket cards fetch
      const response = await fetch(`/api/pocket-cards?name=${encodeURIComponent(pokemonName)}`);
      if (!response.ok) throw new Error(`Failed to fetch pocket cards for ${pokemonName}`);
      return response.json();
    },
    { priority: CONFIG.PRIORITY.CRITICAL, ttl: CONFIG.DB_TTL }
  );
};