/**
 * Fullscreen layout verification for BabyArtist.
 *
 * Tests golden-frame bounds, overlay positioning, and nav label clarity
 * across laptop, tablet, and phone viewports.
 *
 * Prerequisites: dev server on http://localhost:3000 (auto-waited if already running).
 */
import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import http from 'node:http';

const BASE_URL = process.env.LAYOUT_VERIFY_URL ?? 'http://localhost:3000';
const OUTER_PAD_MIN_PX = 6;

const VIEWPORTS = [
  { id: 'laptop-1440x900', label: 'Laptop (Desktop)', width: 1440, height: 900 },
  { id: 'desktop-1920x1080', label: 'Desktop (Full HD)', width: 1920, height: 1080 },
  { id: 'ipad-portrait', label: 'iPad (Portrait)', width: 768, height: 1024 },
  { id: 'ipad-landscape', label: 'iPad (Landscape)', width: 1024, height: 768 },
  { id: 'iphone-390x844', label: 'iPhone (Standard)', width: 390, height: 844 },
  { id: 'galaxy-412x915', label: 'Samsung Galaxy (Standard)', width: 412, height: 915 },
] as const;

const EXPECTED_NAV_LABELS = ['Free Draw', 'Color by Number', 'Shape Match', 'Challenge'];

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

function isInsideContainer(inner: Rect, outer: Rect, padding = 4): boolean {
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

function centerX(r: Rect): number {
  return r.left + r.width / 2;
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
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
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
  const header = await getRect(page, '[data-testid="fs-overlay-header"]');
  const toolbar = await getRect(page, '[data-testid="fs-overlay-toolbar"]');
  const nav = await getRect(page, '[data-testid="fs-overlay-nav"]');
  const actions = await getRect(page, '[data-testid="fs-canvas-actions"]');

  // 1. Golden board within screen bounds
  if (!board) {
    results.push({ name: 'golden-board-exists', pass: false, detail: 'fs-board not found' });
    return results;
  }

  results.push({
    name: 'golden-board-in-viewport',
    pass: isWithinViewport(board, vw, vh),
    detail: `board [${board.left.toFixed(0)},${board.top.toFixed(0)} ${board.width.toFixed(0)}x${board.height.toFixed(0)}] in ${vw}x${vh}`,
  });

  const hasOuterPad =
    board.left >= OUTER_PAD_MIN_PX &&
    board.top >= OUTER_PAD_MIN_PX &&
    vw - board.right >= OUTER_PAD_MIN_PX &&
    vh - board.bottom >= OUTER_PAD_MIN_PX;

  results.push({
    name: 'golden-board-outer-padding',
    pass: hasOuterPad,
    detail: `padding L${board.left.toFixed(0)} T${board.top.toFixed(0)} R${(vw - board.right).toFixed(0)} B${(vh - board.bottom).toFixed(0)} (min ${OUTER_PAD_MIN_PX}px)`,
  });

  // 2. Top-right cluster inside board, below top inner edge (~5%)
  if (header) {
    const inside = isInsideContainer(header, board, 2);
    const belowTopBand = header.top >= board.top + board.height * 0.03;
    results.push({
      name: 'header-inside-golden-board',
      pass: inside && belowTopBand,
      detail: inside
        ? `header top at ${((header.top - board.top) / board.height * 100).toFixed(1)}% from board top`
        : 'header overlaps or escapes golden board',
    });
    results.push({
      name: 'header-not-clipped-by-viewport',
      pass: isWithinViewport(header, vw, vh),
      detail: `header within ${vw}x${vh}`,
    });
  } else {
    results.push({ name: 'header-exists', pass: false, detail: 'fs-overlay-header missing' });
  }

  // 3. Left toolbar inside board
  if (toolbar) {
    results.push({
      name: 'toolbar-inside-golden-board',
      pass: isInsideContainer(toolbar, board, 2),
      detail: `toolbar [${toolbar.left.toFixed(0)},${toolbar.top.toFixed(0)}] inside board`,
    });
    results.push({
      name: 'toolbar-not-clipped-by-viewport',
      pass: isWithinViewport(toolbar, vw, vh),
      detail: `toolbar within viewport`,
    });
  } else {
    results.push({ name: 'toolbar-exists', pass: false, detail: 'fs-overlay-toolbar missing' });
  }

  // 4. Bottom nav centered, above bottom edge
  if (nav) {
    const inside = isInsideContainer(nav, board, 2);
    const aboveBottom = nav.bottom <= board.bottom - board.height * 0.04;
    const navCenter = centerX(nav);
    const boardCenter = centerX(board);
    const centerDelta = Math.abs(navCenter - boardCenter);
    const centered = centerDelta <= board.width * 0.12;

    results.push({
      name: 'nav-inside-golden-board',
      pass: inside && aboveBottom,
      detail: `nav bottom ${((board.bottom - nav.bottom) / board.height * 100).toFixed(1)}% above board bottom`,
    });
    results.push({
      name: 'nav-horizontally-centered',
      pass: centered,
      detail: `center offset ${centerDelta.toFixed(1)}px (max ${(board.width * 0.12).toFixed(1)}px)`,
    });
    results.push({
      name: 'nav-not-clipped-by-viewport',
      pass: isWithinViewport(nav, vw, vh),
      detail: `nav within viewport`,
    });
  } else {
    results.push({ name: 'nav-exists', pass: false, detail: 'fs-overlay-nav missing' });
  }

  // 5. Save/Trash inside board, above nav
  if (actions && nav) {
    const insideBoard = isInsideContainer(actions, board, 2);
    const aboveNav = actions.bottom <= nav.top - 4 || !rectsOverlap(actions, nav, 8);
    results.push({
      name: 'canvas-actions-inside-board',
      pass: insideBoard,
      detail: 'save/trash cluster inside golden board',
    });
    results.push({
      name: 'canvas-actions-clear-of-nav',
      pass: aboveNav,
      detail: 'save/trash do not overlap bottom navigation',
    });
  }

  // 6. Nav text labels — crisp, single-line, expected English
  const labelSpans = page.locator('[data-testid="fs-overlay-nav"] [data-testid="activity-label"]');
  const count = await labelSpans.count();
  results.push({
    name: 'nav-label-count',
    pass: count === EXPECTED_NAV_LABELS.length,
    detail: `found ${count} labels, expected ${EXPECTED_NAV_LABELS.length}`,
  });

  for (let i = 0; i < count; i++) {
    const span = labelSpans.nth(i);
    const text = (await span.textContent())?.trim() ?? '';
    const box = rectFromBox(await span.boundingBox());
    const scrollWidth: number = await span.evaluate((el) => el.scrollWidth);
    const clientWidth: number = await span.evaluate((el) => el.clientWidth);
    const lineHeight: number = await span.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return parseFloat(s.lineHeight) || 16;
    });

    const expected = EXPECTED_NAV_LABELS[i];
    const textOk = text === expected;
    const notClipped = scrollWidth <= clientWidth + 2;
    const singleLine = box ? box.height <= lineHeight * 1.6 : false;
    const noGarbled = /^[\x20-\x7E]+$/.test(text);

    results.push({
      name: `nav-label-${i + 1}-text`,
      pass: textOk && noGarbled,
      detail: `"${text}" ${textOk ? '==' : '!='} "${expected}"`,
    });
    results.push({
      name: `nav-label-${i + 1}-layout`,
      pass: notClipped && singleLine,
      detail: `scroll ${scrollWidth}px / client ${clientWidth}px, height ${box?.height.toFixed(1) ?? '?'}px`,
    });
  }

  return results;
}

function printReport(allResults: Map<string, CheckResult[]>): boolean {
  let totalPass = 0;
  let totalFail = 0;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  BabyArtist Fullscreen Layout Verification');
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
      });
      const page = await context.newPage();
      try {
        const results = await runViewportChecks(page, vp);
        allResults.set(vp.id, results);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        allResults.set(vp.id, [{ name: 'viewport-run', pass: false, detail: message }]);
      } finally {
        await context.close();
      }
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
