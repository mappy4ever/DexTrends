# Project Resources

Supporting files for the DexTrends project.

## Structure

```
/database     # Supabase SQL schemas
/config       # Configuration templates
/tests        # Test configuration and mocks
/utilities    # Fix scripts (Python)
/examples     # Code examples
/docs         # Additional documentation (archived)
```

## Database Schemas

Located in `/database/`:
- `supabase-schema.sql` - Main database schema
- `supabase-collections-schema.sql` - Collections feature
- `supabase-price-history-schema.sql` - Price history tracking
- `unified_cache_migration.sql` - Cache table migration

## Test Configuration

Located in `/tests/config/`:
- `tsconfig.json` - TypeScript config for tests
- `lighthouserc.json` - Lighthouse performance config
- `commitlint.config.js` - Commit message linting
