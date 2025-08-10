import { supabase } from '../lib/supabase';
import logger from '@/utils/logger';

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  details?: Record<string, unknown>;
}> {
  try {
    logger.debug('[Test] Testing Supabase connection...');
    
    // Test 1: Simple health check query
    const { data, error } = await supabase
      .from('pokemon_cache')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.error('[Test] Supabase connection failed:', { error });
      return {
        connected: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      };
    }
    
    logger.debug('[Test] Supabase connection successful!');
    
    // Test 2: Check if we can access the tables
    const tables = ['pokemon_cache', 'card_cache', 'user_favorites', 'session_favorites'];
    const tableChecks: Record<string, boolean> = {};
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        tableChecks[table] = !tableError;
        if (tableError) {
          logger.warn(`[Test] Table '${table}' check failed:`, { message: tableError.message });
        }
      } catch (e) {
        tableChecks[table] = false;
      }
    }
    
    return {
      connected: true,
      details: {
        message: 'Supabase connection established',
        tablesAccessible: tableChecks,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    logger.error('[Test] Unexpected error during connection test:', { error });
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    };
  }
}

// Function to run from browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}