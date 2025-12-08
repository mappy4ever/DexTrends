import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { FiClock, FiTrendingUp, FiX, FiSearch } from "react-icons/fi";
import { fetchJSON } from "../utils/unifiedFetch";
import { TCGDexEndpoints } from "../utils/tcgdex-adapter";
import { useDebounce } from "../hooks/useDebounce";
import type { TCGCard, CardSet } from "../types/api/cards";
import { Container } from "./ui/Container";
import logger from "../utils/logger";
import { cn } from "../utils/cn";

const POKE_API = "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0";

// Search history management
const SEARCH_HISTORY_KEY = 'dextrends_search_history';
const MAX_HISTORY_ITEMS = 8;

function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const history = getSearchHistory();
    // Remove if exists, add to front
    const filtered = history.filter(h => h.toLowerCase() !== query.toLowerCase());
    const updated = [query.trim(), ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

function removeFromSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getSearchHistory();
    const updated = history.filter(h => h.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
}

function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // Silent fail
  }
}

// Popular/trending suggestions (static for now, could be API-driven)
const POPULAR_SEARCHES = [
  { name: 'Charizard', type: 'pokemon' as const },
  { name: 'Pikachu', type: 'pokemon' as const },
  { name: 'Mewtwo', type: 'pokemon' as const },
  { name: 'Scarlet & Violet', type: 'set' as const },
  { name: 'Crown Zenith', type: 'set' as const },
  { name: 'Obsidian Flames', type: 'set' as const },
];

// Type definitions
interface SearchResults {
  cards: TCGCard[];
  sets: CardSet[];
  pokemon: PokemonResult[];
}

interface PokemonResult {
  name: string;
  url: string;
}

interface PokemonApiResponse {
  results: PokemonResult[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface GlobalSearchModalHandle {
  open: () => void;
}


// Memoized search result components for better performance
const SearchResultCard = memo(({ card }: { card: TCGCard }) => (
  <Link href={`/cards/${card.id}`} className="flex items-center p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
    {card.images?.small && (
      <div className="relative w-8 h-12 mr-3 rounded overflow-hidden">
        <Image 
          src={card.images.small} 
          alt={card.name} 
          width={32} 
          height={48} 
          className="rounded object-cover" 
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
        />
      </div>
    )}
    <div>
      <div className="font-medium text-sm">{card.name}</div>
      <div className="text-xs text-stone-500">{card.set?.name}</div>
    </div>
  </Link>
));
SearchResultCard.displayName = 'SearchResultCard';

const SearchResultSet = memo(({ set }: { set: CardSet }) => (
  <Link href={`/tcgexpansions/${set.id}`} className="flex items-center p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
    {set.images?.logo && (
      <div className="relative w-8 h-8 mr-3 rounded overflow-hidden">
        <Image
          src={set.images.logo}
          alt={set.name}
          width={32}
          height={32}
          className="rounded object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
        />
      </div>
    )}
    <div>
      <div className="font-medium text-sm">{set.name}</div>
      <div className="text-xs text-stone-500">{set.series}</div>
    </div>
  </Link>
));
SearchResultSet.displayName = 'SearchResultSet';

const SearchResultPokemon = memo(({ pokemon }: { pokemon: PokemonResult }) => {
  const pokemonId = pokemon.url.split('/').slice(-2, -1)[0];
  return (
    <Link href={`/pokedex/${pokemonId}`} className="flex items-center p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors">
      <div className="relative w-8 h-8 mr-3">
        <Image 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`} 
          alt={pokemon.name} 
          width={32} 
          height={32} 
          className="object-contain" 
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
        />
      </div>
      <div className="font-medium text-sm capitalize">{pokemon.name}</div>
    </Link>
  );
});
SearchResultPokemon.displayName = 'SearchResultPokemon';

const GlobalSearchModal = forwardRef<GlobalSearchModalHandle>(function GlobalSearchModal(_, ref) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ cards: [], sets: [], pokemon: [] });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory());
    }
  }, [open]);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults({ cards: [], sets: [], pokemon: [] });
    setSelectedIndex(-1);
  }, []);

  // Save to history when navigating to a result
  const handleResultClick = useCallback((searchTerm: string) => {
    if (searchTerm) {
      addToSearchHistory(searchTerm);
    }
    handleClose();
  }, [handleClose]);

  // Remove item from history
  const handleRemoveHistoryItem = useCallback((item: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromSearchHistory(item);
    setHistory(getSearchHistory());
  }, []);

  // Clear all history
  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  // Use suggestion
  const handleUseSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    addToSearchHistory(suggestion);
  }, []);

  useImperativeHandle(ref, () => ({ 
    open: handleOpen
  }), [handleOpen]);

  // Memoized search function
  const searchFunction = useCallback(async (q: string) => {
    if (!q) {
      setResults({ cards: [], sets: [], pokemon: [] });
      setLoading(false);
      return;
    }
    setLoading(true);

      // Card search using TCGDex
      let cards: TCGCard[] = [];
      try {
        const url = `${TCGDexEndpoints.cards('en')}?name=like:${encodeURIComponent(q)}&pagination:itemsPerPage=5`;
        const res = await fetchJSON<any[]>(url, {
          useCache: true,
          cacheTime: 5 * 60 * 1000,
          timeout: 5000
        });
        cards = (res || []).map((card: any) => ({
          id: card.id,
          name: card.name,
          images: {
            small: card.image ? `${card.image}/low.png` : undefined,
            large: card.image ? `${card.image}/high.png` : undefined
          },
          set: { id: card.id?.split('-')[0] || '', name: '', series: '' }
        } as TCGCard));
      } catch (err) {
        logger.debug('Card search failed', { error: err });
      }

      // Set search using TCGDex
      let sets: CardSet[] = [];
      try {
        const setsUrl = TCGDexEndpoints.sets('en');
        const allSets = await fetchJSON<any[]>(setsUrl, {
          useCache: true,
          cacheTime: 60 * 60 * 1000 // 1 hour cache
        });
        sets = (allSets || [])
          .filter((s: any) => s.name?.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5)
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            series: s.serie?.name || '',
            images: { logo: s.logo, symbol: s.symbol }
          } as CardSet));
      } catch (err) {
        logger.debug('Set search failed', { error: err });
      }
      
      // Pokémon search
      let pokemonResults: PokemonResult[] = [];
      try {
        const pokeData = await fetchJSON<PokemonApiResponse>(`${POKE_API}&name=${q.toLowerCase()}`, {
          useCache: true,
          cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
          timeout: 5000, // 5 second timeout for search
          retries: 1 // Quick retry for search
        });
        pokemonResults = pokeData?.results
          ?.filter(p => p.name.includes(q.toLowerCase()))
          .slice(0, 5) || [];
      } catch {
        // Silent failure - search continues without Pokemon results
      }
      
    setResults({ cards, sets, pokemon: pokemonResults });
    setLoading(false);
  }, []);

  // Use the centralized debounce hook
  const debouncedQuery = useDebounce(query, 350);
  
  useEffect(() => {
    if (!open || !debouncedQuery) return;
    searchFunction(debouncedQuery);
  }, [debouncedQuery, open, searchFunction]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleBackdropClick = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const hasResults = useMemo(() =>
    results.cards.length > 0 || results.sets.length > 0 || results.pokemon.length > 0,
    [results]
  );

  // Build flat list of all navigable items for keyboard nav
  const navigableItems = useMemo(() => {
    const items: { type: 'card' | 'set' | 'pokemon' | 'history' | 'suggestion'; id: string; href: string; label: string }[] = [];

    if (query) {
      results.cards.forEach(card => items.push({ type: 'card', id: card.id, href: `/cards/${card.id}`, label: card.name }));
      results.sets.forEach(set => items.push({ type: 'set', id: set.id, href: `/tcgexpansions/${set.id}`, label: set.name }));
      results.pokemon.forEach(p => {
        const id = p.url.split('/').slice(-2, -1)[0];
        items.push({ type: 'pokemon', id, href: `/pokedex/${id}`, label: p.name });
      });
    } else {
      history.forEach(h => items.push({ type: 'history', id: h, href: '', label: h }));
      POPULAR_SEARCHES.forEach(s => items.push({ type: 'suggestion', id: s.name, href: '', label: s.name }));
    }

    return items;
  }, [query, results, history]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, navigableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const item = navigableItems[selectedIndex];
      if (item) {
        if (item.type === 'history' || item.type === 'suggestion') {
          handleUseSuggestion(item.label);
          setSelectedIndex(-1);
        } else {
          addToSearchHistory(query);
          router.push(item.href);
          handleClose();
        }
      }
    }
  }, [handleClose, navigableItems, selectedIndex, handleUseSuggestion, query, router]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results, history]);

  // Calculate index offsets for keyboard navigation highlighting
  const getItemIndex = useCallback((type: string, itemIndex: number): number => {
    if (query) {
      if (type === 'card') return itemIndex;
      if (type === 'set') return results.cards.length + itemIndex;
      if (type === 'pokemon') return results.cards.length + results.sets.length + itemIndex;
    } else {
      if (type === 'history') return itemIndex;
      if (type === 'suggestion') return history.length + itemIndex;
    }
    return -1;
  }, [query, results.cards.length, results.sets.length, history.length]);

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 safe-area-padding"
      onClick={handleBackdropClick}
    >
      <Container
        variant="elevated"
        rounded="xl"
        padding="lg"
        className="w-full max-w-lg mx-auto relative flex flex-col items-center modal-content transform-gpu"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        style={{
          outline: 'none',
          maxHeight: 'calc(90vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        } as React.CSSProperties}
      >
        <div className="w-full flex flex-col items-center mb-2">
          <input
            ref={inputRef}
            autoFocus
            aria-label="Search cards, Pokemon, and sets"
            className="w-full max-w-md px-5 py-3 rounded-xl border-2 border-primary focus:ring-2 focus:ring-primary/30 text-xl bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-lg mb-2 outline-none transition-all duration-200 placeholder-stone-400 caret-primary"
            style={{
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
              background: 'rgba(255,255,255,0.98)',
              fontSize: '16px',
              minHeight: '44px'
            }}
            placeholder="Search cards, Pokémon, sets..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            spellCheck={false}
            autoComplete="off"
          />
          {/* Keyboard hints */}
          <div className="text-xs text-stone-400 flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px]">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px]">Enter</kbd> select</span>
            <span><kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-[10px]">Esc</kbd> close</span>
          </div>
        </div>

        <div ref={resultsRef} className="min-h-[200px] max-h-[50vh] overflow-y-auto w-full">
          {loading && (
            <div className="text-center text-stone-400 py-4 flex items-center justify-center gap-2">
              <FiSearch className="w-4 h-4 animate-pulse" />
              Searching...
            </div>
          )}

          {/* Empty state: show history and suggestions */}
          {!loading && !query && (
            <div className="space-y-4">
              {/* Recent Searches */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-300">
                      <FiClock className="w-4 h-4" />
                      Recent Searches
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {history.map((item, idx) => (
                      <button
                        key={item}
                        onClick={() => handleUseSuggestion(item)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left group",
                          selectedIndex === getItemIndex('history', idx)
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "hover:bg-stone-100 dark:hover:bg-stone-700"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4 text-stone-400" />
                          <span className="text-sm text-stone-700 dark:text-stone-200">{item}</span>
                        </div>
                        <button
                          onClick={(e) => handleRemoveHistoryItem(item, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-stone-200 dark:hover:bg-stone-600 rounded transition-all"
                          aria-label={`Remove ${item} from history`}
                        >
                          <FiX className="w-3 h-3 text-stone-400" />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">
                  <FiTrendingUp className="w-4 h-4" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((suggestion, idx) => (
                    <button
                      key={suggestion.name}
                      onClick={() => handleUseSuggestion(suggestion.name)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-colors",
                        selectedIndex === getItemIndex('suggestion', idx)
                          ? "bg-amber-500 text-white"
                          : "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600"
                      )}
                    >
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No results state */}
          {!loading && query && !hasResults && (
            <div className="text-center py-8">
              <div className="text-stone-400 mb-3">No results found for "{query}"</div>
              <div className="text-sm text-stone-500">
                Try searching for:
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {POPULAR_SEARCHES.slice(0, 3).map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleUseSuggestion(s.name)}
                      className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors text-sm"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.cards.length > 0 && (
            <div>
              <div className="font-bold text-primary mb-1">Cards</div>
              <div className="space-y-1">
                {results.cards.map((card, idx) => (
                  <div
                    key={card.id}
                    onClick={() => handleResultClick(card.name)}
                    className={cn(
                      "rounded-lg transition-colors",
                      selectedIndex === getItemIndex('card', idx) && "bg-amber-100 dark:bg-amber-900/30"
                    )}
                  >
                    <SearchResultCard card={card} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.sets.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Sets</div>
              <div className="space-y-1">
                {results.sets.map((set, idx) => (
                  <div
                    key={set.id}
                    onClick={() => handleResultClick(set.name)}
                    className={cn(
                      "rounded-lg transition-colors",
                      selectedIndex === getItemIndex('set', idx) && "bg-amber-100 dark:bg-amber-900/30"
                    )}
                  >
                    <SearchResultSet set={set} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {results.pokemon.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Pokémon</div>
              <div className="space-y-1">
                {results.pokemon.map((poke, idx) => (
                  <div
                    key={poke.name}
                    onClick={() => handleResultClick(poke.name)}
                    className={cn(
                      "rounded-lg transition-colors",
                      selectedIndex === getItemIndex('pokemon', idx) && "bg-amber-100 dark:bg-amber-900/30"
                    )}
                  >
                    <SearchResultPokemon pokemon={poke} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-stone-400 hover:text-primary text-2xl font-bold bg-white/80 dark:bg-stone-800/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md min-h-[44px] min-w-[44px]"
          aria-label="Close search"
        >
          <FiX className="w-5 h-5" />
        </button>
      </Container>
    </div>
  ) : null;
});

export default GlobalSearchModal;