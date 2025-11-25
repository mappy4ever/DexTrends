# Pokemon Showdown Integration Implementation Guide

This guide provides step-by-step instructions and code examples for integrating Pokemon Showdown data into DexTrends.

## Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Environment variables configured
- Git repository access

## Step 1: Create Data Sync Infrastructure

### 1.1 Create Sync Script Directory
```bash
mkdir -p scripts/showdown-sync
cd scripts/showdown-sync
```

### 1.2 Install Dependencies
```bash
npm install axios dotenv @supabase/supabase-js
npm install --save-dev @types/node typescript
```

### 1.3 Create Base Sync Script
```typescript
// scripts/showdown-sync/sync-showdown-data.ts
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

const SHOWDOWN_BASE_URL = 'https://play.pokemonshowdown.com/data';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface SyncResult {
  success: boolean;
  file: string;
  recordsProcessed: number;
  error?: string;
}

async function fetchShowdownData(filename: string): Promise<any> {
  const url = `${SHOWDOWN_BASE_URL}/${filename}`;
  console.log(`Fetching ${url}...`);
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'DexTrends/1.0 (https://github.com/yourusername/dextrends)'
    }
  });
  
  // Handle JavaScript files by extracting the data
  if (filename.endsWith('.js')) {
    const jsContent = response.data;
    // Extract the exports object (naive approach, improve as needed)
    const match = jsContent.match(/exports\.BattleTypeChart = ({[\s\S]*?});/);
    if (match) {
      return JSON.parse(match[1]);
    }
    // For other JS files, you'll need specific parsing logic
    throw new Error(`Cannot parse JS file: ${filename}`);
  }
  
  return response.data;
}

async function syncTypeEffectiveness(): Promise<SyncResult> {
  try {
    const typeChart = await fetchShowdownData('typechart.js');
    
    // Transform Showdown format to our schema
    const records: any[] = [];
    
    for (const [attackingType, data] of Object.entries(typeChart)) {
      if (typeof data === 'object' && 'damageTaken' in data) {
        for (const [defendingType, effectiveness] of Object.entries(data.damageTaken)) {
          // Convert Showdown encoding to multipliers
          let multiplier = 1.0;
          switch (effectiveness) {
            case 0: multiplier = 0.0; break;    // Immune
            case 1: multiplier = 1.0; break;    // Normal
            case 2: multiplier = 2.0; break;    // Weak
            case 3: multiplier = 0.5; break;    // Resist
          }
          
          records.push({
            attacking_type: attackingType.toLowerCase(),
            defending_type: defendingType.toLowerCase(),
            multiplier
          });
        }
      }
    }
    
    // Upsert to Supabase
    const { error } = await supabase
      .from('type_effectiveness')
      .upsert(records, {
        onConflict: 'attacking_type,defending_type'
      });
    
    if (error) throw error;
    
    return {
      success: true,
      file: 'typechart.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'typechart.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

async function syncPokemonTiers(): Promise<SyncResult> {
  try {
    const formatsData = await fetchShowdownData('formats-data.js');
    
    const records: any[] = [];
    
    for (const [pokemon, data] of Object.entries(formatsData)) {
      if (typeof data === 'object') {
        records.push({
          pokemon_name: pokemon.toLowerCase(),
          singles_tier: data.tier || null,
          doubles_tier: data.doublesTier || null,
          national_dex_tier: data.natDexTier || null,
          updated_at: new Date().toISOString()
        });
      }
    }
    
    const { error } = await supabase
      .from('competitive_tiers')
      .upsert(records, {
        onConflict: 'pokemon_name'
      });
    
    if (error) throw error;
    
    return {
      success: true,
      file: 'formats-data.js',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'formats-data.js',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

async function syncLearnsets(): Promise<SyncResult> {
  try {
    const learnsets = await fetchShowdownData('learnsets.json');
    
    const records: any[] = [];
    
    for (const [pokemonId, data] of Object.entries(learnsets)) {
      if (data?.learnset) {
        for (const [moveName, learnMethods] of Object.entries(data.learnset)) {
          for (const method of learnMethods) {
            // Parse learn method format: "8L31" = Gen 8, Level 31
            const match = method.match(/^(\d+)([A-Z])(\d+)?$/);
            if (match) {
              const [_, gen, methodType, level] = match;
              
              let learnMethod = '';
              switch (methodType) {
                case 'L': learnMethod = 'level-up'; break;
                case 'M': learnMethod = 'machine'; break;
                case 'T': learnMethod = 'tutor'; break;
                case 'E': learnMethod = 'egg'; break;
                default: learnMethod = methodType.toLowerCase();
              }
              
              records.push({
                pokemon_id: pokemonId,
                move_name: moveName,
                generation: parseInt(gen),
                learn_method: learnMethod,
                level: level ? parseInt(level) : null
              });
            }
          }
        }
      }
    }
    
    // Batch insert (consider chunking for large datasets)
    const chunkSize = 1000;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('pokemon_learnsets')
        .insert(chunk);
      
      if (error) throw error;
    }
    
    return {
      success: true,
      file: 'learnsets.json',
      recordsProcessed: records.length
    };
  } catch (error) {
    return {
      success: false,
      file: 'learnsets.json',
      recordsProcessed: 0,
      error: error.message
    };
  }
}

// Main sync function
async function main() {
  console.log('Starting Pokemon Showdown data sync...');
  
  const syncTasks = [
    syncTypeEffectiveness(),
    syncPokemonTiers(),
    syncLearnsets(),
  ];
  
  const results = await Promise.allSettled(syncTasks);
  
  // Generate report
  console.log('\n=== Sync Report ===');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { success, file, recordsProcessed, error } = result.value;
      if (success) {
        console.log(`✅ ${file}: ${recordsProcessed} records processed`);
      } else {
        console.log(`❌ ${file}: Failed - ${error}`);
      }
    } else {
      console.log(`❌ Task ${index}: ${result.reason}`);
    }
  });
  
  console.log('\nSync complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { syncTypeEffectiveness, syncPokemonTiers, syncLearnsets };
```

## Step 2: Set Up Supabase Tables

### 2.1 Create Migration File
```sql
-- supabase/migrations/001_showdown_integration.sql

-- Type effectiveness table
CREATE TABLE IF NOT EXISTS type_effectiveness (
  id SERIAL PRIMARY KEY,
  attacking_type TEXT NOT NULL,
  defending_type TEXT NOT NULL,
  multiplier DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(attacking_type, defending_type)
);

CREATE INDEX idx_type_effectiveness_attacking ON type_effectiveness(attacking_type);
CREATE INDEX idx_type_effectiveness_defending ON type_effectiveness(defending_type);

-- Competitive tiers table
CREATE TABLE IF NOT EXISTS competitive_tiers (
  id SERIAL PRIMARY KEY,
  pokemon_name TEXT NOT NULL UNIQUE,
  singles_tier TEXT,
  doubles_tier TEXT,
  national_dex_tier TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_competitive_tiers_name ON competitive_tiers(pokemon_name);
CREATE INDEX idx_competitive_tiers_singles ON competitive_tiers(singles_tier);

-- Pokemon learnsets table
CREATE TABLE IF NOT EXISTS pokemon_learnsets (
  id SERIAL PRIMARY KEY,
  pokemon_id TEXT NOT NULL,
  move_name TEXT NOT NULL,
  generation INTEGER NOT NULL,
  learn_method TEXT NOT NULL,
  level INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learnsets_pokemon ON pokemon_learnsets(pokemon_id);
CREATE INDEX idx_learnsets_move ON pokemon_learnsets(move_name);
CREATE INDEX idx_learnsets_generation ON pokemon_learnsets(generation);

-- Move competitive data
CREATE TABLE IF NOT EXISTS move_competitive_data (
  id SERIAL PRIMARY KEY,
  move_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  power INTEGER,
  accuracy INTEGER,
  pp INTEGER,
  priority INTEGER DEFAULT 0,
  category TEXT,
  target TEXT,
  flags JSONB,
  secondary_effect JSONB,
  drain_ratio DECIMAL(3,2),
  recoil_ratio DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ability ratings
CREATE TABLE IF NOT EXISTS ability_ratings (
  id SERIAL PRIMARY KEY,
  ability_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  rating DECIMAL(2,1),
  competitive_desc TEXT,
  flags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_type_effectiveness_updated_at BEFORE UPDATE ON type_effectiveness
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitive_tiers_updated_at BEFORE UPDATE ON competitive_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_move_competitive_data_updated_at BEFORE UPDATE ON move_competitive_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ability_ratings_updated_at BEFORE UPDATE ON ability_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Run Migration
```bash
npx supabase migration new showdown_integration
# Copy the SQL above into the migration file
npx supabase db push
```

## Step 3: Integrate with DexTrends

### 3.1 Create Type Effectiveness Hook
```typescript
// hooks/useTypeEffectiveness.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface TypeEffectiveness {
  [attackingType: string]: {
    [defendingType: string]: number;
  };
}

export function useTypeEffectiveness() {
  const [typeChart, setTypeChart] = useState<TypeEffectiveness>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTypeChart() {
      const { data, error } = await supabase
        .from('type_effectiveness')
        .select('*');
      
      if (error) {
        console.error('Failed to fetch type effectiveness:', error);
        setLoading(false);
        return;
      }
      
      // Transform flat records into nested object
      const chart: TypeEffectiveness = {};
      
      data.forEach(record => {
        if (!chart[record.attacking_type]) {
          chart[record.attacking_type] = {};
        }
        chart[record.attacking_type][record.defending_type] = record.multiplier;
      });
      
      setTypeChart(chart);
      setLoading(false);
    }
    
    fetchTypeChart();
  }, []);
  
  const getEffectiveness = (attackingType: string, defendingTypes: string[]): number => {
    let multiplier = 1;
    
    defendingTypes.forEach(defendingType => {
      const effectiveness = typeChart[attackingType]?.[defendingType] ?? 1;
      multiplier *= effectiveness;
    });
    
    return multiplier;
  };
  
  return { typeChart, getEffectiveness, loading };
}
```

### 3.2 Create Learnset Component
```typescript
// components/pokemon/PokemonLearnset.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { TypeBadge } from '@/components/ui/TypeBadge';

interface LearnsetMove {
  move_name: string;
  generation: number;
  learn_method: string;
  level: number | null;
}

interface PokemonLearnsetProps {
  pokemonId: string;
  generation?: number;
}

export function PokemonLearnset({ pokemonId, generation = 9 }: PokemonLearnsetProps) {
  const [moves, setMoves] = useState<LearnsetMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  
  useEffect(() => {
    async function fetchLearnset() {
      let query = supabase
        .from('pokemon_learnsets')
        .select('*')
        .eq('pokemon_id', pokemonId)
        .lte('generation', generation)
        .order('level', { ascending: true });
      
      if (selectedMethod !== 'all') {
        query = query.eq('learn_method', selectedMethod);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch learnset:', error);
      } else {
        setMoves(data || []);
      }
      
      setLoading(false);
    }
    
    fetchLearnset();
  }, [pokemonId, generation, selectedMethod]);
  
  const methods = ['all', 'level-up', 'machine', 'egg', 'tutor'];
  
  if (loading) return <div>Loading moves...</div>;
  
  return (
    <div className="learnset-container">
      <div className="method-filter mb-4">
        {methods.map(method => (
          <button
            key={method}
            onClick={() => setSelectedMethod(method)}
            className={`px-3 py-1 mr-2 rounded ${
              selectedMethod === method ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {method.charAt(0).toUpperCase() + method.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="moves-grid grid grid-cols-2 md:grid-cols-3 gap-2">
        {moves.map((move, index) => (
          <div key={index} className="move-item p-2 bg-gray-100 rounded">
            <div className="font-semibold">{move.move_name}</div>
            <div className="text-sm text-gray-600">
              {move.learn_method === 'level-up' && move.level && `Lv. ${move.level}`}
              {move.learn_method === 'machine' && 'TM/HM'}
              {move.learn_method === 'egg' && 'Egg Move'}
              {move.learn_method === 'tutor' && 'Move Tutor'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 Add Tier Badge Component
```typescript
// components/ui/TierBadge.tsx
import React from 'react';

interface TierBadgeProps {
  tier: string;
  format?: 'singles' | 'doubles';
}

const tierColors: Record<string, string> = {
  'Uber': 'bg-purple-600',
  'OU': 'bg-blue-600',
  'UU': 'bg-green-600',
  'RU': 'bg-yellow-600',
  'NU': 'bg-orange-600',
  'PU': 'bg-red-600',
  'LC': 'bg-pink-600',
  'NFE': 'bg-gray-600',
};

export function TierBadge({ tier, format = 'singles' }: TierBadgeProps) {
  const cleanTier = tier.replace(/[()]/g, '');
  const isParenthetical = tier.startsWith('(');
  const color = tierColors[cleanTier] || 'bg-gray-400';
  
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white
      ${color} ${isParenthetical ? 'opacity-75' : ''}
    `}>
      {cleanTier}
      {format === 'doubles' && <span className="ml-1 text-xs">2v2</span>}
    </span>
  );
}
```

## Step 4: Update Existing Components

### 4.1 Update Type Effectiveness Utility
```typescript
// utils/typeEffectiveness.ts
import { supabase } from '@/utils/supabase';

let cachedTypeChart: Record<string, Record<string, number>> | null = null;

export async function loadTypeChart() {
  if (cachedTypeChart) return cachedTypeChart;
  
  const { data, error } = await supabase
    .from('type_effectiveness')
    .select('*');
  
  if (error) {
    console.error('Failed to load type chart:', error);
    return null;
  }
  
  const chart: Record<string, Record<string, number>> = {};
  
  data.forEach(record => {
    if (!chart[record.attacking_type]) {
      chart[record.attacking_type] = {};
    }
    chart[record.attacking_type][record.defending_type] = record.multiplier;
  });
  
  cachedTypeChart = chart;
  return chart;
}

export function calculateTypeEffectiveness(
  attackingType: string,
  defendingTypes: string[]
): number {
  if (!cachedTypeChart) {
    console.warn('Type chart not loaded');
    return 1;
  }
  
  let multiplier = 1;
  
  defendingTypes.forEach(defendingType => {
    const effectiveness = cachedTypeChart![attackingType]?.[defendingType] ?? 1;
    multiplier *= effectiveness;
  });
  
  return multiplier;
}
```

### 4.2 Add to Pokemon Detail Page
```typescript
// pages/pokedex/[pokeid].tsx
import { PokemonLearnset } from '@/components/pokemon/PokemonLearnset';
import { TierBadge } from '@/components/ui/TierBadge';

// In your component, after fetching Pokemon data:
const { data: tierData } = await supabase
  .from('competitive_tiers')
  .select('*')
  .eq('pokemon_name', pokemon.name.toLowerCase())
  .single();

// In the render:
{tierData && (
  <div className="tier-badges flex gap-2 mb-4">
    {tierData.singles_tier && (
      <TierBadge tier={tierData.singles_tier} format="singles" />
    )}
    {tierData.doubles_tier && (
      <TierBadge tier={tierData.doubles_tier} format="doubles" />
    )}
  </div>
)}

// Add learnset tab
<Tab.Panel>
  <PokemonLearnset pokemonId={pokemon.name.toLowerCase()} />
</Tab.Panel>
```

## Step 5: Set Up Automated Sync

### 5.1 Create GitHub Action
```yaml
# .github/workflows/sync-showdown-data.yml
name: Sync Pokemon Showdown Data

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd scripts/showdown-sync
        npm install
    
    - name: Run sync
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      run: |
        cd scripts/showdown-sync
        npx ts-node sync-showdown-data.ts
    
    - name: Notify on failure
      if: failure()
      uses: actions/github-script@v6
      with:
        script: |
          github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: 'Showdown Data Sync Failed',
            body: 'The automated sync failed. Check the workflow logs.',
            labels: ['bug', 'data-sync']
          });
```

## Step 6: Testing

### 6.1 Create Test Suite
```typescript
// tests/showdown-integration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Showdown Integration', () => {
  test('Type effectiveness is loaded correctly', async ({ page }) => {
    await page.goto('/type-effectiveness');
    
    // Check that Fire vs Grass shows 2x
    const fireVsGrass = await page.locator('[data-testid="fire-vs-grass"]');
    await expect(fireVsGrass).toContainText('2×');
  });
  
  test('Pokemon shows competitive tier', async ({ page }) => {
    await page.goto('/pokedex/pikachu');
    
    // Check for tier badge
    const tierBadge = await page.locator('.tier-badge');
    await expect(tierBadge).toBeVisible();
  });
  
  test('Learnset tab shows moves', async ({ page }) => {
    await page.goto('/pokedex/charizard');
    
    // Click learnset tab
    await page.click('text=Moves');
    
    // Check that moves are displayed
    const moves = await page.locator('.move-item');
    await expect(moves.first()).toBeVisible();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Showdown data should be fetched server-side
2. **Large Data Sets**: Implement pagination for learnsets
3. **Type Mismatches**: Ensure lowercase normalization
4. **Rate Limiting**: Add delays between API calls
5. **Parse Errors**: JS files need custom parsing logic

### Debug Commands
```bash
# Test individual sync functions
npx ts-node -e "import { syncTypeEffectiveness } from './sync-showdown-data'; syncTypeEffectiveness().then(console.log)"

# Check Supabase data
npx supabase db dump --data-only > backup.sql
```

## Next Steps

1. Implement remaining sync functions for moves and abilities
2. Add error monitoring and alerting
3. Create admin dashboard for manual sync
4. Optimize query performance with indexes
5. Add data validation and integrity checks

See `FEATURE_ROADMAP.md` for features enabled by this integration.