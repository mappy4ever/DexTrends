-- ============================================================================
-- TCG Cards Database Schema
-- Purpose: Store TCG card data locally to reduce external API calls
-- ============================================================================

-- ============================================================================
-- SERIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tcg_series (
  id TEXT PRIMARY KEY,                    -- e.g., "sv", "swsh"
  name TEXT NOT NULL,                     -- e.g., "Scarlet & Violet"
  logo_url TEXT,                          -- Series logo image URL

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for name search
CREATE INDEX IF NOT EXISTS idx_tcg_series_name ON tcg_series(name);

-- ============================================================================
-- SETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tcg_sets (
  id TEXT PRIMARY KEY,                    -- e.g., "sv3pt5", "swsh12pt5"
  series_id TEXT REFERENCES tcg_series(id) ON DELETE SET NULL,

  -- Basic info
  name TEXT NOT NULL,                     -- e.g., "151", "Crown Zenith"
  logo_url TEXT,                          -- Set logo
  symbol_url TEXT,                        -- Set symbol

  -- Card counts
  total_cards INTEGER,                    -- Total cards in set
  official_cards INTEGER,                 -- Official card count

  -- Release info
  release_date DATE,
  tcg_online_code TEXT,                   -- PTCGO code

  -- Legality
  legal_standard BOOLEAN DEFAULT false,
  legal_expanded BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tcg_sets_series ON tcg_sets(series_id);
CREATE INDEX IF NOT EXISTS idx_tcg_sets_name ON tcg_sets(name);
CREATE INDEX IF NOT EXISTS idx_tcg_sets_release ON tcg_sets(release_date DESC);

-- ============================================================================
-- CARDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tcg_cards (
  id TEXT PRIMARY KEY,                    -- e.g., "sv3pt5-1"
  local_id TEXT NOT NULL,                 -- Card number in set, e.g., "1"
  set_id TEXT NOT NULL REFERENCES tcg_sets(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  category TEXT NOT NULL,                 -- 'Pokemon' | 'Trainer' | 'Energy'

  -- Pokemon-specific
  hp INTEGER,
  types TEXT[],                           -- Array of types: ['Fire', 'Water']
  stage TEXT,                             -- 'Basic', 'Stage1', 'Stage2', 'V', 'VMAX', 'ex'
  evolve_from TEXT,
  evolve_to TEXT[],

  -- Battle mechanics (stored as JSONB for flexibility)
  attacks JSONB,                          -- [{name, cost, damage, effect}]
  abilities JSONB,                        -- [{name, effect, type}]
  weaknesses JSONB,                       -- [{type, value}]
  resistances JSONB,                      -- [{type, value}]
  retreat_cost INTEGER,

  -- Trainer/Energy specific
  trainer_type TEXT,                      -- 'Supporter', 'Item', 'Stadium', 'Tool'
  energy_type TEXT,
  effect TEXT,                            -- Card effect/rule text

  -- Metadata
  illustrator TEXT,
  rarity TEXT,
  regulation_mark TEXT,
  dex_ids INTEGER[],                      -- National dex numbers
  description TEXT,                       -- Flavor text

  -- Images (URLs only - actual images on CDN)
  image_small TEXT,                       -- Low resolution
  image_large TEXT,                       -- High resolution

  -- Variants available
  has_normal BOOLEAN DEFAULT false,
  has_reverse BOOLEAN DEFAULT false,
  has_holo BOOLEAN DEFAULT false,
  has_first_edition BOOLEAN DEFAULT false,

  -- Legality
  legal_standard BOOLEAN DEFAULT false,
  legal_expanded BOOLEAN DEFAULT true,

  -- Full-text search
  search_vector TSVECTOR,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tcg_cards_set ON tcg_cards(set_id);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_name ON tcg_cards(name);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_category ON tcg_cards(category);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_rarity ON tcg_cards(rarity);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_types ON tcg_cards USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_illustrator ON tcg_cards(illustrator);
CREATE INDEX IF NOT EXISTS idx_tcg_cards_stage ON tcg_cards(stage);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_tcg_cards_search ON tcg_cards USING GIN(search_vector);

-- ============================================================================
-- SYNC LOG TABLE
-- Track synchronization history for delta updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS tcg_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL,                -- 'full', 'delta', 'set', 'card'
  target_id TEXT,                         -- Set or card ID if specific sync

  -- Stats
  items_checked INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Status
  status TEXT DEFAULT 'running',          -- 'running', 'completed', 'failed'
  error_message TEXT,
  error_details JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recent syncs
CREATE INDEX IF NOT EXISTS idx_tcg_sync_log_created ON tcg_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tcg_sync_log_status ON tcg_sync_log(status);

-- ============================================================================
-- TRIGGER: Update search vector on card insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tcg_card_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.illustrator, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.rarity, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.effect, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.types, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tcg_cards_search_vector ON tcg_cards;
CREATE TRIGGER trg_tcg_cards_search_vector
  BEFORE INSERT OR UPDATE ON tcg_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_tcg_card_search_vector();

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tcg_series_updated ON tcg_series;
CREATE TRIGGER trg_tcg_series_updated
  BEFORE UPDATE ON tcg_series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tcg_sets_updated ON tcg_sets;
CREATE TRIGGER trg_tcg_sets_updated
  BEFORE UPDATE ON tcg_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tcg_cards_updated ON tcg_cards;
CREATE TRIGGER trg_tcg_cards_updated
  BEFORE UPDATE ON tcg_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE tcg_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcg_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcg_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcg_sync_log ENABLE ROW LEVEL SECURITY;

-- Public read access for card data
CREATE POLICY "Public read access for series" ON tcg_series
  FOR SELECT USING (true);

CREATE POLICY "Public read access for sets" ON tcg_sets
  FOR SELECT USING (true);

CREATE POLICY "Public read access for cards" ON tcg_cards
  FOR SELECT USING (true);

-- Only service role can write (API sync operations)
CREATE POLICY "Service role write for series" ON tcg_series
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write for sets" ON tcg_sets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role write for cards" ON tcg_cards
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role access for sync log" ON tcg_sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get sets with card counts
CREATE OR REPLACE FUNCTION get_sets_with_counts()
RETURNS TABLE (
  id TEXT,
  name TEXT,
  series_id TEXT,
  series_name TEXT,
  logo_url TEXT,
  symbol_url TEXT,
  release_date DATE,
  total_cards INTEGER,
  synced_cards BIGINT,
  legal_standard BOOLEAN,
  legal_expanded BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.series_id,
    ser.name as series_name,
    s.logo_url,
    s.symbol_url,
    s.release_date,
    s.total_cards,
    COUNT(c.id) as synced_cards,
    s.legal_standard,
    s.legal_expanded
  FROM tcg_sets s
  LEFT JOIN tcg_series ser ON s.series_id = ser.id
  LEFT JOIN tcg_cards c ON c.set_id = s.id
  GROUP BY s.id, s.name, s.series_id, ser.name, s.logo_url, s.symbol_url,
           s.release_date, s.total_cards, s.legal_standard, s.legal_expanded
  ORDER BY s.release_date DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Search cards with full-text search
CREATE OR REPLACE FUNCTION search_tcg_cards(
  search_query TEXT,
  filter_set_id TEXT DEFAULT NULL,
  filter_types TEXT[] DEFAULT NULL,
  filter_rarity TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 50,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  set_id TEXT,
  set_name TEXT,
  local_id TEXT,
  category TEXT,
  hp INTEGER,
  types TEXT[],
  rarity TEXT,
  image_small TEXT,
  image_large TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.set_id,
    s.name as set_name,
    c.local_id,
    c.category,
    c.hp,
    c.types,
    c.rarity,
    c.image_small,
    c.image_large,
    ts_rank(c.search_vector, websearch_to_tsquery('english', search_query)) as rank
  FROM tcg_cards c
  LEFT JOIN tcg_sets s ON c.set_id = s.id
  WHERE
    (search_query IS NULL OR search_query = '' OR c.search_vector @@ websearch_to_tsquery('english', search_query))
    AND (filter_set_id IS NULL OR c.set_id = filter_set_id)
    AND (filter_types IS NULL OR c.types && filter_types)
    AND (filter_rarity IS NULL OR c.rarity = filter_rarity)
    AND (filter_category IS NULL OR c.category = filter_category)
  ORDER BY
    CASE WHEN search_query IS NOT NULL AND search_query != ''
      THEN ts_rank(c.search_vector, websearch_to_tsquery('english', search_query))
      ELSE 0
    END DESC,
    c.name ASC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql;

-- Get sync status
CREATE OR REPLACE FUNCTION get_sync_status()
RETURNS TABLE (
  total_series BIGINT,
  total_sets BIGINT,
  total_cards BIGINT,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM tcg_series),
    (SELECT COUNT(*) FROM tcg_sets),
    (SELECT COUNT(*) FROM tcg_cards),
    (SELECT MAX(completed_at) FROM tcg_sync_log WHERE status = 'completed'),
    (SELECT status FROM tcg_sync_log ORDER BY created_at DESC LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE tcg_series IS 'TCG card series (e.g., Scarlet & Violet, Sword & Shield)';
COMMENT ON TABLE tcg_sets IS 'TCG card sets within series (e.g., Paldea Evolved, 151)';
COMMENT ON TABLE tcg_cards IS 'Individual TCG cards with full metadata';
COMMENT ON TABLE tcg_sync_log IS 'History of data synchronization from TCGDex API';
