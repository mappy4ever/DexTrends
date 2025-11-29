import React, { useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../context/UnifiedAppContext';
import { DynamicMarketAnalytics } from '../components/dynamic/DynamicComponents';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import BackToTop from '../components/ui/BaseBackToTop';
import { Container } from '../components/ui/Container';
import { PageHeader } from '../components/ui/BreadcrumbNavigation';
import { IoTrendingUp, IoFlame, IoSwapVertical, IoAnalytics } from 'react-icons/io5';
import type { NextPage } from 'next';

interface Tab {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const MarketPage: NextPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs: Tab[] = [
    { 
      id: 'overview', 
      label: 'Market Overview', 
      icon: '📊',
      description: 'Market trends and top movers'
    },
    { 
      id: 'trending', 
      label: 'Trending Cards', 
      icon: '📈',
      description: 'Most popular cards right now'
    },
    { 
      id: 'movers', 
      label: 'Price Movers', 
      icon: '💹',
      description: 'Biggest price changes'
    },
    { 
      id: 'insights', 
      label: 'Market Insights', 
      icon: '🔍',
      description: 'Analysis and predictions'
    }
  ];

  return (
    <PageErrorBoundary pageName="Market Analytics">
      <Head>
        <title>Market Analytics | Pokemon TCG Market Insights | DexTrends</title>
        <meta name="description" content="Track Pokemon TCG market trends, price movements, and trading insights. Discover trending cards and market analytics." />
        <meta name="keywords" content="pokemon tcg market, card prices, market trends, trading analytics, price tracker" />
      </Head>
      
      <FullBleedWrapper gradient="pokedex">
        <div className="container mx-auto px-4 py-6 max-w-7xl">

          {/* PageHeader with Breadcrumbs */}
          <PageHeader
            title="Market Analytics"
            description="TCG market insights, trending cards, and price analysis"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Market', href: '/market', icon: '📈', isActive: true },
            ]}
          >
            {/* Tab Navigation as Pills */}
            <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-stone-600 dark:text-stone-400 hover:text-amber-600'
                  }`}
                >
                  {tab.id === 'overview' && <IoTrendingUp className="w-4 h-4" />}
                  {tab.id === 'trending' && <IoFlame className="w-4 h-4" />}
                  {tab.id === 'movers' && <IoSwapVertical className="w-4 h-4" />}
                  {tab.id === 'insights' && <IoAnalytics className="w-4 h-4" />}
                  <span className="hidden sm:inline">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </PageHeader>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.4K+</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Cards Tracked</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">$45K</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Daily Volume</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">+12.5%</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Weekly Growth</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-200">156</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Active Traders</div>
            </Container>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <Container variant="default" className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Market Overview</h2>
                <p className="text-stone-500 mb-6">Real-time market analysis and trends</p>
                <DynamicMarketAnalytics />
              </Container>
            )}

            {activeTab === 'trending' && (
              <Container variant="default" className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Trending Cards</h2>
                <p className="text-stone-500 mb-6">Most popular and searched cards</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((index) => (
                    <div key={index} className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-stone-500">#{index}</div>
                        <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          +{(Math.random() * 50 + 10).toFixed(1)}%
                        </div>
                      </div>
                      <h3 className="font-semibold text-stone-900 dark:text-white mb-1">Card Name {index}</h3>
                      <p className="text-sm text-stone-500 mb-2">Base Set • Rare</p>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${(Math.random() * 200 + 50).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </Container>
            )}

            {activeTab === 'movers' && (
              <Container variant="default" className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Price Movers</h2>
                <p className="text-stone-500 mb-6">Biggest price changes in the last 24 hours</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Gainers */}
                  <div>
                    <h3 className="text-base font-medium text-green-700 dark:text-green-400 mb-4">Top Gainers</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-stone-900 dark:text-white">Gainer Card {index}</div>
                              <div className="text-sm text-stone-500">Set Name • Rarity</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600 dark:text-green-400">
                                +{(Math.random() * 30 + 5).toFixed(1)}%
                              </div>
                              <div className="text-sm text-stone-500">
                                ${(Math.random() * 100 + 20).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Losers */}
                  <div>
                    <h3 className="text-base font-medium text-red-700 dark:text-red-400 mb-4">Top Losers</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-stone-900 dark:text-white">Loser Card {index}</div>
                              <div className="text-sm text-stone-500">Set Name • Rarity</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600 dark:text-red-400">
                                -{(Math.random() * 20 + 2).toFixed(1)}%
                              </div>
                              <div className="text-sm text-stone-500">
                                ${(Math.random() * 80 + 15).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Container>
            )}

            {activeTab === 'insights' && (
              <Container variant="default" className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Market Insights</h2>
                <p className="text-stone-500 mb-6">Analysis and predictions</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Insights */}
                  <div>
                    <h3 className="text-base font-medium text-stone-900 dark:text-white mb-4">Key Market Insights</h3>
                    <div className="space-y-3">
                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <h4 className="font-medium text-stone-900 dark:text-white mb-1">Vintage Cards Surge</h4>
                        <p className="text-sm text-stone-500">
                          Base Set cards are showing unprecedented growth with 25% average increase this month.
                        </p>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <h4 className="font-medium text-stone-900 dark:text-white mb-1">New Set Impact</h4>
                        <p className="text-sm text-stone-500">
                          The latest expansion is driving increased interest in related Pokemon from older sets.
                        </p>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <h4 className="font-medium text-stone-900 dark:text-white mb-1">Seasonal Trends</h4>
                        <p className="text-sm text-stone-500">
                          Holiday season typically brings 15-20% increase in high-value card trading activity.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Predictions */}
                  <div>
                    <h3 className="text-base font-medium text-stone-900 dark:text-white mb-4">Price Predictions</h3>
                    <div className="space-y-3">
                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-stone-900 dark:text-white">Charizard Base Set</span>
                          <span className="text-green-600 dark:text-green-400 font-medium text-sm">Bullish</span>
                        </div>
                        <div className="text-sm text-stone-500 mb-2">
                          Predicted to reach $500-550 by end of quarter
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-stone-900 dark:text-white">Pikachu VMAX</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium text-sm">Stable</span>
                        </div>
                        <div className="text-sm text-stone-500 mb-2">
                          Expected to maintain current price range
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-stone-900 dark:text-white">Modern Holos</span>
                          <span className="text-red-600 dark:text-red-400 font-medium text-sm">Bearish</span>
                        </div>
                        <div className="text-sm text-stone-500 mb-2">
                          May see 10-15% decline as supply increases
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-1.5">
                          <div className="bg-red-500 h-1.5 rounded-full" style={{width: '40%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            )}
          </div>
        </div>
        
        <BackToTop />
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Mark this page as full bleed to remove Layout padding
(MarketPage as any).fullBleed = true;

export default MarketPage;