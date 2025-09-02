import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';
import { Sheet as BottomSheet } from '@/components/ui/Sheet';
import { VirtualizedCardGrid as VirtualCardGrid } from '@/components/ui/VirtualizedCardGrid';
import hapticFeedback from '@/utils/hapticFeedback';
import logger from '@/utils/logger';
import type { TCGCard, CardSet } from '@/types/api/cards';
import { RarityIcon } from '@/components/ui/RarityIcon';

interface MobileTCGSetDetailProps {
  setInfo: CardSet;
  cards: TCGCard[];
  loading: boolean;
  filterOptions: {
    rarities: string[];
    subtypes: string[];
    supertypes: string[];
  };
  filterRarity: string;
  filterSupertype: string;
  searchQuery: string;
  onFilterRarityChange: (rarity: string) => void;
  onFilterSupertypeChange: (supertype: string) => void;
  onSearchChange: (query: string) => void;
  onCardClick: (card: TCGCard) => void;
  getCardPrice: (card: TCGCard) => number;
  statistics: any;
  totalValue: number;
  averagePrice: number;
  uniqueRarities: number;
  router: any;
}

export const MobileTCGSetDetail: React.FC<MobileTCGSetDetailProps> = ({
  setInfo,
  cards,
  loading,
  filterOptions,
  filterRarity,
  filterSupertype,
  searchQuery,
  onFilterRarityChange,
  onFilterSupertypeChange,
  onSearchChange,
  onCardClick,
  getCardPrice,
  statistics,
  totalValue,
  averagePrice,
  uniqueRarities,
  router
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [previewCard, setPreviewCard] = useState<TCGCard | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [pressedCardId, setPressedCardId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Collection progress
  const collectionProgress = useMemo(() => {
    const total = setInfo.printedTotal || setInfo.total;
    const collected = Math.floor(total * 0.3); // Mock data - would come from user data
    return { collected, total, percentage: (collected / total) * 100 };
  }, [setInfo]);
  
  // Handle long press for card preview
  const handleCardPressStart = useCallback((card: TCGCard) => {
    setPressedCardId(card.id);
    const timer = setTimeout(() => {
      hapticFeedback.medium();
      setPreviewCard(card);
      setPressedCardId(null);
    }, 300);
    setLongPressTimer(timer);
  }, []);
  
  const handleCardPressEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setPressedCardId(null);
  }, [longPressTimer]);
  
  // Handle card tap (short press)
  const handleCardTap = useCallback((card: TCGCard) => {
    if (!pressedCardId) {
      hapticFeedback.selection();
      onCardClick(card);
    }
  }, [pressedCardId, onCardClick]);
  
  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);
  
  // Custom card renderer for VirtualCardGrid
  const renderCard = useCallback((card: TCGCard) => (
    <motion.div
      key={card.id}
      className="relative"
      initial={{ scale: 1 }}
      animate={{ scale: pressedCardId === card.id ? 0.95 : 1 }}
      transition={{ duration: 0.2 }}
      onTouchStart={() => handleCardPressStart(card)}
      onTouchEnd={handleCardPressEnd}
      onTouchCancel={handleCardPressEnd}
      onMouseDown={() => handleCardPressStart(card)}
      onMouseUp={handleCardPressEnd}
      onMouseLeave={handleCardPressEnd}
      onClick={() => handleCardTap(card)}
    >
      <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md">
        <ProgressiveImage
          src={card.images.small}
          alt={card.name}
          className="w-full h-full"
          imgClassName="object-cover"
          placeholder={card.images.small.replace('/small/', '/low/')}
        />
        
        {/* Price badge */}
        {getCardPrice(card) > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            ${getCardPrice(card).toFixed(2)}
          </div>
        )}
        
        {/* Rarity badge */}
        {card.rarity && (
          <div className="absolute top-2 left-2">
            <RarityIcon rarity={card.rarity} size="xs" showLabel={false} />
          </div>
        )}
      </div>
      
      {/* Card name */}
      <p className="mt-1 text-xs font-medium text-center truncate px-1">
        {card.name}
      </p>
    </motion.div>
  ), [pressedCardId, handleCardPressStart, handleCardPressEnd, handleCardTap, getCardPrice]);
  
  return (
    <div className="mobile-tcg-set-detail pb-20">
      {/* Sticky Header with Stats */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* Horizontal scrollable stats bar */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-4">
          <div className="flex-shrink-0 min-w-[100px]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Cards</p>
            <p className="text-lg font-bold">{cards.length}/{setInfo.total}</p>
          </div>
          
          <div className="flex-shrink-0 min-w-[100px]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Collection</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{collectionProgress.percentage.toFixed(0)}%</p>
              <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${collectionProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 min-w-[100px]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Price</p>
            <p className="text-lg font-bold">${averagePrice.toFixed(2)}</p>
          </div>
          
          <div className="flex-shrink-0 min-w-[100px]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="text-lg font-bold">${totalValue.toFixed(0)}</p>
          </div>
          
          <div className="flex-shrink-0 min-w-[100px]">
            <p className="text-xs text-gray-500 dark:text-gray-400">Rarities</p>
            <p className="text-lg font-bold">{uniqueRarities}</p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
                "flex items-center gap-2"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                />
              </svg>
              Filters
              {(filterRarity || filterSupertype) && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                  {[filterRarity, filterSupertype].filter(Boolean).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                showSearch 
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {cards.length} cards
          </div>
        </div>
        
        {/* Search bar (collapsible) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
            >
              <div className="px-4 py-3">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search cards..."
                  className={cn(
                    "w-full px-4 py-2 rounded-lg",
                    "bg-gray-100 dark:bg-gray-800",
                    "border border-gray-200 dark:border-gray-700",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "text-sm"
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Cards Grid */}
      <div className="px-2 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2.5/3.5] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {cards.map(card => renderCard(card))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No cards found matching your filters
            </p>
            <button
              onClick={() => {
                onFilterRarityChange('');
                onFilterSupertypeChange('');
                onSearchChange('');
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      
      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Cards"
        position="bottom"
        size="lg"
      >
        <div className="p-4 space-y-4">
          {/* Rarity Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Rarity</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onFilterRarityChange('');
                  hapticFeedback.selection();
                }}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  !filterRarity
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                All
              </button>
              {filterOptions.rarities.map(rarity => (
                <button
                  key={rarity}
                  onClick={() => {
                    onFilterRarityChange(filterRarity === rarity ? '' : rarity);
                    hapticFeedback.selection();
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                    filterRarity === rarity
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <RarityIcon rarity={rarity} size="xs" showLabel={false} />
                  <span>{rarity}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Type</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onFilterSupertypeChange('');
                  hapticFeedback.selection();
                }}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  !filterSupertype
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                All
              </button>
              {filterOptions.supertypes.map(type => (
                <button
                  key={type}
                  onClick={() => {
                    onFilterSupertypeChange(filterSupertype === type ? '' : type);
                    hapticFeedback.selection();
                  }}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    filterSupertype === type
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(filterRarity || filterSupertype) && (
            <button
              onClick={() => {
                onFilterRarityChange('');
                onFilterSupertypeChange('');
                setShowFilters(false);
                hapticFeedback.light();
              }}
              className="w-full py-3 bg-red-500 text-white rounded-lg font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </BottomSheet>
      
      {/* Card Preview Modal */}
      <AnimatePresence>
        {previewCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-2xl">
                <ProgressiveImage
                  src={previewCard.images.large}
                  alt={previewCard.name}
                  className="w-full h-full"
                  imgClassName="object-contain"
                  priority={true}
                />
              </div>
              
              {/* Card details */}
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
                <h3 className="font-bold text-lg">{previewCard.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {previewCard.set.name}
                  </span>
                  {getCardPrice(previewCard) > 0 && (
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${getCardPrice(previewCard).toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      onCardClick(previewCard);
                      setPreviewCard(null);
                    }}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setPreviewCard(null)}
                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileTCGSetDetail;