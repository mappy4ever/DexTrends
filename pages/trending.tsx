import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import CardList from '../components/CardList';
import { useTheme } from '../context/UnifiedAppContext';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import logger from '../utils/logger';
import { getPokemonSDK } from '../utils/pokemonSDK';
import { fetchJSON } from '../utils/unifiedFetch';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import type { NextPage } from 'next';
import type { TCGCard } from '../types/api/cards';

interface TrendingCard extends TCGCard {
  currentPrice: number;
  previousPrice: number;
  percentChange: number;
  isRising: boolean;
}

interface TrendingData {
  rising: TrendingCard[];
  falling: TrendingCard[];
}

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

const TrendingPage: NextPage = () => {
  const { theme } = useTheme();
  const [cards, setCards] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [trendingData, setTrendingData] = useState<TrendingData>({ rising: [], falling: [] });
  
  // Helper to get price from a card
  function getPrice(card: TCGCard): number {
    let price = 0;
    
    if (card.tcgplayer?.prices) {
      const prices = card.tcgplayer.prices;
      price = prices.holofoil?.market || 
              prices.normal?.market || 
              prices.reverseHolofoil?.market || 
              prices['1stEditionHolofoil']?.market ||
              prices.unlimitedHolofoil?.market || 0;
    }
    
    return price;
  }
  
  // Helper for rarity ranking
  function getRarityRank(card: TCGCard): number {
    const rarityOrder: Record<string, number> = {
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
    return rarityOrder[card.rarity || ''] || 0;
  }
  
  // Fetch cards to analyze trends - moved outside useEffect for retry logic
  const fetchTrendingCards = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRetrying(false);
        
        // Check if API key is available
        if (!pokemonKey) {
          const errorMessage = "Pokemon TCG API key is not configured. Please check your environment variables.";
          logger.error("Missing API key", { service: "Pokemon TCG API" });
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        // Get configured Pokemon SDK
        const pokemon = getPokemonSDK();
        
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
        const promises = selectedPokemon.map(async (name) => {
          try {
            return await pokemon.card.where({ q: `name:${name}*` });
          } catch (error) {
            logger.error('Failed to fetch cards for Pokemon', { name, error });
            return { data: [] };
          }
        });
        
        const results = await Promise.all(promises);
        let allCards: TCGCard[] = [];
        
        results.forEach(result => {
          const cards = Array.isArray(result) ? result : result?.data || [];
          if (cards && cards.length > 0) {
            // Only include cards with price data
            const cardsWithPrices = cards.filter((card: { tcgplayer?: { prices?: { holofoil?: { market?: number }, normal?: { market?: number }, reverseHolofoil?: { market?: number }, '1stEditionHolofoil'?: { market?: number }, [key: string]: unknown } } }) => 
              card.tcgplayer?.prices?.holofoil?.market || 
              card.tcgplayer?.prices?.normal?.market ||
              card.tcgplayer?.prices?.reverseHolofoil?.market ||
              card.tcgplayer?.prices?.['1stEditionHolofoil']?.market
            );
            
            allCards = [...allCards, ...(cardsWithPrices as TCGCard[])];
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
          } as TrendingCard;
        }).filter((card): card is TrendingCard => card !== null);
        
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
        setIsRetrying(false);
      } catch (err) {
        setLoading(false);
        setIsRetrying(false);
        
        // Enhanced error handling with specific error types
        let errorMessage = "Failed to load trending card data.";
        let shouldRetry = false;
        
        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
          shouldRetry = true;
        } else if (err instanceof Error) {
          if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
            errorMessage = "Request timed out. The server is taking too long to respond.";
            shouldRetry = true;
          } else if (err.message.includes('404')) {
            errorMessage = "The requested data could not be found.";
          } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
            errorMessage = "Server error occurred. Please try again in a few minutes.";
            shouldRetry = true;
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = "Access denied. API key may be invalid or expired.";
          } else if (err.message.includes('rate limit') || err.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please wait before making another request.";
            shouldRetry = true;
          }
        }
        
        logger.error("Error fetching trending cards", { 
          error: err, 
          errorMessage, 
          shouldRetry, 
          retryCount,
          timestamp: new Date().toISOString()
        });
        
        // Attempt retry for network-related errors
        if (shouldRetry && retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            retryFetch(3 - retryCount);
          }, 2000 * (retryCount + 1));
          return;
        }
        
        setError(errorMessage);
        setRetryCount(0);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonKey, retryCount]);

  // Retry logic helper
  const retryFetch = async (retries = 3, delay = 1000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
        await fetchTrendingCards();
        return;
      } catch (error) {
        logger.warn(`Fetch attempt ${attempt + 1} failed`, { error, attempt });
        if (attempt === retries - 1) {
          throw error;
        }
      }
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTrendingCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <>
      <Head>
        <title>Trending Cards - Market Movers | DexTrends</title>
        <meta name="description" content="Discover rising and falling Pokemon TCG card prices. Track market trends and find the hottest cards in the trading card game market" />
      </Head>
      <FullBleedWrapper gradient="pokedex">
        <div className="container max-w-6xl mx-auto px-[var(--page-padding-x)] py-[var(--page-padding-y)]">
          {/* Page Header */}
          <PageHeader
            title="Trending Cards"
            subtitle="Track cards with significant price changes in the market"
            gradient="green"
            size="lg"
            trailing={
              <Link
                href="/"
                className="text-[var(--text-sm)] text-blue-600 hover:underline transition-colors duration-[var(--duration-fast)]"
              >
                Back to Home
              </Link>
            }
          />
          {loading ? (
            <PageLoader text={isRetrying ? `Retrying... (Attempt ${retryCount + 1})` : "Analyzing market trends..."} />
          ) : error ? (
            <div className="max-w-md mx-auto">
              <ErrorState
                type="server"
                title="Unable to Load Trending Data"
                message={error}
                onRetry={() => window.location.reload()}
                retryText={retryCount > 0 ? `Try Again (${retryCount} attempts)` : "Try Again"}
              />
            </div>
          ) : (
        <>
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-4 flex items-center text-green-600">
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
            <h2 className="text-3xl font-semibold mb-4 flex items-center text-red-600">
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
    </FullBleedWrapper>
    </>
  );
};

// Mark this page as full bleed to remove Layout padding
(TrendingPage as any).fullBleed = true;

export default TrendingPage;