// Utility functions for determining card visual effects based on rarity

export function getHolographicEffect(rarity) {
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

export function getRarityGlowClass(rarity) {
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

export function getCardBorderEffect(rarity) {
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

export function shouldShowHolographicText(rarity) {
  if (!rarity) return false;
  
  const normalizedRarity = rarity.toLowerCase();
  
  return normalizedRarity.includes('rainbow') || 
         normalizedRarity.includes('special illustration');
}

export default {
  getHolographicEffect,
  getRarityGlowClass,
  getCardBorderEffect,
  shouldShowHolographicText
};