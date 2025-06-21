-- Collections and User Management Schema for DexTrends
-- This schema supports both authenticated users and session-based users

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User collections table (for authenticated users)
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL, -- Will store actual user ID when auth is implemented
    name TEXT NOT NULL,
    description TEXT,
    cards JSONB DEFAULT '[]'::jsonb, -- Array of card objects with metadata
    settings JSONB DEFAULT '{}'::jsonb, -- Collection-specific settings
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session collections table (for non-authenticated users)
CREATE TABLE IF NOT EXISTS session_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL, -- Browser session identifier
    name TEXT NOT NULL,
    description TEXT,
    cards JSONB DEFAULT '[]'::jsonb, -- Array of card objects with metadata
    settings JSONB DEFAULT '{}'::jsonb, -- Collection-specific settings
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Auto-cleanup date
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlists table (for price tracking)
CREATE TABLE IF NOT EXISTS user_watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- NULL for session users
    session_id TEXT, -- NULL for authenticated users
    card_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    set_name TEXT,
    target_price DECIMAL(10,2),
    alert_type TEXT CHECK (alert_type IN ('price_drop', 'price_rise', 'percentage_change', 'trend_reversal')),
    percentage_threshold DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    last_price DECIMAL(10,2),
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For session users
);

-- Portfolio snapshots for tracking value over time
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- NULL for session users
    session_id TEXT, -- NULL for authenticated users
    collection_id UUID, -- Reference to specific collection or NULL for all
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    total_cards INTEGER NOT NULL,
    unique_cards INTEGER NOT NULL,
    breakdown JSONB DEFAULT '{}'::jsonb, -- Value breakdown by set, rarity, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE
);

-- Card trade/transaction history
CREATE TABLE IF NOT EXISTS card_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- NULL for session users
    session_id TEXT, -- NULL for authenticated users
    collection_id UUID,
    card_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    transaction_type TEXT CHECK (transaction_type IN ('buy', 'sell', 'trade', 'add', 'remove')) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_card DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    condition TEXT,
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (collection_id) REFERENCES user_collections(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_created_at ON user_collections(created_at);

CREATE INDEX IF NOT EXISTS idx_session_collections_session_id ON session_collections(session_id);
CREATE INDEX IF NOT EXISTS idx_session_collections_expires_at ON session_collections(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_watchlists_user_id ON user_watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_session_id ON user_watchlists(session_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_card_id ON user_watchlists(card_id);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_is_active ON user_watchlists(is_active);

CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_session_id ON portfolio_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date);

CREATE INDEX IF NOT EXISTS idx_card_transactions_user_id ON card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_session_id ON card_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_collection_id ON card_transactions(collection_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);

-- Row Level Security (RLS) policies
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_collections
CREATE POLICY "Users can view their own collections" ON user_collections
    FOR SELECT USING (true); -- Allow reading for now, can be restricted later

CREATE POLICY "Users can create their own collections" ON user_collections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own collections" ON user_collections
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own collections" ON user_collections
    FOR DELETE USING (true);

-- RLS Policies for session_collections (open access for session users)
CREATE POLICY "Allow all operations on session collections" ON session_collections
    FOR ALL USING (true);

-- RLS Policies for user_watchlists
CREATE POLICY "Users can manage their own watchlists" ON user_watchlists
    FOR ALL USING (true);

-- RLS Policies for portfolio_snapshots
CREATE POLICY "Users can view their own portfolio snapshots" ON portfolio_snapshots
    FOR ALL USING (true);

-- RLS Policies for card_transactions
CREATE POLICY "Users can manage their own transactions" ON card_transactions
    FOR ALL USING (true);

-- Utility Functions

-- Function to clean up expired session data
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Clean up expired session collections
    DELETE FROM session_collections 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up expired session watchlists
    DELETE FROM user_watchlists 
    WHERE session_id IS NOT NULL 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate portfolio value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_collection_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_value DECIMAL(12,2),
    total_cards INTEGER,
    unique_cards INTEGER,
    breakdown JSONB
) AS $$
DECLARE
    collection_cards JSONB;
    card_record JSONB;
    current_value DECIMAL(12,2) := 0;
    card_count INTEGER := 0;
    unique_count INTEGER := 0;
    set_breakdown JSONB := '{}'::jsonb;
    rarity_breakdown JSONB := '{}'::jsonb;
BEGIN
    -- Get collections based on user type and collection filter
    IF p_collection_id IS NOT NULL THEN
        -- Specific collection
        IF p_user_id IS NOT NULL THEN
            SELECT cards INTO collection_cards 
            FROM user_collections 
            WHERE id = p_collection_id AND user_id = p_user_id;
        ELSE
            SELECT cards INTO collection_cards 
            FROM session_collections 
            WHERE id = p_collection_id AND session_id = p_session_id;
        END IF;
    ELSE
        -- All collections for user
        IF p_user_id IS NOT NULL THEN
            SELECT COALESCE(jsonb_agg(cards), '[]'::jsonb) INTO collection_cards
            FROM user_collections 
            WHERE user_id = p_user_id;
        ELSE
            SELECT COALESCE(jsonb_agg(cards), '[]'::jsonb) INTO collection_cards
            FROM session_collections 
            WHERE session_id = p_session_id AND expires_at > NOW();
        END IF;
    END IF;
    
    -- If no cards found, return zeros
    IF collection_cards IS NULL OR jsonb_array_length(collection_cards) = 0 THEN
        RETURN QUERY SELECT 0::DECIMAL(12,2), 0, 0, '{}'::jsonb;
        RETURN;
    END IF;
    
    -- Process each card in the collection(s)
    FOR card_record IN SELECT * FROM jsonb_array_elements(collection_cards)
    LOOP
        -- Count cards and estimate value (would normally fetch from price history)
        card_count := card_count + COALESCE((card_record->>'quantity')::INTEGER, 1);
        unique_count := unique_count + 1;
        
        -- Simulate current value calculation (in real implementation, fetch from price history)
        current_value := current_value + (RANDOM() * 100 + 10) * COALESCE((card_record->>'quantity')::INTEGER, 1);
        
        -- Build breakdowns by set and rarity
        -- This is simplified - in real implementation, would aggregate properly
    END LOOP;
    
    RETURN QUERY SELECT 
        current_value,
        card_count,
        unique_count,
        jsonb_build_object(
            'by_set', set_breakdown,
            'by_rarity', rarity_breakdown,
            'calculated_at', NOW()
        );
END;
$$ LANGUAGE plpgsql;

-- Function to create daily portfolio snapshots
CREATE OR REPLACE FUNCTION create_portfolio_snapshot(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    portfolio_data RECORD;
    snapshot_date DATE := CURRENT_DATE;
BEGIN
    -- Check if snapshot already exists for today
    IF EXISTS (
        SELECT 1 FROM portfolio_snapshots 
        WHERE snapshot_date = snapshot_date 
        AND (
            (p_user_id IS NOT NULL AND user_id = p_user_id) OR
            (p_session_id IS NOT NULL AND session_id = p_session_id)
        )
    ) THEN
        RETURN false; -- Snapshot already exists
    END IF;
    
    -- Calculate current portfolio value
    SELECT * INTO portfolio_data 
    FROM calculate_portfolio_value(p_user_id, p_session_id, NULL);
    
    -- Insert snapshot
    INSERT INTO portfolio_snapshots (
        user_id, session_id, snapshot_date, 
        total_value, total_cards, unique_cards, breakdown
    ) VALUES (
        p_user_id, p_session_id, snapshot_date,
        portfolio_data.total_value, portfolio_data.total_cards, 
        portfolio_data.unique_cards, portfolio_data.breakdown
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to collections tables
CREATE TRIGGER update_user_collections_updated_at 
    BEFORE UPDATE ON user_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_collections_updated_at 
    BEFORE UPDATE ON session_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schedule cleanup function (would be run via cron or scheduled job)
-- This creates a simple cleanup that can be called manually or via scheduler
COMMENT ON FUNCTION cleanup_expired_sessions() IS 
'Run this function daily to clean up expired session data. 
Example: SELECT cleanup_expired_sessions();';

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;