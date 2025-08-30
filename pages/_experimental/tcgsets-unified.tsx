import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from 'framer-motion';
import { fetchJSON } from "../utils/unifiedFetch";
import { useTheme } from "../context/UnifiedAppContext";
import { createGlassStyle, GradientButton, CircularButton } from '../components/ui/design-system';
import { UnifiedSearchBar, EmptyStateGlass } from '../components/ui/glass-components';
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import { UnifiedGrid } from '../components/unified/UnifiedGrid';
import { CardSet } from "../types/api/cards";
import { PaginationInfo } from "../types/api/api-responses";
import { NextPage } from "next";
import logger from "../utils/logger";
import { cn } from '@/utils/cn';

type SortOption = "releaseDate" | "name" | "cardCount";
type SortDirection = "asc" | "desc";

/**
 * Unified TCG Sets Page
 * 
 * Enhanced with:
 * - UnifiedGrid with virtual scrolling for performance
 * - Preserves all existing features and animations
 * - Responsive grid without conditional rendering
 * - Optimized for large card collections
 */
const UnifiedTcgSetsPage: NextPage = () => {
  const [sets, setSets] = useState<CardSet[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalSetsCount, setTotalSetsCount] = useState<number | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [filterSeries, setFilterSeries] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("releaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchSets = async () => {
    logger.debug('Fetching all TCG sets...');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all sets at once for virtual scrolling
      const res = await fetchJSON<{ data: CardSet[], pagination: PaginationInfo }>(
        `/api/tcgexpansions?pageSize=500`, // Get all sets
        {
          useCache: true,
          timeout: 60000,
          retries: 2,
          retryDelay: 2000
        }
      );
      
      if (!res) {
        throw new Error('API returned null response');
      }
      
      if (res?.data && res.data.length > 0) {
        setSets(res.data);
        setTotalSetsCount(res.pagination?.totalCount || res.data.length);
        logger.debug(`✓ Successfully fetched ${res.data.length} sets`);
      } else {
        setSets([]);
        setTotalSetsCount(0);
      }
    } catch (error) {
      logger.error('Failed to fetch TCG sets', { error });
      setError(error instanceof Error ? error.message : 'Failed to load TCG sets');
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSets();
  }, []);

  // Get unique series for filtering
  const uniqueSeries = useMemo(() => {
    const seriesSet = new Set(sets.map(set => set.series).filter(Boolean));
    return Array.from(seriesSet).sort();
  }, [sets]);

  // Filter and sort sets
  const filteredAndSortedSets = useMemo(() => {
    let filtered = [...sets];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(set =>
        set.name.toLowerCase().includes(search.toLowerCase()) ||
        set.series?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply series filter
    if (filterSeries) {
      filtered = filtered.filter(set => set.series === filterSeries);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "releaseDate":
          comparison = new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime();
          break;
        case "cardCount":
          comparison = (a.total || 0) - (b.total || 0);
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [sets, search, filterSeries, sortOption, sortDirection]);

  // Custom card renderer for TCG sets
  const renderSetCard = (set: CardSet) => (
    <motion.div
      key={set.id}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer h-full"
      onClick={() => {
        logger.debug('Navigating to set:', { setId: set.id, setName: set.name });
        setSelectedSetId(set.id);
        router.push(`/tcgexpansions/${set.id}`);
      }}
    >
      <div className={cn(
        "h-full rounded-2xl sm:rounded-3xl overflow-hidden",
        "backdrop-blur-2xl bg-gradient-to-br",
        "from-white/95 via-purple-50/80 to-pink-50/80",
        "dark:from-gray-800/95 dark:via-purple-900/30 dark:to-pink-900/30",
        "shadow-xl sm:shadow-2xl border border-white/50 dark:border-gray-700/50",
        "transition-all duration-300",
        selectedSetId === set.id && 'ring-4 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
      )}>
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
          <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 xs:mb-2">
            {set.name}
          </h3>
          
          {set.series && (
            <p className="text-xs xs:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 xs:mb-4 sm:mb-6">
              {set.series}
            </p>
          )}
          
          <div className="mt-auto space-y-2 xs:space-y-3 mb-3 xs:mb-4 sm:mb-6">
            {/* Release Date Glass Card */}
            <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-100/70 to-pink-100/70 dark:from-purple-900/30 dark:to-pink-900/30 p-2.5 xs:p-3 sm:p-4 border border-purple-200/40 dark:border-purple-700/40 shadow-md">
              <p className="text-[10px] xs:text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-0.5 xs:mb-1">
                Released
              </p>
              <p className="text-base xs:text-lg sm:text-xl font-black text-purple-900 dark:text-purple-100">
                {set.releaseDate || "Unknown"}
              </p>
            </div>
            
            {/* Card Count Glass Card */}
            <div className="rounded-xl backdrop-blur-md bg-gradient-to-r from-blue-100/70 to-indigo-100/70 dark:from-blue-900/30 dark:to-indigo-900/30 p-2.5 xs:p-3 sm:p-4 border border-blue-200/40 dark:border-blue-700/40 shadow-md">
              <p className="text-[10px] xs:text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-0.5 xs:mb-1">
                Total Cards
              </p>
              <p className="text-base xs:text-lg sm:text-xl font-black text-blue-900 dark:text-blue-100">
                {set.total || "?"}
              </p>
            </div>
          </div>
          
          {/* View Set Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-3 xs:p-4 text-center shadow-lg"
          >
            <p className="text-white font-bold text-xs xs:text-sm uppercase tracking-wider">
              View Set →
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const glassStyle = createGlassStyle({
    blur: '2xl',
    opacity: 'strong',
    gradient: true,
    border: 'strong',
    shadow: 'xl',
    rounded: 'lg'
  });

  return (
    <FullBleedWrapper gradient="tcg">
      <Head>
        <title>TCG Sets Collection | DexTrends</title>
        <meta name="description" content="Browse all Pokemon TCG sets with card counts, release dates, and set information" />
      </Head>

      {/* Header */}
      <motion.div 
        className={cn('sticky top-0 z-50', glassStyle, 'border-b border-white/20')}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CircularButton
              onClick={() => router.push('/')}
              variant="secondary"
              size="sm"
              className="scale-90 sm:scale-100"
            >
              ← Back
            </CircularButton>
            
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                TCG Sets Collection
              </h1>
              {totalSetsCount !== null && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {totalSetsCount} sets available
                </p>
              )}
            </div>
            
            <GradientButton
              variant="primary"
              size="sm"
              onClick={() => fetchSets()}
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

      {/* Search and Filters */}
      <div className="sticky top-[73px] sm:top-[89px] z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <UnifiedSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search sets by name or series..."
                className="w-full"
              />
            </div>
            
            {/* Series Filter */}
            <select
              value={filterSeries}
              onChange={(e) => setFilterSeries(e.target.value)}
              className={cn(
                "px-3 py-2 rounded-lg",
                "bg-white dark:bg-gray-800",
                "border border-gray-300 dark:border-gray-600",
                "text-sm"
              )}
            >
              <option value="">All Series</option>
              {uniqueSeries.map(series => (
                <option key={series} value={series}>{series}</option>
              ))}
            </select>
            
            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className={cn(
                "px-3 py-2 rounded-lg",
                "bg-white dark:bg-gray-800",
                "border border-gray-300 dark:border-gray-600",
                "text-sm"
              )}
            >
              <option value="releaseDate">Release Date</option>
              <option value="name">Name</option>
              <option value="cardCount">Card Count</option>
            </select>
            
            {/* Sort Direction */}
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className={cn(
                "px-3 py-2 rounded-lg",
                "bg-white dark:bg-gray-800",
                "border border-gray-300 dark:border-gray-600",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "transition-colors"
              )}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {error ? (
          <EmptyStateGlass
            title="Failed to load TCG sets"
            message={error}
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        ) : (
          <UnifiedGrid
            items={filteredAndSortedSets}
            columns={{
              mobile: 2,
              tablet: 3,
              desktop: 4,
              wide: 6
            }}
            virtualize={true}
            renderItem={renderSetCard}
            loading={loading}
            gap={16}
          />
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default UnifiedTcgSetsPage;