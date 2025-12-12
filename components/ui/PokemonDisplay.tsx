/**
 * PokemonDisplay - Unified Pokemon display component
 *
 * Consolidates all Pokemon display functionality from:
 * - PokemonCardRenderer
 * - EnhancedPokemonCard
 * - PokemonTile
 * - PokemonAvatar
 *
 * Features:
 * - Multiple display variants (card, tile, avatar, compact, circular, listing)
 * - Type-based gradients and colors
 * - Responsive sizing
 * - Special badges for legendary/mythical/starter
 * - Glass morphism effects
 *
 * Variants:
 * - card: Full card with type gradient background, stats optional
 * - tile: Horizontal layout with image on left
 * - avatar: Circular badge-style display
 * - compact: Minimal inline display for lists
 * - circular: Same as avatar
 * - listing: Clean minimal card for Pokedex grids (no stats, no badges, just essentials)
 */

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { TypeBadge } from './TypeBadge';
import { cn } from '@/utils/cn';
import { cardHover } from '@/utils/animations';
import { TYPE_COLORS, TYPE_GRADIENTS } from '@/components/ui/design-system/glass-constants';

const FALLBACK_IMAGE = '/dextrendslogo.png';

interface PokemonType {
  type: {
    name: string;
  };
}

export interface PokemonDisplayProps {
  // Core data
  id?: number;
  name: string;
  sprite?: string;
  types?: PokemonType[] | string[];

  // Display options
  variant?: 'card' | 'tile' | 'avatar' | 'compact' | 'circular' | 'listing';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Special status
  isLegendary?: boolean;
  isMythical?: boolean;
  isStarter?: boolean;

  // Stats (optional)
  hp?: number;
  attack?: number;
  defense?: number;
  speed?: number;

  // Additional info
  generation?: number;
  evolutionStage?: number;

  // Behavior
  onClick?: () => void;
  showTypes?: boolean;
  showStats?: boolean;
  showBadges?: boolean;
  animated?: boolean;

  // Style
  className?: string;
  width?: number;
  height?: number;

  // Backward compatibility props for EliteFourTile, GymLeaderAvatar, ChampionTile aliases
  region?: string;
  type?: string;
  rank?: number;
  image?: string;
  team?: unknown[];
  signature?: string;
  strengths?: string[];
  weaknesses?: string[];
  quote?: string;
  strategy?: string;
  difficulty?: number;
  badge?: string;
  badgeImage?: string;
  funFact?: string;
  gymTown?: string;
  recommendedLevel?: number;
  acePokemon?: { name: string; id: number; sprite: string };
  title?: string;
  achievements?: string[];
}

// Size mappings
const sizeConfig = {
  xs: { container: 'w-20 h-20', image: 50, text: 'text-xs' },
  sm: { container: 'w-28 h-28', image: 70, text: 'text-sm' },
  md: { container: 'w-36 h-36', image: 90, text: 'text-base' },
  lg: { container: 'w-44 h-44', image: 110, text: 'text-lg' },
  xl: { container: 'w-52 h-52', image: 130, text: 'text-xl' },
};

/**
 * Main PokemonDisplay component
 */
export const PokemonDisplay: React.FC<PokemonDisplayProps> = memo(({
  id,
  name,
  sprite,
  types = [],
  variant = 'card',
  size = 'md',
  isLegendary = false,
  isMythical = false,
  isStarter = false,
  hp,
  attack,
  defense,
  speed,
  generation,
  evolutionStage,
  onClick,
  showTypes = true,
  showStats = false,
  showBadges = true,
  animated = true,
  className,
  width,
  height,
}) => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  // Get the image source with fallback
  const imageSrc = imgError || !sprite ? FALLBACK_IMAGE : sprite;

  // Normalize types to string array
  const typeNames = types.map(t => 
    typeof t === 'string' ? t : t.type.name
  );
  
  // Get primary type for gradient
  const primaryType = typeNames[0] || 'normal';
  const gradient = TYPE_GRADIENTS[primaryType as keyof typeof TYPE_GRADIENTS];
  
  // Determine image size
  const imageSize = width || height || sizeConfig[size].image;
  
  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      router.push(`/pokemon/${id}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Special badge
  const specialStatus = isLegendary ? 'Legendary' : 
                       isMythical ? 'Mythical' : 
                       isStarter ? 'Starter' : null;
  
  // Render based on variant
  switch (variant) {
    case 'circular':
    case 'avatar':
      return (
        <motion.div
          whileHover={animated ? { scale: 1.05 } : undefined}
          whileTap={animated ? { scale: 0.95 } : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View ${name}`}
          className={cn(
            'relative cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none focus-visible:rounded-full',
            sizeConfig[size].container,
            className
          )}
        >
          {/* Circular background with gradient */}
          <div className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-br',
            gradient,
            'backdrop-blur-sm'
          )} />
          
          {/* Glass overlay */}
          <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-sm" />
          
          {/* Pokemon image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={name}
              width={imageSize}
              height={imageSize}
              className="object-contain drop-shadow-lg"
              onError={() => setImgError(true)}
            />
          </div>
          
          {/* Special badge */}
          {showBadges && specialStatus && (
            <div className="absolute -top-1 -right-1 z-20">
              <div className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold text-white',
                isLegendary && 'bg-gradient-to-r from-yellow-500 to-amber-500',
                isMythical && 'bg-gradient-to-r from-amber-500 to-orange-500',
                isStarter && 'bg-gradient-to-r from-green-500 to-emerald-500'
              )}>
                {specialStatus}
              </div>
            </div>
          )}
        </motion.div>
      );
      
    case 'tile':
      return (
        <motion.div
          whileHover={animated ? cardHover : undefined}
          whileTap={animated ? { scale: 0.98 } : undefined}
          onClick={handleClick}
          className={cn(
            'relative p-4 rounded-xl cursor-pointer',
            'bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm',
            'border border-stone-200 dark:border-stone-700',
            'hover:shadow-lg transition-all duration-200',
            className
          )}
        >
          <div className="flex items-center gap-3">
            {/* Pokemon image */}
            <div className={cn(
              'relative rounded-lg overflow-hidden',
              'bg-gradient-to-br',
              gradient
            )}>
              <Image
                src={imageSrc}
                alt={name}
                width={imageSize}
                height={imageSize}
                className="object-contain p-2"
                onError={() => setImgError(true)}
              />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 dark:text-stone-300">
                  #{String(id).padStart(3, '0')}
                </span>
                {showBadges && specialStatus && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold text-white',
                    isLegendary && 'bg-yellow-500',
                    isMythical && 'bg-amber-500',
                    isStarter && 'bg-green-500'
                  )}>
                    {specialStatus}
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-stone-900 dark:text-white capitalize">
                {name}
              </h3>
              
              {showTypes && (
                <div className="flex gap-1 mt-1">
                  {typeNames.map(type => (
                    <TypeBadge key={type} type={type} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Stats */}
          {showStats && (hp || attack || defense || speed) && (
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {hp && (
                  <div>
                    <span className="text-stone-500">HP</span>
                    <div className="font-bold">{hp}</div>
                  </div>
                )}
                {attack && (
                  <div>
                    <span className="text-stone-500">ATK</span>
                    <div className="font-bold">{attack}</div>
                  </div>
                )}
                {defense && (
                  <div>
                    <span className="text-stone-500">DEF</span>
                    <div className="font-bold">{defense}</div>
                  </div>
                )}
                {speed && (
                  <div>
                    <span className="text-stone-500">SPD</span>
                    <div className="font-bold">{speed}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      );
      
    case 'compact':
      return (
        <motion.div
          whileHover={animated ? { x: 4 } : undefined}
          onClick={handleClick}
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
            'hover:bg-stone-100 dark:hover:bg-stone-800',
            'transition-colors duration-200',
            className
          )}
        >
          <Image
            src={imageSrc}
            alt={name}
            width={40}
            height={40}
            className="object-contain"
            onError={() => setImgError(true)}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-stone-900 dark:text-white truncate">
              {name}
            </div>
            {showTypes && (
              <div className="flex gap-1">
                {typeNames.map(type => (
                  <span key={type} className="text-xs text-stone-500">
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-stone-400">
            #{String(id).padStart(3, '0')}
          </span>
        </motion.div>
      );
      
    case 'listing':
      // Type-colored card for Pokedex grid
      // Single type = solid color, dual type = diagonal split
      // Using lower opacity for subtle, non-distracting look
      const type1Color = TYPE_COLORS[typeNames[0]] || '#A8A878';
      const type2Color = typeNames[1] ? TYPE_COLORS[typeNames[1]] : type1Color;
      const isDualType = typeNames.length >= 2 && typeNames[0] !== typeNames[1];

      // Convert hex to rgba with opacity
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      const type1ColorLight = hexToRgba(type1Color, 0.25);
      const type2ColorLight = hexToRgba(type2Color, 0.25);

      return (
        <motion.div
          whileHover={animated ? { y: -3 } : undefined}
          whileTap={animated ? { scale: 0.98 } : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View ${name}`}
          className={cn(
            'group relative overflow-hidden rounded-xl cursor-pointer',
            'h-full w-full aspect-[4/5]',
            'bg-white dark:bg-stone-800',
            'border border-stone-200 dark:border-stone-700',
            'transition-all duration-200',
            'hover:shadow-lg',
            'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none',
            className
          )}
        >
          {/* Type color overlay with low opacity */}
          <div
            className="absolute inset-0"
            style={{
              background: isDualType
                ? `linear-gradient(135deg, ${type1ColorLight} 50%, ${type2ColorLight} 50%)`
                : type1ColorLight
            }}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col p-2 sm:p-2.5">
            {/* Top row: Number */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] sm:text-xs font-bold text-stone-500 dark:text-stone-400">
                #{String(id).padStart(3, '0')}
              </span>
              {/* Type dots */}
              <div className="flex gap-1">
                {typeNames.slice(0, 2).map(type => (
                  <span
                    key={type}
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: TYPE_COLORS[type] || '#A8A878' }}
                    title={type}
                  />
                ))}
              </div>
            </div>

            {/* Pokemon Image - centered, larger */}
            <div className="flex-1 flex items-center justify-center -my-1">
              <Image
                src={imageSrc}
                alt={name}
                width={width || 88}
                height={height || 88}
                className="object-contain w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] drop-shadow group-hover:scale-110 transition-transform duration-200"
                onError={() => setImgError(true)}
              />
            </div>

            {/* Name - bottom */}
            <h3 className="text-center font-semibold text-stone-800 dark:text-stone-100 capitalize text-xs sm:text-sm leading-tight truncate">
              {name.replace(/-/g, ' ')}
            </h3>
          </div>
        </motion.div>
      );

    case 'card':
    default:
      return (
        <motion.div
          whileHover={animated ? cardHover : undefined}
          whileTap={animated ? { scale: 0.98 } : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`View ${name}`}
          className={cn(
            'relative overflow-hidden rounded-xl cursor-pointer',
            'bg-gradient-to-br',
            gradient,
            'p-4',
            'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none',
            className
          )}
        >
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-white/70 text-sm">
                  #{String(id).padStart(3, '0')}
                </span>
                <h3 className="text-xl font-bold text-white capitalize">
                  {name}
                </h3>
              </div>
              
              {showBadges && specialStatus && (
                <div className={cn(
                  'px-2 py-1 rounded-full text-xs font-bold text-white',
                  'bg-white/20 backdrop-blur-sm'
                )}>
                  {specialStatus}
                </div>
              )}
            </div>
            
            {/* Types */}
            {showTypes && (
              <div className="flex gap-1 mb-3">
                {typeNames.map(type => (
                  <TypeBadge key={type} type={type} />
                ))}
              </div>
            )}
            
            {/* Pokemon image */}
            <div className="flex justify-center">
              <Image
                src={imageSrc}
                alt={name}
                width={imageSize}
                height={imageSize}
                className="object-contain drop-shadow-2xl"
                onError={() => setImgError(true)}
              />
            </div>
            
            {/* Stats */}
            {showStats && (hp || attack || defense || speed) && (
              <div className="mt-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-2">
                  {hp && (
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">HP</span>
                      <span className="text-white font-bold">{hp}</span>
                    </div>
                  )}
                  {attack && (
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Attack</span>
                      <span className="text-white font-bold">{attack}</span>
                    </div>
                  )}
                  {defense && (
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Defense</span>
                      <span className="text-white font-bold">{defense}</span>
                    </div>
                  )}
                  {speed && (
                    <div className="flex justify-between">
                      <span className="text-white/70 text-sm">Speed</span>
                      <span className="text-white font-bold">{speed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
  }
});

PokemonDisplay.displayName = 'PokemonDisplay';

// Backward compatibility exports
export const PokemonCard = PokemonDisplay;
export const PokemonTile = (props: PokemonDisplayProps) =>
  <PokemonDisplay {...props} variant="tile" />;
export const PokemonAvatar = (props: PokemonDisplayProps) =>
  <PokemonDisplay {...props} variant="avatar" />;
export const EnhancedPokemonCard = (props: PokemonDisplayProps) =>
  <PokemonDisplay {...props} variant="card" showStats={true} />;
// Clean listing card for Pokedex grids - no stats, no badges
export const PokemonListingCard = (props: PokemonDisplayProps) =>
  <PokemonDisplay {...props} variant="listing" showStats={false} showBadges={false} />;

export default PokemonDisplay;