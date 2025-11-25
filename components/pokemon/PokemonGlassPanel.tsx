import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
// Removed design-tokens as we're using simple, classic styling
import type { PokemonType } from "../../types/pokemon";

export interface PokemonGlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'stat' | 'compact';
  pokemonTypes?: PokemonType[];
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

/**
 * PokemonGlassPanel Component
 * 
 * A glass morphism card component with Pokemon type-based theming.
 * Provides consistent styling for all Pokemon detail page cards.
 * 
 * @example
 * <PokemonGlassPanel variant="stat" pokemonTypes={pokemon.types}>
 *   <h3>Base Stats</h3>
 *   <StatsDisplay stats={pokemon.stats} />
 * </PokemonGlassPanel>
 */
const PokemonGlassPanel = forwardRef<HTMLDivElement, PokemonGlassPanelProps>(
  (
    {
      className,
      variant = 'default',
      pokemonTypes = [],
      hover = true,
      padding = 'md',
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    // Get primary type for theming
    const primaryType = pokemonTypes[0]?.type.name || 'normal';
    
    // Variant-specific styles - classic design
    const variantStyles = {
      default: {
        base: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
        rounded: 'rounded-lg',
        padding: padding === 'md' ? 'p-6' : '',
        shadow: 'shadow-sm',
      },
      hero: {
        base: 'bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700',
        rounded: 'rounded-xl',
        padding: padding === 'md' ? 'p-8' : '',
        shadow: 'shadow-md',
      },
      stat: {
        base: 'bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700',
        rounded: 'rounded-lg',
        padding: padding === 'md' ? 'p-4' : '',
        shadow: 'shadow-sm',
      },
      compact: {
        base: 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
        rounded: 'rounded-md',
        padding: padding === 'md' ? 'p-3' : '',
        shadow: 'shadow-xs',
      },
    };

    // Padding overrides
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: '', // Use variant default
      lg: 'p-8',
    };

    // Hover effects - subtle elevation change
    const hoverStyles = hover
      ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
      : 'transition-colors duration-200';

    // Combine all styles
    const cardStyles = cn(
      // Base styles
      'relative overflow-hidden',
      
      // Variant styles
      variantStyles[variant].base,
      variantStyles[variant].rounded,
      paddingStyles[padding] || variantStyles[variant].padding,
      variantStyles[variant].shadow,
      
      // Effects
      hoverStyles,
      
      // Custom className
      className
    );

    // Type-based accent border
    const typeAccentColors: Record<string, string> = {
      normal: 'from-gray-400 to-gray-500',
      fire: 'from-orange-500 to-red-500',
      water: 'from-blue-400 to-blue-600',
      electric: 'from-yellow-300 to-yellow-500',
      grass: 'from-green-400 to-green-600',
      ice: 'from-cyan-300 to-blue-400',
      fighting: 'from-red-500 to-red-700',
      poison: 'from-purple-400 to-purple-600',
      ground: 'from-amber-500 to-amber-700',
      flying: 'from-indigo-300 to-blue-500',
      psychic: 'from-pink-400 to-pink-600',
      bug: 'from-lime-400 to-green-500',
      rock: 'from-stone-500 to-stone-700',
      ghost: 'from-violet-500 to-purple-700',
      dragon: 'from-indigo-500 to-purple-600',
      dark: 'from-gray-700 to-gray-900',
      steel: 'from-slate-400 to-slate-600',
      fairy: 'from-pink-300 to-pink-500',
    };

    return (
      <Component
        ref={ref}
        className={cardStyles}
        {...props}
      >
        {/* Optional type accent - thin top border only */}
        {pokemonTypes.length > 0 && variant === 'hero' && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeAccentColors[primaryType] || 'from-gray-400 to-gray-600'} opacity-30`} />
        )}
        
        {/* Content */}
        {children}
      </Component>
    );
  }
);

PokemonGlassPanel.displayName = 'PokemonGlassPanel';

export default PokemonGlassPanel;