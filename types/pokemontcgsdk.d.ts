declare module 'pokemontcgsdk' {
  export interface Card {
    id: string;
    name: string;
    supertype: 'Pokémon' | 'Trainer' | 'Energy';
    subtypes?: string[];
    level?: string;
    hp?: string;
    types?: string[];
    evolvesFrom?: string;
    abilities?: any[];
    attacks?: any[];
    weaknesses?: any[];
    resistances?: any[];
    retreatCost?: string[];
    convertedRetreatCost?: number;
    set: any;
    number: string;
    artist?: string;
    rarity?: string;
    flavorText?: string;
    nationalPokedexNumbers?: number[];
    legalities?: any;
    images: {
      small: string;
      large: string;
    };
    tcgplayer?: any;
    cardmarket?: any;
    currentPrice?: number;
  }

  export const card: {
    find(id: string): Promise<Card>;
    where(params: { q?: string; [key: string]: any }): Promise<Card[]>;
    all(): Promise<Card[]>;
  };

  export const set: {
    find(id: string): Promise<any>;
    where(params: any): Promise<any[]>;
    all(): Promise<any[]>;
  };

  const pokemon: {
    configure(options: { apiKey: string }): void;
    card: typeof card;
    set: typeof set;
  };

  export default pokemon;
}