// Unified Type Definitions for Pokemon Tab Components

import type { Pokemon, PokemonSpecies, EvolutionChain, Nature, LocationAreaEncounterDetail } from './api/pokemon';
import type { TCGCard } from './api/cards';
import type { PocketCard } from './api/pocket-cards';
import type { CompetitiveTierRecord } from '../utils/supabase';

// Consistent type colors interface used across all tabs
export interface TypeColors {
  primary: string;
  secondary?: string;
  accent: string;
  animationAccent: string;
  from?: string;
  via?: string;
  to?: string;
  tabActive?: string;
  [key: string]: string | undefined;
}

// Base props that all tabs receive
export interface BaseTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: TypeColors;
}

// Individual tab prop interfaces
export interface OverviewTabProps extends BaseTabProps {
  abilities: Record<string, {
    name: string;
    isHidden: boolean;
    effect: string;
    short_effect: string;
  }>;
  competitiveTiers?: CompetitiveTierRecord | null;
}

export interface StatsTabProps extends BaseTabProps {
  natureData?: Nature | null;
  allNatures?: Nature[];
  onNatureChange?: (nature: string) => void;
  selectedNature?: string;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
}

export interface EvolutionTabProps extends BaseTabProps {
  evolutionChain: EvolutionChain | null;
}

export interface MovesTabProps extends BaseTabProps {
  // No additional props needed
}

export interface BreedingTabProps extends BaseTabProps {
  // No additional props needed
}

export interface LocationsTabProps extends BaseTabProps {
  locationEncounters?: LocationAreaEncounterDetail[];
}

export interface CardsTabProps extends BaseTabProps {
  tcgCards?: TCGCard[];
  pocketCards?: PocketCard[];
}

export interface CompetitiveTabProps extends BaseTabProps {
  competitiveTiers?: CompetitiveTierRecord | null;
}

// Animation configuration for consistent animations
export interface AnimationConfig {
  initial?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  animate?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  exit?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    type?: 'spring' | 'tween';
    stiffness?: number;
    damping?: number;
  };
}

// Standard animation presets
export const STANDARD_ANIMATIONS: Record<string, AnimationConfig | ((delay: number) => AnimationConfig)> = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  
  fadeInUpDelayed: (delay: number): AnimationConfig => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay }
  }),
  
  scaleHover: {
    animate: { scale: 1 },
    transition: { type: 'spring', stiffness: 400, damping: 20 }
  },
  
  tabSwitch: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  }
};

// Consistent icon color classes
export const ICON_COLOR_CLASSES = {
  purple: "from-purple-500/20 to-purple-600/10",
  blue: "from-blue-500/20 to-blue-600/10",
  green: "from-green-500/20 to-green-600/10",
  red: "from-red-500/20 to-red-600/10",
  yellow: "from-yellow-500/20 to-yellow-600/10",
  orange: "from-orange-500/20 to-orange-600/10",
  pink: "from-pink-500/20 to-pink-600/10",
  gray: "from-gray-500/20 to-gray-600/10"
};

// Text color classes for icons
export const ICON_TEXT_CLASSES = {
  purple: "text-purple-400",
  blue: "text-blue-400",
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-400",
  orange: "text-orange-400",
  pink: "text-pink-400",
  gray: "text-gray-400"
};