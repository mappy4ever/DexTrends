// Soft Pokemon theme configuration
export const pokemonTheme = {
  // Soft gradient colors (pokeball inspired)
  gradients: {
    primary: "from-red-400 to-pink-400", // Soft pokeball red
    secondary: "from-gray-100 to-gray-200", // Soft grey
    accent: "from-pink-300 to-red-300", // Soft pink-red
    soft: "from-gray-50 to-gray-100", // Very soft grey
    
    // Type-specific soft gradients
    fire: "from-orange-300 to-red-300",
    water: "from-blue-300 to-cyan-300",
    grass: "from-green-300 to-emerald-300",
    electric: "from-yellow-300 to-amber-300",
    psychic: "from-purple-300 to-pink-300",
    ice: "from-cyan-300 to-blue-300",
    dragon: "from-indigo-300 to-purple-300",
    dark: "from-gray-600 to-gray-700",
    fairy: "from-pink-300 to-rose-300",
    normal: "from-gray-300 to-gray-400",
    fighting: "from-red-400 to-orange-400",
    poison: "from-purple-400 to-pink-400",
    ground: "from-yellow-400 to-amber-400",
    flying: "from-blue-300 to-indigo-300",
    bug: "from-green-400 to-lime-400",
    rock: "from-yellow-500 to-amber-500",
    ghost: "from-purple-400 to-indigo-400",
    steel: "from-gray-400 to-blue-400"
  },
  
  // Soft colors
  colors: {
    primary: "text-red-400", // Soft pokeball red
    secondary: "text-gray-600", // Soft grey
    accent: "text-pink-400", // Soft pink
    muted: "text-gray-500",
    
    // Background colors
    bgPrimary: "bg-red-50",
    bgSecondary: "bg-gray-50",
    bgAccent: "bg-pink-50",
    
    // Border colors
    borderLight: "border-gray-200",
    borderMedium: "border-gray-300",
    borderAccent: "border-pink-200"
  },
  
  // Soft shadows
  shadows: {
    soft: "shadow-sm",
    medium: "shadow-md",
    large: "shadow-lg",
    colored: "shadow-lg shadow-pink-500/10"
  },
  
  // Button styles
  buttons: {
    primary: "bg-gradient-to-r from-red-400 to-pink-400 text-white hover:from-red-500 hover:to-pink-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    soft: "bg-white text-red-400 border border-red-200 hover:bg-red-50"
  },
  
  // Card styles
  cards: {
    base: "rounded-xl bg-white shadow-sm border border-gray-100",
    hover: "hover:shadow-md hover:border-pink-200 transition-all duration-300",
    gradient: "bg-gradient-to-br from-white to-gray-50"
  }
};

// Helper function to get soft type gradient
export const getSoftTypeGradient = (type) => {
  return pokemonTheme.gradients[type] || pokemonTheme.gradients.normal;
};

// Helper function to get pokeball-inspired gradient
export const getPokeballGradient = (intensity = "medium") => {
  const gradients = {
    light: "from-red-300 via-white to-gray-100",
    medium: "from-red-400 via-white to-gray-200",
    strong: "from-red-500 via-white to-gray-300"
  };
  return gradients[intensity] || gradients.medium;
};