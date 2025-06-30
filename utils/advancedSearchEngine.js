/**
 * Advanced Search Engine
 * Provides full-text search, fuzzy matching, and intelligent suggestions
 */

import { supabase } from '../lib/supabase';
import logger from './logger';
import analyticsEngine from './analyticsEngine';

class AdvancedSearchEngine {
  constructor() {
    this.searchCache = new Map();
    this.suggestionCache = new Map();
    this.popularSearches = new Map();
    this.searchHistory = [];
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);
    
    // Search configuration
    this.config = {
      maxResults: 100,
      fuzzyThreshold: 0.7,
      suggestionLimit: 10,
      cacheExpiry: 300000, // 5 minutes
      enableAnalytics: true
    };
  }

  /**
   * Main search function with intelligent ranking
   */
  async search(query, options = {}) {
    const {
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
      enableFuzzy = true,
      enableSuggestions = true,
      searchType = 'all'
    } = options;

    const startTime = Date.now();
    const searchId = this.generateSearchId(query, options);

    try {
      // Check cache first
      const cachedResult = this.getFromCache(searchId);
      if (cachedResult) {
        logger.debug('Search cache hit', { query, searchId });
        this.trackSearchAnalytics(query, cachedResult.results.length, 'cache', Date.now() - startTime);
        return cachedResult;
      }

      // Process and clean query
      const processedQuery = this.preprocessQuery(query);
      
      if (!processedQuery.terms.length && !Object.keys(filters).length) {
        return this.createEmptyResult('Query too short or invalid');
      }

      // Execute search based on type
      let searchResults;
      switch (searchType) {
        case 'cards':
          searchResults = await this.searchCards(processedQuery, filters, options);
          break;
        case 'pokemon':
          searchResults = await this.searchPokemon(processedQuery, filters, options);
          break;
        case 'sets':
          searchResults = await this.searchSets(processedQuery, filters, options);
          break;
        default:
          searchResults = await this.searchAll(processedQuery, filters, options);
      }

      // Rank and sort results
      const rankedResults = this.rankResults(searchResults, processedQuery, sortBy, sortOrder);
      
      // Apply pagination
      const paginatedResults = rankedResults.slice(offset, offset + limit);
      
      // Generate suggestions if enabled
      let suggestions = [];
      if (enableSuggestions && paginatedResults.length < 5) {
        suggestions = await this.generateSuggestions(query, searchType);
      }

      const result = {
        query: query,
        processedQuery: processedQuery,
        results: paginatedResults,
        suggestions: suggestions,
        totalResults: rankedResults.length,
        searchTime: Date.now() - startTime,
        filters: filters,
        searchType: searchType,
        timestamp: new Date().toISOString()
      };

      // Cache result
      this.setCache(searchId, result);
      
      // Track analytics
      this.trackSearchAnalytics(query, result.totalResults, searchType, result.searchTime, filters);
      
      return result;

    } catch (error) {
      logger.error('Advanced search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Preprocess search query
   */
  preprocessQuery(query) {
    if (!query || typeof query !== 'string') {
      return { original: '', terms: [], normalized: '' };
    }

    const original = query.trim();
    
    // Normalize: lowercase, remove special chars, split into terms
    const normalized = original
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Extract terms, remove stop words
    const terms = normalized
      .split(' ')
      .filter(term => term.length > 1 && !this.stopWords.has(term));

    // Extract quoted phrases
    const phrases = [];
    const quoteMatches = original.match(/"([^"]+)"/g);
    if (quoteMatches) {
      quoteMatches.forEach(match => {
        phrases.push(match.replace(/"/g, '').toLowerCase());
      });
    }

    return {
      original,
      normalized,
      terms,
      phrases,
      hasQuotes: phrases.length > 0
    };
  }

  /**
   * Search cards with advanced matching
   */
  async searchCards(processedQuery, filters, options) {
    const { terms, phrases, hasQuotes } = processedQuery;
    const { enableFuzzy } = options;

    // Build search conditions
    const searchConditions = [];
    
    // Text search conditions
    if (hasQuotes) {
      // Exact phrase matching for quoted terms
      phrases.forEach(phrase => {
        searchConditions.push({
          type: 'exact',
          field: 'name',
          value: phrase,
          weight: 10
        });
      });
    }

    // Term-based search
    terms.forEach(term => {
      searchConditions.push(
        { type: 'contains', field: 'name', value: term, weight: 8 },
        { type: 'contains', field: 'set_name', value: term, weight: 6 },
        { type: 'contains', field: 'artist', value: term, weight: 4 },
        { type: 'contains', field: 'rarity', value: term, weight: 3 },
        { type: 'contains', field: 'types', value: term, weight: 5 }
      );
    });

    // Execute search query
    let queryBuilder = supabase
      .from('card_cache')
      .select(`
        card_data,
        created_at,
        cache_key
      `);

    // Apply text search
    if (terms.length > 0) {
      const searchTerm = terms.join(' & ');
      // Use full-text search if available, otherwise fall back to LIKE
      queryBuilder = queryBuilder.or(
        terms.map(term => `card_data->>name.ilike.%${term}%`).join(',') + ',' +
        terms.map(term => `card_data->>set.name.ilike.%${term}%`).join(',')
      );
    }

    // Apply filters
    queryBuilder = this.applyCardFilters(queryBuilder, filters);

    // Execute query
    const { data, error } = await queryBuilder.limit(this.config.maxResults);

    if (error) {
      logger.error('Card search query error:', error);
      throw new Error(`Card search failed: ${error.message}`);
    }

    // Process and score results
    const results = (data || []).map(item => {
      const cardData = typeof item.card_data === 'string' 
        ? JSON.parse(item.card_data) 
        : item.card_data;

      const score = this.calculateRelevanceScore(cardData, searchConditions);
      
      return {
        type: 'card',
        id: cardData.id,
        data: cardData,
        score: score,
        matchedFields: this.getMatchedFields(cardData, terms, phrases)
      };
    });

    // Add fuzzy matching if enabled and few results
    if (enableFuzzy && results.length < 10 && terms.length > 0) {
      const fuzzyResults = await this.performFuzzyCardSearch(terms, filters);
      results.push(...fuzzyResults);
    }

    return results;
  }

  /**
   * Search Pokemon with intelligent matching
   */
  async searchPokemon(processedQuery, filters, options) {
    const { terms, phrases } = processedQuery;

    let queryBuilder = supabase
      .from('pokemon_cache')
      .select(`
        pokemon_data,
        created_at
      `);

    // Apply text search
    if (terms.length > 0) {
      queryBuilder = queryBuilder.or(
        terms.map(term => `pokemon_data->>name.ilike.%${term}%`).join(',') + ',' +
        terms.map(term => `pokemon_data->>types.cs.{${term}}`).join(',')
      );
    }

    // Apply filters
    queryBuilder = this.applyPokemonFilters(queryBuilder, filters);

    const { data, error } = await queryBuilder.limit(this.config.maxResults);

    if (error) {
      logger.error('Pokemon search query error:', error);
      throw new Error(`Pokemon search failed: ${error.message}`);
    }

    return (data || []).map(item => {
      const pokemonData = typeof item.pokemon_data === 'string' 
        ? JSON.parse(item.pokemon_data) 
        : item.pokemon_data;

      const score = this.calculatePokemonRelevanceScore(pokemonData, terms, phrases);
      
      return {
        type: 'pokemon',
        id: pokemonData.id,
        data: pokemonData,
        score: score,
        matchedFields: this.getMatchedFields(pokemonData, terms, phrases)
      };
    });
  }

  /**
   * Search card sets
   */
  async searchSets(processedQuery, filters, options) {
    const { terms } = processedQuery;

    // Get unique sets from card data
    const { data, error } = await supabase
      .from('card_cache')
      .select('card_data->set')
      .not('card_data->set', 'is', null);

    if (error) {
      logger.error('Set search query error:', error);
      throw new Error(`Set search failed: ${error.message}`);
    }

    // Extract and deduplicate sets
    const sets = new Map();
    (data || []).forEach(item => {
      const setData = item.set;
      if (setData && setData.id) {
        sets.set(setData.id, setData);
      }
    });

    // Filter sets based on search terms
    const results = [];
    for (const [setId, setData] of sets.entries()) {
      if (this.matchesTerms(setData.name, terms) || 
          this.matchesTerms(setData.series, terms)) {
        
        const score = this.calculateSetRelevanceScore(setData, terms);
        results.push({
          type: 'set',
          id: setId,
          data: setData,
          score: score,
          matchedFields: this.getMatchedFields(setData, terms, [])
        });
      }
    }

    return results;
  }

  /**
   * Search across all content types
   */
  async searchAll(processedQuery, filters, options) {
    const [cardResults, pokemonResults, setResults] = await Promise.all([
      this.searchCards(processedQuery, filters.cards || {}, options),
      this.searchPokemon(processedQuery, filters.pokemon || {}, options),
      this.searchSets(processedQuery, filters.sets || {}, options)
    ]);

    return [...cardResults, ...pokemonResults, ...setResults];
  }

  /**
   * Perform fuzzy search for cards when exact search yields few results
   */
  async performFuzzyCardSearch(terms, filters) {
    const fuzzyResults = [];

    try {
      // Get a broader set of cards for fuzzy matching
      let queryBuilder = supabase
        .from('card_cache')
        .select('card_data')
        .limit(500); // Larger sample for fuzzy matching

      queryBuilder = this.applyCardFilters(queryBuilder, filters);
      
      const { data, error } = await queryBuilder;

      if (error || !data) {
        return fuzzyResults;
      }

      // Perform fuzzy matching
      data.forEach(item => {
        const cardData = typeof item.card_data === 'string' 
          ? JSON.parse(item.card_data) 
          : item.card_data;

        const fuzzyScore = this.calculateFuzzyScore(cardData.name, terms.join(' '));
        
        if (fuzzyScore >= this.config.fuzzyThreshold) {
          fuzzyResults.push({
            type: 'card',
            id: cardData.id,
            data: cardData,
            score: fuzzyScore * 0.8, // Reduce score for fuzzy matches
            matchedFields: ['name (fuzzy)'],
            isFuzzy: true
          });
        }
      });

    } catch (error) {
      logger.warn('Fuzzy search error:', error);
    }

    return fuzzyResults.slice(0, 10); // Limit fuzzy results
  }

  /**
   * Calculate fuzzy matching score using Levenshtein distance
   */
  calculateFuzzyScore(text1, text2) {
    if (!text1 || !text2) return 0;

    const s1 = text1.toLowerCase();
    const s2 = text2.toLowerCase();

    if (s1 === s2) return 1.0;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Apply card-specific filters
   */
  applyCardFilters(queryBuilder, filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        switch (key) {
          case 'setId':
            queryBuilder = queryBuilder.eq('card_data->set->>id', value);
            break;
          case 'rarity':
            queryBuilder = queryBuilder.eq('card_data->>rarity', value);
            break;
          case 'types':
            if (Array.isArray(value)) {
              queryBuilder = queryBuilder.overlaps('card_data->types', value);
            } else {
              queryBuilder = queryBuilder.contains('card_data->types', [value]);
            }
            break;
          case 'artist':
            queryBuilder = queryBuilder.eq('card_data->>artist', value);
            break;
          case 'supertype':
            queryBuilder = queryBuilder.eq('card_data->>supertype', value);
            break;
          case 'priceMin':
            queryBuilder = queryBuilder.gte('card_data->tcgplayer->prices->holofoil->>market', parseFloat(value));
            break;
          case 'priceMax':
            queryBuilder = queryBuilder.lte('card_data->tcgplayer->prices->holofoil->>market', parseFloat(value));
            break;
          case 'hasPrice':
            if (value) {
              queryBuilder = queryBuilder.not('card_data->tcgplayer->prices', 'is', null);
            }
            break;
        }
      }
    });

    return queryBuilder;
  }

  /**
   * Apply Pokemon-specific filters
   */
  applyPokemonFilters(queryBuilder, filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        switch (key) {
          case 'types':
            if (Array.isArray(value)) {
              queryBuilder = queryBuilder.overlaps('pokemon_data->types', value);
            } else {
              queryBuilder = queryBuilder.contains('pokemon_data->types', [value]);
            }
            break;
          case 'generation':
            queryBuilder = queryBuilder.eq('pokemon_data->>generation', value);
            break;
        }
      }
    });

    return queryBuilder;
  }

  /**
   * Calculate relevance score for cards
   */
  calculateRelevanceScore(cardData, searchConditions) {
    let score = 0;

    searchConditions.forEach(condition => {
      const fieldValue = this.getFieldValue(cardData, condition.field);
      
      if (this.matchesCondition(fieldValue, condition)) {
        score += condition.weight;
      }
    });

    // Boost score for popular cards (could be based on analytics data)
    if (cardData.tcgplayer?.prices?.holofoil?.market > 50) {
      score += 2; // High value cards get slight boost
    }

    return score;
  }

  /**
   * Calculate relevance score for Pokemon
   */
  calculatePokemonRelevanceScore(pokemonData, terms, phrases) {
    let score = 0;

    // Name matching
    if (this.matchesTerms(pokemonData.name, terms)) {
      score += 10;
    }

    // Type matching
    if (pokemonData.types && this.matchesTerms(pokemonData.types.join(' '), terms)) {
      score += 8;
    }

    // Exact phrase matching
    phrases.forEach(phrase => {
      if (pokemonData.name.toLowerCase().includes(phrase)) {
        score += 15;
      }
    });

    return score;
  }

  /**
   * Calculate relevance score for sets
   */
  calculateSetRelevanceScore(setData, terms) {
    let score = 0;

    if (this.matchesTerms(setData.name, terms)) {
      score += 10;
    }

    if (this.matchesTerms(setData.series, terms)) {
      score += 6;
    }

    return score;
  }

  /**
   * Check if text matches search terms
   */
  matchesTerms(text, terms) {
    if (!text || !terms.length) return false;
    
    const lowerText = text.toLowerCase();
    return terms.some(term => lowerText.includes(term.toLowerCase()));
  }

  /**
   * Check if field value matches search condition
   */
  matchesCondition(fieldValue, condition) {
    if (!fieldValue) return false;

    const value = fieldValue.toString().toLowerCase();
    const searchValue = condition.value.toLowerCase();

    switch (condition.type) {
      case 'exact':
        return value === searchValue;
      case 'contains':
        return value.includes(searchValue);
      case 'starts':
        return value.startsWith(searchValue);
      case 'ends':
        return value.endsWith(searchValue);
      default:
        return false;
    }
  }

  /**
   * Get field value from data object
   */
  getFieldValue(data, field) {
    const fieldMap = {
      'name': data.name,
      'set_name': data.set?.name,
      'artist': data.artist,
      'rarity': data.rarity,
      'types': data.types?.join(' ')
    };

    return fieldMap[field] || '';
  }

  /**
   * Get matched fields for highlighting
   */
  getMatchedFields(data, terms, phrases) {
    const matched = [];
    
    if (data.name && this.matchesTerms(data.name, terms)) {
      matched.push('name');
    }
    
    if (data.set?.name && this.matchesTerms(data.set.name, terms)) {
      matched.push('set');
    }
    
    if (data.artist && this.matchesTerms(data.artist, terms)) {
      matched.push('artist');
    }

    return matched;
  }

  /**
   * Rank and sort search results
   */
  rankResults(results, processedQuery, sortBy, sortOrder) {
    const sortedResults = [...results];

    sortedResults.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'name':
          comparison = (a.data.name || '').localeCompare(b.data.name || '');
          break;
        case 'price':
          const aPrice = this.getPrice(a.data);
          const bPrice = this.getPrice(b.data);
          comparison = bPrice - aPrice;
          break;
        case 'date':
          const aDate = new Date(a.data.set?.releaseDate || 0);
          const bDate = new Date(b.data.set?.releaseDate || 0);
          comparison = bDate - aDate;
          break;
        default:
          comparison = b.score - a.score;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return sortedResults;
  }

  /**
   * Get price from card data for sorting
   */
  getPrice(cardData) {
    return cardData.tcgplayer?.prices?.holofoil?.market || 
           cardData.tcgplayer?.prices?.normal?.market || 0;
  }

  /**
   * Generate intelligent search suggestions
   */
  async generateSuggestions(query, searchType = 'all') {
    const cacheKey = `suggestions_${query}_${searchType}`;
    const cached = this.suggestionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
      return cached.suggestions;
    }

    try {
      const suggestions = [];

      // Autocomplete suggestions from card names
      if (searchType === 'all' || searchType === 'cards') {
        const cardSuggestions = await this.getCardSuggestions(query);
        suggestions.push(...cardSuggestions);
      }

      // Pokemon name suggestions
      if (searchType === 'all' || searchType === 'pokemon') {
        const pokemonSuggestions = await this.getPokemonSuggestions(query);
        suggestions.push(...pokemonSuggestions);
      }

      // Popular searches
      const popularSuggestions = this.getPopularSearchSuggestions(query);
      suggestions.push(...popularSuggestions);

      // Remove duplicates and sort by relevance
      const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
      const sortedSuggestions = uniqueSuggestions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, this.config.suggestionLimit);

      // Cache suggestions
      this.suggestionCache.set(cacheKey, {
        suggestions: sortedSuggestions,
        timestamp: Date.now()
      });

      return sortedSuggestions;

    } catch (error) {
      logger.error('Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * Get card name suggestions
   */
  async getCardSuggestions(query) {
    if (query.length < 2) return [];

    const { data, error } = await supabase
      .from('card_cache')
      .select('card_data->name')
      .like('card_data->>name', `${query}%`)
      .limit(20);

    if (error) {
      logger.warn('Error fetching card suggestions:', error);
      return [];
    }

    return (data || []).map(item => ({
      text: item.name,
      type: 'card',
      category: 'Cards',
      relevance: this.calculateSuggestionRelevance(item.name, query)
    }));
  }

  /**
   * Get Pokemon name suggestions
   */
  async getPokemonSuggestions(query) {
    if (query.length < 2) return [];

    const { data, error } = await supabase
      .from('pokemon_cache')
      .select('pokemon_data->name')
      .like('pokemon_data->>name', `${query}%`)
      .limit(20);

    if (error) {
      logger.warn('Error fetching pokemon suggestions:', error);
      return [];
    }

    return (data || []).map(item => ({
      text: item.name,
      type: 'pokemon',
      category: 'Pokemon',
      relevance: this.calculateSuggestionRelevance(item.name, query)
    }));
  }

  /**
   * Get popular search suggestions
   */
  getPopularSearchSuggestions(query) {
    const suggestions = [];
    
    for (const [search, count] of this.popularSearches.entries()) {
      if (search.toLowerCase().includes(query.toLowerCase()) && search !== query) {
        suggestions.push({
          text: search,
          type: 'popular',
          category: 'Popular Searches',
          relevance: count / 100 // Normalize popularity
        });
      }
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Calculate suggestion relevance score
   */
  calculateSuggestionRelevance(suggestion, query) {
    const lowerSuggestion = suggestion.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match gets highest score
    if (lowerSuggestion === lowerQuery) return 100;

    // Starts with query gets high score
    if (lowerSuggestion.startsWith(lowerQuery)) return 80;

    // Contains query gets medium score
    if (lowerSuggestion.includes(lowerQuery)) return 60;

    // Fuzzy match gets lower score
    const fuzzyScore = this.calculateFuzzyScore(lowerSuggestion, lowerQuery);
    return fuzzyScore * 40;
  }

  /**
   * Remove duplicate suggestions
   */
  deduplicateSuggestions(suggestions) {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.text}_${suggestion.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Track search analytics
   */
  trackSearchAnalytics(query, resultCount, searchType, searchTime, filters = {}) {
    if (!this.config.enableAnalytics) return;

    // Track with analytics engine
    analyticsEngine.trackSearch(query, resultCount, filters);

    // Update popular searches
    const currentCount = this.popularSearches.get(query) || 0;
    this.popularSearches.set(query, currentCount + 1);

    // Add to search history
    this.searchHistory.unshift({
      query,
      resultCount,
      searchType,
      searchTime,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.searchHistory.length > 1000) {
      this.searchHistory = this.searchHistory.slice(0, 1000);
    }

    logger.debug('Search analytics tracked:', {
      query,
      resultCount,
      searchType,
      searchTime
    });
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.searchCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.config.cacheExpiry) {
      this.searchCache.delete(key);
      return null;
    }

    return cached.data;
  }

  setCache(key, data) {
    // Limit cache size
    if (this.searchCache.size > 1000) {
      const oldestKey = this.searchCache.keys().next().value;
      this.searchCache.delete(oldestKey);
    }

    this.searchCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  generateSearchId(query, options) {
    const searchData = {
      query: query.toLowerCase().trim(),
      filters: JSON.stringify(options.filters || {}),
      sortBy: options.sortBy || 'relevance',
      searchType: options.searchType || 'all'
    };
    
    return btoa(JSON.stringify(searchData)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  createEmptyResult(message = 'No results found') {
    return {
      query: '',
      processedQuery: { original: '', terms: [], normalized: '' },
      results: [],
      suggestions: [],
      totalResults: 0,
      searchTime: 0,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get search analytics and insights
   */
  getSearchAnalytics() {
    const totalSearches = this.searchHistory.length;
    const recentSearches = this.searchHistory.slice(0, 100);
    
    const analytics = {
      totalSearches,
      averageResults: recentSearches.reduce((sum, search) => sum + search.resultCount, 0) / recentSearches.length || 0,
      averageSearchTime: recentSearches.reduce((sum, search) => sum + search.searchTime, 0) / recentSearches.length || 0,
      popularQueries: Array.from(this.popularSearches.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20),
      cacheHitRate: this.calculateCacheHitRate(),
      recentSearches: recentSearches.slice(0, 10)
    };

    return analytics;
  }

  calculateCacheHitRate() {
    // This would need to be tracked properly in a real implementation
    return 0.75; // Placeholder
  }
}

// Create global instance
const advancedSearchEngine = new AdvancedSearchEngine();

export default advancedSearchEngine;