import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations/animations";
import { fetchJSON } from "../utils/unifiedFetch";
import { useTheme } from "../context/UnifiedAppContext";
import { useViewSettings } from "../context/UnifiedAppContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { createGlassStyle, GradientButton, CircularButton } from '../components/ui/design-system';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../components/ui/glass-components';
import { motion } from 'framer-motion';
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import TCGSetsErrorBoundary from "../components/TCGSetsErrorBoundary";
import { CardSet } from "../types/api/cards";
import { PaginationInfo } from "../types/api/api-responses";
import { NextPage } from "next";
import logger from "../utils/logger";
import { getErrorMessage, isObject, hasProperty } from "../utils/typeGuards";

type SortOption = "releaseDate" | "name" | "cardCount";
type SortDirection = "asc" | "desc";

const TcgSetsContent: React.FC = () => {
  const [sets, setSets] = useState<CardSet[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalSetsCount, setTotalSetsCount] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Loading TCG sets...");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const router = useRouter();
  const { theme } = useTheme();
  const { viewSettings } = useViewSettings();

  // Filter options
  const [filterSeries, setFilterSeries] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("releaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchSets = async (page = 1, append = false) => {
      logger.debug(`Fetching TCG sets page ${page}...`);
      
      if (!append) {
        setLoading(true);
        setLoadingMessage("Loading TCG sets...");
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      try {
        const res = await fetchJSON<{ data: CardSet[], pagination: PaginationInfo }>(
          `/api/tcg-sets?page=${page}&pageSize=25`,
          {
            useCache: page > 1,
            forceRefresh: page === 1 && !append,
            timeout: 60000,
            retries: 2,
            retryDelay: 2000
          }
        );
        
        // Check if response is null (error case)
        if (!res) {
          logger.error(`Failed to fetch page ${page} - response is null`);
          throw new Error('API returned null response');
        }
        
        // Debug logging
        logger.debug(`Page ${page} response:`, {
          dataLength: res?.data?.length || 0,
          pagination: res?.pagination,
          hasData: !!res?.data
        });
        
        if (res?.data && res.data.length > 0) {
          if (append) {
            setSets(prevSets => [...prevSets, ...res.data]);
          } else {
            setSets(res.data);
          }
          
          setTotalSetsCount(res.pagination?.totalCount || res.data.length);
          setCurrentPage(page);
          
          // Check if there are more pages
          const hasMore = res.pagination?.hasMore || (res.data.length === 25);
          setHasMorePages(hasMore);
          
          logger.debug(`✓ Successfully fetched ${res.data.length} sets from page ${page}`);
          
          // Log newest sets on first page
          if (page === 1) {
            const sortedByDate = [...res.data].sort((a, b) => 
              new Date(b.releaseDate || '1970-01-01').getTime() - new Date(a.releaseDate || '1970-01-01').getTime()
            );
            logger.debug('Newest 5 sets:', { sets: sortedByDate.slice(0, 5).map(s => `${s.id} (${s.name}, ${s.releaseDate})`) });
          }
        } else {
          if (!append) {
            setSets([]);
          }
          setHasMorePages(false);
        }
        
      } catch (err: unknown) {
        logger.error("Failed to load TCG sets:", {
          error: getErrorMessage(err),
          response: isObject(err) && hasProperty(err, 'response') ? err.response : undefined,
          data: isObject(err) && hasProperty(err, 'data') ? err.data : undefined,
          stack: err instanceof Error ? err.stack : undefined
        });
        
        setError(`Failed to load TCG sets: ${getErrorMessage(err)}`);
        if (!append) {
          setSets([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
  };
  
  const loadMoreSets = async () => {
    if (!loadingMore && hasMorePages) {
      await fetchSets(currentPage + 1, true);
    }
  };

  useEffect(() => {
    fetchSets(1, false);
  }, []);


  // Extract unique series for filtering
  const uniqueSeries = useMemo(() => {
    if (!sets || !Array.isArray(sets)) return [];
    const seriesSet = new Set<string>();
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
          comparison = new Date(a.releaseDate || "1970-01-01").getTime() - new Date(b.releaseDate || "1970-01-01").getTime();
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
    <FullBleedWrapper gradient="pokedex">
      <div className="section-spacing-y-default max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn pt-8">
          <FadeIn>
            {/* Hero Section with Glass Effect */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={createGlassStyle({ 
                blur: 'xl', 
                opacity: 'strong', 
                gradient: true, 
                rounded: 'xl',
                shadow: 'xl'
              })} style={{ 
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 255, 0.95))'
              }}>
                <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                  Pokémon TCG Collection
                </h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium">
                  Discover every Trading Card Game set from Base Set to the latest releases
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <div className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 shadow-lg">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{sets.length} Sets Available</span>
                  </div>
                  <div className="px-4 py-2 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 shadow-lg">
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400">Thousands of Cards</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Search and Filters Card with Glass Effect */}
            <motion.div 
              className={createGlassStyle({ 
                blur: 'xl', 
                opacity: 'medium', 
                gradient: false, 
                rounded: 'xl',
                shadow: 'xl'
              })}
              style={{ 
                padding: '2rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 255, 0.9))'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Search and Filters */}
              <div className="flex flex-col gap-6">
                {/* Enhanced Search Bar */}
                <div className="relative">
                  <UnifiedSearchBar
                    placeholder="Search for a set (e.g., Base, Evolving Skies)"
                    value={search}
                    onChange={setSearch}
                    size="lg"
                    variant="default"
                    showSearchButton={false}
                    className="w-full"
                  />
                </div>
                
                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-end">
            
                  <div className="flex-1">
                    <label htmlFor="seriesFilter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Series</label>
                    <div className="relative">
                      <select
                        id="seriesFilter"
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-10"
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
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-10"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
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
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-10"
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value as SortDirection)}
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
            
                  <GradientButton
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setSearch("");
                      setFilterSeries("");
                      setSortOption("releaseDate");
                      setSortDirection("desc");
                    }}
                  >
                    Clear Filters
                  </GradientButton>
                  <GradientButton
                    variant="primary"
                    size="md"
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      
                      // Clear cache for TCG sets to ensure fresh data
                      try {
                        // Clear localStorage cache for TCG sets
                        const cacheKeys = Object.keys(localStorage).filter(key => 
                          key.includes('tcg-sets') || key.includes('tcgsets')
                        );
                        cacheKeys.forEach(key => localStorage.removeItem(key));
                        logger.debug(`Cleared ${cacheKeys.length} cached TCG sets entries`);
                      } catch (e) {
                        logger.warn('Failed to clear cache:', { error: e instanceof Error ? e.message : String(e) });
                      }
                      
                      await fetchSets(1, false);
                    }}
                    disabled={loading}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    Refresh Sets
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </FadeIn>
      
      {loading ? (
        <LoadingStateGlass message={loadingMessage} />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <EmptyStateGlass
                type="error"
                title="Error Loading Sets"
                message={error}
                actionButton={{
                  text: "Try Again",
                  onClick: () => {
                    setLoading(true);
                    setError(null);
                    fetchSets();
                  },
                  variant: "danger"
                }}
              />
            </motion.div>
          ) : (
            <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {visibleSets.map((set: CardSet, index) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    logger.debug('Navigating to set:', { setId: set.id, setName: set.name });
                    setSelectedSetId(set.id);
                    router.push(`/tcgsets/${set.id}`);
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`h-full rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-gray-800/95 dark:via-purple-900/30 dark:to-pink-900/30 shadow-2xl border border-white/50 dark:border-gray-700/50 ${
                      selectedSetId === set.id 
                        ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                        : ''
                    }`}
                  >
                    {/* Set Image Background with Glass Overlay */}
                    {set.images?.logo && (
                      <div className="relative h-48 w-full bg-gradient-to-br from-purple-200/50 via-pink-200/40 to-blue-200/50 dark:from-purple-800/30 dark:via-pink-800/20 dark:to-blue-800/30 flex items-center justify-center p-6 overflow-hidden">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 animate-pulse" />
                        
                        {/* Glass overlay */}
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />
                        
                        <img
                          src={set.images.logo}
                          alt={set.name}
                          className="max-h-28 max-w-[85%] object-contain z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                          draggable="false"
                        />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                      </div>
                    )}
                
                    {/* Set Info with Glass Sections */}
                    <div className="p-6 flex-1 flex flex-col relative">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{set.name}</h3>
                      
                      {set.series && (
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6">{set.series}</p>
                      )}
                      
                      <div className="mt-auto space-y-3 mb-6">
                        {/* Release Date Glass Card */}
                        <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-100/70 to-pink-100/70 dark:from-purple-900/30 dark:to-pink-900/30 p-4 border border-purple-200/40 dark:border-purple-700/40 shadow-md">
                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">Released</p>
                          <p className="text-xl font-black text-purple-900 dark:text-purple-100">{set.releaseDate || "Unknown"}</p>
                        </div>
                        
                        {/* Card Count Glass Card */}
                        <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-blue-100/70 to-indigo-100/70 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 border border-blue-200/40 dark:border-blue-700/40 shadow-md">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">Total Cards</p>
                          <p className="text-xl font-black text-blue-900 dark:text-blue-100">{set.total || "?"}</p>
                        </div>
                      </div>
                      
                      {/* View Set Button with Glass Effect */}
                      <button className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl transform transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
                        <span className="flex items-center justify-center gap-2">
                          View Cards
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
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
                  <InlineLoader text="Loading more sets..." />
                </div>
              )}
            </div>
          )}
          
          {/* Load More Button */}
          {!loading && hasMorePages && sets.length > 0 && (
            <div className="text-center mt-8">
              <GradientButton
                variant="primary"
                size="lg"
                onClick={loadMoreSets}
                disabled={loadingMore}
                icon={loadingMore ? undefined : 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                }
              >
                {loadingMore ? (
                  'Loading...'
                ) : (
                  `Load More Sets (${sets.length} of ${totalSetsCount || '?'} loaded)`
                )}
              </GradientButton>
            </div>
          )}

          {/* Show scroll hint with Glass Effect */}
          {!loading && !error && hasMore && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full px-8 py-4 shadow-xl border border-white/50 dark:border-gray-700/50">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Showing {visibleSets.length} of {sortedSets.length} filtered sets
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({sets.length} sets loaded{totalSetsCount ? ` out of ${totalSetsCount} available` : ''})
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                  <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-sm">Scroll for more</span>
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !scrollLoading && !hasMore && sortedSets.length > 0 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-3 backdrop-blur-xl bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full px-8 py-4 shadow-xl border border-green-200/50 dark:border-green-700/50">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">
                  All {sortedSets.length} sets displayed
                  {totalSetsCount && totalSetsCount > sortedSets.length && 
                    ` (${totalSetsCount - sortedSets.length} filtered out)`
                  }
                </span>
              </div>
            </motion.div>
          )}
      
          {!loading && !error && sortedSets.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmptyStateGlass
                title="No Sets Found"
                message="Try adjusting your search criteria or clear all filters"
                iconText="🃏"
                actionButton={{
                  text: "Clear All Filters",
                  onClick: () => {
                    setSearch("");
                    setFilterSeries("");
                    setSortOption("releaseDate");
                    setSortDirection("desc");
                  },
                  variant: "primary"
                }}
              />
            </motion.div>
          )}
          <script>
            {`
              // Prefetch the individual set pages for faster navigation
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  const links = document.querySelectorAll('a[href^="/tcgsets/"]');
                  links.forEach(link => {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                  });
                });
              }
            `}
          </script>
          <script>
            {`
              // Initialize search analytics
              const searchInput = document.getElementById('searchInput');
              let searchTimer;
              
              searchInput?.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                  if (window.analyticsEngine) {
                    window.analyticsEngine.trackSearch({
                      query: e.target.value,
                      type: 'tcg_sets',
                      resultsCount: document.querySelectorAll('[data-set-card]').length
                    });
                  }
                }, 1000);
              });
            `}
          </script>
          <script>
            {`
              // Smooth scroll to top when filters change
              const filterElements = document.querySelectorAll('select');
              filterElements.forEach(el => {
                el.addEventListener('change', () => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              });
            `}
          </script>
        </div>
      </FullBleedWrapper>
    );
  };
  
  const TcgSets: NextPage = () => {
    return (
      <>
        <Head>
          <title>TCG Sets - Pokemon Card Sets | DexTrends</title>
          <meta name="description" content="Browse all Pokemon TCG sets, from classic Base Set to the latest releases. Explore card counts, release dates, and complete set information" />
        </Head>
        <TCGSetsErrorBoundary>
          <TcgSetsContent />
        </TCGSetsErrorBoundary>
      </>
    );
  };

  // Mark this page as full bleed to remove Layout padding
  type PageComponent = NextPage & {
    fullBleed?: boolean;
  };
  
  (TcgSets as PageComponent).fullBleed = true;

  export default TcgSets;