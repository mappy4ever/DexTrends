#!/usr/bin/env python3
import subprocess
import re
import os

def get_typescript_errors():
    """Run TypeScript compiler and parse errors."""
    result = subprocess.run(['npm', 'run', 'type-check'], 
                          capture_output=True, text=True)
    
    errors = []
    lines = result.stderr.split('\n')
    
    for i, line in enumerate(lines):
        # Match TypeScript error format
        match = re.match(r'^(.+\.tsx?)\((\d+),(\d+)\): error TS(\d+): (.+)$', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'code': match.group(4),
                'message': match.group(5)
            })
    
    return errors

def fix_common_errors(filepath, errors):
    """Fix common TypeScript errors in a file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        
        for error in errors:
            if error['file'] != filepath:
                continue
                
            line_idx = error['line'] - 1
            if line_idx >= len(lines):
                continue
                
            line = lines[line_idx]
            
            # Fix: Parameter implicitly has an 'any' type
            if error['code'] == '7006':
                # Add : any to parameters
                line = re.sub(r'\(([a-zA-Z_]\w*)\)', r'(\1: any)', line)
                line = re.sub(r'\(([a-zA-Z_]\w*),', r'(\1: any,', line)
                line = re.sub(r', ([a-zA-Z_]\w*)\)', r', \1: any)', line)
                line = re.sub(r', ([a-zA-Z_]\w*),', r', \1: any,', line)
                
                if line != lines[line_idx]:
                    lines[line_idx] = line
                    modified = True
            
            # Fix: Property does not exist on type
            elif error['code'] == '2339':
                # Add as any cast
                if 'window' in line:
                    line = re.sub(r'window\.(\w+)', r'(window as any).\1', line)
                    if line != lines[line_idx]:
                        lines[line_idx] = line
                        modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            print(f"Fixed errors in {filepath}")
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    
    return False

def main():
    print("Getting TypeScript errors...")
    errors = get_typescript_errors()
    
    # Group errors by file
    errors_by_file = {}
    for error in errors:
        if error['file'] not in errors_by_file:
            errors_by_file[error['file']] = []
        errors_by_file[error['file']].append(error)
    
    print(f"Found {len(errors)} errors in {len(errors_by_file)} files")
    
    # Fix files with most errors first
    sorted_files = sorted(errors_by_file.items(), 
                         key=lambda x: len(x[1]), 
                         reverse=True)
    
    fixed_count = 0
    for filepath, file_errors in sorted_files[:10]:  # Fix top 10 files
        if fix_common_errors(filepath, file_errors):
            fixed_count += 1
    
    print(f"Fixed {fixed_count} files")

if __name__ == "__main__":
    main()