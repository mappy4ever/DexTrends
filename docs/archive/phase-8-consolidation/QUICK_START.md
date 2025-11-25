# QUICK_START.md - New Session Setup Guide

## 🚨 CRITICAL: Read This First in New Sessions

### Step 1: Understand the Situation
**We have a COMPONENT EXPLOSION CRISIS**
- ~300 components exist (should be ~80-100)
- 66% are duplicates or near-duplicates
- Component names are misleading and confusing

### Step 2: Read Core Documentation (IN ORDER)
1. **CLAUDE.md** - Master context and rules
2. **CURRENT_WORK.md** - Active tasks and progress
3. **CLEANUP_PLAN.md** - Consolidation strategy
4. **COMPONENT_INVENTORY.md** - What components ACTUALLY do

## 📋 Session Management Workflow

### Starting a Session
```bash
# 1. Check current state
git status
git branch

# 2. Read session context
cat CURRENT_WORK.md | head -50

# 3. Verify no TypeScript errors
npx tsc --noEmit

# 4. Check for active TODOs
grep -r "TODO" --include="*.tsx" --include="*.ts" | head -10
```

### During Work - Documentation Updates

#### When You Find Issues
| Discovery | Update File | Add To Section |
|-----------|------------|----------------|
| Duplicate component | COMPONENT_INVENTORY.md | "The [Type] Madness" |
| Misleading name | COMPONENT_INVENTORY.md | "Misleading Names" |
| New pitfall | QUICK_START.md | "Common Pitfalls" |
| Architecture violation | CLAUDE.md | "Critical Violations" |
| Completed task | CURRENT_WORK.md | Mark status, add notes |

#### Before Creating/Modifying
```bash
# ALWAYS run these checks:
grep -r "ComponentName" components/
cat COMPONENT_INVENTORY.md | grep -A5 "ComponentType"
ls -la components/ui/*Similar*
```

### Ending a Session

#### Required Updates
1. **CURRENT_WORK.md**
   ```markdown
   ## Last Completed Work
   - [Task description]
   - Files modified: [list]
   - Components affected: [list]
   
   ## Active Tasks
   - [Update status to in_progress/completed]
   
   ## Next Actions Priority
   - [What should be done next]
   ```

2. **Metrics Update** (if components changed)
   ```bash
   # Count components
   find components -name "*.tsx" | wc -l
   # Update in CURRENT_WORK.md "Code Quality Metrics"
   ```

3. **Commit Message Format**
   ```bash
   git add -A
   git commit -m "Phase 7: [Stage] - [What was done]
   
   - Components: [before] → [after]
   - TypeScript errors: 0
   - Tests: passing
   
   Next: [What's next]"
   ```

## Quick Context

### What This Project Is
- **DexTrends**: Pokemon TCG and Pokedex application
- **Tech Stack**: Next.js 15.3.1, TypeScript, Tailwind CSS
- **Architecture**: Unified responsive (NO separate mobile/desktop)

### Current State
```
Components: ~300 (66% duplicates)
TypeScript Errors: 0
Test Coverage: E2E tests for critical flows
Mobile Support: Unified responsive (320px minimum)
```

## Essential Commands
```bash
# Development
npm run dev              # Start dev server (port 3000)

# Quality Checks (Run these before ANY commit)
npx tsc --noEmit        # TypeScript check
npm run lint            # ESLint check
npm test                # Playwright E2E tests

# Testing
npm run test:ui         # Interactive test UI
npm run test:headed     # Tests with visible browser
```

## Component Selection Cheat Sheet

### ❌ DO NOT USE These (Duplicates/Legacy)
```typescript
// These are duplicates or misleading:
- AdvancedPokemonCard
- EnhancedCardDisplay  
- UnifiedSearchBar
- MobileLayout
- DesktopLayout
- CardComponent2
- ModalV3
- SimpleCardWrapper (not simple at all!)
```

### ✅ USE These Instead
```typescript
// Modals
import Modal from '@/components/ui/Modal';

// Cards (UI containers)
import Card from '@/components/ui/Card';

// Cards (Pokemon TCG)
import TCGCard from '@/components/tcg/TCGCard';

// Forms (New unified components)
import { Select, Checkbox, Radio, Switch } from '@/components/ui';

// Layout
import Layout from '@/components/Layout';

// Skeletons
import Skeleton from '@/components/ui/Skeleton';
```

## Critical Rules

### NEVER Do This
```typescript
// ❌ Creating duplicate components
const AdvancedModal = () => { ... }

// ❌ Using 'any' type
const data: any = fetchData();

// ❌ Separate mobile/desktop
{isMobile ? <MobileView /> : <DesktopView />}

// ❌ Creating without checking
// Always grep first!
```

### ALWAYS Do This
```typescript
// ✅ Check for existing components
grep -r "Modal" components/

// ✅ Use proper types
const data: PokemonData = fetchData();

// ✅ Single responsive component
<Component className="w-full md:w-1/2" />

// ✅ Use logger instead of console
import logger from '@/utils/logger';
logger.info('Message');
```

## Common Pitfalls

### 1. Component Name Confusion
**"Card" means 3 different things:**
- UI container (like a div with shadow)
- Pokemon TCG trading card
- Pokemon info display

**Always clarify which type!**

### 2. Mobile Detection
```typescript
// ❌ WRONG (still in codebase)
const isMobile = window.innerWidth < 460;

// ✅ RIGHT (use Tailwind)
<div className="block md:hidden">Mobile</div>
<div className="hidden md:block">Desktop</div>
```

### 3. Duplicate Utilities
**Before creating ANY utility:**
```bash
grep -r "functionName" utils/
grep -r "similar" utils/
```

## Current Priorities

### Immediate Tasks
1. **Component Consolidation** - Merge duplicates
2. **Naming Cleanup** - Fix misleading names
3. **Mobile Pattern Removal** - Delete `/components/mobile/`

### Quick Wins
- Merge 17 Modal components → 4
- Combine 11 Skeleton systems → 2
- Consolidate 49 Card components → ~10

## Testing Requirements

### Before ANY Changes
```bash
# Type check first
npx tsc --noEmit

# If modifying components, test affected pages
npm test -- --grep="component-name"
```

### Touch Targets
- Minimum 44px for iOS compliance
- Test at 320px viewport width

## Getting Started Checklist

- [ ] Read CLAUDE.md for complete context
- [ ] Check CURRENT_WORK.md for active tasks
- [ ] Review COMPONENT_INVENTORY.md before using components
- [ ] Run `npx tsc --noEmit` to verify no TypeScript errors
- [ ] Check for duplicates before creating ANYTHING
- [ ] Use existing components from `/components/ui/`
- [ ] Test at 320px width for mobile

## Emergency Contacts

### If You See These Patterns
1. **`isMobileView` pattern** → Replace with responsive classes
2. **`Enhanced*` components** → Use base component instead
3. **Multiple versions (V2, V3)** → Use the one in `/components/ui/`
4. **`any` type** → Fix immediately with proper type

### Quick Verification
```bash
# Check for mobile patterns (should be 0)
grep -r "isMobileView" components/

# Check for 'any' types (should be 0)
grep -r ": any" --include="*.ts" --include="*.tsx"

# Find duplicate components
ls -la components/**/*Modal*
ls -la components/**/*Card*
```

---

**Remember**: We're cleaning up technical debt. Don't add to it!

*Last Updated: 2025-09-01*
*Purpose: Prevent confusion and duplication in new sessions*