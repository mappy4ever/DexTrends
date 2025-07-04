import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchData } from "../utils/apiutils";
import { TypeBadge } from "../components/ui/TypeBadge";
import { getGeneration } from "../utils/pokemonutils";
import PokeballLoader from "../components/ui/PokeballLoader";

export default function PokedexIndex() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleCount, setVisibleCount] = useState(48);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  
  // New states for search-triggered filtering
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [pendingTypes, setPendingTypes] = useState([]);
  const [pendingGeneration, setPendingGeneration] = useState("");
  const [pendingCategories, setPendingCategories] = useState([]);
  const [pendingStages, setPendingStages] = useState([]);
  const [pendingSortBy, setPendingSortBy] = useState("id");

  // Handle search trigger
  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
    setSelectedType(pendingTypes.length === 1 ? pendingTypes[0] : ""); // For backward compatibility
    setSelectedGeneration(pendingGeneration);
    setSelectedCategory(pendingCategories.length === 1 ? pendingCategories[0] : ""); // For backward compatibility
    setSelectedStage(pendingStages.length === 1 ? pendingStages[0] : ""); // For backward compatibility
    setSortBy(pendingSortBy);
    setVisibleCount(48); // Reset pagination
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPendingSearchTerm("");
    setPendingTypes([]);
    setPendingGeneration("");
    setPendingCategories([]);
    setPendingStages([]);
    setPendingSortBy("id");
    setSearchTerm("");
    setSelectedType("");
    setSelectedGeneration("");
    setSelectedCategory("");
    setSelectedStage("");
    setSortBy("id");
    setVisibleCount(48);
  };

  // Helper functions for interactive selections
  const toggleType = (type) => {
    setPendingTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleCategory = (category) => {
    setPendingCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStage = (stage) => {
    setPendingStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  // Handle Pokemon card click
  const handlePokemonClick = (pokemonId) => {
    router.push(`/pokedex/${pokemonId}`);
  };

  // Enhanced Pokemon data with additional properties
  const enhancePokemonData = (details, speciesData = null) => {
    const generation = getGeneration(details.id);
    const isLegendary = speciesData?.is_legendary || false;
    const isMythical = speciesData?.is_mythical || false;
    const isUltraBeast = speciesData?.genera?.some(g => g.genus.toLowerCase().includes('ultra beast')) || false;
    
    // Determine evolution stage based on evolution chain position
    let stage = 1; // Default to first stage
    if (details.name.includes('-mega') || details.name.includes('-gmax')) {
      stage = 'mega';
    } else if (isLegendary || isMythical) {
      stage = 'legendary';
    }
    
    return {
      id: details.id,
      name: details.name,
      types: details.types.map(t => t.type.name),
      sprite: details.sprites?.other?.["official-artwork"]?.front_default || details.sprites?.front_default,
      height: details.height,
      weight: details.weight,
      generation,
      isLegendary,
      isMythical,
      isUltraBeast,
      stage,
      baseStats: details.stats.reduce((acc, stat) => acc + stat.base_stat, 0),
    };
  };

  // Load all Pokemon progressively with enhanced data
  useEffect(() => {
    const fetchPokemonBatch = async (start, count) => {
      try {
        const promises = [];
        for (let i = start; i < start + count && i <= 1010; i++) {
          promises.push(
            fetchData(`https://pokeapi.co/api/v2/pokemon/${i}`)
              .then(async details => {
                try {
                  const speciesData = await fetchData(details.species.url);
                  return enhancePokemonData(details, speciesData);
                } catch {
                  return enhancePokemonData(details);
                }
              })
              .catch(err => {
                // Error fetching pokemon
                return {
                  id: i,
                  name: `pokemon-${i}`,
                  types: [],
                  sprite: "/dextrendslogo.png",
                  height: 0,
                  weight: 0,
                  generation: getGeneration(i),
                  isLegendary: false,
                  isMythical: false,
                  isUltraBeast: false,
                  stage: 1,
                  baseStats: 0,
                };
              })
          );
        }
        return Promise.all(promises);
      } catch (err) {
        // Batch fetch error
        return [];
      }
    };

    const loadAllPokemon = async () => {
      setLoading(true);
      try {
        // Load all Pokemon in batches to avoid overwhelming the API
        const totalPokemon = 1010;
        const batchSize = 50;
        let allPokemonData = [];
        
        for (let start = 1; start <= totalPokemon; start += batchSize) {
          const count = Math.min(batchSize, totalPokemon - start + 1);
          const batch = await fetchPokemonBatch(start, count);
          allPokemonData = [...allPokemonData, ...batch];
          
          // Update progress
          const progress = Math.round((start + count - 1) / totalPokemon * 100);
          setLoadingProgress(progress);
          
          // Update allPokemon but only show first 48 initially
          setAllPokemon([...allPokemonData]);
          if (allPokemonData.length <= 48) {
            setPokemon([...allPokemonData]);
          }
          
          // Small delay to prevent API overload
          if (start + batchSize <= totalPokemon) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // After loading regular Pokemon, fetch mega evolutions
        const megaEvolutions = await fetchMegaEvolutions();
        allPokemonData = [...allPokemonData, ...megaEvolutions];
        
        // Store all Pokemon data and make it available for scrolling
        setAllPokemon(allPokemonData);
        setPokemon(allPokemonData);
      } catch (err) {
        setError("Failed to load Pokédex data");
      } finally {
        setLoading(false);
      }
    };

    loadAllPokemon();
  }, []);

  // Fetch mega evolutions separately
  const fetchMegaEvolutions = async () => {
    const megaForms = [];
    const megaPokemon = [
      { id: 10033, name: 'venusaur-mega' },
      { id: 10034, name: 'charizard-mega-x' },
      { id: 10035, name: 'charizard-mega-y' },
      { id: 10036, name: 'blastoise-mega' },
      { id: 10037, name: 'alakazam-mega' },
      { id: 10038, name: 'gengar-mega' },
      { id: 10039, name: 'kangaskhan-mega' },
      { id: 10040, name: 'pinsir-mega' },
      { id: 10041, name: 'gyarados-mega' },
      { id: 10042, name: 'aerodactyl-mega' },
      { id: 10043, name: 'mewtwo-mega-x' },
      { id: 10044, name: 'mewtwo-mega-y' },
      { id: 10045, name: 'ampharos-mega' },
      { id: 10046, name: 'scizor-mega' },
      { id: 10047, name: 'heracross-mega' },
      { id: 10048, name: 'houndoom-mega' },
      { id: 10049, name: 'tyranitar-mega' },
      { id: 10050, name: 'blaziken-mega' },
      { id: 10051, name: 'gardevoir-mega' },
      { id: 10052, name: 'mawile-mega' },
      { id: 10053, name: 'aggron-mega' },
      { id: 10054, name: 'medicham-mega' },
      { id: 10055, name: 'manectric-mega' },
      { id: 10056, name: 'banette-mega' },
      { id: 10057, name: 'absol-mega' },
      { id: 10058, name: 'garchomp-mega' },
      { id: 10059, name: 'lucario-mega' },
      { id: 10060, name: 'abomasnow-mega' },
      { id: 10062, name: 'beedrill-mega' },
      { id: 10063, name: 'pidgeot-mega' },
      { id: 10064, name: 'slowbro-mega' },
      { id: 10065, name: 'steelix-mega' },
      { id: 10066, name: 'sceptile-mega' },
      { id: 10067, name: 'swampert-mega' },
      { id: 10068, name: 'sableye-mega' },
      { id: 10069, name: 'sharpedo-mega' },
      { id: 10070, name: 'camerupt-mega' },
      { id: 10071, name: 'altaria-mega' },
      { id: 10072, name: 'glalie-mega' },
      { id: 10073, name: 'salamence-mega' },
      { id: 10074, name: 'metagross-mega' },
      { id: 10075, name: 'latias-mega' },
      { id: 10076, name: 'latios-mega' },
      { id: 10077, name: 'lopunny-mega' },
      { id: 10078, name: 'gallade-mega' },
      { id: 10079, name: 'audino-mega' },
      { id: 10087, name: 'diancie-mega' },
      { id: 10090, name: 'rayquaza-mega' }
    ];

    for (const mega of megaPokemon) {
      try {
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${mega.id}`);
        const speciesData = await fetchData(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        megaForms.push(enhancedData);
      } catch (err) {
        console.error(`Failed to fetch mega evolution: ${mega.name}`, err);
      }
    }

    return megaForms;
  };

  // Enhanced filtering with multiple criteria and multi-select support
  const filteredPokemon = useMemo(() => {
    // Always use the full pokemon dataset for filtering
    const dataToFilter = pokemon;
    
    return dataToFilter.filter(poke => {
      const matchesSearch = poke.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // AND logic for types: Pokemon must have ALL selected types
      const activeTypes = pendingTypes.length > 0 ? pendingTypes : (selectedType ? [selectedType] : []);
      const matchesType = activeTypes.length === 0 || activeTypes.every(type => poke.types.includes(type));
      
      const matchesGeneration = !selectedGeneration || poke.generation === parseInt(selectedGeneration);
      
      // AND logic for categories: Pokemon must match ALL selected categories
      const activeCategories = pendingCategories.length > 0 ? pendingCategories : (selectedCategory ? [selectedCategory] : []);
      let matchesCategory = true;
      if (activeCategories.length > 0) {
        matchesCategory = activeCategories.every(category => {
          if (category === 'legendary') return poke.isLegendary;
          if (category === 'mythical') return poke.isMythical;
          if (category === 'ultra-beast') return poke.isUltraBeast;
          if (category === 'mega') return poke.stage === 'mega' || poke.name.includes('-mega');
          if (category === 'normal') return !poke.isLegendary && !poke.isMythical && !poke.isUltraBeast && poke.stage !== 'mega';
          if (category === 'multi-type') return poke.types.length > 1;
          if (category === 'single-type') return poke.types.length === 1;
          return false;
        });
      }
      
      // AND logic for stages: Pokemon must match ALL selected stages
      const activeStages = pendingStages.length > 0 ? pendingStages : (selectedStage ? [selectedStage] : []);
      let matchesStage = true;
      if (activeStages.length > 0) {
        matchesStage = activeStages.every(stage => {
          if (stage === 'first') return poke.stage === 1;
          if (stage === 'evolved') return poke.stage > 1 && poke.stage !== 'mega' && poke.stage !== 'legendary';
          if (stage === 'mega') return poke.stage === 'mega';
          if (stage === 'legendary') return poke.stage === 'legendary';
          return false;
        });
      }
      
      return matchesSearch && matchesType && matchesGeneration && matchesCategory && matchesStage;
    });
  }, [pokemon, searchTerm, selectedType, selectedGeneration, selectedCategory, selectedStage, pendingTypes, pendingCategories, pendingStages]);

  // Infinite scroll functionality
  const loadMoreVisible = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 48, filteredPokemon.length));
  }, [filteredPokemon.length]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleCount < filteredPokemon.length && !isLoadingMore) {
          setIsLoadingMore(true);
          // Small delay to prevent multiple rapid calls
          setTimeout(() => {
            loadMoreVisible();
            setIsLoadingMore(false);
          }, 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredPokemon.length, isLoadingMore, loadMoreVisible]);

  // Enhanced sorting and pagination
  const sortedAndVisiblePokemon = useMemo(() => {
    let sorted = [...filteredPokemon];
    
    // Apply sorting
    switch (sortBy) {
      case 'id':
        sorted.sort((a, b) => a.id - b.id);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        sorted.sort((a, b) => a.types[0].localeCompare(b.types[0]));
        break;
      case 'generation':
        sorted.sort((a, b) => a.generation - b.generation);
        break;
      case 'stats':
        sorted.sort((a, b) => b.baseStats - a.baseStats);
        break;
      case 'height':
        sorted.sort((a, b) => b.height - a.height);
        break;
      case 'weight':
        sorted.sort((a, b) => b.weight - a.weight);
        break;
      default:
        break;
    }
    
    return sorted.slice(0, visibleCount);
  }, [filteredPokemon, sortBy, visibleCount]);

  // Filter options
  const pokemonTypes = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];
  
  const generations = [
    { value: "1", label: "Generation I" },
    { value: "2", label: "Generation II" },
    { value: "3", label: "Generation III" },
    { value: "4", label: "Generation IV" },
    { value: "5", label: "Generation V" },
    { value: "6", label: "Generation VI" },
    { value: "7", label: "Generation VII" },
    { value: "8", label: "Generation VIII" },
    { value: "9", label: "Generation IX" }
  ];
  
  const categories = [
    { value: "legendary", label: "Legendary" },
    { value: "mythical", label: "Mythical" },
    { value: "ultra-beast", label: "Ultra Beast" },
    { value: "mega", label: "Mega Evolution" },
    { value: "normal", label: "Normal Pokémon" },
    { value: "multi-type", label: "Multi-Type" },
    { value: "single-type", label: "Single-Type" }
  ];
  
  const stages = [
    { value: "first", label: "First Stage" },
    { value: "evolved", label: "Evolved" },
    { value: "mega", label: "Mega Evolution" },
    { value: "legendary", label: "Legendary/Mythical" }
  ];
  
  const sortOptions = [
    { value: "id", label: "Pokédex Number" },
    { value: "name", label: "Name" },
    { value: "type", label: "Primary Type" },
    { value: "generation", label: "Generation" },
    { value: "stats", label: "Total Base Stats" },
    { value: "height", label: "Height" },
    { value: "weight", label: "Weight" }
  ];

  if (loading) {
    return (
      <>
        <Head>
          <title>Pokédex | DexTrends</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              {/* Pokeball animation */}
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="w-24 h-24 border-8 border-gray-200 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 rounded-t-full"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white rounded-b-full border-t-4 border-gray-800"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-gray-800 rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Pokédex...</h2>
              <p className="text-gray-600 mb-4">
                Gathering Pokemon data from all regions
              </p>
              
              {/* Progress bar */}
              {loadingProgress > 0 && (
                <div className="max-w-xs mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loading Pokemon {Math.ceil((loadingProgress / 100) * 1010)} of 1010
                  </p>
                </div>
              )}
              
              {/* Fun facts */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Did you know?</h3>
                  <p className="text-sm text-gray-600">
                    {loadingProgress < 25 && "There are over 1,000 different Pokémon species across all generations!"}
                    {loadingProgress >= 25 && loadingProgress < 50 && "The first Pokémon games were released in 1996 in Japan."}
                    {loadingProgress >= 50 && loadingProgress < 75 && "Pikachu wasn't originally planned to be the franchise mascot!"}
                    {loadingProgress >= 75 && "Each Pokémon has unique stats, types, and abilities that make them special."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-12 text-center">
        <Head>
          <title>Pokédex | DexTrends</title>
        </Head>
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Sidebar filter configuration
  const sidebarFilters = [
    {
      id: 'search',
      type: 'search',
      label: 'Search Pokémon',
      placeholder: 'Search by name...',
      value: pendingSearchTerm,
    },
    {
      id: 'generation',
      type: 'select',
      label: 'Generation',
      placeholder: 'All Generations',
      value: pendingGeneration,
      options: generations,
    },
    {
      id: 'types',
      type: 'types',
      label: 'Types',
      value: pendingTypes,
    },
    {
      id: 'categories',
      type: 'multiselect',
      label: 'Categories',
      value: pendingCategories,
      options: categories,
    },
    {
      id: 'stages',
      type: 'multiselect',
      label: 'Evolution Stages',
      value: pendingStages,
      options: stages,
    },
    {
      id: 'sort',
      type: 'select',
      label: 'Sort By',
      value: pendingSortBy,
      options: sortOptions,
    },
  ];

  const handleSidebarFilterChange = (filterId, value) => {
    switch (filterId) {
      case 'search':
        setPendingSearchTerm(value);
        break;
      case 'generation':
        setPendingGeneration(value);
        break;
      case 'types':
        setPendingTypes(value);
        break;
      case 'categories':
        setPendingCategories(value);
        break;
      case 'stages':
        setPendingStages(value);
        break;
      case 'sort':
        setPendingSortBy(value);
        break;
    }
  };

  return (
    <div>
      <Head>
        <title>Pokédex | DexTrends</title>
        <meta name="description" content="Complete Pokédex with detailed information about all Pokémon" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-pokemon-red mb-4">
            Pokédex
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Discover detailed information about all Pokémon species, including stats, types, and evolutions.
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
              Advanced Search
            </span>
            <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
              Complete Data
            </span>
            <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
              Real-time Filtering
            </span>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Pokémon</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={pendingSearchTerm}
                onChange={(e) => setPendingSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pokemon-red focus:border-transparent"
              />
            </div>

            {/* Generation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Generation</label>
              <select
                value={pendingGeneration}
                onChange={(e) => setPendingGeneration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pokemon-red focus:border-transparent"
              >
                <option value="">All Generations</option>
                {generations.map(gen => (
                  <option key={gen.value} value={gen.value}>{gen.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={pendingSortBy}
                onChange={(e) => setPendingSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pokemon-red focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Search & Clear Buttons */}
            <div className="flex items-end gap-2">
              <button 
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-pokemon-red text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Apply Filters
              </button>
              <button 
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Type Filters */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Types (click to toggle)</label>
            <div className="flex flex-wrap gap-2">
              {pokemonTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    pendingTypes.includes(type)
                      ? 'ring-2 ring-pokemon-red ring-offset-1'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <TypeBadge type={type} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => toggleCategory(category.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                    pendingCategories.includes(category.value)
                      ? 'bg-pokemon-red text-white border-pokemon-red'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pokemon-red'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Evolution Stages */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Evolution Stages</label>
            <div className="flex flex-wrap gap-2">
              {stages.map(stage => (
                <button
                  key={stage.value}
                  onClick={() => toggleStage(stage.value)}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                    pendingStages.includes(stage.value)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seamless results indicator */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-3 text-sm text-gray-500">
            <span>
              Showing <span className="font-medium text-gray-700">{sortedAndVisiblePokemon.length}</span> of <span className="font-medium text-gray-700">{filteredPokemon.length}</span> Pokémon
            </span>
            {allPokemon.length < 1025 && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs">
                  {allPokemon.length}/1025 loaded
                </span>
              </>
            )}
            {(pendingTypes.length > 0 || selectedType || selectedGeneration || pendingCategories.length > 0 || selectedCategory || pendingStages.length > 0 || selectedStage || searchTerm) && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-blue-600">
                  Filtered
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pokemon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
          {sortedAndVisiblePokemon.map((poke) => (
            <div 
              key={poke.id}
              onClick={() => handlePokemonClick(poke.id)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[200px] flex flex-col relative overflow-hidden"
            >
              {/* Pokemon number */}
              <div className="absolute top-2 right-2 z-20">
                <span className="text-sm font-mono font-bold text-gray-500">
                  #{String(poke.id).padStart(3, "0")}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col text-center p-3 relative z-10">
                {/* Pokemon image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 bg-transparent rounded-xl p-3 overflow-hidden">
                  <Image
                    src={poke.sprite || "/dextrendslogo.png"}
                    alt={poke.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 640px) 96px, 112px"
                  />
                </div>
                
                {/* Pokemon name */}
                <h3 className="font-bold text-base sm:text-lg capitalize text-gray-800 mb-3 group-hover:text-pokemon-red transition-colors">
                  {poke.name.replace("-", " ")}
                </h3>
                
                {/* Types */}
                <div className="flex justify-center gap-1 mb-2">
                  {poke.types.map(type => (
                    <TypeBadge key={type} type={type} size="sm" />
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Seamless loading indicator */}
        {visibleCount < filteredPokemon.length && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-500">Loading more...</span>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {filteredPokemon.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No Pokémon found matching your search.</p>
            <button 
              onClick={clearAllFilters} 
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105">
              🧹 Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}