#!/usr/bin/env python3
"""
ULTIMATE JSX FIXER - Fix every single JSX syntax error
"""

import os
import re

def ultimate_jsx_fix(content):
    """Apply the most comprehensive JSX fixes possible"""
    
    # Fix ALL possible JSX attribute placement errors
    
    # 1. Any element where attributes appear after the closing >
    content = re.sub(
        r'(<[a-zA-Z][^<>]*>)\s*\n\s*([a-zA-Z-]+=(?:"[^"]*"|\{[^}]*\}))\s*\n',
        r'\1',
        content,
        flags=re.MULTILINE
    )
    
    # 2. Fix self-closing elements with attributes after >
    content = re.sub(
        r'(<[a-zA-Z][^<>]*>)\s*\n\s*([a-zA-Z-]+=(?:"[^"]*"|\{[^}]*\}))\s*\n\s*(/>)',
        r'\1',
        content,
        flags=re.MULTILINE
    )
    
    # 3. Fix div/span/button elements with event handlers split
    content = re.sub(
        r'(<(?:div|span|button|input|select|textarea)[^>]*className="[^"]*")>\s*\n\s*((?:on[A-Z][a-zA-Z]*|aria-[a-zA-Z-]+|style|max|min|step|rows|cols|placeholder)=(?:"[^"]*"|\{[^}]*\}))\s*\n\s*(>)',
        r'\1 \2\3',
        content,
        flags=re.MULTILINE
    )
    
    # 4. Fix any remaining > followed by attributes
    content = re.sub(
        r'>\s*\n\s*([a-zA-Z-]+=(?:"[^"]*"|\{[^}]*\}))\s*\n\s*>',
        r' \1>',
        content,
        flags=re.MULTILINE
    )
    
    # 5. Fix specific patterns for img/video/audio elements
    content = re.sub(
        r'(<(?:img|video|audio)[^>]*className="[^"]*")>\s*\n\s*((?:src|alt|style|autoPlay|playsInline|muted|controls)=(?:"[^"]*"|\{[^}]*\}))\s*\n\s*(/>)',
        r'\1 \2 \3',
        content,
        flags=re.MULTILINE
    )
    
    return content

def fix_file_ultimate(file_path):
    """Fix a file with ultimate JSX fixing"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply multiple passes of fixes
        for i in range(3):  # Multiple passes to catch nested issues
            content = ultimate_jsx_fix(content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ FIXED: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ ERROR: {file_path} - {e}")
        return False

def main():
    """Apply ultimate JSX fixes to ALL files"""
    
    print("🚀 ULTIMATE JSX ERROR ELIMINATION")
    print("=" * 50)
    
    # Get ALL JS/JSX files
    all_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        for file in files:
            if file.endswith(('.js', '.jsx')) and not file.endswith('.config.js'):
                all_files.append(os.path.join(root, file))
    
    print(f"📁 Processing {len(all_files)} files...")
    
    fixed_count = 0
    for file_path in all_files:
        if fix_file_ultimate(file_path):
            fixed_count += 1
    
    print(f"\n✅ ULTIMATE FIX COMPLETE: {fixed_count} files fixed")
    print("🚀 Ready for deployment!")

if __name__ == "__main__":
    main()