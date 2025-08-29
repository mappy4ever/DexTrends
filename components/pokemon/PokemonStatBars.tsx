import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import logger from '@/utils/logger';

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
  // Stat name normalizer to handle API variations
  const normalizeStatName = (name: string): string => {
    // Log the raw stat name for debugging
    logger.debug('Raw stat name:', { name });
    
    // Map common variations to our STAT_CONFIG keys
    const nameMap: Record<string, string> = {
      'hp': 'hp',
      'attack': 'attack', 
      'defense': 'defense',
      'special-attack': 'special-attack',
      'special-defense': 'special-defense',
      'speed': 'speed',
      // Add any other variations we might encounter
      'sp-attack': 'special-attack',
      'sp-defense': 'special-defense',
      'spatk': 'special-attack',
      'spdef': 'special-defense',
      'spd': 'speed'
    };
    
    const normalized = nameMap[name.toLowerCase()] || name;
    logger.debug('Normalized stat name:', { from: name, to: normalized });
    return normalized;
  };
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
        const normalizedName = normalizeStatName(stat.name);
        const config = STAT_CONFIG[normalizedName as keyof typeof STAT_CONFIG];
        
        // Fallback config if stat name doesn't match
        const fallbackConfig = {
          label: stat.name.charAt(0).toUpperCase() + stat.name.slice(1),
          color: 'bg-gray-500',
          darkColor: 'dark:bg-gray-600',
          barColor: 'rgb(107, 114, 128)',  // gray-500
          barColorDark: 'rgb(75, 85, 99)',
          borderColor: 'rgb(107, 114, 128)'
        };
        
        const finalConfig = config || fallbackConfig;
        
        // Log if we're using fallback
        if (!config) {
          logger.warn(`No config found for stat`, { 
            originalName: stat.name, 
            normalizedName, 
            usingFallback: true 
          });
        }
        
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
            {/* Stat Label with Glass Morphism */}
            <div className="col-span-3 relative">
              <div className={cn(
                "px-2 sm:px-3 py-1.5 sm:py-2 font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md border",
                "bg-white/20 dark:bg-gray-900/20 border-white/30 dark:border-gray-700/30"
              )}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    {finalConfig.label}:
                  </span>
                  <span className="flex items-center text-gray-900 dark:text-white">
                    {stat.natureModifier && stat.natureModifier !== 1 && (
                      <span className={cn(
                        "text-xs mr-1 font-bold",
                        stat.natureModifier > 1 ? "text-green-500" : "text-red-500"
                      )}>
                        {stat.natureModifier > 1 ? '↑' : '↓'}
                      </span>
                    )}
                    {stat.actualStat || stat.baseStat}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat Bar with Glass Effect */}
            <div className="col-span-6 relative">
              <div className="w-full h-6 sm:h-8 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 overflow-hidden">
                <motion.div
                  className="h-full relative rounded-full"
                  style={{ 
                    background: `linear-gradient(90deg, ${finalConfig.barColor}, ${finalConfig.barColor}dd)`,
                    boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 0 20px ${finalConfig.barColor}40`
                  }}
                  initial={animate ? { width: 0 } : { width: `${percentage}%` }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full" />
                </motion.div>
              </div>
            </div>

            {/* Range with Glass Badge */}
            <div className="col-span-3 flex justify-center">
              <div className="px-3 py-1 rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm border border-white/30 dark:border-gray-700/30">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <span className="hidden sm:inline">{range.min} - {range.max}</span>
                  <span className="inline sm:hidden">{range.min}-{range.max}</span>
                </span>
              </div>
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
          <div className="col-span-3 relative">
            <div 
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-white font-bold text-xs sm:text-sm rounded-xl"
              style={{
                background: 'linear-gradient(90deg, rgb(107, 114, 128), rgb(75, 85, 99))',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  TOTAL:
                  {baseTotal && <span className="text-[10px] text-gray-300">({baseTotal})</span>}
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
          </div>

          {/* Total Bar */}
          <div className="col-span-6 relative">
            <div className="w-full h-6 sm:h-8 rounded-full bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 overflow-hidden">
              <motion.div
                className="h-full relative rounded-full"
                initial={animate ? { width: 0 } : { width: `${Math.min(((baseTotal || 0) / 720) * 100, 100)}%` }}
                animate={{ width: `${Math.min(((baseTotal || 0) / 720) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, rgb(107, 114, 128), rgb(75, 85, 99))`,
                    boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), 0 0 20px rgba(107, 114, 128, 0.4)`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full" />
              </motion.div>
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