import React, { useState } from 'react';
import { useTheme } from '../context/UnifiedAppContext';
import { DynamicCollectionManager, DynamicPriceAlerts } from '../components/dynamic/DynamicComponents';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { GradientButton } from '../components/ui/design-system/GradientButton';
import { CircularCard } from '../components/ui/design-system/CircularCard';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface TopCard {
  name: string;
  value: number;
  change: number;
}

interface Activity {
  action: string;
  card: string;
  date: string;
  value: number;
}

interface PortfolioData {
  totalValue: number;
  totalCards: number;
  uniqueCards: number;
  topCards: TopCard[];
  recentActivity: Activity[];
}

interface DistributionItem {
  name: string;
  percentage: number;
  value: number;
}

const CollectionsPage: NextPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('collections');

  const tabs: Tab[] = [
    { id: 'collections', label: 'My Collections', icon: '📚' },
    { id: 'alerts', label: 'Price Alerts', icon: '🔔' },
    { id: 'portfolio', label: 'Portfolio', icon: '📊' }
  ];

  return (
    <PageErrorBoundary pageName="Collections">
      <FullBleedWrapper gradient="collections">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Gradient */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            My Collections
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Manage your Pokemon card collection, track prices, and set alerts
          </motion.p>
        </div>

        {/* Tab Navigation with Glass Morphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <GlassContainer variant="medium" rounded="full" padding="none" className="inline-flex">
            <div className="flex space-x-1 p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </GlassContainer>
        </motion.div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'collections' && (
            <div className="space-y-8">
              <DynamicCollectionManager />
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="space-y-8">
              <DynamicPriceAlerts />
            </div>
          )}
          
          {activeTab === 'portfolio' && (
            <PortfolioOverview />
          )}
        </div>
      </div>
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Portfolio Overview Component
const PortfolioOverview: React.FC = () => {
  const [timeframe, setTimeframe] = useState('7d');
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary with Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassContainer variant="colored" hover className="h-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +12.5% this month
            </div>
          </GlassContainer>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassContainer variant="medium" hover className="h-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {portfolioData.totalCards}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              across all collections
            </div>
          </GlassContainer>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassContainer variant="medium" hover className="h-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">Unique Cards</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {portfolioData.uniqueCards}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              different cards
            </div>
          </GlassContainer>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassContainer variant="medium" hover className="h-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Card Value</div>
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {formatCurrency(portfolioData.totalValue / portfolioData.totalCards)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              per card
            </div>
          </GlassContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Cards */}
        <GlassContainer variant="medium">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top Performing Cards
          </h3>
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
          </GlassContainer>

        {/* Recent Activity */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all">
          <div className="p-4">
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all">
        <div className="p-4">
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
                ].map((set: DistributionItem, index) => (
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
                ].map((rarity: DistributionItem, index) => (
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
                ].map((condition: DistributionItem, index) => (
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
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all">
        <div className="p-4 flex justify-between items-center">
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
};

export default CollectionsPage;