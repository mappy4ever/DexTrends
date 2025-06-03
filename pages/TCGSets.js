import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
if (!pokemonKey) {
  throw new Error(
    "NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY environment variable is not set. Please set it to your .env.local."
  );
}

pokemon.configure({ apiKey: pokemonKey });

export default function TCGSets() {
  const [sets, setSets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSets() {
      setLoading(true);
      try {
        const res = await pokemon.set.all();
        setSets(res);
      } catch (err) {
        setSets([]);
      }
      setLoading(false);
    }
    fetchSets();
  }, []);

  // Filter sets by search query
  const filteredSets = sets.filter((set) =>
    set.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 section-spacing-y-default">
      <h1 className="text-3xl font-bold text-center mb-8">Pokémon TCG Sets</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="input text-lg rounded-app-md w-80 max-w-full"
          placeholder="Search for a set (e.g., Base, Evolving Skies)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-content-muted">Loading sets...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-6">
          {filteredSets.map((set) => {
            const isBase = set.name.toLowerCase() === 'base';
            return (
              <div
                key={set.id}
                className="flex flex-col items-center cursor-pointer rounded bg-white/80 dark:bg-surface-default/90 shadow-app-md border border-border transition-transform duration-300 hover:scale-105 hover:brightness-95 hover:drop-shadow-[0_0_6px_rgba(64,64,64,0.7)] p-4 animate-fadeIn backdrop-blur-md"
                title={`Click to view cards in ${set.name}`}
                onClick={() => {
                  setSelectedSetId(set.id);
                  router.push(`/TCGSets/${set.id}`);
                }}
                tabIndex={0}
                role="button"
                aria-label={`View cards in ${set.name}`}
              >
                {set.images?.logo && (
                  <img
                    src={set.images.logo}
                    alt={set.name}
                    className="mb-2 h-24 w-auto object-contain select-none pointer-events-none"
                    draggable="false"
                  />
                )}
                {isBase ? (
                  <h2 className="font-bold text-base text-center mb-2 mt-1 drop-shadow-md">{set.name}</h2>
                ) : (
                  <span className="text-xs text-content-muted text-center mb-2 mt-1 font-normal tracking-wide">{set.name}</span>
                )}
                <div className="text-xs text-content-muted mb-1">
                  Released: {set.releaseDate || "?"}
                </div>
                <div className="text-xs">
                  Cards: <b>{set.total}</b>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filteredSets.length === 0 && (
        <div className="text-center text-content-muted mt-12">No sets found.</div>
      )}
    </div>
  );
}