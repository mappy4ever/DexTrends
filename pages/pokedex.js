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
import SidebarLayout from "../components/layout/SidebarLayout";

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
          <div className="max-w-md mx-auto p-6 bg-white border border-border-color rounded-lg shadow-sm">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pokemon-red flex items-center justify-center">
                  <div className="loading-spinner-lg" style={{borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white'}}></div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-dark-text">
                  Loading Pokédex
                </h3>
                <p className="text-text-grey">
                  Gathering all Pokémon data for comprehensive search...
                </p>
              </div>
              
              <div className="w-full bg-light-grey rounded-full h-2">
                <div 
                  className="bg-pokemon-red h-2 rounded-full transition-all duration-300" 
                  style={{width: `${loadingProgress}%`}}
                ></div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-grey">Progress</span>
                  <span className="font-mono text-pokemon-red font-medium">
                    {Math.round(loadingProgress * 10.1)}/1010
                  </span>
                </div>
                <span className="inline-block bg-light-grey text-dark-text text-xs px-2 py-1 rounded">
                  {loadingProgress}% Complete
                </span>
              </div>
            </div>
          </div>
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
    <PageTransition>
      <Head>
        <title>Pokédex | DexTrends</title>
        <meta name="description" content="Complete Pokédex with detailed information about all Pokémon" />
      </Head>

      <SidebarLayout
        sidebarFilters={sidebarFilters}
        onFilterChange={handleSidebarFilterChange}
        sidebarContent={
          <div className="mt-6 space-y-4">
            <div className="bg-blue-500 p-4 rounded-lg text-white text-center">
              <h4 className="font-semibold mb-2">Quick Search</h4>
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-white/20 rounded-lg text-white font-semibold hover:bg-white/30 transition-all duration-300"
              >
                Apply Filters
              </button>
            </div>
            <div className="bg-white border border-border-color p-4 rounded-lg text-center">
              <p className="text-sm text-dark-text mb-2">
                Showing {sortedAndVisiblePokemon.length} of {filteredPokemon.length}
              </p>
              <p className="text-xs text-text-grey">
                Total: {allPokemon.length}/1010
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="text-center">
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-pokemon-red">
                Pokédex
              </h1>
              <p className="text-lg text-text-grey max-w-2xl mx-auto">
                Discover detailed information about all Pokémon species, including stats, types, and evolutions.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-block bg-light-grey text-dark-text text-sm px-3 py-1 rounded-full">
                  Advanced Search
                </span>
                <span className="inline-block bg-light-grey text-dark-text text-sm px-3 py-1 rounded-full">
                  Complete Data
                </span>
                <span className="inline-block bg-light-grey text-dark-text text-sm px-3 py-1 rounded-full">
                  Real-time Filtering
                </span>
              </div>
            </div>
          </div>

          {/* Results count and stats */}
          <div className="text-center mb-6">
            <div className="bg-white border border-border-color p-4 rounded-lg">
              <div className="text-lg font-semibold text-pokemon-red mb-2">
                Showing {sortedAndVisiblePokemon.length} of {filteredPokemon.length} Pokémon
              </div>
              <div className="text-sm text-text-grey">
                Total Loaded: {allPokemon.length}/1010
              </div>
              {(pendingTypes.length > 0 || selectedType || selectedGeneration || pendingCategories.length > 0 || selectedCategory || pendingStages.length > 0 || selectedStage || searchTerm) && (
                <div className="text-sm mt-1 text-pokemon-blue">
                  {filteredPokemon.length} match your active filters
                </div>
              )}
              {visibleCount < filteredPokemon.length && (
                <div className="text-sm text-pokemon-yellow mt-2">
                  ↓ Scroll down to load more...
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Pokemon Grid - More Vertical Cards */}
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8" staggerDelay={0.05}>
            {sortedAndVisiblePokemon.map((poke, index) => (
              <StaggerItem key={poke.id}>
                <div 
                  onClick={() => handlePokemonClick(poke.id)}
                  className="group cursor-pointer bg-neutral-100 dark:bg-neutral-900 border border-border-color rounded-lg shadow-sm card-holographic hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[200px] flex flex-col relative overflow-hidden"
                >
                    {/* Large watermark Pokédex number */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-200 dark:text-gray-700 text-6xl font-bold opacity-30 select-none">
                        #{String(poke.id).padStart(3, "0")}
                      </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col text-center p-3 relative z-10">
                      {/* Larger, more vertical image container with consistent background */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-3 overflow-hidden">
                        <Image
                          src={poke.sprite || "/dextrendslogo.png"}
                          alt={poke.name}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                          sizes="(max-width: 640px) 96px, 112px"
                        />
                        {/* Subtle glow effect for legendary/mythical */}
                        {(poke.isLegendary || poke.isMythical) && (
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-purple-400/20 rounded-xl"></div>
                        )}
                      </div>
                      
                      {/* Pokemon number */}
                      <p className="text-xs text-text-grey mb-1 font-mono">
                        #{String(poke.id).padStart(3, "0")}
                      </p>
                      
                      {/* Pokemon name with better typography using Montserrat */}
                      <h3 className="font-pokemon font-black text-base sm:text-lg capitalize text-dark-text dark:text-white mb-3 group-hover:text-pokemon-red transition-colors line-clamp-1">
                        {poke.name.replace("-", " ")}
                      </h3>
                      
                      {/* Types with better spacing */}
                      <div className="flex justify-center gap-1 mb-2">
                        {poke.types.map(type => (
                          <TypeBadge key={type} type={type} size="sm" />
                        ))}
                      </div>

                      {/* Special indicators for legendary/mythical */}
                      {(poke.isLegendary || poke.isMythical || poke.isUltraBeast) && (
                        <div className="flex justify-center">
                          {poke.isLegendary && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              ⭐ Legendary
                            </span>
                          )}
                          {poke.isMythical && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                              ✨ Mythical
                            </span>
                          )}
                          {poke.isUltraBeast && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                              🌌 Ultra Beast
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 text-text-grey">
                <div className="loading-spinner-sm"></div>
                <span>Loading more Pokémon...</span>
              </div>
            </div>
          )}
          
          {/* No results message */}
          {filteredPokemon.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto bg-white border border-border-color rounded-lg p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-dark-text">
                    No Pokémon Found
                  </h3>
                  <p className="text-text-grey">
                    No Pokémon match your current search criteria. Try adjusting your filters.
                  </p>
                  <button 
                    onClick={clearAllFilters} 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarLayout>
    </PageTransition>
  );
}