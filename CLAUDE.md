# CLAUDE.md - DexTrends Project Context

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application with advanced features for tracking cards, prices, and Pokemon data. Always add any changes they are key to Claude knowing for development as we make sysmetic changes here to ensure workflow is seemless. 

## Recent Changes (July 6, 2025)

### 1. Comprehensive Scraper System Enhancement
- **Gym Leader Scraper**: 
  - Fixed to exclude Pokemon images and small sprites
  - Prioritizes full-body artwork (minimum 250x400px)
  - Downloads main image + up to 2 alternate game-specific versions
  - Naming: `{region}-{name}-main.png`, `{region}-{name}-{game}.png`
  
- **Elite Four & Champions Scraper**: 
  - Scrapes all Elite Four members and Champions
  - Same high-quality image filtering as gym leaders
  - Organized by region with champion data separate
  
- **Badge Scraper**: 
  - Downloads all gym badges by region
  - Filters for badge-specific images
  - Naming: `{region}-{badge-name}.png`
  
- **Energy Type Scraper**: 
  - Downloads TCG energy card images
  - Gets basic energy, special energy, and card variants
  - Organized by energy type (Fire, Water, etc.)
  
- **Region Map Scraper**: 
  - Downloads high-quality region maps
  - Gets main map + game-specific variants + detailed maps
  - Minimum 400x300px, prioritizes 800px+ width

### 2. Project Organization
Created a centralized `project-resources/` directory containing:
- `/config` - Configuration files (PostCSS, Tailwind, env examples)
- `/database` - Supabase SQL schemas
- `/docs` - All documentation (38+ files)
- `/examples` - Code examples
- `/logs` - Build and error logs
- `/tests` - All test-related files including:
  - `/__mocks__` - Test mocks
  - `/config` - Test configurations
  - `/coverage` - Coverage reports
  - `/scripts` - Test scripts
  - `/reports` - Test reports
- `/utilities` - Python fix scripts and requirements

### 3. Root Directory Cleanup
- Removed duplicate `next.config.js` (kept `.mjs` version)
- Created symlinks for essential configs that need root access
- Updated `.gitignore` for TypeScript build artifacts
- Moved all documentation, tests, and utility files to `project-resources/`

## Important Symlinks
The following files are symlinked from `project-resources/`:
- `tsconfig.json` → `project-resources/tests/config/tsconfig.json`
- `.eslintrc.json` → `project-resources/tests/config/.eslintrc.json`
- `.lintstagedrc.json` → `project-resources/tests/config/.lintstagedrc.json`
- `postcss.config.js` → `project-resources/config/postcss.config.js`
- `tailwind.config.js` → `project-resources/config/tailwind.config.js`
- `__mocks__` → `project-resources/tests/__mocks__`

## Core Application Structure
The following directories contain the main application code and should remain in root:
- `/components` - React components
- `/context` - React Context providers (state management)
- `/pages` - Next.js pages
- `/public` - Static assets
- `/styles` - CSS/styling
- `/utils` - Utility functions
- `/data` - Data files
- `/scripts` - Build/run scripts
- `/hooks` - Custom React hooks
- `/lib` - Library code
- `/types` - TypeScript type definitions

## Running the Scrapers

### Individual Scrapers:
```bash
# Setup directories first
npm run scrape:setup

# Scrape specific data types
npm run scrape:gym-leaders     # High-quality gym leader artwork
npm run scrape:elite-four      # Elite Four & Champions artwork  
npm run scrape:badges          # All gym badges
npm run scrape:energy          # TCG energy type cards
npm run scrape:maps            # High-quality region maps
npm run scrape:games           # Game cover art and logos

# Scrape everything at once
npm run scrape:all
```

### Naming Conventions:
- Gym Leaders: `{region}-{name}-main.png`
- Elite Four: `{region}-elite-four-{name}-main.png`
- Champions: `{region}-champion-{name}-main.png`
- Badges: `{region}-{badge-name}.png`
- Energy: `{type}-basic-energy.png`, `{type}-energy-card-1.png`
- Maps: `{region}-map-main.png`, `{region}-map-{game}.png`

### Data Storage:
- Images: `/public/images/scraped/{category}/`
- JSON data: `/public/data/scraped/{category}/`
- Categories: gym-leaders, elite-four, badges, energy, maps, games

## Testing
Test files and configurations are now in `project-resources/tests/`. Run tests with:
```bash
npm test
npm run test:iphone
```

## Documentation
All project documentation is in `project-resources/docs/`. Key files:
- `README.md` - Main project documentation
- `BULBAPEDIA_SCRAPER_README.md` - Scraper documentation
- `IPHONE_OPTIMIZATION_GUIDE.md` - iOS optimization guide
- `TESTING_PROTOCOL.md` - Testing guidelines

## Current State
- TypeScript migration completed
- ESLint and TypeScript checks re-enabled in build
- Project structure cleaned and organized
- Gym leader scraper optimized to exclude Pokemon images
- All non-code files centralized in `project-resources/`

## Final Cleanup (Completed)
- Removed 102 `.broken` files from `components/ui/`
- Moved misplaced `# Code Citations.md` from pages to `project-resources/docs/`
- Moved `utils/testSecurity.js` to `project-resources/tests/scripts/`
- Removed backup files (`deckbuilder.js.backup`)
- Moved component documentation (`qol/README.md`) to docs
- All test files, documentation, and utilities now properly organized

## Recent Analysis (July 11, 2025)

### Comprehensive Optimization Report Completed
- **Full codebase analysis** conducted with senior software architecture review
- **200+ components analyzed** for duplication and inefficiencies
- **43 utility files examined** for optimization opportunities
- **47 CSS files audited** for redundancy and performance issues
- **Build configuration reviewed** for security and optimization

### Key Findings
- **40+ duplicate component pairs** (JS/TSX versions with ~8,000 lines of redundant code)
- **Component duplication crisis**: LoadingSpinner, Modal, Navigation, AchievementSystem all duplicated
- **State management chaos**: 7 context providers with overlapping functionality
- **CSS redundancy**: 8 mobile CSS files with 50-60% optimization potential
- **Security vulnerabilities**: Next.js and dependency issues requiring immediate attention

### Critical Issues Identified
1. **HIGH PRIORITY**: Component JS/TSX duplication (40+ files)
2. **HIGH PRIORITY**: Modal system fragmentation (5 different implementations)
3. **HIGH PRIORITY**: Touch/gesture systems chaos (4 overlapping systems)
4. **HIGH PRIORITY**: Theme system duplication (4 files handling Pokemon colors)
5. **HIGH PRIORITY**: Multiple caching systems (3 different implementations)
6. **HIGH PRIORITY**: CSS file explosion (8 mobile files with overlapping rules)

### Optimization Potential
- **Bundle size reduction**: 50-60% possible
- **Memory usage reduction**: 30-40% achievable
- **Performance improvement**: 20-25% expected
- **CSS size reduction**: 50-60% with consolidation
- **Component count reduction**: From 200+ to ~120 components

### Implementation Strategy
- **Phase 1**: Security fixes and critical component consolidation
- **Phase 2**: CSS optimization and bundle improvements
- **Phase 3**: Performance enhancements and architecture improvements
- **Timeline**: 6-8 weeks for complete optimization

### Documentation
- **Comprehensive report**: `project-resources/docs/COMPREHENSIVE_OPTIMIZATION_REPORT.md`
- **Detailed analysis**: All findings documented with specific file paths and line numbers
- **Implementation roadmap**: Step-by-step optimization plan with priorities

## Important Notes
- Do NOT add `"type": "module"` to package.json - it breaks Next.js webpack loaders
- The Node.js module warning for scrapers can be ignored or addressed differently
- **OPTIMIZATION REQUIRED**: Codebase has significant duplication and inefficiencies that need systematic refactoring

## Optimization Project Progress (July 12, 2025)

### Completed Phases:

#### Phase 1: Security & Cleanup ✅
- Fixed security vulnerabilities in dependencies
- Updated critical dependencies (Next.js 15.3.5, TypeScript)
- Removed 10 duplicate components (modals, loading screens, etc.)
- Consolidated modal system into single implementation
- Merged 7 context providers → 1 UnifiedAppContext

#### Phase 2: State & Cache Management ✅
- **Phase 2A**: Unified context provider (7→1) in `/context/UnifiedAppContext.js`
- **Phase 2B**: Consolidated 4 cache systems → 1 UnifiedCacheManager
  - Created `/utils/UnifiedCacheManager.js` with 3-tier caching
  - Memory cache → LocalStorage → Database (Supabase)
  - Migrated all files to use unified cache
  - Created database migration: `/project-resources/database/unified_cache_migration.sql`

#### Phase 3: CSS Optimization ✅
- Merged 8 mobile CSS files → 1 unified file
- Created `/styles/unified-mobile.css`
- Reduced 3,156 lines → ~1,200 lines (62% reduction)
- Reduced CSS bundle size by 3.8 KB
- Updated imports in `_app.js` and `_app.minimal-safe.js`

### Current Build Status:
- Build succeeds with no errors (only ESLint warnings)
- CSS bundle: 52.6 KB (was 56.4 KB)
- First Load JS: 856 KB (was 860 KB)
- All paths: 804-918 KB range

### Next Phases:
- **Phase 4**: Bundle optimization and code splitting (IN PROGRESS)
- **Phase 5**: Performance enhancements (React.memo, memoization)
- **Phase 6**: Complete TypeScript migration

### Key Files Created/Modified:
- `/context/UnifiedAppContext.js` - Consolidated state management
- `/utils/UnifiedCacheManager.js` - Unified caching system
- `/styles/unified-mobile.css` - Consolidated mobile styles
- Updated all imports to use new unified systems
