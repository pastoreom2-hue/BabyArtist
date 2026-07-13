/**
 * Generate PWA PNG icons from a brand logo.
 *
 * Usage:
 *   npm run icons:generate -- brand/logo-source.png
 *   npm run icons:generate
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'public', 'icons');
const BRAND_DIR = path.join(ROOT, 'brand');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

const OUTPUTS = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

function resolveSource() {
  const arg = process.argv[2];
  if (arg) {
    const abs = path.resolve(process.cwd(), arg);
    if (!fs.existsSync(abs)) throw new Error(`Source icon not found: ${abs}`);
    return abs;
  }
  const preferred = path.join(BRAND_DIR, 'logo-source.png');
  if (fs.existsSync(preferred)) return preferred;
  // Legacy path (must not stay under public/ — breaks Workbox 2 MiB limit)
  const legacy = path.join(ICONS_DIR, 'logo-source.png');
  if (fs.existsSync(legacy)) return legacy;
  if (fs.existsSync(SVG_PATH)) return SVG_PATH;
  throw new Error('No brand/logo-source.png or public/icons/icon.svg found');
}

function startStaticServer(filePath) {
  const mime = filePath.toLowerCase().endsWith('.svg')
    ? 'image/svg+xml'
    : filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')
      ? 'image/jpeg'
      : filePath.toLowerCase().endsWith('.webp')
        ? 'image/webp'
        : 'image/png';
  const body = fs.readFileSync(filePath);

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url?.startsWith('/logo')) {
      res.writeHead(200, {
        'Content-Type': mime,
        'Content-Length': body.length,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(body);
      return;
    }
    if (req.url === '/' || req.url?.startsWith('/render')) {
      const size = Number(new URL(req.url, 'http://x').searchParams.get('size') || 512);
      const maskable = new URL(req.url, 'http://x').searchParams.get('maskable') === '1';
      const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html,body{margin:0;width:${size}px;height:${size}px;background:#fff;overflow:hidden}
canvas{display:block}
</style></head>
<body>
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
(async () => {
  const size = ${size};
  const maskable = ${maskable ? 'true' : 'false'};
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('image load failed'));
    img.src = '/logo?ts=' + Date.now();
  });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const inset = maskable ? size * 0.08 : size * 0.02;
  const box = size - inset * 2;
  const scale = Math.min(box / srcW, box / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  const dx = (size - dw) / 2;
  const dy = (size - dh) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);
  window.__ready = true;
})().catch((e) => { window.__ready = 'error'; window.__err = String(e); });
</script>
</body></html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    res.writeHead(404);
    res.end('not found');
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function renderIcon(page, port, size, maskable) {
  const url = `http://127.0.0.1:${port}/render?size=${size}&maskable=${maskable ? 1 : 0}`;
  await page.setViewportSize({ width: size, height: size });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => window.__ready === true || window.__ready === 'error', null, {
    timeout: 60_000,
  });
  const status = await page.evaluate(() => ({ ready: window.__ready, err: window.__err || null }));
  if (status.ready === 'error') throw new Error(`Render failed: ${status.err}`);

  const dataUrl = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64, 'base64');
}

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  const sourcePath = resolveSource();
  console.log(`Source: ${sourcePath}`);

  const { server, port } = await startStaticServer(sourcePath);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const out of OUTPUTS) {
      const buf = await renderIcon(page, port, out.size, out.maskable);
      if (buf.length < 8000) {
        throw new Error(`Suspiciously small output for ${out.file}: ${buf.length} bytes`);
      }
      const dest = path.join(ICONS_DIR, out.file);
      fs.writeFileSync(dest, buf);
      console.log(
        `Wrote ${path.relative(ROOT, dest)} (${out.size}x${out.size}${out.maskable ? ', maskable' : ''}, ${buf.length} bytes)`,
      );
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
