import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { GlassContainer } from './design-system/GlassContainer';
import { RarityIcon } from './RarityIcon';
import type { CardSet } from '@/types/api/cards';

interface EnhancedSetHeaderProps {
  setInfo: CardSet;
  cardCount: number;
  statistics: {
    rarityDistribution: Record<string, number>;
    valueByRarity: Record<string, { total: number; average: number; count: number }>;
    highestValueCards: Array<{ name: string; marketPrice: number; rarity?: string; images: { small: string } }>;
  };
  onScrollToCards?: () => void;
}

// Circular Progress Ring Component
const CircularProgress: React.FC<{
  value: number;
  maxValue: number;
  label: string;
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ value, maxValue, label, icon, color, size = 'md' }) => {
  const sizeConfig = {
    sm: { diameter: 80, strokeWidth: 6, fontSize: 'text-xs' },
    md: { diameter: 100, strokeWidth: 8, fontSize: 'text-sm' },
    lg: { diameter: 120, strokeWidth: 10, fontSize: 'text-base' }
  };
  
  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / maxValue) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={config.diameter} height={config.diameter}>
        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-stone-200 dark:text-stone-700"
        />
        {/* Progress circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${config.diameter / 2} ${config.diameter / 2})`}
          className="transition-all duration-500 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.split(' ')[0]} />
            <stop offset="100%" stopColor={color.split(' ')[1] || color.split(' ')[0]} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(config.fontSize, 'font-bold text-stone-700 dark:text-stone-300')}>
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] text-stone-500 dark:text-stone-400">{label}</span>
      </div>
    </div>
  );
};

export const EnhancedSetHeader: React.FC<EnhancedSetHeaderProps> = ({
  setInfo,
  cardCount,
  statistics,
  onScrollToCards
}) => {
  // Calculate total set value
  const totalValue = Object.values(statistics.valueByRarity).reduce(
    (sum, data) => sum + data.total,
    0
  );

  // Get top rarities by count
  const topRarities = Object.entries(statistics.rarityDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <GlassContainer
      variant="gradient"
      blur="xl"
      rounded="2xl"
      padding="none"
      className="overflow-hidden"
    >
      <div className="relative">
        {/* Minimal Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-pink-600/5 to-amber-600/5" />
        
        {/* Compact Content */}
        <div className="relative z-10 p-4 md:p-6">
          {/* Compact Header - Logo and Name Side by Side */}
          <div className="flex items-center gap-4 mb-4">
            {/* Set Logo */}
            {setInfo.images?.logo && (
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  <Image
                    src={setInfo.images.logo}
                    alt={setInfo.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            )}
            
            {/* Set Name and Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-200">
                {setInfo.name}
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {setInfo.series} • {new Date(setInfo.releaseDate).toLocaleDateString()}
              </p>
            </div>
            
            {/* Set Symbol */}
            {setInfo.images?.symbol && (
              <div className="flex-shrink-0 hidden md:block">
                <Image
                  src={setInfo.images.symbol}
                  alt={`${setInfo.name} symbol`}
                  width={30}
                  height={30}
                  className="opacity-60"
                />
              </div>
            )}
          </div>
          
          {/* Compact Stat Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Total Cards</span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{cardCount}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Total Value</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">${totalValue.toFixed(0)}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Rarities</span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{Object.keys(statistics.rarityDistribution).length}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-stone-800/50 rounded-lg border border-stone-200/50 dark:border-stone-700/50">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Avg Value</span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-100">${(totalValue / cardCount).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

// Helper component for stat pills (keeping for backward compatibility)
const StatPill: React.FC<{
  icon: string;
  label: string;
  value: string;
  gradient: string;
}> = ({ icon, label, value, gradient }) => (
  <div className={cn(
    'px-3 py-2 rounded-full',
    'backdrop-blur-md bg-white/60 dark:bg-stone-800/60',
    'border border-white/50 dark:border-stone-700/50',
    'flex items-center gap-2',
    'hover:scale-105 transition-transform duration-200'
  )}>
    <span className="text-base">{icon}</span>
    <div className="flex flex-col">
      <span className="text-[10px] text-stone-500 dark:text-stone-400">{label}</span>
      <span className={cn(
        'text-xs font-bold bg-gradient-to-r bg-clip-text text-transparent',
        gradient
      )}>
        {value}
      </span>
    </div>
  </div>
);

export default EnhancedSetHeader;