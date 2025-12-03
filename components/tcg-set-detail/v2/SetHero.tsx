import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import type { CardSet } from '@/types/api/cards';

interface SetHeroProps {
  setInfo: CardSet;
  totalValue: number;
  cardCount: number;
}

/**
 * SetHero - Immersive, full-width hero for TCG set pages
 * Mobile-first design with gradient background and floating logo
 */
export const SetHero: React.FC<SetHeroProps> = ({
  setInfo,
  totalValue,
  cardCount
}) => {
  const releaseYear = React.useMemo(() => {
    if (!setInfo.releaseDate) return null;
    try {
      const date = new Date(setInfo.releaseDate);
      return isNaN(date.getTime()) ? null : date.getFullYear();
    } catch {
      return null;
    }
  }, [setInfo.releaseDate]);

  return (
    <div className="relative w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50/50 to-transparent dark:from-amber-950/30 dark:via-orange-950/20 dark:to-transparent" />

      {/* Content */}
      <div className="relative px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8">
        {/* Back button */}
        <Link
          href="/tcgexpansions"
          className={cn(
            'inline-flex items-center gap-1.5',
            'text-sm font-medium',
            'text-stone-500 dark:text-stone-400',
            'hover:text-stone-900 dark:hover:text-white',
            'transition-colors',
            'mb-4 -ml-1 py-1 px-1',
            'min-h-[44px]'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Sets</span>
        </Link>

        {/* Main hero content */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Logo */}
          <div className={cn(
            'flex-shrink-0',
            'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
            'rounded-2xl',
            'bg-white dark:bg-stone-800',
            'border border-stone-200/80 dark:border-stone-700/80',
            'shadow-lg shadow-stone-200/50 dark:shadow-stone-900/50',
            'flex items-center justify-center',
            'p-2.5 sm:p-3'
          )}>
            {setInfo.images?.logo ? (
              <img
                src={setInfo.images.logo}
                alt=""
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : setInfo.images?.symbol ? (
              <img
                src={setInfo.images.symbol}
                alt=""
                className="w-full h-full object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {setInfo.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Title and meta */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-white leading-tight line-clamp-2">
              {setInfo.name}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
              {setInfo.series && (
                <span className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                  {setInfo.series}
                </span>
              )}
              {setInfo.series && releaseYear && (
                <span className="text-stone-400 dark:text-stone-500">·</span>
              )}
              {releaseYear && (
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {releaseYear}
                </span>
              )}
            </div>

            {/* Quick stats - inline on mobile */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-stone-900 dark:text-white">
                  ${totalValue > 1000 ? `${(totalValue / 1000).toFixed(1)}k` : totalValue.toFixed(0)}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">value</span>
              </div>
              <div className="w-px h-4 bg-stone-200 dark:bg-stone-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-stone-900 dark:text-white">
                  {cardCount}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetHero;
