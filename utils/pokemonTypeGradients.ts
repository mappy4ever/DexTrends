/**
 * Pokemon Type-Based Pastel Gradient System
 * Creates beautiful, soft gradients based on Pokemon types while maintaining design consistency
 */

import logger from './logger';

// Type definitions
interface GradientPalette {
  light: string[];
  dark: string[];
  accent: string;
}

interface TypeUIColors {
  accent: string;
  button: string;
  buttonHover: string;
  border: string;
  borderDark: string;
  text: string;
  textDark: string;
  bg: string;
  bgDark: string;
  glass: string;
  glassDark: string;
  cardBg: string;
  cardBorder: string;
  tabActive: string;
  tabHover: string;
  buttonActive: string;
  buttonInactive: string;
  // New properties for enhanced visuals
  particleColors: string[];
  glowColor: string;
  glowColorIntense: string;
  ringGradient: string;
  animationAccent: string;
  // Index signature for compatibility with Record<string, string>
  [key: string]: string | string[];
}

interface PokemonType {
  type: {
    name: string;
  };
}

// Re-export the extended type color palettes from main theme
// export { typeColorPalettes } from './pokemonTheme';

// Complete type-based UI color mappings
const typeUIMapping: Record<string, TypeUIColors> = {
  normal: {
    accent: 'amber-200',
    button: 'amber-500',
    buttonHover: 'amber-600',
    border: 'amber-200',
    borderDark: 'amber-700',
    text: 'amber-700',
    textDark: 'amber-300',
    bg: 'amber-50',
    bgDark: 'amber-950',
    glass: 'amber-100',
    glassDark: 'amber-900',
    cardBg: 'bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/30 dark:to-stone-950/30',
    cardBorder: 'border-amber-200/50 dark:border-amber-700/50',
    tabActive: 'bg-gradient-to-r from-amber-500 to-amber-600',
    tabHover: 'hover:from-amber-50 hover:to-stone-50 dark:hover:from-amber-900/20 dark:hover:to-stone-900/20 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-600',
    buttonActive: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg',
    buttonInactive: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-stone-50 dark:hover:bg-stone-950/40 border-amber-200/50 dark:border-amber-700/50',
    particleColors: ['#fbbf24', '#f59e0b', '#d97706', '#fef3c7'],
    glowColor: 'rgba(251, 191, 36, 0.6)',
    glowColorIntense: 'rgba(251, 191, 36, 0.9)',
    ringGradient: 'from-amber-600 via-amber-400 to-stone-600',
    animationAccent: '#f59e0b'
  },
  fire: {
    accent: 'red-200',
    button: 'red-500',
    buttonHover: 'red-600',
    border: 'red-200',
    borderDark: 'red-700',
    text: 'red-700',
    textDark: 'red-300',
    bg: 'red-50',
    bgDark: 'red-950',
    glass: 'red-100',
    glassDark: 'red-900',
    cardBg: 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30',
    cardBorder: 'border-red-200/50 dark:border-red-700/50',
    tabActive: 'bg-gradient-to-r from-red-500 to-orange-500',
    tabHover: 'hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-600',
    buttonActive: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg',
    buttonInactive: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 border-red-200/50 dark:border-red-700/50',
    particleColors: ['#ef4444', '#f97316', '#fbbf24', '#dc2626'],
    glowColor: 'rgba(239, 68, 68, 0.6)',
    glowColorIntense: 'rgba(239, 68, 68, 0.9)',
    ringGradient: 'from-red-600 via-orange-500 to-red-600',
    animationAccent: '#f97316'
  },
  water: {
    accent: 'blue-200',
    button: 'blue-500',
    buttonHover: 'blue-600',
    border: 'blue-200',
    borderDark: 'blue-700',
    text: 'blue-700',
    textDark: 'blue-300',
    bg: 'blue-50',
    bgDark: 'blue-950',
    glass: 'blue-100',
    glassDark: 'blue-900',
    cardBg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    cardBorder: 'border-blue-200/50 dark:border-blue-700/50',
    tabActive: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    tabHover: 'hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-600',
    buttonActive: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
    buttonInactive: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border-blue-200/50 dark:border-blue-700/50',
    particleColors: ['#3b82f6', '#06b6d4', '#0ea5e9', '#0284c7'],
    glowColor: 'rgba(59, 130, 246, 0.6)',
    glowColorIntense: 'rgba(59, 130, 246, 0.9)',
    ringGradient: 'from-blue-600 via-cyan-500 to-blue-600',
    animationAccent: '#06b6d4'
  },
  electric: {
    accent: 'yellow-200',
    button: 'yellow-500',
    buttonHover: 'yellow-600',
    border: 'yellow-200',
    borderDark: 'yellow-700',
    text: 'yellow-700',
    textDark: 'yellow-300',
    bg: 'yellow-50',
    bgDark: 'yellow-950',
    glass: 'yellow-100',
    glassDark: 'yellow-900',
    cardBg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    cardBorder: 'border-yellow-200/50 dark:border-yellow-700/50',
    tabActive: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    tabHover: 'hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-900/20 dark:hover:to-amber-900/20 hover:text-yellow-700 dark:hover:text-yellow-300 hover:border-yellow-300 dark:hover:border-yellow-600',
    buttonActive: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg',
    buttonInactive: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-yellow-200/50 dark:border-yellow-700/50',
    particleColors: ['#fde047', '#facc15', '#eab308', '#fef3c7'],
    glowColor: 'rgba(253, 224, 71, 0.7)',
    glowColorIntense: 'rgba(253, 224, 71, 1.0)',
    ringGradient: 'from-yellow-500 via-amber-400 to-yellow-500',
    animationAccent: '#facc15'
  },
  grass: {
    accent: 'green-200',
    button: 'green-500',
    buttonHover: 'green-600',
    border: 'green-200',
    borderDark: 'green-700',
    text: 'green-700',
    textDark: 'green-300',
    bg: 'green-50',
    bgDark: 'green-950',
    glass: 'green-100',
    glassDark: 'green-900',
    cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    cardBorder: 'border-green-200/50 dark:border-green-700/50',
    tabActive: 'bg-gradient-to-r from-green-500 to-emerald-500',
    tabHover: 'hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 dark:hover:border-green-600',
    buttonActive: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
    buttonInactive: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-green-200/50 dark:border-green-700/50',
    particleColors: ['#22c55e', '#16a34a', '#84cc16', '#65a30d'],
    glowColor: 'rgba(34, 197, 94, 0.6)',
    glowColorIntense: 'rgba(34, 197, 94, 0.9)',
    ringGradient: 'from-green-600 via-emerald-500 to-green-600',
    animationAccent: '#16a34a'
  },
  ice: {
    accent: 'cyan-300',
    button: 'cyan-500',
    buttonHover: 'cyan-600',
    border: 'cyan-300',
    borderDark: 'cyan-700',
    text: 'cyan-700',
    textDark: 'cyan-300',
    bg: 'cyan-100',
    bgDark: 'cyan-900',
    glass: 'cyan-200',
    glassDark: 'cyan-800',
    cardBg: 'bg-gradient-to-br from-cyan-100 to-sky-200 dark:from-cyan-900/40 dark:to-sky-900/40',
    cardBorder: 'border-cyan-300/60 dark:border-cyan-600/60',
    tabActive: 'bg-gradient-to-r from-cyan-500 to-sky-500',
    tabHover: 'hover:from-cyan-100 hover:to-sky-200 dark:hover:from-cyan-800/30 dark:hover:to-sky-800/30 hover:text-cyan-700 dark:hover:text-cyan-300 hover:border-cyan-400 dark:hover:border-cyan-600',
    buttonActive: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-lg',
    buttonInactive: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-cyan-300/60 dark:border-cyan-600/60',
    particleColors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#e0f2fe'],
    glowColor: 'rgba(14, 165, 233, 0.5)',
    glowColorIntense: 'rgba(14, 165, 233, 0.7)',
    ringGradient: 'from-cyan-400 to-sky-500',
    animationAccent: '#38bdf8'
  },
  fighting: {
    accent: 'red-200',
    button: 'red-500',
    buttonHover: 'red-600',
    border: 'red-200',
    borderDark: 'red-700',
    text: 'red-700',
    textDark: 'red-300',
    bg: 'red-50',
    bgDark: 'red-950',
    glass: 'red-100',
    glassDark: 'red-900',
    cardBg: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    cardBorder: 'border-red-200/50 dark:border-red-700/50',
    tabActive: 'bg-gradient-to-r from-red-500 to-rose-500',
    tabHover: 'hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-600',
    buttonActive: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
    buttonInactive: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-red-200/50 dark:border-red-700/50',
    particleColors: ['#dc2626', '#ef4444', '#f87171', '#991b1b'],
    glowColor: 'rgba(220, 38, 38, 0.5)',
    glowColorIntense: 'rgba(220, 38, 38, 0.7)',
    ringGradient: 'from-red-600 to-rose-500',
    animationAccent: '#ef4444'
  },
  poison: {
    accent: 'purple-200',
    button: 'purple-500',
    buttonHover: 'purple-600',
    border: 'purple-200',
    borderDark: 'purple-700',
    text: 'purple-700',
    textDark: 'purple-300',
    bg: 'purple-100',
    bgDark: 'purple-900',
    glass: 'purple-200',
    glassDark: 'purple-800',
    cardBg: 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
    cardBorder: 'border-purple-200/50 dark:border-purple-700/50',
    tabActive: 'bg-gradient-to-r from-purple-500 to-violet-500',
    tabHover: 'hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-600',
    buttonActive: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg',
    buttonInactive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border-purple-200/50 dark:border-purple-700/50',
    particleColors: ['#a855f7', '#9333ea', '#c026d3', '#d946ef'],
    glowColor: 'rgba(168, 85, 247, 0.5)',
    glowColorIntense: 'rgba(168, 85, 247, 0.7)',
    ringGradient: 'from-purple-500 to-violet-500',
    animationAccent: '#9333ea'
  },
  ground: {
    accent: 'yellow-200',
    button: 'yellow-500',
    buttonHover: 'yellow-600',
    border: 'yellow-200',
    borderDark: 'yellow-700',
    text: 'yellow-700',
    textDark: 'yellow-300',
    bg: 'yellow-50',
    bgDark: 'yellow-950',
    glass: 'yellow-100',
    glassDark: 'yellow-900',
    cardBg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
    cardBorder: 'border-yellow-200/50 dark:border-yellow-700/50',
    tabActive: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    tabHover: 'hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 hover:text-yellow-700 dark:hover:text-yellow-300 hover:border-yellow-300 dark:hover:border-yellow-600',
    buttonActive: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg',
    buttonInactive: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 border-yellow-200/50 dark:border-yellow-700/50',
    particleColors: ['#d97706', '#f59e0b', '#fbbf24', '#92400e'],
    glowColor: 'rgba(217, 119, 6, 0.5)',
    glowColorIntense: 'rgba(217, 119, 6, 0.7)',
    ringGradient: 'from-yellow-600 to-orange-500',
    animationAccent: '#f59e0b'
  },
  flying: {
    accent: 'sky-200',
    button: 'sky-500',
    buttonHover: 'sky-600',
    border: 'sky-200',
    borderDark: 'sky-700',
    text: 'sky-700',
    textDark: 'sky-300',
    bg: 'sky-50',
    bgDark: 'sky-950',
    glass: 'sky-100',
    glassDark: 'sky-900',
    cardBg: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30',
    cardBorder: 'border-sky-200/50 dark:border-sky-700/50',
    tabActive: 'bg-gradient-to-r from-sky-500 to-blue-500',
    tabHover: 'hover:from-sky-50 hover:to-blue-50 dark:hover:from-sky-900/20 dark:hover:to-blue-900/20 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-300 dark:hover:border-sky-600',
    buttonActive: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg',
    buttonInactive: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-sky-200/50 dark:border-sky-700/50',
    particleColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    glowColor: 'rgba(59, 130, 246, 0.4)',
    glowColorIntense: 'rgba(59, 130, 246, 0.6)',
    ringGradient: 'from-sky-400 to-blue-500',
    animationAccent: '#60a5fa'
  },
  psychic: {
    accent: 'pink-200',
    button: 'pink-500',
    buttonHover: 'pink-600',
    border: 'pink-200',
    borderDark: 'pink-700',
    text: 'pink-700',
    textDark: 'pink-300',
    bg: 'pink-50',
    bgDark: 'pink-950',
    glass: 'pink-100',
    glassDark: 'pink-900',
    cardBg: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30',
    cardBorder: 'border-pink-200/50 dark:border-pink-700/50',
    tabActive: 'bg-gradient-to-r from-pink-500 to-purple-500',
    tabHover: 'hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20 hover:text-pink-700 dark:hover:text-pink-300 hover:border-pink-300 dark:hover:border-pink-600',
    buttonActive: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg',
    buttonInactive: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-pink-200/50 dark:border-pink-700/50',
    particleColors: ['#ec4899', '#d946ef', '#a855f7', '#f472b6'],
    glowColor: 'rgba(236, 72, 153, 0.5)',
    glowColorIntense: 'rgba(236, 72, 153, 0.7)',
    ringGradient: 'from-pink-500 to-purple-500',
    animationAccent: '#d946ef'
  },
  bug: {
    accent: 'lime-200',
    button: 'lime-500',
    buttonHover: 'lime-600',
    border: 'lime-200',
    borderDark: 'lime-700',
    text: 'lime-700',
    textDark: 'lime-300',
    bg: 'lime-50',
    bgDark: 'lime-950',
    glass: 'lime-100',
    glassDark: 'lime-900',
    cardBg: 'bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30',
    cardBorder: 'border-lime-200/50 dark:border-lime-700/50',
    tabActive: 'bg-gradient-to-r from-lime-500 to-green-500',
    tabHover: 'hover:from-lime-50 hover:to-green-50 dark:hover:from-lime-900/20 dark:hover:to-green-900/20 hover:text-lime-700 dark:hover:text-lime-300 hover:border-lime-300 dark:hover:border-lime-600',
    buttonActive: 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg',
    buttonInactive: 'bg-lime-50 dark:bg-lime-950/30 text-lime-700 dark:text-lime-300 hover:bg-green-50 dark:hover:bg-green-950/40 border-lime-200/50 dark:border-lime-700/50',
    particleColors: ['#84cc16', '#65a30d', '#4ade80', '#16a34a'],
    glowColor: 'rgba(132, 204, 22, 0.5)',
    glowColorIntense: 'rgba(132, 204, 22, 0.7)',
    ringGradient: 'from-lime-500 to-green-500',
    animationAccent: '#65a30d'
  },
  rock: {
    accent: 'stone-200',
    button: 'stone-500',
    buttonHover: 'stone-600',
    border: 'stone-200',
    borderDark: 'stone-700',
    text: 'stone-700',
    textDark: 'stone-300',
    bg: 'stone-50',
    bgDark: 'stone-950',
    glass: 'stone-100',
    glassDark: 'stone-900',
    cardBg: 'bg-gradient-to-br from-stone-50 to-gray-50 dark:from-stone-950/30 dark:to-gray-950/30',
    cardBorder: 'border-stone-200/50 dark:border-stone-700/50',
    tabActive: 'bg-gradient-to-r from-stone-500 to-gray-500',
    tabHover: 'hover:from-stone-50 hover:to-gray-50 dark:hover:from-stone-900/20 dark:hover:to-gray-900/20 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600',
    buttonActive: 'bg-gradient-to-r from-stone-500 to-gray-500 text-white shadow-lg',
    buttonInactive: 'bg-stone-50 dark:bg-stone-950/30 text-stone-700 dark:text-stone-300 hover:bg-gray-50 dark:hover:bg-gray-950/40 border-stone-200/50 dark:border-stone-700/50',
    particleColors: ['#78716c', '#a8a29e', '#d6d3d1', '#57534e'],
    glowColor: 'rgba(120, 113, 108, 0.5)',
    glowColorIntense: 'rgba(120, 113, 108, 0.7)',
    ringGradient: 'from-stone-500 to-gray-600',
    animationAccent: '#a8a29e'
  },
  ghost: {
    accent: 'purple-200',
    button: 'purple-500',
    buttonHover: 'purple-600',
    border: 'purple-200',
    borderDark: 'purple-700',
    text: 'purple-700',
    textDark: 'purple-300',
    bg: 'purple-50',
    bgDark: 'purple-950',
    glass: 'purple-100',
    glassDark: 'purple-900',
    cardBg: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30',
    cardBorder: 'border-purple-200/50 dark:border-purple-700/50',
    tabActive: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    tabHover: 'hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-600',
    buttonActive: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg',
    buttonInactive: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-purple-200/50 dark:border-purple-700/50',
    particleColors: ['#7c3aed', '#9333ea', '#a855f7', '#6b21a8'],
    glowColor: 'rgba(124, 58, 237, 0.5)',
    glowColorIntense: 'rgba(124, 58, 237, 0.7)',
    ringGradient: 'from-purple-600 to-indigo-500',
    animationAccent: '#9333ea'
  },
  dragon: {
    accent: 'indigo-200',
    button: 'indigo-500',
    buttonHover: 'indigo-600',
    border: 'indigo-200',
    borderDark: 'indigo-700',
    text: 'indigo-700',
    textDark: 'indigo-300',
    bg: 'indigo-50',
    bgDark: 'indigo-950',
    glass: 'indigo-100',
    glassDark: 'indigo-900',
    cardBg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
    cardBorder: 'border-indigo-200/50 dark:border-indigo-700/50',
    tabActive: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    tabHover: 'hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-600',
    buttonActive: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg',
    buttonInactive: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-indigo-200/50 dark:border-indigo-700/50',
    particleColors: ['#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa'],
    glowColor: 'rgba(99, 102, 241, 0.5)',
    glowColorIntense: 'rgba(99, 102, 241, 0.7)',
    ringGradient: 'from-indigo-500 to-purple-600',
    animationAccent: '#7c3aed'
  },
  dark: {
    accent: 'gray-200',
    button: 'gray-500',
    buttonHover: 'gray-600',
    border: 'gray-200',
    borderDark: 'gray-700',
    text: 'gray-700',
    textDark: 'gray-300',
    bg: 'gray-50',
    bgDark: 'gray-950',
    glass: 'gray-100',
    glassDark: 'gray-900',
    cardBg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
    cardBorder: 'border-gray-200/50 dark:border-gray-700/50',
    tabActive: 'bg-gradient-to-r from-gray-500 to-slate-500',
    tabHover: 'hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-900/20 dark:hover:to-slate-900/20 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
    buttonActive: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg',
    buttonInactive: 'bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 border-gray-200/50 dark:border-gray-700/50',
    particleColors: ['#374151', '#4b5563', '#6b7280', '#1f2937'],
    glowColor: 'rgba(55, 65, 81, 0.5)',
    glowColorIntense: 'rgba(55, 65, 81, 0.7)',
    ringGradient: 'from-gray-600 to-slate-700',
    animationAccent: '#4b5563'
  },
  steel: {
    accent: 'slate-200',
    button: 'slate-500',
    buttonHover: 'slate-600',
    border: 'slate-200',
    borderDark: 'slate-700',
    text: 'slate-700',
    textDark: 'slate-300',
    bg: 'slate-50',
    bgDark: 'slate-950',
    glass: 'slate-100',
    glassDark: 'slate-900',
    cardBg: 'bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-950/30 dark:to-zinc-950/30',
    cardBorder: 'border-slate-200/50 dark:border-slate-700/50',
    tabActive: 'bg-gradient-to-r from-slate-500 to-zinc-500',
    tabHover: 'hover:from-slate-50 hover:to-zinc-50 dark:hover:from-slate-900/20 dark:hover:to-zinc-900/20 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600',
    buttonActive: 'bg-gradient-to-r from-slate-500 to-zinc-500 text-white shadow-lg',
    buttonInactive: 'bg-slate-50 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 border-slate-200/50 dark:border-slate-700/50',
    particleColors: ['#94a3b8', '#cbd5e1', '#e2e8f0', '#64748b'],
    glowColor: 'rgba(148, 163, 184, 0.5)',
    glowColorIntense: 'rgba(148, 163, 184, 0.7)',
    ringGradient: 'from-slate-400 to-zinc-500',
    animationAccent: '#cbd5e1'
  },
  fairy: {
    accent: 'pink-200',
    button: 'pink-500',
    buttonHover: 'pink-600',
    border: 'pink-200',
    borderDark: 'pink-700',
    text: 'pink-700',
    textDark: 'pink-300',
    bg: 'pink-50',
    bgDark: 'pink-950',
    glass: 'pink-100',
    glassDark: 'pink-900',
    cardBg: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30',
    cardBorder: 'border-pink-200/50 dark:border-pink-700/50',
    tabActive: 'bg-gradient-to-r from-pink-500 to-rose-500',
    tabHover: 'hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 hover:text-pink-700 dark:hover:text-pink-300 hover:border-pink-300 dark:hover:border-pink-600',
    buttonActive: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg',
    buttonInactive: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-pink-200/50 dark:border-pink-700/50',
    particleColors: ['#f472b6', '#ec4899', '#fbbf24', '#f9a8d4'],
    glowColor: 'rgba(244, 114, 182, 0.5)',
    glowColorIntense: 'rgba(244, 114, 182, 0.7)',
    ringGradient: 'from-pink-400 to-rose-500',
    animationAccent: '#ec4899'
  }
};

/**
 * Re-export functions from main theme file
 */
// export { generateTypeGradient, getTypeAccentColor } from './pokemonTheme';

/**
 * Generate complete class strings for UI elements based on Pokemon types
 * This ensures Tailwind includes all necessary classes in the build
 */
export const getTypeUIColors = (types: PokemonType[]): TypeUIColors => {
  if (!types || types.length === 0) {
    return typeUIMapping.normal;
  }

  const primaryType = types[0]?.type?.name?.toLowerCase() || 'normal';
  return typeUIMapping[primaryType] || typeUIMapping.normal;
};

/**
 * Get particle colors for a Pokemon type
 */
export const getTypeParticleColors = (types: PokemonType[]): string[] => {
  if (!types || types.length === 0) {
    return typeUIMapping.normal.particleColors;
  }
  
  const primaryType = types[0]?.type?.name?.toLowerCase() || 'normal';
  const typeConfig = typeUIMapping[primaryType] || typeUIMapping.normal;
  return typeConfig.particleColors;
};

/**
 * Get glow effect for Pokemon types
 */
export const getTypeGlowEffect = (types: PokemonType[], intense = false): string => {
  if (!types || types.length === 0) {
    return intense ? typeUIMapping.normal.glowColorIntense : typeUIMapping.normal.glowColor;
  }
  
  const primaryType = types[0]?.type?.name?.toLowerCase() || 'normal';
  const typeConfig = typeUIMapping[primaryType] || typeUIMapping.normal;
  
  if (types.length > 1 && intense) {
    const secondaryType = types[1]?.type?.name?.toLowerCase() || 'normal';
    const secondaryConfig = typeUIMapping[secondaryType] || typeUIMapping.normal;
    return `0 0 40px ${typeConfig.glowColorIntense}, 0 0 60px ${secondaryConfig.glowColorIntense}, 0 0 80px ${typeConfig.glowColor}`;
  }
  
  return intense ? typeConfig.glowColorIntense : typeConfig.glowColor;
};

/**
 * Get ring gradient classes for dual-type Pokemon
 */
export const getTypeRingGradient = (types: PokemonType[]): string => {
  if (!types || types.length === 0) {
    return typeUIMapping.normal.ringGradient;
  }
  
  // Safely access type name with fallback and ensure lowercase
  const primaryType = types[0]?.type?.name?.toLowerCase() || 'normal';
  const typeConfig = typeUIMapping[primaryType] || typeUIMapping.normal;
  
  // Ensure ringGradient exists
  if (!typeConfig || !typeConfig.ringGradient) {
    logger.warn(`Missing type config or ringGradient for type: ${primaryType}`);
    return 'from-gray-400 to-gray-500'; // Safe fallback gradient
  }
  
  if (types.length > 1) {
    const secondaryType = types[1]?.type?.name?.toLowerCase() || 'normal';
    const secondaryConfig = typeUIMapping[secondaryType] || typeUIMapping.normal;
    
    // Check secondary type config
    if (!secondaryConfig || !secondaryConfig.ringGradient) {
      return typeConfig.ringGradient; // Use primary only
    }
    
    try {
      // Safely parse gradient strings
      const primaryParts = typeConfig.ringGradient.split(' ');
      const secondaryParts = secondaryConfig.ringGradient.split(' ');
      
      // Validate expected format
      if (primaryParts.length >= 3 && secondaryParts.length >= 3) {
        const primaryColor = primaryParts[0]?.replace('from-', '') || 'gray-400';
        const secondaryColor = secondaryParts[2]?.replace('to-', '') || 'gray-500';
        return `from-${primaryColor} via-${primaryColor}/50 via-${secondaryColor} via-${secondaryColor}/50 to-${primaryColor}`;
      }
    } catch (e) {
      logger.error('Error parsing gradient:', { error: e });
    }
    
    // Fallback to primary gradient if parsing fails
    return typeConfig.ringGradient;
  }
  
  return typeConfig.ringGradient;
};

/**
 * Get animation accent color for a Pokemon type
 */
export const getTypeAnimationAccent = (types: PokemonType[]): string => {
  if (!types || types.length === 0) {
    return typeUIMapping.normal.animationAccent;
  }
  
  const primaryType = types[0]?.type?.name?.toLowerCase() || 'normal';
  const typeConfig = typeUIMapping[primaryType] || typeUIMapping.normal;
  return typeConfig.animationAccent;
};

export default {
  typeColorPalettes: typeUIMapping,
  generateTypeGradient: () => '', // Re-exported from main theme
  getTypeAccentColor: () => '', // Re-exported from main theme
  getTypeUIColors,
  getTypeParticleColors,
  getTypeGlowEffect,
  getTypeRingGradient,
  getTypeAnimationAccent
};