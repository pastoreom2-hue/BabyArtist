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
          fileSize: number;
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
            const size = file?.size ?? 0;
            if (!file || size <= 0) {
              throw new Error('file empty');
            }
            const buffer = await file.arrayBuffer();
            if (buffer.byteLength <= 0) {
              throw new Error('file empty');
            }
            calls.push({
              hasFiles: Boolean(data?.files?.length),
              fileCount: data?.files?.length ?? 0,
              fileType: file.type ?? '',
              fileName: file.name ?? '',
              fileSize: size,
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
      expect(Number(call.fileSize)).toBeGreaterThan(0);
      // Files-only first attempt (no title/text) — critical for iOS attachments
      expect(call.hasTitle).toBe(false);
      expect(call.hasText).toBe(false);
    }
  );

  test(
    'Email waits for verified non-empty file (slow conversion shows preparing)',
    { tag: '@smoke' },
    async ({ page }) => {
      await page.addInitScript(() => {
        // Force conversion path to take >1s so preparing UI appears
        (window as unknown as { __BABYARTIST_SHARE_CONVERT_DELAY_MS: number })
          .__BABYARTIST_SHARE_CONVERT_DELAY_MS = 1500;

        const calls: Array<{
          fileSize: number;
          byteLength: number;
          emptyError: boolean;
        }> = [];
        (window as unknown as { __shareCalls: typeof calls }).__shareCalls = calls;
        (window as unknown as { __shareEmptyErrors: number }).__shareEmptyErrors = 0;

        Object.defineProperty(navigator, 'canShare', {
          configurable: true,
          value: (data?: ShareData) => Boolean(data?.files?.length),
        });

        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: async (data?: ShareData) => {
            const file = data?.files?.[0] as File | undefined;
            if (!file || file.size <= 0) {
              (window as unknown as { __shareEmptyErrors: number }).__shareEmptyErrors += 1;
              throw new Error('file empty');
            }
            const buffer = await file.arrayBuffer();
            if (buffer.byteLength <= 0) {
              (window as unknown as { __shareEmptyErrors: number }).__shareEmptyErrors += 1;
              throw new Error('file empty');
            }
            calls.push({
              fileSize: file.size,
              byteLength: buffer.byteLength,
              emptyError: false,
            });
          },
        });
      });

      await prepareApp(page);
      await page.getByRole('button', { name: 'Send Drawing' }).click();
      await expect(page.locator('[data-testid="share-email-btn"]')).toBeVisible();

      page.on('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      await page.locator('[data-testid="share-email-btn"]').click();

      // Spinner must appear before share/mail — conversion is artificially slow
      await expect(page.locator('[data-testid="share-preparing"]')).toBeVisible({
        timeout: 3_000,
      });
      await expect(page.locator('[data-testid="share-preparing"]')).toContainText(
        /Preparing your drawing/i
      );

      await expect
        .poll(
          async () =>
            page.evaluate(
              () => (window as unknown as { __shareCalls: unknown[] }).__shareCalls?.length ?? 0
            ),
          { timeout: 20_000 }
        )
        .toBeGreaterThan(0);

      const result = await page.evaluate(() => {
        const w = window as unknown as {
          __shareCalls: Array<{ fileSize: number; byteLength: number }>;
          __shareEmptyErrors: number;
        };
        return {
          call: w.__shareCalls[0],
          emptyErrors: w.__shareEmptyErrors,
        };
      });

      expect(result.emptyErrors).toBe(0);
      expect(result.call.fileSize).toBeGreaterThan(0);
      expect(result.call.byteLength).toBeGreaterThan(0);
      expect(result.call.fileSize).toBe(result.call.byteLength);

      await expect(page.locator('[data-testid="share-preparing"]')).toHaveCount(0);
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
