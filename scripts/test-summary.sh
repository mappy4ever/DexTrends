#!/bin/bash

echo "=== Test Summary Report ==="
echo "Generated: $(date)"
echo ""

# Count results
TOTAL=$(find test-results -name "*.png" | wc -l)
echo "Total Failed Tests: $TOTAL"
echo ""

# Show failed test names
if [ $TOTAL -gt 0 ]; then
  echo "Failed Tests:"
  find test-results -type d -name "*spec*" | sed 's/test-results\//- /'
  echo ""
fi

# Extract console errors
echo "=== Console Errors ==="
find test-results -name "*.txt" -exec grep -l "ERROR" {} \; | while read file; do
  echo "From: $file"
  grep "ERROR" "$file" | head -5
  echo ""
done

# Check if report exists
if [ -f "playwright-report/index.html" ]; then
  echo "Full report available: npx playwright show-report"
fi