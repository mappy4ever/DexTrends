import React from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface PocketSetInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cardCount: number;
}

interface PocketSetHeroProps {
  setInfo: PocketSetInfo;
}

/**
 * PocketSetHero - Clean hero section for Pocket set pages
 * Matches TCG set hero style without pricing
 */
export const PocketSetHero: React.FC<PocketSetHeroProps> = ({ setInfo }) => {
  return (
    <div className="relative w-full">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-amber-50/50 to-transparent dark:from-pink-950/30 dark:via-amber-950/20 dark:to-transparent" />

      {/* Content */}
      <div className="relative px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8">
        {/* Back button */}
        <Link
          href="/pocketmode/expansions"
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
          <span>Expansions</span>
        </Link>

        {/* Main hero content */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Emoji Logo */}
          <div className={cn(
            'flex-shrink-0',
            'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
            'rounded-2xl',
            'bg-white dark:bg-stone-800',
            'border border-stone-200/80 dark:border-stone-700/80',
            'shadow-lg shadow-stone-200/50 dark:shadow-stone-900/50',
            'flex items-center justify-center'
          )}>
            <span className="text-4xl sm:text-5xl md:text-6xl">{setInfo.emoji}</span>
          </div>

          {/* Title and meta */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-white leading-tight line-clamp-2">
              {setInfo.name}
            </h1>

            {/* Description */}
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-1.5 line-clamp-2">
              {setInfo.description}
            </p>

            {/* Quick stats - inline on mobile */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-semibold text-stone-900 dark:text-white">
                  {setInfo.cardCount}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">cards</span>
              </div>
              <div className="w-px h-4 bg-stone-200 dark:bg-stone-700" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Pocket
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PocketSetHero;
