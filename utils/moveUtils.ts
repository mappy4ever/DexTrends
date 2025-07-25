/**
 * Move handling utilities for Pokemon
 * Optimized and reusable across the application
 */

import { fetchJSON } from './unifiedFetch';
import { extractIdFromUrl } from './pokemonutils';
import logger from './logger';
import type { Move, Pokemon } from '../types/api/pokemon';

// Move-related interfaces
interface MoveReference {
  move: {
    name: string;
    url: string;
  };
  version_group_details: VersionGroupDetail[];
}

interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

interface ProcessedMove {
  name: string;
  id: string;
  url: string;
  level?: number;
}

interface MoveDetails {
  name: string;
  type: string;
  power: number | string;
  accuracy: number | string;
  pp: number | string;
  description: string;
  damageClass: string;
  target: string;
}

interface CachedMove {
  data: any;
  timestamp: number;
}

type MovesByMethod = Record<string, ProcessedMove[]>;
type MoveDetailsMap = Record<string, MoveDetails>;

// Cache for move data
const moveCache = new Map<string, CachedMove>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cached fetch for move data
const cachedFetchData = async <T = any>(url: string): Promise<T> => {
  const now = Date.now();
  const cached = moveCache.get(url);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data as T;
  }
  
  const data = await fetchJSON<T>(url);
  if (!data) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  moveCache.set(url, { data, timestamp: now });
  return data;
};

/**
 * Process Pokemon moves data into grouped format by learn method
 */
export const processPokemonMoves = (pokemonDetails: Partial<Pokemon>): MovesByMethod => {
  if (!pokemonDetails?.moves) return {};
  
  const movesByMethod = pokemonDetails.moves.reduce<MovesByMethod>((acc, moveEntry) => {
    const moveRef = moveEntry as unknown as MoveReference;
    const moveName = moveRef.move.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const learnDetail = moveRef.version_group_details[moveRef.version_group_details.length - 1]; // Use latest
    const method = learnDetail.move_learn_method.name;

    const moveId = extractIdFromUrl(moveRef.move.url);
    if (!moveId) return acc; // Skip if no ID could be extracted

    if (!acc[method]) acc[method] = [];
    
    const displayData: ProcessedMove = { 
      name: moveName, 
      id: moveId,
      url: moveRef.move.url
    };
    
    if (method === 'level-up') {
      displayData.level = learnDetail.level_learned_at;
    }

    acc[method].push(displayData);
    return acc;
  }, {});

  // Sort level-up moves by level
  if (movesByMethod['level-up']) {
    movesByMethod['level-up'].sort((a, b) => (a.level || 0) - (b.level || 0));
  }

  return movesByMethod;
};

/**
 * Fetch detailed information for a single move
 */
export const fetchMoveDetails = async (move: ProcessedMove): Promise<MoveDetails> => {
  try {
    const moveData = await cachedFetchData<Move>(move.url);
    return {
      name: move.name,
      type: moveData.type?.name || 'normal',
      power: moveData.power ?? 'N/A',
      accuracy: moveData.accuracy ?? 'N/A',
      pp: moveData.pp || 'N/A',
      description: moveData.effect_entries?.find(entry => entry.language.name === 'en')?.short_effect || 
                  moveData.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text || 
                  'No description available',
      damageClass: moveData.damage_class?.name || 'status',
      target: moveData.target?.name || 'selected-pokemon'
    };
  } catch (error) {
    console.error(`Failed to fetch move details for ${move.name}:`, error);
    return {
      name: move.name,
      type: 'normal',
      power: 'N/A',
      accuracy: 'N/A', 
      pp: 'N/A',
      description: 'Details unavailable',
      damageClass: 'status',
      target: 'selected-pokemon'
    };
  }
};

/**
 * Fetch detailed information for multiple moves in batches
 */
export const fetchMovesDetailsBatch = async (
  moves: ProcessedMove[], 
  existingDetails: MoveDetailsMap = {}, 
  onProgress: ((details: MoveDetailsMap) => void) | null = null
): Promise<MoveDetailsMap> => {
  const moveDetailsMap = { ...existingDetails };
  const movesToFetch = moves.filter(move => !moveDetailsMap[move.id]);
  
  if (movesToFetch.length === 0) return moveDetailsMap;
  
  logger?.debug(`Fetching details for ${movesToFetch.length} moves...`);
  
  const batchSize = 10;
  
  for (let i = 0; i < movesToFetch.length; i += batchSize) {
    const batch = movesToFetch.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (move) => {
      const details = await fetchMoveDetails(move);
      moveDetailsMap[move.id] = details;
    }));
    
    // Call progress callback if provided
    if (onProgress) {
      onProgress({ ...moveDetailsMap });
    }
    
    // Small delay between batches to be respectful to the API
    if (i + batchSize < movesToFetch.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return moveDetailsMap;
};

/**
 * Get type color classes for move types
 */
export const getMoveTypeColor = (type: string): string => {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    fire: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    water: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    electric: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    grass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ice: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    fighting: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    poison: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ground: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    flying: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    psychic: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    bug: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    ghost: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    dragon: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    dark: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    steel: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    fairy: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
  };
  
  return typeColors[type] || typeColors.normal;
};

/**
 * Get damage class color for moves
 */
export const getDamageClassColor = (damageClass: string): string => {
  const damageClassColors: Record<string, string> = {
    physical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    special: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    status: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };
  
  return damageClassColors[damageClass] || damageClassColors.status;
};

/**
 * Format move learn methods for display
 */
export const formatLearnMethod = (method: string): string => {
  const methodNames: Record<string, string> = {
    'level-up': 'Level Up',
    'machine': 'TM/TR',
    'tutor': 'Move Tutor',
    'egg': 'Egg Moves',
    'stadium-surfing-pikachu': 'Special',
    'light-ball-egg': 'Special Egg',
    'colosseum-purification': 'Purification',
    'xd-shadow': 'Shadow',
    'xd-purification': 'Purification',
    'form-change': 'Form Change'
  };
  
  return methodNames[method] || method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Get move learn method priority for sorting
 */
export const getLearnMethodPriority = (method: string): number => {
  const priorities: Record<string, number> = {
    'level-up': 1,
    'machine': 2,
    'tutor': 3,
    'egg': 4,
    'form-change': 5
  };
  
  return priorities[method] || 99;
};

/**
 * Sort move learn methods by priority
 */
export const sortMovesByMethod = (groupedMoves: MovesByMethod): MovesByMethod => {
  const sortedEntries = Object.entries(groupedMoves)
    .sort(([a], [b]) => getLearnMethodPriority(a) - getLearnMethodPriority(b));
  
  return Object.fromEntries(sortedEntries);
};

/**
 * Filter moves by search query
 */
export const filterMoves = (moves: ProcessedMove[], searchQuery: string): ProcessedMove[] => {
  if (!searchQuery.trim()) return moves;
  
  const query = searchQuery.toLowerCase();
  return moves.filter(move => 
    move.name.toLowerCase().includes(query)
  );
};

/**
 * Clear move cache (useful for memory management)
 */
export const clearMoveCache = (): void => {
  moveCache.clear();
};

export default {
  processPokemonMoves,
  fetchMoveDetails,
  fetchMovesDetailsBatch,
  getMoveTypeColor,
  getDamageClassColor,
  formatLearnMethod,
  getLearnMethodPriority,
  sortMovesByMethod,
  filterMoves,
  clearMoveCache
};