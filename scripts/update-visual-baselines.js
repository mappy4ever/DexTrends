#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎨 Updating Visual Regression Baselines...\n');

// Parse command line arguments
const args = process.argv.slice(2);
const updateAll = args.includes('--all');
const specificTest = args.find(arg => !arg.startsWith('--'));

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, '..', 'tests', '__screenshots__');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

try {
  let command = 'npx playwright test';
  
  if (specificTest) {
    command += ` ${specificTest}`;
  } else if (!updateAll) {
    command += ' tests/visual/';
  }
  
  command += ' --update-snapshots';
  
  console.log(`Running: ${command}\n`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Disable parallel execution for consistent screenshots
      PLAYWRIGHT_WORKERS: '1',
      // Ensure we're in headed mode for accurate rendering
      HEADED: '1',
    }
  });
  
  console.log('\n✅ Visual baselines updated successfully!');
  console.log('\nNext steps:');
  console.log('1. Review the updated screenshots in tests/__screenshots__/');
  console.log('2. Commit the changes if they look correct');
  console.log('3. Run tests again without --update-snapshots to verify');
  
} catch (error) {
  console.error('\n❌ Failed to update visual baselines');
  console.error(error.message);
  process.exit(1);
}

// Show summary of updated files
const updatedFiles = execSync('git status --porcelain tests/__screenshots__/', { encoding: 'utf8' });
if (updatedFiles) {
  console.log('\n📸 Updated screenshot files:');
  console.log(updatedFiles);
} else {
  console.log('\n📸 No screenshot files were updated.');
}