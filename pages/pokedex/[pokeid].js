import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { TypeEffectivenessBadge } from "../../components/ui/TypeEffectivenessBadge";
import { useFavorites } from "../../context/UnifiedAppContext";
import { typeEffectiveness, getGeneration } from "../../utils/pokemonutils";
import { fetchData, fetchPokemon, fetchPokemonSpecies, fetchNature, fetchTCGCards, fetchPocketCards } from "../../utils/apiutils";
import EnhancedEvolutionDisplay from "../../components/ui/EnhancedEvolutionDisplay";
import PokemonFormSelector from "../../components/ui/PokemonFormSelector";
import SimplifiedMovesDisplay from "../../components/ui/SimplifiedMovesDisplay";
import CardList from "../../components/CardList";
import PocketCardList from "../../components/PocketCardList";
import { fetchPocketData } from "../../utils/pocketData";
import pokemonTCG from "pokemontcgsdk";
import PokeballLoader from "../../components/ui/PokeballLoader";
import Modal from "../../components/ui/modals/Modal";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { getTypeUIColors } from "../../utils/pokemonTypeGradients";

// Initialize Pokemon TCG SDK at module level
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY) {
  pokemonTCG.configure({ apiKey: process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY });
}

export default function PokemonDetail() {
  const router = useRouter();
  const { pokeid } = router.query;
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  
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

  const isFavorite = pokemon && favorites.pokemon.some(p => p.id === String(pokemon.id));

  const toggleFavorite = () => {
    if (!pokemon) return;
    
    const favoriteData = {
      id: pokemon.id.toString(),
      name: pokemon.name,
      image: pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default,
      types: pokemon.types.map(t => t.type.name),
      type: 'pokemon'
    };

    if (isFavorite) {
      removeFromFavorites('pokemon', pokemon.id);
    } else {
      addToFavorites('pokemon', favoriteData);
    }
  };

  // Handle form changes
  const handleFormChange = async (formData) => {
    try {
      console.log('Form change requested:', formData.name);
      
      // Update the main Pokemon data
      setPokemon(formData);
      
      // Update abilities for the new form
      await loadAbilities(formData.abilities);
      
      // Update cards for the new form
      await loadCards(formData.name);
      
      // Update the URL to reflect the form change (optional - preserves browsing experience)
      const formId = formData.name.includes('-') ? formData.name : formData.id;
      const currentUrl = window.location.pathname;
      const newUrl = `/pokedex/${formId}`;
      
      // Only update URL if it's different to avoid unnecessary history entries
      if (currentUrl !== newUrl) {
        window.history.replaceState(null, '', newUrl);
      }
      
    } catch (error) {
      console.error('Error handling form change:', error);
      // Don't break the UI if form change fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PokeballLoader size="large" text="Loading Pokemon data..." randomBall={true} />
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Pokemon not found'}</p>
          <Link href="/pokedex" className="text-pokemon-red hover:underline">
            ← Back to Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const generation = getGeneration(pokemon.id);
  
  // Get type-based UI colors
  const typeColors = getTypeUIColors(pokemon.types);

  return (
    <div>
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
        })()} | DexTrends Pokédex</title>
        <meta name="description" content={`Detailed information about ${pokemon.name} including stats, types, and abilities.`} />
      </Head>

      <FullBleedWrapper gradient="pokemon-type" pokemonTypes={pokemon.types}>
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/pokedex" className={`group flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-${typeColors.border}/30 dark:border-${typeColors.borderDark}/30`}>
            <svg className={`w-5 h-5 text-${typeColors.button} group-hover:-translate-x-1 transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold text-gray-700 dark:text-gray-200">Back to Pokédex</span>
          </Link>
          <button
            onClick={toggleFavorite}
            className={`group flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm border border-${typeColors.border}/30 dark:border-${typeColors.borderDark}/30 ${
              isFavorite 
                ? `bg-gradient-to-r from-${typeColors.button} to-${typeColors.buttonHover} text-white hover:from-${typeColors.buttonHover} hover:to-${typeColors.button}` 
                : `bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-${typeColors.bg} hover:to-${typeColors.glass} dark:hover:from-${typeColors.bgDark} dark:hover:to-${typeColors.glassDark}`
            }`}
          >
            <span className="text-lg">{isFavorite ? '❤️' : '🤍'}</span>
            <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Pokemon Info */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 dark:border-gray-700/30 p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="flex flex-col justify-center items-center">
              <div className="relative mb-4">
                {/* Circular border container with extra space for ring */}
                <div className="relative w-96 h-96 lg:w-[28rem] lg:h-[28rem]">
                  {/* Outer ring with darker color - using gradient background for dual types */}
                  <div className={`absolute inset-0 rounded-full ${(() => {
                    const types = pokemon.types;
                    const primaryType = types[0].type.name;
                    const secondaryType = types.length > 1 ? types[1].type.name : null;
                    
                    // For dual types, create gradient ring
                    if (secondaryType) {
                      const typeToColorMap = {
                        normal: 'amber', fire: 'red', water: 'blue', electric: 'yellow', grass: 'green',
                        ice: 'cyan', fighting: 'red', poison: 'purple', ground: 'yellow', flying: 'sky',
                        psychic: 'pink', bug: 'lime', rock: 'stone', ghost: 'purple', dragon: 'indigo',
                        dark: 'gray', steel: 'slate', fairy: 'pink'
                      };
                      
                      const primaryColor = typeToColorMap[primaryType] || 'purple';
                      const secondaryColor = typeToColorMap[secondaryType] || 'purple';
                      
                      return `bg-gradient-to-br from-${primaryColor}-500/20 to-${secondaryColor}-500/20 dark:from-${primaryColor}-600/25 dark:to-${secondaryColor}-600/25`;
                    }
                    
                    // Single type solid colors - 15% opacity for outer ring (extremely subtle)
                    const singleTypeRings = {
                      normal: 'bg-amber-500/15 dark:bg-amber-600/20',
                      fire: 'bg-red-500/15 dark:bg-red-600/20',
                      water: 'bg-blue-500/15 dark:bg-blue-600/20',
                      electric: 'bg-yellow-500/15 dark:bg-yellow-600/20',
                      grass: 'bg-green-500/15 dark:bg-green-600/20',
                      ice: 'bg-cyan-500/15 dark:bg-cyan-600/20',
                      fighting: 'bg-red-500/15 dark:bg-red-600/20',
                      poison: 'bg-purple-500/15 dark:bg-purple-600/20',
                      ground: 'bg-yellow-500/15 dark:bg-yellow-600/20',
                      flying: 'bg-sky-500/15 dark:bg-sky-600/20',
                      psychic: 'bg-pink-500/15 dark:bg-pink-600/20',
                      bug: 'bg-lime-500/15 dark:bg-lime-600/20',
                      rock: 'bg-stone-500/15 dark:bg-stone-600/20',
                      ghost: 'bg-purple-500/15 dark:bg-purple-600/20',
                      dragon: 'bg-indigo-500/15 dark:bg-indigo-600/20',
                      dark: 'bg-gray-500/15 dark:bg-gray-600/20',
                      steel: 'bg-slate-500/15 dark:bg-slate-600/20',
                      fairy: 'bg-pink-500/15 dark:bg-pink-600/20'
                    };
                    
                    return singleTypeRings[primaryType] || 'bg-purple-500/15 dark:bg-purple-600/20';
                  })()} shadow-xl`}></div>
                  
                  {/* Inner circle with solid light grey background */}
                  <div className="absolute inset-8 rounded-full bg-gray-100 dark:bg-gray-900 shadow-2xl">
                    {/* Pokemon image directly on gradient background */}
                    <Image
                      src={pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || "/dextrendslogo.png"}
                      alt={pokemon.name}
                      fill
                      className="object-contain p-8 relative z-10"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-gray-800">
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
                <div className={`flex items-center ${typeColors.cardBg} px-4 py-2 rounded-full border ${typeColors.cardBorder}`}>
                  <span className={`text-sm font-medium text-${typeColors.text} dark:text-${typeColors.textDark}`}>No.</span>
                  <span className={`text-xl font-bold text-${typeColors.text} dark:text-${typeColors.textDark} ml-1 font-mono`}>
                    {pokemon.id.toString().padStart(3, '0')}
                  </span>
                </div>
              </div>

              {/* Form Selector */}
              {species && (
                <PokemonFormSelector
                  pokemon={pokemon}
                  species={species}
                  onFormChange={handleFormChange}
                />
              )}

              {/* Types */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Types</h3>
                <div className="flex gap-2">
                  {pokemon.types.map((typeInfo) => (
                    <TypeBadge key={typeInfo.type.name} type={typeInfo.type.name} size="md" />
                  ))}
                </div>
              </div>

              {/* Basic Info - Enhanced Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                <div className={`bg-gradient-to-br from-${typeColors.bg} to-${typeColors.glass} dark:from-${typeColors.bgDark}/30 dark:to-${typeColors.glassDark}/30 p-2 sm:p-3 rounded-2xl border border-${typeColors.border}/50 dark:border-${typeColors.borderDark}/50 shadow-lg`}>
                  <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-xs sm:text-sm`}>Height</h4>
                  <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-base sm:text-lg font-medium`}>{(pokemon.height / 10).toFixed(1)} m</p>
                  <p className={`text-${typeColors.button} dark:text-${typeColors.textDark} text-[10px] sm:text-xs opacity-75`}>{((pokemon.height / 10) * 3.281).toFixed(1)} ft</p>
                </div>
                <div className={`${typeColors.cardBg} p-3 rounded-2xl border ${typeColors.cardBorder} shadow-lg`}>
                  <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Weight</h4>
                  <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-lg font-medium`}>{(pokemon.weight / 10).toFixed(1)} kg</p>
                  <p className={`text-${typeColors.button} dark:text-${typeColors.textDark} text-xs opacity-75`}>{((pokemon.weight / 10) * 2.205).toFixed(1)} lbs</p>
                </div>
                <div className={`${typeColors.cardBg} p-3 rounded-2xl border ${typeColors.cardBorder} shadow-lg`}>
                  <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Generation</h4>
                  <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-lg font-medium`}>Gen {generation}</p>
                </div>
              </div>

              {/* Species Info Row */}
              {species && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`${typeColors.cardBg} p-3 rounded-2xl border ${typeColors.cardBorder} shadow-lg`}>
                    <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Species</h4>
                    <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-sm capitalize`}>
                      {species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}
                    </p>
                  </div>
                  <div className={`${typeColors.cardBg} p-3 rounded-2xl border ${typeColors.cardBorder} shadow-lg`}>
                    <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Shape</h4>
                    <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-sm capitalize`}>{species.shape?.name?.replace('-', ' ') || 'Unknown'}</p>
                  </div>
                  <div className={`bg-gradient-to-br from-${typeColors.bg} to-${typeColors.glass} dark:from-${typeColors.bgDark}/30 dark:to-${typeColors.glassDark}/30 p-3 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg`}>
                    <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Habitat</h4>
                    <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-sm capitalize`}>{species.habitat?.name?.replace('-', ' ') || 'Unknown'}</p>
                  </div>
                  <div className={`${typeColors.cardBg} p-3 rounded-2xl border ${typeColors.cardBorder} shadow-lg`}>
                    <h4 className={`font-semibold text-${typeColors.text} dark:text-${typeColors.textDark} text-sm`}>Color</h4>
                    <p className={`text-${typeColors.text} dark:text-${typeColors.textDark} text-sm capitalize`}>{species.color?.name || 'Unknown'}</p>
                  </div>
                </div>
              )}

              {/* Stats Row with Visual Elements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-3 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50">
                  <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 text-sm">Base Exp</h4>
                  <p className="text-indigo-900 dark:text-indigo-100 text-lg font-medium">{pokemon.base_experience || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-3 rounded-2xl border border-violet-200/50 dark:border-violet-700/50">
                  <h4 className="font-semibold text-violet-700 dark:text-violet-300 text-sm">Base Happiness</h4>
                  <p className="text-violet-900 dark:text-violet-100 text-lg font-medium">{species?.base_happiness || 'N/A'}</p>
                </div>
                {/* Visual Catch Rate */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 col-span-1 md:col-span-2">
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-2">Catch Rate</h4>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke={species?.capture_rate > 200 ? '#10b981' : species?.capture_rate > 100 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - (species?.capture_rate || 0) / 255)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{species?.capture_rate || '?'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-medium text-sm">{species?.capture_rate ? `${((species.capture_rate / 255) * 100).toFixed(1)}%` : 'Unknown'}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">
                        {species?.capture_rate > 200 ? 'Very Easy' : 
                         species?.capture_rate > 150 ? 'Easy' :
                         species?.capture_rate > 100 ? 'Medium' :
                         species?.capture_rate > 50 ? 'Hard' :
                         species?.capture_rate > 0 ? 'Very Hard' : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Status */}
              {species && (species.is_legendary || species.is_mythical) && (
                <div className="mb-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-700/50">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300 text-lg mb-1">Category</h4>
                  <p className="text-amber-800 dark:text-amber-200 text-lg font-medium">
                    {species.is_legendary && '✨ Legendary Pokémon'}
                    {species.is_mythical && '🌟 Mythical Pokémon'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Tabs */}
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border ${typeColors.cardBorder}`}>
          <div className="p-4 md:p-6">
            <nav className="flex flex-wrap gap-2 md:gap-3">
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
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? typeColors.tabActive + ' text-white shadow-lg'
                      : `bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 ${typeColors.tabHover} border border-gray-200/50 dark:border-gray-600/50`
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 md:p-8 tab-content">
            {activeTab === 'overview' && (
              <div id="overview-content">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Overview</h3>
                
                {/* Enhanced Description with multiple entries */}
                {species?.flavor_text_entries && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">Pokédex Description</h4>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {species.flavor_text_entries
                          .find(entry => entry.language.name === 'en')
                          ?.flavor_text.replace(/\f/g, ' ') || 'No description available.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Biology Section */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-lg">Biology</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Species</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {species?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Shape</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {species?.shape?.name?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Habitat</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {species?.habitat?.name?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Color</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {species?.color?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Type Effectiveness */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3 text-lg">Type Effectiveness</h4>
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
                      <div className="space-y-3">
                        {/* Weaknesses */}
                        {(groupedEffectiveness.veryWeak.length > 0 || groupedEffectiveness.weak.length > 0) && (
                          <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                            <h5 className="text-sm font-semibold text-red-800 whitespace-nowrap">Weak to:</h5>
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
                          <div className="flex items-center gap-3 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                            <h5 className="text-sm font-semibold text-green-800 whitespace-nowrap">Resistant to:</h5>
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
                          <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2 border border-gray-300">
                            <h5 className="text-sm font-semibold text-gray-800 whitespace-nowrap">Immune to:</h5>
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

                {/* Evolution Chain */}
                <div className="evolution-display">
                  <h4 className="font-semibold text-gray-700 mb-1 text-lg">Evolution Chain</h4>
                  <div className="evolution-container">
                    <EnhancedEvolutionDisplay 
                      speciesUrl={pokemon.species.url}
                      currentPokemonId={pokemon.id}
                    />
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'stats' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side - Stats Calculator and Base Stats */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    {/* Collapsible Stats Calculator */}
                    <div className={`bg-gray-50 rounded-lg border border-gray-200 transition-all duration-300 mb-4 ${
                      showStatsCalculator ? 'shadow-md' : 'shadow-sm'
                    }`}>
                      <button
                        onClick={() => {
                          setShowStatsCalculator(!showStatsCalculator);
                          if (!hasOpenedCalculator) setHasOpenedCalculator(true);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                      >
                        <h3 className="text-lg font-bold text-gray-800">Stats Calculator</h3>
                        <div className="relative">
                          {!hasOpenedCalculator && (
                            <div className="absolute -inset-2 border-2 border-pokemon-red rounded-lg animate-pulse"></div>
                          )}
                          <div className="relative bg-white border-2 border-gray-300 rounded-lg p-1 hover:border-pokemon-red transition-colors">
                            <svg 
                              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
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
                        <div className="p-3 pt-0 space-y-3">
                          {/* Reset Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedLevel(50);
                                setSelectedNature('hardy');
                                handleNatureChange('hardy');
                              }}
                              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors font-medium"
                            >
                              Reset
                            </button>
                          </div>

                          {/* Nature Tabs */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Nature
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                              {allNatures.map((nature) => {
                                const isSelected = nature.name === selectedNature;
                                const increased = nature.increased_stat?.name;
                                const decreased = nature.decreased_stat?.name;
                                
                                return (
                                  <button
                                    key={nature.name}
                                    onClick={() => handleNatureChange(nature.name)}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-all relative ${
                                      isSelected 
                                        ? 'bg-pokemon-red text-white shadow-sm' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <div className={`capitalize text-xs ${isSelected ? 'font-bold' : ''}`}>{nature.name}</div>
                                    {increased && decreased ? (
                                      <div className="flex gap-0.5 mt-0.5 justify-center">
                                        <div className="bg-green-300 text-green-800 text-[9px] px-1 py-0.5 rounded-sm">
                                          +{increased === 'attack' ? 'Atk' :
                                            increased === 'defense' ? 'Def' :
                                            increased === 'special-attack' ? 'SpA' : 
                                            increased === 'special-defense' ? 'SpD' : 
                                            increased === 'speed' ? 'Spe' : increased.slice(0, 3)}
                                        </div>
                                        <div className="bg-red-300 text-red-900 text-[9px] px-1 py-0.5 rounded-sm">
                                          -{decreased === 'attack' ? 'Atk' :
                                            decreased === 'defense' ? 'Def' :
                                            decreased === 'special-attack' ? 'SpA' : 
                                            decreased === 'special-defense' ? 'SpD' : 
                                            decreased === 'speed' ? 'Spe' : decreased.slice(0, 3)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
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
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              <span className="text-lg font-bold">Level: {selectedLevel}</span>
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
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(selectedLevel - 1) / 99 * 100}%, #e5e7eb ${(selectedLevel - 1) / 99 * 100}%, #e5e7eb 100%)`
                                }}
                              />
                              {/* Checkpoint markers */}
                              <div className="absolute top-0 w-full flex pointer-events-none">
                                <div className="absolute left-0 w-0.5 h-2 bg-gray-400"></div>
                                <div className="absolute left-[50%] w-0.5 h-2 bg-gray-400"></div>
                                <div className="absolute left-[75%] w-0.5 h-2 bg-gray-400"></div>
                                <div className="absolute right-0 w-0.5 h-2 bg-gray-400"></div>
                              </div>
                              {/* Checkpoint labels */}
                              <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                                <span>1</span>
                                <span className="ml-[45%]">50</span>
                                <span className="ml-[20%]">75</span>
                                <span>100</span>
                              </div>
                            </div>
                          </div>

                          {natureData && (
                            <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                              <strong>{selectedNature.charAt(0).toUpperCase() + selectedNature.slice(1)}</strong>: 
                              {natureData.increased_stat && natureData.decreased_stat ? (
                                <>
                                  <span className="text-green-600 ml-1">+10% {natureData.increased_stat.name.replace('-', ' ')}</span>
                                  <span className="text-red-600 ml-1">-10% {natureData.decreased_stat.name.replace('-', ' ')}</span>
                                </>
                              ) : (
                                <span className="text-gray-500 ml-1">No stat changes</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Base Stats Chart */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">
                          {showStatsCalculator ? `Calculated Stats at Level ${selectedLevel}` : 'Base Stats'}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          // Define stat order
                          const statOrder = ['hp', 'attack', 'special-attack', 'defense', 'special-defense', 'speed'];
                          
                          // Sort stats according to our defined order
                          const sortedStats = [...pokemon.stats].sort((a, b) => {
                            return statOrder.indexOf(a.stat.name) - statOrder.indexOf(b.stat.name);
                          });
                          
                          return sortedStats.map((stat) => {
                            const statName = stat.stat.name;
                            const baseStat = stat.base_stat;
                            const calculatedStat = showStatsCalculator ? calculateStat(baseStat, statName) : baseStat;
                            const maxStat = showStatsCalculator ? (statName === 'hp' ? 714 : 658) : 255;
                            const percentage = (calculatedStat / maxStat) * 100;
                            
                            // Color coding based on calculated stat value (not base stat)
                            const valueToCheck = showStatsCalculator ? calculatedStat : baseStat;
                            let barColor = 'bg-red-400';
                            if (valueToCheck >= 150) barColor = 'bg-green-600';
                            else if (valueToCheck >= 120) barColor = 'bg-green-500';
                            else if (valueToCheck >= 100) barColor = 'bg-green-400';
                            else if (valueToCheck >= 80) barColor = 'bg-yellow-400';
                            else if (valueToCheck >= 60) barColor = 'bg-yellow-500';
                            else if (valueToCheck >= 40) barColor = 'bg-orange-400';
                            else if (valueToCheck >= 20) barColor = 'bg-red-500';
                            
                            // Check if stat is modified by nature
                            const isIncreased = showStatsCalculator && natureData?.increased_stat?.name === statName;
                            const isDecreased = showStatsCalculator && natureData?.decreased_stat?.name === statName;
                            
                            return (
                              <div key={statName} className="bg-white rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-xs font-semibold text-gray-700 capitalize">
                                    {statName === 'hp' ? 'HP' : 
                                     statName === 'special-attack' ? 'Sp. Attack' :
                                     statName === 'special-defense' ? 'Sp. Defense' :
                                     statName.replace('-', ' ')}
                                    {showStatsCalculator && isIncreased && <span className="text-green-600"> ↑</span>}
                                    {showStatsCalculator && isDecreased && <span className="text-red-600"> ↓</span>}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {showStatsCalculator && (
                                      <span className="text-[10px] text-gray-500">
                                        Base: {baseStat}
                                      </span>
                                    )}
                                    <span className="text-sm font-bold text-gray-800">
                                      {showStatsCalculator && '→ '}{calculatedStat}
                                    </span>
                                    {showStatsCalculator && (isIncreased || isDecreased) && (
                                      <span className={`text-[10px] font-medium ${
                                        isIncreased ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {isIncreased ? '+10%' : '-10%'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`${barColor} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                        
                        {/* Total Stats */}
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700">Total</span>
                            {showStatsCalculator ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500">
                                  Base: {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                  → {pokemon.stats.reduce((total, stat) => total + calculateStat(stat.base_stat, stat.stat.name), 0)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-gray-800">
                                {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                </div>

                {/* Right Side - Stats Analysis */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <h4 className="font-semibold text-gray-700 mb-4">Stats Analysis</h4>
                    <div className="space-y-4">
                      {/* Stat Rankings */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Stat Rankings</h5>
                        <div className="space-y-1 text-sm">
                          {pokemon.stats
                            .sort((a, b) => b.base_stat - a.base_stat)
                            .map((stat, index) => (
                              <div key={stat.stat.name} className="flex justify-between">
                                <span className="capitalize">
                                  {index + 1}. {stat.stat.name.replace('-', ' ')}
                                </span>
                                <span className="font-medium">{stat.base_stat}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Min/Max Stats at Level 100 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Stats at Level 100</h5>
                        <div className="text-xs text-gray-600 space-y-1">
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
                          <div className="text-xs text-gray-500 mt-2">
                            Min: 0 IV, 0 EV, Hindering nature<br/>
                            Max: 31 IV, 252 EV, Beneficial nature
                          </div>
                        </div>
                      </div>

                      {/* Type Defenses */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-700 mb-2">Defensive Stats Average</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Physical Defense</span>
                            <span className="font-medium">
                              {Math.round((pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat + 
                                          pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat) / 2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Special Defense</span>
                            <span className="font-medium">
                              {Math.round((pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat + 
                                          pokemon.stats.find(s => s.stat.name === 'special-defense')?.base_stat) / 2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Abilities</h3>
                <div className="space-y-4">
                  {pokemon.abilities.map((abilityInfo) => {
                    const abilityData = abilities[abilityInfo.ability.name];
                    return (
                      <div key={abilityInfo.ability.name} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 capitalize mb-2 text-lg">
                          {abilityInfo.ability.name.replace(/-/g, ' ')}
                          {abilityInfo.is_hidden && (
                            <span className="ml-2 text-sm text-blue-600 font-normal">(Hidden Ability)</span>
                          )}
                        </h4>
                        <p className="text-gray-600 mb-2 text-base">
                          {abilityData?.effect || 'Loading ability description...'}
                        </p>
                        {abilityData?.shortEffect && abilityData.shortEffect !== abilityData.effect && (
                          <p className="text-base text-gray-500 italic">
                            {abilityData.shortEffect}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'breeding' && species && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Breeding Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender Ratio */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Gender Ratio</h4>
                    {species.gender_rate === -1 ? (
                      <p className="text-gray-600">Genderless</p>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-600 font-medium">♂ Male</span>
                          <span className="text-gray-700">{((8 - species.gender_rate) / 8 * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-pink-600 font-medium">♀ Female</span>
                          <span className="text-gray-700">{(species.gender_rate / 8 * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mt-2 flex overflow-hidden">
                          <div className="bg-blue-500 h-4" style={{ width: `${(8 - species.gender_rate) / 8 * 100}%` }}></div>
                          <div className="bg-pink-500 h-4" style={{ width: `${species.gender_rate / 8 * 100}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Egg Groups */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Egg Groups</h4>
                    <div className="flex flex-wrap gap-2">
                      {species.egg_groups?.map(group => (
                        <span key={group.name} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                          {group.name.replace('-', ' ')}
                        </span>
                      )) || <span className="text-gray-600">No egg groups</span>}
                    </div>
                  </div>

                  {/* Hatch Counter */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Egg Cycles</h4>
                    <p className="text-gray-700 text-lg font-medium">{species.hatch_counter || 'Unknown'} cycles</p>
                    <p className="text-gray-500 text-sm">
                      {species.hatch_counter ? `${(species.hatch_counter + 1) * 255} steps` : 'Unknown steps'}
                    </p>
                  </div>

                  {/* Growth Rate */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Growth Rate</h4>
                    <p className="text-gray-700 capitalize">{species.growth_rate?.name?.replace('-', ' ') || 'Unknown'}</p>
                  </div>
                </div>

                {/* Baby Status */}
                {(species.is_baby || species.forms_switchable) && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Special Status</h4>
                    <div className="space-y-1">
                      {species.is_baby && <p className="text-gray-600">• Baby Pokémon</p>}
                      {species.forms_switchable && <p className="text-gray-600">• Has switchable forms</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'training' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Training Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* EV Yield */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">EV Yield</h4>
                    <div className="space-y-2">
                      {pokemon.stats.filter(stat => stat.effort > 0).map(stat => (
                        <div key={stat.stat.name} className="flex justify-between">
                          <span className="capitalize text-gray-700">{stat.stat.name.replace('-', ' ')}</span>
                          <span className="font-medium text-gray-900">+{stat.effort}</span>
                        </div>
                      ))}
                      {pokemon.stats.every(stat => stat.effort === 0) && (
                        <p className="text-gray-600">No EV yield</p>
                      )}
                    </div>
                  </div>

                  {/* Held Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Wild Hold Items</h4>
                    {pokemon.held_items?.length > 0 ? (
                      <div className="space-y-2">
                        {pokemon.held_items.map(item => (
                          <div key={item.item.name} className="flex justify-between">
                            <span className="capitalize text-gray-700">{item.item.name.replace('-', ' ')}</span>
                            <span className="text-gray-600 text-sm">
                              {item.version_details[0]?.rarity || 5}% chance
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No held items</p>
                    )}
                  </div>

                  {/* Base Stats Total */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Base Stat Total</h4>
                    <p className="text-3xl font-bold text-gray-900">
                      {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Combined base stats</p>
                  </div>

                  {/* Growth & Friendship */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Growth & Friendship</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Growth Rate</span>
                        <span className="capitalize font-medium">{species?.growth_rate?.name?.replace('-', ' ') || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Base Friendship</span>
                        <span className="font-medium">{species?.base_happiness || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'moves' && (
              <SimplifiedMovesDisplay moves={pokemon.moves} pokemonName={pokemon.name} />
            )}

            {activeTab === 'locations' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Location Encounters</h3>
                {locationAreaEncounters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locationAreaEncounters.map((encounter, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 capitalize mb-2">
                          {encounter.location_area.name.replace(/-/g, ' ')}
                        </h4>
                        <div className="space-y-2">
                          {encounter.version_details.map((version, vIndex) => (
                            <div key={vIndex} className="text-sm">
                              <span className="font-medium capitalize text-gray-700">
                                {version.version.name}:
                              </span>
                              <span className="text-gray-600 ml-2">
                                Max chance: {version.max_chance}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No wild encounter locations found for this Pokémon.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'entries' && species && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Pokédex Entries</h3>
                <div className="space-y-4">
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
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 capitalize mb-2">
                          {entry.version.name.replace('-', ' ')}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">{entry.text}</p>
                      </div>
                    )) || (
                    <p className="text-center text-gray-500 py-8">
                      No Pokédex entries available.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'forms' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Forms & Variants</h3>
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
            )}

            {activeTab === 'cards' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {cardType === 'tcg' ? 'TCG Cards' : 'Pocket Cards'}
                  </h3>
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => setCardType('tcg')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        cardType === 'tcg'
                          ? `bg-gradient-to-r from-${typeColors.button} to-${typeColors.buttonHover} text-white shadow-lg`
                          : `bg-${typeColors.bg} dark:bg-${typeColors.bgDark}/30 text-${typeColors.text} dark:text-${typeColors.textDark} hover:bg-${typeColors.glass} dark:hover:bg-${typeColors.glassDark}/40 border border-${typeColors.border}/50 dark:border-${typeColors.borderDark}/50`
                      }`}
                    >
                      TCG
                    </button>
                    <button
                      onClick={() => setCardType('pocket')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        cardType === 'pocket'
                          ? `bg-gradient-to-r from-${typeColors.button} to-${typeColors.buttonHover} text-white shadow-lg`
                          : `bg-${typeColors.bg} dark:bg-${typeColors.bgDark}/30 text-${typeColors.text} dark:text-${typeColors.textDark} hover:bg-${typeColors.glass} dark:hover:bg-${typeColors.glassDark}/40 border border-${typeColors.border}/50 dark:border-${typeColors.borderDark}/50`
                      }`}
                    >
                      Pocket
                    </button>
                  </div>
                </div>
                
                {cardsLoading ? (
                  <div className="py-8">
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
                        <p className="text-center text-gray-500 py-8">No TCG cards found for {pokemon?.name || 'this Pokémon'}.</p>
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
                        <p className="text-center text-gray-500 py-8">No Pocket cards found for {pokemon?.name || 'this Pokémon'}.</p>
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {pokemon.id > 1 && (
              <Link 
                href={`/pokedex/${pokemon.id - 1}`}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </Link>
            )}
          </div>
          <div>
            {pokemon.id < 1010 && (
              <Link 
                href={`/pokedex/${pokemon.id + 1}`}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
      </FullBleedWrapper>
    </div>
  );
}

// Mark this page as fullBleed
PokemonDetail.fullBleed = true;