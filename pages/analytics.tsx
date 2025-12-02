import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiEye, 
  FiSearch, 
  FiClock, 
  FiDownload,
  FiFilter,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiZap,
  FiServer,
  FiSmartphone,
  FiMonitor,
  FiTablet
} from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { LineChart, BarChart, DoughnutChart } from '../components/ui/LazyChart';
import ExportButton from '../components/ui/ExportButton';
import PageErrorBoundary from '../components/ui/PageErrorBoundary';
import { AnalyticsDashboardData, AnalyticsMetric, AnalyticsFilters, ChartDataPoint, TimeSeriesData, PopularItem } from '../types/analytics';
import { exportData, ExportFormat } from '../utils/exportData';
import logger from '../utils/logger';
import { cn } from '../utils/cn';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';

// Mock data generator for development
const generateMockAnalyticsData = (): AnalyticsDashboardData => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Generate time series data for the last 30 days
  const generateTimeSeriesData = (baseValue: number, variance: number = 0.2): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const randomVariance = (Math.random() - 0.5) * variance;
      const value = Math.max(0, Math.round(baseValue * (1 + randomVariance)));
      data.push({
        date: date.toISOString().split('T')[0],
        value,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return data;
  };

  const popularPokemon: PopularItem[] = [
    { id: 25, name: 'Pikachu', count: 15420, percentage: 12.8, type: 'Electric' },
    { id: 150, name: 'Mewtwo', count: 12880, percentage: 10.7, type: 'Psychic' },
    { id: 6, name: 'Charizard', count: 11950, percentage: 9.9, type: 'Fire/Flying' },
    { id: 249, name: 'Lugia', count: 9870, percentage: 8.2, type: 'Psychic/Flying' },
    { id: 144, name: 'Articuno', count: 8640, percentage: 7.2, type: 'Ice/Flying' },
    { id: 39, name: 'Jigglypuff', count: 7890, percentage: 6.6, type: 'Normal/Fairy' },
    { id: 94, name: 'Gengar', count: 7340, percentage: 6.1, type: 'Ghost/Poison' },
    { id: 130, name: 'Gyarados', count: 6980, percentage: 5.8, type: 'Water/Flying' }
  ];

  const popularTcgSets: PopularItem[] = [
    { id: 'sv3', name: 'Obsidian Flames', count: 8950, percentage: 18.2 },
    { id: 'sv2', name: 'Paldea Evolved', count: 7640, percentage: 15.5 },
    { id: 'sv1', name: 'Scarlet & Violet Base', count: 6890, percentage: 14.0 },
    { id: 'swsh12', name: 'Silver Tempest', count: 5940, percentage: 12.1 },
    { id: 'swsh11', name: 'Lost Origin', count: 5320, percentage: 10.8 },
    { id: 'swsh10', name: 'Astral Radiance', count: 4870, percentage: 9.9 }
  ];

  const topFeatures: PopularItem[] = [
    { id: 'pokedex', name: 'Pokedex Browse', count: 45680, percentage: 28.7 },
    { id: 'tcg-search', name: 'TCG Card Search', count: 32140, percentage: 20.2 },
    { id: 'battle-sim', name: 'Battle Simulator', count: 28950, percentage: 18.2 },
    { id: 'type-chart', name: 'Type Effectiveness', count: 19870, percentage: 12.5 },
    { id: 'pocket-mode', name: 'Pocket Mode', count: 16430, percentage: 10.3 },
    { id: 'regions', name: 'Regions Guide', count: 14250, percentage: 9.0 }
  ];

  return {
    overview: {
      totalViews: { label: 'Total Page Views', value: 1248567, change: 15.2, trend: 'up' },
      uniqueVisitors: { label: 'Unique Visitors', value: 89423, change: 8.7, trend: 'up' },
      pokemonSearches: { label: 'Pokemon Searches', value: 156789, change: 12.4, trend: 'up' },
      tcgViews: { label: 'TCG Card Views', value: 67432, change: -2.1, trend: 'down' },
      averageSessionTime: { label: 'Avg Session Time', value: '4m 32s', change: 5.8, trend: 'up' },
      bounceRate: { label: 'Bounce Rate', value: '34.2%', change: -3.2, trend: 'up' }
    },
    popularPokemon,
    popularTcgSets,
    searchTrends: generateTimeSeriesData(3500, 0.3),
    pageViews: [
      { label: 'Pokedex', value: 45680, category: 'pokemon' },
      { label: 'TCG Sets', value: 32140, category: 'tcg' },
      { label: 'Battle Sim', value: 28950, category: 'battle' },
      { label: 'Type Chart', value: 19870, category: 'reference' },
      { label: 'Pocket Mode', value: 16430, category: 'mobile' },
      { label: 'Regions', value: 14250, category: 'pokemon' }
    ],
    userActivity: generateTimeSeriesData(2800, 0.25),
    deviceStats: [
      { label: 'Mobile', value: 52.3, category: 'mobile' },
      { label: 'Desktop', value: 34.7, category: 'desktop' },
      { label: 'Tablet', value: 13.0, category: 'tablet' }
    ],
    regionStats: [
      { label: 'Kanto', value: 28.5, category: 'region' },
      { label: 'Johto', value: 18.7, category: 'region' },
      { label: 'Hoenn', value: 16.2, category: 'region' },
      { label: 'Sinnoh', value: 14.8, category: 'region' },
      { label: 'Unova', value: 12.1, category: 'region' },
      { label: 'Others', value: 9.7, category: 'region' }
    ],
    topFeatures,
    errorRates: generateTimeSeriesData(0.8, 0.4),
    performance: {
      averageLoadTime: { label: 'Avg Load Time', value: '1.2s', change: -8.3, trend: 'up' },
      cacheHitRate: { label: 'Cache Hit Rate', value: '94.7%', change: 2.1, trend: 'up' },
      apiResponseTime: { label: 'API Response Time', value: '245ms', change: -12.4, trend: 'up' }
    }
  };
};

// Metric Card Component
const MetricCard: React.FC<{ metric: AnalyticsMetric; icon: React.ReactNode }> = ({ metric, icon }) => (
  <Container variant="default" hover className="h-full">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-amber-600 dark:text-amber-400">
            {icon}
          </div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
            {metric.label}
          </p>
        </div>
        <p className="text-2xl font-bold text-stone-900 dark:text-white mb-1">
          {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
        </p>
        {metric.change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            metric.trend === 'up' 
              ? metric.change > 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
              : metric.change < 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
          }`}>
            <FiTrendingUp className={`w-4 h-4 ${
              (metric.trend === 'up' && metric.change > 0) || 
              (metric.trend === 'up' && metric.change < 0) 
                ? '' 
                : 'rotate-180'
            }`} />
            <span>{Math.abs(metric.change)}%</span>
          </div>
        )}
      </div>
    </div>
  </Container>
);

// Popular Items List Component
const PopularItemsList: React.FC<{
  title: string;
  items: PopularItem[];
  icon: React.ReactNode;
  showPercentage?: boolean;
}> = ({ title, items, icon, showPercentage = true }) => (
  <Container variant="default" className="h-full">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="space-y-3">
      {items.slice(0, 6).map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700"
        >
          <div className="flex-1">
            <p className="font-medium text-stone-900 dark:text-white">
              {item.name}
            </p>
            {item.type && (
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {item.type}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-stone-900 dark:text-white">
              {item.count.toLocaleString()}
            </p>
            {showPercentage && item.percentage && (
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {item.percentage}%
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </Container>
);

const Analytics: NextPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    period: 'day',
    category: 'all'
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = generateMockAnalyticsData();
        setAnalyticsData(data);
        logger.info('Analytics data loaded successfully');
      } catch (error) {
        logger.error('Failed to load analytics data', { error });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [filters]);

  // Chart configurations
  const searchTrendsChartData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      labels: analyticsData.searchTrends.map(d => d.label || d.date),
      datasets: [{
        label: 'Daily Searches',
        data: analyticsData.searchTrends.map(d => d.value),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }, [analyticsData]);

  const pageViewsChartData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      labels: analyticsData.pageViews.map(d => d.label),
      datasets: [{
        label: 'Page Views',
        data: analyticsData.pageViews.map(d => d.value),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)'
      }]
    };
  }, [analyticsData]);

  const deviceStatsChartData = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      labels: analyticsData.deviceStats.map(d => d.label),
      datasets: [{
        data: analyticsData.deviceStats.map(d => d.value),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)'
      }]
    };
  }, [analyticsData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          },
          padding: 20
        }
      }
    }
  };

  // Export functionality (SSR safe)
  const handleExportAnalytics = async (data: any[], format: ExportFormat) => {
    if (!analyticsData) return;
    
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      logger.warn('Export functionality is not available on server');
      return;
    }
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      dateRange: filters.dateRange,
      overview: analyticsData.overview,
      popularPokemon: analyticsData.popularPokemon,
      popularTcgSets: analyticsData.popularTcgSets,
      topFeatures: analyticsData.topFeatures,
      searchTrends: analyticsData.searchTrends,
      pageViews: analyticsData.pageViews,
      deviceStats: analyticsData.deviceStats,
      performance: analyticsData.performance
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dextrends-analytics-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logger.info('Analytics exported successfully', { format });
  };

  if (isLoading) {
    return (
      <PageErrorBoundary pageName="Analytics Dashboard">
        <Head>
          <title>Analytics Dashboard - DexTrends</title>
          <meta name="description" content="Comprehensive analytics and insights for DexTrends usage" />
        </Head>
        
        <FullBleedWrapper gradient="pokedex">
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6">
              {/* Loading skeletons */}
              {Array.from({ length: 6 }).map((_, i) => (
                <Container key={i} variant="default">
                  <div className="animate-pulse">
                    <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-1/4 mb-2"></div>
                    <div className="h-8 bg-stone-300 dark:bg-stone-600 rounded w-1/3 mb-4"></div>
                    <div className="h-32 bg-stone-300 dark:bg-stone-600 rounded"></div>
                  </div>
                </Container>
              ))}
            </div>
          </div>
        </FullBleedWrapper>
      </PageErrorBoundary>
    );
  }

  if (!analyticsData) {
    return (
      <PageErrorBoundary pageName="Analytics Dashboard">
        <FullBleedWrapper gradient="pokedex">
          <div className="container mx-auto px-4 py-8">
            <Container variant="default">
              <div className="text-center py-12">
                <FiBarChart2 className="w-16 h-16 text-stone-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-2">
                  No Analytics Data Available
                </h2>
                <p className="text-stone-600 dark:text-stone-400">
                  Analytics data is not available at the moment. Please try again later.
                </p>
              </div>
            </Container>
          </div>
        </FullBleedWrapper>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="Analytics Dashboard">
      <Head>
        <title>Analytics Dashboard - DexTrends</title>
        <meta name="description" content="Comprehensive analytics and insights for DexTrends usage" />
      </Head>
      
      <FullBleedWrapper gradient="pokedex">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-stone-600 dark:text-stone-400">
                  Comprehensive insights into DexTrends usage and performance
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <ExportButton
                  data={[analyticsData]}
                  onExport={handleExportAnalytics}
                  filename="dextrends-analytics"
                  buttonText="Export Analytics"
                  modalTitle="Export Analytics Data"
                  includeFormats={['json', 'csv']}
                  className="px-4 py-2"
                />
              </div>
            </div>
          </motion.div>

          {/* Overview Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard 
                metric={analyticsData.overview.totalViews} 
                icon={<FiEye className="w-5 h-5" />} 
              />
              <MetricCard 
                metric={analyticsData.overview.uniqueVisitors} 
                icon={<FiUsers className="w-5 h-5" />} 
              />
              <MetricCard 
                metric={analyticsData.overview.pokemonSearches} 
                icon={<FiSearch className="w-5 h-5" />} 
              />
              <MetricCard 
                metric={analyticsData.overview.tcgViews} 
                icon={<FiBarChart2 className="w-5 h-5" />} 
              />
              <MetricCard 
                metric={analyticsData.overview.averageSessionTime} 
                icon={<FiClock className="w-5 h-5" />} 
              />
              <MetricCard 
                metric={analyticsData.overview.bounceRate} 
                icon={<FiActivity className="w-5 h-5" />} 
              />
            </div>
          </motion.section>

          {/* Charts Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
              Trends & Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Trends Chart */}
              <Container variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                  Search Trends (30 Days)
                </h3>
                <div className="h-64">
                  {searchTrendsChartData && (
                    <LineChart 
                      data={searchTrendsChartData} 
                      options={chartOptions}
                      height={256}
                    />
                  )}
                </div>
              </Container>

              {/* Page Views Chart */}
              <Container variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                  Page Views by Section
                </h3>
                <div className="h-64">
                  {pageViewsChartData && (
                    <BarChart 
                      data={pageViewsChartData} 
                      options={chartOptions}
                      height={256}
                    />
                  )}
                </div>
              </Container>

              {/* Device Statistics */}
              <Container variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                  Device Usage
                </h3>
                <div className="h-64">
                  {deviceStatsChartData && (
                    <DoughnutChart 
                      data={deviceStatsChartData} 
                      options={doughnutOptions}
                      height={256}
                    />
                  )}
                </div>
              </Container>

              {/* Performance Metrics */}
              <Container variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <MetricCard 
                    metric={analyticsData.performance.averageLoadTime} 
                    icon={<FiZap className="w-5 h-5" />} 
                  />
                  <MetricCard 
                    metric={analyticsData.performance.cacheHitRate} 
                    icon={<FiServer className="w-5 h-5" />} 
                  />
                  <MetricCard 
                    metric={analyticsData.performance.apiResponseTime} 
                    icon={<FiActivity className="w-5 h-5" />} 
                  />
                </div>
              </Container>
            </div>
          </motion.section>

          {/* Popular Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
              Popular Content
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PopularItemsList
                title="Most Viewed Pokemon"
                items={analyticsData.popularPokemon}
                icon={<FiEye className="w-5 h-5" />}
                showPercentage={true}
              />
              
              <PopularItemsList
                title="Popular TCG Sets"
                items={analyticsData.popularTcgSets}
                icon={<FiBarChart2 className="w-5 h-5" />}
                showPercentage={true}
              />
              
              <PopularItemsList
                title="Top Features"
                items={analyticsData.topFeatures}
                icon={<FiTrendingUp className="w-5 h-5" />}
                showPercentage={true}
              />
            </div>
          </motion.section>
        </div>
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Enable full bleed layout
const AnalyticsPage = Analytics as NextPage & {
  fullBleed?: boolean;
};

AnalyticsPage.fullBleed = true;

export default AnalyticsPage;