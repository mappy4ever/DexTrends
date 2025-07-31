# CLAUDE.md - DexTrends AI Assistant Context

DexTrends is a Pokemon TCG and Pokedex application built with Next.js 15.3.1 and TypeScript.

## 🚨 CRITICAL: Prevent Duplicates
Before creating ANY new file or function:
1. **ALWAYS search first** - Use Grep/LS to check if functionality exists
2. **Reuse over recreate** - Extend existing code instead of creating new files
3. Common locations: `/utils/`, `/components/ui/`, `/hooks/`, `/types/`

## Key Commands
```bash
npm run dev              # Start dev server
npm run lint             # Run ESLint  
npm run typecheck        # TypeScript check
npm test                 # Run Playwright tests
```

## Core Utilities Reference

### Data Fetching & State
- `fetchJSON()` from `/utils/unifiedFetch` - Primary API method
- `UnifiedCacheManager` from `/utils/UnifiedCacheManager` - Caching
- `UnifiedAppContext` from `/context/UnifiedAppContext` - Global state

### Common Hooks
- `/hooks/useDebounce` - Input debouncing
- `/hooks/useInfiniteScroll` - Scroll pagination
- `/hooks/useNotifications` - Toast notifications
- `/hooks/useKeyboardNavigation` - Keyboard shortcuts

### UI Components
- `/components/layout/SidebarLayout` - Main layout
- `/components/ui/AdvancedModalSystem` - Modals
- `/components/ui/SkeletonLoadingSystem` - Loading states
- `/components/ErrorBoundary` - Error handling

### Styling
- `cn()` from `/utils/cn` - Merge Tailwind classes
- `pokemonTypeColors` from `/utils/pokemonTypeColors` - Type colors

### Navigation
- Use Next.js `useRouter` hook (NOT window.location)
- Use `Link` component for internal links

## Development Patterns

### API Calls
```typescript
import { fetchJSON } from '@/utils/unifiedFetch';
const data = await fetchJSON('/api/endpoint');
```

### Error Handling
- Use `ErrorBoundary` component wrapper
- `ApiError` class from `/utils/apiutils`

### Testing
- Tests in `/tests/` directory
- Use `data-testid` attributes
- Dev server runs on port 3001 for tests

## Documentation
- Pokemon Showdown Integration: `/docs/showdown-integration/`
- Developer Guide: `/project-resources/docs/DEVELOPER_GUIDE.md`
- See `.claude/agents/` for specialized AI agents