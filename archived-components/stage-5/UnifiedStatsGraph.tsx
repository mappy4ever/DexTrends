import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { TCGCard } from '@/types/api/cards';

interface UnifiedStatsGraphProps {
  cards: TCGCard[];
  rarityDistribution: Record<string, number>;
  valueByRarity: Record<string, { total: number; average: number; count: number }>;
  getPrice: (card: TCGCard) => number;
}

export const UnifiedStatsGraph: React.FC<UnifiedStatsGraphProps> = ({
  cards,
  rarityDistribution,
  valueByRarity,
  getPrice
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'value'>('count');
  
  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalValue = cards.reduce((sum, card) => sum + getPrice(card), 0);
    const avgValue = totalValue / cards.length;
    const maxValue = Math.max(...cards.map(getPrice));
    
    return {
      total: totalValue,
      average: avgValue,
      highest: maxValue
    };
  }, [cards, getPrice]);

  // Prepare chart data based on selected metric
  const chartData = useMemo(() => {
    const sortedRarities = Object.entries(rarityDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6); // Top 6 for cleaner viz
    
    let cumulativeAngle = 0;
    return sortedRarities.map(([rarity, count]) => {
      const value = valueByRarity[rarity]?.total || 0;
      const percentage = selectedMetric === 'count' 
        ? (count / cards.length) * 100
        : totalStats.total > 0 ? (value / totalStats.total) * 100 : 0;
      
      const startAngle = cumulativeAngle;
      cumulativeAngle += percentage * 3.6;
      const endAngle = cumulativeAngle;
      
      return {
        rarity,
        count,
        value,
        percentage,
        startAngle,
        endAngle,
        avgPrice: valueByRarity[rarity]?.average || 0
      };
    });
  }, [rarityDistribution, valueByRarity, cards.length, totalStats.total, selectedMetric]);

  // Rarity colors
  const getRarityColor = (rarity: string, isHovered: boolean) => {
    const baseColors: Record<string, string> = {
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
      'Rare Rainbow': '#e879f9',
      'Rare Gold': '#fbbf24'
    };
    
    const color = baseColors[rarity] || '#9ca3af';
    return isHovered ? color : color + 'dd';
  };

  // Create SVG path for donut segment
  const createPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const centerX = 140;
    const centerY = 140;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(startAngleRad);
    const y3 = centerY + innerRadius * Math.sin(startAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return [
      `M ${x3} ${y3}`,
      `L ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x3} ${y3}`,
      'Z'
    ].join(' ');
  };

  return (
    <div className="relative flex items-center gap-4 p-4">
      {/* Left side - Donut Chart */}
      <div className="relative flex-shrink-0">
        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* Animated gradient definitions */}
          <defs>
            <radialGradient id="center-glow">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Center glow */}
          <circle cx="140" cy="140" r="50" fill="url(#center-glow)" />
          
          {/* Donut segments */}
          <motion.g
            key={selectedMetric}
            initial={{ rotate: -10, opacity: 0.8 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
          >
            {chartData.map((segment, index) => (
              <motion.path
                key={`${segment.rarity}-${selectedMetric}`}
                d={createPath(segment.startAngle, segment.endAngle, 50, 85)}
                fill={getRarityColor(segment.rarity, hoveredSegment === segment.rarity)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  d: createPath(segment.startAngle, segment.endAngle, 50, 85)
                }}
                transition={{ 
                  delay: index * 0.05, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 80,
                  damping: 15
                }}
                onMouseEnter={() => setHoveredSegment(segment.rarity)}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-colors duration-200"
                style={{ transformOrigin: '140px 140px' }}
              />
            ))}
          </motion.g>
          
          {/* Center stats */}
          <g>
            <motion.text
              key={`total-${selectedMetric}`}
              x="140"
              y="125"
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-800 dark:fill-gray-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {selectedMetric === 'count' ? cards.length : `$${totalStats.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            </motion.text>
            <motion.text
              key={`label-${selectedMetric}`}
              x="140"
              y="145"
              textAnchor="middle"
              className="text-xs fill-gray-500 dark:fill-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {selectedMetric === 'count' ? 'Total Cards' : 'Total Value'}
            </motion.text>
            <motion.text
              x="140"
              y="165"
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-600 dark:fill-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {selectedMetric === 'count' ? `$${totalStats.total.toFixed(0)} value` : `${cards.length} cards`}
            </motion.text>
          </g>
        </svg>
        
        {/* Floating tooltip */}
        <AnimatePresence>
          {hoveredSegment && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 z-20 pointer-events-none"
              style={{ minWidth: '160px' }}
            >
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {hoveredSegment}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {chartData.find(d => d.rarity === hoveredSegment)?.count} cards
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                ${chartData.find(d => d.rarity === hoveredSegment)?.value.toFixed(0)} total
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Right side - Key Stats */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {/* Average Value */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Average</span>
          </div>
          <motion.div 
            className="text-2xl font-bold text-gray-800 dark:text-gray-200"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            ${totalStats.average.toFixed(0)}
          </motion.div>
        </motion.div>
        
        {/* Highest Value */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Highest</span>
          </div>
          <motion.div 
            className="text-2xl font-bold text-gray-800 dark:text-gray-200"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            ${totalStats.highest.toFixed(0)}
          </motion.div>
        </motion.div>
        
        {/* Toggle Metric Button with Animation */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => setSelectedMetric(prev => prev === 'count' ? 'value' : 'count')}
          className="col-span-2 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-3 font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <motion.div
            key={selectedMetric}
            initial={{ x: selectedMetric === 'count' ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {selectedMetric === 'count' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span>Show by {selectedMetric === 'count' ? 'Value' : 'Count'}</span>
          </motion.div>
        </motion.button>
        
        {/* Fun fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="col-span-2 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Top rarity: <span className="font-semibold text-gray-700 dark:text-gray-300">
              {chartData[0]?.rarity} ({chartData[0]?.percentage.toFixed(0)}%)
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedStatsGraph;