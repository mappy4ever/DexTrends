import React, { useState, useEffect } from 'react';
import { PriceHistoryManager } from '../lib/supabase';
import { CardPriceHistory } from '../types/database';

interface PriceDataPoint {
  collected_date?: string;
  collected_at: string;
  price_market?: number;
  price_low?: number;
  price_high?: number;
  day_change_percent?: string | number;
}

interface PriceStatistics {
  current_price?: string | number;
  avg_price?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  trend_direction?: 'UP' | 'DOWN' | 'STABLE';
  price_volatility?: string | number;
}

interface SimpleLineChartProps {
  data: CardPriceHistory[];
  title: string;
  height?: number;
}

function SimpleLineChart({ data, title, height = 200 }: SimpleLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No price data available</p>
      </div>
    );
  }

  const maxPrice = Math.max(...data.map(d => parseFloat(String(d.price_market)) || 0));
  const minPrice = Math.min(...data.map(d => parseFloat(String(d.price_market)) || 0));
  const priceRange = maxPrice - minPrice || 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
          <span>${maxPrice.toFixed(2)}</span>
          <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>${minPrice.toFixed(2)}</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-12 h-full relative bg-gray-50 dark:bg-gray-700 rounded">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Price line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - (((parseFloat(String(point.price_market)) || 0) - minPrice) / priceRange) * 100;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (((parseFloat(String(point.price_market)) || 0) - minPrice) / priceRange) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3b82f6"
                  className="hover:r-2 transition-all"
                />
              );
            })}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="ml-12 flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{data[0]?.collected_at?.split('T')[0]}</span>
          <span>{data[data.length - 1]?.collected_at?.split('T')[0]}</span>
        </div>
      </div>
    </div>
  );
}

interface PriceStatsProps {
  stats: PriceStatistics | null;
  loading: boolean;
}

function PriceStats({ stats, loading }: PriceStatsProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
        <p className="text-gray-500 dark:text-gray-400">No statistics available</p>
      </div>
    );
  }

  const getTrendColor = (direction?: string) => {
    switch (direction) {
      case 'UP': return 'text-green-600 dark:text-green-400';
      case 'DOWN': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case 'UP': return '↗️';
      case 'DOWN': return '↘️';
      default: return '➡️';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Price Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${parseFloat(String(stats.current_price || 0)).toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            ${parseFloat(String(stats.avg_price || 0)).toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Price Range</p>
          <p className="text-sm text-gray-900 dark:text-white">
            ${parseFloat(String(stats.min_price || 0)).toFixed(2)} - ${parseFloat(String(stats.max_price || 0)).toFixed(2)}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Trend</p>
          <p className={`text-sm font-medium flex items-center ${getTrendColor(stats.trend_direction)}`}>
            {getTrendIcon(stats.trend_direction)} {stats.trend_direction}
          </p>
        </div>
      </div>
      
      {stats.price_volatility && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400">Volatility</p>
          <p className="text-sm text-gray-900 dark:text-white">
            ${parseFloat(String(stats.price_volatility)).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

interface PriceHistoryProps {
  cardId: string;
  cardName: string;
  variantType?: string;
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ cardId, cardName, variantType = 'holofoil' }) => {
  const [priceHistory, setPriceHistory] = useState<CardPriceHistory[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(30);

  useEffect(() => {
    if (!cardId) return;

    const fetchPriceData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch both price history and statistics
        const [historyData, statsData] = await Promise.all([
          PriceHistoryManager.getCardPriceHistory(cardId, variantType, daysBack),
          PriceHistoryManager.getCardPriceStats(cardId, variantType, daysBack)
        ]);

        setPriceHistory(historyData);
        setPriceStats(statsData);
      } catch (err) {
        // Error fetching price data
        setError('Failed to load price data');
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [cardId, variantType, daysBack]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Price History: {cardName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {variantType} variant
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(parseInt(e.target.value))}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
          
          <select
            value={variantType}
            onChange={(e) => {
              setError(null);
              setPriceHistory([]);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm">

            <option value="holofoil">Holofoil</option>
            <option value="normal">Normal</option>
            <option value="reverse_holofoil">Reverse Holo</option>
            <option value="1st_edition_holofoil">1st Edition Holo</option>
          </select>
        </div>
      </div>

      {/* Price chart and statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <SimpleLineChart
              data={priceHistory}
              title={`${cardName} Price Trend (${daysBack} days)`}
              height={250}
            />
          )}
        </div>
        
        <div>
          <PriceStats stats={priceStats} loading={loading} />
        </div>
      </div>

      {/* Recent price data table */}
      {!loading && priceHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Prices</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Market Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Low</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">High</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {priceHistory.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {row.collected_at?.split('T')[0]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      ${parseFloat(String(row.price_market || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      ${parseFloat(String(row.price_low || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      ${parseFloat(String(row.price_high || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceHistory;