<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/22a16833-2c23-4e4f-8c31-152953edcab6

## Run Locally

**Important (Windows):** The app code is in the `babyartist_-kids'-creative-studio` folder.

**Option A — from parent `BabyArtist` folder:**
```bash
npm run install:app   # first time only
npm run dev
```

**Option B — from app folder:**
```bash
cd babyartist_-kids'-creative-studio
npm install
npm run dev
```

**Option C — double-click `start-dev.bat`** inside `babyartist_-kids'-creative-studio`

Open **http://localhost:3000** — you should see **Draw · Upload · Gallery** buttons in a row below the BabyArtist logo.

## Deploy (Vercel)

Production URL is set in your Vercel project dashboard. After `git push`, wait ~1–2 min and hard-refresh (Ctrl+Shift+R).
