import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { RarityIcon, RarityFilterBar } from './RarityIcon';
import { GlassContainer } from './design-system/GlassContainer';

interface FilterTabsProps {
  // Rarity filter
  selectedRarity: string;
  onRarityChange: (rarity: string) => void;
  availableRarities: string[];
  
  // Type filters
  selectedSupertype: string;
  onSupertypeChange: (type: string) => void;
  availableSupertypes: string[];
  
  selectedSubtype: string;
  onSubtypeChange: (type: string) => void;
  availableSubtypes: string[];
  
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  
  // Card count
  totalCards: number;
  filteredCards: number;
}

export const EnhancedFilterTabs: React.FC<FilterTabsProps> = ({
  selectedRarity,
  onRarityChange,
  availableRarities,
  selectedSupertype,
  onSupertypeChange,
  availableSupertypes,
  selectedSubtype,
  onSubtypeChange,
  availableSubtypes,
  searchQuery,
  onSearchChange,
  totalCards,
  filteredCards
}) => {
  const [activeTab, setActiveTab] = useState<'rarity' | 'type' | 'search'>('rarity');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <GlassContainer
      variant="default"
      blur="lg"
      rounded="2xl"
      padding="none"
      className="sticky top-20 z-30"
    >
      <div className="p-4">
        {/* Header with Results Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              Filters
            </h3>
            <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {filteredCards} / {totalCards} cards
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'p-1.5 rounded-full',
              'backdrop-blur-md bg-white/50 dark:bg-stone-700/50',
              'hover:bg-white/70 transition-all duration-200'
            )}
          >
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <TabButton
            active={activeTab === 'rarity'}
            onClick={() => setActiveTab('rarity')}
            icon="✨"
            label="Rarity"
            badge={selectedRarity ? '1' : undefined}
          />
          <TabButton
            active={activeTab === 'type'}
            onClick={() => setActiveTab('type')}
            icon="🎭"
            label="Type"
            badge={selectedSupertype || selectedSubtype ? '1' : undefined}
          />
          <TabButton
            active={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
            icon="🔍"
            label="Search"
            badge={searchQuery ? '1' : undefined}
          />
        </div>

        {/* Tab Content */}
        <div className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-96' : 'max-h-0'
        )}>
          {/* Rarity Tab */}
          {activeTab === 'rarity' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {/* All Cards Button */}
                <button
                  onClick={() => onRarityChange('')}
                  className={cn(
                    'col-span-2 px-3 py-2 rounded-xl text-xs font-medium',
                    'backdrop-blur-md transition-all duration-200',
                    'flex items-center justify-center gap-1',
                    !selectedRarity
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                      : 'bg-white/50 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-white/70'
                  )}
                >
                  <span>All</span>
                </button>
                
                {/* Rarity Icons Grid */}
                {availableRarities.map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => onRarityChange(rarity)}
                    className={cn(
                      'relative group p-2 rounded-xl',
                      'backdrop-blur-md transition-all duration-200',
                      selectedRarity === rarity
                        ? 'bg-white/70 dark:bg-stone-700/70 shadow-md scale-110'
                        : 'bg-white/30 dark:bg-stone-800/30 hover:bg-white/50'
                    )}
                  >
                    <RarityIcon
                      rarity={rarity}
                      size="sm"
                      showLabel={false}
                    />
                    {/* Tooltip */}
                    <div className={cn(
                      'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                      'px-2 py-1 rounded-lg',
                      'bg-stone-900 text-white text-xs whitespace-nowrap',
                      'opacity-0 group-hover:opacity-100 pointer-events-none',
                      'transition-opacity duration-200 z-50'
                    )}>
                      {rarity}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Selected Rarity Info */}
              {selectedRarity && (
                <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-100/50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/20">
                  <div className="flex items-center gap-2">
                    <RarityIcon rarity={selectedRarity} size="md" />
                    <div>
                      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                        {selectedRarity}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Showing only {selectedRarity} cards
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type Tab */}
          {activeTab === 'type' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Supertype Filter */}
              <div>
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                  Card Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <TypeButton
                    label="All"
                    active={!selectedSupertype}
                    onClick={() => onSupertypeChange('')}
                  />
                  {availableSupertypes.map((type) => (
                    <TypeButton
                      key={type}
                      label={type}
                      active={selectedSupertype === type}
                      onClick={() => onSupertypeChange(type)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Subtype Filter */}
              {availableSubtypes.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 mb-2 block">
                    Subtype
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    <TypeButton
                      label="All"
                      active={!selectedSubtype}
                      onClick={() => onSubtypeChange('')}
                      size="sm"
                    />
                    {availableSubtypes.map((type) => (
                      <TypeButton
                        key={type}
                        label={type}
                        active={selectedSubtype === type}
                        onClick={() => onSubtypeChange(type)}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search cards by name, text, or ability..."
                  className={cn(
                    'w-full px-4 py-3 pl-10 rounded-xl',
                    'backdrop-blur-md bg-white/50 dark:bg-stone-800/50',
                    'border border-white/50 dark:border-stone-700/50',
                    'text-sm text-stone-700 dark:text-stone-300',
                    'placeholder-stone-500 dark:placeholder-stone-400',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                    'transition-all duration-200'
                  )}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {searchQuery && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Searching for "{searchQuery}"...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Always Visible */}
        <div className="mt-4 pt-4 border-t border-stone-200/50 dark:border-stone-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onRarityChange('');
                onSupertypeChange('');
                onSubtypeChange('');
                onSearchChange('');
              }}
              className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              Clear all filters
            </button>
            
            <div className="flex gap-2">
              {selectedRarity && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <RarityIcon rarity={selectedRarity} size="xs" />
                  <button
                    onClick={() => onRarityChange('')}
                    className="ml-1 text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  >
                    ×
                  </button>
                </div>
              )}
              {selectedSupertype && (
                <div className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-xs">
                  <span className="text-amber-700 dark:text-amber-300">{selectedSupertype}</span>
                  <button
                    onClick={() => onSupertypeChange('')}
                    className="ml-1 text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

// Helper Components
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-1 px-3 py-2 rounded-xl text-xs font-medium',
      'backdrop-blur-md transition-all duration-200',
      'flex items-center justify-center gap-1',
      active
        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
        : 'bg-white/50 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-white/70'
    )}
  >
    <span>{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
        {badge}
      </span>
    )}
  </button>
);

const TypeButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}> = ({ label, active, onClick, size = 'md' }) => (
  <button
    onClick={onClick}
    className={cn(
      'rounded-lg font-medium',
      'backdrop-blur-md transition-all duration-200',
      size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs',
      active
        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
        : 'bg-white/50 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 hover:bg-white/70'
    )}
  >
    {label}
  </button>
);

export default EnhancedFilterTabs;