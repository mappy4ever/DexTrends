// Local Data Loader
// Loads scraped data from local files instead of external APIs

import { useState, useEffect } from 'react';

// Local data paths
const DATA_PATHS = {
  gymLeaders: '/data/scraped/gym-leaders',
  games: '/data/scraped/games',
  pokemon: '/data/scraped/pokemon',
  badges: '/data/scraped/badges'
};

// Cache for loaded data
const dataCache = new Map();

// Generic data loader function
export async function loadLocalData(dataType, fileName = null) {
  const cacheKey = `${dataType}-${fileName || 'all'}`;
  
  // Check cache first
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  try {
    let url;
    if (fileName) {
      url = `${DATA_PATHS[dataType]}/${fileName}`;
    } else {
      url = `${DATA_PATHS[dataType]}/all-${dataType}.json`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${dataType}: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the data
    dataCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error loading local data for ${dataType}:`, error.message);
    return null;
  }
}

// Gym Leaders Data Loader
export class GymLeadersLoader {
  static async loadAll() {
    return await loadLocalData('gymLeaders', 'all-gym-leaders.json');
  }

  static async loadByRegion(region) {
    return await loadLocalData('gymLeaders', `${region}-gym-leaders.json`);
  }

  static async getAllRegions() {
    const allData = await this.loadAll();
    return allData ? Object.keys(allData) : [];
  }
}

// Games Data Loader
export class GamesLoader {
  static async loadAll() {
    return await loadLocalData('games', 'all-games.json');
  }

  static async loadByGeneration(generation) {
    const allGames = await this.loadAll();
    if (!allGames) return [];
    
    return allGames.filter(game => game.generation === generation);
  }

  static async loadByPlatform(platform) {
    const allGames = await this.loadAll();
    if (!allGames) return [];
    
    return allGames.filter(game => 
      game.platform.toLowerCase().includes(platform.toLowerCase())
    );
  }
}

// React Hook for Gym Leaders
export function useGymLeaders(region = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let gymLeaders;
        if (region) {
          gymLeaders = await GymLeadersLoader.loadByRegion(region);
        } else {
          gymLeaders = await GymLeadersLoader.loadAll();
        }
        
        setData(gymLeaders || []);
      } catch (err) {
        setError(err.message);
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
export function useGames(filterOptions = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            game.platform.toLowerCase().includes(filterOptions.platform.toLowerCase())
          );
        }
        
        setData(games || []);
      } catch (err) {
        setError(err.message);
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
export async function checkLocalDataAvailability() {
  const checks = {
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
    console.log('Local data check failed:', error.message);
  }

  return checks;
}

// Fallback data in case scraped data is not available
export const fallbackData = {
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
export async function loadDataWithFallback(dataType, region = null) {
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
    console.warn(`Local ${dataType} data not available, using fallback`);
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