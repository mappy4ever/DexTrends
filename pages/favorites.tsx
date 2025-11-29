import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../context/UnifiedAppContext';
import { fetchJSON } from '../utils/unifiedFetch';
import logger from '../utils/logger';
import PokeballLoader from '../components/ui/PokeballLoader';
import { PokemonAvatar } from '../components/ui/PokemonDisplay';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { Container } from '../components/ui/Container';
import { PageHeader } from '../components/ui/BreadcrumbNavigation';
import { NextPage } from 'next';
import { TCGCard } from '../types/api/cards';
import Head from 'next/head';

// Type definitions
import type { Pokemon as APIPokemon } from "../types/pokemon";

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

type TabType = 'pokemon' | 'cards';

const FavoritesPage: NextPage = () => {
  const router = useRouter();
  const { favorites, removeFromFavorites } = useFavorites();
  const [activeTab, setActiveTab] = useState<TabType>('pokemon');
  const [pokemonData, setPokemonData] = useState<SimplePokemon[]>([]);
  const [cardsData, setCardsData] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [pokemonError, setPokemonError] = useState<string | null>(null);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState({ pokemon: 0, cards: 0 });
  const [isRetrying, setIsRetrying] = useState({ pokemon: false, cards: false });

  // Fetch favorite Pokémon data
  useEffect(() => {
    async function fetchPokemonData() {
      if (!favorites?.pokemon?.length) {
        setPokemonData([]);
        setPokemonError(null);
        return;
      }

      try {
        setLoading(true);
        setPokemonError(null);
        setIsRetrying(prev => ({ ...prev, pokemon: false }));
        
        const pokemonPromises = favorites.pokemon.map(async (id) => {
          try {
            const data = await fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`, {
                useCache: true,
                cacheTime: 10 * 60 * 1000, // Cache for 10 minutes - Pokemon data is stable
                timeout: 8000,
                retries: 2
              });
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
        const validPokemon = results.filter((pokemon): pokemon is SimplePokemon => pokemon !== null);
        setPokemonData(validPokemon);
        
        // If we got no valid results but had favorites, show an error
        if (validPokemon.length === 0 && favorites.pokemon.length > 0) {
          throw new Error('Failed to load any Pokemon data');
        }
        
      } catch (err) {
        let errorMessage = "Failed to load Pokemon data.";
        let shouldRetry = false;
        
        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
          shouldRetry = true;
        } else if (err instanceof Error) {
          if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
            errorMessage = "Request timed out. The Pokemon API is taking too long to respond.";
            shouldRetry = true;
          } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
            errorMessage = "Pokemon API server error. Please try again in a few minutes.";
            shouldRetry = true;
          } else if (err.message.includes('rate limit') || err.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please wait before retrying.";
            shouldRetry = true;
          }
        }
        
        logger.error("Error fetching Pokémon data", { 
          error: err, 
          errorMessage, 
          shouldRetry, 
          retryCount: retryCount.pokemon,
          favoritesCount: favorites?.pokemon?.length || 0
        });
        
        // Attempt retry for network-related errors
        if (shouldRetry && retryCount.pokemon < 3) {
          setRetryCount(prev => ({ ...prev, pokemon: prev.pokemon + 1 }));
          setTimeout(() => {
            fetchPokemonData();
          }, 2000 * (retryCount.pokemon + 1));
          return;
        }
        
        setPokemonError(errorMessage);
        setRetryCount(prev => ({ ...prev, pokemon: 0 }));
      } finally {
        setLoading(false);
        setIsRetrying(prev => ({ ...prev, pokemon: false }));
      }
    }

    fetchPokemonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites?.pokemon]);

  // Fetch favorite cards data
  useEffect(() => {
    async function fetchCardsData() {
      if (!favorites?.cards?.length) {
        setCardsData([]);
        setCardsError(null);
        return;
      }

      try {
        setLoading(true);
        setCardsError(null);
        setIsRetrying(prev => ({ ...prev, cards: false }));
        
        const cardsPromises = favorites.cards.map(async (id) => {
          try {
            const response = await fetchJSON<TCGCardApiResponse>(`https://api.pokemontcg.io/v2/cards/${id}`, {
                useCache: true,
                cacheTime: 15 * 60 * 1000, // Cache for 15 minutes - card data is very stable
                timeout: 10000,
                retries: 2
              });
            return response?.data || null;
          } catch (err) {
            logger.error(`Error fetching card ${id}:`, { error: err, id });
            return null;
          }
        });

        const results = await Promise.all(cardsPromises);
        const validCards = results.filter((card): card is TCGCard => card !== null);
        setCardsData(validCards);
        
        // If we got no valid results but had favorites, show an error
        if (validCards.length === 0 && favorites.cards.length > 0) {
          throw new Error('Failed to load any card data');
        }
        
      } catch (err) {
        let errorMessage = "Failed to load TCG card data.";
        let shouldRetry = false;
        
        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
          shouldRetry = true;
        } else if (err instanceof Error) {
          if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
            errorMessage = "Request timed out. The Pokemon TCG API is taking too long to respond.";
            shouldRetry = true;
          } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
            errorMessage = "Pokemon TCG API server error. Please try again in a few minutes.";
            shouldRetry = true;
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = "Access denied to Pokemon TCG API. API key may be invalid.";
          } else if (err.message.includes('rate limit') || err.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please wait before retrying.";
            shouldRetry = true;
          }
        }
        
        logger.error("Error fetching cards data", { 
          error: err, 
          errorMessage, 
          shouldRetry, 
          retryCount: retryCount.cards,
          favoritesCount: favorites?.cards?.length || 0
        });
        
        // Attempt retry for network-related errors
        if (shouldRetry && retryCount.cards < 3) {
          setRetryCount(prev => ({ ...prev, cards: prev.cards + 1 }));
          setTimeout(() => {
            fetchCardsData();
          }, 2000 * (retryCount.cards + 1));
          return;
        }
        
        setCardsError(errorMessage);
        setRetryCount(prev => ({ ...prev, cards: 0 }));
      } finally {
        setLoading(false);
        setIsRetrying(prev => ({ ...prev, cards: false }));
      }
    }

    fetchCardsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites?.cards]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/back-card.png";
  };

  return (
    <>
      <Head>
        <title>Favorites - Your Collection | DexTrends</title>
        <meta name="description" content="View and manage your favorite Pokemon and cards in one place" />
      </Head>
      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* PageHeader with Breadcrumbs */}
          <PageHeader
            title="Favorites"
            description="Your saved Pokemon and cards"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Favorites', href: '/favorites', icon: '⭐', isActive: true },
            ]}
          >
            {/* Tab Toggle as Pills */}
            <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
              <button
                onClick={() => setActiveTab('pokemon')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'pokemon'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
                }`}
              >
                Pokemon
                {pokemonData.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === 'pokemon' ? 'bg-white/20' : 'bg-stone-200 dark:bg-stone-700'
                  }`}>
                    {pokemonData.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'cards'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
                }`}
              >
                Cards
                {cardsData.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === 'cards' ? 'bg-white/20' : 'bg-stone-200 dark:bg-stone-700'
                  }`}>
                    {cardsData.length}
                  </span>
                )}
              </button>
            </div>
          </PageHeader>

          {/* Legacy Tab Toggle (hidden, using PageHeader now) */}
          <div className="hidden">
            <Container variant="default" rounded="full" padding="none" className="inline-flex p-1">
              <button
                onClick={() => setActiveTab('pokemon')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeTab === 'pokemon'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Pokemon ({favorites?.pokemon?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  activeTab === 'cards'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Cards ({favorites?.cards?.length || 0})
              </button>
            </Container>
          </div>
      
          {/* Tab Content */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <PokeballLoader
                size="large"
                text={
                  isRetrying.pokemon && activeTab === 'pokemon' ? `Retrying... (${retryCount.pokemon + 1}/3)` :
                  isRetrying.cards && activeTab === 'cards' ? `Retrying... (${retryCount.cards + 1}/3)` :
                  "Loading favorites..."
                }
              />
            </div>
          ) : (
            <>
              {/* Pokemon Tab */}
              {activeTab === 'pokemon' && (
                <div>
                  {pokemonError ? (
                    <Container variant="default" padding="lg" className="text-center">
                      <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2 text-stone-800">Unable to Load Pokemon</h3>
                      <p className="text-sm text-stone-500 mb-4">{pokemonError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                      >
                        Refresh Page
                      </button>
                    </Container>
                  ) : pokemonData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {pokemonData.map(pokemon => (
                        <div key={pokemon.id} className="relative">
                          <PokemonAvatar
                            id={pokemon.id}
                            name={pokemon.name}
                            sprite={pokemon.sprite}
                            types={pokemon.types.map(type => ({ type: { name: type } }))}
                            size="md"
                          />
                          <button
                            onClick={() => removeFromFavorites('pokemon', pokemon.id)}
                            className="absolute -top-1 -right-1 p-1.5 bg-white dark:bg-stone-700 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-150 z-10"
                            title="Remove from favorites"
                            aria-label={`Remove ${pokemon.name} from favorites`}
                          >
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Container variant="default" padding="lg" className="text-center">
                      <svg className="w-14 h-14 text-stone-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2 text-stone-800">No favorite Pokemon yet</h3>
                      <p className="text-stone-500 text-sm mb-6">
                        Add Pokemon to your favorites by clicking the heart icon
                      </p>
                      <Link
                        href="/pokedex"
                        className="inline-block px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Browse Pokedex
                      </Link>
                    </Container>
                  )}
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === 'cards' && (
                <div>
                  {cardsError ? (
                    <Container variant="default" padding="lg" className="text-center">
                      <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2 text-stone-800">Unable to Load Cards</h3>
                      <p className="text-sm text-stone-500 mb-4">{cardsError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                      >
                        Refresh Page
                      </button>
                    </Container>
                  ) : cardsData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {cardsData.map(card => (
                        <Container
                          key={card.id}
                          variant="default"
                          padding="none"
                          hover
                          className="overflow-hidden cursor-pointer"
                          onClick={() => router.push(`/cards/${card.id}`)}
                        >
                          <div className="relative">
                            <Image
                              src={card.images?.small || '/back-card.png'}
                              alt={card.name}
                              width={245}
                              height={342}
                              className="w-full object-contain"
                              onError={handleImageError}
                            />
                            <button
                              className="absolute top-2 right-2 p-1.5 bg-white dark:bg-stone-700 rounded-full shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-all duration-150"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromFavorites('cards', card.id);
                              }}
                              title="Remove from favorites"
                              aria-label={`Remove ${card.name} from favorites`}
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-medium line-clamp-1 text-stone-800 dark:text-stone-200" title={card.name}>{card.name}</h3>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-stone-400">{card.set?.name}</span>
                              {card.tcgplayer?.prices?.holofoil?.market && (
                                <span className="text-sm font-semibold text-green-600">${card.tcgplayer.prices.holofoil.market.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </Container>
                      ))}
                    </div>
                  ) : (
                    <Container variant="default" padding="lg" className="text-center">
                      <svg className="w-14 h-14 text-stone-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      <h3 className="text-lg font-semibold mb-2 text-stone-800">No favorite cards yet</h3>
                      <p className="text-stone-500 text-sm mb-6">
                        Add cards to your favorites by clicking the heart icon
                      </p>
                      <Link
                        href="/tcgexpansions"
                        className="inline-block px-5 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Browse TCG Sets
                      </Link>
                    </Container>
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