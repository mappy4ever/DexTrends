-- DexTrends Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('pokemon', 'card', 'deck')),
    item_id TEXT NOT NULL,
    item_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Pokemon metadata cache table
CREATE TABLE IF NOT EXISTS pokemon_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pokemon_id TEXT UNIQUE NOT NULL,
    pokemon_data JSONB NOT NULL,
    cache_key TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card metadata cache table
CREATE TABLE IF NOT EXISTS card_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    card_id TEXT UNIQUE NOT NULL,
    card_data JSONB NOT NULL,
    cache_key TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User decks table
CREATE TABLE IF NOT EXISTS user_decks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    deck_name TEXT NOT NULL,
    deck_data JSONB NOT NULL,
    deck_type TEXT DEFAULT 'pocket' CHECK (deck_type IN ('pocket', 'tcg')),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session-based favorites (for users without accounts)
CREATE TABLE IF NOT EXISTS session_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('pokemon', 'card', 'deck')),
    item_id TEXT NOT NULL,
    item_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    UNIQUE(session_id, item_type, item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON user_favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_pokemon_cache_expires ON pokemon_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_card_cache_expires ON card_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_favorites_session ON session_favorites(session_id);
CREATE INDEX IF NOT EXISTS idx_session_favorites_expires ON session_favorites(expires_at);

-- RLS (Row Level Security) policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON user_favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own decks
CREATE POLICY "Users can view their own decks" ON user_decks
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own decks" ON user_decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" ON user_decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" ON user_decks
    FOR DELETE USING (auth.uid() = user_id);

-- Cache tables are publicly readable (for performance)
ALTER TABLE pokemon_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pokemon cache is publicly readable" ON pokemon_cache
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Card cache is publicly readable" ON card_cache
    FOR SELECT TO anon, authenticated USING (true);

-- Session favorites are accessible by session
ALTER TABLE session_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session favorites are accessible by session" ON session_favorites
    FOR ALL USING (true);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM pokemon_cache WHERE expires_at < NOW();
    DELETE FROM card_cache WHERE expires_at < NOW();
    DELETE FROM session_favorites WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pokemon_cache_updated_at
    BEFORE UPDATE ON pokemon_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_cache_updated_at
    BEFORE UPDATE ON card_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_decks_updated_at
    BEFORE UPDATE ON user_decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();