// Unified Pokemon Type Color System
// This provides a consistent color system that adapts to Pokemon types across all components
// Consolidated from pokemonTypeColors.ts (removed in Stage 9)

import { CSSProperties } from 'react';

// Type color mapping
type TypeColorMap = Record<string, string>;

// Pokemon type colors - moved from pokemonTypeColors.ts
export const POKEMON_TYPE_COLORS_IMPORT: TypeColorMap = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#4A4A4A',
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

// Pokemon TCG Pocket specific colors
export const POKEMON_TCG_POCKET_COLORS: TypeColorMap = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  lightning: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#4A4A4A',
  darkness: '#4A4A4A',
  steel: '#B7B7CE',
  metal: '#B7B7CE',
  fairy: '#D685AD',
  colorless: '#A8A77A',
  trainer: '#10B981',
  supporter: '#F97316',
  item: '#3B82F6'
};

// Text colors for each type
export const POKEMON_TYPE_TEXT_COLORS: TypeColorMap = {
  normal: '#FFFFFF',
  fire: '#FFFFFF',
  water: '#FFFFFF',
  electric: '#FFFFFF',
  grass: '#FFFFFF',
  ice: '#FFFFFF',
  fighting: '#FFFFFF',
  poison: '#FFFFFF',
  ground: '#FFFFFF',
  flying: '#FFFFFF',
  psychic: '#FFFFFF',
  bug: '#FFFFFF',
  rock: '#FFFFFF',
  ghost: '#FFFFFF',
  dragon: '#FFFFFF',
  dark: '#FFFFFF',
  steel: '#FFFFFF',
  fairy: '#FFFFFF'
};

// Border color for all type badges
export const POKEMON_TYPE_BORDER_COLOR = '#6B7280';

// Helper function to get type style
export const getTypeStyle = (type: string | null | undefined, isPocketCard: boolean = false): CSSProperties => {
  const lowerType = type ? type.toLowerCase() : '';
  const colorSet = isPocketCard ? POKEMON_TCG_POCKET_COLORS : POKEMON_TYPE_COLORS_IMPORT;
  const backgroundColor = colorSet[lowerType] || colorSet.normal || POKEMON_TYPE_COLORS_IMPORT.normal;
  const textColor = POKEMON_TYPE_TEXT_COLORS[lowerType] || POKEMON_TYPE_TEXT_COLORS.normal;
  
  return {
    backgroundColor,
    color: textColor,
    borderColor: POKEMON_TYPE_BORDER_COLOR
  };
};

// Helper function to get type style as string
export const getTypeStyleString = (type: string | null | undefined, isPocketCard: boolean = false): string => {
  const style = getTypeStyle(type, isPocketCard);
  return `background-color: ${style.backgroundColor}; color: ${style.color}; border-color: ${style.borderColor};`;
};

// Aliases for common imports
export const typeColors = POKEMON_TYPE_COLORS_IMPORT;
export const tcgTypeColors = POKEMON_TCG_POCKET_COLORS;

// Already exported above after consolidation

// Export POKEMON_TYPE_COLORS as the primary export
export const POKEMON_TYPE_COLORS = POKEMON_TYPE_COLORS_IMPORT;

export interface UnifiedTypeColors {
  // Base colors
  primary: string;
  secondary: string;
  accent: string;
  
  // UI variations
  background: {
    light: string;
    DEFAULT: string;
    dark: string;
  };
  
  // Gradients
  gradient: {
    from: string;
    via?: string;
    to: string;
  };
  
  // Interactive states
  hover: {
    light: string;
    DEFAULT: string;
    dark: string;
  };
  
  // Text colors
  text: {
    light: string;
    DEFAULT: string;
    dark: string;
  };
  
  // Border colors
  border: {
    light: string;
    DEFAULT: string;
    dark: string;
  };
  
  // Shadow colors
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Get unified colors for a Pokemon based on its types
export function getUnifiedTypeColors(types: Array<{ type: { name: string } }>): UnifiedTypeColors {
  const primaryType = types[0]?.type.name || 'normal';
  const secondaryType = types[1]?.type.name;
  
  const primaryColor = POKEMON_TYPE_COLORS[primaryType] || POKEMON_TYPE_COLORS.normal;
  const secondaryColor = secondaryType ? POKEMON_TYPE_COLORS[secondaryType] : primaryColor;
  
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: primaryColor,
    
    background: {
      light: `${primaryColor}10`,
      DEFAULT: `${primaryColor}20`,
      dark: `${primaryColor}30`,
    },
    
    gradient: {
      from: primaryColor,
      via: secondaryType ? blendColors(primaryColor, secondaryColor, 0.5) : undefined,
      to: secondaryColor || primaryColor,
    },
    
    hover: {
      light: `${primaryColor}15`,
      DEFAULT: `${primaryColor}25`,
      dark: `${primaryColor}35`,
    },
    
    text: {
      light: primaryColor,
      DEFAULT: primaryColor,
      dark: '#ffffff',
    },
    
    border: {
      light: `${primaryColor}30`,
      DEFAULT: `${primaryColor}50`,
      dark: `${primaryColor}70`,
    },
    
    shadow: {
      sm: `${primaryColor}20`,
      md: `${primaryColor}30`,
      lg: `${primaryColor}40`,
    },
  };
}

// Helper function to blend two hex colors
function blendColors(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Get CSS variables for type colors
export function getTypeColorCSSVariables(types: Array<{ type: { name: string } }>): Record<string, string> {
  const colors = getUnifiedTypeColors(types);
  
  return {
    '--type-primary': colors.primary,
    '--type-secondary': colors.secondary,
    '--type-accent': colors.accent,
    '--type-bg-light': colors.background.light,
    '--type-bg': colors.background.DEFAULT,
    '--type-bg-dark': colors.background.dark,
    '--type-gradient-from': colors.gradient.from,
    '--type-gradient-via': colors.gradient.via || colors.gradient.from,
    '--type-gradient-to': colors.gradient.to,
    '--type-hover-light': colors.hover.light,
    '--type-hover': colors.hover.DEFAULT,
    '--type-hover-dark': colors.hover.dark,
    '--type-text-light': colors.text.light,
    '--type-text': colors.text.DEFAULT,
    '--type-text-dark': colors.text.dark,
    '--type-border-light': colors.border.light,
    '--type-border': colors.border.DEFAULT,
    '--type-border-dark': colors.border.dark,
    '--type-shadow-sm': colors.shadow.sm,
    '--type-shadow-md': colors.shadow.md,
    '--type-shadow-lg': colors.shadow.lg,
  };
}

// Get Tailwind-compatible class names for type colors
export function getTypeColorClasses(types: Array<{ type: { name: string } }>) {
  const primaryType = types[0]?.type.name || 'normal';
  const secondaryType = types[1]?.type.name;
  
  return {
    // Gradient classes
    gradient: secondaryType
      ? `from-${primaryType} via-blend to-${secondaryType}`
      : `from-${primaryType} to-${primaryType}-dark`,
    
    // Background classes
    background: `bg-${primaryType}/10 dark:bg-${primaryType}/20`,
    backgroundHover: `hover:bg-${primaryType}/20 dark:hover:bg-${primaryType}/30`,
    
    // Text classes
    text: `text-${primaryType} dark:text-${primaryType}-light`,
    
    // Border classes
    border: `border-${primaryType}/30 dark:border-${primaryType}/50`,
    
    // Shadow classes
    shadow: `shadow-${primaryType}/20`,
  };
}

// Generate dynamic gradient based on Pokemon types
export function getTypeGradient(types: Array<{ type: { name: string } }>, options?: {
  angle?: number;
  opacity?: number;
  blend?: boolean;
}): string {
  const { angle = 135, opacity = 1, blend = true } = options || {};
  const colors = getUnifiedTypeColors(types);
  
  if (types.length === 1 || !blend) {
    return `linear-gradient(${angle}deg, ${colors.primary}${Math.round(opacity * 255).toString(16)}, ${colors.primary}${Math.round(opacity * 0.7 * 255).toString(16)})`;
  }
  
  if (colors.gradient.via) {
    return `linear-gradient(${angle}deg, ${colors.gradient.from}${Math.round(opacity * 255).toString(16)}, ${colors.gradient.via}${Math.round(opacity * 0.8 * 255).toString(16)}, ${colors.gradient.to}${Math.round(opacity * 255).toString(16)})`;
  }
  
  return `linear-gradient(${angle}deg, ${colors.gradient.from}${Math.round(opacity * 255).toString(16)}, ${colors.gradient.to}${Math.round(opacity * 255).toString(16)})`;
}

// Hook for using type colors in components
export function useTypeColors(types: Array<{ type: { name: string } }>) {
  return getUnifiedTypeColors(types);
}