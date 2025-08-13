import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { GlassContainer } from "../../components/ui/design-system/GlassContainer";
import { GradientButton } from "../../components/ui/design-system/GradientButton";
import { CircularCard } from "../../components/ui/design-system/CircularCard";
import { motion } from "framer-motion";
import { InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import StyledBackButton from "../../components/ui/StyledBackButton";
import logger from '../../utils/logger';
import PocketCardList from "../../components/PocketCardList";
import BackToTop from "../../components/ui/SimpleBackToTop";
import { fetchPocketData } from "../../utils/pocketData";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import PageErrorBoundary from "../../components/ui/PageErrorBoundary";
import { FaCrown } from "react-icons/fa";
import type { PocketCard } from "../../types/api/pocket-cards";
import type { NextPage } from "next";

// Extended PocketCard interface with additional properties
interface ExtendedPocketCard extends PocketCard {
  type?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
  pack?: string;
  types?: string[];
}

// Expansion interface
interface Expansion {
  id: string;
  name: string;
  images: {
    logo: string;
    symbol: string;
  };
  code: string;
  releaseDate: string;
  description: string;
  total: number;
  series: string;
  cards: ExtendedPocketCard[];
}

// Series group interface
interface SeriesGroup {
  code: string;
  packs: string[];
  releaseDate: string;
  description: string;
  isPromo?: boolean;
}

type SortOption = "releaseDate" | "name" | "cardCount";
type SortDirection = "asc" | "desc";

const PocketExpansions: NextPage = () => {
  const [allCards, setAllCards] = useState<ExtendedPocketCard[]>([]);
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [filterSeries, setFilterSeries] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("releaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function fetchExpansions() {
      setLoading(true);
      setError(null);
      try {
        const cards = await fetchPocketData();
        setAllCards(cards as ExtendedPocketCard[] || []);
        
        // Process cards into expansion structure
        const expansionData = processCardsIntoExpansions(cards as ExtendedPocketCard[] || []);
        setExpansions(expansionData);
      } catch (err) {
        setError("Failed to load Pocket expansions. Please try again later.");
        setAllCards([]);
        setExpansions([]);
      }
      setLoading(false);
    }
    fetchExpansions();
  }, []);

  // Process cards into expansion structure similar to TCG Sets
  const processCardsIntoExpansions = (cards: ExtendedPocketCard[]): Expansion[] => {
    if (!cards.length) return [];
    
    // Separate promo cards from main set cards
    const promoCards = cards.filter((card: ExtendedPocketCard) => {
      const packName = (card.pack || '').toLowerCase();
      return packName.includes('promo') || 
             packName.includes('promotional') || 
             packName.includes('special') ||
             packName.includes('shop') ||
             packName.includes('campaign') ||
             packName.includes('premium') ||
             packName.includes('wonder');
    });
    
    const mainSetCards = cards.filter((card: ExtendedPocketCard) => {
      const packName = (card.pack || '').toLowerCase();
      return !packName.includes('promo') && 
             !packName.includes('promotional') && 
             !packName.includes('special') &&
             !packName.includes('shop') &&
             !packName.includes('campaign') &&
             !packName.includes('premium') &&
             !packName.includes('wonder') &&
             packName !== 'unknown' &&
             packName !== '';
    });
    
    // Redistribute shared cards to individual packs based on type
    const redistributedCards = mainSetCards.map((card: ExtendedPocketCard) => {
      if (card.pack === 'Shared(Genetic Apex)') {
        const cardType = (card.type || '').toLowerCase();
        
        if (['grass', 'psychic', 'darkness', 'dark'].includes(cardType)) {
          return { ...card, pack: 'Mewtwo' };
        } else if (['lightning', 'electric'].includes(cardType)) {
          return { ...card, pack: 'Pikachu' };
        } else if (['water', 'fighting', 'fire'].includes(cardType)) {
          return { ...card, pack: 'Charizard' };
        } else {
          const hash = card.name.charCodeAt(0) % 3;
          const packs = ['Mewtwo', 'Pikachu', 'Charizard'];
          return { ...card, pack: packs[hash] };
        }
      }
      return card;
    });
    
    // Group cards by expansion series
    const seriesGroups: Record<string, SeriesGroup> = {
      'Genetic Apex': { 
        code: 'A1', 
        packs: ['Mewtwo', 'Charizard', 'Pikachu'], 
        releaseDate: '2024-10-30',
        description: 'The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon.'
      },
      'Mythical Island': { 
        code: 'A1a', 
        packs: ['Mythical Island'], 
        releaseDate: '2024-11-01',
        description: 'Discover mystical Pokémon from the legendary Mythical Island.'
      },
      'Space-Time Smackdown': { 
        code: 'A2', 
        packs: ['Dialga', 'Palkia'], 
        releaseDate: '2024-12-01',
        description: 'Master time and space with the legendary powers of Dialga and Palkia.'
      },
      'Triumphant Light': { 
        code: 'A2a', 
        packs: ['Triumphant Light'], 
        releaseDate: '2024-12-15',
        description: 'Illuminate your path to victory with brilliant light-type Pokémon.'
      },
      'Shining Revelry': { 
        code: 'A2b', 
        packs: ['Shining Revelry'], 
        releaseDate: '2024-12-30',
        description: 'Experience the ultimate rivalry with shining rare Pokémon cards.'
      },
      'Celestial Guardians': { 
        code: 'A3', 
        packs: ['Solgaleo', 'Lunala'], 
        releaseDate: '2025-01-15',
        description: 'Harness the celestial powers of the sun and moon guardians.'
      },
      'Extradimensional Crisis': { 
        code: 'A3a', 
        packs: ['Extradimensional Crisis'], 
        releaseDate: '2025-02-01',
        description: 'Battle across dimensions with ultra-rare interdimensional Pokémon.'
      },
      'Eevee Grove': { 
        code: 'A4', 
        packs: ['Eevee Grove'], 
        releaseDate: '2025-03-01',
        description: 'Celebrate the evolution possibilities with Eevee and all its evolutions in this special grove expansion.'
      },
      'Promo-A': {
        code: 'PA',
        packs: [], // Promo cards don't have specific packs
        releaseDate: '2024-10-30',
        description: 'Exclusive promotional cards available through special events, campaigns, and shop purchases.',
        isPromo: true
      }
    };
    
    // Log total cards for debugging
    logger.debug('Processing expansions:', {
      totalCards: cards.length,
      promoCards: promoCards.length,
      mainSetCards: mainSetCards.length,
      redistributedCards: redistributedCards.length
    });
    
    // Build expansion data
    const expansions: Expansion[] = [];
    
    Object.entries(seriesGroups).forEach(([seriesName, seriesInfo]) => {
      let seriesCards: ExtendedPocketCard[];
      
      if (seriesInfo.isPromo) {
        // For promo sets, use the promo cards we filtered earlier
        seriesCards = promoCards;
      } else {
        // For regular sets, filter by pack names
        seriesCards = redistributedCards.filter((card: ExtendedPocketCard) => 
          seriesInfo.packs.includes(card.pack || '')
        );
      }
      
      // Skip series with too few cards, but be more lenient for special sets
      const minCardCount = seriesInfo.isPromo ? 5 : seriesName === 'Eevee Grove' ? 10 : 30;
      if (seriesCards.length < minCardCount) {
        logger.debug(`Skipping ${seriesName}:`, { cardCount: seriesCards.length, minRequired: minCardCount });
        return;
      }
      
      // Define expansion logos/images using real images from Bulbapedia
      const expansionImages: Record<string, { logo: string; symbol: string }> = {
        'Genetic Apex': {
          logo: '/images/pocket-expansions/genetic-apex-logo.png',
          symbol: '/images/pocket-expansions/genetic-apex-symbol.png'
        },
        'Mythical Island': {
          logo: '/images/pocket-expansions/mythical-island-logo.png',
          symbol: '/images/pocket-expansions/mythical-island-symbol.png'
        },
        'Space-Time Smackdown': {
          logo: '/images/pocket-expansions/space-time-smackdown-logo.png',
          symbol: '/images/pocket-expansions/space-time-symbol.png'
        },
        'Triumphant Light': {
          logo: '/images/pocket-expansions/triumphant-light-logo.png',
          symbol: '/images/pocket-expansions/triumphant-light-symbol.png'
        },
        'Shining Revelry': {
          logo: '/images/pocket-expansions/shining-revelry-logo.png',
          symbol: '/images/pocket-expansions/shining-revelry-symbol.png'
        },
        'Celestial Guardians': {
          logo: '/images/pocket-expansions/celestial-guardians-logo.png',
          symbol: '/images/pocket-expansions/celestial-guardians-symbol.png'
        },
        'Extradimensional Crisis': {
          logo: '/images/pocket-expansions/extradimensional-crisis-logo.png',
          symbol: '/images/pocket-expansions/extradimensional-crisis-symbol.png'
        },
        'Eevee Grove': {
          logo: '/images/pocket-expansions/eevee-grove-logo.png',
          symbol: '/images/pocket-expansions/eevee-grove-symbol.png'
        },
        'Promo-A': {
          logo: '/images/pocket-expansions/promo-a-logo.png',
          symbol: '/images/pocket-expansions/promo-a-symbol.png'
        }
      };
      
      expansions.push({
        id: seriesName.toLowerCase().replace(/\s+/g, '-'),
        name: seriesName,
        images: expansionImages[seriesName] || {
          logo: 'https://images.pokemontcg.io/base1/logo.png',
          symbol: 'https://images.pokemontcg.io/base1/symbol.png'
        },
        code: seriesInfo.code,
        releaseDate: seriesInfo.releaseDate,
        description: seriesInfo.description,
        total: seriesCards.length,
        series: 'Pokémon TCG Pocket',
        cards: seriesCards
      });
    });
    
    // Check for any cards that weren't included in any expansion
    const includedCardIds = new Set<string>();
    expansions.forEach(exp => exp.cards.forEach(card => includedCardIds.add(card.id)));
    
    const missedCards = cards.filter((card: ExtendedPocketCard) => !includedCardIds.has(card.id));
    if (missedCards.length > 0) {
      logger.debug(`Found cards not included in any expansion:`, { count: missedCards.length, sample: missedCards.slice(0, 5) });
    }
    
    return expansions;
  };

  // Extract unique series for filtering
  const uniqueSeries = useMemo(() => {
    const seriesSet = new Set<string>();
    expansions.forEach(expansion => {
      if (expansion.series) {
        seriesSet.add(expansion.series);
      }
    });
    return Array.from(seriesSet).sort();
  }, [expansions]);

  // Filter expansions by search query and series
  const filteredExpansions = useMemo(() => {
    return expansions.filter((expansion) => {
      let matches = expansion.name.toLowerCase().includes(search.toLowerCase());
      
      if (filterSeries && expansion.series) {
        matches = matches && expansion.series === filterSeries;
      }
      
      return matches;
    });
  }, [expansions, search, filterSeries]);

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
          comparison = (a.total || 0) - (b.total || 0);
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
    12, // Initial visible count
    6   // Load 6 more at a time
  );

  // Handle expansion click to show cards
  const handleExpansionClick = (expansion: Expansion) => {
    // Navigate to the expansion detail page
    router.push(`/pocketmode/set/${expansion.id}`);
  };

  // Check if we should show a specific expansion from URL
  useEffect(() => {
    const { expansion } = router.query;
    if (expansion && typeof expansion === 'string' && expansions.length > 0) {
      const selected = expansions.find(exp => exp.id === expansion);
      if (selected) {
        setSelectedExpansion(selected);
      }
    }
  }, [router.query, expansions]);

  // If showing cards for a specific expansion, render the card list
  if (selectedExpansion) {
    return (
      <>
        <Head>
          <title>{selectedExpansion.name} Cards | Pokémon Pocket | DexTrends</title>
          <meta name="description" content={`Browse all cards from ${selectedExpansion.name} expansion in Pokémon TCG Pocket.`} />
        </Head>
        <FullBleedWrapper gradient="tcg">
          <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto animate-fadeIn pt-8">
          
          <FadeIn>
            <div className="mb-8">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Expansions" 
                onClick={() => setSelectedExpansion(null)} 
                className="mb-4"
              />
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {selectedExpansion.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{selectedExpansion.description}</p>
              </div>
            </div>
            
            <PocketCardList 
              cards={selectedExpansion.cards.filter(card => 
                card.name.toLowerCase().includes(search.toLowerCase())
              )}
              loading={false}
              error={undefined}
              emptyMessage={`No cards found in ${selectedExpansion.name}.`}
              showPack={true}
              showRarity={true}
              showHP={true}
              showSort={true}
              imageWidth={110}
              imageHeight={154}
              searchValue={search}
              onSearchChange={setSearch}
            />
          </FadeIn>
          </div>
        </FullBleedWrapper>
      </>
    );
  }

  return (
    <PageErrorBoundary pageName="Pocket Expansions">
      <Head>
        <title>Pokémon Pocket Expansions | DexTrends</title>
        <meta name="description" content="Browse Pokémon TCG Pocket expansion sets and discover cards from each collection." />
      </Head>
      <FullBleedWrapper gradient="tcg">
        <div className="section-spacing-y-default max-w-7xl mx-auto animate-fadeIn pt-8">
        
        <FadeIn>
          {/* Hero Section with Glass Morphism */}
          <motion.div 
            className="mb-6 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-4 border border-white/50 dark:border-gray-700/50 shadow-2xl shadow-gray-400/30 dark:shadow-black/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-3">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Pokémon TCG Pocket Expansions
              </h1>
            </div>
            
            {/* Total Expansions Count */}
            <div className="text-center mb-3">
              <span className="text-sm font-bold text-purple-600">
                {expansions.length} Total Expansions
              </span>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2 mb-3">
              <button
                onClick={() => router.push('/pocketmode')}
                className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 font-semibold text-xs text-gray-600 dark:text-gray-400 hover:bg-white/80 transition-all"
              >
                Card List
              </button>
              <button
                className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-300/50 font-semibold text-xs text-purple-700 dark:text-purple-300 shadow-sm"
              >
                Expansions
              </button>
              <button
                onClick={() => router.push('/pocketmode/deck-builder')}
                className="px-3 py-1.5 rounded-full backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 font-semibold text-xs text-gray-600 dark:text-gray-400 hover:bg-white/80 transition-all"
              >
                Deck Builder
              </button>
            </div>
          </motion.div>
          
          {/* Search and Filters with Glass Morphism */}
          <motion.div 
            className="mb-6 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl p-4 border border-white/50 dark:border-gray-700/50 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Search Bar */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-9 py-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-sm border border-white/40 dark:border-gray-700/40 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/60 focus:ring-offset-0 transition-all shadow-sm"
                placeholder="Search expansions... (Press / to focus)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              />
              {search && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setSearch('')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
              
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
            
                <div className="flex-1">
                  <label htmlFor="seriesFilter" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Filter by Series</label>
                  <div className="relative">
                    <select
                      id="seriesFilter"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
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
                  <label htmlFor="sortOption" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Sort By</label>
                  <div className="relative">
                    <select
                      id="sortOption"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
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
                  <label htmlFor="sortDirection" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Order</label>
                  <div className="relative">
                    <select
                      id="sortDirection"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
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
              </div>
          </motion.div>
        </FadeIn>
      
      {loading ? (
        <PageLoader text="Loading Pocket expansions..." />
        ) : error ? (
          <GlassContainer variant="colored" className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </GlassContainer>
        ) : (
          <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleExpansions.map((expansion) => (
              <CardHover
                key={expansion.id}
                className="animate-fadeIn group"
                onClick={() => handleExpansionClick(expansion)}
              >
                <div 
                  className={`relative flex flex-col h-full rounded-3xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border cursor-pointer transition-all duration-300 border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-400`}
                >
                  {/* Expansion Image Background */}
                  {expansion.images?.logo && (
                    <div className={`relative h-40 w-full flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ${
                      expansion.name === 'Promo-A' 
                        ? 'bg-gradient-to-br from-yellow-200 via-amber-100 to-orange-100 dark:from-yellow-500/60 dark:via-amber-500/60 dark:to-orange-500/60 group-hover:from-yellow-300 group-hover:via-amber-200 group-hover:to-orange-200 dark:group-hover:from-yellow-400/70 dark:group-hover:via-amber-400/70 dark:group-hover:to-orange-400/70' 
                        : 'bg-gradient-to-br from-orange-200 via-yellow-100 to-amber-100 dark:from-orange-500/60 dark:via-yellow-500/60 dark:to-amber-500/60 group-hover:from-orange-300 group-hover:via-yellow-200 group-hover:to-amber-200 dark:group-hover:from-orange-400/70 dark:group-hover:via-yellow-400/70 dark:group-hover:to-amber-400/70'
                    }`}>
                      {/* Expansion Code Pill */}
                      <div className="absolute top-3 right-3 z-20">
                        <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {expansion.code}
                        </div>
                      </div>
                      
                      <img
                        src={expansion.images.logo}
                        alt={expansion.name}
                        className="max-h-24 max-w-[85%] object-contain z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                        draggable="false"
                      />
                    </div>
                  )}
                
                  {/* Expansion Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{expansion.name}</h2>
                    
                    {expansion.series && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">{expansion.series}</p>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {expansion.description}
                    </p>
                    
                    <div className="mt-auto space-y-3 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800/30 dark:to-emerald-800/30 rounded-2xl p-3 border border-green-200/50 dark:border-green-700/50">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Released</p>
                        <p className="font-bold text-green-900 dark:text-green-100">{expansion.releaseDate || "Unknown"}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-800/30 dark:to-indigo-800/30 rounded-2xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Cards</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">{expansion.total || "?"}</p>
                      </div>
                    </div>
                    
                    {/* View Cards Button */}
                    <button 
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-md"
                    >
                      View Cards
                    </button>
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

        {/* Show scroll hint */}
        {!loading && !error && hasMore && (
          <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <span className="text-sm font-medium">Showing {visibleExpansions.length} of {sortedExpansions.length} expansions</span>
            </div>
            <div className="text-xs text-orange-600 mt-2 font-medium">
              Scroll down to load more...
            </div>
          </div>
        )}

        {!loading && !scrollLoading && !hasMore && sortedExpansions.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3">
              <span className="text-sm font-semibold text-orange-700">All {sortedExpansions.length} expansions loaded</span>
            </div>
          </div>
        )}
      
        {!loading && !error && sortedExpansions.length === 0 && (
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Expansions Found</h2>
              <p className="text-gray-600">
                {search ? `No expansions match "${search}". Try a different search term.` : "No Pocket expansions available at the moment."}
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
(PocketExpansions as any).fullBleed = true;

export default PocketExpansions;