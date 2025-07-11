import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../context/favoritescontext';
import { FadeIn, SlideUp } from '../components/ui/animations';
import { TypeBadge } from '../components/ui/TypeBadge'; // Updated path
import { getGeneration } from '../utils/pokemonutils';
import logger from '../utils/logger';
import UnifiedLoadingScreen from '../components/ui/UnifiedLoadingScreen';
import CollectionDashboard from '../components/ui/CollectionDashboard';
import AchievementSystem from '../components/ui/AchievementSystem';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, togglePokemonFavorite, toggleCardFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pokemonData, setPokemonData] = useState([]);
  const [cardsData, setCardsData] = useState([]);
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
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!res.ok) throw new Error(`Failed to fetch Pokémon #${id}`);
            const data = await res.json();
            return {
              id: data.id,
              name: data.name,
              types: data.types.map(t => t.type.name),
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
            };
          } catch (err) {
            logger.error(`Error fetching Pokémon #${id}:`, { error: err, id });
            return null;
          }
        });

        const results = await Promise.all(pokemonPromises);
        setPokemonData(results.filter(Boolean));
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
            const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`);
            if (!res.ok) throw new Error(`Failed to fetch card ${id}`);
            const data = await res.json();
            return data.data;
          } catch (err) {
            logger.error(`Error fetching card ${id}:`, { error: err, id });
            return null;
          }
        });

        const results = await Promise.all(cardsPromises);
        setCardsData(results.filter(Boolean));
      } catch (err) {
        logger.error("Error fetching cards data:", { error: err });
      } finally {
        setLoading(false);
      }
    }

    fetchCardsData();
  }, [favorites?.cards]);

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">Your Favorites</h1>
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'achievements' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setActiveTab('achievements')}
          >
            🏆 Achievements
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'pokemon' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setActiveTab('pokemon')}
          >
            Pokémon ({favorites?.pokemon?.length || 0})
          </button>
          <button 
            className={`px-6 py-3 font-semibold ${activeTab === 'cards' ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setActiveTab('cards')}
          >
            Cards ({favorites?.cards?.length || 0})
          </button>
        </div>
      </div>
      {/* Tab Content */}
      {loading ? (
        <UnifiedLoadingScreen 
          message="Loading your favorites..."
          type="default"
          preventFlash={true}
          overlay={false}
        />
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {pokemonData.map(pokemon => (
                    <div 
                      key={pokemon.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative">
                        <Link href={`/pokedex/${pokemon.id}`}>
                          <Image
                            src={pokemon.sprite}
                            alt={pokemon.name}
                            width={150}
                            height={150}
                            className="w-full h-40 object-contain p-2"
                          />
                        </Link>
                        <button
                          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md text-red-500"
                          onClick={() => togglePokemonFavorite(pokemon.id)}
                          title="Remove from favorites"
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold capitalize">{pokemon.name.replace(/-/g, ' ')}</h3>
                        <div className="mt-2 flex gap-2">
                          {pokemon.types.map(type => (
                            <TypeBadge key={type} type={type} size="sm" />
                          ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="inline-block rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs">
                            Gen {getGeneration(pokemon.id)}
                          </span>
                          <span className="ml-2 font-mono">#{String(pokemon.id).padStart(3, '0')}</span>
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
                          onError={(e) => {
                            e.currentTarget.src = "/back-card.png";
                          }}
                          onClick={() => router.push(`/cards/${card.id}`)}
                          style={{ cursor: 'pointer' }}
                        />
                        <button
                          className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md text-red-500"
                          onClick={() => toggleCardFavorite(card.id)}
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
  );
}
