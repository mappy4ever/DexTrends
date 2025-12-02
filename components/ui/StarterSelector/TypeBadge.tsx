/**
 * TypeBadge - Pokemon type badge with gradient colors
 */

import React from 'react';
import { cn } from '@/utils/cn';

// Type color mappings
export const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  grass: {
    bg: 'bg-gradient-to-br from-green-400/20 to-emerald-500/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-400/50'
  },
  fire: {
    bg: 'bg-gradient-to-br from-orange-400/20 to-red-500/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-400/50'
  },
  water: {
    bg: 'bg-gradient-to-br from-blue-400/20 to-cyan-500/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-400/50'
  },
  electric: {
    bg: 'bg-gradient-to-br from-yellow-400/20 to-amber-500/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-400/50'
  },
  poison: {
    bg: 'bg-gradient-to-br from-purple-400/20 to-fuchsia-500/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-400/50'
  },
  flying: {
    bg: 'bg-gradient-to-br from-indigo-400/20 to-sky-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-400/50'
  },
  dark: {
    bg: 'bg-gradient-to-br from-stone-600/20 to-stone-800/20',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-600/50'
  },
  psychic: {
    bg: 'bg-gradient-to-br from-pink-400/20 to-purple-500/20',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-400/50'
  },
  fighting: {
    bg: 'bg-gradient-to-br from-red-500/20 to-orange-600/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-500/50'
  },
  ground: {
    bg: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-500/50'
  },
  steel: {
    bg: 'bg-gradient-to-br from-stone-400/20 to-stone-500/20',
    text: 'text-stone-600 dark:text-stone-300',
    border: 'border-stone-400/50'
  },
  fairy: {
    bg: 'bg-gradient-to-br from-pink-300/20 to-pink-500/20',
    text: 'text-pink-600 dark:text-pink-300',
    border: 'border-pink-400/50'
  },
  dragon: {
    bg: 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/50'
  },
  ice: {
    bg: 'bg-gradient-to-br from-cyan-300/20 to-blue-400/20',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-400/50'
  },
  rock: {
    bg: 'bg-gradient-to-br from-yellow-600/20 to-amber-700/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-600/50'
  },
  bug: {
    bg: 'bg-gradient-to-br from-lime-400/20 to-green-500/20',
    text: 'text-lime-700 dark:text-lime-300',
    border: 'border-lime-500/50'
  },
  ghost: {
    bg: 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/50'
  },
  normal: {
    bg: 'bg-gradient-to-br from-stone-300/20 to-stone-400/20',
    text: 'text-stone-600 dark:text-stone-300',
    border: 'border-stone-400/50'
  },
};

// Type gradient colors for badges
export const typeGradients: Record<string, string> = {
  grass: 'from-green-500 to-emerald-500',
  fire: 'from-red-500 to-orange-500',
  water: 'from-cyan-500 to-blue-500',
  electric: 'from-yellow-400 to-yellow-500',
  poison: 'from-purple-500 to-pink-500',
  flying: 'from-indigo-400 to-sky-500',
  dark: 'from-stone-700 to-stone-900',
  psychic: 'from-pink-500 to-purple-500',
  fighting: 'from-red-600 to-orange-600',
  ground: 'from-yellow-600 to-amber-600',
  steel: 'from-stone-400 to-stone-600',
  fairy: 'from-pink-400 to-pink-600',
  dragon: 'from-indigo-600 to-purple-700',
  ice: 'from-cyan-400 to-cyan-500',
  rock: 'from-yellow-700 to-yellow-800',
  bug: 'from-lime-500 to-lime-600',
  ghost: 'from-purple-600 to-indigo-700',
  normal: 'from-stone-400 to-stone-500',
};

interface TypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        "rounded-full font-medium capitalize bg-gradient-to-r shadow-sm text-white",
        sizeClasses[size],
        typeGradients[type] || typeGradients.normal,
        className
      )}
    >
      {type}
    </span>
  );
};

export default TypeBadge;
