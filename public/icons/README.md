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

## Where to place your existing logo (master source)

1. Save your logo as a **square PNG** (512×512+ recommended, transparent or solid OK).
2. Put the **master** file outside `public/` (so it is not deployed or PWA-precached):

```text
brand/logo-source.png
```

Do **not** put large source art in `public/icons/` — files over 2 MiB break the Vercel/PWA build.

3. From the app root, generate all required sizes into `public/icons/`:

```powershell
cd babyartist*
npm run icons:generate
```

Or pass an explicit path:

```powershell
npm run icons:generate -- brand/logo-source.png
```

## Tips for clean home-screen icons

- Keep important art in the **center 80%** (edges get cropped on some Android launchers).
- Prefer a simple, high-contrast mark — kids need to recognize it instantly.
- After replacing icons, rebuild / redeploy so Vercel serves the new assets.
