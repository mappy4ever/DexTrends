import React, { useState, useCallback, useMemo, CSSProperties, useEffect, useRef } from 'react';
import { FixedSizeGrid as Grid, GridOnScrollProps } from 'react-window';
import UnifiedCard from './cards/UnifiedCard';
import { InlineLoader } from '../../utils/unifiedLoading';
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';
import { Pokemon } from '../../types/api/pokemon';
import { getRaritySymbol, getRarityGlowClass } from '../../utils/tcgRaritySymbols';
import OptimizedImage from './OptimizedImage';

interface VirtualizedCardGridProps {
  cards?: Array<TCGCard | PocketCard | Pokemon>;
  cardType?: 'tcg' | 'pocket' | 'pokedex';
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
  showRarity?: boolean;
  onCardClick?: ((card: TCGCard | PocketCard | Pokemon) => void) | null;
  onMagnifyClick?: ((card: TCGCard | PocketCard | Pokemon) => void) | null;
  className?: string;
  itemsPerPage?: number;
}

interface CellRendererProps {
  columnIndex: number;
  rowIndex: number;
  style: CSSProperties;
}

/**
 * High-performance virtualized card grid for handling thousands of cards
 * Uses react-window for optimal memory usage and smooth scrolling
 */
const VirtualizedCardGrid: React.FC<VirtualizedCardGridProps> = ({
  cards = [],
  cardType = "tcg",
  showPrice = true,
  showSet = true,
  showTypes = true,
  showRarity = true,
  onCardClick = null,
  onMagnifyClick = null,
  className = "",
  itemsPerPage = 48
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400);
  // Use useRef for persistent column locking that survives card array updates
  const initialColumnCountRef = useRef<number | null>(null);
  const prevCardsLengthRef = useRef<number>(cards.length);
  
  // Track viewport width changes
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Debug container width changes
  useEffect(() => {
    if (containerRef) {
      logger.debug('Container ref set. Width:', containerRef.clientWidth, 'Viewport:', window.innerWidth);
    }
  }, [containerRef]);
  
  // Calculate grid dimensions
  const CARD_WIDTH = 200;
  const CARD_HEIGHT = 280;
  const GAP = 16;
  const PADDING = 16;
  
  // Use container width with better defaults
  const containerWidth = containerRef?.clientWidth || 1200;
  
  // Calculate columns based on container width
  const actualColumnCount = useMemo(() => {
    const availableWidth = containerWidth - (PADDING * 2);
    const cols = Math.floor(availableWidth / (CARD_WIDTH + GAP));
    // Responsive columns: 2-8 based on screen size
    if (containerWidth < 640) return 2; // Mobile
    if (containerWidth < 768) return 3; // Small tablet
    if (containerWidth < 1024) return 4; // Tablet
    if (containerWidth < 1280) return 5; // Small desktop
    if (containerWidth < 1536) return 6; // Desktop
    return Math.min(8, Math.max(2, cols)); // Large desktop
  }, [containerWidth]);
  
  // Lock in the initial column count using ref to persist through card updates
  useEffect(() => {
    if (actualColumnCount > 4 && initialColumnCountRef.current === null) {
      initialColumnCountRef.current = actualColumnCount;
      logger.debug('🔒 Locking initial column count with useRef:', actualColumnCount);
    }
  }, [actualColumnCount]);
  
  // Track card array changes
  useEffect(() => {
    if (prevCardsLengthRef.current !== cards.length) {
      logger.debug('📊 Card array changed:', {
        previousLength: prevCardsLengthRef.current,
        newLength: cards.length,
        lockedColumns: initialColumnCountRef.current,
        currentColumns: actualColumnCount
      });
      prevCardsLengthRef.current = cards.length;
    }
  }, [cards.length, actualColumnCount]);
  
  // Use the locked column count if available, ensuring it persists through updates
  const finalColumnCount = initialColumnCountRef.current || actualColumnCount;
  
  // Enhanced debug logging
  useEffect(() => {
    logger.debug('VirtualizedCardGrid State:', {
      containerWidth,
      viewportWidth,
      actualColumns: actualColumnCount,
      finalColumns: finalColumnCount,
      initialLocked: initialColumnCountRef.current,
      containerExists: !!containerRef,
      cardWidth: CARD_WIDTH,
      cardsCount: cards.length
    });
  }, [containerWidth, viewportWidth, actualColumnCount, finalColumnCount, containerRef, cards.length]);
  
  // Calculate actual card width to fill container
  const actualCardWidth = (containerWidth - PADDING * 2 - (GAP * (finalColumnCount - 1))) / finalColumnCount;
  
  // Use all cards directly - no infinite scroll
  const displayedCards = cards;
  const scrollLoading = false;
  
  // Calculate grid dimensions
  const rowCount = Math.ceil(displayedCards.length / finalColumnCount);
  const gridHeight = rowCount * (CARD_HEIGHT + GAP);
  
  // Memoized cell renderer
  const CellRenderer = useCallback(({ columnIndex, rowIndex, style }: CellRendererProps) => {
    const cardIndex = rowIndex * finalColumnCount + columnIndex;
    const card = displayedCards[cardIndex];
    
    if (!card) return null;
    
    const isTCGCard = cardType === 'tcg' && 'rarity' in card;
    
    return (
      <div style={style}>
        <div style={{ padding: GAP / 2 }} className="relative">
          <div className={isTCGCard && card.rarity ? getRarityGlowClass(card.rarity) : ''}>
            <UnifiedCard
              card={card}
              cardType={cardType}
              showPrice={showPrice}
              showSet={showSet}
              showTypes={showTypes}
              showRarity={showRarity}
              onCardClick={onCardClick}
              onMagnifyClick={onMagnifyClick}
              disableLazyLoad={true}
              className="h-full" />
          </div>
          {/* Rarity symbol overlay for TCG cards */}
          {isTCGCard && card.rarity && (
            <img 
              src={getRaritySymbol(card.rarity)} 
              alt={card.rarity}
              className="absolute top-3 right-3 w-6 h-6 z-10 pointer-events-none"
              loading="lazy"
            />
          )}
        </div>
      </div>
    );
  }, [displayedCards, finalColumnCount, cardType, showPrice, showSet, showTypes, showRarity, onCardClick, onMagnifyClick]);
  
  
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No cards to display</p>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div
        ref={setContainerRef}
        className="w-full max-w-none"
        style={{ height: gridHeight, width: '100%' }}
      >
        {containerRef && (
          <Grid
            columnCount={finalColumnCount}
            columnWidth={actualCardWidth}
            height={gridHeight}
            rowCount={rowCount}
            rowHeight={CARD_HEIGHT + GAP}
            width={containerWidth}
            overscanRowCount={5}
            overscanColumnCount={3}
          >
            {CellRenderer}
          </Grid>
        )}
      </div>
      
      {/* Stats */}
      <div className="text-center mt-4 text-sm text-gray-500">
        {cards.length} cards
      </div>
    </div>
  );
};

export default VirtualizedCardGrid;