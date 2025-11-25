# SESSION_HANDOFF_CHECKLIST.md - Seamless Continuity Protocol

## 🚀 Session Start Checklist

### 1. Context Loading (First 30 seconds)
```bash
# Auto-loaded if using Claude Code
cat .claude/instructions.md

# Manual verification
cat CLAUDE.md | head -40              # Get critical context
cat CURRENT_WORK.md | grep "Active"   # See what's in progress
```

### 2. State Verification (Next 1 minute)
```bash
# Check git state
git status
git branch
git log --oneline -5

# Verify code quality
npx tsc --noEmit                      # MUST be 0 errors
npm run lint | tail -5                # Check linting

# Component metrics
echo "Component count: $(find components -name '*.tsx' | wc -l)"
echo "Mobile patterns: $(grep -r 'isMobileView' components/ | wc -l)"
echo "Any types: $(grep -r ': any' --include='*.ts' --include='*.tsx' | wc -l)"
```

### 3. Context Review (Next 2 minutes)
- [ ] Read last session's work in CURRENT_WORK.md
- [ ] Check COMPONENT_INVENTORY.md for any new discoveries
- [ ] Review CLEANUP_PLAN.md current stage
- [ ] Scan for TODOs: `grep -r "TODO" --include="*.tsx" | head -10`

## 💼 During Work Tracking

### Component Work Checklist
Before creating ANY component:
- [ ] Search existing: `grep -r "ComponentName" components/`
- [ ] Check inventory: `cat COMPONENT_INVENTORY.md | grep -B2 -A2 "Purpose"`
- [ ] Verify UI folder: `ls -la components/ui/*Similar*`
- [ ] Check for duplicates in different folders

Before modifying a component:
- [ ] Read the component first
- [ ] Check its imports and dependencies
- [ ] Search for all usages: `grep -r "ComponentName" --include="*.tsx"`
- [ ] Run type check after changes

### Documentation Updates (REAL-TIME)
| Action | Update File | What to Document |
|--------|------------|------------------|
| Found duplicate | COMPONENT_INVENTORY.md | Add to duplicates table |
| Completed task | CURRENT_WORK.md | Mark completed, add notes |
| Discovered issue | QUICK_START.md | Add to pitfalls |
| Merged components | CLEANUP_PLAN.md | Update metrics |
| Fixed violation | CLAUDE.md | Update violation count |

### Testing Checkpoints
Every 30 minutes:
```bash
npx tsc --noEmit         # TypeScript check
```

Before any commit:
```bash
npx tsc --noEmit         # TypeScript
npm run lint             # Linting
npm test                 # E2E tests
```

## 🏁 Session End Protocol

### 1. Work Documentation (5 minutes)
Update CURRENT_WORK.md:
```markdown
## Last Completed Work
### Session: [DATE]
- **Duration**: [X hours]
- **Phase/Stage**: Phase 7, Stage [X]
- **Components Modified**:
  - [Component]: [What changed]
- **Components Deleted**: 
  - [List deleted duplicates]
- **Discoveries**:
  - [New duplicates found]
  - [Misleading names identified]

## Metrics Update
- Components: [before] → [after]
- Mobile patterns: [before] → [after]
- TypeScript errors: 0 (verified)
```

### 2. Inventory Updates (2 minutes)
If found new issues, update COMPONENT_INVENTORY.md:
```markdown
| Component | What Name Suggests | What It Actually Does | Verdict |
|-----------|-------------------|----------------------|---------|
| [NewFound] | [Expectation] | [Reality] | ❌ Delete |
```

### 3. Progress Tracking (2 minutes)
Update CLEANUP_PLAN.md if did consolidation:
```markdown
### [Component Type] Consolidation
- Started with: [X] components
- Consolidated to: [Y] components
- Deleted: [List]
- Merged features into: [Base component]
```

### 4. Final Verification (1 minute)
```bash
# Must all pass:
npx tsc --noEmit                      # 0 errors required
git status                             # Review changes
find components -name "*.tsx" | wc -l  # Log final count
```

### 5. Commit Message Template
```bash
git add -A
git commit -m "Phase [X]: [Stage] - [Primary action]

Work completed:
- [Main achievement]
- Components: [before] → [after]
- Deleted: [list key deletions]
- TypeScript: 0 errors
- Tests: passing

Discoveries:
- [Any new issues found]

Next session:
- [Immediate next task]

Refs: CURRENT_WORK.md updated"
```

## 🔄 Continuous Improvement

### After Each Session
- If session handoff was confusing, update this checklist
- If found undocumented pattern, add to CLAUDE.md
- If discovered new pitfall, add to QUICK_START.md
- If metrics improved, celebrate in CURRENT_WORK.md

### Weekly Review
- Count total components trend
- Measure duplicate reduction rate
- Update CLEANUP_PLAN.md timeline
- Adjust targets if needed

## 🚨 Emergency Situations

### If TypeScript Errors Appear
1. DO NOT proceed with other work
2. Fix immediately
3. Document what caused them
4. Update QUICK_START.md with prevention

### If Tests Fail
1. Check what changed: `git diff`
2. Run specific test: `npm test -- [test-name]`
3. Fix before ANY other work
4. Document in CURRENT_WORK.md

### If Confused About Component
1. Check COMPONENT_INVENTORY.md first
2. Read the actual component code
3. Search for usages
4. When in doubt, ask before deleting

## 📊 Success Metrics

Track these each session:
- [ ] Component count decreased?
- [ ] No new duplicates created?
- [ ] TypeScript errors stayed at 0?
- [ ] Documentation updated?
- [ ] Tests still passing?
- [ ] Mobile patterns reduced?

---

**Remember**: Good handoff = Fast startup next session

*Created: 2025-09-01*
*Purpose: Ensure seamless continuity between work sessions*