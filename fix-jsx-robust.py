#!/usr/bin/env python3
"""
Robust JSX syntax fix for remaining formatting issues.
"""

import os
import re
import glob

def fix_jsx_comprehensive(content):
    """Fix comprehensive JSX syntax issues."""
    
    # Fix pattern: attribute="value"> on one line, then > on next line
    pattern1 = r'(\w+(?:-\w+)*="[^"]*">\s*)\n\s*>'
    content = re.sub(pattern1, lambda m: m.group(1).rstrip('>') + '\n          >', content, flags=re.MULTILINE)
    
    # Fix pattern: className="value"> followed by newline and >
    pattern2 = r'(className="[^"]*">\s*)\n\s*>'
    content = re.sub(pattern2, lambda m: m.group(1).rstrip('>') + '\n          >', content, flags=re.MULTILINE)
    
    # Fix img tags with attributes on wrong lines
    pattern3 = r'(<img[^>]*)\n\s*([^>]*>\s*)\n\s*([^<]*)\n\s*/>'
    def fix_img(match):
        img_start = match.group(1)
        attrs = match.group(2).rstrip('>')
        content_after = match.group(3).strip()
        if content_after and not content_after.startswith('<'):
            return f'{img_start}\n                  {attrs}\n                  {content_after}\n                />'
        else:
            return f'{img_start}\n                  {attrs}\n                />'
    content = re.sub(pattern3, fix_img, content, flags=re.MULTILINE)
    
    # Fix style attribute misplacement
    pattern4 = r'(className="[^"]*">\s*)\n\s*(style=\{[^}]+\}\})\s*\n\s*>'
    def fix_style(match):
        classname = match.group(1).rstrip('>')
        style = match.group(2)
        return f'{classname}\n          {style}\n        >'
    content = re.sub(pattern4, fix_style, content, flags=re.MULTILINE)
    
    return content

def process_remaining_files():
    """Process files that likely still have JSX issues."""
    
    # Target specific problem files first
    problem_files = [
        'components/mobile/MobileIntegration.js',
        'components/mobile/GestureCardSorting.js',
        'components/mobile/*.js',
        'components/ui/*.js'
    ]
    
    files_fixed = 0
    
    for pattern in problem_files:
        for filepath in glob.glob(pattern, recursive=True):
            if os.path.isfile(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        original = f.read()
                    
                    fixed = fix_jsx_comprehensive(original)
                    
                    if fixed != original:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(fixed)
                        print(f"Fixed: {filepath}")
                        files_fixed += 1
                        
                except Exception as e:
                    print(f"Error in {filepath}: {e}")
    
    print(f"Fixed {files_fixed} additional files")

if __name__ == "__main__":
    process_remaining_files()