/**
 * Centralized API Configuration
 * All API endpoints and URLs are defined here using environment variables
 */

// API Base URLs with defaults for development
export const API_CONFIG = {
  // PokeAPI Configuration
  POKEAPI_BASE_URL: process.env.NEXT_PUBLIC_POKEAPI_URL || 'https://pokeapi.co/api/v2',
  
  // Pokemon TCG API Configuration  
  POKEMON_TCG_API_URL: process.env.NEXT_PUBLIC_POKEMON_TCG_API_URL || 'https://api.pokemontcg.io/v2',
  
  // TCGDex API Configuration
  TCGDEX_API_URL: process.env.NEXT_PUBLIC_TCGDEX_API_URL || 'https://api.tcgdex.net/v2',
  
  // Application API URL (for internal API routes)
  APP_API_URL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  
  // Test Environment URL
  TEST_URL: process.env.TEST_URL || 'http://localhost:3001',
  
  // Port Configuration
  PORT: process.env.PORT || '3000',
} as const;

// PokeAPI Endpoints
export const POKEAPI = {
  pokemon: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/pokemon/${idOrName}`,
  species: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/pokemon-species/${idOrName}`,
  ability: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/ability/${idOrName}`,
  move: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/move/${idOrName}`,
  type: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/type/${idOrName}`,
  nature: (name: string) => `${API_CONFIG.POKEAPI_BASE_URL}/nature/${name}`,
  item: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/item/${idOrName}`,
  evolutionChain: (id: number) => `${API_CONFIG.POKEAPI_BASE_URL}/evolution-chain/${id}`,
  generation: (id: number) => `${API_CONFIG.POKEAPI_BASE_URL}/generation/${id}`,
  region: (idOrName: string | number) => `${API_CONFIG.POKEAPI_BASE_URL}/region/${idOrName}`,
  
  // List endpoints
  pokemonList: (limit = 20, offset = 0) => `${API_CONFIG.POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  natureList: () => `${API_CONFIG.POKEAPI_BASE_URL}/nature/`,
  abilityList: (limit = 20, offset = 0) => `${API_CONFIG.POKEAPI_BASE_URL}/ability?limit=${limit}&offset=${offset}`,
  moveList: (limit = 20, offset = 0) => `${API_CONFIG.POKEAPI_BASE_URL}/move?limit=${limit}&offset=${offset}`,
  itemList: (limit = 20, offset = 0) => `${API_CONFIG.POKEAPI_BASE_URL}/item?limit=${limit}&offset=${offset}`,
} as const;

// Pokemon TCG API Endpoints
export const POKEMON_TCG = {
  cards: (query?: string) => {
    const baseUrl = `${API_CONFIG.POKEMON_TCG_API_URL}/cards`;
    return query ? `${baseUrl}?${query}` : baseUrl;
  },
  card: (id: string) => `${API_CONFIG.POKEMON_TCG_API_URL}/cards/${id}`,
  sets: (query?: string) => {
    const baseUrl = `${API_CONFIG.POKEMON_TCG_API_URL}/sets`;
    return query ? `${baseUrl}?${query}` : baseUrl;
  },
  set: (id: string) => `${API_CONFIG.POKEMON_TCG_API_URL}/sets/${id}`,
  types: () => `${API_CONFIG.POKEMON_TCG_API_URL}/types`,
  subtypes: () => `${API_CONFIG.POKEMON_TCG_API_URL}/subtypes`,
  supertypes: () => `${API_CONFIG.POKEMON_TCG_API_URL}/supertypes`,
  rarities: () => `${API_CONFIG.POKEMON_TCG_API_URL}/rarities`,
} as const;

// TCGDex API Endpoints
export const TCGDEX = {
  sets: (lang = 'en') => `${API_CONFIG.TCGDEX_API_URL}/${lang}/sets`,
  set: (id: string, lang = 'en') => `${API_CONFIG.TCGDEX_API_URL}/${lang}/sets/${id}`,
  card: (setId: string, cardId: string, lang = 'en') => `${API_CONFIG.TCGDEX_API_URL}/${lang}/sets/${setId}/${cardId}`,
  serie: (id: string, lang = 'en') => `${API_CONFIG.TCGDEX_API_URL}/${lang}/series/${id}`,
  series: (lang = 'en') => `${API_CONFIG.TCGDEX_API_URL}/${lang}/series`,
} as const;

// Application Internal API Endpoints
export const APP_API = {
  // TCG endpoints
  tcgSets: () => `${API_CONFIG.APP_API_URL}/api/tcgexpansions`,
  tcgSet: (setId: string) => `${API_CONFIG.APP_API_URL}/api/tcgexpansions/${setId}`,
  tcgCards: () => `${API_CONFIG.APP_API_URL}/api/tcg-cards`,
  tcgCard: (cardId: string) => `${API_CONFIG.APP_API_URL}/api/tcg-cards/${cardId}`,
  
  // Price endpoints
  cardPrice: (cardId: string) => `${API_CONFIG.APP_API_URL}/api/cards/${cardId}/price`,
  priceHistory: (cardId: string) => `${API_CONFIG.APP_API_URL}/api/cards/${cardId}/price-history`,
  
  // Pokemon endpoints
  pokemonPrices: () => `${API_CONFIG.APP_API_URL}/api/pokemon-prices`,
  
  // Admin endpoints
  warmCache: () => `${API_CONFIG.APP_API_URL}/api/admin/warm-cache`,
  warmSetsList: () => `${API_CONFIG.APP_API_URL}/api/admin/warm-sets-list`,
  
  // Health check
  health: () => `${API_CONFIG.APP_API_URL}/api/health`,
} as const;

// Test Environment URLs
export const TEST_URLS = {
  base: API_CONFIG.TEST_URL,
  home: () => `${API_CONFIG.TEST_URL}/`,
  pokedex: () => `${API_CONFIG.TEST_URL}/pokedex`,
  pokemon: (id: string | number) => `${API_CONFIG.TEST_URL}/pokedex/${id}`,
  tcgSets: () => `${API_CONFIG.TEST_URL}/tcgexpansions`,
  tcgSet: (setId: string) => `${API_CONFIG.TEST_URL}/tcgexpansions/${setId}`,
  pocketMode: () => `${API_CONFIG.TEST_URL}/pocketmode`,
  battleSimulator: () => `${API_CONFIG.TEST_URL}/battle-simulator`,
  typeEffectiveness: () => `${API_CONFIG.TEST_URL}/type-effectiveness`,
  regions: () => `${API_CONFIG.TEST_URL}/pokemon/regions`,
  region: (regionId: string) => `${API_CONFIG.TEST_URL}/pokemon/regions/${regionId}`,
  starters: () => `${API_CONFIG.TEST_URL}/pokemon/starters`,
  abilities: () => `${API_CONFIG.TEST_URL}/pokemon/abilities`,
  moves: () => `${API_CONFIG.TEST_URL}/pokemon/moves`,
  items: () => `${API_CONFIG.TEST_URL}/pokemon/items`,
} as const;

// Export type for TypeScript support
export type ApiConfig = typeof API_CONFIG;
export type PokeApiEndpoints = typeof POKEAPI;
export type PokemonTcgEndpoints = typeof POKEMON_TCG;
export type TcgDexEndpoints = typeof TCGDEX;
export type AppApiEndpoints = typeof APP_API;
export type TestUrls = typeof TEST_URLS;