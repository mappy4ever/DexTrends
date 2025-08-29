import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchJSON } from "../utils/unifiedFetch";
import { useDebounce } from "../hooks/useDebounce";
import { TypeBadge } from "../components/ui/TypeBadge";
import { getGeneration } from "../utils/pokemonutils";
import PokeballLoader from "../components/ui/PokeballLoader";
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import type { Pokemon, PokemonType, PokemonSprites, PokemonSpecies } from "../types/pokemon";
import EnhancedPokemonCard from "../components/ui/cards/EnhancedPokemonCard";
import { GlassContainer } from "../components/ui/design-system/GlassContainer";
import { InlineLoader, PokemonCardSkeleton } from '@/components/ui/SkeletonLoadingSystem';
import { CircularButton, GradientButton } from "../components/ui/design-system";
import { FiFilter, FiChevronDown, BsSearch } from "../components/ui/LazyIcon";
import { createGlassStyle } from '../components/ui/design-system/glass-constants';
import { FiSearch, FiX } from 'react-icons/fi';
import { NextPage } from "next";
import dynamic from 'next/dynamic';
import logger from "../utils/logger";
import { motion } from 'framer-motion';
import { staggerGrid, fadeInScale } from '../utils/staggerAnimations';
import { SearchInput } from '../components/ui/StandardInput';

// Dynamically import PullToRefresh for mobile
const PullToRefresh = dynamic(() => import('../components/mobile/PullToRefresh'), {
  ssr: false
});

// Type definitions
// Using types from "../../types/pokemon

interface EnhancedPokemon {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  height?: number;
  weight?: number;
  stats?: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  species?: PokemonSpecies;
  classification?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  generation?: string;
  isStarter?: boolean;
  isFossil?: boolean;
  isUltraBeast?: boolean;
  isBaby?: boolean;
  evolvesFrom?: string;
  totalStats?: number;
}

interface ApiPokemonResponse {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonType[];
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  species: {
    name: string;
    url: string;
  };
}

type SortOption = 'id' | 'name' | 'type' | 'height' | 'weight' | 'stats' | 'generation';
type PokemonCategory = 'all' | 'starter' | 'legendary' | 'mythical' | 'ultra-beast' | 'baby' | 'fossil';
type EvolutionStage = 'all' | 'basic' | 'stage1' | 'stage2' | 'single';

// Constants
const INITIAL_LOAD = 48;
const LOAD_MORE_COUNT = 48;
const TOTAL_POKEMON = 1025; // Updated to include Gen 9

const PokedexIndex: NextPage = () => {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<EnhancedPokemon[]>([]);
  const [allPokemon, setAllPokemon] = useState<EnhancedPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PokemonCategory>("all");
  const [selectedStage, setSelectedStage] = useState<EvolutionStage>("all");
  const [sortBy, setSortBy] = useState<SortOption>("id");
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  
  // New states for search-triggered filtering
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [pendingTypes, setPendingTypes] = useState<string[]>([]);
  const [pendingGeneration, setPendingGeneration] = useState("");
  const [pendingCategories, setPendingCategories] = useState<PokemonCategory[]>([]);
  const [pendingStages, setPendingStages] = useState<EvolutionStage[]>([]);
  const [pendingSortBy, setPendingSortBy] = useState<SortOption>("id");
  
  // Use centralized debounce hook
  const debouncedSearchTerm = useDebounce(pendingSearchTerm, 300);
  
  // Intersection observer ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle search with debounce
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
    setVisibleCount(INITIAL_LOAD);
  }, [debouncedSearchTerm]);

  // Handle search trigger
  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
    setSelectedType(pendingTypes.length === 1 ? pendingTypes[0] : ""); // For backward compatibility
    setSelectedGeneration(pendingGeneration);
    setSelectedCategory(pendingCategories.length === 1 ? pendingCategories[0] : "all"); // For backward compatibility
    setSelectedStage(pendingStages.length === 1 ? pendingStages[0] : "all"); // For backward compatibility
    setSortBy(pendingSortBy);
    setVisibleCount(INITIAL_LOAD); // Reset pagination
  };

  // Handle sort change with immediate effect
  const handleSortChange = (newSort: SortOption) => {
    setPendingSortBy(newSort);
    setSortBy(newSort);
    setVisibleCount(INITIAL_LOAD); // Reset pagination
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
    setSelectedCategory("all");
    setSelectedStage("all");
    setSortBy("id");
    setVisibleCount(INITIAL_LOAD);
  };

  // Helper functions for interactive selections
  const toggleType = (type: string) => {
    setPendingTypes(prev => {
      let newTypes: string[];
      
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
      setVisibleCount(INITIAL_LOAD);
      
      return newTypes;
    });
  };

  const toggleCategory = (category: PokemonCategory) => {
    setPendingCategories(prev => {
      let newCategories: PokemonCategory[];
      
      if (prev.includes(category)) {
        // Remove the category if already selected
        newCategories = prev.filter(c => c !== category);
      } else {
        // Add the category if not selected
        newCategories = [...prev, category];
      }
      
      // Apply the change to active filters too (for immediate visual feedback)
      if (newCategories.length === 1) {
        setSelectedCategory(newCategories[0]);
      } else {
        setSelectedCategory("all");
      }
      
      return newCategories;
    });
  };

  const toggleStage = (stage: EvolutionStage) => {
    setPendingStages(prev => {
      let newStages: EvolutionStage[];
      
      if (prev.includes(stage)) {
        // Remove the stage if already selected
        newStages = prev.filter(s => s !== stage);
      } else {
        // Add the stage if not selected
        newStages = [...prev, stage];
      }
      
      // Apply the change to active filters too (for immediate visual feedback)
      if (newStages.length === 1) {
        setSelectedStage(newStages[0]);
      } else {
        setSelectedStage("all");
      }
      
      return newStages;
    });
  };

  // Helper functions for Pokémon categorization
  const checkIfStarter = (id: number): boolean => {
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

  const isStarter = useCallback((pokemonName: string, pokemonId: number): boolean => {
    return checkIfStarter(pokemonId);
  }, []);

  const isFossil = (pokemonName: string): boolean => {
    const fossils = [
      'omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl',
      'lileep', 'cradily', 'anorith', 'armaldo',
      'cranidos', 'rampardos', 'shieldon', 'bastiodon',
      'tirtouga', 'carracosta', 'archen', 'archeops',
      'tyrunt', 'tyrantrum', 'amaura', 'aurorus',
      'dracozolt', 'arctozolt', 'dracovish', 'arctovish'
    ];
    return fossils.includes(pokemonName.toLowerCase());
  };

  const checkIfBaby = (id: number): boolean => {
    const babyIds = [
      172, 173, 174, 175, 236, 238, 239, 240, 298, 360, // Gen 2 babies
      433, 438, 439, 440, 446, 447, 458, // Gen 4 babies
      848 // Toxel (Gen 8)
    ];
    return babyIds.includes(id);
  };

  const checkIfMultiEvo = (id: number): boolean => {
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

  const checkIfUltraBeast = (id: number, name: string): boolean => {
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

  const isUltraBeast = (pokemonName: string): boolean => {
    return checkIfUltraBeast(0, pokemonName);
  };

  const checkIfRegionalVariant = (name: string, id?: number): boolean => {
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

  // Enhanced Pokemon data loading function
  const enhancePokemonData = useCallback((details: ApiPokemonResponse, speciesData?: PokemonSpecies | null): EnhancedPokemon => {
    const generation = getGeneration(details.id).toString();
    const isLegendary = speciesData?.is_legendary || false;
    const isMythical = speciesData?.is_mythical || false;
    const isUltraBeastPokemon = speciesData?.genera?.some(g => g.genus.toLowerCase().includes('ultra beast')) || checkIfUltraBeast(details.id, details.name);
    
    // Determine evolution stage based on evolution chain position
    let stage: number | string = 1; // Default to first stage
    if (details.name.includes('-mega') || details.name.includes('-gmax')) {
      stage = 'mega';
    } else if (isLegendary || isMythical) {
      stage = 'legendary';
    }
    
    return {
      id: details.id,
      name: details.name,
      types: details.types.map(t => t.type.name),
      sprite: details.sprites?.other?.["official-artwork"]?.front_default || details.sprites?.front_default || null,
      height: details.height,
      weight: details.weight,
      generation,
      isLegendary,
      isMythical,
      isUltraBeast: isUltraBeastPokemon,
      isStarter: checkIfStarter(details.id),
      isBaby: speciesData?.is_baby || checkIfBaby(details.id),
      isFossil: isFossil(details.name),
      stats: details.stats,
      species: speciesData || undefined,
      classification: speciesData?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown Pokémon',
      evolvesFrom: speciesData?.evolves_from_species?.name,
      totalStats: details.stats.reduce((acc, stat) => acc + stat.base_stat, 0),
    };
  }, []);

  // Fetch Pokémon batch
  const fetchPokemonBatch = useCallback(async (start: number, count: number): Promise<EnhancedPokemon[]> => {
    try {
      const promises = [];
      for (let i = start; i < start + count && i <= TOTAL_POKEMON; i++) {
        promises.push(
          fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(async (details) => {
              if (!details) return null;
              try {
                const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
                return enhancePokemonData(details, speciesData);
              } catch {
                return enhancePokemonData(details);
              }
            })
            .catch((err: unknown) => {
              // Return placeholder for failed loads
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              logger.error('Failed to load Pokemon', { pokemonId: i, error: errorMessage });
              return {
                id: i,
                name: `pokemon-${i}`,
                types: [],
                sprite: "/dextrendslogo.png",
                height: 0,
                weight: 0,
                generation: getGeneration(i).toString(),
                isLegendary: false,
                isMythical: false,
                isUltraBeast: false,
                isStarter: false,
                isBaby: false,
                isFossil: false,
                totalStats: 0,
              } as EnhancedPokemon;
            })
        );
      }
      const results = await Promise.all(promises);
      return results.filter((pokemon): pokemon is EnhancedPokemon => pokemon !== null);
    } catch (err) {
      logger.error('Batch fetch error', { error: err });
      return [];
    }
  }, [enhancePokemonData]);

  // Fetch mega evolutions separately
  const fetchMegaEvolutions = useCallback(async (): Promise<EnhancedPokemon[]> => {
    const megaForms: EnhancedPokemon[] = [];
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
        const details = await fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${mega.id}`);
        if (!details) continue;
        const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        megaForms.push(enhancedData);
      } catch (err) {
        logger.error('Failed to fetch mega evolution', { megaName: mega.name, error: err });
      }
    }

    return megaForms;
  }, [enhancePokemonData]);

  // Fetch regional variants separately
  const fetchRegionalVariants = useCallback(async (): Promise<EnhancedPokemon[]> => {
    const regionalForms: EnhancedPokemon[] = [];
    
    // Alolan forms
    for (let id = 10091; id <= 10115; id++) {
      try {
        const details = await fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!details) continue;
        const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // More Alolan forms
    for (let id = 10123; id <= 10126; id++) {
      try {
        const details = await fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!details) continue;
        const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // Galarian forms
    for (let id = 10158; id <= 10184; id++) {
      try {
        const details = await fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!details) continue;
        const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    // Hisuian forms
    for (let id = 10221; id <= 10249; id++) {
      try {
        const details = await fetchJSON<ApiPokemonResponse>(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!details) continue;
        const speciesData = await fetchJSON<PokemonSpecies>(details.species.url);
        const enhancedData = enhancePokemonData(details, speciesData);
        regionalForms.push(enhancedData);
      } catch (err) {
        // Skip if not found
      }
    }
    
    return regionalForms;
  }, [enhancePokemonData]);

  // Background loading function for remaining Pokemon
  const loadRemainingPokemon = useCallback(async (initialData: EnhancedPokemon[]) => {
    try {
      logger.debug('Starting background loading of remaining Pokemon...');
      let allPokemonData = [...initialData];
      
      // Ensure we have placeholders for all Pokemon
      while (allPokemonData.length < TOTAL_POKEMON) {
        allPokemonData.push({
          id: allPokemonData.length + 1,
          name: `pokemon-${allPokemonData.length + 1}`,
          types: [],
          sprite: '/dextrendslogo.png',
          height: 0,
          weight: 0,
          generation: getGeneration(allPokemonData.length + 1).toString(),
          isLegendary: false,
          isMythical: false,
          isUltraBeast: false,
          isStarter: false,
          isBaby: false,
          isFossil: false,
          totalStats: 0,
        } as EnhancedPokemon);
      }
      
      // Load remaining Pokemon (251-1025) in medium batches
      const BACKGROUND_BATCH_SIZE = 30;
      let loadedCount = 0;
      
      for (let start = 251; start <= TOTAL_POKEMON; start += BACKGROUND_BATCH_SIZE) {
        const count = Math.min(BACKGROUND_BATCH_SIZE, TOTAL_POKEMON - start + 1);
        
        try {
          const batch = await fetchPokemonBatch(start, count);
          loadedCount += batch.length;
          
          // Update the loaded data
          batch.forEach(pokemon => {
            if (pokemon.id > 0 && pokemon.id <= TOTAL_POKEMON) {
              allPokemonData[pokemon.id - 1] = pokemon;
            }
          });
          
          // Update data periodically
          if (loadedCount % 90 === 0 || start + BACKGROUND_BATCH_SIZE > TOTAL_POKEMON) { // Every 90 Pokemon or at the end
            logger.debug(`Background loading progress: ${loadedCount} Pokemon loaded`);
            setAllPokemon([...allPokemonData]);
          }
          
          // Moderate delay for background loading - balance between API limits and speed
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (batchError) {
          logger.error(`Failed to load batch starting at ${start}`, { error: batchError });
          // Continue with next batch even if one fails
        }
      }
      
      // Load special forms in background
      try {
        const megaEvolutions = await fetchMegaEvolutions();
        allPokemonData = [...allPokemonData, ...megaEvolutions];
        
        const regionalVariants = await fetchRegionalVariants();
        allPokemonData = [...allPokemonData, ...regionalVariants];
        
        logger.debug(`Special forms loaded: ${megaEvolutions.length} mega evolutions, ${regionalVariants.length} regional variants`);
      } catch (err) {
        logger.debug('Special forms loading failed, continuing with basic Pokemon', { error: err });
      }
      
      // Final update
      logger.debug(`Background loading complete! Total Pokemon loaded: ${loadedCount + 250}`);
      setAllPokemon(allPokemonData);
    } catch (err) {
      logger.error('Background loading failed', { error: err });
    }
  }, [fetchPokemonBatch, fetchMegaEvolutions, fetchRegionalVariants]);

  // Load initial Pokémon data for faster page load
  useEffect(() => {
    let mounted = true;

    const loadInitialPokemon = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // First, get the list of all Pokemon (lightweight)
        const pokemonList = await fetchJSON<{ results: Array<{ name: string; url: string }> }>('https://pokeapi.co/api/v2/pokemon?limit=1025');
        
        if (!pokemonList?.results) {
          throw new Error('Failed to fetch Pokemon list');
        }
        
        // Create placeholder data immediately with just names and IDs
        const placeholderPokemon: EnhancedPokemon[] = pokemonList.results.map((p, index) => ({
          id: index + 1,
          name: p.name,
          types: [],
          sprite: '/dextrendslogo.png',
          height: 0,
          weight: 0,
          generation: getGeneration(index + 1).toString(),
          isLegendary: false,
          isMythical: false,
          isUltraBeast: false,
          isStarter: checkIfStarter(index + 1),
          isBaby: false,
          isFossil: isFossil(p.name),
          totalStats: 0,
        }));
        
        if (!mounted) return;
        
        // Display placeholder data immediately
        setAllPokemon(placeholderPokemon);
        setPokemon(placeholderPokemon);
        setLoading(false);
        
        // Load first 250 Pokemon initially for faster initial page load
        const INITIAL_LOAD_COUNT = 250;
        let loadedPokemonData: EnhancedPokemon[] = [...placeholderPokemon];
        
        // Load detailed data in medium batches for better performance
        const SMALL_BATCH_SIZE = 25;
        for (let start = 1; start <= INITIAL_LOAD_COUNT; start += SMALL_BATCH_SIZE) {
          if (!mounted) return;
          
          const count = Math.min(SMALL_BATCH_SIZE, INITIAL_LOAD_COUNT - start + 1);
          const batch = await fetchPokemonBatch(start, count);
          
          // Update the loaded data
          batch.forEach(pokemon => {
            if (pokemon.id <= loadedPokemonData.length) {
              loadedPokemonData[pokemon.id - 1] = pokemon;
            }
          });
          
          if (!mounted) return;
          
          // Update progress
          const progress = Math.round((start + count - 1) / TOTAL_POKEMON * 100);
          setLoadingProgress(progress);
          
          // Update displayed Pokemon with loaded data
          setAllPokemon([...loadedPokemonData]);
          setPokemon([...loadedPokemonData]);
          
          // Small delay to prevent API overload
          if (start + SMALL_BATCH_SIZE <= INITIAL_LOAD_COUNT) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (!mounted) return;
        
        // Continue loading remaining Pokemon in background
        // Use requestIdleCallback for better performance if available
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            if (mounted) {
              loadRemainingPokemon(loadedPokemonData);
            }
          }, { timeout: 2000 });
        } else {
          setTimeout(() => {
            if (mounted) {
              loadRemainingPokemon(loadedPokemonData);
            }
          }, 1000);
        }
        
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load Pokédex data");
        logger.error('Error loading Pokémon', { error: err });
        setLoading(false);
      }
    };

    loadInitialPokemon();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced filtering logic
  const filteredPokemon = useMemo(() => {
    return allPokemon.filter((p) => {
      // Search filter
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          p.id.toString() !== searchTerm) {
        return false;
      }

      // Type filter - AND logic for types: Pokemon must have ALL selected types
      const activeTypes = pendingTypes.length > 0 ? pendingTypes : (selectedType ? [selectedType] : []);
      if (activeTypes.length > 0 && !activeTypes.every(type => p.types.includes(type))) {
        return false;
      }

      // Generation filter
      if (selectedGeneration && p.generation !== selectedGeneration) {
        return false;
      }

      // Category filter - now supports multiple categories (OR logic)
      const categoryChecks = {
        'starter': p.isStarter,
        'legendary': p.isLegendary,
        'mythical': p.isMythical,
        'ultra-beast': p.isUltraBeast,
        'baby': p.isBaby,
        'fossil': p.isFossil
      };

      if (pendingCategories.length > 0) {
        const matchesAnyCategory = pendingCategories.some(category => 
          category === 'all' || categoryChecks[category]
        );
        if (!matchesAnyCategory) return false;
      } else if (selectedCategory !== 'all' && !categoryChecks[selectedCategory]) {
        return false;
      }

      // Evolution stage filter - now supports multiple stages (OR logic)
      const stageChecks = {
        'basic': !p.evolvesFrom,
        'stage1': p.evolvesFrom && allPokemon.some(other => other.evolvesFrom === p.name),
        'stage2': p.evolvesFrom && !allPokemon.some(other => other.evolvesFrom === p.name),
        'single': !p.evolvesFrom && !allPokemon.some(other => other.evolvesFrom === p.name)
      };

      if (pendingStages.length > 0) {
        const matchesAnyStage = pendingStages.some(stage => 
          stage === 'all' || stageChecks[stage]
        );
        if (!matchesAnyStage) return false;
      } else if (selectedStage !== 'all' && !stageChecks[selectedStage]) {
        return false;
      }

      return true;
    });
  }, [
    allPokemon, 
    searchTerm, 
    selectedType, 
    selectedGeneration, 
    selectedCategory, 
    selectedStage,
    pendingTypes,
    pendingCategories,
    pendingStages
  ]);

  // Sorting logic
  const sortedPokemon = useMemo(() => {
    const sorted = [...filteredPokemon];
    
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        sorted.sort((a, b) => a.types[0].localeCompare(b.types[0]));
        break;
      case 'height':
        sorted.sort((a, b) => (b.height || 0) - (a.height || 0));
        break;
      case 'weight':
        sorted.sort((a, b) => (b.weight || 0) - (a.weight || 0));
        break;
      case 'stats':
        sorted.sort((a, b) => (b.totalStats || 0) - (a.totalStats || 0));
        break;
      case 'generation':
        sorted.sort((a, b) => {
          const genA = a.generation || '';
          const genB = b.generation || '';
          return genA.localeCompare(genB) || a.id - b.id;
        });
        break;
      default: // 'id'
        sorted.sort((a, b) => a.id - b.id);
    }
    
    return sorted;
  }, [filteredPokemon, sortBy]);

  // Paginated results
  const displayedPokemon = useMemo(() => {
    return sortedPokemon.slice(0, visibleCount);
  }, [sortedPokemon, visibleCount]);

  // Load more functionality
  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= sortedPokemon.length) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, sortedPokemon.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, visibleCount, sortedPokemon.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer with debouncing
    let timeoutId: NodeJS.Timeout;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && visibleCount < sortedPokemon.length) {
          // Debounce to prevent multiple rapid calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadMore();
          }, 100);
        }
      },
      {
        root: null,
        rootMargin: '400px', // Start loading 400px before reaching the element
        threshold: 0.1
      }
    );
    
    // Observe the load more trigger element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, isLoadingMore, visibleCount, sortedPokemon.length]);

  // Get type colors for dynamic styling
  const getTypeGradient = (types: string[]): string => {
    if (types.length === 1) {
      return `from-poke-${types[0]} to-poke-${types[0]}-dark`;
    }
    return `from-poke-${types[0]} to-poke-${types[1]}`;
  };

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      // Clear existing data
      setAllPokemon([]);
      setPokemon([]);
      setLoading(true);
      setError(null);
      
      // Re-trigger the initial loading (SSR safe)
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      logger.error('Refresh failed', { error: err });
      setError("Failed to refresh Pokédex data");
    }
  }, []);

  // Loading state with skeleton loading
  if (loading) {
    return (
      <FullBleedWrapper>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <Head>
            <title>Loading Pokédex - DexTrends</title>
          </Head>
          
          {/* Header Skeleton */}
          <div className="p-6 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 animate-pulse" />
                <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
              </div>
              
              {/* Search and Filter Skeleton */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full animate-pulse" />
                <div className="w-32 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full animate-pulse" />
                <div className="w-32 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Pokemon Grid Skeleton */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: INITIAL_LOAD }).map((_, index) => (
                <PokemonCardSkeleton 
                  key={index} 
                  variant="grid"
                  showStats={false}
                  className="h-full"
                />
              ))}
            </div>
          </div>
          
          {/* Loading Progress Overlay */}
          {loadingProgress > 0 && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <PokeballLoader size="small" text="" randomBall={false} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Loading Pokémon... {loadingProgress}%
                    </p>
                    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FullBleedWrapper>
    );
  }

  if (error) {
    return (
      <FullBleedWrapper>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <CircularButton
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            variant="primary"
          >
            Try Again
          </CircularButton>
        </div>
      </FullBleedWrapper>
    );
  }

  return (
    <>
      <Head>
        <title>Pokédex | DexTrends - Browse All Pokémon</title>
        <meta name="description" content="Browse all 1025+ Pokémon with detailed stats, types, abilities, and more. Filter by generation, type, and category." />
      </Head>

      <PullToRefresh onRefresh={handleRefresh}>
        <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Enhanced Header with Glass Morphism */}
          <GlassContainer variant="colored" blur="lg" rounded="3xl" className="mb-8 text-center relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-100/40 to-pink-100/40 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
            
            <div className="relative z-10">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Complete Pokédex
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                Browse all {TOTAL_POKEMON} Pokémon from every generation
              </p>
              
              {/* Stats Pills with Glass Effect */}
              <div className="flex justify-center gap-3 flex-wrap">
                <div className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 rounded-full px-4 py-2 border border-white/30 shadow-lg">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {filteredPokemon.length} Found
                  </span>
                </div>
                <div className="backdrop-blur-md bg-white/60 dark:bg-gray-800/60 rounded-full px-4 py-2 border border-white/30 shadow-lg">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {displayedPokemon.length} Displayed
                  </span>
                </div>
                {allPokemon.filter(p => p.sprite !== '/dextrendslogo.png').length < TOTAL_POKEMON && (
                  <div className="backdrop-blur-md bg-gradient-to-r from-blue-100/60 to-purple-100/60 dark:from-blue-900/40 dark:to-purple-900/40 rounded-full px-4 py-2 border border-blue-300/30 shadow-lg">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {allPokemon.filter(p => p.sprite !== '/dextrendslogo.png').length}/{TOTAL_POKEMON} Loaded
                    </span>
                  </div>
                )}
              </div>
            </div>
          </GlassContainer>

          {/* Enhanced Search and Filter Bar with Glass Morphism */}
          <div className="sticky top-16 z-20 pb-4">
            <GlassContainer variant="medium" blur="lg" rounded="3xl" className="shadow-xl border-2 border-white/40 dark:border-gray-700/40">
              <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <SearchInput
                    placeholder="Search by name or ID..."
                    value={pendingSearchTerm}
                    onChange={(e) => setPendingSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    icon={<FiSearch size={18} />}
                    inputSize="md"
                  />
                </div>

              {/* Filter Buttons - Stack on smallest screens */}
              <div className="flex flex-wrap xs:flex-nowrap gap-2">
                <CircularButton
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  variant={showAdvancedFilters ? "primary" : "secondary"}
                  leftIcon={<FiFilter className="w-4 h-4" />}
                >
                  Filters
                  {(pendingTypes.length > 0 || pendingGeneration || pendingCategories.length > 0 || pendingStages.length > 0) && (
                    <span className="ml-2 bg-white text-blue-500 px-2 py-1 rounded-full text-xs">
                      {pendingTypes.length + (pendingGeneration ? 1 : 0) + pendingCategories.length + pendingStages.length}
                    </span>
                  )}
                </CircularButton>

                <CircularButton
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  variant={showSortOptions ? "primary" : "secondary"}
                  leftIcon={<FiChevronDown className="w-4 h-4" />}
                >
                  Sort
                </CircularButton>

                <CircularButton
                  onClick={handleSearch}
                  variant="primary"
                >
                  Search
                </CircularButton>

                {(searchTerm || selectedType || selectedGeneration || selectedCategory !== 'all' || selectedStage !== 'all') && (
                  <button
                    onClick={clearAllFilters}
                    className="btn bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-6 space-y-4 border-t pt-6">
                {/* Type Filter */}
                <div data-testid="type-filter">
                  <h3 className="font-semibold mb-3 text-gray-700">Type</h3>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`transition-all duration-200 ${
                            pendingTypes.includes(type) ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg transform scale-105' : 'hover:transform hover:scale-105'
                          }`}
                        >
                          <TypeBadge type={type} size="md" />
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`transition-all duration-200 ${
                            pendingTypes.includes(type) ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg transform scale-105' : 'hover:transform hover:scale-105'
                          }`}
                        >
                          <TypeBadge type={type} size="md" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generation Filter */}
                <div data-testid="generation-filter">
                  <h3 className="font-semibold mb-3 text-gray-700">Generation</h3>
                  <div className="flex flex-wrap gap-2">
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'].map(gen => (
                      <button
                        key={gen}
                        onClick={() => {
                          setPendingGeneration(pendingGeneration === gen ? '' : gen);
                          setSelectedGeneration(pendingGeneration === gen ? '' : gen);
                        }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                          pendingGeneration === gen
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        Gen {gen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'starter' as PokemonCategory, label: 'Starter' },
                      { value: 'legendary' as PokemonCategory, label: 'Legendary' },
                      { value: 'mythical' as PokemonCategory, label: 'Mythical' },
                      { value: 'ultra-beast' as PokemonCategory, label: 'Ultra Beast' },
                      { value: 'baby' as PokemonCategory, label: 'Baby' },
                      { value: 'fossil' as PokemonCategory, label: 'Fossil' }
                    ].map(category => (
                      <button
                        key={category.value}
                        onClick={() => toggleCategory(category.value)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 backdrop-blur-md ${
                          pendingCategories.includes(category.value)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-700/90'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evolution Stage Filter */}
                <div>
                  <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Evolution Stage</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'basic' as EvolutionStage, label: 'Basic' },
                      { value: 'stage1' as EvolutionStage, label: 'Stage 1' },
                      { value: 'stage2' as EvolutionStage, label: 'Stage 2' },
                      { value: 'single' as EvolutionStage, label: 'No Evolution' }
                    ].map(stage => (
                      <button
                        key={stage.value}
                        onClick={() => toggleStage(stage.value)}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 backdrop-blur-md ${
                          pendingStages.includes(stage.value)
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-700/90'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sort Options */}
            {showSortOptions && (
              <div className="mt-6 border-t border-white/20 dark:border-gray-700/20 pt-6 animate-fadeIn">
                <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Sort By</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'id' as SortOption, label: 'Number' },
                    { value: 'name' as SortOption, label: 'Name' },
                    { value: 'type' as SortOption, label: 'Type' },
                    { value: 'height' as SortOption, label: 'Height' },
                    { value: 'weight' as SortOption, label: 'Weight' },
                    { value: 'stats' as SortOption, label: 'Total Stats' },
                    { value: 'generation' as SortOption, label: 'Generation' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 backdrop-blur-md ${
                        pendingSortBy === option.value
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-700/30 hover:bg-white/90 dark:hover:bg-gray-700/90'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassContainer>
          </div>

          {/* Enhanced Pokémon Grid with Glass Container */}
          <div className="mt-8">
          {displayedPokemon.length > 0 ? (
            <GlassContainer 
              variant="light" 
              blur="sm" 
              rounded="3xl" 
              className="mb-8 bg-gradient-to-br from-white/40 via-white/30 to-white/40 dark:from-gray-800/40 dark:via-gray-800/30 dark:to-gray-800/40"
            >
              <motion.div 
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-6"
                variants={staggerGrid}
                initial="hidden"
                animate="show"
              >
                {displayedPokemon.map((pokemon, index) => (
                  <motion.div
                    key={pokemon.id}
                    variants={fadeInScale}
                    className="pokemon-card"
                  >
                    <EnhancedPokemonCard
                      pokemon={{
                        id: pokemon.id,
                        name: pokemon.name,
                        sprite: pokemon.sprite || undefined,
                        types: pokemon.types.map(type => ({ type: { name: type } })),
                        isLegendary: pokemon.isLegendary,
                        isMythical: pokemon.isMythical,
                        isStarter: pokemon.isStarter
                      }}
                      size="md"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </GlassContainer>
          ) : (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500 dark:text-gray-400 mb-4">No Pokémon found</p>
              <p className="text-gray-400 dark:text-gray-500">Try adjusting your filters or search term</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 btn btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          )}
          </div>

          {/* Infinite scroll trigger element */}
          <div ref={loadMoreRef} className="h-20 -mt-10" aria-hidden="true" />
          
          {/* Load More / Loading Indicator */}
          {displayedPokemon.length < sortedPokemon.length && (
            <div className="text-center mt-8">
              {isLoadingMore ? (
                <div className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'full'
                })} inline-block px-8 py-4`}>
                  <InlineLoader text="Loading more Pokémon..." />
                </div>
              ) : (
                <GradientButton
                  onClick={loadMore}
                  variant="primary"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-4"
                >
                  Load More ({sortedPokemon.length - displayedPokemon.length} remaining)
                </GradientButton>
              )}
            </div>
          )}
          
          {/* End of results message */}
          {displayedPokemon.length >= sortedPokemon.length && sortedPokemon.length > 0 && (
            <div className={`${createGlassStyle({
              blur: 'xl',
              opacity: 'medium',
              gradient: true,
              border: 'medium',
              shadow: 'xl',
              rounded: 'xl'
            })} mx-auto max-w-md p-8 text-center rounded-3xl`}>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                You've caught them all! 
              </p>
              <p className="text-6xl mb-4">🎉</p>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {sortedPokemon.length.toLocaleString()} Pokémon displayed
              </p>
            </div>
          )}
        </div>
      </FullBleedWrapper>
      </PullToRefresh>

      <style jsx>{`
        /* Type-specific gradient colors - Tailwind doesn't support dynamic classes */
        .from-poke-normal { --tw-gradient-from: #A8A878; }
        .from-poke-fire { --tw-gradient-from: #F08030; }
        .from-poke-water { --tw-gradient-from: #6890F0; }
        .from-poke-electric { --tw-gradient-from: #F8D030; }
        .from-poke-grass { --tw-gradient-from: #78C850; }
        .from-poke-ice { --tw-gradient-from: #98D8D8; }
        .from-poke-fighting { --tw-gradient-from: #C03028; }
        .from-poke-poison { --tw-gradient-from: #A040A0; }
        .from-poke-ground { --tw-gradient-from: #E0C068; }
        .from-poke-flying { --tw-gradient-from: #A890F0; }
        .from-poke-psychic { --tw-gradient-from: #F85888; }
        .from-poke-bug { --tw-gradient-from: #A8B820; }
        .from-poke-rock { --tw-gradient-from: #B8A038; }
        .from-poke-ghost { --tw-gradient-from: #705898; }
        .from-poke-dragon { --tw-gradient-from: #7038F8; }
        .from-poke-dark { --tw-gradient-from: #705848; }
        .from-poke-steel { --tw-gradient-from: #B8B8D0; }
        .from-poke-fairy { --tw-gradient-from: #EE99AC; }
        
        .to-poke-normal { --tw-gradient-to: #8B8B59; }
        .to-poke-fire { --tw-gradient-to: #C54B1D; }
        .to-poke-water { --tw-gradient-to: #4A6BC3; }
        .to-poke-electric { --tw-gradient-to: #C5A724; }
        .to-poke-grass { --tw-gradient-to: #5F9E3F; }
        .to-poke-ice { --tw-gradient-to: #7AAEAD; }
        .to-poke-fighting { --tw-gradient-to: #99251E; }
        .to-poke-poison { --tw-gradient-to: #813380; }
        .to-poke-ground { --tw-gradient-to: #B39953; }
        .to-poke-flying { --tw-gradient-to: #8973C3; }
        .to-poke-psychic { --tw-gradient-to: #C6466D; }
        .to-poke-bug { --tw-gradient-to: #8B9519; }
        .to-poke-rock { --tw-gradient-to: #93802C; }
        .to-poke-ghost { --tw-gradient-to: #5A477A; }
        .to-poke-dragon { --tw-gradient-to: #592CC6; }
        .to-poke-dark { --tw-gradient-to: #5A473A; }
        .to-poke-steel { --tw-gradient-to: #9595AA; }
        .to-poke-fairy { --tw-gradient-to: #C47A8A; }
      `}</style>
    </>
  );
};

// Mark this page as fullBleed
type PageComponent = NextPage & {
  fullBleed?: boolean;
};

(PokedexIndex as PageComponent).fullBleed = true;

export default PokedexIndex;