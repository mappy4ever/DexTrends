import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { TYPE_GRADIENTS, SHADOW, FOCUS } from './design-system/glass-constants';

interface TypeBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'solid' | 'gradient';
  showTooltip?: boolean;
}

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
  const [isVisible, setIsVisible] = useState(false);

  // Responsive sizing - smaller for mobile, no min-width constraints
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const typeKey = type.toLowerCase() as keyof typeof TYPE_GRADIENTS;
  const gradientClass = TYPE_GRADIENTS[typeKey] || TYPE_GRADIENTS.normal;
  const solidColor = POKEMON_TYPE_COLORS[typeKey] || POKEMON_TYPE_COLORS.normal;
  const tooltipText = TYPE_DESCRIPTIONS[typeKey] || '';
  const tooltipId = `type-tooltip-${typeKey}`;

  // Accessibility props for when tooltip is shown
  const accessibilityProps = showTooltip ? {
    tabIndex: 0,
    role: 'button' as const,
    'aria-describedby': isVisible ? tooltipId : undefined,
    'aria-label': `${type} type - press to show effectiveness info`,
  } : {
    'aria-label': `${type} type`,
  };

  const badge = variant === 'gradient' ? (
    <span
      className={cn(
        'rounded-full font-semibold text-white inline-flex items-center justify-center',
        SHADOW.sm,
        'bg-gradient-to-r',
        showTooltip && cn('cursor-pointer', FOCUS.styles.default),
        gradientClass,
        sizeClasses[size],
        className
      )}
      {...accessibilityProps}
    >
      {type.toUpperCase()}
    </span>
  ) : (
    <span
      className={cn(
        'rounded-full font-medium text-white inline-flex items-center justify-center',
        showTooltip && cn('cursor-pointer', FOCUS.styles.default),
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: solidColor,
        transform: 'translate3d(0,0,0)',
        WebkitTransform: 'translate3d(0,0,0)',
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible',
        willChange: 'auto'
      }}
      {...accessibilityProps}
    >
      {type.toUpperCase()}
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {badge}
      {isVisible && tooltipText && (
        <div
          id={tooltipId}
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