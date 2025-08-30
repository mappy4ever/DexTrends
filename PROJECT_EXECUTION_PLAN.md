# Project Execution Plan - Naming & Cleanup

## Overview
This document tracks our integrated naming standardization and code cleanup project. Each phase builds on the previous one with clear checkpoints.

## Current Status: Phase 1 - Setup & Backup
**Started**: 2025-08-30
**Target Completion**: End of current session

---

## Phase 1: Setup & Backup 🔧
**Goal**: Prepare for safe execution with full rollback capability

### Tasks
- [x] Create comprehensive documentation
- [x] Build analysis and automation tools
- [x] Validate rename safety
- [ ] Create project branch
- [ ] Generate full backup
- [ ] Document current state

### Commands
```bash
# Create branch
git checkout -b naming-and-cleanup

# Create backup point
git add -A
git commit -m "chore: Pre-cleanup backup point"
git tag backup-before-cleanup

# Document current state
npx tsc --noEmit 2>&1 | tee typescript-errors-before.log
npm test 2>&1 | tee test-results-before.log
```

### Deliverables
- Branch created: `naming-and-cleanup`
- Backup tag: `backup-before-cleanup`
- Error baseline documented

### Checkpoint
- [ ] All documentation reviewed
- [ ] Scripts tested in dry-run mode
- [ ] Team aligned on approach

---

## Phase 2: Execute Safe Renames 📝
**Target**: Day 1 (continuation)
**Risk Level**: Low

### Tasks
- [ ] Run safe rename script (9 files only)
- [ ] Update all imports automatically
- [ ] Verify TypeScript compilation
- [ ] Test affected pages

### Commands
```bash
# Execute renames
node scripts/safe-rename-only.js

# Verify
npx tsc --noEmit
npm run dev

# Test specific pages
# - /tcg-sets (renamed from tcgsets)
# - Pokemon tiles (renamed from cards)
# - Gym leader displays
```

### Expected Changes
```
✅ 6 Card→Tile renames:
  - GymLeaderCard → GymLeaderTile
  - CircularPokemonCard → PokemonAvatar
  - CircularGymLeaderCard → GymLeaderAvatar
  - EliteFourCard → EliteFourTile
  - ChampionCard → ChampionTile
  - PokemonCardItem → PokemonTile

✅ 1 Utility fix:
  - apiutils → apiUtils

✅ 2 Route renames:
  - tcgsets → tcg-sets
```

### Rollback Plan
```bash
# If issues arise
node scripts/rollback-renames.js
# or
git reset --hard backup-before-cleanup
```

### Checkpoint
- [ ] All renames successful
- [ ] No TypeScript errors introduced
- [ ] All pages load correctly
- [ ] Commit: "refactor: Standardize naming - Card to Tile for UI containers"

---

## Phase 3: Fix TypeScript Errors ✅
**Target**: Day 2
**Risk Level**: Low

### Current Issues (10 errors)
1. animationPerformance.ts - Read-only properties (6)
2. performanceOptimization.tsx - Type compatibility (4)

### Tasks
- [ ] Fix read-only property assignments
- [ ] Resolve type compatibility issues
- [ ] Update missing module imports
- [ ] Achieve zero TypeScript errors

### Validation
```bash
npx tsc --noEmit
# Expected: No errors
```

### Checkpoint
- [ ] TypeScript compiles cleanly
- [ ] No new errors introduced
- [ ] Commit: "fix: Resolve all TypeScript compilation errors"

---

## Phase 4: Clean Debug Code 🧹
**Target**: Day 3
**Risk Level**: Low

### Statistics
- 461 debug statements found
- Many already migrated to logger
- Need to verify each before removal

### Tasks
- [ ] Identify true console.log statements
- [ ] Verify logger migration is complete
- [ ] Remove only confirmed debug code
- [ ] Keep legitimate logging

### Script
```bash
# Find and review
grep -r "console\." --include="*.tsx" --include="*.ts" | grep -v "logger"

# Automated cleanup (after review)
node scripts/remove-debug-code.js
```

### Checkpoint
- [ ] All debug code removed
- [ ] Logger used consistently
- [ ] No functionality broken
- [ ] Commit: "chore: Remove debug console statements"

---

## Phase 5: Process Unused Variables 📊
**Target**: Days 4-5
**Risk Level**: Medium

### Statistics
- 1090 unused variables identified
- ~40% truly dead code
- ~30% unimplemented features (keep with TODOs)
- ~30% props drilling (keep)

### Tasks
- [ ] Categorize unused variables
- [ ] Add TODOs for unimplemented features
- [ ] Remove only truly dead code
- [ ] Document decisions

### Process
```bash
# Review categories
cat unused-analysis/typescript-analysis.json

# Process in batches of 50
node scripts/process-unused-batch.js --start 0 --end 50
# Test after each batch
npm test
```

### Checkpoint
- [ ] Each batch tested
- [ ] Unimplemented features documented
- [ ] No features accidentally removed
- [ ] Commit after each batch

---

## Phase 6: Archive Duplicate Pages 🗂️
**Target**: Day 6
**Risk Level**: Medium

### Duplicate Pages
- pokedex.tsx, pokedex-new.tsx, pokedex-unified.tsx
- index.tsx, index-unified.tsx

### Tasks
- [ ] Identify which version is active
- [ ] Move unused to `_archive/pages/`
- [ ] Update any remaining references
- [ ] Add redirects if needed

### Validation
```bash
# Check all routes work
npm run dev
# Visit each page
```

### Checkpoint
- [ ] Active pages identified
- [ ] Duplicates archived (not deleted)
- [ ] All routes functional
- [ ] Commit: "refactor: Archive duplicate page implementations"

---

## Phase 7: Final Validation & Documentation 📋
**Target**: Day 7
**Risk Level**: Low

### Tasks
- [ ] Run full test suite
- [ ] Update all documentation
- [ ] Generate final report
- [ ] Create migration guide

### Final Checks
```bash
# Full validation
npx tsc --noEmit
npm run lint
npm test
npm run build

# Bundle size check
npm run analyze
```

### Documentation Updates
- [ ] Update README
- [ ] Update CLAUDE.md
- [ ] Create MIGRATION_GUIDE.md
- [ ] Update component docs

### Checkpoint
- [ ] All tests passing
- [ ] Zero TypeScript errors
- [ ] Documentation complete
- [ ] Final commit: "docs: Complete naming standardization and cleanup"

---

## Progress Tracking

### Daily Standup Template
```markdown
## Day X Update - [Date]

### Completed
- Task 1
- Task 2

### In Progress
- Current task

### Blockers
- Any issues

### Next
- Next task

### Metrics
- TypeScript errors: X
- Tests passing: X/Y
- Files modified: X
```

---

## Success Metrics

### Quantitative
- [ ] 0 TypeScript errors
- [ ] 100% tests passing
- [ ] 0 console.log statements
- [ ] Bundle size reduced by X%

### Qualitative
- [ ] Clear Card vs Tile distinction
- [ ] Consistent naming patterns
- [ ] Documented unimplemented features
- [ ] Clean, maintainable codebase

---

## Risk Mitigation

### Before Each Phase
1. Create checkpoint commit
2. Run tests
3. Document current state

### If Issues Arise
1. Stop immediately
2. Assess impact
3. Rollback if needed
4. Document issue
5. Adjust plan

### Emergency Rollback
```bash
# Full rollback
git reset --hard backup-before-cleanup

# Partial rollback
git revert HEAD

# Specific file rollback
git checkout backup-before-cleanup -- path/to/file
```

---

## Communication

### Daily Updates
Post progress in this file under "Progress Log"

### Decision Log
Document any deviations from plan

### Questions
List any questions that need discussion

---

## Progress Log

### Session 1 - 2025-08-30
**Phase 1: Setup & Backup**
- ✅ Created comprehensive documentation (4 files)
- ✅ Built analysis and automation tools (4 scripts)
- ✅ Validated only 9 truly safe renames
- ✅ Discovered minimal actual duplication
- 🔄 Ready to execute Phase 2

**Key Insight**: Very little duplication exists - focus on naming clarity only

**Next Steps**: 
1. Create git branch
2. Execute safe renames
3. Begin Phase 2

---

## Notes
- Conservative approach - no aggressive merging
- Preserve all unimplemented features
- Document everything
- Test frequently
- Commit often

---

*Last Updated: 2025-08-30 - Ready for Phase 2 execution*