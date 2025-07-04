#!/bin/bash
# post-write.sh - Runs after writing any file

FILE_PATH="$1"

# Log completion
echo "✅ File written: $FILE_PATH" >&2

# Example: Auto-format specific file types
if [[ "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]]; then
    echo "🎨 Formatting JavaScript/TypeScript file..." >&2
    # npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi

# Example: Update TypeScript definitions after writing .js files
if [[ "$FILE_PATH" =~ \.js$ ]] && [[ -f "tsconfig.json" ]]; then
    echo "📘 Consider updating TypeScript definitions" >&2
fi