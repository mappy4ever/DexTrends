import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import pokemon from "pokemontcgsdk";
import CardList from '../components/CardList';
import { useTheme } from '../context/themecontext';
import { TrendingLoadingScreen } from '../components/ui/UnifiedLoadingScreen';
import logger from '../utils/logger';

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

export default function TrendingPage() {
  const { theme } = useTheme();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingData, setTrendingData] = useState({ rising: [], falling: [] });
  
  // Helper to get price from a card
  function getPrice(card) {
    let price = 0;
    
    if (card.tcgplayer?.prices) {
      const prices = card.tcgplayer.prices;
      price = prices.holofoil?.market || 
              prices.normal?.market || 
              prices.reverseHolofoil?.market || 
              prices.firstEditionHolofoil?.market ||
              prices.unlimitedHolofoil?.market || 0;
    }
    
    return price;
  }
  
  // Helper for rarity ranking
  function getRarityRank(card) {
    const rarityOrder = {
      "Common": 1,
      "Uncommon": 2,
      "Rare": 3,
      "Rare Holo": 4,
      "Rare Ultra": 5,
      "Rare Secret": 6,
      "Rare Holo GX": 7,
      "Rare Rainbow": 8,
      "Rare Prism Star": 9,
      "Rare Full Art": 10,
      "Rare Holo EX": 11,
      "Rare Holo V": 12,
      "Rare Holo VMAX": 13,
      "Amazing Rare": 14,
      "Ultra Rare": 15,
      "Secret Rare": 16,
      "Hyper Rare": 17,
    };
    return rarityOrder[card.rarity] || 0;
  }
  
  // Fetch cards to analyze trends
  useEffect(() => {
    const fetchTrendingCards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, we would fetch cards with price history
        // Here we'll fetch a mix of popular cards and simulate trends
        const popularPokemon = [
          'charizard', 'pikachu', 'mew', 'mewtwo', 'lugia',
          'rayquaza', 'blastoise', 'venusaur', 'eevee', 'gengar',
          'gyarados', 'dragonite', 'alakazam', 'snorlax', 'jigglypuff'
        ];
        
        // Choose some random popular Pokémon
        const selectedPokemon = popularPokemon.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        // Fetch cards for these Pokémon
        const promises = selectedPokemon.map(name => 
          pokemon.card.where({ q: `name:${name}*` })
        );
        
        const results = await Promise.all(promises);
        let allCards = [];
        
        results.forEach(result => {
          if (result.data && result.data.length > 0) {
            // Only include cards with price data
            const cardsWithPrices = result.data.filter(card => 
              card.tcgplayer?.prices?.holofoil?.market || 
              card.tcgplayer?.prices?.normal?.market ||
              card.tcgplayer?.prices?.reverseHolofoil?.market ||
              card.tcgplayer?.prices?.firstEditionHolofoil?.market
            );
            
            allCards = [...allCards, ...cardsWithPrices];
          }
        });
        
        // Process cards to simulate trending data
        const processedCards = allCards.map(card => {
          const currentPrice = getPrice(card);
          if (currentPrice === 0) return null;
          
          // Simulate price change (-40% to +40%)
          const volatilityFactor = Math.random() * 0.8 - 0.4;
          const previousPrice = currentPrice * (1 - volatilityFactor);
          const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
          
          return {
            ...card,
            currentPrice,
            previousPrice,
            percentChange: parseFloat(percentChange.toFixed(2)),
            isRising: percentChange > 0
          };
        }).filter(Boolean);
        
        // Sort by percent change
        const rising = processedCards
          .filter(card => card.percentChange > 0)
          .sort((a, b) => b.percentChange - a.percentChange);
        
        const falling = processedCards
          .filter(card => card.percentChange < 0)
          .sort((a, b) => a.percentChange - b.percentChange);
          
        setTrendingData({ rising, falling });
        setCards(processedCards);
        setLoading(false);
      } catch (err) {
        logger.error("Error fetching trending cards:", { error: err });
        setError("Failed to load trending card data.");
        setLoading(false);
      }
    };
    
    fetchTrendingCards();
  }, []);
  
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Trending Cards</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
        <p className="text-gray-600 mt-2">Track cards with significant price changes in the market</p>
      </div>
      {loading ? (
        <TrendingLoadingScreen 
          message="Analyzing market trends..."
          preventFlash={true}
        />
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-green-600">
              <span className="mr-2">▲</span> Rising Prices
            </h2>
            <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {trendingData.rising.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingData.rising.map(card => (
                    <Link
                      href={`/cards/${card.id}`}
                            key={card.id}
                      className={`block p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex flex-col items-center">
                        {card.images?.small && (
                          <img 
                            src={card.images.small} 
                            alt={card.name}
                            className="w-24 h-32 object-contain rounded"
                          />
                        )}
                        <p className="font-semibold mt-2 text-center">{card.name}</p>
                        <p className="text-sm text-gray-500">{card.rarity || 'N/A'} · #{card.number}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-green-600 font-bold">${card.currentPrice.toFixed(2)}</span>
                          <span className="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded-full">
                            +{card.percentChange}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No rising price trends available</p>
              )}
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-red-600">
              <span className="mr-2">▼</span> Falling Prices
            </h2>
            <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {trendingData.falling.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingData.falling.map(card => (
                    <Link
                      href={`/cards/${card.id}`}
                            key={card.id}
                      className={`block p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                      } transition-all`}
                    >
                      <div className="flex flex-col items-center">
                        {card.images?.small && (
                          <img 
                            src={card.images.small} 
                            alt={card.name}
                            className="w-24 h-32 object-contain rounded"
                          />
                        )}
                        <p className="font-semibold mt-2 text-center">{card.name}</p>
                        <p className="text-sm text-gray-500">{card.rarity || 'N/A'} · #{card.number}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-red-600 font-bold">${card.currentPrice.toFixed(2)}</span>
                          <span className="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                            {card.percentChange}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No falling price trends available</p>
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4 mb-8">
            Note: Trend data is simulated for demonstration purposes. In a production environment, this would use real historical price data.
          </div>
        </>
      )}
    </div>
  );
}
