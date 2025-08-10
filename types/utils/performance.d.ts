// Performance monitoring type definitions

// Performance metrics
export interface PerformanceMetrics {
  timestamp: number;
  fps: number;
  memory: MemoryMetrics;
  timing: TimingMetrics;
  network: NetworkMetrics;
  rendering: RenderingMetrics;
  custom?: Record<string, number>;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

export interface TimingMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface NetworkMetrics {
  requests: number;
  failedRequests: number;
  bytesTransferred: number;
  averageLatency: number;
  slowRequests: number;
}

export interface RenderingMetrics {
  renderTime: number;
  frameDrops: number;
  longTasks: number;
  layoutShifts: number;
  cumulativeLayoutShift: number;
}

// Performance monitor configuration
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number; // Milliseconds between samples
  bufferSize: number; // Number of samples to keep
  thresholds: PerformanceThresholds;
  modules: PerformanceModules;
  reporting: ReportingConfig;
}

export interface PerformanceThresholds {
  fps: {
    critical: number;
    warning: number;
  };
  memory: {
    critical: number; // Percentage
    warning: number;
  };
  responseTime: {
    critical: number; // Milliseconds
    warning: number;
  };
  errorRate: {
    critical: number; // Percentage
    warning: number;
  };
}

export interface PerformanceModules {
  fps: boolean;
  memory: boolean;
  network: boolean;
  rendering: boolean;
  userTiming: boolean;
  resourceTiming: boolean;
  react?: boolean;
}

export interface ReportingConfig {
  console: boolean;
  remote: boolean;
  localStorage: boolean;
  customReporter?: (metrics: PerformanceMetrics) => void;
  interval: number; // Milliseconds
  endpoint?: string;
}

// Performance entries
export interface PerformanceEntry {
  id: string;
  name: string;
  type: PerformanceEntryType;
  startTime: number;
  duration: number;
  metadata?: Record<string, unknown>;  // Generic metadata - can be any serializable data
}

export type PerformanceEntryType = 
  | 'navigation'
  | 'resource'
  | 'mark'
  | 'measure'
  | 'paint'
  | 'frame'
  | 'component'
  | 'api-call'
  | 'custom';

// Component performance tracking
export interface ComponentPerformance {
  name: string;
  renderCount: number;
  renderTime: number;
  averageRenderTime: number;
  lastRenderTime: number;
  props?: Record<string, unknown>;  // React component props - can be any serializable value
  children?: ComponentPerformance[];
}

// API performance tracking
export interface APIPerformance {
  endpoint: string;
  method: string;
  calls: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  errors: number;
  lastCall?: {
    timestamp: number;
    duration: number;
    status: number;
    size: number;
  };
}

// Performance monitor interface
export interface PerformanceMonitor {
  // Lifecycle
  start: () => void;
  stop: () => void;
  reset: () => void;
  
  // Metrics collection
  getMetrics: () => PerformanceMetrics;
  getHistory: (count?: number) => PerformanceMetrics[];
  getAverages: (duration?: number) => PerformanceMetrics;
  
  // Custom metrics
  mark: (name: string, metadata?: Record<string, any>) => void;
  measure: (name: string, startMark: string, endMark: string) => void;
  recordMetric: (name: string, value: number) => void;
  
  // Component tracking
  trackComponent: (component: ComponentPerformanceData) => void;
  getComponentMetrics: (name?: string) => ComponentPerformance[];
  
  // API tracking
  trackAPICall: (data: APICallData) => void;
  getAPIMetrics: (endpoint?: string) => APIPerformance[];
  
  // Reporting
  report: () => PerformanceReport;
  exportData: (format: 'json' | 'csv') => string;
  
  // Configuration
  configure: (config: Partial<PerformanceMonitorConfig>) => void;
  getConfig: () => PerformanceMonitorConfig;
  
  // Events
  on: (event: PerformanceEvent, handler: PerformanceEventHandler) => void;
  off: (event: PerformanceEvent, handler: PerformanceEventHandler) => void;
}

// Performance data types
export interface ComponentPerformanceData {
  name: string;
  phase: 'mount' | 'update' | 'unmount';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions?: Set<unknown>;  // React Profiler interactions - internal structure
}

export interface APICallData {
  endpoint: string;
  method: string;
  startTime: number;
  endTime: number;
  status: number;
  size: number;
  error?: Error;
  metadata?: Record<string, unknown>;  // API call metadata - serializable data
}

// Performance report
export interface PerformanceReport {
  summary: PerformanceSummary;
  metrics: PerformanceMetrics;
  issues: PerformanceIssue[];
  recommendations: string[];
  timestamp: number;
}

export interface PerformanceSummary {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'healthy' | 'degraded' | 'critical';
  topIssues: string[];
}

export interface PerformanceIssue {
  type: IssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  occurrences: number;
  lastOccurred: number;
}

export type IssueType = 
  | 'low-fps'
  | 'high-memory'
  | 'slow-api'
  | 'render-blocking'
  | 'layout-shift'
  | 'long-task'
  | 'resource-size'
  | 'cache-miss'
  | 'error-rate';

// Performance events
export type PerformanceEvent = 
  | 'threshold-exceeded'
  | 'performance-degraded'
  | 'performance-recovered'
  | 'metric-recorded'
  | 'report-generated';

export type PerformanceEventHandler = (data: PerformanceEventData) => void;

export interface PerformanceEventData {
  event: PerformanceEvent;
  metric?: string;
  value?: number;
  threshold?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

// Performance optimization suggestions
export interface OptimizationSuggestion {
  id: string;
  category: OptimizationCategory;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  automated: boolean;
  apply?: () => Promise<void>;
}

export type OptimizationCategory = 
  | 'code-splitting'
  | 'lazy-loading'
  | 'caching'
  | 'bundling'
  | 'rendering'
  | 'network'
  | 'memory'
  | 'react';

// Profiling types
export interface ProfilerData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<unknown>;  // React Profiler interactions - internal structure
}

export interface ProfilerReport {
  slowestComponents: ComponentPerformance[];
  mostFrequentRenders: ComponentPerformance[];
  totalRenderTime: number;
  averageRenderTime: number;
  renderCount: number;
}

// Resource timing
export interface ResourceTiming {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'xhr' | 'fetch';
  size: number;
  duration: number;
  startTime: number;
  cached: boolean;
}

// User timing
export interface UserTiming {
  marks: Map<string, number>;
  measures: Map<string, { start: number; end: number; duration: number }>;
}

// Performance budget
export interface PerformanceBudget {
  metrics: {
    [key: string]: {
      max: number;
      warning?: number;
    };
  };
  resources: {
    scripts?: { max: number; count?: number };
    stylesheets?: { max: number; count?: number };
    images?: { max: number; count?: number };
    fonts?: { max: number; count?: number };
    total?: { max: number };
  };
}

// Performance utilities
export interface PerformanceUtils {
  formatBytes: (bytes: number) => string;
  formatDuration: (ms: number) => string;
  calculateFPS: (frames: number, duration: number) => number;
  debounce: <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => T;
  throttle: <T extends (...args: unknown[]) => unknown>(fn: T, limit: number) => T;
  memoize: <T extends (...args: unknown[]) => unknown>(fn: T) => T;
}