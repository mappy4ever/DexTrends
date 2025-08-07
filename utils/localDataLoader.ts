// Local Data Loader
// Loads scraped data from local files instead of external APIs

import { useState, useEffect } from 'react';
import logger from '@/utils/logger';

// Types
interface DataPaths {
  gymLeaders: string;
  games: string;
  pokemon: string;
  badges: string;
}

interface GymLeader {
  id: string;
  name: string;
  region: string;
  city: string;
  type: string;
  badge: string;
  image: string;
  team: Pokemon[];
  quote: string;
  description: string;
  generation: number;
}

interface Pokemon {
  id?: string;
  name?: string;
  level?: number;
  [key: string]: any;
}

interface Game {
  id: string;
  title: string;
  region: string;
  platform: string;
  releaseDate: string;
  generation: number;
  images: {
    cover: string;
    logo: string;
    artwork: string[];
  };
  description: string;
  features: string[];
}

interface DataAvailability {
  gymLeaders: boolean;
  games: boolean;
}

interface FilterOptions {
  generation?: number;
  platform?: string;
}

interface UseDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

type DataType = keyof DataPaths;

interface FallbackData {
  gymLeaders: {
    [region: string]: GymLeader[];
  };
  games: Game[];
}

// Local data paths
const DATA_PATHS: DataPaths = {
  gymLeaders: '/data/scraped/gym-leaders',
  games: '/data/scraped/games',
  pokemon: '/data/scraped/pokemon',
  badges: '/data/scraped/badges'
};

// Cache for loaded data
const dataCache = new Map<string, any>();

// Generic data loader function
export async function loadLocalData<T = any>(
  dataType: DataType, 
  fileName: string | null = null
): Promise<T | null> {
  const cacheKey = `${dataType}-${fileName || 'all'}`;
  
  // Check cache first
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey) as T;
  }

  try {
    let url: string;
    if (fileName) {
      url = `${DATA_PATHS[dataType]}/${fileName}`;
    } else {
      url = `${DATA_PATHS[dataType]}/all-${dataType}.json`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${dataType}: ${response.status}`);
    }

    const data: T = await response.json();
    
    // Cache the data
    dataCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    logger.error(`Error loading local data for ${dataType}:`, (error as Error).message);
    return null;
  }
}

// Gym Leaders Data Loader
export class GymLeadersLoader {
  static async loadAll(): Promise<{ [region: string]: GymLeader[] } | null> {
    return await loadLocalData<{ [region: string]: GymLeader[] }>('gymLeaders', 'all-gym-leaders.json');
  }

  static async loadByRegion(region: string): Promise<GymLeader[] | null> {
    return await loadLocalData<GymLeader[]>('gymLeaders', `${region}-gym-leaders.json`);
  }

  static async getAllRegions(): Promise<string[]> {
    const allData = await this.loadAll();
    return allData ? Object.keys(allData) : [];
  }
}

// Games Data Loader
export class GamesLoader {
  static async loadAll(): Promise<Game[] | null> {
    return await loadLocalData<Game[]>('games', 'all-games.json');
  }

  static async loadByGeneration(generation: number): Promise<Game[]> {
    const allGames = await this.loadAll();
    if (!allGames) return [];
    
    return allGames.filter(game => game.generation === generation);
  }

  static async loadByPlatform(platform: string): Promise<Game[]> {
    const allGames = await this.loadAll();
    if (!allGames) return [];
    
    return allGames.filter(game => 
      game.platform.toLowerCase().includes(platform.toLowerCase())
    );
  }
}

// React Hook for Gym Leaders
export function useGymLeaders(region: string | null = null): UseDataReturn<GymLeader[] | { [region: string]: GymLeader[] }> {
  const [data, setData] = useState<GymLeader[] | { [region: string]: GymLeader[] }>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let gymLeaders: GymLeader[] | { [region: string]: GymLeader[] } | null;
        if (region) {
          gymLeaders = await GymLeadersLoader.loadByRegion(region);
        } else {
          gymLeaders = await GymLeadersLoader.loadAll();
        }
        
        setData(gymLeaders || []);
      } catch (err) {
        setError((err as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [region]);

  return { data, loading, error };
}

// React Hook for Games
export function useGames(filterOptions: FilterOptions = {}): UseDataReturn<Game[]> {
  const [data, setData] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let games = await GamesLoader.loadAll();
        
        if (games && filterOptions.generation) {
          games = games.filter(game => game.generation === filterOptions.generation);
        }
        
        if (games && filterOptions.platform) {
          games = games.filter(game => 
            game.platform.toLowerCase().includes(filterOptions.platform!.toLowerCase())
          );
        }
        
        setData(games || []);
      } catch (err) {
        setError((err as Error).message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filterOptions.generation, filterOptions.platform]);

  return { data, loading, error };
}

// Utility to check if local data exists
export async function checkLocalDataAvailability(): Promise<DataAvailability> {
  const checks: DataAvailability = {
    gymLeaders: false,
    games: false
  };

  try {
    // Check gym leaders
    const gymLeadersResponse = await fetch('/data/scraped/gym-leaders/all-gym-leaders.json');
    checks.gymLeaders = gymLeadersResponse.ok;

    // Check games
    const gamesResponse = await fetch('/data/scraped/games/all-games.json');
    checks.games = gamesResponse.ok;

  } catch (error) {
    logger.debug('Local data check failed:', (error as Error).message);
  }

  return checks;
}

// Fallback data in case scraped data is not available
export const fallbackData: FallbackData = {
  gymLeaders: {
    kanto: [
      {
        id: 'brock',
        name: 'Brock',
        region: 'kanto',
        city: 'Pewter City',
        type: 'rock',
        badge: 'Boulder Badge',
        image: '/images/gym-leader-placeholder.svg',
        team: [],
        quote: 'The best defense is a good offense!',
        description: 'The Gym Leader of Pewter City who specializes in Rock-type Pokémon.',
        generation: 1
      },
      {
        id: 'misty',
        name: 'Misty',
        region: 'kanto',
        city: 'Cerulean City',
        type: 'water',
        badge: 'Cascade Badge',
        image: '/images/gym-leader-placeholder.svg',
        team: [],
        quote: 'The tomboyish mermaid!',
        description: 'The Gym Leader of Cerulean City who specializes in Water-type Pokémon.',
        generation: 1
      }
    ]
  },
  games: [
    {
      id: 'pokemon-red-blue',
      title: 'Pokémon Red and Blue',
      region: 'Kanto',
      platform: 'Game Boy',
      releaseDate: '1996',
      generation: 1,
      images: {
        cover: '/images/game-placeholder.svg',
        logo: '/images/game-placeholder.svg',
        artwork: []
      },
      description: 'The games that started it all. Catch and train Pokémon in the Kanto region.',
      features: ['Original 151 Pokémon', 'Turn-based battles', 'Trading via Link Cable']
    }
  ]
};

// Main loader with fallback
export async function loadDataWithFallback(
  dataType: Extract<DataType, 'gymLeaders' | 'games'>, 
  region: string | null = null
): Promise<GymLeader[] | { [region: string]: GymLeader[] } | Game[] | null> {
  const availability = await checkLocalDataAvailability();
  
  if (availability[dataType]) {
    // Load scraped data
    switch (dataType) {
      case 'gymLeaders':
        return region 
          ? await GymLeadersLoader.loadByRegion(region)
          : await GymLeadersLoader.loadAll();
      case 'games':
        return await GamesLoader.loadAll();
      default:
        return null;
    }
  } else {
    // Use fallback data
    logger.warn(`Local ${dataType} data not available, using fallback`);
    if (dataType === 'gymLeaders') {
      return region ? fallbackData.gymLeaders[region] || [] : fallbackData.gymLeaders;
    } else if (dataType === 'games') {
      return fallbackData.games;
    }
    return null;
  }
}

export default {
  loadLocalData,
  GymLeadersLoader,
  GamesLoader,
  useGymLeaders,
  useGames,
  checkLocalDataAvailability,
  loadDataWithFallback,
  fallbackData
};