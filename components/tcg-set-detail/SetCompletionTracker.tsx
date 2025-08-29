import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GlassContainer } from '../ui/design-system/GlassContainer';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import type { TCGCard } from '@/types/api/cards';

interface SetCompletionTrackerProps {
  cards: TCGCard[];
  ownedCards?: Set<string>; // IDs of owned cards
  wishlistCards?: Set<string>; // IDs of wishlist cards
  onToggleOwned?: (cardId: string) => void;
  onToggleWishlist?: (cardId: string) => void;
}

export const SetCompletionTracker: React.FC<SetCompletionTrackerProps> = ({
  cards,
  ownedCards = new Set(),
  wishlistCards = new Set(),
  onToggleOwned,
  onToggleWishlist
}) => {
  const [viewMode, setViewMode] = useState<'all' | 'owned' | 'missing' | 'wishlist'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  
  // Calculate completion statistics
  const stats = useMemo(() => {
    const totalCards = cards.length;
    const owned = cards.filter(card => ownedCards.has(card.id));
    const missing = cards.filter(card => !ownedCards.has(card.id));
    const wishlist = cards.filter(card => wishlistCards.has(card.id));
    
    // Rarity breakdown
    const rarityStats = new Map<string, { total: number; owned: number }>();
    cards.forEach(card => {
      if (card.rarity) {
        const stat = rarityStats.get(card.rarity) || { total: 0, owned: 0 };
        stat.total++;
        if (ownedCards.has(card.id)) {
          stat.owned++;
        }
        rarityStats.set(card.rarity, stat);
      }
    });
    
    // Number sequence analysis
    const numbers = cards.map(c => parseInt(c.number)).sort((a, b) => a - b);
    const maxNumber = Math.max(...numbers);
    const ownedNumbers = new Set(
      owned.map(c => parseInt(c.number))
    );
    
    // Find missing number ranges
    const missingRanges: { start: number; end: number }[] = [];
    let rangeStart: number | null = null;
    
    for (let i = 1; i <= maxNumber; i++) {
      const isOwned = ownedNumbers.has(i);
      const cardExists = numbers.includes(i);
      
      if (cardExists && !isOwned) {
        if (rangeStart === null) {
          rangeStart = i;
        }
      } else if (rangeStart !== null) {
        missingRanges.push({ start: rangeStart, end: i - 1 });
        rangeStart = null;
      }
    }
    
    if (rangeStart !== null) {
      missingRanges.push({ start: rangeStart, end: maxNumber });
    }
    
    return {
      totalCards,
      ownedCount: owned.length,
      missingCount: missing.length,
      wishlistCount: wishlist.length,
      completionPercentage: (owned.length / totalCards) * 100,
      rarityStats,
      missingRanges,
      owned,
      missing,
      wishlist
    };
  }, [cards, ownedCards, wishlistCards]);
  
  // Filter cards based on view mode
  const filteredCards = useMemo(() => {
    let filtered = cards;
    
    switch (viewMode) {
      case 'owned':
        filtered = stats.owned;
        break;
      case 'missing':
        filtered = stats.missing;
        break;
      case 'wishlist':
        filtered = stats.wishlist;
        break;
    }
    
    if (selectedRarity) {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }
    
    return filtered;
  }, [cards, viewMode, selectedRarity, stats]);
  
  // Create circular progress visualization
  const CircularProgress: React.FC<{
    percentage: number;
    size?: number;
    strokeWidth?: number;
  }> = ({ percentage, size = 150, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200/50 dark:text-gray-700/50"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#completion-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="completion-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
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
            Collection Tracker
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your set completion progress
          </p>
        </div>
        
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
          {(['all', 'owned', 'missing', 'wishlist'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-all capitalize",
                viewMode === mode
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Circular Progress */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <CircularProgress percentage={stats.completionPercentage} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-3xl font-bold text-gray-800 dark:text-gray-200"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {stats.completionPercentage.toFixed(1)}%
              </motion.span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{stats.ownedCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Owned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{stats.missingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Missing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.wishlistCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Wishlist</p>
            </div>
          </div>
        </div>
        
        {/* Rarity Breakdown */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Completion by Rarity
          </h4>
          {Array.from(stats.rarityStats.entries()).map(([rarity, data], index) => {
            const percentage = (data.owned / data.total) * 100;
            const isSelected = selectedRarity === rarity;
            
            return (
              <motion.div
                key={rarity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all",
                  "backdrop-blur-md border",
                  isSelected
                    ? "bg-white/80 dark:bg-gray-800/80 border-green-500/50 scale-[1.02]"
                    : "bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-800/70"
                )}
                onClick={() => setSelectedRarity(isSelected ? null : rarity)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rarity}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {data.owned}/{data.total}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
                
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {percentage.toFixed(0)}% complete
                  </span>
                  {data.owned < data.total && (
                    <span className="text-red-500 dark:text-red-400">
                      {data.total - data.owned} missing
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Missing Ranges Alert */}
      {stats.missingRanges.length > 0 && viewMode !== 'owned' && (
        <div className={cn(
          "mb-6 p-4 rounded-xl",
          "bg-gradient-to-r from-amber-50/50 to-orange-50/50",
          "dark:from-amber-900/20 dark:to-orange-900/20",
          "border border-amber-200/50 dark:border-amber-700/50"
        )}>
          <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Missing Card Ranges
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.missingRanges.map((range, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                #{range.start === range.end ? range.start : `${range.start}-${range.end}`}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Card Grid Preview */}
      <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-1">
        {cards.slice(0, 100).map((card, index) => {
          const isOwned = ownedCards.has(card.id);
          const isWishlisted = wishlistCards.has(card.id);
          const shouldShow = 
            viewMode === 'all' ||
            (viewMode === 'owned' && isOwned) ||
            (viewMode === 'missing' && !isOwned) ||
            (viewMode === 'wishlist' && isWishlisted);
          
          if (!shouldShow) return null;
          
          return (
            <motion.div
              key={card.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.002 }}
              className={cn(
                "aspect-square rounded cursor-pointer relative group",
                isOwned
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
                  : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700",
                isWishlisted && "ring-2 ring-purple-500"
              )}
              whileHover={{ scale: 1.5, zIndex: 10 }}
              onClick={() => onToggleOwned?.(card.id)}
              title={`#${card.number} - ${card.name}`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {card.number}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Next Milestone"
            value={`${Math.ceil(stats.completionPercentage / 25) * 25}%`}
            subValue={`${Math.ceil((stats.completionPercentage / 25) * 25 / 100 * stats.totalCards) - stats.ownedCount} cards away`}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Most Complete"
            value={Array.from(stats.rarityStats.entries())
              .sort((a, b) => (b[1].owned / b[1].total) - (a[1].owned / a[1].total))[0]?.[0] || 'N/A'}
            subValue="rarity tier"
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            label="Est. Completion Cost"
            value="$--"
            subValue="for missing cards"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Collection Rank"
            value="#---"
            subValue="global ranking"
            gradient="from-orange-500 to-red-500"
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
  subValue: string;
  gradient: string;
}> = ({ label, value, subValue, gradient }) => (
  <div className="text-center">
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className={cn(
      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
      gradient
    )}>
      {value}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>
  </div>
);

export default SetCompletionTracker;