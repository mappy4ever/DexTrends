#!/usr/bin/env python3
"""
Comprehensive JSX syntax fixer - Final attempt
This script fixes JSX attribute placement errors where attributes appear after closing >
"""

import os
import re
import sys
from pathlib import Path

def fix_jsx_errors(content):
    """Fix JSX syntax errors in the content"""
    
    # Pattern 1: Fix attribute after closing > (most common error)
    # Look for patterns like:
    # <tag className="...">
    #   attributeName={value}
    # >
    pattern1 = re.compile(
        r'(<[^>]+)\s*>\s*\n\s*([a-zA-Z-]+\s*=\s*[^>]+)\s*\n\s*>',
        re.MULTILINE
    )
    
    def replace_func1(match):
        tag_part = match.group(1).rstrip()
        attribute_part = match.group(2).strip()
        return f'{tag_part}\n        {attribute_part}\n      >'
    
    content = pattern1.sub(replace_func1, content)
    
    # Pattern 2: Fix style attributes that got separated
    # <div className="...">
    #   style={{...}}
    # >
    pattern2 = re.compile(
        r'(<[^>]+className[^>]*)\s*>\s*\n\s*(style\s*=\s*\{\{[^}]*\}\})\s*\n\s*>',
        re.MULTILINE | re.DOTALL
    )
    
    def replace_func2(match):
        tag_part = match.group(1).rstrip()
        style_part = match.group(2).strip()
        return f'{tag_part}\n        {style_part}\n      >'
    
    content = pattern2.sub(replace_func2, content)
    
    # Pattern 3: Fix multiple attributes after >
    pattern3 = re.compile(
        r'(<[^>]+)\s*>\s*\n(\s*[a-zA-Z-]+\s*=\s*[^>\n]+\s*\n)+\s*>',
        re.MULTILINE
    )
    
    # Pattern 4: Very specific fixes for common patterns seen in errors
    fixes = [
        # Fix: className="..."> followed by attribute on next line
        (r'(className="[^"]*")\s*>\s*\n\s*([a-zA-Z-]+\s*=)', r'\1\n        \2'),
        
        # Fix: aria-label after >
        (r'>\s*\n\s*(aria-label\s*=\s*[^>]+)\s*\n\s*>', r'\n        \1\n      >'),
        
        # Fix: style after >
        (r'>\s*\n\s*(style\s*=\s*\{[^}]+\})\s*\n\s*>', r'\n        \1\n      >'),
        
        # Fix: disabled after >
        (r'>\s*\n\s*(disabled\s*=\s*[^>]+)\s*\n\s*>', r'\n        \1\n      >'),
        
        # Fix: onClick after >
        (r'>\s*\n\s*(onClick\s*=\s*[^>]+)\s*\n\s*>', r'\n        \1\n      >'),
    ]
    
    for pattern, replacement in fixes:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        fixed_content = fix_jsx_errors(original_content)
        
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✅ Fixed: {file_path}")
            return True
        else:
            print(f"⚪ No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    # Files that had errors according to the build log
    error_files = [
        "components/ui/AdvancedLoadingStates.js",
        "components/ui/BulkCardOperations.js", 
        "components/ui/CollectionTracker.js",
        "components/ui/DataAnalyticsDashboard.js",
        "components/ui/DeckStackDisplay.js",
        "components/ui/FloatingActionSystem.js",
        "components/ui/GameficationSystem.js",
        "components/ui/MicroInteractionSystem.js",
        "components/ui/PerformanceDashboard.js",
        "components/ui/PortfolioManager.js",
        "components/ui/PriceIntelligenceSystem.js",
        "components/ui/QATestingSuite.js",
        "components/ui/SocialCommunityHub.js",
        "components/ui/TooltipHelpSystem.js",
        "components/ui/TouchGestureSystem.js",
        "components/ui/TournamentSystem.js",
        "components/ui/VirtualizedCardGrid.js",
        "components/ui/VoiceSearchInterface.js"
    ]
    
    project_root = Path.cwd()
    fixed_count = 0
    
    print("🔧 Starting comprehensive JSX syntax error fixes...")
    
    for file_rel_path in error_files:
        file_path = project_root / file_rel_path
        if file_path.exists():
            if process_file(file_path):
                fixed_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print(f"\n✅ Fixed {fixed_count} files with JSX syntax errors")
    print("🎯 Run 'npm run build' to verify fixes")

if __name__ == "__main__":
    main()