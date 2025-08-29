import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { RarityBadge } from './RarityBadge';
import type { TCGCard } from '@/types/api/cards';

interface CardShowcaseStripProps {
  cards: TCGCard[];
  title?: string;
  onCardClick?: (card: TCGCard) => void;
  className?: string;
}

// Individual showcase card with intentional sizing
const ShowcaseCard: React.FC<{
  card: TCGCard;
  isActive: boolean;
  onClick: () => void;
  index: number;
}> = ({ card, isActive, onClick, index }) => {
  const price = card.tcgplayer?.prices
    ? Object.values(card.tcgplayer.prices)[0]?.market || 0
    : 0;
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      style={{ x }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer flex-shrink-0"
    >
      <motion.div
        style={{ rotate }}
        className={cn(
          'relative w-[140px] h-[196px] rounded-xl overflow-hidden',
          'transition-all duration-300',
          createGlassStyle({
            blur: 'md',
            opacity: isActive ? 'strong' : 'medium',
            border: 'medium',
            rounded: 'xl',
            shadow: isActive ? 'xl' : 'md'
          }),
          isActive && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
        )}
      >
        <Image
          src={card.images.small}
          alt={card.name}
          fill
          className="object-cover"
          sizes="140px"
          loading="lazy"
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Card info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center justify-between mb-1">
            <RarityBadge
              rarity={card.rarity || 'Common'}
              size="xs"
            />
            <span className="text-xs text-white/80">#{card.number}</span>
          </div>
          {price > 0 && (
            <div className="text-right">
              <p className="text-sm font-bold text-white">
                ${price.toFixed(2)}
              </p>
            </div>
          )}
        </div>
        
        {/* Premium indicator for high-value cards */}
        {price > 100 && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Main detail panel for selected card
const CardDetailPanel: React.FC<{
  card: TCGCard;
  onClose: () => void;
}> = ({ card, onClose }) => {
  const price = card.tcgplayer?.prices
    ? Object.values(card.tcgplayer.prices)[0]?.market || 0
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'absolute top-0 right-0 bottom-0 w-80 p-4',
        createGlassStyle({
          blur: 'xl',
          opacity: 'strong',
          border: 'strong',
          rounded: 'xl',
          shadow: 'xl'
        }),
        'bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80'
      )}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Card image */}
      <div className="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden mb-4">
        <Image
          src={card.images.large}
          alt={card.name}
          fill
          className="object-contain"
          sizes="320px"
        />
      </div>
      
      {/* Card details */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RarityBadge rarity={card.rarity || 'Common'} size="sm" showLabel />
            <span className="text-sm text-gray-500">#{card.number}/{card.set?.printedTotal}</span>
          </div>
        </div>
        
        {/* Price breakdown */}
        {card.tcgplayer?.prices && (
          <div className="p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Market Prices</p>
            {Object.entries(card.tcgplayer.prices).map(([type, prices]: [string, any]) => (
              <div key={type} className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${prices.market?.toFixed(2) || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Additional info */}
        <div className="space-y-2 text-xs">
          {card.artist && (
            <div className="flex justify-between">
              <span className="text-gray-500">Artist</span>
              <span className="text-gray-700 dark:text-gray-300">{card.artist}</span>
            </div>
          )}
          {card.set && (
            <div className="flex justify-between">
              <span className="text-gray-500">Set</span>
              <span className="text-gray-700 dark:text-gray-300">{card.set.name}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const CardShowcaseStrip: React.FC<CardShowcaseStripProps> = ({
  cards,
  title = "Featured Cards",
  onCardClick,
  className = ''
}) => {
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-rotate through cards
  useEffect(() => {
    if (!selectedCard && cards.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % cards.length);
      }, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [cards.length, selectedCard]);
  
  // Scroll to active card
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 140 + 12; // card width + gap
      scrollRef.current.scrollTo({
        left: activeIndex * cardWidth - 100,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);
  
  if (cards.length === 0) return null;
  
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'p-4 rounded-2xl',
        createGlassStyle({
          blur: 'lg',
          opacity: 'subtle',
          border: 'subtle',
          rounded: 'xl',
          shadow: 'sm'
        })
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {/* Card count */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {activeIndex + 1} / {cards.length}
            </span>
            
            {/* Navigation dots */}
            <div className="flex items-center gap-1">
              {cards.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'transition-all duration-300',
                    index === activeIndex
                      ? 'w-4 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'
                      : 'w-1 h-1 bg-gray-400/50 rounded-full hover:bg-gray-400'
                  )}
                />
              ))}
              {cards.length > 8 && (
                <span className="text-xs text-gray-400 ml-1">+{cards.length - 8}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Cards scroll container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cards.map((card, index) => (
              <ShowcaseCard
                key={card.id}
                card={card}
                isActive={index === activeIndex}
                onClick={() => {
                  setActiveIndex(index);
                  setSelectedCard(card);
                  onCardClick?.(card);
                }}
                index={index}
              />
            ))}
          </div>
          
          {/* Scroll indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
        </div>
      </div>
      
      {/* Detail panel */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailPanel
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardShowcaseStrip;