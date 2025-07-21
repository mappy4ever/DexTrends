#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read all test result files
const dataDir = path.join(__dirname, '../playwright-report/data');
const files = fs.readdirSync(dataDir);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
let flakyTests = 0;

const failedTestDetails = [];
const testsByFile = {};

// Process each test file
files.forEach(file => {
  if (file.endsWith('.jsonl')) {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      try {
        const data = JSON.parse(line);
        
        if (data.test) {
          totalTests++;
          const testFile = data.test.location?.file || 'unknown';
          const testTitle = data.test.title || 'unknown test';
          
          if (!testsByFile[testFile]) {
            testsByFile[testFile] = { passed: 0, failed: 0, skipped: 0, flaky: 0, tests: [] };
          }
          
          if (data.test.status === 'passed') {
            passedTests++;
            testsByFile[testFile].passed++;
          } else if (data.test.status === 'failed') {
            failedTests++;
            testsByFile[testFile].failed++;
            testsByFile[testFile].tests.push({
              title: testTitle,
              error: data.test.error?.message || 'Unknown error'
            });
            failedTestDetails.push({
              file: testFile,
              title: testTitle,
              error: data.test.error?.message || 'Unknown error'
            });
          } else if (data.test.status === 'skipped') {
            skippedTests++;
            testsByFile[testFile].skipped++;
          } else if (data.test.status === 'flaky') {
            flakyTests++;
            testsByFile[testFile].flaky++;
          }
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    });
  }
});

// Generate summary
console.log('=== PLAYWRIGHT TEST SUMMARY ===\n');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
console.log(`Skipped: ${skippedTests}`);
console.log(`Flaky: ${flakyTests}\n`);

// Show results by file
console.log('=== RESULTS BY FILE ===\n');
Object.entries(testsByFile)
  .sort((a, b) => b[1].failed - a[1].failed)
  .forEach(([file, stats]) => {
    const fileName = file.split('/').pop();
    console.log(`${fileName}:`);
    console.log(`  ✓ Passed: ${stats.passed}`);
    if (stats.failed > 0) {
      console.log(`  ✗ Failed: ${stats.failed}`);
      stats.tests.forEach(test => {
        console.log(`    - ${test.title}`);
        console.log(`      Error: ${test.error.substring(0, 100)}...`);
      });
    }
    if (stats.skipped > 0) console.log(`  ⊘ Skipped: ${stats.skipped}`);
    if (stats.flaky > 0) console.log(`  ⚡ Flaky: ${stats.flaky}`);
    console.log('');
  });

// Show top failed tests
if (failedTests > 0) {
  console.log('=== TOP FAILED TESTS ===\n');
  failedTestDetails.slice(0, 10).forEach((test, i) => {
    console.log(`${i + 1}. ${test.file.split('/').pop()} - ${test.title}`);
    console.log(`   Error: ${test.error.substring(0, 150)}...`);
    console.log('');
  });
}

// Save to file
const output = {
  summary: {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    skipped: skippedTests,
    flaky: flakyTests
  },
  failedTests: failedTestDetails,
  testsByFile
};

fs.writeFileSync(path.join(__dirname, '../test-summary.json'), JSON.stringify(output, null, 2));
console.log('\nFull results saved to: test-summary.json');