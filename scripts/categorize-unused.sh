#!/bin/bash

# DexTrends Unused Code Categorization Script
# This script analyzes TypeScript/TSX files to categorize unused code warnings

echo "========================================="
echo "DexTrends Unused Code Categorization"
echo "========================================="
echo ""

# Create output directory
OUTPUT_DIR="./unused-analysis"
mkdir -p "$OUTPUT_DIR"

# Initialize output files
> "$OUTPUT_DIR/unused_imports.txt"
> "$OUTPUT_DIR/unused_parameters.txt"
> "$OUTPUT_DIR/unused_functions.txt"
> "$OUTPUT_DIR/unused_state.txt"
> "$OUTPUT_DIR/unused_types.txt"
> "$OUTPUT_DIR/unused_props.txt"
> "$OUTPUT_DIR/unused_variables.txt"
> "$OUTPUT_DIR/summary.txt"

echo "Analyzing codebase for unused code patterns..."
echo ""

# Function to analyze a single file
analyze_file() {
    local file=$1
    local relative_path=${file#./}
    
    # Skip node_modules, .next, and other build directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]] || [[ "$file" == *"dist"* ]]; then
        return
    fi
    
    # Check for unused imports
    grep -n "^import.*from" "$file" 2>/dev/null | while read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        import_line=$(echo "$line" | cut -d: -f2-)
        
        # Extract imported items
        if [[ "$import_line" =~ import[[:space:]]+\{([^}]+)\} ]]; then
            imports="${BASH_REMATCH[1]}"
            IFS=',' read -ra IMPORT_ARRAY <<< "$imports"
            for import in "${IMPORT_ARRAY[@]}"; do
                import=$(echo "$import" | xargs) # trim whitespace
                import=${import% as *} # remove 'as' aliases
                
                # Check if import is used in file (excluding the import line itself)
                if ! grep -q "\b$import\b" <(tail -n +$((line_num + 1)) "$file") 2>/dev/null; then
                    echo "$relative_path:$line_num - Unused import: $import" >> "$OUTPUT_DIR/unused_imports.txt"
                fi
            done
        fi
    done
    
    # Check for unused function parameters
    grep -n "function\|=>\|constructor\|method" "$file" 2>/dev/null | while read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        func_line=$(echo "$line" | cut -d: -f2-)
        
        # Extract parameters (simplified - may need refinement)
        if [[ "$func_line" =~ "(" ]]; then
            params=$(echo "$func_line" | sed -n 's/.*(\([^)]*\)).*/\1/p')
            if [[ -n "$params" ]] && [[ "$params" != "" ]]; then
                IFS=',' read -ra PARAM_ARRAY <<< "$params"
                for param in "${PARAM_ARRAY[@]}"; do
                    param=$(echo "$param" | sed 's/:.*//' | xargs) # remove type annotation and trim
                    param=${param#_} # remove leading underscore if present
                    
                    if [[ "$param" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
                        # Check if parameter is used in function body (simplified check)
                        if ! grep -A 20 -E "function|=>|constructor" "$file" | grep -q "\b$param\b" 2>/dev/null; then
                            echo "$relative_path:$line_num - Unused parameter: $param" >> "$OUTPUT_DIR/unused_parameters.txt"
                        fi
                    fi
                done
            fi
        fi
    done
    
    # Check for unused state variables
    grep -n "useState\|useReducer" "$file" 2>/dev/null | while read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        state_line=$(echo "$line" | cut -d: -f2-)
        
        if [[ "$state_line" =~ const[[:space:]]+\[([^,\]]+) ]]; then
            state_var="${BASH_REMATCH[1]}"
            state_var=$(echo "$state_var" | xargs)
            
            # Check if state variable is used elsewhere in file
            usage_count=$(grep -c "\b$state_var\b" "$file" 2>/dev/null || echo 0)
            if [ "$usage_count" -le 1 ]; then
                echo "$relative_path:$line_num - Unused state: $state_var" >> "$OUTPUT_DIR/unused_state.txt"
            fi
        fi
    done
    
    # Check for unused type definitions
    grep -n "^type\|^interface" "$file" 2>/dev/null | while read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        type_line=$(echo "$line" | cut -d: -f2-)
        
        if [[ "$type_line" =~ (type|interface)[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*) ]]; then
            type_name="${BASH_REMATCH[2]}"
            
            # Check if type is used elsewhere in file
            usage_count=$(grep -c "\b$type_name\b" "$file" 2>/dev/null || echo 0)
            if [ "$usage_count" -le 1 ]; then
                echo "$relative_path:$line_num - Unused type: $type_name" >> "$OUTPUT_DIR/unused_types.txt"
            fi
        fi
    done
    
    # Check for unused props in React components
    if [[ "$file" == *.tsx ]]; then
        grep -n "interface.*Props\|type.*Props" "$file" 2>/dev/null | while read -r line; do
            line_num=$(echo "$line" | cut -d: -f1)
            props_line=$(echo "$line" | cut -d: -f2-)
            
            # Extract prop names from interface/type definition
            awk '/interface.*Props|type.*Props/,/^}/' "$file" 2>/dev/null | grep -E "^\s*[a-zA-Z_]" | while read -r prop_line; do
                if [[ "$prop_line" =~ ^[[:space:]]*([a-zA-Z_][a-zA-Z0-9_]*) ]]; then
                    prop_name="${BASH_REMATCH[1]}"
                    
                    # Check if prop is used in component
                    if ! grep -q "\b$prop_name\b" <(grep -A 100 "const.*=.*({" "$file") 2>/dev/null; then
                        echo "$relative_path - Unused prop: $prop_name" >> "$OUTPUT_DIR/unused_props.txt"
                    fi
                fi
            done
        done
    fi
    
    # Check for unused variables
    grep -n "^const\|^let\|^var" "$file" 2>/dev/null | while read -r line; do
        line_num=$(echo "$line" | cut -d: -f1)
        var_line=$(echo "$line" | cut -d: -f2-)
        
        if [[ "$var_line" =~ (const|let|var)[[:space:]]+([a-zA-Z_][a-zA-Z0-9_]*) ]]; then
            var_name="${BASH_REMATCH[2]}"
            
            # Check if variable is used elsewhere in file
            usage_count=$(grep -c "\b$var_name\b" "$file" 2>/dev/null || echo 0)
            if [ "$usage_count" -le 1 ]; then
                echo "$relative_path:$line_num - Unused variable: $var_name" >> "$OUTPUT_DIR/unused_variables.txt"
            fi
        fi
    done
}

# Find all TypeScript and TSX files
echo "Finding all TypeScript/TSX files..."
files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./dist/*" 2>/dev/null)
total_files=$(echo "$files" | wc -l | xargs)

echo "Found $total_files files to analyze"
echo ""

# Process files with progress indicator
current=0
for file in $files; do
    current=$((current + 1))
    printf "\rProcessing file %d/%d: %s" "$current" "$total_files" "$(basename "$file")"
    analyze_file "$file"
done

echo ""
echo ""
echo "Generating summary..."

# Generate summary
{
    echo "Unused Code Analysis Summary"
    echo "============================"
    echo ""
    echo "Analysis Date: $(date)"
    echo "Total Files Analyzed: $total_files"
    echo ""
    echo "Categories:"
    echo "-----------"
    
    for category_file in "$OUTPUT_DIR"/*.txt; do
        if [ -f "$category_file" ] && [ "$category_file" != "$OUTPUT_DIR/summary.txt" ]; then
            category=$(basename "$category_file" .txt)
            count=$(wc -l < "$category_file" | xargs)
            echo "$category: $count items"
        fi
    done
    
    echo ""
    echo "Total Unused Items: $(cat "$OUTPUT_DIR"/*.txt 2>/dev/null | grep -v "^$" | grep -v "summary.txt" | wc -l | xargs)"
    echo ""
    echo "Next Steps:"
    echo "1. Review each category file in $OUTPUT_DIR/"
    echo "2. Identify patterns and false positives"
    echo "3. Create action plan for each category"
    echo "4. Begin safe cleanup with lowest-risk items"
} > "$OUTPUT_DIR/summary.txt"

# Display summary
cat "$OUTPUT_DIR/summary.txt"

echo ""
echo "Analysis complete! Results saved to $OUTPUT_DIR/"
echo ""
echo "Review files:"
echo "  - $OUTPUT_DIR/unused_imports.txt"
echo "  - $OUTPUT_DIR/unused_parameters.txt"
echo "  - $OUTPUT_DIR/unused_functions.txt"
echo "  - $OUTPUT_DIR/unused_state.txt"
echo "  - $OUTPUT_DIR/unused_types.txt"
echo "  - $OUTPUT_DIR/unused_props.txt"
echo "  - $OUTPUT_DIR/unused_variables.txt"
echo "  - $OUTPUT_DIR/summary.txt"