#!/bin/bash
# Script to clear all caches for Fast Refresh issues

echo "🧹 Clearing all caches for Fast Refresh..."

echo "1. Removing Next.js build cache..."
rm -rf .next

echo "2. Removing TypeScript cache..."
rm -rf tsconfig.tsbuildinfo
rm -rf .tsbuildinfo

echo "3. Removing node_modules cache..."
rm -rf node_modules/.cache

echo "4. Removing Fast Refresh files..."
rm -rf .fast-refresh-backup/
rm -f fast-refresh-*.json
rm -f fast-refresh-*.md
rm -f .eslintrc.fastrefresh.js

echo "5. Clearing npm cache..."
npm cache clean --force

echo "✅ Cache cleared!"
echo ""
echo "📝 For a complete refresh, also run:"
echo "   rm -rf node_modules package-lock.json && npm install"
echo ""
echo "🌐 Don't forget to clear your browser cache!"
echo "   Chrome/Edge: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo ""
echo "🚀 To start fresh: npm run dev"