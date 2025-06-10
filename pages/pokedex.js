// filepath: /Users/moazzam/Documents/GitHub/Mappy/DexTrends/pages/pokedex.js
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import { useSorting } from "../context/sortingcontext";
import { useTheme } from "../context/themecontext";
import { useFavorites } from "../context/favoritescontext";
import { useViewSettings } from "../context/viewsettingscontext";
import { TypeBadge, TypeBadgeSelector } from "../components/ui/TypeBadge"; // Updated path
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
  const router = useRouter();
  const { sortOrder, setSortOrder } = useSorting();
  const { theme } = useTheme();
  const { favorites, togglePokemonFavorite, isPokemonFavorite } = useFavorites();
  const { viewSettings, updateSetting } = useViewSettings();
  
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState([]);
  const [genFilter, setGenFilter] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Initialize from localStorage or viewSettings if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pokedex-view') || viewSettings?.pokemonView || 'grid';
    }
    return 'grid'; // Default
  });
  
  const [cardSize, setCardSize] = useState(() => {
    // Initialize from localStorage or viewSettings if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pokedex-size') || viewSettings?.cardSize || 'regular';
    }
    return 'regular'; // Default
  });

  // Save view preferences to both localStorage and context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokedex-view', viewMode);
      updateSetting('pokemonView', viewMode);
      
      localStorage.setItem('pokedex-size', cardSize);
      updateSetting('cardSize', cardSize);
    }
  }, [viewMode, cardSize, updateSetting]);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetchData); // Use fetchData for SWR

  // Flatten pages and fetch detailed info for each pokemon
  const [pokemonList, setPokemonList] = useState([]);
  useEffect(() => {
    async function fetchDetails() {
      if (!data) return;
      const allResults = data.flatMap((page) => page.results);
      try {
        const detailedPokemon = await Promise.all(
          allResults.map(async (poke) => {
            try {
              const detailData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${poke.name}`); // Use fetchData
              if (!detailData.is_default) {
                return null; // skip non-default forms
              }
              const types = detailData.types.map((typeInfo) => typeInfo.type.name);
              return { ...poke, types, id: detailData.id };
            } catch (err) { // Catch error from fetchData
              console.error(`Failed to fetch details for ${poke.name}:`, err);
              return null; // skip failed fetches
            }
          })
        );
        setPokemonList(detailedPokemon.filter(Boolean));
      } catch (mainErr) { // Catch error from Promise.all or other parts of fetchDetails
        console.error("Error in fetchDetails:", mainErr);
        setPokemonList([]);
      }
    }
    fetchDetails();
  }, [data]);

  // Filter Pokémon by all criteria (name, type, generation, favorites)
  const filteredPokemon = pokemonList.filter((poke) => {
    // Text search
    const nameMatch = poke.name.toLowerCase().includes(search.toLowerCase());
    
    // Type filtering - match if any of the Pokémon's types matches any selected type
    const typeMatch = typeFilter.length === 0 || 
      (poke.types && poke.types.some(type => typeFilter.includes(type)));
    
    // Generation filtering
    const idForGen = poke.id || extractIdFromUrl(poke.url);
    const generation = getGeneration(idForGen);
    const genMatch = genFilter.length === 0 || genFilter.includes(generation);
    
    // Favorites filtering
    const idForFav = poke.id || extractIdFromUrl(poke.url);
    const favoriteMatch = !showOnlyFavorites || 
      isPokemonFavorite(idForFav);
    
    return nameMatch && typeMatch && genMatch && favoriteMatch;
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
  const sortedPokemon = [...filteredPokemon].sort((a, b) => {
    if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortOrder === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortOrder === "id-asc") {
      return getId(a) - getId(b);
    }
    if (sortOrder === "id-desc") {
      return getId(b) - getId(a);
    }
    if (sortOrder === "type") {
      // Sort by primary type name
      return getPrimaryType(a).localeCompare(getPrimaryType(b));
    }
    return 0;
  });

  const loading = !data && !error;
  const isLoadingMore = isValidating && size > 0;
  const isReachingEnd = data && data[data.length - 1]?.results.length < pageSize;

  // Get all available types for filter
  const allTypes = [...new Set(pokemonList.flatMap(poke => poke.types || []))].sort();
  
  // Get all generations for filter
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

  return (
    <div className="container section-spacing-y-default max-w-7xl mx-auto px-4 animate-fadeIn">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">Pokédex Gallery</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded"></div>
      </div>
      
      {/* Enhanced toolbar - fixed position on scroll */}
      <div className="sticky top-0 z-10 pt-3 pb-3 -mx-4 px-4 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar with enhanced design */}
          <div className="relative flex-grow">
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
            {search && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setSearch('')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Control buttons in groups */}
          <div className="flex flex-wrap gap-2 justify-between md:justify-end items-center">
            {/* View toggle group */}
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              <button
                className={`px-3 py-2.5 rounded-l-lg border flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                className={`px-3 py-2.5 rounded-r-lg border-t border-b border-r flex items-center gap-1.5 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
            
            {/* Function buttons */}
            <div className="flex gap-2">
              <button 
                className={`px-3 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                  showFilters 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setShowFilters(prev => !prev)}
                title="Toggle filters"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
                {(typeFilter.length > 0 || genFilter.length > 0) && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                    {typeFilter.length + genFilter.length}
                  </span>
                )}
              </button>
              
              <button 
                className={`px-3 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                  showOnlyFavorites 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => setShowOnlyFavorites(prev => !prev)}
                title="Show favorites only"
              >
                <svg width="18" height="18" fill={showOnlyFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
              </button>
              
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 pr-8 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="id-asc">№ (Asc)</option>
                  <option value="id-desc">№ (Desc)</option>
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
          </div>
        </div>
      </div>
      
      {/* Enhanced Filters panel */}
      {showFilters && (
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-6 animate-slideDown">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <svg width="22" height="22" className="mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold">Filter Pokémon</h3>
            </div>
            <div className="text-xs text-gray-500">
              {typeFilter.length > 0 || genFilter.length > 0 ? 
                `${typeFilter.length + genFilter.length} filters applied` : 
                'No filters applied'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type filter with visual enhancements */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h4 className="font-medium mb-3 flex items-center text-gray-700 dark:text-gray-300">
                <svg width="16" height="16" className="mr-1.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                By Type
              </h4>
              <div className="flex flex-wrap gap-2">
                {allTypes.map(type => (
                  <TypeBadge
                    key={type}
                    type={type}
                    className={`cursor-pointer transition-all transform hover:scale-105 active:scale-95 ${
                      typeFilter.includes(type) ? 
                        'ring-2 ring-primary ring-offset-2 shadow-md' : 
                        'opacity-80 hover:opacity-100'
                    }`}
                    onClick={() => {
                      if (typeFilter.includes(type)) {
                        setTypeFilter(prev => prev.filter(t => t !== type));
                      } else {
                        setTypeFilter(prev => [...prev, type]);
                      }
                    }}
                  />
                ))}
                {typeFilter.length > 0 && (
                  <button 
                    className="px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all"
                    onClick={() => setTypeFilter([])}
                  >
                    Clear Types
                  </button>
                )}
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
              <div className="flex flex-wrap gap-2">
                {allGens.map(gen => (
                  <button
                    key={gen}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all transform hover:scale-105 active:scale-95 ${
                      genFilter.includes(gen) 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => {
                      if (genFilter.includes(gen)) {
                        setGenFilter(prev => prev.filter(g => g !== gen));
                      } else {
                        setGenFilter(prev => [...prev, gen]);
                      }
                    }}
                  >
                    Gen {gen} {generationNames?.[gen] ? `(${generationNames[gen]})` : ''}
                  </button>
                ))}
                {genFilter.length > 0 && (
                  <button 
                    className="px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all"
                    onClick={() => setGenFilter([])}
                  >
                    Clear Generations
                  </button>
                )}
              </div>
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
            
            <button 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center gap-1"
              onClick={() => {
                setTypeFilter([]);
                setGenFilter([]);
                setShowOnlyFavorites(false);
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All Filters
            </button>
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
              {sortedPokemon.map((poke) => {
                // poke.id should be reliably populated by fetchDetails. Fallback is a safety.
                const pokeId = poke.id ? String(poke.id) : (poke.url ? extractIdFromUrl(poke.url) : null);
                const isFavorite = isPokemonFavorite(pokeId);
                const generation = getGeneration(pokeId);
                const sizeClasses = {
                  'compact': 'w-22 h-22 sm:w-28 sm:h-28',
                  'regular': 'w-32 h-32 sm:w-36 sm:h-36',
                  'large': 'w-40 h-40 sm:w-44 sm:h-44 lg:w-48 lg:h-48'
                };
                const primaryType = poke.types && poke.types.length > 0 ? poke.types[0] : null;
                
                // FIX: Use Link component for proper navigation with data attributes
                return (
                  <FadeIn key={poke.id || poke.name} duration={400}>
                    <Link href={toLowercaseUrl(`/pokedex/${pokeId}`)} passHref legacyBehavior>
                      <a className="block cursor-pointer" data-pokemon-card="true" data-pokemon-id={pokeId}>
                        <CardHover
                          className="flex flex-col items-center rounded-xl bg-gradient-to-br p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md group relative transition-all duration-300 overflow-hidden"
                        >
                          <button
                            className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-all transform ${
                              isFavorite
                                ? 'text-red-500 bg-red-50 dark:bg-red-900/30 shadow-sm rotate-0'
                                : 'text-gray-400 bg-gray-100/70 dark:bg-gray-800/70 opacity-0 group-hover:opacity-100 hover:rotate-12'
                            }`}
                            onClick={(e) => {
                              // These calls prevent navigation events from bubbling
                              e.stopPropagation();
                              e.preventDefault();
                              togglePokemonFavorite(pokeId);
                            }}
                            data-no-navigate="true"
                            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg width="18" height="18" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="transform transition-transform duration-300">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 2.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          {/* Decorative background element */}
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gray-100/50 dark:bg-gray-700/30 z-0"></div>
                          {/* Pokemon ID indicator */}
                          <div className="absolute top-3 left-3 opacity-20 font-bold text-2xl text-black/30 dark:text-white/20">
                            #{pokeId.padStart(3, '0')}
                          </div>
                          {/* Pokemon image with enhanced container - transparent background */}
                          <div className="relative flex items-center justify-center w-full mb-3 z-10 cursor-pointer">
                            <div className="absolute inset-0 rounded-full bg-transparent dark:bg-transparent transform scale-75 group-hover:scale-90 transition-transform duration-300"></div>
                            <Image
                              src={getOfficialArtworkSpriteUrl(poke.id)}
                              alt={poke.name}
                              width={120}
                              height={120}
                              className={`${sizeClasses[cardSize]} object-contain drop-shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-2 z-10`}
                              onError={(e) => {
                                e.currentTarget.src = "/back-card.png";
                              }}
                              priority={false}
                            />
                            {/* Generation badge with enhanced design */}
                            <div className="absolute bottom-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-blue-400/30 z-20">
                              {generation}
                            </div>
                          </div>
                          {/* Pokemon name with enhanced typography */}
                          <h3 className="capitalize font-bold text-sm md:text-base text-center mb-1 group-hover:text-primary transition-colors truncate w-full px-1 z-10">
                            {poke.name.replace(/-/g, ' ')}
                          </h3>
                          {/* Type badges with improved layout */}
                          <div className="flex gap-1.5 mt-1 flex-wrap justify-center z-10">
                            {poke.types && poke.types.map(type => (
                              <TypeBadge key={type} type={type} size="sm" className="shadow-sm" />
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
              {sortedPokemon.map((poke) => {
                const pokeId = poke.id ? String(poke.id) : poke.url.split("/").filter(Boolean).pop();
                const isFavorite = isPokemonFavorite(pokeId);
                const generation = getGeneration(pokeId);
                const primaryType = poke.types && poke.types.length > 0 ? poke.types[0] : null;
                
                // FIX: Use Link component for proper navigation with data attributes
                return (
                  <FadeIn key={poke.id || poke.name} duration={400}>
                    <Link href={toLowercaseUrl(`/pokedex/${pokeId}`)} passHref legacyBehavior>
                      <a className="block cursor-pointer" data-pokemon-card="true" data-pokemon-id={pokeId}>
                        <div
                          className="group flex items-center bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 hover:border-primary/30 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
                        >
                          {/* Background decorative element based on type */}
                          {primaryType && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:to-primary/5 transition-colors duration-500"></div>
                          )}
                          {/* Pokemon ID watermark */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-6xl opacity-5 dark:opacity-10 pointer-events-none">
                            #{pokeId.padStart(3, '0')}
                          </div>
                          {/* Pokemon image with enhanced container */}
                          <div className="relative flex-shrink-0 mr-5">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <Image
                                src={getOfficialArtworkSpriteUrl(poke.id)}
                                alt={poke.name}
                                width={80}
                                height={80}
                                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.src = "/back-card.png";
                                }}
                              />
                            </div>
                            {/* Generation badge - enhanced */}
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-white dark:border-gray-800">
                              {generation}
                            </div>
                          </div>
                          {/* Pokemon details with enhanced layout */}
                          <div className="flex-grow pr-10">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                              <h3 className="capitalize font-bold text-lg group-hover:text-primary transition-colors">
                                {poke.name.replace(/-/g, ' ')}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-mono border border-gray-200 dark:border-gray-600">
                                #{pokeId.padStart(3, '0')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {poke.types && poke.types.map(type => (
                                <TypeBadge key={type} type={type} size="sm" className="shadow-sm" />
                              ))}
                            </div>
                          </div>
                          {/* Favorite button with animation */}
                          <div className="flex-shrink-0 absolute right-4 top-1/2 -translate-y-1/2">
                            <button
                              className={`p-2 rounded-full transition-all duration-300 transform ${
                                isFavorite
                                  ? 'bg-red-50 dark:bg-red-500/20 text-red-500'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 opacity-70 group-hover:opacity-100 hover:scale-110'
                              }`}
                              onClick={(e) => {
                                // These calls prevent navigation events from bubbling
                                e.stopPropagation();
                                e.preventDefault();
                                togglePokemonFavorite(pokeId);
                              }}
                              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                              data-no-navigate="true"
                            >
                              <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"
                                className={isFavorite ? "animate-pulse-once" : ""}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 2.5 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
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
            <LoadMoreTrigger onLoadMore={() => setSize(size + 1)} />
          )}
          
          {/* Enhanced loading more indicator */}
          {isLoadingMore && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="mt-3 text-gray-500 dark:text-gray-400">Loading more Pokémon...</p>
            </div>
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
