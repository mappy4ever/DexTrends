// Advanced caching system for Pokemon APIs
import type { Pokemon, PokemonSpecies, Nature, Move } from '../types/api/pokemon';
import type { TCGCard } from '../types/api/cards';
import type { PocketCard } from '../types/api/pocket-cards';

interface CacheItem<T> {
  data: T;
  expiry: number;
  timestamp: number;
  version: string;
}

interface CacheStats {
  memoryCache: number;
  localStorage: number;
  totalSize: string;
}

type Fetcher<T> = () => Promise<T>;

class APICache {
  protected memoryCache: Map<string, any>;
  protected lastUpdate: Map<string, number>;

  constructor() {
    this.memoryCache = new Map();
    this.lastUpdate = new Map();
  }

  // Generate cache key from URL or identifier
  generateKey(identifier: string | number): string {
    const strIdentifier = String(identifier);
    if (typeof window !== 'undefined' && 'btoa' in window) {
      return btoa(strIdentifier).replace(/[^a-zA-Z0-9]/g, '');
    }
    // Fallback for Node.js environment
    return Buffer.from(strIdentifier).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  // Set item in localStorage with expiry
  setStorage<T>(key: string, data: T, ttl = 3600000): void { // 1 hour default
    if (typeof window === 'undefined') return;
    
    try {
      const item: CacheItem<T> = {
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(`pokemon_cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache data to localStorage:', error);
    }
  }

  // Get item from localStorage
  getStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`pokemon_cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item) as CacheItem<T>;
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(`pokemon_cache_${key}`);
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  // Main cache getter with fallback strategy
  async get<T>(key: string | number, fetcher: Fetcher<T>, ttl = 3600000): Promise<T> {
    const cacheKey = this.generateKey(key);
    const now = Date.now();
    
    // 1. Check memory cache first (fastest)
    const lastUpdate = this.lastUpdate.get(cacheKey) || 0;
    if (this.memoryCache.has(cacheKey) && (now - lastUpdate) < ttl) {
      return this.memoryCache.get(cacheKey) as T;
    }
    
    // 2. Check localStorage (persistent)
    const stored = this.getStorage<T>(cacheKey);
    if (stored) {
      this.memoryCache.set(cacheKey, stored);
      this.lastUpdate.set(cacheKey, now);
      return stored;
    }
    
    // 3. Fetch fresh data
    try {
      const data = await fetcher();
      this.memoryCache.set(cacheKey, data);
      this.lastUpdate.set(cacheKey, now);
      this.setStorage(cacheKey, data, ttl);
      return data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }

  // Clear specific cache entry
  clear(key: string | number): void {
    const cacheKey = this.generateKey(key);
    this.memoryCache.delete(cacheKey);
    this.lastUpdate.delete(cacheKey);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`pokemon_cache_${cacheKey}`);
    }
  }

  // Clear all cache
  clearAll(): void {
    this.memoryCache.clear();
    this.lastUpdate.clear();
    
    if (typeof window === 'undefined') return;
    
    // Clear localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pokemon_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getStats(): CacheStats {
    const memorySize = this.memoryCache.size;
    const storageKeys = typeof window !== 'undefined' 
      ? Object.keys(localStorage).filter(key => key.startsWith('pokemon_cache_'))
      : [];
    
    return {
      memoryCache: memorySize,
      localStorage: storageKeys.length,
      totalSize: this.estimateStorageSize()
    };
  }

  // Estimate storage usage
  estimateStorageSize(): string {
    if (typeof window === 'undefined') return '0 KB';
    
    let size = 0;
    for (let key in localStorage) {
      if (key.startsWith('pokemon_cache_')) {
        size += localStorage[key].length;
      }
    }
    return `${(size / 1024).toFixed(2)} KB`;
  }
}

// Pokemon-specific cache with optimized TTL
class PokemonCache extends APICache {
  constructor() {
    super();
  }

  // Cache Pokemon data for 24 hours (Pokemon data rarely changes)
  async getPokemon(id: string | number): Promise<Pokemon> {
    return this.get<Pokemon>(
      `pokemon_${id}`,
      () => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Cache Pokemon species for 24 hours
  async getSpecies(id: string | number): Promise<PokemonSpecies> {
    return this.get<PokemonSpecies>(
      `species_${id}`,
      () => fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Cache nature data for 7 days (very stable data)
  async getNature(name: string): Promise<Nature> {
    return this.get<Nature>(
      `nature_${name}`,
      () => fetch(`https://pokeapi.co/api/v2/nature/${name}`).then(r => r.json()),
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
  }

  // Cache move data for 24 hours
  async getMove(name: string): Promise<Move> {
    return this.get<Move>(
      `move_${name}`,
      () => fetch(`https://pokeapi.co/api/v2/move/${name}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Preload popular Pokemon (fire and forget)
  async warmCache(): Promise<void> {
    const popularIds = ['1', '4', '7', '25', '39', '104', '150', '151', '249', '250']; // Starters + Legendaries
    
    try {
      await Promise.allSettled(
        popularIds.map(id => this.getPokemon(id))
      );
      console.log('Pokemon cache warmed with popular Pokemon');
    } catch (error) {
      console.warn('Failed to warm Pokemon cache:', error);
    }
  }
}

// TCG-specific cache with aggressive caching due to strict limits
class TCGCache extends APICache {
  constructor() {
    super();
  }

  // Cache TCG cards for 7 days (strict API limits)
  async getCards(pokemonName: string): Promise<TCGCard[]> {
    return this.get<TCGCard[]>(
      `tcg_${pokemonName.toLowerCase()}`,
      async () => {
        // Only import and use TCG API when needed
        const pokemonTCG = await import('pokemontcgsdk');
        const cards = await pokemonTCG.default.card.where({ q: `name:"${pokemonName}"` });
        return (cards || []) as TCGCard[];
      },
      7 * 24 * 60 * 60 * 1000 // 7 days - aggressive caching
    );
  }

  // Cache Pocket cards for 7 days
  async getPocketCards(pokemonName: string): Promise<PocketCard[]> {
    return this.get<PocketCard[]>(
      `pocket_${pokemonName.toLowerCase()}`,
      async () => {
        const { fetchPocketData } = await import('./pocketData');
        const allCards = await fetchPocketData() as PocketCard[];
        return allCards.filter((card: PocketCard) => 
          card.name.toLowerCase().includes(pokemonName.toLowerCase())
        );
      },
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
  }
}

// Global cache instances
export const pokemonCache = new PokemonCache();
export const tcgCache = new TCGCache();

// Enhanced fetch utility with caching
export const cachedFetchData = async <T = any>(url: string): Promise<T> => {
  return pokemonCache.get<T>(
    url,
    () => fetch(url).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }),
    60 * 60 * 1000 // 1 hour for general API calls
  );
};

// Initialize cache warmup on app start
if (typeof window !== 'undefined') {
  // Warm cache after a short delay to not block initial render
  setTimeout(() => {
    pokemonCache.warmCache();
  }, 2000);
}

export default { pokemonCache, tcgCache, cachedFetchData };