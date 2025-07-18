import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/themecontext';
import { PriceHistoryManager } from '../../../lib/supabase';

// A component to show REAL price history for TCG cards
// Uses actual price data from our Supabase database

interface PriceHistoryChartProps {
  cardId: string;
  variantType?: string;
  initialPrice?: number;
}

export default function PriceHistoryChart({ cardId, variantType = 'market', initialPrice = 0 }: PriceHistoryChartProps) {
  const { theme } = useTheme();
  const [priceData, setPriceData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [highestPrice, setHighestPrice] = useState(0);
  const [lowestPrice, setLowestPrice] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);

  // Fetch real price history data from Supabase
  useEffect(() => {
    if (!cardId) {
      setPriceData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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

        const days = daysMap[selectedRange] || 365;
        
        // Fetch price history and statistics from Supabase
        const [historyData, statsData] = await Promise.all([
          PriceHistoryManager.getCardPriceHistory(cardId, variantType, days),
          PriceHistoryManager.getCardPriceStats(cardId, variantType, days)
        ]);

        if (historyData && historyData.length > 0) {
          // Transform data format for compatibility with existing chart logic
          const transformedData = historyData.map((item: any) => ({
            date: item.collected_date,
            price: parseFloat(item.price_market || 0)
          }));

          setPriceData(transformedData);

          // Calculate statistics from the data
          const prices = transformedData.map((d: any) => d.price);
          const highest = Math.max(...prices);
          const lowest = Math.min(...prices);
          const average = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;

          setHighestPrice(highest);
          setLowestPrice(lowest);
          setAveragePrice(parseFloat(average.toFixed(2)));
        } else {
          // No data available - use fallback to initial price if provided
          if (initialPrice > 0) {
            const fallbackData = [{
              date: new Date().toISOString().split('T')[0],
              price: initialPrice
            }];
            setPriceData(fallbackData);
            setHighestPrice(initialPrice);
            setLowestPrice(initialPrice);
            setAveragePrice(initialPrice);
          } else {
            setPriceData([]);
            setHighestPrice(0);
            setLowestPrice(0);
            setAveragePrice(0);
          }
        }
      } catch (error) {
        // Error fetching price data
        // Fallback to initial price if there's an error
        if (initialPrice > 0) {
          const fallbackData = [{
            date: new Date().toISOString().split('T')[0],
            price: initialPrice
          }];
          setPriceData(fallbackData);
          setHighestPrice(initialPrice);
          setLowestPrice(initialPrice);
          setAveragePrice(initialPrice);
        } else {
          setPriceData([]);
          setHighestPrice(0);
          setLowestPrice(0);
          setAveragePrice(0);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading price history...</p>
        </div>
      </div>
    );
  }

  if (priceData.length === 0 || initialPrice <= 0) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No price history available for this card</p>
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
      
      <div className="text-xs text-gray-500 text-center mt-2">
        {priceData.length > 0 ? 
          'Price data sourced from Pokemon TCG API market prices.' :
          'No historical price data available for this card.'
        }
      </div>
    </div>
  );
}
