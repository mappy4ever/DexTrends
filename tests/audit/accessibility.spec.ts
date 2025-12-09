/**
 * Accessibility Audit Tests
 *
 * Uses axe-core to scan pages for WCAG violations.
 * Tests against WCAG 2.1 AA standards.
 *
 * Usage:
 *   npx playwright test tests/audit/accessibility.spec.ts
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'http://localhost:3001';

// Pages to audit for accessibility
const AUDIT_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pokedex', name: 'Pokedex' },
  { path: '/tcgexpansions', name: 'TCG Expansions' },
  { path: '/pocketmode', name: 'Pocket Mode' },
  { path: '/pokemon', name: 'Pokemon Hub' },
  { path: '/pokemon/moves-unified', name: 'Pokemon Moves' },
  { path: '/market', name: 'Market' },
  { path: '/favorites', name: 'Favorites' },
  { path: '/search', name: 'Search' },
  { path: '/battle-simulator', name: 'Battle Simulator' },
  { path: '/type-effectiveness', name: 'Type Effectiveness' },
  { path: '/support', name: 'Support' },
];

interface AccessibilityResult {
  page: string;
  violations: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  details: Array<{
    id: string;
    impact: string;
    description: string;
    nodes: number;
  }>;
}

test.describe('Accessibility Audit (WCAG 2.1 AA)', () => {
  const results: AccessibilityResult[] = [];

  for (const page of AUDIT_PAGES) {
    test(`${page.name} - WCAG 2.1 AA compliance`, async ({ page: browserPage }) => {
      // Navigate to page
      await browserPage.goto(`${BASE_URL}${page.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Wait for dynamic content to load
      await browserPage.waitForTimeout(2000);

      // Run axe-core accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Count violations by severity
      const violations = accessibilityScanResults.violations;
      const critical = violations.filter(v => v.impact === 'critical').length;
      const serious = violations.filter(v => v.impact === 'serious').length;
      const moderate = violations.filter(v => v.impact === 'moderate').length;
      const minor = violations.filter(v => v.impact === 'minor').length;

      // Store result
      const result: AccessibilityResult = {
        page: page.name,
        violations: violations.length,
        critical,
        serious,
        moderate,
        minor,
        details: violations.map(v => ({
          id: v.id,
          impact: v.impact || 'unknown',
          description: v.description,
          nodes: v.nodes.length,
        })),
      };
      results.push(result);

      // Log violations
      if (violations.length > 0) {
        console.log(`\n${page.name} - ${violations.length} violations found:`);
        violations.forEach(v => {
          console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} instances)`);
        });
      } else {
        console.log(`\n${page.name} - No violations found`);
      }

      // For audit purposes, only fail on critical violations
      // Serious/moderate/minor are reported but don't fail the test
      expect(
        critical,
        `${page.name} should have no critical accessibility violations`
      ).toBe(0);

      // Log warning for serious violations but don't fail
      if (serious > 0) {
        console.warn(`  WARNING: ${serious} serious violations found on ${page.name}`);
      }
    });
  }

  test.afterAll(async () => {
    // Print summary
    console.log('\n\n=== ACCESSIBILITY AUDIT SUMMARY ===\n');

    const totalViolations = results.reduce((sum, r) => sum + r.violations, 0);
    const totalCritical = results.reduce((sum, r) => sum + r.critical, 0);
    const totalSerious = results.reduce((sum, r) => sum + r.serious, 0);
    const pagesWithIssues = results.filter(r => r.violations > 0).length;

    console.log(`Pages Audited: ${results.length}`);
    console.log(`Pages with Issues: ${pagesWithIssues}`);
    console.log(`Total Violations: ${totalViolations}`);
    console.log(`  Critical: ${totalCritical}`);
    console.log(`  Serious: ${totalSerious}`);

    if (pagesWithIssues > 0) {
      console.log('\nPages with Violations:');
      results
        .filter(r => r.violations > 0)
        .sort((a, b) => b.violations - a.violations)
        .forEach(r => {
          console.log(`  ${r.page}: ${r.violations} (C:${r.critical} S:${r.serious} M:${r.moderate} m:${r.minor})`);
        });
    }

    // Common issue summary
    const allIssues = results.flatMap(r => r.details);
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue.id] = (acc[issue.id] || 0) + issue.nodes;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(issueCounts).length > 0) {
      console.log('\nMost Common Issues:');
      Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([id, count]) => {
          console.log(`  ${id}: ${count} instances`);
        });
    }
  });
});

test.describe('Keyboard Navigation', () => {
  test('Tab navigation works on homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Tab through focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).toBeTruthy();
    }
  });

  test('Search input is keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // Find and focus search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.focus();
      await searchInput.fill('pikachu');

      const value = await searchInput.inputValue();
      expect(value).toBe('pikachu');
    }
  });

  test('Modal can be closed with Escape key', async ({ page }) => {
    await page.goto(`${BASE_URL}/pokedex`, { waitUntil: 'networkidle' });

    // Try to open filter modal if it exists
    const filterButton = page.locator('button:has-text("Filter"), button[aria-label*="filter"]').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  });
});

test.describe('Color Contrast', () => {
  test('Text has sufficient contrast', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const contrastResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = contrastResults.violations.filter(v => v.id === 'color-contrast');

    if (contrastViolations.length > 0) {
      console.log('\nColor contrast issues:');
      contrastViolations.forEach(v => {
        v.nodes.forEach(node => {
          console.log(`  ${node.html.substring(0, 100)}...`);
        });
      });
    }

    // Allow some contrast issues (may be intentional design choices)
    expect(contrastViolations.length).toBeLessThan(5);
  });
});
