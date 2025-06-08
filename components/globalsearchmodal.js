import React, { forwardRef, useImperativeHandle, useState, useRef } from "react";
import pokemon from "pokemontcgsdk";

const POKE_API = "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0";

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const GlobalSearchModal = forwardRef(function GlobalSearchModal(_, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ cards: [], sets: [], pokemon: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }));
  function close() { setOpen(false); setQuery(""); setResults({ cards: [], sets: [], pokemon: [] }); }

  // Debounced search
  const doSearch = debounce(async (q) => {
    if (!q) {
      setResults({ cards: [], sets: [], pokemon: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    // Card search
    let cards = [];
    try {
      const res = await pokemon.card.where({ q: `name:${q}*` });
      cards = res.data?.slice(0, 5) || [];
    } catch {}
    // Set search
    let sets = [];
    try {
      const allSets = await pokemon.set.all();
      sets = allSets.filter(s => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    } catch {}
    // Pokémon search
    let pokemonResults = [];
    try {
      const pokeRes = await fetch(`${POKE_API}&name=${q.toLowerCase()}`);
      if (pokeRes.ok) {
        const pokeData = await pokeRes.json();
        pokemonResults = pokeData.results?.filter(p => p.name.includes(q.toLowerCase())).slice(0, 5) || [];
      }
    } catch {}
    setResults({ cards, sets, pokemon: pokemonResults });
    setLoading(false);
  }, 350);

  React.useEffect(() => {
    if (!open) return;
    doSearch(query);
  }, [query, open]);

  React.useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={close}>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto relative flex flex-col items-center"
        onClick={e => e.stopPropagation()} // Prevent modal close on input click
        tabIndex={-1} // Ensure modal is focusable
        style={{ outline: 'none' }}
      >
        <div className="w-full flex flex-col items-center mb-2">
          <input
            ref={inputRef}
            autoFocus
            className="w-full max-w-md px-5 py-3 rounded-xl border-2 border-primary focus:ring-4 focus:ring-primary/30 text-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg mb-2 outline-none transition-all duration-200 placeholder-gray-400 caret-primary"
            style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.98)' }}
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
                    <a href={`/pokedex/${card.name}`} className="text-primary font-semibold flex items-center gap-2">
                      <img src={card.images?.small} alt={card.name} className="w-8 h-8 rounded shadow" />
                      {card.name} <span className="text-xs text-gray-400">({card.set?.name})</span>
                    </a>
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
                    <a href={`/tcgsets/${set.id}`} className="text-primary font-semibold flex items-center gap-2">
                      {set.images?.logo && <img src={set.images.logo} alt={set.name} className="w-8 h-8 rounded" />}
                      {set.name}
                    </a>
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
                    <a href={`/pokedex/${poke.name}`} className="text-primary font-semibold flex items-center gap-2">
                      <span className="capitalize">{poke.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button onClick={close} className="absolute top-2 right-2 text-gray-400 hover:text-primary text-2xl font-bold bg-white/80 dark:bg-gray-800/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md" aria-label="Close search">&times;</button>
      </div>
    </div>
  ) : null;
});

export default GlobalSearchModal;
