import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import pokemon from "pokemontcgsdk";
import CardList from "../../components/CardList";
import { TypeBadge, TypeBadgeSelector } from "../../components/ui/TypeBadge";
import { FadeIn, SlideUp, Scale, CardHover } from "../../components/ui/Animations";
import { useFavorites } from "../../context/FavoritesContext";
import { useTheme } from "../../context/ThemeContext";
import { useViewSettings } from "../../context/ViewSettingsContext";
import { typeColors, getGeneration, generationNames, typeEffectiveness } from "../../utils/pokemonUtils";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

export default function PokemonDetail() {
  const router = useRouter();
  const { pokemonId } = router.query;
  const { favorites, togglePokemonFavorite, isPokemonFavorite } = useFavorites();
  const { theme } = useTheme();
  const { viewSettings } = useViewSettings();

  // State variables
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSet, setFilterSet] = useState("");

  // Navigation function takes care of showing card details now
  
  // Stats labels
  const statLabels = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Attack",
    "special-defense": "Sp. Defense",
    speed: "Speed"
  };

  // Check if Pokémon is favorited
  useEffect(() => {
    if (pokemonDetails?.id) {
      setIsFavorite(isPokemonFavorite(pokemonDetails.id.toString()));
    }
  }, [pokemonDetails, favorites, isPokemonFavorite]);

  // Fetch Pokémon details from PokeAPI
  useEffect(() => {
    async function fetchPokemonDetails() {
      if (!pokemonId) return;
      try {
        setLoading(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId.toLowerCase()}`);
        if (!response.ok) throw new Error('Failed to fetch Pokémon details');
        const data = await response.json();
        setPokemonDetails(data);
        
        // Fetch species data for more information
        try {
          const speciesResponse = await fetch(data.species.url);
          const speciesData = await speciesResponse.json();
          setPokemonSpecies(speciesData);
          
          // Fetch evolution chain if available
          if (speciesData.evolution_chain?.url) {
            const evolutionResponse = await fetch(speciesData.evolution_chain.url);
            const evolutionData = await evolutionResponse.json();
            
            // Process evolution data
            const processedEvolutions = await processEvolutionChain(evolutionData.chain);
            setEvolutions(processedEvolutions);
          }
        } catch (err) {
          console.error("Error fetching species data:", err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Pokémon details:", err);
        setError("Failed to load Pokémon details.");
        setLoading(false);
      }
    }
    
    // Helper function to process evolution chain data
    async function processEvolutionChain(chain) {
      const results = [];
      
      // Get details for the first form
      try {
        const pokemonName = chain.species.name;
        const detailsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const details = await detailsResponse.json();
        
        results.push({
          name: pokemonName,
          id: details.id,
          sprite: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
          types: details.types.map(t => t.type.name)
        });
        
        // Process evolutions recursively
        if (chain.evolves_to && chain.evolves_to.length > 0) {
          for (const evolution of chain.evolves_to) {
            const evolutionDetails = await processEvolutionChain(evolution);
            results.push(...evolutionDetails);
          }
        }
      } catch (err) {
        console.error("Error processing evolution:", err);
      }
      
      return results;
    }
    
    fetchPokemonDetails();
  }, [pokemonId]);

  // Fetch TCG cards for this Pokémon
  useEffect(() => {
    if (!pokemonId) return;
    setLoading(true);
    setError(null);

    pokemon.card
      .where({ q: `name:${pokemonId}` })
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cards.");
        setLoading(false);
      });
  }, [pokemonId]);

  function getPrice(card) {
    return (
      card.tcgplayer?.prices?.holofoil?.market ||
      card.tcgplayer?.prices?.normal?.market ||
      0
    );
  }

  // Sorting helpers for CardList
  function getReleaseDate(card) {
    return card.set?.releaseDate || "0000-00-00";
  }

  function getRarityRank(card) {
    const rarityOrder = {
      common: 1,
      uncommon: 2,
      "rare holo": 3,
      rare: 4,
      "ultra rare": 5,
      "secret rare": 6,
    };
    return rarityOrder[card.rarity] || 0;
  }

  function openModal(card) {
    // Navigate to card details page instead of opening modal
    router.push(`/cards/${card.id}`);
  }
  
  // No longer need closeModal as we're using navigation instead of modals

  // Toggle favorite status
  function handleToggleFavorite() {
    if (pokemonDetails) {
      togglePokemonFavorite({
        id: pokemonDetails.id.toString(),
        name: pokemonDetails.name,
        sprite: pokemonDetails.sprites?.other["official-artwork"]?.front_default || pokemonDetails.sprites?.front_default,
        types: pokemonDetails.types.map(t => t.type.name)
      });
      setIsFavorite(!isFavorite);
    }
  }

  // Filter cards based on rarity and set
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      let matches = true;
      
      if (filterRarity && card.rarity) {
        matches = matches && card.rarity.toLowerCase().includes(filterRarity.toLowerCase());
      }
      
      if (filterSet && card.set?.name) {
        matches = matches && card.set.name.toLowerCase().includes(filterSet.toLowerCase());
      }
      
      return matches;
    });
  }, [cards, filterRarity, filterSet]);

  // Extract unique set names and rarities for filters
  const uniqueSets = useMemo(() => {
    return [...new Set(cards.map(card => card.set?.name).filter(Boolean))];
  }, [cards]);

  const uniqueRarities = useMemo(() => {
    return [...new Set(cards.map(card => card.rarity).filter(Boolean))];
  }, [cards]);

  // Format a stat value into percentage for the stat bar
  const formatStatPercentage = (value) => {
    // Max stat values in games are typically around 255
    const percentage = Math.min(100, (value / 255) * 100);
    return `${percentage}%`;
  };

  // Get the type effectiveness for the Pokémon's types
  const typeEffectivenessInfo = useMemo(() => {
    if (!pokemonDetails?.types) return null;

    const types = pokemonDetails.types.map(t => t.type.name);
    const results = {
      weakTo: new Set(),
      resistantTo: new Set(),
      immuneTo: new Set()
    };

    // Combine effectiveness from all types
    types.forEach(type => {
      if (typeEffectiveness[type]) {
        typeEffectiveness[type].weakTo.forEach(t => results.weakTo.add(t));
        typeEffectiveness[type].resistantTo.forEach(t => results.resistantTo.add(t));
        typeEffectiveness[type].immuneTo.forEach(t => results.immuneTo.add(t));
      }
    });

    // Remove any resistances that are also weaknesses (they cancel out)
    results.resistantTo.forEach(type => {
      if (results.weakTo.has(type)) {
        results.resistantTo.delete(type);
        results.weakTo.delete(type);
      }
    });

    return {
      weakTo: Array.from(results.weakTo),
      resistantTo: Array.from(results.resistantTo),
      immuneTo: Array.from(results.immuneTo)
    };
  }, [pokemonDetails]);

  // Get the Pokémon's generation information
  const generationInfo = useMemo(() => {
    if (!pokemonDetails?.id) return null;
    const gen = getGeneration(pokemonDetails.id);
    return {
      number: gen,
      name: generationNames[gen]
    };
  }, [pokemonDetails]);

  if (loading && !pokemonDetails) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-lg">Loading Pokémon information...</p>
        </div>
      </div>
    );
  }

  if (error && !pokemonDetails) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => router.push('/PokeDex')}
          >
            Back to PokéDex
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
      {pokemonDetails && (
        <>
          <FadeIn>
            {/* Pokemon Header Section */}
            <div className={`rounded-2xl shadow-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Pokemon Image */}
                <Scale className="relative">
                  <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <Image 
                      src={pokemonDetails.sprites?.other["official-artwork"]?.front_default || pokemonDetails.sprites?.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'} 
                      alt={pokemonDetails.name}
                      layout="fill"
                      objectFit="contain"
                      className="drop-shadow-md"
                    />
                  </div>
                </Scale>

                {/* Pokemon Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold capitalize">
                        {pokemonDetails.name}
                        <span className="text-gray-400 ml-3">#{String(pokemonDetails.id).padStart(3, '0')}</span>
                      </h1>
                      {generationInfo && (
                        <p className="text-sm text-gray-500">{generationInfo.name}</p>
                      )}
                    </div>
                    <button 
                      className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}`}
                      onClick={handleToggleFavorite}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor" 
                        className="w-8 h-8"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 0 : 2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>

                  {/* Pokemon Types */}
                  <div className="flex gap-2 mt-3">
                    {pokemonDetails.types.map((type) => (
                      <TypeBadge 
                        key={type.type.name} 
                        type={type.type.name} 
                        size="lg" 
                      />
                    ))}
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Height</h3>
                      <p className="text-lg font-semibold">{(pokemonDetails.height / 10).toFixed(1)} m</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                      <p className="text-lg font-semibold">{(pokemonDetails.weight / 10).toFixed(1)} kg</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Base Experience</h3>
                      <p className="text-lg font-semibold">{pokemonDetails.base_experience || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Abilities</h3>
                      <p className="text-lg font-semibold capitalize">
                        {pokemonDetails.abilities.map((ability, idx) => (
                          <span key={ability.ability.name}>
                            {ability.ability.name.replace('-', ' ')}
                            {ability.is_hidden && <span className="text-xs text-gray-500 ml-1">(Hidden)</span>}
                            {idx < pokemonDetails.abilities.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <SlideUp delay={200}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "about"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("about")}
              >
                About
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "stats"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("stats")}
              >
                Stats
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "evolution"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("evolution")}
              >
                Evolution
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "cards"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("cards")}
              >
                Cards
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {/* About Tab */}
              {activeTab === "about" && (
                <FadeIn>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Description */}
                    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h3 className="font-bold text-lg mb-3">Description</h3>
                      <p className="mb-4">
                        {pokemonSpecies?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n]/g, ' ') || 'No description available.'}
                      </p>
                      
                      <h3 className="font-bold text-lg mt-6 mb-3">Taxonomy</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Species</p>
                          <p className="font-medium">{pokemonSpecies?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Habitat</p>
                          <p className="font-medium capitalize">{pokemonSpecies?.habitat?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Shape</p>
                          <p className="font-medium capitalize">{pokemonSpecies?.shape?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Growth Rate</p>
                          <p className="font-medium capitalize">{pokemonSpecies?.growth_rate?.name.replace('-', ' ') || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Type Effectiveness */}
                    <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <h3 className="font-bold text-lg mb-4">Type Effectiveness</h3>
                      {typeEffectivenessInfo && (
                        <div className="space-y-4">
                          {typeEffectivenessInfo.weakTo.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Weak to</h4>
                              <div className="flex flex-wrap gap-2">
                                {typeEffectivenessInfo.weakTo.map(type => (
                                  <TypeBadge key={type} type={type} size="md" />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {typeEffectivenessInfo.resistantTo.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Resistant to</h4>
                              <div className="flex flex-wrap gap-2">
                                {typeEffectivenessInfo.resistantTo.map(type => (
                                  <TypeBadge key={type} type={type} size="md" />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {typeEffectivenessInfo.immuneTo.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-500 mb-1">Immune to</h4>
                              <div className="flex flex-wrap gap-2">
                                {typeEffectivenessInfo.immuneTo.map(type => (
                                  <TypeBadge key={type} type={type} size="md" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Training Info */}
                      <h3 className="font-bold text-lg mt-6 mb-3">Training</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Base Happiness</p>
                          <p className="font-medium">{pokemonSpecies?.base_happiness || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Capture Rate</p>
                          <p className="font-medium">{pokemonSpecies?.capture_rate || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Base Exp</p>
                          <p className="font-medium">{pokemonDetails?.base_experience || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">EV Yield</p>
                          <p className="font-medium capitalize">
                            {pokemonDetails?.stats
                              .filter(stat => stat.effort > 0)
                              .map(stat => `${stat.effort} ${stat.stat.name.replace('-', ' ')}`)
                              .join(', ') || 'None'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}
              
              {/* Stats Tab */}
              {activeTab === "stats" && (
                <FadeIn>
                  <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="font-bold text-lg mb-4">Base Stats</h3>
                    <div className="space-y-4">
                      {pokemonDetails.stats.map((stat) => (
                        <div key={stat.stat.name} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{statLabels[stat.stat.name] || stat.stat.name}</span>
                            <span className="text-sm font-medium">{stat.base_stat}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${
                              stat.base_stat < 50 ? 'bg-red-500' : 
                              stat.base_stat < 90 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`} 
                            style={{ width: formatStatPercentage(stat.base_stat) }}>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-bold">Total</span>
                          <span className="font-bold">
                            {pokemonDetails.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}
              
              {/* Evolution Tab */}
              {activeTab === "evolution" && (
                <FadeIn>
                  <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className="font-bold text-lg mb-4">Evolution Chain</h3>
                    
                    {evolutions && evolutions.length > 0 ? (
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        {evolutions.map((evolution, index) => (
                          <React.Fragment key={evolution.id}>
                            <div 
                              className={`flex flex-col items-center p-4 rounded-lg ${
                                pokemonDetails.id === evolution.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => router.push(`/PokeDex/${evolution.name}`)}
                            >
                              <div className="relative w-24 h-24 cursor-pointer hover:scale-110 transition-transform">
                                <Image
                                  src={evolution.sprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'}
                                  alt={evolution.name}
                                  layout="fill"
                                  objectFit="contain"
                                />
                              </div>
                              <p className="mt-2 capitalize font-medium">{evolution.name}</p>
                              <div className="flex gap-1 mt-1">
                                {evolution.types.map(type => (
                                  <TypeBadge key={type} type={type} size="sm" />
                                ))}
                              </div>
                            </div>
                            
                            {index < evolutions.length - 1 && (
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <p>No evolution data available</p>
                    )}
                  </div>
                </FadeIn>
              )}
              
              {/* Cards Tab */}
              {activeTab === "cards" && (
                <FadeIn>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 capitalize">
                      Cards for {pokemonDetails.name}
                    </h2>
                    
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label htmlFor="rarityFilter" className="block text-sm font-medium mb-1">Filter by Rarity</label>
                        <select
                          id="rarityFilter"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          value={filterRarity}
                          onChange={(e) => setFilterRarity(e.target.value)}
                        >
                          <option value="">All Rarities</option>
                          {uniqueRarities.map(rarity => (
                            <option key={rarity} value={rarity}>{rarity}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="setFilter" className="block text-sm font-medium mb-1">Filter by Set</label>
                        <select
                          id="setFilter"
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          value={filterSet}
                          onChange={(e) => setFilterSet(e.target.value)}
                        >
                          <option value="">All Sets</option>
                          {uniqueSets.map(set => (
                            <option key={set} value={set}>{set}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                          onClick={() => {
                            setFilterRarity('');
                            setFilterSet('');
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>

                    <CardList
                      cards={filteredCards}
                      loading={loading}
                      error={error}
                      initialSortOption="price"
                      onCardClick={openModal}
                      getPrice={getPrice}
                      getReleaseDate={getReleaseDate}
                      getRarityRank={getRarityRank}
                    />
                    
                    {filteredCards.length === 0 && !loading && (
                      <div className="text-center py-10">
                        <p className="text-lg text-gray-500">No cards found matching your filters</p>
                        {(filterRarity || filterSet) && (
                          <button 
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            onClick={() => {
                              setFilterRarity('');
                              setFilterSet('');
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              )}
            </div>
          </SlideUp>
        </>
      )}
      
      {/* Card modal has been replaced with navigation to the dedicated card details page */}
      
      {/* Card Modal has been removed in favor of the dedicated card details page */}
    </div>
  );
}