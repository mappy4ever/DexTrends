import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';

interface SetStatisticsVisualProps {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  totalCards: number;
}

export const SetStatisticsVisual: React.FC<SetStatisticsVisualProps> = ({
  rarityDistribution,
  valueByRarity,
  totalCards
}) => {
  // Calculate percentages and prepare chart data
  const chartData = useMemo(() => {
    const sortedRarities = Object.entries(rarityDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8 rarities for cleaner visualization
    
    let cumulativePercentage = 0;
    return sortedRarities.map(([rarity, count]) => {
      const percentage = (count / totalCards) * 100;
      const startAngle = cumulativePercentage * 3.6;
      cumulativePercentage += percentage;
      const endAngle = cumulativePercentage * 3.6;
      
      return {
        rarity,
        count,
        percentage,
        startAngle,
        endAngle,
        value: valueByRarity[rarity]?.average || 0
      };
    });
  }, [rarityDistribution, valueByRarity, totalCards]);

  // Get color for each rarity
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Common': '#94a3b8',
      'Uncommon': '#86efac',
      'Rare': '#60a5fa',
      'Rare Holo': '#818cf8',
      'Rare Holo EX': '#c084fc',
      'Rare Holo GX': '#e879f9',
      'Rare Holo V': '#f472b6',
      'Rare Holo VMAX': '#fb7185',
      'Rare Holo VSTAR': '#fbbf24',
      'Rare Ultra': '#a78bfa',
      'Rare Secret': '#f97316',
      'Rare Rainbow': 'url(#rainbow-gradient)',
      'Rare Gold': '#fbbf24'
    };
    
    return colors[rarity] || '#9ca3af';
  };

  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const innerRadius = 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        createGlassStyle({
          blur: 'xl',
          opacity: 'medium',
          gradient: true,
          border: 'medium',
          rounded: 'xl',
          shadow: 'xl'
        }),
        'p-8 md:p-10'
      )}
    >
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
        Rarity Distribution
      </h3>
      
      <div className="flex flex-col lg:flex-row items-start gap-12">
        {/* Donut Chart */}
        <div className="relative">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Define gradients */}
            <defs>
              <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="20%" stopColor="#f97316" />
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="60%" stopColor="#84cc16" />
                <stop offset="80%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Background circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius + 10}
              fill="none"
              stroke="url(#rainbow-gradient)"
              strokeWidth="1"
              opacity="0.2"
            />
            
            {/* Donut segments */}
            {chartData.map((segment, index) => {
              const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);
              
              const x1 = centerX + radius * Math.cos(startAngleRad);
              const y1 = centerY + radius * Math.sin(startAngleRad);
              const x2 = centerX + radius * Math.cos(endAngleRad);
              const y2 = centerY + radius * Math.sin(endAngleRad);
              
              const x3 = centerX + innerRadius * Math.cos(startAngleRad);
              const y3 = centerY + innerRadius * Math.sin(startAngleRad);
              const x4 = centerX + innerRadius * Math.cos(endAngleRad);
              const y4 = centerY + innerRadius * Math.sin(endAngleRad);
              
              const largeArcFlag = segment.percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M ${x3} ${y3}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x4} ${y4}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
                'Z'
              ].join(' ');
              
              return (
                <motion.path
                  key={segment.rarity}
                  d={pathData}
                  fill={getRarityColor(segment.rarity)}
                  fillOpacity={0.8}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ fillOpacity: 1, scale: 1.05 }}
                  style={{ transformOrigin: `${centerX}px ${centerY}px` }}
                  className="cursor-pointer"
                />
              );
            })}
            
            {/* Clean center display */}
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              className="text-3xl font-bold fill-gray-800 dark:fill-gray-200"
              dominantBaseline="middle"
            >
              {totalCards}
            </text>
          </svg>
        </div>
        
        {/* Clean Legend */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          {chartData.map((segment, index) => (
            <motion.div
              key={segment.rarity}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 group cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: segment.rarity === 'Rare Rainbow' 
                    ? '#8b5cf6' 
                    : getRarityColor(segment.rarity) 
                }}
              />
              <div className="flex-1">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {segment.rarity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {segment.count} cards
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {segment.percentage.toFixed(0)}%
                    </span>
                    {segment.value > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ${segment.value.toFixed(0)} avg
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SetStatisticsVisual;