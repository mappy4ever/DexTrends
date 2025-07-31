# CLAUDE.md - DexTrends AI Assistant Context

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application built with Next.js 15.3.1 and TypeScript.

## 🚨 CRITICAL: Prevent Code Duplication & Unnecessary Files
**MANDATORY WORKFLOW - Follow this EVERY time before creating code:**

### Before Creating ANY File, Function, or Component:
1. **SEARCH FIRST** (Use multiple search strategies):
   - `Grep` for function/component names and variations
   - `LS` to check directory structures
   - Search for similar functionality with different names
   - Check imports in related files
   
2. **VERIFY NON-EXISTENCE**:
   - If not found, search again with partial names
   - Check common locations: `/utils/`, `/components/`, `/hooks/`, `/types/`
   - Look for typos or alternative naming conventions
   
3. **EXTEND vs CREATE**:
   - Found similar? EXTEND it, don't create new
   - Found broken? FIX it, don't replace
   - Only create new if genuinely missing after thorough search

### Common Anti-Patterns to AVOID:
❌ Creating `useNewFeature` when `useFeature` exists  
❌ Making `ComponentV2` instead of fixing `Component`  
❌ Adding `utilsNew.ts` rather than extending `utils.ts`  
❌ Creating duplicate types in new files  
❌ Making new API endpoints when existing ones can be extended

### Search Examples:
```bash
# Before creating a new hook
grep -r "use.*Pokemon" --include="*.ts" --include="*.tsx"
grep -r "Pokemon.*hook" --include="*.ts" --include="*.tsx"
ls -la hooks/

# Before creating a utility
grep -r "formatDate\|dateFormat\|formatTime" utils/
grep -r "export.*function.*date" utils/

# Before creating a component  
grep -r "Modal\|Dialog\|Popup" components/
ls -la components/ui/
```

**Remember**: Technical debt grows exponentially. One duplicate today becomes ten tomorrow. ALWAYS verify twice before creating once.

## NPM Scripts
```bash
# Development
npm run dev              # Start dev server (default port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript check

# Testing
npm test                 # Run all Playwright tests
npm run test:ui          # Tests with interactive UI
npm run test:headed      # Tests with visible browser
npm run test:debug       # Debug tests step by step
npm run test:mobile      # Run mobile-specific tests
npm run test:visual      # Visual regression tests
npm run test:prod        # Test production build
npm run test:report      # Show test report

# Utilities
npm run scrape           # Run web scraper
npm run scrape:all       # Scrape all data sources
```

## Core Utilities & Patterns

### API & Data Fetching
- **Primary**: `fetchJSON()` from `/utils/unifiedFetch` - Use for all API calls
- **Legacy**: `fetchData()` from `/utils/apiutils` - Wrapper around fetchJSON
- **Caching**: `UnifiedCacheManager` from `/utils/UnifiedCacheManager`
- **Pokemon**: `sanitizePokemonName()` from `/utils/pokemonNameSanitizer`

### State Management
- **Global State**: `UnifiedAppContext` from `/context/UnifiedAppContext`
- **Hooks**: `useUnifiedApp()` from `/hooks/useUnifiedApp`

### Loading & UI States
- **Loading Component**: `UnifiedLoader` from `/utils/unifiedLoading`
- **Skeletons**: Components in `/components/ui/SkeletonLoadingSystem`
- **Error Boundaries**: `ErrorBoundary` from `/components/ErrorBoundary`

### Common Hooks
- `/hooks/useDebounce` - Debouncing for search/input
- `/hooks/useInfiniteScroll` - Infinite scrolling
- `/hooks/useAnimations` - Animation controls
- `/hooks/useNotifications` - Notification system
- `/hooks/useKeyboardNavigation` - Keyboard shortcuts
- `/hooks/usePWA` - PWA features

### Key Components
- **Layout**: `/components/layout/SidebarLayout` - Main app layout
- **Cards**: `/components/ui/cards/` - Various card components
- **Modals**: `/components/ui/AdvancedModalSystem` - Modal system
- **Animation**: `/components/ui/EnhancedAnimationSystem` - Animations
- **Mobile**: `/components/mobile/` - Mobile-specific components

### Navigation
- **Router**: Use Next.js `useRouter` hook, NOT `window.location`
- **Links**: Use Next.js `Link` component for internal navigation

### Type Definitions
- **API Types**: `/types/api/` - Pokemon, cards, API responses
- **Component Types**: `/types/components/` - Component props and events
- **Context Types**: `/types/context/` - Context and state types
- **Battle System**: `/types/battle.d.ts` - Battle simulation types
- **Global Types**: `/types/global.d.ts` - Global type extensions

### Performance & Optimization
- **Performance Monitor**: `/utils/performanceMonitor` - Track metrics
- **Image Optimization**: `/utils/imageOptimization` - Image handling
- **Cache Manager**: `/utils/UnifiedCacheManager` - Centralized caching
- **React Optimizations**: `/utils/reactOptimizations` - React helpers

### Mobile & PWA
- **Mobile Utils**: `/utils/mobileUtils` - Mobile detection/utilities
- **PWA Provider**: `/components/pwa/PWAProvider` - PWA features
- **Touch Gestures**: `/components/mobile/TouchGestures` - Touch handling
- **iOS Fixes**: `/utils/iosFixes` - iOS-specific fixes

### Animation & UI
- **Motion Components**: `/components/dynamic/Motion*` - Framer Motion
- **Animation Variants**: `/utils/animationVariants` - Reusable animations
- **Animation System**: `/components/ui/EnhancedAnimationSystem`
- **Skeleton Loading**: `/components/ui/SkeletonLoadingSystem`

## Testing
- Tests in `/tests/` directory
- Use `data-testid` attributes for test selectors
- All external APIs are mocked
- Run tests with dev server on port 3001

## Common Conventions & Patterns

### Styling
- **Class Names**: Use `cn()` from `/utils/cn` for merging Tailwind classes
- **Theme**: Access theme values via `pokemonTheme` from `/utils/pokemonTheme`
- **Type Colors**: Use `pokemonTypeColors` from `/utils/pokemonTypeColors`

### Error Handling
- **API Errors**: Use `ApiError` class from `/utils/apiutils`
- **Error Boundaries**: Wrap components with `ErrorBoundary`
- **Circuit Breaker**: Use `/utils/circuitBreaker` for external services

### Data Fetching Patterns
```typescript
// Preferred pattern using unifiedFetch
import { fetchJSON } from '@/utils/unifiedFetch';
const data = await fetchJSON('/api/endpoint');

// Legacy pattern (still supported)
import { fetchData } from '@/utils/apiutils';
const data = await fetchData('/api/endpoint');
```

### Environment Variables
- **Pokemon TCG API Key**: `POKEMON_TCG_API_KEY`
- **Cache Settings**: Configured in `UnifiedCacheManager`
- **API URLs**: Define in environment-specific configs

## Branch Info
- Current: `main`
- Main: `main` (for PRs)

## Specialized Development Agents
Claude has specialized agents for development tasks:
- **todo-resolver**: Find/fix TODOs and technical debt
- **doc-sync**: Keep documentation synchronized with code
- **dep-security**: Manage dependency security and updates
- **work-verifier**: Verify work completion matches requirements
- **duplicate-checker**: Prevent code duplication, ensure reuse
- **ui-designer**: Create components with DexTrends design language
- **ux-enhancer**: Add animations and smooth interactions

See `.claude/agents/` for detailed agent capabilities.

## Documentation
For detailed information see:
- Developer Guide: `/project-resources/docs/DEVELOPER_GUIDE.md`
- Project Structure: `/project-resources/docs/PROJECT_STRUCTURE.md`
- Testing Guide: `/TESTING_PROTOCOL.md`
- Agent Definitions: `/.claude/agents/index.md`
- **Pokemon Showdown Integration**: `/docs/showdown-integration/` - Competitive data integration guide