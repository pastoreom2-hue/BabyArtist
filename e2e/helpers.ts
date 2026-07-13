import { expect, type Locator, type Page } from '@playwright/test';

export type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export async function prepareApp(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('babyartist-onboarding-complete', 'true');
  });
  await page.goto('/');
  await page.locator('[data-testid="drawing-canvas"]').waitFor({ state: 'visible', timeout: 45_000 });

  const tour = page.locator('[role="dialog"][aria-label="앱 사용 가이드"]');
  if (await tour.isVisible().catch(() => false)) {
    await page.evaluate(() => localStorage.setItem('babyartist-onboarding-complete', 'true'));
    await page.reload();
    await page.locator('[data-testid="drawing-canvas"]').waitFor({ state: 'visible', timeout: 45_000 });
  }
}

export async function selectActivity(page: Page, label: RegExp | string): Promise<void> {
  const btn = page.getByRole('button', { name: label }).first();
  await expect(btn).toBeVisible();
  await btn.click();
  await page.waitForTimeout(350);
}

export async function enterFullscreen(page: Page): Promise<void> {
  await page.locator('button[title="Fullscreen Art Mode"]').click();
  await expect(page.locator('[data-testid="fs-board"]')).toBeVisible();
  await expect(page.locator('[data-testid="fs-floating-dock"]')).toBeVisible();
  await page.waitForTimeout(300);
}

export async function exitFullscreen(page: Page): Promise<void> {
  await page.locator('[data-testid="fs-exit-btn"]').click();
  await expect(page.locator('[data-testid="fs-board"]')).toHaveCount(0);
}

export async function getRect(locator: Locator): Promise<Rect | null> {
  const box = await locator.boundingBox();
  if (!box) return null;
  return {
    top: box.y,
    left: box.x,
    right: box.x + box.width,
    bottom: box.y + box.height,
    width: box.width,
    height: box.height,
  };
}

export function isInside(inner: Rect, outer: Rect, pad = 0): boolean {
  return (
    inner.left >= outer.left - pad &&
    inner.top >= outer.top - pad &&
    inner.right <= outer.right + pad &&
    inner.bottom <= outer.bottom + pad
  );
}

export function overlaps(a: Rect, b: Rect, minGap = 0): boolean {
  return !(
    a.right + minGap <= b.left ||
    a.left >= b.right + minGap ||
    a.bottom + minGap <= b.top ||
    a.top >= b.bottom + minGap
  );
}

export function centerX(r: Rect): number {
  return r.left + r.width / 2;
}

export function centerY(r: Rect): number {
  return r.top + r.height / 2;
}

/** Stroke on the drawing canvas and confirm pixels changed. */
export async function drawStrokeAndAssert(page: Page): Promise<void> {
  const canvas = page.locator('[data-testid="drawing-canvas"] canvas').nth(1);
  await expect(canvas).toBeVisible();

  const before = await canvas.evaluate((el) => {
    const c = el as HTMLCanvasElement;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    // Sample a band near the stroke path
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 16) sum += data[i] + data[i + 1] + data[i + 2] + data[i + 3];
    return sum;
  });

  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no bounding box');

  const startX = box.x + box.width * 0.35;
  const startY = box.y + box.height * 0.4;
  const endX = box.x + box.width * 0.65;
  const endY = box.y + box.height * 0.55;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  const after = await canvas.evaluate((el) => {
    const c = el as HTMLCanvasElement;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 16) sum += data[i] + data[i + 1] + data[i + 2] + data[i + 3];
    return sum;
  });

  expect(before).not.toBeNull();
  expect(after).not.toBeNull();
  expect(after).not.toBe(before);
}
