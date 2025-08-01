// Type definitions for TCG Set Detail components

import type { TCGCard } from '../../types/api/cards';

export interface SetStatistics {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: TCGCard[];
}

export interface CardWithMarketPrice extends TCGCard {
  marketPrice: number;
}