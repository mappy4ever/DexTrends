// Database schema types for Supabase
// Generated from schema files: supabase-schema.sql, supabase-price-history-schema.sql, supabase-collections-schema.sql

// ============== Core Database Types ==============

// User related types
export interface User {
  id: string;
  email?: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

// Favorites types
export type ItemType = 'pokemon' | 'card' | 'deck';

export interface UserFavorite {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  item_data: Record<string, unknown>;
  created_at: string;
}

export interface SessionFavorite {
  id: string;
  session_id: string;
  item_type: ItemType;
  item_id: string;
  item_data: Record<string, unknown>;
  created_at: string;
  expires_at: string;
}

// Cache types
export interface PokemonCache {
  id: string;
  pokemon_id: string;
  pokemon_data: Record<string, unknown>;
  cache_key: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CardCache {
  id: string;
  card_id: string;
  card_data: Record<string, unknown>;
  cache_key: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Deck types
export type DeckType = 'pocket' | 'tcg';

export interface UserDeck {
  id: string;
  user_id: string;
  deck_name: string;
  deck_data: Record<string, unknown>;
  deck_type: DeckType;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// ============== Price History Types ==============

export interface CardPriceHistory {
  id: string;
  card_id: string;
  card_name: string;
  set_name?: string;
  set_id?: string;
  variant_type?: string;
  price_low?: number;
  price_mid?: number;
  price_high?: number;
  price_market?: number;
  price_direct_low?: number;
  tcgplayer_url?: string;
  last_updated_at?: string;
  collected_at: string;
  source: string;
  raw_data?: Record<string, unknown>;
  created_at: string;
}

export interface SetPriceHistory {
  id: string;
  set_id: string;
  set_name: string;
  total_cards?: number;
  cards_with_prices?: number;
  average_card_price?: number;
  median_card_price?: number;
  total_set_value?: number;
  min_card_price?: number;
  max_card_price?: number;
  collected_at: string;
  created_at: string;
}

export type JobType = 'daily' | 'weekly' | 'manual' | 'backfill';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface PriceCollectionJob {
  id: string;
  job_type: JobType;
  status: JobStatus;
  cards_processed: number;
  cards_updated: number;
  cards_failed: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  error_details?: Record<string, unknown>;
  created_at: string;
}

export type AlertType = 'price_drop' | 'price_increase' | 'target_price';

export interface PriceAlert {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  alert_type: AlertType;
  target_price?: number;
  percentage_change?: number;
  is_active: boolean;
  last_triggered_at?: string;
  times_triggered: number;
  created_at: string;
  updated_at: string;
}

// ============== Collections Types ==============

export interface UserCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cards: CardInCollection[];
  settings: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionCollection {
  id: string;
  session_id: string;
  name: string;
  description?: string;
  cards: CardInCollection[];
  settings: Record<string, unknown>;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CardInCollection {
  id: string;
  name: string;
  set?: string;
  quantity?: number;
  condition?: string;
  variant?: string;
  added_at?: string;
  [key: string]: unknown;
}

export type WatchlistAlertType = 'price_drop' | 'price_rise' | 'percentage_change' | 'trend_reversal';

export interface UserWatchlist {
  id: string;
  user_id?: string;
  session_id?: string;
  card_id: string;
  card_name: string;
  set_name?: string;
  target_price?: number;
  alert_type?: WatchlistAlertType;
  percentage_threshold?: number;
  is_active: boolean;
  last_price?: number;
  last_checked: string;
  triggered_at?: string;
  created_at: string;
  expires_at?: string;
}

export interface PortfolioSnapshot {
  id: string;
  user_id?: string;
  session_id?: string;
  collection_id?: string;
  snapshot_date: string;
  total_value: number;
  total_cards: number;
  unique_cards: number;
  breakdown: Record<string, unknown>;
  created_at: string;
}

export type TransactionType = 'buy' | 'sell' | 'trade' | 'add' | 'remove';

export interface CardTransaction {
  id: string;
  user_id?: string;
  session_id?: string;
  collection_id?: string;
  card_id: string;
  card_name: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_card?: number;
  total_amount?: number;
  condition?: string;
  notes?: string;
  transaction_date: string;
}

// ============== Showdown Integration Types ==============

export interface TypeEffectivenessRecord {
  id?: number;
  attacking_type: string;
  defending_type: string;
  multiplier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CompetitiveTierRecord {
  id?: number;
  pokemon_name: string;
  singles_tier: string | null;
  doubles_tier: string | null;
  national_dex_tier: string | null;
  created_at?: string;
  updated_at?: string;
}

export type LearnMethod = 'level-up' | 'machine' | 'tutor' | 'egg' | 'other';

export interface PokemonLearnsetRecord {
  id?: number;
  pokemon_id: string;
  move_name: string;
  generation: number;
  learn_method: LearnMethod;
  level: number | null;
  created_at?: string;
}

export type MoveCategory = 'physical' | 'special' | 'status' | null;

export interface MoveCompetitiveDataRecord {
  id?: number;
  move_name: string;
  base_power: number | null;
  accuracy: number | null;
  priority: number;
  category: MoveCategory;
  type: string | null;
  target: string | null;
  flags: string[];
  secondary_effects: Record<string, unknown> | null;
  description: string | null;
  short_description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AbilityRatingRecord {
  id?: number;
  ability_id: number;
  name: string;
  rating: number | null;
  competitive_desc: string | null;
  flags: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface ItemShowdownRecord {
  id?: number;
  item_id: number;
  name: string;
  display_name: string;
  spritenum: number | null;
  sprite_url: string | null;
  generation: number | null;
  description: string | null;
  short_description: string | null;
  fling_power: number | null;
  is_choice: boolean;
  is_nonstandard: boolean;
  category: string | null;
  competitive_data: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

// ============== Function Return Types ==============

export interface CardPriceTrendResult {
  collected_date: string;
  price_market: number;
  price_low: number;
  price_high: number;
  day_change_percent: number;
}

export interface CardPriceStatsResult {
  current_price: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_volatility: number;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
}

export interface PortfolioValueResult {
  total_value: number;
  total_cards: number;
  unique_cards: number;
  breakdown: Record<string, unknown>;
}

// ============== Grouped Results ==============

export interface GroupedFavorites {
  pokemon: Array<Record<string, unknown>>;
  cards: Array<Record<string, unknown>>;
  decks: Array<Record<string, unknown>>;
}

// ============== Database Table Names ==============

export type TableNames = 
  | 'users'
  | 'user_favorites'
  | 'session_favorites' 
  | 'pokemon_cache'
  | 'card_cache'
  | 'user_decks'
  | 'card_price_history'
  | 'set_price_history'
  | 'price_collection_jobs'
  | 'price_alerts'
  | 'user_collections'
  | 'session_collections'
  | 'user_watchlists'
  | 'portfolio_snapshots'
  | 'card_transactions'
  | 'type_effectiveness'
  | 'competitive_tiers'
  | 'pokemon_learnsets'
  | 'move_competitive_data'
  | 'ability_ratings'
  | 'items_showdown';

// ============== Generic Database Row Types ==============

export interface DatabaseRow {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

export interface TimestampedRow extends DatabaseRow {
  updated_at: string;
}

// ============== API Response Types ==============

export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
}

export interface SupabaseMultiResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  count?: number;
}

// ============== Type Guards ==============

export function isSupabaseError(response: SupabaseResponse<unknown>): response is SupabaseResponse<null> & { error: NonNullable<SupabaseResponse<unknown>['error']> } {
  return response.error !== null;
}

export function hasSupabaseData<T>(response: SupabaseResponse<T>): response is SupabaseResponse<T> & { data: NonNullable<T> } {
  return response.data !== null && response.error === null;
}

// ============== Custom Database Schema Type ==============

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: Omit<UserFavorite, 'id' | 'created_at'>;
        Update: Partial<Omit<UserFavorite, 'id' | 'created_at'>>;
      };
      session_favorites: {
        Row: SessionFavorite;
        Insert: Omit<SessionFavorite, 'id' | 'created_at'>;
        Update: Partial<Omit<SessionFavorite, 'id' | 'created_at'>>;
      };
      pokemon_cache: {
        Row: PokemonCache;
        Insert: Omit<PokemonCache, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PokemonCache, 'id' | 'created_at'>>;
      };
      card_cache: {
        Row: CardCache;
        Insert: Omit<CardCache, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CardCache, 'id' | 'created_at'>>;
      };
      user_decks: {
        Row: UserDeck;
        Insert: Omit<UserDeck, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserDeck, 'id' | 'created_at'>>;
      };
      card_price_history: {
        Row: CardPriceHistory;
        Insert: Omit<CardPriceHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<CardPriceHistory, 'id' | 'created_at'>>;
      };
      set_price_history: {
        Row: SetPriceHistory;
        Insert: Omit<SetPriceHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<SetPriceHistory, 'id' | 'created_at'>>;
      };
      price_collection_jobs: {
        Row: PriceCollectionJob;
        Insert: Omit<PriceCollectionJob, 'id' | 'created_at'>;
        Update: Partial<Omit<PriceCollectionJob, 'id' | 'created_at'>>;
      };
      price_alerts: {
        Row: PriceAlert;
        Insert: Omit<PriceAlert, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PriceAlert, 'id' | 'created_at'>>;
      };
      user_collections: {
        Row: UserCollection;
        Insert: Omit<UserCollection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserCollection, 'id' | 'created_at'>>;
      };
      session_collections: {
        Row: SessionCollection;
        Insert: Omit<SessionCollection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SessionCollection, 'id' | 'created_at'>>;
      };
      user_watchlists: {
        Row: UserWatchlist;
        Insert: Omit<UserWatchlist, 'id' | 'created_at'>;
        Update: Partial<Omit<UserWatchlist, 'id' | 'created_at'>>;
      };
      portfolio_snapshots: {
        Row: PortfolioSnapshot;
        Insert: Omit<PortfolioSnapshot, 'id' | 'created_at'>;
        Update: Partial<Omit<PortfolioSnapshot, 'id' | 'created_at'>>;
      };
      card_transactions: {
        Row: CardTransaction;
        Insert: Omit<CardTransaction, 'id'>;
        Update: Partial<Omit<CardTransaction, 'id'>>;
      };
      type_effectiveness: {
        Row: TypeEffectivenessRecord;
        Insert: Omit<TypeEffectivenessRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TypeEffectivenessRecord, 'id' | 'created_at'>>;
      };
      competitive_tiers: {
        Row: CompetitiveTierRecord;
        Insert: Omit<CompetitiveTierRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CompetitiveTierRecord, 'id' | 'created_at'>>;
      };
      pokemon_learnsets: {
        Row: PokemonLearnsetRecord;
        Insert: Omit<PokemonLearnsetRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<PokemonLearnsetRecord, 'id' | 'created_at'>>;
      };
      move_competitive_data: {
        Row: MoveCompetitiveDataRecord;
        Insert: Omit<MoveCompetitiveDataRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MoveCompetitiveDataRecord, 'id' | 'created_at'>>;
      };
      ability_ratings: {
        Row: AbilityRatingRecord;
        Insert: Omit<AbilityRatingRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AbilityRatingRecord, 'id' | 'created_at'>>;
      };
      items_showdown: {
        Row: ItemShowdownRecord;
        Insert: Omit<ItemShowdownRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ItemShowdownRecord, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_card_price_trend: {
        Args: {
          input_card_id: string;
          input_variant_type?: string;
          days_back?: number;
        };
        Returns: CardPriceTrendResult[];
      };
      get_card_price_stats: {
        Args: {
          input_card_id: string;
          input_variant_type?: string;
          days_back?: number;
        };
        Returns: CardPriceStatsResult[];
      };
      calculate_portfolio_value: {
        Args: {
          p_user_id?: string;
          p_session_id?: string;
          p_collection_id?: string;
        };
        Returns: PortfolioValueResult[];
      };
      create_portfolio_snapshot: {
        Args: {
          p_user_id?: string;
          p_session_id?: string;
        };
        Returns: boolean;
      };
      cleanup_expired_cache: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_expired_sessions: {
        Args: Record<string, never>;
        Returns: number;
      };
      cleanup_old_price_history: {
        Args: {
          days_to_keep?: number;
        };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
  };
}

// Export type alias for easier importing
export type SupabaseDatabase = Database;