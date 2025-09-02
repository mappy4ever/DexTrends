import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { useWindowVirtualScroll } from '@/hooks/useVirtualScroll';
import hapticFeedback from '@/utils/hapticFeedback';
import logger from '@/utils/logger';
import Image from 'next/image';
import { PokemonLearnsetRecord } from '@/utils/supabase';

interface Move {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  effect: string;
  short_effect: string;
  generation: number;
}

interface MobileMovesPageProps {
  moves: Move[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  expandedMoveId: number | null;
  onToggleExpand: (moveId: number, moveName: string) => void;
  moveLearners: Record<number, PokemonLearnsetRecord[]>;
  learnersLoading: Record<number, boolean>;
  getCategoryIcon: (category: string) => React.ReactNode;
  types: string[];
  visibleCount: number;
  totalCount: number;
  onLoadMore: () => void;
}

// Move card component
const MoveCard: React.FC<{
  move: Move;
  isExpanded: boolean;
  onToggle: () => void;
  learners?: PokemonLearnsetRecord[];
  isLoadingLearners?: boolean;
}> = ({ move, isExpanded, onToggle, learners, isLoadingLearners }) => {
  const categoryColors = {
    physical: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    special: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    status: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Image src="/images/move-categories/physical.png" alt="Physical" width={20} height={20} />;
      case 'special':
        return <Image src="/images/move-categories/special.png" alt="Special" width={20} height={20} />;
      case 'status':
        return <Image src="/images/move-categories/status.png" alt="Status" width={20} height={20} />;
      default:
        return null;
    }
  };
  
  const getPowerColor = (power: number | null) => {
    if (power === null) return 'text-gray-500';
    if (power >= 100) return 'text-red-600 dark:text-red-400 font-bold';
    if (power >= 80) return 'text-orange-600 dark:text-orange-400 font-semibold';
    if (power >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return 'text-gray-500';
    if (accuracy === 100) return 'text-green-600 dark:text-green-400 font-bold';
    if (accuracy >= 90) return 'text-blue-600 dark:text-blue-400';
    if (accuracy >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };
  
  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border-2 p-3 transition-all",
        categoryColors[move.category as keyof typeof categoryColors] || categoryColors.status,
        isExpanded && "shadow-lg"
      )}
      onClick={() => {
        onToggle();
        hapticFeedback.selection();
      }}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm capitalize">
            {move.name.replace(/-/g, ' ')}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <TypeBadge type={move.type} size="xs" />
            <div className="flex items-center gap-1">
              {getCategoryIcon(move.category)}
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {move.category}
              </span>
            </div>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-2"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Power</p>
          <p className={getPowerColor(move.power)}>
            {move.power || '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Acc</p>
          <p className={getAccuracyColor(move.accuracy)}>
            {move.accuracy ? `${move.accuracy}%` : '-'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">PP</p>
          <p className="font-medium">{move.pp}</p>
        </div>
      </div>
      
      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {move.short_effect}
              </p>
              
              {move.effect_chance && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Effect Chance: {move.effect_chance}%
                </p>
              )}
              
              {move.priority !== 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Priority: {move.priority > 0 ? '+' : ''}{move.priority}
                </p>
              )}
              
              {/* Pokemon that can learn this move */}
              {isLoadingLearners && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading learners...</p>
                </div>
              )}
              
              {learners && learners.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Can be learned by:</p>
                  <div className="flex flex-wrap gap-1">
                    {learners.slice(0, 5).map(learner => (
                      <span 
                        key={learner.pokemon_id}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs capitalize"
                      >
                        {(learner as any).pokemon_name || learner.pokemon_id}
                      </span>
                    ))}
                    {learners.length > 5 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        +{learners.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MobileMovesPage: React.FC<MobileMovesPageProps> = ({
  moves,
  loading,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  expandedMoveId,
  onToggleExpand,
  moveLearners,
  learnersLoading,
  getCategoryIcon,
  types,
  visibleCount,
  totalCount,
  onLoadMore
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Virtual scrolling setup
  const { visibleItems, totalHeight } = useWindowVirtualScroll(
    moves,
    120, // Estimated card height
    5 // overscan
  );
  
  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);
  
  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'power', label: 'Power' },
    { value: 'accuracy', label: 'Accuracy' },
    { value: 'type', label: 'Type' },
    { value: 'pp', label: 'PP' }
  ];
  
  // Category filters
  const categories = ['all', 'physical', 'special', 'status'];
  
  return (
    <div className="mobile-moves-page pb-20">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {/* Type filter pills */}
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => {
                onTypeChange(type);
                hapticFeedback.selection();
              }}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                selectedType === type
                  ? type === 'all'
                    ? "bg-gray-600 text-white"
                    : `bg-${type}-500 text-white`
                  : "bg-gray-100 dark:bg-gray-800"
              )}
              style={
                selectedType === type && type !== 'all'
                  ? { backgroundColor: `var(--color-${type})` }
                  : {}
              }
            >
              {type}
            </button>
          ))}
        </div>
        
        {/* Category and sort controls */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                onCategoryChange(e.target.value);
                hapticFeedback.selection();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-gray-100 dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Sort dropdown */}
            <select
              value={sortOption}
              onChange={(e) => {
                onSortChange(e.target.value);
                hapticFeedback.selection();
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-gray-100 dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500"
              )}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              "p-2 rounded-lg",
              showSearch
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
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
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search moves..."
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
        
        {/* Results count */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-400">
          Showing {visibleCount} of {totalCount} moves
        </div>
      </div>
      
      {/* Moves List with Virtual Scrolling */}
      <div 
        ref={scrollContainerRef}
        className="px-4 py-4"
        style={{ minHeight: totalHeight }}
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <div className="space-y-3">
            {visibleItems.map(({ item: move, index, offsetTop }) => (
              <div key={move.id} style={{ position: 'absolute', top: offsetTop, width: '100%' }}>
                <MoveCard
                  move={move}
                  isExpanded={expandedMoveId === move.id}
                  onToggle={() => onToggleExpand(move.id, move.name)}
                  learners={moveLearners[move.id]}
                  isLoadingLearners={learnersLoading[move.id]}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              No moves found matching your filters
            </p>
            <button
              onClick={() => {
                onTypeChange('all');
                onCategoryChange('all');
                onSearchChange('');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Load More Button */}
        {visibleCount < totalCount && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                onLoadMore();
                hapticFeedback.light();
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              Load More ({totalCount - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMovesPage;