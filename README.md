# Finance Tracker

A static, private household finance cockpit that combines Google Sheet clarity with app automation for daily spending, monthly reconciliation, and savings vault progress.

## App Structure

- **Monitor**: the daily cockpit for pinned Spend items, visual monthly progress, 4-week rhythm, savings vault previews, and recent activity when it exists.
- **Quick Add**: fast transaction entry for pinned Spend items only.
- **Sheet**: the monthly worksheet for planning, reconciliation, automatic actuals, overrides, savings vaults, and CSV backup.

There is no backend, account system, database, serverless function, or third-party service dependency. Data stays in the browser through `localStorage`.

## Core Logic

- **Default Plan** is the template for future months.
- Opening a new month creates an independent **This Month** sheet copy from the current Default Plan.
- Editing This Month does not change the Default Plan or other months.
- **Apply Default to This Month** replaces only the selected month.
- **Set This Month as Future Default** copies the selected month into the Default Plan for future uncreated months.
- Plans are made from categories and items across Income, Spend, Debt, Save, and Investment.
- The Sheet view shows compact worksheet sections with Item, Plan, Actual, and Mode.
- Unpinned items default Actual = Plan unless an Actual Override is set.
- Pinned Spend items use transactions for Actual and appear in Monitor and Quick Add.
- Save items can become Savings Vaults with manually maintained current balance, optional target, and monthly planned contribution.
- Balance Plan handles both surplus and deficit through Save items.
- Amount fields support plain numbers or safe arithmetic formulas such as `2000+682+113` or `=(750+150)/4`.

## Data Backup

Backup is CSV-based.

Use **Sheet → Data / Backup** to:

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
