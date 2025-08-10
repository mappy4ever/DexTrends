# CLAUDE.md - DexTrends AI Assistant Context

DexTrends is a Pokemon TCG and Pokedex application built with Next.js 15.3.1 and TypeScript.

## UI/UX Guidelines
- **NO EMOJIS** - Never use emojis in code, UI, or user-facing text
- Use text labels, abbreviations, or SVG icons instead
- For status indicators use: "PHY", "SPE", "STA" not emoji icons
- For data display use: "Power: 90" not emoji symbols

## CRITICAL: Prevent Duplicates
Before creating ANY new file or function:
1. **ALWAYS search first** - Use Grep/LS to check if functionality exists
2. **Reuse over recreate** - Extend existing code instead of creating new files
3. Common locations: `/utils/`, `/components/ui/`, `/hooks/`, `/types/`

## Process Management & Resource Usage
**IMPORTANT**: To prevent process accumulation and system slowdown:
1. **Use `npx tsc --noEmit`** for type checking (doesn't leave processes running)
2. **Kill dev servers immediately** after use: `pkill -f "next dev"`
3. **Only run `npm run dev`** when actively testing functionality
4. **Monitor processes**: `ps aux | grep jest-worker | wc -l` (if > 20, run cleanup)
5. **After completing tasks**: Always run `pkill -9 -f "jest-worker"`

## Key Commands
```bash
# Development (use sparingly)
npm run dev              # Start dev server (ALWAYS KILL AFTER USE)

# Type checking (preferred - no lingering processes)
npx tsc --noEmit         # One-time type check

# Other commands
npm run lint             # Run ESLint  
npm test                 # Run Playwright tests

# Cleanup commands
pkill -f "next dev"      # Kill dev server
pkill -9 -f "jest-worker" # Kill stuck processes
rm -rf .next node_modules/.cache # Clear caches
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

## Technical Debt Tracking
- **Active Remediation**: See `/TECHNICAL_DEBT_PLAN.md` for current progress
- **Status**: 90+ issues identified, 0% resolved
- **Priority Focus**: Removing console.logs, fixing TypeScript errors, consolidating duplicate code
- **Session Continuity**: Check TECHNICAL_DEBT_PLAN.md at session start for next tasks