import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import useSWRInfinite from "swr/infinite";
import { useSorting } from "../context/SortingContext";
import { useTheme } from "../context/ThemeContext";
import { useFavorites } from "../context/FavoritesContext";
import { useViewSettings } from "../context/ViewSettingsContext";
import { TypeBadge, TypeBadgeSelector } from "../components/ui/TypeBadge";
import { FadeIn, SlideUp, CardHover } from "../components/ui/Animations";
import { typeColors, getGeneration, generationNames } from "../utils/pokemonUtils";

const pageSize = 50;

const fetcher = (url) => fetch(url).then((res) => res.json());

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

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);

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
              const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`);
              if (!detailRes.ok) throw new Error('Failed fetch');
              const detailData = await detailRes.json();
              if (!detailData.is_default) {
                return null; // skip non-default forms
              }
              const types = detailData.types.map((typeInfo) => typeInfo.type.name);
              return { ...poke, types, id: detailData.id };
            } catch {
              return null; // skip failed fetches
            }
          })
        );
        setPokemonList(detailedPokemon.filter(Boolean));
      } catch {
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
    const generation = getGeneration(poke.id || poke.url.split("/").filter(Boolean).pop());
    const genMatch = genFilter.length === 0 || genFilter.includes(generation);
    
    // Favorites filtering
    const favoriteMatch = !showOnlyFavorites || 
      isPokemonFavorite(poke.id || poke.url.split("/").filter(Boolean).pop());
    
    return nameMatch && typeMatch && genMatch && favoriteMatch;
  });

  // Helper to get sprite URL from Pokémon API URL
  function getSpriteUrl(url) {
    const id = url.split("/").filter(Boolean).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  // Helper to get ID number from poke object for sorting
  function getId(poke) {
    return poke.id || parseInt(poke.url.split("/").filter(Boolean).pop());
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

  return (
    <div className="container section-spacing-y-default max-w-7xl mx-auto px-4 animate-fadeIn">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Pokédex Gallery</h1>
      
      {/* Search and controls bar */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="input text-lg rounded-app-md w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search Pokémon (e.g., Pikachu)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            width="20" 
            height="20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      
        {/* Control buttons */}
        <div className="flex gap-2">
          <button 
            className={`px-3 py-2 rounded-app-md flex items-center gap-2 border ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary hover:text-primary'} transition-all`}
            onClick={() => setShowFilters(prev => !prev)}
            title="Toggle filters"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          <button 
            className={`px-3 py-2 rounded-app-md flex items-center gap-2 border ${showOnlyFavorites ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary hover:text-primary'} transition-all`}
            onClick={() => setShowOnlyFavorites(prev => !prev)}
            title="Show favorites only"
          >
            <svg width="20" height="20" fill={showOnlyFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="hidden sm:inline">Favorites</span>
          </button>
          
          <button 
            className={`px-3 py-2 rounded-app-md flex items-center gap-2 border ${viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary hover:text-primary'} transition-all`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          
          <button 
            className={`px-3 py-2 rounded-app-md flex items-center gap-2 border ${viewMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-300 hover:border-primary hover:text-primary'} transition-all`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="relative w-full max-w-xs">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="input text-base rounded-app-md w-full pl-4 pr-10 py-2 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="id-asc">Pokédex Number (Lowest first)</option>
            <option value="id-desc">Pokédex Number (Highest first)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="type">Type</option>
          </select>
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
            width="20" 
            height="20" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-app-lg shadow-app-md p-4 mb-6 animate-slideUp">
          <h3 className="text-lg font-semibold mb-3">Filter Pokémon</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type filter */}
            <div>
              <h4 className="font-medium mb-2">By Type</h4>
              <div className="flex flex-wrap gap-2">
                {allTypes.map(type => (
                  <TypeBadge
                    key={type}
                    type={type}
                    className={`cursor-pointer transition-all ${typeFilter.includes(type) ? 'ring-2 ring-primary ring-offset-1' : 'opacity-80'}`}
                    onClick={() => {
                      if (typeFilter.includes(type)) {
                        setTypeFilter(prev => prev.filter(t => t !== type));
                      } else {
                        setTypeFilter(prev => [...prev, type]);
                      }
                    }}
                  />
                ))}
                {allTypes.length > 0 && (
                  <button 
                    className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:border-primary hover:text-primary"
                    onClick={() => setTypeFilter([])}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Generation filter */}
            <div>
              <h4 className="font-medium mb-2">By Generation</h4>
              <div className="flex flex-wrap gap-2">
                {allGens.map(gen => (
                  <button
                    key={gen}
                    className={`px-3 py-1 text-sm rounded-full transition-all ${
                      genFilter.includes(gen) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      if (genFilter.includes(gen)) {
                        setGenFilter(prev => prev.filter(g => g !== gen));
                      } else {
                        setGenFilter(prev => [...prev, gen]);
                      }
                    }}
                  >
                    Gen {gen}
                  </button>
                ))}
                {genFilter.length > 0 && (
                  <button 
                    className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:border-primary hover:text-primary"
                    onClick={() => setGenFilter([])}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-all"
              onClick={() => {
                setTypeFilter([]);
                setGenFilter([]);
                setShowOnlyFavorites(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-pulse">
            <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12"
              ></path>
            </svg>
          </div>
          <p className="mt-4 text-lg text-content-muted">Loading Pokémon...</p>
        </div>
      ) : error && (!data || data.length === 0) ? (
        <div className="text-center py-12 animate-fadeIn">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg text-red-500">Failed to load Pokémon</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Toggle between grid and list view */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {sortedPokemon.map((poke) => {
                const pokeId = poke.id ? String(poke.id) : poke.url.split("/").filter(Boolean).pop();
                const isFavorite = isPokemonFavorite(pokeId);
                const generation = getGeneration(pokeId);
                
                // Size classes based on selected card size
                const sizeClasses = {
                  'compact': 'w-16 h-16 sm:w-20 sm:h-20',
                  'regular': 'w-24 h-24 sm:w-28 sm:h-28',
                  'large': 'w-32 h-32 sm:w-36 sm:h-36'
                };
                
                return (
                  <CardHover
                    key={poke.name}
                    className="flex flex-col items-center rounded-app-lg bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 group relative"
                    onClick={() => router.push(`/PokeDex/${poke.name}`)}
                  >
                    {/* Favorite button */}
                    <button
                      className={`absolute top-2 right-2 z-10 p-1 rounded-full transition-all ${
                        isFavorite 
                          ? 'text-red-500 bg-red-100' 
                          : 'text-gray-400 bg-gray-100 opacity-0 group-hover:opacity-100'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePokemonFavorite(pokeId);
                      }}
                      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    
                    {/* Pokemon image with fallback */}
                    <div className="relative mb-2">
                      <Image
                        src={getSpriteUrl(poke.url)}
                        alt={poke.name}
                        width={120}
                        height={120}
                        className={`${sizeClasses[cardSize]} object-contain transition-all duration-300 group-hover:scale-110`}
                        onError={(e) => {
                          e.currentTarget.src = "/back-card.png";
                        }}
                        priority={false}
                      />
                      
                      {/* Generation badge */}
                      <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {generation}
                      </span>
                    </div>
                    
                    {/* Pokemon name */}
                    <h3 className="capitalize font-bold text-sm md:text-base text-center mt-1 group-hover:text-primary transition-colors">
                      {poke.name.replace(/-/g, ' ')}
                    </h3>
                    
                    <div className="flex items-center justify-center mt-1 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono">
                        #{pokeId.padStart(3, '0')}
                      </span>
                    </div>
                    
                    {/* Type badges */}
                    <div className="flex gap-1 mt-1">
                      {poke.types && poke.types.map(type => (
                        <TypeBadge key={type} type={type} size="sm" />
                      ))}
                    </div>
                  </CardHover>
                );
              })}
            </div>
          ) : (
            /* List view for more detailed information */
            <div className="flex flex-col gap-3">
              {sortedPokemon.map((poke) => {
                const pokeId = poke.id ? String(poke.id) : poke.url.split("/").filter(Boolean).pop();
                const isFavorite = isPokemonFavorite(pokeId);
                const generation = getGeneration(pokeId);
                
                return (
                  <div
                    key={poke.name}
                    className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-app-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    onClick={() => router.push(`/PokeDex/${poke.name}`)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <Image
                        src={getSpriteUrl(poke.url)}
                        alt={poke.name}
                        width={60}
                        height={60}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/back-card.png";
                        }}
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <h3 className="capitalize font-semibold text-lg">
                          {poke.name.replace(/-/g, ' ')}
                        </h3>
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono">
                          #{pokeId.padStart(3, '0')}
                        </span>
                        <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {generation}
                        </span>
                      </div>
                      
                      <div className="flex gap-1 mt-1">
                        {poke.types && poke.types.map(type => (
                          <TypeBadge key={type} type={type} size="sm" />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        className={`p-1 rounded-full ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePokemonFavorite(pokeId);
                        }}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg width="24" height="24" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Empty state */}
          {!loading && sortedPokemon.length === 0 && (
            <div className="text-center py-12 animate-fadeIn">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg text-gray-500">No Pokémon found</p>
              <p className="text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
          
          {/* Load more trigger */}
          {!loading && !isReachingEnd && (
            <LoadMoreTrigger onLoadMore={() => setSize(size + 1)} />
          )}
          
          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="text-center py-6">
              <div className="inline-block animate-bounce">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7-7-7M5 10l7-7 7 7"
                  ></path>
                </svg>
              </div>
              <p className="mt-2 text-content-muted">Loading more Pokémon...</p>
            </div>
          )}
        </>
      )}
      
      {/* Card size selector */}
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex gap-2">
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${cardSize === 'compact' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          onClick={() => setCardSize('compact')}
          title="Compact view"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${cardSize === 'regular' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          onClick={() => setCardSize('regular')}
          title="Regular view"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${cardSize === 'large' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          onClick={() => setCardSize('large')}
          title="Large view"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}