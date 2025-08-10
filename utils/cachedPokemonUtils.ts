// Cached Pokemon utilities with Supabase integration
import { SupabaseCache } from '../lib/supabase';
import { fetchJSON } from './unifiedFetch';
import type { Pokemon, PokemonSpecies, PokemonListResponse } from "../types/pokemon";
import type { TCGCard } from '../types/api/cards';

// Enhanced Pokemon fetching with Supabase caching
export async function fetchPokemonWithCache(pokemonId: string | number): Promise<Pokemon> {
  const cacheKey = `pokemon_${pokemonId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(Number(pokemonId));
    if (cachedData) {
      return cachedData as Pokemon;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    const pokemonData = await fetchJSON<Pokemon>(apiUrl);
    
    if (!pokemonData) {
      throw new Error(`Pokemon with ID ${pokemonId} not found`);
    }
    
    // Cache the result
    await SupabaseCache.setCachedPokemon(Number(pokemonId), pokemonData, `pokemon_${pokemonId}`);
    
    return pokemonData;
  } catch (error) {
    throw error;
  }
}

// Enhanced Pokemon species fetching with caching
export async function fetchPokemonSpeciesWithCache(pokemonId: string | number): Promise<PokemonSpecies> {
  const cacheKey = `species_${pokemonId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(Number(pokemonId));
    if (cachedData) {
      return cachedData as PokemonSpecies;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
    const speciesData = await fetchJSON<PokemonSpecies>(apiUrl);
    
    if (!speciesData) {
      throw new Error(`Pokemon species with ID ${pokemonId} not found`);
    }
    
    // Cache the result
    await SupabaseCache.setCachedPokemon(Number(pokemonId), speciesData, `species_${pokemonId}`);
    
    return speciesData;
  } catch (error) {
    throw error;
  }
}

// Cached Pokemon list fetching
export async function fetchPokemonListWithCache(limit = 1000, offset = 0): Promise<PokemonListResponse> {
  const cacheKey = `pokemon_list_${limit}_${offset}`;
  
  try {
    // For list caching, we'll use a special ID that represents the list
    // Using a large number that's unlikely to conflict with actual Pokemon IDs
    const listCacheId = 9999000 + (limit * 1000) + offset;
    
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(listCacheId);
    if (cachedData) {
      return cachedData as PokemonListResponse;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const listData = await fetchJSON<PokemonListResponse>(apiUrl);
    
    if (!listData) {
      throw new Error(`Failed to fetch Pokemon list`);
    }
    
    // Cache the result for 12 hours (list doesn't change often)
    await SupabaseCache.setCachedPokemon(listCacheId, listData, cacheKey);
    
    return listData;
  } catch (error) {
    throw error;
  }
}

// Cached Pokemon card fetching
export async function fetchPokemonCardWithCache(cardId: string): Promise<TCGCard> {
  const cacheKey = `card_${cardId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedCard(cardId);
    if (cachedData) {
      return cachedData as TCGCard;
    }

    // If not in cache, fetch from Pokemon TCG API
    const pokemon = await import('pokemontcgsdk');
    const cardData = await pokemon.card.find(cardId);
    
    // Cache the result for 24 hours
    await SupabaseCache.setCachedCard(cardId, cardData, `card_${cardId}`);
    
    return cardData as TCGCard;
  } catch (error) {
    throw error;
  }
}

// Search filters interface
interface SearchFilters {
  [key: string]: unknown;
}

// Cached Pokemon card search
export async function searchPokemonCardsWithCache(query: string, filters: SearchFilters = {}): Promise<TCGCard[]> {
  // Create a cache key based on query and filters
  const filterString = JSON.stringify(filters);
  const cacheKey = `search_${query}_${Buffer.from(filterString).toString('base64')}`;
  const searchId = `search_${cacheKey}`;
  
  try {
    // Try to get from cache first (shorter cache time for searches)
    const cachedData = await SupabaseCache.getCachedCard(searchId);
    if (cachedData) {
      return cachedData as TCGCard[];
    }

    // If not in cache, fetch from Pokemon TCG API
    const pokemon = await import('pokemontcgsdk');
    
    const searchQuery = {
      q: query,
      ...filters
    };
    
    const searchData = await pokemon.card.where(searchQuery);
    
    // Cache search results for 1 hour (searches change more frequently)
    await SupabaseCache.setCachedCard(searchId, searchData, searchId);
    
    return searchData as TCGCard[];
  } catch (error) {
    throw error;
  }
}

// Cache cleanup utility - call this periodically
export async function cleanupPokemonCache(): Promise<void> {
  try {
    await SupabaseCache.cleanupExpiredCache();
    // Pokemon cache cleanup completed
  } catch (error) {
    // Error cleaning up Pokemon cache
  }
}

// Batch Pokemon fetching with caching
export async function fetchMultiplePokemonWithCache(pokemonIds: (string | number)[]): Promise<Pokemon[]> {
  const promises = pokemonIds.map(id => fetchPokemonWithCache(id));
  
  try {
    const results = await Promise.allSettled(promises);
    
    return results
      .map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // Failed to fetch Pokemon, returning null
          return null;
        }
      })
      .filter((pokemon): pokemon is Pokemon => pokemon !== null); // Remove null values
  } catch (error) {
    return [];
  }
}

// Pre-cache popular Pokemon (call this on app startup)
export async function precachePopularPokemon(): Promise<void> {
  const popularPokemonIds = [
    1, 4, 7, 25, 39, 52, 54, 58, 104, 113, 122, 131, 133, 143, 150, 151, // Gen 1 favorites
    155, 158, 161, 179, 196, 197, 212, 248, 249, 250, // Gen 2 favorites
    255, 258, 261, 302, 380, 381, 384, // Gen 3 favorites
  ];
  
  try {
    await fetchMultiplePokemonWithCache(popularPokemonIds);
    // Popular Pokemon pre-cached successfully
  } catch (error) {
    // Error pre-caching popular Pokemon
  }
}