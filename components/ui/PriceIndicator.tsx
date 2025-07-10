import React, { useState, useEffect } from 'react';
import { PriceHistoryManager } from '../../lib/supabase';

interface PriceIndicatorProps {
  cardId: string;
  showTrend?: boolean;
  currentPrice?: string;
  variantType?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Price indicator component that shows current price with trend indicators
export default function PriceIndicator({ cardId, showTrend = true, currentPrice = 'N/A', variantType = 'market', size = 'md', className = '' }: PriceIndicatorProps) {
  const [priceChange, setPriceChange] = useState<any>(null);
  const [trend, setTrend] = useState('STABLE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cardId || !showTrend || currentPrice === 'N/A') return;

    const fetchPriceChange = async () => {
      setLoading(true);
      try {
        // Get 7-day price statistics to determine trend
        const stats = await PriceHistoryManager.getCardPriceStats(cardId, variantType, 7);
        
        if (stats) {
          // Calculate percentage change if we have historical data
          const currentValue = parseFloat(currentPrice.replace('$', ''));
          const avgPrice = parseFloat(stats.avg_price || 0);
          
          if (avgPrice > 0) {
            const percentChange = ((currentValue - avgPrice) / avgPrice) * 100;
            setPriceChange(percentChange);
            
            // Set trend based on percentage change
            if (percentChange > 5) {
              setTrend('UP');
            } else if (percentChange < -5) {
              setTrend('DOWN');
            } else {
              setTrend('STABLE');
            }
          }
        }
      } catch (error) {
        // Error fetching price trend
      } finally {
        setLoading(false);
      }
    };

    fetchPriceChange();
  }, [cardId, currentPrice, variantType, showTrend]);

  // Size variations
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  // Trend colors and icons
  const getTrendDisplay = (): any => {
    if (!showTrend || loading) return null;

    const displays = {
      UP: {
        icon: '↗',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
      },
      DOWN: {
        icon: '↘',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
      },
      STABLE: {
        icon: '→',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }
    };

    return displays[trend as keyof typeof displays] || displays.STABLE;
  };

  const trendDisplay = getTrendDisplay();
  const showPercentage = priceChange !== null && Math.abs(priceChange) >= 1;

  if (currentPrice === 'N/A') {
    return (
      <span className={`inline-block text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md ${className}`}>
        N/A
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {/* Main price display */}
      <span className={`inline-block font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 tracking-tight ${sizeClasses[size as keyof typeof sizeClasses]}`}>
        {currentPrice}
      </span>

      {/* Trend indicator */}
      {showTrend && trendDisplay && (
        <span 
          className={`inline-flex items-center gap-0.5 rounded-md border font-medium ${sizeClasses[size as keyof typeof sizeClasses]} ${trendDisplay.color} ${trendDisplay.bgColor}`}
          title={`Price trend: ${trend.toLowerCase()}`}
        >
          <span className="font-bold">{trendDisplay.icon}</span>
          {showPercentage && (
            <span className="text-xs">
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          )}
        </span>
      )}
    </div>
  );
}

// Compact version for use in lists where space is limited
interface CompactPriceIndicatorProps {
  cardId: string;
  currentPrice?: string;
  variantType?: string;
  className?: string;
}

export function CompactPriceIndicator({ cardId, currentPrice, variantType = 'holofoil', className = '' }: CompactPriceIndicatorProps) {
  return (
    <PriceIndicator 
      cardId={cardId}
      currentPrice={currentPrice}
      size="sm"
      showTrend={true}
      variantType={variantType}
      className={className}
    />
  );
}

// Simple price display without trend (for fallback)
interface SimplePriceDisplayProps {
  currentPrice?: string;
  className?: string;
}

export function SimplePriceDisplay({ currentPrice, className = '' }: SimplePriceDisplayProps) {
  if (currentPrice === 'N/A') {
    return (
      <span className={`inline-block text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md ${className}`}>
        N/A
      </span>
    );
  }

  return (
    <span className={`inline-block text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 tracking-tight ${className}`}>
      {currentPrice}
    </span>
  );
}