/**
 * EvolutionItemIcon - Displays evolution item sprites from Pokemon Showdown
 *
 * Uses Pokemon Showdown's item sprite repository for evolution stones,
 * held items, and other evolution-related items.
 */

import React, { memo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

// Pokemon Showdown item sprites URL
const SHOWDOWN_ITEMS_URL = 'https://play.pokemonshowdown.com/sprites/itemicons';

// Map PokeAPI item names to Showdown sprite filenames
// Most items use the same name format, but some need mapping
const ITEM_SPRITE_MAP: Record<string, string> = {
  // Evolution Stones
  'fire-stone': 'firestone',
  'water-stone': 'waterstone',
  'thunder-stone': 'thunderstone',
  'leaf-stone': 'leafstone',
  'moon-stone': 'moonstone',
  'sun-stone': 'sunstone',
  'shiny-stone': 'shinystone',
  'dusk-stone': 'duskstone',
  'dawn-stone': 'dawnstone',
  'ice-stone': 'icestone',
  'oval-stone': 'ovalstone',

  // Trade Evolution Items
  'kings-rock': 'kingsrock',
  'metal-coat': 'metalcoat',
  'dragon-scale': 'dragonscale',
  'upgrade': 'upgrade',
  'dubious-disc': 'dubiousdisc',
  'protector': 'protector',
  'electirizer': 'electirizer',
  'magmarizer': 'magmarizer',
  'reaper-cloth': 'reapercloth',
  'prism-scale': 'prismscale',

  // Held Item Evolutions
  'razor-fang': 'razorfang',
  'razor-claw': 'razorclaw',
  'deep-sea-tooth': 'deepseatooth',
  'deep-sea-scale': 'deepseascale',
  'sachet': 'sachet',
  'whipped-dream': 'whippeddream',

  // Regional Evolution Items
  'galarica-cuff': 'galaricacuff',
  'galarica-wreath': 'galaricawreath',
  'linking-cord': 'linkingcord',
  'black-augurite': 'blackaugurite',
  'peat-block': 'peatblock',

  // Armor Evolution Items
  'auspicious-armor': 'auspiciousarmor',
  'malicious-armor': 'maliciousarmor',

  // Pot Evolution Items (Polteageist)
  'chipped-pot': 'chippedpot',
  'cracked-pot': 'crackedpot',

  // Apple Evolution Items (Applin)
  'sweet-apple': 'sweetapple',
  'tart-apple': 'tartapple',
  'syrupy-apple': 'syrupyapple',

  // Sweet Evolution Items (Alcremie)
  'strawberry-sweet': 'strawberrysweet',
  'love-sweet': 'lovesweet',
  'berry-sweet': 'berrysweet',
  'clover-sweet': 'cloversweet',
  'flower-sweet': 'flowersweet',
  'star-sweet': 'starsweet',
  'ribbon-sweet': 'ribbonsweet',

  // Scroll Evolution Items
  'scroll-of-darkness': 'scrollofdarkness',
  'scroll-of-waters': 'scrollofwaters',

  // Misc Evolution Items
  'leaders-crest': 'leaderscrest',
  'masterpiece-teacup': 'masterpieceteacup',
  'unremarkable-teacup': 'unremarkableteacup',
  'metal-alloy': 'metalalloy',
};

// Size configurations
const SIZE_CONFIG = {
  xs: { width: 16, height: 16, className: 'w-4 h-4' },
  sm: { width: 24, height: 24, className: 'w-6 h-6' },
  md: { width: 32, height: 32, className: 'w-8 h-8' },
  lg: { width: 40, height: 40, className: 'w-10 h-10' },
};

interface EvolutionItemIconProps {
  item: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const EvolutionItemIcon: React.FC<EvolutionItemIconProps> = memo(({
  item,
  size = 'sm',
  showTooltip = true,
  className,
}) => {
  const [imgError, setImgError] = useState(false);

  // Get the mapped sprite name or convert kebab-case to lowercase
  const spriteName = ITEM_SPRITE_MAP[item] || item.replace(/-/g, '').toLowerCase();
  const spriteUrl = `${SHOWDOWN_ITEMS_URL}/${spriteName}.png`;

  // Format item name for display
  const formatItemName = (itemName: string): string => {
    return itemName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayName = formatItemName(item);
  const sizeConfig = SIZE_CONFIG[size];

  // If image failed to load, show a fallback
  if (imgError) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded bg-stone-200 dark:bg-stone-700',
          'text-stone-500 dark:text-stone-400 text-xs font-medium',
          sizeConfig.className,
          className
        )}
        title={showTooltip ? displayName : undefined}
      >
        ?
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      title={showTooltip ? displayName : undefined}
    >
      <Image
        src={spriteUrl}
        alt={displayName}
        width={sizeConfig.width}
        height={sizeConfig.height}
        className={cn('object-contain', sizeConfig.className)}
        onError={() => setImgError(true)}
        unoptimized // Showdown sprites are small PNGs, no need for optimization
      />
    </span>
  );
});

EvolutionItemIcon.displayName = 'EvolutionItemIcon';

// Component for displaying item with label
interface EvolutionItemDisplayProps {
  item: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'right' | 'bottom';
  className?: string;
}

export const EvolutionItemDisplay: React.FC<EvolutionItemDisplayProps> = memo(({
  item,
  size = 'sm',
  showLabel = true,
  labelPosition = 'right',
  className,
}) => {
  const formatItemName = (itemName: string): string => {
    return itemName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className={cn(
        'flex items-center',
        labelPosition === 'bottom' ? 'flex-col gap-0.5' : 'gap-1.5',
        className
      )}
    >
      <EvolutionItemIcon item={item} size={size} showTooltip={!showLabel} />
      {showLabel && (
        <span
          className={cn(
            'text-stone-600 dark:text-stone-300 font-medium',
            size === 'xs' && 'text-[10px]',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {formatItemName(item)}
        </span>
      )}
    </div>
  );
});

EvolutionItemDisplay.displayName = 'EvolutionItemDisplay';

// Helper to check if an item has a known sprite
export function hasItemSprite(item: string): boolean {
  const spriteName = ITEM_SPRITE_MAP[item] || item.replace(/-/g, '').toLowerCase();
  // We assume most evolution items have sprites in Showdown
  // This is a best-effort check
  return Boolean(spriteName);
}

export default EvolutionItemIcon;
