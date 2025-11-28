import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { CleanRarityFilterBar } from './CleanRaritySymbol';

interface ProfessionalFilterSectionProps {
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

export const ProfessionalFilterSection: React.FC<ProfessionalFilterSectionProps> = ({
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
  const [expandedSection, setExpandedSection] = useState<'rarity' | 'type' | 'search' | null>('rarity');

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedRarity || selectedSupertype || selectedSubtype;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
              Filters
            </h2>
            <div className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {filteredCards} / {totalCards}
              </span>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onSearchChange('');
                onRarityChange('');
                onSupertypeChange('');
                onSubtypeChange('');
              }}
              className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-stone-200 dark:divide-stone-700">
        {/* Search Section */}
        <FilterSection
          title="Search"
          isExpanded={expandedSection === 'search'}
          onToggle={() => setExpandedSection(expandedSection === 'search' ? null : 'search')}
          badge={searchQuery ? '1' : undefined}
        >
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, ability, or attack..."
                className={cn(
                  'w-full pl-10 pr-10 py-2.5 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800',
                  'border border-stone-200 dark:border-stone-700',
                  'text-sm text-stone-900 dark:text-white',
                  'placeholder-stone-500 dark:placeholder-stone-400',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                >
                  <svg className="w-3 h-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </FilterSection>

        {/* Rarity Section */}
        <FilterSection
          title="Rarity"
          isExpanded={expandedSection === 'rarity'}
          onToggle={() => setExpandedSection(expandedSection === 'rarity' ? null : 'rarity')}
          badge={selectedRarity ? '1' : undefined}
        >
          <div className="p-4">
            <CleanRarityFilterBar
              selectedRarity={selectedRarity}
              onRaritySelect={(rarity) => onRarityChange(rarity || '')}
              availableRarities={availableRarities}
            />
          </div>
        </FilterSection>

        {/* Type Section */}
        <FilterSection
          title="Card Type"
          isExpanded={expandedSection === 'type'}
          onToggle={() => setExpandedSection(expandedSection === 'type' ? null : 'type')}
          badge={selectedSupertype || selectedSubtype ? '1' : undefined}
        >
          <div className="p-4 space-y-4">
            {/* Supertype */}
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">
                Primary Type
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
            
            {/* Subtype */}
            {availableSubtypes.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">
                  Subtype
                </label>
                <select
                  value={selectedSubtype}
                  onChange={(e) => onSubtypeChange(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg',
                    'bg-stone-50 dark:bg-stone-800',
                    'border border-stone-200 dark:border-stone-700',
                    'text-sm text-stone-900 dark:text-white',
                    'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent'
                  )}
                >
                  <option value="">All Subtypes</option>
                  {availableSubtypes.map(subtype => (
                    <option key={subtype} value={subtype}>{subtype}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </FilterSection>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Active:</span>
            
            {searchQuery && (
              <FilterChip
                label={`Search: ${searchQuery}`}
                onRemove={() => onSearchChange('')}
              />
            )}
            
            {selectedRarity && (
              <FilterChip
                label={selectedRarity}
                onRemove={() => onRarityChange('')}
                color="amber"
              />
            )}
            
            {selectedSupertype && (
              <FilterChip
                label={selectedSupertype}
                onRemove={() => onSupertypeChange('')}
                color="amber"
              />
            )}
            
            {selectedSubtype && (
              <FilterChip
                label={selectedSubtype}
                onRemove={() => onSubtypeChange('')}
                color="green"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const FilterSection: React.FC<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, isExpanded, onToggle, badge, children }) => (
  <div>
    <button
      onClick={onToggle}
      className={cn(
        'w-full px-6 py-3 flex items-center justify-between',
        'hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {title}
        </span>
        {badge && (
          <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-medium text-amber-700 dark:text-amber-300">
            {badge}
          </span>
        )}
      </div>
      <svg
        className={cn(
          'w-4 h-4 text-stone-400 transition-transform duration-200',
          isExpanded && 'rotate-180'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {isExpanded && (
      <div className="border-t border-stone-100 dark:border-stone-800">
        {children}
      </div>
    )}
  </div>
);

const TypeButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
      active
        ? 'bg-amber-600 text-white'
        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
    )}
  >
    {label}
  </button>
);

const FilterChip: React.FC<{
  label: string;
  onRemove: () => void;
  color?: 'stone' | 'amber' | 'amber' | 'green';
}> = ({ label, onRemove, color = 'stone' }) => {
  const colorClasses = {
    stone: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
      colorClasses[color]
    )}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 hover:opacity-70 transition-opacity"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default ProfessionalFilterSection;