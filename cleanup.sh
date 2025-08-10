#!/bin/bash

# DexTrends Process Cleanup Script
# Run this to clean up stuck processes and caches

echo "Starting cleanup..."

# Kill stuck jest-worker processes
echo "Killing jest-worker processes..."
pkill -9 -f "jest-worker/processChild.js" 2>/dev/null

# Kill any hanging Next.js dev servers
echo "Killing Next.js dev servers..."
pkill -f "next dev" 2>/dev/null

# Kill any other Node processes related to this project
echo "Killing project-related Node processes..."
pkill -f "node.*DexTrends" 2>/dev/null

# Clear Next.js and Node caches
echo "Clearing caches..."
rm -rf .next 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Count remaining processes for verification
REMAINING=$(ps aux | grep -E "jest-worker|next dev" | grep -v grep | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ Cleanup complete! No stuck processes found."
else
    echo "⚠️  Warning: $REMAINING processes may still be running."
    echo "Run 'ps aux | grep -E \"jest-worker|next dev\"' to check."
fi

echo "Cleanup finished!"