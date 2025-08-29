import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GlassContainer } from '../ui/design-system/GlassContainer';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { CleanRaritySymbol } from '../ui/CleanRaritySymbol';
import type { TCGCard } from '@/types/api/cards';

interface ChaseCardsGalleryProps {
  cards: TCGCard[];
  getPrice: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
  title?: string;
  subtitle?: string;
}

type ViewMode = 'showcase' | 'grid' | 'list';
type SortOption = 'price-desc' | 'price-asc' | 'rarity' | 'number';

export const ChaseCardsGallery: React.FC<ChaseCardsGalleryProps> = ({
  cards,
  getPrice,
  onCardClick,
  title = "Chase Cards",
  subtitle = "Most valuable and sought-after cards"
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('showcase');
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(cards[0] || null);
  const [sortBy, setSortBy] = useState<SortOption>('price-desc');
  
  // Sort cards based on selected option
  const sortedCards = [...cards].sort((a, b) => {
    switch (sortBy) {
      case 'price-desc':
        return getPrice(b) - getPrice(a);
      case 'price-asc':
        return getPrice(a) - getPrice(b);
      case 'rarity':
        const rarityOrder: Record<string, number> = {
          'Rare Secret': 10,
          'Rare Rainbow': 9,
          'Rare Gold': 8,
          'Rare Ultra': 7,
          'Rare Holo VSTAR': 6,
          'Rare Holo VMAX': 5,
          'Rare Holo V': 4,
          'Rare Holo': 3,
          'Rare': 2,
          'Uncommon': 1,
          'Common': 0
        };
        return (rarityOrder[b.rarity || ''] || 0) - (rarityOrder[a.rarity || ''] || 0);
      case 'number':
        return parseInt(a.number) - parseInt(b.number);
      default:
        return 0;
    }
  });
  
  // Premium card display component
  const PremiumCard: React.FC<{
    card: TCGCard;
    index: number;
    isSelected?: boolean;
  }> = ({ card, index, isSelected = false }) => {
    const price = getPrice(card);
    const isPremium = price > 100;
    const isUltraPremium = price > 500;
    
    return (
      <motion.div
        className="relative group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        onClick={() => {
          setSelectedCard(card);
          onCardClick?.(card);
        }}
      >
        <div className={cn(
          "relative rounded-2xl overflow-hidden",
          createGlassStyle({
            blur: 'xl',
            opacity: 'strong',
            border: 'strong',
            shadow: 'xl',
            rounded: 'xl'
          }),
          isSelected && "ring-4 ring-purple-500/50",
          isPremium && "bg-gradient-to-br from-yellow-100/20 to-amber-100/20",
          isUltraPremium && "bg-gradient-to-br from-purple-100/20 via-pink-100/20 to-yellow-100/20"
        )}>
          {/* Card Image */}
          <div className="relative aspect-[2.5/3.5]">
            <Image
              src={card.images.large}
              alt={card.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Premium indicator */}
            {isUltraPremium && (
              <div className="absolute top-2 right-2">
                <motion.div
                  className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ULTRA RARE
                </motion.div>
              </div>
            )}
            
            {/* Price overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white text-sm font-medium truncate">{card.name}</p>
                  <p className="text-white/70 text-xs">#{card.number}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    price > 100 ? "text-yellow-400" : "text-green-400"
                  )}>
                    ${price.toFixed(2)}
                  </p>
                  {card.rarity && (
                    <CleanRaritySymbol rarity={card.rarity} size="sm" showLabel={false} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <GlassContainer
      variant="colored"
      blur="xl"
      rounded="2xl"
      padding="lg"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm",
              "bg-white/50 dark:bg-gray-800/50",
              "backdrop-blur-md",
              "border border-white/30 dark:border-gray-700/30",
              "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            )}
          >
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="rarity">Rarity</option>
            <option value="number">Card Number</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className={cn(
            "flex rounded-lg p-1",
            createGlassStyle({
              blur: 'md',
              opacity: 'subtle',
              border: 'subtle',
              rounded: 'lg'
            })
          )}>
            {(['showcase', 'grid', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-all capitalize",
                  viewMode === mode
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content based on view mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'showcase' && (
          <motion.div
            key="showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Featured Card Display */}
            <div className="space-y-4">
              {selectedCard && (
                <motion.div
                  key={selectedCard.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "relative rounded-2xl overflow-hidden",
                    createGlassStyle({
                      blur: '2xl',
                      opacity: 'strong',
                      border: 'strong',
                      shadow: 'xl',
                      rounded: 'xl'
                    })
                  )}
                >
                  <div className="aspect-[2.5/3.5] relative">
                    <Image
                      src={selectedCard.images.large}
                      alt={selectedCard.name}
                      fill
                      className="object-contain p-4"
                      priority
                    />
                  </div>
                  
                  {/* Card Details */}
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {selectedCard.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedCard.set.name} • #{selectedCard.number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">
                          ${getPrice(selectedCard).toFixed(2)}
                        </p>
                        {selectedCard.rarity && (
                          <CleanRaritySymbol rarity={selectedCard.rarity} size="md" showLabel={true} />
                        )}
                      </div>
                    </div>
                    
                    {selectedCard.artist && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Artist:</span> {selectedCard.artist}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Card Thumbnails */}
            <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {sortedCards.slice(0, 12).map((card, index) => (
                <PremiumCard
                  key={card.id}
                  card={card}
                  index={index}
                  isSelected={selectedCard?.id === card.id}
                />
              ))}
            </div>
          </motion.div>
        )}
        
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {sortedCards.map((card, index) => (
              <PremiumCard key={card.id} card={card} index={index} />
            ))}
          </motion.div>
        )}
        
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {sortedCards.map((card, index) => {
              const price = getPrice(card);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl cursor-pointer",
                    "backdrop-blur-md bg-white/50 dark:bg-gray-800/50",
                    "border border-white/30 dark:border-gray-700/30",
                    "hover:bg-white/70 dark:hover:bg-gray-800/70",
                    "transition-all hover:scale-[1.02]"
                  )}
                  onClick={() => onCardClick?.(card)}
                >
                  {/* Card Image Thumbnail */}
                  <div className="relative w-16 h-20 flex-shrink-0">
                    <Image
                      src={card.images.small}
                      alt={card.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Card Info */}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {card.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      #{card.number} • {card.set.name}
                    </p>
                  </div>
                  
                  {/* Rarity */}
                  {card.rarity && (
                    <CleanRaritySymbol rarity={card.rarity} size="sm" showLabel={false} />
                  )}
                  
                  {/* Price */}
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      price > 100 ? "text-yellow-500" : "text-green-500"
                    )}>
                      ${price.toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Value"
            value={`$${cards.reduce((sum, card) => sum + getPrice(card), 0).toFixed(2)}`}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Average Price"
            value={`$${(cards.reduce((sum, card) => sum + getPrice(card), 0) / cards.length).toFixed(2)}`}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Most Valuable"
            value={`$${getPrice(sortedCards[0]).toFixed(2)}`}
            gradient="from-yellow-500 to-amber-500"
          />
          <StatCard
            label="Cards Shown"
            value={cards.length.toString()}
            gradient="from-purple-500 to-pink-500"
          />
        </div>
      </div>
    </GlassContainer>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{
  label: string;
  value: string;
  gradient: string;
}> = ({ label, value, gradient }) => (
  <div className="text-center">
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className={cn(
      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
      gradient
    )}>
      {value}
    </p>
  </div>
);

export default ChaseCardsGallery;