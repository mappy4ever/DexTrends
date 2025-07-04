#!/bin/bash
# pre-write.sh - Runs before writing any file

FILE_PATH="$1"
FILE_CONTENT="$2"

# Log the file being written
echo "📝 Writing to file: $FILE_PATH" >&2

# Example: Prevent writing to sensitive files
if [[ "$FILE_PATH" =~ \.(env|secret|key)$ ]]; then
    echo "❌ Cannot write to sensitive file: $FILE_PATH" >&2
    exit 1
fi

# Example: Check for common issues in code files
if [[ "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]]; then
    # Check for console.log statements
    if echo "$FILE_CONTENT" | grep -q "console\.log"; then
        echo "⚠️  Warning: console.log statements detected in $FILE_PATH" >&2
    fi
fi

# Allow the write
exit 0