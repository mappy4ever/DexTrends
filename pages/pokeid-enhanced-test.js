import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { TypeBadge } from "../components/ui/TypeBadge";
import { TypeEffectivenessBadge } from "../components/ui/TypeEffectivenessBadge";
import { useFavorites } from "../context/favoritescontext";
import { typeEffectiveness, getGeneration } from "../utils/pokemonutils";
import { fetchData, fetchPokemon, fetchPokemonSpecies, fetchNature, fetchTCGCards, fetchPocketCards } from "../utils/apiutils";
import EnhancedEvolutionDisplay from "../components/ui/EnhancedEvolutionDisplay";
import PokemonFormSelector from "../components/ui/PokemonFormSelector";
import SimplifiedMovesDisplay from "../components/ui/SimplifiedMovesDisplay";
import CardList from "../components/CardList";
import PocketCardList from "../components/PocketCardList";
import { fetchPocketData } from "../utils/pocketData";
import pokemonTCG from "pokemontcgsdk";
import PokeballLoader from "../components/ui/PokeballLoader";
import Modal from "../components/ui/Modal";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations/animations";
import { BsArrowLeft, BsHeart, BsHeartFill, BsShare, BsStar, BsStarFill } from "react-icons/bs";

// Initialize Pokemon TCG SDK at module level
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY) {
  pokemonTCG.configure({ apiKey: process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY });
}

export default function PokemonDetailEnhanced() {
  const router = useRouter();
  const { pokeid = "25" } = router.query; // Default to Pikachu for testing
  const { favorites, togglePokemonFavorite, isPokemonFavorite } = useFavorites();
  
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tcgCards, setTcgCards] = useState([]);
  const [pocketCards, setPocketCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [abilities, setAbilities] = useState({});
  const [cardType, setCardType] = useState('tcg'); // Toggle between 'tcg' and 'pocket'
  const [zoomedCard, setZoomedCard] = useState(null);
  const [locationAreaEncounters, setLocationAreaEncounters] = useState([]);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [selectedNature, setSelectedNature] = useState('hardy');
  const [selectedLevel, setSelectedLevel] = useState(50);
  const [natureData, setNatureData] = useState(null);
  const [allNatures, setAllNatures] = useState([]);
  const [showStatsCalculator, setShowStatsCalculator] = useState(false);
  const [hasOpenedCalculator, setHasOpenedCalculator] = useState(false);

  useEffect(() => {
    // Wait for router to be ready and pokeid to be available
    if (!router.isReady || !pokeid) return;

    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading Pokemon with ID:', pokeid);

        // Load Pokemon basic data (cached)
        const pokemonData = await fetchPokemon(pokeid);
        setPokemon(pokemonData);

        // Load species data (cached)
        const speciesData = await fetchPokemonSpecies(pokeid);
        setSpecies(speciesData);

        // Load abilities
        await loadAbilities(pokemonData.abilities);

        // Load location encounters
        await loadLocationEncounters(pokemonData.location_area_encounters);

        // Load evolution chain
        if (speciesData.evolution_chain) {
          await loadEvolutionChain(speciesData.evolution_chain.url);
        }

        // Load all natures
        await loadAllNatures();

        // Load TCG cards for this Pokemon
        await loadCards(pokemonData.name);

      } catch (err) {
        console.error('Error loading Pokemon:', err);
        setError(`Failed to load Pokemon data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [router.isReady, pokeid]);

  // Load location encounters
  const loadLocationEncounters = async (encountersUrl) => {
    if (!encountersUrl) return;
    
    try {
      const encounters = await fetchData(encountersUrl);
      setLocationAreaEncounters(encounters);
    } catch (err) {
      console.error('Error loading location encounters:', err);
      setLocationAreaEncounters([]);
    }
  };

  // Load evolution chain
  const loadEvolutionChain = async (evolutionUrl) => {
    if (!evolutionUrl) return;
    
    try {
      const chainData = await fetchData(evolutionUrl);
      setEvolutionChain(chainData);
    } catch (err) {
      console.error('Error loading evolution chain:', err);
      setEvolutionChain(null);
    }
  };

  // Load all available natures
  const loadAllNatures = async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/nature/');
      // Load full data for each nature
      const naturesWithData = await Promise.all(
        response.results.map(async (nature) => {
          try {
            const natureData = await fetchData(nature.url);
            return natureData;
          } catch (err) {
            console.error(`Error loading nature ${nature.name}:`, err);
            return { name: nature.name };
          }
        })
      );
      setAllNatures(naturesWithData);
      // Load default nature data
      await loadNatureData('hardy');
    } catch (err) {
      console.error('Error loading natures:', err);
    }
  };

  // Load specific nature data (cached)
  const loadNatureData = async (natureName) => {
    try {
      const data = await fetchNature(natureName);
      setNatureData(data);
    } catch (err) {
      console.error('Error loading nature data:', err);
    }
  };

  // Handle nature change
  const handleNatureChange = async (nature) => {
    setSelectedNature(nature);
    await loadNatureData(nature);
  };

  // Calculate stat with nature modifier and level
  const calculateStat = (baseStat, statName, level = selectedLevel) => {
    const iv = 31; // Perfect IV
    const ev = 0; // No EVs for now
    
    // HP calculation is different
    if (statName === 'hp') {
      return Math.floor(((2 * baseStat + iv + ev/4) * level / 100) + level + 10);
    }
    
    // Other stats
    let natureModifier = 1.0;
    if (natureData) {
      if (natureData.increased_stat?.name === statName) natureModifier = 1.1;
      else if (natureData.decreased_stat?.name === statName) natureModifier = 0.9;
    }
    
    return Math.floor((((2 * baseStat + iv + ev/4) * level / 100) + 5) * natureModifier);
  };

  // Load abilities data
  const loadAbilities = async (abilitiesList) => {
    if (!abilitiesList || abilitiesList.length === 0) return;
    
    const abilitiesData = {};
    
    for (const abilityInfo of abilitiesList) {
      try {
        const abilityData = await fetchData(abilityInfo.ability.url);
        const englishEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
        
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: englishEntry?.effect || 'No description available.',
          shortEffect: englishEntry?.short_effect || 'No description available.'
        };
      } catch (err) {
        console.error(`Error loading ability ${abilityInfo.ability.name}:`, err);
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: 'Failed to load ability description.',
          shortEffect: 'Failed to load ability description.'
        };
      }
    }
    
    setAbilities(abilitiesData);
  };

  // Load related cards (cached)
  const loadCards = async (pokemonName) => {
    console.log('Loading cards for:', pokemonName);
    setCardsLoading(true);
    try {
      // Load TCG cards with caching
      try {
        const cachedTcgCards = await fetchTCGCards(pokemonName);
        setTcgCards(cachedTcgCards || []);
      } catch (tcgError) {
        console.error('Error loading TCG cards:', tcgError);
        setTcgCards([]);
      }

      // Load Pocket cards with caching
      try {
        const cachedPocketCards = await fetchPocketCards(pokemonName);
        setPocketCards(cachedPocketCards || []);
      } catch (pocketError) {
        console.error('Error loading Pocket cards:', pocketError);
        setPocketCards([]);
      }
    } catch (err) {
      console.error('Error in loadCards:', err);
      setTcgCards([]);
      setPocketCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  const isFavorite = pokemon && isPokemonFavorite(pokemon.id);

  const toggleFavorite = () => {
    if (!pokemon) return;
    
    const favoriteData = {
      id: pokemon.id.toString(),
      name: pokemon.name,
      image: pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default,
      types: pokemon.types.map(t => t.type.name),
      type: 'pokemon'
    };

    togglePokemonFavorite(favoriteData);
  };

  // Handle form changes
  const handleFormChange = async (formData) => {
    setPokemon(formData);
    // Update abilities for the new form
    await loadAbilities(formData.abilities);
    // Update cards for the new form
    await loadCards(formData.name);
  };

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
          <PokeballLoader size="large" text="Loading Pokemon data..." randomBall={true} />
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen gradient-pokedex gradient-animated texture-grain flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-md mx-4">
          <h2 className="text-3xl font-bold text-white mb-4">Pokemon Not Found</h2>
          <p className="text-white/80 mb-8">{error || 'Pokemon not found'}</p>
          <Link href="/pokedex" className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full border border-white/30 transition-all duration-300 hover:scale-105">
            ← Back to Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const generation = getGeneration(pokemon.id);

  return (
    <div className="min-h-screen gradient-pokedex gradient-animated texture-grain relative">
      <Head>
        <title>{(() => {
          const name = pokemon.name;
          const baseName = name.split('-')[0];
          const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
          
          if (name.includes('-mega')) {
            if (name.endsWith('-x')) return `Mega ${capitalizedBase} X`;
            if (name.endsWith('-y')) return `Mega ${capitalizedBase} Y`;
            return `Mega ${capitalizedBase}`;
          }
          if (name.includes('-alola')) return `Alolan ${capitalizedBase}`;
          if (name.includes('-galar')) return `Galarian ${capitalizedBase}`;
          if (name.includes('-hisui')) return `Hisuian ${capitalizedBase}`;
          if (name.includes('-paldea')) return `Paldean ${capitalizedBase}`;
          if (name.includes('-primal')) return `Primal ${capitalizedBase}`;
          
          return capitalizedBase;
        })()} | Enhanced PokeID Test | DexTrends</title>
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
            onClick={toggleFavorite}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 text-white"
          >
            {isFavorite ? <BsHeartFill className="w-5 h-5 text-red-400" /> : <BsHeart className="w-5 h-5" />}
          </button>
          <button className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transition-all duration-300 hover:scale-110 text-white">
            <BsShare className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        
        {/* Hero Section - Enhanced with Glass Morphism */}
        <FadeIn>
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-200 relative overflow-hidden">
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
              {/* Circular Pokemon Image */}
              <div className="flex flex-col justify-center items-center">
                <div className="relative mb-6">
                  <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                    {/* Enhanced gradient border with glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-2 shadow-2xl">
                      <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative overflow-hidden">
                        {/* Multiple glow layers */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-2xl"></div>
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300/10 via-purple-300/10 to-pink-300/10 blur-xl"></div>
                        
                        {/* Pokemon Image */}
                        <div className="relative z-10 w-64 h-64 lg:w-80 lg:h-80">
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
              </div>

              {/* Enhanced Details */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 drop-shadow-sm">
                    {(() => {
                      const name = pokemon.name;
                      const baseName = name.split('-')[0];
                      const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
                      
                      // Handle Mega forms specially
                      if (name.includes('-mega')) {
                        if (name.endsWith('-x')) return `Mega ${capitalizedBase} X`;
                        if (name.endsWith('-y')) return `Mega ${capitalizedBase} Y`;
                        return `Mega ${capitalizedBase}`;
                      }
                      
                      // Regional forms
                      if (name.includes('-alola')) return `Alolan ${capitalizedBase}`;
                      if (name.includes('-galar')) return `Galarian ${capitalizedBase}`;
                      if (name.includes('-hisui')) return `Hisuian ${capitalizedBase}`;
                      if (name.includes('-paldea')) return `Paldean ${capitalizedBase}`;
                      
                      // Other special forms
                      if (name.includes('-primal')) return `Primal ${capitalizedBase}`;
                      if (name.includes('-origin')) return `Origin ${capitalizedBase}`;
                      if (name.includes('-therian')) return `Therian ${capitalizedBase}`;
                      if (name.includes('-gmax') || name.includes('-gigantamax')) return `Gigantamax ${capitalizedBase}`;
                      if (name.includes('-eternamax')) return `Eternamax ${capitalizedBase}`;
                      if (name.includes('-dmax') || name.includes('-dynamax')) return `Dynamax ${capitalizedBase}`;
                      
                      // Base form - always capitalize
                      return capitalizedBase;
                    })()}
                  </h1>
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 px-4 py-3 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <span className="text-sm font-medium text-gray-600">No.</span>
                    <span className="text-2xl font-bold text-gray-900 ml-1 font-mono">
                      {pokemon.id.toString().padStart(3, '0')}
                    </span>
                  </div>
                </div>

                {/* Form Selector */}
                {species && (
                  <div className="mb-6">
                    <PokemonFormSelector
                      pokemon={pokemon}
                      species={species}
                      onFormChange={handleFormChange}
                    />
                  </div>
                )}

                {/* Types */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Types</h3>
                  <div className="flex gap-3">
                    {pokemon.types.map((typeInfo) => (
                      <TypeBadge key={typeInfo.type.name} type={typeInfo.type.name} size="lg" />
                    ))}
                  </div>
                </div>

                {/* Enhanced Quick Stats */}
                <StaggeredChildren className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <CardHover>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 border-2 border-green-200 text-center shadow-lg hover:shadow-xl transition-all">
                      <div className="text-2xl font-bold text-gray-900">{(pokemon.height / 10).toFixed(1)}m</div>
                      <div className="text-gray-600 text-sm font-medium">Height</div>
                      <div className="text-gray-500 text-xs">{((pokemon.height / 10) * 3.281).toFixed(1)} ft</div>
                    </div>
                  </CardHover>
                  
                  <CardHover>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-4 border-2 border-blue-200 text-center shadow-lg hover:shadow-xl transition-all">
                      <div className="text-2xl font-bold text-gray-900">{(pokemon.weight / 10).toFixed(1)}kg</div>
                      <div className="text-gray-600 text-sm font-medium">Weight</div>
                      <div className="text-gray-500 text-xs">{((pokemon.weight / 10) * 2.205).toFixed(1)} lbs</div>
                    </div>
                  </CardHover>
                  
                  <CardHover>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-4 border-2 border-purple-200 text-center shadow-lg hover:shadow-xl transition-all">
                      <div className="text-2xl font-bold text-gray-900">Gen {generation}</div>
                      <div className="text-gray-600 text-sm font-medium">Generation</div>
                    </div>
                  </CardHover>
                  
                  {/* Species Info */}
                  {species && (
                    <>
                      <CardHover>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-4 border-2 border-amber-200 text-center shadow-lg hover:shadow-xl transition-all">
                          <div className="text-lg font-bold text-gray-900">{species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}</div>
                          <div className="text-gray-600 text-sm font-medium">Species</div>
                        </div>
                      </CardHover>
                      
                      <CardHover>
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-4 border-2 border-indigo-200 text-center shadow-lg hover:shadow-xl transition-all">
                          <div className="text-lg font-bold text-gray-900 capitalize">{species.shape?.name?.replace('-', ' ') || 'Unknown'}</div>
                          <div className="text-gray-600 text-sm font-medium">Shape</div>
                        </div>
                      </CardHover>
                      
                      <CardHover>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-4 border-2 border-rose-200 text-center shadow-lg hover:shadow-xl transition-all">
                          <div className="text-lg font-bold text-gray-900">{pokemon.base_experience || 'N/A'}</div>
                          <div className="text-gray-600 text-sm font-medium">Base EXP</div>
                        </div>
                      </CardHover>
                    </>
                  )}
                </StaggeredChildren>

                {/* Special Status */}
                {species && (species.is_legendary || species.is_mythical) && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <BsStarFill className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xl">
                            {species.is_legendary && 'Legendary Pokémon'}
                            {species.is_mythical && 'Mythical Pokémon'}
                          </h4>
                          <p className="text-gray-600 text-sm">This is a special and rare Pokemon!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Enhanced Tabs */}
        <div className="sticky top-20 z-40 mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border-2 border-white/40 shadow-2xl">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'stats', name: 'Stats' },
                { id: 'abilities', name: 'Abilities' },
                { id: 'breeding', name: 'Breeding' },
                { id: 'training', name: 'Training' },
                { id: 'moves', name: 'Moves' },
                { id: 'locations', name: 'Locations' },
                { id: 'entries', name: 'Dex Entries' },
                { id: 'forms', name: 'Forms' },
                { id: 'cards', name: 'Cards' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg border-2 border-blue-300'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Content Sections */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/40 relative overflow-hidden">
          <div className="p-8">

            {activeTab === 'overview' && (
              <FadeIn>
                <div id="overview-content">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Overview</h3>
                  
                  {/* Enhanced Description */}
                  {species?.flavor_text_entries && (
                    <CardHover>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200 mb-6 shadow-lg hover:shadow-xl transition-all">
                        <h4 className="font-bold text-gray-900 mb-4 text-xl">Pokédex Description</h4>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {species.flavor_text_entries
                            .find(entry => entry.language.name === 'en')
                            ?.flavor_text.replace(/\f/g, ' ') || 'No description available.'}
                        </p>
                      </div>
                    </CardHover>
                  )}

                  {/* Enhanced Biology Section */}
                  <CardHover>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-6 border-2 border-green-200 mb-6 shadow-lg hover:shadow-xl transition-all">
                      <h4 className="font-bold text-gray-900 mb-6 text-xl">Biology</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/70 rounded-2xl p-4 border border-green-200 shadow-sm">
                          <span className="text-gray-600 text-sm font-medium">Species</span>
                          <div className="font-bold text-gray-900 text-lg">
                            {species?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}
                          </div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-4 border border-green-200 shadow-sm">
                          <span className="text-gray-600 text-sm font-medium">Habitat</span>
                          <div className="font-bold text-gray-900 text-lg capitalize">
                            {species?.habitat?.name?.replace('-', ' ') || 'Unknown'}
                          </div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-4 border border-green-200 shadow-sm">
                          <span className="text-gray-600 text-sm font-medium">Color</span>
                          <div className="font-bold text-gray-900 text-lg capitalize">
                            {species?.color?.name || 'Unknown'}
                          </div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-4 border border-green-200 shadow-sm">
                          <span className="text-gray-600 text-sm font-medium">Shape</span>
                          <div className="font-bold text-gray-900 text-lg capitalize">
                            {species?.shape?.name?.replace('-', ' ') || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHover>
                  
                  {/* Enhanced Type Effectiveness */}
                  <CardHover>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-6 border-2 border-purple-200 mb-6 shadow-lg hover:shadow-xl transition-all">
                      <h4 className="font-bold text-gray-900 mb-6 text-xl">Type Effectiveness</h4>
                      {(() => {
                        // Calculate type effectiveness with multipliers
                        const damageRelations = {};
                        
                        // Initialize all types with 1x multiplier
                        const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
                        allTypes.forEach(type => {
                          damageRelations[type] = 1;
                        });
                        
                        // Calculate damage multipliers for each type the Pokemon has
                        pokemon.types.forEach(typeInfo => {
                          const effectiveness = typeEffectiveness[typeInfo.type.name];
                          if (effectiveness) {
                            // Apply weaknesses (2x damage)
                            effectiveness.weakTo?.forEach(t => {
                              damageRelations[t] = (damageRelations[t] || 1) * 2;
                            });
                            // Apply resistances (0.5x damage)
                            effectiveness.resistantTo?.forEach(t => {
                              damageRelations[t] = (damageRelations[t] || 1) * 0.5;
                            });
                            // Apply immunities (0x damage)
                            effectiveness.immuneTo?.forEach(t => {
                              damageRelations[t] = 0;
                            });
                          }
                        });
                        
                        // Group by effectiveness
                        const groupedEffectiveness = {
                          immune: [],
                          veryResistant: [],
                          resistant: [],
                          normal: [],
                          weak: [],
                          veryWeak: []
                        };
                        
                        Object.entries(damageRelations).forEach(([type, multiplier]) => {
                          if (multiplier === 0) groupedEffectiveness.immune.push(type);
                          else if (multiplier === 0.25) groupedEffectiveness.veryResistant.push(type);
                          else if (multiplier === 0.5) groupedEffectiveness.resistant.push(type);
                          else if (multiplier === 1) groupedEffectiveness.normal.push(type);
                          else if (multiplier === 2) groupedEffectiveness.weak.push(type);
                          else if (multiplier === 4) groupedEffectiveness.veryWeak.push(type);
                        });
                        
                        return (
                          <div className="space-y-4">
                            {/* Weaknesses */}
                            {(groupedEffectiveness.veryWeak.length > 0 || groupedEffectiveness.weak.length > 0) && (
                              <div className="bg-red-100 rounded-2xl p-4 border-2 border-red-200 shadow-sm">
                                <h5 className="text-sm font-bold text-red-800 mb-3">Weak to:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {groupedEffectiveness.veryWeak.map(type => (
                                    <TypeEffectivenessBadge key={type} type={type} multiplier={4} />
                                  ))}
                                  {groupedEffectiveness.weak.map(type => (
                                    <TypeEffectivenessBadge key={type} type={type} multiplier={2} />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Resistances */}
                            {(groupedEffectiveness.resistant.length > 0 || groupedEffectiveness.veryResistant.length > 0) && (
                              <div className="bg-green-100 rounded-2xl p-4 border-2 border-green-200 shadow-sm">
                                <h5 className="text-sm font-bold text-green-800 mb-3">Resistant to:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {groupedEffectiveness.veryResistant.map(type => (
                                    <TypeEffectivenessBadge key={type} type={type} multiplier={0.25} />
                                  ))}
                                  {groupedEffectiveness.resistant.map(type => (
                                    <TypeEffectivenessBadge key={type} type={type} multiplier={0.5} />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Immunities */}
                            {groupedEffectiveness.immune.length > 0 && (
                              <div className="bg-gray-100 rounded-2xl p-4 border-2 border-gray-200 shadow-sm">
                                <h5 className="text-sm font-bold text-gray-800 mb-3">Immune to:</h5>
                                <div className="flex flex-wrap gap-2">
                                  {groupedEffectiveness.immune.map(type => (
                                    <TypeEffectivenessBadge key={type} type={type} multiplier={0} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardHover>

                  {/* Enhanced Evolution Chain */}
                  <CardHover>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all">
                      <h4 className="font-bold text-gray-900 mb-6 text-xl">Evolution Chain</h4>
                      <div className="evolution-container bg-white/50 rounded-2xl p-4">
                        <EnhancedEvolutionDisplay 
                          speciesUrl={pokemon.species.url}
                          currentPokemonId={pokemon.id}
                        />
                      </div>
                    </div>
                  </CardHover>
                </div>
              </FadeIn>
            )}

            {activeTab === 'stats' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Stats</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enhanced Stats Calculator */}
                    <CardHover>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                        {/* Collapsible Stats Calculator */}
                        <div className={`bg-white/80 rounded-2xl border-2 border-blue-200 transition-all duration-300 mb-6 shadow-lg ${
                          showStatsCalculator ? 'shadow-xl' : 'shadow-lg'
                        }`}>
                          <button
                            onClick={() => {
                              setShowStatsCalculator(!showStatsCalculator);
                              if (!hasOpenedCalculator) setHasOpenedCalculator(true);
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors rounded-2xl"
                          >
                            <h3 className="text-xl font-bold text-gray-900">Stats Calculator</h3>
                            <div className="relative">
                              {!hasOpenedCalculator && (
                                <div className="absolute -inset-2 border-2 border-blue-400 rounded-lg animate-pulse"></div>
                              )}
                              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-300 rounded-lg p-2 hover:border-blue-500 transition-colors">
                                <svg 
                                  className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${
                                    showStatsCalculator ? 'rotate-180' : ''
                                  }`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                          
                          {/* Collapsible Content */}
                          <div className={`transition-all duration-300 overflow-hidden ${
                            showStatsCalculator ? 'max-h-[600px]' : 'max-h-0'
                          }`}>
                            <div className="p-4 pt-0 space-y-4">
                              {/* Reset Button */}
                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedLevel(50);
                                    setSelectedNature('hardy');
                                    handleNatureChange('hardy');
                                  }}
                                  className="px-3 py-2 text-sm bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium text-white"
                                >
                                  Reset
                                </button>
                              </div>

                              {/* Nature Tabs */}
                              <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                  Nature
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                  {allNatures.map((nature) => {
                                    const isSelected = nature.name === selectedNature;
                                    const increased = nature.increased_stat?.name;
                                    const decreased = nature.decreased_stat?.name;
                                    
                                    return (
                                      <button
                                        key={nature.name}
                                        onClick={() => handleNatureChange(nature.name)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all relative ${
                                          isSelected 
                                            ? 'bg-blue-500/30 text-white shadow-md border border-blue-400/50' 
                                            : 'bg-white/10 hover:bg-white/20 text-white/80'
                                        }`}
                                      >
                                        <div className={`capitalize text-xs ${isSelected ? 'font-bold' : ''}`}>{nature.name}</div>
                                        {increased && decreased ? (
                                          <div className="flex gap-1 mt-1 justify-center">
                                            <div className="bg-green-400/30 text-green-200 text-[8px] px-1 py-0.5 rounded">
                                              +{increased === 'attack' ? 'Atk' :
                                                increased === 'defense' ? 'Def' :
                                                increased === 'special-attack' ? 'SpA' : 
                                                increased === 'special-defense' ? 'SpD' : 
                                                increased === 'speed' ? 'Spe' : increased.slice(0, 3)}
                                            </div>
                                            <div className="bg-red-400/30 text-red-200 text-[8px] px-1 py-0.5 rounded">
                                              -{decreased === 'attack' ? 'Atk' :
                                                decreased === 'defense' ? 'Def' :
                                                decreased === 'special-attack' ? 'SpA' : 
                                                decreased === 'special-defense' ? 'SpD' : 
                                                decreased === 'speed' ? 'Spe' : decreased.slice(0, 3)}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className={`text-[9px] mt-1 ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                            Neutral
                                          </div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Level Slider */}
                              <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                  <span className="text-xl font-bold text-white">Level: {selectedLevel}</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={selectedLevel}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value);
                                      // Add sticky behavior for key levels
                                      if (val >= 48 && val <= 52) setSelectedLevel(50);
                                      else if (val >= 73 && val <= 77) setSelectedLevel(75);
                                      else if (val >= 98) setSelectedLevel(100);
                                      else setSelectedLevel(val);
                                    }}
                                    className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(selectedLevel - 1) / 99 * 100}%, rgba(255,255,255,0.2) ${(selectedLevel - 1) / 99 * 100}%, rgba(255,255,255,0.2) 100%)`
                                    }}
                                  />
                                  {/* Checkpoint markers */}
                                  <div className="absolute top-0 w-full flex pointer-events-none">
                                    <div className="absolute left-0 w-0.5 h-3 bg-white/40"></div>
                                    <div className="absolute left-[50%] w-0.5 h-3 bg-white/40"></div>
                                    <div className="absolute left-[75%] w-0.5 h-3 bg-white/40"></div>
                                    <div className="absolute right-0 w-0.5 h-3 bg-white/40"></div>
                                  </div>
                                  {/* Checkpoint labels */}
                                  <div className="flex justify-between mt-1 text-xs text-white/60">
                                    <span>1</span>
                                    <span className="ml-[45%]">50</span>
                                    <span className="ml-[20%]">75</span>
                                    <span>100</span>
                                  </div>
                                </div>
                              </div>

                              {natureData && (
                                <div className="text-xs text-white/80 bg-white/10 p-3 rounded-xl border border-white/20">
                                  <strong>{selectedNature.charAt(0).toUpperCase() + selectedNature.slice(1)}</strong>: 
                                  {natureData.increased_stat && natureData.decreased_stat ? (
                                    <>
                                      <span className="text-green-300 ml-1">+10% {natureData.increased_stat.name.replace('-', ' ')}</span>
                                      <span className="text-red-300 ml-1">-10% {natureData.decreased_stat.name.replace('-', ' ')}</span>
                                    </>
                                  ) : (
                                    <span className="text-white/60 ml-1">No stat changes</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Circular Stats Display */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-white text-lg">
                              {showStatsCalculator ? `Stats at Level ${selectedLevel}` : 'Base Stats'}
                            </h4>
                          </div>
                          
                          {/* Circular Stat Indicators */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {pokemon.stats?.map((stat, index) => {
                              const statName = stat.stat.name;
                              const baseStat = stat.base_stat;
                              const calculatedStat = showStatsCalculator ? calculateStat(baseStat, statName) : baseStat;
                              const percentage = getStatPercentage(calculatedStat);
                              const color = getStatColor(calculatedStat);
                              const circumference = 2 * Math.PI * 45; // radius = 45
                              const strokeDashoffset = circumference - (percentage / 100) * circumference;
                              
                              // Check if stat is modified by nature
                              const isIncreased = showStatsCalculator && natureData?.increased_stat?.name === statName;
                              const isDecreased = showStatsCalculator && natureData?.decreased_stat?.name === statName;
                              
                              return (
                                <SlideUp key={stat.stat.name} delay={index * 100}>
                                  <div className="text-center">
                                    <div className="relative w-24 h-24 mx-auto mb-3">
                                      {/* Background circle */}
                                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                          cx="50"
                                          cy="50"
                                          r="45"
                                          stroke="rgba(255,255,255,0.2)"
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
                                            filter: `drop-shadow(0 0 8px ${color}60)`
                                          }}
                                        />
                                      </svg>
                                      {/* Stat value */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{calculatedStat}</span>
                                      </div>
                                    </div>
                                    <div className="text-white font-medium capitalize text-sm flex items-center justify-center gap-1">
                                      {statName === 'hp' ? 'HP' : 
                                       statName === 'special-attack' ? 'Sp. Atk' :
                                       statName === 'special-defense' ? 'Sp. Def' :
                                       statName.replace('-', ' ')}
                                      {showStatsCalculator && isIncreased && <span className="text-green-400 text-xs">↑</span>}
                                      {showStatsCalculator && isDecreased && <span className="text-red-400 text-xs">↓</span>}
                                    </div>
                                    {showStatsCalculator && (
                                      <div className="text-white/60 text-xs mt-1">
                                        Base: {baseStat}
                                      </div>
                                    )}
                                  </div>
                                </SlideUp>
                              );
                            })}
                          </div>

                          {/* Total Stats */}
                          <div className="pt-6 mt-6 border-t border-white/20">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-white mb-2">
                                {showStatsCalculator 
                                  ? pokemon.stats.reduce((total, stat) => total + calculateStat(stat.base_stat, stat.stat.name), 0)
                                  : pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)
                                }
                              </div>
                              <div className="text-white/70">
                                {showStatsCalculator ? 'Total Calculated Stats' : 'Base Stat Total'}
                              </div>
                              {showStatsCalculator && (
                                <div className="text-white/50 text-sm mt-1">
                                  Base Total: {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHover>

                    {/* Enhanced Stats Analysis */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-6 text-xl">Stats Analysis</h4>
                        <div className="space-y-6">
                          {/* Stat Rankings */}
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                            <h5 className="font-medium text-white mb-3">Stat Rankings</h5>
                            <div className="space-y-2">
                              {pokemon.stats
                                .sort((a, b) => b.base_stat - a.base_stat)
                                .map((stat, index) => (
                                  <div key={stat.stat.name} className="flex justify-between items-center">
                                    <span className="capitalize text-white/80">
                                      {index + 1}. {stat.stat.name === 'hp' ? 'HP' : 
                                                   stat.stat.name === 'special-attack' ? 'Sp. Attack' :
                                                   stat.stat.name === 'special-defense' ? 'Sp. Defense' :
                                                   stat.stat.name.replace('-', ' ')}
                                    </span>
                                    <span className="font-medium text-white">{stat.base_stat}</span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Min/Max Stats at Level 100 */}
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                            <h5 className="font-medium text-white mb-3">Stats Range at Level 100</h5>
                            <div className="text-sm text-white/80 space-y-2">
                              {pokemon.stats.slice(0, 3).map((stat) => {
                                const min = stat.stat.name === 'hp' 
                                  ? Math.floor((2 * stat.base_stat + 0 + 0) * 100 / 100 + 100 + 10)
                                  : Math.floor(((2 * stat.base_stat + 0 + 0) * 100 / 100 + 5) * 0.9);
                                const max = stat.stat.name === 'hp'
                                  ? Math.floor((2 * stat.base_stat + 31 + 252/4) * 100 / 100 + 100 + 10)
                                  : Math.floor(((2 * stat.base_stat + 31 + 252/4) * 100 / 100 + 5) * 1.1);
                                
                                return (
                                  <div key={stat.stat.name} className="flex justify-between">
                                    <span className="capitalize">
                                      {stat.stat.name === 'hp' ? 'HP' : stat.stat.name.replace('-', ' ')}
                                    </span>
                                    <span>{min} - {max}</span>
                                  </div>
                                );
                              })}
                              <div className="text-xs text-white/60 mt-3 p-2 bg-white/5 rounded">
                                Min: 0 IV, 0 EV, Hindering nature<br/>
                                Max: 31 IV, 252 EV, Beneficial nature
                              </div>
                            </div>
                          </div>

                          {/* Type Defenses */}
                          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                            <h5 className="font-medium text-white mb-3">Defensive Averages</h5>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/80">Physical Bulk</span>
                                <span className="font-medium text-white">
                                  {Math.round((pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat + 
                                              pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat) / 2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/80">Special Bulk</span>
                                <span className="font-medium text-white">
                                  {Math.round((pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat + 
                                              pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat) / 2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHover>
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'abilities' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">Abilities</h3>
                  <div className="space-y-6">
                    {pokemon.abilities.map((abilityInfo, index) => {
                      const abilityData = abilities[abilityInfo.ability.name];
                      return (
                        <SlideUp key={abilityInfo.ability.name} delay={index * 100}>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                            <div className="flex items-start gap-6">
                              {/* Enhanced circular ability icon */}
                              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-white">
                                <BsStar className="text-white w-10 h-10" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <h4 className="font-bold text-gray-900 capitalize text-2xl">
                                    {abilityInfo.ability.name.replace(/-/g, ' ')}
                                  </h4>
                                  {abilityInfo.is_hidden && (
                                    <span className="bg-gradient-to-r from-yellow-200 to-amber-200 text-yellow-800 px-4 py-2 rounded-full text-sm border-2 border-yellow-300 font-semibold shadow-sm">
                                      Hidden Ability
                                    </span>
                                  )}
                                </div>
                                <div className="bg-white/70 rounded-2xl p-4 border border-purple-200 shadow-sm">
                                  <p className="text-gray-700 mb-3 text-base leading-relaxed">
                                    {abilityData?.effect || 'Loading ability description...'}
                                  </p>
                                  {abilityData?.shortEffect && abilityData.shortEffect !== abilityData.effect && (
                                    <p className="text-gray-600 italic text-sm bg-purple-50 p-3 rounded-xl border border-purple-100">
                                      {abilityData.shortEffect}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </SlideUp>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'breeding' && species && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Breeding Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gender Ratio */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Gender Ratio</h4>
                        {species.gender_rate === -1 ? (
                          <div className="text-center py-4">
                            <div className="text-2xl font-bold text-white mb-2">Genderless</div>
                            <div className="text-white/70">This Pokémon has no gender</div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-blue-300 font-medium flex items-center gap-2">
                                <span className="text-xl">♂</span> Male
                              </span>
                              <span className="text-white font-bold">{((8 - species.gender_rate) / 8 * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-pink-300 font-medium flex items-center gap-2">
                                <span className="text-xl">♀</span> Female
                              </span>
                              <span className="text-white font-bold">{(species.gender_rate / 8 * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-6 flex overflow-hidden border border-white/30">
                              <div className="bg-blue-500 h-6 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(8 - species.gender_rate) / 8 * 100}%` }}>
                                {((8 - species.gender_rate) / 8 * 100) > 15 && '♂'}
                              </div>
                              <div className="bg-pink-500 h-6 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${species.gender_rate / 8 * 100}%` }}>
                                {(species.gender_rate / 8 * 100) > 15 && '♀'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHover>

                    {/* Egg Groups */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Egg Groups</h4>
                        <div className="flex flex-wrap gap-3">
                          {species.egg_groups?.map(group => (
                            <span key={group.name} className="px-4 py-2 bg-purple-500/20 text-purple-200 rounded-full text-sm capitalize border border-purple-400/30">
                              {group.name.replace('-', ' ')}
                            </span>
                          )) || <span className="text-white/70">No egg groups</span>}
                        </div>
                      </div>
                    </CardHover>

                    {/* Hatch Counter */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Egg Cycles</h4>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-2">{species.hatch_counter || '?'}</div>
                          <div className="text-white/70 text-sm">cycles</div>
                          <div className="text-white/50 text-xs mt-2">
                            {species.hatch_counter ? `${(species.hatch_counter + 1) * 255} steps` : 'Unknown steps'}
                          </div>
                        </div>
                      </div>
                    </CardHover>

                    {/* Growth Rate */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Growth Rate</h4>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white capitalize">
                            {species.growth_rate?.name?.replace('-', ' ') || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </CardHover>
                  </div>

                  {/* Baby Status */}
                  {(species.is_baby || species.forms_switchable) && (
                    <CardHover>
                      <div className="mt-6 bg-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
                        <h4 className="font-semibold text-white mb-3 text-lg">Special Status</h4>
                        <div className="space-y-2">
                          {species.is_baby && (
                            <div className="flex items-center gap-3">
                              <BsStar className="text-yellow-400" />
                              <span className="text-white">Baby Pokémon</span>
                            </div>
                          )}
                          {species.forms_switchable && (
                            <div className="flex items-center gap-3">
                              <BsStar className="text-blue-400" />
                              <span className="text-white">Has switchable forms</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHover>
                  )}
                </div>
              </FadeIn>
            )}

            {activeTab === 'training' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Training Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* EV Yield */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">EV Yield</h4>
                        <div className="space-y-3">
                          {pokemon.stats.filter(stat => stat.effort > 0).map(stat => (
                            <div key={stat.stat.name} className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                              <span className="capitalize text-white">{stat.stat.name.replace('-', ' ')}</span>
                              <span className="font-medium text-green-300">+{stat.effort}</span>
                            </div>
                          ))}
                          {pokemon.stats.every(stat => stat.effort === 0) && (
                            <div className="text-center py-4">
                              <div className="text-white/70">No EV yield</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHover>

                    {/* Held Items */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Wild Hold Items</h4>
                        {pokemon.held_items?.length > 0 ? (
                          <div className="space-y-3">
                            {pokemon.held_items.map(item => (
                              <div key={item.item.name} className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                                <span className="capitalize text-white">{item.item.name.replace('-', ' ')}</span>
                                <span className="text-yellow-300 text-sm font-medium">
                                  {item.version_details[0]?.rarity || 5}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-white/70">No held items</div>
                          </div>
                        )}
                      </div>
                    </CardHover>

                    {/* Base Stats Total */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Base Stat Total</h4>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-white mb-2">
                            {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                          </div>
                          <div className="text-white/70">Combined base stats</div>
                        </div>
                      </div>
                    </CardHover>

                    {/* Growth & Friendship */}
                    <CardHover>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <h4 className="font-semibold text-white mb-4 text-lg">Growth & Friendship</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                            <span className="text-white">Growth Rate</span>
                            <span className="capitalize font-medium text-white">{species?.growth_rate?.name?.replace('-', ' ') || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
                            <span className="text-white">Base Friendship</span>
                            <span className="font-medium text-white">{species?.base_happiness || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    </CardHover>
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'moves' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Moves</h3>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <SimplifiedMovesDisplay moves={pokemon.moves} pokemonName={pokemon.name} />
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'locations' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Location Encounters</h3>
                  {locationAreaEncounters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {locationAreaEncounters.map((encounter, index) => (
                        <SlideUp key={index} delay={index * 100}>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <h4 className="font-semibold text-white capitalize mb-4 text-lg">
                              {encounter.location_area.name.replace(/-/g, ' ')}
                            </h4>
                            <div className="space-y-3">
                              {encounter.version_details.map((version, vIndex) => (
                                <div key={vIndex} className="bg-white/5 rounded-xl p-3">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium capitalize text-white">
                                      {version.version.name}
                                    </span>
                                    <span className="text-green-300 font-medium">
                                      {version.max_chance}% chance
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </SlideUp>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                      <div className="text-white/70 text-lg">
                        No wild encounter locations found for this Pokémon.
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {activeTab === 'entries' && species && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Pokédex Entries</h3>
                  <div className="space-y-6">
                    {species.flavor_text_entries
                      ?.filter(entry => entry.language.name === 'en')
                      .reduce((unique, entry) => {
                        const text = entry.flavor_text.replace(/\f/g, ' ');
                        if (!unique.find(e => e.text === text)) {
                          unique.push({ ...entry, text });
                        }
                        return unique;
                      }, [])
                      .map((entry, index) => (
                        <SlideUp key={index} delay={index * 100}>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <h4 className="font-semibold text-white capitalize mb-3 text-lg">
                              {entry.version.name.replace('-', ' ')}
                            </h4>
                            <p className="text-white/90 leading-relaxed text-base">{entry.text}</p>
                          </div>
                        </SlideUp>
                      )) || (
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                        <div className="text-white/70 text-lg">
                          No Pokédex entries available.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'forms' && (
              <FadeIn>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Forms & Variants</h3>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <PokemonFormSelector 
                      pokemon={pokemon} 
                      species={species} 
                      onFormChange={async (newFormData) => {
                        // Update the pokemon data with the new form
                        setPokemon(newFormData);
                        // Fetch species data for the new form if it has a different species URL
                        if (newFormData.species && newFormData.species.url !== species?.url) {
                          try {
                            const newSpeciesData = await fetchData(newFormData.species.url);
                            setSpecies(newSpeciesData);
                          } catch (error) {
                            console.error('Failed to fetch species data for form:', error);
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'cards' && (
              <FadeIn>
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-3xl font-bold text-white">
                      {cardType === 'tcg' ? 'TCG Cards' : 'Pocket Cards'}
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCardType('tcg')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                          cardType === 'tcg'
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        TCG
                      </button>
                      <button
                        onClick={() => setCardType('pocket')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                          cardType === 'pocket'
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        Pocket
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    {cardsLoading ? (
                      <div className="py-8 text-center">
                        <PokeballLoader size="medium" text="Loading cards..." randomBall={true} />
                      </div>
                    ) : (
                      <>
                        {cardType === 'tcg' ? (
                          tcgCards.length > 0 ? (
                            <CardList 
                              cards={tcgCards}
                              loading={false}
                              showPrice={true}
                              showSet={true}
                              showView={false}
                            />
                          ) : (
                            <div className="text-center text-white/70 py-8 text-lg">
                              No TCG cards found for {pokemon?.name || 'this Pokémon'}.
                            </div>
                          )
                        ) : (
                          pocketCards.length > 0 ? (
                            <PocketCardList 
                              cards={pocketCards}
                              loading={false}
                              showPack={true}
                              showRarity={true}
                              setZoomedCard={setZoomedCard}
                              gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                            />
                          ) : (
                            <div className="text-center text-white/70 py-8 text-lg">
                              No Pocket cards found for {pokemon?.name || 'this Pokémon'}.
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {pokemon.id > 1 && (
              <Link 
                href={`/pokeid-enhanced-test?pokeid=${pokemon.id - 1}`}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl border border-white/30 transition-all duration-300 hover:scale-105"
              >
                ← Previous
              </Link>
            )}
          </div>
          <div>
            {pokemon.id < 1010 && (
              <Link 
                href={`/pokeid-enhanced-test?pokeid=${pokemon.id + 1}`}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl border border-white/30 transition-all duration-300 hover:scale-105"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal for zoomed card */}
      {zoomedCard && (
        <Modal onClose={() => setZoomedCard(null)}>
          <div className="flex justify-center">
            <Image
              src={zoomedCard.image}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}