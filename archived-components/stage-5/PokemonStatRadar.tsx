import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface PokemonStatRadarProps {
  stats: {
    name: string;
    baseStat: number;
    actualStat?: number;
    natureModifier?: number;
  }[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  typeColors?: {
    accent: string;
    animationAccent: string;
  };
  animate?: boolean;
  showValues?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 200, height: 200, radius: 80, fontSize: 'text-xs' },
  md: { width: 300, height: 300, radius: 120, fontSize: 'text-sm' },
  lg: { width: 400, height: 400, radius: 160, fontSize: 'text-base' },
  xl: { width: 500, height: 500, radius: 200, fontSize: 'text-lg' }
};

const statPositions: Record<string, number> = {
  'hp': 0,
  'attack': 1,
  'defense': 2,
  'special-attack': 3,
  'special-defense': 4,
  'speed': 5
};

const statLabels: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SP.A',
  'special-defense': 'SP.D',
  'speed': 'SPD'
};

const PokemonStatRadar: React.FC<PokemonStatRadarProps> = ({
  stats,
  size = 'md',
  typeColors = { accent: '#3b82f6', animationAccent: '#8b5cf6' },
  animate = true,
  showValues = true,
  className = ''
}) => {
  const config = sizeConfig[size];
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const angleStep = (Math.PI * 2) / 6;
  
  // Calculate points for the hexagon
  const calculatePoint = (statValue: number, index: number, maxValue: number = 255) => {
    const angle = angleStep * index - Math.PI / 2;
    const normalizedValue = Math.min(statValue / maxValue, 1);
    const distance = normalizedValue * config.radius;
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  };
  
  // Create the stat polygon path
  const createStatPath = () => {
    const points = stats.map((stat, index) => {
      const position = statPositions[stat.name] ?? index;
      return calculatePoint(stat.baseStat, position);
    });
    
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
  };
  
  // Create hexagon grid lines
  const createHexagonGrid = () => {
    const grids: React.ReactElement[] = [];
    const levels = [0.2, 0.4, 0.6, 0.8, 1];
    
    levels.forEach((level, levelIndex) => {
      const points = Array.from({ length: 6 }, (_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const distance = level * config.radius;
        return {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance
        };
      });
      
      const path = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ') + ' Z';
      
      grids.push(
        <path
          key={`grid-${levelIndex}`}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-700"
          opacity={0.5}
        />
      );
    });
    
    // Add lines from center to vertices
    Array.from({ length: 6 }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const endX = centerX + Math.cos(angle) * config.radius;
      const endY = centerY + Math.sin(angle) * config.radius;
      
      grids.push(
        <line
          key={`line-${i}`}
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke="currentColor"
          strokeWidth="1"
          className="text-gray-200 dark:text-gray-700"
          opacity={0.3}
        />
      );
    });
    
    return grids;
  };
  
  // Calculate label positions
  const getLabelPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const distance = config.radius + 20;
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    };
  };
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={config.width} height={config.height}>
        {/* Gradient definition */}
        <defs>
          <linearGradient id="stat-radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={typeColors.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={typeColors.animationAccent} stopOpacity="0.6" />
          </linearGradient>
          <filter id="stat-radar-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid */}
        {createHexagonGrid()}
        
        {/* Stat polygon */}
        <motion.path
          d={createStatPath()}
          fill="url(#stat-radar-gradient)"
          stroke={typeColors.accent}
          strokeWidth="2"
          filter="url(#stat-radar-glow)"
          initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${centerX}px ${centerY}px` }}
        />
        
        {/* Stat points */}
        {stats.map((stat, index) => {
          const position = statPositions[stat.name] ?? index;
          const point = calculatePoint(stat.baseStat, position);
          
          return (
            <motion.circle
              key={stat.name}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={typeColors.accent}
              stroke="white"
              strokeWidth="2"
              initial={animate ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            />
          );
        })}
        
        {/* Labels */}
        {stats.map((stat, index) => {
          const position = statPositions[stat.name] ?? index;
          const labelPos = getLabelPosition(position);
          const label = statLabels[stat.name] || stat.name;
          
          return (
            <g key={`label-${stat.name}`}>
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn(
                  "font-bold fill-current text-gray-700 dark:text-gray-300",
                  config.fontSize
                )}
              >
                {label}
              </text>
              {showValues && (
                <text
                  x={labelPos.x}
                  y={labelPos.y + 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    "font-semibold fill-current",
                    config.fontSize,
                    "text-gray-600 dark:text-gray-400"
                  )}
                  style={{ fontSize: '0.875em' }}
                >
                  {stat.baseStat}
                  {stat.natureModifier && stat.natureModifier !== 1 && (
                    <tspan
                      className={stat.natureModifier > 1 ? "fill-green-500" : "fill-red-500"}
                    >
                      {stat.natureModifier > 1 ? '↑' : '↓'}
                    </tspan>
                  )}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Center total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={animate ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total
          </div>
          <div className={cn("font-bold", config.fontSize)} style={{ color: typeColors.accent }}>
            {stats.reduce((sum, stat) => sum + stat.baseStat, 0)}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(PokemonStatRadar);