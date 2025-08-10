/**
 * Common type definitions to replace any types across the codebase
 */

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Error types
export interface ErrorWithMessage {
  message: string;
  code?: string;
  stack?: string;
}

// Event handler types
export type ClickHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type FormHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyHandler = (event: React.KeyboardEvent) => void;

// Generic object types
export type AnyObject = Record<string, unknown>;
export type StringRecord = Record<string, string>;
export type NumberRecord = Record<string, number>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Data types
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Chart data types
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[] | number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  [key: string]: unknown;
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Table types
export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  onSort?: (key: string) => void;
  loading?: boolean;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox';
  value: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  validation?: (value: unknown) => string | undefined;
}

// Navigation types
export interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

// Storage types
export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

// Enhanced Error Types (Phase 1 - Critical)
export type UnknownError = Error | string | { message: string; [key: string]: unknown };

export interface ErrorDetails {
  code?: string;
  timestamp?: string;
  context?: AnyObject;
  stack?: string;
}

export type ErrorHandler<T = void> = (error: UnknownError) => T;
export type AsyncErrorHandler<T = void> = (error: UnknownError) => Promise<T>;

// Input Validation Types (Phase 1 - Critical)
export type ValidatableInput = string | number | boolean | null | undefined;

export interface ValidationFunction<T = ValidatableInput> {
  (input: T): boolean;
}

export interface SanitizationFunction<T = ValidatableInput> {
  (input: T): T;
}

// Callback Types (Phase 2 - High)
export type AsyncCallback<TArgs extends unknown[] = [], TReturn = void> = 
  (...args: TArgs) => Promise<TReturn>;

export type SyncCallback<TArgs extends unknown[] = [], TReturn = void> = 
  (...args: TArgs) => TReturn;

export type EventCallback<TEvent = Event> = (event: TEvent) => void;

export interface NotificationCallback {
  (notification: { message: string; type?: string; [key: string]: unknown }): string | number;
}

// Performance/Analytics Types (Phase 3 - Medium)
export interface PerformanceMetric {
  name?: string;
  value?: number;
  timestamp?: number;
  labels?: StringRecord;
  [key: string]: unknown; // Allow additional properties
}

export interface AnalyticsEvent {
  type: string;
  data?: AnyObject;
  properties?: AnyObject;
  timestamp?: number;
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'medium' | 'high';
  [key: string]: unknown;
}

export interface CacheEntry<T = unknown> {
  value: T;
  timestamp: number;
  ttl?: number;
  hits?: number;
}

// Card Union Types - For handling different card types consistently
export interface BaseCard {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  rarity?: string;
  artist?: string;
  number: string;
  images?: {
    small: string;
    large: string;
  };
  set?: {
    id: string;
    name: string;
    series: string;
    images?: {
      small: string;
      large: string;
    };
  };
}

// Type utility to extract common properties from different card types
export type UnifiedCard = BaseCard & AnyObject;

// Mobile/Card Scanner types
export interface DetectedCard {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  confidence: number;
  [key: string]: unknown; // Allow additional properties for flexibility
}