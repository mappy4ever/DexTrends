// TCG Rarity Symbol Mapping Utility
// Maps card rarities to their corresponding symbol images

export const raritySymbolMap: Record<string, string> = {
  // Common tiers
  'Common': '/images/TCG-rarity/Rarity_C.png',
  'Uncommon': '/images/TCG-rarity/Rarity_U.png',
  'Rare': '/images/TCG-rarity/Rarity_R.png',
  'Rare Holo': '/images/TCG-rarity/Rarity_Rare_Holo.png',
  
  // Ultra rare variants
  'Rare Ultra': '/images/TCG-rarity/Rarity_UR.png',
  'Rare Secret': '/images/TCG-rarity/Rarity_SR.png',
  'Rare Rainbow': '/images/TCG-rarity/Rarity_RR.png',
  'Double Rare': '/images/TCG-rarity/120px-Rarity_Double_Rare.png',
  'Hyper Rare': '/images/TCG-rarity/Rarity_HR.png',
  
  // Special variants
  'Special Illustration Rare': '/images/TCG-rarity/120px-Rarity_Special_Illustration_Rare.png',
  'Shiny Rare': '/images/TCG-rarity/120px-Rarity_ShinyRare.png',
  'Shiny Ultra Rare': '/images/TCG-rarity/120px-Rarity_Shiny_Ultra_Rare.png',
  'Radiant Rare': '/images/TCG-rarity/Rarity_Radiant_Rare.png',
  'Trainer Gallery Rare': '/images/TCG-rarity/Rarity_TR.png',
  'Trainer Gallery Holo Rare': '/images/TCG-rarity/Rarity_Trainer_Gallery_Holo_Rare.png',
  'Trainer Gallery Ultra Rare': '/images/TCG-rarity/Rarity_Trainer_Gallery_Ultra_Rare.png',
  'Trainer Gallery Secret Rare': '/images/TCG-rarity/Rarity_Trainer_Gallery_Secret_Rare.png',
  
  // V/VMAX/VSTAR
  'Rare Holo V': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Holo VMAX': '/images/TCG-rarity/Rarity_Holo_Rare_VMAX.png',
  'Rare Holo VSTAR': '/images/TCG-rarity/Rarity_Holo_Rare_VSTAR.png',
  'Rare Ultra V': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Ultra VMAX': '/images/TCG-rarity/Rarity_Holo_Rare_VMAX.png',
  
  // GX/EX variants
  'Rare Holo GX': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Holo EX': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Ultra GX': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Ultra EX': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Shiny GX': '/images/TCG-rarity/Rarity_Rare_Shiny_GX.png',
  
  // Additional rarities
  'Rare ACE': '/images/TCG-rarity/Rarity_Rare_ACE.png',
  'Rare BREAK': '/images/TCG-rarity/Rarity_Rare_BREAK.png',
  'Rare Prime': '/images/TCG-rarity/Rarity_Rare_Prime.png',
  'Rare Prism Star': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Rare Full Art': '/images/TCG-rarity/Rarity_Rare_Ultra.png',
  'Common Holo': '/images/TCG-rarity/Rarity_Common_Holo.png',
  'Uncommon Holo': '/images/TCG-rarity/Rarity_Uncommon_Holo.png',
  'Promo': '/images/TCG-rarity/Rarity_PR.png',
  'Classic Collection': '/images/TCG-rarity/Rarity_Classic_Collection.png',
  
  // Galarian Gallery
  'Galarian Gallery Holo Rare': '/images/TCG-rarity/Rarity_Galarian_Gallery_Holo_Rare.png',
  'Galarian Gallery Ultra Rare': '/images/TCG-rarity/Rarity_Galarian_Gallery_Ultra_Rare.png',
  'Galarian Gallery Secret Rare': '/images/TCG-rarity/Rarity_Galarian_Gallery_Secret_Rare.png',
  
  // Default fallback
  'default': '/images/TCG-rarity/Rarity_C.png'
};

/**
 * Get the appropriate rarity symbol image path for a given rarity
 */
export function getRaritySymbol(rarity: string | undefined): string {
  if (!rarity) return raritySymbolMap.default;
  
  // Direct match
  if (raritySymbolMap[rarity]) {
    return raritySymbolMap[rarity];
  }
  
  // Try to find a partial match for edge cases
  const rarityLower = rarity.toLowerCase();
  for (const [key, value] of Object.entries(raritySymbolMap)) {
    if (key.toLowerCase() === rarityLower) {
      return value;
    }
  }
  
  return raritySymbolMap.default;
}

/**
 * Get the rarity tier for styling purposes
 */
export function getRarityTier(rarity: string | undefined): 'common' | 'uncommon' | 'rare' | 'ultra' | 'secret' {
  if (!rarity) return 'common';
  
  const lower = rarity.toLowerCase();
  
  // Secret tier (highest)
  if (lower.includes('secret') || lower.includes('rainbow')) return 'secret';
  
  // Ultra tier
  if (lower.includes('ultra') || lower.includes('hyper') || 
      lower.includes('illustration') || lower.includes('full art') ||
      lower.includes('shiny') || lower.includes('radiant')) return 'ultra';
  
  // Rare tier
  if (lower.includes('rare')) return 'rare';
  
  // Uncommon tier
  if (lower.includes('uncommon')) return 'uncommon';
  
  // Common tier (default)
  return 'common';
}

/**
 * Get the appropriate glow/shadow effect class for a rarity
 */
export function getRarityGlowClass(rarity: string | undefined): string {
  const tier = getRarityTier(rarity);
  
  switch (tier) {
    case 'secret':
      return 'shadow-lg shadow-purple-400/50 hover:shadow-purple-500/70';
    case 'ultra':
      return 'shadow-lg shadow-yellow-400/50 hover:shadow-yellow-500/70';
    case 'rare':
      return 'shadow-md shadow-blue-300/50 hover:shadow-blue-400/70';
    case 'uncommon':
      return 'shadow-sm shadow-green-300/30 hover:shadow-green-400/50';
    default:
      return '';
  }
}

/**
 * Check if a card should have holographic effects
 */
export function shouldHaveHolographicEffect(rarity: string | undefined): boolean {
  if (!rarity) return false;
  
  const tier = getRarityTier(rarity);
  return tier === 'ultra' || tier === 'secret';
}

/**
 * Get animation class for rarity
 */
export function getRarityAnimationClass(rarity: string | undefined): string {
  const tier = getRarityTier(rarity);
  
  switch (tier) {
    case 'secret':
      return 'animate-rainbow-glow';
    case 'ultra':
      return 'animate-pulse-glow';
    case 'rare':
      return 'animate-subtle-shimmer';
    default:
      return '';
  }
}