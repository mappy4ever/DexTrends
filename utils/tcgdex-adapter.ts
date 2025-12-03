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
// Release Date Mapping (for accurate sorting when API doesn't provide dates)
// ============================================================================

/**
 * Static release dates for sets - used for accurate sorting.
 * TCGDex brief endpoints don't include release dates.
 */
const RELEASE_DATES: Record<string, string> = {
  // Scarlet & Violet Era (2023-2025)
  'sv10': '2025-06-06', 'sv09': '2025-03-28', 'sv08': '2024-11-08',
  'sv07': '2024-08-09', 'sv06': '2024-05-24', 'sv05': '2024-03-22',
  'sv04': '2023-11-03', 'sv03': '2023-08-11', 'sv02': '2023-06-09',
  'sv01': '2023-03-31', 'svp': '2023-03-31',
  'sv3pt5': '2023-09-22', 'sv4pt5': '2024-01-26', 'sv5pt5': '2024-06-07',
  'sv6pt5': '2024-09-13', 'sv7pt5': '2024-10-18', 'sv8pt5': '2024-12-13',
  // Sword & Shield Era (2020-2023)
  'swsh12': '2022-11-11', 'swsh11': '2022-06-17', 'swsh10': '2022-02-25',
  'swsh9': '2021-11-12', 'swsh8': '2021-08-27', 'swsh7': '2021-06-18',
  'swsh6': '2021-03-19', 'swsh5': '2020-11-13', 'swsh4': '2020-08-14',
  'swsh3': '2020-05-01', 'swsh2': '2020-02-07', 'swsh1': '2020-02-07',
  'swshp': '2020-02-07',
  'swsh45': '2021-02-19', 'swsh35': '2020-10-23', 'swsh12pt5': '2022-10-28',
  // Sun & Moon Era (2017-2019)
  'sm12': '2019-08-02', 'sm11': '2019-05-03', 'sm10': '2019-02-01',
  'sm9': '2018-11-02', 'sm8': '2018-08-03', 'sm7': '2018-05-04',
  'sm6': '2018-02-02', 'sm5': '2017-11-03', 'sm4': '2017-08-11',
  'sm3': '2017-05-05', 'sm2': '2017-02-03', 'sm1': '2017-02-03',
  'smp': '2017-02-03',
  'sm35': '2017-10-06', 'sm75': '2018-04-06', 'sm115': '2019-02-15',
  // XY Era (2014-2016)
  'xy12': '2016-11-02', 'xy11': '2016-08-03', 'xy10': '2016-05-02',
  'xy9': '2016-02-03', 'xy8': '2015-11-04', 'xy7': '2015-08-12',
  'xy6': '2015-05-06', 'xy5': '2015-02-04', 'xy4': '2014-11-05',
  'xy3': '2014-08-13', 'xy2': '2014-05-07', 'xy1': '2014-02-05',
  'xyp': '2014-02-05',
  // Black & White Era (2011-2013)
  'bw11': '2013-11-06', 'bw10': '2013-08-14', 'bw9': '2013-05-08',
  'bw8': '2013-02-06', 'bw7': '2012-11-07', 'bw6': '2012-08-15',
  'bw5': '2012-05-09', 'bw4': '2012-02-08', 'bw3': '2011-11-16',
  'bw2': '2011-08-31', 'bw1': '2011-04-25', 'bwp': '2011-04-25',
  // HeartGold SoulSilver Era (2010-2011)
  'hgss4': '2010-11-03', 'hgss3': '2010-08-18', 'hgss2': '2010-05-12',
  'hgss1': '2010-02-10', 'col1': '2011-02-09',
  // Platinum Era (2009-2010)
  'pl4': '2009-11-04', 'pl3': '2009-08-19', 'pl2': '2009-05-16',
  'pl1': '2009-02-11',
  // Diamond & Pearl Era (2007-2009)
  'dp7': '2008-11-05', 'dp6': '2008-08-20', 'dp5': '2008-05-21',
  'dp4': '2008-02-13', 'dp3': '2007-11-07', 'dp2': '2007-08-22',
  'dp1': '2007-05-23', 'dpp': '2007-05-23',
  // EX Era (2003-2007)
  'ex16': '2007-02-14', 'ex15': '2006-11-08', 'ex14': '2006-08-30',
  'ex13': '2006-05-03', 'ex12': '2006-02-13', 'ex11': '2005-12-01',
  'ex10': '2005-08-22', 'ex9': '2005-06-01', 'ex8': '2005-02-14',
  'ex7': '2004-11-08', 'ex6': '2004-08-16', 'ex5': '2004-03-15',
  'ex4': '2004-03-01', 'ex3': '2003-11-24', 'ex2': '2003-09-15',
  'ex1': '2003-06-18',
  // Classic Era (1999-2003)
  'base1': '1999-01-09', 'base2': '1999-06-16', 'base3': '1999-10-10',
  'base4': '2000-04-24', 'base5': '2000-12-16', 'base6': '2002-06-24',
  'basep': '1999-07-01',
  'neo1': '2000-12-16', 'neo2': '2001-03-23', 'neo3': '2001-09-21',
  'neo4': '2002-02-28',
  'gym1': '2000-08-14', 'gym2': '2000-10-16',
  'si1': '2001-07-31', 'lc': '2002-05-24',
  'ecard1': '2002-09-15', 'ecard2': '2003-01-15', 'ecard3': '2003-05-12',
  // TCG Pocket (2024-2025)
  'A1': '2024-10-30', 'A1a': '2024-12-17', 'P-A': '2024-10-30',
  'A2': '2025-01-30', 'A2a': '2025-02-28', 'A2b': '2025-04-01',
  'A3': '2025-04-30', 'A4': '2025-05-29', 'A4a': '2025-06-04',
};

/**
 * Get release date for a set from static map or fallback
 */
export function getReleaseDateForSet(setId: string, fallback?: string): string {
  return RELEASE_DATES[setId] || fallback || '';
}

// ============================================================================
// Series Name Mapping (must be before transformers that use it)
// ============================================================================

/**
 * Map set ID prefixes to series names.
 * TCGDex set IDs follow patterns like sv1, swsh1, sm1, xy1, etc.
 */
const SERIES_MAP: Record<string, string> = {
  // Scarlet & Violet Era
  'sv': 'Scarlet & Violet',
  'svp': 'Scarlet & Violet',
  // Sword & Shield Era
  'swsh': 'Sword & Shield',
  'swshp': 'Sword & Shield',
  // Sun & Moon Era
  'sm': 'Sun & Moon',
  'smp': 'Sun & Moon',
  // XY Era
  'xy': 'XY',
  'xyp': 'XY',
  // Black & White Era
  'bw': 'Black & White',
  'bwp': 'Black & White',
  // HeartGold SoulSilver Era
  'hgss': 'HeartGold & SoulSilver',
  // Diamond & Pearl Era
  'dp': 'Diamond & Pearl',
  // EX Era
  'ex': 'EX',
  // E-Card Era
  'ecard': 'E-Card',
  // Neo Era
  'neo': 'Neo',
  // Gym Era
  'gym': 'Gym',
  // Base Era
  'base': 'Base',
  'basep': 'Wizards Promos',
  // Pop Series
  'pop': 'POP Series',
  // Platinum Era
  'pl': 'Platinum',
  // Legendary Collection
  'lc': 'Legendary Collection',
  // Other
  'det': 'Detective Pikachu',
  'fut20': 'Futsal',
  'cel25': 'Celebrations',
  'mcd': "McDonald's",
};

/**
 * Get series name from set ID
 */
export function getSeriesFromSetId(setId: string): string {
  if (!setId) return '';

  // Try exact match first (for sets like 'basep')
  if (SERIES_MAP[setId]) {
    return SERIES_MAP[setId];
  }

  // Try prefix matching (sv1 -> sv, swsh12 -> swsh)
  // Remove numbers from the end to get the prefix
  const prefix = setId.replace(/\d+$/, '').toLowerCase();
  return SERIES_MAP[prefix] || '';
}

/**
 * Format TCGDex image URL (add .png extension if needed)
 */
export function formatImageUrl(url?: string): string {
  if (!url) return '';
  // TCGDex image URLs don't have extensions, add .png
  if (!url.endsWith('.png') && !url.endsWith('.webp') && !url.endsWith('.jpg')) {
    return `${url}.png`;
  }
  return url;
}

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
 * @param tcgdexSet - The set data from TCGDex
 * @param seriesName - Optional series name (from parent series)
 * @param seriesReleaseDate - Optional release date (from parent series)
 */
export function transformSetBrief(
  tcgdexSet: TCGDexSetBrief,
  seriesName?: string,
  seriesReleaseDate?: string
): CardSet {
  // Get series name from provided value or infer from set ID
  const series = seriesName || getSeriesFromSetId(tcgdexSet.id);

  // Get release date: use static map first, then fallback to series date
  const releaseDate = getReleaseDateForSet(tcgdexSet.id, seriesReleaseDate);

  return {
    id: tcgdexSet.id,
    name: tcgdexSet.name,
    series: series,
    printedTotal: tcgdexSet.cardCount?.official || 0,
    total: tcgdexSet.cardCount?.total || 0,
    releaseDate: releaseDate,
    updatedAt: new Date().toISOString(),
    images: {
      symbol: formatImageUrl(tcgdexSet.symbol),
      logo: formatImageUrl(tcgdexSet.logo),
    },
  };
}

/**
 * Transform a full TCGDex set to CardSet format
 */
export function transformSet(tcgdexSet: TCGDexSet): CardSet {
  // Use serie name from response, or fallback to mapping from set ID
  const seriesName = tcgdexSet.serie?.name || getSeriesFromSetId(tcgdexSet.id);

  return {
    id: tcgdexSet.id,
    name: tcgdexSet.name,
    series: seriesName,
    printedTotal: tcgdexSet.cardCount?.official || 0,
    total: tcgdexSet.cardCount?.total || 0,
    legalities: transformLegalities(tcgdexSet.legal),
    ptcgoCode: tcgdexSet.tcgOnline,
    releaseDate: tcgdexSet.releaseDate || '',
    updatedAt: new Date().toISOString(),
    images: {
      symbol: formatImageUrl(tcgdexSet.symbol),
      logo: formatImageUrl(tcgdexSet.logo),
    },
  };
}

/**
 * Transform multiple sets (without series info)
 */
export function transformSets(tcgdexSets: TCGDexSetBrief[]): CardSet[] {
  return tcgdexSets.map(set => transformSetBrief(set));
}

/**
 * TCGDex Series with sets response type
 */
export interface TCGDexSeriesWithSets {
  id: string;
  name: string;
  logo?: string;
  releaseDate?: string;
  sets?: TCGDexSetBrief[];
}

/**
 * Transform sets from all series responses (provides series name for each set)
 */
export function transformSetsFromSeries(seriesArray: TCGDexSeriesWithSets[]): CardSet[] {
  const allSets: CardSet[] = [];

  for (const series of seriesArray) {
    if (series.sets && Array.isArray(series.sets)) {
      for (const set of series.sets) {
        allSets.push(transformSetBrief(set, series.name, series.releaseDate));
      }
    }
  }

  return allSets;
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
