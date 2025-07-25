// Generic API response wrappers and common types

// Base API response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  success: boolean;
  error?: ApiError;
}

// API error structure
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

// Pagination info
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Response metadata
export interface ResponseMetadata {
  timestamp: string;
  version?: string;
  cached?: boolean;
  cacheExpiry?: string;
  requestId?: string;
}

// Search/filter response
export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters: Record<string, any>;
  suggestions?: string[];
  facets?: SearchFacets;
}

// Search facets for filtering
export interface SearchFacets {
  [key: string]: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  label?: string;
}

// Batch operation response
export interface BatchResponse<T> {
  successful: T[];
  failed: BatchFailure[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export interface BatchFailure {
  item: any;
  error: ApiError;
  index: number;
}

// File upload response
export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
}

// Authentication responses
export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Supabase specific types
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Cache response wrapper
export interface CachedResponse<T> {
  data: T;
  cached: boolean;
  cacheKey: string;
  cachedAt?: string;
  expiresAt?: string;
  stale?: boolean;
}

// Webhook/notification types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
  webhookId?: string;
}

// Stats/analytics response
export interface StatsResponse {
  period: {
    start: string;
    end: string;
  };
  metrics: Record<string, MetricValue>;
  breakdown?: Record<string, any[]>;
}

export interface MetricValue {
  value: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: Record<string, ServiceHealth>;
  timestamp: string;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

// Rate limit info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  retryAfter?: number;
}

// API endpoints enum (for type safety)
export enum ApiEndpoint {
  // Pokemon endpoints
  POKEMON_LIST = '/api/pokemon',
  POKEMON_DETAIL = '/api/pokemon/:id',
  POKEMON_SPECIES = '/api/pokemon-species/:id',
  POKEMON_EVOLUTION = '/api/evolution-chain/:id',
  
  // Card endpoints
  CARDS_LIST = '/api/cards',
  CARD_DETAIL = '/api/cards/:id',
  CARD_PRICES = '/api/cards/:id/prices',
  CARD_SETS = '/api/sets',
  
  // Pocket cards endpoints
  POCKET_CARDS = '/api/pocket-cards',
  POCKET_PACKS = '/api/pocket-packs',
  POCKET_COLLECTION = '/api/pocket-collection',
  
  // User endpoints
  USER_PROFILE = '/api/user/profile',
  USER_COLLECTION = '/api/user/collection',
  USER_FAVORITES = '/api/user/favorites',
  USER_DECKS = '/api/user/decks',
  
  // Search endpoints
  SEARCH_GLOBAL = '/api/search',
  SEARCH_POKEMON = '/api/search/pokemon',
  SEARCH_CARDS = '/api/search/cards',
  
  // Stats endpoints
  STATS_OVERVIEW = '/api/stats/overview',
  STATS_TRENDING = '/api/stats/trending',
  STATS_PRICES = '/api/stats/prices',
}

// Request types
export interface ApiRequest<T = any> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  body?: T;
  headers?: Record<string, string>;
  timeout?: number;
}

// Common query parameters
export interface CommonQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  fields?: string[];
  include?: string[];
  exclude?: string[];
}