import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GlassContainer } from '../ui/design-system/GlassContainer';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import type { TCGCard } from '@/types/api/cards';

interface MarketPulseProps {
  cards: TCGCard[];
  getPrice: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

interface MarketMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  gradient: string;
}

export const MarketPulse: React.FC<MarketPulseProps> = ({
  cards,
  getPrice,
  onCardClick
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  
  // Calculate market metrics
  const marketMetrics = useMemo(() => {
    const totalValue = cards.reduce((sum, card) => sum + getPrice(card), 0);
    const averagePrice = totalValue / cards.length;
    const premiumCards = cards.filter(card => getPrice(card) > 50);
    const budgetCards = cards.filter(card => getPrice(card) < 5);
    
    // Simulated market trends (in a real app, these would come from historical data)
    const metrics: MarketMetric[] = [
      {
        label: 'Total Market Cap',
        value: totalValue,
        change: 12.5,
        trend: 'up',
        color: '#10B981',
        gradient: 'from-green-400 to-emerald-600'
      },
      {
        label: 'Average Card Value',
        value: averagePrice,
        change: -2.3,
        trend: 'down',
        color: '#EF4444',
        gradient: 'from-red-400 to-red-600'
      },
      {
        label: 'Premium Cards',
        value: premiumCards.length,
        change: 8.7,
        trend: 'up',
        color: '#8B5CF6',
        gradient: 'from-amber-400 to-amber-600'
      },
      {
        label: 'Budget Cards',
        value: budgetCards.length,
        change: 0,
        trend: 'stable',
        color: '#6B7280',
        gradient: 'from-stone-400 to-stone-600'
      }
    ];
    
    return metrics;
  }, [cards, getPrice]);
  
  // Get top movers (simulated)
  const topMovers = useMemo(() => {
    const sorted = [...cards]
      .map(card => ({
        card,
        price: getPrice(card),
        change: Math.random() * 40 - 20 // Simulated price change
      }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 10);
    
    return {
      gainers: sorted.filter(item => item.change > 0).slice(0, 5),
      losers: sorted.filter(item => item.change < 0).slice(0, 5)
    };
  }, [cards, getPrice]);
  
  // Create sparkline data points
  const createSparkline = (baseValue: number, volatility: number = 0.1) => {
    const points = 30;
    const data = [];
    let currentValue = baseValue * (1 - volatility);
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * 2 * volatility;
      currentValue = currentValue * (1 + change);
      data.push({
        x: i,
        y: currentValue
      });
    }
    
    // Ensure last point matches current value
    data[data.length - 1].y = baseValue;
    
    return data;
  };
  
  // Create SVG path from data points
  const createPath = (data: { x: number; y: number }[], width: number, height: number) => {
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y));
    const rangeY = maxY - minY || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.y - minY) / rangeY) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return points;
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
          <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
            Market Pulse
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Real-time market analytics and trends
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className={cn(
          "flex rounded-full p-1",
          createGlassStyle({
            blur: 'md',
            opacity: 'subtle',
            border: 'subtle',
            rounded: 'full'
          })
        )}>
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                timeRange === range
                  ? "bg-gradient-to-r from-amber-500 to-cyan-500 text-white"
                  : "text-stone-600 dark:text-stone-400"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Market Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {marketMetrics.map((metric, index) => {
          const sparklineData = createSparkline(metric.value, 0.15);
          const sparklinePath = createPath(sparklineData, 100, 40);
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-4 rounded-xl",
                "bg-white/60 dark:bg-stone-800/60",
                "border border-white/30 dark:border-stone-700/30",
                "hover:bg-white/80 dark:hover:bg-stone-800/80",
                "transition-all cursor-pointer hover:scale-[1.02]"
              )}
              onClick={() => setSelectedMetric(metric.label)}
            >
              {/* Metric Value and Change */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                    {metric.label.includes('Value') || metric.label.includes('Cap')
                      ? `$${metric.value.toFixed(2)}`
                      : metric.value.toFixed(0)}
                  </p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold",
                  metric.trend === 'up' && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
                  metric.trend === 'down' && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
                  metric.trend === 'stable' && "bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-400"
                )}>
                  {metric.trend === 'up' && '↑'}
                  {metric.trend === 'down' && '↓'}
                  {metric.trend === 'stable' && '→'}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </div>
              
              {/* Mini Sparkline */}
              <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke={`url(#gradient-${index})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={metric.color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={metric.color} stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          );
        })}
      </div>
      
      {/* Top Movers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className={cn(
          "p-4 rounded-xl",
          "bg-white/40 dark:bg-stone-800/40",
          "border border-white/20 dark:border-stone-700/20",
          "shadow-sm"
        )}>
          <h4 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2">
            <span className="text-green-500">↑</span>
            Top Gainers
          </h4>
          <div className="space-y-2">
            {topMovers.gainers.map((item, index) => (
              <motion.div
                key={item.card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-stone-800/50 cursor-pointer transition-all"
                onClick={() => onCardClick?.(item.card)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {item.card.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      #{item.card.number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    ${item.price.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    +{item.change.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Top Losers */}
        <div className={cn(
          "p-4 rounded-xl",
          "bg-white/40 dark:bg-stone-800/40",
          "border border-white/20 dark:border-stone-700/20",
          "shadow-sm"
        )}>
          <h4 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4 flex items-center gap-2">
            <span className="text-red-500">↓</span>
            Top Losers
          </h4>
          <div className="space-y-2">
            {topMovers.losers.map((item, index) => (
              <motion.div
                key={item.card.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-stone-800/50 cursor-pointer transition-all"
                onClick={() => onCardClick?.(item.card)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      {item.card.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      #{item.card.number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                    ${item.price.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    {item.change.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Market Insights */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/20">
        <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
          Market Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600 dark:text-stone-400">
          <div>
            <span className="font-medium">Trading Volume:</span> High
          </div>
          <div>
            <span className="font-medium">Market Sentiment:</span> Bullish
          </div>
          <div>
            <span className="font-medium">Volatility:</span> Moderate
          </div>
        </div>
      </div>
    </GlassContainer>
  );
};

export default MarketPulse;