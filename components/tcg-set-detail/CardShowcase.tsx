import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { CleanRaritySymbol } from '../ui/CleanRaritySymbol';
import PriceDisplay from '../ui/PriceDisplay';
import type { TCGCard } from '@/types/api/cards';

interface CardShowcaseProps {
  cards: TCGCard[];
  title?: string;
  getPrice?: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

export const CardShowcase: React.FC<CardShowcaseProps> = ({
  cards,
  title = "Featured Cards",
  getPrice = () => 0,
  onCardClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-rotate carousel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cards.length]);

  if (cards.length === 0) return null;

  const activeCard = cards[activeIndex];
  const price = getPrice(activeCard);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        createGlassStyle({
          blur: '2xl',
          opacity: 'strong',
          gradient: true,
          border: 'strong',
          rounded: 'xl',
          shadow: 'xl'
        }),
        'p-8 md:p-12 overflow-hidden relative'
      )}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === activeIndex
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gray-400/50 hover:bg-gray-400'
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Card Display */}
          <div className="relative flex justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-20 scale-125" />
                
                {/* Card container */}
                <div 
                  className={cn(
                    'relative rounded-2xl overflow-hidden cursor-pointer',
                    'transform hover:scale-105 transition-transform duration-300',
                    'shadow-2xl'
                  )}
                  onClick={() => onCardClick?.(activeCard)}
                >
                  <img
                    src={activeCard.images?.large || activeCard.images?.small}
                    alt={activeCard.name}
                    className="w-80 h-auto lg:w-96"
                  />
                  
                  {/* Holographic overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Card Details */}
          <div className="flex flex-col justify-center space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Card Name */}
                <h4 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {activeCard.name}
                </h4>
                
                {/* Card Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={cn(
                    'p-3 rounded-xl',
                    createGlassStyle({
                      blur: 'md',
                      opacity: 'subtle',
                      border: 'subtle',
                      rounded: 'lg'
                    })
                  )}>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Set</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {activeCard.set?.name}
                    </div>
                  </div>
                  
                  <div className={cn(
                    'p-3 rounded-xl',
                    createGlassStyle({
                      blur: 'md',
                      opacity: 'subtle',
                      border: 'subtle',
                      rounded: 'lg'
                    })
                  )}>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Number</div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {activeCard.number} / {activeCard.set?.printedTotal}
                    </div>
                  </div>
                </div>
                
                {/* Rarity and Price */}
                <div className="flex items-center justify-between mb-4">
                  {activeCard.rarity && (
                    <div className="flex items-center gap-2">
                      <CleanRaritySymbol
                        rarity={activeCard.rarity}
                        size="md"
                        showLabel={true}
                      />
                    </div>
                  )}
                  
                  {price > 0 && (
                    <PriceDisplay
                      price={price}
                      size="lg"
                      variant={price >= 100 ? 'premium' : price >= 50 ? 'sale' : 'default'}
                      animated={true}
                    />
                  )}
                </div>
                
                {/* Artist */}
                {activeCard.artist && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Illustrated by {activeCard.artist}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Clean Thumbnail Strip */}
        <div className="mt-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300',
                'border',
                index === activeIndex
                  ? 'border-purple-500 shadow-xl scale-110'
                  : 'border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={card.images?.small}
                alt={card.name}
                className="w-20 h-28 object-cover"
              />
              {index === activeIndex && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-gradient-to-t from-purple-500/50 to-transparent"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CardShowcase;