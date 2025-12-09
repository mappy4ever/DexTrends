-- Price History Schema
-- Stores daily price snapshots for TCG cards
-- Run this migration in your Supabase SQL Editor

-- =============================================
-- PRICE HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS price_history (
  id BIGSERIAL PRIMARY KEY,
  card_id TEXT NOT NULL,              -- TCGDex card ID (e.g., "sv7-001")
  card_name TEXT NOT NULL,            -- Card name for easier queries
  set_id TEXT,                        -- Set ID for filtering

  -- TCGPlayer prices (USD)
  tcgplayer_low DECIMAL(10,2),
  tcgplayer_mid DECIMAL(10,2),
  tcgplayer_high DECIMAL(10,2),
  tcgplayer_market DECIMAL(10,2),     -- Market price (most useful)

  -- CardMarket prices (EUR)
  cardmarket_low DECIMAL(10,2),
  cardmarket_trend DECIMAL(10,2),     -- Trend price (most useful)
  cardmarket_avg1 DECIMAL(10,2),
  cardmarket_avg7 DECIMAL(10,2),
  cardmarket_avg30 DECIMAL(10,2),

  -- Metadata
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_price_history_card_id ON price_history(card_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_price_history_card_date ON price_history(card_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_set_id ON price_history(set_id);

-- Unique constraint: one price per card per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_history_unique
ON price_history(card_id, recorded_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access (prices are public data)
CREATE POLICY price_history_read_policy ON price_history
  FOR SELECT USING (true);

-- Only service role can write
CREATE POLICY price_history_write_policy ON price_history
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get price history for a card (last N days)
CREATE OR REPLACE FUNCTION get_card_price_history(
  p_card_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  recorded_at DATE,
  tcgplayer_market DECIMAL(10,2),
  cardmarket_trend DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT ph.recorded_at, ph.tcgplayer_market, ph.cardmarket_trend
  FROM price_history ph
  WHERE ph.card_id = p_card_id
    AND ph.recorded_at >= CURRENT_DATE - p_days
  ORDER BY ph.recorded_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get price change percentage for a card
CREATE OR REPLACE FUNCTION get_card_price_change(
  p_card_id TEXT,
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  current_price DECIMAL(10,2),
  previous_price DECIMAL(10,2),
  change_amount DECIMAL(10,2),
  change_percent DECIMAL(5,2)
) AS $$
DECLARE
  v_current DECIMAL(10,2);
  v_previous DECIMAL(10,2);
BEGIN
  -- Get current price (most recent)
  SELECT tcgplayer_market INTO v_current
  FROM price_history
  WHERE card_id = p_card_id
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Get price from N days ago
  SELECT tcgplayer_market INTO v_previous
  FROM price_history
  WHERE card_id = p_card_id
    AND recorded_at <= CURRENT_DATE - p_days
  ORDER BY recorded_at DESC
  LIMIT 1;

  RETURN QUERY SELECT
    v_current,
    v_previous,
    COALESCE(v_current - v_previous, 0),
    CASE
      WHEN v_previous > 0 THEN ROUND(((v_current - v_previous) / v_previous * 100)::numeric, 2)
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- Get top price movers (cards with biggest % change)
CREATE OR REPLACE FUNCTION get_top_price_movers(
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 10,
  p_direction TEXT DEFAULT 'up' -- 'up' or 'down'
)
RETURNS TABLE(
  card_id TEXT,
  card_name TEXT,
  current_price DECIMAL(10,2),
  previous_price DECIMAL(10,2),
  change_percent DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH current_prices AS (
    SELECT DISTINCT ON (ph.card_id)
      ph.card_id,
      ph.card_name,
      ph.tcgplayer_market as current_price,
      ph.recorded_at
    FROM price_history ph
    ORDER BY ph.card_id, ph.recorded_at DESC
  ),
  previous_prices AS (
    SELECT DISTINCT ON (ph.card_id)
      ph.card_id,
      ph.tcgplayer_market as previous_price
    FROM price_history ph
    WHERE ph.recorded_at <= CURRENT_DATE - p_days
    ORDER BY ph.card_id, ph.recorded_at DESC
  )
  SELECT
    c.card_id,
    c.card_name,
    c.current_price,
    p.previous_price,
    CASE
      WHEN p.previous_price > 0
      THEN ROUND(((c.current_price - p.previous_price) / p.previous_price * 100)::numeric, 2)
      ELSE 0
    END as change_percent
  FROM current_prices c
  JOIN previous_prices p ON c.card_id = p.card_id
  WHERE c.current_price IS NOT NULL
    AND p.previous_price IS NOT NULL
    AND p.previous_price > 0
  ORDER BY
    CASE WHEN p_direction = 'up'
      THEN ((c.current_price - p.previous_price) / p.previous_price)
      ELSE ((p.previous_price - c.current_price) / p.previous_price)
    END DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
