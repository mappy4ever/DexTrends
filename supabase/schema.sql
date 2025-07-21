-- DexTrends Supabase Schema
-- Collections and related tables for syncing user data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Collections table (for authenticated users)
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Collections table (for non-authenticated users)
CREATE TABLE IF NOT EXISTS session_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- User Favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('pokemon', 'card', 'deck')),
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Session Favorites table
CREATE TABLE IF NOT EXISTS session_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('pokemon', 'card', 'deck')),
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(session_id, item_type, item_id)
);

-- Pokemon Cache table
CREATE TABLE IF NOT EXISTS pokemon_cache (
  pokemon_id INTEGER PRIMARY KEY,
  pokemon_data JSONB NOT NULL,
  cache_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card Cache table
CREATE TABLE IF NOT EXISTS card_cache (
  card_id TEXT PRIMARY KEY,
  card_data JSONB NOT NULL,
  cache_key TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card Price History table
CREATE TABLE IF NOT EXISTS card_price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  variant_type TEXT DEFAULT 'holofoil',
  price_market DECIMAL(10, 2),
  price_low DECIMAL(10, 2),
  price_mid DECIMAL(10, 2),
  price_high DECIMAL(10, 2),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Collection Jobs table
CREATE TABLE IF NOT EXISTS price_collection_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  cards_processed INTEGER DEFAULT 0,
  total_cards INTEGER,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  target_price DECIMAL(10, 2),
  percentage_change DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_session_collections_session_id ON session_collections(session_id);
CREATE INDEX IF NOT EXISTS idx_session_collections_expires_at ON session_collections(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_session_favorites_session_id ON session_favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_session_favorites_expires_at ON session_favorites(expires_at);
CREATE INDEX IF NOT EXISTS idx_pokemon_cache_expires_at ON pokemon_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_cache_expires_at ON card_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_price_history_card_id ON card_price_history(card_id);
CREATE INDEX IF NOT EXISTS idx_card_price_history_collected_at ON card_price_history(collected_at);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for user_collections
CREATE POLICY user_collections_select_policy ON user_collections
  FOR SELECT USING (true); -- Public read for now, can be restricted

CREATE POLICY user_collections_insert_policy ON user_collections
  FOR INSERT WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY user_collections_update_policy ON user_collections
  FOR UPDATE USING (true); -- Allow all updates for now

CREATE POLICY user_collections_delete_policy ON user_collections
  FOR DELETE USING (true); -- Allow all deletes for now

-- Policies for session_collections (similar to user_collections)
CREATE POLICY session_collections_select_policy ON session_collections
  FOR SELECT USING (true);

CREATE POLICY session_collections_insert_policy ON session_collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY session_collections_update_policy ON session_collections
  FOR UPDATE USING (true);

CREATE POLICY session_collections_delete_policy ON session_collections
  FOR DELETE USING (true);

-- Policies for favorites tables
CREATE POLICY user_favorites_select_policy ON user_favorites
  FOR SELECT USING (true);

CREATE POLICY user_favorites_insert_policy ON user_favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY user_favorites_update_policy ON user_favorites
  FOR UPDATE USING (true);

CREATE POLICY user_favorites_delete_policy ON user_favorites
  FOR DELETE USING (true);

CREATE POLICY session_favorites_select_policy ON session_favorites
  FOR SELECT USING (true);

CREATE POLICY session_favorites_insert_policy ON session_favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY session_favorites_update_policy ON session_favorites
  FOR UPDATE USING (true);

CREATE POLICY session_favorites_delete_policy ON session_favorites
  FOR DELETE USING (true);

-- Function to clean up expired session data
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM session_collections WHERE expires_at < NOW();
  DELETE FROM session_favorites WHERE expires_at < NOW();
  DELETE FROM pokemon_cache WHERE expires_at < NOW();
  DELETE FROM card_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RPC functions for price data
CREATE OR REPLACE FUNCTION get_card_price_trend(
  input_card_id TEXT,
  input_variant_type TEXT DEFAULT 'holofoil',
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  collected_at TIMESTAMP WITH TIME ZONE,
  price_market DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT cph.collected_at, cph.price_market
  FROM card_price_history cph
  WHERE cph.card_id = input_card_id
    AND cph.variant_type = input_variant_type
    AND cph.collected_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY cph.collected_at ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_card_price_stats(
  input_card_id TEXT,
  input_variant_type TEXT DEFAULT 'holofoil',
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  highest_price DECIMAL(10, 2),
  lowest_price DECIMAL(10, 2),
  average_price DECIMAL(10, 2),
  price_change DECIMAL(10, 2),
  price_change_percentage DECIMAL(5, 2)
) AS $$
DECLARE
  first_price DECIMAL(10, 2);
  last_price DECIMAL(10, 2);
BEGIN
  -- Get first and last prices for percentage calculation
  SELECT price_market INTO first_price
  FROM card_price_history
  WHERE card_id = input_card_id
    AND variant_type = input_variant_type
    AND collected_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY collected_at ASC
  LIMIT 1;
  
  SELECT price_market INTO last_price
  FROM card_price_history
  WHERE card_id = input_card_id
    AND variant_type = input_variant_type
    AND collected_at >= NOW() - INTERVAL '1 day' * days_back
  ORDER BY collected_at DESC
  LIMIT 1;

  RETURN QUERY
  SELECT 
    MAX(price_market) as highest_price,
    MIN(price_market) as lowest_price,
    AVG(price_market) as average_price,
    COALESCE(last_price - first_price, 0) as price_change,
    CASE 
      WHEN first_price > 0 THEN ((last_price - first_price) / first_price * 100)
      ELSE 0
    END as price_change_percentage
  FROM card_price_history
  WHERE card_id = input_card_id
    AND variant_type = input_variant_type
    AND collected_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;