#!/usr/bin/env python3
import os
import re

def fix_jsx_image_tags(content):
    """Fix JSX Image tags that have incorrect syntax with className ending with >"""
    # Pattern to match Image tags with incorrect closing syntax
    # This matches Image tags where className ends with "> and the tag is self-closed with />
    pattern = r'(<Image\s+[^>]*className="[^"]*")\s*>\s*([^<]*)\s*\/>'
    
    # Replace with correct self-closing syntax
    def replacer(match):
        tag_start = match.group(1)
        middle_content = match.group(2).strip()
        
        # If there's content between > and />, it's likely props that should be part of the tag
        if middle_content and not middle_content.startswith('<'):
            # This content should be attributes
            return f'{tag_start}\n                      {middle_content}\n                    />'
        else:
            return f'{tag_start} />'
    
    fixed_content = re.sub(pattern, replacer, content, flags=re.MULTILINE | re.DOTALL)
    
    # Another pattern for multi-line Image tags with incorrect syntax
    # This matches cases where props are on multiple lines and the tag ends with >
    # followed by /> on another line
    pattern2 = r'(<Image\s+(?:[^>]|\n)*?)>\s*\n\s*\/>'
    fixed_content = re.sub(pattern2, r'\1 />', fixed_content, flags=re.MULTILINE | re.DOTALL)
    
    # Fix the specific case where onError or other handlers are placed after >
    pattern3 = r'(<Image\s+(?:[^>]|\n)*?className="[^"]*")\s*>\s*\n\s*(on[A-Za-z]+=[^/]*?)\s*\/>'
    
    def replacer3(match):
        tag_part = match.group(1)
        handler_part = match.group(2).strip()
        return f'{tag_part}\n                      {handler_part}\n                    />'
    
    fixed_content = re.sub(pattern3, replacer3, fixed_content, flags=re.MULTILINE | re.DOTALL)
    
    return fixed_content

def process_file(filepath):
    """Process a single file to fix JSX syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_jsx_image_tags(content)
        
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
    
    # Process all .js and .jsx files in components and pages
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