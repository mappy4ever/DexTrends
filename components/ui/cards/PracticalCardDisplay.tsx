/**
 * PracticalCardDisplay - Shows card info at a glance like pokemongohub
 *
 * Displays:
 * - Card image with rarity glow
 * - Name + Type + HP header
 * - Rarity + Set number + Price
 * - Attacks with damage
 * - Weakness and retreat cost
 *
 * All visible without clicking into the card
 */

import React, { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { FiHeart, FiZoomIn, FiExternalLink } from 'react-icons/fi';

// Type colors for borders and accents
const TYPE_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  grass: { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  fire: { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  water: { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  lightning: { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  electric: { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  psychic: { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  fighting: { border: 'border-orange-600', bg: 'bg-orange-600', text: 'text-orange-600 dark:text-orange-400' },
  darkness: { border: 'border-stone-700', bg: 'bg-stone-700', text: 'text-stone-700 dark:text-stone-300' },
  dark: { border: 'border-stone-700', bg: 'bg-stone-700', text: 'text-stone-700 dark:text-stone-300' },
  metal: { border: 'border-slate-500', bg: 'bg-slate-500', text: 'text-slate-600 dark:text-slate-300' },
  steel: { border: 'border-slate-500', bg: 'bg-slate-500', text: 'text-slate-600 dark:text-slate-300' },
  dragon: { border: 'border-indigo-600', bg: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
  fairy: { border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  colorless: { border: 'border-stone-400', bg: 'bg-stone-400', text: 'text-stone-600 dark:text-stone-300' },
  normal: { border: 'border-stone-400', bg: 'bg-stone-400', text: 'text-stone-600 dark:text-stone-300' },
};

// Rarity to visual mapping
const RARITY_STYLES: Record<string, { glow: string; badge: string; symbol: string }> = {
  '◊': { glow: '', badge: 'bg-stone-200 dark:bg-stone-700', symbol: '♦' },
  '◊◊': { glow: '', badge: 'bg-stone-300 dark:bg-stone-600', symbol: '♦♦' },
  '◊◊◊': { glow: 'ring-2 ring-amber-400/50', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300', symbol: '♦♦♦' },
  '◊◊◊◊': { glow: 'ring-2 ring-amber-500/60', badge: 'bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200', symbol: '♦♦♦♦' },
  '★': { glow: 'ring-2 ring-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300', symbol: '★' },
  '☆☆': { glow: 'ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/30', badge: 'bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-800/50 dark:to-amber-800/50', symbol: '★★' },
  'Crown': { glow: 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/30', badge: 'bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800/50 dark:to-pink-800/50', symbol: '♕' },
  'immersive': { glow: 'ring-2 ring-pink-500 shadow-xl shadow-pink-500/40', badge: 'bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50', symbol: '★★★' },
};

// Energy icon component
const EnergyIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
  const colors = TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.colorless;
  return (
    <div
      className={cn('rounded-full flex items-center justify-center', colors.bg)}
      style={{ width: size, height: size }}
    >
      <span className="text-white text-[8px] font-bold">
        {type.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

interface Attack {
  name: string;
  cost?: string[];
  damage?: string;
  text?: string;
}

interface PracticalCardDisplayProps {
  // Card data
  id: string;
  name: string;
  image: string;
  hp?: string | number;
  type?: string;
  types?: string[];
  rarity?: string;
  setName?: string;
  setNumber?: string;
  attacks?: Attack[];
  weakness?: { type: string; value: string }[];
  retreatCost?: string[];
  price?: number;

  // Display options
  variant?: 'compact' | 'detailed' | 'grid';
  showAttacks?: boolean;
  showPrice?: boolean;

  // Actions
  onFavorite?: () => void;
  onMagnify?: () => void;
  isFavorited?: boolean;

  // Link
  href?: string;

  className?: string;
}

export const PracticalCardDisplay = memo(({
  id,
  name,
  image,
  hp,
  type,
  types,
  rarity,
  setName,
  setNumber,
  attacks = [],
  weakness,
  retreatCost,
  price,
  variant = 'detailed',
  showAttacks = true,
  showPrice = true,
  onFavorite,
  onMagnify,
  isFavorited = false,
  href,
  className,
}: PracticalCardDisplayProps) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine primary type
  const primaryType = type || types?.[0] || 'colorless';
  const typeStyle = TYPE_COLORS[primaryType.toLowerCase()] || TYPE_COLORS.colorless;

  // Get rarity style
  const rarityStyle = rarity ? RARITY_STYLES[rarity] || RARITY_STYLES['◊'] : null;

  const CardContent = (
    <motion.div
      className={cn(
        'relative bg-white dark:bg-stone-800 rounded-xl overflow-hidden',
        'border-2 transition-all duration-200',
        typeStyle.border,
        rarityStyle?.glow,
        isHovered && 'shadow-lg scale-[1.02]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card Image Section */}
      <div className="relative aspect-[2.5/3.5] bg-stone-100 dark:bg-stone-900">
        {!imageError ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-2"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-stone-400 text-sm">No Image</span>
          </div>
        )}

        {/* Quick Action Buttons - Visible on Hover */}
        <div className={cn(
          'absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          {onFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavorite(); }}
              className={cn(
                'p-2 rounded-full shadow-md transition-colors',
                isFavorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-stone-700/90 text-stone-600 dark:text-stone-300 hover:bg-red-100 dark:hover:bg-red-900/50'
              )}
            >
              <FiHeart className={cn('w-4 h-4', isFavorited && 'fill-current')} />
            </button>
          )}
          {onMagnify && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMagnify(); }}
              className="p-2 rounded-full bg-white/90 dark:bg-stone-700/90 text-stone-600 dark:text-stone-300 shadow-md hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Rarity Badge */}
        {rarityStyle && (
          <div className={cn(
            'absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold',
            rarityStyle.badge
          )}>
            {rarityStyle.symbol}
          </div>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-3 space-y-2">
        {/* Name + Type + HP Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm truncate">
              {name}
            </h3>
            {setName && setNumber && (
              <p className="text-xs text-stone-500 dark:text-stone-300 truncate">
                {setName} · {setNumber}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <EnergyIcon type={primaryType} size={18} />
            {hp && (
              <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
                {hp}
              </span>
            )}
          </div>
        </div>

        {/* Price Row */}
        {showPrice && price !== undefined && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Market Price</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              ${price.toFixed(2)}
            </span>
          </div>
        )}

        {/* Attacks Section - Compact */}
        {showAttacks && attacks.length > 0 && variant === 'detailed' && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-2 space-y-1.5">
            {attacks.slice(0, 2).map((attack, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {/* Energy Cost */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    {attack.cost?.slice(0, 3).map((energy, i) => (
                      <EnergyIcon key={i} type={energy} size={14} />
                    ))}
                    {(attack.cost?.length || 0) > 3 && (
                      <span className="text-[10px] text-stone-400">+{(attack.cost?.length || 0) - 3}</span>
                    )}
                  </div>
                  <span className="text-stone-700 dark:text-stone-300 truncate">
                    {attack.name}
                  </span>
                </div>
                {attack.damage && (
                  <span className="font-bold text-stone-900 dark:text-white flex-shrink-0 ml-2">
                    {attack.damage}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Weakness & Retreat Row */}
        {variant === 'detailed' && (weakness || retreatCost) && (
          <div className="flex items-center justify-between text-xs border-t border-stone-200 dark:border-stone-700 pt-2">
            {weakness && weakness.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-stone-500">Weak:</span>
                <EnergyIcon type={weakness[0].type} size={14} />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {weakness[0].value}
                </span>
              </div>
            )}
            {retreatCost && retreatCost.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-stone-500">Retreat:</span>
                <div className="flex gap-0.5">
                  {retreatCost.map((_, i) => (
                    <EnergyIcon key={i} type="colorless" size={14} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  // Wrap in Link if href provided
  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
});

PracticalCardDisplay.displayName = 'PracticalCardDisplay';

/**
 * Grid wrapper for consistent card layouts
 */
export const PracticalCardGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn(
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4',
    className
  )}>
    {children}
  </div>
);

export default PracticalCardDisplay;
