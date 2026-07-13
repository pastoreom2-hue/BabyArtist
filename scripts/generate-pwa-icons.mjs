/**
 * Generate PWA PNG icons from public/icons/icon.svg (or a branded PNG).
 *
 * Default (no args): rasterizes the SVG placeholder into:
 *   - icon-192.png, icon-512.png, icon-512-maskable.png, apple-touch-icon.png
 *
 * Replace branding:
 *   node scripts/generate-pwa-icons.mjs path/to/your-512x512-logo.png
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'public', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

const OUTPUTS = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

function readSourceImage() {
  const arg = process.argv[2];
  if (arg) {
    const abs = path.resolve(process.cwd(), arg);
    if (!fs.existsSync(abs)) {
      throw new Error(`Source icon not found: ${abs}`);
    }
    const buf = fs.readFileSync(abs);
    const ext = path.extname(abs).toLowerCase();
    const mime =
      ext === '.svg'
        ? 'image/svg+xml'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'image/png';
    return { dataUrl: `data:${mime};base64,${buf.toString('base64')}`, label: abs };
  }

  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Missing ${SVG_PATH}. Place icon.svg there first.`);
  }
  const svg = fs.readFileSync(SVG_PATH);
  return {
    dataUrl: `data:image/svg+xml;base64,${svg.toString('base64')}`,
    label: SVG_PATH,
  };
}

async function renderIcon(page, dataUrl, size, maskable) {
  const html = `<!doctype html>
<html><body style="margin:0;background:#0000">
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
const size = ${size};
const maskable = ${maskable ? 'true' : 'false'};
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  ctx.clearRect(0, 0, size, size);
  if (maskable) {
    // Safe zone ~80% center for Android adaptive icons
    const pad = size * 0.1;
    const draw = size - pad * 2;
    // Soft brand background fills full maskable canvas
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, '#fefce8');
    g.addColorStop(1, '#fde68a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, pad, pad, draw, draw);
  } else {
    ctx.drawImage(img, 0, 0, size, size);
  }
  window.__ready = true;
};
img.onerror = () => { window.__ready = 'error'; };
img.src = ${JSON.stringify(dataUrl)};
</script>
</body></html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__ready === true || window.__ready === 'error');
  const status = await page.evaluate(() => window.__ready);
  if (status === 'error') throw new Error('Failed to load source image in canvas');

  const buffer = await page.locator('canvas').screenshot({ type: 'png', omitBackground: false });
  return buffer;
}

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  const source = readSourceImage();
  console.log(`Source: ${source.label}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const out of OUTPUTS) {
      const buf = await renderIcon(page, source.dataUrl, out.size, out.maskable);
      const dest = path.join(ICONS_DIR, out.file);
      fs.writeFileSync(dest, buf);
      console.log(`Wrote ${path.relative(ROOT, dest)} (${out.size}x${out.size}${out.maskable ? ', maskable' : ''})`);
    }
  } finally {
    await browser.close();
  }

  console.log('\nDone. Replace branding anytime with:');
  console.log('  npm run icons:generate -- path/to/your-512x512-logo.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
