// Analytics Dashboard Types
export interface AnalyticsMetric {
  label: string;
  value: number | string;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface PopularItem {
  id: string | number;
  name: string;
  count: number;
  percentage?: number;
  image?: string;
  type?: string;
}

export interface AnalyticsDashboardData {
  overview: {
    totalViews: AnalyticsMetric;
    uniqueVisitors: AnalyticsMetric;
    pokemonSearches: AnalyticsMetric;
    tcgViews: AnalyticsMetric;
    averageSessionTime: AnalyticsMetric;
    bounceRate: AnalyticsMetric;
  };
  
  popularPokemon: PopularItem[];
  popularTcgSets: PopularItem[];
  searchTrends: TimeSeriesData[];
  pageViews: ChartDataPoint[];
  userActivity: TimeSeriesData[];
  deviceStats: ChartDataPoint[];
  regionStats: ChartDataPoint[];
  
  // Additional metrics
  topFeatures: PopularItem[];
  errorRates: TimeSeriesData[];
  performance: {
    averageLoadTime: AnalyticsMetric;
    cacheHitRate: AnalyticsMetric;
    apiResponseTime: AnalyticsMetric;
  };
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  period: 'day' | 'week' | 'month' | 'year';
  category?: 'all' | 'pokemon' | 'tcg' | 'battle' | 'features';
}

export interface ExportAnalyticsOptions {
  format: 'csv' | 'json' | 'pdf';
  includeCharts: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: string[];
}