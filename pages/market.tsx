import React, { useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../context/UnifiedAppContext';
import { DynamicMarketAnalytics } from '../components/dynamic/DynamicComponents';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import BackToTop from '../components/ui/SimpleBackToTop';
import { FadeIn, SlideUp } from '../components/ui/animations/animations';
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
      
      <FullBleedWrapper gradient="tcg">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          <FadeIn>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-800/30 dark:to-blue-800/30 rounded-full mb-6">
                <span className="text-3xl">📊</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Market Analytics
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                Comprehensive Pokemon TCG market insights, trending cards, and price movement analysis to help you make informed trading decisions.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.4K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cards Tracked</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$45K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Volume</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">+12.5%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Weekly Growth</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">156</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Traders</div>
                </div>
              </div>
            </div>
          </FadeIn>

          <SlideUp>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 max-w-4xl w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative p-4 rounded-xl transition-all duration-300 text-left ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xl ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                          {tab.icon}
                        </span>
                        <span className="font-semibold text-sm">{tab.label}</span>
                      </div>
                      <p className={`text-xs opacity-80 ${activeTab === tab.id ? 'text-blue-100' : ''}`}>
                        {tab.description}
                      </p>
                      
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <FadeIn>
                <div className="space-y-8">
                  {/* Main Market Analytics Component */}
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">📊</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview</h2>
                        <p className="text-gray-600 dark:text-gray-400">Real-time market analysis and trends</p>
                      </div>
                    </div>
                    
                    <DynamicMarketAnalytics />
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'trending' && (
              <FadeIn>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📈</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Cards</h2>
                      <p className="text-gray-600 dark:text-gray-400">Most popular and searched cards</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                      <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">#{index}</div>
                          <div className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">
                            +{(Math.random() * 50 + 10).toFixed(1)}%
                          </div>
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Card Name {index}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Base Set • Rare</p>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${(Math.random() * 200 + 50).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'movers' && (
              <FadeIn>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">💹</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Price Movers</h2>
                      <p className="text-gray-600 dark:text-gray-400">Biggest price changes in the last 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Gainers */}
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                        <span>📈</span> Top Gainers
                      </h3>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">Gainer Card {index}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Set Name • Rarity</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600 dark:text-green-400">
                                  +{(Math.random() * 30 + 5).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
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
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                        <span>📉</span> Top Losers
                      </h3>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((index) => (
                          <div key={index} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200/50 dark:border-red-700/50">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">Loser Card {index}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Set Name • Rarity</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-600 dark:text-red-400">
                                  -{(Math.random() * 20 + 2).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  ${(Math.random() * 80 + 15).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'insights' && (
              <FadeIn>
                <div className="space-y-8">
                  {/* Market Insights */}
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">🔍</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Insights</h2>
                        <p className="text-gray-600 dark:text-gray-400">AI-powered analysis and predictions</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Key Insights */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Market Insights</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-xs font-bold">💡</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Vintage Cards Surge</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                  Base Set cards are showing unprecedented growth with 25% average increase this month.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200/50 dark:border-green-700/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-xs font-bold">📊</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-900 dark:text-green-100">New Set Impact</h4>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                  The latest expansion is driving increased interest in related Pokemon from older sets.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-xs font-bold">🎯</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Seasonal Trends</h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                                  Holiday season typically brings 15-20% increase in high-value card trading activity.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Predictions */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Predictions</h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Charizard Base Set</span>
                              <span className="text-green-600 dark:text-green-400 font-bold">↑ Bullish</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Predicted to reach $500-550 by end of quarter
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Pikachu VMAX</span>
                              <span className="text-yellow-600 dark:text-yellow-400 font-bold">→ Stable</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              Expected to maintain current price range
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Modern Holos</span>
                              <span className="text-red-600 dark:text-red-400 font-bold">↓ Bearish</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              May see 10-15% decline as supply increases
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{width: '40%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
        
        <BackToTop />
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

export default MarketPage;