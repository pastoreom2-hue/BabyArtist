import { test, expect } from '@playwright/test';
import { prepareApp, getRect, isInside } from './helpers';

test.describe('Help guide', () => {
  test.beforeEach(async ({ page }) => {
    await prepareApp(page);
  });

  test('Help page shows looping intro video without breaking layout', async ({ page }) => {
    await page.locator('button[title="Help"]').click();
    const dialog = page.locator('[role="dialog"][aria-labelledby="help-modal-title"]');
    await expect(dialog).toBeVisible();

    const videoWrap = page.locator('[data-testid="help-intro-video"]');
    const video = videoWrap.locator('video');
    await expect(videoWrap).toBeVisible();
    await expect(video).toBeVisible();

    const wrapBox = await getRect(videoWrap);
    const mediaBox = await getRect(video);
    const viewport = page.viewportSize()!;

    expect(wrapBox).toBeTruthy();
    expect(mediaBox).toBeTruthy();
    expect(wrapBox!.width).toBeGreaterThan(120);
    expect(wrapBox!.width).toBeLessThanOrEqual(viewport.width + 2);
    expect(wrapBox!.right).toBeLessThanOrEqual(viewport.width + 4);
    expect(isInside(mediaBox!, wrapBox!, 3)).toBe(true);

    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');

    // muted + autoplay required for silent loop intro
    const autoplayOk = await video.evaluate((el) => {
      const v = el as HTMLVideoElement;
      return v.autoplay && v.muted && v.loop && v.playsInline;
    });
    expect(autoplayOk).toBe(true);

    await expect(page.locator('#help-modal-title')).toBeVisible();
    await expect(dialog.locator('section').first()).toBeVisible();

    await dialog.locator('button[aria-label="Close"]').click();
    await expect(dialog).toHaveCount(0);
  });
});
