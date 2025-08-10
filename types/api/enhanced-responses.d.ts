/**
 * Enhanced API response types for type-safe API handling
 */

import type { UnknownError, AnyObject } from '../common';
import type { CardSet, TCGCard } from './cards';

// Export UnknownError for external use
export { UnknownError };

// Enhanced API response with metadata
export interface EnhancedApiResponse<T = unknown> {
  data?: T;
  error?: UnknownError;
  metadata?: ResponseMetadata;
  success: boolean;
}

// Response metadata
export interface ResponseMetadata {
  timestamp: string;
  requestId?: string;
  cacheHit?: boolean;
  processingTime?: number;
  [key: string]: unknown;
}

// Paginated response
export interface PaginatedApiResponse<T = unknown> extends EnhancedApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// Batch operation response
export interface BatchApiResponse<T = unknown> {
  successful: T[];
  failed: Array<{
    item?: unknown;
    error: UnknownError;
    index: number;
  }>;
  stats: {
    total: number;
    successCount: number;
    failureCount: number;
  };
}

// GraphQL response types
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: AnyObject;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

// TCG API specific responses
export interface TCGApiResponse<T = unknown> {
  data: T;
  page?: number;
  pageSize?: number;
  count?: number;
  totalCount?: number;
}

// TCG Sets List API Response (for caching)
export interface TCGSetListApiResponse {
  data: CardSet[]; // CardSet[]
  pagination: {
    page: number;
    pageSize: number;
    count: number;
    totalCount: number;
    hasMore: boolean;
  };
  meta: {
    responseTime: number;
    cached: boolean;
  };
}

// TCG Cards List API Response (for caching)
export interface TCGCardListApiResponse {
  set?: CardSet; // CardSet
  cards?: TCGCard[]; // TCGCard[]
  data?: TCGCard[]; // TCGCard[]
  pagination: {
    page: number;
    pageSize: number;
    count: number;
    totalCount: number;
    hasMore: boolean;
  };
}

// Pokemon API specific responses
export interface PokemonApiResponse<T = unknown> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  data?: T;
}

// Supabase specific types
export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
  status?: number;
  statusText?: string;
}

// Cache response wrapper
export interface CachedResponse<T = unknown> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  cacheKey: string;
}

// Type guards for API responses
export function isEnhancedApiResponse<T>(value: unknown): value is EnhancedApiResponse<T> {
  return typeof value === 'object' && 
    value !== null && 
    'success' in value &&
    typeof (value as EnhancedApiResponse).success === 'boolean';
}

export function isSupabaseResponse<T>(value: unknown): value is SupabaseResponse<T> {
  return typeof value === 'object' && 
    value !== null && 
    'data' in value &&
    'error' in value;
}

export function hasError(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  return 'error' in response && (response as { error: unknown }).error != null;
}