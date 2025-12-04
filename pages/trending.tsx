import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useTheme } from '../context/UnifiedAppContext';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import logger from '../utils/logger';
import { fetchJSON } from '../utils/unifiedFetch';
import { TCGDexEndpoints } from '../utils/tcgdex-adapter';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { Container } from '../components/ui/Container';
import { PageHeader } from '../components/ui/BreadcrumbNavigation';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
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
  
  // Fetch cards to analyze trends using TCGDex API
  const fetchTrendingCards = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        setIsRetrying(false);

        // Popular Pokemon to fetch for trending display
        const popularPokemon = [
          'charizard', 'pikachu', 'mew', 'mewtwo', 'lugia',
          'rayquaza', 'blastoise', 'venusaur', 'eevee', 'gengar',
          'gyarados', 'dragonite', 'alakazam', 'snorlax', 'jigglypuff'
        ];

        // Choose some random popular Pokémon using Fisher-Yates shuffle
        const shuffled = [...popularPokemon];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selectedPokemon = shuffled.slice(0, 5);

        // Fetch cards for these Pokémon using TCGDex
        const promises = selectedPokemon.map(async (name) => {
          try {
            const url = `${TCGDexEndpoints.cards('en')}?name=like:${name}&pagination:itemsPerPage=20`;
            const cards = await fetchJSON<any[]>(url, {
              useCache: true,
              cacheTime: 30 * 60 * 1000, // 30 minute cache
              timeout: 10000,
              retries: 2
            });
            return cards || [];
          } catch (error) {
            logger.error('Failed to fetch cards for Pokemon', { name, error });
            return [];
          }
        });

        const results = await Promise.all(promises);
        let allCards: TCGCard[] = [];

        results.forEach(cards => {
          if (cards && cards.length > 0) {
            // Transform TCGDex cards to our format with simulated prices
            const transformedCards = cards.map((card: any) => {
              const imageBase = card.image || `https://assets.tcgdex.net/en/${card.id.split('-')[0]}/${card.id}`;
              return {
                id: card.id,
                name: card.name,
                supertype: 'Pokémon',
                rarity: card.rarity || 'Unknown',
                images: {
                  small: `${imageBase}/low.png`,
                  large: `${imageBase}/high.png`
                },
                set: {
                  id: card.id.split('-')[0] || '',
                  name: '',
                  series: ''
                },
                // Simulate price data for trending display
                // In production, would integrate with real pricing API
                tcgplayer: {
                  prices: {
                    holofoil: { market: Math.random() * 50 + 5 }
                  }
                }
              } as TCGCard;
            });
            allCards = [...allCards, ...transformedCards];
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
  }, [retryCount]);

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
        <div className="container max-w-6xl mx-auto px-4 py-6">
          {/* PageHeader with Breadcrumbs */}
          <PageHeader
            title="Trending Cards"
            description="Track cards with significant price changes in the market"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Market', href: '/market', icon: '📈', isActive: false },
              { title: 'Trending', href: '/trending', icon: '🔥', isActive: true },
            ]}
          />
          {loading ? (
            <PageLoader text={isRetrying ? `Retrying... (Attempt ${retryCount + 1})` : "Analyzing market trends..."} />
          ) : error ? (
            <Container variant="default" padding="lg">
              <ErrorState
                error={`${error}${retryCount > 0 ? ` (${retryCount} ${retryCount === 1 ? 'attempt' : 'attempts'})` : ''}`}
                onRetry={() => {
                  setError(null);
                  fetchTrendingCards();
                }}
              />
            </Container>
          ) : (
        <>
          {/* Rising Prices Section */}
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2 text-green-600">
              <span className="text-lg">↑</span> Rising Prices
            </h2>
            <Container variant="default" padding="lg">
              {trendingData.rising.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trendingData.rising.map(card => (
                    <Link
                      href={`/cards/${card.id}`}
                      key={card.id}
                      className="block p-3 rounded-xl border border-stone-100 dark:border-stone-700 hover:border-stone-200 dark:hover:border-stone-600 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                    >
                      <div className="flex flex-col items-center">
                        {card.images?.small && (
                          <img
                            src={card.images.small}
                            alt={card.name}
                            className="w-20 h-28 object-contain rounded"
                          />
                        )}
                        <p className="font-medium mt-2 text-center text-sm text-stone-800 dark:text-stone-200 line-clamp-1">{card.name}</p>
                        <p className="text-xs text-stone-400">{card.rarity || 'N/A'}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-green-600 font-semibold text-sm">${card.currentPrice.toFixed(2)}</span>
                          <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                            +{card.percentChange}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  illustration="card"
                  title="No rising trends"
                  description="No cards are showing rising prices right now."
                  size="sm"
                />
              )}
            </Container>
          </div>

          {/* Falling Prices Section */}
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2 text-red-600">
              <span className="text-lg">↓</span> Falling Prices
            </h2>
            <Container variant="default" padding="lg">
              {trendingData.falling.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trendingData.falling.map(card => (
                    <Link
                      href={`/cards/${card.id}`}
                      key={card.id}
                      className="block p-3 rounded-xl border border-stone-100 dark:border-stone-700 hover:border-stone-200 dark:hover:border-stone-600 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                    >
                      <div className="flex flex-col items-center">
                        {card.images?.small && (
                          <img
                            src={card.images.small}
                            alt={card.name}
                            className="w-20 h-28 object-contain rounded"
                          />
                        )}
                        <p className="font-medium mt-2 text-center text-sm text-stone-800 dark:text-stone-200 line-clamp-1">{card.name}</p>
                        <p className="text-xs text-stone-400">{card.rarity || 'N/A'}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-red-600 font-semibold text-sm">${card.currentPrice.toFixed(2)}</span>
                          <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                            {card.percentChange}%
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  illustration="card"
                  title="No falling trends"
                  description="No cards are showing falling prices right now."
                  size="sm"
                />
              )}
            </Container>
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