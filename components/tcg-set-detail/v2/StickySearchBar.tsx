import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { RarityIcon } from '@/components/ui/RarityIcon';

interface StickySearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;

  // Filter props
  rarities: string[];
  selectedRarity: string;
  onRarityChange: (rarity: string) => void;

  supertypes: string[];
  selectedSupertype: string;
  onSupertypeChange: (type: string) => void;

  // Sort props
  sortBy: string;
  onSortChange: (sort: string) => void;

  // Results
  totalCards: number;
  filteredCount: number;
}

const SORT_OPTIONS = [
  { value: 'number', label: 'Card #' },
  { value: 'name', label: 'Name' },
  { value: 'price-desc', label: 'Price: High' },
  { value: 'price-asc', label: 'Price: Low' },
  { value: 'rarity', label: 'Rarity' },
];

/**
 * StickySearchBar - Full-featured sticky search and filter bar
 * Sticks below navbar on scroll, mobile-optimized
 */
export const StickySearchBar: React.FC<StickySearchBarProps> = ({
  searchQuery,
  onSearchChange,
  rarities,
  selectedRarity,
  onRarityChange,
  supertypes,
  selectedSupertype,
  onSupertypeChange,
  sortBy,
  onSortChange,
  totalCards,
  filteredCount
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedRarity !== '' || selectedSupertype !== '' || searchQuery !== '';
  const isFiltered = filteredCount !== totalCards;

  const clearAllFilters = () => {
    onSearchChange('');
    onRarityChange('');
    onSupertypeChange('');
  };

  return (
    <div className={cn(
      'sticky top-[48px] md:top-[64px] z-30',
      'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md',
      'border-b border-stone-200/80 dark:border-stone-700/50'
    )}>
      <div className="px-4 sm:px-6 py-3">
        {/* Search row */}
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                'w-full h-10 pl-9 pr-9',
                'bg-stone-100 dark:bg-stone-800',
                'border-0 rounded-lg',
                'text-sm text-stone-900 dark:text-white',
                'placeholder:text-stone-400 dark:placeholder:text-stone-500',
                'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                'transition-shadow'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center justify-center',
              'w-10 h-10 rounded-lg',
              'transition-all touch-manipulation',
              showFilters || hasActiveFilters
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={cn(
              'h-10 pl-3 pr-8',
              'bg-stone-100 dark:bg-stone-800',
              'border-0 rounded-lg',
              'text-sm text-stone-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
              'appearance-none cursor-pointer',
              'hidden sm:block'
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-700/50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Mobile sort */}
            <div className="sm:hidden">
              <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">
                Sort By
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
                      'transition-all touch-manipulation',
                      sortBy === option.value
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity filters */}
            {rarities.length > 0 && (
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">
                  Rarity
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  <button
                    onClick={() => onRarityChange('')}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
                      'transition-all touch-manipulation',
                      selectedRarity === ''
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    )}
                  >
                    All
                  </button>
                  {rarities.map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => onRarityChange(selectedRarity === rarity ? '' : rarity)}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium',
                        'transition-all touch-manipulation',
                        selectedRarity === rarity
                          ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      )}
                    >
                      <RarityIcon rarity={rarity} size="xs" showLabel={false} />
                      <span className="max-w-[80px] truncate">{rarity}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type filters */}
            {supertypes.length > 0 && (
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1.5">
                  Type
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  <button
                    onClick={() => onSupertypeChange('')}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
                      'transition-all touch-manipulation',
                      selectedSupertype === ''
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    )}
                  >
                    All
                  </button>
                  {supertypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => onSupertypeChange(selectedSupertype === type ? '' : type)}
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium',
                        'transition-all touch-manipulation',
                        selectedSupertype === type
                          ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {isFiltered && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Showing {filteredCount} of {totalCards} cards
          </p>
        )}
      </div>
    </div>
  );
};

export default StickySearchBar;
