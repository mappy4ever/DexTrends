/**
 * StatsDisplay - Displays all 6 Pokemon stats with bars
 */

import React from 'react';
import { StatBar } from './StatBar';

interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
  total: number;
}

interface StatsDisplayProps {
  stats: Stats;
  showTotal?: boolean;
  className?: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  showTotal = true,
  className = ''
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <StatBar label="HP" value={stats.hp} />
      <StatBar label="ATK" value={stats.attack} />
      <StatBar label="DEF" value={stats.defense} />
      <StatBar label="SP.A" value={stats.spAttack} />
      <StatBar label="SP.D" value={stats.spDefense} />
      <StatBar label="SPD" value={stats.speed} />

      {showTotal && (
        <div className="mt-3 pt-3 border-t border-stone-200/50 dark:border-stone-700/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Total</span>
            <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
              {stats.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDisplay;
