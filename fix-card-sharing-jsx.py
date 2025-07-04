#!/usr/bin/env python3

import re

# Read the file
with open('/Users/moazzam/Documents/GitHub/Mappy/DexTrends/components/ui/CardSharingSystem.js', 'r') as f:
    content = f.read()

# Fix pattern: className="...">[\n\s]*/>
pattern = r'className="([^"]*)">\s*\n\s*\/>'
replacement = r'className="\1"\n                    />'

# Apply the fix
fixed_content = re.sub(pattern, replacement, content)

# Write back the fixed content
with open('/Users/moazzam/Documents/GitHub/Mappy/DexTrends/components/ui/CardSharingSystem.js', 'w') as f:
    f.write(fixed_content)

print("Fixed JSX syntax errors in CardSharingSystem.js")