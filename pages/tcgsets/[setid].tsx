import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { NextPage } from "next";
import { fetchJSON } from "../../utils/unifiedFetch";
import { useDebounce } from "../../hooks/useDebounce";
import { safeRequestIdleCallback } from "../../utils/requestIdleCallback";
import { GlassContainer } from "../../components/ui/design-system/GlassContainer";
import { GradientButton } from "../../components/ui/design-system/GradientButton";
import { motion } from "framer-motion";
import Modal from "../../components/ui/modals/Modal";
import CardList from "../../components/CardList";
import VirtualizedCardGrid from "../../components/ui/VirtualizedCardGrid";
import { FadeIn, SlideUp } from "../../components/ui/animations/animations";
import { DynamicPriceHistoryChart } from "../../components/dynamic/DynamicComponents";
import { useTheme } from "../../context/UnifiedAppContext";
import { useFavorites } from "../../context/UnifiedAppContext";
import { useViewSettings } from "../../context/UnifiedAppContext";
import { PageLoader, InlineLoader } from "../../utils/unifiedLoading";
import logger from "../../utils/logger";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import performanceMonitor from "../../utils/performanceMonitor";
import { CardGridSkeleton } from "../../components/ui/SkeletonLoader";
import type { TCGCard, CardSet } from "../../types/api/cards";

// Interface for set statistics
interface CardWithMarketPrice extends TCGCard {
  marketPrice: number;
}

interface SetStatistics {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  highestValueCards: TCGCard[];
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
  const { setid } = router.query;
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
        if (card.tcgplayer?.prices) {
          const prices = Object.values(card.tcgplayer.prices);
          let highestPrice = 0;
          
          prices.forEach((priceData: any) => {
            if (priceData && typeof priceData === 'object') {
              const marketPrice = priceData.market || priceData.mid || 0;
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
        }
      });
      
      // Calculate averages
      Object.keys(rarityValue).forEach(rarity => {
        rarityValue[rarity].average = rarityValue[rarity].total / rarityValue[rarity].count;
      });
      
      // Sort cards by value and get top 10
      const highestValueCards = valuedCards
        .sort((a: any, b: any) => b.marketPrice - a.marketPrice)
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

  // Fetch set information and cards
  useEffect(() => {
    if (!setid) return;

    const fetchSetData = async () => {
      setLoading(true);
      setError(null);
      
      // Start performance monitoring
      performanceMonitor.startTimer('api-request', `tcg-set-${setid}`);
      performanceMonitor.startTimer('page-load', `tcg-set-page-${setid}`);
      
      try {
        const data = await fetchJSON<{ set: CardSet; cards: TCGCard[] }>(
          `/api/tcg-sets/${setid}`,
          {
            useCache: true,
            cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
            retries: 2
          }
        );
        // End API call monitoring
        const apiTime = performanceMonitor.endTimer('api-request', `tcg-set-${setid}`, {
          setId: setid,
          cardCount: data?.cards?.length || 0
        });
        
        if (apiTime && apiTime > 2000) {
          logger.warn(`Slow API response for set ${setid}: ${apiTime}ms`);
        }
        
        if (data?.set) setSetInfo(data.set);
        if (data?.cards) {
          setCards(data.cards);
          
          // Defer statistics calculation for large sets
          if (data.cards.length > 100) {
            safeRequestIdleCallback(() => {
              performanceMonitor.startTimer('statistics-calculation', `stats-${setid}`);
              calculateSetStatistics(data.cards);
              const calcTime = performanceMonitor.endTimer('statistics-calculation', `stats-${setid}`);
              if (calcTime && calcTime > 500) {
                logger.warn(`Slow statistics calculation for set ${setid}: ${calcTime}ms`);
              }
            });
          } else {
            calculateSetStatistics(data.cards);
          }
        }
      } catch (err: any) {
        logger.error("Error fetching set data:", { error: err });
        setError("Failed to load set information");
      } finally {
        setLoading(false);
        // End page load monitoring
        performanceMonitor.endTimer('page-load', `tcg-set-page-${setid}`);
      }
    };
    
    fetchSetData();
  }, [setid, calculateSetStatistics]);

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
    const isCurrentlyFavorite = favorites.cards.some((c: TCGCard) => c.id === card.id);
    if (isCurrentlyFavorite) {
      removeFromFavorites('cards', card.id);
    } else {
      addToFavorites('cards', card);
    }
  };

  // Scroll to cards section
  const scrollToCards = () => {
    if (cardsGridRef.current) {
      cardsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading state - only show full page loader if we don't have set info yet
  if (loading && !setInfo) {
    return (
      <PageLoader text="Loading set information..." />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <GlassContainer variant="colored" className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <GradientButton 
            onClick={() => router.push('/tcgsets')}
            variant="primary"
            size="md"
          >
            Back to Sets
          </GradientButton>
        </GlassContainer>
      </div>
    );
  }

  // No set found state
  if (!setInfo) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <GlassContainer variant="medium" className="text-center">
          <h2 className="text-xl font-bold mb-2">Set Not Found</h2>
          <p className="mb-4">The set you're looking for couldn't be found.</p>
          <GradientButton 
            onClick={() => router.push('/tcgsets')}
            variant="primary"
            size="md"
          >
            Back to Sets
          </GradientButton>
        </GlassContainer>
      </div>
    );
  }

  const totalValue = Object.values(statistics.valueByRarity).reduce((sum, rarity) => sum + rarity.total, 0);

  return (
    <FullBleedWrapper gradient="tcg">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <FadeIn>
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

            {/* Set Information */}
            <GlassContainer variant="medium" className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Set Image */}
                <div className="flex flex-col items-center">
                  {setInfo.images?.logo && (
                    <img 
                      src={setInfo.images.logo} 
                      alt={setInfo.name}
                      className="max-w-full h-auto mb-4"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                  {setInfo.images?.symbol && (
                    <img 
                      src={setInfo.images.symbol} 
                      alt={`${setInfo.name} symbol`}
                      className="h-16 w-16 object-contain"
                    />
                  )}
                </div>

                {/* Set Details */}
                <div>
                  <h1 className="text-3xl font-bold mb-4">{setInfo.name}</h1>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Series</p>
                      <p className="font-semibold">{setInfo.series}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Release Date</p>
                      <p className="font-semibold">
                        {new Date(setInfo.releaseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Total Cards</p>
                      <p className="font-semibold">{setInfo.printedTotal} / {setInfo.total}</p>
                    </div>
                    {setInfo.ptcgoCode && (
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">PTCGO Code</p>
                        <p className="font-semibold">{setInfo.ptcgoCode}</p>
                      </div>
                    )}
                  </div>

                  <GradientButton
                    onClick={scrollToCards}
                    variant="primary"
                    size="lg"
                    className="mt-6"
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    }
                  >
                    View Cards
                  </GradientButton>
                </div>
              </div>
            </GlassContainer>

            {/* Set Statistics */}
            {cards.length > 0 && (
              <SlideUp delay={100}>
                <GlassContainer variant="light" className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">Set Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Rarity Distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Rarity Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.rarityDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .map(([rarity, count]) => (
                          <div key={rarity} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{rarity}</span>
                            <span className="font-medium">{count} cards</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Value by Rarity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Average Value by Rarity</h3>
                    <div className="space-y-2">
                      {Object.entries(statistics.valueByRarity)
                        .sort(([,a], [,b]) => b.average - a.average)
                        .map(([rarity, data]) => (
                          <div key={rarity} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{rarity}</span>
                            <span className="font-medium">${data.average.toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Set Summary */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Set Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Cards</span>
                        <span className="font-medium">{cards.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Market Value</span>
                        <span className="font-medium">${totalValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg Card Value</span>
                        <span className="font-medium">
                          ${cards.length > 0 ? (totalValue / cards.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highest Value Cards */}
                {statistics.highestValueCards.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Highest Value Cards</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {statistics.highestValueCards.slice(0, 5).map((card: any) => (
                        <div key={card.id} className="text-center">
                          <img 
                            src={card.images.small} 
                            alt={card.name}
                            className="w-full h-auto rounded-lg mb-2 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleCardClick(card)}
                          />
                          <p className="text-sm font-medium truncate">{card.name}</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            ${card.marketPrice.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassContainer>
            </SlideUp>
            )}

            {/* Filters */}
            <SlideUp delay={200}>
              <GlassContainer variant="medium" className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Filter Cards</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 glass-light rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Rarity Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Rarity</label>
                    <select
                      value={filterRarity}
                      onChange={(e) => setFilterRarity(e.target.value)}
                      className="w-full px-4 py-2 glass-light rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">All Rarities</option>
                      {filterOptions.rarities.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>

                  {/* Supertype Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Supertype</label>
                    <select
                      value={filterSupertype}
                      onChange={(e) => setFilterSupertype(e.target.value)}
                      className="w-full px-4 py-2 glass-light rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">All Supertypes</option>
                      {filterOptions.supertypes.map(supertype => (
                        <option key={supertype} value={supertype}>{supertype}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subtype Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtype</label>
                    <select
                      value={filterSubtype}
                      onChange={(e) => setFilterSubtype(e.target.value)}
                      className="w-full px-4 py-2 glass-light rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">All Subtypes</option>
                      {filterOptions.subtypes.map(subtype => (
                        <option key={subtype} value={subtype}>{subtype}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || filterRarity || filterSupertype || filterSubtype) && (
                  <GradientButton
                    onClick={() => {
                      setSearchQuery("");
                      setFilterRarity("");
                      setFilterSupertype("");
                      setFilterSubtype("");
                    }}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    Clear All Filters
                  </GradientButton>
                )}
              </GlassContainer>
            </SlideUp>

            {/* Cards Grid */}
            <div ref={cardsGridRef}>
              <SlideUp delay={300}>
                <GlassContainer variant="light">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                      Cards ({filteredCards.length} {filteredCards.length !== cards.length && `of ${cards.length}`})
                    </h2>
                  </div>

                  {cards.length === 0 && loading ? (
                    <CardGridSkeleton count={12} />
                  ) : filteredCards.length > 0 ? (
                    <>
                      {filteredCards.length > 100 ? (
                        <VirtualizedCardGrid
                          cards={filteredCards}
                          cardType="tcg"
                          onCardClick={handleCardClick as any}
                          showPrice={true}
                          showSet={false}
                          showRarity={true}
                        />
                      ) : (
                        <CardList
                          cards={filteredCards}
                          onCardClick={handleCardClick}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No cards found matching your filters.
                      </p>
                    </div>
                  )}
                </GlassContainer>
              </SlideUp>
            </div>
          </div>
        </FadeIn>

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
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rarity</span>
                        <span>{modalCard.rarity}</span>
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
                      {Object.entries(modalCard.tcgplayer.prices).map(([type, prices]) => {
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
                  <Link
                    href={`/cards/${modalCard.id}`}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-center transition-colors">
                    
                    View Details
                  </Link>
                  <button
                    onClick={() => handleFavoriteToggle(modalCard)}
                    className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors ${
                      favorites.cards.some((c: TCGCard) => c.id === modalCard.id)
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {favorites.cards.some((c: TCGCard) => c.id === modalCard.id) ? 'Unfavorite' : 'Favorite'}
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

export default SetIdPage;