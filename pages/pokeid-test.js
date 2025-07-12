import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { TypeBadge } from "../components/ui/TypeBadge";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations/animations";
import { useFavorites } from "../context/UnifiedAppContext";
import { fetchData, fetchPokemon, fetchPokemonSpecies } from "../utils/apiutils";
import { BsArrowLeft, BsHeart, BsHeartFill, BsShare, BsStar, BsStarFill } from "react-icons/bs";

export default function PokeIDTestPage() {
  const router = useRouter();
  const { pokeid = "25" } = router.query; // Default to Pikachu for testing
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading Pokemon with ID:', pokeid);

        // Load Pokemon basic data
        const pokemonData = await fetchPokemon(pokeid);
        setPokemon(pokemonData);

        // Load species data
        const speciesData = await fetchPokemonSpecies(pokeid);
        setSpecies(speciesData);

      } catch (err) {
        console.error('Error loading Pokemon:', err);
        setError(`Failed to load Pokemon data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (pokeid) {
      loadPokemon();
    }
  }, [pokeid]);

  // Get Pokemon image URL
  const getPokemonImageUrl = (pokemon) => {
    return pokemon?.sprites?.other?.['official-artwork']?.front_default ||
           pokemon?.sprites?.other?.dream_world?.front_default ||
           pokemon?.sprites?.front_default ||
           '/placeholder-pokemon.png';
  };

  // Calculate stat percentage for progress rings
  const getStatPercentage = (statValue) => {
    return Math.min((statValue / 200) * 100, 100); // Max stat is around 200
  };

  // Get stat color based on value
  const getStatColor = (statValue) => {
    if (statValue >= 120) return '#f59e0b'; // amber
    if (statValue >= 80) return '#10b981'; // emerald
    if (statValue >= 50) return '#3b82f6'; // blue
    return '#6b7280'; // gray
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-pokedex gradient-animated texture-grain flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white">Loading Pokemon...</h1>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen gradient-pokedex flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold mb-4 text-white">Pokemon Not Found</h1>
          <p className="text-white/80 mb-8">{error || 'The requested Pokemon could not be loaded.'}</p>
          <button 
            onClick={() => router.push('/pokedex')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/30 transition-all duration-300 hover:scale-105"
          >
            Back to Pokedex
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.pokemon.some(p => p.id === String(pokemon.id));

  return (
    <div className="min-h-screen gradient-pokedex gradient-animated texture-grain relative">
      <Head>
        <title>{pokemon.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : 'Pokemon'} | Enhanced PokeID Test | DexTrends</title>
        <meta name="description" content={`Enhanced design test for ${pokemon.name} Pokemon details`} />
      </Head>

      {/* Navigation */}
      <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 text-white"
        >
          <BsArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (isFavorite) {
                removeFromFavorites('pokemon', pokemon.id);
              } else {
                addToFavorites('pokemon', { id: String(pokemon.id), name: pokemon.name, sprite: pokemon.sprites.front_default });
              }
            }}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 text-white"
          >
            {isFavorite ? <BsHeartFill className="w-5 h-5 text-red-400" /> : <BsHeart className="w-5 h-5" />}
          </button>
          <button className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 text-white">
            <BsShare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Section - Circular Pokemon */}
      <FadeIn>
        <div className="pt-24 pb-12 px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            
            {/* Circular Pokemon Image */}
            <div className="relative mb-8">
              <div className="w-80 h-80 mx-auto relative">
                {/* Gradient border ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-2">
                  <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-xl"></div>
                    
                    {/* Pokemon Image */}
                    <div className="relative z-10 w-64 h-64">
                      <Image
                        src={getPokemonImageUrl(pokemon)}
                        alt={pokemon.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pokemon Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-6xl font-bold text-white/50">#{pokemon.id.toString().padStart(3, '0')}</span>
              </div>
              
              <h1 className="text-6xl font-bold text-white mb-6 capitalize tracking-tight">
                {pokemon.name}
              </h1>

              {/* Type Badges */}
              <div className="flex justify-center gap-3 mb-8">
                {pokemon.types?.map((type) => (
                  <TypeBadge key={type.type.name} type={type.type.name} size="lg" />
                ))}
              </div>

              {/* Quick Stats Glass Cards */}
              <StaggeredChildren className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                    <div className="text-3xl font-bold text-white">{pokemon.height / 10}m</div>
                    <div className="text-white/70 text-sm">Height</div>
                  </div>
                </CardHover>
                
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                    <div className="text-3xl font-bold text-white">{pokemon.weight / 10}kg</div>
                    <div className="text-white/70 text-sm">Weight</div>
                  </div>
                </CardHover>
                
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                    <div className="text-3xl font-bold text-white">{pokemon.base_experience || '???'}</div>
                    <div className="text-white/70 text-sm">Base EXP</div>
                  </div>
                </CardHover>
                
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                    <div className="text-3xl font-bold text-white">{pokemon.abilities?.length || 0}</div>
                    <div className="text-white/70 text-sm">Abilities</div>
                  </div>
                </CardHover>
              </StaggeredChildren>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Tab Navigation */}
      <div className="sticky top-20 z-40 px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'stats', label: 'Stats' },
                { id: 'abilities', label: 'Abilities' },
                { id: 'moves', label: 'Moves' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <FadeIn>
              <div className="space-y-8">
                
                {/* Species Info */}
                {species && (
                  <CardHover>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                      <h3 className="text-2xl font-bold text-white mb-4">Species Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-white/70 text-sm">Species</div>
                          <div className="text-white text-lg capitalize">{species.name}</div>
                        </div>
                        <div>
                          <div className="text-white/70 text-sm">Generation</div>
                          <div className="text-white text-lg">{species.generation?.name?.replace('generation-', 'Gen ').toUpperCase() || 'Unknown'}</div>
                        </div>
                        {species.flavor_text_entries?.find(entry => entry.language.name === 'en') && (
                          <div className="md:col-span-2 mt-4">
                            <div className="text-white/70 text-sm mb-2">Description</div>
                            <div className="text-white/90 leading-relaxed">
                              {species.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text.replace(/\f/g, ' ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHover>
                )}

                {/* Abilities */}
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-4">Abilities</h3>
                    <div className="grid gap-4">
                      {pokemon.abilities?.map((abilityInfo, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <BsStar className="text-white w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium capitalize flex items-center gap-2">
                              {abilityInfo.ability.name.replace('-', ' ')}
                              {abilityInfo.is_hidden && (
                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs">Hidden</span>
                              )}
                            </div>
                            <div className="text-white/70 text-sm">Tap to learn more</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHover>
              </div>
            </FadeIn>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <FadeIn>
              <div className="space-y-8">
                
                {/* Circular Stat Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {pokemon.stats?.map((stat, index) => {
                    const percentage = getStatPercentage(stat.base_stat);
                    const color = getStatColor(stat.base_stat);
                    const circumference = 2 * Math.PI * 45; // radius = 45
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;
                    
                    return (
                      <SlideUp key={stat.stat.name} delay={index * 100}>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                          <div className="relative w-24 h-24 mx-auto mb-4">
                            {/* Background circle */}
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="6"
                                fill="none"
                              />
                              {/* Progress circle */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke={color}
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                                style={{
                                  filter: `drop-shadow(0 0 6px ${color}40)`
                                }}
                              />
                            </svg>
                            {/* Stat value */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-white">{stat.base_stat}</span>
                            </div>
                          </div>
                          <div className="text-white font-medium capitalize">
                            {stat.stat.name.replace('-', ' ')}
                          </div>
                        </div>
                      </SlideUp>
                    );
                  })}
                </div>

                {/* Stat Summary */}
                <CardHover>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-4">Base Stat Total</h3>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">
                        {pokemon.stats?.reduce((total, stat) => total + stat.base_stat, 0) || 0}
                      </div>
                      <div className="text-white/70">Total Base Stats</div>
                    </div>
                  </div>
                </CardHover>
              </div>
            </FadeIn>
          )}

          {/* Other tabs content would go here */}
          {activeTab === 'abilities' && (
            <FadeIn>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Detailed Abilities</h3>
                <p className="text-white/70">Detailed ability information would be displayed here...</p>
              </div>
            </FadeIn>
          )}

          {activeTab === 'moves' && (
            <FadeIn>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Move List</h3>
                <p className="text-white/70">Pokemon moves would be displayed here...</p>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}