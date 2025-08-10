// Type guards for Supabase API data validation
import type {
  UserFavorite,
  SessionFavorite,
  PokemonCache,
  CardCache,
  CardPriceHistory,
  PriceAlert,
  UserCollection,
  SessionCollection,
  UserWatchlist,
  PortfolioSnapshot,
  CardTransaction,
  TypeEffectivenessRecord,
  CompetitiveTierRecord,
  PokemonLearnsetRecord,
  MoveCompetitiveDataRecord,
  AbilityRatingRecord,
  PriceCollectionJob
} from '../types/database';

// ============== Basic Type Guards ==============

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// ============== Database Record Type Guards ==============

export function hasRequiredId(obj: unknown): obj is { id: string } {
  return isObject(obj) && isString(obj.id) && obj.id.length > 0;
}

export function hasTimestamps(obj: unknown): obj is { created_at: string; updated_at?: string } {
  return isObject(obj) && isString(obj.created_at);
}

export function isItemType(value: unknown): value is 'pokemon' | 'card' | 'deck' {
  return value === 'pokemon' || value === 'card' || value === 'deck';
}

// ============== Specific Type Guards ==============

export function isUserFavorite(obj: unknown): obj is UserFavorite {
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString((obj as any).user_id) &&
    isItemType((obj as any).item_type) &&
    isString((obj as any).item_id) &&
    isObject((obj as any).item_data) &&
    isString((obj as any).created_at)
  );
}

export function isSessionFavorite(obj: unknown): obj is SessionFavorite {
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString((obj as any).session_id) &&
    isItemType((obj as any).item_type) &&
    isString((obj as any).item_id) &&
    isObject((obj as any).item_data) &&
    isString((obj as any).created_at) &&
    isString((obj as any).expires_at)
  );
}

export function isPokemonCache(obj: unknown): obj is PokemonCache {
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString((obj as any).pokemon_id) &&
    isObject((obj as any).pokemon_data) &&
    isString((obj as any).cache_key) &&
    isString((obj as any).expires_at) &&
    hasTimestamps(obj)
  );
}

export function isCardCache(obj: unknown): obj is CardCache {
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString((obj as any).card_id) &&
    isObject((obj as any).card_data) &&
    isString((obj as any).cache_key) &&
    isString((obj as any).expires_at) &&
    hasTimestamps(obj)
  );
}

export function isCardPriceHistory(obj: unknown): obj is CardPriceHistory {
  const item = obj as any;
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString(item.card_id) &&
    isString(item.card_name) &&
    isString(item.collected_at) &&
    isString(item.source) &&
    isString(item.created_at) &&
    (item.price_market === undefined || isNumber(item.price_market)) &&
    (item.set_name === undefined || isString(item.set_name))
  );
}

export function isJobStatus(value: unknown): value is 'pending' | 'running' | 'completed' | 'failed' {
  return value === 'pending' || value === 'running' || value === 'completed' || value === 'failed';
}

export function isJobType(value: unknown): value is 'daily' | 'weekly' | 'manual' | 'backfill' {
  return value === 'daily' || value === 'weekly' || value === 'manual' || value === 'backfill';
}

export function isPriceCollectionJob(obj: unknown): obj is PriceCollectionJob {
  const item = obj as any;
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isJobType(item.job_type) &&
    isJobStatus(item.status) &&
    isNumber(item.cards_processed) &&
    isNumber(item.cards_updated) &&
    isNumber(item.cards_failed) &&
    isString(item.created_at)
  );
}

export function isAlertType(value: unknown): value is 'price_drop' | 'price_increase' | 'target_price' {
  return value === 'price_drop' || value === 'price_increase' || value === 'target_price';
}

export function isPriceAlert(obj: unknown): obj is PriceAlert {
  const item = obj as any;
  return (
    hasRequiredId(obj) &&
    isObject(obj) &&
    isString(item.user_id) &&
    isString(item.card_id) &&
    isString(item.card_name) &&
    isAlertType(item.alert_type) &&
    isBoolean(item.is_active) &&
    isNumber(item.times_triggered) &&
    hasTimestamps(obj)
  );
}

export function isLearnMethod(value: unknown): value is 'level-up' | 'machine' | 'tutor' | 'egg' | 'other' {
  return value === 'level-up' || value === 'machine' || value === 'tutor' || value === 'egg' || value === 'other';
}

export function isPokemonLearnsetRecord(obj: unknown): obj is PokemonLearnsetRecord {
  return (
    isObject(obj) &&
    isString(obj.pokemon_id) &&
    isString(obj.move_name) &&
    isNumber(obj.generation) &&
    isLearnMethod(obj.learn_method) &&
    (obj.level === null || isNumber(obj.level))
  );
}

export function isMoveCategory(value: unknown): value is 'physical' | 'special' | 'status' | null {
  return value === 'physical' || value === 'special' || value === 'status' || value === null;
}

export function isMoveCompetitiveDataRecord(obj: unknown): obj is MoveCompetitiveDataRecord {
  return (
    isObject(obj) &&
    isString(obj.move_name) &&
    (obj.base_power === null || isNumber(obj.base_power)) &&
    (obj.accuracy === null || isNumber(obj.accuracy)) &&
    isNumber(obj.priority) &&
    isMoveCategory(obj.category) &&
    isStringArray(obj.flags)
  );
}

export function isTypeEffectivenessRecord(obj: unknown): obj is TypeEffectivenessRecord {
  return (
    isObject(obj) &&
    isString(obj.attacking_type) &&
    isString(obj.defending_type) &&
    isNumber(obj.multiplier)
  );
}

export function isCompetitiveTierRecord(obj: unknown): obj is CompetitiveTierRecord {
  return (
    isObject(obj) &&
    isString(obj.pokemon_name) &&
    (obj.singles_tier === null || isString(obj.singles_tier)) &&
    (obj.doubles_tier === null || isString(obj.doubles_tier)) &&
    (obj.national_dex_tier === null || isString(obj.national_dex_tier))
  );
}

export function isAbilityRatingRecord(obj: unknown): obj is AbilityRatingRecord {
  return (
    isObject(obj) &&
    isNumber(obj.ability_id) &&
    isString(obj.name) &&
    (obj.rating === null || isNumber(obj.rating)) &&
    isObject(obj.flags)
  );
}

// ============== Supabase Response Validators ==============

export function validateSupabaseResponse<T>(
  response: { data: unknown; error: unknown },
  typeGuard: (value: unknown) => value is T
): { data: T | null; error: Error | null } {
  // Check for Supabase errors
  if (response.error) {
    return {
      data: null,
      error: new Error(
        typeof response.error === 'object' && response.error !== null && 'message' in response.error
          ? String(response.error.message)
          : 'Unknown Supabase error'
      )
    };
  }

  // Validate data type if present
  if (response.data !== null && response.data !== undefined) {
    if (typeGuard(response.data)) {
      return { data: response.data, error: null };
    } else {
      return {
        data: null,
        error: new Error('Response data does not match expected type')
      };
    }
  }

  // No data and no error - this is valid for some operations
  return { data: null, error: null };
}

export function validateSupabaseArrayResponse<T>(
  response: { data: unknown; error: unknown },
  itemTypeGuard: (value: unknown) => value is T
): { data: T[] | null; error: Error | null } {
  // Check for Supabase errors
  if (response.error) {
    return {
      data: null,
      error: new Error(
        typeof response.error === 'object' && response.error !== null && 'message' in response.error
          ? String(response.error.message)
          : 'Unknown Supabase error'
      )
    };
  }

  // Validate data is array if present
  if (response.data !== null && response.data !== undefined) {
    if (isArray(response.data, itemTypeGuard)) {
      return { data: response.data, error: null };
    } else {
      return {
        data: null,
        error: new Error('Response data is not a valid array of expected type')
      };
    }
  }

  // No data and no error - return empty array
  return { data: [], error: null };
}

// ============== Utility Functions ==============

/**
 * Safely extracts a string property from an unknown object
 */
export function safeGetString(obj: unknown, key: string, defaultValue: string = ''): string {
  if (isObject(obj) && key in obj && isString(obj[key])) {
    return obj[key];
  }
  return defaultValue;
}

/**
 * Safely extracts a number property from an unknown object
 */
export function safeGetNumber(obj: unknown, key: string, defaultValue: number = 0): number {
  if (isObject(obj) && key in obj && isNumber(obj[key])) {
    return obj[key];
  }
  return defaultValue;
}

/**
 * Safely extracts a boolean property from an unknown object
 */
export function safeGetBoolean(obj: unknown, key: string, defaultValue: boolean = false): boolean {
  if (isObject(obj) && key in obj && isBoolean(obj[key])) {
    return obj[key];
  }
  return defaultValue;
}

/**
 * Safely extracts an object property from an unknown object
 */
export function safeGetObject(obj: unknown, key: string, defaultValue: Record<string, unknown> = {}): Record<string, unknown> {
  if (isObject(obj) && key in obj && isObject(obj[key])) {
    return obj[key];
  }
  return defaultValue;
}