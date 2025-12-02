import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PokemonStatRingProps {
  stat: string;
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  typeColors?: {
    from: string;
    to: string;
    accent?: string;
    animationAccent?: string;
  };
  showLabel?: boolean;
  animate?: boolean;
}

const sizeConfig = {
  sm: { diameter: 64, strokeWidth: 6, fontSize: 'text-xs' },
  md: { diameter: 96, strokeWidth: 8, fontSize: 'text-sm' },
  lg: { diameter: 128, strokeWidth: 10, fontSize: 'text-base' },
  xl: { diameter: 160, strokeWidth: 12, fontSize: 'text-lg' }
};

const statAbbreviations: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SP.A',
  'special-defense': 'SP.D',
  'speed': 'SPD'
};

const PokemonStatRing: React.FC<PokemonStatRingProps> = ({
  stat,
  value,
  maxValue = 255,
  size = 'md',
  typeColors = { from: 'from-amber-500', to: 'to-amber-500' },
  showLabel = true,
  animate = true
}) => {
  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / maxValue) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get stat-specific gradient colors
  const getStatGradientColors = (statType: string) => {
    const colors = {
      'hp': { from: '#ef4444', to: '#dc2626' }, // Red
      'attack': { from: '#f97316', to: '#ea580c' }, // Orange
      'defense': { from: '#3b82f6', to: '#2563eb' }, // Blue
      'special-attack': { from: '#8b5cf6', to: '#7c3aed' }, // Purple
      'special-defense': { from: '#10b981', to: '#059669' }, // Green
      'speed': { from: '#f59e0b', to: '#d97706' } // Yellow
    };

    return colors[statType as keyof typeof colors] || { from: '#6b7280', to: '#4b5563' };
  };

  // Color based on stat value
  const getStatColor = () => {
    if (value >= 150) return 'from-amber-500 to-pink-500';
    if (value >= 120) return 'from-amber-500 to-amber-500';
    if (value >= 90) return 'from-green-500 to-amber-500';
    if (value >= 60) return 'from-yellow-500 to-green-500';
    if (value >= 30) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  const statColor = getStatColor();
  const statLabel = statAbbreviations[stat] || stat.toUpperCase();

  // Create hexagonal points for Pokemon-style stats
  const createHexagonPath = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  const center = config.diameter / 2;
  const hexRadius = (config.diameter - config.strokeWidth) / 2;
  const backgroundPath = createHexagonPath(center, center, hexRadius);
  const progressPath = createHexagonPath(center, center, hexRadius * (percentage / 100));

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background hexagon with glass effect */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-stone-100/50 dark:bg-stone-800/50",
          "backdrop-blur-sm"
        )}
        style={{
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }}
      />

      {/* SVG Hexagon */}
      <svg
        width={config.diameter}
        height={config.diameter}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`stat-gradient-${stat}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getStatGradientColors(stat).from} />
            <stop offset="100%" stopColor={getStatGradientColors(stat).to} />
          </linearGradient>
          <filter id={`glow-${stat}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background hexagon */}
        <path
          d={backgroundPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth / 2}
          className="text-stone-200 dark:text-stone-700"
        />

        {/* Progress hexagon */}
        <motion.path
          d={progressPath}
          fill={`url(#stat-gradient-${stat})`}
          fillOpacity={0.3}
          stroke={`url(#stat-gradient-${stat})`}
          strokeWidth={config.strokeWidth / 3}
          filter={`url(#glow-${stat})`}
          initial={animate ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={animate ? { scale: 0 } : { scale: 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          className="text-center"
        >
          <div className={cn("font-bold", config.fontSize)}>
            {value}
          </div>
          {showLabel && (
            <div className={cn("text-stone-600 dark:text-stone-300",
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}>
              {statLabel}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default memo(PokemonStatRing);
