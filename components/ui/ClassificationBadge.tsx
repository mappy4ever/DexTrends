/**
 * ClassificationBadge - Displays Pokemon classification tags
 *
 * Shows special classification badges for:
 * - Legendary (gold/amber)
 * - Mythical (pink/rose)
 * - Ultra Beast (purple/violet)
 * - Paradox Past (orange/earth tones)
 * - Paradox Future (cyan/tech blue)
 * - Starter (green/emerald)
 * - Regional forms (Alolan, Galarian, Hisuian, Paldean)
 * - Mega Evolution
 * - Gigantamax
 */

import React, { memo } from 'react';
import { cn } from '@/utils/cn';
import { FiZap, FiStar, FiGlobe } from 'react-icons/fi';
// Domain-specific icons - documented exceptions
import { GiSparkles, GiPortal, GiClockwork, GiSunrise } from 'react-icons/gi';

export type ClassificationBadgeType =
  | 'legendary'
  | 'mythical'
  | 'ultra-beast'
  | 'paradox-past'
  | 'paradox-future'
  | 'starter'
  | 'alolan'
  | 'galarian'
  | 'hisuian'
  | 'paldean'
  | 'mega'
  | 'mega-x'
  | 'mega-y'
  | 'gigantamax';

interface ClassificationBadgeProps {
  type: ClassificationBadgeType;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

// Badge configuration for each type
const BADGE_CONFIG: Record<
  ClassificationBadgeType,
  {
    label: string;
    colors: string;
    icon?: React.ReactNode;
    darkColors?: string;
  }
> = {
  legendary: {
    label: 'Legendary',
    colors: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
    icon: <FiZap className="w-3 h-3" />,
  },
  mythical: {
    label: 'Mythical',
    colors: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
    icon: <GiSparkles className="w-3 h-3" />,
  },
  'ultra-beast': {
    label: 'Ultra Beast',
    colors: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
    icon: <GiPortal className="w-3 h-3" />,
  },
  'paradox-past': {
    label: 'Paradox (Past)',
    colors: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
    icon: <GiSunrise className="w-3 h-3" />,
  },
  'paradox-future': {
    label: 'Paradox (Future)',
    colors: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
    icon: <GiClockwork className="w-3 h-3" />,
  },
  starter: {
    label: 'Starter',
    colors: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white',
    icon: <FiStar className="w-3 h-3" />,
  },
  alolan: {
    label: 'Alolan Form',
    colors: 'bg-gradient-to-r from-sky-400 to-cyan-500 text-white',
    icon: <FiGlobe className="w-3 h-3" />,
  },
  galarian: {
    label: 'Galarian Form',
    colors: 'bg-gradient-to-r from-indigo-400 to-violet-500 text-white',
    icon: <FiGlobe className="w-3 h-3" />,
  },
  hisuian: {
    label: 'Hisuian Form',
    colors: 'bg-gradient-to-r from-stone-500 to-stone-600 text-white',
    icon: <FiGlobe className="w-3 h-3" />,
  },
  paldean: {
    label: 'Paldean Form',
    colors: 'bg-gradient-to-r from-red-400 to-orange-500 text-white',
    icon: <FiGlobe className="w-3 h-3" />,
  },
  mega: {
    label: 'Mega',
    colors: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
    icon: <GiSparkles className="w-3 h-3" />,
  },
  'mega-x': {
    label: 'Mega X',
    colors: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white',
    icon: <GiSparkles className="w-3 h-3" />,
  },
  'mega-y': {
    label: 'Mega Y',
    colors: 'bg-gradient-to-r from-red-500 to-pink-600 text-white',
    icon: <GiSparkles className="w-3 h-3" />,
  },
  gigantamax: {
    label: 'Gigantamax',
    colors: 'bg-gradient-to-r from-red-500 to-orange-600 text-white',
    icon: <GiSparkles className="w-3 h-3" />,
  },
};

// Size configurations
const SIZE_CONFIG = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-0.5',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export const ClassificationBadge: React.FC<ClassificationBadgeProps> = memo(({
  type,
  size = 'sm',
  showIcon = true,
  className,
}) => {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full shadow-sm',
        'transition-transform hover:scale-105',
        config.colors,
        SIZE_CONFIG[size],
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
});

ClassificationBadge.displayName = 'ClassificationBadge';

// Helper to detect form type from Pokemon name
export function detectFormType(pokemonName: string): ClassificationBadgeType | null {
  const name = pokemonName.toLowerCase();

  if (name.includes('-mega-x')) return 'mega-x';
  if (name.includes('-mega-y')) return 'mega-y';
  if (name.includes('-mega')) return 'mega';
  if (name.includes('-gmax')) return 'gigantamax';
  if (name.includes('-alola')) return 'alolan';
  if (name.includes('-galar')) return 'galarian';
  if (name.includes('-hisui')) return 'hisuian';
  if (name.includes('-paldea')) return 'paldean';

  return null;
}

// Component to render all applicable badges for a Pokemon
interface PokemonBadgesProps {
  pokemonId: number;
  pokemonName: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isUltraBeast?: boolean;
  isParadoxPast?: boolean;
  isParadoxFuture?: boolean;
  isStarter?: boolean;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const PokemonBadges: React.FC<PokemonBadgesProps> = memo(({
  pokemonName,
  isLegendary,
  isMythical,
  isUltraBeast,
  isParadoxPast,
  isParadoxFuture,
  isStarter,
  size = 'sm',
  showIcon = true,
  className,
}) => {
  const badges: ClassificationBadgeType[] = [];

  // Add classification badges
  if (isLegendary) badges.push('legendary');
  if (isMythical) badges.push('mythical');
  if (isUltraBeast) badges.push('ultra-beast');
  if (isParadoxPast) badges.push('paradox-past');
  if (isParadoxFuture) badges.push('paradox-future');
  if (isStarter) badges.push('starter');

  // Add form badge
  const formType = detectFormType(pokemonName);
  if (formType) badges.push(formType);

  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map((badge) => (
        <ClassificationBadge
          key={badge}
          type={badge}
          size={size}
          showIcon={showIcon}
        />
      ))}
    </div>
  );
});

PokemonBadges.displayName = 'PokemonBadges';

export default ClassificationBadge;
