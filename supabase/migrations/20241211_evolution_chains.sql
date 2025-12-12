-- Evolution Chains Database Schema
-- Stores Pokemon evolution chains, regional forms, and regional-exclusive evolutions
-- Run this migration in your Supabase SQL Editor

-- =============================================
-- EVOLUTION CHAINS TABLE
-- Stores the full evolution chain data
-- =============================================
CREATE TABLE IF NOT EXISTS evolution_chains (
  id INTEGER PRIMARY KEY,
  -- The chain structure as JSONB for flexibility
  -- Contains: species_name, evolves_to[], evolution_details[]
  chain JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_evolution_chains_id ON evolution_chains(id);

-- =============================================
-- POKEMON FORMS TABLE
-- Tracks all Pokemon form variants
-- =============================================
CREATE TABLE IF NOT EXISTS pokemon_forms (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  form_name TEXT NOT NULL,  -- e.g., 'meowth-galar', 'pikachu-cosplay'
  base_species_name TEXT NOT NULL,  -- e.g., 'meowth', 'pikachu'
  form_type TEXT,  -- 'regional', 'mega', 'gmax', 'costume', 'other'
  region TEXT,  -- 'alola', 'galar', 'hisui', 'paldea' (for regional forms)
  is_default BOOLEAN DEFAULT FALSE,
  is_battle_only BOOLEAN DEFAULT FALSE,
  is_mega BOOLEAN DEFAULT FALSE,
  is_gmax BOOLEAN DEFAULT FALSE,
  sprites JSONB DEFAULT '{}',
  types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_name)
);

-- Indexes for pokemon_forms
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_pokemon_id ON pokemon_forms(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_species_id ON pokemon_forms(species_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_base_species ON pokemon_forms(base_species_name);
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_form_type ON pokemon_forms(form_type);
CREATE INDEX IF NOT EXISTS idx_pokemon_forms_region ON pokemon_forms(region);

-- =============================================
-- REGIONAL EXCLUSIVE EVOLUTIONS TABLE
-- Maps evolutions that only occur from specific regional forms
-- =============================================
CREATE TABLE IF NOT EXISTS regional_exclusive_evolutions (
  id SERIAL PRIMARY KEY,
  evolution_species_name TEXT NOT NULL UNIQUE,  -- e.g., 'sirfetchd', 'perrserker'
  evolution_species_id INTEGER,
  required_region TEXT NOT NULL,  -- 'galar', 'hisui', 'alola', 'paldea'
  pre_evolution_species_name TEXT NOT NULL,  -- e.g., 'farfetchd', 'meowth'
  pre_evolution_species_id INTEGER,
  notes TEXT,  -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_regional_exclusive_evo_name ON regional_exclusive_evolutions(evolution_species_name);
CREATE INDEX IF NOT EXISTS idx_regional_exclusive_pre_evo ON regional_exclusive_evolutions(pre_evolution_species_name);

-- =============================================
-- BASE FORM NO EVOLUTION TABLE
-- Pokemon that don't evolve in their base form but do in regional form
-- =============================================
CREATE TABLE IF NOT EXISTS base_form_no_evolution (
  id SERIAL PRIMARY KEY,
  species_name TEXT NOT NULL UNIQUE,  -- e.g., 'farfetchd', 'corsola'
  species_id INTEGER,
  notes TEXT,  -- e.g., 'Only Galarian Farfetch'd evolves into Sirfetch'd'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_base_form_no_evo_name ON base_form_no_evolution(species_name);

-- =============================================
-- POKEMON CLASSIFICATIONS TABLE
-- Ultra Beasts, Paradox Pokemon, etc.
-- =============================================
CREATE TABLE IF NOT EXISTS pokemon_classifications (
  id SERIAL PRIMARY KEY,
  pokemon_id INTEGER NOT NULL,
  species_name TEXT NOT NULL,
  classification TEXT NOT NULL,  -- 'ultra_beast', 'paradox_past', 'paradox_future', 'starter', etc.
  generation INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pokemon_id, classification)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pokemon_class_pokemon_id ON pokemon_classifications(pokemon_id);
CREATE INDEX IF NOT EXISTS idx_pokemon_class_classification ON pokemon_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_pokemon_class_species ON pokemon_classifications(species_name);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE evolution_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_exclusive_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_form_no_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_classifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY evolution_chains_read_policy ON evolution_chains FOR SELECT USING (true);
CREATE POLICY pokemon_forms_read_policy ON pokemon_forms FOR SELECT USING (true);
CREATE POLICY regional_exclusive_evo_read_policy ON regional_exclusive_evolutions FOR SELECT USING (true);
CREATE POLICY base_form_no_evo_read_policy ON base_form_no_evolution FOR SELECT USING (true);
CREATE POLICY pokemon_class_read_policy ON pokemon_classifications FOR SELECT USING (true);

-- Allow service role to write
CREATE POLICY evolution_chains_write_policy ON evolution_chains FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pokemon_forms_write_policy ON pokemon_forms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY regional_exclusive_evo_write_policy ON regional_exclusive_evolutions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY base_form_no_evo_write_policy ON base_form_no_evolution FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY pokemon_class_write_policy ON pokemon_classifications FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SEED DATA: Regional Exclusive Evolutions
-- =============================================
INSERT INTO regional_exclusive_evolutions (evolution_species_name, evolution_species_id, required_region, pre_evolution_species_name, pre_evolution_species_id, notes)
VALUES
  -- Galarian exclusives (Gen 8)
  ('sirfetchd', 865, 'galar', 'farfetchd', 83, 'Only Galarian Farfetch''d evolves into Sirfetch''d'),
  ('perrserker', 863, 'galar', 'meowth', 52, 'Only Galarian Meowth evolves into Perrserker'),
  ('mr-rime', 866, 'galar', 'mr-mime', 122, 'Only Galarian Mr. Mime evolves into Mr. Rime'),
  ('cursola', 864, 'galar', 'corsola', 222, 'Only Galarian Corsola evolves into Cursola'),
  ('obstagoon', 862, 'galar', 'linoone', 264, 'Only Galarian Linoone evolves into Obstagoon'),
  ('runerigus', 867, 'galar', 'yamask', 562, 'Only Galarian Yamask evolves into Runerigus'),
  -- Hisuian exclusives (Legends Arceus)
  ('sneasler', 903, 'hisui', 'sneasel', 215, 'Only Hisuian Sneasel evolves into Sneasler'),
  ('overqwil', 904, 'hisui', 'qwilfish', 211, 'Only Hisuian Qwilfish evolves into Overqwil'),
  ('basculegion', 902, 'hisui', 'basculin', 550, 'Only White-Striped Basculin (Hisuian) evolves into Basculegion')
ON CONFLICT (evolution_species_name) DO UPDATE SET
  required_region = EXCLUDED.required_region,
  pre_evolution_species_name = EXCLUDED.pre_evolution_species_name,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =============================================
-- SEED DATA: Base Form No Evolution
-- =============================================
INSERT INTO base_form_no_evolution (species_name, species_id, notes)
VALUES
  ('farfetchd', 83, 'Regular Farfetch''d doesn''t evolve; only Galarian form evolves to Sirfetch''d'),
  ('corsola', 222, 'Regular Corsola doesn''t evolve; only Galarian form evolves to Cursola')
ON CONFLICT (species_name) DO UPDATE SET
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- =============================================
-- SEED DATA: Pokemon Classifications
-- =============================================
-- Ultra Beasts (Gen 7)
INSERT INTO pokemon_classifications (pokemon_id, species_name, classification, generation, notes)
VALUES
  (793, 'nihilego', 'ultra_beast', 7, 'UB-01 Symbiont'),
  (794, 'buzzwole', 'ultra_beast', 7, 'UB-02 Absorption'),
  (795, 'pheromosa', 'ultra_beast', 7, 'UB-02 Beauty'),
  (796, 'xurkitree', 'ultra_beast', 7, 'UB-03 Lighting'),
  (797, 'celesteela', 'ultra_beast', 7, 'UB-04 Blaster'),
  (798, 'kartana', 'ultra_beast', 7, 'UB-04 Blade'),
  (799, 'guzzlord', 'ultra_beast', 7, 'UB-05 Glutton'),
  (803, 'poipole', 'ultra_beast', 7, 'UB Adhesive'),
  (804, 'naganadel', 'ultra_beast', 7, 'UB Stinger'),
  (805, 'stakataka', 'ultra_beast', 7, 'UB Assembly'),
  (806, 'blacephalon', 'ultra_beast', 7, 'UB Burst')
ON CONFLICT (pokemon_id, classification) DO NOTHING;

-- Paradox Pokemon - Past (Gen 9)
INSERT INTO pokemon_classifications (pokemon_id, species_name, classification, generation, notes)
VALUES
  (984, 'great-tusk', 'paradox_past', 9, 'Ancient Donphan'),
  (985, 'scream-tail', 'paradox_past', 9, 'Ancient Jigglypuff'),
  (986, 'brute-bonnet', 'paradox_past', 9, 'Ancient Amoonguss'),
  (987, 'flutter-mane', 'paradox_past', 9, 'Ancient Misdreavus'),
  (988, 'slither-wing', 'paradox_past', 9, 'Ancient Volcarona'),
  (989, 'sandy-shocks', 'paradox_past', 9, 'Ancient Magneton'),
  (990, 'roaring-moon', 'paradox_past', 9, 'Ancient Salamence'),
  (1007, 'koraidon', 'paradox_past', 9, 'Legendary - Past'),
  (1009, 'walking-wake', 'paradox_past', 9, 'Ancient Suicune'),
  (1020, 'gouging-fire', 'paradox_past', 9, 'Ancient Entei'),
  (1021, 'raging-bolt', 'paradox_past', 9, 'Ancient Raikou')
ON CONFLICT (pokemon_id, classification) DO NOTHING;

-- Paradox Pokemon - Future (Gen 9)
INSERT INTO pokemon_classifications (pokemon_id, species_name, classification, generation, notes)
VALUES
  (991, 'iron-treads', 'paradox_future', 9, 'Future Donphan'),
  (992, 'iron-bundle', 'paradox_future', 9, 'Future Delibird'),
  (993, 'iron-hands', 'paradox_future', 9, 'Future Hariyama'),
  (994, 'iron-jugulis', 'paradox_future', 9, 'Future Hydreigon'),
  (995, 'iron-moth', 'paradox_future', 9, 'Future Volcarona'),
  (996, 'iron-thorns', 'paradox_future', 9, 'Future Tyranitar'),
  (997, 'iron-valiant', 'paradox_future', 9, 'Future Gardevoir/Gallade'),
  (1008, 'miraidon', 'paradox_future', 9, 'Legendary - Future'),
  (1010, 'iron-leaves', 'paradox_future', 9, 'Future Virizion'),
  (1022, 'iron-boulder', 'paradox_future', 9, 'Future Terrakion'),
  (1023, 'iron-crown', 'paradox_future', 9, 'Future Cobalion')
ON CONFLICT (pokemon_id, classification) DO NOTHING;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get evolution chain for a species
CREATE OR REPLACE FUNCTION get_evolution_chain(chain_id INTEGER)
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT chain FROM evolution_chains WHERE id = chain_id);
END;
$$ LANGUAGE plpgsql;

-- Function to check if evolution is regional-exclusive
CREATE OR REPLACE FUNCTION is_regional_exclusive_evolution(evo_name TEXT)
RETURNS TABLE(
  is_exclusive BOOLEAN,
  required_region TEXT,
  pre_evolution TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE,
    r.required_region,
    r.pre_evolution_species_name
  FROM regional_exclusive_evolutions r
  WHERE r.evolution_species_name = evo_name;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, NULL::TEXT, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if base form doesn't evolve
CREATE OR REPLACE FUNCTION base_form_has_no_evolution(species TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM base_form_no_evolution WHERE species_name = species);
END;
$$ LANGUAGE plpgsql;

-- Function to get all forms for a species
CREATE OR REPLACE FUNCTION get_pokemon_forms(species TEXT)
RETURNS TABLE(
  form_name TEXT,
  form_type TEXT,
  region TEXT,
  is_default BOOLEAN,
  types TEXT[],
  sprites JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pf.form_name,
    pf.form_type,
    pf.region,
    pf.is_default,
    pf.types,
    pf.sprites
  FROM pokemon_forms pf
  WHERE pf.base_species_name = species
  ORDER BY pf.is_default DESC, pf.form_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get Pokemon classifications
CREATE OR REPLACE FUNCTION get_pokemon_classification(pokemon_id_param INTEGER)
RETURNS TABLE(
  classification TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.classification, pc.notes
  FROM pokemon_classifications pc
  WHERE pc.pokemon_id = pokemon_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get all Pokemon by classification
CREATE OR REPLACE FUNCTION get_pokemon_by_classification(class_type TEXT)
RETURNS TABLE(
  pokemon_id INTEGER,
  species_name TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pc.pokemon_id, pc.species_name, pc.notes
  FROM pokemon_classifications pc
  WHERE pc.classification = class_type
  ORDER BY pc.pokemon_id;
END;
$$ LANGUAGE plpgsql;
