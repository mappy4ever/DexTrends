// Official Pokemon Type Colors - DexTrends
// These are the EXACT colors specified for consistent usage across the application

import { CSSProperties } from 'react';

// Type color classes interface
interface TypeColorClasses {
  bg: string;
  text: string;
  border: string;
  hover: string;
}

// Type color mapping
type TypeColorMap = Record<string, string>;
type TypeClassMap = Record<string, TypeColorClasses>;

export const POKEMON_TYPE_COLORS: TypeColorMap = {
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
  dark: '#4A4A4A',  // Greyish-black like Umbreon, NOT brown
  steel: '#B7B7CE',
  fairy: '#D685AD'
};

// Pokemon TCG Pocket specific colors - slightly different from main game
export const POKEMON_TCG_POCKET_COLORS: TypeColorMap = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  lightning: '#F7D02C', // Pocket alias for electric
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
  darkness: '#4A4A4A', // Pocket alias for dark
  steel: '#B7B7CE',
  metal: '#B7B7CE', // Pocket alias for steel
  fairy: '#D685AD',
  colorless: '#A8A77A', // Same as normal for pocket
  trainer: '#10B981', // Green for trainer cards
  supporter: '#F97316', // Orange for supporter cards
  item: '#3B82F6' // Blue for item cards
};

// Text colors for each type - all white except electric and ice
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

// Border color for all type badges - grey with increased width
export const POKEMON_TYPE_BORDER_COLOR = '#6B7280'; // Standard grey with thicker border

// Helper function to get type style
export const getTypeStyle = (type: string | null | undefined, isPocketCard: boolean = false): CSSProperties => {
  const lowerType = type ? type.toLowerCase() : '';
  const colorSet = isPocketCard ? POKEMON_TCG_POCKET_COLORS : POKEMON_TYPE_COLORS;
  const backgroundColor = colorSet[lowerType] || colorSet.normal || POKEMON_TYPE_COLORS.normal;
  const textColor = POKEMON_TYPE_TEXT_COLORS[lowerType] || POKEMON_TYPE_TEXT_COLORS.normal;
  
  return {
    backgroundColor: backgroundColor,
    color: textColor,
    border: `3px solid ${POKEMON_TYPE_BORDER_COLOR}`,
    boxShadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
  };
};

// Helper function to get inline style string
export const getTypeStyleString = (type: string | null | undefined): string => {
  const style = getTypeStyle(type);
  return `background-color: ${style.backgroundColor} !important; color: ${style.color} !important; border: ${style.border} !important;`;
};

// Updated type colors mapping for React components
export const typeColors: TypeClassMap = {
  normal: { bg: "bg-poke-normal", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-normal" },
  fire: { bg: "bg-poke-fire", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-fire" },
  water: { bg: "bg-poke-water", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-water" },
  electric: { bg: "bg-poke-electric", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-electric" },
  grass: { bg: "bg-poke-grass", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-grass" },
  ice: { bg: "bg-poke-ice", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-ice" },
  fighting: { bg: "bg-poke-fighting", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-fighting" },
  poison: { bg: "bg-poke-poison", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-poison" },
  ground: { bg: "bg-poke-ground", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-ground" },
  flying: { bg: "bg-poke-flying", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-flying" },
  psychic: { bg: "bg-poke-psychic", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-psychic" },
  bug: { bg: "bg-poke-bug", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-bug" },
  rock: { bg: "bg-poke-rock", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-rock" },
  ghost: { bg: "bg-poke-ghost", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-ghost" },
  dragon: { bg: "bg-poke-dragon", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-dragon" },
  dark: { bg: "bg-poke-dark", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-dark" },
  steel: { bg: "bg-poke-steel", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-steel" },
  fairy: { bg: "bg-poke-fairy", text: "text-white", border: "border-gray-500", hover: "hover:bg-poke-fairy" },
};

// TCG-specific type colors for Pocket mode
export const tcgTypeColors: TypeClassMap = {
  normal: { bg: "bg-tcg-normal", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-normal" },
  fire: { bg: "bg-tcg-fire", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-fire" },
  water: { bg: "bg-tcg-water", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-water" },
  electric: { bg: "bg-tcg-electric", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-electric" },
  lightning: { bg: "bg-tcg-electric", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-electric" },
  grass: { bg: "bg-tcg-grass", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-grass" },
  ice: { bg: "bg-tcg-ice", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-ice" },
  fighting: { bg: "bg-tcg-fighting", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-fighting" },
  poison: { bg: "bg-tcg-poison", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-poison" },
  ground: { bg: "bg-tcg-ground", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-ground" },
  flying: { bg: "bg-tcg-flying", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-flying" },
  psychic: { bg: "bg-tcg-psychic", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-psychic" },
  bug: { bg: "bg-tcg-bug", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-bug" },
  rock: { bg: "bg-tcg-rock", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-rock" },
  ghost: { bg: "bg-tcg-ghost", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-ghost" },
  dragon: { bg: "bg-tcg-dragon", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-dragon" },
  dark: { bg: "bg-tcg-dark", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-dark" },
  darkness: { bg: "bg-tcg-dark", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-dark" },
  steel: { bg: "bg-tcg-steel", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-steel" },
  metal: { bg: "bg-tcg-steel", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-steel" },
  fairy: { bg: "bg-tcg-fairy", text: "text-white", border: "border-gray-500", hover: "hover:bg-tcg-fairy" },
  colorless: { bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-500", hover: "hover:bg-gray-400" },
  trainer: { bg: "bg-emerald-500", text: "text-white", border: "border-gray-500", hover: "hover:bg-emerald-600" },
};

export default {
  POKEMON_TYPE_COLORS,
  POKEMON_TCG_POCKET_COLORS,
  POKEMON_TYPE_TEXT_COLORS,
  POKEMON_TYPE_BORDER_COLOR,
  getTypeStyle,
  getTypeStyleString,
  typeColors,
  tcgTypeColors
};