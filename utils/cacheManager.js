// Advanced caching system for Pokemon APIs
class APICache {
  constructor() {
    this.memoryCache = new Map();
    this.lastUpdate = new Map();
  }

  // Generate cache key from URL or identifier
  generateKey(identifier) {
    return typeof identifier === 'string' ? btoa(identifier).replace(/[^a-zA-Z0-9]/g, '') : identifier;
  }

  // Set item in localStorage with expiry
  setStorage(key, data, ttl = 3600000) { // 1 hour default
    try {
      const item = {
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
  getStorage(key) {
    try {
      const item = localStorage.getItem(`pokemon_cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
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
  async get(key, fetcher, ttl = 3600000) {
    const cacheKey = this.generateKey(key);
    const now = Date.now();
    
    // 1. Check memory cache first (fastest)
    const lastUpdate = this.lastUpdate.get(cacheKey) || 0;
    if (this.memoryCache.has(cacheKey) && (now - lastUpdate) < ttl) {
      return this.memoryCache.get(cacheKey);
    }
    
    // 2. Check localStorage (persistent)
    const stored = this.getStorage(cacheKey);
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
  clear(key) {
    const cacheKey = this.generateKey(key);
    this.memoryCache.delete(cacheKey);
    this.lastUpdate.delete(cacheKey);
    localStorage.removeItem(`pokemon_cache_${cacheKey}`);
  }

  // Clear all cache
  clearAll() {
    this.memoryCache.clear();
    this.lastUpdate.clear();
    
    // Clear localStorage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pokemon_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size;
    const storageKeys = Object.keys(localStorage).filter(key => key.startsWith('pokemon_cache_'));
    return {
      memoryCache: memorySize,
      localStorage: storageKeys.length,
      totalSize: this.estimateStorageSize()
    };
  }

  // Estimate storage usage
  estimateStorageSize() {
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
  async getPokemon(id) {
    return this.get(
      `pokemon_${id}`,
      () => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Cache Pokemon species for 24 hours
  async getSpecies(id) {
    return this.get(
      `species_${id}`,
      () => fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Cache nature data for 7 days (very stable data)
  async getNature(name) {
    return this.get(
      `nature_${name}`,
      () => fetch(`https://pokeapi.co/api/v2/nature/${name}`).then(r => r.json()),
      7 * 24 * 60 * 60 * 1000 // 7 days
    );
  }

  // Cache move data for 24 hours
  async getMove(name) {
    return this.get(
      `move_${name}`,
      () => fetch(`https://pokeapi.co/api/v2/move/${name}`).then(r => r.json()),
      24 * 60 * 60 * 1000 // 24 hours
    );
  }

  // Preload popular Pokemon (fire and forget)
  async warmCache() {
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
  async getCards(pokemonName) {
    return this.get(
      `tcg_${pokemonName.toLowerCase()}`,
      async () => {
        // Only import and use TCG API when needed
        const pokemonTCG = await import('pokemontcgsdk');
        const response = await pokemonTCG.default.card.where({ q: `name:"${pokemonName}"` });
        return response.data || [];
      },
      7 * 24 * 60 * 60 * 1000 // 7 days - aggressive caching
    );
  }

  // Cache Pocket cards for 7 days
  async getPocketCards(pokemonName) {
    return this.get(
      `pocket_${pokemonName.toLowerCase()}`,
      async () => {
        const { fetchPocketData } = await import('./pocketData');
        const allCards = await fetchPocketData();
        return allCards.filter(card => 
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
export const cachedFetchData = async (url) => {
  return pokemonCache.get(
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