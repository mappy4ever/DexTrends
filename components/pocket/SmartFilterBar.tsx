/**
 * SmartFilterBar - Search and filter controls for deck builder
 *
 * Features:
 * - Prominent search input with instant results
 * - Type pills with EnergyIcon symbols
 * - Category pills (Pokemon, Trainer, Energy)
 * - Trainer subtype filter (Item, Supporter, Tool)
 * - Sort controls
 * - Active filter chips with clear all
 */

import React, { memo, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { EnergyIcon } from '@/components/ui/EnergyIcon';
import type { CardCategory, TrainerSubtype, CardSortBy, SortOrder, CardFilters, FilterOptions } from '@/hooks/useCardBrowser';

interface SmartFilterBarProps {
  // Current filter state
  filters: CardFilters;
  filterOptions: FilterOptions;

  // Filter actions
  onSearchChange: (search: string) => void;
  onTypeToggle: (type: string) => void;
  onCategoryChange: (category: CardCategory) => void;
  onTrainerSubtypeChange: (subtype: TrainerSubtype) => void;
  onPackToggle: (pack: string) => void;
  onRarityToggle: (rarity: string) => void;
  onClearFilters: () => void;

  // Sort state
  sortBy: CardSortBy;
  sortOrder: SortOrder;
  onSortByChange: (sortBy: CardSortBy) => void;
  onSortOrderToggle: () => void;

  // Computed
  hasActiveFilters: boolean;
  activeFilterCount: number;
  totalResults: number;

  className?: string;
}

// Energy types in display order
const ENERGY_TYPES = [
  'fire', 'water', 'grass', 'electric', 'psychic',
  'fighting', 'dark', 'metal', 'dragon', 'colorless'
];

// Category options
const CATEGORIES: { value: CardCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'trainer', label: 'Trainer' },
  { value: 'energy', label: 'Energy' }
];

// Trainer subtypes
const TRAINER_SUBTYPES: { value: TrainerSubtype; label: string }[] = [
  { value: 'all', label: 'All Trainers' },
  { value: 'item', label: 'Item' },
  { value: 'supporter', label: 'Supporter' },
  { value: 'tool', label: 'Tool' }
];

// Sort options
const SORT_OPTIONS: { value: CardSortBy; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'hp', label: 'HP' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'pack', label: 'Pack' }
];

// Type pill button
const TypePill = memo(function TypePill({
  type,
  isSelected,
  onClick
}: {
  type: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
        'transition-all duration-200 active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
        'min-w-[44px] min-h-[44px] touch-manipulation', // Touch target
        isSelected
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
      )}
      aria-pressed={isSelected}
    >
      <EnergyIcon type={type} size="sm" showBackground={!isSelected} />
      <span className="text-xs font-medium capitalize hidden sm:inline">{type}</span>
    </button>
  );
});

// Active filter chip - With proper touch target
const FilterChip = memo(function FilterChip({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-full',
        'min-h-[36px] touch-manipulation', // Touch target
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        'text-xs font-medium',
        'hover:bg-blue-200 dark:hover:bg-blue-900/50',
        'active:scale-[0.97]',
        'transition-all duration-150'
      )}
    >
      <span>{label}</span>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
});

export const SmartFilterBar = memo(function SmartFilterBar({
  filters,
  filterOptions,
  onSearchChange,
  onTypeToggle,
  onCategoryChange,
  onTrainerSubtypeChange,
  onPackToggle,
  onRarityToggle,
  onClearFilters,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
  hasActiveFilters,
  activeFilterCount,
  totalResults,
  className
}: SmartFilterBarProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search cards..."
          className={cn(
            'w-full pl-10 pr-4 py-3 text-base',
            'bg-white dark:bg-stone-900',
            'border border-stone-300 dark:border-stone-600 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder-stone-400'
          )}
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="w-5 h-5 text-stone-400 hover:text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onCategoryChange(value)}
            className={cn(
              'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap',
              'transition-all duration-200 active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              'min-h-[44px] touch-manipulation', // Touch target
              filters.category === value
                ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Trainer Subtypes (when Trainer category selected) */}
      {filters.category === 'trainer' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {TRAINER_SUBTYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onTrainerSubtypeChange(value)}
              className={cn(
                'px-4 py-2 rounded-full font-medium text-xs whitespace-nowrap',
                'transition-all duration-200 active:scale-[0.97]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                'min-h-[44px] touch-manipulation', // Proper touch target
                filters.trainerSubtype === value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Type Pills (when Pokemon category or All selected) */}
      {(filters.category === 'all' || filters.category === 'pokemon') && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {ENERGY_TYPES.filter(type => filterOptions.types.includes(type)).map(type => (
            <TypePill
              key={type}
              type={type}
              isSelected={filters.types.includes(type)}
              onClick={() => onTypeToggle(type)}
            />
          ))}
        </div>
      )}

      {/* Sort and More Filters Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as CardSortBy)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm',
              'bg-stone-100 dark:bg-stone-800',
              'border border-stone-200 dark:border-stone-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>Sort: {label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={onSortOrderToggle}
            className={cn(
              'p-2 rounded-lg min-w-[44px] min-h-[44px]', // Touch target
              'flex items-center justify-center',
              'bg-stone-100 dark:bg-stone-800',
              'hover:bg-stone-200 dark:hover:bg-stone-700',
              'transition-all duration-150 active:scale-[0.95]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              'touch-manipulation'
            )}
            aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            <svg
              className={cn(
                'w-5 h-5 text-stone-600 dark:text-stone-400',
                'transition-transform duration-200',
                sortOrder === 'desc' && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
        </div>

        {/* More Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium',
            'min-h-[44px] touch-manipulation', // Touch target
            'transition-all duration-150 active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
            showMoreFilters || hasActiveFilters
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showMoreFilters && (
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl space-y-4">
          {/* Pack Filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Pack / Expansion
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.packs.map(pack => (
                <button
                  key={pack}
                  type="button"
                  onClick={() => onPackToggle(pack)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-medium',
                    'min-h-[40px] touch-manipulation', // Touch target
                    'transition-all duration-150 active:scale-[0.97]',
                    filters.packs.includes(pack)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
                  )}
                >
                  {pack}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              Rarity
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.rarities.map(rarity => (
                <button
                  key={rarity}
                  type="button"
                  onClick={() => onRarityToggle(rarity)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-medium',
                    'min-h-[40px] touch-manipulation', // Touch target
                    'transition-all duration-150 active:scale-[0.97]',
                    filters.rarities.includes(rarity)
                      ? 'bg-amber-500 text-white'
                      : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
                  )}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.search && (
            <FilterChip label={`"${filters.search}"`} onRemove={() => onSearchChange('')} />
          )}
          {filters.types.map(type => (
            <FilterChip key={type} label={type} onRemove={() => onTypeToggle(type)} />
          ))}
          {filters.packs.map(pack => (
            <FilterChip key={pack} label={pack} onRemove={() => onPackToggle(pack)} />
          ))}
          {filters.rarities.map(rarity => (
            <FilterChip key={rarity} label={rarity} onRemove={() => onRarityToggle(rarity)} />
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(
              'px-3 py-2 min-h-[36px] rounded-full',
              'text-xs text-red-600 dark:text-red-400 font-medium',
              'hover:bg-red-50 dark:hover:bg-red-900/20',
              'active:scale-[0.97]',
              'transition-all duration-150',
              'touch-manipulation'
            )}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-stone-500 dark:text-stone-400">
        {totalResults} cards found
      </div>
    </div>
  );
});
