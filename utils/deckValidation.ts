// Shared deck validation utilities for both Pocket and Standard TCG formats

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  stats: DeckStats;
}

export interface DeckStats {
  totalCards: number;
  pokemon: number;
  trainers: number;
  energy: number;
  basicPokemon: number;
  typeDistribution: Record<string, number>;
}

export interface DeckCard {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  evolvesFrom?: string;
  quantity: number;
  health?: string;
  type?: string;
}

export type DeckFormat = 'pocket' | 'standard' | 'expanded' | 'unlimited';

// Format-specific rules
const FORMAT_RULES = {
  pocket: {
    deckSize: 20,
    maxCopies: 2,
    minBasicPokemon: 1,
    recommendedEnergy: { min: 0, max: 0 }, // Pocket doesn't use energy cards
    recommendedTrainers: { min: 4, max: 8 }
  },
  standard: {
    deckSize: 60,
    maxCopies: 4,
    minBasicPokemon: 1,
    recommendedEnergy: { min: 8, max: 15 },
    recommendedTrainers: { min: 20, max: 35 }
  },
  expanded: {
    deckSize: 60,
    maxCopies: 4,
    minBasicPokemon: 1,
    recommendedEnergy: { min: 8, max: 15 },
    recommendedTrainers: { min: 20, max: 35 }
  },
  unlimited: {
    deckSize: 60,
    maxCopies: 4,
    minBasicPokemon: 1,
    recommendedEnergy: { min: 8, max: 15 },
    recommendedTrainers: { min: 20, max: 35 }
  }
};

// Validate deck based on format
export function validateDeck(
  cards: DeckCard[], 
  format: DeckFormat = 'standard'
): ValidationResult {
  const rules = FORMAT_RULES[format];
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Calculate stats
  const stats = calculateDeckStats(cards);
  
  // Validate deck size
  if (stats.totalCards !== rules.deckSize) {
    errors.push(`Deck must contain exactly ${rules.deckSize} cards (currently ${stats.totalCards})`);
  }
  
  // Validate card quantities
  const cardCounts = new Map<string, number>();
  cards.forEach(card => {
    const count = cardCounts.get(card.name) || 0;
    cardCounts.set(card.name, count + card.quantity);
  });
  
  cardCounts.forEach((count, cardName) => {
    if (cardName !== 'Basic Energy' && count > rules.maxCopies) {
      errors.push(`${cardName}: Maximum ${rules.maxCopies} copies allowed (currently ${count})`);
    }
  });
  
  // Validate basic Pokemon requirement
  if (stats.basicPokemon === 0) {
    errors.push('Deck must contain at least one Basic Pokémon');
  }
  
  // Format-specific validations
  if (format === 'pocket') {
    validatePocketDeck(cards, stats, warnings, suggestions);
  } else {
    validateStandardDeck(cards, stats, warnings, suggestions, rules);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    stats
  };
}

// Calculate deck statistics
export function calculateDeckStats(cards: DeckCard[]): DeckStats {
  const stats: DeckStats = {
    totalCards: 0,
    pokemon: 0,
    trainers: 0,
    energy: 0,
    basicPokemon: 0,
    typeDistribution: {}
  };
  
  cards.forEach(card => {
    stats.totalCards += card.quantity;
    
    if (card.supertype === 'Pokémon' || card.type) {
      stats.pokemon += card.quantity;
      
      // Count basic Pokemon
      if (!card.evolvesFrom) {
        stats.basicPokemon += card.quantity;
      }
      
      // Track type distribution
      const types = card.types || (card.type ? [card.type] : []);
      types.forEach(type => {
        stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + card.quantity;
      });
    } else if (card.supertype === 'Trainer') {
      stats.trainers += card.quantity;
    } else if (card.supertype === 'Energy') {
      stats.energy += card.quantity;
    }
  });
  
  return stats;
}

// Pocket-specific validation
function validatePocketDeck(
  cards: DeckCard[], 
  stats: DeckStats, 
  warnings: string[], 
  suggestions: string[]
): void {
  // Check for good balance
  if (stats.pokemon < 8) {
    warnings.push('Consider adding more Pokémon cards for consistency');
  }
  
  if (stats.trainers < 4) {
    suggestions.push('Add support cards like Professor\'s Research or Poké Ball');
  }
  
  // Check for evolution lines
  const evolutionLines = checkEvolutionLines(cards);
  evolutionLines.forEach(line => {
    if (!line.complete) {
      warnings.push(`Incomplete evolution line: ${line.missing.join(' → ')}`);
    }
  });
  
  // Type diversity check
  const typeCount = Object.keys(stats.typeDistribution).length;
  if (typeCount > 2) {
    warnings.push('Consider focusing on 1-2 types for better consistency');
  }
}

// Standard TCG validation
function validateStandardDeck(
  cards: DeckCard[], 
  stats: DeckStats, 
  warnings: string[], 
  suggestions: string[],
  rules: typeof FORMAT_RULES.standard
): void {
  // Energy recommendations
  if (stats.energy < rules.recommendedEnergy.min) {
    warnings.push(`Consider adding more Energy cards (recommended: ${rules.recommendedEnergy.min}-${rules.recommendedEnergy.max})`);
  }
  if (stats.energy > rules.recommendedEnergy.max) {
    warnings.push('Too many Energy cards might slow down your deck');
  }
  
  // Trainer recommendations
  if (stats.trainers < rules.recommendedTrainers.min) {
    warnings.push(`Consider adding more Trainer cards for consistency (recommended: ${rules.recommendedTrainers.min}-${rules.recommendedTrainers.max})`);
  }
  
  // Check for essential trainers
  const trainerCards = cards.filter(c => c.supertype === 'Trainer');
  const hasDrawSupport = trainerCards.some(c => 
    c.name.includes('Professor') || 
    c.name.includes('Research') || 
    c.name.includes('Marnie')
  );
  
  if (!hasDrawSupport) {
    suggestions.push('Add draw support cards like Professor\'s Research or Marnie');
  }
  
  // Check for Pokemon search
  const hasSearch = trainerCards.some(c => 
    c.name.includes('Ball') || 
    c.name.includes('Communication') ||
    c.name.includes('Radar')
  );
  
  if (!hasSearch) {
    suggestions.push('Add Pokémon search cards like Quick Ball or Ultra Ball');
  }
}

// Check evolution line completeness
interface EvolutionLine {
  complete: boolean;
  missing: string[];
}

function checkEvolutionLines(cards: DeckCard[]): EvolutionLine[] {
  const lines: EvolutionLine[] = [];
  const cardMap = new Map(cards.map(c => [c.name, c]));
  
  cards.forEach(card => {
    if (card.evolvesFrom) {
      const basicForm = cardMap.get(card.evolvesFrom);
      if (!basicForm || basicForm.quantity === 0) {
        lines.push({
          complete: false,
          missing: [card.evolvesFrom, card.name]
        });
      }
    }
  });
  
  return lines;
}

// Get deck archetype based on cards
export function identifyDeckArchetype(cards: DeckCard[]): string {
  // Look for key Pokemon that define archetypes
  const keyPokemon = cards
    .filter(c => c.supertype === 'Pokémon' || c.type)
    .sort((a, b) => b.quantity - a.quantity);
  
  if (keyPokemon.length === 0) return 'Unknown';
  
  // Return the most prominent Pokemon as the archetype
  const mainPokemon = keyPokemon[0].name;
  const mainType = keyPokemon[0].types?.[0] || keyPokemon[0].type || '';
  
  return `${mainPokemon} ${mainType}`;
}

// Get deck suggestions based on current composition
export function getDeckSuggestions(
  cards: DeckCard[], 
  format: DeckFormat = 'standard'
): string[] {
  const suggestions: string[] = [];
  const stats = calculateDeckStats(cards);
  const archetype = identifyDeckArchetype(cards);
  
  // Type-specific suggestions
  Object.entries(stats.typeDistribution).forEach(([type, count]) => {
    if (count >= 4) {
      suggestions.push(`Consider adding ${type}-type support cards`);
    }
  });
  
  // Format-specific suggestions
  if (format === 'pocket') {
    if (!cards.some(c => c.name.includes('Poké Ball'))) {
      suggestions.push('Add Poké Ball for consistency');
    }
    if (!cards.some(c => c.name.includes('Professor'))) {
      suggestions.push('Add Professor\'s Research for draw power');
    }
  } else {
    // Standard format suggestions
    if (stats.pokemon > 20) {
      suggestions.push('Consider reducing Pokémon count for more trainer cards');
    }
    if (stats.energy < 10 && stats.typeDistribution && Object.keys(stats.typeDistribution).length > 1) {
      suggestions.push('Multi-type decks may need more energy');
    }
  }
  
  return suggestions;
}