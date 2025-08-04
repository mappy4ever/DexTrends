import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PokemonStatBarsProps {
  stats: {
    name: string;
    baseStat: number;
    actualStat?: number;
    natureModifier?: number;
  }[];
  selectedLevel?: number;
  typeColors?: {
    accent: string;
    animationAccent: string;
  };
  animate?: boolean;
  totalStats?: number;
  baseTotal?: number;
  ranking?: {
    rank: string;
    color: string;
  };
  showNotes?: boolean;
}

const STAT_CONFIG = {
  'hp': {
    label: 'HP',
    color: 'bg-green-500',
    darkColor: 'dark:bg-green-600',
    barColor: 'rgb(34, 197, 94)',  // Same as bg-green-500
    barColorDark: 'rgb(22, 163, 74)',
    borderColor: 'rgb(34, 197, 94)'
  },
  'attack': {
    label: 'Attack',
    color: 'bg-orange-500',
    darkColor: 'dark:bg-orange-600',
    barColor: 'rgb(249, 115, 22)',  // Same as bg-orange-500
    barColorDark: 'rgb(234, 88, 12)',
    borderColor: 'rgb(249, 115, 22)'
  },
  'defense': {
    label: 'Defense',
    color: 'bg-orange-600',
    darkColor: 'dark:bg-orange-700',
    barColor: 'rgb(234, 88, 12)',  // Same as bg-orange-600
    barColorDark: 'rgb(194, 65, 12)',
    borderColor: 'rgb(234, 88, 12)'
  },
  'special-attack': {
    label: 'Sp. Atk',
    color: 'bg-cyan-500',
    darkColor: 'dark:bg-cyan-600',
    barColor: 'rgb(6, 182, 212)',  // Same as bg-cyan-500
    barColorDark: 'rgb(8, 145, 178)',
    borderColor: 'rgb(6, 182, 212)'
  },
  'special-defense': {
    label: 'Sp. Def',
    color: 'bg-blue-500',
    darkColor: 'dark:bg-blue-600',
    barColor: 'rgb(59, 130, 246)',  // Same as bg-blue-500
    barColorDark: 'rgb(37, 99, 235)',
    borderColor: 'rgb(59, 130, 246)'
  },
  'speed': {
    label: 'Speed',
    color: 'bg-purple-500',
    darkColor: 'dark:bg-purple-600',
    barColor: 'rgb(168, 85, 247)',  // Same as bg-purple-500
    barColorDark: 'rgb(147, 51, 234)',
    borderColor: 'rgb(168, 85, 247)'
  }
};

const PokemonStatBars: React.FC<PokemonStatBarsProps> = ({
  stats,
  selectedLevel = 50,
  animate = true,
  totalStats,
  baseTotal,
  ranking,
  showNotes = true
}) => {
  // Calculate stat ranges
  const calculateStatRange = (baseStat: number, statName: string) => {
    const level = selectedLevel;
    
    if (statName === 'hp') {
      // HP calculation is different
      const min = Math.floor(((2 * baseStat + 0 + 0) * level) / 100) + level + 10;
      const max = Math.floor(((2 * baseStat + 31 + 252/4) * level) / 100) + level + 10;
      return { min, max };
    } else {
      // Other stats
      const min = Math.floor((Math.floor(((2 * baseStat + 0 + 0) * level) / 100) + 5) * 0.9); // Hindering nature
      const max = Math.floor((Math.floor(((2 * baseStat + 31 + 252/4) * level) / 100) + 5) * 1.1); // Helpful nature
      return { min, max };
    }
  };

  // Calculate total range
  const calculateTotalRange = () => {
    if (!stats || stats.length === 0) return { min: 0, max: 0 };
    
    const totalMin = stats.reduce((sum, stat) => {
      const range = calculateStatRange(stat.baseStat, stat.name);
      return sum + range.min;
    }, 0);
    
    const totalMax = stats.reduce((sum, stat) => {
      const range = calculateStatRange(stat.baseStat, stat.name);
      return sum + range.max;
    }, 0);
    
    return { min: totalMin, max: totalMax };
  };

  return (
    <div className="w-full space-y-1">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 mb-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
        <div className="col-span-3 text-center">Stat</div>
        <div className="col-span-6"></div>
        <div className="col-span-3 text-center hidden sm:block">Range</div>
        <div className="col-span-3 text-center block sm:hidden">Min-Max</div>
      </div>

      {/* Stats */}
      {stats.map((stat, index) => {
        const config = STAT_CONFIG[stat.name as keyof typeof STAT_CONFIG];
        const range = calculateStatRange(stat.baseStat, stat.name);
        // Calculate percentage based on actual stat value relative to the range at current level
        const actualStatValue = stat.actualStat || stat.baseStat;
        // Use a scale where the max stat at current level fills about 80% of the bar
        const scaleFactor = selectedLevel === 100 ? 1.2 : 1.5;
        const percentage = Math.min((actualStatValue / (range.max * scaleFactor)) * 100, 100);

        return (
          <motion.div
            key={stat.name}
            className="grid grid-cols-12 gap-2 items-center"
            initial={animate ? { opacity: 0, x: -20 } : {}}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Stat Label */}
            <div className={cn(
              "col-span-3 px-2 sm:px-3 py-1.5 sm:py-2 text-white font-bold text-xs sm:text-sm rounded",
              config.color,
              config.darkColor
            )}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  {config.label}:
                  <span className="text-[10px] text-gray-400">({stat.baseStat})</span>
                </span>
                <span className="flex items-center">
                  {stat.natureModifier && stat.natureModifier !== 1 && (
                    <span className="text-xs mr-1">
                      {stat.natureModifier > 1 ? '↑' : '↓'}
                    </span>
                  )}
                  {stat.actualStat || stat.baseStat}
                </span>
              </div>
            </div>

            {/* Stat Bar */}
            <div className="col-span-6 relative">
              <div className="w-full h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <motion.div
                  className="h-full relative"
                  style={{
                    backgroundColor: config.barColor,
                    borderRadius: '0.25rem'
                  }}
                  initial={animate ? { width: 0 } : undefined}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Range */}
            <div className="col-span-3 text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
              <span className="hidden sm:inline">{range.min} - {range.max}</span>
              <span className="inline sm:hidden">{range.min}-{range.max}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Total Stats Row */}
      {totalStats && ranking && (
        <motion.div
          className="grid grid-cols-12 gap-2 items-center mt-1 pt-1 border-t border-gray-200 dark:border-gray-700"
          initial={animate ? { opacity: 0, x: -20 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Total Label */}
          <div className="col-span-3 px-2 sm:px-3 py-1.5 sm:py-2 text-white font-bold text-xs sm:text-sm rounded bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                TOTAL:
                {baseTotal && <span className="text-[10px] text-gray-400">({baseTotal})</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap",
                  ranking.color
                )}>
                  {ranking.rank}
                </span>
                <span className="min-w-[3ch] text-right">{totalStats}</span>
              </span>
            </div>
          </div>

          {/* Total Bar */}
          <div className="col-span-6 relative">
            <div className="w-full h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <motion.div
                className="h-full relative bg-gray-600 dark:bg-gray-500"
                style={{
                  borderRadius: '0.25rem'
                }}
                initial={animate ? { width: 0 } : undefined}
                animate={{ width: `${Math.min((baseTotal / 720) * 100, 100)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Total Range */}
          <div className="col-span-3 text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
            {(() => {
              const totalRange = calculateTotalRange();
              return (
                <>
                  <span className="hidden sm:inline">{totalRange.min} - {totalRange.max}</span>
                  <span className="inline sm:hidden">{totalRange.min}-{totalRange.max}</span>
                </>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* Notes */}
      {showNotes && (
        <div className="mt-8 space-y-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            <span>Minimum stats are calculated with 0 EVs, IVs of 0, and (if applicable) a hindering nature.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-500">•</span>
            <span>Maximum stats are calculated with 252 EVs, IVs of 31, and (if applicable) a helpful nature.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(PokemonStatBars);