#!/usr/bin/env python3
import re
import sys

def analyze_jsx_balance(content):
    """Analyze JSX tag balance and find mismatches."""
    # Track opening and closing tags
    tag_stack = []
    lines = content.split('\n')
    
    # Regex patterns for JSX
    open_tag_pattern = r'<([A-Za-z][A-Za-z0-9\.]*)\s*[^>]*(?<!/)>'
    close_tag_pattern = r'</([A-Za-z][A-Za-z0-9\.]*)\s*>'
    self_closing_pattern = r'<([A-Za-z][A-Za-z0-9\.]*)\s*[^>]*/>'
    fragment_open = r'<>'
    fragment_close = r'</>'
    
    issues = []
    
    for line_num, line in enumerate(lines, 1):
        # Skip comments
        if '//' in line or '/*' in line or '*/' in line:
            continue
            
        # Find self-closing tags (these are balanced)
        line_without_self_closing = re.sub(self_closing_pattern, '', line)
        
        # Find fragment opens
        fragment_opens = re.findall(fragment_open, line_without_self_closing)
        for _ in fragment_opens:
            tag_stack.append(('Fragment', line_num))
            
        # Find fragment closes
        fragment_closes = re.findall(fragment_close, line_without_self_closing)
        for _ in fragment_closes:
            if tag_stack and tag_stack[-1][0] == 'Fragment':
                tag_stack.pop()
            else:
                issues.append(f"Line {line_num}: Unexpected closing fragment </>")
        
        # Find opening tags
        open_tags = re.findall(open_tag_pattern, line_without_self_closing)
        for tag in open_tags:
            tag_stack.append((tag, line_num))
            
        # Find closing tags
        close_tags = re.findall(close_tag_pattern, line_without_self_closing)
        for tag in close_tags:
            if tag_stack and tag_stack[-1][0] == tag:
                tag_stack.pop()
            else:
                # Find if there's a matching open tag somewhere in the stack
                found = False
                for i in range(len(tag_stack) - 1, -1, -1):
                    if tag_stack[i][0] == tag:
                        issues.append(f"Line {line_num}: Closing </{tag}> doesn't match expected </{tag_stack[-1][0]}> from line {tag_stack[-1][1]}")
                        found = True
                        break
                if not found:
                    issues.append(f"Line {line_num}: Unexpected closing tag </{tag}>")
    
    # Report unclosed tags
    for tag, line_num in tag_stack:
        issues.append(f"Line {line_num}: Unclosed tag <{tag}>")
    
    return issues

def fix_common_jsx_issues(content):
    """Fix common JSX syntax issues."""
    lines = content.split('\n')
    fixed_lines = []
    
    for line in lines:
        # Fix unclosed img tags
        line = re.sub(r'<img\s+([^>]+)(?<!/)>', r'<img \1 />', line)
        
        # Fix unclosed input tags
        line = re.sub(r'<input\s+([^>]+)(?<!/)>', r'<input \1 />', line)
        
        # Fix unclosed br tags
        line = re.sub(r'<br(?:\s+[^>]*)?>(?!</br>)', r'<br />', line)
        
        # Fix unclosed hr tags
        line = re.sub(r'<hr(?:\s+[^>]*)?>(?!</hr>)', r'<hr />', line)
        
        # Fix component tags that should be self-closing (common patterns)
        # Look for tags that end with > and are followed by ); or }
        if re.search(r'^\s*<[A-Z][a-zA-Z0-9]*\s+[^>]+>\s*\)\s*;?\s*$', line):
            line = re.sub(r'>\s*\)\s*;?\s*$', r' />);', line)
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_jsx_systematic.py <file>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # First analyze issues
        issues = analyze_jsx_balance(content)
        if issues:
            print(f"\nFound {len(issues)} JSX balance issues in {filepath}:")
            for issue in issues[:10]:  # Show first 10 issues
                print(f"  {issue}")
            if len(issues) > 10:
                print(f"  ... and {len(issues) - 10} more issues")
        
        # Apply fixes
        fixed_content = fix_common_jsx_issues(content)
        
        # Re-analyze after fixes
        remaining_issues = analyze_jsx_balance(fixed_content)
        
        if len(remaining_issues) < len(issues):
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"\nFixed some issues. Remaining: {len(remaining_issues)}")
        else:
            print(f"\nAutomatic fixes didn't help. Manual intervention needed.")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")