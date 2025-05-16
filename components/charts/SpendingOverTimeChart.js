// components/charts/SpendingOverTimeChart.js
import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const ReactEcharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <div style={{height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}} className="text-foreground-muted">Loading Chart...</div>
});

const SpendingOverTimeChart = ({
  monthLabels,
  seriesData, // Expected: [{ name: 'Airfare', data: [100, 120,...] }, ...]
  palette,
  formatCurrencyFn,
  isLoading = false,
  height = '400px'
}) => {
  const { resolvedTheme } = useTheme();

  if (isLoading) {
    return <div style={{ height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-foreground-muted/10 rounded-app-md animate-pulse"></div>;
  }

  const options = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: resolvedTheme === 'dark' ? 'rgba(26,32,44,0.95)' : 'rgba(255,255,255,0.95)',
      borderColor: resolvedTheme === 'dark' ? '#4A5568' : '#E2E8F0',
      borderWidth: 1,
      textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
      padding: [8, 12],
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        let tooltipHtml = `<div class="text-sm font-semibold mb-1">${params[0].axisValueLabel}</div>`;
        let monthlyTotal = 0;
        params.forEach(param => {
          const value = Number(param.value) || 0;
          monthlyTotal += value;
          tooltipHtml += `
            <div class="flex items-center justify-between gap-2 text-xs my-0.5" style="line-height: 1.5;">
              <span class="flex items-center">
                ${param.marker} 
                <span class="font-medium";">${param.seriesName}:</span>
              </span>
              <span class="font-medium">$${formatCurrencyFn(value)}</span>
            </div>`;
        });
        tooltipHtml += `
          <div class="flex items-center justify-between text-sm mt-1.5 pt-1.5 border-t" style="border-color: ${resolvedTheme === 'dark' ? 'var(--color-border-dark, #4A5568)' : 'var(--color-border-light, #CBD5E0)'};">
            <span class="font-semibold">Total:</span>
            <span class="font-bold">$${formatCurrencyFn(monthlyTotal)}</span>
          </div>`;
        return tooltipHtml;
      }
    },
    legend: {
      data: seriesData.map(s => s.name),
      inactiveColor: resolvedTheme === 'dark' ? '#718096' : '#A0AEC0',
      textStyle: { color: resolvedTheme === 'dark' ? '#E2E8F0' : '#2D3748' },
      top: '5%', type: 'scroll', show: true,
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '20%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false, data: monthLabels,
      axisLabel: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568' },
      axisLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#4A5568' : '#CBD5E0' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', name: 'Cost',
      nameTextStyle: { color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568', padding: [0, 0, 0, -40] },
      axisLabel: { formatter: (value) => `$${value.toLocaleString()}`, color: resolvedTheme === 'dark' ? '#A0AEC0' : '#4A5568'},
      splitLine: { lineStyle: { color: resolvedTheme === 'dark' ? '#4A5568' : '#CBD5E0', type: 'dashed' }},
      axisLine: { show: false }, axisTick: { show: false },
    },
    dataZoom: [{ type: 'inside', start: 0, end: 100, zoomLock: false },
      { show: true, type: 'slider', bottom: 10, height: 20,
        backgroundColor: resolvedTheme === 'dark' ? 'rgba(74, 85, 104, 0.2)' : 'rgba(226, 232, 240, 0.5)',
        borderColor: resolvedTheme === 'dark' ? 'var(--color-border-dark, #4A5568)' : 'var(--color-border-light, #CBD5E0)',
        dataBackground: { lineStyle: { color: `${palette[0]}4D` }, areaStyle: { color: `${palette[0]}33` } },
        selectedDataBackground: { lineStyle: { color: palette[0] }, areaStyle: { color: `${palette[0]}4D` } },
        fillerColor: `${palette[0]}33`, handleStyle: { color: palette[0] },
        textStyle: { color: resolvedTheme === 'dark' ? 'var(--color-text-muted-dark, #A0AEC0)' : 'var(--color-text-muted-light, #718096)' },
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        moveHandleSize: 7, showDetail: false,
      }],
    series: seriesData.map((s, index) => ({
      name: s.name, type: 'line', smooth: true, showSymbol: false,
      lineStyle: { width: 2.5 }, itemStyle: { color: palette[index % palette.length] },
      color: palette[index % palette.length], // Ensure this is used for lines too
      emphasis: { focus: 'series', lineStyle: { width: 3.5 } },
      data: s.data,
    }))
  };

  return (
    <ReactEcharts
      option={options}
      notMerge={true}
      lazyUpdate={true}
      theme={resolvedTheme === 'dark' ? 'dark' : undefined}
      style={{ height: height, width: '100%' }}
    />
  );
};
export default SpendingOverTimeChart;