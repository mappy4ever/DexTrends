import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../context/UnifiedAppContext';
import { FadeIn, SlideUp } from '../components/ui/animations/animations';
import { TypeBadge } from '../components/ui/TypeBadge';
import { getGeneration } from '../utils/pokemonutils';
import { fetchJSON } from '../utils/unifiedFetch';
import logger from '../utils/logger';
import { retryWithBackoff } from '../utils/retryWithBackoff';
import PokeballLoader from '../components/ui/PokeballLoader';
import CollectionDashboard from "../components/ui/layout/CollectionDashboard";
import AchievementSystem from '../components/ui/AchievementSystem';
import CircularPokemonCard from '../components/ui/cards/CircularPokemonCard';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { CircularButton } from '../components/ui/design-system';
import { NextPage } from 'next';
import { TCGCard } from '../types/api/cards';
import Head from 'next/head';

// Type definitions
import type { Pokemon as APIPokemon } from '../types/api/pokemon';

interface SimplePokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
}

// Using APIPokemon from types instead of local interface

interface TCGCardApiResponse {
  data: TCGCard;
}

type TabType = 'dashboard' | 'achievements' | 'pokemon' | 'cards';

const FavoritesPage: NextPage = () => {
  const router = useRouter();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [pokemonData, setPokemonData] = useState<SimplePokemon[]>([]);
  const [cardsData, setCardsData] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorite Pokémon data
  useEffect(() => {
    async function fetchPokemonData() {
      if (!favorites?.pokemon?.length) {
        setPokemonData([]);
        return;
      }

      try {
        setLoading(true);
        const pokemonPromises = favorites.pokemon.map(async (id) => {
          try {
            const data = await retryWithBackoff(
              () => fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                useCache: true,
                cacheTime: 10 * 60 * 1000, // Cache for 10 minutes - Pokemon data is stable
                timeout: 8000,
                retries: 2
              }),
              {
                maxRetries: 3,
                onRetry: (error, attempt) => {
                  logger.warn(`Retrying Pokemon fetch for ID ${id}, attempt ${attempt}`, error);
                }
              }
            );
            if (data && data.types) {
              return {
                id: data.id,
                name: data.name,
                types: data.types.map((t) => t.type.name),
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
              };
            }
            return null;
          } catch (err) {
            logger.error(`Error fetching Pokémon #${id}:`, { error: err, id });
            return null;
          }
        });

        const results = await Promise.all(pokemonPromises);
        setPokemonData(results.filter((pokemon): pokemon is SimplePokemon => pokemon !== null));
      } catch (err) {
        logger.error("Error fetching Pokémon data:", { error: err });
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonData();
  }, [favorites?.pokemon]);

  // Fetch favorite cards data
  useEffect(() => {
    async function fetchCardsData() {
      if (!favorites?.cards?.length) {
        setCardsData([]);
        return;
      }

      try {
        setLoading(true);
        const cardsPromises = favorites.cards.map(async (id) => {
          try {
            const response = await retryWithBackoff(
              () => fetchJSON<TCGCardApiResponse>(`https://api.pokemontcg.io/v2/cards/${id}`, {
                useCache: true,
                cacheTime: 15 * 60 * 1000, // Cache for 15 minutes - card data is very stable
                timeout: 10000,
                retries: 2
              }),
              {
                maxRetries: 3,
                onRetry: (error, attempt) => {
                  logger.warn(`Retrying TCG card fetch for ID ${id}, attempt ${attempt}`, error);
                }
              }
            );
            return response?.data || null;
          } catch (err) {
            logger.error(`Error fetching card ${id}:`, { error: err, id });
            return null;
          }
        });

        const results = await Promise.all(cardsPromises);
        setCardsData(results.filter((card): card is TCGCard => card !== null));
      } catch (err) {
        logger.error("Error fetching cards data:", { error: err });
      } finally {
        setLoading(false);
      }
    }

    fetchCardsData();
  }, [favorites?.cards]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/back-card.png";
  };

  return (
    <>
      <Head>
        <title>Favorites - Your Collection | DexTrends</title>
        <meta name="description" content="View and manage your favorite Pokemon, cards, and decks in one place" />
      </Head>
      <FullBleedWrapper gradient="pokedex">
        <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Favorites</h1>
      
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg p-1">
            <CircularButton
              variant={activeTab === 'dashboard' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </CircularButton>
            <CircularButton
              variant={activeTab === 'achievements' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 Achievements
            </CircularButton>
            <CircularButton
              variant={activeTab === 'pokemon' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('pokemon')}
            >
              Pokémon ({favorites?.pokemon?.length || 0})
            </CircularButton>
            <CircularButton
              variant={activeTab === 'cards' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('cards')}
            >
              Cards ({favorites?.cards?.length || 0})
            </CircularButton>
          </div>
        </div>
      
      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <PokeballLoader size="large" text="Loading your favorites..." />
        </div>
      ) : (
        <>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="animate-fadeIn">
              <CollectionDashboard />
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="animate-fadeIn">
              <AchievementSystem 
                onAchievementUnlocked={(achievement) => {
                  console.log('New achievement unlocked:', achievement);
                  // Could trigger notifications or other effects here
                }}
              />
            </div>
          )}

          {/* Pokémon Tab */}
          {activeTab === 'pokemon' && (
            <div className="animate-fadeIn">
              {pokemonData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                  {pokemonData.map(pokemon => (
                    <div key={pokemon.id} className="relative">
                      <CircularPokemonCard
                        pokemon={{
                          id: pokemon.id,
                          name: pokemon.name,
                          sprite: pokemon.sprite,
                          types: pokemon.types.map(type => ({ type: { name: type } }))
                        }}
                        size="md"
                      />
                      <button
                        onClick={() => removeFromFavorites('pokemon', pokemon.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-all transform hover:scale-110 z-10"
                        title="Remove from favorites"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">No favorite Pokémon yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add Pokémon to your favorites by clicking the heart icon on their page.
                  </p>
                  <Link 
                    href="/pokedex"
                    className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Browse Pokédex
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="animate-fadeIn">
              {cardsData.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {cardsData.map(card => (
                    <div 
                      key={card.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative">
                        <Image
                          src={card.images?.small || '/back-card.png'}
                          alt={card.name}
                          width={245}
                          height={342}
                          className="w-full object-contain"
                          onError={handleImageError}
                          onClick={() => router.push(`/cards/${card.id}`)}
                          style={{ cursor: 'pointer' }}
                        />
                        <button
                          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md text-red-500"
                          onClick={() => removeFromFavorites('cards', card.id)}
                          title="Remove from favorites"
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-1" title={card.name}>{card.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{card.set?.name}</span>
                          {card.tcgplayer?.prices?.holofoil?.market && (
                            <span className="text-sm font-bold">${card.tcgplayer.prices.holofoil.market.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2">No favorite cards yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add cards to your favorites by clicking the heart icon on card details.
                  </p>
                  <Link 
                    href="/tcgsets"
                    className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Browse TCG Sets
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </FullBleedWrapper>
    </>
  );
};

// Mark this page as full bleed to remove Layout padding
(FavoritesPage as any).fullBleed = true;

export default FavoritesPage;