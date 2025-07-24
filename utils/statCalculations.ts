/**
 * Comprehensive stat calculation utilities for competitive Pokemon
 * Handles IVs, EVs, Natures, and all stat modifiers
 */

import type { Nature, StatSpread } from '../types/team-builder';

// Nature modifiers
export const NATURE_MODIFIERS: Record<string, { increased: string | null; decreased: string | null }> = {
  Hardy: { increased: null, decreased: null },
  Lonely: { increased: 'attack', decreased: 'defense' },
  Brave: { increased: 'attack', decreased: 'speed' },
  Adamant: { increased: 'attack', decreased: 'specialAttack' },
  Naughty: { increased: 'attack', decreased: 'specialDefense' },
  Bold: { increased: 'defense', decreased: 'attack' },
  Docile: { increased: null, decreased: null },
  Relaxed: { increased: 'defense', decreased: 'speed' },
  Impish: { increased: 'defense', decreased: 'specialAttack' },
  Lax: { increased: 'defense', decreased: 'specialDefense' },
  Timid: { increased: 'speed', decreased: 'attack' },
  Hasty: { increased: 'speed', decreased: 'defense' },
  Serious: { increased: null, decreased: null },
  Jolly: { increased: 'speed', decreased: 'specialAttack' },
  Naive: { increased: 'speed', decreased: 'specialDefense' },
  Modest: { increased: 'specialAttack', decreased: 'attack' },
  Mild: { increased: 'specialAttack', decreased: 'defense' },
  Quiet: { increased: 'specialAttack', decreased: 'speed' },
  Bashful: { increased: null, decreased: null },
  Rash: { increased: 'specialAttack', decreased: 'specialDefense' },
  Calm: { increased: 'specialDefense', decreased: 'attack' },
  Gentle: { increased: 'specialDefense', decreased: 'defense' },
  Sassy: { increased: 'specialDefense', decreased: 'speed' },
  Careful: { increased: 'specialDefense', decreased: 'specialAttack' },
  Quirky: { increased: null, decreased: null },
};

// Stat names mapping
export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Attack',
  specialDefense: 'Sp. Defense',
  speed: 'Speed',
};

// Short stat names for display
export const STAT_SHORT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  specialAttack: 'SpA',
  specialDefense: 'SpD',
  speed: 'Spe',
};

/**
 * Calculate actual stat value including IVs, EVs, and Nature
 */
export function calculateStat(
  statName: keyof StatSpread,
  baseStat: number,
  iv: number,
  ev: number,
  level: number,
  nature: string
): number {
  // HP calculation is different
  if (statName === 'hp') {
    if (baseStat === 1) return 1; // Shedinja
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  // Other stats calculation
  let stat = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * level) / 100) + 5;

  // Apply nature modifier
  const natureData = NATURE_MODIFIERS[nature];
  if (natureData) {
    if (natureData.increased === statName) {
      stat = Math.floor(stat * 1.1);
    } else if (natureData.decreased === statName) {
      stat = Math.floor(stat * 0.9);
    }
  }

  return stat;
}

/**
 * Calculate all stats for a Pokemon
 */
export function calculateAllStats(
  baseStats: Record<string, number>,
  ivs: StatSpread,
  evs: StatSpread,
  level: number,
  nature: string
): StatSpread {
  return {
    hp: calculateStat('hp', baseStats.hp || 0, ivs.hp, evs.hp, level, nature),
    attack: calculateStat('attack', baseStats.attack || 0, ivs.attack, evs.attack, level, nature),
    defense: calculateStat('defense', baseStats.defense || 0, ivs.defense, evs.defense, level, nature),
    specialAttack: calculateStat('specialAttack', baseStats['special-attack'] || 0, ivs.specialAttack, evs.specialAttack, level, nature),
    specialDefense: calculateStat('specialDefense', baseStats['special-defense'] || 0, ivs.specialDefense, evs.specialDefense, level, nature),
    speed: calculateStat('speed', baseStats.speed || 0, ivs.speed, evs.speed, level, nature),
  };
}

/**
 * Get remaining EVs available
 */
export function getRemainingEVs(evs: StatSpread): number {
  const totalEVs = Object.values(evs).reduce((sum, ev) => sum + ev, 0);
  return Math.max(0, 510 - totalEVs); // Max 510 EVs total
}

/**
 * Validate EV spread
 */
export function validateEVSpread(evs: StatSpread): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const totalEVs = Object.values(evs).reduce((sum, ev) => sum + ev, 0);

  if (totalEVs > 510) {
    errors.push(`Total EVs (${totalEVs}) exceeds maximum of 510`);
  }

  Object.entries(evs).forEach(([stat, value]) => {
    if (value > 252) {
      errors.push(`${STAT_NAMES[stat]} EVs (${value}) exceeds maximum of 252`);
    }
    if (value < 0) {
      errors.push(`${STAT_NAMES[stat]} EVs cannot be negative`);
    }
    if (value % 4 !== 0 && value !== 252) {
      errors.push(`${STAT_NAMES[stat]} EVs (${value}) is not divisible by 4 (wasted EVs)`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Common competitive EV spreads
 */
export const COMPETITIVE_SPREADS = {
  physical_sweeper: {
    name: 'Physical Sweeper',
    evs: { hp: 0, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 252 },
    nature: 'Jolly',
    description: 'Max Attack and Speed for physical sweepers',
  },
  special_sweeper: {
    name: 'Special Sweeper',
    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 252, specialDefense: 4, speed: 252 },
    nature: 'Timid',
    description: 'Max Special Attack and Speed for special sweepers',
  },
  physical_tank: {
    name: 'Physical Tank',
    evs: { hp: 252, attack: 252, defense: 4, specialAttack: 0, specialDefense: 0, speed: 0 },
    nature: 'Adamant',
    description: 'Max HP and Attack for physical tanks',
  },
  special_tank: {
    name: 'Special Tank',
    evs: { hp: 252, attack: 0, defense: 0, specialAttack: 252, specialDefense: 4, speed: 0 },
    nature: 'Modest',
    description: 'Max HP and Special Attack for special tanks',
  },
  physical_wall: {
    name: 'Physical Wall',
    evs: { hp: 252, attack: 0, defense: 252, specialAttack: 0, specialDefense: 4, speed: 0 },
    nature: 'Bold',
    description: 'Max HP and Defense for physical walls',
  },
  special_wall: {
    name: 'Special Wall',
    evs: { hp: 252, attack: 0, defense: 4, specialAttack: 0, specialDefense: 252, speed: 0 },
    nature: 'Calm',
    description: 'Max HP and Special Defense for special walls',
  },
  mixed_attacker: {
    name: 'Mixed Attacker',
    evs: { hp: 0, attack: 128, defense: 0, specialAttack: 128, specialDefense: 0, speed: 252 },
    nature: 'Naive',
    description: 'Split between Attack and Special Attack with max Speed',
  },
  bulky_offense: {
    name: 'Bulky Offense',
    evs: { hp: 248, attack: 252, defense: 0, specialAttack: 0, specialDefense: 8, speed: 0 },
    nature: 'Adamant',
    description: 'High HP with max Attack for bulky offensive Pokemon',
  },
  support: {
    name: 'Support',
    evs: { hp: 252, attack: 0, defense: 128, specialAttack: 0, specialDefense: 128, speed: 0 },
    nature: 'Bold',
    description: 'Balanced defensive spread for support Pokemon',
  },
  scarfer: {
    name: 'Choice Scarf',
    evs: { hp: 0, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 252 },
    nature: 'Adamant',
    description: 'Max Attack and Speed for Choice Scarf users',
  },
};

/**
 * Calculate stat changes for EV investment
 */
export function calculateEVGains(
  baseStat: number,
  currentEV: number,
  additionalEV: number,
  level: number,
  nature: string,
  statName: keyof StatSpread
): {
  currentStat: number;
  newStat: number;
  gain: number;
} {
  const currentStat = calculateStat(statName, baseStat, 31, currentEV, level, nature);
  const newStat = calculateStat(statName, baseStat, 31, currentEV + additionalEV, level, nature);
  
  return {
    currentStat,
    newStat,
    gain: newStat - currentStat,
  };
}

/**
 * Get optimal EV distribution for a stat goal
 */
export function optimizeEVsForStat(
  targetStat: number,
  baseStat: number,
  iv: number,
  level: number,
  nature: string,
  statName: keyof StatSpread
): number {
  // Binary search for optimal EVs
  let low = 0;
  let high = 252;
  let optimal = 0;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const stat = calculateStat(statName, baseStat, iv, mid, level, nature);
    
    if (stat >= targetStat) {
      optimal = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  
  // Round up to nearest multiple of 4 to avoid waste
  return Math.min(252, Math.ceil(optimal / 4) * 4);
}

/**
 * Calculate speed tier with modifiers
 */
export function calculateSpeedTier(
  baseSpeed: number,
  iv: number,
  ev: number,
  level: number,
  nature: string,
  modifiers: {
    choiceScarf?: boolean;
    tailwind?: boolean;
    trickRoom?: boolean;
    paralysis?: boolean;
    speedBoost?: number; // Number of speed boosts
    sticky?: boolean; // Sticky Web
  } = {}
): number {
  let speed = calculateStat('speed', baseSpeed, iv, ev, level, nature);
  
  // Stage modifiers (Speed Boost, etc.)
  if (modifiers.speedBoost) {
    const multiplier = (2 + modifiers.speedBoost) / 2;
    speed = Math.floor(speed * multiplier);
  }
  
  // Item modifiers
  if (modifiers.choiceScarf) {
    speed = Math.floor(speed * 1.5);
  }
  
  // Field modifiers
  if (modifiers.tailwind) {
    speed = Math.floor(speed * 2);
  }
  
  if (modifiers.sticky) {
    speed = Math.floor(speed * 0.5);
  }
  
  // Status modifiers
  if (modifiers.paralysis) {
    speed = Math.floor(speed * 0.5);
  }
  
  // Trick Room reverses speed
  if (modifiers.trickRoom) {
    // In trick room, lower speed is better
    // Return negative to indicate reversal
    return -speed;
  }
  
  return speed;
}

/**
 * Generate heat map data for EV distribution
 */
export function generateEVHeatMapData(
  baseStats: Record<string, number>,
  currentEVs: StatSpread,
  level: number,
  nature: string
): {
  stat: string;
  current: number;
  potential: number[];
  efficiency: number;
}[] {
  return Object.entries(STAT_NAMES).map(([key, name]) => {
    const statKey = key as keyof StatSpread;
    const baseStat = baseStats[key === 'specialAttack' ? 'special-attack' : 
                                key === 'specialDefense' ? 'special-defense' : key] || 0;
    
    // Calculate potential gains for different EV investments
    const potential = [0, 4, 8, 12, 16, 20, 32, 64, 128, 252].map(evs => {
      const { gain } = calculateEVGains(baseStat, 0, evs, level, nature, statKey);
      return gain;
    });
    
    // Calculate efficiency (stat gain per EV)
    const efficiency = baseStat > 0 ? 
      calculateEVGains(baseStat, 0, 252, level, nature, statKey).gain / 252 : 0;
    
    return {
      stat: name,
      current: currentEVs[statKey],
      potential,
      efficiency,
    };
  });
}