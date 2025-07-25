import React, { useState, useEffect, useRef, useCallback, memo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to top when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            width: '100%',
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized grid component for Pokemon cards
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 5,
  className = '',
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const totalHeight = totalRows * rowHeight;

  // Calculate visible range
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  const visibleRows: React.ReactNode[] = [];
  for (let row = startRow; row <= endRow; row++) {
    const startIndex = row * columnsPerRow;
    const endIndex = Math.min(startIndex + columnsPerRow - 1, items.length - 1);
    
    if (startIndex <= endIndex) {
      const rowItems: React.ReactNode[] = [];
      
      for (let col = 0; col < columnsPerRow; col++) {
        const itemIndex = startIndex + col;
        if (itemIndex <= endIndex) {
          rowItems.push(
            <div
              key={itemIndex}
              style={{
                width: itemWidth,
                height: itemHeight,
                marginRight: col < columnsPerRow - 1 ? gap : 0,
              }}
            >
              {renderItem(items[itemIndex], itemIndex)}
            </div>
          );
        }
      }
      
      visibleRows.push(
        <div
          key={row}
          style={{
            display: 'flex',
            position: 'absolute',
            top: row * rowHeight,
            width: '100%',
            height: itemHeight,
          }}
        >
          {rowItems}
        </div>
      );
    }
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRows}
      </div>
    </div>
  );
}

// Note: displayName cannot be set on generic functions directly
// The memoized versions below have displayName set

export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList;
(MemoizedVirtualizedList as any).displayName = 'MemoizedVirtualizedList';

export const MemoizedVirtualizedGrid = memo(VirtualizedGrid) as typeof VirtualizedGrid;
(MemoizedVirtualizedGrid as any).displayName = 'MemoizedVirtualizedGrid';

export { VirtualizedList, VirtualizedGrid };
export default VirtualizedList;