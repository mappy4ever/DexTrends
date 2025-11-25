import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "./ui/LazyMotion";
import Modal from '@/components/ui/Modal';
import logger from "@/utils/logger";
import { SkeletonGrid as CardGridSkeleton } from "./ui/Skeleton";
import { TCGCard } from "../types/api/cards";
import performanceMonitor from "../utils/performanceMonitor";
// Glass styles replaced with Tailwind classes

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
  logger.debug('Rendering card', { id: card.id, name: card.name });
  
  // Get price for the card
  const price = card.currentPrice || 0;
  const setNumber = card.number || '???';
  const setId = card.set?.id || '';
  
  // Determine rarity color
  const getRarityPillColor = (rarity?: string) => {
    if (!rarity) return 'from-gray-100/80 to-gray-200/80';
    const lower = rarity.toLowerCase();
    if (lower.includes('rare')) {
      if (lower.includes('ultra') || lower.includes('secret')) return 'from-purple-200/90 to-pink-200/90';
      if (lower.includes('holo')) return 'from-blue-200/90 to-purple-200/90';
      return 'from-blue-100/80 to-blue-200/80';
    }
    if (lower.includes('uncommon')) return 'from-green-100/80 to-green-200/80';
    return 'from-gray-100/80 to-gray-200/80';
  };
  
  return (
    <motion.div 
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.4
      }}
    >
      {/* Main Card Container with Glass Effect */}
      <motion.div
        className="
          backdrop-blur-xl bg-white/95 dark:bg-gray-800/95
          rounded-2xl p-4
          border border-white/50 dark:border-gray-700/50
          shadow-lg hover:shadow-2xl
          transform transition-all duration-300
          cursor-pointer
        "
        whileHover={!isScrolling ? {
          scale: 1.02,
          y: -4
        } : undefined}
        whileTap={!isScrolling ? { scale: 0.98 } : undefined}
        onClick={() => onCardClick(card)}
      >
        {/* Card Image Container */}
        <div className="relative rounded-xl overflow-hidden mb-3 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800">
          <img
            src={card.images?.small || '/back-card.png'}
            alt={card.name}
            className="w-full h-auto object-contain"
            loading="lazy"
            decoding="async"
          />
          
          {/* Rarity Badge - Floating Glass Orb */}
          {card.rarity && (
            <div className="absolute top-2 right-2">
              <div className={`
                w-10 h-10 rounded-full
                backdrop-blur-md bg-gradient-to-br ${getRarityPillColor(card.rarity)}
                flex items-center justify-center
                shadow-md border border-white/50
                text-xs font-bold
              `}>
                {card.rarity.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Magnify Button */}
          <button
            className="
              absolute bottom-2 right-2
              w-8 h-8 rounded-full
              backdrop-blur-md bg-white/80 dark:bg-gray-800/80
              flex items-center justify-center
              shadow-md border border-white/50
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
            "
            onClick={(e) => {
              e.stopPropagation();
              onMagnifyClick(card);
            }}
          >
            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Card Info Section */}
        <div className="space-y-2">
          {/* Name */}
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
            {card.name}
          </h3>

          {/* Glass Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />

          {/* Price & Set Info */}
          <div className="flex justify-between items-center">
            {/* Price Pill */}
            {price > 0 && (
              <div className="
                px-3 py-1 rounded-full
                bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30
                backdrop-blur-sm
                text-xs font-bold text-purple-700 dark:text-purple-300
              ">
                ${price.toFixed(2)}
              </div>
            )}

            {/* Set Badge */}
            <div className="
              px-2 py-1 rounded-full
              bg-gray-100/80 dark:bg-gray-700/80
              text-xs text-gray-600 dark:text-gray-400
              font-medium
            ">
              {setId} #{setNumber}
            </div>
          </div>
        </div>
      </motion.div>
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
          performanceMonitor.recordMetric({
            name: 'scroll-fps',
            value: fps,
            unit: 'fps',
            timestamp: Date.now()
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
    performanceMonitor.recordMetric({
      name: 'cardlist-initial-render',
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now()
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
        <div className="flex justify-center mb-8">
          <div className={"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} style={{ 
            padding: '0.75rem 1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <label htmlFor="sort" className="text-sm font-bold text-gray-700 dark:text-gray-300">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="px-4 py-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-medium border border-white/40 dark:border-gray-700/40 shadow-md focus:outline-none focus:ring-4 focus:ring-purple-500/30 transition-all cursor-pointer"
            >
              <option value="price">Price</option>
              <option value="releaseDate">Release Date</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
        </div>
      )}

      {/* Show skeleton loading when loading */}
      {loading ? (
        <CardGridSkeleton 
          count={24}
          cols={{ default: 2, sm: 3, md: 5, lg: 8 }}
          className=""
        />
      ) : (
        /* Card grid with improved spacing for glass cards */
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6"
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
          {sortedCards.map((card, _index) => {
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-12"
        >
          <div className={"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} style={{ 
            maxWidth: '24rem',
            margin: '0 auto',
            padding: '2rem'
          }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No cards found
            </p>
          </div>
        </motion.div>
      )}

      {!loading && cards.length > 0 && (
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-full px-6 py-3 shadow-lg border border-white/50 dark:border-gray-700/50">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {cards.length} cards displayed
            </span>
          </div>
        </motion.div>
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