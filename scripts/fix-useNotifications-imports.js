const fs = require('fs');
const path = require('path');

const fixes = [
  // QOL components (same directory level)
  {
    path: 'components/qol/ContextualHelp.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/qol/KeyboardShortcuts.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/qol/SmartSearchEnhancer.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/qol/UserPreferences.hooks.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/qol/UserPreferences.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  // UI components (one directory up)
  {
    path: 'components/ui/AdvancedKeyboardShortcuts.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/ui/BulkCardOperations.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/ui/CardSharingSystem.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/ui/CollectionTracker.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/ui/PortfolioManager.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  },
  {
    path: 'components/ui/PrintableCardLists.tsx',
    oldImport: /import\s*{\s*useNotifications\s*}\s*from\s*['"]\.\.\/qol\/NotificationSystem['"]/,
    newImport: "import { useNotifications } from '../../hooks/useNotifications'"
  }
];

let totalFixed = 0;
let errors = [];

fixes.forEach(({ path: filePath, oldImport, newImport }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      errors.push(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (oldImport.test(content)) {
      content = content.replace(oldImport, newImport);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
      totalFixed++;
    } else {
      console.log(`⚠️  No match found in: ${filePath}`);
    }
  } catch (error) {
    errors.push(`Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n📊 Summary: Fixed ${totalFixed} files`);
if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(err => console.log(`  - ${err}`));
}