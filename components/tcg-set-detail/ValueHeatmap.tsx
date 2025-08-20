import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import type { TCGCard } from '@/types/api/cards';

interface ValueHeatmapProps {
  cards: TCGCard[];
  getPrice: (card: TCGCard) => number;
}

export const ValueHeatmap: React.FC<ValueHeatmapProps> = ({ cards, getPrice }) => {
  // Process cards into value ranges
  const heatmapData = useMemo(() => {
    const ranges = [
      { label: '$0-5', min: 0, max: 5, cards: [], color: '#e5e7eb' },
      { label: '$5-10', min: 5, max: 10, cards: [], color: '#dbeafe' },
      { label: '$10-25', min: 10, max: 25, cards: [], color: '#dcfce7' },
      { label: '$25-50', min: 25, max: 50, cards: [], color: '#fef3c7' },
      { label: '$50-100', min: 50, max: 100, cards: [], color: '#fed7aa' },
      { label: '$100+', min: 100, max: Infinity, cards: [], color: '#fecaca' },
    ];
    
    cards.forEach(card => {
      const price = getPrice(card);
      const range = ranges.find(r => price >= r.min && price < r.max);
      if (range) {
        range.cards.push({ card, price });
      }
    });
    
    // Sort cards within each range by price
    ranges.forEach(range => {
      range.cards.sort((a, b) => b.price - a.price);
    });
    
    return ranges.filter(r => r.cards.length > 0);
  }, [cards, getPrice]);

  // Calculate max value for scaling
  const maxValue = Math.max(...heatmapData.map(d => 
    d.cards.reduce((sum, item) => sum + item.price, 0)
  ), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        createGlassStyle({
          blur: 'xl',
          opacity: 'medium',
          gradient: true,
          border: 'medium',
          rounded: 'xl',
          shadow: 'xl'
        }),
        'p-8 md:p-10'
      )}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Value Distribution
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Live Market Data
          </span>
        </div>
      </div>
      
      {/* Clean Horizontal Bar Chart */}
      <div className="space-y-6">
        {heatmapData.map((range, index) => {
          const totalValue = range.cards.reduce((sum, item) => sum + item.price, 0);
          const percentage = (totalValue / maxValue) * 100;
          
          return (
            <motion.div
              key={range.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {/* Range Header */}
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {range.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {range.cards.length} {range.cards.length === 1 ? 'card' : 'cards'}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  ${totalValue.toFixed(0)}
                </span>
              </div>
              
              {/* Clean Bar */}
              <div className="relative">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  <motion.div
                    className="h-full rounded-xl flex items-center"
                    style={{ backgroundColor: range.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: 'easeOut' }}
                  >
                    {/* Top 3 Card Thumbnails */}
                    <div className="flex items-center px-3 gap-2">
                      {range.cards.slice(0, 3).map((item, cardIndex) => (
                        <motion.div
                          key={item.card.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + cardIndex * 0.05 + 0.4 }}
                          className="relative w-8 h-10 rounded overflow-hidden shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title={`${item.card.name} - $${item.price.toFixed(2)}`}
                        >
                          <img
                            src={item.card.images?.small}
                            alt={item.card.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                      {range.cards.length > 3 && (
                        <span className="text-xs font-semibold text-gray-700 ml-2">
                          +{range.cards.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                {/* Percentage indicator */}
                <div className="absolute top-0 right-0 h-full flex items-center pr-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {((range.cards.length / cards.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary Stats - Cleaner Design */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              ${cards.reduce((sum, card) => sum + getPrice(card), 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Value</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              ${(cards.reduce((sum, card) => sum + getPrice(card), 0) / cards.length).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              ${Math.max(...cards.map(getPrice)).toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Highest</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ValueHeatmap;