import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "./ui/LazyMotion";
import Modal from "./ui/modals/Modal";
import UnifiedCard from "./ui/cards/UnifiedCard";
import logger from "@/utils/logger";
import { CardGridSkeleton } from "./ui/SkeletonLoader";
import { isFeatureEnabled } from "../utils/featureFlags";
import { TCGCard } from "../types/api/cards";
import { getRaritySymbol, getRarityGlowClass } from "../utils/tcgRaritySymbols";
import performanceMonitor from "../utils/performanceMonitor";
import type { Card } from "pokemontcgsdk";
import { tcgCardToSdkCard } from "../utils/cardTypeGuards";

type SortOption = "price" | "releaseDate" | "rarity";

// Note: Type converter moved to cardTypeGuards.ts for reusability and type safety

interface CardListProps {
  cards?: TCGCard[];
  loading?: boolean;
  error?: string | null;
  initialSortOption?: SortOption;
  onCardClick?: (card: TCGCard) => void;
  onRarityClick?: (rarity: string) => void;
  getPrice?: (card: TCGCard) => number;
  getReleaseDate?: (card: TCGCard) => string;
  getRarityRank?: (card: TCGCard) => number;
}

interface CardWithPrice extends TCGCard {
  currentPrice: number;
}

// Memoized card item component for better performance
interface CardItemProps {
  card: CardWithPrice;
  onMagnifyClick: (card: TCGCard) => void;
  onCardClick: (card: TCGCard) => void;
  isScrolling?: boolean;
}

const CardItem = memo<CardItemProps>(({ card, onMagnifyClick, onCardClick, isScrolling = false }) => {
  logger.debug('Rendering card', { id: card.id, name: card.name }); // Debug log
  
  return (
    <motion.div 
      className={`relative ${getRarityGlowClass(card.rarity)} ${isScrolling ? 'pointer-events-none' : ''}`}
      style={{
        minHeight: '280px',
        contain: 'layout style paint',
        visibility: 'visible',
        opacity: 1,
        display: 'block'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 24,
        duration: 0.4
      }}
      whileHover={!isScrolling ? { 
        scale: 1.02,
        y: -4,
        transition: { 
          type: "spring" as const, 
          stiffness: 400, 
          damping: 17,
          duration: 0.2
        }
      } : undefined}
      whileTap={!isScrolling ? { scale: 0.98 } : undefined}
    >
      <UnifiedCard
        card={tcgCardToSdkCard(card)}
        cardType="tcg"
        showPrice={true}
        showSet={true}
        showTypes={true}
        showRarity={true}
        onMagnifyClick={(_convertedCard) => onMagnifyClick(card)}
        onCardClick={(_convertedCard) => onCardClick(card)}
        className="will-change-transform"
        disableLazyLoad={false}
      />
      {card.rarity && (
        <img 
          src={getRaritySymbol(card.rarity)} 
          alt={card.rarity}
          className="absolute top-2 right-2 w-6 h-6 z-10 pointer-events-none"
          loading="lazy"
          decoding="async"
        />
      )}
      {/* Hover overlay effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 rounded-lg pointer-events-none"
        whileHover={!isScrolling ? { opacity: 1 } : undefined}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
});

CardItem.displayName = 'CardItem';

// Custom comparison for CardItem
const areCardItemPropsEqual = (prev: CardItemProps, next: CardItemProps) => {
  return (
    prev.card.id === next.card.id &&
    prev.card.currentPrice === next.card.currentPrice &&
    prev.isScrolling === next.isScrolling
  );
};

const MemoizedCardItem = memo(CardItem, areCardItemPropsEqual);

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: CardListProps, nextProps: CardListProps): boolean => {
  // Check if cards array length changed
  if (prevProps.cards?.length !== nextProps.cards?.length) return false;
  
  // Check if loading/error states changed
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.error !== nextProps.error) return false;
  
  // Check if sort option changed
  if (prevProps.initialSortOption !== nextProps.initialSortOption) return false;
  
  // For cards array, only check if the array reference changed
  // Individual card updates will be handled by UnifiedCard's own memoization
  if (prevProps.cards !== nextProps.cards) return false;
  
  // Check if callback functions changed (they should be stable with useCallback)
  if (prevProps.onCardClick !== nextProps.onCardClick) return false;
  if (prevProps.onRarityClick !== nextProps.onRarityClick) return false;
  if (prevProps.getPrice !== nextProps.getPrice) return false;
  if (prevProps.getReleaseDate !== nextProps.getReleaseDate) return false;
  if (prevProps.getRarityRank !== nextProps.getRarityRank) return false;
  
  return true;
};

const CardList = memo<CardListProps>(({
  cards = [],
  loading = false,
  error = null,
  initialSortOption = "price",
  onCardClick = () => {},
  onRarityClick,
  getPrice = () => 0,
  getReleaseDate = () => "0000-00-00",
  getRarityRank = () => 0,
}) => {
  // Local sort state
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);
  const [zoomedCard, setZoomedCard] = useState<TCGCard | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef(performance.now());
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  }, []);
  
  const handleMagnifyClick = useCallback((card: TCGCard) => {
    setZoomedCard(card);
  }, []);
  
  const handleCloseModal = useCallback(() => {
    setZoomedCard(null);
  }, []);
  
  const handleCardClick = useCallback((card: TCGCard) => {
    onCardClick(card);
  }, [onCardClick]);
  
  // Scroll performance optimization with monitoring
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let rafId: number;
    let frameCount = 0;
    let lastTime = performance.now();
    
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        frameCount++;
        
        // Track FPS during scroll
        if (frameCount % 30 === 0) {
          const fps = 1000 / deltaTime;
          performanceMonitor.recordMetric('scroll-fps', fps, {
            cardCount: cards.length,
            isScrolling: true
          });
        }
        
        setIsScrolling(true);
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
          frameCount = 0;
        }, 150);
        
        // Note: Virtual scrolling removed - all cards render for better reliability
      });
    };
    
    // Add passive scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [cards.length]);
  
  // Track initial render performance
  useEffect(() => {
    const renderTime = performance.now() - mountTimeRef.current;
    performanceMonitor.recordMetric('cardlist-initial-render', renderTime, {
      cardCount: cards.length,
      sortOption
    });
    
    if (renderTime > 100) {
      logger.warn(`Slow CardList render: ${renderTime.toFixed(2)}ms for ${cards.length} cards`);
    }
  }, [cards.length, sortOption]);

  // Sorting logic
  const sortedCards = useMemo(() => {
    logger.debug('CardList received cards', { count: cards.length }); // Debug log
    return [...cards].sort((a, b) => {
      if (sortOption === "price") {
        return getPrice(b) - getPrice(a);
      }
      if (sortOption === "releaseDate") {
        return (
          new Date(getReleaseDate(b)).getTime() -
          new Date(getReleaseDate(a)).getTime()
        );
      }
      if (sortOption === "rarity") {
        return getRarityRank(b) - getRarityRank(a);
      }
      return 0;
    });
  }, [cards, sortOption, getPrice, getReleaseDate, getRarityRank]);


  return (
    <div 
      ref={containerRef}
      className="w-full mx-auto px-2 sm:px-4 scroll-smooth"
      style={{
        contain: 'layout',
        willChange: isScrolling ? 'scroll-position' : 'auto'
      }}
    >
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && (
        <div className="flex justify-center mb-6">
          <label htmlFor="sort" className="mr-2 font-semibold">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="price">Price</option>
            <option value="releaseDate">Release Date</option>
            <option value="rarity">Rarity</option>
          </select>
        </div>
      )}

      {/* Show skeleton loading when loading */}
      {loading ? (
        <CardGridSkeleton 
          count={24}
          columns={8}
          showPrice={true}
          showSet={true}
          showTypes={true}
          className=""
        />
      ) : (
        /* Card grid with performance optimizations */
        <motion.div 
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-2 sm:gap-4"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.1,
                staggerChildren: 0.03
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {sortedCards.map((card, index) => {
            // Add current price to card object for UnifiedCard to access
            const cardWithPrice: CardWithPrice = {
              ...card,
              currentPrice: getPrice(card)
            };

            return (
              <MemoizedCardItem
                key={card.id}
                card={cardWithPrice}
                onMagnifyClick={handleMagnifyClick}
                onCardClick={handleCardClick}
                isScrolling={isScrolling}
              />
            );
          })}
        </motion.div>
      )}

      {!loading && !error && cards.length === 0 && (
        <p className="text-center text-content-muted mt-12">
          No cards found for this Pokémon.
        </p>
      )}

      {!loading && cards.length > 0 && (
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400">
          {cards.length} cards
        </div>
      )}

      {/* Modal for zoomed card */}
      {zoomedCard && (
        <Modal isOpen={!!zoomedCard} onClose={handleCloseModal}>
          <div className="flex flex-col items-center p-4">
            <Image
              src={zoomedCard.images?.large || '/back-card.png'}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg shadow-2xl mb-4"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
              sizes="400px"
            />
            <button
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}, arePropsEqual);

CardList.displayName = 'CardList';

export default CardList;