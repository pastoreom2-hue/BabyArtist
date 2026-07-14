import { test, expect } from '@playwright/test';
import { prepareApp, getRect, isInside, overlaps } from './helpers';

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
    const muteBtn = page.locator('[data-testid="help-video-mute-btn"]');
    await expect(videoWrap).toBeVisible();
    await expect(video).toBeVisible();
    await expect(muteBtn).toBeVisible();
    // Wait for video layout to settle (intrinsic size can briefly overflow)
    await video.evaluate(async (el) => {
      const v = el as HTMLVideoElement;
      if (v.readyState >= 2) return;
      await new Promise<void>((resolve) => {
        v.addEventListener('loadeddata', () => resolve(), { once: true });
      });
    });
    await page.waitForTimeout(150);

    const wrapBox = await getRect(videoWrap);
    const mediaBox = await getRect(video);
    const muteBox = await getRect(muteBtn);
    const viewport = page.viewportSize()!;

    expect(wrapBox).toBeTruthy();
    expect(mediaBox).toBeTruthy();
    expect(muteBox).toBeTruthy();
    expect(wrapBox!.width).toBeGreaterThan(120);
    expect(wrapBox!.width).toBeLessThanOrEqual(viewport.width + 2);
    expect(wrapBox!.right).toBeLessThanOrEqual(viewport.width + 4);
    expect(isInside(mediaBox!, wrapBox!, 6)).toBe(true);
    expect(isInside(muteBox!, wrapBox!, 4)).toBe(true);

    // Easy tap target on mobile
    expect(muteBox!.width).toBeGreaterThanOrEqual(40);
    expect(muteBox!.height).toBeGreaterThanOrEqual(40);

    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');

    // Starts muted for autoplay policy
    const startMuted = await video.evaluate((el) => (el as HTMLVideoElement).muted);
    expect(startMuted).toBe(true);
    await expect(muteBtn).toHaveAttribute('aria-label', 'Unmute video');

    // One tap toggles sound without breaking layout
    await muteBtn.click();
    const unmuted = await video.evaluate((el) => !(el as HTMLVideoElement).muted);
    expect(unmuted).toBe(true);
    await expect(muteBtn).toHaveAttribute('aria-label', 'Mute video');

    const muteBoxAfter = await getRect(muteBtn);
    expect(muteBoxAfter).toBeTruthy();
    expect(isInside(muteBoxAfter!, wrapBox!, 4)).toBe(true);

    // Guide sections still readable below video
    const firstSection = await getRect(dialog.locator('section').first());
    expect(firstSection).toBeTruthy();
    expect(overlaps(muteBoxAfter!, firstSection!, 0)).toBe(false);

    await expect(page.locator('#help-modal-title')).toBeVisible();

    await dialog.locator('button[aria-label="Close"]').click();
    await expect(dialog).toHaveCount(0);
  });
});
