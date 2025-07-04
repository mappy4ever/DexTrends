import React, { useState, useEffect } from 'react';
import { PriceHistoryManager } from '../lib/supabase';
import { CompactPriceIndicator } from './ui/PriceIndicator';
import Link from 'next/link';

// Market analytics dashboard with trending insights
export default function MarketAnalytics({ className = '' }) {
  const [analytics, setAnalytics] = useState({
    trendingCards: [],
    topMovers: [],
    marketStats: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
      
      // Load various analytics data
      const [trendingData, recentData] = await Promise.all([
        PriceHistoryManager.getTrendingCards(days, 10),
        PriceHistoryManager.getCardsWithPriceData(20)
      ]);

      // Simulate some additional analytics (in real app, these would be from database)
      // Use deterministic values based on data length for consistency
      const dataHash = recentData.length % 100;
      const marketStats = {
        totalCardsTracked: recentData.length * 50, // Simulate larger dataset
        avgPriceChange: ((dataHash / 100 - 0.5) * 10).toFixed(2), // Deterministic based on data
        topGainers: 15,
        topLosers: 8,
        marketCap: 1250000,
        volume24h: 45000
      };

      setAnalytics({
        trendingCards: trendingData,
        topMovers: generateTopMovers(recentData),
        marketStats,
        recentActivity: recentData
      });
    } catch (error) {
      // Error loading analytics
    } finally {
      setLoading(false);
    }
  };

  const generateTopMovers = (cards) => {
    // Simulate price changes for demo purposes using deterministic values
    return cards.slice(0, 10).map((card, index) => {
      const currentPrice = parseFloat(card.price_market || 0);
      
      // Use card ID hash for deterministic "random" values
      const hashCode = (card.card_id || '').split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      const normalizedHash = (Math.abs(hashCode) % 1000) / 1000;
      const changePercent = (normalizedHash - 0.5) * 30; // -15% to +15%
      const isPositive = changePercent > 0;
      
      // Use index and hash for volume
      const volumeHash = Math.abs(hashCode + index) % 900;
      
      return {
        ...card,
        priceChange: changePercent,
        priceChangeAbs: Math.abs(currentPrice * changePercent / 100),
        isPositive,
        volume: volumeHash + 100 // 100-1000 range
      };
    }).sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (percent) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Market Analytics
        </h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="24h">24 Hours</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
        </select>
      </div>
      {/* Market Statistics Cards */}
      {analytics.marketStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Cards Tracked</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {analytics.marketStats.totalCardsTracked.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Change</div>
            <div className={`text-xl font-bold ${analytics.marketStats.avgPriceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(analytics.marketStats.avgPriceChange)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Top Gainers</div>
            <div className="text-xl font-bold text-green-600">
              {analytics.marketStats.topGainers}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Top Losers</div>
            <div className="text-xl font-bold text-red-600">
              {analytics.marketStats.topLosers}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.marketStats.marketCap)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">24h Volume</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(analytics.marketStats.volume24h)}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Price Movers ({timeframe})
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {analytics.topMovers.slice(0, 8).map((card, index) => (
                <div key={card.card_id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/cards/${card.card_id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        
                        {card.card_name}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {card.set_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${parseFloat(card.price_market || 0).toFixed(2)}
                    </div>
                    <div className={`text-xs font-medium ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(card.priceChange)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trending Cards
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {analytics.trendingCards.slice(0, 8).map((card, index) => (
                <div key={card.card_id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/cards/${card.card_id}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        
                        {card.card_name}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {card.set_name} • {card.variant_type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <CompactPriceIndicator
                      cardId={card.card_id}
                      currentPrice={`$${parseFloat(card.price_market || 0).toFixed(2)}`}
                      variantType={card.variant_type}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Recent Market Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Price Updates
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.recentActivity.slice(0, 9).map((card) => (
              <div key={`${card.card_id}-${card.collected_at}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <Link href={`/cards/${card.card_id}`} className="block">
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
                    {card.card_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {card.set_name}
                  </div>
                  <div className="flex justify-between items-center">
                    <CompactPriceIndicator
                      cardId={card.card_id}
                      currentPrice={`$${parseFloat(card.price_market || 0).toFixed(2)}`}
                      variantType={card.variant_type}
                    />
                    <div className="text-xs text-gray-400">
                      {new Date(card.collected_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}