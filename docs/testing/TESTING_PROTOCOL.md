# DexTrends Mandatory Testing Protocol
**EFFECTIVE IMMEDIATELY - NO EXCEPTIONS**

## 🚨 CRITICAL: Testing Failures Will Result in Immediate Escalation

### Why This Document Exists
We shipped "working" features that crashed immediately. This is unacceptable. Every team member MUST follow this protocol for EVERY change.

## The Three-Layer Testing Law

### Layer 1: Build Verification (Minimum Bar)
```bash
✓ npm run build - Must pass
✓ No TypeScript errors
✓ No ESLint warnings
```

### Layer 2: Functional Testing (MANDATORY)
```bash
✓ Start dev server: npm run dev
✓ Open browser to http://localhost:3000
✓ Open Developer Console (F12)
✓ Navigate to changed feature
✓ ZERO console errors allowed
✓ All data must be REAL (no placeholders)
```

### Layer 3: User Journey Testing (REQUIRED)
```bash
✓ Test as a real user would
✓ Click EVERY button/tab/link
✓ Verify ACTUAL functionality
✓ Test edge cases
✓ Document what you tested
```

## Feature-Specific Testing Checklists

### Pokemon Detail Pages (/pokedex/[id])
- [ ] Test with Pikachu (#25) - has evolution
- [ ] Test with Eevee (#133) - multiple evolutions  
- [ ] Test with Mew (#151) - no evolution
- [ ] Test with Toxtricity (#849) - multiple forms
- [ ] Click ALL tabs: Overview, Stats, Evolution, Abilities, Moves, TCG Cards, Pocket Cards
- [ ] Verify Evolution shows actual chain (not placeholder)
- [ ] Verify Abilities show descriptions (not "will be loaded")
- [ ] Check browser console - MUST be error-free
- [ ] Test Previous/Next navigation
- [ ] Test Add to Favorites

### Homepage (/)
- [ ] All sections load without errors
- [ ] Featured cards display with prices
- [ ] Search works and returns results
- [ ] Visual filters function
- [ ] Card comparison tool works
- [ ] Navigation to all major sections

### Pocket Mode (/pocketmode)
- [ ] All Pokemon load
- [ ] Deck builder creates/saves decks
- [ ] Pack opening animation works
- [ ] Expansion packs display
- [ ] No console errors

### TCG Sets (/tcgsets)
- [ ] Sets load with images
- [ ] Individual set pages work
- [ ] Cards display with prices
- [ ] Filtering works
- [ ] Pagination functions

## Testing Evidence Requirements

### For EVERY Pull Request/Fix:
```markdown
## Testing Completed

### Scenarios Tested:
1. [Specific scenario] - Result: [What happened]
2. [Specific scenario] - Result: [What happened]
3. [Edge case] - Result: [What happened]

### Browser Console:
- Chrome: ✓ No errors
- Firefox: ✓ No errors (if applicable)
- Safari: ✓ No errors (if applicable)

### Screenshots:
- [Link/embed screenshot of working feature]
- [Link/embed screenshot of console with no errors]

### Test Data Used:
- Pokemon IDs tested: [25, 133, 151, etc.]
- Pages tested: [List all URLs visited]
- Actions performed: [Clicked X, typed Y, etc.]
```

## Red Flags That Mean "NOT DONE"

1. **"It should work"** - TEST IT
2. **"The code looks right"** - RUN IT
3. **"It builds successfully"** - NOT ENOUGH
4. **Placeholder text visible** - BROKEN
5. **Console errors** - FAILED
6. **"Waiting for API"** - INCOMPLETE
7. **"Works on my machine"** - PROVE IT

## The New Reality

### Before Marking Anything "Complete":
1. Can you show a screenshot of it working?
2. Is the console completely clean?
3. Did you test edge cases?
4. Would you demo this to a client?
5. Did you actually click/interact with it?

### Testing Time Expectations:
- Simple text change: 5 minutes testing
- New component: 15 minutes testing
- New feature: 30+ minutes testing
- Major refactor: 1+ hour testing

## Consequences of Skipping Testing

1. **First offense**: Written warning + redo all work
2. **Second offense**: Removed from critical path work
3. **Third offense**: Contract review

## Test Recording Tools

Use these to provide evidence:
- Screenshots: CleanShot, Snagit, built-in tools
- Console logging: Browser DevTools
- Screen recording: Loom, CleanShot, QuickTime
- Testing notes: This template

## Sample Testing Log Entry

```markdown
Date: 2025-06-30 14:30
Tester: Agent 3
Feature: Pokemon Evolution Tab Fix

WHAT I TESTED:
1. Opened http://localhost:3000/pokedex/25 (Pikachu)
   - Result: Page loaded, clicked Evolution tab
   - Evolution chain displayed: Pichu → Pikachu → Raichu ✓
   
2. Opened http://localhost:3000/pokedex/133 (Eevee)
   - Result: Multiple evolution branches displayed correctly
   - All 8 Eeveelutions showed with proper formatting ✓

3. Opened http://localhost:3000/pokedex/151 (Mew)
   - Result: "No evolution data available" message shown ✓

4. Console Check:
   - Chrome DevTools: 0 errors, 0 warnings ✓
   - Network tab: All API calls succeeded ✓

EDGE CASES:
- Tested Pokemon with trade evolution (Kadabra)
- Tested Pokemon with item evolution (Pikachu + Thunder Stone)
- Tested mega evolutions (Charizard)

EVIDENCE:
[Screenshot links would go here]
```

## This Is Not Optional

Every team member agrees to follow this protocol. No exceptions. No shortcuts. Our reputation depends on shipping WORKING features, not just code that compiles.

**Sign-off required from all team members acknowledging this protocol.**

---
_Last updated: 2025-06-30_
_Next review: Weekly_