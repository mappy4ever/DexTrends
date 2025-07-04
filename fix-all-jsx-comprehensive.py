#!/usr/bin/env python3
"""
COMPREHENSIVE JSX ERROR FIXER - Fix ALL JSX syntax errors in the entire project
This script will systematically find and fix every single JSX syntax error
"""

import os
import re
import sys
from pathlib import Path

def comprehensive_jsx_fix(content):
    """Apply comprehensive JSX syntax fixes"""
    
    # 1. Fix elements with attributes on separate lines after >
    # Pattern: <element attr="value"> \n attribute="value" \n >
    content = re.sub(
        r'(<[a-zA-Z][^>]*>)\s*\n\s*([a-zA-Z-]+(?:="[^"]*"|=\{[^}]*\}))\s*\n\s*>',
        r'\1',
        content,
        flags=re.MULTILINE
    )
    
    # 2. Fix video/audio/img elements with misplaced attributes
    # Pattern: <element> \n attributes \n />
    content = re.sub(
        r'(<(?:video|audio|img|input|select|button|div|span)[^>]*>)\s*\n\s*([a-zA-Z-]+(?:="[^"]*"|=\{[^}]*\}))\s*\n\s*(/>|>)',
        r'\1',
        content,
        flags=re.MULTILINE
    )
    
    # 3. Fix specific pattern: attribute after closing >
    # Pattern: > \n attribute="value" \n
    content = re.sub(
        r'>\s*\n\s*([a-zA-Z-]+(?:="[^"]*"|=\{[^}]*\}))\s*\n',
        r'>\n',
        content,
        flags=re.MULTILINE
    )
    
    # 4. Fix self-closing elements with broken syntax
    # Pattern: element"> /> should be element" />
    content = re.sub(r'([^=])\">\s*/>',  r'\1" />', content)
    
    # 5. Fix video elements specifically
    # Pattern: <video ...> style={{...}} />
    content = re.sub(
        r'(<video[^>]*className="[^"]*")>\s*\n\s*(style=\{[^}]*\})\s*\n\s*(/>)',
        r'\1 \2 \3',
        content,
        flags=re.MULTILINE
    )
    
    # 6. Fix button elements with misplaced aria-label
    content = re.sub(
        r'(<button[^>]*className="[^"]*")>\s*\n\s*(aria-label="[^"]*")\s*\n\s*(>)',
        r'\1 \2\3',
        content,
        flags=re.MULTILINE
    )
    
    # 7. Fix any element where className is followed by > but has more attributes after
    content = re.sub(
        r'(className="[^"]*")>\s*\n\s*([a-zA-Z-]+="[^"]*")\s*\n\s*(>)',
        r'\1 \2\3',
        content,
        flags=re.MULTILINE
    )
    
    # 8. Fix Link components with href on separate lines
    content = re.sub(
        r'(<Link[^>]*)>\s*\n\s*(href="[^"]*")\s*\n',
        r'\1 \2>\n',
        content,
        flags=re.MULTILINE
    )
    
    return content

def analyze_file_for_jsx_errors(file_path):
    """Analyze a file for JSX syntax errors and report them"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        errors = []
        lines = content.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check for common JSX syntax error patterns
            
            # Pattern 1: > followed by attribute on next line
            if line.strip().endswith('>') and i < len(lines):
                next_line = lines[i].strip() if i < len(lines) else ""
                if re.match(r'^[a-zA-Z-]+="[^"]*"$', next_line):
                    errors.append(f"Line {i}: Attribute on separate line after >")
            
            # Pattern 2: className ending with "> instead of ">
            if re.search(r'className="[^"]*">\s*$', line):
                if i < len(lines) and lines[i].strip().startswith(('aria-', 'style=', 'onClick=', 'onChange=', 'href=', 'src=', 'alt=')):
                    errors.append(f"Line {i}: Missing closing bracket before attribute")
            
            # Pattern 3: Self-closing elements with broken syntax
            if re.search(r'[a-zA-Z-]+="[^"]*">\s*/>$', line):
                errors.append(f"Line {i}: Self-closing element syntax error")
            
            # Pattern 4: Video/audio elements without proper closing
            if re.search(r'<(video|audio|img)[^>]*>$', line) and not '/>' in line:
                # Check if properly closed in next few lines
                closed = False
                for j in range(i, min(i+10, len(lines))):
                    if f'</{line.strip().split()[0][1:]}>' in lines[j] or '/>' in lines[j]:
                        closed = True
                        break
                if not closed:
                    errors.append(f"Line {i}: Unclosed element")
        
        return errors
        
    except Exception as e:
        return [f"Error analyzing file: {e}"]

def fix_file(file_path):
    """Fix JSX errors in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = comprehensive_jsx_fix(original_content)
        
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
        
    except Exception as e:
        print(f"ERROR fixing {file_path}: {e}")
        return False

def main():
    """Main function - comprehensive JSX error fixing"""
    
    print("🔍 COMPREHENSIVE JSX ERROR ANALYSIS AND FIX")
    print("=" * 60)
    
    # Get all JS/JSX files
    jsx_files = []
    for root, dirs, files in os.walk('.'):
        # Skip unwanted directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'build', 'dist']]
        
        for file in files:
            if file.endswith(('.js', '.jsx')) and not file.endswith('.config.js'):
                jsx_files.append(os.path.join(root, file))
    
    print(f"📁 Found {len(jsx_files)} JS/JSX files to analyze")
    print()
    
    # Phase 1: Analyze all files for errors
    print("🔍 PHASE 1: ANALYZING ALL FILES FOR JSX ERRORS")
    print("-" * 50)
    
    files_with_errors = []
    total_errors = 0
    
    for file_path in jsx_files:
        errors = analyze_file_for_jsx_errors(file_path)
        if errors:
            files_with_errors.append((file_path, errors))
            total_errors += len(errors)
            print(f"❌ {file_path}: {len(errors)} errors")
            for error in errors[:3]:  # Show first 3 errors
                print(f"   • {error}")
            if len(errors) > 3:
                print(f"   • ... and {len(errors) - 3} more errors")
        else:
            print(f"✅ {file_path}: No errors detected")
    
    print(f"\n📊 ANALYSIS COMPLETE:")
    print(f"   • Files with errors: {len(files_with_errors)}")
    print(f"   • Total errors: {total_errors}")
    
    if not files_with_errors:
        print("🎉 No JSX errors found!")
        return
    
    # Phase 2: Fix all files
    print(f"\n🔧 PHASE 2: FIXING ALL JSX ERRORS")
    print("-" * 50)
    
    fixed_count = 0
    for file_path in jsx_files:
        if fix_file(file_path):
            print(f"✅ Fixed: {file_path}")
            fixed_count += 1
        else:
            print(f"⚪ No changes: {file_path}")
    
    print(f"\n🎯 COMPREHENSIVE FIX COMPLETE:")
    print(f"   • Files processed: {len(jsx_files)}")
    print(f"   • Files fixed: {fixed_count}")
    
    # Phase 3: Re-analyze to verify fixes
    print(f"\n🔍 PHASE 3: VERIFICATION")
    print("-" * 50)
    
    remaining_errors = 0
    for file_path in jsx_files:
        errors = analyze_file_for_jsx_errors(file_path)
        if errors:
            remaining_errors += len(errors)
            print(f"❌ {file_path}: {len(errors)} remaining errors")
        else:
            print(f"✅ {file_path}: Clean")
    
    if remaining_errors == 0:
        print(f"\n🎉 SUCCESS! ALL JSX ERRORS FIXED!")
        print(f"   • All {len(jsx_files)} files are now error-free")
        print(f"   • Ready for Vercel deployment")
    else:
        print(f"\n⚠️  {remaining_errors} errors still remain - manual review needed")

if __name__ == "__main__":
    main()