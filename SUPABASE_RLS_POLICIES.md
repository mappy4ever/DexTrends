# Supabase Row Level Security (RLS) Policies for DexTrends

This document outlines the required Row Level Security policies for the DexTrends application. These policies should be implemented in the Supabase dashboard.

## Prerequisites

1. Enable RLS on all tables
2. Create appropriate roles and permissions
3. Ensure proper authentication is set up

## Tables and Required Policies

### 1. pokemon_cache
**Purpose**: Caches Pokemon data from PokeAPI

```sql
-- Enable RLS
ALTER TABLE pokemon_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (cached data is public)
CREATE POLICY "Allow public read access to pokemon cache" ON pokemon_cache
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert/update cache
CREATE POLICY "Allow authenticated users to update cache" ON pokemon_cache
FOR INSERT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update existing cache" ON pokemon_cache
FOR UPDATE
TO authenticated
USING (true);

-- Allow cleanup of expired entries
CREATE POLICY "Allow deletion of expired cache entries" ON pokemon_cache
FOR DELETE
TO authenticated
USING (expires_at < NOW());
```

### 2. card_cache
**Purpose**: Caches TCG card data

```sql
-- Enable RLS
ALTER TABLE card_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to card cache" ON card_cache
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to manage cache
CREATE POLICY "Allow authenticated users to insert card cache" ON card_cache
FOR INSERT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to update card cache" ON card_cache
FOR UPDATE
TO authenticated
USING (true);

-- Allow cleanup of expired entries
CREATE POLICY "Allow deletion of expired card cache" ON card_cache
FOR DELETE
TO authenticated
USING (expires_at < NOW());
```

### 3. user_favorites
**Purpose**: Stores user's favorite items (requires authentication)

```sql
-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only see their own favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert own favorites" ON user_favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own favorites
CREATE POLICY "Users can update own favorites" ON user_favorites
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete own favorites" ON user_favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 4. session_favorites
**Purpose**: Stores favorites for non-authenticated sessions

```sql
-- Enable RLS
ALTER TABLE session_favorites ENABLE ROW LEVEL SECURITY;

-- Allow public access with session ID
CREATE POLICY "Allow session-based favorites access" ON session_favorites
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Note: Session validation should be done at application level
```

### 5. card_price_history
**Purpose**: Stores historical price data for cards

```sql
-- Enable RLS
ALTER TABLE card_price_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to price history
CREATE POLICY "Allow public read access to price history" ON card_price_history
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert price data
CREATE POLICY "Allow authenticated users to insert price data" ON card_price_history
FOR INSERT
TO authenticated
USING (true);

-- Prevent updates to historical data
-- No UPDATE policy - historical data should be immutable

-- Allow deletion of old data (admin only)
CREATE POLICY "Allow service role to delete old price data" ON card_price_history
FOR DELETE
TO service_role
USING (collected_at < NOW() - INTERVAL '1 year');
```

### 6. price_collection_jobs
**Purpose**: Tracks price collection job status

```sql
-- Enable RLS
ALTER TABLE price_collection_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to job status
CREATE POLICY "Allow public read access to collection jobs" ON price_collection_jobs
FOR SELECT
TO public
USING (true);

-- Only authenticated users can create jobs
CREATE POLICY "Allow authenticated users to create jobs" ON price_collection_jobs
FOR INSERT
TO authenticated
USING (true);

-- Allow job status updates
CREATE POLICY "Allow authenticated users to update job status" ON price_collection_jobs
FOR UPDATE
TO authenticated
USING (true);
```

### 7. price_alerts
**Purpose**: User-specific price alerts

```sql
-- Enable RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own alerts
CREATE POLICY "Users can view own price alerts" ON price_alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only create their own alerts
CREATE POLICY "Users can create own price alerts" ON price_alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own alerts
CREATE POLICY "Users can update own price alerts" ON price_alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own alerts
CREATE POLICY "Users can delete own price alerts" ON price_alerts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## Security Best Practices

1. **Always enable RLS** on tables before adding policies
2. **Test policies** thoroughly in development
3. **Use service role** sparingly and only for administrative tasks
4. **Validate session IDs** at the application level for session-based features
5. **Monitor policy performance** as complex policies can impact query speed

## Implementation Steps

1. Access your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each policy creation script for your tables
4. Test each policy using the Supabase Table Editor
5. Monitor logs for any RLS violations

## Testing Policies

Use these queries to test your policies:

```sql
-- Test read access as anonymous user
SET ROLE anon;
SELECT * FROM pokemon_cache LIMIT 5;

-- Test authenticated user access
SET ROLE authenticated;
-- Set a test user ID
SET request.jwt.claim.sub = 'test-user-id';
SELECT * FROM user_favorites;

-- Reset role
RESET ROLE;
```

## Troubleshooting

If you encounter RLS errors:

1. Check that RLS is enabled on the table
2. Verify the user's authentication status
3. Review policy conditions
4. Check Supabase logs for detailed error messages
5. Test policies individually using the SQL editor

## Additional Notes

- These policies assume standard Supabase authentication setup
- Modify policies based on your specific authentication requirements
- Consider performance implications for complex policies
- Regular review and updates of policies is recommended