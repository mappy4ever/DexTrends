import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchData } from "../utils/apiutils";
import { FadeIn, SlideUp } from "../components/ui/animations";
import { TypeBadge } from "../components/ui/TypeBadge";
import { getGeneration } from "../utils/pokemonutils";
import { 
  GlassCard, 
  PremiumButton, 
  PremiumInput, 
  PremiumProgress,
  PremiumBadge 
} from "../components/ui/PremiumComponents";
import { 
  PageTransition, 
  StaggerContainer, 
  StaggerItem, 
  HoverCard,
  RevealElement 
} from "../components/ui/AnimationSystem";

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
                console.error(`Error fetching pokemon ${i}:`, err);
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
        console.error("Batch fetch error:", err);
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
          if (category === 'normal') return !poke.isLegendary && !poke.isMythical && !poke.isUltraBeast;
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
      <PageTransition>
        <div className="container max-w-6xl mx-auto py-12 text-center min-h-screen flex items-center justify-center">
          <Head>
            <title>Pokédex | DexTrends</title>
          </Head>
          <GlassCard className="max-w-md mx-auto animate-scale-in" elevated>
            <div className="space-y-6">
              <div className="animate-pulse-scale">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                  <div className="animate-rotate">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  Loading Pokédex
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gathering all Pokémon data for comprehensive search...
                </p>
              </div>
              
              <PremiumProgress 
                value={loadingProgress} 
                max={100} 
                variant="primary"
                size="lg"
                animated
                showLabel
              />
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-mono text-primary font-medium">
                    {Math.round(loadingProgress * 10.1)}/1010
                  </span>
                </div>
                <PremiumBadge variant="glass" size="sm" className="animate-pulse-scale">
                  {loadingProgress}% Complete
                </PremiumBadge>
              </div>
            </div>
          </GlassCard>
        </div>
      </PageTransition>
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

  return (
    <PageTransition>
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Head>
          <title>Pokédex | DexTrends</title>
          <meta name="description" content="Complete Pokédex with detailed information about all Pokémon" />
        </Head>

        <RevealElement className="text-center">
          <div className="space-y-4 mb-8">
            <h1 className="font-display text-5xl md:text-6xl font-black animate-slide-in-top">
              Pokédex
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-slide-in-bottom delay-200">
              Discover detailed information about all Pokémon species, including stats, types, and evolutions.
            </p>
            <div className="flex items-center justify-center gap-2 animate-slide-in-bottom delay-300">
              <PremiumBadge variant="glass" glow>
                🔍 Advanced Search
              </PremiumBadge>
              <PremiumBadge variant="glass" glow>
                📊 Complete Data
              </PremiumBadge>
              <PremiumBadge variant="glass" glow>
                ⚡ Real-time Filtering
              </PremiumBadge>
            </div>
          </div>
        </RevealElement>

        {/* Enhanced Search and Filter Controls */}
        <RevealElement delay={0.4}>
          <GlassCard className="space-y-6" elevated>
            <div className="flex flex-col gap-6">
              {/* Main Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <PremiumInput
                  type="text"
                  placeholder="Search Pokémon..."
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-80"
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={pendingSortBy}
                    onChange={(e) => setPendingSortBy(e.target.value)}
                    className="glass rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none pr-10 min-w-[200px]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        Sort by {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Search Button */}
                <PremiumButton
                  onClick={handleSearch}
                  variant="success"
                  glow
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Pokémon
                </PremiumButton>
                
                {/* Advanced Filters Toggle */}
                <PremiumButton
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant="glass"
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </PremiumButton>
              </div>
            
            {/* Interactive Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🎯 Click to select multiple options, then hit <strong className="text-green-600">Search</strong> to apply
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Selected Filters Summary */}
                  {(pendingTypes.length > 0 || pendingCategories.length > 0 || pendingStages.length > 0 || pendingGeneration) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Selected Filters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {pendingTypes.map(type => (
                          <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                            <TypeBadge type={type} size="sm" className="!px-1 !py-0" />
                            <button onClick={() => toggleType(type)} className="hover:text-red-600">×</button>
                          </span>
                        ))}
                        {pendingCategories.map(cat => (
                          <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                            {categories.find(c => c.value === cat)?.label}
                            <button onClick={() => toggleCategory(cat)} className="hover:text-red-600">×</button>
                          </span>
                        ))}
                        {pendingStages.map(stage => (
                          <span key={stage} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-xs">
                            {stages.find(s => s.value === stage)?.label}
                            <button onClick={() => toggleStage(stage)} className="hover:text-red-600">×</button>
                          </span>
                        ))}
                        {pendingGeneration && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                            {generations.find(g => g.value === pendingGeneration)?.label}
                            <button onClick={() => setPendingGeneration("")} className="hover:text-red-600">×</button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pokemon Types - Interactive Badge Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      🔥 Pokemon Types (click to select multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {pokemonTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`transition-all duration-200 transform hover:scale-105 ${
                            pendingTypes.includes(type) 
                              ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' 
                              : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <TypeBadge type={type} size="md" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generation - Single Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      🎮 Generation (select one)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generations.map(gen => (
                        <button
                          key={gen.value}
                          onClick={() => setPendingGeneration(pendingGeneration === gen.value ? "" : gen.value)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                            pendingGeneration === gen.value
                              ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {gen.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories - Multi Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      ⭐ Categories (click to select multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => toggleCategory(cat.value)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                            pendingCategories.includes(cat.value)
                              ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evolution Stages - Multi Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      🔄 Evolution Stages (click to select multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {stages.map(stage => (
                        <button
                          key={stage.value}
                          onClick={() => toggleStage(stage.value)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                            pendingStages.includes(stage.value)
                              ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-300'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                  >
                    🗑️ Clear All
                  </button>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(pendingTypes.length + pendingCategories.length + pendingStages.length + (pendingGeneration ? 1 : 0))} filters selected
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    🔍 Search Pokemon
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results count and stats */}
          <div className="text-center text-gray-600 dark:text-gray-400 space-y-1">
            <div>
              Showing {sortedAndVisiblePokemon.length} of {filteredPokemon.length} Pokémon
              <span className="ml-2 text-sm">
                ({allPokemon.length}/1010 total loaded)
              </span>
            </div>
            {(pendingTypes.length > 0 || selectedType || selectedGeneration || pendingCategories.length > 0 || selectedCategory || pendingStages.length > 0 || selectedStage || searchTerm) && (
              <div className="text-sm">
                {filteredPokemon.length} match your filters out of {allPokemon.length} total
              </div>
            )}
            {visibleCount < filteredPokemon.length && (
              <div className="text-sm text-primary">
                Scroll down to load more...
              </div>
            )}
            </div>
          </GlassCard>
        </RevealElement>
        {/* Enhanced Pokemon Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8" staggerDelay={0.05}>
          {sortedAndVisiblePokemon.map((poke, index) => (
            <StaggerItem key={poke.id}>
              <HoverCard 
                onClick={() => handlePokemonClick(poke.id)}
                className="group cursor-pointer"
                scale={1.03}
                y={-6}
              >
                <GlassCard 
                  className="p-4 hover-lift interactive border border-glass-border hover:border-primary/20 transition-all duration-300"
                  hoverable
                >
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <Image
                      src={poke.sprite || "/dextrendslogo.png"}
                      alt={poke.name}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                      sizes="96px"
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg capitalize text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                    {poke.name.replace("-", " ")}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    #{String(poke.id).padStart(3, "0")}
                  </p>
                  
                  {/* Types */}
                  <div className="flex justify-center gap-1 mb-2">
                    {poke.types.map(type => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                  
                  {/* Enhanced stats */}
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Height: {(poke.height / 10).toFixed(1)}m</div>
                    <div>Weight: {(poke.weight / 10).toFixed(1)}kg</div>
                    {poke.baseStats > 0 && (
                      <div>BST: {poke.baseStats}</div>
                    )}
                    <div className="flex justify-center gap-1 mt-1">
                      <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded">
                        Gen {poke.generation}
                      </span>
                      {poke.isLegendary && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs px-1.5 py-0.5 rounded">
                          L
                        </span>
                      )}
                      {poke.isMythical && (
                        <span className="inline-block bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-1.5 py-0.5 rounded">
                          M
                        </span>
                      )}
                      {poke.isUltraBeast && (
                        <span className="inline-block bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs px-1.5 py-0.5 rounded">
                          UB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                </GlassCard>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading more Pokémon...</span>
            </div>
          </div>
        )}

        {filteredPokemon.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No Pokémon found matching your criteria
            </p>
          </div>
        )}
        
        {/* No results message */}
        {filteredPokemon.length === 0 && !loading && (
          <RevealElement className="text-center py-12">
            <GlassCard className="max-w-md mx-auto">
              <div className="space-y-4">
                <div className="text-6xl animate-bounce-gentle">🔍</div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  No Pokémon Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No Pokémon match your current search criteria. Try adjusting your filters.
                </p>
                <PremiumButton onClick={clearAllFilters} variant="glass">
                  Clear All Filters
                </PremiumButton>
              </div>
            </GlassCard>
          </RevealElement>
        )}
      </div>
    </PageTransition>
  );
}