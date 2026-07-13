# BabyArtist PWA Icons

Put your brand logo here. The install icon on phones comes from these files.

## Required files

| File | Size | Used by |
|------|------|---------|
| `icon-192.png` | 192×192 | Android / Chrome |
| `icon-512.png` | 512×512 | Android / Chrome (Install prompt) |
| `icon-512-maskable.png` | 512×512 | Android adaptive icon (safe padding) |
| `apple-touch-icon.png` | 180×180 | iPhone / iPad Safari |
| `icon.svg` | vector | Source artwork (optional) |

## Where to place your existing 512×512 logo

1. Save your logo as a **square PNG** (512×512 recommended, transparent or solid OK).
2. Copy it into this folder, e.g.:

```text
public/icons/logo-source.png
```

3. From the app root, generate all required sizes:

```powershell
cd babyartist*
npm run icons:generate -- public/icons/logo-source.png
```

Or generate from the built-in SVG placeholder:

```powershell
npm run icons:generate
```

## Tips for clean home-screen icons

- Keep important art in the **center 80%** (edges get cropped on some Android launchers).
- Prefer a simple, high-contrast mark — kids need to recognize it instantly.
- After replacing icons, rebuild / redeploy so Vercel serves the new assets.
