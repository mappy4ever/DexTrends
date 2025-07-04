#!/bin/bash
# pre-bash.sh - Runs before executing any bash command

# Log the command being executed (for debugging)
echo "🔧 Executing command: $1" >&2

# Example: Prevent dangerous commands
if [[ "$1" =~ ^rm[[:space:]]+-rf[[:space:]]+/ ]]; then
    echo "❌ Dangerous command blocked: rm -rf on root paths" >&2
    exit 1
fi

# Example: Warn about git operations
if [[ "$1" =~ ^git[[:space:]]+(push|force) ]]; then
    echo "⚠️  Warning: Git push operation detected. Proceed with caution." >&2
fi

# Allow the command to proceed
exit 0