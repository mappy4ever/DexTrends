import React, { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import Link from "next/link";
import pokemon from "pokemontcgsdk";
import { toLowercaseUrl } from "../utils/formatters";
import { fetchJSON } from "../utils/unifiedFetch";
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

type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): DebouncedFunction<T> & { cancel: () => void } {
  let timer: NodeJS.Timeout | undefined;
  const debouncedFn = (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  
  debouncedFn.cancel = () => {
    clearTimeout(timer);
  };
  
  return debouncedFn;
}

const GlobalSearchModal = forwardRef<GlobalSearchModalHandle>(function GlobalSearchModal(_, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ cards: [], sets: [], pokemon: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({ 
    open: () => setOpen(true) 
  }));

  function close() { 
    setOpen(false); 
    setQuery(""); 
    setResults({ cards: [], sets: [], pokemon: [] }); 
  }

  // Create debounced search function
  const debouncedSearchRef = useRef<ReturnType<typeof debounce> | null>(null);
  
  useEffect(() => {
    const searchFn = async (q: string) => {
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
        cards = (res?.slice(0, 5) || []) as TCGCard[];
      } catch {}
      
      // Set search
      let sets: CardSet[] = [];
      try {
        const allSets = await pokemon.set.all();
        sets = allSets
          .filter((s: CardSet) => s.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5) as CardSet[];
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
    };
    
    debouncedSearchRef.current = debounce(searchFn, 350);
    
    // Cleanup on unmount
    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!open || !debouncedSearchRef.current) return;
    debouncedSearchRef.current(query);
  }, [query, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return open ? (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm safe-area-padding" 
      onClick={close}
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
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") close(); }}
            tabIndex={0}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="min-h-[120px] w-full">
          {loading && <div className="text-center text-gray-400 py-4">Searching...</div>}
          {!loading && !results.cards.length && !results.sets.length && !results.pokemon.length && (
            <div className="text-gray-400 text-center py-4">Type to search...</div>
          )}
          {results.cards.length > 0 && (
            <div>
              <div className="font-bold text-primary mb-1">Cards</div>
              <ul>
                {results.cards.map((card) => (
                  <li key={card.id} className="py-2 px-2 rounded hover:bg-primary/10 cursor-pointer">
                    <Link
                      href={toLowercaseUrl(`/pokedex/${card.name}`)}
                      className="text-primary font-semibold flex items-center gap-2"
                    >
                      <img 
                        src={card.images?.small} 
                        alt={card.name} 
                        className="w-8 h-8 rounded shadow" 
                      />
                      {card.name} <span className="text-xs text-gray-400">({card.set?.name})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.sets.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Sets</div>
              <ul>
                {results.sets.map((set) => (
                  <li key={set.id} className="py-2 px-2 rounded hover:bg-primary/10 cursor-pointer">
                    <Link
                      href={toLowercaseUrl(`/tcgsets/${set.id}`)}
                      className="text-primary font-semibold flex items-center gap-2"
                    >
                      {set.images?.logo && (
                        <img 
                          src={set.images.logo} 
                          alt={set.name} 
                          className="w-8 h-8 rounded" 
                        />
                      )}
                      {set.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {results.pokemon.length > 0 && (
            <div className="mt-3">
              <div className="font-bold text-primary mb-1">Pokémon</div>
              <ul>
                {results.pokemon.map((poke) => (
                  <li key={poke.name} className="py-2 px-2 rounded hover:bg-primary/10 cursor-pointer">
                    <Link
                      href={toLowercaseUrl(`/pokedex/${poke.name}`)}
                      className="text-primary font-semibold flex items-center gap-2"
                    >
                      <span className="capitalize">{poke.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button 
          onClick={close} 
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