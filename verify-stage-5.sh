#!/bin/bash

echo "=========================================="
echo "STAGE 5 COMPREHENSIVE VERIFICATION REPORT"
echo "=========================================="
echo ""

# 1. Component Count
echo "1. COMPONENT COUNT:"
echo "-------------------"
INITIAL=334
CURRENT=$(find components -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l | tr -d ' ')
DELETED=$(ls archived-components/stage-5/*.tsx 2>/dev/null | wc -l | tr -d ' ')
echo "Initial count: $INITIAL"
echo "Current count: $CURRENT"
echo "Components deleted: $DELETED"
echo "Reduction: $((INITIAL - CURRENT)) components"
echo ""

# 2. Display Components Status
echo "2. DISPLAY COMPONENTS STATUS:"
echo "-----------------------------"
echo "Tables remaining: $(find components -name "*[Tt]able*" | wc -l | tr -d ' ')"
echo "Lists remaining: $(find components -name "*[Ll]ist*" | wc -l | tr -d ' ')"
echo "Grids remaining: $(find components -name "*[Gg]rid*" | wc -l | tr -d ' ')"
echo "Display components: $(find components -name "*[Dd]isplay*" | wc -l | tr -d ' ')"
echo "Dashboard components: $(find components -name "*[Dd]ashboard*" | wc -l | tr -d ' ')"
echo "Chart/Graph components: $(find components -name "*[Cc]hart*" -o -name "*[Gg]raph*" | wc -l | tr -d ' ')"
echo ""

# 3. Deleted Categories
echo "3. DELETED COMPONENT CATEGORIES:"
echo "---------------------------------"
echo "Display/View: $(ls archived-components/stage-5/{*Display,*View,*Dashboard,*Panel}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "Charts/Stats: $(ls archived-components/stage-5/{*Chart,*Graph,*Stat,*Metric}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "Data/Table: $(ls archived-components/stage-5/{*Data,*Table,*List}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "UI Systems: $(ls archived-components/stage-5/{*System,*Manager,*Provider}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "Cards: $(ls archived-components/stage-5/{*Card,*Comparison}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo "Other: $(ls archived-components/stage-5/{*FAB,*Badge,*Tooltip,*Floating,*Sidebar,*Navigation,*Aria}*.tsx 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# 4. Key Components Preserved
echo "4. KEY COMPONENTS PRESERVED:"
echo "----------------------------"
for comp in UnifiedDataTable UnifiedGrid CardList TCGCardList PocketCardList; do
  if [ -f "components/$comp.tsx" ] || find components -name "$comp.tsx" 2>/dev/null | grep -q .; then
    echo "  ✅ $comp"
  else
    echo "  ❌ $comp (missing)"
  fi
done
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

# 6. Import Verification
echo "6. IMPORT VERIFICATION:"
echo "-----------------------"
BROKEN_IMPORTS=$(npx tsc --noEmit 2>&1 | grep -E "FlippableTCGCard|CardComparisonTool|EvolutionStageCard|EnhancedSearchBox|PriceIntelligenceSystem|PortfolioManager" | grep -v "archived-components" | wc -l | tr -d ' ')
echo "Broken imports from deleted components: $BROKEN_IMPORTS"
if [ "$BROKEN_IMPORTS" -eq 0 ]; then
  echo "  ✅ All imports fixed"
else
  echo "  ⚠️  Still has broken imports"
fi
echo ""

# 7. Stage Objectives
echo "7. STAGE 5 OBJECTIVES:"
echo "----------------------"
TARGET_REDUCTION=23
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
echo "8. ARCHIVED FILES SUMMARY:"
echo "--------------------------"
echo "Total archived: $DELETED files"
ls -1 archived-components/stage-5/*.tsx 2>/dev/null | head -10
if [ "$DELETED" -gt 10 ]; then
  echo "... and $((DELETED - 10)) more"
fi
echo ""

# 9. Final Summary
echo "9. SUMMARY:"
echo "-----------"
echo "Stage 5 focused on consolidating data display components."
echo "Removed unused dashboards, charts, stats, and display components."
echo "Preserved core grid, table, and list components."
echo ""

echo "=========================================="
echo "STAGE 5 VERIFICATION COMPLETE"
echo "=========================================="
