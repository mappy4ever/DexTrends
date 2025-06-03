import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useSWRInfinite from "swr/infinite";
import { useSorting } from "../context/SortingContext";

const pageSize = 50;

const fetcher = (url) => fetch(url).then((res) => res.json());

function getKey(pageIndex, previousPageData) {
  if (previousPageData && !previousPageData.results.length) return null; // reached end
  const offset = pageIndex * pageSize;
  return `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`;
}

function LoadMoreTrigger({ onLoadMore }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return <div ref={ref} />;
}

export default function PokeDex() {
  const router = useRouter();
  const { sortOrder, setSortOrder } = useSorting();
  const [search, setSearch] = useState("");

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);

  // Flatten pages and fetch detailed info for each pokemon
  const [pokemonList, setPokemonList] = useState([]);
  useEffect(() => {
    async function fetchDetails() {
      if (!data) return;
      const allResults = data.flatMap((page) => page.results);
      try {
        const detailedPokemon = await Promise.all(
          allResults.map(async (poke) => {
            try {
              const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.name}`);
              if (!detailRes.ok) throw new Error('Failed fetch');
              const detailData = await detailRes.json();
              if (!detailData.is_default) {
                return null; // skip non-default forms
              }
              const types = detailData.types.map((typeInfo) => typeInfo.type.name);
              return { ...poke, types, id: detailData.id };
            } catch {
              return null; // skip failed fetches
            }
          })
        );
        setPokemonList(detailedPokemon.filter(Boolean));
      } catch {
        setPokemonList([]);
      }
    }
    fetchDetails();
  }, [data]);

  // Filter Pokémon by name (case-insensitive)
  const filteredPokemon = pokemonList.filter((poke) =>
    poke.name.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to get sprite URL from Pokémon API URL
  function getSpriteUrl(url) {
    const id = url.split("/").filter(Boolean).pop();
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  // Helper to get ID number from poke object for sorting
  function getId(poke) {
    return poke.id || parseInt(poke.url.split("/").filter(Boolean).pop());
  }

  // Helper to get primary type name safely for sorting
  function getPrimaryType(poke) {
    if (poke.types && poke.types.length > 0) {
      return poke.types[0];
    }
    return "";
  }

  // Sort filtered list based on sortOrder
  const sortedPokemon = [...filteredPokemon].sort((a, b) => {
    if (sortOrder === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortOrder === "id-asc") {
      return getId(a) - getId(b);
    }
    return 0;
  });

  const loading = !data && !error;
  const isLoadingMore = isValidating && size > 0;
  const isReachingEnd = data && data[data.length - 1]?.results.length < pageSize;

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

      {/* Sorting dropdown */}
      <div className="flex justify-center mb-6">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="input text-lg rounded-app-md w-80 max-w-full"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="id-asc">Pokédex Number (Lowest first)</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-content-muted">Loading Pokémon...</div>
      ) : error && (!data || data.length === 0) ? (
        <div className="text-center text-content-muted">Failed to load Pokémon.</div>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {sortedPokemon.map((poke) => {
              const pokeId = poke.id ? String(poke.id) : poke.url.split("/").filter(Boolean).pop();
              return (
                <div
                  key={poke.name}
                  className="flex flex-col items-center cursor-pointer rounded"
                  onClick={() => router.push(`/PokeDex/${poke.name}`)}
                  title={`View cards for ${poke.name}`}
                >
                  <img
                    src={getSpriteUrl(poke.url)}
                    alt={poke.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain transition-transform duration-300 hover:scale-150 hover:brightness-90 hover:drop-shadow-[0_0_6px_rgba(64,64,64,0.7)]"
                    draggable={false}
                  />
                  <div className="capitalize font-semibold text-center mt-2">
                    {poke.name}
                  </div>
                  <div className="mt-1 mb-2 px-3 py-1 rounded-full bg-gray-200 text-gray-800 font-semibold text-sm select-none">
                    #{pokeId.padStart(3, '0')}
                  </div>
                </div>
              );
            })}
          </div>
          {!loading && sortedPokemon.length === 0 && (
            <div className="text-center text-content-muted mt-12">No Pokémon found.</div>
          )}
          {!loading && !isReachingEnd && (
            <LoadMoreTrigger onLoadMore={() => setSize(size + 1)} />
          )}
          {isLoadingMore && (
            <div className="text-center text-content-muted mt-6">Loading more...</div>
          )}
        </>
      )}
    </div>
  );
}