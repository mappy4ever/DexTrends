/**
 * Advanced Search API Endpoint
 * Provides intelligent search with fuzzy matching and suggestions
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import advancedSearchEngine from '../../utils/advancedSearchEngine';
import logger from '../../utils/logger';

interface SearchFilters {
  setId?: string;
  rarity?: string;
  types?: string[];
  artist?: string;
  priceMin?: number;
  priceMax?: number;
  hasPrice?: boolean;
}

interface SearchOptions {
  filters: SearchFilters;
  sortBy: string;
  sortOrder: string;
  limit: number;
  offset: number;
  enableFuzzy: boolean;
  enableSuggestions: boolean;
  searchType: string;
}

interface SearchResponse {
  success: boolean;
  results?: any[];
  totalResults?: number;
  suggestions?: any[];
  analytics?: any;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalPages?: number;
  };
  [key: string]: any; // Allow additional properties from searchResult
}

interface ErrorResponse {
  error: string;
  message?: string;
  validTypes?: string[];
  validEventTypes?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | ErrorResponse>
) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleSearchRequest(req, res);
      
      case 'POST':
        return await handleAdvancedSearchRequest(req, res);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    logger.error('Advanced search API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function handleSearchRequest(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | ErrorResponse>
) {
  const {
    q: query = '',
    type = 'all',
    limit = 50,
    offset = 0,
    sort = 'relevance',
    order = 'desc',
    fuzzy = 'true',
    suggestions = 'true',
    // Filter parameters
    setId,
    rarity,
    types,
    artist,
    priceMin,
    priceMax,
    hasPrice
  } = req.query;

  // Validate parameters
  const limitStr = Array.isArray(limit) ? limit[0] : String(limit);
  const offsetStr = Array.isArray(offset) ? offset[0] : String(offset);
  const parsedLimit = Math.min(parseInt(limitStr, 10) || 50, 200);
  const parsedOffset = Math.max(parseInt(offsetStr, 10) || 0, 0);

  const queryStr = Array.isArray(query) ? query[0] : String(query);
  if (!queryStr.trim() && !setId && !rarity && !types) {
    return res.status(400).json({ 
      error: 'Search query or filters required' 
    });
  }

  // Build filters object
  const filters: SearchFilters = {};
  const setIdStr = Array.isArray(setId) ? setId[0] : setId;
  const rarityStr = Array.isArray(rarity) ? rarity[0] : rarity;
  if (setIdStr) filters.setId = setIdStr;
  if (rarityStr) filters.rarity = rarityStr;
  const typesStr = Array.isArray(types) ? types[0] : types;
  if (typesStr) filters.types = typesStr.split(',');
  const artistStr = Array.isArray(artist) ? artist[0] : artist;
  if (artistStr) filters.artist = artistStr;
  const priceMinStr = Array.isArray(priceMin) ? priceMin[0] : priceMin;
  const priceMaxStr = Array.isArray(priceMax) ? priceMax[0] : priceMax;
  if (priceMinStr) filters.priceMin = parseFloat(priceMinStr);
  if (priceMaxStr) filters.priceMax = parseFloat(priceMaxStr);
  const hasPriceStr = Array.isArray(hasPrice) ? hasPrice[0] : hasPrice;
  if (hasPriceStr === 'true') filters.hasPrice = true;

  // Search options
  const sortStr = Array.isArray(sort) ? sort[0] : sort;
  const orderStr = Array.isArray(order) ? order[0] : order;
  const options: SearchOptions = {
    filters,
    sortBy: sortStr || 'relevance',
    sortOrder: orderStr || 'desc',
    limit: parsedLimit,
    offset: parsedOffset,
    enableFuzzy: (Array.isArray(fuzzy) ? fuzzy[0] : fuzzy) === 'true',
    enableSuggestions: (Array.isArray(suggestions) ? suggestions[0] : suggestions) === 'true',
    searchType: Array.isArray(type) ? type[0] : type || 'all'
  };

  try {
    logger.info('Advanced search request:', { query: queryStr, type, filters });

    const searchResult = await advancedSearchEngine.search(queryStr, options as any);

    return res.status(200).json({
      success: true,
      ...searchResult,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: searchResult.totalResults > parsedOffset + parsedLimit
      }
    });

  } catch (error) {
    logger.error('Search execution error:', error);
    return res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
}

async function handleAdvancedSearchRequest(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | ErrorResponse>
) {
  const {
    query = '',
    searchType = 'all',
    filters = {},
    sorting = {},
    pagination = {},
    options = {}
  } = req.body;

  // Validate required fields
  if (!query.trim() && Object.keys(filters).length === 0) {
    return res.status(400).json({ 
      error: 'Query or filters required for advanced search' 
    });
  }

  // Build search options
  const searchOptions: SearchOptions = {
    filters: filters || {},
    sortBy: sorting.field || 'relevance',
    sortOrder: sorting.direction || 'desc',
    limit: Math.min(pagination.limit || 50, 200),
    offset: Math.max(pagination.offset || 0, 0),
    enableFuzzy: options.enableFuzzy !== false,
    enableSuggestions: options.enableSuggestions !== false,
    searchType: searchType
  };

  try {
    logger.info('Advanced search POST request:', { 
      query, 
      searchType, 
      filtersCount: Object.keys(filters).length 
    });

    const searchResult = await advancedSearchEngine.search(query, searchOptions as any);

    // Add search analytics if requested
    let analytics = null;
    if (options.includeAnalytics) {
      analytics = (advancedSearchEngine as any).getSearchAnalytics();
    }

    return res.status(200).json({
      success: true,
      ...searchResult,
      analytics,
      pagination: {
        limit: searchOptions.limit,
        offset: searchOptions.offset,
        hasMore: searchResult.totalResults > searchOptions.offset + searchOptions.limit,
        totalPages: Math.ceil(searchResult.totalResults / searchOptions.limit)
      }
    });

  } catch (error) {
    logger.error('Advanced search execution error:', error);
    return res.status(500).json({ 
      error: 'Advanced search failed',
      message: error.message 
    });
  }
}

interface SuggestionsResponse {
  success: boolean;
  query: string;
  suggestions: string[];
  generatedAt: string;
}

// Export additional endpoints for suggestions and analytics
export async function handleSuggestions(
  req: NextApiRequest,
  res: NextApiResponse<SuggestionsResponse | ErrorResponse>
) {
  const { q: query = '', type = 'all', limit = 10 } = req.query;
  const queryStr = Array.isArray(query) ? query[0] : String(query);
  const typeStr = Array.isArray(type) ? type[0] : String(type);
  const limitStr = Array.isArray(limit) ? limit[0] : String(limit);

  if (!queryStr.trim() || queryStr.length < 2) {
    return res.status(400).json({ 
      error: 'Query must be at least 2 characters long' 
    });
  }

  try {
    const suggestions = await (advancedSearchEngine as any).generateSuggestions(
      queryStr, 
      typeStr
    );

    return res.status(200).json({
      success: true,
      query: queryStr,
      suggestions: suggestions.slice(0, parseInt(limitStr, 10) || 10),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Suggestions generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate suggestions',
      message: error.message 
    });
  }
}

interface AnalyticsResponse {
  success: boolean;
  analytics: any;
  generatedAt: string;
}

export async function handleSearchAnalytics(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse | ErrorResponse>
) {
  try {
    const analytics = (advancedSearchEngine as any).getSearchAnalytics();

    return res.status(200).json({
      success: true,
      analytics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Search analytics error:', error);
    return res.status(500).json({ 
      error: 'Failed to get search analytics',
      message: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Allow larger payloads for complex searches
    },
  },
};