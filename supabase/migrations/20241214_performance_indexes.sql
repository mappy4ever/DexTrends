-- Performance Indexes Migration
-- Adds missing indexes identified in the December 2024 audit
-- Run this in Supabase SQL Editor

-- =============================================
-- USER FAVORITES INDEXES
-- =============================================

-- Index on item_id for looking up favorites by item
CREATE INDEX IF NOT EXISTS idx_user_favorites_item_id
ON user_favorites(item_id);

-- Compound index for filtering by user and type
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_type
ON user_favorites(user_id, item_type);

-- =============================================
-- SESSION FAVORITES INDEXES
-- =============================================

-- Index on item_id for looking up favorites by item
CREATE INDEX IF NOT EXISTS idx_session_favorites_item_id
ON session_favorites(item_id);

-- Compound index for filtering by session and type
CREATE INDEX IF NOT EXISTS idx_session_favorites_session_type
ON session_favorites(session_id, item_type);

-- =============================================
-- CARD PRICE HISTORY INDEXES
-- =============================================

-- Compound index for efficient price trend queries (card + date)
-- This optimizes the common query pattern: WHERE card_id = ? ORDER BY collected_at
CREATE INDEX IF NOT EXISTS idx_card_price_history_card_date
ON card_price_history(card_id, collected_at DESC);

-- Index for variant type filtering
CREATE INDEX IF NOT EXISTS idx_card_price_history_variant
ON card_price_history(variant_type);

-- =============================================
-- PRICE ALERTS INDEXES
-- =============================================

-- Index on card_id for looking up alerts by card
CREATE INDEX IF NOT EXISTS idx_price_alerts_card_id
ON price_alerts(card_id);

-- Index for active alerts filtering
CREATE INDEX IF NOT EXISTS idx_price_alerts_active
ON price_alerts(is_active)
WHERE is_active = true;

-- Compound index for user's active alerts
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_active
ON price_alerts(user_id, is_active);

-- =============================================
-- POKEMON TABLE (if exists) INDEXES
-- =============================================

-- These are added IF the pokemon table exists in the migrations
-- The main pokemon table uses JSONB for types, so a GIN index helps
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pokemon') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_pokemon_types ON pokemon USING GIN(types)';
  END IF;
END $$;

-- =============================================
-- ANALYZE TABLES
-- Update statistics for the query planner
-- =============================================

ANALYZE user_favorites;
ANALYZE session_favorites;
ANALYZE card_price_history;
ANALYZE price_alerts;
