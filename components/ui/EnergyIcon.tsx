/**
 * EnergyIcon - Official Pokemon TCG Energy Symbol Icons
 *
 * Renders the circular energy symbols used on Pokemon TCG cards.
 * Each type has its own distinctive symbol matching the official designs.
 */

import React, { memo } from 'react';
import { cn } from '@/utils/cn';

export type EnergyType =
  | 'fire' | 'water' | 'grass' | 'electric' | 'lightning'
  | 'psychic' | 'fighting' | 'dark' | 'darkness' | 'metal' | 'steel'
  | 'fairy' | 'dragon' | 'colorless' | 'normal'
  | 'ice' | 'ground' | 'rock' | 'bug' | 'ghost' | 'poison' | 'flying';

export type EnergySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface EnergyIconProps {
  type: string;
  size?: EnergySize;
  className?: string;
  showBackground?: boolean;
}

// Size mappings
const sizes: Record<EnergySize, { container: string; icon: number }> = {
  xs: { container: 'w-4 h-4', icon: 16 },
  sm: { container: 'w-5 h-5', icon: 20 },
  md: { container: 'w-6 h-6', icon: 24 },
  lg: { container: 'w-8 h-8', icon: 32 },
  xl: { container: 'w-10 h-10', icon: 40 },
};

// Energy colors matching official TCG
const energyColors: Record<string, { bg: string; symbol: string }> = {
  fire: { bg: '#F03030', symbol: '#FFDD00' },
  water: { bg: '#2890F0', symbol: '#FFFFFF' },
  grass: { bg: '#38B830', symbol: '#FFDD00' },
  electric: { bg: '#F8C030', symbol: '#FFFFFF' },
  lightning: { bg: '#F8C030', symbol: '#FFFFFF' },
  psychic: { bg: '#A040A0', symbol: '#FFFFFF' },
  fighting: { bg: '#C03028', symbol: '#FFFFFF' },
  dark: { bg: '#4A4A4A', symbol: '#FFFFFF' },
  darkness: { bg: '#4A4A4A', symbol: '#FFFFFF' },
  metal: { bg: '#A8A8A8', symbol: '#FFFFFF' },
  steel: { bg: '#A8A8A8', symbol: '#FFFFFF' },
  fairy: { bg: '#EE99AC', symbol: '#FFFFFF' },
  dragon: { bg: '#7038F8', symbol: '#FFDD00' },
  colorless: { bg: '#E8E8E8', symbol: '#4A4A4A' },
  normal: { bg: '#E8E8E8', symbol: '#4A4A4A' },
  // Additional Pokemon types mapped to closest TCG energy
  ice: { bg: '#98D8D8', symbol: '#FFFFFF' },
  ground: { bg: '#E0C068', symbol: '#FFFFFF' },
  rock: { bg: '#B8A038', symbol: '#FFFFFF' },
  bug: { bg: '#A8B820', symbol: '#FFFFFF' },
  ghost: { bg: '#705898', symbol: '#FFFFFF' },
  poison: { bg: '#A040A0', symbol: '#FFFFFF' },
  flying: { bg: '#A890F0', symbol: '#FFFFFF' },
};

// SVG paths for each energy symbol
const energySymbols: Record<string, React.ReactNode> = {
  // Fire - Flame
  fire: (
    <path d="M12 2C12 2 8 6 8 10C8 12 9 14 11 15C10 13 10 11 12 9C14 11 14 13 13 15C15 14 16 12 16 10C16 6 12 2 12 2Z" />
  ),

  // Water - Droplet
  water: (
    <path d="M12 2L7 10C6 12 6 14 8 16C10 18 14 18 16 16C18 14 18 12 17 10L12 2ZM10 13C10 14 11 15 12 15C13 15 14 14 14 13" />
  ),

  // Grass - Leaf
  grass: (
    <path d="M12 3C7 3 4 8 4 12C4 16 7 20 12 20C12 20 12 16 12 14C12 11 10 9 7 9C10 6 14 6 17 9C14 9 12 11 12 14C12 16 12 20 12 20C17 20 20 16 20 12C20 8 17 3 12 3Z" />
  ),

  // Electric/Lightning - Lightning Bolt
  electric: (
    <path d="M13 2L6 13H11L10 22L18 10H13L14 2H13Z" />
  ),
  lightning: (
    <path d="M13 2L6 13H11L10 22L18 10H13L14 2H13Z" />
  ),

  // Psychic - Eye
  psychic: (
    <path d="M12 4C7 4 3 8 2 12C3 16 7 20 12 20C17 20 21 16 22 12C21 8 17 4 12 4ZM12 17C9 17 7 15 7 12C7 9 9 7 12 7C15 7 17 9 17 12C17 15 15 17 12 17ZM12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z" />
  ),

  // Fighting - Fist
  fighting: (
    <path d="M12 4C10 4 8 5 7 7L6 10L5 9C4 9 3 10 3 11L4 14L3 15C3 17 5 19 7 19H17C19 19 21 17 21 15V11C21 9 19 7 17 7H14L13 5C13 4 12.5 4 12 4ZM8 12H16V14H8V12Z" />
  ),

  // Dark/Darkness - Crescent Moon
  dark: (
    <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C14.5 21 16.8 20 18.4 18.4C13 18.4 9 14.5 9 9C9 6.5 10 4.2 12 3Z" />
  ),
  darkness: (
    <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C14.5 21 16.8 20 18.4 18.4C13 18.4 9 14.5 9 9C9 6.5 10 4.2 12 3Z" />
  ),

  // Metal/Steel - Hexagon
  metal: (
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2ZM12 5L17 8V16L12 19L7 16V8L12 5Z" />
  ),
  steel: (
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2ZM12 5L17 8V16L12 19L7 16V8L12 5Z" />
  ),

  // Fairy - Sparkle/Star
  fairy: (
    <path d="M12 2L14 8L20 8L15 12L17 18L12 14L7 18L9 12L4 8L10 8L12 2Z" />
  ),

  // Dragon - Claw/Fang
  dragon: (
    <path d="M12 2L8 8L4 6L6 12L2 14L8 14L8 20L12 14L16 20L16 14L22 14L18 12L20 6L16 8L12 2Z" />
  ),

  // Colorless - Star
  colorless: (
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16L5.5 21L8 13.5L2 9H9.5L12 2Z" />
  ),
  normal: (
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16L5.5 21L8 13.5L2 9H9.5L12 2Z" />
  ),

  // Ice - Snowflake
  ice: (
    <path d="M12 2V22M2 12H22M5 5L19 19M19 5L5 19" strokeWidth="2" fill="none" stroke="currentColor" />
  ),

  // Ground - Mountain/Earth
  ground: (
    <path d="M2 18L7 8L12 14L17 6L22 18H2Z" />
  ),

  // Rock - Crystal
  rock: (
    <path d="M12 2L4 10L8 20H16L20 10L12 2ZM12 6L16 10L14 16H10L8 10L12 6Z" />
  ),

  // Bug - Beetle
  bug: (
    <path d="M12 4C10 4 8 5 7 7L5 7C4 7 3 8 3 9V11C3 12 4 13 5 13L6 15C6 17 8 19 10 19H14C16 19 18 17 18 15L19 13C20 13 21 12 21 11V9C21 8 20 7 19 7L17 7C16 5 14 4 12 4ZM9 10C10 10 10 11 10 11C10 12 9 12 9 12C8 12 8 11 8 11C8 10 9 10 9 10ZM15 10C16 10 16 11 16 11C16 12 15 12 15 12C14 12 14 11 14 11C14 10 15 10 15 10Z" />
  ),

  // Ghost - Specter
  ghost: (
    <path d="M12 2C7 2 4 6 4 10V20L7 17L10 20L12 17L14 20L17 17L20 20V10C20 6 17 2 12 2ZM9 10C10 10 10 11 10 11C10 12 9 12 9 12C8 12 8 11 8 11C8 10 9 10 9 10ZM15 10C16 10 16 11 16 11C16 12 15 12 15 12C14 12 14 11 14 11C14 10 15 10 15 10Z" />
  ),

  // Poison - Skull/Drop
  poison: (
    <path d="M12 2C7 2 4 5 4 9V12C4 16 7 19 12 19C17 19 20 16 20 12V9C20 5 17 2 12 2ZM9 8C10 8 11 9 11 10C11 11 10 12 9 12C8 12 7 11 7 10C7 9 8 8 9 8ZM15 8C16 8 17 9 17 10C17 11 16 12 15 12C14 12 13 11 13 10C13 9 14 8 15 8ZM8 15H16V17H8V15Z" />
  ),

  // Flying - Wing
  flying: (
    <path d="M3 12C3 12 6 8 12 8C18 8 21 12 21 12C21 12 18 16 12 16C6 16 3 12 3 12ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
  ),
};

export const EnergyIcon: React.FC<EnergyIconProps> = memo(({
  type,
  size = 'md',
  className,
  showBackground = true,
}) => {
  const normalizedType = type.toLowerCase();
  const colors = energyColors[normalizedType] || energyColors.colorless;
  const symbol = energySymbols[normalizedType] || energySymbols.colorless;
  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        'transition-transform duration-150 ease-out',
        showBackground && 'shadow-sm',
        sizeConfig.container,
        className
      )}
      style={{
        backgroundColor: showBackground ? colors.bg : 'transparent',
      }}
      role="img"
      aria-label={`${type} energy`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[70%] h-[70%]"
        fill={colors.symbol}
        xmlns="http://www.w3.org/2000/svg"
      >
        {symbol}
      </svg>
    </div>
  );
});

EnergyIcon.displayName = 'EnergyIcon';

/**
 * EnergyBadge - Energy icon with type name label
 */
interface EnergyBadgeProps extends EnergyIconProps {
  showLabel?: boolean;
}

export const EnergyBadge: React.FC<EnergyBadgeProps> = memo(({
  type,
  size = 'sm',
  showLabel = true,
  className,
  ...props
}) => {
  const normalizedType = type.toLowerCase();
  const colors = energyColors[normalizedType] || energyColors.colorless;

  if (!showLabel) {
    return <EnergyIcon type={type} size={size} className={className} {...props} />;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
        'text-xs font-medium uppercase tracking-wide',
        'transition-all duration-150 ease-out',
        className
      )}
      style={{
        backgroundColor: `${colors.bg}20`,
        color: colors.bg,
      }}
    >
      <EnergyIcon type={type} size="xs" showBackground={false} />
      <span>{type}</span>
    </span>
  );
});

EnergyBadge.displayName = 'EnergyBadge';

export default EnergyIcon;
