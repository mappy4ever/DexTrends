#!/usr/bin/env python3
"""
Systematic JSX syntax fix for DexTrends codebase.
Fixes common JSX syntax issues where attributes are malformed.
"""

import os
import re
import glob

def fix_jsx_syntax(content):
    """Fix common JSX syntax issues."""
    
    # Pattern 1: Fix className="something"> followed by attributes on next line
    # Example: className="test"> \n aria-label="label" \n >
    pattern1 = r'(\w+="[^"]*">\s*)\n\s*(\w+(?:-\w+)*="[^"]*")\s*\n\s*>'
    def fix_pattern1(match):
        first_attr = match.group(1).rstrip('>')  # Remove the > from first attribute
        second_attr = match.group(2)
        return f'{first_attr}\n        {second_attr}\n      >'
    
    content = re.sub(pattern1, fix_pattern1, content, flags=re.MULTILINE)
    
    # Pattern 2: Fix style={{...}} appearing after >
    # Example: className="test"> \n style={{...}} \n >
    pattern2 = r'(\w+="[^"]*">\s*)\n\s*(style=\{[^}]+\}\})\s*\n\s*>'
    def fix_pattern2(match):
        first_attr = match.group(1).rstrip('>')  # Remove the > from first attribute
        style_attr = match.group(2)
        return f'{first_attr}\n        {style_attr}\n      >'
    
    content = re.sub(pattern2, fix_pattern2, content, flags=re.MULTILINE)
    
    # Pattern 3: Fix general case of attributes after >
    # More aggressive pattern for any attribute after >
    pattern3 = r'(className="[^"]*">\s*)\n\s*([^<>\n]+)\s*\n\s*>'
    def fix_pattern3(match):
        classname = match.group(1).rstrip('>')
        attrs = match.group(2).strip()
        if '=' in attrs and not attrs.startswith('{'):  # Make sure it's an attribute, not content
            return f'{classname}\n        {attrs}\n      >'
        else:
            return match.group(0)  # Return unchanged if not an attribute
    
    content = re.sub(pattern3, fix_pattern3, content, flags=re.MULTILINE)
    
    return content

def process_files():
    """Process all JS/JSX files in the project."""
    
    # Find all JS/JSX files
    patterns = [
        'components/**/*.js',
        'pages/**/*.js', 
        'utils/**/*.js',
        'hooks/**/*.js'
    ]
    
    files_processed = 0
    files_fixed = 0
    
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            if os.path.isfile(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        original_content = f.read()
                    
                    fixed_content = fix_jsx_syntax(original_content)
                    
                    if fixed_content != original_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(fixed_content)
                        print(f"Fixed JSX syntax in: {filepath}")
                        files_fixed += 1
                    
                    files_processed += 1
                    
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
    
    print(f"\nProcessed {files_processed} files, fixed {files_fixed} files")

if __name__ == "__main__":
    print("Starting systematic JSX syntax fix...")
    process_files()
    print("JSX syntax fix complete!")