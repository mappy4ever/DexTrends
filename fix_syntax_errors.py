#!/usr/bin/env python3
"""Fix common syntax errors in TypeScript files"""

import os
import re
import sys

def fix_syntax_errors(content):
    """Fix common syntax errors in TypeScript/JSX content"""
    
    # Fix function declarations with empty braces followed by code
    # Pattern: function_name() {} followed by code on next line
    content = re.sub(
        r'(\w+\s*\([^)]*\)\s*:\s*\w+\s*)\{\}(\s*\n\s*)([^}])',
        r'\1{\2\3',
        content
    )
    
    # Fix arrow functions with empty braces
    content = re.sub(
        r'(=>\s*)\{\}(\s*\n\s*)([^}])',
        r'\1{\2\3',
        content
    )
    
    # Fix if statements with empty braces
    content = re.sub(
        r'(if\s*\([^)]+\)\s*)\{\}(\s*\n\s*)([^}])',
        r'\1{\2\3',
        content
    )
    
    # Fix interface declarations with empty braces
    content = re.sub(
        r'(interface\s+\w+\s*)\{\}(\s*\n\s*)(\w+\s*:)',
        r'\1{\2\3',
        content
    )
    
    # Fix const/let/var declarations with empty braces
    content = re.sub(
        r'((?:const|let|var)\s+\w+\s*(?::\s*[^=]+)?\s*=\s*)\{\}(\s*\n\s*)(\w+\s*:)',
        r'\1{\2\3',
        content
    )
    
    # Fix HTML entities in JSX
    content = re.sub(r'&gt;', '>', content)
    content = re.sub(r'&lt;', '<', content)
    
    # Fix malformed JSX tags
    # Pattern: <tag>attr=value</tag> -> <tag attr=value />
    content = re.sub(
        r'<(\w+)>([^<]+)<\/\1>',
        lambda m: f'<{m.group(1)} {m.group(2)} />' if '=' in m.group(2) else m.group(0),
        content
    )
    
    # Fix className with curly braces instead of quotes
    content = re.sub(
        r'className=\{([^}]+)\}',
        lambda m: f'className="{m.group(1)}"' if not any(c in m.group(1) for c in ['${', '`']) else m.group(0),
        content
    )
    
    # Fix incomplete closing tags
    content = re.sub(r'\$1\}<\/\$2>', '}', content)
    content = re.sub(r'\$1\}<\/\$2', '}', content)
    
    # Fix empty JSX tags
    content = re.sub(r'<(\w+)><\/\1>', lambda m: f'<{m.group(1)} />', content)
    
    return content

def process_file(filepath):
    """Process a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_syntax_errors(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    fixed_count = 0
    error_count = 0
    
    # Process all TypeScript/TSX files
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and other build directories
        if any(skip in root for skip in ['node_modules', '.next', 'dist', '.git']):
            continue
            
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    fixed_count += 1
                else:
                    error_count += 1
    
    print(f"\nSummary:")
    print(f"Files fixed: {fixed_count}")
    print(f"Files with errors: {error_count}")

if __name__ == "__main__":
    main()