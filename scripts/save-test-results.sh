#!/bin/bash

echo "Saving test results for Claude analysis..."

# Create a summary file
echo "=== PLAYWRIGHT TEST RESULTS SUMMARY ===" > test-results-summary.txt
echo "Generated: $(date)" >> test-results-summary.txt
echo "" >> test-results-summary.txt

# Copy the HTML report
echo "Test report available at: http://localhost:9323" >> test-results-summary.txt
echo "HTML report saved to: playwright-report/index.html" >> test-results-summary.txt
echo "" >> test-results-summary.txt

# Count test artifacts (indicates test runs)
TOTAL_ARTIFACTS=$(find test-results -name ".playwright-artifacts-*" -type d | wc -l | tr -d ' ')
echo "Test workers used: $TOTAL_ARTIFACTS" >> test-results-summary.txt

# Check for any failed test traces
TRACE_DIRS=$(find test-results -name "traces" -type d | wc -l | tr -d ' ')
echo "Test traces generated: $TRACE_DIRS" >> test-results-summary.txt
echo "" >> test-results-summary.txt

# Look for any error patterns in the HTML
echo "=== ANALYZING HTML REPORT ===" >> test-results-summary.txt
if grep -q "failed" playwright-report/index.html; then
    echo "Found 'failed' text in report - indicates some test failures" >> test-results-summary.txt
else
    echo "No 'failed' text found in report" >> test-results-summary.txt
fi

if grep -q "passed" playwright-report/index.html; then
    echo "Found 'passed' text in report - indicates successful tests" >> test-results-summary.txt
else
    echo "No 'passed' text found in report" >> test-results-summary.txt
fi

echo "" >> test-results-summary.txt
echo "=== INSTRUCTIONS FOR SHARING WITH CLAUDE ===" >> test-results-summary.txt
echo "1. Take a screenshot of the test report at http://localhost:9323" >> test-results-summary.txt
echo "2. Share the screenshot with Claude for analysis" >> test-results-summary.txt
echo "3. Or copy key sections of test results and paste them" >> test-results-summary.txt
echo "" >> test-results-summary.txt

# List test spec files that were created
echo "=== TEST FILES CREATED ===" >> test-results-summary.txt
find tests/e2e -name "*.spec.ts" | sort >> test-results-summary.txt

echo "" >> test-results-summary.txt
echo "Summary saved to: test-results-summary.txt"
echo "Please share this file or take a screenshot of the test report for Claude to analyze."