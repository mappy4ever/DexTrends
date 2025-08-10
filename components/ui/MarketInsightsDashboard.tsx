import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FireIcon,
  EyeIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Type definitions
interface Card {
  id: string;
  name: string;
  price?: string | number;
  currentPrice?: string | number;
  previousPrice?: string | number;
  rarity?: string;
  set?: {
    name: string;
  };
}

interface CardWithChanges extends Card {
  currentPrice: number;
  historicalPrice: number;
  priceChange: number;
  absChange: number;
}

interface RarityData {
  count: number;
  totalValue: number;
  avgChange: number;
  avgValue?: number;
}

interface SetData {
  cards: CardWithChanges[];
  totalValue: number;
  avgChange: number;
  avgValue?: number;
}

interface MarketMetrics {
  totalMarketCap: number;
  avgPriceChange: number;
  gainersCount: number;
  losersCount: number;
  topGainer: CardWithChanges | undefined;
  topLoser: CardWithChanges | undefined;
  volatility: number;
  rarityDistribution: Record<string, RarityData>;
  priceRanges: Record<string, CardWithChanges[]>;
  setPerformance: Record<string, SetData>;
  cardsWithChanges: CardWithChanges[];
}

interface Insight {
  type: 'bullish' | 'bearish' | 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  action: string;
  confidence: 'high' | 'medium' | 'low';
}

interface MarketInsightsDashboardProps {
  cards?: Card[];
  userPortfolio?: Card[];
}

/**
 * Advanced Market Insights Dashboard
 * Comprehensive price trend analysis and market intelligence
 */
const MarketInsightsDashboard: React.FC<MarketInsightsDashboardProps> = ({ cards = [], userPortfolio = [] }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState('price');
  const [marketData, setMarketData] = useState(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate market metrics
  const marketMetrics = useMemo<MarketMetrics | null>(() => {
    if (!cards.length) return null;

    const now = new Date();
    const timeframeMs: Record<string, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };

    const cutoffDate = new Date(now.getTime() - timeframeMs[timeframe]);

    // Calculate price changes
    const cardsWithChanges: CardWithChanges[] = cards.map(card => {
      const currentPrice = parseFloat(String(card.currentPrice || card.price || 0));
      const historicalPrice = parseFloat(String(card.previousPrice || currentPrice * 0.95)); // Mock previous price
      const change = ((currentPrice - historicalPrice) / historicalPrice) * 100;
      
      return {
        ...card,
        currentPrice,
        historicalPrice,
        priceChange: change,
        absChange: Math.abs(change)
      };
    });

    // Market overview
    const totalMarketCap = cardsWithChanges.reduce((sum, card) => sum + card.currentPrice, 0);
    const avgPriceChange = cardsWithChanges.reduce((sum, card) => sum + card.priceChange, 0) / cardsWithChanges.length;
    const gainers = cardsWithChanges.filter(card => card.priceChange > 0);
    const losers = cardsWithChanges.filter(card => card.priceChange < 0);
    const topGainer = gainers.sort((a, b) => b.priceChange - a.priceChange)[0];
    const topLoser = losers.sort((a, b) => a.priceChange - b.priceChange)[0];

    // Volatility analysis
    const volatility = cardsWithChanges.reduce((sum, card) => sum + card.absChange, 0) / cardsWithChanges.length;

    // Rarity distribution
    const rarityDistribution = cardsWithChanges.reduce<Record<string, RarityData>>((acc, card) => {
      const rarity = card.rarity || 'Unknown';
      acc[rarity] = {
        count: (acc[rarity]?.count || 0) + 1,
        totalValue: (acc[rarity]?.totalValue || 0) + card.currentPrice,
        avgChange: (acc[rarity]?.avgChange || 0) + card.priceChange
      };
      return acc;
    }, {});

    // Calculate average change per rarity
    Object.keys(rarityDistribution).forEach(rarity => {
      rarityDistribution[rarity].avgChange = rarityDistribution[rarity].avgChange / rarityDistribution[rarity].count;
      rarityDistribution[rarity].avgValue = rarityDistribution[rarity].totalValue / rarityDistribution[rarity].count;
    });

    // Price ranges
    const priceRanges = {
      'Under $10': cardsWithChanges.filter(card => card.currentPrice < 10),
      '$10 - $50': cardsWithChanges.filter(card => card.currentPrice >= 10 && card.currentPrice < 50),
      '$50 - $100': cardsWithChanges.filter(card => card.currentPrice >= 50 && card.currentPrice < 100),
      '$100+': cardsWithChanges.filter(card => card.currentPrice >= 100)
    };

    // Set performance
    const setPerformance = cardsWithChanges.reduce<Record<string, SetData>>((acc, card) => {
      const setName = card.set?.name || 'Unknown';
      if (!acc[setName]) {
        acc[setName] = {
          cards: [],
          totalValue: 0,
          avgChange: 0
        };
      }
      acc[setName].cards.push(card);
      acc[setName].totalValue += card.currentPrice;
      return acc;
    }, {});

    Object.keys(setPerformance).forEach(setName => {
      const setData = setPerformance[setName];
      setData.avgChange = setData.cards.reduce((sum, card) => sum + card.priceChange, 0) / setData.cards.length;
      setData.avgValue = setData.totalValue / setData.cards.length;
    });

    return {
      totalMarketCap,
      avgPriceChange,
      gainersCount: gainers.length,
      losersCount: losers.length,
      topGainer,
      topLoser,
      volatility,
      rarityDistribution,
      priceRanges,
      setPerformance,
      cardsWithChanges
    };
  }, [cards, timeframe]);

  // Generate market insights
  const generateInsights = useCallback((): Insight[] => {
    if (!marketMetrics) return [];

    const insights: Insight[] = [];

    // Price movement insights
    if (marketMetrics.avgPriceChange > 5) {
      insights.push({
        type: 'bullish',
        title: 'Strong Market Performance',
        description: `Average card prices increased by ${marketMetrics.avgPriceChange.toFixed(1)}% over the past ${timeframe}`,
        action: 'Consider holding or buying more cards',
        confidence: 'high'
      });
    } else if (marketMetrics.avgPriceChange < -5) {
      insights.push({
        type: 'bearish',
        title: 'Market Correction',
        description: `Average card prices decreased by ${Math.abs(marketMetrics.avgPriceChange).toFixed(1)}% over the past ${timeframe}`,
        action: 'Good opportunity to buy at lower prices',
        confidence: 'medium'
      });
    }

    // Volatility insights
    if (marketMetrics.volatility > 15) {
      insights.push({
        type: 'warning',
        title: 'High Market Volatility',
        description: `Market showing high volatility with average price swings of ${marketMetrics.volatility.toFixed(1)}%`,
        action: 'Exercise caution and consider dollar-cost averaging',
        confidence: 'high'
      });
    }

    // Top performer insights
    if (marketMetrics.topGainer && marketMetrics.topGainer.priceChange > 20) {
      insights.push({
        type: 'opportunity',
        title: 'Hot Card Alert',
        description: `${marketMetrics.topGainer.name} is up ${marketMetrics.topGainer.priceChange.toFixed(1)}%`,
        action: 'Monitor for momentum or consider taking profits',
        confidence: 'medium'
      });
    }

    // Rarity insights
    const bestRarity = Object.entries(marketMetrics.rarityDistribution)
      .sort(([,a], [,b]) => b.avgChange - a.avgChange)[0];
    
    if (bestRarity && bestRarity[1].avgChange > 10) {
      insights.push({
        type: 'info',
        title: 'Rarity Trend',
        description: `${bestRarity[0]} cards are outperforming with average gains of ${bestRarity[1].avgChange.toFixed(1)}%`,
        action: `Consider focusing on ${bestRarity[0]} cards`,
        confidence: 'medium'
      });
    }

    // Set performance insights
    const bestSet = Object.entries(marketMetrics.setPerformance)
      .sort(([,a], [,b]) => b.avgChange - a.avgChange)[0];
    
    if (bestSet && bestSet[1].avgChange > 8) {
      insights.push({
        type: 'info',
        title: 'Set Performance Leader',
        description: `${bestSet[0]} cards are leading with ${bestSet[1].avgChange.toFixed(1)}% average gains`,
        action: `Look for more cards from ${bestSet[0]}`,
        confidence: 'medium'
      });
    }

    return insights;
  }, [marketMetrics, timeframe]);

  // Chart configurations
  const priceHistoryChart: { data: ChartData<'line'>; options: ChartOptions<'line'> } = {
    data: {
      labels: ['7d ago', '6d ago', '5d ago', '4d ago', '3d ago', '2d ago', '1d ago', 'Today'],
      datasets: [
        {
          label: 'Market Index',
          data: [100, 102, 99, 103, 105, 104, 107, 108], // Mock data
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Your Portfolio',
          data: [100, 101, 98, 105, 108, 106, 110, 112], // Mock data
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Price Performance Comparison'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  };

  const rarityChart: { data: ChartData<'doughnut'>; options: ChartOptions<'doughnut'> } = {
    data: {
      labels: Object.keys(marketMetrics?.rarityDistribution || {}),
      datasets: [
        {
          data: Object.values(marketMetrics?.rarityDistribution || {}).map(r => r.totalValue),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Market Value by Rarity'
        }
      }
    }
  };

  const priceRangeChart: { data: ChartData<'bar'>; options: ChartOptions<'bar'> } = {
    data: {
      labels: Object.keys(marketMetrics?.priceRanges || {}),
      datasets: [
        {
          label: 'Number of Cards',
          data: Object.values(marketMetrics?.priceRanges || {}).map(range => range.length),
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Cards by Price Range'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading time
    setTimeout(() => {
      setInsights(generateInsights());
      setIsLoading(false);
    }, 1000);
  }, [marketMetrics, generateInsights]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'bullish': return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'bearish': return <TrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'opportunity': return <FireIcon className="h-5 w-5 text-orange-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'bullish': return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'bearish': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'opportunity': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!marketMetrics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No market data available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add some cards to see market insights and trends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
            Market Insights
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis of Pokemon card market trends
          </p>
        </div>
        
        {/* Timeframe selector */}
        <div className="mt-4 sm:mt-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${marketMetrics.totalMarketCap.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {marketMetrics.avgPriceChange >= 0 ? 
              <ArrowUpIcon className="h-8 w-8 text-green-500" /> :
              <ArrowDownIcon className="h-8 w-8 text-red-500" />
            }
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Change</p>
              <p className={`text-2xl font-bold ${
                marketMetrics.avgPriceChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {marketMetrics.avgPriceChange >= 0 ? '+' : ''}{marketMetrics.avgPriceChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gainers</p>
              <p className="text-2xl font-bold text-green-600">
                {marketMetrics.gainersCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingDownIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Decliners</p>
              <p className="text-2xl font-bold text-red-600">
                {marketMetrics.losersCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2" />
            Market Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                      💡 {insight.action}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      insight.confidence === 'high' ? 'bg-green-100 text-green-800' :
                      insight.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {insight.confidence} confidence
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price History */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <Line data={priceHistoryChart.data} options={priceHistoryChart.options} />
        </div>

        {/* Rarity Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <Doughnut data={rarityChart.data} options={rarityChart.options} />
        </div>
      </div>

      {/* Price Range Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <Bar data={priceRangeChart.data} options={priceRangeChart.options} />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {marketMetrics.cardsWithChanges
              .filter(card => card.priceChange > 0)
              .sort((a, b) => b.priceChange - a.priceChange)
              .slice(0, 5)
              .map((card, index) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.set?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{card.priceChange.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${card.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingDownIcon className="h-5 w-5 mr-2 text-red-500" />
            Top Decliners
          </h3>
          <div className="space-y-3">
            {marketMetrics.cardsWithChanges
              .filter(card => card.priceChange < 0)
              .sort((a, b) => a.priceChange - b.priceChange)
              .slice(0, 5)
              .map((card, index) => (
                <div key={card.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.set?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      {card.priceChange.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${card.currentPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsDashboard;