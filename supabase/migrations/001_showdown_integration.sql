-- Pokemon Showdown Integration Tables
-- Migration: 001_showdown_integration
-- Description: Creates tables for storing Pokemon Showdown competitive data

-- Type effectiveness table
CREATE TABLE IF NOT EXISTS type_effectiveness (
  id SERIAL PRIMARY KEY,
  attacking_type TEXT NOT NULL,
  defending_type TEXT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attacking_type, defending_type)
);

-- Indexes for type effectiveness
CREATE INDEX IF NOT EXISTS idx_type_effectiveness_attacking ON type_effectiveness(attacking_type);
CREATE INDEX IF NOT EXISTS idx_type_effectiveness_defending ON type_effectiveness(defending_type);

-- Competitive tiers table
CREATE TABLE IF NOT EXISTS competitive_tiers (
  id SERIAL PRIMARY KEY,
  pokemon_name TEXT NOT NULL UNIQUE,
  singles_tier TEXT,
  doubles_tier TEXT,
  national_dex_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for competitive tiers
CREATE INDEX IF NOT EXISTS idx_competitive_tiers_name ON competitive_tiers(pokemon_name);
CREATE INDEX IF NOT EXISTS idx_competitive_tiers_singles ON competitive_tiers(singles_tier);
CREATE INDEX IF NOT EXISTS idx_competitive_tiers_doubles ON competitive_tiers(doubles_tier);

-- Pokemon learnsets table
CREATE TABLE IF NOT EXISTS pokemon_learnsets (
  id SERIAL PRIMARY KEY,
  pokemon_id TEXT NOT NULL,
  move_name TEXT NOT NULL,
  generation INTEGER NOT NULL,
  learn_method TEXT NOT NULL CHECK (learn_method IN ('level-up', 'machine', 'tutor', 'egg', 'other')),
  level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for learnsets
CREATE INDEX IF NOT EXISTS idx_learnsets_pokemon ON pokemon_learnsets(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_learnsets_move ON pokemon_learnsets(move_name);
CREATE INDEX IF NOT EXISTS idx_learnsets_generation ON pokemon_learnsets(generation);
CREATE INDEX IF NOT EXISTS idx_learnsets_method ON pokemon_learnsets(learn_method);
CREATE INDEX IF NOT EXISTS idx_learnsets_pokemon_gen ON pokemon_learnsets(pokemon_id, generation);

-- Move competitive data
CREATE TABLE IF NOT EXISTS move_competitive_data (
  id SERIAL PRIMARY KEY,
  move_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  power INTEGER,
  accuracy INTEGER,
  pp INTEGER,
  priority INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('physical', 'special', 'status')),
  target TEXT,
  flags JSONB DEFAULT '{}',
  secondary_effect JSONB,
  drain_ratio DECIMAL(3,2),
  recoil_ratio DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for move competitive data
CREATE INDEX IF NOT EXISTS idx_move_competitive_name ON move_competitive_data(name);
CREATE INDEX IF NOT EXISTS idx_move_competitive_category ON move_competitive_data(category);
CREATE INDEX IF NOT EXISTS idx_move_competitive_priority ON move_competitive_data(priority);

-- Ability ratings
CREATE TABLE IF NOT EXISTS ability_ratings (
  id SERIAL PRIMARY KEY,
  ability_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  competitive_desc TEXT,
  flags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ability ratings
CREATE INDEX IF NOT EXISTS idx_ability_ratings_name ON ability_ratings(name);
CREATE INDEX IF NOT EXISTS idx_ability_ratings_rating ON ability_ratings(rating);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_type_effectiveness_updated_at ON type_effectiveness;
CREATE TRIGGER update_type_effectiveness_updated_at
  BEFORE UPDATE ON type_effectiveness
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitive_tiers_updated_at ON competitive_tiers;
CREATE TRIGGER update_competitive_tiers_updated_at
  BEFORE UPDATE ON competitive_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_move_competitive_data_updated_at ON move_competitive_data;
CREATE TRIGGER update_move_competitive_data_updated_at
  BEFORE UPDATE ON move_competitive_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ability_ratings_updated_at ON ability_ratings;
CREATE TRIGGER update_ability_ratings_updated_at
  BEFORE UPDATE ON ability_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE type_effectiveness IS 'Pokemon type effectiveness multipliers from Showdown';
COMMENT ON TABLE competitive_tiers IS 'Competitive tier placements for Pokemon across different formats';
COMMENT ON TABLE pokemon_learnsets IS 'Complete move learning data for all Pokemon';
COMMENT ON TABLE move_competitive_data IS 'Enhanced competitive data for moves';
COMMENT ON TABLE ability_ratings IS 'Competitive viability ratings for abilities';

-- Grant appropriate permissions (adjust based on your Supabase setup)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Optional: Add RLS policies if needed
-- ALTER TABLE type_effectiveness ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitive_tiers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pokemon_learnsets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE move_competitive_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ability_ratings ENABLE ROW LEVEL SECURITY;