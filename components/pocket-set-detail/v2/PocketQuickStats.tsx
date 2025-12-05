import React from 'react';
import { cn } from '@/utils/cn';

interface PocketQuickStatsProps {
  cardCount: number;
  typeCount: number;
  rarityCount: number;
  exCount?: number;
}

/**
 * PocketQuickStats - Compact horizontal stats bar for Pocket sets
 */
export const PocketQuickStats: React.FC<PocketQuickStatsProps> = ({
  cardCount,
  typeCount,
  rarityCount,
  exCount = 0
}) => {
  const stats = [
    {
      label: 'Total Cards',
      value: cardCount.toString(),
      color: 'text-stone-900 dark:text-white'
    },
    {
      label: 'Types',
      value: typeCount.toString(),
      color: 'text-stone-900 dark:text-white'
    },
    {
      label: 'Rarities',
      value: rarityCount.toString(),
      color: 'text-stone-900 dark:text-white'
    },
    ...(exCount > 0 ? [{
      label: 'ex Cards',
      value: exCount.toString(),
      color: 'text-amber-600 dark:text-amber-400'
    }] : [])
  ];

  return (
    <div className="w-full bg-stone-50 dark:bg-stone-800/50 border-y border-stone-200/80 dark:border-stone-700/50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 divide-x divide-stone-200/80 dark:divide-stone-700/50">
          {stats.slice(0, 4).map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'flex-1 px-4 py-3 text-center',
                'min-w-[90px]'
              )}
            >
              <p className={cn('text-lg sm:text-xl font-bold', stat.color)}>
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PocketQuickStats;
