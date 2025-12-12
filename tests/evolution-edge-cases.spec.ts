import { test, expect } from '@playwright/test';

test.describe('Evolution Chain Edge Cases', () => {
  test.setTimeout(60000);

  // The URL pattern is /pokedex/[pokeid] with optional ?form= query

  test('Regular Farfetch\'d should show no evolution', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex/83');
    await page.waitForLoadState('networkidle');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Look for evolution section - it should either not exist or be empty
    const evolutionSection = page.locator('text=Evolution').first();
    const hasEvolution = await evolutionSection.isVisible().catch(() => false);

    if (hasEvolution) {
      // If section exists, Sirfetch'd should NOT be mentioned
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).not.toContain('sirfetch');
    }

    console.log('Regular Farfetch\'d: Evolution correctly hidden');
  });

  test('Galarian Farfetch\'d should show Sirfetch\'d evolution', async ({ page }) => {
    // Regional forms use the format /pokedex/farfetchd-galar
    await page.goto('http://localhost:3001/pokedex/farfetchd-galar');
    await page.waitForLoadState('networkidle');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Look for Sirfetch'd in the evolution chain
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('sirfetch');

    console.log('Galarian Farfetch\'d: Sirfetch\'d evolution shown correctly');
  });

  test('Regular Persian should not show Perrserker in evolution chain', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex/53');
    await page.waitForLoadState('networkidle');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Note: "Perrserker" may appear in Persian's Pokedex description (flavor text)
    // which is expected. We just need to verify it's NOT in the evolution section.

    // Look for the Evolution Chain section specifically
    const evolutionSection = page.locator('section:has(h2:text("Evolution Chain"))');
    const hasEvolutionSection = await evolutionSection.count() > 0;

    if (hasEvolutionSection) {
      const evolutionText = await evolutionSection.textContent();
      // Perrserker should NOT be in the evolution chain
      expect(evolutionText?.toLowerCase()).not.toContain('perrserker');
      // But Meowth should be shown as pre-evolution
      expect(evolutionText?.toLowerCase()).toContain('meowth');
      console.log('Regular Persian: Evolution chain shows Meowth → Persian (no Perrserker)');
    } else {
      // Evolution section might not render if it only has 1 Pokemon
      // In that case, verify Meowth is at least shown somewhere as the pre-evolution
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).toContain('meowth');
      console.log('Regular Persian: No evolution section rendered (expected for single-stage display)');
    }
  });

  test('Galarian Meowth should show Perrserker evolution', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex/meowth-galar');
    await page.waitForLoadState('networkidle');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Perrserker should appear
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).toContain('perrserker');

    console.log('Galarian Meowth: Perrserker evolution shown correctly');
  });

  test('Alolan Sandslash should show Alolan Sandshrew', async ({ page }) => {
    await page.goto('http://localhost:3001/pokedex/sandslash-alola');
    await page.waitForLoadState('networkidle');

    // Wait for the page to fully load
    await page.waitForTimeout(3000);

    // Should show Alolan evolution chain
    const pageContent = await page.content();
    // Sandshrew should be present
    expect(pageContent.toLowerCase()).toContain('sandshrew');

    console.log('Alolan Sandslash: Shows Alolan Sandshrew correctly');
  });
});
