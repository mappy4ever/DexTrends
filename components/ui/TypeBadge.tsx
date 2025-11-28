import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';

interface TypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'solid' | 'gradient';
  showTooltip?: boolean;
}

// Gradient configurations for each type - CORRECT colors
const TYPE_GRADIENTS: Record<string, string> = {
  normal: 'from-stone-400 to-stone-500',
  fire: 'from-orange-500 to-red-500',
  water: 'from-blue-400 to-blue-600',
  electric: 'from-yellow-400 to-amber-500',
  grass: 'from-green-500 to-emerald-600',
  ice: 'from-cyan-300 to-cyan-500',
  fighting: 'from-red-600 to-orange-600',
  poison: 'from-purple-500 to-purple-700',
  ground: 'from-amber-600 to-yellow-700',
  flying: 'from-indigo-400 to-sky-400',
  psychic: 'from-pink-500 to-pink-600',
  bug: 'from-lime-500 to-green-600',
  rock: 'from-yellow-700 to-stone-600',
  ghost: 'from-purple-700 to-indigo-800',
  dragon: 'from-indigo-600 to-purple-700',
  dark: 'from-stone-700 to-stone-800',
  steel: 'from-slate-400 to-slate-500',
  fairy: 'from-pink-400 to-pink-500'
};

// Type effectiveness descriptions for tooltips
const TYPE_DESCRIPTIONS: Record<string, string> = {
  normal: 'Weak to: Fighting. Immune to: Ghost',
  fire: 'Strong vs: Grass, Ice, Bug, Steel. Weak to: Water, Ground, Rock',
  water: 'Strong vs: Fire, Ground, Rock. Weak to: Electric, Grass',
  electric: 'Strong vs: Water, Flying. Weak to: Ground',
  grass: 'Strong vs: Water, Ground, Rock. Weak to: Fire, Ice, Poison, Flying, Bug',
  ice: 'Strong vs: Grass, Ground, Flying, Dragon. Weak to: Fire, Fighting, Rock, Steel',
  fighting: 'Strong vs: Normal, Ice, Rock, Dark, Steel. Weak to: Flying, Psychic, Fairy',
  poison: 'Strong vs: Grass, Fairy. Weak to: Ground, Psychic',
  ground: 'Strong vs: Fire, Electric, Poison, Rock, Steel. Weak to: Water, Grass, Ice',
  flying: 'Strong vs: Grass, Fighting, Bug. Weak to: Electric, Ice, Rock',
  psychic: 'Strong vs: Fighting, Poison. Weak to: Bug, Ghost, Dark',
  bug: 'Strong vs: Grass, Psychic, Dark. Weak to: Fire, Flying, Rock',
  rock: 'Strong vs: Fire, Ice, Flying, Bug. Weak to: Water, Grass, Fighting, Ground, Steel',
  ghost: 'Strong vs: Psychic, Ghost. Weak to: Ghost, Dark. Immune to: Normal, Fighting',
  dragon: 'Strong vs: Dragon. Weak to: Ice, Dragon, Fairy',
  dark: 'Strong vs: Psychic, Ghost. Weak to: Fighting, Bug, Fairy. Immune to: Psychic',
  steel: 'Strong vs: Ice, Rock, Fairy. Weak to: Fire, Fighting, Ground',
  fairy: 'Strong vs: Fighting, Dragon, Dark. Weak to: Poison, Steel. Immune to: Dragon'
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({
  type,
  size = 'md',
  className,
  variant = 'gradient',
  showTooltip = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

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
  const tooltipText = TYPE_DESCRIPTIONS[typeKey] || '';

  const badge = variant === 'gradient' ? (
    <span className={cn(
      'rounded-full font-semibold text-white inline-flex items-center justify-center shadow-sm',
      'bg-gradient-to-r',
      gradientClass,
      sizeClasses[size],
      className
    )}>
      {type.toUpperCase()}
    </span>
  ) : (
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

  if (!showTooltip) {
    return badge;
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {badge}
      {isHovered && tooltipText && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-stone-800 dark:bg-stone-700 rounded-lg shadow-lg whitespace-nowrap max-w-[250px] text-center"
        >
          {tooltipText}
          <div className="absolute left-1/2 -translate-x-1/2 top-full border-x-8 border-x-transparent border-t-8 border-t-stone-800 dark:border-t-stone-700" />
        </div>
      )}
    </div>
  );
};

export default TypeBadge;