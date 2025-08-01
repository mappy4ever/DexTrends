import * as path from 'path';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Applying Showdown integration migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_showdown_integration.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('Migration file loaded. This will create:');
    console.log('- type_effectiveness table');
    console.log('- competitive_tiers table');
    console.log('- pokemon_learnsets table');
    console.log('- move_competitive_data table');
    console.log('- ability_ratings table');
    console.log('');
    console.log('WARNING: This requires database admin privileges.');
    console.log('If this fails, you may need to run the migration manually in the Supabase dashboard.');
    console.log('');
    
    // Note: The Supabase client library doesn't support running raw SQL migrations
    // We'll need to use the Supabase dashboard or CLI for this
    console.log('To apply this migration:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Paste the contents of:', migrationPath);
    console.log('4. Run the query');
    console.log('');
    console.log('Or use Supabase CLI:');
    console.log('supabase db push --db-url', process.env.POSTGRES_URL);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyMigration();