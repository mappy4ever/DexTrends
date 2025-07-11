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
import { FullBleedWrapper } from "../components/ui/FullBleedWrapper";

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
    <FullBleedWrapper gradient="tcg">
      <div className="min-h-screen">
        <div className="section-spacing-y-default max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn pt-8">
          <FadeIn>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Pokémon TCG Sets
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore the complete collection of Pokémon Trading Card Game sets
              </p>
            </div>
            
            {/* Search and Filters Card */}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 mb-8">
              {/* Search and Filters */}
              <div className="flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    id="searchInput"
                    type="text"
                    className="w-full pr-6 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-full text-lg focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                    placeholder="Search for a set (e.g., Base, Evolving Skies)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
            
                  <div className="flex-1">
                    <label htmlFor="seriesFilter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Series</label>
                    <div className="relative">
                      <select
                        id="seriesFilter"
                        className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                        value={filterSeries}
                        onChange={(e) => setFilterSeries(e.target.value)}
                      >
                        <option value="">All Series</option>
                        {uniqueSeries.map(series => (
                          <option key={series} value={series}>{series}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
            
                  <div className="flex-1">
                    <label htmlFor="sortOption" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                    <div className="relative">
                      <select
                        id="sortOption"
                        className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <option value="releaseDate">Release Date</option>
                        <option value="name">Name</option>
                        <option value="cardCount">Card Count</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
            
                  <div className="flex-1">
                    <label htmlFor="sortDirection" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Order</label>
                    <div className="relative">
                      <select
                        id="sortDirection"
                        className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-purple-300 dark:hover:border-purple-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value)}
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
            
                  <button 
                    className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
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
            </div>
          </FadeIn>
      
      {loading ? (
        <SetLoadingScreen 
          message="Loading TCG sets..."
          preventFlash={true}
        />
          ) : error ? (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-8 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-red-600">Error</h2>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
          ) : (
            <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleSets.map((set) => (
                <CardHover
                  key={set.id}
                  className="animate-fadeIn group"
                  onClick={() => {
                    setSelectedSetId(set.id);
                    router.push(`/tcgsets/${set.id}`);
                  }}
                >
                  <div 
                    className={`relative flex flex-col h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white/95 via-purple-50/20 to-pink-50/20 dark:from-gray-800/95 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm border transition-all duration-300 ${
                      selectedSetId === set.id 
                        ? 'border-purple-400 dark:border-purple-600 shadow-2xl scale-105' 
                        : 'border-purple-200/30 dark:border-purple-700/30 shadow-lg hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    {/* Set Image Background */}
                    {set.images?.logo && (
                      <div className="relative h-40 w-full bg-gradient-to-br from-purple-100/40 via-pink-100/30 to-indigo-100/40 flex items-center justify-center p-4 overflow-hidden group-hover:from-purple-100/60 group-hover:via-pink-100/50 group-hover:to-indigo-100/60 transition-all duration-300">
                        <img
                          src={set.images.logo}
                          alt={set.name}
                          className="max-h-24 max-w-[85%] object-contain z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                          draggable="false"
                        />
                      </div>
                    )}
                
                    {/* Set Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{set.name}</h2>
                      
                      {set.series && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">{set.series}</p>
                      )}
                      
                      <div className="mt-auto space-y-3 mb-6">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-3 border border-purple-200/40 dark:border-purple-700/40 shadow-sm">
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider">Released</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100 text-lg">{set.releaseDate || "Unknown"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-3 border border-blue-200/40 dark:border-blue-700/40 shadow-sm">
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider">Total Cards</p>
                          <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">{set.total || "?"}</p>
                        </div>
                      </div>
                      
                      {/* View Set Button */}
                      <button 
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        View Cards
                      </button>
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
              className="h-4 w-full flex items-center justify-center mt-12"
            >
              {scrollLoading && (
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <InlineLoadingSpinner 
                    text="Loading more sets..." 
                  />
                </div>
              )}
            </div>
          )}

          {/* Show scroll hint */}
          {!loading && !error && hasMore && (
            <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
                <span className="text-sm font-medium">Showing {visibleSets.length} of {sortedSets.length} sets</span>
              </div>
              <div className="text-xs text-purple-600 mt-2 font-medium">
                Scroll down to load more...
              </div>
            </div>
          )}

          {!loading && !scrollLoading && !hasMore && sortedSets.length > 0 && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-6 py-3">
                <span className="text-sm font-semibold text-purple-700">All {sortedSets.length} sets loaded</span>
              </div>
            </div>
          )}
      
          {!loading && !error && sortedSets.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 text-purple-600" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Sets Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
                <button 
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
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
            </div>
          )}
        </div>
      </div>
    </FullBleedWrapper>
  );
}

// Tell the layout this page uses full bleed
TcgSets.fullBleed = true;