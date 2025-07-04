import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import pokemon from "pokemontcgsdk";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations";
import { useTheme } from "../context/themecontext";
import { useViewSettings } from "../context/viewsettingscontext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "../components/ui/LoadingSpinner";
import { SetLoadingScreen } from "../components/ui/UnifiedLoadingScreen";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

export default function TcgSets() {
  const [sets, setSets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();
  const { viewSettings } = useViewSettings();

  // Filter options
  const [filterSeries, setFilterSeries] = useState("");
  const [sortOption, setSortOption] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    async function fetchSets() {
      setLoading(true);
      setError(null);
      try {
        const res = await pokemon.set.all();
        setSets(res);
      } catch (err) {
        setError("Failed to load TCG sets. Please try again later.");
        setSets([]);
      }
      setLoading(false);
    }
    fetchSets();
  }, []);

  // Extract unique series for filtering
  const uniqueSeries = useMemo(() => {
    if (!sets || !Array.isArray(sets)) return [];
    const seriesSet = new Set();
    sets.forEach(set => {
      if (set.series) {
        seriesSet.add(set.series);
      }
    });
    return Array.from(seriesSet).sort();
  }, [sets]);

  // Filter sets by search query and series
  const filteredSets = useMemo(() => {
    if (!sets || !Array.isArray(sets)) return [];
    return sets.filter((set) => {
      let matches = set.name.toLowerCase().includes(search.toLowerCase());
      
      if (filterSeries && set.series) {
        matches = matches && set.series === filterSeries;
      }
      
      return matches;
    });
  }, [sets, search, filterSeries]);

  // Sort the filtered sets
  const sortedSets = useMemo(() => {
    return [...filteredSets].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "releaseDate":
          comparison = new Date(a.releaseDate || "1970-01-01") - new Date(b.releaseDate || "1970-01-01");
          break;
        case "cardCount":
          comparison = (a.total || 0) - (b.total || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredSets, sortOption, sortDirection]);

  // Infinite scroll for sets
  const { visibleItems: visibleSets, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedSets, 
    20, // Initial visible count
    10  // Load 10 more at a time
  );

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <FadeIn>
        <h1 className="text-3xl font-bold text-center mb-8">Pokémon TCG Sets</h1>
        
        <div className={`p-6 rounded-xl shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="searchInput" className="block text-sm font-medium mb-1">Search Sets</label>
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Search for a set (e.g., Base, Evolving Skies)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="seriesFilter" className="block text-sm font-medium mb-1">Filter by Series</label>
              <select
                id="seriesFilter"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filterSeries}
                onChange={(e) => setFilterSeries(e.target.value)}
              >
                <option value="">All Series</option>
                {uniqueSeries.map(series => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortOption" className="block text-sm font-medium mb-1">Sort By</label>
              <select
                id="sortOption"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="releaseDate">Release Date</option>
                <option value="name">Name</option>
                <option value="cardCount">Card Count</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortDirection" className="block text-sm font-medium mb-1">Order</label>
              <select
                id="sortDirection"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <button 
              className="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              onClick={() => {
                setSearch("");
                setFilterSeries("");
                setSortOption("releaseDate");
                setSortDirection("desc");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </FadeIn>
      
      {loading ? (
        <SetLoadingScreen 
          message="Loading TCG sets..."
          preventFlash={true}
        />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      ) : (
        <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleSets.map((set) => (
            <CardHover
              key={set.id}
              className="animate-fadeIn"
              onClick={() => {
                setSelectedSetId(set.id);
                router.push(`/tcgsets/${set.id}`);
              }}
            >
              <div 
                className={`relative flex flex-col h-full rounded-xl overflow-hidden shadow-md border ${
                  selectedSetId === set.id 
                    ? 'border-blue-500 ring-2 ring-blue-500' 
                    : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Set Image Background */}
                {set.images?.logo && (
                  <div className="relative h-32 w-full bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4 overflow-hidden">
                    {set.images.symbol && (
                      <div className="absolute opacity-10 w-full h-full flex items-center justify-center">
                        <img
                          src={set.images.symbol}
                          alt=""
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    )}
                    <img
                      src={set.images.logo}
                      alt={set.name}
                      className="max-h-20 max-w-[80%] object-contain z-10"
                      draggable="false"
                    />
                  </div>
                )}
                
                {/* Set Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-bold text-lg">{set.name}</h2>
                  
                  {set.series && (
                    <p className="text-sm text-gray-500 mb-2">{set.series}</p>
                  )}
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Released</p>
                      <p className="font-medium">{set.releaseDate || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cards</p>
                      <p className="font-medium">{set.total || "?"}</p>
                    </div>
                  </div>
                  
                  {/* View Set Button */}
                  <div className="mt-4">
                    <button 
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm"
                    >
                      View Cards
                    </button>
                  </div>
                </div>
              </div>
            </CardHover>
          ))}
        </StaggeredChildren>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div 
          ref={sentinelRef} 
          className="h-4 w-full flex items-center justify-center mt-8"
        >
          {scrollLoading && (
            <InlineLoadingSpinner 
              text="Loading more sets..." 
            />
          )}
        </div>
      )}

      {/* Show scroll hint */}
      {!loading && !error && hasMore && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {visibleSets.length} of {sortedSets.length} sets
          <div className="text-xs text-primary mt-1">
            Scroll down to load more...
          </div>
        </div>
      )}

      {!loading && !scrollLoading && !hasMore && sortedSets.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          All {sortedSets.length} sets loaded
        </div>
      )}
      
      {!loading && !error && sortedSets.length === 0 && (
        <div className="text-center py-16">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
          </svg>
          <h3 className="text-xl font-bold mt-4">No Sets Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            onClick={() => {
              setSearch("");
              setFilterSeries("");
              setSortOption("releaseDate");
              setSortDirection("desc");
            }}
          >
            Show All Sets
          </button>
        </div>
      )}
    </div>
  );
}