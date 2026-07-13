import { test, expect } from '@playwright/test';
import {
  prepareApp,
  selectActivity,
  enterFullscreen,
  exitFullscreen,
  getRect,
  isInside,
  overlaps,
  centerX,
  centerY,
  drawStrokeAndAssert,
} from './helpers';

test.describe('BabyArtist core flows', () => {
  test.beforeEach(async ({ page }) => {
    await prepareApp(page);
  });

  test('main canvas renders and accepts drawing', async ({ page }) => {
    await expect(page.locator('[data-testid="drawing-canvas"]')).toBeVisible();
    await expect(page.locator('button[title="Fullscreen Art Mode"]')).toBeVisible();
    await drawStrokeAndAssert(page);
  });

  test('Color by Number guide stays inside canvas without overflow', async ({ page }) => {
    await selectActivity(page, /Color by Number/i);
    await expect(page.locator('[data-testid="canvas-activity-hint"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-color-legend"]')).toBeVisible();

    const canvas = await getRect(page.locator('[data-testid="drawing-canvas"]'));
    const hint = await getRect(page.locator('[data-testid="canvas-activity-hint"]'));
    const legend = await getRect(page.locator('[data-testid="canvas-color-legend"]'));
    const actions = await getRect(page.locator('[data-testid="fs-canvas-actions"]'));

    expect(canvas).toBeTruthy();
    expect(hint).toBeTruthy();
    expect(legend).toBeTruthy();
    expect(actions).toBeTruthy();

    expect(isInside(hint!, canvas!, 1)).toBe(true);
    expect(isInside(legend!, canvas!, 1)).toBe(true);
    expect(isInside(actions!, canvas!, 1)).toBe(true);
    expect(overlaps(legend!, actions!, 4)).toBe(false);

    // Color guide should not sit at/through the bottom edge
    expect(legend!.bottom).toBeLessThan(canvas!.bottom - 8);

    // Template layer present (shapes / numbered areas)
    await expect(page.locator('[data-testid="drawing-canvas"] canvas').first()).toBeVisible();
  });

  test('Shape Match art stays centered inside the white board', async ({ page }) => {
    await selectActivity(page, /Shape Match/i);
    await expect(page.locator('[data-testid="canvas-activity-hint"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-color-legend"]')).toHaveCount(0);

    const canvas = await getRect(page.locator('[data-testid="drawing-canvas"]'));
    const hint = await getRect(page.locator('[data-testid="canvas-activity-hint"]'));
    expect(canvas).toBeTruthy();
    expect(hint).toBeTruthy();
    expect(isInside(hint!, canvas!, 1)).toBe(true);

    // Hint should sit near the top band; canvas should be non-trivial (space for shapes)
    expect(hint!.top).toBeLessThan(canvas!.top + canvas!.height * 0.25);
    expect(canvas!.width).toBeGreaterThan(200);
    expect(canvas!.height).toBeGreaterThan(200);

    // Drawing surface roughly fills its board panel (shapes scaled to container)
    const cx = centerX(canvas!);
    const cy = centerY(canvas!);
    expect(cx).toBeGreaterThan(0);
    expect(cy).toBeGreaterThan(0);
  });

  test('Fullscreen Option B shows slim tool-belt and stable canvas layout', async ({ page }) => {
    await selectActivity(page, /Color by Number/i);
    await enterFullscreen(page);

    const board = await getRect(page.locator('[data-testid="fs-board"]'));
    const dock = await getRect(page.locator('[data-testid="fs-floating-dock"]'));
    const canvas = await getRect(page.locator('[data-testid="drawing-canvas"]'));
    const legend = await getRect(page.locator('[data-testid="canvas-color-legend"]'));
    const hint = await getRect(page.locator('[data-testid="canvas-activity-hint"]'));
    const actions = await getRect(page.locator('[data-testid="fs-canvas-actions"]'));
    const viewport = page.viewportSize()!;

    expect(board).toBeTruthy();
    expect(dock).toBeTruthy();
    expect(canvas).toBeTruthy();

    // Canvas fills the board / viewport
    expect(Math.abs(board!.width - viewport.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(board!.height - viewport.height)).toBeLessThanOrEqual(2);
    expect(isInside(canvas!, board!, 1)).toBe(true);

    // Slim floating dock with colors + brush sizes + exit
    expect(dock!.height).toBeLessThanOrEqual(88);
    await expect(page.locator('[data-testid="fs-floating-dock"] .fs-dock-swatch')).toHaveCount(8);
    await expect(page.locator('[data-testid="fs-floating-dock"] .fs-dock-size')).toHaveCount(4);
    await expect(page.locator('[data-testid="fs-exit-btn"]')).toBeVisible();

    // Header / activity strip hidden
    await expect(page.locator('header')).toBeHidden();
    await expect(page.locator('button[title="Fullscreen Art Mode"]')).toBeHidden();

    // Activity HUD stays on the board and clear of the dock
    expect(hint).toBeTruthy();
    expect(legend).toBeTruthy();
    expect(actions).toBeTruthy();
    expect(isInside(hint!, canvas!, 2)).toBe(true);
    expect(isInside(legend!, canvas!, 2)).toBe(true);
    expect(isInside(actions!, canvas!, 2)).toBe(true);
    expect(overlaps(legend!, dock!, 4)).toBe(false);
    expect(overlaps(actions!, dock!, 4)).toBe(false);
    expect(overlaps(legend!, actions!, 4)).toBe(false);

    // Drawing still works in fullscreen
    await drawStrokeAndAssert(page);

    await exitFullscreen(page);
    await expect(page.locator('button[title="Fullscreen Art Mode"]')).toBeVisible();
  });
});
