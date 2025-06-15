// Type colors mapping for consistent usage across the app - with solid colors and white text like the GRASS example
export const typeColors = {
  normal: { bg: "bg-poke-normal", text: "text-white", border: "border-poke-normal", hover: "hover:bg-poke-normal" },
  fire: { bg: "bg-poke-fire", text: "text-white", border: "border-poke-fire", hover: "hover:bg-poke-fire" },
  water: { bg: "bg-poke-water", text: "text-white", border: "border-poke-water", hover: "hover:bg-poke-water" },
  electric: { bg: "bg-poke-electric", text: "text-white", border: "border-poke-electric", hover: "hover:bg-poke-electric" },
  grass: { bg: "bg-poke-grass", text: "text-white", border: "border-poke-grass", hover: "hover:bg-poke-grass" },
  ice: { bg: "bg-poke-ice", text: "text-white", border: "border-poke-ice", hover: "hover:bg-poke-ice" },
  fighting: { bg: "bg-poke-fighting", text: "text-white", border: "border-poke-fighting", hover: "hover:bg-poke-fighting" },
  poison: { bg: "bg-poke-poison", text: "text-white", border: "border-poke-poison", hover: "hover:bg-poke-poison" },
  ground: { bg: "bg-poke-ground", text: "text-white", border: "border-poke-ground", hover: "hover:bg-poke-ground" },
  flying: { bg: "bg-poke-flying", text: "text-white", border: "border-poke-flying", hover: "hover:bg-poke-flying" },
  psychic: { bg: "bg-poke-psychic", text: "text-white", border: "border-poke-psychic", hover: "hover:bg-poke-psychic" },
  bug: { bg: "bg-poke-bug", text: "text-white", border: "border-poke-bug", hover: "hover:bg-poke-bug" },
  rock: { bg: "bg-poke-rock", text: "text-white", border: "border-poke-rock", hover: "hover:bg-poke-rock" },
  ghost: { bg: "bg-poke-ghost", text: "text-white", border: "border-poke-ghost", hover: "hover:bg-poke-ghost" },
  dragon: { bg: "bg-poke-dragon", text: "text-white", border: "border-poke-dragon", hover: "hover:bg-poke-dragon" },
  dark: { bg: "bg-poke-dark", text: "text-white", border: "border-poke-dark", hover: "hover:bg-poke-dark" },
  steel: { bg: "bg-poke-steel", text: "text-white", border: "border-poke-steel", hover: "hover:bg-poke-steel" },
  fairy: { bg: "bg-poke-fairy", text: "text-white", border: "border-poke-fairy", hover: "hover:bg-poke-fairy" },
};

// Complete type effectiveness chart
export const typeEffectiveness = {
  normal: {
    weakTo: ["fighting"],
    resistantTo: [],
    immuneTo: ["ghost"]
  },
  fire: {
    weakTo: ["water", "ground", "rock"],
    resistantTo: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    immuneTo: []
  },
  water: {
    weakTo: ["electric", "grass"],
    resistantTo: ["fire", "water", "ice", "steel"],
    immuneTo: []
  },
  electric: {
    weakTo: ["ground"],
    resistantTo: ["electric", "flying", "steel"],
    immuneTo: []
  },
  grass: {
    weakTo: ["fire", "ice", "poison", "flying", "bug"],
    resistantTo: ["water", "electric", "grass", "ground"],
    immuneTo: []
  },
  ice: {
    weakTo: ["fire", "fighting", "rock", "steel"],
    resistantTo: ["ice"],
    immuneTo: []
  },
  fighting: {
    weakTo: ["flying", "psychic", "fairy"],
    resistantTo: ["bug", "rock", "dark"],
    immuneTo: []
  },
  poison: {
    weakTo: ["ground", "psychic"],
    resistantTo: ["grass", "fighting", "poison", "bug", "fairy"],
    immuneTo: []
  },
  ground: {
    weakTo: ["water", "grass", "ice"],
    resistantTo: ["poison", "rock"],
    immuneTo: ["electric"]
  },
  flying: {
    weakTo: ["electric", "ice", "rock"],
    resistantTo: ["grass", "fighting", "bug"],
    immuneTo: ["ground"]
  },
  psychic: {
    weakTo: ["bug", "ghost", "dark"],
    resistantTo: ["fighting", "psychic"],
    immuneTo: []
  },
  bug: {
    weakTo: ["fire", "flying", "rock"],
    resistantTo: ["grass", "fighting", "ground"],
    immuneTo: []
  },
  rock: {
    weakTo: ["water", "grass", "fighting", "ground", "steel"],
    resistantTo: ["normal", "fire", "poison", "flying"],
    immuneTo: []
  },
  ghost: {
    weakTo: ["ghost", "dark"],
    resistantTo: ["poison", "bug"],
    immuneTo: ["normal", "fighting"]
  },
  dragon: {
    weakTo: ["ice", "dragon", "fairy"],
    resistantTo: ["fire", "water", "electric", "grass"],
    immuneTo: []
  },
  dark: {
    weakTo: ["fighting", "bug", "fairy"],
    resistantTo: ["ghost", "dark"],
    immuneTo: ["psychic"]
  },
  steel: {
    weakTo: ["fire", "fighting", "ground"],
    resistantTo: ["normal", "grass", "ice", "flying", "psychic", "bug", "rock", "dragon", "steel", "fairy"],
    immuneTo: ["poison"]
  },
  fairy: {
    weakTo: ["poison", "steel"],
    resistantTo: ["fighting", "bug", "dark"],
    immuneTo: ["dragon"]
  }
};

// Helper to get generation for a Pokémon by its ID
export const getGeneration = (pokedexNumber) => {
  const id = parseInt(pokedexNumber);
  if (id <= 151) return 1; // Gen 1: Red, Blue, Yellow
  if (id <= 251) return 2; // Gen 2: Gold, Silver, Crystal
  if (id <= 386) return 3; // Gen 3: Ruby, Sapphire, Emerald
  if (id <= 493) return 4; // Gen 4: Diamond, Pearl, Platinum
  if (id <= 649) return 5; // Gen 5: Black, White
  if (id <= 721) return 6; // Gen 6: X, Y
  if (id <= 809) return 7; // Gen 7: Sun, Moon, Ultra Sun, Ultra Moon
  if (id <= 898) return 8; // Gen 8: Sword, Shield
  return 9; // Gen 9: Scarlet, Violet
};

// Generation names for UI display
export const generationNames = {
  1: "Generation I (Red, Blue, Yellow)",
  2: "Generation II (Gold, Silver, Crystal)",
  3: "Generation III (Ruby, Sapphire, Emerald)",
  4: "Generation IV (Diamond, Pearl, Platinum)",
  5: "Generation V (Black, White)",
  6: "Generation VI (X, Y)",
  7: "Generation VII (Sun, Moon)",
  8: "Generation VIII (Sword, Shield)",
  9: "Generation IX (Scarlet, Violet)"
};

export const getPrice = (card) => {
  if (card && card.tcgplayer && card.tcgplayer.prices) {
    const prices = card.tcgplayer.prices;
    const priceOrder = [
      "holofoil",
      "normal",
      "reverseHolofoil",
      "firstEditionHolofoil",
      "unlimitedHolofoil",
    ];
    for (const type of priceOrder) {
      if (prices[type] && prices[type].market) {
        return `$${prices[type].market.toFixed(2)}`;
      }
    }
  }
  return "N/A";
};

export const getRarityRank = (card) => {
  const rarity = card && card.rarity;
  const rarityMap = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    "Rare Holo": 4,
    "Rare Ultra": 5,
    "Rare Secret": 6,
    "Rare Holo GX": 7,
    "Rare Rainbow": 8,
    "Rare Prism Star": 9,
    "Rare Full Art": 10,
    "Rare Holo EX": 11,
    "Rare Holo V": 12,
    "Rare Holo VMAX": 13,
  };
  return rarityMap[rarity] || 0;
};

// Helper to extract ID from a PokeAPI URL (e.g., "https://pokeapi.co/api/v2/pokemon/25/")
export const extractIdFromUrl = (urlString) => {
  if (typeof urlString !== 'string' || !urlString) {
    return null;
  }
  const parts = urlString.split('/').filter(Boolean);
  return parts.pop(); // The ID is usually the last part of the path
};

export const getOfficialArtworkSpriteUrl = (pokemonId) => {
  if (!pokemonId) return "/dextrendslogo.png"; // Fallback image
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
};
