#!/usr/bin/env node

/**
 * Script to verify that all Pokemon data pages are loading complete datasets
 */

const https = require('https');

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function verifyDataCompleteness() {
  console.log('🔍 Verifying Pokemon Data Completeness...\n');
  
  try {
    // Check Abilities
    console.log('📊 Checking Abilities...');
    const abilities = await fetchData('https://pokeapi.co/api/v2/ability?limit=500');
    console.log(`✅ Total abilities available: ${abilities.count}`);
    console.log(`📥 Abilities fetched: ${abilities.results.length}`);
    console.log(`${abilities.count === abilities.results.length ? '✅' : '⚠️'} All abilities ${abilities.count === abilities.results.length ? 'loaded' : 'NOT fully loaded'}\n`);
    
    // Check Moves
    console.log('📊 Checking Moves...');
    const moves = await fetchData('https://pokeapi.co/api/v2/move?limit=2000');
    console.log(`✅ Total moves available: ${moves.count}`);
    console.log(`📥 Moves fetched: ${moves.results.length}`);
    console.log(`${moves.count === moves.results.length ? '✅' : '⚠️'} All moves ${moves.count === moves.results.length ? 'loaded' : 'NOT fully loaded'}\n`);
    
    // Check Items
    console.log('📊 Checking Items...');
    const items = await fetchData('https://pokeapi.co/api/v2/item?limit=2100');
    console.log(`✅ Total items available: ${items.count}`);
    console.log(`📥 Items fetched: ${items.results.length}`);
    console.log(`${items.count === items.results.length ? '✅' : '⚠️'} All items ${items.count === items.results.length ? 'loaded' : 'NOT fully loaded'}\n`);
    
    // Check Types
    console.log('📊 Checking Types...');
    const types = await fetchData('https://pokeapi.co/api/v2/type?limit=30');
    console.log(`✅ Total types available: ${types.count}`);
    console.log(`📥 Types fetched: ${types.results.length}`);
    console.log(`${types.count === types.results.length ? '✅' : '⚠️'} All types ${types.count === types.results.length ? 'loaded' : 'NOT fully loaded'}\n`);
    
    // Summary
    console.log('📋 SUMMARY:');
    console.log('===========');
    console.log(`Abilities: ${abilities.results.length}/${abilities.count} (${Math.round(abilities.results.length/abilities.count*100)}%)`);
    console.log(`Moves: ${moves.results.length}/${moves.count} (${Math.round(moves.results.length/moves.count*100)}%)`);
    console.log(`Items: ${items.results.length}/${items.count} (${Math.round(items.results.length/items.count*100)}%)`);
    console.log(`Types: ${types.results.length}/${types.count} (${Math.round(types.results.length/types.count*100)}%)`);
    
    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('===================');
    
    if (abilities.results.length < abilities.count) {
      console.log(`⚠️ Abilities: Increase limit from ${abilities.results.length} to ${abilities.count}`);
    }
    
    if (moves.results.length < moves.count) {
      console.log(`⚠️ Moves: Increase limit from ${moves.results.length} to ${moves.count}`);
    }
    
    if (items.results.length < items.count) {
      console.log(`⚠️ Items: Increase limit from ${items.results.length} to ${items.count}`);
    }
    
    // Sample some detailed data
    console.log('\n🔎 Sample Data Verification:');
    console.log('============================');
    
    // Check a specific move for TM data
    const thunderbolt = await fetchData('https://pokeapi.co/api/v2/move/thunderbolt');
    console.log(`\nMove: Thunderbolt`);
    console.log(`- Power: ${thunderbolt.power}`);
    console.log(`- Accuracy: ${thunderbolt.accuracy}`);
    console.log(`- PP: ${thunderbolt.pp}`);
    console.log(`- TM/HM: ${thunderbolt.machines && thunderbolt.machines.length > 0 ? 'Yes' : 'No'}`);
    if (thunderbolt.machines && thunderbolt.machines.length > 0) {
      console.log(`- Available in ${thunderbolt.machines.length} games as TM/TR`);
    }
    
    // Check a specific ability
    const intimidate = await fetchData('https://pokeapi.co/api/v2/ability/intimidate');
    console.log(`\nAbility: Intimidate`);
    console.log(`- Pokemon with this ability: ${intimidate.pokemon.length}`);
    console.log(`- Is Hidden for some: ${intimidate.pokemon.some(p => p.is_hidden) ? 'Yes' : 'No'}`);
    
    // Check a specific item
    const potion = await fetchData('https://pokeapi.co/api/v2/item/potion');
    console.log(`\nItem: Potion`);
    console.log(`- Cost: ${potion.cost}`);
    console.log(`- Category: ${potion.category.name}`);
    console.log(`- Has effect description: ${potion.effect_entries.length > 0 ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

verifyDataCompleteness();