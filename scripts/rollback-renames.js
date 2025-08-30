#!/usr/bin/env node
// Rollback script for rename operations
const changes = [];
const fs = require('fs');

console.log('Rolling back renames...');
changes.reverse().forEach(change => {
  try {
    fs.renameSync(change.new, change.old);
    console.log(`Rolled back: ${change.new} → ${change.old}`);
  } catch (error) {
    console.error(`Failed to rollback ${change.new}: ${error.message}`);
  }
});
console.log('Rollback complete');
