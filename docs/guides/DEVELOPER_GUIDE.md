# DexTrends Developer Guide

## Before Creating New Files

### Search Checklist
Always run these searches before creating any new file:

```bash
# 1. Search for similar function names
grep -r "functionName" . --exclude-dir=node_modules

# 2. Search for similar components
find . -name "*ComponentName*" -type f | grep -v node_modules

# 3. Search for existing utilities
ls utils/ | grep -i "keyword"

# 4. Search for types
find types/ -name "*.d.ts" | xargs grep -l "TypeName"

# 5. Check if hook exists
ls hooks/ | grep -i "useSomething"

# 6. Search across all TypeScript/JavaScript files
grep -r "functionality" --include="*.ts" --include="*.tsx" . --exclude-dir=node_modules
```

## Directory Quick Reference

### Common Locations for Existing Code
- **Animations**: `/utils/motion.tsx`, `/components/ui/animations/`
- **API/Data Fetching**: `/utils/apiutils.ts`, `/utils/pokemonSDK.ts`
- **Caching**: `/utils/UnifiedCacheManager.ts`, `/utils/cacheManager.ts`
- **Components**: `/components/ui/` (cards, modals, charts, forms subdirectories)
- **Hooks**: `/hooks/` (useDebounce, useInfiniteScroll, etc.)
- **Loading**: `/utils/unifiedLoading.tsx`, `/components/ui/PokeballLoader.tsx`
- **Pokemon Utilities**: `/utils/pokemonutils.ts`, `/utils/pokemonHelpers.ts`
- **State Management**: `/context/UnifiedAppContext.tsx`
- **Types**: `/types/` (api/, components/, context/, etc.)

## Development Patterns

### API Calls
```typescript
// Always use the caching utility
import { fetchData } from '../utils/apiutils';
const data = await fetchData(url);
```

### Navigation
```typescript
// Use Next.js router, NOT window.location
import { useRouter } from 'next/router';
const router = useRouter();
router.push('/path');
```

### Error Handling
```typescript
// Return empty data, don't throw
try {
  const data = await fetchData(url);
  return data || [];
} catch (error) {
  console.error('Error:', error);
  return [];
}
```

### TypeScript Best Practices
- Check nullable properties: `pokemon?.name`
- Handle query params: `Array.isArray(id) ? id[0] : String(id)`
- Use proper type imports from `/types/`

## Common Issues & Solutions

### Build Issues
- Do NOT add `"type": "module"` to package.json
- Run lint & typecheck before committing
- Check for missing dependencies

### Performance
- Use progressive loading for large lists
- Implement proper error boundaries
- Add loading states with unified loaders

### Testing
- Use `data-testid` attributes for reliable selection
- Mock all external APIs
- Use wait strategies for async operations

## File Creation Examples

### ❌ BAD: Creating duplicate functionality
```typescript
// DON'T: Create new loading component
export const MyNewLoader = () => <div>Loading...</div>

// DO: Use existing unified loader
import { PageLoader } from '../utils/unifiedLoading';
```

### ✅ GOOD: Extending existing functionality
```typescript
// Build on existing utilities
import { fetchData } from '../utils/apiutils';

export const fetchWithTimeout = (url, timeout) => {
  return Promise.race([
    fetchData(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
};
```

## Quick URLs for Testing
```
http://localhost:3001/pokedex           # Main Pokedex
http://localhost:3001/pokedex/25        # Pokemon detail
http://localhost:3001/battle-simulator  # Battle simulator
http://localhost:3001/pocketmode        # Pocket TCG
```