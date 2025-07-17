import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaChartPie, FaArrowUp, FaArrowDown, FaUsers, FaEye, FaHeart } from 'react-icons/fa';
import { BsGraphUp, BsGraphDown, BsClock, BsCalendar } from 'react-icons/bs';

// Types and Interfaces
interface OverviewData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  retention: number;
  avgSessionDuration: string;
  bounceRate: number;
}

interface PageViewData {
  page: string;
  views: number;
  change: number;
}

interface SearchQueryData {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface TrafficData {
  pageViews: PageViewData[];
  searchQueries: SearchQueryData[];
}

interface DeviceTypeData {
  type: string;
  percentage: number;
  users: number;
}

interface CountryData {
  country: string;
  users: number;
  percentage: number;
}

interface SessionByHour {
  hour: number;
  sessions: number;
}

interface UserBehaviorData {
  deviceTypes: DeviceTypeData[];
  topCountries: CountryData[];
  averageSessionsByHour: SessionByHour[];
}

interface FavoriteCardData {
  name: string;
  favorites: number;
  image: string;
}

interface DailyActiveUserData {
  date: string;
  users: number;
}

interface EngagementData {
  mostFavoritedCards: FavoriteCardData[];
  dailyActiveUsers: DailyActiveUserData[];
}

interface AnalyticsData {
  overview: OverviewData;
  traffic: TrafficData;
  userBehavior: UserBehaviorData;
  engagement: EngagementData;
}

type TimeRange = '24h' | '7d' | '30d' | '90d';

const DataAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock analytics data - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        overview: {
          totalUsers: 45732,
          activeUsers: 12847,
          newUsers: 2341,
          retention: 68.5,
          avgSessionDuration: '4m 32s',
          bounceRate: 32.1
        },
        traffic: {
          pageViews: [
            { page: '/pokedex', views: 18453, change: 12.3 },
            { page: '/tcgsets', views: 14921, change: -5.7 },
            { page: '/pocketmode', views: 11238, change: 23.1 },
            { page: '/cards', views: 9847, change: 8.9 },
            { page: '/favorites', views: 6234, change: 15.2 }
          ],
          searchQueries: [
            { query: 'charizard', count: 3421, trend: 'up' },
            { query: 'pikachu', count: 2987, trend: 'stable' },
            { query: 'base set', count: 2154, trend: 'up' },
            { query: 'paldea evolved', count: 1876, trend: 'down' },
            { query: 'umbreon', count: 1543, trend: 'up' }
          ]
        },
        userBehavior: {
          deviceTypes: [
            { type: 'Mobile', percentage: 58.3, users: 26631 },
            { type: 'Desktop', percentage: 34.7, users: 15869 },
            { type: 'Tablet', percentage: 7.0, users: 3201 }
          ],
          topCountries: [
            { country: 'United States', users: 18293, percentage: 40.0 },
            { country: 'United Kingdom', users: 6860, percentage: 15.0 },
            { country: 'Canada', users: 4573, percentage: 10.0 },
            { country: 'Australia', users: 3202, percentage: 7.0 },
            { country: 'Germany', users: 2746, percentage: 6.0 }
          ],
          averageSessionsByHour: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            sessions: Math.floor(Math.random() * 500) + 100
          }))
        },
        engagement: {
          mostFavoritedCards: [
            { name: 'Charizard ex', favorites: 4321, image: '/back-card.png' },
            { name: 'Pikachu VMAX', favorites: 3876, image: '/back-card.png' },
            { name: 'Umbreon VMAX', favorites: 3154, image: '/back-card.png' },
            { name: 'Rayquaza VMAX', favorites: 2987, image: '/back-card.png' },
            { name: 'Mewtwo ex', favorites: 2734, image: '/back-card.png' }
          ],
          dailyActiveUsers: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            users: Math.floor(Math.random() * 3000) + 10000
          }))
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number): React.ReactElement | null => {
    if (change > 0) return <BsGraphUp className="w-4 h-4" />;
    if (change < 0) return <BsGraphDown className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export Data
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.overview.totalUsers)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <FaUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.overview.activeUsers)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FaEye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.overview.newUsers)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <FaArrowUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Retention Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analyticsData.overview.retention}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <FaChartLine className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Pages</h3>
          <div className="space-y-4">
            {analyticsData.traffic.pageViews.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{page.page}</p>
                  <p className="text-sm text-gray-500">{formatNumber(page.views)} views</p>
                </div>
                <div className={`flex items-center space-x-1 ${getChangeColor(page.change)}`}>
                  {getChangeIcon(page.change)}
                  <span className="text-sm font-medium">
                    {page.change > 0 ? '+' : ''}{page.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Types</h3>
          <div className="space-y-4">
            {analyticsData.userBehavior.deviceTypes.map((device, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {device.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${device.percentage}%` }}
      ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Queries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Searches</h3>
          <div className="space-y-3">
            {analyticsData.traffic.searchQueries.map((query, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{query.query}</p>
                  <p className="text-sm text-gray-500">{formatNumber(query.count)} searches</p>
                </div>
                <div className="flex items-center">
                  {query.trend === 'up' && <FaArrowUp className="w-4 h-4 text-green-500" />}
                  {query.trend === 'down' && <FaArrowDown className="w-4 h-4 text-red-500" />}
                  {query.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Favorited Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Favorited Cards</h3>
          <div className="space-y-3">
            {analyticsData.engagement.mostFavoritedCards.map((card, index) => (
              <div key={index} className="flex items-center space-x-3">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-12 h-16 object-cover rounded"  />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FaHeart className="w-3 h-3 text-red-500" />
                    <span>{formatNumber(card.favorites)} favorites</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Geographic Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analyticsData.userBehavior.topCountries.map((country, index) => (
            <div key={index} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">{country.country}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(country.users)}
              </p>
              <p className="text-sm text-gray-500">{country.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FaChartBar className="text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Analytics Insights</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Mobile usage has increased by 23% this month</li>
              <li>• Peak activity occurs between 7-9 PM EST</li>
              <li>• Charizard-related searches are trending upward</li>
              <li>• User engagement is highest on weekend evenings</li>
              <li>• New user acquisition is performing above target</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalyticsDashboard;