# DexTrends Cleanup Plan - Comprehensive Code Audit

## Overview
This document outlines the systematic approach to cleaning up 1000+ unused code warnings while preserving unimplemented features and maintaining application functionality.

## Current Status
- **Total Warnings**: ~1000+ unused code items
- **Estimated Breakdown**:
  - ~40% (400 items): Truly dead code - safe to remove
  - ~30% (300 items): Unimplemented features - keep with TODO comments
  - ~30% (300 items): Props drilling/type imports - keep as-is

## Phase 1: Categorization & Audit (Current Phase)
**Goal**: Create automated scripts to categorize all unused warnings

### Files to Generate:
- `unused_imports.txt` - Unused import statements
- `unused_parameters.txt` - Unused function parameters
- `unused_functions.txt` - Unused functions/methods
- `unused_state.txt` - Unused state variables
- `unused_types.txt` - Unused type definitions
- `unused_props.txt` - Unused component props

### Categorization Script
Located at: `scripts/categorize-unused.sh`

## Phase 2: Safe Cleanup
**Goal**: Remove obvious dead code with zero risk

### Safe to Remove:
- Duplicate imports
- Commented-out imports
- Console.log statements (already migrated to logger)
- Test/debug functions
- Old mobile-specific components (already archived)

## Phase 3: Feature Verification
**Goal**: Document and preserve unimplemented features

### Documentation Files:
- `UNIMPLEMENTED_FEATURES.md` - List of all unimplemented features
- Add TODO comments in code for each unimplemented feature

### Known Unimplemented Features:
- Battle Simulator
- Pack Opening animations
- Social features (friends, trading)
- Achievement system
- Deck builder enhancements
- Advanced search filters

## Phase 4: Props & Parameters Analysis
**Goal**: Understand props drilling patterns

### Analysis Focus:
- Props passed through multiple components
- Type-only imports for TypeScript
- Context providers and hooks
- Component composition patterns

## Phase 5: Implementation Strategy
**Goal**: Systematic removal in safe order

### Processing Order:
1. **Leaf components first** (no children depend on them)
2. **Utility functions** (after verifying no usage)
3. **Type definitions** (after all implementations checked)
4. **Parent components** (after children processed)

### Batch Processing:
- Process 50 items per batch
- Create git commit after each batch
- Test application after each batch
- Document any issues found

## Phase 6: Validation
**Goal**: Ensure no functionality broken

### Validation Steps:
1. Run TypeScript compiler: `npx tsc --noEmit`
2. Run linter: `npm run lint`
3. Run tests: `npm test`
4. Manual testing of key features
5. Check for console errors
6. Verify all pages load

## Phase 7: Final Documentation
**Goal**: Update project documentation

### Updates Required:
- Update `CLAUDE.md` with new patterns
- Update component documentation
- Create migration guide for removed features
- Document new TODO items

## Progress Tracking

### Phase 1 Progress
- [x] Create CLEANUP_PLAN.md
- [ ] Create categorization script
- [ ] Run categorization
- [ ] Review categorized files
- [ ] Identify patterns

### Phase 2 Progress
- [ ] Remove duplicate imports
- [ ] Remove commented code
- [ ] Remove debug functions
- [ ] Commit and test

### Phase 3 Progress
- [ ] Create UNIMPLEMENTED_FEATURES.md
- [ ] Add TODO comments
- [ ] Document feature requirements
- [ ] Create implementation tickets

### Phase 4 Progress
- [ ] Map props drilling patterns
- [ ] Document type-only imports
- [ ] Identify unnecessary props
- [ ] Create props cleanup list

### Phase 5 Progress
- [ ] Process batch 1 (items 1-50)
- [ ] Process batch 2 (items 51-100)
- [ ] Process batch 3 (items 101-150)
- [ ] Continue until complete...

### Phase 6 Progress
- [ ] TypeScript validation
- [ ] Linter validation
- [ ] Test suite passes
- [ ] Manual testing complete

### Phase 7 Progress
- [ ] CLAUDE.md updated
- [ ] Component docs updated
- [ ] Migration guide created
- [ ] TODOs documented

## Risk Mitigation

### Before Each Change:
1. Create git branch for the work
2. Document what's being removed
3. Search for all usages
4. Check for dynamic imports
5. Verify no runtime references

### Rollback Strategy:
- Git commits after each batch
- Tag stable points
- Keep archived code for 30 days
- Document removal decisions

## Success Metrics
- Zero TypeScript errors maintained
- All tests passing
- No console errors in production
- Reduced bundle size
- Cleaner codebase
- Clear documentation of unimplemented features

## Timeline
- Phase 1: 1 day
- Phase 2: 1 day  
- Phase 3: 2 days
- Phase 4: 1 day
- Phase 5: 3-4 days
- Phase 6: 1 day
- Phase 7: 1 day

**Total Estimated Time**: 10-11 days

## Notes
- Prioritize application stability over cleanup
- When in doubt, keep the code
- Document all decisions
- Test frequently
- Commit often