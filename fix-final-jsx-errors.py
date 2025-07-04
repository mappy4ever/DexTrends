#!/usr/bin/env python3
"""
Fix the final remaining JSX errors
"""

import os
import re

def fix_remaining_jsx_errors(content):
    """Fix the remaining specific JSX patterns"""
    
    # Fix pattern: className="..."> \n style={...} \n ></div>
    content = re.sub(
        r'(className="[^"]*")>\s*\n\s*(style=\{[^}]*\})\s*\n\s*></div>',
        r'\1\n\2\n></div>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix pattern: > \n attribute="..." \n >
    content = re.sub(
        r'>\s*\n\s*([a-zA-Z-]+="[^"]*")\s*\n\s*>',
        r' \1>\n',
        content,
        flags=re.MULTILINE
    )
    
    # Fix pattern: > \n attribute={...} \n >
    content = re.sub(
        r'>\s*\n\s*([a-zA-Z-]+=\{[^}]*\})\s*\n\s*>',
        r' \1>\n',
        content,
        flags=re.MULTILINE
    )
    
    # Fix input elements with misplaced attributes
    content = re.sub(
        r'(<input[^>]*className="[^"]*")>\s*\n\s*(max="[^"]*")\s*\n\s*(step="[^"]*")\s*\n\s*/>',
        r'\1\n\2\n\3\n/>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix div elements with misplaced event handlers
    content = re.sub(
        r'(<div[^>]*className="[^"]*")>\s*\n\s*(on[A-Z][a-zA-Z]*=\{[^}]*\})\s*\n\s*>',
        r'\1\n\2\n>',
        content,
        flags=re.MULTILINE
    )
    
    return content

def fix_file(file_path):
    """Fix a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content = fix_remaining_jsx_errors(content)
        
        if fixed_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✅ Fixed: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ Error: {file_path} - {e}")
        return False

def main():
    """Fix the remaining problematic files"""
    
    problem_files = [
        "components/mobile/CardScanner.js",
        "components/mobile/EnhancedTouchInteractions.js", 
        "components/mobile/FloatingActionButton.js",
        "components/mobile/GestureCardSorting.js",
        "components/mobile/MobileCardGrid.js",
        "components/mobile/MobileShare.js",
        "components/mobile/PullToRefresh.js",
        "components/mobile/VoiceSearch.js",
        "components/qol/ContextualHelp.js",
        "components/qol/UserPreferences.js"
    ]
    
    print("🔧 Fixing final JSX errors...")
    
    fixed_count = 0
    for file_path in problem_files:
        if os.path.exists(file_path):
            if fix_file(file_path):
                fixed_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print(f"\n✅ Fixed {fixed_count} files")

if __name__ == "__main__":
    main()