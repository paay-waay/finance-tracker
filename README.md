# Finance Tracker

A static, private household finance PWA for visual monthly planning, daily spending control, and savings progress.

## App Structure

Finance Tracker has three main surfaces:

- **Monitor**: visual pinned spending cards, savings vaults, recent activity, and compact plan status.
- **Quick Add**: fast transaction entry for pinned Spend rows only.
- **Planning**: Year Plan / Monthly Plan setup, allocation map, category overview cards, Balance Plan, CSV backup, and data tools.

There is no backend, account system, database, serverless function, or third-party service dependency. Data stays in the browser through `localStorage`.

## Core Logic

- **Year Plan** is the default monthly template.
- Opening a new month creates an independent **Monthly Plan** copy from the current Year Plan.
- Editing a Monthly Plan does not change Year Plan or other months.
- **Apply Year Plan to This Month** replaces only the selected month.
- **Set as Future Default** copies the selected month back into Year Plan for future uncreated months.
- Each plan is built from Blocks and Rows: Income, Spend, Debt, Save, and Investment.
- **Pinned Spend rows** appear in Monitor and Quick Add.
- **Unpinned rows** default Actual = Plan unless an Actual Override is set.
- **Save rows** can be shown as Savings Vaults with a manually maintained balance, optional target, and monthly planned contribution.
- **Balance Plan** handles both surplus and deficit through Save rows.
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
