# Pokemon Showdown Data Sync Strategy

This document outlines the strategy for collecting, refreshing, and maintaining Pokemon Showdown data in DexTrends.

## Overview

The sync strategy balances data freshness with system performance, using a combination of scheduled updates, change detection, and intelligent caching.

## Data Categories & Update Frequencies

### Static Data (Monthly Updates)
These data sets rarely change and can be synced less frequently:

| Data Type | Source File | Update Trigger | Cache TTL |
|-----------|-------------|----------------|-----------|
| Type Effectiveness | `typechart.js` | Game mechanics change | 30 days |
| Abilities | `abilities.js` | New game release | 30 days |
| Items | `items.js` | New items added | 30 days |
| Moves Base Data | `moves.json` | Balance patches | 30 days |

### Semi-Dynamic Data (Weekly Updates)
These change periodically with balance updates:

| Data Type | Source File | Update Trigger | Cache TTL |
|-----------|-------------|----------------|-----------|
| Learnsets | `learnsets.json` | Move tutor updates | 7 days |
| Formats | `formats.js` | Rule changes | 7 days |
| Aliases | `aliases.js` | Community additions | 7 days |

### Dynamic Data (Daily Updates)
These change frequently based on usage:

| Data Type | Source File | Update Trigger | Cache TTL |
|-----------|-------------|----------------|-----------|
| Competitive Tiers | `formats-data.js` | Usage statistics | 24 hours |
| Suspect Tests | Via API | Active tests | 12 hours |

## Sync Architecture

```
┌─────────────────────┐
│   GitHub Actions    │
│  (Scheduled Cron)   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐     ┌─────────────────┐
│   Sync Service      │────►│ Change Detection │
│  (Node.js Script)   │     │    (MD5 Hash)    │
└──────────┬──────────┘     └─────────────────┘
           │
┌──────────▼──────────┐     ┌─────────────────┐
│  Data Transformer   │────►│   Validation    │
│  (Parse & Convert)  │     │   (Schema Check) │
└──────────┬──────────┘     └─────────────────┘
           │
┌──────────▼──────────┐     ┌─────────────────┐
│     Supabase        │────►│  Cache Manager  │
│    (PostgreSQL)     │     │   (Redis/Edge)  │
└─────────────────────┘     └─────────────────┘
```

## Implementation Details

### 1. Change Detection System

```typescript
// utils/showdown-sync/changeDetection.ts
import crypto from 'crypto';
import { supabase } from '@/utils/supabase';

interface DataSource {
  name: string;
  url: string;
  lastHash?: string;
  lastSync?: Date;
}

export async function hasDataChanged(source: DataSource): Promise<boolean> {
  // Fetch current data
  const response = await fetch(source.url);
  const data = await response.text();
  
  // Calculate hash
  const currentHash = crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
  
  // Compare with stored hash
  const { data: stored } = await supabase
    .from('sync_metadata')
    .select('hash')
    .eq('source_name', source.name)
    .single();
  
  if (!stored || stored.hash !== currentHash) {
    // Update stored hash
    await supabase
      .from('sync_metadata')
      .upsert({
        source_name: source.name,
        hash: currentHash,
        last_sync: new Date().toISOString()
      });
    
    return true;
  }
  
  return false;
}
```

### 2. Incremental Sync Strategy

```typescript
// utils/showdown-sync/incrementalSync.ts
export async function incrementalSync(dataType: string, data: any[]) {
  const batchSize = 100;
  const existingIds = new Set();
  
  // Get existing records
  const { data: existing } = await supabase
    .from(dataType)
    .select('id');
  
  existing?.forEach(record => existingIds.add(record.id));
  
  // Separate new and updated records
  const newRecords = [];
  const updatedRecords = [];
  
  for (const record of data) {
    if (existingIds.has(record.id)) {
      updatedRecords.push(record);
    } else {
      newRecords.push(record);
    }
  }
  
  // Batch insert new records
  for (let i = 0; i < newRecords.length; i += batchSize) {
    const batch = newRecords.slice(i, i + batchSize);
    await supabase.from(dataType).insert(batch);
  }
  
  // Batch update existing records
  for (let i = 0; i < updatedRecords.length; i += batchSize) {
    const batch = updatedRecords.slice(i, i + batchSize);
    await supabase.from(dataType).upsert(batch);
  }
  
  return {
    inserted: newRecords.length,
    updated: updatedRecords.length
  };
}
```

### 3. Sync Scheduling

#### GitHub Actions Workflow
```yaml
# .github/workflows/showdown-sync-schedule.yml
name: Scheduled Showdown Sync

on:
  schedule:
    # Daily sync at 2 AM UTC for dynamic data
    - cron: '0 2 * * *'
    # Weekly sync on Sundays at 3 AM UTC
    - cron: '0 3 * * 0'
    # Monthly sync on the 1st at 4 AM UTC
    - cron: '0 4 1 * *'
  workflow_dispatch:
    inputs:
      sync_type:
        description: 'Sync type'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - static
          - dynamic
          - tiers

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Determine sync type
      id: sync_type
      run: |
        if [[ "${{ github.event_name }}" == "schedule" ]]; then
          CRON="${{ github.event.schedule }}"
          if [[ "$CRON" == "0 2 * * *" ]]; then
            echo "type=dynamic" >> $GITHUB_OUTPUT
          elif [[ "$CRON" == "0 3 * * 0" ]]; then
            echo "type=semi-dynamic" >> $GITHUB_OUTPUT
          else
            echo "type=static" >> $GITHUB_OUTPUT
          fi
        else
          echo "type=${{ inputs.sync_type }}" >> $GITHUB_OUTPUT
        fi
    
    - name: Run sync
      env:
        SYNC_TYPE: ${{ steps.sync_type.outputs.type }}
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      run: |
        npm run sync:showdown -- --type=$SYNC_TYPE
```

### 4. Error Handling & Monitoring

```typescript
// utils/showdown-sync/errorHandler.ts
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/node';

export class SyncError extends Error {
  constructor(
    message: string,
    public source: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  source: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        sync_source: source,
        sync_time: new Date().toISOString()
      }
    });
    
    // Log to database
    await supabase
      .from('sync_errors')
      .insert({
        source,
        error_message: error.message,
        error_details: error,
        occurred_at: new Date().toISOString()
      });
    
    // Decide whether to throw or continue
    if (error.critical) {
      throw new SyncError(
        `Critical sync error for ${source}`,
        source,
        error
      );
    }
    
    return null;
  }
}
```

### 5. Cache Warming Strategy

```typescript
// utils/showdown-sync/cacheWarming.ts
export async function warmCache(dataType: string) {
  const cacheKeys = {
    'type_effectiveness': [
      'type-chart-full',
      'type-chart-offensive',
      'type-chart-defensive'
    ],
    'competitive_tiers': [
      'tiers-ou',
      'tiers-uu',
      'tiers-uber'
    ],
    'pokemon_learnsets': [
      // Cache popular Pokemon
      'learnset-pikachu',
      'learnset-charizard',
      'learnset-garchomp'
    ]
  };
  
  const keys = cacheKeys[dataType] || [];
  
  for (const key of keys) {
    await generateCacheEntry(key);
  }
}

async function generateCacheEntry(key: string) {
  // Implementation depends on cache strategy
  // Could be Redis, Edge Functions, or CDN
}
```

## Data Validation

### Schema Validation
```typescript
// utils/showdown-sync/validation.ts
import Joi from 'joi';

const schemas = {
  pokemon: Joi.object({
    num: Joi.number().required(),
    name: Joi.string().required(),
    types: Joi.array().items(Joi.string()).required(),
    baseStats: Joi.object({
      hp: Joi.number().required(),
      atk: Joi.number().required(),
      def: Joi.number().required(),
      spa: Joi.number().required(),
      spd: Joi.number().required(),
      spe: Joi.number().required()
    }).required()
  }),
  
  move: Joi.object({
    num: Joi.number().required(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    category: Joi.string().valid('Physical', 'Special', 'Status').required(),
    power: Joi.number().allow(null),
    accuracy: Joi.alternatives().try(Joi.number(), Joi.boolean()).required()
  })
};

export function validateData(dataType: string, data: any): boolean {
  const schema = schemas[dataType];
  if (!schema) return true;
  
  const { error } = schema.validate(data);
  if (error) {
    console.error(`Validation error for ${dataType}:`, error);
    return false;
  }
  
  return true;
}
```

## Monitoring & Alerts

### Sync Health Dashboard
```sql
-- Supabase view for monitoring
CREATE VIEW sync_health AS
SELECT 
  source_name,
  last_sync,
  CASE 
    WHEN last_sync > NOW() - INTERVAL '25 hours' THEN 'healthy'
    WHEN last_sync > NOW() - INTERVAL '48 hours' THEN 'warning'
    ELSE 'critical'
  END as status,
  sync_duration_ms,
  records_processed
FROM sync_metadata
ORDER BY last_sync DESC;
```

### Alert Conditions
1. **Critical**: No sync for >48 hours
2. **Warning**: Sync duration >5 minutes
3. **Info**: >10% change in record count
4. **Error**: Any sync failures

## Manual Sync Interface

### Admin Dashboard Component
```typescript
// components/admin/ShowdownSyncDashboard.tsx
export function ShowdownSyncDashboard() {
  const [syncing, setSyncing] = useState<string | null>(null);
  
  const syncData = async (dataType: string) => {
    setSyncing(dataType);
    
    const response = await fetch('/api/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataType })
    });
    
    const result = await response.json();
    
    setSyncing(null);
    toast.success(`Synced ${result.recordsProcessed} records`);
  };
  
  return (
    <div className="sync-dashboard">
      <h2>Showdown Data Sync</h2>
      
      <div className="sync-controls">
        {['tiers', 'moves', 'abilities', 'items'].map(type => (
          <button
            key={type}
            onClick={() => syncData(type)}
            disabled={syncing !== null}
            className="sync-button"
          >
            {syncing === type ? 'Syncing...' : `Sync ${type}`}
          </button>
        ))}
      </div>
      
      <SyncHealthStatus />
      <RecentSyncLogs />
    </div>
  );
}
```

## Rollback Strategy

### Version Control
```sql
-- Keep historical data for rollback
CREATE TABLE sync_history (
  id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  data_snapshot JSONB NOT NULL,
  sync_timestamp TIMESTAMP NOT NULL,
  version_hash TEXT NOT NULL
);

-- Trigger to archive before update
CREATE TRIGGER archive_before_sync
BEFORE UPDATE ON competitive_tiers
FOR EACH ROW
EXECUTE FUNCTION archive_sync_data();
```

### Rollback Procedure
1. Identify problematic sync from logs
2. Retrieve previous version from history
3. Restore data with transaction
4. Update sync metadata
5. Notify team of rollback

## Performance Optimization

### Batch Processing
- Process in chunks of 100-1000 records
- Use database transactions
- Implement connection pooling

### Parallel Sync
- Sync independent data types concurrently
- Use worker threads for CPU-intensive parsing
- Limit concurrent connections

### CDN Integration
```typescript
// Static data served from CDN
const CDN_ENDPOINTS = {
  'type-chart': 'https://cdn.dextrends.com/showdown/type-chart.json',
  'abilities': 'https://cdn.dextrends.com/showdown/abilities.json'
};
```

## Disaster Recovery

### Backup Strategy
1. **Pre-sync**: Automatic backup before each sync
2. **Daily**: Full database backup
3. **Weekly**: Archived to cold storage
4. **Monthly**: Verified restore test

### Recovery Time Objectives
- **RTO**: 1 hour (restore from backup)
- **RPO**: 24 hours (daily backups)

## Future Improvements

1. **Real-time Sync**: WebSocket connection for instant updates
2. **Differential Sync**: Only sync changed records
3. **Multi-region**: Replicate data globally
4. **GraphQL Subscriptions**: Push updates to clients
5. **Machine Learning**: Predict update patterns

## Monitoring Checklist

- [ ] All sync jobs completing successfully
- [ ] Sync duration within thresholds
- [ ] Data validation passing
- [ ] Cache hit rates >90%
- [ ] No error logs in last 24h
- [ ] Database size growth normal
- [ ] API rate limits not exceeded

This strategy ensures reliable, efficient synchronization of Pokemon Showdown data while maintaining system performance and data integrity.