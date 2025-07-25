#!/bin/bash

# Detect the port where dev server is running
PORT=$(node scripts/detect-dev-port.js)

if [ $? -ne 0 ]; then
  echo "❌ No dev server found. Starting dev server..."
  # Start dev server in background
  npm run dev &
  DEV_PID=$!
  
  # Wait for server to start
  echo "⏳ Waiting for dev server to start..."
  sleep 5
  
  # Try to detect port again
  PORT=$(node scripts/detect-dev-port.js)
  
  if [ $? -ne 0 ]; then
    echo "❌ Failed to start dev server"
    exit 1
  fi
fi

echo "✅ Dev server found on port: $PORT"

# Export PORT for tests
export PORT=$PORT
export BASE_URL="http://localhost:$PORT"

# Run the tests with all arguments passed to this script
NODE_ENV=test npx playwright test "$@"

# Store exit code
TEST_EXIT_CODE=$?

# If we started the dev server, kill it
if [ ! -z "$DEV_PID" ]; then
  echo "🛑 Stopping dev server..."
  kill $DEV_PID 2>/dev/null
fi

exit $TEST_EXIT_CODE