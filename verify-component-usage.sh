#!/bin/bash

# Component Usage Verification Script
# Run this before deleting any component to ensure it's truly unused

if [ -z "$1" ]; then
    echo "Usage: ./verify-component-usage.sh ComponentName"
    echo "Example: ./verify-component-usage.sh EnhancedInput"
    exit 1
fi

COMPONENT=$1
echo "================================================"
echo "Verifying usage of component: $COMPONENT"
echo "================================================"

echo ""
echo "1. CHECKING DIRECT IMPORTS..."
echo "--------------------------------"
# Check for direct imports
grep -r "import.*$COMPONENT" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null

IMPORT_COUNT=$(grep -r "import.*$COMPONENT" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | wc -l)

echo "Found $IMPORT_COUNT direct imports"

echo ""
echo "2. CHECKING DYNAMIC IMPORTS..."
echo "--------------------------------"
# Check for dynamic imports
grep -r "import.*['\"].*$COMPONENT" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null

DYNAMIC_COUNT=$(grep -r "import.*['\"].*$COMPONENT" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | wc -l)

echo "Found $DYNAMIC_COUNT dynamic imports"

echo ""
echo "3. CHECKING STRING REFERENCES..."
echo "--------------------------------"
# Check for string references (lazy loading, etc)
grep -r "'$COMPONENT'\|\"$COMPONENT\"" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | grep -v "import"

STRING_COUNT=$(grep -r "'$COMPONENT'\|\"$COMPONENT\"" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.jsx" \
    --include="*.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | grep -v "import" | wc -l)

echo "Found $STRING_COUNT string references"

echo ""
echo "4. CHECKING RE-EXPORTS..."
echo "--------------------------------"
# Check if component is re-exported from index files
grep -r "export.*$COMPONENT\|from.*$COMPONENT" \
    --include="index.ts" \
    --include="index.tsx" \
    --include="index.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null

EXPORT_COUNT=$(grep -r "export.*$COMPONENT\|from.*$COMPONENT" \
    --include="index.ts" \
    --include="index.tsx" \
    --include="index.js" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | wc -l)

echo "Found $EXPORT_COUNT re-exports"

echo ""
echo "5. CHECKING JSX USAGE..."
echo "--------------------------------"
# Check for JSX usage
grep -r "<$COMPONENT\|<${COMPONENT}[[:space:]/]" \
    --include="*.tsx" \
    --include="*.jsx" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null

JSX_COUNT=$(grep -r "<$COMPONENT\|<${COMPONENT}[[:space:]/]" \
    --include="*.tsx" \
    --include="*.jsx" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=archived-components \
    . 2>/dev/null | wc -l)

echo "Found $JSX_COUNT JSX usages"

echo ""
echo "================================================"
echo "SUMMARY FOR: $COMPONENT"
echo "================================================"
TOTAL_USAGE=$((IMPORT_COUNT + DYNAMIC_COUNT + STRING_COUNT + EXPORT_COUNT + JSX_COUNT))

if [ $TOTAL_USAGE -eq 0 ]; then
    echo "✅ SAFE TO DELETE - No usage found (0 references)"
    echo ""
    echo "Recommended action:"
    echo "1. Archive: mkdir -p archived-components && cp -r components/*/$COMPONENT* archived-components/"
    echo "2. Delete: rm -f components/*/$COMPONENT*"
    echo "3. Test: npx tsc --noEmit"
else
    echo "⚠️  COMPONENT IN USE - Found $TOTAL_USAGE total references"
    echo ""
    echo "Breakdown:"
    echo "  - Direct imports: $IMPORT_COUNT"
    echo "  - Dynamic imports: $DYNAMIC_COUNT"
    echo "  - String references: $STRING_COUNT"
    echo "  - Re-exports: $EXPORT_COUNT"
    echo "  - JSX usage: $JSX_COUNT"
    echo ""
    echo "Action required: Review each usage before consolidation"
fi

echo "================================================"