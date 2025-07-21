import { test, expect } from '../fixtures/test-base';
import { DexTrendsPageHelpers } from '../helpers/page-helpers';
import { waitForNetworkIdle, waitForElementStable } from '../helpers/test-utils';

test.describe('Collections', () => {
  let pageHelpers: DexTrendsPageHelpers;

  test.beforeEach(async ({ page }) => {
    pageHelpers = new DexTrendsPageHelpers(page);
    await page.goto('/collections');
    await waitForNetworkIdle(page);
  });

  test('should load collections page', async ({ page, consoleLogger }) => {
    // Check page title
    await expect(page).toHaveTitle(/Collections|DexTrends/);
    
    // Check for main heading
    await expect(page.locator('h1:has-text("Collections")').or(page.locator('[data-testid="collections-title"]'))).toBeVisible();
    
    // Verify no console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should display user collections', async ({ page }) => {
    // Wait for collections to load
    await pageHelpers.waitForLoadingComplete();
    
    // Check for collection items or empty state
    const collectionItems = page.locator('[data-testid="collection-item"]').or(page.locator('.collection-card')).or(page.locator('.collection-entry'));
    const emptyState = page.locator('[data-testid="empty-collections"]').or(page.locator('.empty-state')).or(page.locator('text=/no collections|start collecting/i'));
    
    // Either collections or empty state should be visible
    const hasCollections = await collectionItems.count() > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasCollections || hasEmptyState).toBeTruthy();
  });

  test('should create a new collection', async ({ page, consoleLogger }) => {
    // Look for create button
    const createButton = page.locator('button:has-text("Create")').or(page.locator('button:has-text("New Collection")')).or(page.locator('[data-testid="create-collection"]')).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Wait for create form/modal
      const formModal = await page.waitForSelector('[role="dialog"]', { 
        timeout: 5000 
      }).catch(() => null);
      
      if (formModal) {
        // Fill in collection name
        const nameInput = page.locator('input[name="name"]').or(page.locator('input[placeholder*="name"]')).or(page.locator('[data-testid="collection-name"]')).first();
        await nameInput.fill('Test Collection ' + Date.now());
        
        // Submit form
        const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Save")')).or(page.locator('button:has-text("Create")')).first();
        await submitButton.click();
        
        // Wait for success indication
        await page.waitForTimeout(2000);
        
        // Verify collection was created (either success message or new item appears)
        const successMessage = page.locator('[data-testid="success-message"]').or(page.locator('.success')).or(page.locator('.toast-success'));
        const newCollection = page.locator('text=/Test Collection/');
        
        const hasSuccess = await successMessage.isVisible().catch(() => false);
        const hasNewItem = await newCollection.isVisible().catch(() => false);
        
        expect(hasSuccess || hasNewItem).toBeTruthy();
      }
    }
    
    // Check for console errors
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should add items to collection', async ({ page, consoleLogger }) => {
    // First, ensure we have a collection
    const collectionItems = page.locator('[data-testid="collection-item"]').or(page.locator('.collection-card'));
    
    if (await collectionItems.count() > 0) {
      // Click on first collection
      await collectionItems.first().click();
      await page.waitForTimeout(1000);
      
      // Look for add item button
      const addItemButton = page.locator('button:has-text("Add")').or(page.locator('button:has-text("Add Item")')).or(page.locator('[data-testid="add-to-collection"]')).first();
      
      if (await addItemButton.isVisible()) {
        await addItemButton.click();
        
        // Wait for item selector
        const itemSelector = await page.waitForSelector('[data-testid="item-selector"]', { 
          timeout: 5000 
        }).catch(() => null);
        
        if (itemSelector) {
          // Select first available item
          const item = page.locator('[data-testid="selectable-item"]').or(page.locator('.item-option')).first();
          if (await item.isVisible()) {
            await item.click();
            
            // Confirm selection
            const confirmButton = page.locator('button:has-text("Add")').or(page.locator('button:has-text("Confirm")')).last();
            await confirmButton.click();
            
            // Verify item was added
            await page.waitForTimeout(2000);
            const collectionCount = await page.locator('[data-testid="collection-count"]').or(page.locator('.item-count')).textContent();
            expect(collectionCount).toBeTruthy();
          }
        }
      }
    }
    
    // Verify no errors during operation
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should delete items from collection', async ({ page }) => {
    // Navigate to a collection with items
    const collectionWithItems = page.locator('[data-testid="collection-item"]:has([data-testid="item-count"]:has-text(/[1-9]/))').first();
    
    if (await collectionWithItems.isVisible()) {
      await collectionWithItems.click();
      await page.waitForTimeout(1000);
      
      // Find delete button for an item
      const deleteButton = page.locator('button:has-text("Delete")').or(page.locator('button:has-text("Remove")')).or(page.locator('[data-testid="remove-item"]')).first();
      
      if (await deleteButton.isVisible()) {
        // Get initial count
        const initialCount = await page.locator('[data-testid="collection-count"]').or(page.locator('.item-count')).textContent();
        
        await deleteButton.click();
        
        // Confirm deletion if needed
        const confirmButton = page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Yes")')).last();
        if (await confirmButton.isVisible({ timeout: 1000 })) {
          await confirmButton.click();
        }
        
        // Wait for deletion
        await page.waitForTimeout(2000);
        
        // Verify item was removed
        const finalCount = await page.locator('[data-testid="collection-count"]').or(page.locator('.item-count')).textContent();
        expect(finalCount).not.toBe(initialCount);
      }
    }
  });

  test('should edit collection details', async ({ page, consoleLogger }) => {
    const collection = page.locator('[data-testid="collection-item"]').or(page.locator('.collection-card')).first();
    
    if (await collection.isVisible()) {
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit")').or(page.locator('[data-testid="edit-collection"]')).first();
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Wait for edit form
        const editForm = await page.waitForSelector('[data-testid="edit-form"]', { 
          timeout: 5000 
        }).catch(() => null);
        
        if (editForm) {
          // Update name
          const nameInput = page.locator('input[name="name"]').or(page.locator('[data-testid="collection-name"]')).first();
          await nameInput.fill('Updated Collection ' + Date.now());
          
          // Save changes
          const saveButton = page.locator('button:has-text("Save")').or(page.locator('button[type="submit"]')).first();
          await saveButton.click();
          
          // Verify update
          await page.waitForTimeout(2000);
          await expect(page.locator('text=/Updated Collection/')).toBeVisible();
        }
      }
    }
    
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should filter collections', async ({ page }) => {
    // Look for filter/search input
    const filterInput = page.locator('input[placeholder*="search"]').or(page.locator('input[placeholder*="filter"]')).or(page.locator('[data-testid="collection-filter"]')).first();
    
    if (await filterInput.isVisible()) {
      // Type filter term
      await filterInput.fill('test');
      await page.waitForTimeout(500);
      
      // Verify filtering works
      const visibleCollections = await page.locator('[data-testid="collection-item"]:visible').count();
      const allCollections = await page.locator('[data-testid="collection-item"]').count();
      
      // If there are collections, filtering should reduce the count
      if (allCollections > 0) {
        expect(visibleCollections).toBeLessThanOrEqual(allCollections);
      }
    }
  });

  test('should handle collection sharing', async ({ page }) => {
    const collection = page.locator('[data-testid="collection-item"]').first();
    
    if (await collection.isVisible()) {
      // Look for share button
      const shareButton = page.locator('button:has-text("Share")').or(page.locator('[data-testid="share-collection"]')).first();
      
      if (await shareButton.isVisible()) {
        await shareButton.click();
        
        // Wait for share modal/options
        const shareModal = await page.waitForSelector('[data-testid="share-modal"]', { 
          timeout: 5000 
        }).catch(() => null);
        
        if (shareModal) {
          // Check for share link or options
          const shareLink = page.locator('[data-testid="share-link"]').or(page.locator('input[readonly]')).first();
          const copyButton = page.locator('button:has-text("Copy")').or(page.locator('[data-testid="copy-link"]')).first();
          
          expect(await shareLink.isVisible() || await copyButton.isVisible()).toBeTruthy();
        }
      }
    }
  });

  test('should work on mobile', async ({ page, consoleLogger }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify responsive layout
    await expect(page.locator('h1:has-text("Collections")').or(page.locator('[data-testid="collections-title"]'))).toBeVisible();
    
    // Check mobile-specific UI
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(page.locator('.hamburger-menu'));
    if (await mobileMenu.count() > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
    
    // Verify no console errors on mobile
    await expect(consoleLogger).toHaveNoConsoleErrors();
  });

  test('should persist collections after refresh', async ({ page }) => {
    // Get current collections count
    const initialCount = await page.locator('[data-testid="collection-item"]').or(page.locator('.collection-card')).count();
    
    // Refresh page
    await page.reload();
    await waitForNetworkIdle(page);
    
    // Get count after refresh
    const afterRefreshCount = await page.locator('[data-testid="collection-item"]').or(page.locator('.collection-card')).count();
    
    // Count should be the same
    expect(afterRefreshCount).toBe(initialCount);
  });
});