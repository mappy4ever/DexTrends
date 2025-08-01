const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

class FastRefreshHealthCheck {
  constructor() {
    this.reportPath = path.join(process.cwd(), 'fast-refresh-report.json');
    this.criticalFiles = ['_app.tsx', '_document.tsx', 'Layout.tsx', 'layout.tsx'];
    this.highImpactDirs = ['/pages/', '/components/layout/', '/components/providers/', '/context/'];
  }

  loadReport() {
    if (!fs.existsSync(this.reportPath)) {
      console.log(`${colors.yellow}No report found. Running scanner first...${colors.reset}`);
      execSync('node scripts/scan-fast-refresh.js', { stdio: 'inherit' });
    }
    
    return JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
  }

  calculateHealthScore(violations) {
    let score = 100;
    const penalties = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1
    };

    violations.forEach(({ file, violations: fileViolations }) => {
      const severity = this.getFileSeverity(file);
      fileViolations.forEach(violation => {
        const violationPenalty = this.getViolationPenalty(violation.type);
        score -= penalties[severity] * violationPenalty;
      });
    });

    return Math.max(0, Math.round(score));
  }

  getFileSeverity(filePath) {
    const fileName = path.basename(filePath);
    
    if (this.criticalFiles.includes(fileName)) return 'critical';
    if (this.highImpactDirs.some(dir => filePath.includes(dir))) return 'high';
    if (filePath.includes('/components/')) return 'medium';
    return 'low';
  }

  getViolationPenalty(type) {
    const penalties = {
      'Anonymous Export': 1.5,
      'Mixed Exports': 1.2,
      'Nested Component': 1.5,
      'Conditional Hook': 2.0,
      'Unnecessary React Import': 0.5
    };
    return penalties[type] || 1;
  }

  getHealthGrade(score) {
    if (score >= 90) return { grade: 'A', color: colors.green };
    if (score >= 80) return { grade: 'B', color: colors.green };
    if (score >= 70) return { grade: 'C', color: colors.yellow };
    if (score >= 60) return { grade: 'D', color: colors.yellow };
    return { grade: 'F', color: colors.red };
  }

  getTopProblems(violations) {
    const problemFiles = violations
      .map(({ file, violations: v }) => ({
        file,
        severity: this.getFileSeverity(file),
        violationCount: v.length,
        types: v.map(vio => vio.type)
      }))
      .filter(f => f.severity === 'critical' || f.severity === 'high')
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return b.violationCount - a.violationCount;
      })
      .slice(0, 10);

    return problemFiles;
  }

  getSuggestedFixes(violations) {
    const suggestions = [];
    
    // Count violation types
    const typeCounts = {};
    violations.forEach(({ violations: v }) => {
      v.forEach(vio => {
        typeCounts[vio.type] = (typeCounts[vio.type] || 0) + 1;
      });
    });

    // Generate suggestions based on most common issues
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    
    sortedTypes.forEach(([type, count]) => {
      switch (type) {
        case 'Mixed Exports':
          suggestions.push({
            issue: `${count} files with mixed exports`,
            fix: 'Separate React components from utilities/hooks',
            command: 'node scripts/fix-fast-refresh.js',
            priority: 'high'
          });
          break;
        case 'Anonymous Export':
          suggestions.push({
            issue: `${count} anonymous exports`,
            fix: 'Name all component exports',
            command: 'node scripts/fix-fast-refresh.js',
            priority: 'medium'
          });
          break;
        case 'Nested Component':
          suggestions.push({
            issue: `${count} nested component definitions`,
            fix: 'Move components to module level',
            command: 'Manual refactoring required',
            priority: 'high'
          });
          break;
        case 'Conditional Hook':
          suggestions.push({
            issue: `${count} conditional hook calls`,
            fix: 'Call hooks unconditionally, use conditions inside',
            command: 'Manual refactoring required',
            priority: 'critical'
          });
          break;
      }
    });

    return suggestions;
  }

  generateProgressReport(previousReport, currentReport) {
    if (!previousReport) return null;

    const prevCounts = {};
    const currCounts = {};

    previousReport.forEach(({ violations: v }) => {
      v.forEach(vio => {
        prevCounts[vio.type] = (prevCounts[vio.type] || 0) + 1;
      });
    });

    currentReport.forEach(({ violations: v }) => {
      v.forEach(vio => {
        currCounts[vio.type] = (currCounts[vio.type] || 0) + 1;
      });
    });

    const progress = {};
    const allTypes = new Set([...Object.keys(prevCounts), ...Object.keys(currCounts)]);
    
    allTypes.forEach(type => {
      const prev = prevCounts[type] || 0;
      const curr = currCounts[type] || 0;
      const diff = curr - prev;
      
      progress[type] = {
        previous: prev,
        current: curr,
        change: diff,
        improved: diff < 0
      };
    });

    return progress;
  }

  run() {
    console.log(colors.cyan + '\n🏥 Fast Refresh Health Check\n' + colors.reset);
    
    // Load violation report
    const violations = this.loadReport();
    
    // Calculate health score
    const score = this.calculateHealthScore(violations);
    const { grade, color } = this.getHealthGrade(score);
    
    // Display health score
    console.log('═══════════════════════════════════════════');
    console.log(`Health Score: ${color}${score}/100 (Grade: ${grade})${colors.reset}`);
    console.log('═══════════════════════════════════════════\n');
    
    // Summary statistics
    const totalViolations = violations.reduce((sum, f) => sum + f.violations.length, 0);
    const criticalCount = violations.filter(f => 
      f.violations.some(v => this.getFileSeverity(f.file) === 'critical')
    ).length;
    
    console.log(`📊 ${colors.blue}Summary${colors.reset}`);
    console.log(`  Total files with violations: ${violations.length}`);
    console.log(`  Total violations: ${totalViolations}`);
    console.log(`  Critical files affected: ${colors.red}${criticalCount}${colors.reset}\n`);
    
    // Top problems
    const topProblems = this.getTopProblems(violations);
    if (topProblems.length > 0) {
      console.log(`🚨 ${colors.red}Top Priority Files${colors.reset}`);
      topProblems.forEach(({ file, severity, violationCount, types }) => {
        const relativePath = path.relative(process.cwd(), file);
        const severityColor = severity === 'critical' ? colors.red : colors.yellow;
        console.log(`  ${severityColor}[${severity.toUpperCase()}]${colors.reset} ${relativePath}`);
        console.log(`    └─ ${violationCount} violations: ${types.join(', ')}`);
      });
      console.log();
    }
    
    // Suggested fixes
    const suggestions = this.getSuggestedFixes(violations);
    if (suggestions.length > 0) {
      console.log(`💡 ${colors.green}Suggested Actions${colors.reset}`);
      suggestions
        .sort((a, b) => {
          const priority = { critical: 0, high: 1, medium: 2, low: 3 };
          return priority[a.priority] - priority[b.priority];
        })
        .forEach(({ issue, fix, command, priority }) => {
          const priorityColor = priority === 'critical' ? colors.red : 
                               priority === 'high' ? colors.yellow : colors.green;
          console.log(`  ${priorityColor}[${priority.toUpperCase()}]${colors.reset} ${issue}`);
          console.log(`    Fix: ${fix}`);
          if (command !== 'Manual refactoring required') {
            console.log(`    Run: ${colors.cyan}${command}${colors.reset}`);
          }
          console.log();
        });
    }
    
    // Health recommendations
    console.log(`📋 ${colors.blue}Recommendations${colors.reset}`);
    if (score >= 90) {
      console.log('  ✅ Excellent! Fast Refresh is working optimally.');
      console.log('  → Continue monitoring with regular health checks');
    } else if (score >= 70) {
      console.log('  ⚠️  Good, but room for improvement.');
      console.log('  → Fix critical files first');
      console.log('  → Run auto-fix script for quick wins');
    } else {
      console.log('  ❌ Significant Fast Refresh issues detected.');
      console.log('  → Prioritize fixing critical files immediately');
      console.log('  → Consider dedicated refactoring sprint');
      console.log('  → Enable ESLint rules to prevent new violations');
    }
    
    // Save health report
    const healthReport = {
      timestamp: new Date().toISOString(),
      score,
      grade,
      totalViolations,
      criticalFiles: criticalCount,
      topProblems: topProblems.slice(0, 5),
      suggestions
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'fast-refresh-health.json'),
      JSON.stringify(healthReport, null, 2)
    );
    
    console.log(`\n📄 Full health report saved to: ${colors.green}fast-refresh-health.json${colors.reset}`);
    
    // Next steps
    console.log(`\n🚀 ${colors.cyan}Next Steps${colors.reset}`);
    console.log('  1. Fix critical files first (especially _app.tsx)');
    console.log('  2. Run auto-fix script: node scripts/fix-fast-refresh.js');
    console.log('  3. Install ESLint plugin: npm install --save-dev eslint-plugin-react-refresh');
    console.log('  4. Run health check weekly: node scripts/fast-refresh-health.js');
  }
}

// Run the health check
const healthCheck = new FastRefreshHealthCheck();
healthCheck.run();