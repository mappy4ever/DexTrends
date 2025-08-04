// Breeding utility functions
import type { PokemonSpecies } from '../types/api/pokemon';

export interface BreedingInfo {
  canBreed: boolean;
  eggGroups: string[];
  hatchSteps: number;
  hatchCycles: number;
  genderRatio: {
    male: number;
    female: number;
    genderless: boolean;
  };
  babyItem?: string;
}

export interface EggMoveInfo {
  moveName: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  parentPokemon: string[];
}

// Calculate breeding information from species data
export function calculateBreedingInfo(species: PokemonSpecies): BreedingInfo {
  const canBreed = !species.egg_groups?.some(group => group.name === 'no-eggs');
  const hatchCycles = species.hatch_counter || 20;
  const hatchSteps = (hatchCycles + 1) * 255;
  
  // Calculate gender ratio
  let genderRatio;
  if (species.gender_rate === -1) {
    genderRatio = { male: 0, female: 0, genderless: true };
  } else {
    const femaleRatio = (species.gender_rate / 8) * 100;
    genderRatio = {
      male: 100 - femaleRatio,
      female: femaleRatio,
      genderless: false
    };
  }
  
  return {
    canBreed,
    eggGroups: species.egg_groups?.map(g => g.name) || [],
    hatchSteps,
    hatchCycles,
    genderRatio,
    babyItem: getBabyItem(species.name)
  };
}

// Get required incense item for baby Pokemon
export function getBabyItem(pokemonName: string): string | undefined {
  const babyItems: Record<string, string> = {
    'azurill': 'Sea Incense',
    'wynaut': 'Lax Incense',
    'budew': 'Rose Incense',
    'chingling': 'Pure Incense',
    'bonsly': 'Rock Incense',
    'mime-jr': 'Odd Incense',
    'happiny': 'Luck Incense',
    'munchlax': 'Full Incense',
    'mantyke': 'Wave Incense'
  };
  
  return babyItems[pokemonName.toLowerCase()];
}

// Format egg group name for display
export function formatEggGroupName(groupName: string): string {
  const formatted = groupName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  // Special cases
  const specialCases: Record<string, string> = {
    'Water 1': 'Water 1',
    'Water 2': 'Water 2',
    'Water 3': 'Water 3',
    'No Eggs': 'Cannot Breed',
    'Humanshape': 'Human-Like'
  };
  
  return specialCases[formatted] || formatted;
}

// Get egg group color for styling
export function getEggGroupColor(groupName: string): string {
  const colors: Record<string, string> = {
    'monster': 'from-red-500 to-orange-500',
    'water1': 'from-blue-400 to-blue-600',
    'water2': 'from-blue-500 to-cyan-500',
    'water3': 'from-blue-600 to-indigo-600',
    'bug': 'from-green-400 to-green-600',
    'flying': 'from-sky-400 to-sky-600',
    'ground': 'from-yellow-600 to-amber-700',
    'fairy': 'from-pink-400 to-pink-600',
    'plant': 'from-green-500 to-emerald-600',
    'humanshape': 'from-purple-400 to-purple-600',
    'mineral': 'from-gray-500 to-gray-700',
    'amorphous': 'from-purple-500 to-indigo-500',
    'ditto': 'from-purple-600 to-pink-600',
    'dragon': 'from-indigo-600 to-purple-700',
    'no-eggs': 'from-gray-400 to-gray-600'
  };
  
  return colors[groupName.toLowerCase().replace(' ', '')] || 'from-gray-400 to-gray-600';
}

// Calculate shiny odds
export function calculateShinyOdds(hasMasudaMethod: boolean, hasShinyCharm: boolean): {
  odds: string;
  percentage: string;
} {
  let denominator = 4096; // Base odds in Gen 6+
  
  if (hasMasudaMethod) {
    denominator = Math.floor(denominator / 6); // ~683
  }
  
  if (hasShinyCharm) {
    denominator = Math.floor(denominator / 3); // Further reduction
  }
  
  const percentage = ((1 / denominator) * 100).toFixed(4);
  
  return {
    odds: `1/${denominator}`,
    percentage: `${percentage}%`
  };
}

// Get breeding item effects
export function getBreedingItems() {
  return [
    {
      name: 'Destiny Knot',
      effect: 'Passes down 5 IVs from parents instead of 3',
      sprite: 'destiny-knot',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/destiny-knot.png'
    },
    {
      name: 'Everstone',
      effect: 'Passes down the holder\'s nature to offspring',
      sprite: 'everstone',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/everstone.png'
    },
    {
      name: 'Power Weight',
      effect: 'Passes down the holder\'s HP IV',
      sprite: 'power-weight',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png'
    },
    {
      name: 'Power Bracer',
      effect: 'Passes down the holder\'s Attack IV',
      sprite: 'power-bracer',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png'
    },
    {
      name: 'Power Belt',
      effect: 'Passes down the holder\'s Defense IV',
      sprite: 'power-belt',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png'
    },
    {
      name: 'Power Lens',
      effect: 'Passes down the holder\'s Sp. Attack IV',
      sprite: 'power-lens',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png'
    },
    {
      name: 'Power Band',
      effect: 'Passes down the holder\'s Sp. Defense IV',
      sprite: 'power-band',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png'
    },
    {
      name: 'Power Anklet',
      effect: 'Passes down the holder\'s Speed IV',
      sprite: 'power-anklet',
      spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png'
    }
  ];
}

// Format hatch time for display
export function formatHatchTime(steps: number): string {
  // Assuming ~1 step per second while biking
  const seconds = steps;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `~${hours}h ${minutes % 60}m`;
  }
  return `~${minutes}m`;
}

// Check if two Pokemon can breed together
export function canBreedTogether(
  pokemon1EggGroups: string[], 
  pokemon2EggGroups: string[],
  pokemon1Gender: { male: number; female: number; genderless: boolean },
  pokemon2Gender: { male: number; female: number; genderless: boolean }
): boolean {
  // Check for Ditto
  const hasDitto = pokemon1EggGroups.includes('ditto') || pokemon2EggGroups.includes('ditto');
  if (hasDitto) {
    // Ditto can breed with anything except no-eggs group and other Ditto
    const otherGroups = pokemon1EggGroups.includes('ditto') ? pokemon2EggGroups : pokemon1EggGroups;
    return !otherGroups.includes('no-eggs') && !otherGroups.includes('ditto');
  }
  
  // Check if either cannot breed
  if (pokemon1EggGroups.includes('no-eggs') || pokemon2EggGroups.includes('no-eggs')) {
    return false;
  }
  
  // Check for shared egg groups
  const hasSharedGroup = pokemon1EggGroups.some(group => pokemon2EggGroups.includes(group));
  if (!hasSharedGroup) {
    return false;
  }
  
  // Check gender compatibility
  const canFormPair = 
    (pokemon1Gender.male > 0 && pokemon2Gender.female > 0) ||
    (pokemon1Gender.female > 0 && pokemon2Gender.male > 0);
    
  return canFormPair;
}