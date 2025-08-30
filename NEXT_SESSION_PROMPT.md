# Next Session Startup Prompt

## Copy this entire prompt to start your next Claude session:

---

I'm continuing a naming standardization and code cleanup project in DexTrends. We completed Phase 1 in the last session. Please read these key files to understand the current state:

1. `PROJECT_EXECUTION_PLAN.md` - Our 7-phase execution plan
2. `PHASE_1_COMPLETION.md` - What we accomplished in Phase 1
3. `NAMING_CONVENTIONS.md` - The naming standards we established
4. `SAFE_RENAME_PLAN.md` - The conservative approach we're taking

Current status:
- Branch: `naming-and-cleanup` 
- Phase 1: ✅ COMPLETE (setup, documentation, analysis tools created)
- Phase 2: Ready to start (9 safe renames identified)
- Dev server: Running on bash_12

Key findings from Phase 1:
- Very little code duplication exists (you were right!)
- Main issue is naming confusion (Card vs Tile)
- We identified only 9 truly safe renames out of 50+ possibilities
- Animation utilities should stay separate (different functionality)

Ready to execute Phase 2:
- Script ready: `scripts/safe-rename-only.js`
- Will rename: 6 Card→Tile components, 1 utility casing fix, 2 page routes
- Rollback available if needed

Please start by:
1. Reviewing the current git status
2. Checking if the dev server is still running
3. Proceeding with Phase 2 execution if everything looks good

The goal is to continue our conservative approach - just renaming for clarity, no merging or deleting functionality.

---

## Additional Context Files to Check:

### Documentation Created
- `UNIMPLEMENTED_FEATURES.md` - Features to preserve
- `CLEANUP_PLAN.md` - Overall cleanup strategy
- `rename-mapping.json` - Identified renames
- `rename-validation.json` - Safety validation

### Scripts Ready to Use
- `scripts/safe-rename-only.js` - Execute Phase 2 renames
- `scripts/rollback-renames.js` - Rollback if needed
- `scripts/analyze-unused.js` - For Phase 5 unused code

### Current TODO List (7 Phases)
1. Phase 1: Setup & Backup ✅ COMPLETE
2. Phase 2: Execute Safe Renames (9 files) - READY TO START
3. Phase 3: Fix TypeScript Errors (10 remaining)
4. Phase 4: Clean Debug Code (461 instances)
5. Phase 5: Process Unused Variables (1090 items)
6. Phase 6: Archive Duplicate Pages
7. Phase 7: Final Validation & Documentation

### Git Information
- Current branch: `naming-and-cleanup`
- Last commit: "chore: Pre-cleanup backup point - Phase 1 complete"
- Backup tag: `backup-before-cleanup`

### Key Decisions Made
- NO merging of similar-named files (they have different functionality)
- NO deletion of "unused" features (they're unimplemented, not dead)
- Focus on naming clarity only
- Keep all animation utilities separate
- Conservative approach throughout

Let's continue with Phase 2!