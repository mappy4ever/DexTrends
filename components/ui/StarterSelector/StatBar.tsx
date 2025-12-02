/**
 * StatBar - Reusable stat bar component for Pokemon stats display
 */

import React from 'react';
import { cn } from '@/utils/cn';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

// Get stat color based on stat value
const getStatColor = (value: number): string => {
  if (value >= 100) return 'from-green-500 to-emerald-500';  // Excellent
  if (value >= 80) return 'from-amber-500 to-cyan-500';      // Good
  if (value >= 60) return 'from-yellow-500 to-amber-500';    // Average
  if (value >= 40) return 'from-orange-500 to-orange-600';   // Below Average
  return 'from-red-500 to-red-600';                          // Poor
};

// Get stat percentage for bar width
const getStatPercentage = (value: number, maxValue: number = 200): number => {
  return Math.min(100, (value / maxValue) * 100);
};

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  maxValue = 200
}) => {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm"
      style={{
        background: 'rgba(255, 255, 255, 0.4)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">
        {label}
      </span>
      <div
        className="flex-1 h-3 rounded-full overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <div
          className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(value))}
          style={{
            width: `${getStatPercentage(value, maxValue)}%`,
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        />
      </div>
      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right tabular-nums">
        {value}
      </span>
    </div>
  );
};

export { getStatColor, getStatPercentage };
export default StatBar;
