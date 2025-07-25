import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from '../context/UnifiedAppContext';
import { TCGCard } from '../types/api/cards';

// Extended TCGCard type with trending data
interface TrendingCard extends TCGCard {
  currentPrice: number;
  previousPrice: number;
  percentChange: number;
  isRising: boolean;
}

interface TrendingCardsProps {
  cards: TCGCard[];
}

// Memoized function to calculate price from card data
const calculateCardPrice = (card: TCGCard): number => {
  if (!card.tcgplayer?.prices) return 0;
  
  const prices = card.tcgplayer.prices;
  return prices.holofoil?.market || 
         prices.normal?.market || 
         prices.reverseHolofoil?.market || 
         prices['1stEditionHolofoil']?.market ||
         prices.unlimitedHolofoil?.market || 0;
};

// Memoized function to calculate trending data
const calculateTrendingData = (card: TCGCard, currentPrice: number): {
  previousPrice: number;
  percentChange: number;
  isRising: boolean;
} => {
  // Use deterministic hash based on card ID for consistent "trending" data
  const hashCode = card.id.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Generate deterministic volatility factor between -30% and +30%
  const normalizedHash = (Math.abs(hashCode) % 1000) / 1000;
  const volatilityFactor = (normalizedHash * 0.6) - 0.3;
  const previousPrice = currentPrice * (1 - volatilityFactor);
  
  // Calculate percent change
  const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  
  return {
    previousPrice,
    percentChange: parseFloat(percentChange.toFixed(2)),
    isRising: percentChange > 0
  };
};

const TrendingCards = memo<TrendingCardsProps>(({ cards }) => {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Memoize trending cards calculation
  const trendingCards = useMemo<TrendingCard[]>(() => {
    if (!cards || cards.length === 0) return [];
    
    // Process cards to identify trending ones
    const processedCards = cards.map(card => {
      const currentPrice = calculateCardPrice(card);
      
      if (currentPrice === 0) return null; // Skip cards without prices
      
      const trendingData = calculateTrendingData(card, currentPrice);
      
      return {
        ...card,
        currentPrice,
        ...trendingData
      } as TrendingCard;
    }).filter((card): card is TrendingCard => card !== null); // Remove null values with type guard
    
    // Sort by absolute value of percent change (highest volatility first)
    return processedCards.sort((a, b) => 
      Math.abs(b.percentChange) - Math.abs(a.percentChange)
    ).slice(0, 8); // Take top 8 trending cards
  }, [cards]);
  
  // Memoize rising and falling cards
  const risingCards = useMemo(() => 
    trendingCards.filter(card => card.percentChange > 0).slice(0, 4),
    [trendingCards]
  );
  
  const fallingCards = useMemo(() => 
    trendingCards.filter(card => card.percentChange < 0).slice(0, 4),
    [trendingCards]
  );
  
  // Memoize navigation callback
  const navigateToCardDetails = useCallback((card: TrendingCard) => {
    router.push(`/cards/${card.id}`);
  }, [router]);
  
  if (trendingCards.length === 0) return null;
  
  return (
    <div className={`p-6 rounded-xl shadow-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trending Cards</h2>
        <Link href="/trending" className="text-blue-600 hover:underline text-sm">
          View All Trends
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rising Prices */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="text-green-500 mr-2">▲</span> Rising Prices
          </h3>
          <div className="space-y-3">
            {risingCards.map(card => (
              <div 
                key={card.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all" 
                onClick={() => navigateToCardDetails(card)}
              >
                {card.images?.small && (
                  <img 
                    src={card.images.small} 
                    alt={card.name}
                    className="w-10 h-14 object-contain rounded"  
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-gray-500">{card.rarity || 'N/A'} · #{card.number}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-green-600 font-bold">${card.currentPrice.toFixed(2)}</span>
                  <span className="text-xs text-green-500">+{card.percentChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Falling Prices */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="text-red-500 mr-2">▼</span> Falling Prices
          </h3>
          <div className="space-y-3">
            {fallingCards.map(card => (
              <div 
                key={card.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all" 
                onClick={() => navigateToCardDetails(card)}
              >
                {card.images?.small && (
                  <img 
                    src={card.images.small} 
                    alt={card.name}
                    className="w-10 h-14 object-contain rounded"  
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-gray-500">{card.rarity || 'N/A'} · #{card.number}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-red-600 font-bold">${card.currentPrice.toFixed(2)}</span>
                  <span className="text-xs text-red-500">{card.percentChange}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-4">
        Note: Trend data is simulated for demonstration purposes.
      </div>
    </div>
  );
});

TrendingCards.displayName = 'TrendingCards';

export default TrendingCards;