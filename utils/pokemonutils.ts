// Enhanced Pokémon utility functions with Supabase caching
import { SupabaseCache } from '../lib/supabase';
import type { TCGCard } from '../types/api/cards';

// Type color configuration interface
interface TypeColorConfig {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

// Type effectiveness interface
interface TypeEffectivenessConfig {
  weakTo: string[];
  resistantTo: string[];
  immuneTo: string[];
}

// Pocket type mapping result
interface PocketTypeMappingResult {
  displayName: string;
  standardType: string;
  isPocketMapped: boolean;
}


// Complete type effectiveness chart
export const typeEffectiveness: Record<string, TypeEffectivenessConfig> = {
  normal: {
    weakTo: ["fighting"],
    resistantTo: [],
    immuneTo: ["ghost"]
  },
  fire: {
    weakTo: ["water", "ground", "rock"],
    resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    immuneTo: []
  },
  water: {
    weakTo: ["electric", "grass"],
    resistantTo: ["fire", "water", "ice", "steel"],
    immuneTo: []
  },
  electric: {
    weakTo: ["ground"],
    resistantTo: ["electric", "flying", "steel"],
    immuneTo: []
  },
  grass: {
    weakTo: ["fire", "ice", "poison", "flying", "bug"],
    resistantTo: ["water", "electric", "grass", "ground"],
    immuneTo: []
  },
  ice: {
    weakTo: ["fire", "fighting", "rock", "steel"],
    resistantTo: ["ice"],
    immuneTo: []
  },
  fighting: {
    weakTo: ["flying", "psychic", "fairy"],
    resistantTo: ["bug", "rock", "dark"],
    immuneTo: []
  },
  poison: {
    weakTo: ["ground", "psychic"],
    resistantTo: ["grass", "fighting", "poison", "bug", "fairy"],
    immuneTo: []
  },
  ground: {
    weakTo: ["water", "grass", "ice"],
    resistantTo: ["poison", "rock"],
    immuneTo: ["electric"]
  },
  flying: {
    weakTo: ["electric", "ice", "rock"],
    resistantTo: ["grass", "fighting", "bug"],
    immuneTo: ["ground"]
  },
  psychic: {
    weakTo: ["bug", "ghost", "dark"],
    resistantTo: ["fighting", "psychic"],
    immuneTo: []
  },
  bug: {
    weakTo: ["fire", "flying", "rock"],
    resistantTo: ["grass", "fighting", "ground"],
    immuneTo: []
  },
  rock: {
    weakTo: ["water", "grass", "fighting", "ground", "steel"],
    resistantTo: ["normal", "fire", "poison", "flying"],
    immuneTo: []
  },
  ghost: {
    weakTo: ["ghost", "dark"],
    resistantTo: ["poison", "bug"],
    immuneTo: ["normal", "fighting"]
  },
  dragon: {
    weakTo: ["ice", "dragon", "fairy"],
    resistantTo: ["fire", "water", "electric", "grass"],
    immuneTo: []
  },
  dark: {
    weakTo: ["fighting", "bug", "fairy"],
    resistantTo: ["ghost", "dark"],
    immuneTo: ["psychic"]
  },
  steel: {
    weakTo: ["fire", "fighting", "ground"],
    resistantTo: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
    immuneTo: ["poison"]
  },
  fairy: {
    weakTo: ["poison", "steel"],
    resistantTo: ["fighting", "bug", "dark"],
    immuneTo: ["dragon"]
  }
};

// Helper to get generation for a Pokémon by its ID
export const getGeneration = (pokedexNumber: string | number): number => {
  const id = parseInt(String(pokedexNumber));
  if (id <= 151) return 1; // Gen 1: Red, Blue, Yellow
  if (id <= 251) return 2; // Gen 2: Gold, Silver, Crystal
  if (id <= 386) return 3; // Gen 3: Ruby, Sapphire, Emerald
  if (id <= 493) return 4; // Gen 4: Diamond, Pearl, Platinum
  if (id <= 649) return 5; // Gen 5: Black, White
  if (id <= 721) return 6; // Gen 6: X, Y
  if (id <= 809) return 7; // Gen 7: Sun, Moon, Ultra Sun, Ultra Moon
  if (id <= 898) return 8; // Gen 8: Sword, Shield
  return 9; // Gen 9: Scarlet, Violet
};

// Generation names for UI display
export const generationNames: Record<number, string> = {
  1: "Generation I (Red, Blue, Yellow)",
  2: "Generation II (Gold, Silver, Crystal)",
  3: "Generation III (Ruby, Sapphire, Emerald)",
  4: "Generation IV (Diamond, Pearl, Platinum)",
  5: "Generation V (Black, White)",
  6: "Generation VI (X, Y)",
  7: "Generation VII (Sun, Moon)",
  8: "Generation VIII (Sword, Shield)",
  9: "Generation IX (Scarlet, Violet)"
};

export const getPrice = (card: Partial<TCGCard> | null | undefined): string => {
  if (card?.tcgplayer?.prices) {
    const prices = card.tcgplayer.prices;
    const priceOrder = [
      "holofoil",
      "normal",
      "reverseHolofoil",
      "1stEditionHolofoil",
      "unlimitedHolofoil",
    ] as const;
    
    for (const type of priceOrder) {
      const priceData = prices[type];
      if (priceData?.market) {
        return `$${priceData.market.toFixed(2)}`;
      }
    }
  }
  return "N/A";
};

export const getPriceNumeric = (card: Partial<TCGCard> | null | undefined): number => {
  if (card?.tcgplayer?.prices) {
    const prices = card.tcgplayer.prices;
    const priceOrder = [
      "holofoil",
      "normal",
      "reverseHolofoil",
      "1stEditionHolofoil",
      "unlimitedHolofoil",
    ] as const;
    
    for (const type of priceOrder) {
      const priceData = prices[type];
      if (priceData?.market) {
        return priceData.market;
      }
    }
  }
  return 0;
};

export const getRarityRank = (card: Partial<TCGCard> | null | undefined): number => {
  const rarity = card?.rarity;
  const rarityMap: Record<string, number> = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    "Rare Holo": 4,
    "Rare Ultra": 5,
    "Rare Secret": 6,
    "Rare Holo GX": 7,
    "Rare Rainbow": 8,
    "Rare Prism Star": 9,
    "Rare Full Art": 10,
    "Rare Holo EX": 11,
    "Rare Holo V": 12,
    "Rare Holo VMAX": 13,
  };
  return rarityMap[rarity || ''] || 0;
};

// Pocket TCG type mapping - maps Pocket-specific type names to standard TCG types
export const pocketTypeMapping: Record<string, string> = {
  'lighting': 'lightning', // Common typo
  'lightning': 'lightning', // Direct mapping for consistency
  'electric': 'lightning', // Map electric to lightning for pocket
  'darkness': 'darkness',
  'dark': 'darkness', // Map standard dark to pocket darkness
  'metal': 'metal',
  'steel': 'metal', // Map standard steel to pocket metal
  'colorless': 'colorless',
  'trainer': 'trainer',
  // Keep standard types as-is for pocket cards
  'psychic': 'psychic',
  'normal': 'normal',
  'fire': 'fire',
  'water': 'water',
  'grass': 'grass',
  'ice': 'ice',
  'fighting': 'fighting',
  'poison': 'poison',
  'ground': 'ground',
  'flying': 'flying',
  'bug': 'bug',
  'rock': 'rock',
  'ghost': 'ghost',
  'dragon': 'dragon',
  'fairy': 'fairy',
};

// Helper to map Pocket type names to standard types for TCG colors
export const mapPocketTypeToStandard = (pocketType: string | null | undefined): PocketTypeMappingResult => {
  if (!pocketType || typeof pocketType !== 'string') {
    return {
      displayName: '',
      standardType: '',
      isPocketMapped: false
    };
  }
  
  const lowerType = pocketType.toLowerCase();
  const mappedType = pocketTypeMapping[lowerType];
  
  if (mappedType) {
    return {
      displayName: pocketType, // No TCG suffix in display
      standardType: mappedType,
      isPocketMapped: true
    };
  }
  
  return {
    displayName: pocketType,
    standardType: lowerType,
    isPocketMapped: false
  };
};

// Helper to extract ID from a PokeAPI URL (e.g., "https://pokeapi.co/api/v2/pokemon/25/")
export const extractIdFromUrl = (urlString: string | null | undefined): string | null => {
  if (typeof urlString !== 'string' || !urlString) {
    return null;
  }
  const parts = urlString.split('/').filter(Boolean);
  return parts.pop() || null; // The ID is usually the last part of the path
};

export const getOfficialArtworkSpriteUrl = (pokemonId: string | number | null | undefined): string => {
  if (!pokemonId) return "/dextrendslogo.png"; // Fallback image
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};