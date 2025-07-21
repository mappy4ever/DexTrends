// Meta game analysis utilities for deck evaluation

import { DeckCard, DeckFormat, calculateDeckStats } from './deckValidation';

export interface MetaAnalysis {
  score: number;
  tier: string;
  archetype: string;
  dominantTypes: [string, number][];
  strengths: string[];
  weaknesses: string[];
  matchups: Matchup[];
  popularity: number;
  consistency: number;
}

export interface Matchup {
  archetype: string;
  winRate: number;
  difficulty: 'favorable' | 'even' | 'unfavorable';
}

// Popular archetypes for matchup analysis
const POCKET_ARCHETYPES = [
  { name: 'Pikachu EX', types: ['Electric'], tier: 1 },
  { name: 'Mewtwo EX', types: ['Psychic'], tier: 1 },
  { name: 'Charizard EX', types: ['Fire'], tier: 1 },
  { name: 'Starmie EX', types: ['Water'], tier: 2 },
  { name: 'Venusaur EX', types: ['Grass'], tier: 2 },
  { name: 'Articuno EX', types: ['Water'], tier: 2 },
  { name: 'Machamp EX', types: ['Fighting'], tier: 3 },
  { name: 'Arcanine EX', types: ['Fire'], tier: 3 }
];

const STANDARD_ARCHETYPES = [
  { name: 'Charizard ex', types: ['Fire'], tier: 1 },
  { name: 'Miraidon ex', types: ['Electric'], tier: 1 },
  { name: 'Gardevoir ex', types: ['Psychic'], tier: 1 },
  { name: 'Lost Box', types: ['Various'], tier: 1 },
  { name: 'Lugia VSTAR', types: ['Colorless'], tier: 2 },
  { name: 'Mew VMAX', types: ['Psychic'], tier: 2 },
  { name: 'Arceus VSTAR', types: ['Colorless'], tier: 2 },
  { name: 'Palkia VSTAR', types: ['Water'], tier: 3 }
];

// Type effectiveness chart
const TYPE_MATCHUPS: Record<string, { strong: string[], weak: string[] }> = {
  'Fire': { strong: ['Grass', 'Metal'], weak: ['Water'] },
  'Water': { strong: ['Fire'], weak: ['Electric', 'Grass'] },
  'Grass': { strong: ['Water'], weak: ['Fire'] },
  'Electric': { strong: ['Water'], weak: [] },
  'Psychic': { strong: ['Fighting'], weak: ['Dark'] },
  'Fighting': { strong: ['Dark'], weak: ['Psychic'] },
  'Dark': { strong: ['Psychic'], weak: ['Fighting'] },
  'Metal': { strong: [], weak: ['Fire'] },
  'Dragon': { strong: ['Dragon'], weak: ['Dragon'] },
  'Fairy': { strong: ['Dragon', 'Dark', 'Fighting'], weak: ['Metal'] },
  'Colorless': { strong: [], weak: ['Fighting'] }
};

// Analyze deck for meta game viability
export function analyzeDeckMeta(
  cards: DeckCard[], 
  format: DeckFormat = 'standard'
): MetaAnalysis {
  const stats = calculateDeckStats(cards);
  const archetypes = format === 'pocket' ? POCKET_ARCHETYPES : STANDARD_ARCHETYPES;
  
  // Identify deck archetype
  const archetype = identifyArchetype(cards);
  
  // Calculate dominant types
  const dominantTypes = Object.entries(stats.typeDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2) as [string, number][];
  
  // Calculate meta score
  const { score, tier } = calculateMetaScore(cards, stats, format);
  
  // Analyze strengths and weaknesses
  const { strengths, weaknesses } = analyzeStrengthsWeaknesses(cards, dominantTypes, format);
  
  // Calculate matchups
  const matchups = calculateMatchups(dominantTypes, archetypes);
  
  // Calculate consistency rating
  const consistency = calculateConsistency(cards, stats, format);
  
  // Estimate popularity (mock data)
  const popularity = estimatePopularity(archetype, tier);
  
  return {
    score,
    tier,
    archetype,
    dominantTypes,
    strengths,
    weaknesses,
    matchups,
    popularity,
    consistency
  };
}

// Identify deck archetype based on key cards
function identifyArchetype(cards: DeckCard[]): string {
  // Look for EX/ex/VSTAR/VMAX Pokemon
  const keyCards = cards.filter(c => 
    c.name.includes(' EX') || 
    c.name.includes(' ex') || 
    c.name.includes(' VSTAR') || 
    c.name.includes(' VMAX') ||
    c.name.includes(' V')
  );
  
  if (keyCards.length > 0) {
    // Return the most prominent special card
    const mainCard = keyCards.reduce((prev, curr) => 
      curr.quantity > prev.quantity ? curr : prev
    );
    return mainCard.name;
  }
  
  // Fallback to most common Pokemon
  const pokemon = cards
    .filter(c => c.supertype === 'Pokémon' || c.type)
    .sort((a, b) => b.quantity - a.quantity);
  
  return pokemon.length > 0 ? pokemon[0].name : 'Unknown';
}

// Calculate meta score and tier
function calculateMetaScore(
  cards: DeckCard[], 
  stats: any, 
  format: DeckFormat
): { score: number, tier: string } {
  let score = 50; // Base score
  
  // Card rarity bonus
  const hasEX = cards.some(c => c.name.includes(' EX') || c.name.includes(' ex'));
  const hasVSTAR = cards.some(c => c.name.includes(' VSTAR'));
  const hasVMAX = cards.some(c => c.name.includes(' VMAX'));
  
  if (hasEX) score += 15;
  if (hasVSTAR) score += 20;
  if (hasVMAX) score += 18;
  
  // Balance bonus
  if (format === 'pocket') {
    const pokemonRatio = stats.pokemon / stats.totalCards;
    if (pokemonRatio >= 0.4 && pokemonRatio <= 0.6) score += 10;
  } else {
    const trainerRatio = stats.trainers / stats.totalCards;
    if (trainerRatio >= 0.33 && trainerRatio <= 0.5) score += 15;
  }
  
  // Type focus bonus
  const typeCount = Object.keys(stats.typeDistribution).length;
  if (typeCount === 1) score += 15;
  else if (typeCount === 2) score += 10;
  else if (typeCount > 3) score -= 10;
  
  // Evolution line bonus
  const hasEvolutions = cards.some(c => c.evolvesFrom);
  if (hasEvolutions) score += 5;
  
  // Determine tier
  let tier = 'Tier 3';
  if (score >= 85) tier = 'Tier 1';
  else if (score >= 70) tier = 'Tier 2';
  
  return { score: Math.min(100, Math.max(0, score)), tier };
}

// Analyze deck strengths and weaknesses
function analyzeStrengthsWeaknesses(
  cards: DeckCard[], 
  dominantTypes: [string, number][],
  format: DeckFormat
): { strengths: string[], weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Type-based analysis
  if (dominantTypes.length > 0) {
    const mainType = dominantTypes[0][0];
    const typeMatchup = TYPE_MATCHUPS[mainType];
    
    if (typeMatchup) {
      if (typeMatchup.strong.length > 0) {
        strengths.push(`Strong against ${typeMatchup.strong.join(', ')} types`);
      }
      if (typeMatchup.weak.length > 0) {
        weaknesses.push(`Weak to ${typeMatchup.weak.join(', ')} types`);
      }
    }
  }
  
  // Card synergy analysis
  const hasDrawPower = cards.some(c => 
    c.name.includes('Professor') || 
    c.name.includes('Research') ||
    c.name.includes('Draw')
  );
  
  if (hasDrawPower) {
    strengths.push('Good draw consistency');
  } else {
    weaknesses.push('Limited draw power');
  }
  
  // Speed analysis
  const hasAcceleration = cards.some(c => 
    c.name.includes('Ball') || 
    c.name.includes('Quick') ||
    c.name.includes('Turbo')
  );
  
  if (hasAcceleration) {
    strengths.push('Fast setup potential');
  }
  
  // Format-specific analysis
  if (format === 'pocket') {
    const avgHP = calculateAverageHP(cards);
    if (avgHP > 100) strengths.push('High HP Pokemon');
    if (avgHP < 70) weaknesses.push('Low HP Pokemon');
  }
  
  return { strengths, weaknesses };
}

// Calculate matchups against popular decks
function calculateMatchups(
  dominantTypes: [string, number][],
  archetypes: typeof POCKET_ARCHETYPES
): Matchup[] {
  const matchups: Matchup[] = [];
  const mainType = dominantTypes.length > 0 ? dominantTypes[0][0] : '';
  const typeMatchup = TYPE_MATCHUPS[mainType] || { strong: [], weak: [] };
  
  archetypes.slice(0, 5).forEach(archetype => {
    let winRate = 50; // Base win rate
    let difficulty: Matchup['difficulty'] = 'even';
    
    // Type advantage/disadvantage
    archetype.types.forEach(oppType => {
      if (typeMatchup.strong.includes(oppType)) {
        winRate += 15;
      }
      if (typeMatchup.weak.includes(oppType)) {
        winRate -= 15;
      }
    });
    
    // Tier difference
    const tierDiff = archetype.tier - 2; // Assuming our deck is tier 2
    winRate -= tierDiff * 10;
    
    // Add randomness for realism
    winRate += Math.floor(Math.random() * 20) - 10;
    winRate = Math.max(20, Math.min(80, winRate));
    
    // Determine difficulty
    if (winRate >= 60) difficulty = 'favorable';
    else if (winRate <= 40) difficulty = 'unfavorable';
    
    matchups.push({
      archetype: archetype.name,
      winRate,
      difficulty
    });
  });
  
  return matchups;
}

// Calculate deck consistency rating
function calculateConsistency(
  cards: DeckCard[], 
  stats: any,
  format: DeckFormat
): number {
  let consistency = 50; // Base consistency
  
  // Check for duplicates (consistency improves with duplicates)
  const cardCounts = cards.map(c => c.quantity);
  const avgCopies = cardCounts.reduce((a, b) => a + b, 0) / cardCounts.length;
  
  if (format === 'pocket') {
    if (avgCopies >= 1.5) consistency += 20;
  } else {
    if (avgCopies >= 2.5) consistency += 20;
    else if (avgCopies >= 2) consistency += 10;
  }
  
  // Search cards improve consistency
  const searchCards = cards.filter(c => 
    c.name.includes('Ball') || 
    c.name.includes('Search') ||
    c.name.includes('Communication')
  ).reduce((sum, c) => sum + c.quantity, 0);
  
  consistency += Math.min(20, searchCards * 3);
  
  // Draw cards improve consistency
  const drawCards = cards.filter(c => 
    c.name.includes('Professor') || 
    c.name.includes('Research') ||
    c.name.includes('Draw')
  ).reduce((sum, c) => sum + c.quantity, 0);
  
  consistency += Math.min(15, drawCards * 3);
  
  // Too many one-ofs hurt consistency
  const oneOfs = cards.filter(c => c.quantity === 1).length;
  consistency -= Math.min(20, oneOfs * 2);
  
  return Math.max(0, Math.min(100, consistency));
}

// Calculate average HP of Pokemon
function calculateAverageHP(cards: DeckCard[]): number {
  const pokemon = cards.filter(c => 
    (c.supertype === 'Pokémon' || c.type) && c.health
  );
  
  if (pokemon.length === 0) return 0;
  
  const totalHP = pokemon.reduce((sum, card) => {
    const hp = parseInt(card.health || '0');
    return sum + (hp * card.quantity);
  }, 0);
  
  const totalPokemon = pokemon.reduce((sum, card) => sum + card.quantity, 0);
  
  return totalPokemon > 0 ? Math.round(totalHP / totalPokemon) : 0;
}

// Estimate popularity based on archetype and tier
function estimatePopularity(archetype: string, tier: string): number {
  // Popular archetypes
  const popularNames = ['Pikachu', 'Charizard', 'Mewtwo', 'Gardevoir'];
  let popularity = 30;
  
  // Check if archetype contains popular Pokemon
  popularNames.forEach(name => {
    if (archetype.includes(name)) popularity += 20;
  });
  
  // Tier bonus
  if (tier === 'Tier 1') popularity += 30;
  else if (tier === 'Tier 2') popularity += 15;
  
  // Add some randomness
  popularity += Math.floor(Math.random() * 20);
  
  return Math.min(100, popularity);
}

// Get improvement suggestions based on meta analysis
export function getMetaSuggestions(analysis: MetaAnalysis): string[] {
  const suggestions: string[] = [];
  
  // Score-based suggestions
  if (analysis.score < 60) {
    suggestions.push('Consider adding more powerful EX/V Pokemon');
  }
  
  // Consistency suggestions
  if (analysis.consistency < 60) {
    suggestions.push('Add more search and draw cards for better consistency');
    suggestions.push('Consider running more copies of key cards');
  }
  
  // Matchup-based suggestions
  const unfavorableMatchups = analysis.matchups.filter(m => m.difficulty === 'unfavorable');
  if (unfavorableMatchups.length >= 3) {
    suggestions.push('Consider tech cards to improve difficult matchups');
  }
  
  // Weakness coverage
  if (analysis.weaknesses.length > analysis.strengths.length) {
    suggestions.push('Add Pokemon or trainers that cover your type weaknesses');
  }
  
  return suggestions;
}