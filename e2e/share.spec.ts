import { test, expect } from '@playwright/test';
import { prepareApp } from './helpers';

test.describe('Send Drawing share attachment', () => {
  test(
    'Share sends a PNG File via Web Share API (files-only)',
    { tag: '@smoke' },
    async ({ page }) => {
      await page.addInitScript(() => {
        const calls: Array<{
          hasFiles: boolean;
          fileCount: number;
          fileType: string;
          fileName: string;
          hasTitle: boolean;
          hasText: boolean;
        }> = [];

        // @ts-expect-error test hook
        window.__shareCalls = calls;

        Object.defineProperty(navigator, 'canShare', {
          configurable: true,
          value: (data?: ShareData) => Boolean(data?.files?.length),
        });

        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: async (data?: ShareData) => {
            const file = data?.files?.[0] as File | undefined;
            calls.push({
              hasFiles: Boolean(data?.files?.length),
              fileCount: data?.files?.length ?? 0,
              fileType: file?.type ?? '',
              fileName: file?.name ?? '',
              hasTitle: Boolean(data?.title),
              hasText: Boolean(data?.text),
            });
          },
        });
      });

      await prepareApp(page);

      await page.getByRole('button', { name: 'Send Drawing' }).click();
      await expect(page.locator('[data-testid="artwork-share-actions"]')).toBeVisible();

      page.once('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      await page.locator('[data-testid="share-sns-btn"]').click();

      await expect
        .poll(async () =>
          page.evaluate(() => (window as unknown as { __shareCalls: unknown[] }).__shareCalls?.length ?? 0)
        )
        .toBeGreaterThan(0);

      const call = await page.evaluate(() => {
        const calls = (window as unknown as { __shareCalls: Array<Record<string, unknown>> }).__shareCalls;
        return calls[0];
      });

      expect(call.hasFiles).toBe(true);
      expect(call.fileCount).toBe(1);
      expect(call.fileType).toBe('image/png');
      expect(String(call.fileName)).toMatch(/\.png$/i);
      // Files-only first attempt (no title/text) — critical for iOS attachments
      expect(call.hasTitle).toBe(false);
      expect(call.hasText).toBe(false);
    }
  );

  test('Download exports a framed PNG file', async ({ page }) => {
    await prepareApp(page);
    await page.getByRole('button', { name: 'Send Drawing' }).click();
    await expect(page.locator('[data-testid="share-download-btn"]')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="share-download-btn"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.png$/i);
  });
});
