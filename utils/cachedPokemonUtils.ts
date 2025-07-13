// Cached Pokemon utilities with Supabase integration
import { SupabaseCache } from '../lib/supabase';
import { fetchData } from './apiutils';
import type { Pokemon, PokemonSpecies, PokemonListResponse } from '../types/api/pokemon';
import type { TCGCard } from '../types/api/cards';

// Enhanced Pokemon fetching with Supabase caching
export async function fetchPokemonWithCache(pokemonId: string | number): Promise<Pokemon> {
  const cacheKey = `pokemon_${pokemonId}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(pokemonId);
    if (cachedData) {
      return cachedData as Pokemon;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    const pokemonData = await fetchData<Pokemon>(apiUrl);
    
    // Cache the result
    await SupabaseCache.setCachedPokemon(pokemonId, pokemonData);
    
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
    const cachedData = await SupabaseCache.getCachedPokemon(`species_${pokemonId}`);
    if (cachedData) {
      return cachedData as PokemonSpecies;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
    const speciesData = await fetchData<PokemonSpecies>(apiUrl);
    
    // Cache the result
    await SupabaseCache.setCachedPokemon(`species_${pokemonId}`, speciesData);
    
    return speciesData;
  } catch (error) {
    throw error;
  }
}

// Cached Pokemon list fetching
export async function fetchPokemonListWithCache(limit = 1000, offset = 0): Promise<PokemonListResponse> {
  const cacheKey = `pokemon_list_${limit}_${offset}`;
  const pokemonListId = `list_${limit}_${offset}`;
  
  try {
    // Try to get from cache first
    const cachedData = await SupabaseCache.getCachedPokemon(pokemonListId);
    if (cachedData) {
      return cachedData as PokemonListResponse;
    }

    // If not in cache, fetch from API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const listData = await fetchData<PokemonListResponse>(apiUrl);
    
    // Cache the result for 12 hours (list doesn't change often)
    await SupabaseCache.setCachedPokemon(pokemonListId, listData);
    
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
    await SupabaseCache.setCachedCard(cardId, cardData);
    
    return cardData as TCGCard;
  } catch (error) {
    throw error;
  }
}

// Search filters interface
interface SearchFilters {
  [key: string]: any;
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
    await SupabaseCache.setCachedCard(searchId, searchData);
    
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