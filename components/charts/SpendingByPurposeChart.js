// components/charts/SpendingByPurposeChart.js
import React, { useEffect, useState, useRef, useMemo } from 'react'; // Added useState, useRef, useMemo
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const ReactEcharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} className="text-foreground-muted">Loading Chart...</div>
});

const SpendingByPurposeChart = ({
  purposeData,
  palette,
  formatCurrencyFn,
  isLoading = false,
  height = '400px'
}) => {
  const { resolvedTheme } = useTheme();

  // State to hold the ECharts instance and the dynamic truncation length
  const [chartInstance, setChartInstance] = useState(null);
  const [truncationLength, setTruncationLength] = useState(20); // Default truncation length

  // Callback for onChartReady
  const handleChartReady = (instance) => {
    //console.log('[Chart Ready] ECharts instance received via onChartReady.');
    setChartInstance(instance);
  };
  
  // Effect to observe chart width and update truncation length
  useEffect(() => {
    //console.log('[Effect Setup] useEffect for ResizeObserver running. chartInstance available:', !!chartInstance);

    if (!chartInstance) {
      console.warn('[Effect Setup] ECharts instance is not yet available in state.');
      return;
    }

    const chartDom = chartInstance.getDom();
    if (!chartDom) {
      console.warn('[Effect Setup] chartDom is null or undefined, even though chartInstance exists.');
      return;
    }

    //console.log('[Effect Setup] chartInstance and chartDom are valid. Setting up ResizeObserver.');

    const updateLen = (width) => {
      //console.log(`[ResizeObserver] Detected width: ${width}px`);
      let newLength;
      if (width < 400) {
        newLength = 0;
	  } else if (width < 525) {
        newLength = 12;
      } else if (width < 650) {
        newLength = 20;
      } else {
        newLength = 35;
      }
      //console.log(`[ResizeObserver] Setting truncationLength to: ${newLength}`);
      setTruncationLength(newLength);
    };

    const initialWidth = chartDom.getBoundingClientRect().width;
    //console.log(`[Effect Setup] Initial chart DOM width: ${initialWidth}px`);
    updateLen(initialWidth);

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        updateLen(entry.contentRect.width);
      }
    });

    resizeObserver.observe(chartDom);
    //console.log('[Effect Setup] ResizeObserver observing chart DOM.');

    return () => {
      //console.log('[Effect Cleanup] Cleaning up ResizeObserver.');
      resizeObserver.unobserve(chartDom);
    };
  }, [chartInstance]);

  const formattedData = useMemo(() => {
    return (purposeData || [])
      .map(item => ({
        name: item.name,
        value: parseFloat(Number(item.value).toFixed(2))
      }))
      .filter(item => item.value > 0);
  }, [purposeData]);

  const options = useMemo(() => ({
    tooltip: { // Main chart tooltip (remains as before)
      trigger: 'item',
      formatter: (params) => {
        if (!params) return '';
        return `
          <div class="text-sm">
            <span class="font-semibold">${params.name}</span><br/>
            <span class="font-medium">$${formatCurrencyFn(params.value)}</span> (${params.percent}%)
          </div>`;
      },
      backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.9)' : 'rgba(255,255,255,0.95)',
      borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
      padding: [8, 12],
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      left: '2%',
      top: '10%',
      bottom: '10%',
      width: '25%', // You might want to adjust this width, or set it to a pixel value
                    // that accommodates the typically truncated labels.
      itemGap: 10,
      inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0',
      
      // Dynamic formatter for legend item names
      formatter: function (name) {
        console.log(`[Legend Formatter] Name: "${name}", Type: ${typeof name}, Current truncationLength in formatter scope: ${truncationLength}`);
        let returnedName = name;
        if (typeof name === 'string' && name.length > truncationLength && truncationLength > 0) {
          returnedName = name.substring(0, truncationLength).trim() + '...';
          // console.log(`[Legend Formatter] Truncated "${name}" to "${returnedName}"`);
        } else if (typeof name === 'string' && truncationLength < 1) {
          returnedName = '';
        } else {
          console.warn(`[Legend Formatter] Name is not a string: ${name}`);
        }
        return returnedName;
      },
		
      textStyle: { // Styles for the (now truncated) legend text
        color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748',
        fontSize: 12,
      },
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12,
      pageButtonItemGap: 5,
      pageButtonGap: 10,
      pageIconColor: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748',
      pageIconInactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0',
      pageTextStyle: {
        color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748',
      },
      tooltip: { // Tooltip for legend items themselves (shows full name)
        show: true,
        backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: resolvedTheme === 'dark' ? '#3A4556' : '#d4d4d4',
        borderWidth: 1,
        padding: [5, 10],
        textStyle: {
          color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748',
          fontSize: 12
        },
        formatter: function (params) {
          // params.name will be the original, non-truncated name
          return params.name;
        }
      }
    },
    color: palette,
    series: [{
      name: 'Spending by Purpose',
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: resolvedTheme === 'dark' ? '#a4a4a4' : '#3D3748',
        borderWidth: 1
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: false, fontSize: 18, fontWeight: 'bold', color: resolvedTheme === 'dark' ? 'var(--color-text-light-heading, #FFFFFF)' : 'var(--color-text-dark-heading, #1A202C)' },
        itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0, 0, 0, 0.3)' }
      },
      labelLine: { show: false },
      data: formattedData,
    }],
  }), [resolvedTheme, palette, formattedData, formatCurrencyFn, truncationLength]);

  if (isLoading) {
    return <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-foreground-muted/10 rounded-app-md animate-pulse"></div>;
  }

  return (
    <ReactEcharts
      onChartReady={handleChartReady}
      option={options}
      notMerge={true}
      lazyUpdate={true}
      theme={resolvedTheme === 'dark' ? 'dark' : undefined}
      style={{ height: height, width: '100%' }}
    />
  );
};

export default SpendingByPurposeChart;