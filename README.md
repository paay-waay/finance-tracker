# Finance Tracker

Household Cashflow Operating System for GitHub Pages.

## What this app does

Finance Tracker is a static, private-use household cashflow dashboard. It focuses on three questions:

1. Is reserve still safe?
2. Is this week's variable spending under control?
3. If nothing changes, what happens by September and January?

The app keeps all data in browser `localStorage` and uses a three-tab structure:

- `Home`: reserve hero, projections, variable pace, weekly discipline
- `Transactions`: only four variable categories
- `Settings`: reserve schedule, budgets, background data, import/export/reset

There is no backend, login system, database, serverless function, third-party deployment platform, or paid service dependency.

## Local development

This repository is a plain static site. No build system is required.

Open `index.html` directly, or serve the folder with any local static server:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173/`.

## Build

No build step is required. The repository root is the deployable site.

If a future version adds a build tool, keep GitHub Pages output compatible with the project path:

```text
/finance-tracker/
```

## GitHub Pages deployment

Repository name: `finance-tracker`

Final URL:

```text
https://paay-waay.github.io/finance-tracker/
```

GitHub Pages source options:

### A. Deploy from branch

1. Commit these files to the repository root.
2. Go to GitHub repository **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select `main` and `/root`.
5. Save and wait for Pages to publish.

### B. GitHub Actions

This static version does not require Actions. If a future build step is introduced, deploy the generated output directory with GitHub Pages official Actions.

## iPhone usage

1. Open `https://paay-waay.github.io/finance-tracker/` in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Open the installed app from the iPhone home screen.

The PWA manifest uses `/finance-tracker/` as both `start_url` and `scope`.

## Data backup

All tracker data is stored locally in the browser. Export backups regularly.

- Use **Settings → Export JSON** for full restore backups.
- Restore after Safari data loss by importing JSON.
- Current primary storage key: `financeCashflowOS_v11`
- Compatible legacy keys: `financePlanner_v2`, `finance-box-budget-v3`

## Troubleshooting

- Blank page: check that all paths use the `/finance-tracker/` GitHub Pages project path.
- Old version showing: service worker cache is still active. Refresh, clear Safari website data, or remove/re-add the home-screen app.
- Missing icon: check `manifest.json`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` paths.
- Data missing: Safari website data may have been cleared. Restore with **Import JSON**.
- Repository renamed: update `manifest.json` `start_url`/`scope`, `sw.js` `BASE_PATH`, icon paths, and this README.
