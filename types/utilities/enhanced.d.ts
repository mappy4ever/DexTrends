/**
 * Enhanced utility types for replacing 'any' types safely
 */

// Safe replacements for 'any'
export type SafeAny = Record<string, unknown>;
export type EventData = Record<string, unknown>;
export type ExternalEvent = Event & Record<string, unknown>;

// Function types
export type SafeFunction<TArgs extends unknown[] = unknown[], TReturn = void> = (...args: TArgs) => TReturn;
export type AsyncSafeFunction<TArgs extends unknown[] = unknown[], TReturn = void> = (...args: TArgs) => Promise<TReturn>;

// Event handler types
export type SafeEventHandler<T = HTMLElement> = (event: React.MouseEvent<T> | React.TouchEvent<T> | React.KeyboardEvent<T>) => void;
export type SafeChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;

// External library types - Speech Recognition types moved to /types/speech-recognition.d.ts

export interface HotModuleReplacementData {
  acceptedDependencies?: Record<string, unknown>;
  acceptedModules?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

// API types
export type SafeApiResponse<T = unknown> = {
  data?: T;
  error?: Error | string | unknown;
  message?: string;
  status?: number;
};

// Component prop types
export interface SafeComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: unknown; // Safe catch-all
}

// Gesture types
export interface SwipeEventData {
  direction: 'left' | 'right' | 'up' | 'down';
  velocity: number;
  distance: number;
  absX: number;
  absY: number;
}

// Type guards
export function isError(value: unknown): value is Error {
  return value instanceof Error || 
    (typeof value === 'object' && 
     value !== null && 
     'message' in value && 
     typeof (value as any).message === 'string');
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}