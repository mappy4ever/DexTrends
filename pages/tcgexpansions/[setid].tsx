import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { NextPage } from "next";
import { fetchJSON } from "../../utils/unifiedFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { safeRequestIdleCallback } from "../../utils/requestIdleCallback";
import { safeSessionStorage } from "../../utils/safeStorage";
import { motion, AnimatePresence } from 'framer-motion';
import { createGlassStyle, GradientButton, CircularButton } from '../../components/ui/design-system';
import { cn } from '../../utils/cn';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../../components/ui/glass-components';
import TCGCardList from "../../components/TCGCardList";
import VirtualCardGrid from "../../components/VirtualCardGrid";
import SimpleCardWrapper from "../../components/ui/SimpleCardWrapper";
import { useTheme, useFavorites } from '../../context/UnifiedAppContext';
import { useViewSettings } from "../../context/UnifiedAppContext";
import { DetailPageSkeleton, InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import logger from "../../utils/logger";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import performanceMonitor from "../../utils/performanceMonitor";
import { CardGridSkeleton } from "../../components/ui/SkeletonLoader";
import type { TCGCard, CardSet } from "../../types/api/cards";
import type { FavoriteCard } from "../../context/modules/types";
import TCGSetErrorBoundary from "../../components/TCGSetErrorBoundary";
import { HorizontalCardShowcase } from "../../components/tcg-set-detail/HorizontalCardShowcase";
import { CompactStatsBar } from "../../components/tcg-set-detail/CompactStatsBar";
import { RarityBadge } from "../../components/tcg-set-detail/RarityBadge";
import { RarityIcon, RARITY_ORDER, getRarityRank } from "../../components/ui/RarityIcon";
// Removed - using unified responsive approach
import { ProgressiveImage } from "../../components/ui/ProgressiveImage";

// Interface for set statistics
interface CardWithMarketPrice extends TCGCard {
  marketPrice: number;
}

interface SetStatistics {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: CardWithMarketPrice[];
}

const SetIdPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { viewSettings } = useViewSettings();
  
  // State variables
  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState<boolean>(false);
  
  // Filter states
  const [filterRarity, setFilterRarity] = useState<string>("");
  const [filterSubtype, setFilterSubtype] = useState<string>("");
  const [filterSupertype, setFilterSupertype] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Set statistics
  const [statistics, setStatistics] = useState<SetStatistics>({
    rarityDistribution: {},
    valueByRarity: {},
    highestValueCards: []
  });
  
  // Collection tracking
  const [ownedCards, setOwnedCards] = useState<Set<string>>(new Set());
  const [wishlistCards, setWishlistCards] = useState<Set<string>>(new Set());
  
  // Card preview modal state
  const [selectedCardForPreview, setSelectedCardForPreview] = useState<TCGCard | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalCard, setModalCard] = useState<TCGCard | null>(null);
  
  // Mobile state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const setid = router.query.setid as string | undefined;
  
  // Removed - using unified responsive approach

  // Helper function to determine the actual rarity based on card data
  const getActualRarity = (card: TCGCard): string => {
    // If the rarity is already "Black White Rare" (note: no & in API response), keep it
    if (card.rarity === 'Black White Rare') {
      return 'Black & White Rare'; // Add the & for display
    }
    
    // Check if it's a secret rare (card number > set total)
    const cardNumber = parseInt(card.number);
    const setTotal = card.set.printedTotal;
    const isSecretRare = cardNumber > setTotal;
    
    // Specific cards that should be Black & White Rare
    // Victini from both White Flare and Black Bolt returns "Rare" but should be "Black & White Rare"
    const isBlackWhiteStyleRare = 
      (card.name === 'Victini' && card.number === '172' && card.set.id === 'rsv10pt5') || // White Flare
      (card.name === 'Victini' && card.number === '171' && card.set.id === 'zsv10pt5');    // Black Bolt
    
    if (isBlackWhiteStyleRare) {
      return 'Black & White Rare';
    }
    
    // Black & White era sets (bw1-bw11, including Noble Victories)
    const blackWhiteSets = [
      'bw1', 'bw2', 'bw3', 'bw4', 'bw5', 'bw6', 'bw7', 'bw8', 'bw9', 'bw10', 'bw11',
      'bwp', 'dv1', 'bct', 'lds'
    ];
    
    const isBlackWhiteSet = blackWhiteSets.includes(card.set.id.toLowerCase());
    
    // If it's a regular Black & White era card with "Rare" rarity and has holofoil prices, it's "Rare Holo"
    if (isBlackWhiteSet && card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil) {
      return 'Rare Holo';
    }
    
    // For other sets, if rarity is "Rare" and has holofoil but no normal prices, it's likely "Rare Holo"
    if (card.rarity === 'Rare' && card.tcgplayer?.prices?.holofoil && !card.tcgplayer?.prices?.normal) {
      return 'Rare Holo';
    }
    
    return card.rarity || 'Common';
  };

  // Calculate set statistics when cards are loaded
  const calculateSetStatistics = useCallback((cards: TCGCard[]) => {
    const rarityDist: Record<string, number> = {};
    const valueByRarity: Record<string, { total: number; average: number; count: number }> = {};
    const cardsWithPrices: CardWithMarketPrice[] = [];
    
    cards.forEach(card => {
      // Rarity distribution
      if (card.rarity) {
        rarityDist[card.rarity] = (rarityDist[card.rarity] || 0) + 1;
      }
      
      // Value by rarity
      if (card.tcgplayer?.prices) {
        const prices = Object.values(card.tcgplayer.prices);
        const marketPrice = prices[0]?.market || 0;
        
        if (marketPrice > 0) {
          cardsWithPrices.push({ ...card, marketPrice });
          
          if (card.rarity) {
            if (!valueByRarity[card.rarity]) {
              valueByRarity[card.rarity] = { total: 0, average: 0, count: 0 };
            }
            valueByRarity[card.rarity].total += marketPrice;
            valueByRarity[card.rarity].count++;
          }
        }
      }
    });
    
    // Calculate averages
    Object.keys(valueByRarity).forEach(rarity => {
      const data = valueByRarity[rarity];
      data.average = data.count > 0 ? data.total / data.count : 0;
    });
    
    // Get highest value cards
    const highestValueCards = cardsWithPrices
      .sort((a, b) => b.marketPrice - a.marketPrice)
      .slice(0, 10);
    
    setStatistics({
      rarityDistribution: rarityDist,
      valueByRarity,
      highestValueCards
    });
  }, []);

  // Fetch set data
  useEffect(() => {
    if (!router.isReady || !setid || !loading) return;
    
    let mounted = true;
    let abortController: AbortController | null = null;
    
    const fetchSetData = async () => {
      try {
        setLoadingMessage("Loading set information...");
        setFetchAttempted(true);
        
        abortController = new AbortController();
        
        const data = await fetchJSON(`/api/tcgexpansions/${setid}`, {
          signal: abortController.signal
        }) as any;
        
        if (!mounted) return;
        
        if (!data || !data.set) {
          throw new Error('No data returned from API');
        }
        
        setSetInfo(data.set);
        setCards(data.cards || []);
        
        if (data.warning) {
          setDataWarning(data.warning);
        }
        
        if (data.stats) {
          setStatistics({
            rarityDistribution: data.stats?.rarityDistribution || {},
            valueByRarity: data.stats?.valueByRarity || {},
            highestValueCards: data.stats?.highestValueCards || []
          });
        } else if (data.cards && data.cards.length > 0) {
          calculateSetStatistics(data.cards);
        }
        
        setLoading(false);
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError' || !mounted) {
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error("Error fetching set data:", { error: err, setId: setid });
        setError(`Failed to load set information: ${errorMessage}`);
        setLoading(false);
      }
    };
    
    fetchSetData();
    
    return () => {
      mounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, [router.isReady, setid, calculateSetStatistics, loading]);

  // Filter logic
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (filterRarity && getActualRarity(card) !== filterRarity) return false;
      if (filterSubtype && !card.subtypes?.includes(filterSubtype)) return false;
      if (filterSupertype && card.supertype !== filterSupertype) return false;
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        if (!matchesName) return false;
      }
      return true;
    });
  }, [cards, filterRarity, filterSubtype, filterSupertype, debouncedSearchQuery]);

  // Get filter options
  const filterOptions = useMemo(() => {
    const rarities = new Set<string>();
    const subtypes = new Set<string>();
    const supertypes = new Set<string>();
    
    cards.forEach(card => {
      // Use getActualRarity to get the correct rarity for display
      const actualRarity = getActualRarity(card);
      if (actualRarity) rarities.add(actualRarity);
      if (card.subtypes) card.subtypes.forEach(subtype => subtypes.add(subtype));
      if (card.supertype) supertypes.add(card.supertype);
    });
    
    // Sort rarities by official order
    const sortedRarities = Array.from(rarities).sort((a, b) => {
      return getRarityRank(a) - getRarityRank(b);
    });
    
    // Debug: Log rarities to check if Black & White Rare is included
    if (sortedRarities.includes('Black & White Rare')) {
      logger.debug('Black & White Rare found in rarities:', sortedRarities);
    }
    
    return {
      rarities: sortedRarities,
      subtypes: Array.from(subtypes),
      supertypes: Array.from(supertypes)
    };
  }, [cards]);

  // Price and rarity helpers
  const getCardPrice = useCallback((card: TCGCard): number => {
    if (!card.tcgplayer?.prices) return 0;
    const prices = Object.values(card.tcgplayer.prices);
    return prices[0]?.market || 0;
  }, []);


  // Handle card click for modal
  const handleCardClick = (card: TCGCard) => {
    setModalCard(card);
    setModalOpen(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (card: TCGCard) => {
    const favoriteCard: FavoriteCard = {
      id: card.id,
      name: card.name,
      images: card.images,
      rarity: card.rarity,
      set: {
        id: card.set.id,
        name: card.set.name
      } as any,
      number: card.number,
      type: 'card' as const
    } as any;
    
    if (favorites.cards.some((c: FavoriteCard) => c.id === card.id)) {
      removeFromFavorites('cards', card.id);
    } else {
      addToFavorites('cards', favoriteCard);
    }
  };

  // Handle card navigation in modal
  const handleNextCard = () => {
    const nextIndex = (currentCardIndex + 1) % filteredCards.length;
    setCurrentCardIndex(nextIndex);
    setSelectedCardForPreview(filteredCards[nextIndex]);
  };
  
  const handlePreviousCard = () => {
    const prevIndex = currentCardIndex === 0 ? filteredCards.length - 1 : currentCardIndex - 1;
    setCurrentCardIndex(prevIndex);
    setSelectedCardForPreview(filteredCards[prevIndex]);
  };
  
  const handleCardClickForPreview = (card: TCGCard) => {
    const index = filteredCards.findIndex(c => c.id === card.id);
    setCurrentCardIndex(index);
    setSelectedCardForPreview(card);
  };

  // Handle collection actions
  const handleToggleOwned = (cardId: string) => {
    setOwnedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleToggleWishlist = (cardId: string) => {
    setWishlistCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };
  
  // Calculate derived values for stats
  const totalValue = useMemo(() => {
    if (!statistics.valueByRarity) return 0;
    return Object.values(statistics.valueByRarity).reduce((sum, rarity) => sum + rarity.total, 0);
  }, [statistics]);
  
  const topValueCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return [...cards]
      .sort((a, b) => getCardPrice(b) - getCardPrice(a))
      .slice(0, 10);
  }, [cards, getCardPrice]);
  
  const averagePrice = useMemo(() => {
    if (!cards || cards.length === 0) return 0;
    const total = cards.reduce((sum, card) => sum + getCardPrice(card), 0);
    return total / cards.length;
  }, [cards, getCardPrice]);
  
  const uniqueRarities = useMemo(() => {
    const rarities = new Set(cards.map(c => c.rarity).filter(Boolean));
    return rarities.size;
  }, [cards]);

  // Loading states
  if (!router.isReady) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton 
          variant="tcgset"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={false}
          showRelated={true}
        />
      </FullBleedWrapper>
    );
  }

  if (!setid) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          title="Invalid Set ID"
          message="No set ID was provided in the URL."
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgexpansions'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  if (loading && !setInfo) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton 
          variant="tcgset"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={false}
          showRelated={true}
        />
      </FullBleedWrapper>
    );
  }

  if (error && fetchAttempted) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          type="error"
          title="Error Loading Set"
          message={error}
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgexpansions'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  if (!setInfo && fetchAttempted && !loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          title="Set Not Found"
          message="The set you're looking for couldn't be found."
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgexpansions'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  if (!setInfo) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton 
          variant="tcgset"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={false}
          showRelated={true}
        />
      </FullBleedWrapper>
    );
  }

  // Unified responsive view
  return (
    <FullBleedWrapper gradient="pokedex">
      <div className="w-full">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 max-w-7xl">
          {/* Back Button - Minimal */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.push('/tcgexpansions')}
              className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] touch-target"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Sets</span>
            </button>
          </div>
          
          {/* Compact Stats Bar */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <CompactStatsBar
              setInfo={setInfo}
              cardCount={cards.length}
              totalValue={totalValue}
              uniqueRarities={uniqueRarities}
              averagePrice={averagePrice}
            />
          </div>
          
          {/* Horizontal Card Showcase */}
          {topValueCards.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <HorizontalCardShowcase
                cards={topValueCards}
                onCardClick={handleCardClick}
                getPrice={getCardPrice}
              />
            </div>
          )}
          
          {/* Original Card List Display */}
          <div className={`${createGlassStyle({ 
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'strong',
            rounded: 'xl',
            shadow: 'xl',
            hover: 'shadowOnly'
          })} relative overflow-hidden`}>
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/10 via-transparent to-blue-100/10 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Integrated Header with Controls */}
              <div className="p-4 sm:p-6 md:p-8 lg:p-10 border-b border-white/10 dark:border-gray-700/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                  {/* Title Section */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 sm:gap-3">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>
                      Collection
                      <span className="ml-2 text-lg text-gray-600 dark:text-gray-400">
                        ({filteredCards.length} {filteredCards.length !== cards.length && `of ${cards.length}`} cards)
                      </span>
                    </span>
                  </h2>
                  
                  {/* Integrated Search Bar */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                          'pl-10 pr-4 py-2 rounded-full',
                          'bg-white/50 dark:bg-gray-800/50',
                          'backdrop-blur-md',
                          'border border-white/30 dark:border-gray-700/30',
                          'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                          'text-sm w-64'
                        )}
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Integrated Filter Pills with Rarity Badges */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                  {/* Rarity Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Rarity:</span>
                    <button
                      onClick={() => setFilterRarity('')}
                      className={cn(
                        'min-h-[36px] px-3 py-1 rounded-full text-xs font-medium transition-all touch-target',
                        !filterRarity
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                      )}
                    >
                      All
                    </button>
                    {filterOptions.rarities.map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => setFilterRarity(filterRarity === rarity ? '' : rarity)}
                        className={cn(
                          'min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 touch-target',
                          filterRarity === rarity
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                        )}
                      >
                        <RarityIcon rarity={rarity} size="xs" showLabel={false} />
                        <span>{rarity}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Type Filter Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Type:</span>
                    <button
                      onClick={() => setFilterSupertype('')}
                      className={cn(
                        'min-h-[36px] px-3 py-1 rounded-full text-xs font-medium transition-all touch-target',
                        !filterSupertype
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                      )}
                    >
                      All
                    </button>
                    {filterOptions.supertypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterSupertype(filterSupertype === type ? '' : type)}
                        className={cn(
                          'min-h-[36px] px-3 py-1 rounded-full text-xs font-medium transition-all touch-target',
                          filterSupertype === type
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                            : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Cards Display Area with proper spacing */}
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                {cards.length === 0 && loading ? (
                  <LoadingStateGlass type="skeleton" rows={3} columns={4} />
                ) : filteredCards.length > 0 ? (
                  <div key={`card-grid-${cards.length}`}>
                    <TCGCardList
                      cards={filteredCards}
                      onCardClick={handleCardClick}
                      getPrice={getCardPrice}
                      getReleaseDate={(card) => card.set?.releaseDate || ""}
                      getRarityRank={(card: any) => getRarityRank(card.rarity)}
                      showPrice={true}
                      showRarity={true}
                      showSet={true}
                      showSort={true}
                      showSearch={false}
                    />
                  </div>
                ) : (
                  <EmptyStateGlass
                    title="No cards found matching your filters"
                    message="Try adjusting your search criteria"
                    iconText=""
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Glass Morphism Card Modal */}
        {modalOpen && modalCard && (
          <>
            {/* Dark translucent backdrop */}
            <div
              onClick={() => {
                setModalOpen(false);
                setModalCard(null);
              }}
              className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 transition-none"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto max-w-6xl w-full max-h-[90vh] overflow-auto rounded-3xl">
                <div className={cn(
                  'relative border-2 border-gray-400/50',
                  createGlassStyle({ 
                    blur: '2xl',
                    opacity: 'strong',
                    gradient: true,
                    border: 'strong',
                    rounded: 'xl',
                    shadow: 'xl'
                  })
                )}>
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setModalCard(null);
                    }}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-gray-300/50 flex items-center justify-center hover:bg-white/90 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    {/* Card Image - Larger and centered */}
                    <div className="flex items-center justify-center">
                      <motion.div
                        initial={{ rotate: -5, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative"
                      >
                        <img 
                          src={modalCard.images.large} 
                          alt={modalCard.name}
                          className="w-full max-w-md h-auto rounded-2xl shadow-2xl"
                        />
                        {/* Glow effect behind card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl -z-10" />
                      </motion.div>
                    </div>

                    {/* Card Details with glass elements */}
                    <div className="space-y-6">
                      {/* Card Name with gradient */}
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          {modalCard.name.replace(/Team Rocket's/gi, "TR's")}
                        </h2>
                        <p className="text-gray-700 dark:text-gray-700 font-medium">
                          {modalCard.set.name} • #{modalCard.number}/{modalCard.set.printedTotal}
                        </p>
                      </div>

                      {/* Info Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Rarity Card */}
                        {modalCard.rarity && (
                          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-gray-300/50">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Rarity</p>
                            <div className="flex items-center gap-2">
                              <RarityIcon
                                rarity={getActualRarity(modalCard)}
                                size="sm"
                                showLabel={true}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Artist Card */}
                        {modalCard.artist && (
                          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-gray-300/50">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Artist</p>
                            <p className="font-bold text-gray-800">{modalCard.artist}</p>
                          </div>
                        )}
                      </div>

                      {/* Pricing Section */}
                      {modalCard.tcgplayer?.prices && (
                        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-300/50">
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                            Market Prices
                          </h3>
                          <div className="space-y-3">
                            {Object.entries(modalCard.tcgplayer.prices || {})
                              .filter(([type, prices]) => {
                                const priceData = prices as any;
                                return priceData && priceData.market;
                              })
                              .map(([type, prices]) => {
                                const priceData = prices as any;
                                return (
                                  <div key={type} className="flex justify-between items-center">
                                    <span className="text-gray-700 capitalize font-medium">
                                      {type.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-bold text-xl text-green-600">
                                      ${priceData.market?.toFixed(2) || '0.00'}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              // Use safe storage to prevent quota errors
                              safeSessionStorage.setItem(`card-${modalCard.id}`, modalCard);
                              safeSessionStorage.setItem(`set-${modalCard.set.id}`, setInfo);
                            }
                            router.push(`/cards/${modalCard.id}`);
                          }}
                          className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg">
                          View Full Details
                        </button>
                        <button
                          onClick={() => handleFavoriteToggle(modalCard)}
                          className={cn(
                            "flex-1 px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg",
                            favorites.cards.some((c: FavoriteCard) => c.id === modalCard.id)
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                              : 'bg-white/70 backdrop-blur-md border border-gray-300/50 text-gray-800 hover:bg-white/80'
                          )}
                        >
                          {favorites.cards.some((c: FavoriteCard) => c.id === modalCard.id) ? 
                            '♥ Favorited' : '♡ Add to Favorites'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </FullBleedWrapper>
  );
};

// Wrap the component with error boundary
const SetIdPageWithErrorBoundary: NextPage = () => {
  return (
    <TCGSetErrorBoundary>
      <SetIdPage />
    </TCGSetErrorBoundary>
  );
};

// Mark this page as full bleed to remove Layout padding
(SetIdPageWithErrorBoundary as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default SetIdPageWithErrorBoundary;