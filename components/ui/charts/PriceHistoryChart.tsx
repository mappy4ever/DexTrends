import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '../../../context/UnifiedAppContext';
import { PriceHistoryManager } from '../../../lib/supabase';
import { postJSON } from '../../../utils/unifiedFetch';
import { 
  generateSamplePriceHistory, 
  getSamplePriceData, 
  storeSamplePriceData,
  formatPriceDataForChart,
  mockSupabasePriceData,
  shouldUseMockData
} from '../../../utils/priceDataHelper';

// A component to show REAL price history for TCG cards
// Uses actual price data from our Supabase database with fallback to sample data

interface PriceHistoryChartProps {
  cardId: string;
  variantType?: string;
  initialPrice?: number;
}

export default function PriceHistoryChart({ cardId, variantType = 'market', initialPrice = 0 }: PriceHistoryChartProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [priceData, setPriceData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState('1m');
  const [highestPrice, setHighestPrice] = useState(0);
  const [lowestPrice, setLowestPrice] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [dataSource, setDataSource] = useState<'supabase' | 'sample' | 'fallback'>('supabase');

  // Fetch real price history data from Supabase
  useEffect(() => {
    if (!cardId) {
      setPriceData([]);
      setLoading(false);
      setError('No card ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    const fetchPriceData = async () => {
      try {
        // Set number of days based on selected time range
        const daysMap: Record<string, number> = {
          '1m': 30,
          '3m': 90,
          '6m': 180,
          '1y': 365,
          'all': 730 // Approximately 2 years for "All Time"
        };

        const days = daysMap[selectedRange] || 30;
        
        // Check if we should use mock data
        if (shouldUseMockData()) {
          // Use mock data for development
          const mockData = mockSupabasePriceData(cardId, days);
          const transformedData = formatPriceDataForChart(mockData, variantType);
          
          setPriceData(transformedData);
          setDataSource('sample');
          
          // Calculate statistics
          const prices = transformedData.map((d: any) => d.price);
          if (prices.length > 0) {
            setHighestPrice(Math.max(...prices));
            setLowestPrice(Math.min(...prices));
            setAveragePrice(parseFloat((prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length).toFixed(2)));
          }
        } else {
          // First check localStorage cache
          const cachedData = getSamplePriceData(cardId);
          if (cachedData && cachedData.length > 0) {
            setPriceData(cachedData);
            setDataSource('sample');
            
            const prices = cachedData.map(d => d.price);
            setHighestPrice(Math.max(...prices));
            setLowestPrice(Math.min(...prices));
            setAveragePrice(parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)));
          } else {
            // Fetch from Supabase
            const historyData = await PriceHistoryManager.getCardPriceHistory(cardId, variantType, days);

            if (historyData && historyData.length > 0) {
              // Transform data format
              const transformedData = formatPriceDataForChart(historyData, variantType);

              setPriceData(transformedData);
              setDataSource('supabase');
              
              // Cache the data
              storeSamplePriceData(cardId, transformedData);

              // Calculate statistics from the data
              const prices = transformedData.map((d: any) => d.price);
              const highest = Math.max(...prices);
              const lowest = Math.min(...prices);
              const average = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;

              setHighestPrice(highest);
              setLowestPrice(lowest);
              setAveragePrice(parseFloat(average.toFixed(2)));
            } else {
              // No data from Supabase - generate sample data
              const sampleData = generateSamplePriceHistory(cardId, initialPrice || 10, days);
              setPriceData(sampleData);
              setDataSource('sample');
              
              // Cache the sample data
              storeSamplePriceData(cardId, sampleData);
              
              const prices = sampleData.map(d => d.price);
              setHighestPrice(Math.max(...prices));
              setLowestPrice(Math.min(...prices));
              setAveragePrice(parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)));
            }
          }
        }
      } catch (error: any) {
        logger.error('Error fetching price data:', error);
        setError(error.message || 'Failed to load price data');
        
        // Fallback to sample data on error
        const sampleData = generateSamplePriceHistory(cardId, initialPrice || 10, 30);
        setPriceData(sampleData);
        setDataSource('fallback');
        
        const prices = sampleData.map(d => d.price);
        if (prices.length > 0) {
          setHighestPrice(Math.max(...prices));
          setLowestPrice(Math.min(...prices));
          setAveragePrice(parseFloat((prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [cardId, variantType, selectedRange, initialPrice]);

  // Time range options
  const ranges = [
    { label: '1M', value: '1m' },
    { label: '3M', value: '3m' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' }
  ];

  // Calculate chart dimensions and scaling
  const chartWidth = 400;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;
  const chartInnerWidth = chartWidth - (paddingX * 2);
  const chartInnerHeight = chartHeight - (paddingY * 2);

  // Generate SVG path for the price chart
  const generateChartPath = (): any => {
    if (priceData.length === 0) return '';

    // Find min and max for scaling
    const maxPrice = Math.max(...priceData.map((d: any) => d.price));
    const minPrice = Math.min(...priceData.map((d: any) => d.price));
    const priceRange = maxPrice - minPrice;
    
    // Add 10% padding to the top and bottom
    const yScale = chartInnerHeight / (priceRange * 1.2);
    const xScale = chartInnerWidth / (priceData.length - 1);
    
    // Generate the path
    return priceData.map((point: any, i) => {
      const x = paddingX + i * xScale;
      const y = paddingY + chartInnerHeight - ((point.price - minPrice) * yScale);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate area fill below the line
  const generateAreaPath = (): any => {
    if (priceData.length === 0) return '';

    const linePath = generateChartPath();
    const firstX = paddingX;
    const lastX = paddingX + chartInnerWidth;
    const bottomY = paddingY + chartInnerHeight;

    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Generate x-axis tick marks
  const generateXAxisTicks = (): any => {
    if (priceData.length === 0) return [];
    
    const tickCount = 5; // Number of ticks to show
    const interval = Math.floor((priceData.length - 1) / (tickCount - 1));
    const ticks = [];
    
    for (let i = 0; i < tickCount; i++) {
      const index = i === tickCount - 1 ? priceData.length - 1 : i * interval;
      const x = paddingX + (index * chartInnerWidth / (priceData.length - 1));
      const date = new Date((priceData[index] as any).date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      ticks.push({
        x,
        label: `${month} ${year}`
      });
    }
    
    return ticks;
  };

  // Generate y-axis tick marks
  const generateYAxisTicks = (): any => {
    if (priceData.length === 0) return [];
    
    const maxPrice = Math.max(...priceData.map((d: any) => d.price));
    const minPrice = Math.min(...priceData.map((d: any) => d.price));
    const tickCount = 5;
    const ticks = [];
    
    for (let i = 0; i < tickCount; i++) {
      const price = minPrice + ((maxPrice - minPrice) * i / (tickCount - 1));
      const y = paddingY + chartInnerHeight - ((price - minPrice) * chartInnerHeight / (maxPrice - minPrice));
      
      ticks.push({
        y,
        label: `$${price.toFixed(2)}`
      });
    }
    
    return ticks;
  };

  // Chart colors based on theme
  const getChartColors = (): any => {
    return theme === 'dark' 
      ? {
          line: '#3b82f6',
          area: 'rgba(59, 130, 246, 0.2)',
          text: '#e5e7eb',
          grid: '#374151'
        }
      : {
          line: '#2563eb',
          area: 'rgba(37, 99, 235, 0.1)',
          text: '#4b5563',
          grid: '#e5e7eb'
        };
  };

  const chartColors = getChartColors();

  // Handler to trigger price collection
  const handleCollectPrices = async () => {
    try {
      await postJSON('/api/collect-prices', {}, {
        timeout: 30000, // 30 second timeout for this operation
        retries: 1,
        useCache: false // Don't cache POST requests
      });
      
      alert('Price collection started. This may take a few minutes.');
    } catch (error) {
      logger.error('Error triggering price collection:', error);
      alert('Failed to start price collection.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading price history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <svg className="w-12 h-12 mx-auto mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-600 dark:text-red-400 font-medium">Error loading price data</p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
        <button
          onClick={() => router.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-600 dark:text-gray-300 font-medium">No price history available</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Price data will appear here once collected
        </p>
        <button
          onClick={handleCollectPrices}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Price Collection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Price Statistics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-gray-100">
          <p className="text-xs text-gray-500">Highest</p>
          <p className="font-bold text-green-600">${highestPrice.toFixed(2)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-100">
          <p className="text-xs text-gray-500">Average</p>
          <p className="font-bold">${averagePrice.toFixed(2)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-100">
          <p className="text-xs text-gray-500">Lowest</p>
          <p className="font-bold text-red-600">${lowestPrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          {ranges.map((range: any) => (
            <button
              key={range.value}
              type="button"
              className={`px-4 py-1 text-sm font-medium first:rounded-l-lg last:rounded-r-lg ${
                selectedRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-300`}
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full overflow-hidden">
        <svg width="100%" height="280" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          {/* X and Y axis */}
          <line 
            x1={paddingX} 
            y1={paddingY + chartInnerHeight} 
            x2={paddingX + chartInnerWidth} 
            y2={paddingY + chartInnerHeight} 
            stroke={chartColors.grid}
            strokeWidth="1"
          />
          <line 
            x1={paddingX} 
            y1={paddingY} 
            x2={paddingX} 
            y2={paddingY + chartInnerHeight} 
            stroke={chartColors.grid}
            strokeWidth="1"
          />
          
          {/* X axis ticks */}
          {generateXAxisTicks().map((tick: any, i: number) => (
            <g key={`x-tick-${i}`}>
              <line 
                x1={tick.x} 
                y1={paddingY + chartInnerHeight} 
                x2={tick.x} 
                y2={paddingY + chartInnerHeight + 5} 
                stroke={chartColors.grid}
                strokeWidth="1"
              />
              <text 
                x={tick.x} 
                y={paddingY + chartInnerHeight + 15} 
                textAnchor="middle" 
                fill={chartColors.text}
                fontSize="8"
              >
                {tick.label}
              </text>
            </g>
          ))}
          
          {/* Y axis ticks */}
          {generateYAxisTicks().map((tick: any, i: number) => (
            <g key={`y-tick-${i}`}>
              <line 
                x1={paddingX - 5} 
                y1={tick.y} 
                x2={paddingX} 
                y2={tick.y} 
                stroke={chartColors.grid}
                strokeWidth="1"
              />
              <text 
                x={paddingX - 8} 
                y={tick.y + 3} 
                textAnchor="end" 
                fill={chartColors.text}
                fontSize="8"
              >
                {tick.label}
              </text>
              {/* Horizontal grid lines */}
              <line 
                x1={paddingX} 
                y1={tick.y} 
                x2={paddingX + chartInnerWidth} 
                y2={tick.y} 
                stroke={chartColors.grid}
                strokeWidth="0.5"
                strokeDasharray="3,3"
              />
            </g>
          ))}
          
          {/* Area fill */}
          <path
            d={generateAreaPath()}
            fill={chartColors.area}
            stroke="none"
          />
          
          {/* Price line */}
          <path
            d={generateChartPath()}
            fill="none"
            stroke={chartColors.line}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Current price indicator (last point) */}
          {priceData.length > 0 && (
            <circle
              cx={paddingX + chartInnerWidth}
              cy={paddingY + chartInnerHeight - (((priceData[priceData.length - 1] as any).price - Math.min(...priceData.map((d: any) => d.price))) * chartInnerHeight / (Math.max(...priceData.map((d: any) => d.price)) - Math.min(...priceData.map((d: any) => d.price))))}
              r="3"
              fill={chartColors.line}
              stroke="white"
              strokeWidth="1"
            />
          )}
        </svg>
        
        {/* Current price */}
        <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-bl-md text-sm">
          ${(priceData[priceData.length - 1] as any).price.toFixed(2)}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 space-y-1">
        <div>
          {dataSource === 'supabase' && 'Live price data from Pokemon TCG API'}
          {dataSource === 'sample' && 'Sample price data for demonstration'}
          {dataSource === 'fallback' && 'Using fallback data due to connection issues'}
        </div>
        {priceData.length > 0 && (
          <div>
            Showing {priceData.length} data points • Last updated: {new Date((priceData[priceData.length - 1] as any).date).toLocaleDateString()}
          </div>
        )}
        {dataSource !== 'supabase' && (
          <button
            onClick={handleCollectPrices}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Collect real price data
          </button>
        )}
      </div>
    </div>
  );
}
