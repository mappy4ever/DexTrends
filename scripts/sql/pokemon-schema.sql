-- Pokemon Data Schema for Supabase
-- Run this in Supabase SQL Editor to create tables

-- =============================================
-- POKEMON TABLES
-- =============================================

-- Pokemon base data (1025 Pokemon)
CREATE TABLE IF NOT EXISTS pokemon (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  height INTEGER,
  weight INTEGER,
  base_experience INTEGER,
  types JSONB DEFAULT '[]',
  abilities JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{}',
  sprites JSONB DEFAULT '{}',
  cries JSONB DEFAULT '{}',
  species_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pokemon species data (evolution info, descriptions, etc.)
CREATE TABLE IF NOT EXISTS pokemon_species (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  gender_rate INTEGER,
  capture_rate INTEGER,
  base_happiness INTEGER,
  is_baby BOOLEAN DEFAULT FALSE,
  is_legendary BOOLEAN DEFAULT FALSE,
  is_mythical BOOLEAN DEFAULT FALSE,
  hatch_counter INTEGER,
  has_gender_differences BOOLEAN DEFAULT FALSE,
  growth_rate VARCHAR(50),
  egg_groups JSONB DEFAULT '[]',
  color VARCHAR(50),
  shape VARCHAR(50),
  habitat VARCHAR(50),
  generation VARCHAR(50),
  flavor_text_entries JSONB DEFAULT '[]',
  genera JSONB DEFAULT '[]',
  evolution_chain_id INTEGER,
  evolves_from_species_id INTEGER,
  varieties JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evolution chains
CREATE TABLE IF NOT EXISTS evolution_chains (
  id INTEGER PRIMARY KEY,
  chain JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MOVES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS moves (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  accuracy INTEGER,
  effect_chance INTEGER,
  pp INTEGER,
  priority INTEGER DEFAULT 0,
  power INTEGER,
  damage_class VARCHAR(50),
  type VARCHAR(50),
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  meta JSONB DEFAULT '{}',
  target VARCHAR(50),
  learned_by_pokemon JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ABILITIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS abilities (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_main_series BOOLEAN DEFAULT TRUE,
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  pokemon JSONB DEFAULT '[]',
  generation VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STATIC DATA TABLES
-- =============================================

-- Types (18 types)
CREATE TABLE IF NOT EXISTS types (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  damage_relations JSONB DEFAULT '{}',
  pokemon JSONB DEFAULT '[]',
  moves JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Natures (25 natures)
CREATE TABLE IF NOT EXISTS natures (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  decreased_stat VARCHAR(50),
  increased_stat VARCHAR(50),
  hates_flavor VARCHAR(50),
  likes_flavor VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Berries (~65 berries)
CREATE TABLE IF NOT EXISTS berries (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  growth_time INTEGER,
  max_harvest INTEGER,
  natural_gift_power INTEGER,
  natural_gift_type VARCHAR(50),
  size INTEGER,
  smoothness INTEGER,
  soil_dryness INTEGER,
  firmness VARCHAR(50),
  flavors JSONB DEFAULT '[]',
  item_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items (~1000 items)
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost INTEGER DEFAULT 0,
  fling_power INTEGER,
  fling_effect VARCHAR(100),
  category VARCHAR(100),
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  sprites JSONB DEFAULT '{}',
  attributes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
CREATE INDEX IF NOT EXISTS idx_pokemon_types ON pokemon USING GIN(types);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_name ON pokemon_species(name);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_legendary ON pokemon_species(is_legendary);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_mythical ON pokemon_species(is_mythical);
CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);
CREATE INDEX IF NOT EXISTS idx_moves_type ON moves(type);
CREATE INDEX IF NOT EXISTS idx_moves_damage_class ON moves(damage_class);
CREATE INDEX IF NOT EXISTS idx_abilities_name ON abilities(name);
CREATE INDEX IF NOT EXISTS idx_types_name ON types(name);
CREATE INDEX IF NOT EXISTS idx_natures_name ON natures(name);
CREATE INDEX IF NOT EXISTS idx_berries_name ON berries(name);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE natures ENABLE ROW LEVEL SECURITY;
ALTER TABLE berries ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read pokemon" ON pokemon FOR SELECT USING (true);
CREATE POLICY "Public read pokemon_species" ON pokemon_species FOR SELECT USING (true);
CREATE POLICY "Public read evolution_chains" ON evolution_chains FOR SELECT USING (true);
CREATE POLICY "Public read moves" ON moves FOR SELECT USING (true);
CREATE POLICY "Public read abilities" ON abilities FOR SELECT USING (true);
CREATE POLICY "Public read types" ON types FOR SELECT USING (true);
CREATE POLICY "Public read natures" ON natures FOR SELECT USING (true);
CREATE POLICY "Public read berries" ON berries FOR SELECT USING (true);
CREATE POLICY "Public read items" ON items FOR SELECT USING (true);

-- Service role write access (for sync scripts)
CREATE POLICY "Service write pokemon" ON pokemon FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write pokemon_species" ON pokemon_species FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write evolution_chains" ON evolution_chains FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write moves" ON moves FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write abilities" ON abilities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write types" ON types FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write natures" ON natures FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write berries" ON berries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service write items" ON items FOR ALL USING (auth.role() = 'service_role');
