#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with framer-motion imports
const findCommand = `find . -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | grep -E '\\.(tsx?|jsx?)$' | grep -v node_modules | grep -v .next`;

const files = execSync(findCommand, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files to check...`);

const replacements = [
  // Basic motion import
  {
    from: "import { motion } from 'framer-motion';",
    to: "import { motion } from '../components/ui/LazyMotion';"
  },
  {
    from: 'import { motion } from "framer-motion";',
    to: 'import { motion } from "../components/ui/LazyMotion";'
  },
  // Motion with other imports
  {
    from: "import { motion, AnimatePresence } from 'framer-motion';",
    to: "import { motion, AnimatePresence } from '../components/ui/LazyMotion';"
  },
  {
    from: 'import { motion, AnimatePresence } from "framer-motion";',
    to: 'import { motion, AnimatePresence } from "../components/ui/LazyMotion";'
  },
  // More complex imports - will need manual handling
];

let processedFiles = 0;
let modifiedFiles = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Skip if already importing from LazyMotion
    if (content.includes('from \'../components/ui/LazyMotion\'') || 
        content.includes('from "../components/ui/LazyMotion"') ||
        content.includes('components/ui/LazyMotion')) {
      processedFiles++;
      continue;
    }
    
    // Check if this file has framer-motion imports
    if (!content.includes('from \'framer-motion\'') && !content.includes('from "framer-motion"')) {
      processedFiles++;
      continue;
    }
    
    // Calculate relative path to LazyMotion
    const relativePath = path.relative(path.dirname(file), 'components/ui/LazyMotion').replace(/\\/g, '/');
    const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    
    // Apply basic replacements
    content = content.replace(/import { motion } from ['"]framer-motion['"];/g, `import { motion } from '${importPath}';`);
    content = content.replace(/import { motion, AnimatePresence } from ['"]framer-motion['"];/g, `import { motion, AnimatePresence } from '${importPath}';`);
    
    if (content !== originalContent) {
      console.log(`Modified: ${file}`);
      // Don't actually write files yet - just log what would be changed
      // fs.writeFileSync(file, content);
      modifiedFiles++;
    }
    
    processedFiles++;
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }
}

console.log(`\nProcessed ${processedFiles} files`);
console.log(`Would modify ${modifiedFiles} files`);
console.log(`\nTo actually apply changes, uncomment the fs.writeFileSync line in the script.`);