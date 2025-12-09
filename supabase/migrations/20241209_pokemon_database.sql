-- Pokemon Database Schema
-- Tables for Pokemon, Moves, Abilities, Types, Natures, Berries, Items
-- Run this migration in your Supabase SQL Editor

-- =============================================
-- POKEMON TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS pokemon (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  height INTEGER,
  weight INTEGER,
  base_experience INTEGER,
  types TEXT[] DEFAULT '{}',
  abilities JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{}',
  sprites JSONB DEFAULT '{}',
  cries JSONB DEFAULT '{}',
  species_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pokemon
CREATE INDEX IF NOT EXISTS idx_pokemon_name ON pokemon(name);
CREATE INDEX IF NOT EXISTS idx_pokemon_types ON pokemon USING GIN(types);

-- =============================================
-- POKEMON SPECIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS pokemon_species (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  gender_rate INTEGER,
  capture_rate INTEGER,
  base_happiness INTEGER,
  is_baby BOOLEAN DEFAULT FALSE,
  is_legendary BOOLEAN DEFAULT FALSE,
  is_mythical BOOLEAN DEFAULT FALSE,
  hatch_counter INTEGER,
  has_gender_differences BOOLEAN DEFAULT FALSE,
  growth_rate TEXT,
  egg_groups TEXT[] DEFAULT '{}',
  color TEXT,
  shape TEXT,
  habitat TEXT,
  generation TEXT,
  flavor_text_entries JSONB DEFAULT '[]',
  genera TEXT[] DEFAULT '{}',
  evolution_chain_id INTEGER,
  evolves_from_species_id INTEGER,
  varieties JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pokemon_species
CREATE INDEX IF NOT EXISTS idx_pokemon_species_name ON pokemon_species(name);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_generation ON pokemon_species(generation);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_is_legendary ON pokemon_species(is_legendary);
CREATE INDEX IF NOT EXISTS idx_pokemon_species_is_mythical ON pokemon_species(is_mythical);

-- =============================================
-- MOVES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS moves (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  accuracy INTEGER,
  effect_chance INTEGER,
  pp INTEGER,
  priority INTEGER,
  power INTEGER,
  damage_class TEXT,
  type TEXT,
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  meta JSONB DEFAULT '{}',
  target TEXT,
  learned_by_pokemon TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for moves
CREATE INDEX IF NOT EXISTS idx_moves_name ON moves(name);
CREATE INDEX IF NOT EXISTS idx_moves_type ON moves(type);
CREATE INDEX IF NOT EXISTS idx_moves_damage_class ON moves(damage_class);

-- =============================================
-- ABILITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS abilities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_main_series BOOLEAN DEFAULT TRUE,
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  pokemon JSONB DEFAULT '[]',
  generation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for abilities
CREATE INDEX IF NOT EXISTS idx_abilities_name ON abilities(name);
CREATE INDEX IF NOT EXISTS idx_abilities_generation ON abilities(generation);

-- =============================================
-- TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS types (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  damage_relations JSONB DEFAULT '{}',
  pokemon TEXT[] DEFAULT '{}',
  moves TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for types
CREATE INDEX IF NOT EXISTS idx_types_name ON types(name);

-- =============================================
-- NATURES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS natures (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  decreased_stat TEXT,
  increased_stat TEXT,
  hates_flavor TEXT,
  likes_flavor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for natures
CREATE INDEX IF NOT EXISTS idx_natures_name ON natures(name);

-- =============================================
-- BERRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS berries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  growth_time INTEGER,
  max_harvest INTEGER,
  natural_gift_power INTEGER,
  natural_gift_type TEXT,
  size INTEGER,
  smoothness INTEGER,
  soil_dryness INTEGER,
  firmness TEXT,
  flavors JSONB DEFAULT '[]',
  item_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for berries
CREATE INDEX IF NOT EXISTS idx_berries_name ON berries(name);
CREATE INDEX IF NOT EXISTS idx_berries_natural_gift_type ON berries(natural_gift_type);

-- =============================================
-- ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER,
  fling_power INTEGER,
  fling_effect TEXT,
  category TEXT,
  effect_entries JSONB DEFAULT '[]',
  flavor_text_entries JSONB DEFAULT '[]',
  sprites JSONB DEFAULT '{}',
  attributes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for items
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
-- Enable RLS on all tables (read-only for anon)
ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE natures ENABLE ROW LEVEL SECURITY;
ALTER TABLE berries ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY pokemon_read_policy ON pokemon FOR SELECT USING (true);
CREATE POLICY pokemon_species_read_policy ON pokemon_species FOR SELECT USING (true);
CREATE POLICY moves_read_policy ON moves FOR SELECT USING (true);
CREATE POLICY abilities_read_policy ON abilities FOR SELECT USING (true);
CREATE POLICY types_read_policy ON types FOR SELECT USING (true);
CREATE POLICY natures_read_policy ON natures FOR SELECT USING (true);
CREATE POLICY berries_read_policy ON berries FOR SELECT USING (true);
CREATE POLICY items_read_policy ON items FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY pokemon_write_policy ON pokemon FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pokemon_species_write_policy ON pokemon_species FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY moves_write_policy ON moves FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY abilities_write_policy ON abilities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY types_write_policy ON types FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY natures_write_policy ON natures FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY berries_write_policy ON berries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY items_write_policy ON items FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to search Pokemon by name
CREATE OR REPLACE FUNCTION search_pokemon(search_term TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id INTEGER,
  name TEXT,
  types TEXT[],
  sprites JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.types, p.sprites
  FROM pokemon p
  WHERE p.name ILIKE '%' || search_term || '%'
  ORDER BY
    CASE WHEN p.name ILIKE search_term || '%' THEN 0 ELSE 1 END,
    p.id
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get Pokemon by type
CREATE OR REPLACE FUNCTION get_pokemon_by_type(type_name TEXT, limit_count INTEGER DEFAULT 50, offset_count INTEGER DEFAULT 0)
RETURNS TABLE(
  id INTEGER,
  name TEXT,
  types TEXT[],
  sprites JSONB,
  stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.types, p.sprites, p.stats
  FROM pokemon p
  WHERE type_name = ANY(p.types)
  ORDER BY p.id
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get Pokemon with species info
CREATE OR REPLACE FUNCTION get_pokemon_full(pokemon_id INTEGER)
RETURNS TABLE(
  id INTEGER,
  name TEXT,
  height INTEGER,
  weight INTEGER,
  types TEXT[],
  abilities JSONB,
  stats JSONB,
  sprites JSONB,
  is_legendary BOOLEAN,
  is_mythical BOOLEAN,
  generation TEXT,
  flavor_text JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.height,
    p.weight,
    p.types,
    p.abilities,
    p.stats,
    p.sprites,
    COALESCE(s.is_legendary, false),
    COALESCE(s.is_mythical, false),
    s.generation,
    s.flavor_text_entries
  FROM pokemon p
  LEFT JOIN pokemon_species s ON p.id = s.id
  WHERE p.id = pokemon_id;
END;
$$ LANGUAGE plpgsql;
