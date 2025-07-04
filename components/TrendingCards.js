import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from '../context/ThemeContext';

export default function TrendingCards({ cards }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [trendingCards, setTrendingCards] = useState([]);

  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Process cards to identify trending ones (both up and down)
    const processCards = () => {
      // In a real application, this would be based on actual price history data
      // Here we're simulating trending cards based on price volatility
      
      // Calculate price trend for each card
      const processedCards = cards.map(card => {
        // Get the current price
        let currentPrice = 0;
        
        if (card.tcgplayer?.prices) {
          const prices = card.tcgplayer.prices;
          currentPrice = prices.holofoil?.market || 
                         prices.normal?.market || 
                         prices.reverseHolofoil?.market || 
                         prices.firstEditionHolofoil?.market ||
                         prices.unlimitedHolofoil?.market || 0;
        }
        
        if (currentPrice === 0) return null; // Skip cards without prices
        
        // Use deterministic hash based on card ID for consistent "trending" data
        // This creates a pseudo-random but consistent value for each card
        const hashCode = card.id.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        // Generate deterministic volatility factor between -30% and +30%
        const normalizedHash = (Math.abs(hashCode) % 1000) / 1000; // 0 to 0.999
        const volatilityFactor = (normalizedHash * 0.6) - 0.3; // -0.3 to +0.3
        const previousPrice = currentPrice * (1 - volatilityFactor);
        
        // Calculate percent change
        const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
        
        return {
          ...card,
          currentPrice,
          previousPrice,
          percentChange: parseFloat(percentChange.toFixed(2)),
          isRising: percentChange > 0
        };
      }).filter(Boolean); // Remove null values
      
      // Sort by absolute value of percent change (highest volatility first)
      return processedCards.sort((a, b) => 
        Math.abs(b.percentChange) - Math.abs(a.percentChange)
      ).slice(0, 8); // Take top 8 trending cards
    };
    
    setTrendingCards(processCards());
  }, [cards]);
  
  const navigateToCardDetails = (card) => {
    router.push(`/cards/${card.id}`);
  };
  
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
            {trendingCards
              .filter(card => card.percentChange > 0)
              .slice(0, 4)
              .map(card => (
                <div 
                  key={card.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all" onClick={() => navigateToCardDetails(card)}>
                  {card.images?.small && (
                    <img 
                      src={card.images.small} 
                      alt={card.name}
                      className="w-10 h-14 object-contain rounded"  />
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
            {trendingCards
              .filter(card => card.percentChange < 0)
              .slice(0, 4)
              .map(card => (
                <div 
                  key={card.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-all" onClick={() => navigateToCardDetails(card)}>
                  {card.images?.small && (
                    <img 
                      src={card.images.small} 
                      alt={card.name}
                      className="w-10 h-14 object-contain rounded"  />
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
}
