// Type colors mapping for consistent usage across the app - with solid colors and white text like the GRASS example
export const typeColors = {
  normal: { bg: "bg-gray-400", text: "text-white", border: "border-gray-500", hover: "hover:bg-gray-500" }, // Hex: #A8A878
  fire: { bg: "bg-orange-500", text: "text-white", border: "border-orange-600", hover: "hover:bg-orange-600" }, // Hex: #F08030
  water: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600", hover: "hover:bg-blue-600" }, // Hex: #6890F0
  electric: { bg: "bg-yellow-400", text: "text-black", border: "border-yellow-500", hover: "hover:bg-yellow-500" }, // Hex: #F8D030
  grass: { bg: "bg-green-500", text: "text-white", border: "border-green-600", hover: "hover:bg-green-600" }, // Hex: #78C850
  ice: { bg: "bg-cyan-300", text: "text-black", border: "border-cyan-400", hover: "hover:bg-cyan-400" }, // Hex: #98D8D8
  fighting: { bg: "bg-red-700", text: "text-white", border: "border-red-800", hover: "hover:bg-red-800" }, // Hex: #C03028
  poison: { bg: "bg-purple-600", text: "text-white", border: "border-purple-700", hover: "hover:bg-purple-700" }, // Hex: #A040A0
  ground: { bg: "bg-yellow-600", text: "text-black", border: "border-yellow-700", hover: "hover:bg-yellow-700" }, // Hex: #E0C068
  flying: { bg: "bg-indigo-400", text: "text-white", border: "border-indigo-500", hover: "hover:bg-indigo-500" }, // Hex: #A890F0
  psychic: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600", hover: "hover:bg-pink-600" }, // Hex: #F85888
  bug: { bg: "bg-lime-600", text: "text-white", border: "border-lime-700", hover: "hover:bg-lime-700" }, // Hex: #A8B820
  rock: { bg: "bg-yellow-700", text: "text-white", border: "border-yellow-800", hover: "hover:bg-yellow-800" }, // Hex: #B8A038
  ghost: { bg: "bg-purple-800", text: "text-white", border: "border-purple-900", hover: "hover:bg-purple-900" }, // Hex: #705898
  dragon: { bg: "bg-indigo-600", text: "text-white", border: "border-indigo-700", hover: "hover:bg-indigo-700" }, // Hex: #7038F8
  dark: { bg: "bg-gray-700", text: "text-white", border: "border-gray-800", hover: "hover:bg-gray-800" }, // Hex: #705848
  steel: { bg: "bg-slate-400", text: "text-black", border: "border-slate-500", hover: "hover:bg-slate-500" }, // Hex: #B8B8D0
  fairy: { bg: "bg-pink-300", text: "text-black", border: "border-pink-400", hover: "hover:bg-pink-400" } // Hex: #EE99AC
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
