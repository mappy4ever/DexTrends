import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { GlassContainer } from "../../components/ui/design-system/GlassContainer";
import { GradientButton } from "../../components/ui/design-system";
import { TypeGradientBadge } from "../../components/ui/design-system/TypeGradientBadge";
import { motion } from "framer-motion";
import { InlineLoader, PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import StyledBackButton from "../../components/ui/StyledBackButton";
import { fetchJSON } from "../../utils/unifiedFetch";
import BackToTop from "../../components/ui/BaseBackToTop";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import PageErrorBoundary from "../../components/ui/PageErrorBoundary";
import type { NextPage } from "next";

// Deck interfaces matching the API structure
interface KeyCard {
  id: string;
  image: string;
  name: string;
  count: number;
}

interface PocketDeck {
  id: string;
  name: string;
  winRate: string;
  types: string[];
  description: string;
  keyCards: KeyCard[];
  strategy: string;
  creator: string;
  dateCreated: string;
  tier: string;
  tournaments: number;
  avgPlacement: number;
}

type SortOption = "winRate" | "name" | "tier" | "tournaments" | "dateCreated";
type SortDirection = "asc" | "desc";

const PocketDecks: NextPage = () => {
  const [decks, setDecks] = useState<PocketDeck[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [filterTier, setFilterTier] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("winRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function fetchDecks() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJSON<any[]>('/api/pocket-decks', {
          useCache: true,
          cacheTime: 5 * 60 * 1000 // 5 minutes
        });
        setDecks(data || []);
      } catch (err) {
        setError("Failed to load Pocket decks. Please try again later.");
        setDecks([]);
      }
      setLoading(false);
    }
    fetchDecks();
  }, []);

  // Extract unique tiers and types for filtering
  const uniqueTiers = useMemo(() => {
    const tiers = new Set<string>();
    decks.forEach(deck => {
      if (deck.tier) {
        tiers.add(deck.tier);
      }
    });
    return Array.from(tiers).sort();
  }, [decks]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    decks.forEach(deck => {
      if (deck.types) {
        deck.types.forEach(type => types.add(type));
      }
    });
    return Array.from(types).sort();
  }, [decks]);

  // Filter decks by search query, tier, and type
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      let matches = deck.name.toLowerCase().includes(search.toLowerCase()) ||
                   deck.description.toLowerCase().includes(search.toLowerCase()) ||
                   deck.creator.toLowerCase().includes(search.toLowerCase());
      
      if (filterTier && deck.tier !== filterTier) {
        matches = false;
      }
      
      if (filterType && !deck.types.includes(filterType)) {
        matches = false;
      }
      
      return matches;
    });
  }, [decks, search, filterTier, filterType]);

  // Sort the filtered decks
  const sortedDecks = useMemo(() => {
    return [...filteredDecks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "winRate":
          const aRate = parseFloat(a.winRate.replace('%', ''));
          const bRate = parseFloat(b.winRate.replace('%', ''));
          comparison = aRate - bRate;
          break;
        case "tier":
          const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
          comparison = (tierOrder[a.tier as keyof typeof tierOrder] || 0) - (tierOrder[b.tier as keyof typeof tierOrder] || 0);
          break;
        case "tournaments":
          comparison = a.tournaments - b.tournaments;
          break;
        case "dateCreated":
          comparison = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredDecks, sortOption, sortDirection]);

  // Infinite scroll for decks
  const { visibleItems: visibleDecks, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedDecks, 
    8, // Initial visible count
    4  // Load 4 more at a time
  );

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'from-red-500 to-red-600';
      case 'A': return 'from-orange-500 to-orange-600';
      case 'B': return 'from-yellow-500 to-yellow-600';
      case 'C': return 'from-stone-500 to-stone-600';
      default: return 'from-stone-400 to-stone-500';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Electric': 'from-yellow-400 to-yellow-500',
      'Psychic': 'from-amber-400 to-amber-500',
      'Fire': 'from-red-400 to-red-500',
      'Water': 'from-amber-400 to-amber-500',
      'Grass': 'from-green-400 to-green-500',
      'Fighting': 'from-orange-400 to-orange-500',
    };
    return typeColors[type] || 'from-stone-400 to-stone-500';
  };

  return (
    <PageErrorBoundary pageName="Pocket Decks">
      <Head>
        <title>Pocket Decks | Top Meta Builds | DexTrends</title>
        <meta name="description" content="Discover the best Pokémon TCG Pocket deck builds from top players. Browse meta decks, strategies, and win rates." />
      </Head>
      <FullBleedWrapper gradient="tcg">
        <div className="section-spacing-y-default max-w-7xl mx-auto animate-fadeIn pt-8">
        
        <FadeIn>
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Pocket Mode" 
                onClick={() => router.push('/pocketmode')} 
                className="mx-auto mb-6"
              />
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-6 shadow-2xl"
            >
              <span className="text-4xl">🃏</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Top Pocket Decks
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Discover winning deck strategies and meta builds from top Pokémon TCG Pocket players
            </p>
          </div>
          
          {/* Search and Filters Card */}
          <GlassContainer variant="medium" className="mb-8">
            {/* Search and Filters */}
            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  className="w-full pr-6 py-4 pl-12 glass-light border border-stone-200 dark:border-stone-700 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="Search decks (e.g., Pikachu, Mewtwo, Lightning)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-stone-400 dark:text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
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
                  <label htmlFor="tierFilter" className="block text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Filter by Tier</label>
                  <div className="relative">
                    <select
                      id="tierFilter"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-stone-700 transition-all duration-300 text-stone-700 dark:text-stone-300 text-sm"
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value)}
                    >
                      <option value="">All Tiers</option>
                      {uniqueTiers.map(tier => (
                        <option key={tier} value={tier}>Tier {tier}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="typeFilter" className="block text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Filter by Type</label>
                  <div className="relative">
                    <select
                      id="typeFilter"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-stone-700 transition-all duration-300 text-stone-700 dark:text-stone-300 text-sm"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="sortOption" className="block text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Sort By</label>
                  <div className="relative">
                    <select
                      id="sortOption"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-stone-700 transition-all duration-300 text-stone-700 dark:text-stone-300 text-sm"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                    >
                      <option value="winRate">Win Rate</option>
                      <option value="tier">Tier</option>
                      <option value="tournaments">Tournaments</option>
                      <option value="name">Name</option>
                      <option value="dateCreated">Date Created</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label htmlFor="sortDirection" className="block text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">Order</label>
                  <div className="relative">
                    <select
                      id="sortDirection"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-stone-700 transition-all duration-300 text-stone-700 dark:text-stone-300 text-sm"
                      value={sortDirection}
                      onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                    >
                      <option value="desc">High to Low</option>
                      <option value="asc">Low to High</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    setFilterTier("");
                    setFilterType("");
                    setSortOption("winRate");
                    setSortDirection("desc");
                  }}
                >
                  Clear Filters
                </GradientButton>
              </div>
            </div>
          </GlassContainer>
        </FadeIn>
      
      {loading ? (
        <PageLoader text="Loading meta decks..." />
        ) : error ? (
          <GlassContainer variant="colored" className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </GlassContainer>
        ) : (
          <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleDecks.map((deck) => (
              <CardHover
                key={deck.id}
                className="animate-fadeIn group"
              >
                <div className={`relative flex flex-col h-full rounded-3xl overflow-hidden bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm border cursor-pointer transition-all duration-300 border-stone-200/50 dark:border-stone-700/50 shadow-lg hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-400`}>

                  {/* Deck Header */}
                  <div className="p-6 border-b border-stone-200 dark:border-stone-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="font-bold text-xl text-stone-800 dark:text-stone-100 mb-1">{deck.name}</h2>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">by {deck.creator}</p>
                      </div>
                      
                      {/* Tier Badge */}
                      <div className={`px-3 py-1 rounded-full text-white font-bold text-sm bg-gradient-to-r ${getTierColor(deck.tier)}`}>
                        Tier {deck.tier}
                      </div>
                    </div>
                    
                    {/* Types */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {deck.types.map((type) => (
                        <span
                          key={type}
                          className={`px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${getTypeColor(type)}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                      {deck.description}
                    </p>
                  </div>

                  {/* Key Cards */}
                  <div className="p-6 flex-1">
                    <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-3">Key Cards</h3>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {deck.keyCards.slice(0, 4).map((card) => (
                        <div key={card.id} className="bg-stone-100 dark:bg-stone-700 rounded-lg p-2 text-center">
                          <div className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">{card.name}</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">×{card.count}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Strategy */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 mb-4">
                      <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">Strategy</h4>
                      <p className="text-xs text-amber-600 dark:text-amber-200 leading-relaxed">{deck.strategy}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800/30 dark:to-emerald-800/30 rounded-2xl p-3 border border-green-200/50 dark:border-green-700/50">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Win Rate</p>
                        <p className="font-bold text-green-900 dark:text-green-100">{deck.winRate}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-800/30 dark:to-violet-800/30 rounded-2xl p-3 border border-purple-200/50 dark:border-purple-700/50">
                        <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Tournaments</p>
                        <p className="font-bold text-purple-900 dark:text-purple-100">{deck.tournaments}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-800/30 dark:to-orange-800/30 rounded-2xl p-3 border border-amber-200/50 dark:border-amber-700/50">
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Avg Place</p>
                        <p className="font-bold text-amber-900 dark:text-amber-100">{deck.avgPlacement.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="p-6 pt-0">
                    <Link href="/pocketmode/deckbuilder">
                      <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-md">
                        Build Similar Deck
                      </button>
                    </Link>
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
                <InlineLoader text="Loading more decks..." />
              </div>
            )}
          </div>
        )}

        {/* Show scroll hint */}
        {!loading && !error && hasMore && (
          <div className="text-center mt-8 text-stone-600 dark:text-stone-400">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <span className="text-sm font-medium">Showing {visibleDecks.length} of {sortedDecks.length} decks</span>
            </div>
            <div className="text-xs text-orange-600 mt-2 font-medium">
              Scroll down to load more...
            </div>
          </div>
        )}

        {!loading && !scrollLoading && !hasMore && sortedDecks.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3">
              <span className="text-sm font-semibold text-orange-700">All {sortedDecks.length} decks loaded</span>
            </div>
          </div>
        )}
      
        {!loading && !error && sortedDecks.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-orange-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">No Decks Found</h2>
              <p className="text-stone-600">
                {search ? `No decks match "${search}". Try a different search term.` : "No decks available at the moment."}
              </p>
            </div>
          </div>
        )}
        </div>
        <BackToTop />
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Mark this page as full bleed to remove Layout padding
(PocketDecks as any).fullBleed = true;

export default PocketDecks;