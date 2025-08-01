#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test script to verify Supabase integration
async function runTests() {
  console.log('=== Supabase Integration Test ===\n');
  console.log('Environment check:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.log('\n');

  try {
    // Import the Supabase utilities
    const { testSupabaseConnection, showdownQueries } = await import('./utils/supabase.ts');
    
    // Test 1: Connection Test
    console.log('1. Testing Supabase connection...');
    const connectionTest = await testSupabaseConnection();
    console.log('   Result:', connectionTest);
    
    // Test 2: Check Type Effectiveness Table
    console.log('\n2. Testing type effectiveness query...');
    try {
      const effectiveness = await showdownQueries.getTypeEffectiveness('fire', 'water');
      console.log('   Fire vs Water multiplier:', effectiveness);
    } catch (err) {
      console.error('   Error:', err.message);
    }
    
    // Test 3: Check Pokemon Learnset
    console.log('\n3. Testing Pokemon learnset query...');
    try {
      const learnset = await showdownQueries.getPokemonLearnset('pikachu', 9);
      console.log('   Pikachu moves found:', learnset.length);
      if (learnset.length > 0) {
        console.log('   Sample move:', learnset[0]);
      }
    } catch (err) {
      console.error('   Error:', err.message);
    }
    
    // Test 4: Check Competitive Tiers
    console.log('\n4. Testing competitive tiers query...');
    try {
      const tiers = await showdownQueries.getPokemonTiers('pikachu');
      console.log('   Pikachu tiers:', tiers);
    } catch (err) {
      console.error('   Error:', err.message);
    }
    
    // Test 5: Check Move Data
    console.log('\n5. Testing move data query...');
    try {
      const moveData = await showdownQueries.getMoveData('thunderbolt');
      console.log('   Thunderbolt data:', moveData);
    } catch (err) {
      console.error('   Error:', err.message);
    }
    
    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Failed to run tests:', error);
  }
}

runTests();