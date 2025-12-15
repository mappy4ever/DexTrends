import React, { useState, useEffect, useRef } from 'react';
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
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { NextPage } from 'next';
import { TCGCard } from '../types/api/cards';
import Head from 'next/head';

// Batch size for loading favorites - prevents mobile performance issues
const BATCH_SIZE = 5;

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
  const [loadingProgress, setLoadingProgress] = useState({ pokemon: 0, cards: 0 });

  // Track if we've already started loading to prevent double fetches
  const loadingRef = useRef({ pokemon: false, cards: false });

  // Fetch favorite Pokémon data with batching
  useEffect(() => {
    async function fetchPokemonData() {
      if (!favorites?.pokemon?.length) {
        setPokemonData([]);
        setPokemonError(null);
        setLoading(false);
        return;
      }

      // Prevent double fetching
      if (loadingRef.current.pokemon) return;
      loadingRef.current.pokemon = true;

      try {
        setLoading(true);
        setPokemonError(null);
        setLoadingProgress(prev => ({ ...prev, pokemon: 0 }));

        const allResults: SimplePokemon[] = [];
        const items = favorites.pokemon;
        const total = items.length;

        // Process in batches of BATCH_SIZE
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (item) => {
            try {
              const data = await fetchJSON<APIPokemon>(`https://pokeapi.co/api/v2/pokemon/${item.id}`, {
                useCache: true,
                cacheTime: 10 * 60 * 1000,
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
              logger.error(`Error fetching Pokémon #${item.id}:`, { error: err, id: item.id });
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter((p): p is SimplePokemon => p !== null);
          allResults.push(...validResults);

          // Progressive update - show results as they load
          setPokemonData([...allResults]);
          setLoadingProgress(prev => ({
            ...prev,
            pokemon: Math.round((Math.min(i + BATCH_SIZE, total) / total) * 100)
          }));

          // Small delay between batches
          if (i + BATCH_SIZE < items.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // If we got no valid results but had favorites, show an error
        if (allResults.length === 0 && favorites.pokemon.length > 0) {
          throw new Error('Failed to load any Pokemon data');
        }

      } catch (err) {
        let errorMessage = "Failed to load Pokemon data.";

        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
        } else if (err instanceof Error) {
          if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
            errorMessage = "Request timed out. The Pokemon API is taking too long to respond.";
          } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
            errorMessage = "Pokemon API server error. Please try again in a few minutes.";
          } else if (err.message.includes('rate limit') || err.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please wait before retrying.";
          }
        }

        logger.error("Error fetching Pokémon data", {
          error: err,
          errorMessage,
          favoritesCount: favorites?.pokemon?.length || 0
        });

        setPokemonError(errorMessage);
      } finally {
        setLoading(false);
        loadingRef.current.pokemon = false;
      }
    }

    fetchPokemonData();
  }, [favorites?.pokemon]);

  // Fetch favorite cards data with batching
  useEffect(() => {
    async function fetchCardsData() {
      if (!favorites?.cards?.length) {
        setCardsData([]);
        setCardsError(null);
        if (!favorites?.pokemon?.length) setLoading(false);
        return;
      }

      // Prevent double fetching
      if (loadingRef.current.cards) return;
      loadingRef.current.cards = true;

      try {
        setLoading(true);
        setCardsError(null);
        setLoadingProgress(prev => ({ ...prev, cards: 0 }));

        const allResults: TCGCard[] = [];
        const items = favorites.cards;
        const total = items.length;

        // Process in batches of BATCH_SIZE
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const batch = items.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (item) => {
            try {
              // Use internal API that fetches from TCGDex
              const response = await fetchJSON<{ card: TCGCard }>(`/api/tcg-cards/${item.id}`, {
                useCache: true,
                cacheTime: 15 * 60 * 1000,
                timeout: 10000,
                retries: 2
              });
              return response?.card || null;
            } catch (err) {
              logger.error(`Error fetching card ${item.id}:`, { error: err, id: item.id });
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validResults = batchResults.filter((c): c is TCGCard => c !== null);
          allResults.push(...validResults);

          // Progressive update - show results as they load
          setCardsData([...allResults]);
          setLoadingProgress(prev => ({
            ...prev,
            cards: Math.round((Math.min(i + BATCH_SIZE, total) / total) * 100)
          }));

          // Small delay between batches
          if (i + BATCH_SIZE < items.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        // If we got no valid results but had favorites, show an error
        if (allResults.length === 0 && favorites.cards.length > 0) {
          throw new Error('Failed to load any card data');
        }

      } catch (err) {
        let errorMessage = "Failed to load TCG card data.";

        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMessage = "Network connection failed. Please check your internet connection.";
        } else if (err instanceof Error) {
          if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
            errorMessage = "Request timed out. The Pokemon TCG API is taking too long to respond.";
          } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
            errorMessage = "Pokemon TCG API server error. Please try again in a few minutes.";
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = "Access denied to Pokemon TCG API. API key may be invalid.";
          } else if (err.message.includes('rate limit') || err.message.includes('429')) {
            errorMessage = "Rate limit exceeded. Please wait before retrying.";
          }
        }

        logger.error("Error fetching cards data", {
          error: err,
          errorMessage,
          favoritesCount: favorites?.cards?.length || 0
        });

        setCardsError(errorMessage);
      } finally {
        setLoading(false);
        loadingRef.current.cards = false;
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
        <meta name="description" content="View and manage your favorite Pokemon and cards in one place" />
      </Head>
      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* PageHeader with Breadcrumbs */}
          <PageHeader
            title="Favorites"
            description="Your saved Pokemon and cards"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Favorites', href: '/favorites', icon: '⭐', isActive: true },
            ]}
          >
            {/* Tab Toggle as Pills - 44px min touch target */}
            <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
              <button
                onClick={() => setActiveTab('pokemon')}
                className={`flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                  activeTab === 'pokemon'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-amber-600'
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
                className={`flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all ${
                  activeTab === 'cards'
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:text-amber-600'
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
          {loading && pokemonData.length === 0 && cardsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
              <PokeballLoader
                size="large"
                text={
                  activeTab === 'pokemon' && loadingProgress.pokemon > 0
                    ? `Loading Pokemon... ${loadingProgress.pokemon}%`
                    : activeTab === 'cards' && loadingProgress.cards > 0
                    ? `Loading Cards... ${loadingProgress.cards}%`
                    : "Loading favorites..."
                }
              />
              {/* Progress bar */}
              {((activeTab === 'pokemon' && loadingProgress.pokemon > 0) ||
                (activeTab === 'cards' && loadingProgress.cards > 0)) && (
                <div className="w-48 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${activeTab === 'pokemon' ? loadingProgress.pokemon : loadingProgress.cards}%`
                    }}
                  />
                </div>
              )}
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
                    <Container variant="default" padding="lg">
                      <EmptyState
                        illustration="pokemon"
                        title="No favorite Pokémon yet"
                        description="Add Pokémon to your favorites by clicking the heart icon while browsing."
                        action={{
                          label: "Browse Pokédex",
                          onClick: () => router.push('/pokedex'),
                        }}
                      />
                    </Container>
                  )}
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === 'cards' && (
                <div>
                  {cardsError ? (
                    <Container variant="default" padding="lg">
                      <ErrorState
                        error={cardsError}
                        onRetry={() => window.location.reload()}
                      />
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
                    <Container variant="default" padding="lg">
                      <EmptyState
                        illustration="card"
                        title="No favorite cards yet"
                        description="Add cards to your favorites by clicking the heart icon while browsing."
                        action={{
                          label: "Browse TCG Sets",
                          onClick: () => router.push('/tcgexpansions'),
                        }}
                      />
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