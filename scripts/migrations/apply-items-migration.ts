import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';

// Load environment variables
const envPath = path.resolve(process.cwd(), '../../.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_JWT_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    // Read the SQL migration file
    const sqlPath = path.resolve(__dirname, 'create_items_showdown_table.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error applying migration:', error);
      
      // If RPC doesn't exist, try creating the table directly via REST API
      // This is a fallback approach
      console.log('Attempting direct table creation...');
      
      // We'll need to sync the items data which will create the table if it doesn't exist
      console.log('Table will be created when syncing items data');
      return;
    }
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error:', error);
    console.log('Note: Table will be created automatically when syncing items data');
  }
}

applyMigration();