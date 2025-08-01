import React from 'react';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/pokemonTypeColors';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const bgColor = POKEMON_TYPE_COLORS[type.toLowerCase()] || POKEMON_TYPE_COLORS.normal;

  return (
    <span className={cn(
      'rounded-full font-medium text-white inline-flex items-center',
      sizeClasses[size],
      className
    )} style={{ backgroundColor: bgColor }}>
      {type.toUpperCase()}
    </span>
  );
};

export default TypeBadge;