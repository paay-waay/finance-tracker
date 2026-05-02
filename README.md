# Finance Tracker

A static, private household money cockpit for visual daily spending control, savings vault progress, and lightweight monthly planning.

## App Structure

- **Monitor**: the daily cockpit with 4-6 pinned Spend cards, visual weekly rhythm, savings vaults, and recent activity when it exists.
- **Quick Add**: fast transaction entry for pinned Spend items only.
- **Planning**: Default Plan / This Month setup, allocation map, category overview cards, Balance Plan, CSV backup, and low-frequency data tools.

There is no backend, account system, database, serverless function, or third-party service dependency. Data stays in the browser through `localStorage`.

## Core Logic

- **Default Plan** is the template for future months.
- Opening a new month creates an independent **Monthly Plan** copy from the current Default Plan.
- Editing a Monthly Plan does not change the Default Plan or other months.
- **Reset This Month from Default** replaces only the selected month.
- **Use This Month as Default** copies the selected month into the Default Plan for future uncreated months.
- Plans are made from categories and items across Income, Spend, Debt, Save, and Investment.
- Only pinned Spend items appear in Monitor and Quick Add.
- Monitor is intentionally capped at 6 pinned Spend items.
- Unpinned items default Actual = Plan unless an Actual Override is set.
- Save items can be shown as Savings Vaults with a manually maintained balance, optional target, and monthly planned contribution.
- Balance Plan handles both surplus and deficit through Save items.
- Amount fields support plain numbers or safe arithmetic formulas such as `2000+682+113` or `=(750+150)/4`.

## Data Backup

Backup is CSV-based.

Use **Planning → Data / Backup** to:

- Export CSV
- Import CSV
- Download a sample CSV
- Reset local data

Current storage key:

```text
financeTracker_v3
```

Export CSV regularly if you use the app on Safari or as an iPhone PWA.

## Local Development

This repository is a plain static site. No build system is required.

Open `index.html` directly, or serve the folder with any local static server:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## Build

No build step is required. The repository root is the deployable site.

## GitHub Pages Deployment

Repository root is the published folder. GitHub Pages can deploy from `main / root`.

If published under the repository path, the expected app path is:

```text
/finance-tracker/
```

## iPhone Usage

1. Open the GitHub Pages URL in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Open **Finance Tracker** from the home screen.

## Troubleshooting

- Old version showing: service worker cache may still be active. Refresh, clear Safari website data, or remove/re-add the home-screen app.
- Data missing: restore from a CSV backup.
- Missing icon: check `manifest.json`, `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png`.
- Repository renamed: update `manifest.json` `start_url` / `scope`, `sw.js` `BASE_PATH`, and this README.
