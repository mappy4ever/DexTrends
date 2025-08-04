import React from 'react';
import { cn } from '@/utils/cn';

interface TierBadgeProps {
  tier: string;
  format?: 'singles' | 'doubles' | 'national-dex';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Tier color mappings based on competitive viability
const tierColors: Record<string, string> = {
  // Standard tiers
  'Uber': 'bg-purple-600',
  'OU': 'bg-blue-600',
  'UUBL': 'bg-blue-500',
  'UU': 'bg-green-600',
  'RUBL': 'bg-green-500',
  'RU': 'bg-yellow-600',
  'NUBL': 'bg-yellow-500',
  'NU': 'bg-orange-600',
  'PUBL': 'bg-orange-500',
  'PU': 'bg-red-600',
  '(PU)': 'bg-red-500',
  'ZU': 'bg-red-700',
  'NFE': 'bg-gray-600',
  'LC': 'bg-pink-600',
  'LC Uber': 'bg-pink-700',
  
  // Special tiers
  'AG': 'bg-black',
  'Illegal': 'bg-gray-800',
  'Unreleased': 'bg-gray-700',
  
  // VGC/Doubles tiers
  'DOU': 'bg-indigo-600',
  'DUU': 'bg-indigo-500',
  'DNU': 'bg-indigo-400',
  
  // National Dex tiers
  'ND': 'bg-teal-600',
  'ND UU': 'bg-teal-500',
  'ND RU': 'bg-teal-400',
};

// Tier descriptions for tooltips
const tierDescriptions: Record<string, string> = {
  'AG': 'Anything Goes - No restrictions',
  'Uber': 'Uber - Most powerful Pokemon',
  'OU': 'OverUsed - Standard competitive tier',
  'UUBL': 'UU Banlist - Too strong for UU',
  'UU': 'UnderUsed - Below OU in usage',
  'RUBL': 'RU Banlist - Too strong for RU',
  'RU': 'RarelyUsed - Below UU in usage',
  'NUBL': 'NU Banlist - Too strong for NU',
  'NU': 'NeverUsed - Below RU in usage',
  'PUBL': 'PU Banlist - Too strong for PU',
  'PU': 'Partially Used - Below NU in usage',
  '(PU)': 'Predicted to drop to PU',
  'ZU': 'Zero Used - Below PU in usage',
  'NFE': 'Not Fully Evolved',
  'LC': 'Little Cup - Unevolved Pokemon only',
  'LC Uber': 'Little Cup Uber - Banned from LC',
  'Illegal': 'Not available in this generation',
  'Unreleased': 'Not yet released',
  'DOU': 'Doubles OverUsed',
  'DUU': 'Doubles UnderUsed',
  'DNU': 'Doubles NeverUsed',
  'ND': 'National Dex OU',
  'ND UU': 'National Dex UnderUsed',
  'ND RU': 'National Dex RarelyUsed',
};

const formatLabels: Record<string, string> = {
  'singles': 'Singles',
  'doubles': 'Doubles',
  'national-dex': 'Nat Dex'
};

export function TierBadge({ 
  tier, 
  format = 'singles', 
  size = 'md',
  className 
}: TierBadgeProps) {
  if (!tier) return null;
  
  // Clean tier name (remove parentheses for color lookup but keep for display)
  const cleanTier = tier.replace(/[()]/g, '');
  const isParenthetical = tier.startsWith('(') && tier.endsWith(')');
  const color = tierColors[cleanTier] || 'bg-gray-400';
  
  // Remove D prefix for doubles tiers when shown in doubles format context
  const displayTier = (format === 'doubles' && tier.startsWith('D')) 
    ? tier.substring(1) 
    : tier;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const description = tierDescriptions[cleanTier];
  const formatLabel = formatLabels[format];
  
  return (
    <div className="inline-flex items-center gap-1">
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium text-white',
          color,
          sizeClasses[size],
          isParenthetical && 'opacity-75',
          className
        )}
        style={{ 
          transform: 'translate3d(0,0,0)',
          WebkitTransform: 'translate3d(0,0,0)',
          backfaceVisibility: 'visible',
          WebkitBackfaceVisibility: 'visible',
          willChange: 'auto'
        }}
        title={description ? `${description}${format !== 'singles' ? ` (${formatLabel})` : ''}` : tier}
      >
        {displayTier}
      </span>
      {format !== 'singles' && (
        <span className={cn(
          'text-gray-500',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {formatLabel}
        </span>
      )}
    </div>
  );
}

// Compound component for displaying multiple tiers
interface TierBadgeGroupProps {
  tiers: {
    singles?: string | null;
    doubles?: string | null;
    nationalDex?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TierBadgeGroup({ tiers, size = 'md', className }: TierBadgeGroupProps) {
  const badges = [];
  
  if (tiers.singles) {
    badges.push(
      <TierBadge 
        key="singles" 
        tier={tiers.singles} 
        format="singles" 
        size={size} 
      />
    );
  }
  
  if (tiers.doubles) {
    badges.push(
      <TierBadge 
        key="doubles" 
        tier={tiers.doubles} 
        format="doubles" 
        size={size} 
      />
    );
  }
  
  if (tiers.nationalDex) {
    badges.push(
      <TierBadge 
        key="national-dex" 
        tier={tiers.nationalDex} 
        format="national-dex" 
        size={size} 
      />
    );
  }
  
  if (badges.length === 0) return null;
  
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {badges}
    </div>
  );
}