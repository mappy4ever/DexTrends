# Fix Moves Database - Complete Solution

## Problem
The `move_competitive_data` table is missing critical columns:
- `type` (Pokemon type of the move)
- `description` (Full move description)
- `short_description` (Brief move description)

Currently all 953 moves have no type or description data.

## Solution Steps

### Step 1: Add Missing Columns to Database

Run this SQL in your Supabase Dashboard (https://supabase.com/dashboard/project/ptvpxfrfkkzisihufitz/sql/new):

```sql
-- Add missing columns to move_competitive_data table
ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS type VARCHAR(20);

ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE move_competitive_data 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_move_type ON move_competitive_data(type);
CREATE INDEX IF NOT EXISTS idx_move_category ON move_competitive_data(category);
CREATE INDEX IF NOT EXISTS idx_move_name ON move_competitive_data(name);
```

### Step 2: Re-sync Move Data from Pokemon Showdown

After adding the columns, run the sync script to populate the data:

```bash
# From the project root directory
npx ts-node scripts/showdown-sync/sync-showdown-data.ts --moves-only
```

This will:
1. Fetch all move data from Pokemon Showdown
2. Include type, description, and all other fields
3. Update all 953 moves with complete data

### Step 3: Verify the Data

Run this test script to verify:

```bash
node scripts/test-and-fix-moves.js
```

You should see:
- All moves have types (fire, water, electric, etc.)
- All moves have descriptions
- 0% missing data

### Step 4: Clean Up Code

Once the database is fixed, remove the temporary workaround from `pages/pokemon/moves.tsx`:
- Remove the `getDefaultType` function
- Remove the type inference logic
- The moves will now load with proper types and descriptions from the database

## Alternative: Quick Fix Script

If you want to do everything automatically, run this script after adding the columns:

```bash
node scripts/quick-fix-moves.js
```

This script will fetch and update all moves with the correct data.