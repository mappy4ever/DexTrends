import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY, TRANSITION, ANIMATION_DURATION } from '../../components/ui/design-system/glass-constants';
import { FaStar, FaBolt, FaShieldAlt, FaHeart, FaRunning } from 'react-icons/fa';
import { GiCrossedSwords, GiMagicSwirl } from 'react-icons/gi';

// ===========================================
// TYPES
// ===========================================

interface QuickStatsCardProps {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  pokemonName?: string;
  className?: string;
}

// ===========================================
// HELPERS
// ===========================================

// Get stat ranking based on base stat total
function getStatRanking(total: number): { label: string; color: string; bgColor: string } {
  if (total >= 600) return { label: 'Legendary', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' };
  if (total >= 540) return { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' };
  if (total >= 500) return { label: 'Very Strong', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' };
  if (total >= 450) return { label: 'Strong', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
  if (total >= 400) return { label: 'Above Average', color: 'text-cyan-600 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' };
  if (total >= 350) return { label: 'Average', color: 'text-stone-600 dark:text-stone-300', bgColor: 'bg-stone-100 dark:bg-stone-800' };
  if (total >= 300) return { label: 'Below Average', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' };
  return { label: 'Weak', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/30' };
}

// Get quality indicator for individual stat
function getStatQuality(value: number): { icon: string; color: string } {
  if (value >= 130) return { icon: '★★★', color: 'text-amber-500' };
  if (value >= 100) return { icon: '★★', color: 'text-green-500' };
  if (value >= 70) return { icon: '★', color: 'text-blue-500' };
  if (value >= 50) return { icon: '○', color: 'text-stone-400' };
  return { icon: '−', color: 'text-red-400' };
}

// Classify Pokemon based on stat distribution
function classifyPokemon(stats: QuickStatsCardProps['stats']): string[] {
  const classes: string[] = [];
  const { hp, attack, defense, specialAttack, specialDefense, speed } = stats;

  // Offensive classifications
  if (attack >= 100 || specialAttack >= 100) {
    if (attack > specialAttack + 20) classes.push('Physical Attacker');
    else if (specialAttack > attack + 20) classes.push('Special Attacker');
    else if (attack >= 90 && specialAttack >= 90) classes.push('Mixed Attacker');
  }

  // Defensive classifications
  if (defense >= 100 || specialDefense >= 100 || hp >= 100) {
    if (defense >= 100 && specialDefense >= 100) classes.push('Wall');
    else if (defense > specialDefense + 20) classes.push('Physical Tank');
    else if (specialDefense > defense + 20) classes.push('Special Tank');
  }

  // Speed classifications
  if (speed >= 100) classes.push('Fast');
  else if (speed <= 40) classes.push('Slow');

  // If no classifications, add generic one
  if (classes.length === 0) {
    if (attack >= 70 && defense >= 70 && speed >= 70) classes.push('Balanced');
    else classes.push('Utility');
  }

  return classes.slice(0, 2); // Max 2 classifications
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  hp: <FaHeart className="w-3 h-3" />,
  attack: <GiCrossedSwords className="w-3 h-3" />,
  defense: <FaShieldAlt className="w-3 h-3" />,
  specialAttack: <GiMagicSwirl className="w-3 h-3" />,
  specialDefense: <FaShieldAlt className="w-3 h-3" />,
  speed: <FaRunning className="w-3 h-3" />,
};

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SP.ATK',
  specialDefense: 'SP.DEF',
  speed: 'SPEED',
};

// ===========================================
// MAIN COMPONENT
// ===========================================

export function QuickStatsCard({ stats, pokemonName, className }: QuickStatsCardProps) {
  // Calculate derived stats
  const analysis = useMemo(() => {
    const total = stats.hp + stats.attack + stats.defense +
                  stats.specialAttack + stats.specialDefense + stats.speed;

    const statEntries = [
      { key: 'hp', value: stats.hp },
      { key: 'attack', value: stats.attack },
      { key: 'defense', value: stats.defense },
      { key: 'specialAttack', value: stats.specialAttack },
      { key: 'specialDefense', value: stats.specialDefense },
      { key: 'speed', value: stats.speed },
    ];

    const highest = statEntries.reduce((max, stat) =>
      stat.value > max.value ? stat : max
    , statEntries[0]);

    const lowest = statEntries.reduce((min, stat) =>
      stat.value < min.value ? stat : min
    , statEntries[0]);

    const ranking = getStatRanking(total);
    const classifications = classifyPokemon(stats);

    // Physical vs Special offense
    const physicalOffense = stats.attack;
    const specialOffense = stats.specialAttack;
    const offensePreference = physicalOffense > specialOffense + 10 ? 'Physical' :
                             specialOffense > physicalOffense + 10 ? 'Special' : 'Mixed';

    // Physical vs Special defense
    const physicalDefense = stats.defense;
    const specialDefense = stats.specialDefense;
    const defensePreference = physicalDefense > specialDefense + 10 ? 'Physical' :
                             specialDefense > physicalDefense + 10 ? 'Special' : 'Balanced';

    return {
      total,
      highest,
      lowest,
      ranking,
      classifications,
      offensePreference,
      defensePreference,
    };
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-4 rounded-xl',
        'bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800/50 dark:to-stone-900/50',
        'border border-stone-200 dark:border-stone-700',
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className={cn(TYPOGRAPHY.label, 'text-stone-700 dark:text-stone-300')}>
            QUICK STATS
          </h3>
          {/* Classifications */}
          <div className="flex gap-1.5">
            {analysis.classifications.map((cls) => (
              <span
                key={cls}
                className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>

        {/* Total Badge */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          analysis.ranking.bgColor
        )}>
          <span className={cn('text-xs font-medium', analysis.ranking.color)}>
            {analysis.ranking.label}
          </span>
          <span className={cn('font-bold tabular-nums', analysis.ranking.color)}>
            {analysis.total}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {Object.entries(stats).map(([key, value]) => {
          const quality = getStatQuality(value);
          const isHighest = key === analysis.highest.key;
          const isLowest = key === analysis.lowest.key;

          return (
            <motion.div
              key={key}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'text-center p-2 rounded-lg transition-all',
                isHighest && 'bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-300 dark:ring-amber-700',
                isLowest && 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200 dark:ring-red-800',
                !isHighest && !isLowest && 'bg-white/50 dark:bg-stone-800/50'
              )}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={cn('text-xs', isHighest ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400')}>
                  {STAT_ICONS[key]}
                </span>
              </div>
              <div className={cn(
                'text-lg font-bold tabular-nums',
                isHighest ? 'text-amber-600 dark:text-amber-400' :
                isLowest ? 'text-red-500 dark:text-red-400' :
                'text-stone-900 dark:text-white'
              )}>
                {value}
                {isHighest && <span className="ml-0.5 text-amber-500 text-sm">★</span>}
              </div>
              <div className={cn(
                'text-[10px] font-medium uppercase tracking-wide',
                isHighest ? 'text-amber-600 dark:text-amber-400' :
                isLowest ? 'text-red-500 dark:text-red-400' :
                'text-stone-500 dark:text-stone-300'
              )}>
                {STAT_LABELS[key]}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analysis Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Best Stat */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 dark:text-stone-300">Best:</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {STAT_LABELS[analysis.highest.key]} ({analysis.highest.value})
            </span>
          </div>

          {/* Worst Stat */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 dark:text-stone-300">Worst:</span>
            <span className="font-semibold text-red-500 dark:text-red-400">
              {STAT_LABELS[analysis.lowest.key]} ({analysis.lowest.value})
            </span>
          </div>
        </div>

        {/* Offense/Defense Preference */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-medium">
            {analysis.offensePreference} Offense
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-medium">
            {analysis.defensePreference} Defense
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default QuickStatsCard;
