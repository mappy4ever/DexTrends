#!/usr/bin/env python3
"""
Comprehensive JSX Error Fixer - Fix all JSX syntax errors preventing Vercel build
This script systematically fixes JSX errors like self-closing tags and missing brackets
"""

import os
import re
import sys
from pathlib import Path

def fix_jsx_errors(content):
    """Fix common JSX syntax errors in content"""
    
    # Fix Link components with missing closing bracket
    # Pattern: className="..."> followed by content and </Link>
    # Should be: className="..."> content </Link>
    content = re.sub(
        r'(<Link[^>]*className="[^"]*")>\s*\n\s*([^<]*)\n\s*</Link>',
        r'\1>\n\2\n</Link>',
        content,
        flags=re.MULTILINE
    )
    
    # Fix Link components where className line doesn't have closing >
    # Look for className="..." not followed by > on same line or next few lines
    content = re.sub(
        r'(<Link[^>]*className="[^"]*")\s*\n\s*\n\s*([^<>]*)',
        r'\1>\n\2',
        content,
        flags=re.MULTILINE
    )
    
    # Fix button elements with title attribute placement
    # Pattern: <button className="..."> title="..." >
    # Should be: <button className="..." title="..." >
    content = re.sub(
        r'(<button[^>]*className="[^"]*")>\s*title="([^"]*)"(\s*>)',
        r'\1 title="\2"\3',
        content,
        flags=re.MULTILINE
    )
    
    # Fix div elements with style attribute placement
    # Pattern: <div className="..."> style={{...}} />
    # Should be: <div className="..." style={{...}} />
    content = re.sub(
        r'(<div[^>]*className="[^"]*")>\s*style=(\{[^}]*\})\s*/>',
        r'\1 style=\2 />',
        content,
        flags=re.MULTILINE
    )
    
    # Fix Image components with missing imports
    content = re.sub(
        r"(import.*from ['\"]next/link['\"];?\s*\n)",
        r"\1import Image from 'next/image';\n",
        content,
        flags=re.MULTILINE
    )
    
    # Add missing key props for array elements
    content = re.sub(
        r'(\.map\([^)]*\s*=>\s*\n?\s*<[^>]*>)',
        lambda m: m.group(1).replace('<', '<div key={index}><') if 'key=' not in m.group(1) else m.group(1),
        content,
        flags=re.MULTILINE
    )
    
    return content

def process_file(file_path):
    """Process a single file to fix JSX errors"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_jsx_errors(content)
        
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"✓ Fixed JSX errors in {file_path}")
            return True
        else:
            print(f"- No changes needed in {file_path}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix JSX errors in all relevant files"""
    
    # Files with known JSX errors from build output
    error_files = [
        "components/Navbar.js",
        "components/PokedexDisplay.js", 
        "components/PriceHistory.js",
        "components/TrendingCards.js",
        "components/mobile/BottomSheet.js",
        "components/mobile/CardScanner.js",
        "components/mobile/EnhancedTouchInteractions.js",
        "components/mobile/FloatingActionButton.js",
        "components/mobile/GestureCardSorting.js",
        "components/mobile/MobileCardGrid.js",
        "components/mobile/MobileIntegration.js",
        "components/mobile/MobileShare.js",
        "components/mobile/PullToRefresh.js",
        "components/mobile/PushNotifications.js",
        "components/mobile/VoiceSearch.js",
        "components/pwa/AppUpdateNotification.js",
        "components/qol/ContextualHelp.js",
        "components/qol/SmartSearchEnhancer.js",
        "components/qol/UserPreferences.js",
        "components/security/ErrorBoundary.js",
        "components/ui/AdvancedDeckBuilder.js",
        "components/ui/AdvancedKeyboardShortcuts.js",
        "components/ui/AdvancedLoadingStates.js",
        "components/ui/AdvancedModalSystem.js",
        "components/ui/AdvancedSearchInterface.js",
        "components/ui/AdvancedSearchSystem.js",
        "components/ui/AnimationShowcase.js",
        "components/ui/BulkCardOperations.js",
        "components/ui/CardSharingSystem.js",
        "components/ui/CollectionTracker.js",
        "components/ui/DataAnalyticsDashboard.js",
        "components/ui/DeckStackDisplay.js",
        "components/ui/DragDropSystem.js",
        "components/ui/FloatingActionSystem.js",
        "components/ui/GameficationSystem.js",
        "components/ui/MarketInsightsDashboard.js",
        "components/ui/MicroInteractionSystem.js",
        "components/ui/PerformanceDashboard.js",
        "components/ui/PocketDeckBuilder.js",
        "components/ui/PokemonCardItem.js",
        "components/ui/PortfolioManager.js",
        "components/ui/PriceIntelligenceSystem.js",
        "components/ui/PrintableCardLists.js",
        "components/ui/ProgressiveDisclosure.js",
        "components/ui/QATestingSuite.js",
        "components/ui/SkeletonLoadingSystem.js",
        "components/ui/SocialCommunityHub.js",
        "components/ui/SocialPlatform.js",
        "components/ui/TooltipHelpSystem.js",
        "components/ui/TouchGestureSystem.js",
        "components/ui/TournamentSystem.js",
        "components/ui/TradingMarketplace.js",
        "components/ui/VirtualizedCardGrid.js",
        "components/ui/VisualCardSearch.js",
        "components/ui/VoiceSearchInterface.js"
    ]
    
    print("🔧 Starting comprehensive JSX error fixing...")
    
    fixed_count = 0
    total_count = 0
    
    for file_path in error_files:
        if os.path.exists(file_path):
            total_count += 1
            if process_file(file_path):
                fixed_count += 1
        else:
            print(f"⚠ File not found: {file_path}")
    
    print(f"\n📊 Summary:")
    print(f"   Files processed: {total_count}")
    print(f"   Files fixed: {fixed_count}")
    print(f"   Files unchanged: {total_count - fixed_count}")
    
    if fixed_count > 0:
        print(f"\n✅ Fixed JSX errors in {fixed_count} files!")
        print("🚀 Try running 'npm run build' again.")
    else:
        print(f"\n🤔 No JSX errors were automatically fixable with this script.")
        print("   Manual intervention may be required for remaining errors.")

if __name__ == "__main__":
    main()