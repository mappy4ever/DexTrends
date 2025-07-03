/**
 * Comprehensive Data Tools
 * Provides data import, validation, export, and analytics dashboard utilities
 */

import { supabase } from '../lib/supabase';
import logger from './logger';
import analyticsEngine from './analyticsEngine';
import databaseOptimizer from './databaseOptimizer';
import EnhancedPriceCollector from './enhancedPriceCollector';

class DataTools {
  constructor() {
    this.importQueue = [];
    this.validationRules = new Map();
    this.exportFormats = ['json', 'csv', 'xlsx'];
    this.isProcessing = false;
    
    this.setupValidationRules();
  }

  /**
   * Setup data validation rules
   */
  setupValidationRules() {
    // Card validation rules
    this.validationRules.set('card', {
      required: ['id', 'name'],
      fields: {
        id: { type: 'string', pattern: /^[a-zA-Z0-9-]+$/ },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        set: { type: 'object', required: ['id', 'name'] },
        rarity: { type: 'string', enum: ['Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Legendary'] },
        hp: { type: 'number', min: 0, max: 500 },
        types: { type: 'array', itemType: 'string' },
        artist: { type: 'string', maxLength: 50 }
      }
    });

    // Pokemon validation rules
    this.validationRules.set('pokemon', {
      required: ['id', 'name'],
      fields: {
        id: { type: 'string', pattern: /^[a-zA-Z0-9-]+$/ },
        name: { type: 'string', minLength: 1, maxLength: 50 },
        nationalPokedexNumber: { type: 'number', min: 1, max: 2000 },
        types: { type: 'array', itemType: 'string', minItems: 1, maxItems: 2 },
        height: { type: 'string' },
        weight: { type: 'string' }
      }
    });

    // Price data validation rules
    this.validationRules.set('price', {
      required: ['card_id', 'variant_type', 'collected_at'],
      fields: {
        card_id: { type: 'string', pattern: /^[a-zA-Z0-9-]+$/ },
        variant_type: { type: 'string', enum: ['normal', 'holofoil', 'reverseHolofoil', 'unlimited', 'firstEdition'] },
        price_market: { type: 'number', min: 0 },
        price_low: { type: 'number', min: 0 },
        price_high: { type: 'number', min: 0 },
        collected_at: { type: 'string', format: 'datetime' }
      }
    });
  }

  /**
   * Import data from various sources
   */
  async importData(source, data, options = {}) {
    const {
      dataType = 'card',
      batchSize = 100,
      validateData = true,
      skipDuplicates = true,
      dryRun = false
    } = options;

    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      logger.info(`Starting data import: ${importId}`, { 
        source, 
        dataType, 
        recordCount: data.length 
      });

      const importResult = {
        importId,
        source,
        dataType,
        totalRecords: data.length,
        validRecords: 0,
        invalidRecords: 0,
        insertedRecords: 0,
        skippedRecords: 0,
        errors: [],
        warnings: [],
        startTime: new Date().toISOString(),
        endTime: null
      };

      // Validate data if enabled
      let validatedData = data;
      if (validateData) {
        const validationResult = this.validateBulkData(data, dataType);
        validatedData = validationResult.validRecords;
        importResult.validRecords = validationResult.validRecords.length;
        importResult.invalidRecords = validationResult.invalidRecords.length;
        importResult.errors = validationResult.errors;
        importResult.warnings = validationResult.warnings;
      }

      if (dryRun) {
        importResult.endTime = new Date().toISOString();
        logger.info(`Dry run completed: ${importId}`, importResult);
        return importResult;
      }

      // Process data in batches
      const insertResults = await this.processBatchInsert(
        validatedData, 
        dataType, 
        batchSize, 
        skipDuplicates
      );

      importResult.insertedRecords = insertResults.successful.length;
      importResult.skippedRecords = insertResults.skipped.length;
      importResult.errors.push(...insertResults.errors);

      importResult.endTime = new Date().toISOString();

      // Log import summary
      logger.info(`Data import completed: ${importId}`, {
        totalRecords: importResult.totalRecords,
        insertedRecords: importResult.insertedRecords,
        errorCount: importResult.errors.length
      });

      return importResult;

    } catch (error) {
      logger.error(`Data import failed: ${importId}`, error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Validate bulk data against rules
   */
  validateBulkData(data, dataType) {
    const rules = this.validationRules.get(dataType);
    if (!rules) {
      throw new Error(`No validation rules found for data type: ${dataType}`);
    }

    const validRecords = [];
    const invalidRecords = [];
    const errors = [];
    const warnings = [];

    data.forEach((record, index) => {
      try {
        const validation = this.validateRecord(record, rules);
        
        if (validation.isValid) {
          validRecords.push(record);
        } else {
          invalidRecords.push({
            index,
            record,
            errors: validation.errors
          });
          
          validation.errors.forEach(error => {
            errors.push({
              recordIndex: index,
              field: error.field,
              message: error.message,
              value: error.value
            });
          });
        }

        // Add warnings for non-critical issues
        validation.warnings.forEach(warning => {
          warnings.push({
            recordIndex: index,
            field: warning.field,
            message: warning.message,
            value: warning.value
          });
        });

      } catch (error) {
        invalidRecords.push({
          index,
          record,
          errors: [{ field: 'general', message: error.message }]
        });
      }
    });

    return {
      validRecords,
      invalidRecords,
      errors,
      warnings
    };
  }

  /**
   * Validate individual record
   */
  validateRecord(record, rules) {
    const errors = [];
    const warnings = [];

    // Check required fields
    rules.required.forEach(field => {
      if (!record[field] && record[field] !== 0 && record[field] !== false) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          value: record[field]
        });
      }
    });

    // Validate field types and constraints
    Object.entries(rules.fields).forEach(([field, fieldRules]) => {
      const value = record[field];
      
      if (value === undefined || value === null) {
        return; // Skip validation for optional missing fields
      }

      // Type validation
      if (fieldRules.type && !this.validateFieldType(value, fieldRules.type)) {
        errors.push({
          field,
          message: `Field '${field}' must be of type ${fieldRules.type}`,
          value
        });
        return;
      }

      // Pattern validation
      if (fieldRules.pattern && typeof value === 'string' && !fieldRules.pattern.test(value)) {
        errors.push({
          field,
          message: `Field '${field}' does not match required pattern`,
          value
        });
      }

      // Length validation
      if (fieldRules.minLength && typeof value === 'string' && value.length < fieldRules.minLength) {
        errors.push({
          field,
          message: `Field '${field}' must be at least ${fieldRules.minLength} characters`,
          value
        });
      }

      if (fieldRules.maxLength && typeof value === 'string' && value.length > fieldRules.maxLength) {
        errors.push({
          field,
          message: `Field '${field}' must be no more than ${fieldRules.maxLength} characters`,
          value
        });
      }

      // Numeric validation
      if (fieldRules.min && typeof value === 'number' && value < fieldRules.min) {
        errors.push({
          field,
          message: `Field '${field}' must be at least ${fieldRules.min}`,
          value
        });
      }

      if (fieldRules.max && typeof value === 'number' && value > fieldRules.max) {
        errors.push({
          field,
          message: `Field '${field}' must be no more than ${fieldRules.max}`,
          value
        });
      }

      // Enum validation
      if (fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors.push({
          field,
          message: `Field '${field}' must be one of: ${fieldRules.enum.join(', ')}`,
          value
        });
      }

      // Array validation
      if (fieldRules.type === 'array' && Array.isArray(value)) {
        if (fieldRules.minItems && value.length < fieldRules.minItems) {
          errors.push({
            field,
            message: `Field '${field}' must have at least ${fieldRules.minItems} items`,
            value
          });
        }

        if (fieldRules.maxItems && value.length > fieldRules.maxItems) {
          errors.push({
            field,
            message: `Field '${field}' must have no more than ${fieldRules.maxItems} items`,
            value
          });
        }

        if (fieldRules.itemType) {
          value.forEach((item, index) => {
            if (!this.validateFieldType(item, fieldRules.itemType)) {
              errors.push({
                field: `${field}[${index}]`,
                message: `Array item must be of type ${fieldRules.itemType}`,
                value: item
              });
            }
          });
        }
      }

      // Object validation
      if (fieldRules.type === 'object' && typeof value === 'object' && fieldRules.required) {
        fieldRules.required.forEach(requiredField => {
          if (!value[requiredField]) {
            errors.push({
              field: `${field}.${requiredField}`,
              message: `Required nested field '${requiredField}' is missing`,
              value: value[requiredField]
            });
          }
        });
      }

      // Date format validation
      if (fieldRules.format === 'datetime' && typeof value === 'string') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({
            field,
            message: `Field '${field}' must be a valid datetime`,
            value
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate field type
   */
  validateFieldType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Process batch insert with duplicate checking
   */
  async processBatchInsert(data, dataType, batchSize, skipDuplicates) {
    const successful = [];
    const skipped = [];
    const errors = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const batchResult = await this.insertBatch(batch, dataType, skipDuplicates);
        
        successful.push(...batchResult.successful);
        skipped.push(...batchResult.skipped);
        errors.push(...batchResult.errors);

        // Small delay between batches
        if (i + batchSize < data.length) {
          await this.delay(100);
        }

      } catch (error) {
        logger.error(`Batch insert failed for batch ${Math.floor(i / batchSize) + 1}:`, error);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message,
          records: batch.length
        });
      }
    }

    return { successful, skipped, errors };
  }

  /**
   * Insert single batch of records
   */
  async insertBatch(batch, dataType, skipDuplicates) {
    const tableName = this.getTableName(dataType);
    const successful = [];
    const skipped = [];
    const errors = [];

    // Check for duplicates if skip is enabled
    if (skipDuplicates) {
      const processedBatch = [];
      
      for (const record of batch) {
        const exists = await this.checkRecordExists(record, dataType);
        if (exists) {
          skipped.push({ record, reason: 'duplicate' });
        } else {
          processedBatch.push(record);
        }
      }
      
      batch = processedBatch;
    }

    if (batch.length === 0) {
      return { successful, skipped, errors };
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch.map(record => this.transformRecordForInsert(record, dataType)))
        .select();

      if (error) {
        errors.push({
          message: error.message,
          details: error.details,
          batch: batch
        });
      } else {
        successful.push(...(data || batch));
      }

    } catch (error) {
      errors.push({
        message: error.message,
        batch: batch
      });
    }

    return { successful, skipped, errors };
  }

  /**
   * Check if record already exists
   */
  async checkRecordExists(record, dataType) {
    const tableName = this.getTableName(dataType);
    const idField = this.getIdField(dataType);
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq(idField, record[idField])
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      logger.warn('Error checking record existence:', error);
      return false;
    }
  }

  /**
   * Transform record for database insertion
   */
  transformRecordForInsert(record, dataType) {
    switch (dataType) {
      case 'card':
        return {
          card_id: record.id,
          card_data: record,
          cache_key: `import_${record.id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
      
      case 'pokemon':
        return {
          pokemon_id: record.id,
          pokemon_data: record,
          cache_key: `import_${record.id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      
      case 'price':
        return {
          ...record,
          collected_at: record.collected_at || new Date().toISOString()
        };
      
      default:
        return record;
    }
  }

  /**
   * Export data in various formats
   */
  async exportData(dataType, options = {}) {
    const {
      format = 'json',
      filters = {},
      limit = 10000,
      includeMetadata = true,
      compression = false
    } = options;

    if (!this.exportFormats.includes(format)) {
      throw new Error(`Unsupported export format: ${format}`);
    }

    try {
      logger.info(`Starting data export`, { dataType, format, limit });

      // Fetch data based on type
      const data = await this.fetchDataForExport(dataType, filters, limit);

      // Generate export based on format
      const exportData = await this.generateExport(data, format, includeMetadata);

      // Apply compression if requested
      if (compression && format !== 'csv') {
        exportData.compressed = true;
        exportData.data = this.compressData(exportData.data);
      }

      logger.info(`Data export completed`, { 
        dataType, 
        format, 
        recordCount: data.length 
      });

      return {
        success: true,
        format,
        recordCount: data.length,
        exportedAt: new Date().toISOString(),
        ...exportData
      };

    } catch (error) {
      logger.error('Data export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Fetch data for export based on type and filters
   */
  async fetchDataForExport(dataType, filters, limit) {
    const tableName = this.getTableName(dataType);
    
    let queryBuilder = supabase
      .from(tableName)
      .select('*')
      .limit(limit);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          queryBuilder = queryBuilder.in(key, value);
        } else {
          queryBuilder = queryBuilder.eq(key, value);
        }
      }
    });

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch export data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Generate export in specified format
   */
  async generateExport(data, format, includeMetadata) {
    switch (format) {
      case 'json':
        return {
          data: includeMetadata ? {
            metadata: {
              exportedAt: new Date().toISOString(),
              recordCount: data.length,
              version: '1.0'
            },
            records: data
          } : data,
          mimeType: 'application/json',
          filename: `export_${Date.now()}.json`
        };

      case 'csv':
        return {
          data: this.convertToCSV(data),
          mimeType: 'text/csv',
          filename: `export_${Date.now()}.csv`
        };

      case 'xlsx':
        return {
          data: await this.convertToXLSX(data, includeMetadata),
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: `export_${Date.now()}.xlsx`
        };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data.length) return '';

    // Get all unique keys
    const allKeys = new Set();
    data.forEach(record => {
      Object.keys(record).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    
    // Create CSV content
    const csvRows = [headers.join(',')];
    
    data.forEach(record => {
      const row = headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        
        // Handle complex objects
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        
        // Escape quotes in strings
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
      
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Convert data to XLSX format (simplified)
   */
  async convertToXLSX(data, includeMetadata) {
    // This would typically use a library like xlsx or exceljs
    // For now, return a JSON representation that could be converted
    return {
      worksheets: [
        {
          name: 'Data',
          data: data
        },
        ...(includeMetadata ? [{
          name: 'Metadata',
          data: [{
            exportedAt: new Date().toISOString(),
            recordCount: data.length,
            version: '1.0'
          }]
        }] : [])
      ]
    };
  }

  /**
   * Compress data (simplified base64 encoding)
   */
  compressData(data) {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return Buffer.from(jsonString).toString('base64');
    } catch (error) {
      logger.warn('Data compression failed, returning uncompressed:', error);
      return data;
    }
  }

  /**
   * Generate comprehensive analytics dashboard data
   */
  async generateAnalyticsDashboard() {
    try {
      logger.info('Generating analytics dashboard data');

      const [
        userAnalytics,
        searchAnalytics,
        priceAnalytics,
        systemMetrics
      ] = await Promise.all([
        analyticsEngine.getUserBehaviorAnalytics(30),
        analyticsEngine.getSearchAnalytics(30),
        this.getPriceAnalytics(),
        this.getSystemMetrics()
      ]);

      const dashboard = {
        overview: {
          totalUsers: userAnalytics?.overview?.uniqueUsers || 0,
          totalSessions: userAnalytics?.overview?.uniqueSessions || 0,
          totalSearches: searchAnalytics?.overview?.totalSearches || 0,
          totalCards: systemMetrics.cardCount,
          totalPokemon: systemMetrics.pokemonCount
        },
        charts: {
          userActivity: this.prepareUserActivityChart(userAnalytics),
          searchTrends: this.prepareSearchTrendsChart(searchAnalytics),
          priceVolatility: this.preparePriceVolatilityChart(priceAnalytics),
          popularCards: userAnalytics?.popularCards?.slice(0, 10) || []
        },
        metrics: {
          performance: systemMetrics.performance,
          cacheHitRate: systemMetrics.cacheHitRate,
          averageResponseTime: systemMetrics.averageResponseTime,
          errorRate: systemMetrics.errorRate
        },
        insights: this.generateDashboardInsights(userAnalytics, searchAnalytics, priceAnalytics),
        generatedAt: new Date().toISOString()
      };

      logger.info('Analytics dashboard generated successfully');
      return dashboard;

    } catch (error) {
      logger.error('Failed to generate analytics dashboard:', error);
      throw new Error(`Dashboard generation failed: ${error.message}`);
    }
  }

  /**
   * Get price analytics data
   */
  async getPriceAnalytics() {
    try {
      const priceCollector = new EnhancedPriceCollector();
      return await priceCollector.generateMarketTrendAnalysis(30);
    } catch (error) {
      logger.warn('Error getting price analytics:', error);
      return null;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    try {
      const [cardCount, pokemonCount, performanceMetrics] = await Promise.all([
        this.getTableCount('card_cache'),
        this.getTableCount('pokemon_cache'),
        databaseOptimizer.getPerformanceMetrics()
      ]);

      return {
        cardCount: cardCount || 0,
        pokemonCount: pokemonCount || 0,
        performance: performanceMetrics.metrics || {},
        cacheHitRate: performanceMetrics.cacheStats?.hitRate || 0,
        averageResponseTime: 150, // Would be calculated from real metrics
        errorRate: 0.02 // Would be calculated from real metrics
      };
    } catch (error) {
      logger.warn('Error getting system metrics:', error);
      return {
        cardCount: 0,
        pokemonCount: 0,
        performance: {},
        cacheHitRate: 0,
        averageResponseTime: 0,
        errorRate: 0
      };
    }
  }

  /**
   * Get table count
   */
  async getTableCount(tableName) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      return error ? 0 : count;
    } catch (error) {
      logger.warn(`Error getting count for table ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Prepare chart data for user activity
   */
  prepareUserActivityChart(userAnalytics) {
    if (!userAnalytics?.hourlyDistribution) return [];

    return Object.entries(userAnalytics.hourlyDistribution)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count: count || 0
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Prepare chart data for search trends
   */
  prepareSearchTrendsChart(searchAnalytics) {
    if (!searchAnalytics?.trends?.byDay) return [];

    return Object.entries(searchAnalytics.trends.byDay)
      .map(([date, count]) => ({
        date,
        searches: count || 0
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Prepare chart data for price volatility
   */
  preparePriceVolatilityChart(priceAnalytics) {
    if (!priceAnalytics?.marketOverview?.mostVolatile) return [];

    return priceAnalytics.marketOverview.mostVolatile
      .slice(0, 10)
      .map(card => ({
        cardName: card.cardName,
        volatility: card.volatility || 0,
        priceChange: card.priceChangePercent || 0
      }));
  }

  /**
   * Generate dashboard insights
   */
  generateDashboardInsights(userAnalytics, searchAnalytics, priceAnalytics) {
    const insights = [];

    // User engagement insights
    if (userAnalytics?.overview?.averageEventsPerSession > 10) {
      insights.push({
        type: 'engagement',
        level: 'positive',
        message: 'High user engagement detected',
        details: `Users perform an average of ${userAnalytics.overview.averageEventsPerSession.toFixed(1)} actions per session`
      });
    }

    // Search insights
    if (searchAnalytics?.queryAnalysis?.emptyResults?.length > 0) {
      insights.push({
        type: 'search',
        level: 'warning',
        message: 'Some searches return no results',
        details: `${searchAnalytics.queryAnalysis.emptyResults.length} search queries yielded no results`
      });
    }

    // Price insights
    if (priceAnalytics?.marketOverview?.trendDistribution?.bullish > 
        priceAnalytics?.marketOverview?.trendDistribution?.bearish * 2) {
      insights.push({
        type: 'market',
        level: 'positive',
        message: 'Bullish market sentiment detected',
        details: 'More cards showing upward price trends than downward'
      });
    }

    return insights;
  }

  /**
   * Utility methods
   */
  getTableName(dataType) {
    const tableMap = {
      'card': 'card_cache',
      'pokemon': 'pokemon_cache',
      'price': 'card_price_history'
    };
    
    return tableMap[dataType] || dataType;
  }

  getIdField(dataType) {
    const idMap = {
      'card': 'card_id',
      'pokemon': 'pokemon_id',
      'price': 'card_id'
    };
    
    return idMap[dataType] || 'id';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
const dataTools = new DataTools();

export default dataTools;