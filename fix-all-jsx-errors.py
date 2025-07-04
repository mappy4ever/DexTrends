#!/usr/bin/env python3
"""
Final comprehensive JSX fix for all remaining syntax errors.
"""

import os
import re
import glob

def fix_all_jsx_issues(content):
    """Fix all JSX syntax issues comprehensively."""
    
    # Fix input elements with attributes on wrong lines
    content = re.sub(r'(<input[^>]*)\n\s*([^<>\n]+)\n\s*/>', 
                     lambda m: m.group(1) + ' ' + m.group(2).strip() + ' />', 
                     content, flags=re.MULTILINE)
    
    # Fix div elements with className followed by >
    content = re.sub(r'(className="[^"]*")>\s*\n\s*(style=\{[^}]+\}\})\s*\n\s*>',
                     r'\1\n          \2\n        >',
                     content, flags=re.MULTILINE)
    
    # Fix general pattern: attribute="value"> followed by newline and >
    content = re.sub(r'(\w+(?:-\w+)*="[^"]*")>\s*\n\s*([^<>\n]+)\s*\n\s*>',
                     lambda m: m.group(1).rstrip('>') + '\n          ' + m.group(2).strip() + '\n        >',
                     content, flags=re.MULTILINE)
    
    # Fix className alone followed by > and attributes
    content = re.sub(r'(className="[^"]*")>\s*\n\s*([^<>\n]*=\{[^}]+\}[^<>\n]*)\s*\n\s*>',
                     r'\1\n          \2\n        >',
                     content, flags=re.MULTILINE)
    
    # Fix simple > placement issues
    content = re.sub(r'(className="[^"]*")>\s*\n\s*>',
                     r'\1\n        >',
                     content, flags=re.MULTILINE)
    
    # Fix img and input self-closing issues  
    content = re.sub(r'(<(?:img|input)[^>]*)>\s*\n\s*([^<>\n/]+)\s*\n\s*/>',
                     r'\1 \2 />',
                     content, flags=re.MULTILINE)
    
    return content

def process_all_problem_files():
    """Process all files that might have JSX issues."""
    
    patterns = [
        'components/**/*.js',
        'pages/**/*.js'
    ]
    
    total_fixed = 0
    
    for pattern in patterns:
        for filepath in glob.glob(pattern, recursive=True):
            if os.path.isfile(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        original = f.read()
                    
                    fixed = fix_all_jsx_issues(original)
                    
                    if fixed != original:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(fixed)
                        print(f"Fixed: {filepath}")
                        total_fixed += 1
                        
                except Exception as e:
                    print(f"Error in {filepath}: {e}")
    
    print(f"Total files fixed: {total_fixed}")

if __name__ == "__main__":
    print("Running comprehensive JSX fix...")
    process_all_problem_files()
    print("JSX fix complete!")