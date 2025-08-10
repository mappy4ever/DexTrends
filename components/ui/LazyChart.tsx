import React, { Suspense, lazy } from 'react';
import { Skeleton } from './SkeletonLoadingSystem';

// Lazy load Chart.js components
const LazyLine = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Line }))
);

const LazyBar = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Bar }))
);

const LazyScatter = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Scatter }))
);

const LazyDoughnut = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Doughnut }))
);

const LazyRadar = lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Radar }))
);

// Register Chart.js modules only when needed
let chartJSRegistered = false;
const registerChartJS = async () => {
  if (!chartJSRegistered) {
    const ChartJS = await import('chart.js');
    ChartJS.Chart.register(
      ChartJS.CategoryScale,
      ChartJS.LinearScale,
      ChartJS.PointElement,
      ChartJS.LineElement,
      ChartJS.BarElement,
      ChartJS.RadialLinearScale,
      ChartJS.ArcElement,
      ChartJS.Title,
      ChartJS.Tooltip,
      ChartJS.Legend,
      ChartJS.Filler
    );
    chartJSRegistered = true;
  }
};

// Chart loading skeleton
const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="w-full" style={{ height }}>
    <Skeleton variant="rectangular" width="100%" height={height} animation="wave" />
  </div>
);

// Wrapper components with lazy loading
export const LineChart: React.FC<any> = (props) => {
  React.useEffect(() => {
    registerChartJS();
  }, []);

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <LazyLine {...props} />
    </Suspense>
  );
};

export const BarChart: React.FC<any> = (props) => {
  React.useEffect(() => {
    registerChartJS();
  }, []);

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <LazyBar {...props} />
    </Suspense>
  );
};

export const ScatterChart: React.FC<any> = (props) => {
  React.useEffect(() => {
    registerChartJS();
  }, []);

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <LazyScatter {...props} />
    </Suspense>
  );
};

export const DoughnutChart: React.FC<any> = (props) => {
  React.useEffect(() => {
    registerChartJS();
  }, []);

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <LazyDoughnut {...props} />
    </Suspense>
  );
};

export const RadarChart: React.FC<any> = (props) => {
  React.useEffect(() => {
    registerChartJS();
  }, []);

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} />}>
      <LazyRadar {...props} />
    </Suspense>
  );
};

// Export Chart.js types for use in components
export type { ChartData, ChartOptions } from 'chart.js';