// Performance API Type Extensions
// Enhanced type definitions for performance monitoring

// Web Performance API interfaces
interface LayoutShiftPerformanceEntry extends PerformanceEntry {
  readonly value: number;
  readonly hadRecentInput: boolean;
  readonly sources: LayoutShiftSource[];
  readonly lastInputTime: number;
}

interface LayoutShiftSource {
  readonly node?: Element;
  readonly currentRect: DOMRectReadOnly;
  readonly previousRect: DOMRectReadOnly;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  readonly renderTime: number;
  readonly loadTime: number;
  readonly size: number;
  readonly id: string;
  readonly url: string;
  readonly element?: Element;
}

interface FirstInputDelayEntry extends PerformanceEventTiming {
  readonly processingStart: number;
  readonly processingEnd: number;
  readonly target?: Node;
}

interface NavigationTimingEntry extends PerformanceNavigationTiming {
  // Already well-defined in standard lib
}

interface PaintTimingEntry extends PerformanceEntry {
  // Standard paint timing entry
}

// Analytics and tracking types
interface AnalyticsParameters {
  [key: string]: string | number | boolean | null | undefined;
}

interface GtagParameters extends AnalyticsParameters {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: string;
  page_title?: string;
  page_location?: string;
  send_to?: string;
}

interface PWAUsageData {
  feature?: string;
  action?: string;
  value?: number | string;
  success?: boolean;
  error?: string;
  duration?: number;
  metadata?: Record<string, string | number | boolean>;
  command_type?: string;
  card_detected?: boolean;
  permission?: string;
  is_standalone?: boolean;
  confidence?: number;
  granted?: boolean;
}

interface InteractionProperties {
  interaction_type?: string;
  element_type?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  page_url?: string;
  timestamp?: number;
  session_id?: string;
  user_id?: string;
  action?: string;
  touches?: number;
  target?: string;
  scroll_y?: number;
  scroll_x?: number;
  input_type?: string;
}

interface EventProperties {
  category?: string;
  label?: string;
  value?: number | string;
  page?: string;
  user_id?: string;
  session_id?: string;
  device_type?: string;
  is_standalone?: boolean;
  metadata?: Record<string, string | number | boolean>;
  [key: string]: string | number | boolean | null | undefined | Record<string, string | number | boolean>;
}

// Performance observer callback types
type PerformanceObserverCallback = (list: PerformanceObserverEntryList) => void;

// Export types for use in other files
export type {
  LayoutShiftPerformanceEntry,
  LayoutShiftSource,
  LargestContentfulPaintEntry,
  FirstInputDelayEntry,
  NavigationTimingEntry,
  PaintTimingEntry,
  AnalyticsParameters,
  GtagParameters,
  PWAUsageData,
  InteractionProperties,
  EventProperties,
  PerformanceObserverCallback
};