import React, { useRef, useState, useEffect, memo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TCGCard } from '../types/api/cards';
import UnifiedCard from './ui/cards/UnifiedCard';
import { motion } from 'framer-motion';
import performanceMonitor from '../utils/performanceMonitor';
import logger from '../utils/logger';
import styles from '../styles/virtual-card-grid.module.css';

interface VirtualCardGridProps {
  cards: TCGCard[];
  onCardClick: (card: TCGCard) => void;
  getPrice?: (card: TCGCard) => number;
}

// Hook to calculate grid dimensions based on viewport
const useGridDimensions = () => {
  const [dimensions, setDimensions] = useState({ cols: 8, cardWidth: 150 });
  
  useEffect(() => {
    const calculate = () => {
      const width = window.innerWidth;
      let cols = 2; // mobile default
      
      // Responsive column breakpoints
      if (width >= 640) cols = 3;  // sm
      if (width >= 768) cols = 4;  // md
      if (width >= 1024) cols = 6; // lg
      if (width >= 1280) cols = 8; // xl
      
      // Calculate card width based on available space
      const containerPadding = 32; // 16px on each side
      const gap = 16; // gap between cards
      const availableWidth = width - containerPadding;
      const cardWidth = Math.floor((availableWidth - (gap * (cols - 1))) / cols);
      
      setDimensions({ cols, cardWidth: Math.min(cardWidth, 200) }); // Max width 200px
    };
    
    calculate();
    const handleResize = () => {
      requestAnimationFrame(calculate);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return dimensions;
};

// Optimized card component for virtual scrolling
const VirtualCardItem = memo<{
  card: TCGCard;
  onCardClick: (card: TCGCard) => void;
  price?: number;
  isScrolling?: boolean;
}>(({ card, onCardClick, price, isScrolling = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Preload image
  useEffect(() => {
    if (card.images?.small) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = card.images.small;
    }
  }, [card.images?.small]);
  
  return (
    <div className={`${styles['virtual-card-container']} ${imageLoaded ? styles.loaded : styles.loading}`}>
      <motion.div
        initial={false}
        animate={{ opacity: imageLoaded ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <UnifiedCard
          card={{ ...card, currentPrice: price }}
          cardType="tcg"
          showPrice={true}
          showSet={false} // Don't show set info in grid view
          showTypes={true}
          showRarity={true}
          onCardClick={onCardClick as ((card: unknown) => void)}
          className={`${styles['virtual-card']} ${isScrolling ? styles.scrolling : ''}`}
          disableLazyLoad={false}
        />
      </motion.div>
    </div>
  );
});

VirtualCardItem.displayName = 'VirtualCardItem';

const VirtualCardGrid: React.FC<VirtualCardGridProps> = ({ 
  cards, 
  onCardClick,
  getPrice = () => 0 
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const { cols, cardWidth } = useGridDimensions();
  
  // Calculate card dimensions maintaining aspect ratio
  const cardHeight = Math.floor(cardWidth * 1.4); // Standard card ratio
  const gap = 16;
  const rowHeight = cardHeight + gap;
  
  // Track scroll performance
  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
      performanceMonitor.startTimer('virtual-scroll');
    }
    
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }
    
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      const startTime = performance.now();
      performanceMonitor.endTimer('virtual-scroll', startTime);
    }, 150);
  }, [isScrolling]);
  
  // Virtual row configuration
  const rowCount = Math.ceil(cards.length / cols);
  
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3, // Render 3 extra rows above and below viewport
    gap,
  });
  
  // Log performance metrics
  useEffect(() => {
    logger.info('VirtualCardGrid initialized', {
      totalCards: cards.length,
      cols,
      rowCount,
      cardDimensions: { width: cardWidth, height: cardHeight }
    });
  }, [cards.length, cols, rowCount, cardWidth, cardHeight]);
  
  return (
    <div 
      ref={parentRef}
      className={`${styles['virtual-scroll-container']} overflow-auto`}
      style={{
        height: '800px', // Fixed height for virtual scrolling
        maxHeight: '80vh',
        position: 'relative',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * cols;
          const endIndex = Math.min(startIndex + cols, cards.length);
          const rowCards = cards.slice(startIndex, endIndex);
          
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={styles['virtual-row']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${rowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: `${gap}px`,
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              {rowCards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    width: '100%',
                    height: `${cardHeight}px`,
                    position: 'relative',
                  }}
                >
                  <VirtualCardItem
                    card={card}
                    onCardClick={onCardClick}
                    price={getPrice(card)}
                    isScrolling={isScrolling}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(VirtualCardGrid);