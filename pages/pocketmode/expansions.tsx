import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FadeIn, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { createGlassStyle, GradientButton } from '../../components/ui/design-system';
import { motion } from "framer-motion";
import { InlineLoader, PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import Button from '@/components/ui/Button';
import logger from '../../utils/logger';
import BackToTop from "../../components/ui/BaseBackToTop";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import PageErrorBoundary from "../../components/ui/PageErrorBoundary";
import { fetchJSON } from "../../utils/unifiedFetch";
import type { NextPage } from "next";

// Expansion interface from API
interface PocketExpansion {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  releaseDate: string;
  cardCount: number;
  symbol: string;
  code: string;
}

type SortOption = "releaseDate" | "name" | "cardCount";
type SortDirection = "asc" | "desc";

const PocketExpansions: NextPage = () => {
  const [expansions, setExpansions] = useState<PocketExpansion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [sortOption, setSortOption] = useState<SortOption>("releaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function fetchExpansions() {
      setLoading(true);
      setError(null);
      try {
        logger.info('Fetching Pocket expansions from API');

        const data = await fetchJSON<PocketExpansion[]>('/api/pocket-expansions', {
          useCache: false, // Disable cache to ensure fresh data
          forceRefresh: true,
          timeout: 15000,
          retries: 2,
          throwOnError: true
        });

        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid response from API');
        }

        logger.info('Pocket expansions loaded', { count: data.length });
        setExpansions(data);
      } catch (err) {
        logger.error('Failed to load Pocket expansions', {
          error: err instanceof Error ? err.message : String(err)
        });
        setError("Failed to load Pocket expansions. Please try again later.");
        setExpansions([]);
      }
      setLoading(false);
    }
    fetchExpansions();
  }, []);

  // Filter expansions by search query
  const filteredExpansions = useMemo(() => {
    return expansions.filter((expansion) =>
      expansion.name.toLowerCase().includes(search.toLowerCase()) ||
      expansion.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [expansions, search]);

  // Sort the filtered expansions
  const sortedExpansions = useMemo(() => {
    return [...filteredExpansions].sort((a, b) => {
      let comparison = 0;

      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "releaseDate":
          comparison = new Date(a.releaseDate || "1970-01-01").getTime() - new Date(b.releaseDate || "1970-01-01").getTime();
          break;
        case "cardCount":
          comparison = (a.cardCount || 0) - (b.cardCount || 0);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredExpansions, sortOption, sortDirection]);

  // Infinite scroll for expansions
  const { visibleItems: visibleExpansions, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedExpansions,
    12,
    6
  );

  // Handle expansion click to navigate to set page
  const handleExpansionClick = (expansion: PocketExpansion) => {
    router.push(`/pocketmode/set/${expansion.id}`);
  };

  return (
    <PageErrorBoundary pageName="Pocket Expansions">
      <Head>
        <title>Pokémon Pocket Expansions | DexTrends</title>
        <meta name="description" content="Browse all Pokémon TCG Pocket expansion sets including Genetic Apex, Mythical Island, Space-Time Smackdown and more." />
      </Head>
      <FullBleedWrapper gradient="tcg">
        <div className="section-spacing-y-default max-w-7xl mx-auto px-4 animate-fadeIn pt-8">

        <FadeIn>
          {/* Hero Section */}
          <motion.div
            className="mb-6 backdrop-blur-xl bg-white/90 dark:bg-stone-800/90 rounded-xl p-6 border border-white/50 dark:border-stone-700/50 shadow-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Pokémon TCG Pocket Expansions
              </h1>
              <p className="text-stone-600 dark:text-stone-400 mt-2">
                Explore all {expansions.length} expansion sets
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => router.push('/pocketmode')}
                className="px-4 py-2 rounded-xl bg-white/60 dark:bg-stone-800/60 border border-white/30 font-semibold text-sm text-stone-600 dark:text-stone-400 hover:bg-white/80 transition-all"
              >
                Card List
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-300/50 font-semibold text-sm text-yellow-700 dark:text-yellow-300 shadow-sm"
              >
                Expansions
              </button>
              <button
                onClick={() => router.push('/pocketmode/deckbuilder')}
                className="px-4 py-2 rounded-xl bg-white/60 dark:bg-stone-800/60 border border-white/30 font-semibold text-sm text-stone-600 dark:text-stone-400 hover:bg-white/80 transition-all"
              >
                Deck Builder
              </button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-6 backdrop-blur-xl bg-white/90 dark:bg-stone-800/90 rounded-xl p-4 border border-white/50 dark:border-stone-700/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-stone-700/80 border border-stone-200 dark:border-stone-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  placeholder="Search expansions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="absolute inset-y-0 right-0 pr-4 text-stone-400 hover:text-stone-600"
                    onClick={() => setSearch('')}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">Sort By</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                >
                  <option value="releaseDate">Release Date</option>
                  <option value="name">Name</option>
                  <option value="cardCount">Card Count</option>
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">Order</label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl text-sm"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <GradientButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSortOption("releaseDate");
                  setSortDirection("desc");
                }}
              >
                Clear
              </GradientButton>
            </div>
          </motion.div>
        </FadeIn>

        {loading ? (
          <PageLoader text="Loading Pocket expansions..." />
        ) : error ? (
          <div className="text-center p-8 bg-white/90 dark:bg-stone-800/90 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-4">Failed to Load Expansions</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">{error}</p>
            <GradientButton
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </GradientButton>
          </div>
        ) : (
          <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleExpansions.map((expansion) => (
              <CardHover
                key={expansion.id}
                className="animate-fadeIn group"
                onClick={() => handleExpansionClick(expansion)}
              >
                <div className="relative flex flex-col h-full rounded-xl overflow-hidden bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm border border-stone-200/50 dark:border-stone-700/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-yellow-400">

                  {/* Expansion Logo */}
                  <div className="relative h-40 w-full flex items-center justify-center p-4 bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100 dark:from-yellow-900/30 dark:via-orange-900/20 dark:to-amber-900/30">
                    {/* Code Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {expansion.code}
                      </div>
                    </div>

                    <img
                      src={expansion.logoUrl}
                      alt={expansion.name}
                      className="max-h-28 max-w-[85%] object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/pocket-placeholder.png';
                      }}
                    />
                  </div>

                  {/* Expansion Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-bold text-lg text-stone-800 dark:text-stone-100 mb-1">{expansion.name}</h2>

                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 line-clamp-2">
                      {expansion.description}
                    </p>

                    <div className="mt-auto space-y-2 mb-4">
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 border border-green-200/50 dark:border-green-700/50">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Released</p>
                        <p className="font-bold text-green-900 dark:text-green-100">{expansion.releaseDate || "TBA"}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3 border border-amber-200/50 dark:border-amber-700/50">
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Total Cards</p>
                        <p className="font-bold text-amber-900 dark:text-amber-100">{expansion.cardCount || "?"}</p>
                      </div>
                    </div>

                    {/* View Cards Button */}
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 group-hover:scale-[1.02] shadow-md"
                    >
                      View Cards
                    </Button>
                  </div>
                </div>
              </CardHover>
            ))}
          </StaggeredChildren>
        )}

        {/* Infinite scroll loading indicator */}
        {hasMore && (
          <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center mt-12">
            {scrollLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <InlineLoader text="Loading more expansions..." />
              </div>
            )}
          </div>
        )}

        {/* Results info */}
        {!loading && !error && sortedExpansions.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-stone-800/80 rounded-full px-6 py-3 shadow-md">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Showing {visibleExpansions.length} of {sortedExpansions.length} expansions
              </span>
            </div>
          </div>
        )}

        {!loading && !error && sortedExpansions.length === 0 && (
          <div className="text-center py-20 bg-white/90 dark:bg-stone-800/90 rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-4">No Expansions Found</h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              {search ? `No expansions match "${search}".` : "No Pocket expansions available."}
            </p>
            {search && (
              <GradientButton onClick={() => setSearch('')} variant="secondary">
                Clear Search
              </GradientButton>
            )}
          </div>
        )}
        </div>
        <BackToTop />
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Mark this page as full bleed to remove Layout padding
(PocketExpansions as any).fullBleed = true;

export default PocketExpansions;
