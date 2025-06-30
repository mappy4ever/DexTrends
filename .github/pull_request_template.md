# Pull Request Testing Checklist

## Description
Brief description of changes:

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## Testing Completed (MANDATORY)

### Layer 1: Build Verification
- [ ] `npm run build` passes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Layer 2: Functional Testing
- [ ] Started dev server (`npm run dev`)
- [ ] Opened in browser
- [ ] Checked browser console - ZERO errors
- [ ] All features display REAL data (no placeholders)

### Layer 3: User Journey Testing
- [ ] Tested all affected user paths
- [ ] Clicked all interactive elements
- [ ] Verified edge cases

## Test Evidence

### Scenarios Tested:
1. **Scenario**: [Description]
   - **Result**: [What happened]
   - **Console**: Clean ✓

2. **Scenario**: [Description]
   - **Result**: [What happened]
   - **Console**: Clean ✓

### Browser Console Status:
- Chrome: [ ] No errors
- Firefox: [ ] No errors (if tested)
- Safari: [ ] No errors (if tested)

### Screenshots/Evidence:
<!-- Paste screenshots or links here showing:
1. The feature working
2. Clean browser console
3. Any edge cases handled
-->

### Test URLs:
<!-- List all URLs you tested -->
- http://localhost:3000/...
- http://localhost:3000/...

## Specific Features Tested

### If Pokemon-related:
- [ ] Tested with Pikachu (#25)
- [ ] Tested with Eevee (#133) 
- [ ] Tested with no-evolution Pokemon
- [ ] All tabs functional
- [ ] Console error-free

### If Homepage:
- [ ] All sections load
- [ ] Search works
- [ ] Navigation works
- [ ] No console errors

### If Pocket Mode:
- [ ] Deck builder works
- [ ] Cards display
- [ ] No console errors

## Sign-off
I confirm that I have:
- [ ] Actually run this code locally
- [ ] Tested all changes thoroughly
- [ ] Verified zero console errors
- [ ] Tested edge cases
- [ ] Would confidently demo this to a client

**Tester**: [Your name]
**Date**: [Date]
**Time spent testing**: [X minutes]

---
⚠️ **PRs without complete testing evidence will be rejected**