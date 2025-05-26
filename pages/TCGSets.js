import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import pokemon from "pokemontcgsdk";

pokemon.configure({ apiKey: "7ee6ca7f-f74d-4599-87c9-3c9a95d0ebba" });

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
    <div className="container section-spacing-y-default max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Pokémon TCG Sets</h1>
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
        <div className="flex flex-wrap gap-7 justify-center">
          {filteredSets.map((set) => (
            <div
              key={set.id}
              className={`card card-padding-default flex flex-col items-center w-[230px] bg-card shadow-app-md rounded-app-lg border border-border card-hover ${selectedSetId === set.id ? 'card-selected' : ''}`}
              title={`Click to view cards in ${set.name}`}
              onClick={() => {
                setSelectedSetId(set.id);
                router.push(`/TCGSets/${set.id}`);
              }}
            >
              {set.images?.logo && (
                <img
                  src={set.images.logo}
                  alt={set.name}
                  className="mb-2 h-10 object-contain"
                  draggable="false"
                />
              )}
              <h2 className="font-semibold text-base text-center mb-1">{set.name}</h2>
              <div className="text-xs text-content-muted mb-1">
                Released: {set.releaseDate || "?"}
              </div>
              <div className="text-xs">
                Cards: <b>{set.total}</b>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filteredSets.length === 0 && (
        <div className="text-center text-content-muted mt-12">No sets found.</div>
      )}
    </div>
  );
}