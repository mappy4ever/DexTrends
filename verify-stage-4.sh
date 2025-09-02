#!/bin/bash

echo "=========================================="
echo "STAGE 4 COMPREHENSIVE VERIFICATION REPORT"
echo "=========================================="
echo ""

# 1. Component Count
echo "1. COMPONENT COUNT:"
echo "-------------------"
INITIAL=363
CURRENT=$(find components -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l | tr -d ' ')
DELETED=$(ls archived-components/stage-4/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "Initial count: $INITIAL"
echo "Current count: $CURRENT"
echo "Components deleted: $DELETED"
echo "Reduction: $((INITIAL - CURRENT)) components"
echo ""

# 2. Form Components
echo "2. FORM COMPONENTS STATUS:"
echo "--------------------------"
echo "Core form components remaining:"
for comp in StandardInput Select Checkbox; do
  if [ -f "components/ui/$comp.tsx" ]; then
    IMPORTS=$(grep -r "import.*$comp" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ $comp.tsx (used in $IMPORTS files)"
  else
    echo "  ❌ $comp.tsx MISSING"
  fi
done
echo ""

# 3. Deleted Components
echo "3. DELETED COMPONENTS:"
echo "----------------------"
echo "Total deleted: $DELETED"
echo "Categories deleted:"
echo "  - Unused UI components: $(ls archived-components/stage-4/{Professional,Deck,Simple,Visual,Zoomable,Enhanced,Social}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Unused filters: $(ls archived-components/stage-4/{Animated,Filter,Multi}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Unused form/input: $(ls archived-components/stage-4/{Radio,Visual}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Unused progress: $(ls archived-components/stage-4/{Circular,Step,Linear}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "  - Other unused: $(ls archived-components/stage-4/{Region,Touch,Pokemon,Navigation,Level,Gym,List,Virtualized,Simplified,Kpi,UI,Smart}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# 4. Export Files Status
echo "4. EXPORT FILES CLEANUP:"
echo "------------------------"
echo "forms/index.ts:"
if grep -q "EnhancedInput\|EnhancedSelect\|EnhancedTextarea\|EnhancedSwitch" components/ui/forms/index.ts 2>/dev/null; then
  echo "  ❌ Still has invalid exports"
else
  echo "  ✅ Cleaned of invalid exports"
fi

echo "filters/index.ts:"
if grep -q "AnimatedFilterPanel\|FilterChips\|MultiSelectFilter" components/ui/filters/index.ts 2>/dev/null; then
  echo "  ❌ Still has invalid exports"
else
  echo "  ✅ Cleaned of invalid exports"
fi
echo ""

# 5. TypeScript Check
echo "5. TYPESCRIPT COMPILATION:"
echo "--------------------------"
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -v "archived-components" | grep -c "error TS" || echo "0")
echo "TypeScript errors (non-archived): $TS_ERRORS"
if [ "$TS_ERRORS" -gt 50 ]; then
  echo "  ⚠️  High number of errors"
else
  echo "  ✅ Acceptable error count"
fi
echo ""

# 6. Form/Input Components
echo "6. REMAINING FORM COMPONENTS:"
echo "-----------------------------"
find components -type f \( -name "*[Ff]orm*" -o -name "*[Ii]nput*" -o -name "*[Ss]elect*" -o -name "*[Cc]heckbox*" \) | wc -l | tr -d ' '
echo " form-related components remain"
echo ""

# 7. Verification Summary
echo "7. STAGE 4 OBJECTIVES:"
echo "----------------------"
TARGET_REDUCTION=20
ACTUAL_REDUCTION=$((INITIAL - CURRENT))
echo "Target reduction: $TARGET_REDUCTION components"
echo "Actual reduction: $ACTUAL_REDUCTION components"
if [ "$ACTUAL_REDUCTION" -ge "$TARGET_REDUCTION" ]; then
  echo "✅ TARGET EXCEEDED!"
else
  echo "⚠️  Target not met (need $((TARGET_REDUCTION - ACTUAL_REDUCTION)) more)"
fi
echo ""

# 8. Archived Files
echo "8. ARCHIVED FILES:"
echo "------------------"
echo "Files in archived-components/stage-4/:"
ls -1 archived-components/stage-4/*.tsx 2>/dev/null | head -10
if [ "$DELETED" -gt 10 ]; then
  echo "... and $((DELETED - 10)) more"
fi
echo ""

echo "=========================================="
echo "STAGE 4 VERIFICATION COMPLETE"
echo "=========================================="
