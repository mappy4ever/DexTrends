import type { 
  Pokemon, 
  PokemonStat, 
  Nature, 
  CalculatorSettings,
  BreedingData,
  PokemonSpecies
} from '../types/api/pokemon';

/**
 * Calculate a Pokemon's stat with EVs, IVs, and Nature modifiers
 * @param baseStat - The base stat value
 * @param statName - Name of the stat (hp, attack, etc.)
 * @param settings - Calculator settings including level, nature, EVs, and IVs
 * @param natureData - Nature data for stat modifiers
 * @returns Calculated stat value
 */
export function calculateStatWithModifiers(
  baseStat: number,
  statName: string,
  settings: CalculatorSettings,
  natureData?: Nature | null
): number {
  const iv = settings.ivs[statName as keyof typeof settings.ivs] || 31;
  const ev = settings.evs[statName as keyof typeof settings.evs] || 0;
  const level = settings.level;
  
  // HP calculation is different
  if (statName === 'hp') {
    if (baseStat === 1) return 1; // Shedinja special case
    return Math.floor(((2 * baseStat + iv + ev / 4) * level / 100) + level + 10);
  }
  
  // Other stats
  let natureModifier = 1.0;
  if (natureData) {
    if (natureData.increased_stat?.name === statName) natureModifier = 1.1;
    else if (natureData.decreased_stat?.name === statName) natureModifier = 0.9;
  }
  
  return Math.floor((((2 * baseStat + iv + ev / 4) * level / 100) + 5) * natureModifier);
}

/**
 * Get EV yield from a Pokemon for training purposes
 * @param stats - Pokemon's stat array
 * @returns Object with EV yields for each stat
 */
export function getEVYield(stats?: PokemonStat[]): Record<string, number> {
  if (!stats) return {};
  
  const evYield: Record<string, number> = {};
  stats.forEach(stat => {
    if (stat.effort > 0) {
      evYield[stat.stat.name] = stat.effort;
    }
  });
  
  return evYield;
}

/**
 * Check breeding compatibility between two Pokemon
 * @param pokemon1Species - First Pokemon's species data
 * @param pokemon2Species - Second Pokemon's species data
 * @returns Whether the Pokemon can breed together
 */
export function getBreedingCompatibility(
  pokemon1Species?: PokemonSpecies,
  pokemon2Species?: PokemonSpecies
): boolean {
  if (!pokemon1Species || !pokemon2Species) return false;
  
  // Check if either is in Undiscovered egg group (can't breed)
  const undiscovered1 = pokemon1Species.egg_groups.some(g => g.name === 'no-eggs');
  const undiscovered2 = pokemon2Species.egg_groups.some(g => g.name === 'no-eggs');
  if (undiscovered1 || undiscovered2) return false;
  
  // Check if they share at least one egg group
  const eggGroups1 = pokemon1Species.egg_groups.map(g => g.name);
  const eggGroups2 = pokemon2Species.egg_groups.map(g => g.name);
  const hasCommonGroup = eggGroups1.some(g => eggGroups2.includes(g));
  
  // Ditto can breed with anything except Undiscovered group
  if (eggGroups1.includes('ditto') || eggGroups2.includes('ditto')) {
    return true;
  }
  
  return hasCommonGroup;
}

/**
 * Stat name mappings for display
 */
export const STAT_NAMES: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed'
};

/**
 * Stat color mappings for UI
 */
export const STAT_COLORS: Record<string, string> = {
  'hp': 'red',
  'attack': 'orange',
  'defense': 'yellow',
  'special-attack': 'blue',
  'special-defense': 'green',
  'speed': 'pink'
};

/**
 * Format stat name for display
 * @param statName - Raw stat name from API
 * @returns Formatted stat name
 */
export function formatStatName(statName: string): string {
  return STAT_NAMES[statName] || statName;
}

/**
 * Get type-based color for stat bars
 * @param statName - Name of the stat
 * @param pokemonTypes - Pokemon's types for theming
 * @returns Tailwind gradient classes
 */
export function getStatColor(statName: string, pokemonTypes?: string[]): string {
  // If Pokemon has types, use type-based colors
  if (pokemonTypes && pokemonTypes.length > 0) {
    const primaryType = pokemonTypes[0];
    const typeStatColors: Record<string, Record<string, string>> = {
      fire: {
        hp: 'from-red-400 to-orange-500',
        attack: 'from-orange-500 to-red-600',
        defense: 'from-yellow-500 to-orange-600',
        'special-attack': 'from-red-500 to-pink-500',
        'special-defense': 'from-orange-400 to-yellow-500',
        speed: 'from-red-400 to-orange-400'
      },
      water: {
        hp: 'from-blue-400 to-cyan-500',
        attack: 'from-blue-500 to-indigo-600',
        defense: 'from-cyan-500 to-blue-600',
        'special-attack': 'from-blue-400 to-purple-500',
        'special-defense': 'from-cyan-400 to-teal-500',
        speed: 'from-blue-300 to-cyan-400'
      },
      grass: {
        hp: 'from-green-400 to-emerald-500',
        attack: 'from-emerald-500 to-green-600',
        defense: 'from-lime-500 to-green-600',
        'special-attack': 'from-green-400 to-teal-500',
        'special-defense': 'from-emerald-400 to-lime-500',
        speed: 'from-green-300 to-lime-400'
      },
      electric: {
        hp: 'from-yellow-400 to-amber-500',
        attack: 'from-amber-500 to-yellow-600',
        defense: 'from-yellow-500 to-orange-500',
        'special-attack': 'from-yellow-400 to-amber-600',
        'special-defense': 'from-amber-400 to-yellow-500',
        speed: 'from-yellow-300 to-amber-400'
      }
    };
    
    if (typeStatColors[primaryType] && typeStatColors[primaryType][statName]) {
      return typeStatColors[primaryType][statName];
    }
  }
  
  // Default stat colors
  const defaultStatColors: Record<string, string> = {
    'hp': 'from-red-400 to-red-600',
    'attack': 'from-orange-400 to-orange-600',
    'defense': 'from-yellow-400 to-yellow-600',
    'special-attack': 'from-blue-400 to-blue-600',
    'special-defense': 'from-green-400 to-green-600',
    'speed': 'from-pink-400 to-pink-600'
  };
  
  return defaultStatColors[statName] || 'from-gray-400 to-gray-600';
}

/**
 * Calculate catch rate percentage and difficulty
 * @param captureRate - Pokemon's capture rate (0-255)
 * @returns Object with percentage and difficulty level
 */
export function calculateCatchRate(captureRate: number): {
  percentage: number;
  difficulty: string;
  color: string;
} {
  const percentage = (captureRate / 255) * 100;
  
  let difficulty: string;
  let color: string;
  
  if (captureRate > 200) {
    difficulty = 'Very Easy';
    color = 'text-green-500';
  } else if (captureRate > 150) {
    difficulty = 'Easy';
    color = 'text-emerald-500';
  } else if (captureRate > 100) {
    difficulty = 'Medium';
    color = 'text-yellow-500';
  } else if (captureRate > 50) {
    difficulty = 'Hard';
    color = 'text-orange-500';
  } else if (captureRate > 25) {
    difficulty = 'Very Hard';
    color = 'text-red-500';
  } else {
    difficulty = 'Legendary';
    color = 'text-purple-500';
  }
  
  return { percentage, difficulty, color };
}

/**
 * Get max stat value for percentage calculations
 * @param statName - Name of the stat
 * @returns Maximum possible base stat value
 */
export function getMaxStat(statName: string): number {
  const maxStats: Record<string, number> = {
    'hp': 255,              // Blissey
    'attack': 190,          // Mega Mewtwo X
    'defense': 230,         // Shuckle
    'special-attack': 194,  // Mega Mewtwo Y
    'special-defense': 230, // Shuckle
    'speed': 200           // Regieleki
  };
  
  return maxStats[statName] || 255;
}

/**
 * Calculate gender ratio display
 * @param genderRate - Gender rate from API (-1 for genderless, 0-8 for female ratio)
 * @returns Object with male/female percentages and genderless flag
 */
export function calculateGenderRatio(genderRate: number): {
  male: number;
  female: number;
  genderless: boolean;
} {
  if (genderRate === -1) {
    return { male: 0, female: 0, genderless: true };
  }
  
  const femaleRatio = (genderRate / 8) * 100;
  const maleRatio = 100 - femaleRatio;
  
  return { male: maleRatio, female: femaleRatio, genderless: false };
}

/**
 * Format egg groups for display
 * @param eggGroups - Array of egg group objects
 * @returns Formatted egg group names
 */
export function formatEggGroups(eggGroups?: { name: string; url: string }[]): string[] {
  if (!eggGroups) return ['Unknown'];
  
  return eggGroups.map(group => 
    group.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/**
 * Get breeding steps from hatch counter
 * @param hatchCounter - Hatch counter value
 * @returns Number of steps needed to hatch
 */
export function getHatchSteps(hatchCounter: number): {
  min: number;
  max: number;
  cycles: number;
} {
  // Each cycle is 257 steps (256 + 1)
  const stepsPerCycle = 257;
  const minSteps = hatchCounter * stepsPerCycle;
  
  // With Flame Body/Magma Armor, steps are halved
  const minStepsWithAbility = Math.floor(minSteps / 2);
  
  return {
    min: minStepsWithAbility,
    max: minSteps,
    cycles: hatchCounter
  };
}

/**
 * Get stat ranking compared to all Pokemon
 * @param baseStat - The base stat value
 * @param statName - Name of the stat
 * @returns Ranking tier (S, A, B, C, D, F)
 */
export function getStatRanking(baseStat: number, statName: string): {
  tier: string;
  color: string;
} {
  const maxStat = getMaxStat(statName);
  const percentage = (baseStat / maxStat) * 100;
  
  if (percentage >= 80) return { tier: 'S', color: 'text-purple-500' };
  if (percentage >= 65) return { tier: 'A', color: 'text-blue-500' };
  if (percentage >= 50) return { tier: 'B', color: 'text-green-500' };
  if (percentage >= 35) return { tier: 'C', color: 'text-yellow-500' };
  if (percentage >= 20) return { tier: 'D', color: 'text-orange-500' };
  return { tier: 'F', color: 'text-red-500' };
}

/**
 * Parse evolution method into readable format
 * @param evolutionDetails - Evolution detail object
 * @returns Human-readable evolution method
 */
export function parseEvolutionMethod(evolutionDetails: any): string {
  if (!evolutionDetails || evolutionDetails.length === 0) return 'Unknown method';
  
  const detail = evolutionDetails[0];
  const methods: string[] = [];
  
  if (detail.min_level) {
    methods.push(`Level ${detail.min_level}`);
  }
  
  if (detail.item) {
    methods.push(`Use ${detail.item.name.replace(/-/g, ' ')}`);
  }
  
  if (detail.held_item) {
    methods.push(`Hold ${detail.held_item.name.replace(/-/g, ' ')}`);
  }
  
  if (detail.known_move) {
    methods.push(`Know ${detail.known_move.name.replace(/-/g, ' ')}`);
  }
  
  if (detail.location) {
    methods.push(`At ${detail.location.name.replace(/-/g, ' ')}`);
  }
  
  if (detail.min_happiness) {
    methods.push(`Happiness ${detail.min_happiness}+`);
  }
  
  if (detail.min_beauty) {
    methods.push(`Beauty ${detail.min_beauty}+`);
  }
  
  if (detail.min_affection) {
    methods.push(`Affection ${detail.min_affection}+`);
  }
  
  if (detail.time_of_day && detail.time_of_day !== '') {
    methods.push(`During ${detail.time_of_day}`);
  }
  
  if (detail.gender === 1) {
    methods.push('Female only');
  } else if (detail.gender === 2) {
    methods.push('Male only');
  }
  
  if (detail.relative_physical_stats === 1) {
    methods.push('Attack > Defense');
  } else if (detail.relative_physical_stats === -1) {
    methods.push('Attack < Defense');
  } else if (detail.relative_physical_stats === 0) {
    methods.push('Attack = Defense');
  }
  
  if (methods.length === 0) {
    if (detail.trigger?.name === 'trade') {
      methods.push('Trade');
    } else {
      methods.push('Special condition');
    }
  }
  
  return methods.join(', ');
}