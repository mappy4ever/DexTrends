#!/usr/bin/env python3
"""
Final JSX Error Fixer - Fix all remaining JSX syntax errors
"""

import os
import re

def fix_jsx_final(content):
    """Fix remaining JSX syntax patterns"""
    
    # Fix elements with className ending with "> instead of ">
    # Pattern: className="..."> followed by newline and >
    content = re.sub(
        r'(className="[^"]*")>\s*\n\s*>',
        r'\1>\n',
        content,
        flags=re.MULTILINE
    )
    
    # Fix self-closing elements with misplaced closing >
    # Pattern: <element ..."> />
    content = re.sub(
        r'([^=])\">\s*/>',
        r'\1" />',
        content
    )
    
    # Fix any element where attributes are split incorrectly
    # Pattern: <element attr="value"> \n >
    content = re.sub(
        r'([a-zA-Z-]+="[^"]*")>\s*\n\s*>',
        r'\1>\n',
        content,
        flags=re.MULTILINE
    )
    
    return content

def process_all_jsx_files():
    """Process all JS/JSX files"""
    
    # Get all JS/JSX files
    jsx_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        for file in files:
            if file.endswith(('.js', '.jsx')) and not file.endswith('.config.js'):
                jsx_files.append(os.path.join(root, file))
    
    fixed_count = 0
    
    for file_path in jsx_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fixed_content = fix_jsx_final(content)
            
            if fixed_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                print(f"✓ Fixed {file_path}")
                fixed_count += 1
                
        except Exception as e:
            print(f"✗ Error in {file_path}: {e}")
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    process_all_jsx_files()