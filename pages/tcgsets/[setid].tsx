import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { NextPage } from "next";
import { fetchJSON } from "../../utils/unifiedFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { safeRequestIdleCallback } from "../../utils/requestIdleCallback";
import { motion } from 'framer-motion';
import { createGlassStyle, GradientButton, CircularButton } from '../../components/ui/design-system';
import { cn } from '../../utils/cn';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../../components/ui/glass-components';
import Modal from "../../components/ui/modals/Modal";
import TCGCardList from "../../components/TCGCardList";
import VirtualCardGrid from "../../components/VirtualCardGrid";
import SimpleCardWrapper from "../../components/ui/SimpleCardWrapper";
import { useTheme } from "../../context/UnifiedAppContext";
import { useFavorites } from "../../context/UnifiedAppContext";
import { useViewSettings } from "../../context/UnifiedAppContext";
import { PageLoader, InlineLoader } from '@/components/ui/SkeletonLoadingSystem';
import logger from "../../utils/logger";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import performanceMonitor from "../../utils/performanceMonitor";
import { CardGridSkeleton } from "../../components/ui/SkeletonLoader";
import type { TCGCard, CardSet } from "../../types/api/cards";
import type { FavoriteCard } from "../../context/modules/types";
import TCGSetErrorBoundary from "../../components/TCGSetErrorBoundary";
import { EnhancedSetHeader } from "../../components/ui/EnhancedSetHeader";
import { EnhancedFilterTabs } from "../../components/ui/EnhancedFilterTabs";
import { CleanRaritySymbol } from "../../components/ui/CleanRaritySymbol";
import { SetStatisticsVisual } from "../../components/tcg-set-detail/SetStatisticsVisual";
import { ValueHeatmap } from "../../components/tcg-set-detail/ValueHeatmap";
import { CardShowcase } from "../../components/tcg-set-detail/CardShowcase";

// Interface for set statistics
interface CardWithMarketPrice extends TCGCard {
  marketPrice: number;
}

interface SetStatistics {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: CardWithMarketPrice[];
}

// Interface for price data
interface PriceDataType {
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  market?: number | null;
}

const SetIdPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { viewSettings } = useViewSettings();
  
  // Create refs for scrolling
  const cardsGridRef = useRef<HTMLDivElement>(null);
  
  // State variables
  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
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

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalCard, setModalCard] = useState<TCGCard | null>(null);
  
  // Pagination state for tracking loading
  const [paginationInfo, setPaginationInfo] = useState<{ totalCount: number } | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Calculate set statistics when cards are loaded
  const calculateSetStatistics = useCallback((cardsData: TCGCard[]) => {
    try {
      if (!cardsData || cardsData.length === 0) return;
      
      // Rarity distribution
      const rarityCount: Record<string, number> = {};
      const rarityValue: Record<string, { total: number; average: number; count: number }> = {};
      const valuedCards: CardWithMarketPrice[] = [];
      
      cardsData.forEach(card => {
        // Count rarities
        if (card.rarity) {
          rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
        }
        
        // Calculate value by rarity
        if (card.tcgplayer?.prices && typeof card.tcgplayer.prices === 'object') {
          try {
            const prices = Object.values(card.tcgplayer.prices);
            let highestPrice = 0;
            
            prices.forEach((priceData: unknown) => {
              if (priceData && typeof priceData === 'object') {
                const typedPriceData = priceData as PriceDataType;
                const marketPrice = typedPriceData.market || typedPriceData.mid || 0;
                if (marketPrice > highestPrice) {
                  highestPrice = marketPrice;
                }
              }
            });
          
          if (highestPrice > 0 && card.rarity) {
            if (!rarityValue[card.rarity]) {
              rarityValue[card.rarity] = { total: 0, average: 0, count: 0 };
            }
            rarityValue[card.rarity].total += highestPrice;
            rarityValue[card.rarity].count += 1;
            
            valuedCards.push({ ...card, marketPrice: highestPrice } as CardWithMarketPrice);
          }
          } catch (error) {
            logger.warn('Error processing card prices:', { cardId: card.id, error });
          }
        }
      });
      
      // Calculate averages
      Object.keys(rarityValue).forEach(rarity => {
        rarityValue[rarity].average = rarityValue[rarity].total / rarityValue[rarity].count;
      });
      
      // Sort cards by value and get top 10
      const highestValueCards = valuedCards
        .sort((a: CardWithMarketPrice, b: CardWithMarketPrice) => b.marketPrice - a.marketPrice)
        .slice(0, 10);
      
      setStatistics({
        rarityDistribution: rarityCount,
        valueByRarity: rarityValue,
        highestValueCards
      });
    } catch (err) {
      logger.error("Error calculating statistics:", { error: err });
    }
  }, []);

  // Get setid from router query with proper validation
  const setid = useMemo(() => {
    if (!router.isReady || !router.query.setid) {
      return null;
    }
    return Array.isArray(router.query.setid) ? router.query.setid[0] : router.query.setid;
  }, [router.isReady, router.query.setid]);

  // Add debug logging
  useEffect(() => {
    logger.debug('[SetIdPage] Router state:', {
      isReady: router.isReady,
      query: router.query,
      setid: setid,
      pathname: router.pathname
    });
  }, [router.isReady, router.query, setid, router.pathname]);

  // Fetch set information and cards
  useEffect(() => {
    let mounted = true;
    let abortController: AbortController | null = null;
    
    // Wait for router to be ready and setid to be available
    if (!router.isReady || !setid) {
      logger.debug('[SetIdPage] Skipping fetch - router not ready or no setid', { isReady: router.isReady, setid });
      return;
    }

    const fetchSetData = async () => {
      // Create abort controller for this request
      abortController = new AbortController();
      setLoading(true);
      setError(null);
      setFetchAttempted(true);
      setLoadingMessage("Connecting to Pokemon TCG database...");
      
      // Start performance monitoring
      performanceMonitor.startTimer('api-request', `tcg-set-${setid}`);
      performanceMonitor.startTimer('page-load', `tcg-set-page-${setid}`);
      
      let slowLoadTimeout: NodeJS.Timeout | null = null;
      
      try {
        // Use new complete endpoint for better performance
        const url = `/api/tcg-sets/${setid}/complete`;
        
        setLoadingMessage("Loading set information...");
        
        // Add timeout to show additional message if taking too long
        slowLoadTimeout = setTimeout(() => {
          if (mounted) {
            setLoadingMessage("Loading all cards... This may take a moment for large sets.");
          }
        }, 5000); // Show after 5 seconds
        
        let data;
        try {
          // Use fetchJSON with proper error handling and abort signal
          data = await fetchJSON<{ set: CardSet; cards: TCGCard[]; stats?: SetStatistics; cachedAt?: string; error?: string; warning?: string }>(
            url,
            {
              signal: abortController.signal,
              useCache: true,
              cacheTime: 60 * 60 * 1000, // 1 hour cache
              retries: 2,
              retryDelay: 1000,
              timeout: 90000, // 90 seconds for complete sets
              throwOnError: false // Don't throw immediately to handle error responses
            }
          );
          
          // Clear the slow load timeout immediately after getting response
          clearTimeout(slowLoadTimeout);
          
          // Check if the response is an error
          if (data && typeof data === 'object' && 'error' in data && !data.set) {
            logger.error('[SetIdPage] API returned error response:', { data });
            throw new Error(data.error || 'API returned an error');
          }
          
          // Log cache status
          if (data?.cachedAt) {
            logger.info(`[TCG Set] Loaded from cache`, { 
              setId: setid, 
              cachedAt: data.cachedAt,
              cardCount: data.cards?.length 
            });
          }
        } catch (fetchError: unknown) {
          // Clear the slow load timeout
          clearTimeout(slowLoadTimeout);
          
          // Check if request was aborted
          if ((fetchError as Error)?.name === 'AbortError' || !mounted) {
            return;
          }
          throw fetchError;
        }
        // End API call monitoring
        const apiTime = performanceMonitor.endTimer('api-request', `tcg-set-${setid}`, {
          setId: setid,
          cardCount: data?.cards?.length || 0
        });
        
        if (apiTime && apiTime > 2000) {
          logger.warn(`Slow API response for set ${setid}: ${apiTime}ms`);
        }
        
        // Check if component is still mounted before setting state
        if (!mounted) return;
        
        if (!data) {
          throw new Error('No data returned from API');
        }
        
        // Log the response structure to debug
        logger.debug('[SetIdPage] API Response structure:', {
          hasData: !!data,
          dataKeys: Object.keys(data || {}),
          hasSet: !!data?.set,
          hasCards: !!data?.cards,
          dataType: typeof data,
          cachedAt: data?.cachedAt,
          warning: data?.warning
        });
        
        setLoadingMessage("Loading cards...");
        
        // Handle both possible data structures
        // Case 1: Standard response with { set, cards, ... }
        // Case 2: Direct set data (from some cache scenarios)
        let setData = data?.set;
        let cardsData = data?.cards || [];
        
        // Validate set data
        if (!setData || !setData.id || !setData.name) {
          logger.error('[SetIdPage] Invalid set data structure:', { 
            setData, 
            hasId: setData?.id,
            hasName: setData?.name
          });
          throw new Error('Invalid or missing set data in API response');
        }
        
        setSetInfo(setData);
        
        // Check for warnings (e.g., stale data)
        if (data?.warning) {
          setDataWarning(data.warning);
          logger.warn('[SetIdPage] Data warning:', { warning: data.warning });
        }
        
        // Handle cards data
        if (Array.isArray(cardsData) && cardsData.length > 0) {
          setCards(cardsData);
          
          // Clear loading state IMMEDIATELY when we have cards
          setLoading(false);
          setLoadingMessage(''); // Clear loading message
          
          // Pre-populate browser cache for individual cards for instant navigation
          if (typeof window !== 'undefined') {
            cardsData.forEach(card => {
              // Cache the card response in browser's fetchJSON cache
              const cardResponse = { card, cached: true, responseTime: 0 };
              const cacheKey = `fetch:/api/tcg-cards/${card.id}`;
              
              // Store in fetchJSON's cache format
              try {
                const cacheData = {
                  data: cardResponse,
                  timestamp: Date.now(),
                  expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              } catch (e) {
                // Ignore localStorage errors (quota exceeded, etc.)
              }
            });
            
            logger.info(`[TCG Set] Pre-populated browser cache for ${cardsData.length} cards`);
          }
          
          // Use pre-calculated stats if available
          if (data.stats) {
            setStatistics({
              rarityDistribution: data.stats?.rarityDistribution || {},
              valueByRarity: data.stats?.valueByRarity || {},
              highestValueCards: data.stats?.highestValueCards || []
            });
          } else {
            // Calculate statistics if not provided
            calculateSetStatistics(cardsData);
          }
          
          logger.info(`[TCG Set] Successfully loaded ${cardsData.length} cards`, {
            setId: setid,
            cached: !!data.cachedAt,
            hasWarning: !!data.warning
          });
        } else {
          logger.warn('[SetIdPage] No cards found in response');
          setCards([]); // Set empty array to show "no cards" state
        }
      } catch (err: unknown) {
        // Ignore abort errors
        if ((err as Error)?.name === 'AbortError' || !mounted) {
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const errorResponse = err as { response?: { status?: number }; status?: number };
        
        logger.error("Error fetching set data:", { 
          error: err,
          setId: setid,
          message: errorMessage
        });
        
        // More specific error messages
        if (errorMessage.includes('404') || errorResponse?.response?.status === 404 || errorResponse?.status === 404) {
          setError(`Set "${setid}" not found. Please check the set ID.`);
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setError("Network error. Please check your connection.");
        } else if (errorMessage.includes('timeout')) {
          setError("Request timed out. Please try again.");
        } else {
          setError(`Failed to load set information: ${errorMessage}`);
        }
      } finally {
        // Clear any pending timeouts
        if (slowLoadTimeout) {
          clearTimeout(slowLoadTimeout);
        }
        // Only set loading false if we didn't already do it when cards were loaded
        if (mounted && loading) {
          setLoading(false);
          setLoadingMessage(''); // Always clear loading message when done
        }
        // End page load monitoring
        performanceMonitor.endTimer('page-load', `tcg-set-page-${setid}`);
      }
    };
    
    fetchSetData();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, [router.isReady, setid, calculateSetStatistics]);


  // Handle card click for modal
  const handleCardClick = (card: TCGCard) => {
    setModalCard(card);
    setModalOpen(true);
  };

  // Filter logic
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Rarity filter
      if (filterRarity && card.rarity !== filterRarity) return false;
      
      // Subtype filter
      if (filterSubtype && !card.subtypes?.includes(filterSubtype)) return false;
      
      // Supertype filter
      if (filterSupertype && card.supertype !== filterSupertype) return false;
      
      // Search query (use debounced value)
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesText = card.attacks?.some(attack => 
          attack.text?.toLowerCase().includes(query)
        );
        const matchesAbility = card.abilities?.some(ability => 
          ability.text?.toLowerCase().includes(query)
        );
        
        if (!matchesName && !matchesText && !matchesAbility) return false;
      }
      
      return true;
    });
  }, [cards, filterRarity, filterSubtype, filterSupertype, debouncedSearchQuery]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const rarities = new Set<string>();
    const subtypes = new Set<string>();
    const supertypes = new Set<string>();
    
    cards.forEach(card => {
      if (card.rarity) rarities.add(card.rarity);
      if (card.subtypes) card.subtypes.forEach(subtype => subtypes.add(subtype));
      if (card.supertype) supertypes.add(card.supertype);
    });
    
    return {
      rarities: Array.from(rarities).sort(),
      subtypes: Array.from(subtypes).sort(),
      supertypes: Array.from(supertypes).sort()
    };
  }, [cards]);

  // Handle favorite toggle
  const handleFavoriteToggle = (card: TCGCard) => {
    const isCurrentlyFavorite = favorites.cards.some((c: FavoriteCard) => c.id === card.id);
    if (isCurrentlyFavorite) {
      removeFromFavorites('cards', card.id);
    } else {
      const favoriteCard: FavoriteCard = {
        id: card.id,
        name: card.name,
        set: card.set ? { id: card.set.id, name: card.set.name } : undefined,
        images: card.images,
        addedAt: Date.now()
      };
      addToFavorites('cards', favoriteCard);
    }
  };

  // Get card price helper for VirtualCardGrid
  const getCardPrice = useCallback((card: TCGCard): number => {
    if (!card.tcgplayer?.prices) return 0;
    
    const prices = Object.values(card.tcgplayer.prices);
    let highestPrice = 0;
    
    prices.forEach((priceData: unknown) => {
      if (priceData && typeof priceData === 'object') {
        const typedPriceData = priceData as PriceDataType;
        const price = typedPriceData.market || typedPriceData.mid || 0;
        if (price > highestPrice) {
          highestPrice = price;
        }
      }
    });
    
    return highestPrice;
  }, []);

  // Get rarity rank for sorting
  const getRarityRank = useCallback((card: TCGCard): number => {
    const rarityOrder: Record<string, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 3,
      'Rare Holo': 4,
      'Rare Holo EX': 5,
      'Rare Holo GX': 6,
      'Rare Holo V': 7,
      'Rare Holo VMAX': 8,
      'Rare Holo VSTAR': 9,
      'Rare Ultra': 10,
      'Rare Secret': 11,
      'Rare Rainbow': 12,
      'Rare Gold': 13
    };
    
    return rarityOrder[card.rarity || ''] || 0;
  }, []);

  // Scroll to cards section
  const scrollToCards = () => {
    if (cardsGridRef.current) {
      cardsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading state - show loader if router not ready or still loading initial data
  if (!router.isReady) {
    return <PageLoader text="Initializing..." />;
  }

  // No setid state - show error if setid is missing after router is ready
  if (!setid) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          title="Invalid Set ID"
          message="No set ID was provided in the URL."
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgsets'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  // Show loading state while router is initializing or data is loading
  if (!router.isReady || (loading && !setInfo)) {
    return (
      <PageLoader text={loadingMessage} />
    );
  }

  // Error state - only show after fetch attempt
  if (error && fetchAttempted) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          type="error"
          title="Error Loading Set"
          message={error}
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgsets'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  // No set found state - only show after fetch has been attempted and failed
  if (!setInfo && fetchAttempted && !loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <EmptyStateGlass
          title="Set Not Found"
          message="The set you're looking for couldn't be found."
          actionButton={{
            text: "Back to Sets",
            onClick: () => router.push('/tcgsets'),
            variant: "primary"
          }}
        />
      </div>
    );
  }

  // If we're still loading or haven't fetched yet, show loader
  if (!setInfo) {
    return <PageLoader text={loadingMessage} />;
  }

  const totalValue = statistics.valueByRarity ? Object.values(statistics.valueByRarity).reduce((sum, rarity) => sum + rarity.total, 0) : 0;

  return (
    <FullBleedWrapper gradient="pokedex">
      <div className="container mx-auto px-6 py-12 lg:px-8 lg:py-16 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <GradientButton
              onClick={() => router.push('/tcgsets')}
              variant="secondary"
              size="sm"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to Sets
            </GradientButton>
          </div>

          {/* Data Warning Alert */}
          {dataWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 ${createGlassStyle({ 
                blur: 'lg',
                opacity: 'medium', 
                border: 'medium',
                rounded: 'lg',
                shadow: 'md'
              })} bg-gradient-to-r from-yellow-50/90 to-amber-50/90 dark:from-yellow-900/30 dark:to-amber-900/30 p-4`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">{dataWarning}</p>
              </div>
            </motion.div>
          )}

          {/* Enhanced Set Header with Glass Morphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EnhancedSetHeader
              setInfo={setInfo}
              cardCount={cards.length}
              statistics={statistics}
              onScrollToCards={scrollToCards}
            />
          </motion.div>

        </div>

        {/* Visual Statistics Dashboard with generous spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
          <SetStatisticsVisual
            rarityDistribution={statistics.rarityDistribution}
            valueByRarity={statistics.valueByRarity}
            totalCards={cards.length}
          />
          <ValueHeatmap
            cards={cards}
            getPrice={getCardPrice}
          />
        </div>

        {/* Premium Card Showcase */}
        {statistics.highestValueCards.length > 0 && (
          <div className="mb-12 lg:mb-16">
            <CardShowcase
              cards={statistics.highestValueCards.slice(0, 10)}
              title="Most Valuable Cards"
              getPrice={getCardPrice}
              onCardClick={handleCardClick}
            />
          </div>
        )}

        {/* Single Unified Cards Container - No Animation */}
        <div 
          ref={cardsGridRef} 
          className="mt-6"
        >
          <div className={`${createGlassStyle({ 
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'strong',
            rounded: 'xl',
            shadow: 'xl'
          })} relative overflow-hidden`}>
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/10 via-transparent to-blue-100/10 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Integrated Header with Controls */}
              <div className="p-8 lg:p-10 border-b border-white/10 dark:border-gray-700/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Title Section */}
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
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
                
                {/* Integrated Filter Pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {/* Rarity Filter Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Rarity:</span>
                    <button
                      onClick={() => setFilterRarity('')}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all',
                        !filterRarity
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                      )}
                    >
                      All
                    </button>
                    {filterOptions.rarities.slice(0, 5).map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => setFilterRarity(filterRarity === rarity ? '' : rarity)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium transition-all',
                          filterRarity === rarity
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70'
                        )}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                  
                  {/* Type Filter Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Type:</span>
                    <button
                      onClick={() => setFilterSupertype('')}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-all',
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
                          'px-3 py-1 rounded-full text-xs font-medium transition-all',
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
              <div className="p-8 lg:p-10">
                {cards.length === 0 && loading ? (
                  <LoadingStateGlass type="skeleton" rows={3} columns={4} />
                ) : filteredCards.length > 0 ? (
                  <div key={`card-grid-${cards.length}`}>
                    <TCGCardList
                      cards={filteredCards}
                      onCardClick={handleCardClick}
                      getPrice={getCardPrice}
                      getReleaseDate={(card) => card.set?.releaseDate || ""}
                      getRarityRank={getRarityRank}
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

        {/* Card Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalCard(null);
          }}
          title={modalCard?.name || ''}
        >
          {modalCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Image */}
              <div className="flex justify-center">
                <img 
                  src={modalCard.images.large} 
                  alt={modalCard.name}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>

              {/* Card Details */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Card Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Set</span>
                      <span>{modalCard.set.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Number</span>
                      <span>{modalCard.number} / {modalCard.set.printedTotal}</span>
                    </div>
                    {modalCard.rarity && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Rarity</span>
                        <CleanRaritySymbol
                          rarity={modalCard.rarity}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    )}
                    {modalCard.artist && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Artist</span>
                        <span>{modalCard.artist}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                {modalCard.tcgplayer?.prices && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Market Prices</h3>
                    <div className="space-y-2">
                      {Object.entries(modalCard.tcgplayer.prices || {}).map(([type, prices]) => {
                        const priceData = prices as PriceDataType;
                        if (!priceData || !priceData.market) return null;
                        
                        return (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {type.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              ${priceData.market.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Store card data in sessionStorage for instant loading
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem(`card-${modalCard.id}`, JSON.stringify(modalCard));
                        sessionStorage.setItem(`set-${modalCard.set.id}`, JSON.stringify(setInfo));
                      }
                      router.push(`/cards/${modalCard.id}`);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-center transition-colors">
                    View Details
                  </button>
                  <button
                    onClick={() => handleFavoriteToggle(modalCard)}
                    className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                      favorites.cards.some((c: FavoriteCard) => c.id === modalCard.id)
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {favorites.cards.some((c: FavoriteCard) => c.id === modalCard.id) ? 'Unfavorite' : 'Favorite'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
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