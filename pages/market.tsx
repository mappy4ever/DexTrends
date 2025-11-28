import React, { useState } from 'react';
import Head from 'next/head';
import { useTheme } from '../context/UnifiedAppContext';
import { DynamicMarketAnalytics } from '../components/dynamic/DynamicComponents';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import BackToTop from '../components/ui/BaseBackToTop';
import { FadeIn, SlideUp } from '../components/ui/animations/animations';
import { Container } from '../components/ui/Container';
import { GradientButton, CircularButton } from '../components/ui/design-system';
import { motion } from 'framer-motion';
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          <FadeIn>
            {/* Hero Section with Enhanced Gradient */}
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-amber-600 rounded-full mb-6 shadow-2xl"
              >
                <span className="text-4xl">📊</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-green-600 via-amber-600 to-amber-600 bg-clip-text text-transparent">
                Market Analytics
              </h1>
              
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8">
                Comprehensive Pokemon TCG market insights, trending cards, and price movement analysis to help you make informed trading decisions.
              </p>
              
              {/* Quick Stats with Glass Morphism */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Container variant="default" hover className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">2.4K+</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Cards Tracked</div>
                  </Container>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Container variant="default" hover className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-cyan-600 bg-clip-text text-transparent">$45K</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Daily Volume</div>
                  </Container>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Container variant="default" hover className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">+12.5%</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Weekly Growth</div>
                  </Container>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Container variant="default" hover className="text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">156</div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">Active Traders</div>
                  </Container>
                </motion.div>
              </div>
            </div>
          </FadeIn>

          <SlideUp>
            {/* Tab Navigation with Glass Morphism */}
            <div className="flex justify-center mb-8">
              <Container variant="default" rounded="xl" padding="sm" className="max-w-4xl w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {tabs.map(tab => (
                    <CircularButton
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      variant={activeTab === tab.id ? 'primary' : 'secondary'}
                      size="lg"
                      className={`relative p-4 !rounded-xl text-left w-full ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-amber-500 to-amber-500 text-white shadow-lg scale-105'
                          : 'bg-transparent text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xl ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                          {tab.icon}
                        </span>
                        <span className="font-semibold text-sm">{tab.label}</span>
                      </div>
                      <p className={`text-xs opacity-80 ${activeTab === tab.id ? 'text-amber-100' : ''}`}>
                        {tab.description}
                      </p>
                      
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                      )}
                    </CircularButton>
                  ))}
                </div>
              </Container>
            </div>
          </SlideUp>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <FadeIn>
                <div className="space-y-8">
                  {/* Main Market Analytics Component */}
                  <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">📊</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Market Overview</h2>
                        <p className="text-stone-600 dark:text-stone-400">Real-time market analysis and trends</p>
                      </div>
                    </div>
                    
                    <DynamicMarketAnalytics />
                  </div>
                </div>
              </FadeIn>
            )}

            {activeTab === 'trending' && (
              <FadeIn>
                <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📈</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Trending Cards</h2>
                      <p className="text-stone-600 dark:text-stone-400">Most popular and searched cards</p>
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
                        <h3 className="font-bold text-stone-900 dark:text-white mb-2">Card Name {index}</h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">Base Set • Rare</p>
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
                <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">💹</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Price Movers</h2>
                      <p className="text-stone-600 dark:text-stone-400">Biggest price changes in the last 24 hours</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
                                <div className="font-semibold text-stone-900 dark:text-white">Gainer Card {index}</div>
                                <div className="text-sm text-stone-600 dark:text-stone-400">Set Name • Rarity</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600 dark:text-green-400">
                                  +{(Math.random() * 30 + 5).toFixed(1)}%
                                </div>
                                <div className="text-sm text-stone-600 dark:text-stone-400">
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
                                <div className="font-semibold text-stone-900 dark:text-white">Loser Card {index}</div>
                                <div className="text-sm text-stone-600 dark:text-stone-400">Set Name • Rarity</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-red-600 dark:text-red-400">
                                  -{(Math.random() * 20 + 2).toFixed(1)}%
                                </div>
                                <div className="text-sm text-stone-600 dark:text-stone-400">
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
                  <div className="bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">🔍</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Market Insights</h2>
                        <p className="text-stone-600 dark:text-stone-400">AI-powered analysis and predictions</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      {/* Key Insights */}
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Key Market Insights</h3>
                        <div className="space-y-4">
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-700/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-xs font-bold">💡</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100">Vintage Cards Surge</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
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
                          
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-700/50">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-white text-xs font-bold">🎯</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-amber-900 dark:text-amber-100">Seasonal Trends</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                  Holiday season typically brings 15-20% increase in high-value card trading activity.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Predictions */}
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">Price Predictions</h3>
                        <div className="space-y-4">
                          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-stone-900 dark:text-white">Charizard Base Set</span>
                              <span className="text-green-600 dark:text-green-400 font-bold">↑ Bullish</span>
                            </div>
                            <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                              Predicted to reach $500-550 by end of quarter
                            </div>
                            <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                            </div>
                          </div>
                          
                          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-stone-900 dark:text-white">Pikachu VMAX</span>
                              <span className="text-yellow-600 dark:text-yellow-400 font-bold">→ Stable</span>
                            </div>
                            <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                              Expected to maintain current price range
                            </div>
                            <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                            </div>
                          </div>
                          
                          <div className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-stone-900 dark:text-white">Modern Holos</span>
                              <span className="text-red-600 dark:text-red-400 font-bold">↓ Bearish</span>
                            </div>
                            <div className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                              May see 10-15% decline as supply increases
                            </div>
                            <div className="w-full bg-stone-200 dark:bg-stone-600 rounded-full h-2">
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

// Mark this page as full bleed to remove Layout padding
(MarketPage as any).fullBleed = true;

export default MarketPage;