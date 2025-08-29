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

## Mobile Development
- **IMPORTANT**: Check `PROJECT_MOBILE_STATUS.md` for current mobile rebuild status (~35% complete)
- **Mobile breakpoint**: 320px - 460px (tablet starts at 461px)
- **Viewport detection**: Use `window.innerWidth < 460` NOT user agent
- **Touch targets**: Minimum 48px for all interactive elements
- **Test at 320px** to ensure smallest phones work

### Available Mobile Components (DO NOT RECREATE)
- `MobileLayout` - Full layout wrapper with safe areas
- `VirtualPokemonGrid` - Virtual scrolling grid (used in Pokédex)
- `BottomSheet` - Bottom sheet overlays (used in Pokédex)
- `PullToRefresh` - Pull to refresh with Pokeball animation
- `MobileSearchExperience` - Advanced mobile search
- `TypeEffectivenessCards` - Mobile type chart display
- See `/components/mobile/` for full list

### Mobile Patterns
```typescript
// Mobile detection
const [isMobileView, setIsMobileView] = useState(false);
useEffect(() => {
  const checkMobile = () => setIsMobileView(window.innerWidth < 460);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Use MobileLayout for mobile views
{isMobileView ? (
  <MobileLayout>
    {/* Mobile content */}
  </MobileLayout>
) : (
  {/* Desktop content */}
)}
```