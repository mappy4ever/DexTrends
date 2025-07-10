import React, { useState, useEffect, useMemo } from 'react';
import { TypeBadge } from '../TypeBadge';
import Modal from '../modals/Modal';

interface VisualSearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
  cardData?: any[];
  showAdvanced?: boolean;
}

const VisualSearchFilters = ({ 
  onFiltersChange = () => {}, 
  initialFilters = {},
  cardData = [],
  showAdvanced = true 
}: VisualSearchFiltersProps) => {
  const [filters, setFilters] = useState<any>({
    types: [],
    rarities: [],
    sets: [],
    priceRange: { min: '', max: '' },
    hpRange: { min: '', max: '' },
    year: '',
    sortBy: 'name',
    sortOrder: 'asc',
    searchText: '',
    ...initialFilters
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<{
    types: string[];
    rarities: string[];
    sets: string[];
    years: number[];
  }>({
    types: [],
    rarities: [],
    sets: [],
    years: []
  });

  // Pokemon types with their colors
  const pokemonTypes = [
    { name: 'fire', color: 'bg-red-500', textColor: 'text-white', icon: '🔥' },
    { name: 'water', color: 'bg-blue-500', textColor: 'text-white', icon: '💧' },
    { name: 'grass', color: 'bg-green-500', textColor: 'text-white', icon: '🌿' },
    { name: 'electric', color: 'bg-yellow-400', textColor: 'text-black', icon: '⚡' },
    { name: 'psychic', color: 'bg-purple-500', textColor: 'text-white', icon: '🔮' },
    { name: 'ice', color: 'bg-cyan-300', textColor: 'text-black', icon: '❄️' },
    { name: 'dragon', color: 'bg-purple-700', textColor: 'text-white', icon: '🐉' },
    { name: 'dark', color: 'bg-gray-800', textColor: 'text-white', icon: '🌙' },
    { name: 'fairy', color: 'bg-pink-400', textColor: 'text-white', icon: '🧚' },
    { name: 'normal', color: 'bg-gray-400', textColor: 'text-white', icon: '⭐' },
    { name: 'fighting', color: 'bg-red-700', textColor: 'text-white', icon: '👊' },
    { name: 'poison', color: 'bg-purple-600', textColor: 'text-white', icon: '☠️' },
    { name: 'ground', color: 'bg-yellow-600', textColor: 'text-white', icon: '⛰️' },
    { name: 'flying', color: 'bg-indigo-400', textColor: 'text-white', icon: '🦅' },
    { name: 'bug', color: 'bg-green-400', textColor: 'text-white', icon: '🐛' },
    { name: 'rock', color: 'bg-yellow-800', textColor: 'text-white', icon: '🗿' },
    { name: 'ghost', color: 'bg-purple-800', textColor: 'text-white', icon: '👻' },
    { name: 'steel', color: 'bg-gray-500', textColor: 'text-white', icon: '⚙️' },
    { name: 'colorless', color: 'bg-gray-300', textColor: 'text-black', icon: '⚪' }
  ];

  // Rarity options with visual styling
  const rarityOptions = [
    { name: 'Common', short: 'C', color: 'bg-gray-200 border-gray-400 text-gray-700', glow: '' },
    { name: 'Uncommon', short: 'U', color: 'bg-green-200 border-green-500 text-green-900', glow: 'shadow-green-200/50' },
    { name: 'Rare', short: 'R', color: 'bg-yellow-200 border-yellow-500 text-yellow-900', glow: 'shadow-yellow-200/50' },
    { name: 'Rare Holo', short: 'RH', color: 'bg-blue-100 border-blue-400 text-blue-900', glow: 'shadow-blue-200/50' },
    { name: 'Rare Holo GX', short: 'GX', color: 'bg-blue-200 border-blue-700 text-blue-900', glow: 'shadow-blue-300/60' },
    { name: 'Rare Holo EX', short: 'EX', color: 'bg-blue-50 border-blue-400 text-blue-900', glow: 'shadow-blue-200/50' },
    { name: 'Rare Holo V', short: 'V', color: 'bg-red-100 border-red-400 text-red-800', glow: 'shadow-red-200/50' },
    { name: 'Rare Holo VMAX', short: 'VMAX', color: 'bg-red-200 border-red-600 text-red-900', glow: 'shadow-red-300/60' },
    { name: 'Rare Ultra', short: 'UR', color: 'bg-purple-200 border-purple-600 text-purple-900', glow: 'shadow-purple-300/60' },
    { name: 'Rare Secret', short: 'SR', color: 'bg-pink-100 border-pink-400 text-pink-800', glow: 'shadow-pink-200/50' },
    { name: 'Rare Rainbow', short: 'RR', color: 'bg-gradient-to-r from-pink-100 via-yellow-100 to-blue-100 border-gray-300 text-gray-800', glow: 'shadow-rainbow-200/50' }
  ];

  // Extract available options from card data
  useEffect(() => {
    if (cardData.length > 0) {
      const types = new Set<string>();
      const rarities = new Set<string>();
      const sets = new Set<string>();
      const years = new Set<number>();

      cardData.forEach((card: any) => {
        // Types
        if (card.types) {
          card.types.forEach((type: any) => types.add(type.toLowerCase()));
        }
        
        // Rarities
        if (card.rarity) {
          rarities.add(card.rarity);
        }
        
        // Sets
        if (card.set?.name) {
          sets.add(card.set.name);
        }
        
        // Years
        if (card.set?.releaseDate) {
          const year = new Date(card.set.releaseDate).getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        }
      });

      setAvailableOptions({
        types: Array.from(types) as string[],
        rarities: Array.from(rarities) as string[],
        sets: Array.from(sets).sort() as string[],
        years: Array.from(years).sort((a: any, b: any) => b - a) as number[]
      });
    }
  }, [cardData]);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleArrayFilterToggle = (key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item: any) => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = (): any => {
    setFilters({
      types: [],
      rarities: [],
      sets: [],
      priceRange: { min: '', max: '' },
      hpRange: { min: '', max: '' },
      year: '',
      sortBy: 'name',
      sortOrder: 'asc',
      searchText: ''
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.rarities.length > 0) count++;
    if (filters.sets.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.hpRange.min || filters.hpRange.max) count++;
    if (filters.year) count++;
    if (filters.searchText) count++;
    return count;
  }, [filters]);

  return (
    <div className="visual-search-filters bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Search Filters</h3>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                {activeFilterCount} active
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Cards
          </label>
          <input
            type="text"
            value={filters.searchText}
            onChange={(e: any) => handleFilterChange('searchText', e.target.value)}
            placeholder="Enter card name, set, or keyword..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Type Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Types ({filters.types.length} selected)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {pokemonTypes
              .filter((type: any) => availableOptions.types.includes(type.name))
              .map((type: any) => (
                <button
                  key={type.name}
                  onClick={() => handleArrayFilterToggle('types', type.name)}
                  className={`
                    flex items-center justify-center p-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium
                    ${filters.types.includes(type.name)
                      ? `${type.color} ${type.textColor} border-gray-800 shadow-lg scale-105`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }
                  `}
                  title={`Filter by ${type.name} type`}
                >
                  <span className="mr-1">{type.icon}</span>
                  <span className="capitalize">{type.name}</span>
                </button>
              ))
            }
          </div>
        </div>

        {/* Rarity Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Rarities ({filters.rarities.length} selected)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {rarityOptions
              .filter((rarity: any) => availableOptions.rarities.includes(rarity.name))
              .map((rarity: any) => (
                <button
                  key={rarity.name}
                  onClick={() => handleArrayFilterToggle('rarities', rarity.name)}
                  className={`
                    flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 text-sm font-bold
                    ${filters.rarities.includes(rarity.name)
                      ? `${rarity.color} border-gray-800 shadow-lg scale-105 ${rarity.glow}`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }
                  `}
                  title={`Filter by ${rarity.name} rarity`}
                >
                  <span className="text-lg font-bold">{rarity.short}</span>
                  <span className="text-xs mt-1 text-center leading-tight">{rarity.name}</span>
                </button>
              ))
            }
          </div>
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range ($)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e: any) => handleFilterChange('priceRange', { ...filters.priceRange, min: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e: any) => handleFilterChange('priceRange', { ...filters.priceRange, max: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* HP Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HP Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.hpRange.min}
                onChange={(e: any) => handleFilterChange('hpRange', { ...filters.hpRange, min: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.hpRange.max}
                onChange={(e: any) => handleFilterChange('hpRange', { ...filters.hpRange, max: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Release Year
            </label>
            <select
              value={filters.year}
              onChange={(e: any) => handleFilterChange('year', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Years</option>
              {availableOptions.years.map((year: any) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <div className="flex space-x-1">
              <select
                value={filters.sortBy}
                onChange={(e: any) => handleFilterChange('sortBy', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rarity">Rarity</option>
                <option value="releaseDate">Release Date</option>
                <option value="hp">HP</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-r hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                title={`Sort ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Button */}
        {showAdvanced && (
          <div className="text-center">
            <button
              onClick={() => setIsAdvancedOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Advanced Filters & Sets
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <Modal isOpen={isAdvancedOpen} onClose={() => setIsAdvancedOpen(false)} title="Advanced Filters">
        <div className="space-y-6">
          {/* Set Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sets ({filters.sets.length} selected)
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
              {availableOptions.sets.map((set: any) => (
                <label
                  key={set}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.sets.includes(set)}
                    onChange={() => handleArrayFilterToggle('sets', set)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">{set}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAdvancedOpen(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisualSearchFilters;