#!/bin/bash
# post-bash.sh - Runs after executing any bash command

# Log completion (for debugging)
echo "✅ Command completed with exit code: $2" >&2

# Example: Auto-format code after certain operations
if [[ "$1" =~ npm[[:space:]]install ]]; then
    echo "🎨 Running code formatter after npm install..." >&2
    # npm run format 2>/dev/null || true
fi

# Example: Run tests after code changes
if [[ "$1" =~ ^git[[:space:]]commit ]]; then
    echo "🧪 Consider running tests after commit" >&2
fi