// filepath: /Users/moazzam/Documents/GitHub/Mappy/DexTrends/pages/pokedex.js
import React, { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import { useSorting } from "../context/sortingcontext";
import { useTheme } from "../context/themecontext";
import { useFavorites } from "../context/favoritescontext";
import { useViewSettings } from "../context/viewsettingscontext";
import { TypeBadge } from "../components/ui/TypeBadge"; // Updated path
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations"; // Lowercase filename, added StaggeredChildren
import { typeColors, getGeneration, generationNames, extractIdFromUrl, getOfficialArtworkSpriteUrl } from "../utils/pokemonutils"; // Import getOfficialArtworkSpriteUrl
import { toLowercaseUrl } from "../utils/formatters"; // Correct import path
import { fetchData } from "../utils/apiutils"; // Corrected import path
import PokemonCardSkeleton from "../components/ui/PokemonCardSkeleton"; // Import the skeleton component

const pageSize = 50;

function getKey(pageIndex, previousPageData) {
  if (previousPageData && !previousPageData.results.length) return null; // reached end
  const offset = pageIndex * pageSize;
  return `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`;
}

function LoadMoreTrigger({ onLoadMore }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return <div ref={ref} />;
}

export default function PokeDex() {
  // Helper: get starter IDs (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea)
  // Add Eevee (id 133) to starters
  const starterIds = new Set([
    1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728, 810, 813, 816, 906, 909, 912, 133 // Eevee
  ]);
  // Helper: get legendary/mythical IDs (hardcoded for demo, should be from API in prod)
  const legendaryIds = new Set([
    144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,385,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,785,786,787,788,789,790,791,792,800,888,889,890,891,892,894,895,896,897,898,905,888,889,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025
  ]);
  const mythicalIds = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 803, 804, 805, 806, 807, 808, 809, 891, 892, 893, 894, 895, 896, 897, 898
]); // Only true Mythical Pokémon National Dex numbers
  // Ultra Beasts (Gen 7, National Dex 793-807, but not all in order)
  const ultraBeastIds = new Set([
    793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807
  ]);
  // Form archetype IDs (add more as needed)
  const alolanIds = new Set([
    19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105, 110
  ]);
  const galarianIds = new Set([
    52, 77, 78, 79, 80, 83, 110, 122, 144, 145, 146, 199, 222, 263, 264, 554, 555, 562, 618, 869, 878, 879, 880, 881, 882, 883
  ]);
  const hisuianIds = new Set([
    58, 59, 100, 101, 157, 211, 215, 503, 549, 570, 571, 628, 705, 706, 713, 724, 899, 900, 901, 902, 903, 904, 905
  ]);
  const paldeanIds = new Set([
    194, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025
  ]);
  // Add more as needed (e.g., kantonianIds, sinnohianIds, etc.)

  const router = useRouter();
  const { sortOrder, setSortOrder } = useSorting();
  const { theme } = useTheme();
  const { favorites, togglePokemonFavorite, isPokemonFavorite } = useFavorites();
  const { viewSettings, updateSetting } = useViewSettings();
  
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true); // Show filter panel by default
  const [typeFilter, setTypeFilter] = useState([]);
  const [genFilter, setGenFilter] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // Always static default for SSR
  const [cardSize, setCardSize] = useState('regular'); // Always static default for SSR
  const [starterFilter, setStarterFilter] = useState(false);
  const [legendaryFilter, setLegendaryFilter] = useState(false);
  const [mythicalFilter, setMythicalFilter] = useState(false);
  const [ultraBeastFilter, setUltraBeastFilter] = useState(false);
  const [alolanFilter, setAlolanFilter] = useState(false);
  const [galarianFilter, setGalarianFilter] = useState(false);
  const [hisuianFilter, setHisuianFilter] = useState(false);
  const [paldeanFilter, setPaldeanFilter] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(false); // for search button
  const filterPanelRef = useRef(null);

  // --- Grouping logic for alternate forms ---
  const [speciesMap, setSpeciesMap] = useState({}); // { speciesName: { default: {...}, forms: [...] } }
  const [formSelections, setFormSelections] = useState({}); // { speciesName: selectedFormIndex }

  // On mount, update from localStorage or viewSettings if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedView = localStorage.getItem('pokedex-view') || viewSettings?.pokemonView;
      if (storedView && storedView !== viewMode) setViewMode(storedView);
      const storedSize = localStorage.getItem('pokedex-size') || viewSettings?.cardSize;
      if (storedSize && storedSize !== cardSize) setCardSize(storedSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save view preferences to both localStorage and context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokedex-view', viewMode);
      if (viewSettings?.pokemonView !== viewMode) {
        updateSetting('pokemonView', viewMode);
      }
      localStorage.setItem('pokedex-size', cardSize);
      if (viewSettings?.cardSize !== cardSize) {
        updateSetting('cardSize', cardSize);
      }
    }
  }, [viewMode, cardSize, updateSetting, viewSettings]);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetchData); // Use fetchData for SWR

  // Flatten pages and fetch detailed info for each pokemon
  const [pokemonList, setPokemonList] = useState([]);
  useEffect(() => {
    async function fetchDetails() {
      if (!data) return;
      const allResults = data.flatMap((page) => page.results);
      const speciesCache = {};
      try {
        const detailedPokemon = await Promise.all(
          allResults.map(async (poke) => {
            try {
              const detailData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${poke.name}`);
              if (!detailData.is_default) return null;
              const types = detailData.types.map((typeInfo) => typeInfo.type.name);
              let description = '';
              let speciesData = null;
              try {
                speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${detailData.id}`);
                const flavor = speciesData.flavor_text_entries?.find(
                  (entry) => entry.language.name === 'en'
                );
                description = flavor ? flavor.flavor_text.replace(/[\f\n]/g, ' ') : '';
              } catch (speciesErr) {
                description = '';
              }
              // Group by base species
              const baseSpeciesName = speciesData?.name || poke.name;
              if (!speciesCache[baseSpeciesName]) {
                // Fetch all forms/varieties for this species
                let forms = [];
                if (speciesData?.varieties?.length > 1) {
                  forms = await Promise.all(
                    speciesData.varieties.map(async (variety) => {
                      const formDetail = await fetchData(variety.pokemon.url);
                      return {
                        ...formDetail,
                        id: formDetail.id,
                        name: formDetail.name,
                        is_default: variety.is_default,
                        types: formDetail.types.map((t) => t.type.name),
                        sprite: formDetail.sprites?.other?.["official-artwork"]?.front_default || formDetail.sprites?.front_default,
                        formName: variety.pokemon.name !== baseSpeciesName ? variety.pokemon.name.replace(baseSpeciesName, '').replace(/^-/, '').replace(/-/g, ' ').trim() : '',
                        description,
                      };
                    })
                  );
                } else {
                  forms = [{
                    ...detailData,
                    id: detailData.id,
                    name: detailData.name,
                    is_default: true,
                    types,
                    sprite: detailData.sprites?.other?.["official-artwork"]?.front_default || detailData.sprites?.front_default,
                    formName: '',
                    description,
                  }];
                }
                // Sort forms: default first
                forms.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
                speciesCache[baseSpeciesName] = {
                  default: forms.find(f => f.is_default) || forms[0],
                  forms,
                  id: detailData.id,
                };
              }
              return null; // We build speciesCache, not a flat list
            } catch (err) {
              return null;
            }
          })
        );
        setSpeciesMap(speciesCache);
        // Set default form selections
        setFormSelections(Object.fromEntries(Object.keys(speciesCache).map(k => [k, 0])));
      } catch (mainErr) {
        setSpeciesMap({});
      }
    }
    fetchDetails();
  }, [data]);

  // --- AND Filtering logic ---
  const filteredSpecies = Object.entries(speciesMap).filter(([speciesName, group]) => {
    const poke = group.default;
    const nameMatch = poke.name.toLowerCase().includes(search.toLowerCase());
    // AND logic: must match ALL selected types
    const typeMatch = typeFilter.length === 0 || (poke.types && typeFilter.every(type => poke.types.includes(type)));
    // AND logic: must match ALL selected generations
    const idForGen = poke.id || extractIdFromUrl(poke.url);
    const generation = getGeneration(idForGen);
    const genMatch = genFilter.length === 0 || genFilter.every(g => g === generation);
    // Starters/Legendary/Mythical/Ultra Beast
    const starterMatch = !starterFilter || starterIds.has(Number(idForGen));
    const legendaryMatch = !legendaryFilter || legendaryIds.has(Number(idForGen));
    const mythicalMatch = !mythicalFilter || mythicalIds.has(Number(idForGen));
    const ultraBeastMatch = !ultraBeastFilter || ultraBeastIds.has(Number(idForGen));
    // Form archetypes
    const alolanMatch = !alolanFilter || alolanIds.has(Number(idForGen));
    const galarianMatch = !galarianFilter || galarianIds.has(Number(idForGen));
    const hisuianMatch = !hisuianFilter || hisuianIds.has(Number(idForGen));
    const paldeanMatch = !paldeanFilter || paldeanIds.has(Number(idForGen));
    // Favorites
    const idForFav = poke.id || extractIdFromUrl(poke.url);
    const favoriteMatch = !showOnlyFavorites || isPokemonFavorite(idForFav);
    return nameMatch && typeMatch && genMatch && starterMatch && legendaryMatch && mythicalMatch && ultraBeastMatch && alolanMatch && galarianMatch && hisuianMatch && paldeanMatch && favoriteMatch;
  });

  // Helper to get ID number from poke object for sorting
  function getId(poke) {
    return poke.id || (poke.url ? parseInt(extractIdFromUrl(poke.url)) : null);
  }

  // Helper to get primary type name safely for sorting
  function getPrimaryType(poke) {
    if (poke.types && poke.types.length > 0) {
      return poke.types[0];
    }
    return "";
  }

  // Sort filtered list based on sortOrder
  const sortedPokemon = [...filteredSpecies].sort((a, b) => {
    const pokeA = a[1]?.default;
    const pokeB = b[1]?.default;
    if (!pokeA || !pokeB) return 0;
    if (sortOrder === "name-asc") {
      return pokeA.name.localeCompare(pokeB.name);
    }
    if (sortOrder === "name-desc") {
      return pokeB.name.localeCompare(pokeA.name);
    }
    if (sortOrder === "id-asc") {
      return getId(pokeA) - getId(pokeB);
    }
    if (sortOrder === "id-desc") {
      return getId(pokeB) - getId(pokeA);
    }
    if (sortOrder === "type") {
      return getPrimaryType(pokeA).localeCompare(getPrimaryType(pokeB));
    }
    return 0;
  });

  const loading = !data && !error;
  const isLoadingMore = isValidating && size > 0;
  const isReachingEnd = data && data[data.length - 1]?.results.length < pageSize;

  // --- Static list of all Pokémon types (from API or hardcoded) ---
  const ALL_POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying',
    'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Get all available types for filter (now static, not from loaded data)
  const allTypes = ALL_POKEMON_TYPES;
  // Get all generations for filter (already static)
  const allGens = [...Array(9).keys()].map(i => i + 1); // Generations 1-9

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      // Toggle filters with keyboard
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowFilters(prev => !prev);
      }
      
      // Toggle view mode with keyboard
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
      }
      
      // Toggle favorites with keyboard
      if (e.key === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowOnlyFavorites(prev => !prev);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // We're removing this duplicate click handler as it's handled by fix-navigation.js
  // Adding debug logging to help track navigation issues
  useEffect(() => {
    console.log('Pokedex page loaded, navigation should be handled by fix-navigation.js');
    
    // Log when cards are rendered to help debug
    const logCardRendered = () => {
      console.log('Pokemon cards rendered and ready for navigation');
    };
    
    // Small timeout to ensure cards are rendered
    const timeoutId = setTimeout(logCardRendered, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // --- Add this mapping for type hex colors (from tailwind.config.js) ---
  const typeHexColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };
  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }
  function getTypeRgba(type, alpha) {
    return hexToRgba(typeHexColors[type?.toLowerCase()] || '#e5e7eb', alpha);
  }

  // --- GLOBAL SHINY LOGIC ---
  const NATIONAL_DEX_MIN = 1;
  const NATIONAL_DEX_MAX = 1025; // Update if new Pokémon are added
  const [globalShinyId, setGlobalShinyId] = useState(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let shinyId = sessionStorage.getItem('globalShinyId');
      if (!shinyId) {
        shinyId = String(
          Math.floor(Math.random() * (NATIONAL_DEX_MAX - NATIONAL_DEX_MIN + 1)) + NATIONAL_DEX_MIN
        );
        sessionStorage.setItem('globalShinyId', shinyId);
      }
      setGlobalShinyId(shinyId);
    }
  }, []);

  // Helper to get shiny sprite URL
  function getShinySpriteUrl(id) {
    return id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png` : "/back-card.png";
  }

  // Click outside to close filter panel
  useEffect(() => {
    if (!showFilters) return;
    function handleClickOutside(event) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  // --- Grey out unavailable filter options ---
  // Use the correct list for filter logic
  const allDefaultPokemon = Object.values(speciesMap).map(g => g.default);
  function isTypeAvailable(type) {
    if (typeFilter.includes(type)) return true;
    // Would adding this type result in any matches?
    return allDefaultPokemon.some(poke =>
      [...typeFilter, type].every(t => poke.types.includes(t)) &&
      (genFilter.length === 0 || genFilter.every(g => getGeneration(poke.id) === g)) &&
      (!starterFilter || starterIds.has(poke.id)) &&
      (!legendaryFilter || legendaryIds.has(poke.id)) &&
      (!mythicalFilter || mythicalIds.has(poke.id)) &&
      (!ultraBeastFilter || ultraBeastIds.has(poke.id))
    );
  }
  // --- Generation filter logic ---
  // All generations are always available at the start
  function isGenAvailable(gen) {
    // If no generation is selected, all are available
    if (genFilter.length === 0) return true;
    // If a generation is already selected, only that one is available
    return genFilter.includes(gen);
  }

  // When a generation is selected, load more Pokémon if needed (prevent infinite loop)
  const lastGenLoad = useRef({ gen: null, size: 0 });
  useEffect(() => {
    if (genFilter.length === 1 && data && !loading) {
      const genMaxDex = {
        1: 151, 2: 251, 3: 386, 4: 493, 5: 649, 6: 721, 7: 809, 8: 905, 9: 1025
      };
      const maxDex = genMaxDex[genFilter[0]];
      let loadedMax = 0;
      Object.values(speciesMap).forEach(g => {
        if (g.default && g.default.id > loadedMax) loadedMax = g.default.id;
      });
      // Only load more if not already requested for this gen/size
      if (
        loadedMax < maxDex &&
        (!lastGenLoad.current.gen || lastGenLoad.current.gen !== genFilter[0] || lastGenLoad.current.size !== size)
      ) {
        setSize(size + 1);
        lastGenLoad.current = { gen: genFilter[0], size: size + 1 };
      }
    }
  }, [genFilter, data, loading, speciesMap, setSize, size, isReachingEnd]);

  // --- Determine if any filter is active (for filter button highlight) ---
  const anyFilterActive = typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter || ultraBeastFilter || alolanFilter || galarianFilter || hisuianFilter || paldeanFilter;

  // Eagerly load all Pokémon matching filters
  const lastRequestedSize = useRef(size);
  const lastFilterSignature = useRef('');
  useEffect(() => {
    if (!data || loading || isReachingEnd) return;

    // Create a signature for the current filter state
    const filterSignature = JSON.stringify({
      typeFilter, genFilter, starterFilter, legendaryFilter, mythicalFilter, ultraBeastFilter, search
    });

    // If filters changed, reset lastRequestedSize
    if (lastFilterSignature.current !== filterSignature) {
      lastRequestedSize.current = size;
      lastFilterSignature.current = filterSignature;
    }

    // Only load more if not already loading, not at end, and haven't already requested this size
    if (
      (filteredSpecies.length < Object.keys(speciesMap).length || filteredSpecies.length === 0) &&
      !isReachingEnd &&
      !isValidating &&
      size === lastRequestedSize.current
    ) {
      setSize(size + 1);
      lastRequestedSize.current = size + 1;
    }
  }, [
    typeFilter, genFilter, starterFilter, legendaryFilter, mythicalFilter, ultraBeastFilter, search,
    size, data, loading, isReachingEnd, filteredSpecies.length, speciesMap, setSize, isValidating
  ]);

  // --- Eagerly load all Pokémon when sortOrder changes ---
  useEffect(() => {
    if (!data || loading) return;
    // If not all Pokémon are loaded, keep loading more
    if (!isReachingEnd) {
      setSize(size + 1);
    }
    // No dependency on sortOrder here, so we trigger on sortOrder change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Pokédex Gallery</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded"></div>
      </div>
      
      {/* Enhanced toolbar - fixed position on scroll */}
      <div className="sticky top-0 z-10 pt-3 pb-3 -mx-4 px-4 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar with enhanced design */}
          <div className="relative flex-grow flex items-center gap-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-3 pl-10 pr-10 text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              placeholder="Search Pokémon by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Filter button right next to search bar */}
            <button 
              className={`ml-2 px-3 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                (showFilters || typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter)
                  ? 'border-2 border-blue-600 text-blue-700 bg-blue-50 shadow-sm' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => setShowFilters(prev => !prev)}
              title="Toggle filters"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {(typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                  {typeFilter.length + genFilter.length + (starterFilter ? 1 : 0) + (legendaryFilter ? 1 : 0) + (mythicalFilter ? 1 : 0)}
                </span>
              )}
              {/* Spinner while filters are updating */}
              {isValidating && (showFilters || typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter) && (
                <span className="ml-1 animate-spin text-blue-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </span>
              )}
            </button>
          </div>
          {/* Grid/List toggle and other controls to the right */}
          <div className="flex flex-wrap gap-2 justify-between md:justify-end items-center">
            {/* Function buttons (no filter button here) */}
            <div className="flex gap-2">
              <button 
                className={`px-3 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                  showOnlyFavorites 
                    ? 'border-2 border-blue-600 text-blue-700 bg-blue-50 shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-700'
                }`}
                onClick={() => setShowOnlyFavorites(prev => !prev)}
                title="Show favorites only"
              >
                <svg width="18" height="18" fill={showOnlyFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
              </button>
              
              {/* Sort dropdown - update label and options */}
              <div className="relative">
                <label htmlFor="sortOrder" className="sr-only">Sort by...</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 pr-8 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="id-asc">Pokédex # ↑</option>
                  <option value="id-desc">Pokédex # ↓</option>
                  <option value="name-asc">A → Z</option>
                  <option value="name-desc">Z → A</option>
                  <option value="type">By Type</option>
                </select>
                <svg 
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" 
                  width="16" 
                  height="16" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* Grid/List toggle group as a toggle switch - moved to end */}
            <div className="flex items-center ml-auto">
              <span className={`text-xs font-medium mr-2 ${viewMode === 'grid' ? 'text-blue-700' : 'text-gray-400 dark:text-gray-500'}`}>Grid</span>
              <button
                className={"relative w-14 h-8 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-200 focus:outline-none border-2 border-gray-300 dark:border-gray-600 focus-visible:ring-0"}
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                title={viewMode === 'grid' ? 'Switch to List view' : 'Switch to Grid view'}
                aria-pressed={viewMode === 'list'}
              >
                {/* Slider */}
                <span
                  className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${viewMode === 'grid' ? 'translate-x-0' : 'translate-x-6'}`}
                ></span>
                {/* Icons inside toggle */}
                <span className="absolute left-2 top-1.5 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                <span className="absolute right-2 top-1.5 text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </span>
                <span className="sr-only">Toggle between grid and list view</span>
              </button>
              <span className={`text-xs font-medium ml-2 ${viewMode === 'list' ? 'text-blue-700' : 'text-gray-400 dark:text-gray-500'}`}>List</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Filters panel */}
      {showFilters && (
        <div ref={filterPanelRef} className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-6 animate-slideDown">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <svg width="22" height="22" className="mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold">Filter Pokémon</h3>
            </div>
            <div className="text-xs text-gray-500">
              {typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter || ultraBeastFilter || alolanFilter || galarianFilter || hisuianFilter || paldeanFilter ? 
                `${typeFilter.length + genFilter.length + (starterFilter ? 1 : 0) + (legendaryFilter ? 1 : 0) + (mythicalFilter ? 1 : 0) + (ultraBeastFilter ? 1 : 0) + (alolanFilter ? 1 : 0) + (galarianFilter ? 1 : 0) + (hisuianFilter ? 1 : 0) + (paldeanFilter ? 1 : 0)} filters applied` : 
                'No filters applied'}
            </div>
          </div>

          {/* Selected section for active filters */}
          {(typeFilter.length > 0 || genFilter.length > 0 || starterFilter || legendaryFilter || mythicalFilter || ultraBeastFilter || alolanFilter || galarianFilter || hisuianFilter || paldeanFilter) && (
            <div className="mb-6">
              <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <svg width="16" height="16" className="text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {typeFilter.map(type => (
                  <TypeBadge key={type} type={type} size="sm" className="mr-1" onClick={() => setTypeFilter(prev => prev.filter(t => t !== type))} clickable />
                ))}
                {genFilter.map(gen => (
                  <span key={gen} className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-medium mr-1">
                    <span className="mr-1">Gen {gen}</span>
                    <button
                      className="ml-1 text-red-700 dark:text-red-300 hover:text-red-500 focus:outline-none"
                      onClick={() => setGenFilter(prev => prev.filter(g => g !== gen))}
                      title={`Remove Gen ${gen} filter`}
                      aria-label={`Remove Gen ${gen} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {starterFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium mr-1">
                    <span className="mr-1">Starter</span>
                    <button className="ml-1 text-green-700 hover:text-red-500 focus:outline-none" onClick={() => setStarterFilter(false)} title="Remove Starter filter" aria-label="Remove Starter filter">×</button>
                  </span>
                )}
                {legendaryFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mr-1">
                    <span className="mr-1">Legendary</span>
                    <button className="ml-1 text-blue-700 hover:text-red-500 focus:outline-none" onClick={() => setLegendaryFilter(false)} title="Remove Legendary filter" aria-label="Remove Legendary filter">×</button>
                  </span>
                )}
                {mythicalFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mr-1">
                    <span className="mr-1">Mythical</span>
                    <button className="ml-1 text-purple-700 hover:text-red-500 focus:outline-none" onClick={() => setMythicalFilter(false)} title="Remove Mythical filter" aria-label="Remove Mythical filter">×</button>
                  </span>
                )}
                {ultraBeastFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium mr-1">
                    <span className="mr-1">Ultra Beast</span>
                    <button className="ml-1 text-yellow-700 hover:text-red-500 focus:outline-none" onClick={() => setUltraBeastFilter(false)} title="Remove Ultra Beast filter" aria-label="Remove Ultra Beast filter">×</button>
                  </span>
                )}
                {alolanFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium mr-1">
                    <span className="mr-1">Alolan</span>
                    <button className="ml-1 text-pink-700 hover:text-red-500 focus:outline-none" onClick={() => setAlolanFilter(false)} title="Remove Alolan filter" aria-label="Remove Alolan filter">×</button>
                  </span>
                )}
                {galarianFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium mr-1">
                    <span className="mr-1">Galarian</span>
                    <button className="ml-1 text-indigo-700 hover:text-red-500 focus:outline-none" onClick={() => setGalarianFilter(false)} title="Remove Galarian filter" aria-label="Remove Galarian filter">×</button>
                  </span>
                )}
                {hisuianFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium mr-1">
                    <span className="mr-1">Hisuian</span>
                    <button className="ml-1 text-orange-700 hover:text-red-500 focus:outline-none" onClick={() => setHisuianFilter(false)} title="Remove Hisuian filter" aria-label="Remove Hisuian filter">×</button>
                  </span>
                )}
                {paldeanFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium mr-1">
                    <span className="mr-1">Paldean</span>
                    <button className="ml-1 text-red-700 hover:text-red-500 focus:outline-none" onClick={() => setPaldeanFilter(false)} title="Remove Paldean filter" aria-label="Remove Paldean filter">×</button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type filter with visual enhancements */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h4 className="font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
                <svg width="16" height="16" className="mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                By Type
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                {allTypes.filter(type => !typeFilter.includes(type)).map(type => (
                  <TypeBadge
                    key={type}
                    type={type}
                    size="sm"
                    className={`cursor-pointer transition-all transform hover:scale-105 active:scale-95 border-2 rounded-full px-2 py-1 text-sm font-semibold
          ${typeFilter.includes(type)
            ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 shadow-md'
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
          ${!isTypeAvailable(type) ? 'opacity-30 pointer-events-none grayscale' : ''}`}
                    onClick={() => isTypeAvailable(type) && setTypeFilter(prev => [...prev, type])}
                    clickable
                  />
                ))}
              </div>
            </div>
            {/* Generation filter with visual enhancements */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h4 className="font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
                <svg width="16" height="16" className="mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                By Generation
              </h4>
              <div className="flex flex-wrap gap-2 items-center">
                {allGens.filter(gen => !genFilter.includes(gen)).map(gen => (
                  <button
                    key={gen}
                    className={`px-3 py-1.5 text-sm rounded-md border-2 font-semibold transition-all transform hover:scale-105 active:scale-95
          ${genFilter.includes(gen)
            ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 shadow-md'
            : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
          ${!isGenAvailable(gen) ? 'opacity-30 pointer-events-none' : ''}`}
                    onClick={() => isGenAvailable(gen) && setGenFilter(prev => [...prev, gen])}
                  >
                    Gen {gen}
                  </button>
                ))}
              </div>
            </div>
            {/* Other filter options */}
            <div className="col-span-1 md:col-span-2 flex gap-6 mt-6 flex-wrap">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={starterFilter} onChange={e => setStarterFilter(e.target.checked)} className="accent-green-500" />
                Starters
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={legendaryFilter} onChange={e => setLegendaryFilter(e.target.checked)} className="accent-blue-500" />
                Legendary
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={mythicalFilter} onChange={e => setMythicalFilter(e.target.checked)} className="accent-purple-500" />
                Mythical
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={ultraBeastFilter} onChange={e => setUltraBeastFilter(e.target.checked)} className="accent-yellow-500" />
                Ultra Beast
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={alolanFilter} onChange={e => setAlolanFilter(e.target.checked)} className="accent-pink-500" />
                Alolan
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={galarianFilter} onChange={e => setGalarianFilter(e.target.checked)} className="accent-indigo-500" />
                Galarian
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={hisuianFilter} onChange={e => setHisuianFilter(e.target.checked)} className="accent-orange-500" />
                Hisuian
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input type="checkbox" checked={paldeanFilter} onChange={e => setPaldeanFilter(e.target.checked)} className="accent-red-500" />
                Paldean
              </label>
            </div>
          </div>
          <div className="flex justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span className="hidden sm:inline">Tip: Use </span>
              <kbd className="mx-1 px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl</kbd>
              <span className="hidden sm:inline">+</span>
              <kbd className="mx-1 px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">F</kbd>
              <span className="hidden sm:inline">to toggle filters</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-1 font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus:ring-offset-2"
                onClick={() => {
                  setTypeFilter([]);
                  setGenFilter([]);
                  setStarterFilter(false);
                  setLegendaryFilter(false);
                  setMythicalFilter(false);
                  setShowOnlyFavorites(false);
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear Filters
              </button>
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all flex items-center gap-1 font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus:ring-offset-2"
                onClick={() => setShowFilters(false)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6" : "flex flex-col gap-3"}>
          {Array.from({ length: pageSize }).map((_, index) => (
            <PokemonCardSkeleton key={index} viewMode={viewMode} cardSize={cardSize} />
          ))}
        </div>
      ) : error && (!data || data.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 opacity-30 rounded-full"></div>
            <svg className="w-24 h-24 text-red-500 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Connection Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md text-center">
            We encountered a problem while loading Pokémon data. This might be due to network issues or API limitations.
          </p>
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Enhanced grid view with modern cards */}
          {viewMode === 'grid' ? (
            <StaggeredChildren baseDelay={50} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {sortedPokemon.map(([speciesName, group], idx) => {
                const forms = group.forms;
                const selectedFormIdx = formSelections[speciesName] || 0;
                const poke = forms[selectedFormIdx];
                const pokeId = String(poke.id);
                const isFavorite = isPokemonFavorite(pokeId);
                const sizeClasses = {
                  'compact': 'w-22 h-22 sm:w-28 sm:h-28',
                  'regular': 'w-32 h-32 sm:w-36 sm:h-36',
                  'large': 'w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48'
                };
                const primaryType = poke.types && poke.types.length > 0 ? poke.types[0] : null;
                const isShiny = pokeId === globalShinyId;
                const imageUrl = isShiny ? getShinySpriteUrl(poke.id) : poke.sprite || getOfficialArtworkSpriteUrl(poke.id);
                return (
                  <FadeIn key={poke.id || poke.name} duration={400}>
                    <Link href={toLowercaseUrl(`/pokedex/${pokeId}`)} passHref legacyBehavior>
                      <a className="block cursor-pointer" data-pokemon-card="true" data-pokemon-id={pokeId}>
                        <CardHover className="flex flex-col items-center rounded-xl bg-gradient-to-br p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md group relative transition-all duration-300 overflow-hidden">
                          {/* Favorite button in top-left corner, above image, inside card */}
                          <button
                            className={`absolute top-2 left-2 z-30 p-1.5 rounded-full transition-all transform shadow-md bg-white/90 dark:bg-gray-900/80 opacity-60 hover:opacity-100 focus:opacity-100 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                            onClick={e => { e.stopPropagation(); e.preventDefault(); togglePokemonFavorite(pokeId); }}
                            data-no-navigate="true"
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 2.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {/* Pokédex number moved to top-right */}
                          <div className="absolute top-2 right-2 font-bold text-xs md:text-sm text-black/40 dark:text-white/30 z-20">
                            #{pokeId.padStart(3, '0')}
                          </div>
                          {/* Pokemon image with enhanced container - transparent background */}
                          <div className="relative flex items-center justify-center w-full mb-3 z-10 cursor-pointer">
                            <div className="absolute inset-0 rounded-full bg-transparent dark:bg-transparent transform scale-75 group-hover:scale-90 transition-transform duration-300"></div>
                            <Image
                              src={imageUrl}
                              alt={poke.name + (isShiny ? ' (Shiny)' : '')}
                              width={120}
                              height={120}
                              className={`${sizeClasses[cardSize]} object-contain drop-shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 z-10`}
                              onError={(e) => {
                                e.currentTarget.src = "/back-card.png";
                              }}
                              priority={false}
                            />
                            {/* Easter egg: sparkle icon if shiny */}
                            {isShiny && (
                              <span className="absolute top-7 right-2 text-yellow-400 animate-pulse drop-shadow-md" title="Shiny Pokémon!">
                                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.27 7.82 22 9 14.14l-5-4.87 5.91-.91z" />
                                </svg>
                              </span>
                            )}
                          </div>
                          {/* Pokemon name with enhanced typography */}
                          <h3 className="capitalize font-extrabold text-[1.45rem] text-center mb-1 group-hover:text-primary transition-colors truncate w-full px-1 z-10">
                            {poke.name.replace(/-/g, ' ')}{poke.formName ? ` (${poke.formName})` : ''}
                          </h3>
                          <div className="flex gap-1.5 mt-1 flex-wrap justify-center items-center z-10">
                            {poke.types && poke.types.map(type => (
                              <TypeBadge key={type} type={type} size="md" className="shadow-md text-[1.05em]" />
                            ))}
                          </div>
                        </CardHover>
                      </a>
                    </Link>
                  </FadeIn>
                );
              })}
            </StaggeredChildren>
          ) : (
            /* Enhanced list view with modern design */
            <StaggeredChildren baseDelay={50} className="flex flex-col gap-3">
              {sortedPokemon.map(([speciesName, group], idx) => {
                const forms = group.forms;
                const selectedFormIdx = formSelections[speciesName] || 0;
                const poke = forms[selectedFormIdx];
                const pokeId = String(poke.id);
                const isFavorite = isPokemonFavorite(pokeId);
                const types = poke.types || [];
                const primaryType = types[0] || null;
                const secondaryType = types[1] || null;
                const thirdType = types[2] || null;
                let leftBg = theme === 'dark' ? '#1f2937' : '#fff';
                let bgGradient = '';
                if (primaryType && secondaryType && thirdType) {
                  bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${leftBg} 20%, ${getTypeRgba(primaryType,0.11)} 50%, ${getTypeRgba(secondaryType,0.11)} 80%, ${getTypeRgba(thirdType,0.11)} 100%)`;
                } else if (primaryType && secondaryType) {
                  bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${leftBg} 20%, ${getTypeRgba(primaryType,0.10)} 55%, ${getTypeRgba(secondaryType,0.10)} 100%)`;
                } else if (primaryType) {
                  bgGradient = `linear-gradient(90deg, ${leftBg} 0%, ${leftBg} 28%, ${getTypeRgba(primaryType,0.09)} 100%)`;
                } else {
                  bgGradient = 'none';
                }
                const isShiny = pokeId === globalShinyId;
                const imageUrl = isShiny ? getShinySpriteUrl(poke.id) : getOfficialArtworkSpriteUrl(poke.id);
                return (
                  <FadeIn key={poke.id || poke.name} duration={400}>
                    <Link href={toLowercaseUrl(`/pokedex/${pokeId}`)} passHref legacyBehavior>
                      <a className="block cursor-pointer" data-pokemon-card="true" data-pokemon-id={pokeId}>
                        <div
                          className="group flex items-center bg-white dark:bg-gray-800 p-3 md:p-3 rounded-lg border border-gray-200/80 dark:border-gray-700/80 hover:border-primary/30 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden min-h-[82px] h-[100px]"
                          style={{ background: bgGradient, maxHeight: 120 }}
                        >
                          {/* Background decorative element based on type */}
                          {primaryType && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:to-primary/5 transition-colors duration-500"></div>
                          )}
                          {/* Pokemon ID watermark */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-5xl opacity-5 dark:opacity-10 pointer-events-none select-none">
                            #{pokeId.padStart(3, '0')}
                          </div>
                          {/* Pokemon image with square container, not reduced */}
                          <div className="relative flex-shrink-0 mr-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 rounded-md">
                              <Image
                                src={imageUrl}
                                alt={poke.name + (isShiny ? ' (Shiny)' : '')}
                                width={80}
                                height={80}
                                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src = "/back-card.png";
                                }}
                              />
                              {isShiny && (
                                <span className="absolute top-6 right-1 text-yellow-400 animate-pulse drop-shadow-md" title="Shiny Pokémon!">
                                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.09 6.26L20 9.27l-5 4.87L16.18 22 12 18.27 7.82 22 9 14.14l-5-4.87 5.91-.91z" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Pokemon details with reduced layout and font sizes */}
                          <div className="flex-grow pr-4 min-w-0 flex flex-col justify-start">
                            {/* Name and types stacked, description inline after types */}
                            <div className="flex flex-col items-start min-w-0">
                              <h3 className="capitalize font-extrabold text-[1.45rem] group-hover:text-primary transition-colors mb-0 leading-tight">
                                {poke.name.replace(/-/g, ' ')}
                              </h3>
                              <div className="flex flex-row gap-1 items-center justify-center w-full mb-1">
                                {poke.types && poke.types.map(type => (
                                  <TypeBadge key={type} type={type} size="md" className="shadow-md text-[1.05em]" />
                                ))}
                                {/* Description starts after types, on same line */}
                                {poke.description && (
                                  <span className="ml-3 text-base text-gray-700 dark:text-gray-200 font-medium break-words align-middle truncate" style={{ fontSize: '1.13rem', lineHeight: 1.28, minWidth: 0, flex: 1 }} title={poke.description}>
                                    {poke.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </FadeIn>
                );
              })}
            </StaggeredChildren>
          )}
          
          {/* Enhanced Empty state */}
          {!loading && sortedPokemon.length === 0 && (
            <div className="text-center py-16 px-4 animate-fadeIn bg-white/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-sm shadow-sm">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 opacity-30 rounded-full animate-ping"></div>
                <svg className="w-24 h-24 text-gray-400 dark:text-gray-500 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Pokémon Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                {typeFilter.length > 0 || genFilter.length > 0 || showOnlyFavorites || search ? 
                  "Try adjusting your search criteria or filters to see more results." :
                  "There seems to be an issue loading the Pokémon data. Please try again."}
              </p>
              
              <button 
                className="mt-6 px-5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center gap-2 mx-auto transition-all"
                onClick={() => {
                  setSearch("");
                  setTypeFilter([]);
                  setGenFilter([]);
                  setShowOnlyFavorites(false);
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            </div>
          )}
          
          {/* Load more trigger */}
          {!loading && !isReachingEnd && (
            <>
              <LoadMoreTrigger onLoadMore={() => setSize(size + 1)} />
              {/* Loading spinner overlay when loading more */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/80 dark:bg-gray-900/80 shadow-lg border border-gray-200 dark:border-gray-700 animate-fadeIn">
                    <svg className="animate-spin w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="sr-only">Loading more Pokémon...</span>
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Enhanced Card size selector with tooltip */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <div className="absolute -top-10 right-0 transform translate-y-0 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none">
            <div className="bg-gray-900/90 text-white text-sm py-1 px-3 rounded shadow-lg whitespace-nowrap">
              Adjust card size
            </div>
            <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900/90 transform rotate-45"></div>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100/50 dark:border-gray-700/50 p-2 flex gap-2 transition-all hover:shadow-xl">
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
                cardSize === 'compact' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCardSize('compact')}
              title="Compact view"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
                cardSize === 'regular' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCardSize('regular')}
              title="Regular view"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
                cardSize === 'large' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setCardSize('large')}
              title="Large view"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
