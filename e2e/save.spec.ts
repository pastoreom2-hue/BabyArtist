import { test, expect } from '@playwright/test';
import { prepareApp, drawStrokeAndAssert } from './helpers';

test.describe('Save naming', () => {
  test('Save dialog auto-names, downloads PNG, and allows rename', { tag: '@smoke' }, async ({ page }) => {
    await prepareApp(page);
    await drawStrokeAndAssert(page);

    await page.locator('[data-testid="fs-canvas-actions"] button[title="Save Masterpiece"]').click();
    const dialog = page.locator('[data-testid="save-artwork-dialog"]');
    await expect(dialog).toBeVisible();

    const filename = page.locator('[data-testid="save-artwork-filename"]');
    await expect(filename).toBeVisible();
    const nameText = (await filename.textContent())?.trim() ?? '';
    expect(nameText).toMatch(/^my-art-\d{8}-\d{6}\.png$/);

    await page.locator('[data-testid="save-artwork-rename-btn"]').click();
    const input = page.locator('[data-testid="save-artwork-rename-input"]');
    await expect(input).toBeVisible();
    await input.fill('My Beautiful Drawing');

    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
    await page.locator('[data-testid="save-artwork-confirm"]').click();

    const download = await downloadPromise;
    const suggested = download.suggestedFilename();
    expect(suggested).toMatch(/\.png$/i);
    expect(suggested.toLowerCase()).toContain('my-beautiful-drawing');

    // Must be a download attachment path — not a navigation / Open of the image
    expect(await download.failure()).toBeNull();

    await expect(dialog).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator('[data-testid="saved-drawings-panel"]')).toBeVisible();
  });
});
