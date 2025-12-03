import React from 'react';
import { cn } from '@/utils/cn';
import type { CardSet } from '@/types/api/cards';

interface SetHeaderProps {
  setInfo: CardSet;
  cardCount: number;
  totalValue: number;
  averagePrice: number;
}

/**
 * SetHeader - Clean, minimal header for TCG set pages
 * Shows set logo, name, series, and key stats in a compact layout
 */
export const SetHeader: React.FC<SetHeaderProps> = ({
  setInfo,
  cardCount,
  totalValue,
  averagePrice
}) => {
  // Safe date parsing
  const releaseYear = React.useMemo(() => {
    if (!setInfo.releaseDate) return null;
    try {
      const date = new Date(setInfo.releaseDate);
      return isNaN(date.getTime()) ? null : date.getFullYear();
    } catch {
      return null;
    }
  }, [setInfo.releaseDate]);

  // Format currency safely
  const formatCurrency = (value: number, decimals: number = 0) => {
    if (!isFinite(value) || isNaN(value)) return '$0';
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  return (
    <div className="w-full">
      {/* Main header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Logo section */}
        <div className="flex items-center gap-4">
          {/* Set Logo */}
          {setInfo.images?.logo ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center p-2">
              <img
                src={setInfo.images.logo}
                alt={`${setInfo.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : setInfo.images?.symbol ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center p-2">
              <img
                src={setInfo.images.symbol}
                alt={`${setInfo.name} symbol`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {setInfo.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {/* Set symbol (if we have logo, show symbol too) */}
          {setInfo.images?.logo && setInfo.images?.symbol && (
            <div className="hidden sm:flex w-12 h-12 flex-shrink-0 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 items-center justify-center p-1.5">
              <img
                src={setInfo.images.symbol}
                alt={`${setInfo.name} symbol`}
                className="w-full h-full object-contain opacity-80"
              />
            </div>
          )}
        </div>

        {/* Title and meta */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 dark:text-white leading-tight">
            {setInfo.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-stone-600 dark:text-stone-300">
            {setInfo.series && (
              <span className="font-medium">{setInfo.series}</span>
            )}
            {releaseYear && (
              <>
                <span className="text-stone-400 dark:text-stone-500">•</span>
                <span>{releaseYear}</span>
              </>
            )}
            <span className="text-stone-400 dark:text-stone-500">•</span>
            <span>{cardCount} cards</span>
          </div>
        </div>
      </div>

      {/* Stats bar - horizontal scroll on mobile */}
      <div className="mt-5 sm:mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
        <div
          className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0 sm:grid sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label="Set statistics"
        >
          {/* Total Value */}
          <div
            className="flex-shrink-0 sm:flex-1 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 min-w-[130px]"
            role="listitem"
          >
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Total Value</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-0.5">
              {formatCurrency(totalValue)}
            </p>
          </div>

          {/* Average Price */}
          <div
            className="flex-shrink-0 sm:flex-1 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 min-w-[130px]"
            role="listitem"
          >
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Avg. Price</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-0.5">
              {formatCurrency(averagePrice, 2)}
            </p>
          </div>

          {/* Card Count */}
          <div
            className="flex-shrink-0 sm:flex-1 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 min-w-[130px]"
            role="listitem"
          >
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Total Cards</p>
            <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-0.5">
              {cardCount.toLocaleString()}
            </p>
          </div>

          {/* Printed Total */}
          {setInfo.printedTotal && setInfo.printedTotal > 0 && (
            <div
              className="flex-shrink-0 sm:flex-1 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 min-w-[130px]"
              role="listitem"
            >
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">Printed</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-0.5">
                {setInfo.printedTotal.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetHeader;
