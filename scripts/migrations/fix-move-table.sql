-- Fix move_competitive_data table by adding missing essential columns
-- Run this in Supabase SQL Editor

-- Add the missing type column (CRITICAL - this is why all moves show as normal!)
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS type VARCHAR(20);

-- Add description columns (this is why moves have no descriptions!)
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add index on type for filtering performance
CREATE INDEX IF NOT EXISTS idx_move_competitive_type ON move_competitive_data(type);

-- Add comments for documentation
COMMENT ON COLUMN move_competitive_data.type IS 'Pokemon type of the move (fire, water, electric, etc.)';
COMMENT ON COLUMN move_competitive_data.description IS 'Full description of what the move does';
COMMENT ON COLUMN move_competitive_data.short_description IS 'Brief description for display';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'move_competitive_data'
ORDER BY ordinal_position;