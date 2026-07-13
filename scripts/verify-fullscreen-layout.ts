/**
 * Fullscreen layout verification for BabyArtist (canvas-only mode).
 *
 * Checks that fullscreen shows a full-bleed white board, hides toolbar/nav,
 * and keeps a small exit control visible across laptop/tablet/phone viewports.
 *
 * Prerequisites: dev server on http://localhost:3000 (auto-waited if already running).
 */
import { chromium, type Browser, type Page } from 'playwright';
import http from 'node:http';

const BASE_URL = process.env.LAYOUT_VERIFY_URL ?? 'http://localhost:3000';

const VIEWPORTS = [
  { id: 'laptop-1440x900', label: 'Laptop (Desktop)', width: 1440, height: 900 },
  { id: 'desktop-1920x1080', label: 'Desktop (Full HD)', width: 1920, height: 1080 },
  { id: 'ipad-portrait', label: 'iPad (Portrait)', width: 768, height: 1024 },
  { id: 'ipad-landscape', label: 'iPad (Landscape)', width: 1024, height: 768 },
  { id: 'iphone-390x844', label: 'iPhone (Standard)', width: 390, height: 844 },
  { id: 'galaxy-412x915', label: 'Samsung Galaxy (Standard)', width: 412, height: 915 },
] as const;

type Rect = { top: number; left: number; right: number; bottom: number; width: number; height: number };

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

function rectFromBox(box: { x: number; y: number; width: number; height: number } | null): Rect | null {
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

function isWithinViewport(r: Rect, vw: number, vh: number, tolerance = 1): boolean {
  return (
    r.left >= -tolerance &&
    r.top >= -tolerance &&
    r.right <= vw + tolerance &&
    r.bottom <= vh + tolerance
  );
}

function isInsideContainer(inner: Rect, outer: Rect, padding = 2): boolean {
  return (
    inner.left >= outer.left + padding &&
    inner.top >= outer.top + padding &&
    inner.right <= outer.right - padding &&
    inner.bottom <= outer.bottom - padding
  );
}

function rectsOverlap(a: Rect, b: Rect, minGap = 0): boolean {
  return !(
    a.right + minGap <= b.left ||
    a.left >= b.right + minGap ||
    a.bottom + minGap <= b.top ||
    a.top >= b.bottom + minGap
  );
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise<boolean>((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Dev server not reachable at ${url} after ${timeoutMs}ms. Run: npm run dev`);
}

async function enterFullscreen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('babyartist-onboarding-complete', 'true');
  });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const tourDialog = page.locator('[role="dialog"][aria-label="앱 사용 가이드"]');
  if (await tourDialog.isVisible().catch(() => false)) {
    await page.evaluate(() => localStorage.setItem('babyartist-onboarding-complete', 'true'));
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  const fullscreenBtn = page.locator('button[title="Fullscreen Art Mode"]');
  await fullscreenBtn.waitFor({ state: 'visible', timeout: 45_000 });
  await fullscreenBtn.click();
  await page.locator('[data-testid="fs-board"]').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(500);
}

async function getRect(page: Page, selector: string): Promise<Rect | null> {
  const box = await page.locator(selector).first().boundingBox();
  return rectFromBox(box);
}

async function runViewportChecks(page: Page, viewport: (typeof VIEWPORTS)[number]): Promise<CheckResult[]> {
  await enterFullscreen(page);

  const results: CheckResult[] = [];
  const { width: vw, height: vh } = viewport;

  const board = await getRect(page, '[data-testid="fs-board"]');
  const exitBtn = await getRect(page, '[data-testid="fs-exit-btn"]');
  const actions = await getRect(page, '[data-testid="fs-canvas-actions"]');

  const toolbarCount = await page.locator('[data-testid="fs-overlay-toolbar"]').count();
  const navCount = await page.locator('[data-testid="fs-overlay-nav"]').count();
  const headerCount = await page.locator('[data-testid="fs-overlay-header"]').count();

  if (!board) {
    results.push({ name: 'canvas-board-exists', pass: false, detail: 'fs-board not found' });
    return results;
  }

  const fillsViewport =
    board.left <= 1 &&
    board.top <= 1 &&
    Math.abs(board.width - vw) <= 2 &&
    Math.abs(board.height - vh) <= 2;

  results.push({
    name: 'canvas-fills-viewport',
    pass: fillsViewport && isWithinViewport(board, vw, vh, 2),
    detail: `board [${board.left.toFixed(0)},${board.top.toFixed(0)} ${board.width.toFixed(0)}x${board.height.toFixed(0)}] vs ${vw}x${vh}`,
  });

  results.push({
    name: 'toolbar-hidden',
    pass: toolbarCount === 0,
    detail: `fs-overlay-toolbar count=${toolbarCount}`,
  });

  results.push({
    name: 'activity-nav-hidden',
    pass: navCount === 0,
    detail: `fs-overlay-nav count=${navCount}`,
  });

  results.push({
    name: 'legacy-header-cluster-hidden',
    pass: headerCount === 0,
    detail: `fs-overlay-header count=${headerCount}`,
  });

  if (exitBtn) {
    const inside = isInsideContainer(exitBtn, board, 0);
    const nearTopRight =
      exitBtn.top <= board.top + Math.max(64, board.height * 0.12) &&
      exitBtn.right >= board.right - Math.max(80, board.width * 0.2);
    const compact = exitBtn.width <= 48 && exitBtn.height <= 48;

    results.push({
      name: 'exit-btn-visible-top-right',
      pass: inside && nearTopRight && isWithinViewport(exitBtn, vw, vh),
      detail: `exit at (${exitBtn.left.toFixed(0)},${exitBtn.top.toFixed(0)}) size ${exitBtn.width.toFixed(0)}x${exitBtn.height.toFixed(0)}`,
    });
    results.push({
      name: 'exit-btn-compact',
      pass: compact,
      detail: `${exitBtn.width.toFixed(0)}x${exitBtn.height.toFixed(0)} (max 48)`,
    });
  } else {
    results.push({ name: 'exit-btn-exists', pass: false, detail: 'fs-exit-btn missing' });
  }

  if (actions) {
    const insideBoard = isInsideContainer(actions, board, 0);
    const clearOfExit = !exitBtn || !rectsOverlap(actions, exitBtn, 8);
    results.push({
      name: 'canvas-actions-inside-board',
      pass: insideBoard,
      detail: 'save/trash cluster inside board',
    });
    results.push({
      name: 'canvas-actions-clear-of-exit',
      pass: clearOfExit,
      detail: 'save/trash do not overlap exit control',
    });
  } else {
    results.push({ name: 'canvas-actions-exist', pass: false, detail: 'fs-canvas-actions missing' });
  }

  // Exit restores normal draw chrome
  await page.locator('[data-testid="fs-exit-btn"]').click();
  await page.waitForTimeout(400);
  const boardGone = (await page.locator('[data-testid="fs-board"]').count()) === 0;
  const fullscreenBtnVisible = await page.locator('button[title="Fullscreen Art Mode"]').isVisible();
  results.push({
    name: 'exit-returns-to-normal',
    pass: boardGone && fullscreenBtnVisible,
    detail: boardGone
      ? 'fullscreen dismissed; Fullscreen button visible again'
      : 'fs-board still present after exit',
  });

  return results;
}

function printReport(allResults: Map<string, CheckResult[]>): boolean {
  let totalPass = 0;
  let totalFail = 0;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  BabyArtist Fullscreen Layout Verification (canvas-only)');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const vp of VIEWPORTS) {
    const results = allResults.get(vp.id) ?? [];
    const passed = results.filter((r) => r.pass).length;
    const failed = results.filter((r) => !r.pass).length;
    totalPass += passed;
    totalFail += failed;

    const status = failed === 0 ? 'PASS' : 'FAIL';
    console.log(`┌─ ${vp.label} (${vp.width}×${vp.height}) — ${status}`);
    for (const r of results) {
      const icon = r.pass ? '  ✓' : '  ✗';
      console.log(`${icon} ${r.name}: ${r.detail}`);
    }
    console.log(`└─ ${passed}/${results.length} checks passed\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  TOTAL: ${totalPass} passed, ${totalFail} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  return totalFail === 0;
}

async function main(): Promise<void> {
  console.log(`Checking dev server at ${BASE_URL} ...`);
  await waitForServer(BASE_URL);

  const browser: Browser = await chromium.launch({ headless: true });
  const allResults = new Map<string, CheckResult[]>();

  try {
    for (const vp of VIEWPORTS) {
      console.log(`Testing ${vp.label} (${vp.width}×${vp.height}) ...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      allResults.set(vp.id, await runViewportChecks(page, vp));
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const ok = printReport(allResults);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
