import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../../utils/cn';

interface StatData {
  name: string;
  value: number;
  max?: number;
}

interface PokemonRadarChartProps {
  stats: StatData[];
  size?: number;
  typeColors?: {
    primary: string;
    secondary: string;
  };
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
  interactive?: boolean;
  comparison?: StatData[];
  className?: string;
}

const STAT_LABELS: Record<string, string> = {
  'hp': 'HP',
  'attack': 'ATK',
  'defense': 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  'speed': 'SPD'
};

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

export const PokemonRadarChart: React.FC<PokemonRadarChartProps> = ({
  stats,
  size = 300,
  typeColors = { primary: 'from-amber-400', secondary: 'to-amber-500' },
  showLabels = true,
  showValues = true,
  animate = true,
  interactive = true,
  comparison,
  className = ''
}) => {
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Calculate chart dimensions
  const padding = size * 0.2;
  const chartSize = size - padding;
  const center = size / 2;
  const radius = chartSize / 2;
  
  // Sort stats according to standard order
  const orderedStats = useMemo(() => {
    const statMap = new Map(stats.map(s => [s.name, s]));
    return STAT_ORDER.map(name => statMap.get(name) || { name, value: 0, max: 255 });
  }, [stats]);
  
  // Calculate polygon points
  const calculatePoints = (statValues: StatData[]) => {
    return statValues.map((stat, index) => {
      const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
      const normalizedValue = stat.value / (stat.max || 255);
      const x = center + Math.cos(angle) * radius * normalizedValue;
      const y = center + Math.sin(angle) * radius * normalizedValue;
      return { x, y, angle, stat };
    });
  };
  
  const points = calculatePoints(orderedStats);
  const comparisonPoints = comparison ? calculatePoints(comparison) : null;
  
  // Create SVG path
  const createPath = (pts: typeof points) => {
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };
  
  // Calculate hexagon background points
  const hexagonPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius
    };
  });
  
  const hexagonPath = hexagonPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  // Grid lines for each level
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  
  // Handle mouse movement for interactive glow
  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };
  
  // Transform for glow effect
  const glowX = useTransform(mouseX, [0, size], [-20, 20]);
  const glowY = useTransform(mouseY, [0, size], [-20, 20]);
  
  return (
    <div className={cn("relative inline-block", className)}>
      {/* Glass background effect */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"
        style={{ width: size, height: size }}
      />
      
      <svg 
        width={size} 
        height={size} 
        className="relative z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredStat(null)}
      >
        <defs>
          {/* Main gradient */}
          <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className={cn("text-gradient-from", typeColors.primary)} />
            <stop offset="100%" className={cn("text-gradient-to", typeColors.secondary)} />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Animated gradient for hover */}
          <radialGradient id="hoverGradient">
            <stop offset="0%" className="text-white/60" />
            <stop offset="100%" className="text-white/0" />
          </radialGradient>
        </defs>
        
        {/* Grid lines */}
        <g className="opacity-20">
          {gridLevels.map((level, i) => (
            <path
              key={i}
              d={hexagonPoints.map((p, idx) => {
                const x = center + (p.x - center) * level;
                const y = center + (p.y - center) * level;
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ') + ' Z'}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-stone-600 dark:text-stone-300"
            />
          ))}
        </g>
        
        {/* Radial lines */}
        <g className="opacity-10">
          {hexagonPoints.map((p, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-stone-600 dark:text-stone-300"
            />
          ))}
        </g>
        
        {/* Hexagon border */}
        <path
          d={hexagonPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-stone-300 dark:text-stone-600"
        />
        
        {/* Comparison stats (if provided) */}
        {comparisonPoints && (
          <motion.path
            d={createPath(comparisonPoints)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-stone-400 dark:text-stone-500"
            strokeDasharray="5,5"
            initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
        
        {/* Main stats polygon */}
        <motion.path
          d={createPath(points)}
          fill="url(#statGradient)"
          fillOpacity="0.3"
          stroke="url(#statGradient)"
          strokeWidth="3"
          filter="url(#glow)"
          initial={animate ? { pathLength: 0, fillOpacity: 0 } : { pathLength: 1, fillOpacity: 0.3 }}
          animate={{ pathLength: 1, fillOpacity: 0.3 }}
          transition={{ 
            pathLength: { duration: 1.5, ease: "easeOut" },
            fillOpacity: { duration: 1, delay: 0.5 }
          }}
        />
        
        {/* Interactive stat points */}
        {points.map((point, index) => (
          <g key={index}>
            {/* Invisible larger hit area */}
            <circle
              cx={point.x}
              cy={point.y}
              r="20"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredStat(point.stat.name)}
              onMouseLeave={() => setHoveredStat(null)}
            />
            
            {/* Visible point */}
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="white"
              stroke="url(#statGradient)"
              strokeWidth="3"
              initial={animate ? { scale: 0 } : { scale: 1 }}
              animate={{ scale: hoveredStat === point.stat.name ? 1.5 : 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: animate ? index * 0.1 + 0.5 : 0
              }}
            />
            
            {/* Value tooltip on hover */}
            {interactive && hoveredStat === point.stat.name && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="25"
                  rx="4"
                  fill="black"
                  fillOpacity="0.8"
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  className="fill-white text-sm font-bold"
                >
                  {point.stat.value}
                </text>
              </motion.g>
            )}
          </g>
        ))}
        
        {/* Stat labels */}
        {showLabels && hexagonPoints.map((_, index) => {
          const stat = orderedStats[index];
          const labelDistance = radius + 30;
          const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
          const x = center + Math.cos(angle) * labelDistance;
          const y = center + Math.sin(angle) * labelDistance;
          
          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                "text-sm font-bold fill-current transition-colors",
                hoveredStat === stat.name 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-stone-700 dark:text-stone-300"
              )}
            >
              {STAT_LABELS[stat.name]}
              {showValues && (
                <tspan 
                  x={x} 
                  dy="1.2em" 
                  className="text-xs font-normal opacity-70"
                >
                  {stat.value}
                </tspan>
              )}
            </text>
          );
        })}
        
        {/* Interactive glow effect */}
        {interactive && (
          <motion.circle
            cx={center}
            cy={center}
            r="100"
            fill="url(#hoverGradient)"
            opacity="0.3"
            style={{
              x: glowX,
              y: glowY
            }}
            className="pointer-events-none mix-blend-screen"
          />
        )}
      </svg>
      
      {/* Total stats indicator */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-600 bg-clip-text text-transparent">
          {orderedStats.reduce((sum, stat) => sum + stat.value, 0)}
        </div>
        <div className="text-xs text-stone-600 dark:text-stone-300">Total</div>
      </div>
    </div>
  );
};

export default PokemonRadarChart;