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
  typeColors = { from: 'from-blue-500', to: 'to-purple-500' },
  showLabel = true,
  animate = true
}) => {
  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / maxValue) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Color based on stat value
  const getStatColor = () => {
    if (value >= 150) return 'from-purple-500 to-pink-500';
    if (value >= 120) return 'from-blue-500 to-purple-500';
    if (value >= 90) return 'from-green-500 to-blue-500';
    if (value >= 60) return 'from-yellow-500 to-green-500';
    if (value >= 30) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };
  
  const statColor = getStatColor();
  const statLabel = statAbbreviations[stat] || stat.toUpperCase();
  
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background circle with glass effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-gray-100/50 dark:bg-gray-800/50",
          "backdrop-blur-sm"
        )}
      />
      
      {/* SVG Ring */}
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`stat-gradient-${stat}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={cn("text-gradient-from", statColor.split(' ')[0])} />
            <stop offset="100%" className={cn("text-gradient-to", statColor.split(' ')[2])} />
          </linearGradient>
        </defs>
        
        {/* Progress ring */}
        <motion.circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#stat-gradient-${stat})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
        
        {/* Glow effect */}
        <motion.circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={`url(#stat-gradient-${stat})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="blur-md opacity-50"
          initial={animate ? { opacity: 0 } : { opacity: 0.5 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
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
            <div className={cn("text-gray-600 dark:text-gray-400", 
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