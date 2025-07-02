#!/usr/bin/env python3
import re
import os
import sys

def fix_jsx_file(filepath):
    """Fix common JSX syntax errors in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix 1: Self-closing tags
        # Fix img tags
        content = re.sub(r'<img\s+([^>]+?)(?<!/)>\s*(?!</img>)', r'<img \1 />', content)
        
        # Fix input tags  
        content = re.sub(r'<input\s+([^>]+?)(?<!/)>\s*(?!</input>)', r'<input \1 />', content)
        
        # Fix br tags
        content = re.sub(r'<br\s*(?:[^>]+?)?(?<!/)>\s*(?!</br>)', r'<br />', content)
        
        # Fix hr tags
        content = re.sub(r'<hr\s*(?:[^>]+?)?(?<!/)>\s*(?!</hr>)', r'<hr />', content)
        
        # Fix 2: Component self-closing patterns
        # Match patterns like:
        # <ComponentName
        #   prop="value"
        #   prop2={value}
        # >
        # );
        pattern = r'(<[A-Z][a-zA-Z0-9]*(?:\.[a-zA-Z]+)*\s+[^>]+?)>\s*\)\s*;'
        content = re.sub(pattern, r'\1 />);', content, flags=re.MULTILINE)
        
        # Fix 3: Fragment syntax errors
        # Fix patterns like "> when it should be </>
        content = re.sub(r'>\s*\)\s*}\s*(?=\s*</)', r'/>)}', content)
        
        # Fix 4: Common broken patterns from automated tools
        # Fix broken closing tags like ">
        content = re.sub(r'">\s*(?=\n\s*[}\)])', '" />', content)
        
        # Fix patterns like className="...">
        # ))}
        content = re.sub(r'(className="[^"]+")>\s*\n\s*\)\s*\)\s*}', r'\1 />))}', content)
        
        # Fix 5: Clean up duplicate closing braces
        content = re.sub(r'}\s*}\s*}\s*}\s*}', r'}', content)
        
        if content != original_content:
            # Create backup
            backup_path = filepath + '.backup'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)
                
            # Write fixed content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"Fixed: {filepath}")
            return True
        else:
            print(f"No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        # Process all TSX files with errors
        files = [
            "components/ui/PortfolioManager.tsx",
            "components/ui/TradingMarketplace.tsx", 
            "components/ui/TournamentSystem.tsx",
            "components/ui/SocialPlatform.tsx",
            "components/ui/SkeletonLoadingSystem.tsx",
            "components/ui/PocketDeckBuilder.tsx",
            "components/ui/CollectionTracker.tsx",
            "components/ui/AdvancedDeckBuilder.tsx",
            "components/ui/PriceIntelligenceSystem.tsx",
            "components/ui/PrintableCardLists.tsx"
        ]
        
        for filepath in files:
            if os.path.exists(filepath):
                fix_jsx_file(filepath)
    else:
        fix_jsx_file(sys.argv[1])

if __name__ == "__main__":
    main()