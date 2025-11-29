import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY, TRANSITION, ANIMATION_DURATION, SPRING_PHYSICS } from './design-system/glass-constants';

// ===========================================
// TYPES
// ===========================================

export interface StatItem {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  icon?: React.ReactNode;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showValue?: boolean;
  color?: 'auto' | 'amber' | 'green' | 'blue' | 'red' | 'purple' | 'type';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  isHighest?: boolean;
  className?: string;
}

export interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export interface PokemonStatsDisplayProps {
  stats: PokemonStats;
  showTotal?: boolean;
  showLabels?: boolean;
  showHighest?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
  typeColor?: string;
}

// ===========================================
// HELPERS
// ===========================================

// Get color based on stat value (0-255 scale for Pokemon)
function getStatColor(value: number, maxValue: number = 255): string {
  const percentage = (value / maxValue) * 100;
  if (percentage >= 80) return 'bg-green-500 dark:bg-green-400';
  if (percentage >= 60) return 'bg-emerald-500 dark:bg-emerald-400';
  if (percentage >= 40) return 'bg-amber-500 dark:bg-amber-400';
  if (percentage >= 25) return 'bg-orange-500 dark:bg-orange-400';
  return 'bg-red-500 dark:bg-red-400';
}

// Format stat labels
const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SP.ATK',
  specialDefense: 'SP.DEF',
  speed: 'SPEED',
};

// ===========================================
// STAT BAR COMPONENT
// ===========================================

export function StatBar({
  label,
  value,
  maxValue = 255,
  showValue = true,
  color = 'auto',
  size = 'md',
  animate = true,
  isHighest = false,
  className,
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Size styles
  const sizeStyles = {
    sm: { bar: 'h-1.5', label: 'text-xs', value: 'text-xs w-8' },
    md: { bar: 'h-2', label: 'text-sm', value: 'text-sm w-10' },
    lg: { bar: 'h-3', label: 'text-base', value: 'text-base w-12' },
  };

  // Get bar color
  const barColor = color === 'auto' ? getStatColor(value, maxValue) : {
    amber: 'bg-amber-500 dark:bg-amber-400',
    green: 'bg-green-500 dark:bg-green-400',
    blue: 'bg-blue-500 dark:bg-blue-400',
    red: 'bg-red-500 dark:bg-red-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
    type: 'bg-current',
  }[color];

  const styles = sizeStyles[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Label */}
      <span className={cn(
        styles.label,
        'font-medium text-stone-600 dark:text-stone-400 w-16 flex-shrink-0',
        isHighest && 'text-amber-600 dark:text-amber-400'
      )}>
        {label}
      </span>

      {/* Bar container */}
      <div className="flex-1 relative">
        <div className={cn(
          styles.bar,
          'w-full rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden'
        )}>
          {animate ? (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: ANIMATION_DURATION.slow / 1000, ease: 'easeOut' }}
              className={cn(styles.bar, 'rounded-full', barColor)}
            />
          ) : (
            <div
              className={cn(styles.bar, 'rounded-full', barColor)}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Value */}
      {showValue && (
        <span className={cn(
          styles.value,
          'font-mono font-semibold text-right tabular-nums',
          isHighest
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-stone-700 dark:text-stone-300'
        )}>
          {value}
          {isHighest && <span className="ml-0.5 text-amber-500">★</span>}
        </span>
      )}
    </div>
  );
}

// ===========================================
// POKEMON STATS DISPLAY COMPONENT
// ===========================================

export function PokemonStatsDisplay({
  stats,
  showTotal = true,
  showLabels = true,
  showHighest = true,
  size = 'md',
  animate = true,
  className,
  typeColor,
}: PokemonStatsDisplayProps) {
  const statEntries = [
    { key: 'hp', value: stats.hp },
    { key: 'attack', value: stats.attack },
    { key: 'defense', value: stats.defense },
    { key: 'specialAttack', value: stats.specialAttack },
    { key: 'specialDefense', value: stats.specialDefense },
    { key: 'speed', value: stats.speed },
  ];

  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
  const highestStat = statEntries.reduce((max, stat) =>
    stat.value > max.value ? stat : max
  , statEntries[0]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header with total */}
      {showTotal && (
        <div className="flex items-center justify-between mb-3">
          <span className={cn(TYPOGRAPHY.label)}>BASE STATS</span>
          <div className="flex items-center gap-2">
            <span className={cn(TYPOGRAPHY.statLabel)}>TOTAL</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-sm font-bold tabular-nums',
              'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            )}>
              {total}
            </span>
          </div>
        </div>
      )}

      {/* Stat bars */}
      <div className="space-y-1.5">
        {statEntries.map(({ key, value }) => (
          <StatBar
            key={key}
            label={STAT_LABELS[key]}
            value={value}
            maxValue={255}
            size={size}
            animate={animate}
            isHighest={showHighest && key === highestStat.key}
          />
        ))}
      </div>
    </div>
  );
}

// ===========================================
// STAT GRID COMPONENT (For generic stats)
// ===========================================

export function StatGrid({
  stats,
  columns = 2,
  variant = 'default',
  className,
}: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  const variantStyles = {
    default: '',
    compact: 'gap-2',
    card: 'gap-4',
  };

  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      variantStyles[variant],
      className
    )}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            variant === 'card' && 'p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50'
          )}
        >
          {stat.icon && (
            <div className="mb-1 text-stone-400 dark:text-stone-500">
              {stat.icon}
            </div>
          )}
          <div className={cn(
            TYPOGRAPHY.stat,
            stat.color || 'text-stone-900 dark:text-white'
          )}>
            {stat.value.toLocaleString()}
          </div>
          <div className={TYPOGRAPHY.statLabel}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================
// QUICK STAT BADGE
// ===========================================

export interface QuickStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuickStat({
  label,
  value,
  trend,
  trendValue,
  size = 'md',
  className,
}: QuickStatProps) {
  const sizeStyles = {
    sm: { value: 'text-lg', label: 'text-xs' },
    md: { value: 'text-2xl', label: 'text-xs' },
    lg: { value: 'text-3xl', label: 'text-sm' },
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-stone-500 dark:text-stone-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn('text-center', className)}>
      <div className={cn(styles.value, 'font-bold tabular-nums text-stone-900 dark:text-white')}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {trend && trendValue && (
        <div className={cn('text-xs font-medium', trendColors[trend])}>
          {trendIcons[trend]} {trendValue}
        </div>
      )}
      <div className={cn(styles.label, 'text-stone-500 dark:text-stone-400 uppercase tracking-wide mt-0.5')}>
        {label}
      </div>
    </div>
  );
}

// ===========================================
// COMPARISON STAT BAR
// ===========================================

export interface ComparisonStatProps {
  label: string;
  value1: number;
  value2: number;
  label1?: string;
  label2?: string;
  maxValue?: number;
  className?: string;
}

export function ComparisonStat({
  label,
  value1,
  value2,
  label1 = 'Pokemon 1',
  label2 = 'Pokemon 2',
  maxValue = 255,
  className,
}: ComparisonStatProps) {
  const percent1 = Math.min((value1 / maxValue) * 100, 100);
  const percent2 = Math.min((value2 / maxValue) * 100, 100);
  const winner = value1 > value2 ? 1 : value2 > value1 ? 2 : 0;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>{label}</span>
        <span className="text-stone-400">{label1} vs {label2}</span>
      </div>
      <div className="flex gap-1 items-center">
        {/* Value 1 bar (right-aligned) */}
        <span className={cn(
          'w-8 text-xs font-mono text-right tabular-nums',
          winner === 1 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-stone-600 dark:text-stone-400'
        )}>
          {value1}
        </span>
        <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
          <div className="flex-1 flex justify-end">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent1}%` }}
              className={cn(
                'h-full rounded-l-full',
                winner === 1 ? 'bg-green-500' : 'bg-blue-500'
              )}
            />
          </div>
          <div className="w-px bg-stone-300 dark:bg-stone-600" />
          <div className="flex-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent2}%` }}
              className={cn(
                'h-full rounded-r-full',
                winner === 2 ? 'bg-green-500' : 'bg-red-500'
              )}
            />
          </div>
        </div>
        <span className={cn(
          'w-8 text-xs font-mono tabular-nums',
          winner === 2 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-stone-600 dark:text-stone-400'
        )}>
          {value2}
        </span>
      </div>
    </div>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export default PokemonStatsDisplay;
