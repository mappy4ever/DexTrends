// Primary card components
export { TCGCard, TCGCard as UnifiedCard } from './TCGCard';
// Removed in Stage 5 consolidation:
// - EvolutionStageCard (unused)
// - CardComparisonTool (unused)
// - FlippableTCGCard (unused)

// Re-export from PokemonDisplay for backward compatibility
export { 
  PokemonDisplay as PokemonCard,
  PokemonTile,
  PokemonAvatar,
  EnhancedPokemonCard 
} from '../PokemonDisplay';

// Re-export Container as Card
export { Container as Card } from '../Container';