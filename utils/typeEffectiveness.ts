/**
 * Comprehensive type effectiveness calculator for team synergy analysis
 */

// Type effectiveness chart - attacking type vs defending type
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: {
    rock: 0.5,
    ghost: 0,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    flying: 0.5,
    poison: 0.5,
    rock: 2,
    bug: 0.5,
    ghost: 0,
    steel: 2,
    psychic: 0.5,
    ice: 2,
    dark: 2,
    fairy: 0.5,
  },
  flying: {
    fighting: 2,
    rock: 0.5,
    bug: 2,
    steel: 0.5,
    grass: 2,
    electric: 0.5,
  },
  poison: {
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    grass: 2,
    fairy: 2,
  },
  ground: {
    flying: 0,
    poison: 2,
    rock: 2,
    bug: 0.5,
    steel: 2,
    fire: 2,
    grass: 0.5,
    electric: 2,
  },
  rock: {
    fighting: 0.5,
    flying: 2,
    ground: 0.5,
    bug: 2,
    steel: 0.5,
    fire: 2,
    ice: 2,
  },
  bug: {
    fighting: 0.5,
    flying: 0.5,
    poison: 0.5,
    ghost: 0.5,
    steel: 0.5,
    fire: 0.5,
    grass: 2,
    psychic: 2,
    dark: 2,
    fairy: 0.5,
  },
  ghost: {
    normal: 0,
    ghost: 2,
    psychic: 2,
    dark: 0.5,
  },
  steel: {
    rock: 2,
    steel: 0.5,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    fairy: 2,
  },
  fire: {
    rock: 0.5,
    bug: 2,
    steel: 2,
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    dragon: 0.5,
  },
  water: {
    ground: 2,
    rock: 2,
    fire: 2,
    water: 0.5,
    grass: 0.5,
    dragon: 0.5,
  },
  grass: {
    flying: 0.5,
    poison: 0.5,
    ground: 2,
    rock: 2,
    bug: 0.5,
    steel: 0.5,
    fire: 0.5,
    water: 2,
    grass: 0.5,
    dragon: 0.5,
  },
  electric: {
    flying: 2,
    ground: 0,
    water: 2,
    grass: 0.5,
    electric: 0.5,
    dragon: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    steel: 0.5,
    psychic: 0.5,
    dark: 0,
  },
  ice: {
    flying: 2,
    ground: 2,
    steel: 0.5,
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    dragon: 2,
  },
  dragon: {
    steel: 0.5,
    dragon: 2,
    fairy: 0,
  },
  dark: {
    fighting: 0.5,
    ghost: 2,
    psychic: 2,
    dark: 0.5,
    fairy: 0.5,
  },
  fairy: {
    fighting: 2,
    poison: 0.5,
    steel: 0.5,
    fire: 0.5,
    dragon: 2,
    dark: 2,
  },
};

// All Pokemon types
export const POKEMON_TYPES = [
  'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost',
  'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon',
  'dark', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

/**
 * Calculate damage multiplier for an attacking type against defending type(s)
 */
export function calculateTypeEffectiveness(
  attackingType: string,
  defendingTypes: string[]
): number {
  let multiplier = 1;
  
  for (const defType of defendingTypes) {
    const effectiveness = TYPE_CHART[attackingType.toLowerCase()]?.[defType.toLowerCase()] ?? 1;
    multiplier *= effectiveness;
  }
  
  return multiplier;
}

/**
 * Get all type matchups for a given type combination
 */
export function getTypeMatchups(types: string[]): {
  weaknesses: Record<string, number>;
  resistances: Record<string, number>;
  immunities: string[];
} {
  const weaknesses: Record<string, number> = {};
  const resistances: Record<string, number> = {};
  const immunities: string[] = [];
  
  for (const attackingType of POKEMON_TYPES) {
    const effectiveness = calculateTypeEffectiveness(attackingType, types);
    
    if (effectiveness > 1) {
      weaknesses[attackingType] = effectiveness;
    } else if (effectiveness < 1 && effectiveness > 0) {
      resistances[attackingType] = effectiveness;
    } else if (effectiveness === 0) {
      immunities.push(attackingType);
    }
  }
  
  return { weaknesses, resistances, immunities };
}

/**
 * Calculate offensive coverage for a set of move types
 */
export function calculateOffensiveCoverage(moveTypes: string[]): {
  superEffective: Record<string, string[]>;
  neutral: Record<string, string[]>;
  notVeryEffective: Record<string, string[]>;
  noEffect: Record<string, string[]>;
} {
  const coverage = {
    superEffective: {} as Record<string, string[]>,
    neutral: {} as Record<string, string[]>,
    notVeryEffective: {} as Record<string, string[]>,
    noEffect: {} as Record<string, string[]>,
  };
  
  // Check coverage against all type combinations
  for (const type1 of POKEMON_TYPES) {
    // Single type
    checkCoverage([type1], moveTypes, coverage);
    
    // Dual types
    for (const type2 of POKEMON_TYPES) {
      if (type1 !== type2) {
        checkCoverage([type1, type2], moveTypes, coverage);
      }
    }
  }
  
  return coverage;
}

function checkCoverage(
  defendingTypes: string[],
  attackingTypes: string[],
  coverage: ReturnType<typeof calculateOffensiveCoverage>
): void {
  const typeComboKey = defendingTypes.join('/');
  let bestEffectiveness = 0;
  let bestType = '';
  
  for (const attackType of attackingTypes) {
    const effectiveness = calculateTypeEffectiveness(attackType, defendingTypes);
    if (effectiveness > bestEffectiveness) {
      bestEffectiveness = effectiveness;
      bestType = attackType;
    }
  }
  
  if (bestEffectiveness >= 2) {
    if (!coverage.superEffective[bestType]) {
      coverage.superEffective[bestType] = [];
    }
    coverage.superEffective[bestType].push(typeComboKey);
  } else if (bestEffectiveness === 1) {
    if (!coverage.neutral[bestType]) {
      coverage.neutral[bestType] = [];
    }
    coverage.neutral[bestType].push(typeComboKey);
  } else if (bestEffectiveness > 0) {
    if (!coverage.notVeryEffective[bestType]) {
      coverage.notVeryEffective[bestType] = [];
    }
    coverage.notVeryEffective[bestType].push(typeComboKey);
  } else {
    if (!coverage.noEffect[bestType]) {
      coverage.noEffect[bestType] = [];
    }
    coverage.noEffect[bestType].push(typeComboKey);
  }
}

/**
 * Analyze team type synergy
 */
export function analyzeTeamTypeSynergy(
  teamTypes: string[][]
): {
  sharedWeaknesses: Record<string, number>;
  uncoveredTypes: string[];
  defensiveScore: number;
  offensiveScore: number;
} {
  // Count how many team members are weak to each type
  const weaknessCount: Record<string, number> = {};
  const resistanceCount: Record<string, number> = {};
  
  for (const memberTypes of teamTypes) {
    const { weaknesses, resistances } = getTypeMatchups(memberTypes);
    
    for (const [type, mult] of Object.entries(weaknesses)) {
      weaknessCount[type] = (weaknessCount[type] || 0) + 1;
    }
    
    for (const [type, mult] of Object.entries(resistances)) {
      resistanceCount[type] = (resistanceCount[type] || 0) + 1;
    }
  }
  
  // Find shared weaknesses (3+ members weak to same type)
  const sharedWeaknesses: Record<string, number> = {};
  for (const [type, count] of Object.entries(weaknessCount)) {
    if (count >= 3) {
      sharedWeaknesses[type] = count;
    }
  }
  
  // Find types that no team member resists
  const uncoveredTypes: string[] = [];
  for (const type of POKEMON_TYPES) {
    if (!resistanceCount[type] && !teamTypes.some(types => 
      calculateTypeEffectiveness(type, types) === 0
    )) {
      uncoveredTypes.push(type);
    }
  }
  
  // Calculate scores
  const defensiveScore = Math.max(0, 100 - (Object.keys(sharedWeaknesses).length * 15) - (uncoveredTypes.length * 5));
  const offensiveScore = 100; // Will be calculated based on move coverage
  
  return {
    sharedWeaknesses,
    uncoveredTypes,
    defensiveScore,
    offensiveScore,
  };
}

/**
 * Get type color for visualization
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: '#A8A878',
    fighting: '#C03028',
    flying: '#A890F0',
    poison: '#A040A0',
    ground: '#E0C068',
    rock: '#B8A038',
    bug: '#A8B820',
    ghost: '#705898',
    steel: '#B8B8D0',
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    psychic: '#F85888',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    fairy: '#EE99AC',
  };
  
  return colors[type.toLowerCase()] || '#68A090';
}

/**
 * Get type effectiveness color for badges
 */
export function getTypeEffectivenessColor(multiplier: number): string {
  if (multiplier === 0) return 'bg-gray-500 text-white';
  if (multiplier === 0.25) return 'bg-green-600 text-white';
  if (multiplier === 0.5) return 'bg-green-500 text-white';
  if (multiplier === 2) return 'bg-red-500 text-white';
  if (multiplier === 4) return 'bg-red-600 text-white';
  return 'bg-gray-400 text-white';
}

/**
 * Get effectiveness label
 */
export function getEffectivenessLabel(multiplier: number): string {
  if (multiplier === 0) return '0×';
  if (multiplier === 0.25) return '¼×';
  if (multiplier === 0.5) return '½×';
  if (multiplier === 2) return '2×';
  if (multiplier === 4) return '4×';
  return '1×';
}