import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { DynamicMarketAnalytics } from '../components/dynamic/DynamicComponents';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import BackToTop from '../components/ui/BaseBackToTop';
import { Container } from '../components/ui/Container';
import { PageHeader } from '../components/ui/BreadcrumbNavigation';
import { TabPills, type TabItem } from '../components/ui/TabPills';
import { PageLoader } from '../components/ui/SkeletonLoadingSystem';
import { EmptyState } from '../components/ui/EmptyState';
import { FiTrendingUp, FiActivity, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import useMarketData from '../hooks/useMarketData';
import type { NextPage } from 'next';

const MarketPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { trendingCards, topGainers, topLosers, stats, loading } = useMarketData('7d');

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toFixed(2)}`;
  };

  const formatPercent = (percent: number): string => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Market Overview',
      shortLabel: 'Overview',
      icon: <FiTrendingUp className="w-4 h-4" />,
    },
    {
      id: 'trending',
      label: 'Trending Cards',
      shortLabel: 'Trending',
      icon: <FiActivity className="w-4 h-4" />,
    },
    {
      id: 'movers',
      label: 'Price Movers',
      shortLabel: 'Movers',
      icon: <FiRefreshCw className="w-4 h-4" />,
    },
    {
      id: 'insights',
      label: 'Market Insights',
      shortLabel: 'Insights',
      icon: <FiBarChart2 className="w-4 h-4" />,
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
            {/* Tab Navigation using TabPills component */}
            <TabPills
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              ariaLabel="Market analytics navigation"
              className="pb-2"
            />
          </PageHeader>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? '—' : `${(stats.totalCardsTracked / 1000).toFixed(1)}K+`}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-300">Cards Tracked</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {loading ? '—' : formatCurrency(stats.dailyVolume)}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-300">Daily Volume</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className={`text-2xl font-bold ${stats.weeklyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {loading ? '—' : formatPercent(stats.weeklyGrowth)}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-300">Weekly Growth</div>
            </Container>
            <Container variant="default" hover className="text-center p-4">
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                {loading ? '—' : topGainers.length + topLosers.length}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-300">Price Movers</div>
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

                {loading ? (
                  <PageLoader text="Loading trending cards..." />
                ) : trendingCards.length === 0 ? (
                  <EmptyState
                    illustration="card"
                    title="No trending cards"
                    description="Check back later for trending card data."
                    size="sm"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingCards.slice(0, 6).map((card, index) => (
                      <Link
                        key={card.card_id}
                        href={`/cards/${card.card_id}`}
                        className="bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600 hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-stone-500">#{index + 1}</div>
                          {card.price_market && (
                            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                              ${parseFloat(String(card.price_market)).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-stone-900 dark:text-white mb-1 truncate">{card.card_name}</h3>
                        <p className="text-sm text-stone-500 mb-2 truncate">{card.set_name} • {card.variant_type || 'Standard'}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </Container>
            )}

            {activeTab === 'movers' && (
              <Container variant="default" className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">Price Movers</h2>
                <p className="text-stone-500 mb-6">Biggest price changes in the last 7 days</p>

                {loading ? (
                  <PageLoader text="Loading price movers..." />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Gainers */}
                    <div>
                      <h3 className="text-base font-medium text-green-700 dark:text-green-400 mb-4">Top Gainers</h3>
                      {topGainers.length === 0 ? (
                        <EmptyState
                          illustration="card"
                          title="No gainers"
                          description="No cards showing price increases."
                          size="sm"
                        />
                      ) : (
                        <div className="space-y-3">
                          {topGainers.slice(0, 5).map((card) => (
                            <Link
                              key={card.card_id}
                              href={`/cards/${card.card_id}`}
                              className="block bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600 hover:border-green-400 dark:hover:border-green-500 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-stone-900 dark:text-white truncate">{card.card_name}</div>
                                  <div className="text-sm text-stone-500 truncate">{card.set_name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-green-600 dark:text-green-400">
                                    {formatPercent(card.priceChangePercent)}
                                  </div>
                                  <div className="text-sm text-stone-500">
                                    ${parseFloat(String(card.price_market || 0)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Losers */}
                    <div>
                      <h3 className="text-base font-medium text-red-700 dark:text-red-400 mb-4">Top Losers</h3>
                      {topLosers.length === 0 ? (
                        <EmptyState
                          illustration="card"
                          title="No losers"
                          description="No cards showing price decreases."
                          size="sm"
                        />
                      ) : (
                        <div className="space-y-3">
                          {topLosers.slice(0, 5).map((card) => (
                            <Link
                              key={card.card_id}
                              href={`/cards/${card.card_id}`}
                              className="block bg-stone-50 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600 hover:border-red-400 dark:hover:border-red-500 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-stone-900 dark:text-white truncate">{card.card_name}</div>
                                  <div className="text-sm text-stone-500 truncate">{card.set_name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-red-600 dark:text-red-400">
                                    {formatPercent(card.priceChangePercent)}
                                  </div>
                                  <div className="text-sm text-stone-500">
                                    ${parseFloat(String(card.price_market || 0)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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