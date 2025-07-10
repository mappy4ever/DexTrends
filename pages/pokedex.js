import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchData } from "../utils/apiutils";
import { TypeBadge } from "../components/ui/TypeBadge";
import { getGeneration } from "../utils/pokemonutils";
import PokeballLoader from "../components/ui/PokeballLoader";
import { FullBleedWrapper } from "../components/ui/FullBleedWrapper";

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // New states for search-triggered filtering
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [pendingTypes, setPendingTypes] = useState([]);
  const [pendingGeneration, setPendingGeneration] = useState("");
  const [pendingCategories, setPendingCategories] = useState([]);
  const [pendingStages, setPendingStages] = useState([]);
  const [pendingSortBy, setPendingSortBy] = useState("id");
  const searchTimeoutRef = useRef(null);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(pendingSearchTerm);
      setVisibleCount(48);
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [pendingSearchTerm]);

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

  // Handle sort change with immediate effect
  const handleSortChange = (newSort) => {
    setPendingSortBy(newSort);
    setSortBy(newSort);
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
    setPendingTypes(prev => {
      let newTypes;
      
      if (prev.includes(type)) {
        // Remove the type if already selected
        newTypes = prev.filter(t => t !== type);
      } else {
        // Add the type if under limit of 2
        if (prev.length < 2) {
          newTypes = [...prev, type];
        } else {
          // If already 2 types selected, don't add more
          return prev;
        }
      }
      
      // Auto-apply type filter
      setSelectedType(newTypes.length === 1 ? newTypes[0] : "");
      setVisibleCount(48);
      
      return newTypes;
    });
  };

  const toggleCategory = (category) => {
    setPendingCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStage = (stage) => {
    setPendingStages(prev => {
      const newStages = prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage];
      
      // Auto-apply stage filter
      setSelectedStage(newStages.length === 1 ? newStages[0] : "");
      setVisibleCount(48);
      
      return newStages;
    });
  };

  // Helper function to check if a Pokemon is a starter
  const checkIfStarter = (id) => {
    const starterIds = [
      1, 4, 7,       // Gen 1: Bulbasaur, Charmander, Squirtle
      152, 155, 158, // Gen 2: Chikorita, Cyndaquil, Totodile
      252, 255, 258, // Gen 3: Treecko, Torchic, Mudkip
      387, 390, 393, // Gen 4: Turtwig, Chimchar, Piplup
      495, 498, 501, // Gen 5: Snivy, Tepig, Oshawott
      650, 653, 656, // Gen 6: Chespin, Fennekin, Froakie
      722, 725, 728, // Gen 7: Rowlet, Litten, Popplio
      810, 813, 816, // Gen 8: Grookey, Scorbunny, Sobble
      906, 909, 912  // Gen 9: Sprigatito, Fuecoco, Quaxly
    ];
    return starterIds.includes(id);
  };

  // Helper function to check if a Pokemon is a baby
  const checkIfBaby = (id) => {
    const babyIds = [
      172, 173, 174, 175, 236, 238, 239, 240, 298, 360, // Gen 2 babies
      433, 438, 439, 440, 446, 447, 458, // Gen 4 babies
      848 // Toxel (Gen 8)
    ];
    return babyIds.includes(id);
  };

  // Helper function to check if a Pokemon has multiple evolution paths
  const checkIfMultiEvo = (id) => {
    const multiEvoIds = [
      133, // Eevee
      236, // Tyrogue
      265, // Wurmple
      280, 281, // Ralts, Kirlia
      361, // Snorunt
      412, // Burmy
      415, // Combee (female only)
      443, // Gible line (not really multi, but including for Garchomp)
      521, // Unfezant (gender differences)
      678, // Meowstic (gender forms)
      856, // Hatenna line (female only evolution)
      758  // Salazzle (female only)
    ];
    return multiEvoIds.includes(id);
  };

  // Helper function to check if a Pokemon is a regional variant
  const checkIfRegionalVariant = (name, id) => {
    // First check by ID (most reliable)
    if (checkIfRegionalById(id)) return true;
    
    // Check for various naming patterns used by the API
    const lowerName = name.toLowerCase();
    // The API uses hyphens in names
    return lowerName.includes('-alola') || 
           lowerName.includes('-galar') || 
           lowerName.includes('-hisui') || 
           lowerName.includes('-paldea') ||
           lowerName.includes('alolan') ||
           lowerName.includes('galarian') ||
           lowerName.includes('hisuian') ||
           lowerName.includes('paldean');
  };

  // Helper function to check regional variants by ID
  const checkIfRegionalById = (id) => {
    // Alolan forms: 10091-10115, 10123-10126
    // Galarian forms: 10158-10184
    // Hisuian forms: 10221-10249
    // Paldean forms: 10250+
    return (id >= 10091 && id <= 10115) || 
           (id >= 10123 && id <= 10126) ||
           (id >= 10158 && id <= 10184) ||
           (id >= 10221 && id <= 10249) ||
           (id >= 10250 && id <= 10271);
  };

  // Helper function to check if a Pokemon is an Ultra Beast
  const checkIfUltraBeast = (id, name) => {
    const ultraBeastIds = [
      793, 794, 795, 796, 797, 798, 799, // Gen 7 UBs
      803, 804, 805, 806 // Poipole, Naganadel, Stakataka, Blacephalon
    ];
    const lowerName = name.toLowerCase();
    return ultraBeastIds.includes(id) || 
           lowerName.includes('buzzwole') ||
           lowerName.includes('pheromosa') ||
           lowerName.includes('xurkitree') ||
           lowerName.includes('celesteela') ||
           lowerName.includes('kartana') ||
           lowerName.includes('guzzlord') ||
           lowerName.includes('nihilego') ||
           lowerName.includes('poipole') ||
           lowerName.includes('naganadel') ||
           lowerName.includes('stakataka') ||
           lowerName.includes('blacephalon');
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
        for (let i = start; i < start + count && i <= 1025; i++) {
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
        
        // Fetch regional variants
        const regionalVariants = await fetchRegionalVariants();
        allPokemonData = [...allPokemonData, ...regionalVariants];
        
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

  // Fetch regional variants separately
  const fetchRegionalVariants = async () => {
    const regionalForms = [];
    
    // Alolan forms
    for (let id = 10091; id <= 10115; id++) {
      try {
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const speciesData = await fetchData(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // More Alolan forms
    for (let id = 10123; id <= 10126; id++) {
      try {
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const speciesData = await fetchData(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // Galarian forms
    for (let id = 10158; id <= 10184; id++) {
      try {
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const speciesData = await fetchData(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // Hisuian forms
    for (let id = 10221; id <= 10249; id++) {
      try {
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const speciesData = await fetchData(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    return regionalForms;
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
          if (category === 'legendary') return poke.isLegendary || poke.isMythical;
          if (category === 'ultra-beast') return poke.isUltraBeast || checkIfUltraBeast(poke.id, poke.name);
          if (category === 'mega') return poke.stage === 'mega' || poke.name.includes('-mega');
          if (category === 'starter') return poke.isStarter || checkIfStarter(poke.id);
          if (category === 'baby') return poke.isBaby || checkIfBaby(poke.id);
          if (category === 'multi-evo') return checkIfMultiEvo(poke.id);
          if (category === 'regional') return checkIfRegionalVariant(poke.name, poke.id);
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
    { value: "ultra-beast", label: "Ultra Beast" },
    { value: "mega", label: "Mega Evolution" },
    { value: "starter", label: "Starter" },
    { value: "baby", label: "Baby Pokémon" },
    { value: "multi-evo", label: "Multiple Evolutions" },
    { value: "regional", label: "Regional Variants" }
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
        <FullBleedWrapper gradient="pokedex">
          <div className="min-h-screen flex items-center justify-center">
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
              
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Loading Pokédex...</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gathering Pokemon data from all regions
              </p>
              
              {/* Progress bar */}
              {loadingProgress > 0 && (
                <div className="max-w-xs mx-auto">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Loading Pokemon {Math.ceil((loadingProgress / 100) * 1010)} of 1010
                  </p>
                </div>
              )}
              
              {/* Fun facts */}
              <div className="mt-8 max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Did you know?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
        </FullBleedWrapper>
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
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
    <>
      <Head>
        <title>Pokédex | DexTrends</title>
        <meta name="description" content="Complete Pokédex with detailed information about all Pokémon" />
      </Head>
      
      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto pt-8 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
            PokéDex
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Search your favorite Pokémon by name or number. Filter by type below or explore additional filters in "More Filters" for advanced search.
          </p>
        </div>

        {/* Redesigned Filters Panel */}
        <div className="mb-8">
          {/* Search Bar - Prominent and Centered */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or number..."
                value={pendingSearchTerm}
                onChange={(e) => setPendingSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30 rounded-full focus:ring-2 focus:ring-purple-200/50 dark:focus:ring-purple-800/50 focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-md placeholder:text-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent w-full max-w-md"></div>
          </div>

          {/* Type Filters - Redesigned with Circular Theme */}
          <div className="mb-6">
            <h3 className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              Filter by Type {pendingTypes.length > 0 && <span className="text-xs text-gray-500 dark:text-gray-400">({pendingTypes.length}/2 selected)</span>}
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {pokemonTypes.map(type => (
                <div key={type} className="relative group">
                  <button
                    onClick={() => toggleType(type)}
                    className={`relative transition-all duration-300 transform ${
                      pendingTypes.includes(type)
                        ? 'scale-110'
                        : pendingTypes.length >= 2
                        ? 'opacity-40 cursor-not-allowed'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    
                    {/* Type badge wrapper with circular background */}
                    <div className={`relative rounded-full p-0.5 transition-all duration-300 ${
                      pendingTypes.includes(type) 
                        ? 'bg-gradient-to-br from-purple-200/80 to-pink-200/80 dark:from-purple-700/40 dark:to-pink-700/40 shadow-md ring-2 ring-purple-300/50 dark:ring-purple-600/50' 
                        : 'bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-700/60'
                    }`}>
                      <TypeBadge type={type} size="sm" />
                      
                      {/* Checkmark for selected types */}
                      {pendingTypes.includes(type) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center transform transition-all duration-300 scale-100">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            {/* More Filters - Expandable Style */}
            <div className={`flex ${showAdvancedFilters ? 'flex-col items-start' : 'items-center'} bg-white dark:bg-gray-700 ${showAdvancedFilters ? 'rounded-2xl p-3' : 'rounded-full'} border border-gray-200 dark:border-gray-500 transition-all duration-200`}>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1 ${showAdvancedFilters ? 'pb-2' : 'px-3 py-1.5'} text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-150`}
              >
                <span>More Filters</span>
                <svg 
                  className={`w-3 h-3 transition-transform duration-150 ${showAdvancedFilters ? 'rotate-90' : 'rotate-0'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Filter Options - Inside Same Container */}
              {showAdvancedFilters && (
                <div className="flex flex-col gap-2">
                  {/* Generation Row */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Gen:</span>
                    <button
                      onClick={() => {
                        setPendingGeneration("");
                        setSelectedGeneration("");
                        setVisibleCount(48);
                      }}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                        !pendingGeneration && !selectedGeneration
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      All
                    </button>
                    {generations.map(gen => (
                      <button
                        key={gen.value}
                        onClick={() => {
                          setPendingGeneration(gen.value);
                          setSelectedGeneration(gen.value);
                          setVisibleCount(48);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                          (pendingGeneration === gen.value || selectedGeneration === gen.value)
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        {gen.value}
                      </button>
                    ))}
                  </div>
                  
                  {/* Categories and Stages Row */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* All Category Pills */}
                    {categories.map(category => (
                      <button
                        key={category.value}
                        onClick={() => {
                          toggleCategory(category.value);
                          const newCategories = pendingCategories.includes(category.value)
                            ? pendingCategories.filter(c => c !== category.value)
                            : [...pendingCategories, category.value];
                          setSelectedCategory(newCategories.length === 1 ? newCategories[0] : "");
                          setVisibleCount(48);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                          pendingCategories.includes(category.value)
                            ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                    
                    {/* Vertical divider */}
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                    
                    {/* Evolution Stages */}
                    {stages.map(stage => (
                      <button
                        key={stage.value}
                        onClick={() => {
                          toggleStage(stage.value);
                          const newStages = pendingStages.includes(stage.value)
                            ? pendingStages.filter(s => s !== stage.value)
                            : [...pendingStages, stage.value];
                          setSelectedStage(newStages.length === 1 ? newStages[0] : "");
                          setVisibleCount(48);
                        }}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                          pendingStages.includes(stage.value)
                            ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Clear Filters Button - Below filters */}
          <div className="text-center">
            <button 
              onClick={clearAllFilters}
              className="px-3 py-1 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full text-xs font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600"
            >
              Clear All Filters
            </button>
          </div>

        </div>

        {/* Sort and Results Section */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          {/* Results indicator */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>
              Showing <span className="font-medium text-gray-700 dark:text-gray-300">{sortedAndVisiblePokemon.length}</span> of <span className="font-medium text-gray-700 dark:text-gray-300">{filteredPokemon.length}</span> Pokémon
            </span>
            {allPokemon.length < 1025 && (
              <>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-xs">
                  {allPokemon.length}/1025 loaded
                </span>
              </>
            )}
            {(pendingTypes.length > 0 || selectedType || selectedGeneration || pendingCategories.length > 0 || selectedCategory || pendingStages.length > 0 || selectedStage || searchTerm) && (
              <>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-xs text-blue-600">
                  Filtered
                </span>
              </>
            )}
          </div>
          
          {/* Sort Selector */}
          <div className={`flex items-center bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-500 transition-all duration-200 ${
            showSortOptions ? 'pr-2' : 'pr-3'
          }`}>
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-150"
            >
              <span>Sort: {sortOptions.find(opt => opt.value === pendingSortBy)?.label || 'ID'}</span>
              <svg 
                className={`w-3 h-3 transition-transform duration-150 ${showSortOptions ? 'rotate-180' : 'rotate-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Sort Options - Inside Same Container */}
            {showSortOptions && (
              <div className="flex items-center gap-1">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSortChange(option.value);
                    }}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
                      pendingSortBy === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pokemon Grid - Circular Design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
          {sortedAndVisiblePokemon.map((poke) => (
            <div 
              key={poke.id}
              onClick={() => handlePokemonClick(poke.id)}
              className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col items-center"
            >
              {/* Circular Pokemon Image Container */}
              <div className="relative mb-4">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  {/* Circular border with Pokemon type colors */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${
                    poke.types.length > 1 
                      ? `from-poke-${poke.types[0]} to-poke-${poke.types[1]}` 
                      : `from-poke-${poke.types[0]} to-poke-${poke.types[0]}`
                  } p-1 shadow-lg dark:shadow-2xl group-hover:shadow-xl dark:group-hover:shadow-2xl transition-shadow duration-300 group-hover:scale-105 dark:p-1.5 dark:ring-2 dark:ring-white/20`}>
                    {/* White ring that becomes Pokeball-styled on hover */}
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 p-2 transition-all duration-300 pokemon-card-shine">
                      {/* Inner circle with subtle gradient background */}
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 shadow-inner overflow-hidden group-hover:from-purple-100 group-hover:to-blue-100 dark:group-hover:from-purple-800 dark:group-hover:to-blue-800 transition-colors duration-300">
                        <Image
                          src={poke.sprite || "/dextrendslogo.png"}
                          alt={poke.name}
                          fill
                          className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                          style={{transform: 'translateY(2px)'}}
                          loading="lazy"
                          sizes="(max-width: 640px) 128px, 144px"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Pokemon number badge */}
                  <div className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-600 rounded-full shadow-md border-2 border-gray-200 dark:border-gray-500 px-2 py-1 transition-all duration-300">
                    <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                      #{String(poke.id).padStart(3, "0")}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Pokemon info below circle */}
              <div className="text-center">
                {/* Pokemon name */}
                <h3 className="font-bold text-sm sm:text-base capitalize text-gray-800 dark:text-gray-200 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {poke.name.replace("-", " ")}
                </h3>
                
                {/* Types */}
                <div className="flex justify-center gap-1">
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
      </FullBleedWrapper>
    </>
  );
}

// Mark this page as fullBleed to remove default padding
PokedexIndex.fullBleed = true;