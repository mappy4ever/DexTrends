import React from 'react';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';

interface TypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'solid' | 'gradient';
}

// Gradient configurations for each type - subtle gradients
const TYPE_GRADIENTS: Record<string, string> = {
  normal: 'from-stone-400 to-stone-600',
  fire: 'from-orange-400 to-orange-600',
  water: 'from-amber-400 to-amber-600',
  electric: 'from-yellow-300 to-yellow-500',
  grass: 'from-green-500 to-green-700',
  ice: 'from-cyan-300 to-amber-400',
  fighting: 'from-red-500 to-red-700',
  poison: 'from-fuchsia-500 to-fuchsia-700',
  ground: 'from-yellow-700 to-amber-800',
  flying: 'from-amber-300 to-amber-500',
  psychic: 'from-pink-500 to-pink-700',
  bug: 'from-lime-500 to-lime-700',
  rock: 'from-yellow-600 to-amber-700',
  ghost: 'from-amber-800 to-amber-950',
  dragon: 'from-amber-600 to-amber-700',
  dark: 'from-stone-700 to-stone-900',
  steel: 'from-stone-400 to-stone-500',
  fairy: 'from-pink-300 to-pink-400'
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  size = 'md',
  className,
  variant = 'gradient'
}) => {
  // Fixed width classes to match "FIGHTING" (longest type name) - improved sizing
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs min-w-[4.5rem]',
    sm: 'px-3 py-1 text-sm min-w-[5.5rem]',
    md: 'px-4 py-2 text-sm min-w-[6rem]',
    lg: 'px-3 py-1 text-lg min-w-[6.5rem]'
  };

  const typeKey = type.toLowerCase();
  const gradientClass = TYPE_GRADIENTS[typeKey] || TYPE_GRADIENTS.normal;
  const solidColor = POKEMON_TYPE_COLORS[typeKey] || POKEMON_TYPE_COLORS.normal;

  if (variant === 'gradient') {
    return (
      <span className={cn(
        'rounded-full font-semibold text-white inline-flex items-center justify-center shadow-sm',
        'bg-gradient-to-r',
        gradientClass,
        sizeClasses[size],
        className
      )}>
        {type.toUpperCase()}
      </span>
    );
  }

  // Solid variant (fallback)
  return (
    <span className={cn(
      'rounded-full font-medium text-white inline-flex items-center justify-center',
      sizeClasses[size],
      className
    )} style={{ 
      backgroundColor: solidColor,
      transform: 'translate3d(0,0,0)',
      WebkitTransform: 'translate3d(0,0,0)',
      backfaceVisibility: 'visible',
      WebkitBackfaceVisibility: 'visible',
      willChange: 'auto'
    }}>
      {type.toUpperCase()}
    </span>
  );
};

export default TypeBadge;