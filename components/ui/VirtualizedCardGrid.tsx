import React, { useState, useCallback, useMemo, CSSProperties } from 'react';
import { FixedSizeGrid as Grid, GridOnScrollProps } from 'react-window';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import UnifiedCard from './cards/UnifiedCard';
import { InlineLoadingSpinner } from './loading/LoadingSpinner';
import { TCGCard } from '../../types/api/cards';
import { PocketCard } from '../../types/api/pocket-cards';
import { Pokemon } from '../../types/api/pokemon';

interface VirtualizedCardGridProps {
  cards?: Array<TCGCard | PocketCard | Pokemon>;
  cardType?: 'tcg' | 'pocket' | 'pokedex';
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
  showRarity?: boolean;
  onCardClick?: ((card: TCGCard | PocketCard | Pokemon) => void) | null;
  onMagnifyClick?: ((card: TCGCard | PocketCard | Pokemon) => void) | null;
  hasMore?: boolean;
  onLoadMore?: (() => void) | null;
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
  hasMore = false,
  onLoadMore = null,
  className = "",
  itemsPerPage = 48
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  
  // Calculate grid dimensions
  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 320;
  const GAP = 16;
  const PADDING = 16;
  
  // Get container dimensions
  const containerWidth = containerRef?.clientWidth || 1200;
  const columnsCount = Math.floor((containerWidth - PADDING * 2) / (CARD_WIDTH + GAP));
  const actualColumnCount = Math.max(2, Math.min(8, columnsCount));
  
  // Calculate actual card width to fill container
  const actualCardWidth = (containerWidth - PADDING * 2 - (GAP * (actualColumnCount - 1))) / actualColumnCount;
  
  // Infinite scroll integration
  const { visibleItems: displayedCards, isLoading: scrollLoading } = useInfiniteScroll(
    cards,
    24,
    12
  );
  
  // Calculate grid dimensions
  const rowCount = Math.ceil(displayedCards.length / actualColumnCount);
  const gridHeight = Math.min(800, rowCount * (CARD_HEIGHT + GAP));
  
  // Memoized cell renderer
  const CellRenderer = useCallback(({ columnIndex, rowIndex, style }: CellRendererProps) => {
    const cardIndex = rowIndex * actualColumnCount + columnIndex;
    const card = displayedCards[cardIndex];
    
    if (!card) return null;
    
    return (
      <div style={style}>
        <div style={{ padding: GAP / 2 }}>
          <UnifiedCard
            card={card}
            cardType={cardType}
            showPrice={showPrice}
            showSet={showSet}
            showTypes={showTypes}
            showRarity={showRarity}
            onCardClick={onCardClick}
            onMagnifyClick={onMagnifyClick}
            className="h-full" />
        </div>
      </div>
    );
  }, [displayedCards, actualColumnCount, cardType, showPrice, showSet, showTypes, showRarity, onCardClick, onMagnifyClick]);
  
  // Load more when scrolling near bottom
  const handleScroll = useCallback((props: GridOnScrollProps) => {
    // Since we're using useInfiniteScroll hook, we don't need to manually handle load more here
    // The hook already handles the infinite scrolling logic
  }, []);
  
  if (displayedCards.length === 0) {
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
        className="w-full"
        style={{ height: gridHeight }}
      >
        {containerRef && (
          <Grid
            columnCount={actualColumnCount}
            columnWidth={actualCardWidth}
            height={gridHeight}
            rowCount={rowCount}
            rowHeight={CARD_HEIGHT + GAP}
            width={containerWidth}
            onScroll={handleScroll}
            overscanRowCount={2}
            overscanColumnCount={1}
          >
            {CellRenderer}
          </Grid>
        )}
      </div>
      
      {/* Loading indicator */}
      {scrollLoading && hasMore && (
        <div className="flex justify-center py-4">
          <InlineLoadingSpinner text="Loading more cards..." />
        </div>
      )}
      
      {/* Stats */}
      <div className="text-center mt-4 text-sm text-gray-500">
        Showing {displayedCards.length} of {cards.length} cards
        {hasMore && !scrollLoading && (
          <div className="text-xs mt-1">Scroll down to load more...</div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedCardGrid;