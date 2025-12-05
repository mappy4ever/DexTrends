// TCG Card API type definitions

export interface TCGCard {
  id: string;
  name: string;
  supertype: 'Pokémon' | 'Trainer' | 'Energy';
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  ancientTrait?: AncientTrait;
  abilities?: Ability[];
  attacks?: Attack[];
  weaknesses?: Weakness[];
  resistances?: Resistance[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: CardSet;
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Legalities;
  regulationMark?: string;
  images: CardImages;
  tcgplayer?: TCGPlayer;
  cardmarket?: CardMarket;
  /** Current market price (computed from tcgplayer/cardmarket data) */
  currentPrice?: number;
}

export interface AncientTrait {
  name: string;
  text: string;
}

export interface Ability {
  name: string;
  text: string;
  type: string;
}

export interface Attack {
  name: string;
  cost: string[];
  convertedEnergyCost: number;
  damage: string;
  text?: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Resistance {
  type: string;
  value: string;
}

export interface CardSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities?: Legalities;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

export interface SetImages {
  symbol: string;
  logo: string;
}

export interface Legalities {
  unlimited?: 'Legal' | 'Banned';
  expanded?: 'Legal' | 'Banned';
  standard?: 'Legal' | 'Banned';
}

export interface CardImages {
  small: string;
  large: string;
}

export interface TCGPlayer {
  url: string;
  updatedAt: string;
  prices?: {
    normal?: PriceData;
    holofoil?: PriceData;
    reverseHolofoil?: PriceData;
    '1stEditionNormal'?: PriceData;
    '1stEditionHolofoil'?: PriceData;
    unlimitedHolofoil?: PriceData;
  };
}

export interface PriceData {
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  market?: number | null;
  directLow?: number | null;
}

export interface CardMarket {
  url: string;
  updatedAt: string;
  prices?: {
    averageSellPrice?: number | null;
    lowPrice?: number | null;
    trendPrice?: number | null;
    germanProLow?: number | null;
    suggestedPrice?: number | null;
    reverseHoloSell?: number | null;
    reverseHoloLow?: number | null;
    reverseHoloTrend?: number | null;
    lowPriceExPlus?: number | null;
    avg1?: number | null;
    avg7?: number | null;
    avg30?: number | null;
    reverseHoloAvg1?: number | null;
    reverseHoloAvg7?: number | null;
    reverseHoloAvg30?: number | null;
  };
}

// Card search parameters
export interface CardSearchParams {
  q?: string;
  name?: string;
  supertype?: string;
  subtypes?: string | string[];
  types?: string | string[];
  hp?: string;
  weaknesses?: string | string[];
  resistances?: string | string[];
  retreatCost?: string | number;
  set?: string;
  series?: string;
  artist?: string;
  rarity?: string;
  nationalPokedexNumbers?: string | number | number[];
  legalities?: string;
  regulationMark?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
}

// Card list response
export interface CardListResponse {
  data: TCGCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Set list response
export interface SetListResponse {
  data: CardSet[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

// Simplified card for list displays
export interface SimpleCard {
  id: string;
  name: string;
  image: string;
  set: string;
  number: string;
  rarity?: string;
  price?: number;
  types?: string[];
}

// Price history entry
export interface PriceHistoryEntry {
  date: string;
  price: number;
  priceType: 'market' | 'low' | 'mid' | 'high';
}

// Collection card (user's collection)
export interface CollectionCard {
  cardId: string;
  quantity: number;
  condition?: 'NM' | 'LP' | 'MP' | 'HP' | 'D';
  language?: string;
  firstEdition?: boolean;
  notes?: string;
  dateAdded: string;
  dateModified?: string;
}

// Deck card
export interface DeckCard {
  cardId: string;
  count: number;
  card?: TCGCard;
}

// Deck definition
export interface Deck {
  id: string;
  name: string;
  format: 'standard' | 'expanded' | 'unlimited';
  cards: DeckCard[];
  dateCreated: string;
  dateModified: string;
  description?: string;
  tags?: string[];
}