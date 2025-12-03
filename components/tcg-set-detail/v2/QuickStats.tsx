import React from 'react';
import { cn } from '@/utils/cn';

interface QuickStatsProps {
  totalValue: number;
  averagePrice: number;
  cardCount: number;
  printedTotal?: number;
  rarityCount?: number;
}

/**
 * QuickStats - Compact horizontal stats bar
 * Scrollable on mobile, grid on desktop
 */
export const QuickStats: React.FC<QuickStatsProps> = ({
  totalValue,
  averagePrice,
  cardCount,
  printedTotal,
  rarityCount
}) => {
  const formatPrice = (value: number): string => {
    if (!isFinite(value) || isNaN(value)) return '$0';
    if (value >= 10000) return `$${(value / 1000).toFixed(1)}k`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}k`;
    return `$${value.toFixed(2)}`;
  };

  const stats = [
    {
      label: 'Total Value',
      value: formatPrice(totalValue),
      color: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Avg Price',
      value: formatPrice(averagePrice),
      color: 'text-stone-900 dark:text-white'
    },
    {
      label: 'Cards',
      value: cardCount.toString(),
      color: 'text-stone-900 dark:text-white'
    },
    ...(printedTotal && printedTotal > 0 ? [{
      label: 'Printed',
      value: printedTotal.toString(),
      color: 'text-stone-900 dark:text-white'
    }] : []),
    ...(rarityCount && rarityCount > 0 ? [{
      label: 'Rarities',
      value: rarityCount.toString(),
      color: 'text-stone-900 dark:text-white'
    }] : [])
  ];

  return (
    <div className="w-full bg-stone-50 dark:bg-stone-800/50 border-y border-stone-200/80 dark:border-stone-700/50">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 divide-x divide-stone-200/80 dark:divide-stone-700/50">
          {stats.slice(0, 4).map((stat, index) => (
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

export default QuickStats;
