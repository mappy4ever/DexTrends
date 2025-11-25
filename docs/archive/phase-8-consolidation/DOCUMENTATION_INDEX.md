# DOCUMENTATION_INDEX.md - Master Documentation Map

## 🔄 Documentation Flow Diagram
```
Session Start → CLAUDE.md → CURRENT_WORK.md → Begin Work
                    ↓              ↓
            QUICK_START.md  COMPONENT_INVENTORY.md
                    ↓              ↓
              CLEANUP_PLAN.md → Active Development
                                      ↓
                              Update Documentation
                                      ↓
                           SESSION_HANDOFF_CHECKLIST.md
                                      ↓
                              Commit & End Session
```

## Active Documentation (Use These)

### 📚 Core References (Read in Order)
1. **`.claude/instructions.md`** - Auto-loaded by Claude AI (context bootstrap)
2. **`CLAUDE.md`** - Master context and rules (single source of truth)
3. **`CURRENT_WORK.md`** - Active tasks and session tracking
4. **`QUICK_START.md`** - New session startup guide
5. **`CLEANUP_PLAN.md`** - Component consolidation strategy
6. **`COMPONENT_INVENTORY.md`** - Truth about component purposes
7. **`SESSION_HANDOFF_CHECKLIST.md`** - Session continuity protocol

### 📖 Project Documentation
- **`README.md`** - Project overview and setup instructions
- **`DOCUMENTATION_INDEX.md`** - This file, master map

## Documentation Responsibilities

### What Each Document Does

| Document | Purpose | When to Read | When to Update |
|----------|---------|--------------|----------------|
| `.claude/instructions.md` | Auto-loads context | Every session start | When patterns change |
| `CLAUDE.md` | Master rules & context | First in every session | Major violations found |
| `CURRENT_WORK.md` | Active work tracking | Start & end of session | Every task completion |
| `QUICK_START.md` | Onboarding & workflow | New to project | New pitfalls discovered |
| `CLEANUP_PLAN.md` | Consolidation roadmap | Before component work | After consolidation |
| `COMPONENT_INVENTORY.md` | Component truth table | Before using components | Duplicates found |
| `SESSION_HANDOFF_CHECKLIST.md` | Continuity protocol | End of session | Process improvements |

## Update Triggers

### Automatic Updates Required
These MUST be updated when conditions are met:

| Condition | Update File | Section |
|-----------|------------|---------|
| Task completed | CURRENT_WORK.md | "Last Completed Work" |
| Component deleted | CURRENT_WORK.md | "Metrics Update" |
| Duplicate found | COMPONENT_INVENTORY.md | Add to relevant table |
| Pitfall discovered | QUICK_START.md | "Common Pitfalls" |
| Pattern violation | CLAUDE.md | "Critical Violations" |
| Session ending | CURRENT_WORK.md | Full update per checklist |

## Quick Reference Commands

### Check Documentation State
```bash
# See what's changed
git status | grep "\.md"

# Check last updates
ls -lt *.md | head -5

# Find TODOs in docs
grep -r "TODO" *.md
```

### Documentation Validation
```bash
# Ensure all files exist
for file in CLAUDE.md CURRENT_WORK.md QUICK_START.md CLEANUP_PLAN.md COMPONENT_INVENTORY.md SESSION_HANDOFF_CHECKLIST.md; do
  [ -f "$file" ] && echo "✓ $file" || echo "✗ $file MISSING"
done
```

## Archived Documentation

All legacy documentation has been moved to `/docs/archive/2024-09-01-legacy/`.

**DO NOT USE ARCHIVED DOCS** - They contain outdated patterns and confusing information.

## Documentation Rules

### What Goes Where
- **Root directory**: Only active, essential documentation
- **`/docs/current/`**: Current detailed documentation
- **`/docs/archive/`**: Legacy documentation (reference only)

### When to Update
- **CLAUDE.md**: When core rules or patterns change
- **CURRENT_WORK.md**: After each work session
- **QUICK_START.md**: When new pitfalls discovered
- **CLEANUP_PLAN.md**: As consolidation progresses
- **COMPONENT_INVENTORY.md**: When components added/removed

---

*Created: 2025-09-01*
*Purpose: Single source of truth for documentation structure*