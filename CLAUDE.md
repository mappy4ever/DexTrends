# DexTrends AI Assistant Context - MASTER DOCUMENT

## ⚠️ CRITICAL: Read This First
This is the SINGLE SOURCE OF TRUTH for the DexTrends project.
- **Last Updated**: 2025-09-08
- **Architecture Version**: 3.0 (Simplified & Cleaned)
- **Component Status**: Phase 8 cleanup completed

## 🧹 MANDATORY SESSION CLEANUP

### At End of EVERY Session
```bash
# 1. Remove temporary files
rm -f *.sh *.json test-results.* 

# 2. Remove report files  
rm -f *_REPORT.md *_report.* stage-*.md phase-*.md

# 3. Clean up any backup directories
rm -rf backups/ archived-components/ scripts/migration/

# 4. Keep only essential docs in root
# Essential: CLAUDE.md, README.md, package.json, tsconfig.json
# Move others to docs/archive/ if needed
```

### File Organization Rules
1. **Root Directory**: Keep minimal - only essential config files
2. **Documentation**: Use `docs/` directory for non-essential docs
3. **No Temporary Files**: Delete all .sh scripts, test reports after use
4. **No Redundant Backups**: Use git for version control, not backup folders

## Project Overview
DexTrends is a Pokemon TCG and Pokedex application.
- **Framework**: Next.js 15.3.1
- **Language**: TypeScript (STRICT mode, zero 'any' types)
- **Architecture**: UNIFIED RESPONSIVE (no separate mobile/desktop)
- **Testing**: Playwright E2E tests
- **State**: Production app with massive technical debt

## 🚨 CRITICAL VIOLATIONS TO AVOID

### 1. NEVER Create Duplicate Components
Before creating ANY component:
1. Check `/components/ui/` for existing components
2. Check `COMPONENT_INVENTORY.md` for actual purposes (names often LIE!)
3. Current duplicates being cleaned up:
   - 17 Modal components → 4
   - 49 Card components → 10  
   - 11 Skeleton systems → 2

### 2. Component Naming Confusion - CRITICAL
**"Card" means 3 DIFFERENT things:**
- **UI Container** (Card.tsx) → Being renamed to Container.tsx
- **TCG Trading Card** (UnifiedCard.tsx) → Being renamed to TCGCard.tsx
- **Pokemon Display** (PokemonTile.tsx) → Keep name

**Misleading Names to Fix:**
- `SimpleCardWrapper` → Actually complex TCG logic!
- `Enhanced*/Advanced*/Unified*` → Remove these prefixes
- Component names often LIE about their purpose

### 3. Mobile Patterns - DO NOT USE
❌ **WRONG** (old pattern - still exists in codebase!):
```typescript
// NEVER DO THIS
{isMobileView ? <MobileLayout> : <DesktopLayout>}
import MobileComponent from '/components/mobile/*'
const [isMobileView, setIsMobileView] = useState(false);
```

✅ **CORRECT** (unified approach):
```typescript
// ALWAYS DO THIS
<Component className="p-4 md:p-6 lg:p-8" />
const viewport = useViewport(); // Single hook (needs creation)
```

## Current Architecture Crisis

### Component Explosion Stats
- **Current**: ~300 components (66% are duplicates!)
- **Target**: ~80-100 components
- **To Delete**: ~200 components
- **Bundle Impact**: 40-50% size reduction possible

### Major Issues Found
1. **17 different Modal implementations** (most do same thing)
2. **49 "Card" components** (only ~10 unique purposes)
3. **Mobile directory exists** (`/components/mobile/` violates unified architecture)
4. **Misleading names everywhere** (Enhanced, Advanced, Unified prefixes)
5. **Inconsistent viewport detection** (some use 460px, some 640px)

## Active Cleanup Project (September 2024)

### What We're Doing
Consolidating ~300 components → ~80-100 through:
1. Merging duplicate functionality
2. Fixing misleading names
3. Deleting mobile-specific code
4. Creating clear component hierarchy

### Progress Tracking
See `CURRENT_WORK.md` for:
- Detailed consolidation plan
- Progress checkboxes
- Session handoff notes
- Known blockers

## Correct Patterns & Component Selection

### Component Selection Guide
| Need | Use This | NOT These |
|------|----------|-----------|
| Modal | `Modal.tsx` | UnifiedModal, AdaptiveModal, ConsistentModal, etc. |
| Container | `Container.tsx` (was Card) | GlassContainer, SimpleCard, Card |
| TCG Card | `TCGCard.tsx` (was UnifiedCard) | Advanced3DCard, SimpleCardWrapper |
| Pokemon | `PokemonTile.tsx` | EnhancedPokemonCard, PokemonCard |
| Loading | `Skeleton.tsx` | SkeletonSystem, LoadingStates, DexTrendsLoading |
| Button | `Button.tsx` | GradientButton, CircularButton, MotionButton |

### Viewport Detection (Needs Standardization)
```typescript
// CORRECT - Create and use this pattern
import { useViewport } from '@/hooks/useViewport';
const viewport = useViewport();
if (viewport.isMobile) { /* responsive logic */ }

// WRONG - Direct checks (found throughout codebase)
if (window.innerWidth < 460) { }
if (window.innerWidth < 640) { } // Inconsistent!
```

### Component Import Patterns
```typescript
// CORRECT
import { Button } from '@/components/ui/Button';
import { TCGCard } from '@/components/tcg/TCGCard';

// WRONG  
import MobileButton from '@/components/mobile/Button';
import EnhancedButton from '@/components/ui/EnhancedButton';
```

## Essential Commands
```bash
npm run dev              # Start dev server
npx tsc --noEmit        # Type check (must stay at 0 errors)
npm run lint            # ESLint
npm test                # Playwright E2E tests

# Check duplicate components
find components -name "*Modal*" | wc -l  # Currently 17, should be 4
find components -name "*Card*" | wc -l   # Currently 49, should be ~10
```

## Core Utilities (Use These!)
- `logger` from `/utils/logger` - Production logging (NOT console.log)
- `fetchJSON()` from `/utils/unifiedFetch` - API calls
- `cn()` from `/utils/cn` - Tailwind class merging
- `useViewport()` from `/hooks/useViewport` - Viewport detection (TO CREATE)

## Rules for AI Assistants

### Before Creating Components
1. **READ** `COMPONENT_INVENTORY.md` - Shows actual purposes
2. **CHECK** `/components/ui/` for existing components
3. **VERIFY** component purpose (names often lie!)
4. **NEVER** trust component names at face value

### During Development
1. **NEVER** create mobile-specific components
2. **NEVER** use Enhanced/Advanced/Unified prefixes
3. **ALWAYS** use descriptive, specific names
4. **ALWAYS** maintain TypeScript strict mode (zero 'any')
5. **ALWAYS** use logger instead of console.log
6. **NEVER** create duplicate functionality

### Architecture Rules
1. **NO** separate mobile/desktop components
2. **NO** conditional rendering based on viewport
3. **YES** responsive CSS classes
4. **YES** single component for all viewports

## Quick Reference Paths
- **Main Documentation**: `CLAUDE.md` (this file) - Core rules & context
- **Project README**: `README.md` - Public project documentation
- **Archived Docs**: `/docs/archive/` - Historical documentation (reference only)

## Working Components (DO NOT TOUCH)
These were properly implemented and tested:
- Form components (`Select.tsx`, `Checkbox.tsx`, `Radio.tsx`)
- `TouchTarget.tsx` - Touch compliance wrapper
- Service Worker (`/public/sw.js`)
- E2E tests (`/tests/*.spec.ts`)

## Known Traps & Issues
1. **Component names lie** - SimpleCardWrapper is complex
2. **"Card" confusion** - Used for 3 different concepts
3. **Mobile directory exists** - Should be deleted
4. **Viewport inconsistency** - Some use 460px, others 640px
5. **Deprecated wrappers** - ConsistentModal, EnhancedModal still used

## Session Management

### Starting a Session
1. Read this CLAUDE.md file for context
2. Check git status for current work state
3. Run dev server: `npm run dev`
4. Check TypeScript: `npx tsc --noEmit`

### Ending a Session
1. Run cleanup commands (see MANDATORY SESSION CLEANUP above)
2. Commit changes with descriptive message
3. Remove all temporary files
4. Keep root directory clean

---
*Last Updated: 2025-09-08*
*Purpose: Single source of truth for DexTrends development*
*Remember: Clean up at the end of EVERY session!*