/**
 * PerformanceContext - Focused context for performance monitoring
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 *
 * This context updates very frequently (metrics) but has very few consumers,
 * so isolating it prevents re-renders in the rest of the app.
 */

import React, { createContext, useState, useContext, useCallback, ReactNode, useRef } from 'react';
import { PerformanceState, PerformanceMetrics } from './modules/types';

// Performance context value interface
export interface PerformanceContextValue {
  performance: PerformanceState;
  updatePerformanceMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updatePerformanceVitals: (vitals: Partial<PerformanceMetrics>) => void;
  updateApiMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  enablePerformanceMonitoring: () => void;
  disablePerformanceMonitoring: () => void;
  getPerformanceSummary: () => PerformanceSummary;
}

// Performance summary interface
export interface PerformanceSummary {
  isMonitoring: boolean;
  metricsCount: number;
  vitalsCount: number;
  apiMetricsCount: number;
  suggestions: string[];
}

// Create the context
const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

// Default state
const defaultPerformance: PerformanceState = {
  metrics: {},
  monitoring: false,
  vitals: {},
  apiMetrics: {},
  isMonitoring: false,
  suggestions: [],
  testResults: null
};

// Provider props
interface PerformanceProviderProps {
  children: ReactNode;
  initialMonitoring?: boolean;
}

// Performance Provider Component
export function PerformanceProvider({ children, initialMonitoring = false }: PerformanceProviderProps) {
  const [performance, setPerformance] = useState<PerformanceState>(() => ({
    ...defaultPerformance,
    isMonitoring: initialMonitoring,
    monitoring: initialMonitoring
  }));

  // Use ref to avoid stale closures in frequent updates
  const performanceRef = useRef(performance);
  performanceRef.current = performance;

  // Update general metrics
  const updatePerformanceMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (!performanceRef.current.isMonitoring) return;

    setPerformance(prev => ({
      ...prev,
      metrics: { ...prev.metrics, ...metrics }
    }));
  }, []);

  // Update web vitals
  const updatePerformanceVitals = useCallback((vitals: Partial<PerformanceMetrics>) => {
    if (!performanceRef.current.isMonitoring) return;

    setPerformance(prev => ({
      ...prev,
      vitals: { ...prev.vitals, ...vitals }
    }));
  }, []);

  // Update API metrics
  const updateApiMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (!performanceRef.current.isMonitoring) return;

    setPerformance(prev => ({
      ...prev,
      apiMetrics: { ...prev.apiMetrics, ...metrics }
    }));
  }, []);

  // Enable monitoring
  const enablePerformanceMonitoring = useCallback(() => {
    setPerformance(prev => ({
      ...prev,
      isMonitoring: true,
      monitoring: true
    }));
  }, []);

  // Disable monitoring
  const disablePerformanceMonitoring = useCallback(() => {
    setPerformance(prev => ({
      ...prev,
      isMonitoring: false,
      monitoring: false
    }));
  }, []);

  // Get summary of performance data
  const getPerformanceSummary = useCallback((): PerformanceSummary => {
    const perf = performanceRef.current;
    return {
      isMonitoring: perf.isMonitoring,
      metricsCount: Object.keys(perf.metrics).length,
      vitalsCount: Object.keys(perf.vitals).length,
      apiMetricsCount: Object.keys(perf.apiMetrics).length,
      suggestions: perf.suggestions
    };
  }, []);

  const value: PerformanceContextValue = {
    performance,
    updatePerformanceMetrics,
    updatePerformanceVitals,
    updateApiMetrics,
    enablePerformanceMonitoring,
    disablePerformanceMonitoring,
    getPerformanceSummary
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

// Hook to use performance context
export function usePerformanceContext(): PerformanceContextValue {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function usePerformanceContextSafe(): PerformanceContextValue | null {
  return useContext(PerformanceContext) ?? null;
}

export default PerformanceContext;
