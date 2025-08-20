-- Migration to add missing columns to move_competitive_data table
-- This adds type and description fields that were missing from the initial sync

-- Add type column if it doesn't exist
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS type VARCHAR(20);

-- Add description column if it doesn't exist
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add short_description column if it doesn't exist
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add move_id column if it doesn't exist (for unique identification)
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS move_id INTEGER;

-- Add any other missing columns for completeness
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS drain_ratio DECIMAL(3,2);

ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS recoil_ratio DECIMAL(3,2);

-- Create an index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_move_type ON move_competitive_data(type);

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_move_category ON move_competitive_data(category);

-- Create an index on name for faster searching
CREATE INDEX IF NOT EXISTS idx_move_name ON move_competitive_data(name);

COMMENT ON COLUMN move_competitive_data.type IS 'Pokemon type of the move (e.g., fire, water, electric)';
COMMENT ON COLUMN move_competitive_data.description IS 'Full description of the move effect';
COMMENT ON COLUMN move_competitive_data.short_description IS 'Brief description of the move';
COMMENT ON COLUMN move_competitive_data.move_id IS 'Unique identifier from Pokemon Showdown';
COMMENT ON COLUMN move_competitive_data.drain_ratio IS 'HP drain ratio (e.g., 0.5 for 50% drain)';
COMMENT ON COLUMN move_competitive_data.recoil_ratio IS 'Recoil damage ratio (e.g., 0.33 for 33% recoil)';