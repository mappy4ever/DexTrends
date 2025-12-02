import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { CleanRaritySymbol } from '../ui/CleanRaritySymbol';
import PriceIndicator from '../ui/PriceIndicator';
const PriceDisplay = PriceIndicator; // Alias
import type { TCGCard } from '@/types/api/cards';

interface CardShowcaseProps {
  cards: TCGCard[];
  title?: string;
  getPrice?: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

export const CardShowcase: React.FC<CardShowcaseProps> = ({
  cards,
  title = "Top Value Cards",
  getPrice = () => 0,
  onCardClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only show top 5 cards
  const displayCards = cards.slice(0, 5);
  
  // Auto-rotate carousel
  React.useEffect(() => {
    if (displayCards.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % displayCards.length);
      }, 4000);
      return () => clearInterval(interval);
    }
    // Explicit return for when no cards
    return undefined;
  }, [displayCards.length]);

  if (cards.length === 0) return null;
  
  const activeCard = displayCards[activeIndex] || displayCards[0];
  if (!activeCard) return null;
  
  const price = getPrice(activeCard);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden relative"
    >
      <div className="relative">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
            {title}
          </h3>
          <div className="flex items-center gap-1">
            {displayCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-300',
                  index === activeIndex
                    ? 'w-6 bg-gradient-to-r from-amber-500 to-pink-500'
                    : 'bg-stone-400/50 hover:bg-stone-400'
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Main Showcase - Compact Layout */}
        <div className="flex gap-4">
          {/* Featured Card Display - Simplified */}
          <div className="relative flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative w-48 h-64"
              >
                <div
                  className={cn(
                    'relative rounded-xl overflow-hidden cursor-pointer',
                    'shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-150'
                  )}
                  onClick={() => onCardClick?.(activeCard)}
                >
                  <img
                    src={activeCard.images?.large || activeCard.images?.small}
                    alt={activeCard.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Card Details - Compact */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Card Name */}
                <h4 className="text-xl font-bold text-stone-800 dark:text-stone-200 truncate">
                  {activeCard.name}
                </h4>
                
                {/* Compact Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 dark:text-stone-300">Set:</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {activeCard.set?.name?.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 dark:text-stone-300">#</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {activeCard.number}/{activeCard.set?.printedTotal}
                    </span>
                  </div>
                </div>
                
                {/* Rarity and Price - Compact */}
                <div className="flex items-center justify-between">
                  {activeCard.rarity && (
                    <CleanRaritySymbol
                      rarity={activeCard.rarity}
                      size="sm"
                      showLabel={true}
                    />
                  )}
                  
                  {price > 0 && (
                    <PriceDisplay
                      price={price}
                      size="md"
                      variant={price >= 100 ? 'premium' : price >= 50 ? 'sale' : 'default'}
                      animated={true}
                    />
                  )}
                </div>
                
                {/* Artist - Compact */}
                {activeCard.artist && (
                  <div className="text-xs text-stone-500 dark:text-stone-300 truncate">
                    Artist: {activeCard.artist}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Compact Thumbnail Strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {displayCards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200',
                    'border',
                    index === activeIndex
                      ? 'border-amber-500 shadow-lg ring-2 ring-amber-500/30'
                      : 'border-stone-200 dark:border-stone-700 opacity-60 hover:opacity-100'
                  )}
                >
                  <img
                    src={card.images?.small}
                    alt={card.name}
                    className="w-12 h-16 object-cover"
                  />
                  {index === activeIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardShowcase;