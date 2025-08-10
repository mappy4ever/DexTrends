declare module 'pokemontcgsdk' {
  export interface CardAbility {
    name: string;
    text: string;
    type: string;
  }

  export interface CardAttack {
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }

  export interface CardWeakness {
    type: string;
    value: string;
  }

  export interface CardResistance {
    type: string;
    value: string;
  }

  export interface CardSet {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities?: CardLegalities;
    ptcgoCode?: string;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  }

  export interface CardLegalities {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  }

  export interface TCGPlayerPricing {
    url?: string;
    updatedAt?: string;
    prices?: {
      normal?: PriceRange;
      holofoil?: PriceRange;
      reverseHolofoil?: PriceRange;
    };
  }

  export interface CardMarketPricing {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
  }

  export interface PriceRange {
    low?: number;
    mid?: number;
    high?: number;
    market?: number;
    directLow?: number;
  }

  export interface TCGApiResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    count: number;
    totalCount: number;
  }

  export interface Card {
    id: string;
    name: string;
    supertype: 'Pokémon' | 'Trainer' | 'Energy';
    subtypes?: string[];
    level?: string;
    hp?: string;
    types?: string[];
    evolvesFrom?: string;
    abilities?: CardAbility[];
    attacks?: CardAttack[];
    weaknesses?: CardWeakness[];
    resistances?: CardResistance[];
    retreatCost?: string[];
    convertedRetreatCost?: number;
    set: CardSet;
    number: string;
    artist?: string;
    rarity?: string;
    flavorText?: string;
    nationalPokedexNumbers?: number[];
    legalities?: CardLegalities;
    images: {
      small: string;
      large: string;
    };
    tcgplayer?: TCGPlayerPricing;
    cardmarket?: CardMarketPricing;
    currentPrice?: number;
  }

  export const card: {
    find(id: string): Promise<Card>;
    where(params: { q?: string; [key: string]: unknown }): Promise<TCGApiResponse<Card>>;
    all(): Promise<TCGApiResponse<Card>>;
  };

  export const set: {
    find(id: string): Promise<CardSet>;
    where(params: Record<string, unknown>): Promise<TCGApiResponse<CardSet>>;
    all(): Promise<TCGApiResponse<CardSet>>;
  };

  const pokemon: {
    configure(options: { apiKey: string }): void;
    card: typeof card;
    set: typeof set;
  };

  export default pokemon;
}