import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import type { ExtendedPocketCard } from './useDeckBuilder';

/**
 * Sort options for card browsing
 */
export type CardSortBy = 'name' | 'type' | 'hp' | 'rarity' | 'pack';
export type SortOrder = 'asc' | 'desc';

/**
 * Category filter for cards
 */
export type CardCategory = 'all' | 'pokemon' | 'trainer' | 'energy';

/**
 * Trainer subtype filter
 */
export type TrainerSubtype = 'all' | 'item' | 'supporter' | 'tool';

/**
 * Filter state for card browser
 */
export interface CardFilters {
  search: string;
  types: string[];
  category: CardCategory;
  trainerSubtype: TrainerSubtype;
  packs: string[];
  rarities: string[];
  hpRange: [number, number] | null;
  stage: string | null;
}

/**
 * Available filter options extracted from cards
 */
export interface FilterOptions {
  types: string[];
  packs: string[];
  rarities: string[];
  stages: string[];
  maxHp: number;
}

/**
 * Card browser configuration
 */
interface CardBrowserConfig {
  pageSize?: number;
  searchDebounceMs?: number;
  initialSortBy?: CardSortBy;
  initialSortOrder?: SortOrder;
}

/**
 * Return type for useCardBrowser hook
 */
interface UseCardBrowserReturn {
  // Filtered & sorted cards
  filteredCards: ExtendedPocketCard[];
  visibleCards: ExtendedPocketCard[];
  totalFilteredCount: number;

  // Filter state
  filters: CardFilters;
  setSearch: (search: string) => void;
  setTypes: (types: string[]) => void;
  toggleType: (type: string) => void;
  setCategory: (category: CardCategory) => void;
  setTrainerSubtype: (subtype: TrainerSubtype) => void;
  setPacks: (packs: string[]) => void;
  togglePack: (pack: string) => void;
  setRarities: (rarities: string[]) => void;
  toggleRarity: (rarity: string) => void;
  setHpRange: (range: [number, number] | null) => void;
  setStage: (stage: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;

  // Sort state
  sortBy: CardSortBy;
  sortOrder: SortOrder;
  setSortBy: (sortBy: CardSortBy) => void;
  toggleSortOrder: () => void;

  // Pagination / infinite scroll
  page: number;
  pageSize: number;
  totalPages: number;
  loadMore: () => void;
  loadPage: (page: number) => void;
  resetPagination: () => void;
  hasMore: boolean;

  // Filter options (extracted from cards)
  filterOptions: FilterOptions;

  // Virtual scroll helpers
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Default filter state
const DEFAULT_FILTERS: CardFilters = {
  search: '',
  types: [],
  category: 'all',
  trainerSubtype: 'all',
  packs: [],
  rarities: [],
  hpRange: null,
  stage: null
};

// All available packs in order
const ALL_PACKS = [
  'Charizard', 'Mewtwo', 'Pikachu', 'Mythical Island',
  'Apex', 'Mythical', 'Celestial', 'Eevee Grove',
  'Dialga', 'Palkia', 'Triumphant Light', 'Shining Revelry',
  'Solgaleo', 'Lunala', 'Extradimensional Crisis'
];

/**
 * Get trainer subtype from card
 */
function getTrainerSubtype(card: ExtendedPocketCard): string {
  const name = card.name?.toLowerCase() || '';
  const type = card.type?.toLowerCase() || '';

  if (type !== 'trainer') return '';

  // Tool patterns
  const toolPatterns = [
    /tool$/, /^rocky helmet/, /^muscle band/, /^leftovers/, /^float stone/,
    /berry$/, /cape$/, /band$/, /barb$/, /cord$/, /stone$/,
    /^lucky/, /^amulet/, /^charm/, /^crystal/, /^scope/, /^specs/, /^goggles/
  ];

  // Supporter patterns - character names and research cards
  const supporterPatterns = [
    /^professor/, /^dr\./, /^mr\./, /^ms\./, /^mrs\./, /^captain/,
    /research$/, /analysis$/, /theory$/,
    /^(erika|misty|blaine|koga|giovanni|brock|sabrina|bill|oak|red)$/i,
    /^(cynthia|lance|steven|wallace|diantha|iris|alder)$/i,
    /^(lillie|mars|cyrus|copycat|pokemon centre lady|red card)$/i
  ];

  // Item patterns
  const itemPatterns = [
    /potion$/, /^potion$/, /^super potion/, /^hyper potion/, /^max potion/,
    /ball$/, /^poke ball/, /^great ball/, /^ultra ball/,
    /^x /, /^switch/, /^rope/, /candy$/
  ];

  if (toolPatterns.some(p => p.test(name))) return 'tool';
  if (supporterPatterns.some(p => p.test(name))) return 'supporter';
  if (itemPatterns.some(p => p.test(name))) return 'item';

  // Default for single proper nouns (likely character names = supporters)
  const words = card.name?.split(' ') || [];
  if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) {
    return 'supporter';
  }

  return 'item';
}

/**
 * Custom hook for browsing and filtering Pokemon Pocket cards
 */
export function useCardBrowser(
  allCards: ExtendedPocketCard[],
  config: CardBrowserConfig = {}
): UseCardBrowserReturn {
  const {
    pageSize: initialPageSize = 24,
    searchDebounceMs = 200,
    initialSortBy = 'name',
    initialSortOrder = 'asc'
  } = config;

  // Filter state
  const [filters, setFilters] = useState<CardFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, searchDebounceMs);

  // Sort state
  const [sortBy, setSortBy] = useState<CardSortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  // Scroll container ref for virtual scroll integration
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract filter options from cards (memoized)
  const filterOptions = useMemo<FilterOptions>(() => {
    if (!allCards.length) {
      return { types: [], packs: [], rarities: [], stages: [], maxHp: 200 };
    }

    const types = new Set<string>();
    const packs = new Set<string>();
    const rarities = new Set<string>();
    const stages = new Set<string>();
    let maxHp = 0;

    allCards.forEach(card => {
      if (card.type) {
        const type = card.type.toLowerCase();
        if (type !== 'trainer') {
          types.add(type);
        }
      }
      if (card.pack) packs.add(card.pack);
      if (card.rarity) rarities.add(card.rarity);
      if (card.stage) stages.add(card.stage);

      const hp = parseInt(card.health || card.hp?.toString() || '0');
      if (hp > maxHp) maxHp = hp;
    });

    // Sort and filter packs to maintain order
    const orderedPacks = ALL_PACKS.filter(pack => packs.has(pack));

    return {
      types: Array.from(types).sort(),
      packs: orderedPacks,
      rarities: Array.from(rarities).sort(),
      stages: Array.from(stages).sort(),
      maxHp
    };
  }, [allCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = allCards.filter(card => {
      // Search filter
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        if (!card.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all') {
        const cardType = card.type?.toLowerCase() || '';
        if (filters.category === 'pokemon') {
          if (cardType === 'trainer' || cardType === 'energy') return false;
        } else if (filters.category === 'trainer') {
          if (cardType !== 'trainer') return false;
        } else if (filters.category === 'energy') {
          if (cardType !== 'energy') return false;
        }
      }

      // Trainer subtype filter
      if (filters.trainerSubtype !== 'all' && card.type?.toLowerCase() === 'trainer') {
        const subtype = getTrainerSubtype(card);
        if (subtype !== filters.trainerSubtype) return false;
      }

      // Type filter (for Pokemon)
      if (filters.types.length > 0) {
        const cardType = card.type?.toLowerCase() || '';
        if (cardType !== 'trainer' && cardType !== 'energy') {
          if (!filters.types.includes(cardType)) return false;
        }
      }

      // Pack filter
      if (filters.packs.length > 0) {
        if (!card.pack || !filters.packs.includes(card.pack)) return false;
      }

      // Rarity filter
      if (filters.rarities.length > 0) {
        if (!card.rarity || !filters.rarities.includes(card.rarity)) return false;
      }

      // HP range filter
      if (filters.hpRange) {
        const hp = parseInt(card.health || card.hp?.toString() || '0');
        if (hp < filters.hpRange[0] || hp > filters.hpRange[1]) return false;
      }

      // Stage filter
      if (filters.stage) {
        if (card.stage !== filters.stage) return false;
      }

      return true;
    });

    // Sort cards
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'hp':
          const hpA = parseInt(a.health || a.hp?.toString() || '0');
          const hpB = parseInt(b.health || b.hp?.toString() || '0');
          comparison = hpB - hpA; // Default descending for HP
          break;
        case 'rarity':
          comparison = (a.rarity || '').localeCompare(b.rarity || '');
          break;
        case 'pack':
          comparison = (a.pack || '').localeCompare(b.pack || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allCards, debouncedSearch, filters, sortBy, sortOrder]);

  // Visible cards (paginated)
  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, page * pageSize);
  }, [filteredCards, page, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.types, filters.category, filters.trainerSubtype,
      filters.packs, filters.rarities, filters.hpRange, filters.stage]);

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const setTypes = useCallback((types: string[]) => {
    setFilters(prev => ({ ...prev, types }));
  }, []);

  const toggleType = useCallback((type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  }, []);

  const setCategory = useCallback((category: CardCategory) => {
    setFilters(prev => ({ ...prev, category, trainerSubtype: 'all' }));
  }, []);

  const setTrainerSubtype = useCallback((trainerSubtype: TrainerSubtype) => {
    setFilters(prev => ({ ...prev, trainerSubtype }));
  }, []);

  const setPacks = useCallback((packs: string[]) => {
    setFilters(prev => ({ ...prev, packs }));
  }, []);

  const togglePack = useCallback((pack: string) => {
    setFilters(prev => ({
      ...prev,
      packs: prev.packs.includes(pack)
        ? prev.packs.filter(p => p !== pack)
        : [...prev.packs, pack]
    }));
  }, []);

  const setRarities = useCallback((rarities: string[]) => {
    setFilters(prev => ({ ...prev, rarities }));
  }, []);

  const toggleRarity = useCallback((rarity: string) => {
    setFilters(prev => ({
      ...prev,
      rarities: prev.rarities.includes(rarity)
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity]
    }));
  }, []);

  const setHpRange = useCallback((hpRange: [number, number] | null) => {
    setFilters(prev => ({ ...prev, hpRange }));
  }, []);

  const setStage = useCallback((stage: string | null) => {
    setFilters(prev => ({ ...prev, stage }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.types.length > 0 ||
      filters.category !== 'all' ||
      filters.trainerSubtype !== 'all' ||
      filters.packs.length > 0 ||
      filters.rarities.length > 0 ||
      filters.hpRange !== null ||
      filters.stage !== null
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.types.length;
    if (filters.category !== 'all') count++;
    if (filters.trainerSubtype !== 'all') count++;
    count += filters.packs.length;
    count += filters.rarities.length;
    if (filters.hpRange) count++;
    if (filters.stage) count++;
    return count;
  }, [filters]);

  // Sort controls
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  // Pagination controls
  const totalPages = Math.ceil(filteredCards.length / pageSize);
  const hasMore = visibleCards.length < filteredCards.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const loadPage = useCallback((targetPage: number) => {
    setPage(Math.max(1, Math.min(targetPage, totalPages)));
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    // Filtered & sorted cards
    filteredCards,
    visibleCards,
    totalFilteredCount: filteredCards.length,

    // Filter state
    filters,
    setSearch,
    setTypes,
    toggleType,
    setCategory,
    setTrainerSubtype,
    setPacks,
    togglePack,
    setRarities,
    toggleRarity,
    setHpRange,
    setStage,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,

    // Sort state
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,

    // Pagination
    page,
    pageSize,
    totalPages,
    loadMore,
    loadPage,
    resetPagination,
    hasMore,

    // Filter options
    filterOptions,

    // Virtual scroll
    scrollContainerRef
  };
}
