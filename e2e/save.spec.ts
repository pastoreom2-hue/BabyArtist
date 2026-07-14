import { test, expect } from '@playwright/test';
import { prepareApp, drawStrokeAndAssert } from './helpers';

test.describe('Save naming', () => {
  test('Save dialog auto-names and allows rename', { tag: '@smoke' }, async ({ page }) => {
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

    await page.locator('[data-testid="save-artwork-confirm"]').click();
    await expect(dialog).toHaveCount(0, { timeout: 15_000 });
  });
});
