import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import pokemon from "pokemontcgsdk";
import { toLowercaseUrl } from "../utils/formatters";
import { fetchJSON } from "../utils/unifiedFetch";
import { useDebounce } from "../hooks/useDebounce";
import type { TCGCard, CardSet } from "../types/api/cards";

const POKE_API = "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0";

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
  <Link href={`/cards/${card.id}`} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
      <div className="text-xs text-gray-500">{card.set?.name}</div>
    </div>
  </Link>
));
SearchResultCard.displayName = 'SearchResultCard';

const SearchResultSet = memo(({ set }: { set: CardSet }) => (
  <Link href={`/tcgsets/${set.id}`} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
      <div className="text-xs text-gray-500">{set.series}</div>
    </div>
  </Link>
));
SearchResultSet.displayName = 'SearchResultSet';

const SearchResultPokemon = memo(({ pokemon }: { pokemon: PokemonResult }) => {
  const pokemonId = pokemon.url.split('/').slice(-2, -1)[0];
  return (
    <Link href={`/pokedex/${pokemonId}`} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ cards: [], sets: [], pokemon: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false); 
    setQuery(""); 
    setResults({ cards: [], sets: [], pokemon: [] }); 
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
      
      // Card search
      let cards: TCGCard[] = [];
      try {
        const res = await pokemon.card.where({ q: `name:${q}*` });
        cards = (res?.data?.slice(0, 5) || []) as TCGCard[];
      } catch {}
      
      // Set search
      let sets: CardSet[] = [];
      try {
        const allSets = await pokemon.set.all();
        sets = (allSets.data as CardSet[])
          .filter((s: CardSet) => s.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5);
      } catch {}
      
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

  return open ? (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm safe-area-padding" 
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto relative flex flex-col items-center modal-content"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        style={{ 
          outline: 'none', 
          maxHeight: 'calc(90vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))' 
        }}
      >
        <div className="w-full flex flex-col items-center mb-2">
          <input
            ref={inputRef}
            autoFocus
            className="w-full max-w-md px-5 py-3 rounded-xl border-2 border-primary focus:ring-4 focus:ring-primary/30 text-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg mb-2 outline-none transition-all duration-200 placeholder-gray-400 caret-primary"
            style={{ 
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)', 
              background: 'rgba(255,255,255,0.98)',
              fontSize: '16px',
              minHeight: '44px'
            }}
            placeholder="Search cards, Pokémon, sets..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === "Escape") handleClose(); }}
            tabIndex={0}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="min-h-[120px] w-full">
          {loading && <div className="text-center text-gray-400 py-4">Searching...</div>}
          {!loading && !hasResults && (
            <div className="text-gray-400 text-center py-4">Type to search...</div>
          )}
          {results.cards.length > 0 && (
            <div>
              <div className="font-bold text-primary mb-1">Cards</div>
              <div className="space-y-1">
                {results.cards.map((card) => (
                  <SearchResultCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}
          {results.sets.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Sets</div>
              <div className="space-y-1">
                {results.sets.map((set) => (
                  <SearchResultSet key={set.id} set={set} />
                ))}
              </div>
            </div>
          )}
          {results.pokemon.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Pokémon</div>
              <div className="space-y-1">
                {results.pokemon.map((poke) => (
                  <SearchResultPokemon key={poke.name} pokemon={poke} />
                ))}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={handleClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-primary text-2xl font-bold bg-white/80 dark:bg-gray-800/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md" 
          aria-label="Close search"
        >
          &times;
        </button>
      </div>
    </div>
  ) : null;
});

export default GlobalSearchModal;