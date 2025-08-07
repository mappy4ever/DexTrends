import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import EnhancedSearchBox from './forms/EnhancedSearchBox';
import logger from '@/utils/logger';

// Types and Interfaces
interface SearchFilters {
  type: string;
  rarity: string;
  set: string;
  priceRange: [number, number];
  artist: string;
  releaseYear: string;
  hp: { min: string; max: string };
  retreatCost: string;
  weakness: string;
  resistance: string;
  attackCost: string;
  cardType: 'all' | 'tcg' | 'pocket';
}

interface SearchHistoryItem {
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: string;
}

interface SearchResult {
  id: string;
  name: string;
  types?: Array<{ type: { name: string } } | string>;
  set?: {
    id: string;
    name: string;
    releaseDate: string;
  };
  rarity?: string;
  artist?: string;
  hp?: string;
  retreatCost?: string[];
  weaknesses?: Array<{ type: string; value: string }>;
  resistances?: Array<{ type: string; value: string }>;
  attacks?: Array<{
    cost?: string[];
    name: string;
    damage?: string;
  }>;
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      normal?: { market?: number };
    };
  };
  images?: { small: string; large: string };
  cardType?: 'tcg' | 'pocket';
  cost?: number;
  pack?: string;
}

interface SearchParams {
  q: string;
  type: string;
  rarity: string;
  set: string;
  priceRange: [number, number];
  artist: string;
  releaseYear: string;
  hp: { min: string; max: string };
  retreatCost: string;
  weakness: string;
  resistance: string;
  attackCost: string;
  cardType: 'all' | 'tcg' | 'pocket';
  sortBy: string;
  sortOrder: string;
}

interface AdvancedSearchSystemProps {
  onResults: (results: SearchResult[]) => void;
  onLoading: (loading: boolean) => void;
  className?: string;
}

const AdvancedSearchSystem: React.FC<AdvancedSearchSystemProps> = ({ 
  onResults, 
  onLoading, 
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: '',
    rarity: '',
    set: '',
    priceRange: [0, 1000],
    artist: '',
    releaseYear: '',
    hp: { min: '', max: '' },
    retreatCost: '',
    weakness: '',
    resistance: '',
    attackCost: '',
    cardType: 'all'
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const debouncedFilters = useDebounce(filters, 500);

  // Load search history on mount
  useEffect(() => {
    const saved = localStorage.getItem('advanced-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        logger.error('Failed to load search history:', { error: e });
      }
    }
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (debouncedQuery.trim() || hasActiveFilters(debouncedFilters)) {
      performSearch(debouncedQuery, debouncedFilters);
    } else {
      onResults([]);
    }
  }, [debouncedQuery, debouncedFilters, sortBy, sortOrder]);

  const hasActiveFilters = (filterObj: SearchFilters): boolean => {
    return Object.entries(filterObj).some(([key, value]) => {
      if (key === 'priceRange') return value[0] > 0 || value[1] < 1000;
      if (key === 'hp') return value.min !== '' || value.max !== '';
      if (key === 'cardType') return value !== 'all';
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const performSearch = useCallback(async (query: string, currentFilters: SearchFilters) => {
    onLoading(true);
    
    try {
      // Build search parameters
      const searchParams: SearchParams = {
        q: query,
        ...currentFilters,
        sortBy,
        sortOrder
      };

      // Mock search - replace with actual API calls
      const results = await mockAdvancedSearch(searchParams);
      
      // Apply client-side filtering and sorting
      const filteredResults = applyClientSideFiltering(results, currentFilters);
      const sortedResults = applySorting(filteredResults, sortBy, sortOrder);
      
      onResults(sortedResults);
      
      // Save to search history if there's a query
      if (query.trim()) {
        saveToHistory(query, currentFilters, sortedResults.length);
      }
      
    } catch (error) {
      logger.error('Search failed:', { error });
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [sortBy, sortOrder, onResults, onLoading]);

  const mockAdvancedSearch = async (params: SearchParams): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock card database with enhanced properties
    const mockCards: SearchResult[] = [
      {
        id: 'base1-4',
        name: 'Charizard',
        types: [{ type: { name: 'fire' } }],
        set: { id: 'base1', name: 'Base Set', releaseDate: '1999-01-09' },
        rarity: 'Rare Holo',
        artist: 'Mitsuhiro Arita',
        hp: '120',
        retreatCost: ['colorless', 'colorless', 'colorless'],
        weaknesses: [{ type: 'water', value: '×2' }],
        resistances: [{ type: 'fighting', value: '-30' }],
        attacks: [
          { cost: ['fire', 'fire', 'fire', 'fire'], name: 'Fire Spin', damage: '100' }
        ],
        tcgplayer: { prices: { holofoil: { market: 350.00 } } },
        images: { small: '/back-card.png', large: '/back-card.png' },
        cardType: 'tcg'
      },
      {
        id: 'base1-2',
        name: 'Blastoise',
        types: [{ type: { name: 'water' } }],
        set: { id: 'base1', name: 'Base Set', releaseDate: '1999-01-09' },
        rarity: 'Rare Holo',
        artist: 'Ken Sugimori',
        hp: '100',
        retreatCost: ['colorless', 'colorless'],
        weaknesses: [{ type: 'grass', value: '×2' }],
        attacks: [
          { cost: ['water', 'water', 'water'], name: 'Hydro Pump', damage: '40+' }
        ],
        tcgplayer: { prices: { holofoil: { market: 280.00 } } },
        images: { small: '/back-card.png', large: '/back-card.png' },
        cardType: 'tcg'
      },
      {
        id: 'pocket-001',
        name: 'Pocket Pikachu',
        types: ['electric'],
        rarity: 'Common',
        hp: '60',
        cost: 1,
        pack: 'Genetic Apex',
        images: { small: '/back-card.png', large: '/back-card.png' },
        cardType: 'pocket'
      }
      // Add more mock cards as needed
    ];

    // Filter based on search parameters
    let results = mockCards;

    // Text search
    if (params.q) {
      const queryLower = params.q.toLowerCase();
      results = results.filter(card => 
        card.name.toLowerCase().includes(queryLower) ||
        card.artist?.toLowerCase().includes(queryLower) ||
        card.set?.name.toLowerCase().includes(queryLower) ||
        card.types?.some(type => 
          (typeof type === 'string' ? type : type.type.name).toLowerCase().includes(queryLower)
        )
      );
    }

    return results;
  };

  const applyClientSideFiltering = (cards: SearchResult[], currentFilters: SearchFilters): SearchResult[] => {
    return cards.filter(card => {
      // Card type filter
      if (currentFilters.cardType !== 'all') {
        if (card.cardType !== currentFilters.cardType) return false;
      }

      // Type filter
      if (currentFilters.type) {
        const hasType = card.types?.some(type => 
          (typeof type === 'string' ? type : type.type.name) === currentFilters.type
        );
        if (!hasType) return false;
      }

      // Rarity filter
      if (currentFilters.rarity && card.rarity !== currentFilters.rarity) {
        return false;
      }

      // Set filter
      if (currentFilters.set && card.set?.id !== currentFilters.set) {
        return false;
      }

      // Price range filter
      if (card.cardType === 'tcg') {
        const price = card.tcgplayer?.prices?.holofoil?.market || 
                     card.tcgplayer?.prices?.normal?.market;
        if (price) {
          const [minPrice, maxPrice] = currentFilters.priceRange;
          if (price < minPrice || price > maxPrice) return false;
        }
      }

      // Artist filter
      if (currentFilters.artist && card.artist !== currentFilters.artist) {
        return false;
      }

      // Release year filter
      if (currentFilters.releaseYear && card.set?.releaseDate) {
        const cardYear = new Date(card.set.releaseDate).getFullYear();
        if (cardYear.toString() !== currentFilters.releaseYear) return false;
      }

      // HP filter
      if (currentFilters.hp.min || currentFilters.hp.max) {
        const cardHp = parseInt(card.hp || '0') || 0;
        if (currentFilters.hp.min && cardHp < parseInt(currentFilters.hp.min)) return false;
        if (currentFilters.hp.max && cardHp > parseInt(currentFilters.hp.max)) return false;
      }

      // Retreat cost filter
      if (currentFilters.retreatCost) {
        const retreatCost = card.retreatCost?.length || 0;
        if (retreatCost.toString() !== currentFilters.retreatCost) return false;
      }

      // Weakness filter
      if (currentFilters.weakness) {
        const hasWeakness = card.weaknesses?.some(w => w.type === currentFilters.weakness);
        if (!hasWeakness) return false;
      }

      // Resistance filter
      if (currentFilters.resistance) {
        const hasResistance = card.resistances?.some(r => r.type === currentFilters.resistance);
        if (!hasResistance) return false;
      }

      // Attack cost filter
      if (currentFilters.attackCost && card.attacks) {
        const hasAttackWithCost = card.attacks.some(attack => 
          attack.cost?.includes(currentFilters.attackCost)
        );
        if (!hasAttackWithCost) return false;
      }

      return true;
    });
  };

  const applySorting = (cards: SearchResult[], sortKey: string, order: string): SearchResult[] => {
    const sortedCards = [...cards].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.tcgplayer?.prices?.holofoil?.market || 
                  a.tcgplayer?.prices?.normal?.market || 0;
          bValue = b.tcgplayer?.prices?.holofoil?.market || 
                  b.tcgplayer?.prices?.normal?.market || 0;
          break;
        case 'hp':
          aValue = parseInt(a.hp || '0') || 0;
          bValue = parseInt(b.hp || '0') || 0;
          break;
        case 'releaseDate':
          aValue = new Date(a.set?.releaseDate || '1999-01-01');
          bValue = new Date(b.set?.releaseDate || '1999-01-01');
          break;
        case 'rarity':
          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Ultra Rare', 'Secret Rare'];
          aValue = rarityOrder.indexOf(a.rarity || '') || 0;
          bValue = rarityOrder.indexOf(b.rarity || '') || 0;
          break;
        case 'relevance':
        default:
          // For relevance, consider name match, then type match, then set match
          const query = searchQuery.toLowerCase();
          aValue = calculateRelevanceScore(a, query);
          bValue = calculateRelevanceScore(b, query);
          break;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedCards;
  };

  const calculateRelevanceScore = (card: SearchResult, query: string): number => {
    let score = 0;
    
    // Exact name match gets highest score
    if (card.name.toLowerCase() === query) score += 100;
    else if (card.name.toLowerCase().startsWith(query)) score += 50;
    else if (card.name.toLowerCase().includes(query)) score += 25;
    
    // Type match
    if (card.types?.some(type => 
      (typeof type === 'string' ? type : type.type.name).toLowerCase().includes(query)
    )) score += 15;
    
    // Set name match
    if (card.set?.name.toLowerCase().includes(query)) score += 10;
    
    // Artist match
    if (card.artist?.toLowerCase().includes(query)) score += 5;
    
    return score;
  };

  const saveToHistory = (query: string, currentFilters: SearchFilters, resultCount: number) => {
    const historyItem: SearchHistoryItem = {
      query,
      filters: currentFilters,
      resultCount,
      timestamp: new Date().toISOString()
    };

    const newHistory = [historyItem, ...searchHistory.filter(item => 
      item.query !== query || JSON.stringify(item.filters) !== JSON.stringify(currentFilters)
    )].slice(0, 20); // Keep last 20 searches

    setSearchHistory(newHistory);
    localStorage.setItem('advanced-search-history', JSON.stringify(newHistory));
  };

  const handleSearch = (query: string, searchFilters: Partial<SearchFilters> = {}) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, ...searchFilters }));
  };

  const handleFilterChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      rarity: '',
      set: '',
      priceRange: [0, 1000],
      artist: '',
      releaseYear: '',
      hp: { min: '', max: '' },
      retreatCost: '',
      weakness: '',
      resistance: '',
      attackCost: '',
      cardType: 'all'
    });
  };

  const loadFromHistory = (historyItem: SearchHistoryItem) => {
    setSearchQuery(historyItem.query);
    setFilters(historyItem.filters);
  };

  const getSearchSummary = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      if (key === 'priceRange') return value[0] > 0 || value[1] < 1000;
      if (key === 'hp') return value.min !== '' || value.max !== '';
      if (key === 'cardType') return value !== 'all';
      return value !== '' && value !== null && value !== undefined;
    });

    return {
      hasQuery: searchQuery.trim().length > 0,
      activeFilterCount: activeFilters.length,
      activeFilters
    };
  }, [searchQuery, filters]);

  return (
    <div className={`advanced-search-system ${className}`}>
      {/* Main Search Input */}
      <div className="mb-6">
        <EnhancedSearchBox
          placeholder="Search cards, Pokemon, sets, artists..."
          onSearch={handleSearch}
          className="w-full" />
      </div>

      {/* Quick Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            isAdvancedMode 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          Advanced Filters {isAdvancedMode ? '▼' : '▶'}
        </button>

        {/* Quick type filters */}
        {['fire', 'water', 'grass', 'electric', 'psychic'].map(type => (
          <button
            key={type}
            onClick={() => handleFilterChange('type', filters.type === type ? '' : type)}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              filters.type === type
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {type}
          </button>
        ))}

        {/* Quick rarity filters */}
        {['Common', 'Rare', 'Rare Holo'].map(rarity => (
          <button
            key={rarity}
            onClick={() => handleFilterChange('rarity', filters.rarity === rarity ? '' : rarity)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filters.rarity === rarity
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {rarity}
          </button>
        ))}

        {getSearchSummary.activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 rounded-full text-sm text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800">

            Clear Filters ({getSearchSummary.activeFilterCount})
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedMode && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Card Type</label>
              <select
                value={filters.cardType}
                onChange={(e) => handleFilterChange('cardType', e.target.value as SearchFilters['cardType'])}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700">

                <option value="all">All Cards</option>
                <option value="tcg">TCG Cards</option>
                <option value="pocket">Pocket Cards</option>
              </select>
            </div>

            {/* Set Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Set</label>
              <select
                value={filters.set}
                onChange={(e) => handleFilterChange('set', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700">

                <option value="">All Sets</option>
                <option value="base1">Base Set</option>
                <option value="jungle">Jungle</option>
                <option value="fossil">Fossil</option>
              </select>
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm font-medium mb-2">Artist</label>
              <input
                type="text"
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
                placeholder="Artist name"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-sm font-medium mb-2">Release Year</label>
              <input
                type="number"
                value={filters.releaseYear}
                onChange={(e) => handleFilterChange('releaseYear', e.target.value)}
                placeholder="1999"
                min="1996"
                max="2024"
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
            </div>

            {/* HP Range */}
            <div>
              <label className="block text-sm font-medium mb-2">HP Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.hp.min}
                  onChange={(e) => handleFilterChange('hp', { ...filters.hp, min: e.target.value })}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
                <input
                  type="number"
                  value={filters.hp.max}
                  onChange={(e) => handleFilterChange('hp', { ...filters.hp, max: e.target.value })}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700" />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                className="w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded bg-white dark:bg-gray-700 text-sm">

            <option value="relevance">Relevance</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="hp">HP</option>
            <option value="releaseDate">Release Date</option>
            <option value="rarity">Rarity</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border rounded bg-white dark:bg-gray-700 text-sm">

            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-4">
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Recent Searches ({searchHistory.length})
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => loadFromHistory(item)}
                  className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">

                  <span className="font-medium">{item.query}</span>
                  <span className="text-gray-500 ml-2">({item.resultCount} results)</span>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchSystem;