// Type colors mapping for consistent usage across the app
export const typeColors = {
  normal: { bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-400", hover: "hover:bg-gray-400" },
  fire: { bg: "bg-red-500", text: "text-white", border: "border-red-600", hover: "hover:bg-red-600" },
  water: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600", hover: "hover:bg-blue-600" },
  grass: { bg: "bg-green-500", text: "text-white", border: "border-green-600", hover: "hover:bg-green-600" },
  electric: { bg: "bg-yellow-400", text: "text-yellow-900", border: "border-yellow-500", hover: "hover:bg-yellow-500" },
  ice: { bg: "bg-blue-200", text: "text-blue-800", border: "border-blue-300", hover: "hover:bg-blue-300" },
  fighting: { bg: "bg-red-700", text: "text-white", border: "border-red-800", hover: "hover:bg-red-800" },
  poison: { bg: "bg-purple-500", text: "text-white", border: "border-purple-600", hover: "hover:bg-purple-600" },
  ground: { bg: "bg-yellow-600", text: "text-white", border: "border-yellow-700", hover: "hover:bg-yellow-700" },
  flying: { bg: "bg-indigo-300", text: "text-indigo-900", border: "border-indigo-400", hover: "hover:bg-indigo-400" },
  psychic: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600", hover: "hover:bg-pink-600" },
  bug: { bg: "bg-lime-500", text: "text-white", border: "border-lime-600", hover: "hover:bg-lime-600" },
  rock: { bg: "bg-yellow-800", text: "text-white", border: "border-yellow-900", hover: "hover:bg-yellow-900" },
  ghost: { bg: "bg-purple-700", text: "text-white", border: "border-purple-800", hover: "hover:bg-purple-800" },
  dragon: { bg: "bg-indigo-600", text: "text-white", border: "border-indigo-700", hover: "hover:bg-indigo-700" },
  dark: { bg: "bg-gray-800", text: "text-white", border: "border-gray-900", hover: "hover:bg-gray-900" },
  steel: { bg: "bg-gray-400", text: "text-gray-900", border: "border-gray-500", hover: "hover:bg-gray-500" },
  fairy: { bg: "bg-pink-300", text: "text-pink-900", border: "border-pink-400", hover: "hover:bg-pink-400" }
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
