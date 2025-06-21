// Cached Pokemon utilities with Supabase integration
import { SupabaseCache } from '../lib/supabase';
import { fetchData } from './apiutils';

// Enhanced Pokemon fetching with Supabase caching
export async function fetchPokemonWithCache(pokemonId) {
  const cacheKey = `pokemon_${pokemonId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(pokemonId);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    const pokemonData = await fetchData(apiUrl);
    
    // Cache the result for 24 hours
    await SupabaseCache.setCachedPokemon(pokemonId, pokemonData, cacheKey, 24);
    
    return pokemonData;
  } catch (error) {
    console.error(`Error fetching Pokemon ${pokemonId}:`, error);
    throw error;
  }
}

// Enhanced Pokemon species fetching with caching
export async function fetchPokemonSpeciesWithCache(pokemonId) {
  const cacheKey = `species_${pokemonId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(`species_${pokemonId}`);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
    const speciesData = await fetchData(apiUrl);
    
    // Cache the result for 24 hours
    await SupabaseCache.setCachedPokemon(`species_${pokemonId}`, speciesData, cacheKey, 24);
    
    return speciesData;
  } catch (error) {
    console.error(`Error fetching Pokemon species ${pokemonId}:`, error);
    throw error;
  }
}

// Cached Pokemon list fetching
export async function fetchPokemonListWithCache(limit = 1000, offset = 0) {
  const cacheKey = `pokemon_list_${limit}_${offset}`;
  const pokemonListId = `list_${limit}_${offset}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(pokemonListId);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const listData = await fetchData(apiUrl);
    
    // Cache the result for 12 hours (list doesn't change often)
    await SupabaseCache.setCachedPokemon(pokemonListId, listData, cacheKey, 12);
    
    return listData;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}

// Cached Pokemon card fetching
export async function fetchPokemonCardWithCache(cardId) {
  const cacheKey = `card_${cardId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedCard(cardId);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from Pokemon TCG API
    const pokemon = await import('pokemontcgsdk');
    const cardData = await pokemon.card.find(cardId);
    
    // Cache the result for 24 hours
    await SupabaseCache.setCachedCard(cardId, cardData, cacheKey, 24);
    
    return cardData;
  } catch (error) {
    console.error(`Error fetching Pokemon card ${cardId}:`, error);
    throw error;
  }
}

// Cached Pokemon card search
export async function searchPokemonCardsWithCache(query, filters = {}) {
  // Create a cache key based on query and filters
  const filterString = JSON.stringify(filters);
  const cacheKey = `search_${query}_${Buffer.from(filterString).toString('base64')}`;
  const searchId = `search_${cacheKey}`;
  
  try {
    // Try to get from cache first (shorter cache time for searches)
    const cachedData = await SupabaseCache.getCachedCard(searchId);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, fetch from Pokemon TCG API
    const pokemon = await import('pokemontcgsdk');
    
    const searchQuery = {
      q: query,
      ...filters
    };
    
    const searchData = await pokemon.card.where(searchQuery);
    
    // Cache search results for 1 hour (searches change more frequently)
    await SupabaseCache.setCachedCard(searchId, searchData, cacheKey, 1);
    
    return searchData;
  } catch (error) {
    console.error('Error searching Pokemon cards:', error);
    throw error;
  }
}

// Cache cleanup utility - call this periodically
export async function cleanupPokemonCache() {
  try {
    await SupabaseCache.cleanupExpiredCache();
    console.log('Pokemon cache cleanup completed');
  } catch (error) {
    console.error('Error cleaning up Pokemon cache:', error);
  }
}

// Batch Pokemon fetching with caching
export async function fetchMultiplePokemonWithCache(pokemonIds) {
  const promises = pokemonIds.map(id => fetchPokemonWithCache(id));
  
  try {
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to fetch Pokemon ${pokemonIds[index]}:`, result.reason);
        return null;
      }
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error('Error in batch Pokemon fetch:', error);
    return [];
  }
}

// Pre-cache popular Pokemon (call this on app startup)
export async function precachePopularPokemon() {
  const popularPokemonIds = [
    1, 4, 7, 25, 39, 52, 54, 58, 104, 113, 122, 131, 133, 143, 150, 151, // Gen 1 favorites
    155, 158, 161, 179, 196, 197, 212, 248, 249, 250, // Gen 2 favorites
    255, 258, 261, 302, 380, 381, 384, // Gen 3 favorites
  ];
  
  console.log('Pre-caching popular Pokemon...');
  
  try {
    await fetchMultiplePokemonWithCache(popularPokemonIds);
    console.log('Popular Pokemon pre-cached successfully');
  } catch (error) {
    console.error('Error pre-caching popular Pokemon:', error);
  }
}