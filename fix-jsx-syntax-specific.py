#!/usr/bin/env python3
"""
Specific JSX Syntax Error Fixer - Fix the exact patterns causing build failures
"""

import os
import re
import sys

def fix_specific_jsx_errors(content):
    """Fix specific JSX syntax patterns that cause build failures"""
    
    # Fix img tags with misplaced attributes
    # Pattern: <img ... className="..."> attribute />
    # Should be: <img ... className="..." attribute />
    content = re.sub(
        r'(<img[^>]*className="[^"]*")>\s*([^<>]*?)\s*/>',
        r'\1 \2 />',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix div tags with misplaced style attribute
    # Pattern: <div className="..."> style={{...}} >
    # Should be: <div className="..." style={{...}} >
    content = re.sub(
        r'(<div[^>]*className="[^"]*")>\s*(style=\{[^}]*\})\s*>',
        r'\1 \2>',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix any element with misplaced attributes after >
    # Pattern: <element className="..."> attribute >
    # Should be: <element className="..." attribute >
    content = re.sub(
        r'(<\w+[^>]*className="[^"]*")>\s*([a-zA-Z][a-zA-Z0-9]*=\{[^}]*\})\s*>',
        r'\1 \2>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix button elements with misplaced title
    # Pattern: <button className="..."> title="..." >
    # Should be: <button className="..." title="..." >
    content = re.sub(
        r'(<button[^>]*className="[^"]*")>\s*(title="[^"]*")\s*>',
        r'\1 \2>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix Link elements with misplaced href
    # Pattern: <Link className="..."> href="..." >
    # Should be: <Link className="..." href="..." >
    content = re.sub(
        r'(<Link[^>]*className="[^"]*")>\s*(href="[^"]*")\s*>',
        r'\1 \2>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix any HTML element where className is not properly closed
    # Pattern: <element className="..." other-attr="value">
    # Make sure there's a space before other attributes
    content = re.sub(
        r'(<\w+[^>]*className="[^"]*")([a-zA-Z])',
        r'\1 \2',
        content
    )
    
    return content

def process_file(file_path):
    """Process a single file to fix JSX errors"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_specific_jsx_errors(content)
        
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ Fixed JSX syntax in {file_path}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    """Fix JSX syntax errors in all JS/JSX files"""
    
    # Get all JS/JSX files that could have errors
    jsx_files = []
    
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and .next directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        
        for file in files:
            if file.endswith(('.js', '.jsx')) and not file.endswith('.config.js'):
                jsx_files.append(os.path.join(root, file))
    
    print(f"🔧 Fixing JSX syntax errors in {len(jsx_files)} files...")
    
    fixed_count = 0
    
    for file_path in jsx_files:
        if process_file(file_path):
            fixed_count += 1
    
    print(f"\n📊 Fixed JSX syntax errors in {fixed_count} files!")
    
    if fixed_count > 0:
        print("🚀 Try running 'npm run build' again.")

if __name__ == "__main__":
    main()