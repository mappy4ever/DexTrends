-- DexTrends Price History Extension Schema
-- Run this in Supabase SQL Editor AFTER the main schema

-- Card price history table - stores daily price snapshots
CREATE TABLE IF NOT EXISTS card_price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id TEXT NOT NULL, -- TCG API card ID (e.g., "xy1-1")
    card_name TEXT NOT NULL,
    set_name TEXT,
    set_id TEXT,
    variant_type TEXT, -- holofoil, normal, reverse_holofoil, etc.
    
    -- Price data from TCGplayer
    price_low DECIMAL(10,2),
    price_mid DECIMAL(10,2),
    price_high DECIMAL(10,2),
    price_market DECIMAL(10,2),
    price_direct_low DECIMAL(10,2),
    
    -- Additional market data
    tcgplayer_url TEXT,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Source metadata
    source TEXT DEFAULT 'pokemon-tcg-api',
    raw_data JSONB, -- Store full TCGplayer response for future analysis
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set price history table - stores aggregate set pricing data
CREATE TABLE IF NOT EXISTS set_price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    set_id TEXT NOT NULL,
    set_name TEXT NOT NULL,
    
    -- Aggregate pricing for the entire set
    total_cards INTEGER,
    cards_with_prices INTEGER,
    average_card_price DECIMAL(10,2),
    median_card_price DECIMAL(10,2),
    total_set_value DECIMAL(10,2),
    
    -- Price range
    min_card_price DECIMAL(10,2),
    max_card_price DECIMAL(10,2),
    
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price collection jobs table - track collection runs
CREATE TABLE IF NOT EXISTS price_collection_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_type TEXT NOT NULL CHECK (job_type IN ('daily', 'weekly', 'manual', 'backfill')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    
    -- Job metrics
    cards_processed INTEGER DEFAULT 0,
    cards_updated INTEGER DEFAULT 0,
    cards_failed INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price alerts table (for future features)
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    
    -- Alert conditions
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'target_price')),
    target_price DECIMAL(10,2),
    percentage_change DECIMAL(5,2),
    
    -- Alert status
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    times_triggered INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_card_price_history_card_id ON card_price_history(card_id);
CREATE INDEX IF NOT EXISTS idx_card_price_history_collected_at ON card_price_history(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_price_history_card_variant ON card_price_history(card_id, variant_type, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_set_price_history_set_id ON set_price_history(set_id);
CREATE INDEX IF NOT EXISTS idx_set_price_history_collected_at ON set_price_history(collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_collection_jobs_status ON price_collection_jobs(status);
CREATE INDEX IF NOT EXISTS idx_price_collection_jobs_created_at ON price_collection_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_card_id ON price_alerts(card_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE card_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_collection_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Price history is publicly readable
CREATE POLICY "Price history is publicly readable" ON card_price_history
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Set price history is publicly readable" ON set_price_history
    FOR SELECT TO anon, authenticated USING (true);

-- Collection jobs are publicly readable (for monitoring)
CREATE POLICY "Collection jobs are publicly readable" ON price_collection_jobs
    FOR SELECT TO anon, authenticated USING (true);

-- Users can only access their own price alerts
CREATE POLICY "Users can view their own price alerts" ON price_alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price alerts" ON price_alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" ON price_alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" ON price_alerts
    FOR DELETE USING (auth.uid() = user_id);

-- Functions for price history analysis
CREATE OR REPLACE FUNCTION get_card_price_trend(
    input_card_id TEXT,
    input_variant_type TEXT DEFAULT 'holofoil',
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    collected_date DATE,
    price_market DECIMAL(10,2),
    price_low DECIMAL(10,2),
    price_high DECIMAL(10,2),
    day_change_percent DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_prices AS (
        SELECT 
            DATE(collected_at) as collected_date,
            AVG(card_price_history.price_market) as avg_market_price,
            AVG(card_price_history.price_low) as avg_low_price,
            AVG(card_price_history.price_high) as avg_high_price
        FROM card_price_history
        WHERE card_id = input_card_id 
            AND variant_type = input_variant_type
            AND collected_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY DATE(collected_at)
        ORDER BY collected_date
    ),
    with_changes AS (
        SELECT 
            dp.collected_date,
            dp.avg_market_price::DECIMAL(10,2) as price_market,
            dp.avg_low_price::DECIMAL(10,2) as price_low,
            dp.avg_high_price::DECIMAL(10,2) as price_high,
            CASE 
                WHEN LAG(dp.avg_market_price) OVER (ORDER BY dp.collected_date) IS NOT NULL 
                THEN ((dp.avg_market_price - LAG(dp.avg_market_price) OVER (ORDER BY dp.collected_date)) / LAG(dp.avg_market_price) OVER (ORDER BY dp.collected_date) * 100)::DECIMAL(5,2)
                ELSE 0::DECIMAL(5,2)
            END as day_change_percent
        FROM daily_prices dp
    )
    SELECT * FROM with_changes;
END;
$$ LANGUAGE plpgsql;

-- Function to get price statistics for a card
CREATE OR REPLACE FUNCTION get_card_price_stats(
    input_card_id TEXT,
    input_variant_type TEXT DEFAULT 'holofoil',
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    current_price DECIMAL(10,2),
    avg_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    price_volatility DECIMAL(5,2),
    trend_direction TEXT
) AS $$
DECLARE
    recent_price DECIMAL(10,2);
    older_price DECIMAL(10,2);
BEGIN
    -- Get current (most recent) price
    SELECT card_price_history.price_market INTO recent_price
    FROM card_price_history
    WHERE card_id = input_card_id AND variant_type = input_variant_type
    ORDER BY collected_at DESC
    LIMIT 1;
    
    -- Get price from specified days back
    SELECT card_price_history.price_market INTO older_price
    FROM card_price_history
    WHERE card_id = input_card_id 
        AND variant_type = input_variant_type
        AND collected_at <= NOW() - INTERVAL '1 day' * days_back
    ORDER BY collected_at DESC
    LIMIT 1;
    
    RETURN QUERY
    SELECT 
        recent_price as current_price,
        AVG(card_price_history.price_market)::DECIMAL(10,2) as avg_price,
        MIN(card_price_history.price_market)::DECIMAL(10,2) as min_price,
        MAX(card_price_history.price_market)::DECIMAL(10,2) as max_price,
        STDDEV(card_price_history.price_market)::DECIMAL(5,2) as price_volatility,
        CASE 
            WHEN recent_price > older_price THEN 'UP'
            WHEN recent_price < older_price THEN 'DOWN'
            ELSE 'STABLE'
        END as trend_direction
    FROM card_price_history
    WHERE card_id = input_card_id 
        AND variant_type = input_variant_type
        AND collected_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old price history (keep only recent data)
CREATE OR REPLACE FUNCTION cleanup_old_price_history(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM card_price_history 
    WHERE collected_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also cleanup old collection jobs
    DELETE FROM price_collection_jobs 
    WHERE created_at < NOW() - INTERVAL '1 day' * 90; -- Keep 90 days of job history
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update price alerts updated_at
CREATE TRIGGER update_price_alerts_updated_at
    BEFORE UPDATE ON price_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();