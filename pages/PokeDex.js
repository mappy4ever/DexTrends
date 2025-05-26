import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function PokeDex() {
  const [pokemonList, setPokemonList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=898");
        const data = await res.json();
        setPokemonList(data.results);
      } catch (error) {
        setPokemonList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  // Filter Pokémon by name (case-insensitive)
  const filteredPokemon = pokemonList.filter((poke) =>
    poke.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to get sprite URL from Pokémon API URL
  function getSpriteUrl(url) {
    const id = url.split("/").filter(Boolean).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  return (
    <div className="container section-spacing-y-default max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Pokédex Gallery</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="input text-lg rounded-app-md w-80 max-w-full"
          placeholder="Search Pokémon (e.g., Pikachu)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center text-content-muted">Loading Pokémon...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {filteredPokemon.map((poke) => {
            const pokeId = poke.url.split("/").filter(Boolean).pop();
            return (
              <div
                key={poke.name}
                className="relative card card-padding-0 flex flex-col items-center bg-card shadow-app-md rounded-app-lg border border-border hover:scale-110 transition-transform duration-200 cursor-pointer overflow-hidden"
                onClick={() => router.push(`/PokeDex/${poke.name}`)}
                title={`View cards for ${poke.name}`}
              >
                <div className="absolute top-1 left-2 text-xs text-content-muted font-bold z-10">
                  #{pokeId}
                </div>
                <div className="relative w-full h-24 sm:h-28 md:h-32 flex justify-center items-center overflow-hidden">
                  <img
                    src={getSpriteUrl(poke.url)}
                    alt={poke.name}
                    className="w-full h-full object-cover scale-110 transition duration-300 ease-in-out hover:brightness-75"
                    draggable={false}
                  />
                </div>
                <div className="capitalize font-semibold text-center z-10 bg-opacity-80 bg-white rounded px-2 py-1 mt-1 transition duration-200 hover:bg-opacity-100 hover:font-bold">
                  {poke.name}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filteredPokemon.length === 0 && (
        <div className="text-center text-content-muted mt-12">No Pokémon found.</div>
      )}
    </div>
  );
}