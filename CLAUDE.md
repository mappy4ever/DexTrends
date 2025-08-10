# CLAUDE.md - DexTrends AI Assistant Context

DexTrends is a Pokemon TCG and Pokedex application built with Next.js 15.3.1 and TypeScript.

## Core Rules
- **NO 'any' types** - TypeScript strict mode enforced, zero errors maintained
- **NO emojis** - Use text labels, abbreviations, or SVG icons instead
- **Search before creating** - Use Grep/LS to check if functionality exists in `/utils/`, `/components/ui/`, `/hooks/`, `/types/`
- **Use logger** - Import from `/utils/logger` instead of console.log

## Essential Commands
```bash
npm run dev              # Start dev server
npx tsc --noEmit         # Type check (no lingering processes)
npm run lint             # Run ESLint
npm test                 # Run Playwright tests
```

## Core Utilities
- `logger` from `/utils/logger` - Production-safe logging
- `fetchJSON()` from `/utils/unifiedFetch` - Primary API method
- `UnifiedCacheManager` from `/utils/UnifiedCacheManager` - Caching
- `cn()` from `/utils/cn` - Tailwind class merging
- `pokemonTypeColors` from `/utils/pokemonTypeColors` - Type styling

## Common Patterns
```typescript
// Logging
import logger from '@/utils/logger';
logger.info('Message', { context });

// API calls
import { fetchJSON } from '@/utils/unifiedFetch';
const data = await fetchJSON('/api/endpoint');

// Error handling
import { ApiError } from '@/utils/apiutils';
```

## Testing
- Tests in `/tests/` directory using Playwright
- Use `data-testid` attributes for element selection
- Dev server runs on port 3001 for tests