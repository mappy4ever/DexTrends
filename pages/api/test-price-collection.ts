// Test API endpoint to verify price collection setup
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

interface TestResponse {
  success: boolean;
  tests: {
    name: string;
    passed: boolean;
    message: string;
    data?: any;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      tests: [{
        name: 'Method Check',
        passed: false,
        message: 'Only GET method is allowed'
      }]
    });
  }

  const tests = [];

  // Test 1: Check if Supabase is configured
  const supabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  tests.push({
    name: 'Supabase Configuration',
    passed: supabaseConfigured,
    message: supabaseConfigured ? 'Supabase is configured' : 'Supabase environment variables not found',
    data: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    }
  });

  // Test 2: Check if we can query the card_price_history table
  try {
    const { data, error } = await supabase
      .from('card_price_history')
      .select('*')
      .limit(1);

    tests.push({
      name: 'Database Table Access',
      passed: !error,
      message: error ? `Error accessing table: ${error.message}` : 'Successfully accessed card_price_history table',
      data: error ? { error: error.message } : { rowCount: data?.length || 0 }
    });
  } catch (error: any) {
    tests.push({
      name: 'Database Table Access',
      passed: false,
      message: 'Failed to access database',
      data: { error: error.message }
    });
  }

  // Test 3: Check if Pokemon TCG API is accessible
  try {
    const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch('https://api.pokemontcg.io/v2/cards?pageSize=1', {
      headers
    });

    tests.push({
      name: 'Pokemon TCG API Access',
      passed: response.ok,
      message: response.ok ? 'Successfully connected to Pokemon TCG API' : `API returned status ${response.status}`,
      data: { 
        status: response.status,
        hasApiKey: !!apiKey
      }
    });
  } catch (error: any) {
    tests.push({
      name: 'Pokemon TCG API Access',
      passed: false,
      message: 'Failed to connect to Pokemon TCG API',
      data: { error: error.message }
    });
  }

  // Test 4: Check if we have any existing price data
  try {
    const { data, error, count } = await supabase
      .from('card_price_history')
      .select('*', { count: 'exact', head: true });

    tests.push({
      name: 'Existing Price Data',
      passed: !error && (count || 0) > 0,
      message: error 
        ? `Error checking data: ${error.message}` 
        : `Found ${count || 0} price records in database`,
      data: { recordCount: count || 0 }
    });
  } catch (error: any) {
    tests.push({
      name: 'Existing Price Data',
      passed: false,
      message: 'Failed to check existing data',
      data: { error: error.message }
    });
  }

  // Test 5: Test inserting a sample price record
  const testCardId = 'test-' + Date.now();
  try {
    const { error } = await supabase
      .from('card_price_history')
      .insert({
        card_id: testCardId,
        card_name: 'Test Card',
        set_name: 'Test Set',
        variant_type: 'normal',
        price_market: 10.99,
        price_low: 8.99,
        price_mid: 10.99,
        price_high: 12.99,
        collected_at: new Date().toISOString()
      });

    if (!error) {
      // Clean up test record
      await supabase
        .from('card_price_history')
        .delete()
        .eq('card_id', testCardId);
    }

    tests.push({
      name: 'Insert Price Record',
      passed: !error,
      message: error ? `Error inserting: ${error.message}` : 'Successfully inserted and cleaned up test record',
      data: error ? { error: error.message } : { success: true }
    });
  } catch (error: any) {
    tests.push({
      name: 'Insert Price Record',
      passed: false,
      message: 'Failed to test insert operation',
      data: { error: error.message }
    });
  }

  const allPassed = tests.every(test => test.passed);

  res.status(200).json({
    success: allPassed,
    tests
  });
}