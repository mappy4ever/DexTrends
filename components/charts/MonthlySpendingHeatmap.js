// components/charts/MonthlySpendingHeatmap.js
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

// Assuming formatCurrency is a utility function you have
// import { formatCurrency } from '@/utils/formatters'; // Adjust path as needed

const ReactEcharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} className="text-foreground-muted">Loading Chart...</div>
});

const MonthlySpendingHeatmap = ({
  heatmapRawData,   // Array of arrays: [[month, year, value], ...] e.g., [[1, 2023, 500], [2, 2023, 700]]
  palette,          // Array of color strings for light mode
  darkPalette,      // Array of color strings for dark mode
  formatCurrencyFn, // Function to format currency for tooltips
  isLoading = false,
  height = '400px'
}) => {
  const { resolvedTheme } = useTheme();

  const chartOptions = useMemo(() => {
    const rawData = heatmapRawData || [];
    // Ensure data is cleaned: month (1-12), year (number), value (number)
    const cleanData = rawData.filter(item =>
      Array.isArray(item) && item.length === 3 &&
      typeof item[0] === 'number' && item[0] >= 1 && item[0] <= 12 &&
      typeof item[1] === 'number' &&
      typeof item[2] === 'number'
    );

    if (cleanData.length === 0 && !isLoading) {
        // Return a config that can render an "empty" message or be handled by ChartContainer
        return {
            title: {
                text: 'No heatmap data available for the selected period.',
                left: 'center',
                top: 'center',
                textStyle: {
                    color: resolvedTheme === 'dark' ? 'var(--color-text-muted-dark, #A0AEC0)' : 'var(--color-text-muted-light, #718096)',
                    fontSize: 14,
                }
            },
            series: [] // Important to have empty series
        };
    }
    if (cleanData.length === 0 && isLoading) return {series:[]}; // For loading state to prevent error

    const years = [...new Set(cleanData.map(d => d[1]))].sort((a, b) => a - b);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabels = Array.from({ length: 12 }, (_, i) => months[i]);

    const values = cleanData.map(d => d[2]);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    let maxValue = values.length > 0 ? Math.max(...values) : 1;
    if (minValue === maxValue && minValue !== 0) { // Handle case where all values are the same but not zero
        maxValue = minValue * 1.1; // Add a bit to have a range
    } else if (minValue === maxValue && minValue === 0) {
        maxValue = 1; // Ensure a range if all are zero
    }


    // Transform data for ECharts: [xAxisIndex (month 0-11), yAxisIndex (year index), value]
    const echartHeatmapData = cleanData.map(item => [item[0] - 1, years.indexOf(item[1]), item[2]]);

    const currentPalette = resolvedTheme === 'dark' ? (darkPalette || palette) : palette;

    return {
      tooltip: {
        position: 'top',
        formatter: params => {
          if (!params || !params.value || params.value.length < 3) return '';
          const monthIndex = params.value[0]; // 0-11
          const yearIndex = params.value[1]; // index in `years` array
          const year = years[yearIndex];
          const value = params.value[2];
          return `${months[monthIndex]} ${year}<br/>Spend: $${formatCurrencyFn(value)}`;
        },
        backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.9)' : 'rgba(255,255,255,0.9)',
        borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0',
        borderWidth: 1,
        textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
        padding: [8, 12],
      },
      grid: { top: '10%', bottom: '25%', left: '10%', right: '5%', containLabel: false }, // containLabel false for better axis name placement
      xAxis: {
        type: 'category', data: monthLabels,
        splitArea: { show: true, areaStyle: { color: resolvedTheme === 'dark' ? ['rgba(255,255,255,0.065)', 'rgba(255,255,255,0.035)'] : ['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.02)'] }},
        name: 'Month', nameLocation: 'center', nameGap: 35,
        axisLabel: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#718096'},
        nameTextStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748'},
        axisLine: { show: false, lineStyle: { color: resolvedTheme === 'dark' ? '#4A5568' : '#CBD5E0' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category', data: years.map(y => y.toString()),
        splitArea: { show: true, areaStyle: { color: resolvedTheme === 'dark' ? ['rgba(255,255,255,0.065)', 'rgba(255,255,255,0.035)'] : ['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.02)'] }},
        name: 'Year', nameLocation: 'middle', nameGap: 40, // Adjusted nameGap
        axisLabel: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#718096'},
        nameTextStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748'},
        axisLine: { show: false, lineStyle: { color: resolvedTheme === 'dark' ? '#4A5568' : '#CBD5E0' } },
        axisTick: { show: false },
      },
      visualMap: {
        min: minValue, max: maxValue, calculable: true, orient: 'horizontal',
        left: 'center', bottom: '2%',
        inRange: { color: currentPalette },
        textStyle: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#718096'},
        itemWidth: 15, // Width of the color bar segments
        itemHeight: 150, // Height of the color bar itself (for horizontal)
        formatter: function (value) { // Custom formatter for visualMap labels
            return `$${formatCurrencyFn(value)}`;
        }
      },
      series: [{
        name: 'Monthly Spending', type: 'heatmap', data: echartHeatmapData,
        label: { show: false }, // Keep labels off cells for cleanliness
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.4)' } }
      }]
    };
  }, [heatmapRawData, palette, darkPalette, formatCurrencyFn, resolvedTheme, isLoading]); // Added isLoading

  if (isLoading) {
    // Render a skeleton or specific loading state for the chart area
    return <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-foreground-muted/10 rounded-app-md animate-pulse"></div>;
  }
  
  // Handle case where chartOptions might indicate no data (to avoid rendering an empty chart)
  if (chartOptions.series && chartOptions.series.length === 0 && chartOptions.title && chartOptions.title.text) {
    return (
      <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="text-foreground-muted">
        {chartOptions.title.text}
      </div>
    );
  }


  return (
    <ReactEcharts
      option={chartOptions}
      notMerge={true}
      lazyUpdate={true}
      theme={resolvedTheme === 'dark' ? 'dark' : undefined}
      style={{ height: height, width: '100%' }}
    />
  );
};

export default MonthlySpendingHeatmap;
