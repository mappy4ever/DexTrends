// TCG Rarity symbols and data from Bulbapedia
// https://bulbapedia.bulbagarden.net/wiki/Rarity

export interface RarityData {
  symbol: string;
  name: string;
  description: string;
  image: string;
}

export interface PocketRarity extends RarityData {
  diamonds?: number;
  stars?: number;
  special?: string;
}

export interface RarityMap {
  [key: string]: RarityData;
}

export interface PocketRarityMap {
  [key: string]: PocketRarity;
}

export interface RarityDisplay {
  symbol: string;
  name: string;
  image: string;
  description: string;
  color: string;
}

export const tcgRarityData: RarityMap = {
  // Standard rarities
  common: {
    symbol: "●",
    name: "Common",
    description: "Basic cards that are easy to find",
    image: "https://archives.bulbagarden.net/media/upload/e/e0/SetSymbolCommon.png"
  },
  uncommon: {
    symbol: "◆",
    name: "Uncommon",
    description: "Less common than basic cards",
    image: "https://archives.bulbagarden.net/media/upload/0/05/SetSymbolUncommon.png"
  },
  rare: {
    symbol: "★",
    name: "Rare",
    description: "Harder to find cards",
    image: "https://archives.bulbagarden.net/media/upload/7/7f/SetSymbolRare.png"
  },
  
  // Holo variations
  rareHolo: {
    symbol: "★H",
    name: "Rare Holo",
    description: "Rare cards with holographic foil",
    image: "https://archives.bulbagarden.net/media/upload/7/7f/SetSymbolRare.png"
  },
  
  // Ultra rare variations
  ultraRare: {
    symbol: "★★",
    name: "Ultra Rare",
    description: "Very rare cards including EX, GX, V",
    image: "https://archives.bulbagarden.net/media/upload/2/24/SetSymbolUltra.png"
  },
  secretRare: {
    symbol: "★★★",
    name: "Secret Rare",
    description: "Cards numbered beyond the set total",
    image: "https://archives.bulbagarden.net/media/upload/c/c5/SetSymbolSecret.png"
  },
  
  // Special rarities
  promo: {
    symbol: "★P",
    name: "Promo",
    description: "Promotional cards from events",
    image: "https://archives.bulbagarden.net/media/upload/e/e7/SetSymbolPromo.png"
  },
  amazingRare: {
    symbol: "★A",
    name: "Amazing Rare",
    description: "Special textured cards from Vivid Voltage era",
    image: "https://archives.bulbagarden.net/media/upload/b/b0/SetSymbolAmazing.png"
  },
  
  // Modern rarities
  radiantRare: {
    symbol: "★R",
    name: "Radiant Rare",
    description: "Special shiny Pokémon cards",
    image: "https://archives.bulbagarden.net/media/upload/c/c5/SetSymbolSecret.png"
  },
  illustration: {
    symbol: "★I",
    name: "Illustration Rare",
    description: "Full art illustration cards",
    image: "https://archives.bulbagarden.net/media/upload/0/09/SetSymbolIllustration.png"
  },
  specialIllustration: {
    symbol: "★SI",
    name: "Special Illustration Rare",
    description: "Premium full art cards",
    image: "https://archives.bulbagarden.net/media/upload/0/0a/SetSymbolSpecial.png"
  },
  hyperRare: {
    symbol: "★H",
    name: "Hyper Rare",
    description: "Gold or rainbow rare cards",
    image: "https://archives.bulbagarden.net/media/upload/c/c5/SetSymbolSecret.png"
  },
  
  // Classic rarities
  shiningRare: {
    symbol: "✦",
    name: "Shining",
    description: "Classic shining Pokémon cards",
    image: "https://archives.bulbagarden.net/media/upload/7/7c/SetSymbolShining.png"
  },
  ace: {
    symbol: "ACE",
    name: "ACE SPEC",
    description: "Powerful trainer cards limited to one per deck",
    image: "https://archives.bulbagarden.net/media/upload/2/2e/SetSymbolACE.png"
  }
};

// Pokemon TCG Pocket specific rarities
export const pocketRarityData: PocketRarityMap = {
  common: {
    symbol: "●",
    name: "Common",
    diamonds: 1,
    description: "1 Diamond - Basic cards",
    image: "https://archives.bulbagarden.net/media/upload/8/88/TCG_Pocket_Common.png"
  },
  uncommon: {
    symbol: "◆◆",
    name: "Uncommon", 
    diamonds: 2,
    description: "2 Diamonds - Less common cards",
    image: "https://archives.bulbagarden.net/media/upload/4/4a/TCG_Pocket_Uncommon.png"
  },
  rare: {
    symbol: "◆◆◆",
    name: "Rare",
    diamonds: 3,
    description: "3 Diamonds - Rare cards",
    image: "https://archives.bulbagarden.net/media/upload/9/95/TCG_Pocket_Rare.png"
  },
  doubleRare: {
    symbol: "◆◆◆◆",
    name: "Double Rare",
    diamonds: 4,
    description: "4 Diamonds - Very rare cards",
    image: "https://archives.bulbagarden.net/media/upload/f/fe/TCG_Pocket_Double_rare.png"
  },
  artRare: {
    symbol: "★",
    name: "Art Rare",
    stars: 1,
    description: "1 Star - Special art cards",
    image: "https://archives.bulbagarden.net/media/upload/4/43/TCG_Pocket_Art_rare.png"
  },
  superRare: {
    symbol: "★★",
    name: "Super Rare",
    stars: 2,
    description: "2 Stars - Super rare cards including ex",
    image: "https://archives.bulbagarden.net/media/upload/c/cb/TCG_Pocket_Super_rare.png"
  },
  immersiveRare: {
    symbol: "★★★",
    name: "Immersive Rare",
    stars: 3,
    description: "3 Stars - Full immersive art cards",
    image: "https://archives.bulbagarden.net/media/upload/1/17/TCG_Pocket_Immersive_rare.png"
  },
  crown: {
    symbol: "👑",
    name: "Crown Rare",
    special: "crown",
    description: "Crown - Ultra rare golden cards",
    image: "https://archives.bulbagarden.net/media/upload/3/3e/TCG_Pocket_Crown_rare.png"
  }
};

// Helper function to get rarity display
export const getRarityDisplay = (rarity: string, isPocket: boolean = false): RarityDisplay => {
  const rarityMap = isPocket ? pocketRarityData : tcgRarityData;
  const data = rarityMap[rarity] || rarityMap.common;
  
  return {
    symbol: data.symbol,
    name: data.name,
    image: data.image,
    description: data.description,
    color: getRarityColor(rarity, isPocket)
  };
};

// Get color for rarity
export const getRarityColor = (rarity: string, isPocket: boolean = false): string => {
  if (isPocket) {
    // Pocket rarities: diamonds are SILVER, stars and crown are GOLD
    switch(rarity) {
      // Diamond rarities - SILVER (stone/gray)
      case 'common': return 'text-stone-400';      // 1 diamond
      case 'uncommon': return 'text-stone-400';    // 2 diamonds
      case 'rare': return 'text-stone-400';        // 3 diamonds
      case 'doubleRare': return 'text-stone-400';  // 4 diamonds
      // Star rarities - GOLD (amber)
      case 'artRare': return 'text-amber-500';     // 1 star
      case 'superRare': return 'text-amber-500';   // 2 stars
      case 'immersiveRare': return 'text-amber-500'; // 3 stars (immersive)
      // Crown - GOLD
      case 'crown': return 'text-amber-500';
      default: return 'text-stone-400';
    }
  } else {
    switch(rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-yellow-400';
      case 'rareHolo': return 'text-yellow-500';
      case 'ultraRare': return 'text-red-500';
      case 'secretRare': return 'text-purple-500';
      case 'promo': return 'text-blue-500';
      case 'amazingRare': return 'text-rainbow-500';
      case 'radiantRare': return 'text-yellow-600';
      case 'illustration': return 'text-blue-600';
      case 'specialIllustration': return 'text-purple-600';
      case 'hyperRare': return 'text-yellow-600';
      case 'shiningRare': return 'text-cyan-400';
      case 'ace': return 'text-red-600';
      default: return 'text-gray-400';
    }
  }
};