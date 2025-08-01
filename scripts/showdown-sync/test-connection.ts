import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key type: anon key');
  
  try {
    // Test reading from type_effectiveness table
    const { data, error } = await supabase
      .from('type_effectiveness')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error reading from type_effectiveness:', error);
    } else {
      console.log('Successfully read from type_effectiveness. Record count:', data?.length || 0);
    }
    
    // Test reading from move_competitive_data table
    const { data: moveData, error: moveError } = await supabase
      .from('move_competitive_data')
      .select('*')
      .limit(5);
    
    if (moveError) {
      console.error('Error reading from move_competitive_data:', moveError);
    } else {
      console.log('Successfully read from move_competitive_data. Record count:', moveData?.length || 0);
    }
    
    // Test counting records
    const { count, error: countError } = await supabase
      .from('move_competitive_data')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting move_competitive_data:', countError);
    } else {
      console.log('Current record count in move_competitive_data:', count);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();