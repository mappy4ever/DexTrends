#!/bin/bash

# Safe Component Rename Script
# Usage: ./rename-component.sh OldName NewName

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./rename-component.sh OldName NewName"
    echo "Example: ./rename-component.sh SimpleCardWrapper TCGCardLogicWrapper"
    exit 1
fi

OLD_NAME=$1
NEW_NAME=$2

echo "================================================"
echo "RENAMING: $OLD_NAME → $NEW_NAME"
echo "================================================"

# 1. Find the component file
echo ""
echo "1. LOCATING COMPONENT FILE..."
echo "--------------------------------"
OLD_FILES=$(find components -name "*$OLD_NAME.tsx" -o -name "*$OLD_NAME.ts" 2>/dev/null)

if [ -z "$OLD_FILES" ]; then
    echo "❌ No files found matching *$OLD_NAME.tsx or *$OLD_NAME.ts"
    exit 1
fi

echo "Found files to rename:"
echo "$OLD_FILES"

# 2. Check current usage
echo ""
echo "2. CHECKING CURRENT USAGE..."
echo "--------------------------------"
IMPORT_COUNT=$(grep -r "import.*$OLD_NAME" \
    --include="*.tsx" \
    --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    . 2>/dev/null | wc -l)

echo "Found $IMPORT_COUNT imports of $OLD_NAME"

if [ $IMPORT_COUNT -gt 20 ]; then
    echo "⚠️  WARNING: High usage count. Consider gradual migration."
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Rename cancelled."
        exit 0
    fi
fi

# 3. Create backup
echo ""
echo "3. CREATING BACKUP..."
echo "--------------------------------"
mkdir -p archived-components/renames
cp -r $OLD_FILES archived-components/renames/
echo "✅ Backup created in archived-components/renames/"

# 4. Rename files
echo ""
echo "4. RENAMING FILES..."
echo "--------------------------------"
for file in $OLD_FILES; do
    dir=$(dirname "$file")
    new_file="$dir/$NEW_NAME.tsx"
    
    # Check if already has .tsx extension in the replacement
    if [[ "$file" == *.ts ]] && [[ "$file" != *.tsx ]]; then
        new_file="$dir/$NEW_NAME.ts"
    fi
    
    mv "$file" "$new_file"
    echo "✅ Renamed: $file → $new_file"
done

# 5. Update imports in all files
echo ""
echo "5. UPDATING IMPORTS..."
echo "--------------------------------"

# Update import statements
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/import \(.*\) from \(.*\)$OLD_NAME/import \1 from \2$NEW_NAME/g" {} \;

find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/import $OLD_NAME/import $NEW_NAME/g" {} \;

# Update JSX usage
find . -type f \( -name "*.tsx" -o -name "*.jsx" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/<$OLD_NAME/<$NEW_NAME/g" {} \;

find . -type f \( -name "*.tsx" -o -name "*.jsx" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/<\/$OLD_NAME>/<\/$NEW_NAME>/g" {} \;

# Update exports
find . -type f -name "index.ts" \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/export.*$OLD_NAME/export { default as $NEW_NAME } from './$NEW_NAME'/g" {} \;

# Update type references
find . -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./archived-components/*" \
    -exec sed -i '' "s/: $OLD_NAME/: $NEW_NAME/g" {} \;

echo "✅ Updated all references"

# 6. Update component display name inside the file
echo ""
echo "6. UPDATING COMPONENT INTERNALS..."
echo "--------------------------------"
NEW_FILES=$(find components -name "*$NEW_NAME.tsx" -o -name "*$NEW_NAME.ts" 2>/dev/null)

for file in $NEW_FILES; do
    # Update displayName
    sed -i '' "s/$OLD_NAME\.displayName/$NEW_NAME.displayName/g" "$file"
    
    # Update component definition
    sed -i '' "s/const $OLD_NAME/const $NEW_NAME/g" "$file"
    sed -i '' "s/function $OLD_NAME/function $NEW_NAME/g" "$file"
    sed -i '' "s/export default $OLD_NAME/export default $NEW_NAME/g" "$file"
    
    # Update interface/type names
    sed -i '' "s/interface ${OLD_NAME}Props/interface ${NEW_NAME}Props/g" "$file"
    sed -i '' "s/type ${OLD_NAME}Props/type ${NEW_NAME}Props/g" "$file"
    
    echo "✅ Updated internals in $file"
done

# 7. Run TypeScript check
echo ""
echo "7. RUNNING TYPESCRIPT CHECK..."
echo "--------------------------------"
npx tsc --noEmit 2>&1 | head -10

TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)

if [ $TS_ERRORS -eq 0 ]; then
    echo "✅ No TypeScript errors!"
else
    echo "⚠️  Found $TS_ERRORS TypeScript errors. Review needed."
fi

# 8. Show git status
echo ""
echo "8. GIT STATUS..."
echo "--------------------------------"
git status --short | head -20

# 9. Summary
echo ""
echo "================================================"
echo "RENAME COMPLETE: $OLD_NAME → $NEW_NAME"
echo "================================================"
echo ""
echo "✅ Files renamed"
echo "✅ Imports updated"
echo "✅ Exports updated"
echo "✅ Component internals updated"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test in browser"
echo "3. Commit: git add -A && git commit -m \"refactor: Rename $OLD_NAME to $NEW_NAME for clarity\""
echo ""
echo "To undo:"
echo "1. git checkout -- ."
echo "2. cp archived-components/renames/* components/"
echo ""
echo "================================================"