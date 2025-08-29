-- Create items_showdown table for Pokemon Showdown items data
CREATE TABLE IF NOT EXISTS items_showdown (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  spritenum INTEGER,
  sprite_url TEXT,
  generation INTEGER,
  description TEXT,
  short_description TEXT,
  fling_power INTEGER,
  is_choice BOOLEAN DEFAULT FALSE,
  is_nonstandard BOOLEAN DEFAULT FALSE,
  category TEXT, -- We'll map categories manually
  competitive_data JSONB, -- Store additional battle mechanics data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_items_showdown_name ON items_showdown(name);
CREATE INDEX idx_items_showdown_category ON items_showdown(category);
CREATE INDEX idx_items_showdown_generation ON items_showdown(generation);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_showdown_updated_at BEFORE UPDATE
  ON items_showdown FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE items_showdown IS 'Pokemon items data synced from Pokemon Showdown for competitive battle information';