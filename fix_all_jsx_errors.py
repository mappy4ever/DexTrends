#!/usr/bin/env python3
import re
import os
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Tuple, Set

def fix_jsx_syntax(content: str, file_path: str) -> str:
    """Fix JSX syntax errors in TypeScript files"""
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Fix self-closing tags that should be closed
        line = re.sub(r'<(\w+)([^>]*?)/>\s*$', r'<\1\2><\/\1>', line)
        
        # Fix missing closing tags for common elements
        if re.search(r'<(div|span|button|label|section|article|header|footer|nav|aside|main|form|ul|ol|li|h[1-6]|p|a|strong|em|code|pre)(\s[^>]*)?>(?!.*<\/\1>)', line):
            # Check if closing tag is on next lines
            tag_match = re.search(r'<(\w+)(?:\s[^>]*)?>(?!.*<\/\1>)', line)
            if tag_match:
                tag_name = tag_match.group(1)
                found_closing = False
                for j in range(i + 1, min(i + 10, len(lines))):
                    if f'</{tag_name}>' in lines[j]:
                        found_closing = True
                        break
                if not found_closing and not line.strip().endswith('/>'):
                    line = re.sub(f'(<{tag_name}(?:\\s[^>]*)?>.*?)$', f'\\1</{tag_name}>', line)
        
        # Fix unclosed JSX expressions {}
        open_braces = line.count('{')
        close_braces = line.count('}')
        if open_braces > close_braces:
            line = line + '}' * (open_braces - close_braces)
        
        # Fix improperly escaped characters in JSX
        if '>' in line and not re.search(r'[<=>]>', line) and not re.search(r'>\s*$', line):
            line = line.replace('>', '&gt;')
        
        # Fix className with quotes
        line = re.sub(r'className="([^"]*)"', r'className={\1}', line)
        line = re.sub(r"className='([^']*)'", r'className={\1}', line)
        
        # Fix style attributes
        line = re.sub(r'style="([^"]*)"', lambda m: f'style={{{m.group(1)}}}', line)
        line = re.sub(r"style='([^']*)'", lambda m: f'style={{{m.group(1)}}}', line)
        
        # Fix onClick and other event handlers
        line = re.sub(r'(on\w+)="([^"]*)"', r'\1={\2}', line)
        line = re.sub(r"(on\w+)='([^']*)'", r'\1={\2}', line)
        
        # Fix boolean attributes
        line = re.sub(r'\s(disabled|checked|selected|readonly|required|multiple|autoFocus|autoPlay|controls|loop|muted|open|hidden)="true"', r' \1', line)
        line = re.sub(r"\s(disabled|checked|selected|readonly|required|multiple|autoFocus|autoPlay|controls|loop|muted|open|hidden)='true'", r' \1', line)
        line = re.sub(r'\s(disabled|checked|selected|readonly|required|multiple|autoFocus|autoPlay|controls|loop|muted|open|hidden)=\{true\}', r' \1', line)
        
        fixed_lines.append(line)
        i += 1
    
    content = '\n'.join(fixed_lines)
    
    # Multi-line fixes
    # Fix JSX fragments
    content = re.sub(r'<>\s*</>', '<></>', content, flags=re.MULTILINE)
    
    # Fix multi-line JSX elements
    content = re.sub(
        r'(<(\w+)(?:\s[^>]*)?>)\s*\n\s*([^<].*?)\s*\n\s*(?!</\2>)',
        r'\1\3<\/\2>',
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix Modal components
    content = re.sub(
        r'(<Modal\s[^>]*>)(.*?)(?=\n\s*</|\n\s*\)|\n\s*})',
        lambda m: m.group(1) + m.group(2) + ('' if '</Modal>' in m.group(2) else '</Modal>'),
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    # Fix nested JSX structure
    stack = []
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Track opening tags
        opening_tags = re.findall(r'<(\w+)(?:\s[^>]*)?>(?!.*<\/\1>)', line)
        for tag in opening_tags:
            if not line.strip().endswith('/>'):
                stack.append(tag)
        
        # Track closing tags
        closing_tags = re.findall(r'<\/(\w+)>', line)
        for tag in closing_tags:
            if stack and stack[-1] == tag:
                stack.pop()
        
        fixed_lines.append(line)
    
    # Add missing closing tags at the end
    while stack:
        tag = stack.pop()
        fixed_lines.append(f'</{tag}>')
    
    return '\n'.join(fixed_lines)

def fix_file(file_path: str) -> Tuple[str, bool, str]:
    """Fix a single file and return (path, success, message)"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        content = fix_jsx_syntax(content, file_path)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return (file_path, True, "Fixed")
        else:
            return (file_path, True, "No changes needed")
    except Exception as e:
        return (file_path, False, str(e))

def main():
    # List of files with JSX errors from the error output
    files_to_fix = [
        'components/AdvancedSearchModal.tsx',
        'components/CardList.tsx',
        'components/CollectionManager.tsx',
        'components/dynamic/DynamicComponents.tsx',
        'components/examples/TypeScriptExample.tsx',
        'components/Footer.tsx',
        'components/GlobalModal.tsx',
        'components/GlobalSearchModal.tsx',
        'components/icons/customsitelogo.tsx',
        'components/layout/errorboundary.tsx',
        'components/layout/layout.tsx',
        'components/layout/SidebarLayout.tsx',
        'components/layout/themeprovider.tsx',
        'components/MarketAnalytics.tsx',
        'components/mobile/BottomSheet.tsx',
        'components/mobile/CardScanner.tsx',
        'components/mobile/EnhancedSwipeGestures.tsx',
        'components/mobile/EnhancedTouchInteractions.tsx',
        'components/mobile/FloatingActionButton.tsx',
        'components/mobile/GestureCardSorting.tsx',
        'components/mobile/MobileCardGrid.tsx',
        'components/mobile/MobileIntegration.tsx',
        'components/mobile/MobileNavigation.tsx',
        'components/mobile/MobileShare.tsx',
        'components/mobile/PullToRefresh.tsx',
        'components/mobile/PushNotifications.tsx',
        'components/mobile/TouchGestures.tsx',
        'components/mobile/VoiceSearch.tsx',
        'components/Navbar.tsx',
        'components/PocketCardList.tsx',
        'components/PocketDeckViewer.tsx',
        'components/PocketExpansionViewer.tsx',
        'components/PocketModeLanding.tsx',
        'components/PocketRulesGuide.tsx',
        'components/PokedexDisplay.tsx',
        'components/pokemon/PokemonAbilitiesTab.tsx',
        'components/pokemon/PokemonEvolutionTab.tsx',
        'components/pokemon/PokemonMovesTab.tsx',
        'components/pokemon/PokemonOverviewTab.tsx',
        'components/pokemon/PokemonStatsTab.tsx',
        'components/PokemonTCGLanding.tsx',
        'components/PriceAlerts.tsx',
        'components/PriceHistory.tsx',
        'components/pwa/AppUpdateNotification.tsx',
        'components/pwa/InstallPrompt.tsx',
        'components/pwa/OfflineIndicator.tsx',
        'components/qol/ContextualHelp.tsx',
        'components/qol/KeyboardShortcuts.tsx',
        'components/qol/NotificationSystem.tsx',
        'components/qol/SkeletonLoaders.tsx',
        'components/qol/SmartSearchEnhancer.tsx',
        'components/qol/UserPreferences.tsx',
        'components/security/ErrorBoundary.tsx',
        'components/TrendingCards.tsx',
        'components/ui/AccessibilityProvider.tsx',
        'components/ui/AchievementSystem.tsx',
        'components/ui/AdvancedDeckBuilder.tsx',
        'components/ui/AdvancedKeyboardShortcuts.tsx',
        'components/ui/AdvancedLoadingStates.tsx',
        'components/ui/AdvancedModalSystem.tsx',
        'components/ui/AdvancedSearchInterface.tsx',
        'components/ui/AdvancedSearchSystem.tsx',
        'components/ui/animations.tsx',
        'components/ui/AnimationShowcase.tsx',
        'components/ui/AnimationSystem.tsx',
        'components/ui/BackToTop.tsx',
        'components/ui/BreadcrumbNavigation.tsx',
        'components/ui/BulkCardOperations.tsx',
        'components/ui/CardComparisonTool.tsx',
        'components/ui/CardSharingSystem.tsx',
        'components/ui/CategoryIcon.tsx',
        'components/ui/chartcontainer.tsx',
        'components/ui/CollectionDashboard.tsx',
        'components/ui/CollectionTracker.tsx',
        'components/ui/ComparisonFAB.tsx',
        'components/ui/DataAnalyticsDashboard.tsx',
        'components/ui/DeckStackDisplay.tsx',
        'components/ui/DragDropSystem.tsx',
        'components/ui/EnhancedAnimationSystem.tsx',
        'components/ui/EnhancedCardInteractions.tsx',
        'components/ui/EnhancedCardModal.tsx',
        'components/ui/EnhancedEvolutionDisplay.tsx',
        'components/ui/EnhancedModal.tsx',
        'components/ui/EnhancedMovesDisplay.tsx',
        'components/ui/EnhancedNavigation.tsx',
        'components/ui/EnhancedSearchBox.tsx',
        'components/ui/ErrorMessage.tsx',
        'components/ui/EvolutionStageCard.tsx',
        'components/ui/EvolutionTreeRenderer.tsx',
        'components/ui/FloatingActionSystem.tsx',
        'components/ui/GameficationSystem.tsx',
        'components/ui/IntelligentRecommendations.tsx',
        'components/ui/iPhoneQATests.tsx',
        'components/ui/KpiCard.tsx',
        'components/ui/LevelTag.tsx',
        'components/ui/ListContainer.tsx',
        'components/ui/LoadingSpinner.tsx',
        'components/ui/LoadingStates.tsx',
        'components/ui/MarketInsightsDashboard.tsx',
        'components/ui/MicroInteractionSystem.tsx',
        'components/ui/MobileCard.tsx',
        'components/ui/MobileDesignSystem.tsx',
        'components/ui/Modal.tsx',
        'components/ui/MoveCardDemo.tsx',
        'components/ui/NavigationEnhancements.tsx',
        'components/ui/OptimizedImage.tsx',
        'components/ui/OptimizedImageMobile.tsx',
        'components/ui/PackOpening.tsx',
        'components/ui/PerformanceDashboard.tsx',
        'components/ui/PerformanceMonitor.tsx',
        'components/ui/PocketDeckBuilder.tsx',
        'components/ui/PokeballLoader.tsx',
        'components/ui/PokeballSVG.tsx',
        'components/ui/PokemonCardAnimations.tsx',
        'components/ui/PokemonCardItem.tsx',
        'components/ui/PokemonCardSkeleton.tsx',
        'components/ui/PokemonEasterEggs.tsx',
        'components/ui/PokemonEmptyState.tsx',
        'components/ui/PokemonFormSelector.tsx',
        'components/ui/PokemonLoadingScreen.tsx',
        'components/ui/PokemonSoundEffects.tsx',
        'components/ui/PortfolioManager.tsx',
        'components/ui/PremiumComponents.tsx',
        'components/ui/PriceHistoryChart.tsx',
        'components/ui/PriceIndicator.tsx',
        'components/ui/PriceIntelligenceSystem.tsx',
        'components/ui/PrintableCardLists.tsx',
        'components/ui/ProgressiveDisclosure.tsx',
        'components/ui/QATestingSuite.tsx',
        'components/ui/QATestingTool.tsx',
        'components/ui/SimpleBackToTop.tsx',
        'components/ui/SimpleEvolutionDisplay.tsx',
        'components/ui/SimpleNavigation.tsx',
        'components/ui/SkeletonLoader.tsx',
        'components/ui/SkeletonLoadingSystem.tsx',
        'components/ui/SmartRecommendationEngine.tsx',
        'components/ui/SocialCommunityHub.tsx',
        'components/ui/SocialPlatform.tsx',
        'components/ui/StickySidebar.tsx',
        'components/ui/StyledBackButton.tsx',
        'components/ui/Tooltip.tsx',
        'components/ui/TooltipHelpSystem.tsx',
        'components/ui/TouchGestureSystem.tsx',
        'components/ui/TournamentSystem.tsx',
        'components/ui/TradingMarketplace.tsx',
        'components/ui/TypeBadge.tsx',
        'components/ui/TypeFilter.tsx',
        'components/ui/UnifiedCard.tsx',
        'components/ui/UnifiedLoadingScreen.tsx',
        'components/ui/UnifiedLoadingSystem.tsx',
        'components/ui/UnifiedModalSystem.tsx',
        'components/ui/UserExperienceEnhancer.tsx',
        'components/ui/VirtualizedCardGrid.tsx',
        'components/ui/VisualCardSearch.tsx',
        'components/ui/VisualSearchFilters.tsx',
        'components/ui/VoiceSearchInterface.tsx',
        'examples/PerformanceIntegrationExample.tsx',
        'pages/_app.minimal-safe.tsx',
        'pages/_app.tsx',
        'pages/_document.tsx',
        'pages/_error.tsx',
        'pages/404.tsx',
        'pages/cards/[cardId].tsx',
        'pages/cards/rarity/[rarity].tsx',
        'pages/collections.tsx',
        'pages/favorites.tsx',
        'pages/fun.tsx',
        'pages/index.minimal-safe.tsx',
        'pages/index.tsx',
        'pages/pocketmode.tsx',
        'pages/pocketmode/[pokemonid].tsx',
        'pages/pocketmode/deckbuilder.tsx',
        'pages/pocketmode/decks.tsx',
        'pages/pocketmode/expansions.tsx',
        'pages/pocketmode/packs.tsx',
        'pages/pocketmode/set/[setId].tsx',
        'pages/pokedex.tsx',
        'pages/pokedex/[pokeid].tsx',
        'pages/tcgsets.tsx',
        'pages/tcgsets/[setid].tsx',
        'pages/trending.tsx',
        'tests/ui/accessibility/focus-management.test.tsx',
        'tests/ui/accessibility/keyboard-navigation.test.tsx',
        'tests/ui/accessibility/screen-reader.test.tsx',
        'tests/ui/interactions/modal-interactions.test.tsx',
        'tests/unit/components/LoadingSpinner.test.tsx',
        'tests/unit/components/Modal.test.tsx',
        'tests/unit/components/PokemonCardItem.test.tsx',
        'tests/unit/components/QATestingSuite.test.tsx',
        'tests/unit/components/testing-patterns.test.tsx'
    ]
    
    print(f"Fixing JSX syntax errors in {len(files_to_fix)} files...")
    
    # Process files in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fix_file, f): f for f in files_to_fix if os.path.exists(f)}
        
        completed = 0
        failed = []
        
        for future in as_completed(futures):
            file_path, success, message = future.result()
            completed += 1
            
            if not success:
                failed.append((file_path, message))
                print(f"✗ {file_path}: {message}")
            else:
                print(f"✓ {file_path}: {message} ({completed}/{len(futures)})")
    
    print(f"\nCompleted processing {completed} files")
    if failed:
        print(f"{len(failed)} files failed:")
        for f, err in failed:
            print(f"  - {f}: {err}")
    
    return 0 if not failed else 1

if __name__ == "__main__":
    sys.exit(main())