// Utility to fetch and cache Pokémon TCG Pocket Data from the public JSON API
let pocketDataCache = null;

export async function fetchPocketData() {
  if (pocketDataCache) return pocketDataCache;
  const res = await fetch("https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/refs/heads/main/v4.json");
  if (!res.ok) throw new Error("Failed to fetch Pocket data");
  pocketDataCache = await res.json();
  return pocketDataCache;
}
