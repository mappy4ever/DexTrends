# DexTrends AI Assistant Context - MASTER DOCUMENT

## ⚠️ CRITICAL: Read This First
This is the SINGLE SOURCE OF TRUTH. Ignore ALL other documentation unless specifically referenced here.
- **Last Updated**: 2024-09-01
- **Architecture Version**: 2.0 (Post-Cleanup)
- **Component Count**: ~300 (target: 80-100)

## 📚 DOCUMENTATION SYSTEM - WHERE TO FIND WHAT

### Session Start Checklist
```bash
1. Read CLAUDE.md (this file) - Core rules & context
2. Check CURRENT_WORK.md - Active tasks & progress
3. Review QUICK_START.md - If new to project
4. Scan CLEANUP_PLAN.md - Before ANY component work
5. Verify COMPONENT_INVENTORY.md - Before using components
```

### During Work References
| Need | Check File | Section |
|------|------------|---------|
| Creating component? | COMPONENT_INVENTORY.md | "Component Selection Decision Tree" |
| Fixing TypeScript? | QUICK_START.md | "Critical Rules" |
| Merging duplicates? | CLEANUP_PLAN.md | "Implementation Strategy" |
| Session progress? | CURRENT_WORK.md | "Active Tasks" |
| Component purpose? | COMPONENT_INVENTORY.md | "What It Actually Does" columns |

### Session End Requirements
1. **Update CURRENT_WORK.md**:
   - Mark completed tasks
   - Add new discoveries
   - Update metrics
2. **If found new issues**: Add to COMPONENT_INVENTORY.md
3. **If discovered pitfalls**: Add to QUICK_START.md
4. **Commit with message**: Reference which phase/stage

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
- **Start Here**: `QUICK_START.md` - New session setup
- **Current Work**: `CURRENT_WORK.md` - Active tasks & progress
- **Component Truth**: `/docs/current/COMPONENT_INVENTORY.md` - What components REALLY do
- **Cleanup Plan**: `/docs/current/CLEANUP_PLAN.md` - Consolidation strategy
- **Our Work**: `/docs/current/PHASE_*.md` - Completed phases

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

## Session Handoff
When starting a new session:
1. Read `QUICK_START.md` first (5 min)
2. Check `CURRENT_WORK.md` for progress (3 min)
3. Refer to `COMPONENT_INVENTORY.md` for truth
4. Continue from last checkpoint
5. Update progress in `CURRENT_WORK.md`

## 🔗 Documentation Cross-References

### Master Documentation System
| Document | Purpose | Primary Use Case |
|----------|---------|------------------|
| `DOCUMENTATION_INDEX.md` | Master map | Find any documentation |
| `SESSION_HANDOFF_CHECKLIST.md` | Continuity protocol | Start/end sessions |
| `.claude/instructions.md` | Auto-context | Claude AI bootstrap |
| `CURRENT_WORK.md` | Active tracking | Session progress |
| `COMPONENT_INVENTORY.md` | Component truth | Before using ANY component |
| `CLEANUP_PLAN.md` | Consolidation roadmap | Phase 7 implementation |
| `QUICK_START.md` | Onboarding | New sessions, pitfalls |

### Quick Commands
```bash
# Session start
cat CURRENT_WORK.md | grep -A10 "Active Tasks"

# Before creating component
cat COMPONENT_INVENTORY.md | grep -B2 -A2 "[ComponentType]"

# Check consolidation progress
cat CLEANUP_PLAN.md | grep -A5 "Week [Current]"

# Validate documentation
ls -lt *.md | head -10
```

---
*Created: 2024-09-01 | Last Updated: 2025-09-01*
*Purpose: Single source of truth for DexTrends development*
*Status: Component explosion crisis - 300 components, 66% duplicates*
*If confused about components, ALWAYS check COMPONENT_INVENTORY.md for the truth about what they actually do.*