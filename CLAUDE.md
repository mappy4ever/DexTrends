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

## Important Notes
- Do NOT add `"type": "module"` to package.json - it breaks Next.js webpack loaders
- The Node.js module warning for scrapers can be ignored or addressed differently
