// Pokemon TCG Pocket Cards type definitions

export interface PocketCard {
  id: string;
  name: string;
  hp?: number;
  types?: string[];
  evolvesFrom?: string;
  illustrator?: string;
  image: string;
  thumbnail?: string;
  attacks?: PocketAttack[];
  weaknesses?: PocketWeakness[];
  resistances?: PocketResistance[];
  retreatCost?: number;
  number: string;
  set: string;
  rarity: PocketRarity;
  regulation?: string;
  stage?: string;
  suffix?: string;
  supertype: 'Pokémon' | 'Trainer' | 'Energy';
  subtypes?: string[];
  description?: string;
  effect?: string;
}

export interface PocketAttack {
  name: string;
  damage?: string;
  text?: string;
  cost: string[];
  convertedEnergyCost: number;
}

export interface PocketWeakness {
  type: string;
  value: string;
}

export interface PocketResistance {
  type: string;
  value: string;
}

export type PocketRarity = 
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Double Rare'
  | 'Art Rare'
  | 'Super Art Rare'
  | 'Immersive Art Rare'
  | 'Crown Rare';

// Pocket cards API response
export interface PocketCardsResponse {
  cards: PocketCard[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Pocket card search params
export interface PocketCardSearchParams {
  name?: string;
  types?: string | string[];
  rarity?: PocketRarity | PocketRarity[];
  set?: string;
  hp?: {
    min?: number;
    max?: number;
  };
  retreatCost?: {
    min?: number;
    max?: number;
  };
  evolvesFrom?: string;
  illustrator?: string;
  supertype?: 'Pokémon' | 'Trainer' | 'Energy';
  subtypes?: string | string[];
  regulation?: string;
  sortBy?: 'name' | 'number' | 'rarity' | 'hp';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Pocket pack opening
export interface PocketPack {
  id: string;
  name: string;
  set: string;
  cards: PocketCard[];
  guaranteedRarities?: {
    rarity: PocketRarity;
    count: number;
  }[];
}

export interface PocketPackOpening {
  packId: string;
  cards: PocketCard[];
  timestamp: string;
  userId?: string;
}

// Pocket deck format
export interface PocketDeck {
  id: string;
  name: string;
  cards: PocketDeckCard[];
  energyCards: PocketDeckCard[];
  description?: string;
  tags?: string[];
  dateCreated: string;
  dateModified: string;
  isPublic?: boolean;
  userId?: string;
}

export interface PocketDeckCard {
  cardId: string;
  count: number;
  card?: PocketCard;
}

// Collection tracking
export interface PocketCollection {
  userId: string;
  cards: PocketCollectionCard[];
  stats: {
    totalCards: number;
    uniqueCards: number;
    completionPercentage: number;
    byRarity: Record<PocketRarity, number>;
    bySet: Record<string, number>;
  };
}

export interface PocketCollectionCard {
  cardId: string;
  count: number;
  firstObtained: string;
  lastObtained?: string;
  tradeable: number;
  locked: number;
}

// Trade types
export interface PocketTrade {
  id: string;
  offeredCards: PocketTradeCard[];
  requestedCards: PocketTradeCard[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PocketTradeCard {
  cardId: string;
  count: number;
  card?: PocketCard;
}

// Battle/gameplay types
export interface PocketBattleStats {
  cardId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageDamageDealt: number;
  averageTurnsSurvived: number;
  popularDecks: string[];
}

// Event/promotion types
export interface PocketEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rewards: PocketEventReward[];
  requirements?: string[];
  type: 'collection' | 'battle' | 'trade' | 'special';
}

export interface PocketEventReward {
  type: 'card' | 'pack' | 'currency' | 'cosmetic';
  itemId: string;
  quantity: number;
  rarity?: PocketRarity;
}