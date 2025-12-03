import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { RarityIcon } from '../ui/RarityIcon';

interface SetFilterBarProps {
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;

  // Filters
  rarities: string[];
  selectedRarity: string;
  onRarityChange: (rarity: string) => void;

  supertypes: string[];
  selectedSupertype: string;
  onSupertypeChange: (type: string) => void;

  // Results count
  totalCards: number;
  filteredCount: number;
}

/**
 * SetFilterBar - Clean, mobile-friendly filter and search bar
 * Features:
 * - Prominent search bar
 * - Collapsible filters on mobile
 * - Horizontal scroll for filter pills
 */
export const SetFilterBar: React.FC<SetFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  rarities,
  selectedRarity,
  onRarityChange,
  supertypes,
  selectedSupertype,
  onSupertypeChange,
  totalCards,
  filteredCount
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedRarity !== '' || selectedSupertype !== '';
  const isFiltered = filteredCount !== totalCards;

  return (
    <div className="space-y-4">
      {/* Search and filter toggle row */}
      <div className="flex items-center gap-3">
        {/* Search bar - takes most space */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <svg
              className="w-5 h-5 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-3',
              'bg-white dark:bg-stone-800',
              'border border-stone-200 dark:border-stone-700',
              'rounded-xl',
              'text-stone-900 dark:text-white',
              'placeholder:text-stone-400 dark:placeholder:text-stone-500',
              'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
              'transition-colors text-base'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className={cn(
                'absolute inset-y-0 right-0 flex items-center',
                'pr-3 pl-2',
                'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300',
                'touch-manipulation'
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          aria-expanded={showFilters}
          className={cn(
            'flex items-center justify-center gap-2',
            'px-4 py-3 min-w-[48px] min-h-[48px]',
            'bg-white dark:bg-stone-800',
            'border rounded-xl',
            'transition-all touch-manipulation',
            'active:scale-[0.98]',
            hasActiveFilters
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300',
            'hover:border-stone-300 dark:hover:border-stone-600',
            'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Collapsible filter section */}
      {showFilters && (
        <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 space-y-4 border border-stone-200/50 dark:border-stone-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Rarity filters */}
          {rarities.length > 0 && (
            <fieldset>
              <legend className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                Rarity
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onRarityChange('')}
                  aria-pressed={selectedRarity === ''}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    'min-h-[40px] touch-manipulation',
                    'transition-all active:scale-[0.97]',
                    selectedRarity === ''
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                  )}
                >
                  All
                </button>
                {rarities.map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => onRarityChange(selectedRarity === rarity ? '' : rarity)}
                    aria-pressed={selectedRarity === rarity}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium',
                      'min-h-[40px] touch-manipulation',
                      'transition-all active:scale-[0.97]',
                      selectedRarity === rarity
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                    )}
                  >
                    <RarityIcon rarity={rarity} size="xs" showLabel={false} />
                    <span className="truncate max-w-[100px]">{rarity}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Type filters */}
          {supertypes.length > 0 && (
            <fieldset>
              <legend className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-2">
                Card Type
              </legend>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onSupertypeChange('')}
                  aria-pressed={selectedSupertype === ''}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    'min-h-[40px] touch-manipulation',
                    'transition-all active:scale-[0.97]',
                    selectedSupertype === ''
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                  )}
                >
                  All
                </button>
                {supertypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => onSupertypeChange(selectedSupertype === type ? '' : type)}
                    aria-pressed={selectedSupertype === type}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium',
                      'min-h-[40px] touch-manipulation',
                      'transition-all active:scale-[0.97]',
                      selectedSupertype === type
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-stone-200 dark:border-stone-700">
              <button
                onClick={() => {
                  onRarityChange('');
                  onSupertypeChange('');
                }}
                className={cn(
                  'text-sm text-amber-600 dark:text-amber-400 font-medium',
                  'hover:underline touch-manipulation',
                  'py-1 min-h-[36px]'
                )}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {isFiltered && (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Showing <span className="font-medium text-stone-700 dark:text-stone-300">{filteredCount}</span> of {totalCards} cards
        </p>
      )}
    </div>
  );
};

export default SetFilterBar;
