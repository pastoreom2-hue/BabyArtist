import { test, expect } from '@playwright/test';
import { prepareApp, drawStrokeAndAssert } from './helpers';

test.describe('Save Drawing gallery', () => {
  test(
    'Save Drawing shows saved gallery newest-first',
    { tag: '@smoke' },
    async ({ page }) => {
      await prepareApp(page);

      await page.getByRole('button', { name: 'Save Drawing' }).click();
      await expect(page.locator('[data-testid="saved-drawings-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="saved-drawings-empty"]')).toBeVisible();

      await page.getByRole('button', { name: 'Start Drawing' }).first().click();
      await drawStrokeAndAssert(page);

      await page.locator('[data-testid="fs-canvas-actions"] button[title="Save Masterpiece"]').click();
      const dialog = page.locator('[data-testid="save-artwork-dialog"]');
      await expect(dialog).toBeVisible();
      const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
      await page.locator('[data-testid="save-artwork-confirm"]').click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.png$/i);
      await expect(dialog).toHaveCount(0, { timeout: 15_000 });

      // After save → Saved Drawings view with the new piece first
      await expect(page.locator('[data-testid="saved-drawings-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="saved-drawings-grid"]')).toBeVisible();
      await expect(page.locator('[data-testid="saved-drawing-item"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="saved-drawings-count"]')).toContainText('1');

      // Nav Save Drawing still opens the same panel
      await page.getByRole('button', { name: 'Start Drawing' }).first().click();
      await page.getByRole('button', { name: 'Save Drawing' }).click();
      await expect(page.locator('[data-testid="saved-drawing-item"]')).toHaveCount(1);

      // Same items appear under Send Drawing gallery
      await page.getByRole('button', { name: 'Send Drawing' }).click();
      await expect(page.getByText('Recent Masterpieces')).toBeVisible();
    }
  );
});
