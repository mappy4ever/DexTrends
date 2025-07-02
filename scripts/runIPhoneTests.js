#!/usr/bin/env node

/**
 * Wrapper script to compile and run the TypeScript iPhone tests
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if tsx is available, otherwise use ts-node
const runnerCommand = fs.existsSync(path.join(__dirname, '../node_modules/.bin/tsx')) ? 'tsx' : 'ts-node';

// Get command line arguments
const args = process.argv.slice(2);

// Run the TypeScript file directly with tsx or ts-node
const child = spawn(
  runnerCommand,
  [path.join(__dirname, 'runIPhoneTests.ts'), ...args],
  {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  }
);

child.on('error', (error) => {
  console.error(`Error running iPhone tests: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});