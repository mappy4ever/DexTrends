import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Container } from '../ui/Container';
import type { TCGCard } from '@/types/api/cards';

interface ValueHeatmapProps {
  cards: TCGCard[];
  getPrice: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

// Price ranges and their colors
const PRICE_RANGES = [
  { min: 0, max: 1, color: '#E5E7EB', label: '<$1', gradient: 'from-stone-200 to-stone-300' },
  { min: 1, max: 5, color: '#BFDBFE', label: '$1-5', gradient: 'from-amber-200 to-amber-300' },
  { min: 5, max: 10, color: '#A5B4FC', label: '$5-10', gradient: 'from-amber-300 to-amber-400' },
  { min: 10, max: 25, color: '#C084FC', label: '$10-25', gradient: 'from-amber-400 to-amber-500' },
  { min: 25, max: 50, color: '#F9A8D4', label: '$25-50', gradient: 'from-pink-400 to-pink-500' },
  { min: 50, max: 100, color: '#FCA5A5', label: '$50-100', gradient: 'from-red-400 to-red-500' },
  { min: 100, max: 250, color: '#FDBA74', label: '$100-250', gradient: 'from-orange-400 to-orange-500' },
  { min: 250, max: Infinity, color: '#FDE047', label: '>$250', gradient: 'from-yellow-400 to-amber-500' }
];

const getPriceRange = (price: number) => {
  return PRICE_RANGES.find(range => price >= range.min && price < range.max) || PRICE_RANGES[0];
};

export const ValueHeatmap: React.FC<ValueHeatmapProps> = ({
  cards,
  getPrice,
  onCardClick
}) => {
  const [hoveredCard, setHoveredCard] = useState<TCGCard | null>(null);
  const [selectedRange, setSelectedRange] = useState<typeof PRICE_RANGES[0] | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'treemap'>('grid');
  
  // Sort cards by price and calculate statistics
  const processedCards = useMemo(() => {
    const sorted = [...cards]
      .map(card => ({
        card,
        price: getPrice(card),
        range: getPriceRange(getPrice(card))
      }))
      .sort((a, b) => b.price - a.price);
    
    return sorted;
  }, [cards, getPrice]);
  
  // Calculate statistics for each price range
  const rangeStats = useMemo(() => {
    const stats = new Map<string, { count: number; total: number; cards: typeof processedCards }>();
    
    PRICE_RANGES.forEach(range => {
      stats.set(range.label, { count: 0, total: 0, cards: [] });
    });
    
    processedCards.forEach(item => {
      const stat = stats.get(item.range.label);
      if (stat) {
        stat.count++;
        stat.total += item.price;
        stat.cards.push(item);
      }
    });
    
    return stats;
  }, [processedCards]);
  
  // Filter cards by selected range
  const filteredCards = selectedRange 
    ? processedCards.filter(item => item.range.label === selectedRange.label)
    : processedCards;
  
  // Create treemap layout
  const createTreemapLayout = () => {
    const totalValue = processedCards.reduce((sum, item) => sum + item.price, 0);
    const containerWidth = 800;
    const containerHeight = 600;
    
    let currentX = 0;
    let currentY = 0;
    let rowHeight = 0;
    
    return processedCards.map((item, index) => {
      const valueRatio = item.price / totalValue;
      const area = valueRatio * containerWidth * containerHeight;
      const width = Math.sqrt(area * 1.5);
      const height = area / width;
      
      if (currentX + width > containerWidth) {
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }
      
      const position = { x: currentX, y: currentY, width, height };
      currentX += width;
      rowHeight = Math.max(rowHeight, height);
      
      return { ...item, position };
    });
  };
  
  const treemapLayout = viewMode === 'treemap' ? createTreemapLayout() : [];
  
  return (
    <Container
      variant="elevated"
      rounded="xl"
      padding="lg"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
            Value Distribution
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Visual price analysis across all cards
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className={cn(
          "flex rounded-full p-1",
          createGlassStyle({
            blur: 'md',
            opacity: 'subtle',
            border: 'subtle',
            rounded: 'full'
          })
        )}>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              viewMode === 'grid'
                ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white"
                : "text-stone-600 dark:text-stone-400"
            )}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('treemap')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              viewMode === 'treemap'
                ? "bg-gradient-to-r from-amber-500 to-cyan-500 text-white"
                : "text-stone-600 dark:text-stone-400"
            )}
          >
            Treemap
          </button>
        </div>
      </div>
      
      {/* Price Range Legend */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range, index) => {
            const stats = rangeStats.get(range.label);
            const isSelected = selectedRange?.label === range.label;
            
            return (
              <motion.button
                key={range.label}
                onClick={() => setSelectedRange(isSelected ? null : range)}
                className={cn(
                  "px-4 py-2 rounded-full flex items-center gap-2",
                  "backdrop-blur-md border transition-all",
                  isSelected
                    ? "bg-white/90 dark:bg-stone-800/90 border-white/50 dark:border-stone-600/50 scale-105 shadow-lg"
                    : "bg-white/50 dark:bg-stone-800/50 border-white/30 dark:border-stone-700/30 hover:bg-white/70 dark:hover:bg-stone-800/70"
                )}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    `bg-gradient-to-r ${range.gradient}`
                  )}
                />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {range.label}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  ({stats?.count || 0})
                </span>
              </motion.button>
            );
          })}
        </div>
        
        {selectedRange && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-stone-800/50 backdrop-blur-md"
          >
            <p className="text-sm text-stone-600 dark:text-stone-400">
              <span className="font-semibold">{selectedRange.label}:</span>{' '}
              {rangeStats.get(selectedRange.label)?.count || 0} cards worth{' '}
              ${rangeStats.get(selectedRange.label)?.total.toFixed(2) || 0} total
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Heatmap Visualization */}
      <div className="relative">
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-1 p-4 bg-white/30 dark:bg-stone-800/30 rounded-xl backdrop-blur-sm">
            {filteredCards.slice(0, 200).map((item, index) => (
              <motion.div
                key={item.card.id}
                className={cn(
                  "aspect-square rounded cursor-pointer relative group",
                  `bg-gradient-to-br ${item.range.gradient}`
                )}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.002 }}
                whileHover={{ scale: 1.5, zIndex: 10 }}
                onMouseEnter={() => setHoveredCard(item.card)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onCardClick?.(item.card)}
              >
                {/* Tooltip on hover */}
                {hoveredCard?.id === item.card.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className={cn(
                      "p-2 rounded-lg shadow-xl",
                      "bg-white dark:bg-stone-800",
                      "border border-stone-200 dark:border-stone-700",
                      "whitespace-nowrap"
                    )}>
                      <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {item.card.name}
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          /* Treemap View */
          <div className="relative w-full h-[600px] bg-white/30 dark:bg-stone-800/30 rounded-xl backdrop-blur-sm overflow-hidden">
            {treemapLayout.slice(0, 50).map((item, index) => (
              <motion.div
                key={item.card.id}
                className={cn(
                  "absolute rounded border border-white/50 dark:border-stone-700/50 cursor-pointer overflow-hidden",
                  `bg-gradient-to-br ${item.range.gradient}`
                )}
                style={{
                  left: `${(item.position.x / 800) * 100}%`,
                  top: `${(item.position.y / 600) * 100}%`,
                  width: `${(item.position.width / 800) * 100}%`,
                  height: `${(item.position.height / 600) * 100}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                onMouseEnter={() => setHoveredCard(item.card)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onCardClick?.(item.card)}
              >
                {item.position.width > 60 && item.position.height > 40 && (
                  <div className="p-1 text-center">
                    <p className="text-xs font-semibold text-white truncate">
                      {item.card.name}
                    </p>
                    {item.position.height > 60 && (
                      <p className="text-xs text-white/80">
                        ${item.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-stone-200/50 dark:border-stone-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Highest Value"
            value={`$${processedCards[0]?.price.toFixed(2) || 0}`}
            subValue={processedCards[0]?.card.name || 'N/A'}
            gradient="from-yellow-400 to-amber-500"
          />
          <StatCard
            label="Average Price"
            value={`$${(processedCards.reduce((sum, item) => sum + item.price, 0) / processedCards.length).toFixed(2)}`}
            subValue="per card"
            gradient="from-amber-400 to-cyan-500"
          />
          <StatCard
            label="Cards >$10"
            value={processedCards.filter(item => item.price > 10).length.toString()}
            subValue={`${((processedCards.filter(item => item.price > 10).length / processedCards.length) * 100).toFixed(1)}%`}
            gradient="from-amber-400 to-pink-500"
          />
          <StatCard
            label="Total Value"
            value={`$${processedCards.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`}
            subValue="entire set"
            gradient="from-green-400 to-emerald-500"
          />
        </div>
      </div>
    </Container>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{
  label: string;
  value: string;
  subValue: string;
  gradient: string;
}> = ({ label, value, subValue, gradient }) => (
  <div className="text-center">
    <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">{label}</p>
    <p className={cn(
      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
      gradient
    )}>
      {value}
    </p>
    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{subValue}</p>
  </div>
);

export default ValueHeatmap;