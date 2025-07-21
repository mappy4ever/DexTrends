# CLAUDE.md - DexTrends Project Context

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application built with Next.js and TypeScript.

## CRITICAL RULES - PREVENT DUPLICATES

### Before Creating ANY New File or Function:
1. **ALWAYS search first** - Use Grep/LS tools to check if similar functionality exists
2. **Check multiple locations** - Functions might be in utils/, components/ui/, or other directories
3. **Look for existing patterns** - This codebase likely already has what you need
4. **Reuse over recreate** - Modify/extend existing code instead of creating new files

### Common Duplicate Pitfalls to Avoid:
- Loading components - Check `/components/ui/loading/` and `/utils/unifiedLoading.tsx`
- Modal components - Check `/components/ui/modals/`
- Animation utilities - Check `/utils/motion.tsx` and `/components/ui/animations/`
- API utilities - Check `/utils/apiutils.ts`
- Type definitions - Check `/types/` directory
- Hooks - Check `/hooks/` directory

### If You Must Create Something New:
1. Document WHY existing solutions don't work
2. Check if you can extend existing code instead
3. Follow existing naming conventions
4. Update relevant index files

## Technical Stack
- **Framework**: Next.js 15.3.5 with TypeScript (100% coverage)
- **State**: React Context (UnifiedAppContext)
- **Caching**: 3-tier (Memory → LocalStorage → Supabase)
- **Testing**: Playwright E2E tests
- **Styling**: Tailwind CSS

## Key Commands
```bash
npm run dev          # Dev server (port 3001)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm test             # Run all tests
npm run test:ui      # Test UI mode
```

## Project Structure
```
/components     # React components
/pages          # Next.js pages & API routes
/utils          # Utility functions
/types          # TypeScript types
/tests          # Playwright tests
/styles         # CSS files
```

## Critical Patterns

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

## Testing Guidelines

### Test Infrastructure
- API mocking in `/tests/helpers/api-mock.ts`
- Wait strategies in `/tests/helpers/wait-strategies.ts`
- Mock data in `/tests/helpers/mock-api-data.ts`
- Custom fixtures in `/tests/fixtures/test-base.ts`

### Key Test Patterns
- Use `data-testid` attributes
- Apply wait strategies for async ops
- All external APIs are mocked

## File Creation Examples - What NOT to Do

### ❌ BAD: Creating duplicate functionality
```typescript
// DON'T: Create new loading component
// components/MyNewLoader.tsx ❌
export const MyNewLoader = () => <div>Loading...</div>

// DO: Use existing unified loader
import { PageLoader } from '../utils/unifiedLoading';
```

### ❌ BAD: Creating new utility when one exists
```typescript
// DON'T: Create new fetch wrapper
// utils/myFetch.ts ❌
export const myFetch = async (url) => {...}

// DO: Use existing apiutils
import { fetchData } from '../utils/apiutils';
```

### ✅ GOOD: Extending existing functionality
```typescript
// If you need new functionality, extend existing:
import { fetchData } from '../utils/apiutils';

export const fetchWithTimeout = (url, timeout) => {
  // Builds on existing fetchData
  return Promise.race([
    fetchData(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
};
```

## Common Issues & Solutions

### TypeScript
- Check nullable properties: `pokemon?.name`
- Handle query params: `Array.isArray(id) ? id[0] : String(id)`

### Build
- Do NOT add `"type": "module"` to package.json
- Run lint & typecheck before committing

### Performance
- Use progressive loading for large lists
- Implement proper error boundaries
- Add loading states

## Quick URLs
```
http://localhost:3001/pokedex           # Main Pokedex
http://localhost:3001/pokedex/25        # Pokemon detail
http://localhost:3001/battle-simulator  # Battle simulator
http://localhost:3001/pocketmode        # Pocket TCG
```

## Git Workflow
```bash
# Current branch
git checkout optimization-branch-progress

# Commit pattern
git add -A
git commit -m "fix: [description]"
git push origin optimization-branch-progress
```

## Performance Targets
- Bundle size: < 700KB
- Test suite: < 10 minutes
- Lighthouse: > 90

## Search Checklist Before Creating Files

Before creating any new file, run these searches:

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
grep -r "functionality" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . --exclude-dir=node_modules
```

## Directory Quick Reference for Common Needs

- **Animations**: `/utils/motion.tsx`, `/components/ui/animations/`
- **API/Data Fetching**: `/utils/apiutils.ts`, `/utils/pokemonSDK.ts`
- **Caching**: `/utils/UnifiedCacheManager.ts`, `/utils/cacheManager.ts`
- **Components**: `/components/ui/` (has subdirectories for cards, modals, charts, etc.)
- **Forms**: `/components/ui/forms/`
- **Hooks**: `/hooks/` (useDebounce, useInfiniteScroll, etc.)
- **Loading**: `/utils/unifiedLoading.tsx`, `/components/ui/PokeballLoader.tsx`
- **Pokemon Utilities**: `/utils/pokemonutils.ts`, `/utils/pokemonHelpers.ts`
- **State Management**: `/context/UnifiedAppContext.tsx`
- **Types**: `/types/` (api/, components/, context/, etc.)

---
For detailed documentation, see `/project-resources/docs/`