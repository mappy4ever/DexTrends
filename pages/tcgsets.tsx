import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../components/ui/animations/animations";
import { fetchJSON } from "../utils/unifiedFetch";
import { useTheme } from "../context/UnifiedAppContext";
import { useViewSettings } from "../context/UnifiedAppContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { StandardCard, CardHeader, CardTitle, CardContent, CircularButton } from "../components/ui/design-system";
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import TCGSetsErrorBoundary from "../components/TCGSetsErrorBoundary";
import { CardSet } from "../types/api/cards";
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
    <FullBleedWrapper gradient="tcg">
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
            <div className="panel-base mb-8">
              {/* Search and Filters */}
              <div className="flex flex-col gap-6">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    id="searchInput"
                    type="text"
                    className="w-full pl-12 pr-4 py-3 glass-light rounded-full text-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
                        className="w-full px-4 py-2 glass-light rounded-full text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-10"
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
                        className="w-full px-4 py-2 glass-light rounded-full text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-10"
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
                        className="w-full px-4 py-2 glass-light rounded-full text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-10"
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
                  <button 
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
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
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Sets
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
      
      {loading ? (
        <PageLoader text={loadingMessage} />
          ) : error ? (
            <StandardCard 
              variant="featured"
              className="bg-red-50/80 backdrop-blur-sm border-red-200 text-center max-w-2xl mx-auto"
            >
              <CardTitle className="text-red-600">Error</CardTitle>
              <div>
                <p className="text-red-600 mt-2">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    fetchSets();
                  }}
                >
                  Try Again
                </button>
              </div>
            </StandardCard>
          ) : (
            <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleSets.map((set: CardSet) => (
                <CardHover
                  key={set.id}
                  className="animate-fadeIn group"
                  onClick={() => {
                    logger.debug('Navigating to set:', { setId: set.id, setName: set.name });
                    setSelectedSetId(set.id);
                    router.push(`/tcgsets/${set.id}`);
                  }}
                >
                  <StandardCard 
                    variant="featured"
                    gradient={true}
                    className={`h-full flex flex-col bg-gradient-to-br from-white/95 via-purple-50/20 to-pink-50/20 dark:from-gray-800/95 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm transition-all duration-300 ${
                      selectedSetId === set.id 
                        ? 'border-purple-400 dark:border-purple-600 shadow-2xl scale-105' 
                        : 'border-purple-200/30 dark:border-purple-700/30'
                    }`}
                    padding="none"
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
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <CardTitle className="text-xl mb-1">{set.name}</CardTitle>
                      
                      {set.series && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">{set.series}</p>
                      )}
                      
                      <div className="mt-auto space-y-3 mb-6">
                        <StandardCard
                          variant="compact"
                          className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/40 dark:border-purple-700/40"
                          padding="sm"
                        >
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider">Released</p>
                          <p className="font-bold text-purple-900 dark:text-purple-100 text-lg">{set.releaseDate || "Unknown"}</p>
                        </StandardCard>
                        <StandardCard
                          variant="compact"
                          className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/40 dark:border-blue-700/40"
                          padding="sm"
                        >
                          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider">Total Cards</p>
                          <p className="font-bold text-blue-900 dark:text-blue-100 text-lg">{set.total || "?"}</p>
                        </StandardCard>
                      </div>
                      
                      {/* View Set Button */}
                      <CircularButton
                        variant="primary"
                        fullWidth={true}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                      >
                        View Cards
                      </CircularButton>
                    </CardContent>
                  </StandardCard>
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
                  <InlineLoader text="Loading more sets..." />
                </div>
              )}
            </div>
          )}
          
          {/* Load More Button */}
          {!loading && hasMorePages && sets.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreSets}
                disabled={loadingMore}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `Load More Sets (${sets.length} of ${totalSetsCount || '?'} loaded)`
                )}
              </button>
            </div>
          )}

          {/* Show scroll hint */}
          {!loading && !error && hasMore && (
            <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-medium">
                    Showing {visibleSets.length} of {sortedSets.length} filtered sets
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sets.length} sets loaded{totalSetsCount ? ` out of ${totalSetsCount} available` : ''})
                  </span>
                </div>
              </div>
              <div className="text-xs text-purple-600 mt-2 font-medium">
                Scroll down to load more...
              </div>
            </div>
          )}

          {!loading && !scrollLoading && !hasMore && sortedSets.length > 0 && (
            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-6 py-3">
                <span className="text-sm font-semibold text-purple-700">
                  All {sortedSets.length} sets displayed
                  {totalSetsCount && totalSetsCount > sortedSets.length && 
                    ` (${totalSetsCount - sortedSets.length} filtered out)`
                  }
                </span>
              </div>
            </div>
          )}
      
          {!loading && !error && sortedSets.length === 0 && (
            <div className="text-center py-20">
              <StandardCard 
                variant="featured"
                className="bg-white/80 backdrop-blur-sm max-w-md mx-auto"
                padding="lg"
              >
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
                <CardTitle className="mb-2">No Sets Found</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
                <CircularButton
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setFilterSeries("");
                    setSortOption("releaseDate");
                    setSortDirection("desc");
                  }}
                >
                  Clear All Filters
                </CircularButton>
              </StandardCard>
            </div>
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
  interface PageComponent extends NextPage {
    fullBleed?: boolean;
  }
  
  (TcgSets as PageComponent).fullBleed = true;

  export default TcgSets;