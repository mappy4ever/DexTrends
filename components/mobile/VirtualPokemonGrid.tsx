import React, { useMemo, useCallback } from 'react';
import { useWindowVirtualScroll } from '@/hooks/useVirtualScroll';
import { cn } from '@/utils/cn';
// @ts-ignore - TypeScript issue with haptic exports
import { useHaptic } from '@/utils/hapticFeedback';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: Array<{ type: { name: string } }>;
  [key: string]: unknown;
}

interface VirtualPokemonGridProps {
  pokemon: Pokemon[];
  onPokemonClick?: (pokemon: Pokemon) => void;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: number;
  renderCard?: (pokemon: Pokemon) => React.ReactNode;
}

export const VirtualPokemonGrid: React.FC<VirtualPokemonGridProps> = ({
  pokemon,
  onPokemonClick,
  className,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 6
  },
  gap = 16,
  renderCard
}) => {
  const { cardTap } = useHaptic();
  
  // Determine current column count based on viewport width
  const columnCount = useMemo(() => {
    if (typeof window === 'undefined') return columns.mobile;
    
    const width = window.innerWidth;
    if (width < 420) return columns.mobile;
    if (width < 768) return columns.tablet;
    return columns.desktop;
  }, [columns]);

  // Calculate card dimensions
  const cardHeight = useMemo(() => {
    const baseHeight = 180; // Base card height
    const aspectRatio = 0.85; // Width/height ratio
    
    // Adjust based on screen size
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const availableWidth = width - (gap * (columnCount + 1));
      const cardWidth = availableWidth / columnCount;
      return cardWidth / aspectRatio;
    }
    
    return baseHeight;
  }, [columnCount, gap]);

  // Group pokemon into rows
  const rows = useMemo(() => {
    const rows: Pokemon[][] = [];
    for (let i = 0; i < pokemon.length; i += columnCount) {
      rows.push(pokemon.slice(i, i + columnCount));
    }
    return rows;
  }, [pokemon, columnCount]);

  // Use virtual scrolling for rows
  const { visibleItems, totalHeight } = useWindowVirtualScroll(
    rows,
    cardHeight + gap,
    5, // Overscan
    0
  );

  const handlePokemonClick = useCallback((p: Pokemon) => {
    cardTap();
    onPokemonClick?.(p);
  }, [cardTap, onPokemonClick]);

  // Default card renderer
  const defaultRenderCard = useCallback((p: Pokemon) => (
    <button
      key={p.id}
      onClick={() => handlePokemonClick(p)}
      className={cn(
        "relative group",
        "bg-white dark:bg-gray-800",
        "rounded-2xl shadow-md hover:shadow-xl",
        "transform transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "overflow-hidden",
        "focus:outline-none focus:ring-2 focus:ring-blue-400"
      )}
      style={{ height: cardHeight }}
    >
      {/* Background gradient based on type */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, 
            var(--type-${p.types[0]?.type.name || 'normal'}) 0%, 
            transparent 100%)`
        }}
      />
      
      {/* Pokemon image */}
      <div className="relative h-2/3 flex items-center justify-center p-4">
        <img
          src={p.sprite}
          alt={p.name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        
        {/* Pokemon number */}
        <span className="absolute top-2 left-2 text-xs font-bold text-gray-500 dark:text-gray-400">
          #{String(p.id).padStart(3, '0')}
        </span>
      </div>
      
      {/* Pokemon info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white dark:from-gray-800 dark:via-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
          {p.name}
        </h3>
        
        {/* Type badges */}
        <div className="flex gap-1 mt-1">
          {p.types.map((t) => (
            <span
              key={t.type.name}
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              )}
            >
              {t.type.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  ), [cardHeight, handlePokemonClick]);

  return (
    <div className={cn("relative", className)}>
      {/* Virtual scroll container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item: row, index: rowIndex, offsetTop }) => (
          <div
            key={rowIndex}
            className="absolute left-0 right-0 grid"
            style={{
              top: offsetTop,
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: `${gap}px`,
              padding: `0 ${gap}px`
            }}
          >
            {row.map((p) => (
              <React.Fragment key={p.id}>
                {renderCard ? renderCard(p) : defaultRenderCard(p)}
              </React.Fragment>
            ))}
            
            {/* Fill empty cells in last row */}
            {row.length < columnCount && Array.from({ length: columnCount - row.length }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: cardHeight }} />
            ))}
          </div>
        ))}
      </div>
      
      {/* Loading indicator for scroll */}
      {visibleItems.length > 0 && (
        <div className="sticky bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
            {visibleItems[0].index * columnCount + 1} - {Math.min(
              (visibleItems[visibleItems.length - 1].index + 1) * columnCount,
              pokemon.length
            )} of {pokemon.length}
          </div>
        </div>
      )}
    </div>
  );
};