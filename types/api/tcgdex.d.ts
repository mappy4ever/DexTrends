/**
 * TCGDex API Type Definitions
 * https://tcgdex.dev
 *
 * Native types for TCGDex responses before transformation to existing app types.
 */

// ============================================================================
// Card Types
// ============================================================================

export interface TCGDexCard {
  id: string;
  localId: string;
  name: string;
  category: 'Pokemon' | 'Trainer' | 'Energy';

  // Pokemon-specific fields
  hp?: number;
  types?: string[];
  evolveFrom?: string;
  evolveTo?: string[];
  stage?: 'Basic' | 'Stage1' | 'Stage2' | 'VMAX' | 'VSTAR' | 'ex' | 'V' | string;

  // Battle mechanics
  attacks?: TCGDexAttack[];
  abilities?: TCGDexAbility[];
  weaknesses?: TCGDexWeakness[];
  resistances?: TCGDexResistance[];
  retreat?: number;

  // Trainer/Energy specific
  trainerType?: string;
  energyType?: string;
  effect?: string;

  // Metadata
  illustrator?: string;
  rarity?: string;
  regulationMark?: string;
  dexId?: number[];
  description?: string; // Flavor text

  // Set info (brief)
  set: TCGDexSetBrief;

  // Variants available
  variants?: TCGDexVariants;

  // Image URL (append /low.png or /high.png)
  image?: string;

  // Pricing data
  pricing?: TCGDexPricing;

  // Legality
  legal?: {
    standard?: boolean;
    expanded?: boolean;
  };

  // Related cards (when fetched with full details)
  related?: TCGDexCardBrief[];
}

export interface TCGDexAttack {
  name: string;
  cost?: string[];
  effect?: string;
  damage?: string | number;
}

export interface TCGDexAbility {
  name: string;
  effect?: string;
  type?: string;
}

export interface TCGDexWeakness {
  type: string;
  value?: string;
}

export interface TCGDexResistance {
  type: string;
  value?: string;
}

export interface TCGDexVariants {
  normal?: boolean;
  reverse?: boolean;
  holo?: boolean;
  firstEdition?: boolean;
  wPromo?: boolean;
}

// ============================================================================
// Pricing Types
// ============================================================================

export interface TCGDexPricing {
  tcgplayer?: TCGDexTCGPlayerPricing;
  cardmarket?: TCGDexCardMarketPricing;
}

export interface TCGDexTCGPlayerPricing {
  updatedAt?: string;
  normal?: TCGDexTCGPlayerPriceData;
  reverse?: TCGDexTCGPlayerPriceData;
  holofoil?: TCGDexTCGPlayerPriceData;
}

export interface TCGDexTCGPlayerPriceData {
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
}

export interface TCGDexCardMarketPricing {
  updatedAt?: string;
  avg?: number;
  low?: number;
  trend?: number;
  avg1?: number;
  avg7?: number;
  avg30?: number;
  // Holo variants
  avgHolo?: number;
  lowHolo?: number;
  trendHolo?: number;
  // Reverse variants
  avgReverse?: number;
  lowReverse?: number;
  trendReverse?: number;
}

// ============================================================================
// Set Types
// ============================================================================

export interface TCGDexSetBrief {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: {
    total?: number;
    official?: number;
  };
}

export interface TCGDexSet extends TCGDexSetBrief {
  serie?: TCGDexSerieBrief;
  tcgOnline?: string;
  releaseDate?: string;
  legal?: {
    standard?: boolean;
    expanded?: boolean;
  };
  cards?: TCGDexCardBrief[];
}

export interface TCGDexCardBrief {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

// ============================================================================
// Series Types
// ============================================================================

export interface TCGDexSerieBrief {
  id: string;
  name: string;
  logo?: string;
}

export interface TCGDexSerie extends TCGDexSerieBrief {
  sets?: TCGDexSetBrief[];
}

// ============================================================================
// API Response Types
// ============================================================================

// Sets list response (array of SetBrief)
export type TCGDexSetsResponse = TCGDexSetBrief[];

// Single set response (full Set with cards)
export type TCGDexSetResponse = TCGDexSet;

// Cards list response (array of CardBrief)
export type TCGDexCardsResponse = TCGDexCardBrief[];

// Single card response (full Card)
export type TCGDexCardResponse = TCGDexCard;

// Series list response
export type TCGDexSeriesResponse = TCGDexSerieBrief[];
