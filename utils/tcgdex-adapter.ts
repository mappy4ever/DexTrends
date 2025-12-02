/**
 * TCGDex Adapter
 *
 * Transforms TCGDex API responses to existing app type structures.
 * This allows migrating to TCGDex without changing frontend components.
 */

import type {
  TCGDexCard,
  TCGDexSet,
  TCGDexSetBrief,
  TCGDexAttack,
  TCGDexAbility,
  TCGDexWeakness,
  TCGDexResistance,
  TCGDexPricing,
  TCGDexTCGPlayerPricing,
  TCGDexCardMarketPricing,
} from '../types/api/tcgdex';

import type {
  TCGCard,
  CardSet,
  Attack,
  Ability,
  Weakness,
  Resistance,
  TCGPlayer,
  CardMarket,
  PriceData,
  CardImages,
  SetImages,
  Legalities,
} from '../types/api/cards';

// ============================================================================
// Card Transformations
// ============================================================================

/**
 * Transform a TCGDex card to the existing TCGCard format
 */
export function transformCard(tcgdexCard: TCGDexCard): TCGCard {
  return {
    id: tcgdexCard.id,
    name: tcgdexCard.name,
    supertype: mapCategory(tcgdexCard.category),
    subtypes: deriveSubtypes(tcgdexCard),
    hp: tcgdexCard.hp?.toString(),
    types: tcgdexCard.types,
    evolvesFrom: tcgdexCard.evolveFrom,
    evolvesTo: tcgdexCard.evolveTo,
    rules: tcgdexCard.effect ? [tcgdexCard.effect] : undefined,
    abilities: tcgdexCard.abilities?.map(transformAbility),
    attacks: tcgdexCard.attacks?.map(transformAttack),
    weaknesses: tcgdexCard.weaknesses?.map(transformWeakness),
    resistances: tcgdexCard.resistances?.map(transformResistance),
    retreatCost: tcgdexCard.retreat ? Array(tcgdexCard.retreat).fill('Colorless') : undefined,
    convertedRetreatCost: tcgdexCard.retreat,
    set: transformSetBrief(tcgdexCard.set),
    number: tcgdexCard.localId,
    artist: tcgdexCard.illustrator,
    rarity: tcgdexCard.rarity,
    flavorText: tcgdexCard.description,
    nationalPokedexNumbers: tcgdexCard.dexId,
    legalities: transformLegalities(tcgdexCard.legal),
    regulationMark: tcgdexCard.regulationMark,
    images: transformCardImages(tcgdexCard.image),
    tcgplayer: transformTCGPlayerPricing(tcgdexCard.pricing?.tcgplayer),
    cardmarket: transformCardMarketPricing(tcgdexCard.pricing?.cardmarket),
  };
}

/**
 * Transform multiple cards
 */
export function transformCards(tcgdexCards: TCGDexCard[]): TCGCard[] {
  return tcgdexCards.map(transformCard);
}

// ============================================================================
// Set Transformations
// ============================================================================

/**
 * Transform a TCGDex set brief to CardSet format
 */
export function transformSetBrief(tcgdexSet: TCGDexSetBrief): CardSet {
  return {
    id: tcgdexSet.id,
    name: tcgdexSet.name,
    series: '', // TCGDex uses separate serie object
    printedTotal: tcgdexSet.cardCount?.official || 0,
    total: tcgdexSet.cardCount?.total || 0,
    releaseDate: '',
    updatedAt: new Date().toISOString(),
    images: {
      symbol: tcgdexSet.symbol || '',
      logo: tcgdexSet.logo || '',
    },
  };
}

/**
 * Transform a full TCGDex set to CardSet format
 */
export function transformSet(tcgdexSet: TCGDexSet): CardSet {
  return {
    id: tcgdexSet.id,
    name: tcgdexSet.name,
    series: tcgdexSet.serie?.name || '',
    printedTotal: tcgdexSet.cardCount?.official || 0,
    total: tcgdexSet.cardCount?.total || 0,
    legalities: transformLegalities(tcgdexSet.legal),
    ptcgoCode: tcgdexSet.tcgOnline,
    releaseDate: tcgdexSet.releaseDate || '',
    updatedAt: new Date().toISOString(),
    images: {
      symbol: tcgdexSet.symbol || '',
      logo: tcgdexSet.logo || '',
    },
  };
}

/**
 * Transform multiple sets
 */
export function transformSets(tcgdexSets: TCGDexSetBrief[]): CardSet[] {
  return tcgdexSets.map(transformSetBrief);
}

// ============================================================================
// Attack/Ability Transformations
// ============================================================================

function transformAttack(attack: TCGDexAttack): Attack {
  return {
    name: attack.name,
    cost: attack.cost || [],
    convertedEnergyCost: attack.cost?.length || 0,
    damage: attack.damage?.toString() || '',
    text: attack.effect,
  };
}

function transformAbility(ability: TCGDexAbility): Ability {
  return {
    name: ability.name,
    text: ability.effect || '',
    type: ability.type || 'Ability',
  };
}

function transformWeakness(weakness: TCGDexWeakness): Weakness {
  return {
    type: weakness.type,
    value: weakness.value || '×2',
  };
}

function transformResistance(resistance: TCGDexResistance): Resistance {
  return {
    type: resistance.type,
    value: resistance.value || '-30',
  };
}

// ============================================================================
// Pricing Transformations
// ============================================================================

function transformTCGPlayerPricing(pricing?: TCGDexTCGPlayerPricing): TCGPlayer | undefined {
  if (!pricing) return undefined;

  const prices: TCGPlayer['prices'] = {};

  if (pricing.normal) {
    prices.normal = transformTCGPlayerPriceData(pricing.normal);
  }
  if (pricing.holofoil) {
    prices.holofoil = transformTCGPlayerPriceData(pricing.holofoil);
  }
  if (pricing.reverse) {
    prices.reverseHolofoil = transformTCGPlayerPriceData(pricing.reverse);
  }

  return {
    url: '', // TCGDex doesn't provide direct URLs
    updatedAt: pricing.updatedAt || new Date().toISOString(),
    prices: Object.keys(prices).length > 0 ? prices : undefined,
  };
}

function transformTCGPlayerPriceData(data: {
  lowPrice?: number;
  midPrice?: number;
  highPrice?: number;
  marketPrice?: number;
  directLowPrice?: number;
}): PriceData {
  return {
    low: data.lowPrice ?? null,
    mid: data.midPrice ?? null,
    high: data.highPrice ?? null,
    market: data.marketPrice ?? null,
    directLow: data.directLowPrice ?? null,
  };
}

function transformCardMarketPricing(pricing?: TCGDexCardMarketPricing): CardMarket | undefined {
  if (!pricing) return undefined;

  return {
    url: '', // TCGDex doesn't provide direct URLs
    updatedAt: pricing.updatedAt || new Date().toISOString(),
    prices: {
      averageSellPrice: pricing.avg ?? null,
      lowPrice: pricing.low ?? null,
      trendPrice: pricing.trend ?? null,
      avg1: pricing.avg1 ?? null,
      avg7: pricing.avg7 ?? null,
      avg30: pricing.avg30 ?? null,
      reverseHoloSell: pricing.avgReverse ?? null,
      reverseHoloLow: pricing.lowReverse ?? null,
      reverseHoloTrend: pricing.trendReverse ?? null,
    },
  };
}

// ============================================================================
// Helper Transformations
// ============================================================================

function mapCategory(category: 'Pokemon' | 'Trainer' | 'Energy'): 'Pokémon' | 'Trainer' | 'Energy' {
  if (category === 'Pokemon') return 'Pokémon';
  return category;
}

function deriveSubtypes(card: TCGDexCard): string[] | undefined {
  const subtypes: string[] = [];

  if (card.stage) {
    subtypes.push(card.stage);
  }
  if (card.trainerType) {
    subtypes.push(card.trainerType);
  }
  if (card.energyType) {
    subtypes.push(card.energyType);
  }

  return subtypes.length > 0 ? subtypes : undefined;
}

function transformCardImages(imageBase?: string): CardImages {
  if (!imageBase) {
    return {
      small: '',
      large: '',
    };
  }

  // TCGDex images: append /low.png or /high.png
  return {
    small: `${imageBase}/low.png`,
    large: `${imageBase}/high.png`,
  };
}

function transformLegalities(legal?: { standard?: boolean; expanded?: boolean }): Legalities | undefined {
  if (!legal) return undefined;

  return {
    standard: legal.standard ? 'Legal' : 'Banned',
    expanded: legal.expanded ? 'Legal' : 'Banned',
    unlimited: 'Legal', // TCGDex doesn't track unlimited
  };
}

// ============================================================================
// API URL Helpers
// ============================================================================

const TCGDEX_BASE_URL = 'https://api.tcgdex.net/v2';

export const TCGDexEndpoints = {
  sets: (lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/sets`,
  set: (id: string, lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/sets/${id}`,
  cards: (lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/cards`,
  card: (id: string, lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/cards/${id}`,
  series: (lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/series`,
  serie: (id: string, lang = 'en') => `${TCGDEX_BASE_URL}/${lang}/series/${id}`,
};
