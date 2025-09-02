import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GlassContainer } from '../ui/design-system/GlassContainer';
import { createGlassStyle } from '../ui/design-system/glass-constants';

interface CircularRarityChartProps {
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  totalCards: number;
}

// Rarity colors and order
const RARITY_CONFIG: Record<string, { color: string; gradient: string; order: number }> = {
  'Common': { color: '#94A3B8', gradient: 'from-gray-400 to-gray-500', order: 1 },
  'Uncommon': { color: '#10B981', gradient: 'from-green-400 to-emerald-500', order: 2 },
  'Rare': { color: '#3B82F6', gradient: 'from-blue-400 to-blue-600', order: 3 },
  'Rare Holo': { color: '#8B5CF6', gradient: 'from-purple-400 to-purple-600', order: 4 },
  'Rare Holo EX': { color: '#EC4899', gradient: 'from-pink-400 to-pink-600', order: 5 },
  'Rare Holo GX': { color: '#F59E0B', gradient: 'from-amber-400 to-orange-500', order: 6 },
  'Rare Holo V': { color: '#EF4444', gradient: 'from-red-400 to-red-600', order: 7 },
  'Rare Holo VMAX': { color: '#DC2626', gradient: 'from-red-500 to-red-700', order: 8 },
  'Rare Holo VSTAR': { color: '#7C3AED', gradient: 'from-violet-500 to-purple-700', order: 9 },
  'Rare Ultra': { color: '#6366F1', gradient: 'from-indigo-400 to-indigo-600', order: 10 },
  'Rare Secret': { color: '#FFD700', gradient: 'from-yellow-300 to-amber-500', order: 11 },
  'Rare Rainbow': { color: '#FF69B4', gradient: 'from-pink-300 via-purple-300 to-indigo-400', order: 12 },
  'Rare Gold': { color: '#FFD700', gradient: 'from-yellow-400 to-yellow-600', order: 13 },
  'Amazing Rare': { color: '#FF1493', gradient: 'from-pink-500 to-rose-600', order: 14 }
};

const getRarityConfig = (rarity: string) => {
  return RARITY_CONFIG[rarity] || { 
    color: '#6B7280', 
    gradient: 'from-gray-500 to-gray-600', 
    order: 99 
  };
};

export const CircularRarityChart: React.FC<CircularRarityChartProps> = ({
  rarityDistribution,
  valueByRarity,
  totalCards
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'distribution' | 'value'>('distribution');
  
  // Sort rarities by order
  const sortedRarities = Object.entries(rarityDistribution)
    .sort((a, b) => getRarityConfig(a[0]).order - getRarityConfig(b[0]).order);
  
  // Calculate angles for donut chart
  const calculateSegments = () => {
    let currentAngle = -90; // Start from top
    const segments = [];
    
    for (const [rarity, count] of sortedRarities) {
      const percentage = (count / totalCards) * 100;
      const angle = (percentage / 100) * 360;
      
      segments.push({
        rarity,
        count,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        config: getRarityConfig(rarity),
        value: valueByRarity[rarity] || { total: 0, average: 0, count: 0 }
      });
      
      currentAngle += angle;
    }
    
    return segments;
  };
  
  const segments = calculateSegments();
  
  // Create path for donut segment
  const createPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = 200 + outerRadius * Math.cos(startAngleRad);
    const y1 = 200 + outerRadius * Math.sin(startAngleRad);
    const x2 = 200 + outerRadius * Math.cos(endAngleRad);
    const y2 = 200 + outerRadius * Math.sin(endAngleRad);
    
    const x3 = 200 + innerRadius * Math.cos(endAngleRad);
    const y3 = 200 + innerRadius * Math.sin(endAngleRad);
    const x4 = 200 + innerRadius * Math.cos(startAngleRad);
    const y4 = 200 + innerRadius * Math.sin(startAngleRad);
    
    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `;
  };
  
  return (
    <GlassContainer
      variant="colored"
      blur="xl"
      rounded="2xl"
      padding="lg"
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Rarity Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Card breakdown by rarity tier
          </p>
        </div>
        
        {/* View Toggle */}
        <div className={cn(
          "flex rounded-full p-1",
          createGlassStyle({
            blur: 'md',
            opacity: 'subtle',
            border: 'subtle',
            rounded: 'full'
          })
        )}>
          <button
            onClick={() => setSelectedView('distribution')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedView === 'distribution'
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            Count
          </button>
          <button
            onClick={() => setSelectedView('value')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedView === 'value'
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            Value
          </button>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <motion.svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            {/* Background circle */}
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="80"
              className="text-gray-100/50 dark:text-gray-800/50"
            />
            
            {/* Segments */}
            {segments.map((segment, index) => {
              const isHovered = hoveredSegment === segment.rarity;
              const scale = isHovered ? 1.05 : 1;
              const opacity = hoveredSegment && !isHovered ? 0.5 : 1;
              
              return (
                <motion.path
                  key={segment.rarity}
                  d={createPath(
                    segment.startAngle,
                    segment.endAngle,
                    100,
                    isHovered ? 145 : 140
                  )}
                  fill={`url(#gradient-${segment.rarity.replace(/\s+/g, '-')})`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale,
                    opacity
                  }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.5,
                    scale: { duration: 0.2 }
                  }}
                  onMouseEnter={() => setHoveredSegment(segment.rarity)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="cursor-pointer transition-all filter drop-shadow-lg"
                  style={{
                    transformOrigin: '200px 200px'
                  }}
                />
              );
            })}
            
            {/* Gradients */}
            <defs>
              {segments.map(segment => (
                <linearGradient
                  key={`gradient-${segment.rarity}`}
                  id={`gradient-${segment.rarity.replace(/\s+/g, '-')}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={segment.config.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={segment.config.color} stopOpacity="1" />
                </linearGradient>
              ))}
            </defs>
            
            {/* Center text */}
            <text
              x="200"
              y="190"
              textAnchor="middle"
              className="text-4xl font-bold fill-gray-800 dark:fill-gray-200"
            >
              {totalCards}
            </text>
            <text
              x="200"
              y="220"
              textAnchor="middle"
              className="text-sm fill-gray-500 dark:fill-gray-400"
            >
              Total Cards
            </text>
          </motion.svg>
        </div>
        
        {/* Legend and Stats */}
        <div className="space-y-3">
          {segments.map((segment, index) => {
            const displayValue = selectedView === 'distribution' 
              ? segment.count 
              : `$${segment.value.total.toFixed(0)}`;
            const subValue = selectedView === 'distribution'
              ? `${segment.percentage.toFixed(1)}%`
              : `Avg: $${segment.value.average.toFixed(2)}`;
            
            return (
              <motion.div
                key={segment.rarity}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  "backdrop-blur-md bg-white/50 dark:bg-gray-800/50",
                  "border border-white/30 dark:border-gray-700/30",
                  "hover:bg-white/70 dark:hover:bg-gray-800/70",
                  "transition-all cursor-pointer",
                  hoveredSegment === segment.rarity && "scale-105 shadow-lg"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredSegment(segment.rarity)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full",
                      `bg-gradient-to-r ${segment.config.gradient}`
                    )}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {segment.rarity}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {displayValue}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {subValue}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Most Common"
            value={sortedRarities[0]?.[0] || 'N/A'}
            subValue={`${sortedRarities[0]?.[1] || 0} cards`}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Rarest"
            value={sortedRarities[sortedRarities.length - 1]?.[0] || 'N/A'}
            subValue={`${sortedRarities[sortedRarities.length - 1]?.[1] || 0} cards`}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            label="Most Valuable"
            value={Object.entries(valueByRarity)
              .sort((a, b) => b[1].average - a[1].average)[0]?.[0] || 'N/A'}
            subValue={`$${Object.entries(valueByRarity)
              .sort((a, b) => b[1].average - a[1].average)[0]?.[1].average.toFixed(2) || 0}`}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Unique Rarities"
            value={Object.keys(rarityDistribution).length.toString()}
            subValue="types"
            gradient="from-orange-500 to-red-500"
          />
        </div>
      </div>
    </GlassContainer>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{
  label: string;
  value: string;
  subValue: string;
  gradient: string;
}> = ({ label, value, subValue, gradient }) => (
  <div className="text-center">
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    <p className={cn(
      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
      gradient
    )}>
      {value}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{subValue}</p>
  </div>
);

export default CircularRarityChart;