/**
 * Utility functions for determining card visual effects based on rarity
 */

type RarityType = string | null | undefined;

/**
 * Determine the holographic effect class based on card rarity
 */
export function getHolographicEffect(rarity: RarityType): string {
  if (!rarity) return '';
  
  const normalizedRarity = rarity.toLowerCase();
  
  // Ultra rare and secret cards get full holographic effects
  if (normalizedRarity.includes('secret') || 
      normalizedRarity.includes('rainbow') ||
      normalizedRarity.includes('hyper') ||
      normalizedRarity.includes('special illustration')) {
    return 'holographic-foil card-secret-glow';
  }
  
  // High-tier rare cards get subtle holographic effects
  if (normalizedRarity.includes('ultra') ||
      normalizedRarity.includes('vmax') ||
      normalizedRarity.includes('illustration rare') ||
      normalizedRarity.includes('full art')) {
    return 'card-holographic card-ultra-glow';
  }
  
  // Regular rare cards get minimal effects
  if (normalizedRarity.includes('rare') || 
      normalizedRarity.includes('holo') ||
      normalizedRarity.includes('gx') ||
      normalizedRarity.includes('ex') ||
      normalizedRarity.includes('v ')) {
    return 'card-holographic card-rare-glow';
  }
  
  // Common/Uncommon cards get standard effects
  return 'card-holographic';
}

/**
 * Get the appropriate glow class based on card rarity
 */
export function getRarityGlowClass(rarity: RarityType): string {
  if (!rarity) return '';
  
  const normalizedRarity = rarity.toLowerCase();
  
  if (normalizedRarity.includes('secret') || 
      normalizedRarity.includes('rainbow') ||
      normalizedRarity.includes('hyper')) {
    return 'card-secret-glow';
  }
  
  if (normalizedRarity.includes('ultra') ||
      normalizedRarity.includes('illustration rare')) {
    return 'card-ultra-glow';
  }
  
  if (normalizedRarity.includes('rare')) {
    return 'card-rare-glow';
  }
  
  return '';
}

/**
 * Determine if a card should have a special border effect
 */
export function getCardBorderEffect(rarity: RarityType): string {
  if (!rarity) return '';
  
  const normalizedRarity = rarity.toLowerCase();
  
  // Only apply holographic borders to the highest tier cards
  if (normalizedRarity.includes('secret') || 
      normalizedRarity.includes('rainbow') ||
      normalizedRarity.includes('special illustration')) {
    return 'holographic-border';
  }
  
  return '';
}

/**
 * Check if card should display holographic text effect
 */
export function shouldShowHolographicText(rarity: RarityType): boolean {
  if (!rarity) return false;
  
  const normalizedRarity = rarity.toLowerCase();
  
  return normalizedRarity.includes('rainbow') || 
         normalizedRarity.includes('special illustration');
}

/**
 * Get all applicable visual effects for a card
 */
export function getAllCardEffects(rarity: RarityType): {
  holographic: string;
  glow: string;
  border: string;
  holographicText: boolean;
} {
  return {
    holographic: getHolographicEffect(rarity),
    glow: getRarityGlowClass(rarity),
    border: getCardBorderEffect(rarity),
    holographicText: shouldShowHolographicText(rarity)
  };
}

/**
 * Check if a card has any visual effects
 */
export function hasVisualEffects(rarity: RarityType): boolean {
  if (!rarity) return false;
  
  const normalizedRarity = rarity.toLowerCase();
  
  return normalizedRarity.includes('rare') || 
         normalizedRarity.includes('holo') ||
         normalizedRarity.includes('ex') ||
         normalizedRarity.includes('gx') ||
         normalizedRarity.includes('v ') ||
         normalizedRarity.includes('vmax') ||
         normalizedRarity.includes('ultra') ||
         normalizedRarity.includes('secret') ||
         normalizedRarity.includes('rainbow') ||
         normalizedRarity.includes('hyper') ||
         normalizedRarity.includes('illustration');
}

export default {
  getHolographicEffect,
  getRarityGlowClass,
  getCardBorderEffect,
  shouldShowHolographicText,
  getAllCardEffects,
  hasVisualEffects
};