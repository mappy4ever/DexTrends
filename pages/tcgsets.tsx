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
        // Always clear loading state
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
    fetchSets(1, false).catch(err => {
      console.error('Failed to fetch initial sets:', err);
    });
  }, []);


  // Replace inline scripts with proper useEffect hooks
  useEffect(() => {
    // Initialize search analytics
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const searchInput = document.getElementById('searchInput');
      let searchTimer: NodeJS.Timeout;
      
      const handleSearchInput = (e: Event) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          const target = e.target as HTMLInputElement;
          if ((window as any).analyticsEngine) {
            (window as any).analyticsEngine.trackSearch({
              query: target.value,
              type: 'tcg_sets',
              resultsCount: document.querySelectorAll('[data-set-card]').length
            });
          }
        }, 1000);
      };
      
      searchInput?.addEventListener('input', handleSearchInput);
      
      return () => {
        searchInput?.removeEventListener('input', handleSearchInput);
        clearTimeout(searchTimer);
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    // Smooth scroll to top when filters change
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const filterElements = document.querySelectorAll('select');
      
      const handleFilterChange = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      
      filterElements.forEach(el => {
        el.addEventListener('change', handleFilterChange);
      });
      
      return () => {
        filterElements.forEach(el => {
          el.removeEventListener('change', handleFilterChange);
        });
      };
    }
    return undefined;
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
      <div className="section-spacing-y-default max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 animate-fadeIn pt-4 xs:pt-6 sm:pt-8 overflow-x-hidden">
          <FadeIn>
            {/* Hero Section with Glass Effect */}
            <motion.div 
              className="text-center mb-6 xs:mb-8 sm:mb-12"
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
                padding: '1.5rem 1rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 240, 255, 0.95))'
              }}>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black mb-3 xs:mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                  Pokémon TCG Collection
                </h1>
                <p className="text-base xs:text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto font-medium">
                  Discover every Trading Card Game set from Base Set to the latest releases
                </p>
                <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 mt-4 xs:mt-5 sm:mt-6">
                  <div className="px-3 xs:px-4 py-1.5 xs:py-2 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 shadow-lg">
                    <span className="text-xs xs:text-sm font-bold text-purple-600 dark:text-purple-400">{sets.length} Sets Available</span>
                  </div>
                  <div className="px-3 xs:px-4 py-1.5 xs:py-2 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/50 shadow-lg">
                    <span className="text-xs xs:text-sm font-bold text-pink-600 dark:text-pink-400">Thousands of Cards</span>
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
                padding: '0.75rem',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 255, 0.9))',
                overflow: 'hidden'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Enhanced Search Bar */}
                <div className="relative w-full overflow-hidden">
                  <UnifiedSearchBar
                    placeholder="Search sets..."
                    value={search}
                    onChange={setSearch}
                    size="md"
                    variant="default"
                    showSearchButton={false}
                    className="w-full"
                  />
                </div>
                
                {/* Filter Controls - Stack on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch">
            
                  <div className="flex-1">
                    <label htmlFor="seriesFilter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Filter by Series</label>
                    <div className="relative">
                      <select
                        id="seriesFilter"
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-xs sm:text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-8 sm:pr-10 appearance-none"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-xs sm:text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-8 sm:pr-10 appearance-none"
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
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-xs sm:text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all pr-8 sm:pr-10 appearance-none"
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
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setFilterSeries("");
                      setSortOption("releaseDate");
                      setSortDirection("desc");
                    }}
                    className="text-xs sm:text-sm min-w-0"
                  >
                    Clear
                  </GradientButton>
                  <GradientButton
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      setLoading(true);
                      setError(null);
                      
                      // Clear cache for TCG sets to ensure fresh data
                      try {
                        if (typeof window !== 'undefined') {
                          // Clear localStorage cache for TCG sets
                          const cacheKeys = Object.keys(localStorage).filter(key => 
                            key.includes('tcg-sets') || key.includes('tcgsets')
                          );
                          cacheKeys.forEach(key => localStorage.removeItem(key));
                          logger.debug(`Cleared ${cacheKeys.length} cached TCG sets entries`);
                        }
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
                    Refresh
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </FadeIn>
      
      {loading && sets.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center py-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pokeball Loader */}
          <motion.div
            className="relative w-24 h-24 mb-8"
            animate={{ 
              rotate: [0, 360]
            }}
            transition={{
              duration: 1, 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
          >
            {/* Pokeball SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Top half - red */}
              <path
                d="M 50 5 A 45 45 0 0 1 95 50 H 5 A 45 45 0 0 1 50 5"
                fill="#ff1744"
              />
              {/* Bottom half - white */}
              <path
                d="M 50 95 A 45 45 0 0 1 5 50 H 95 A 45 45 0 0 1 50 95"
                fill="#ffffff"
                stroke="#e0e0e0"
                strokeWidth="1"
              />
              {/* Center line */}
              <rect x="5" y="48" width="90" height="4" fill="#333333" />
              {/* Center button outer ring */}
              <circle
                cx="50"
                cy="50"
                r="12"
                fill="#ffffff"
                stroke="#333333"
                strokeWidth="4"
              />
              {/* Inner button with pulse */}
              <motion.circle
                cx="50"
                cy="50"
                r="5"
                fill="#333333"
                animate={{
                  r: [5, 6, 5]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
          
          {/* Loading Text with Animation */}
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {loadingMessage}
            </h3>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
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
            <motion.div 
              className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              {visibleSets.map((set: CardSet, index) => (
                <motion.div
                  key={set.id}
                  variants={{
                    hidden: { 
                      opacity: 0, 
                      y: 30,
                      scale: 0.9
                    },
                    show: { 
                      opacity: 1, 
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }
                  }}
                  className="group cursor-pointer"
                  onClick={() => {
                    logger.debug('Navigating to set:', { setId: set.id, setName: set.name });
                    setSelectedSetId(set.id);
                    router.push(`/tcgsets/${set.id}`);
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`h-full rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/80 dark:from-gray-800/95 dark:via-purple-900/30 dark:to-pink-900/30 shadow-xl sm:shadow-2xl border border-white/50 dark:border-gray-700/50 ${
                      selectedSetId === set.id 
                        ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                        : ''
                    }`}
                  >
                    {/* Set Image Background with Glass Overlay */}
                    {set.images?.logo && (
                      <div className="relative h-36 xs:h-40 sm:h-48 w-full bg-gradient-to-br from-purple-200/50 via-pink-200/40 to-blue-200/50 dark:from-purple-800/30 dark:via-pink-800/20 dark:to-blue-800/30 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/20 animate-pulse" />
                        
                        {/* Glass overlay */}
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />
                        
                        <img
                          src={set.images.logo}
                          alt={set.name}
                          className="max-h-20 xs:max-h-24 sm:max-h-28 max-w-[80%] xs:max-w-[85%] object-contain z-10 drop-shadow-xl sm:drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                          draggable="false"
                          loading="lazy"
                        />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                      </div>
                    )}
                
                    {/* Set Info with Glass Sections */}
                    <div className="p-3 xs:p-4 sm:p-6 flex-1 flex flex-col relative">
                      <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 xs:mb-2">{set.name}</h3>
                      
                      {set.series && (
                        <p className="text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 xs:mb-4 sm:mb-6">{set.series}</p>
                      )}
                      
                      <div className="mt-auto space-y-2 xs:space-y-3 mb-3 xs:mb-4 sm:mb-6">
                        {/* Release Date Glass Card */}
                        <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-100/70 to-pink-100/70 dark:from-purple-900/30 dark:to-pink-900/30 p-2.5 xs:p-3 sm:p-4 border border-purple-200/40 dark:border-purple-700/40 shadow-md">
                          <p className="text-[10px] xs:text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-0.5 xs:mb-1">Released</p>
                          <p className="text-base xs:text-lg sm:text-xl font-black text-purple-900 dark:text-purple-100">{set.releaseDate || "Unknown"}</p>
                        </div>
                        
                        {/* Card Count Glass Card */}
                        <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-blue-100/70 to-indigo-100/70 dark:from-blue-900/30 dark:to-indigo-900/30 p-2.5 xs:p-3 sm:p-4 border border-blue-200/40 dark:border-blue-700/40 shadow-md">
                          <p className="text-[10px] xs:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-0.5 xs:mb-1">Total Cards</p>
                          <p className="text-base xs:text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100">{set.total || "?"}</p>
                        </div>
                      </div>
                      
                      {/* View Set Button with Glass Effect */}
                      <button className="w-full py-2.5 xs:py-3 px-4 xs:px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm xs:text-base shadow-xl transform transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
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
            </motion.div>
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
          <script dangerouslySetInnerHTML={{
            __html: `
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
            `
          }} />
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