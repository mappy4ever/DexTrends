/**
 * Advanced Search API Endpoint
 * Provides intelligent search with fuzzy matching and suggestions
 */

import advancedSearchEngine from '../../utils/advancedSearchEngine';
import logger from '../../utils/logger';

export default async function handler(req, res) {
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

async function handleSearchRequest(req, res) {
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
  const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  if (!query.trim() && !setId && !rarity && !types) {
    return res.status(400).json({ 
      error: 'Search query or filters required' 
    });
  }

  // Build filters object
  const filters = {};
  if (setId) filters.setId = setId;
  if (rarity) filters.rarity = rarity;
  if (types) filters.types = types.split(',');
  if (artist) filters.artist = artist;
  if (priceMin) filters.priceMin = parseFloat(priceMin);
  if (priceMax) filters.priceMax = parseFloat(priceMax);
  if (hasPrice === 'true') filters.hasPrice = true;

  // Search options
  const options = {
    filters,
    sortBy: sort,
    sortOrder: order,
    limit: parsedLimit,
    offset: parsedOffset,
    enableFuzzy: fuzzy === 'true',
    enableSuggestions: suggestions === 'true',
    searchType: type
  };

  try {
    logger.info('Advanced search request:', { query, type, filters });

    const searchResult = await advancedSearchEngine.search(query, options);

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

async function handleAdvancedSearchRequest(req, res) {
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
  const searchOptions = {
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

    const searchResult = await advancedSearchEngine.search(query, searchOptions);

    // Add search analytics if requested
    let analytics = null;
    if (options.includeAnalytics) {
      analytics = advancedSearchEngine.getSearchAnalytics();
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

// Export additional endpoints for suggestions and analytics
export async function handleSuggestions(req, res) {
  const { q: query = '', type = 'all', limit = 10 } = req.query;

  if (!query.trim() || query.length < 2) {
    return res.status(400).json({ 
      error: 'Query must be at least 2 characters long' 
    });
  }

  try {
    const suggestions = await advancedSearchEngine.generateSuggestions(
      query, 
      type
    );

    return res.status(200).json({
      success: true,
      query,
      suggestions: suggestions.slice(0, parseInt(limit, 10) || 10),
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

export async function handleSearchAnalytics(req, res) {
  try {
    const analytics = advancedSearchEngine.getSearchAnalytics();

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