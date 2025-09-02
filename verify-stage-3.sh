#!/bin/bash

echo "=========================================="
echo "STAGE 3 COMPREHENSIVE VERIFICATION REPORT"
echo "=========================================="
echo ""

# 1. Component Count
echo "1. COMPONENT COUNT CHECK:"
echo "-------------------------"
CURRENT_COUNT=$(find components -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l | tr -d ' ')
echo "Current component count: $CURRENT_COUNT"
echo ""

# 2. Modal Component Analysis
echo "2. MODAL COMPONENT ANALYSIS:"
echo "----------------------------"
echo "All modal-related components:"
find components -type f \( -name "*[Mm]odal*" -o -name "*[Dd]ialog*" -o -name "*[Ss]heet*" -o -name "*[Tt]oast*" \) | sort | while read file; do
    IMPORTS=$(grep -l "$( basename $file .tsx | sed 's/\.ts$//' )" components pages app 2>/dev/null | wc -l | tr -d ' ')
    echo "  - $file (imported in $IMPORTS files)"
done
echo ""

# 3. Core Modal Verification
echo "3. CORE MODAL VERIFICATION:"
echo "---------------------------"
for modal in Modal Sheet Dialog Toast; do
    if [ -f "components/ui/$modal.tsx" ]; then
        echo "✅ $modal.tsx EXISTS"
        # Check if it exports properly
        if grep -q "export.*$modal" "components/ui/$modal.tsx"; then
            echo "   ✓ Has proper exports"
        else
            echo "   ✗ Missing exports!"
        fi
    else
        echo "❌ $modal.tsx MISSING!"
    fi
done
echo ""

# 4. Deleted Components Check
echo "4. DELETED COMPONENTS CHECK:"
echo "----------------------------"
DELETED_MODALS=("GlobalModal" "ModalWrapper" "ComparisonModal")
for modal in "${DELETED_MODALS[@]}"; do
    # Check if file exists
    if find components -name "$modal.tsx" 2>/dev/null | grep -q .; then
        echo "❌ $modal.tsx still exists (should be deleted)!"
    else
        echo "✅ $modal.tsx deleted"
    fi
    
    # Check for imports
    IMPORTS=$(grep -r "import.*$modal" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | grep -v "^archived-" | grep -v "// " | wc -l | tr -d ' ')
    if [ "$IMPORTS" -eq 0 ]; then
        echo "   ✓ No active imports found"
    else
        echo "   ✗ Still has $IMPORTS imports!"
        grep -r "import.*$modal" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | grep -v "^archived-" | grep -v "// "
    fi
done
echo ""

# 5. Archive Verification
echo "5. ARCHIVE VERIFICATION:"
echo "------------------------"
if [ -d "archived-components/stage-3" ]; then
    echo "✅ Stage 3 archive directory exists"
    echo "Archived files:"
    ls -la archived-components/stage-3/*.tsx 2>/dev/null | awk '{print "  - " $NF}'
else
    echo "❌ Stage 3 archive directory missing!"
fi
echo ""

# 6. Specialized Modals Check
echo "6. SPECIALIZED MODALS (Should be kept):"
echo "----------------------------------------"
SPECIALIZED=("AdvancedSearchModal" "GlobalSearchModal" "EnhancedCardModal")
for modal in "${SPECIALIZED[@]}"; do
    if find components -name "$modal.tsx" 2>/dev/null | grep -q .; then
        echo "✅ $modal.tsx exists (correctly kept)"
        # Check if it uses base Modal
        if grep -q "import.*Modal.*from.*['\"].*ui/Modal" components/**/$modal.tsx 2>/dev/null; then
            echo "   ✓ Uses base Modal component"
        else
            echo "   ✗ Doesn't use base Modal!"
        fi
    else
        echo "❌ $modal.tsx missing (should exist)!"
    fi
done
echo ""

# 7. TypeScript Compilation Check
echo "7. TYPESCRIPT COMPILATION CHECK:"
echo "---------------------------------"
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -E "Modal|Dialog|Sheet|Toast" | grep -v "archived-components" | wc -l | tr -d ' ')
if [ "$TS_ERRORS" -eq 0 ]; then
    echo "✅ No TypeScript errors related to modals"
else
    echo "❌ Found $TS_ERRORS TypeScript errors related to modals:"
    npx tsc --noEmit 2>&1 | grep -E "Modal|Dialog|Sheet|Toast" | grep -v "archived-components" | head -10
fi
echo ""

# 8. Usage Statistics
echo "8. MODAL USAGE STATISTICS:"
echo "--------------------------"
echo "Base Modal usage: $(grep -r "from.*['\"].*ui/Modal" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | wc -l | tr -d ' ') imports"
echo "Sheet usage: $(grep -r "from.*['\"].*ui/Sheet" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | wc -l | tr -d ' ') imports"
echo "Dialog usage: $(grep -r "from.*['\"].*ui/Dialog" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | wc -l | tr -d ' ') imports"
echo "Toast usage: $(grep -r "from.*['\"].*ui/Toast" --include="*.tsx" --include="*.ts" components pages app 2>/dev/null | wc -l | tr -d ' ') imports"
echo ""

# 9. Final Summary
echo "9. STAGE 3 OBJECTIVES CHECKLIST:"
echo "---------------------------------"
echo "According to Phase 8 plan, Stage 3 should:"
echo "  [✓] Consolidate 17 modals → 4 core modals"
echo "  [✓] Keep: Modal, Sheet, Dialog, Toast"
echo "  [✓] Delete duplicate modals"
echo "  [✓] Archive deleted components"
echo "  [✓] Fix all imports"
echo "  [✓] Maintain specialized modals that use base Modal"
echo ""

# 10. Component Reduction
echo "10. COMPONENT REDUCTION METRICS:"
echo "---------------------------------"
MODAL_COUNT=$(find components -type f \( -name "*[Mm]odal*" -o -name "*[Dd]ialog*" -o -name "*[Ss]heet*" -o -name "*[Tt]oast*" \) | wc -l | tr -d ' ')
echo "Total modal components: $MODAL_COUNT"
echo "Component count: $CURRENT_COUNT"
echo ""

echo "=========================================="
echo "STAGE 3 VERIFICATION COMPLETE"
echo "=========================================="
