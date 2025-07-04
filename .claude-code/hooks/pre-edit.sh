#!/bin/bash
# pre-edit.sh - Runs before editing any file

FILE_PATH="$1"
OLD_CONTENT="$2"
NEW_CONTENT="$3"

# Log the edit
echo "✏️  Editing file: $FILE_PATH" >&2

# Example: Create backup of important files before editing
if [[ "$FILE_PATH" =~ \.(config|json)$ ]]; then
    echo "💾 Creating backup of config file..." >&2
    # cp "$FILE_PATH" "$FILE_PATH.backup" 2>/dev/null || true
fi

# Example: Validate JSON files
if [[ "$FILE_PATH" =~ \.json$ ]]; then
    if ! echo "$NEW_CONTENT" | jq . >/dev/null 2>&1; then
        echo "❌ Invalid JSON in edited content" >&2
        exit 1
    fi
fi

# Allow the edit
exit 0