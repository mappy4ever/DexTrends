#!/usr/bin/env node

/**
 * Cross-platform test runner that detects dev server port
 */

const { spawn } = require('child_process');
const { findDevServerPort } = require('./detect-dev-port');

async function runTests() {
  const args = process.argv.slice(2);
  
  // Detect port
  console.log('🔍 Detecting dev server port...');
  const port = await findDevServerPort();
  
  if (!port) {
    console.error('❌ No dev server found on common ports');
    console.log('💡 Please start the dev server with: npm run dev');
    process.exit(1);
  }
  
  console.log(`✅ Dev server found on port: ${port}`);
  
  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: port.toString(),
    BASE_URL: `http://localhost:${port}`,
    // Disable Next.js error overlay during tests
    NEXT_PUBLIC_HIDE_ERRORS: 'true',
    __NEXT_DISABLE_ERROR_OVERLAY: 'true'
  };
  
  // Run playwright test
  const playwright = spawn('npx', ['playwright', 'test', ...args], {
    env,
    stdio: 'inherit',
    shell: true
  });
  
  playwright.on('close', (code) => {
    process.exit(code);
  });
}

runTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});