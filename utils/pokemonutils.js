// Type colors mapping for consistent usage across the app - with solid colors and white text like the GRASS example
export const typeColors = {
  normal: { bg: "bg-gray-400", text: "text-white", border: "border-gray-500", hover: "hover:bg-gray-500" },
  fire: { bg: "bg-red-600", text: "text-white", border: "border-red-700", hover: "hover:bg-red-700" },
  water: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600", hover: "hover:bg-blue-600" },
  grass: { bg: "bg-green-500", text: "text-white", border: "border-green-600", hover: "hover:bg-green-600" },
  electric: { bg: "bg-yellow-500", text: "text-white", border: "border-yellow-600", hover: "hover:bg-yellow-600" },
  ice: { bg: "bg-cyan-400", text: "text-white", border: "border-cyan-500", hover: "hover:bg-cyan-500" },
  fighting: { bg: "bg-red-700", text: "text-white", border: "border-red-800", hover: "hover:bg-red-800" },
  poison: { bg: "bg-purple-600", text: "text-white", border: "border-purple-700", hover: "hover:bg-purple-700" },
  ground: { bg: "bg-amber-700", text: "text-white", border: "border-amber-800", hover: "hover:bg-amber-800" },
  flying: { bg: "bg-blue-400", text: "text-white", border: "border-blue-500", hover: "hover:bg-blue-500" },
  psychic: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600", hover: "hover:bg-pink-600" },
  bug: { bg: "bg-lime-500", text: "text-white", border: "border-lime-600", hover: "hover:bg-lime-600" },
  rock: { bg: "bg-stone-500", text: "text-white", border: "border-stone-600", hover: "hover:bg-stone-600" },
  ghost: { bg: "bg-purple-700", text: "text-white", border: "border-purple-800", hover: "hover:bg-purple-800" },
  dragon: { bg: "bg-indigo-600", text: "text-white", border: "border-indigo-700", hover: "hover:bg-indigo-700" },
  dark: { bg: "bg-gray-800", text: "text-white", border: "border-gray-900", hover: "hover:bg-gray-900" },
  steel: { bg: "bg-slate-500", text: "text-white", border: "border-slate-600", hover: "hover:bg-slate-600" },
  fairy: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600", hover: "hover:bg-pink-600" }
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
