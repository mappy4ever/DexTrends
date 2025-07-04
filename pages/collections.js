import React, { useState } from 'react';
import { useTheme } from '../context/themecontext';
import CollectionManager from '../components/CollectionManager';
import PriceAlerts from '../components/PriceAlerts';

export default function CollectionsPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('collections');

  const tabs = [
    { id: 'collections', label: 'My Collections', icon: '📚' },
    { id: 'alerts', label: 'Price Alerts', icon: '🔔' },
    { id: 'portfolio', label: 'Portfolio', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Collections
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your Pokemon card collection, track prices, and set alerts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
            <div className="flex space-x-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'collections' && (
            <div className="space-y-8">
              <CollectionManager />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <PriceAlerts />
            </div>
          )}
          
          {activeTab === 'portfolio' && (
            <PortfolioOverview />
          )}
        </div>
      </div>
    </div>
  );
}

// Portfolio Overview Component
function PortfolioOverview() {
  const [timeframe, setTimeframe] = useState('7d');
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 2450.75,
    totalCards: 156,
    uniqueCards: 89,
    topCards: [
      { name: 'Charizard Base Set', value: 450.00, change: 15.2 },
      { name: 'Blastoise Base Set', value: 180.00, change: -5.1 },
      { name: 'Venusaur Base Set', value: 290.00, change: 8.7 },
      { name: 'Pikachu Promo', value: 85.00, change: 22.3 },
      { name: 'Mewtwo Base Set', value: 120.00, change: -2.4 }
    ],
    recentActivity: [
      { action: 'Added', card: 'Charizard GX', date: '2024-01-15', value: 85.00 },
      { action: 'Price Update', card: 'Blastoise Base Set', date: '2024-01-14', value: 180.00 },
      { action: 'Added', card: 'Pikachu Promo', date: '2024-01-12', value: 85.00 }
    ]
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(portfolioData.totalValue)}
          </div>
          <div className="text-sm text-green-600 mt-1">
            +12.5% this month
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {portfolioData.totalCards}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            across all collections
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Unique Cards</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {portfolioData.uniqueCards}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            different cards
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Card Value</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(portfolioData.totalValue / portfolioData.totalCards)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            per card
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Cards
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {portfolioData.topCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {card.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(card.value)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(card.change)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {portfolioData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'Added' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {activity.action} {activity.card}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleDateString()} • {formatCurrency(activity.value)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Distribution
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Set */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Set</h4>
              <div className="space-y-2">
                {[
                  { name: 'Base Set', percentage: 35, value: 857.76 },
                  { name: 'Jungle', percentage: 20, value: 490.15 },
                  { name: 'Fossil', percentage: 18, value: 441.14 },
                  { name: 'Team Rocket', percentage: 15, value: 367.61 },
                  { name: 'Other', percentage: 12, value: 294.09 }
                ].map((set, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{set.name}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {set.percentage}% ({formatCurrency(set.value)})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Rarity */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Rarity</h4>
              <div className="space-y-2">
                {[
                  { name: 'Rare Holo', percentage: 45, value: 1102.84 },
                  { name: 'Rare', percentage: 25, value: 612.69 },
                  { name: 'Uncommon', percentage: 20, value: 490.15 },
                  { name: 'Common', percentage: 10, value: 245.08 }
                ].map((rarity, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: `hsl(${index * 80 + 20}, 60%, 55%)` }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{rarity.name}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {rarity.percentage}% ({formatCurrency(rarity.value)})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Condition */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">By Condition</h4>
              <div className="space-y-2">
                {[
                  { name: 'Near Mint', percentage: 60, value: 1470.45 },
                  { name: 'Excellent', percentage: 25, value: 612.69 },
                  { name: 'Good', percentage: 10, value: 245.08 },
                  { name: 'Other', percentage: 5, value: 122.54 }
                ].map((condition, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: `hsl(${index * 90 + 40}, 65%, 50%)` }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{condition.name}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {condition.percentage}% ({formatCurrency(condition.value)})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Portfolio Performance
          </h3>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Portfolio Performance Chart</p>
              <p className="text-sm">Track your collection&apos;s value over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}