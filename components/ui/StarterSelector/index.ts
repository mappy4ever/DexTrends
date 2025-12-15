/**
 * StarterSelector - Component exports
 *
 * Note: TypeBadge has been consolidated to the main /components/ui/TypeBadge.tsx
 * Import TypeBadge from '@/components/ui/TypeBadge' instead.
 *
 * For type color overlays, use TYPE_OVERLAYS from '@/components/ui/design-system/glass-constants'
 */

export { StatBar, getStatColor, getStatPercentage } from './StatBar';
export { StatsDisplay } from './StatsDisplay';
export { abilityDescriptions, getAbilityDescription } from './AbilityDescriptions';

// Re-export TypeBadge from canonical location for backwards compatibility
export { TypeBadge } from '../TypeBadge';

// Re-export type color utilities from unified system
export { TYPE_GRADIENTS as typeGradients } from '../design-system/glass-constants';
export { POKEMON_TYPE_COLORS as typeColors } from '@/utils/unifiedTypeColors';
