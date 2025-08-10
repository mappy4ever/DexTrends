/**
 * Comprehensive Data Tools
 * Provides data import, validation, export, and analytics dashboard utilities
 */

import { supabase } from '../lib/supabase';
import logger from './logger';
import analyticsEngine from './analyticsEngine';
import databaseOptimizer from './databaseOptimizer';
import EnhancedPriceCollector from './enhancedPriceCollector';

// Types
interface ValidationRule {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
  minItems?: number;
  maxItems?: number;
  itemType?: string;
  required?: string[];
  format?: 'datetime';
}

interface ValidationRules {
  required: string[];
  fields: Record<string, ValidationRule>;
}

interface ValidationError {
  field: string;
  message: string;
  value: unknown;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ImportOptions {
  dataType?: 'card' | 'pokemon' | 'price';
  batchSize?: number;
  validateData?: boolean;
  skipDuplicates?: boolean;
  dryRun?: boolean;
}

interface ImportResult {
  importId: string;
  source: string;
  dataType: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  insertedRecords: number;
  skippedRecords: number;
  errors: ValidationErrorDetail[];
  warnings: ValidationWarning[];
  startTime: string;
  endTime: string | null;
}

interface ExportOptions {
  format?: 'json' | 'csv' | 'xlsx';
  filters?: Record<string, string | number | boolean | string[]>;
  limit?: number;
  includeMetadata?: boolean;
  compression?: boolean;
}

interface ExportResult {
  success: boolean;
  format: string;
  recordCount: number;
  exportedAt: string;
  data?: unknown;
  mimeType?: string;
  filename?: string;
  compressed?: boolean;
}

// Additional type definitions for comprehensive typing
interface DatabaseRecord {
  id: string;
  [key: string]: unknown;
}

interface CardRecord extends DatabaseRecord {
  name: string;
  set: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  rarity?: string;
  hp?: number;
  types?: string[];
  artist?: string;
  [key: string]: unknown;
}

interface PokemonRecord extends DatabaseRecord {
  name: string;
  nationalPokedexNumber?: number;
  types: string[];
  height?: string;
  weight?: string;
  [key: string]: unknown;
}

interface PriceRecord extends DatabaseRecord {
  card_id: string;
  variant_type: 'normal' | 'holofoil' | 'reverseHolofoil' | 'unlimited' | 'firstEdition';
  price_market?: number;
  price_low?: number;
  price_high?: number;
  collected_at: string;
  [key: string]: unknown;
}

interface ImportQueueItem {
  importId: string;
  source: string;
  dataType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  createdAt: string;
  updatedAt: string;
}

interface ValidationErrorDetail {
  recordIndex: number;
  field: string;
  message: string;
  value: unknown;
}

interface ValidationWarning {
  recordIndex: number;
  field: string;
  message: string;
  value: unknown;
}

interface InvalidRecord {
  index: number;
  record: DatabaseRecord;
  errors: ValidationError[];
}

interface BatchInsertResult<T extends DatabaseRecord> {
  successful: T[];
  skipped: Array<{ record: T; reason: string }>;
  errors: Array<{
    message: string;
    details?: string;
    batch?: T[];
  }>;
}

interface CardStatistics {
  cardId: string;
  cardName: string;
  viewCount: number;
  searchCount: number;
  popularity: number;
  [key: string]: unknown;
}

interface PerformanceMetrics {
  queryCount: number;
  averageQueryTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: string;
  }>;
  memoryUsage: number;
  cpuUsage: number;
  [key: string]: unknown;
}

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  hitCount: number;
  missCount: number;
}

interface SystemMetrics {
  cardCount: number;
  pokemonCount: number;
  performance: PerformanceMetrics;
  cacheHitRate: number;
  averageResponseTime: number;
  errorRate: number;
}

interface UserAnalytics {
  overview: {
    uniqueUsers: number;
    uniqueSessions: number;
    averageEventsPerSession: number;
    [key: string]: unknown;
  };
  hourlyDistribution: Record<string, number>;
  popularCards: CardStatistics[];
  [key: string]: unknown;
}

interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueQueries: number;
    [key: string]: unknown;
  };
  trends: {
    byDay: Record<string, number>;
    [key: string]: unknown;
  };
  queryAnalysis: {
    emptyResults: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface PriceAnalytics {
  marketOverview: {
    mostVolatile: Array<{
      cardName: string;
      volatility: number;
      priceChangePercent: number;
      [key: string]: unknown;
    }>;
    trendDistribution: {
      bullish: number;
      bearish: number;
      neutral: number;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ChartData {
  userActivity: Array<{ hour: number; count: number }>;
  searchTrends: Array<{ date: string; searches: number }>;
  priceVolatility: Array<{ cardName: string; volatility: number; priceChange: number }>;
  popularCards: CardStatistics[];
}

interface DashboardInsight {
  type: string;
  level: string;
  message: string;
  details: string;
}

interface ExportData {
  data: unknown;
  mimeType: string;
  filename: string;
  compressed?: boolean;
}

// Discriminated union for data types
type DataTypeRecord = CardRecord | PokemonRecord | PriceRecord;

// Local interface definitions to match external analytics engines
interface LocalUserBehaviorAnalytics {
  overview: {
    totalEvents: number;
    uniqueSessions: number;
    uniqueUsers: number;
    averageEventsPerSession: number;
  };
  hourlyDistribution: Record<number, number>;
  popularCards: Array<[string, number]>;
  [key: string]: unknown;
}

interface LocalSearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueQueries: number;
  };
  trends: {
    byDay: Record<string, number>;
  };
  queryAnalysis: {
    emptyResults: string[];
  };
  [key: string]: unknown;
}

interface LocalTrendAnalysis {
  marketOverview: {
    mostVolatile: Array<{
      cardName: string;
      volatility: number;
      priceChangePercent: number;
    }>;
    trendDistribution: {
      bullish: number;
      bearish: number;
      neutral: number;
    };
  };
  [key: string]: unknown;
}

interface DashboardData {
  overview: {
    totalUsers: number;
    totalSessions: number;
    totalSearches: number;
    totalCards: number;
    totalPokemon: number;
  };
  charts: ChartData;
  metrics: {
    performance: PerformanceMetrics;
    cacheHitRate: number;
    averageResponseTime: number;
    errorRate: number;
  };
  insights: DashboardInsight[];
  generatedAt: string;
}

class DataTools {
  private importQueue: ImportQueueItem[];
  private validationRules: Map<string, ValidationRules>;
  private exportFormats: string[];
  private isProcessing: boolean;

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
  setupValidationRules(): void {
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
  async importData(source: string, data: DataTypeRecord[], options: ImportOptions = {}): Promise<ImportResult> {
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

      const importResult: ImportResult = {
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
      // Convert batch errors to validation error details
      insertResults.errors.forEach((error, index) => {
        importResult.errors.push({
          recordIndex: index,
          field: 'batch_operation',
          message: error.message,
          value: undefined
        });
      });

      importResult.endTime = new Date().toISOString();

      // Log import summary
      logger.info(`Data import completed: ${importId}`, {
        totalRecords: importResult.totalRecords,
        insertedRecords: importResult.insertedRecords,
        errorCount: importResult.errors.length
      });

      return importResult;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      logger.error(`Data import failed: ${importId}`, { error: this.formatErrorForLogging(error) });
      throw new Error(`Import failed: ${errorMessage}`);
    }
  }

  /**
   * Validate bulk data against rules
   */
  validateBulkData(data: DataTypeRecord[], dataType: string): {
    validRecords: DataTypeRecord[];
    invalidRecords: InvalidRecord[];
    errors: ValidationErrorDetail[];
    warnings: ValidationWarning[];
  } {
    const rules = this.validationRules.get(dataType);
    if (!rules) {
      throw new Error(`No validation rules found for data type: ${dataType}`);
    }

    const validRecords: DataTypeRecord[] = [];
    const invalidRecords: InvalidRecord[] = [];
    const errors: ValidationErrorDetail[] = [];
    const warnings: ValidationWarning[] = [];

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

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
        invalidRecords.push({
          index,
          record,
          errors: [{ field: 'general', message: errorMessage, value: undefined }]
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
  validateRecord(record: DataTypeRecord, rules: ValidationRules): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const recordData = record as Record<string, unknown>;

    // Check required fields
    rules.required.forEach(field => {
      if (!recordData[field] && recordData[field] !== 0 && recordData[field] !== false) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`,
          value: recordData[field]
        });
      }
    });

    // Validate field types and constraints
    Object.entries(rules.fields).forEach(([field, fieldRules]) => {
      const value = recordData[field];
      
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
      if (fieldRules.min !== undefined && typeof value === 'number' && value < fieldRules.min) {
        errors.push({
          field,
          message: `Field '${field}' must be at least ${fieldRules.min}`,
          value
        });
      }

      if (fieldRules.max !== undefined && typeof value === 'number' && value > fieldRules.max) {
        errors.push({
          field,
          message: `Field '${field}' must be no more than ${fieldRules.max}`,
          value
        });
      }

      // Enum validation
      if (fieldRules.enum && typeof value === 'string' && !fieldRules.enum.includes(value)) {
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
            if (!this.validateFieldType(item, fieldRules.itemType!)) {
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
      if (fieldRules.type === 'object' && typeof value === 'object' && value !== null && fieldRules.required) {
        const objectValue = value as Record<string, unknown>;
        fieldRules.required.forEach(requiredField => {
          if (!objectValue[requiredField]) {
            errors.push({
              field: `${field}.${requiredField}`,
              message: `Required nested field '${requiredField}' is missing`,
              value: objectValue[requiredField]
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
  validateFieldType(value: unknown, expectedType: string): boolean {
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
  async processBatchInsert(
    data: DataTypeRecord[], 
    dataType: string, 
    batchSize: number, 
    skipDuplicates: boolean
  ): Promise<{ successful: DataTypeRecord[]; skipped: Array<{ record: DataTypeRecord; reason: string }>; errors: ValidationErrorDetail[] }> {
    const successful: DataTypeRecord[] = [];
    const skipped: Array<{ record: DataTypeRecord; reason: string }> = [];
    const errors: ValidationErrorDetail[] = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        const batchResult = await this.insertBatch(batch, dataType, skipDuplicates);
        
        successful.push(...batchResult.successful);
        skipped.push(...batchResult.skipped);
        // Convert batch insert errors to validation error details
        batchResult.errors.forEach((error, index) => {
          const baseIndex = Math.floor(i / batchSize) * batchSize;
          errors.push({
            recordIndex: baseIndex + index,
            field: 'batch_insert',
            message: error.message,
            value: undefined
          });
        });

        // Small delay between batches
        if (i + batchSize < data.length) {
          await this.delay(100);
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown batch insert error';
        logger.error(`Batch insert failed for batch ${Math.floor(i / batchSize) + 1}:`, { error: this.formatErrorForLogging(error) });
        errors.push({
          recordIndex: Math.floor(i / batchSize),
          field: 'batch_processing',
          message: `Batch ${Math.floor(i / batchSize) + 1}: ${errorMessage}`,
          value: undefined
        });
      }
    }

    return { successful, skipped, errors };
  }

  /**
   * Insert single batch of records
   */
  async insertBatch(
    batch: DataTypeRecord[], 
    dataType: string, 
    skipDuplicates: boolean
  ): Promise<{ successful: DataTypeRecord[]; skipped: Array<{ record: DataTypeRecord; reason: string }>; errors: ValidationErrorDetail[] }> {
    const tableName = this.getTableName(dataType);
    const successful: DataTypeRecord[] = [];
    const skipped: Array<{ record: DataTypeRecord; reason: string }> = [];
    const errors: ValidationErrorDetail[] = [];

    // Check for duplicates if skip is enabled
    if (skipDuplicates) {
      const processedBatch: DataTypeRecord[] = [];
      
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
          recordIndex: 0,
          field: 'database_insert',
          message: error.message,
          value: undefined
        });
      } else {
        successful.push(...(data || batch));
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown insert error';
      errors.push({
        recordIndex: 0,
        field: 'insert_exception',
        message: errorMessage,
        value: undefined
      });
    }

    return { successful, skipped, errors };
  }

  /**
   * Check if record already exists
   */
  async checkRecordExists(record: DataTypeRecord, dataType: string): Promise<boolean> {
    const tableName = this.getTableName(dataType);
    const idField = this.getIdField(dataType);
    
    try {
      const recordValue = (record as Record<string, unknown>)[idField];
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .eq(idField, recordValue)
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
  transformRecordForInsert(record: DataTypeRecord, dataType: string): Record<string, unknown> {
    const recordData = record as Record<string, unknown>;
    
    switch (dataType) {
      case 'card':
        return {
          card_id: recordData.id,
          card_data: record,
          cache_key: `import_${recordData.id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
      
      case 'pokemon':
        return {
          pokemon_id: recordData.id,
          pokemon_data: record,
          cache_key: `import_${recordData.id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      
      case 'price':
        return {
          ...recordData,
          collected_at: recordData.collected_at || new Date().toISOString()
        };
      
      default:
        return recordData;
    }
  }

  /**
   * Export data in various formats
   */
  async exportData(dataType: string, options: ExportOptions = {}): Promise<ExportResult> {
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

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown export error';
      logger.error('Data export failed:', { error: this.formatErrorForLogging(error) });
      throw new Error(`Export failed: ${errorMessage}`);
    }
  }

  /**
   * Fetch data for export based on type and filters
   */
  async fetchDataForExport(dataType: string, filters: Record<string, string | number | boolean | string[]>, limit: number): Promise<Record<string, unknown>[]> {
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
  async generateExport(data: Record<string, unknown>[], format: string, includeMetadata: boolean): Promise<ExportData> {
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
  convertToCSV(data: Record<string, unknown>[]): string {
    if (!data.length) return '';

    // Get all unique keys
    const allKeys = new Set<string>();
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
  async convertToXLSX(data: Record<string, unknown>[], includeMetadata: boolean): Promise<{ worksheets: Array<{ name: string; data: Record<string, unknown>[] }> }> {
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
  compressData(data: unknown): string {
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
      return Buffer.from(jsonString).toString('base64');
    } catch (error) {
      logger.warn('Data compression failed, returning uncompressed:', error);
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  /**
   * Generate comprehensive analytics dashboard data
   */
  async generateAnalyticsDashboard(): Promise<DashboardData> {
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

      const dashboard: DashboardData = {
        overview: {
          totalUsers: userAnalytics?.overview?.uniqueUsers || 0,
          totalSessions: userAnalytics?.overview?.uniqueSessions || 0,
          totalSearches: searchAnalytics?.overview?.totalSearches || 0,
          totalCards: systemMetrics.cardCount,
          totalPokemon: systemMetrics.pokemonCount
        },
        charts: {
          userActivity: this.prepareUserActivityChart(userAnalytics as LocalUserBehaviorAnalytics | null),
          searchTrends: this.prepareSearchTrendsChart(searchAnalytics as LocalSearchAnalytics | null),
          priceVolatility: this.preparePriceVolatilityChart(priceAnalytics as LocalTrendAnalysis | null),
          popularCards: this.transformPopularCards((userAnalytics as unknown as LocalUserBehaviorAnalytics)?.popularCards || [])
        },
        metrics: {
          performance: this.normalizePerformanceMetrics(systemMetrics.performance),
          cacheHitRate: systemMetrics.cacheHitRate,
          averageResponseTime: systemMetrics.averageResponseTime,
          errorRate: systemMetrics.errorRate
        },
        insights: this.generateDashboardInsights(userAnalytics as LocalUserBehaviorAnalytics | null, searchAnalytics as LocalSearchAnalytics | null, priceAnalytics as LocalTrendAnalysis | null),
        generatedAt: new Date().toISOString()
      };

      logger.info('Analytics dashboard generated successfully');
      return dashboard;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown dashboard error';
      logger.error('Failed to generate analytics dashboard:', { error: this.formatErrorForLogging(error) });
      throw new Error(`Dashboard generation failed: ${errorMessage}`);
    }
  }

  /**
   * Get price analytics data
   */
  async getPriceAnalytics(): Promise<LocalTrendAnalysis | null> {
    try {
      const priceCollector = new EnhancedPriceCollector();
      const result = await priceCollector.generateMarketTrendAnalysis(30);
      return result as unknown as LocalTrendAnalysis;
    } catch (error) {
      logger.warn('Error getting price analytics:', error);
      return null;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [cardCount, pokemonCount, performanceMetrics] = await Promise.all([
        this.getTableCount('card_cache'),
        this.getTableCount('pokemon_cache'),
        databaseOptimizer.getPerformanceMetrics()
      ]);

      return {
        cardCount: cardCount || 0,
        pokemonCount: pokemonCount || 0,
        performance: this.normalizePerformanceMetrics(performanceMetrics?.metrics || {}),
        cacheHitRate: performanceMetrics?.cacheStats?.hitRate || 0,
        averageResponseTime: 150, // Would be calculated from real metrics
        errorRate: 0.02 // Would be calculated from real metrics
      };
    } catch (error) {
      logger.warn('Error getting system metrics:', error);
      return {
        cardCount: 0,
        pokemonCount: 0,
        performance: this.getDefaultPerformanceMetrics(),
        cacheHitRate: 0,
        averageResponseTime: 0,
        errorRate: 0
      };
    }
  }

  /**
   * Get table count
   */
  async getTableCount(tableName: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      return error ? 0 : count || 0;
    } catch (error) {
      logger.warn(`Error getting count for table ${tableName}:`, error);
      return 0;
    }
  }

  /**
   * Prepare chart data for user activity
   */
  prepareUserActivityChart(userAnalytics: LocalUserBehaviorAnalytics | null): Array<{ hour: number; count: number }> {
    if (!userAnalytics?.hourlyDistribution) return [];

    return Object.entries(userAnalytics.hourlyDistribution)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count: typeof count === 'number' ? count : 0
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Prepare chart data for search trends
   */
  prepareSearchTrendsChart(searchAnalytics: LocalSearchAnalytics | null): Array<{ date: string; searches: number }> {
    if (!searchAnalytics?.trends?.byDay) return [];

    return Object.entries(searchAnalytics.trends.byDay)
      .map(([date, count]) => ({
        date,
        searches: typeof count === 'number' ? count : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Prepare chart data for price volatility
   */
  preparePriceVolatilityChart(priceAnalytics: LocalTrendAnalysis | null): Array<{ cardName: string; volatility: number; priceChange: number }> {
    if (!priceAnalytics?.marketOverview?.mostVolatile) return [];

    return priceAnalytics.marketOverview.mostVolatile
      .slice(0, 10)
      .map((card: { cardName: string; volatility: number; priceChangePercent: number }) => ({
        cardName: card.cardName || 'Unknown',
        volatility: card.volatility || 0,
        priceChange: card.priceChangePercent || 0
      }));
  }

  /**
   * Generate dashboard insights
   */
  generateDashboardInsights(userAnalytics: LocalUserBehaviorAnalytics | null, searchAnalytics: LocalSearchAnalytics | null, priceAnalytics: LocalTrendAnalysis | null): DashboardInsight[] {
    const insights: DashboardInsight[] = [];

    // User engagement insights
    if (userAnalytics?.overview?.averageEventsPerSession && userAnalytics.overview.averageEventsPerSession > 10) {
      insights.push({
        type: 'engagement',
        level: 'positive',
        message: 'High user engagement detected',
        details: `Users perform an average of ${userAnalytics.overview.averageEventsPerSession.toFixed(1)} actions per session`
      });
    }

    // Search insights
    if (searchAnalytics?.queryAnalysis?.emptyResults && searchAnalytics.queryAnalysis.emptyResults.length > 0) {
      insights.push({
        type: 'search',
        level: 'warning',
        message: 'Some searches return no results',
        details: `${searchAnalytics.queryAnalysis.emptyResults.length} search queries yielded no results`
      });
    }

    // Price insights
    if (priceAnalytics?.marketOverview?.trendDistribution?.bullish && 
        priceAnalytics?.marketOverview?.trendDistribution?.bearish &&
        priceAnalytics.marketOverview.trendDistribution.bullish > 
        priceAnalytics.marketOverview.trendDistribution.bearish * 2) {
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
  getTableName(dataType: string): string {
    const tableMap: Record<string, string> = {
      'card': 'card_cache',
      'pokemon': 'pokemon_cache',
      'price': 'card_price_history'
    };
    
    return tableMap[dataType] || dataType;
  }

  getIdField(dataType: string): string {
    const idMap: Record<string, string> = {
      'card': 'card_id',
      'pokemon': 'pokemon_id',
      'price': 'card_id'
    };
    
    return idMap[dataType] || 'id';
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatErrorForLogging(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  private transformPopularCards(popularCards: Array<[string, number]>): CardStatistics[] {
    return popularCards.slice(0, 10).map(([cardName, count], index) => ({
      cardId: `card-${index}`,
      cardName,
      viewCount: count,
      searchCount: count,
      popularity: count
    }));
  }

  private normalizePerformanceMetrics(metrics: Record<string, unknown>): PerformanceMetrics {
    return {
      queryCount: (metrics.queryCount as number) || 0,
      averageQueryTime: (metrics.averageQueryTime as number) || 0,
      slowQueries: (metrics.slowQueries as Array<{ query: string; duration: number; timestamp: string }>) || [],
      memoryUsage: (metrics.memoryUsage as number) || 0,
      cpuUsage: (metrics.cpuUsage as number) || 0
    };
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      queryCount: 0,
      averageQueryTime: 0,
      slowQueries: [],
      memoryUsage: 0,
      cpuUsage: 0
    };
  }
}

// Create global instance
const dataTools = new DataTools();

export default dataTools;