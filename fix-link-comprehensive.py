#!/usr/bin/env python3
import os
import re

def fix_link_components(content):
    """Fix all Link component syntax issues"""
    
    # Pattern 1: Fix Link with > after href and before other props
    # Matches: href={...}>\n className=
    pattern1 = r'(<Link\s+[^>]*href=[^>]+)>\s*\n\s*(className=[^>]+)>'
    content = re.sub(pattern1, r'\1\n                            \2>', content, flags=re.MULTILINE)
    
    # Pattern 2: Fix Link with key after opening tag
    # Matches: <Link\n key={...} should be <Link key={...}
    pattern2 = r'<Link\s*\n\s*key='
    content = re.sub(pattern2, r'<Link key=', content)
    
    # Pattern 3: Fix Link with props on wrong lines
    # This handles cases where props are split incorrectly
    pattern3 = r'(<Link[^>]*?)>\s*\n\s*([a-zA-Z]+=[^>]+)>'
    
    def fix_props(match):
        link_start = match.group(1)
        prop = match.group(2)
        # Remove any trailing > from link_start
        link_start = link_start.rstrip('>')
        return f'{link_start}\n                            {prop}>'
    
    content = re.sub(pattern3, fix_props, content, flags=re.MULTILINE)
    
    # Pattern 4: Fix multiple >> at end of Link opening tag
    content = re.sub(r'(<Link[^>]+)>>', r'\1>', content)
    
    # Pattern 5: Ensure Link components have proper structure
    # Fix cases where there's href={...}> without space before className
    pattern5 = r'(href=[^>]+)>(\s*className=)'
    content = re.sub(pattern5, r'\1\2', content)
    
    return content

def process_file(filepath):
    """Process a single file to fix Link syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_link_components(content)
        
        if fixed_content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Fix all JSX files in components and pages directories"""
    fixed_count = 0
    
    # Process all .js and .jsx files
    for root_dir in ['components', 'pages']:
        if os.path.exists(root_dir):
            for root, dirs, files in os.walk(root_dir):
                for file in files:
                    if file.endswith(('.js', '.jsx')):
                        filepath = os.path.join(root, file)
                        if process_file(filepath):
                            fixed_count += 1
    
    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()