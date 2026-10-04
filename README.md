# VEWU Finance

iPhone-first, local-first household finance PWA for an October–December 2026 pilot. React, TypeScript and Vite. Liquid Glass is approximated with CSS materials and interruptible Motion springs; this is a web app, not a native SwiftUI renderer.

## Use

Open the deployed site in Safari, add it to the Home Screen, then import your private starting JSON from Files. Import into the installed app you intend to use. Browser profiles, devices and origins have separate local storage; there is no automatic synchronization.

- **本月**: Plan versus Actual, remaining daily budget, income and saving. Unconfirmed amounts explicitly use Plan until confirmed.
- **记账**: add, search, filter, edit, delete and undo transactions. A refund is a negative amount assigned to its original category and source.
- **资金**: rolling General, Travel, Pet and Irregular balances; MV Savings remains separate.
- **月结**: verify income, fixed expenses, transactions and asset balances; close sequentially and export. Correcting an earlier month reopens it and all following months while retaining prior snapshots.

Amounts are integer CAD cents. MV income above the 2,000 baseline goes entirely to Savings. Positive surplus uses editable monthly allocations, initially 70% General / 30% Travel. Cent remainders are allocated deterministically so shares total exactly. Negative surplus goes to General. Funded transactions are excluded from ordinary category spending. Investments use a monthly plan of 65 × 26 ÷ 12, rounded to cents in the private initial ledger.

## Monthly Google Sheets archive

1. Reconcile and close the month. Download the ZIP and confirm it exists in Files.
2. Unzip the report `.xlsx`, complete-quarter `App Import.csv`, and restorable `.json` backup.
3. On a computer, open the existing workbook and select **App Import**.
4. File → Import → Upload the CSV → **Replace current sheet**. Never choose “Replace spreadsheet” or append. Keep conversion of text to numbers enabled.
5. Verify Oct, Nov, Dec and the quarter summary; all reconciliation differences must be zero. Confirm manual archival in the app.

The CSV is a complete replacement snapshot. Importing the same snapshot again does not append transactions. A correction requires a new snapshot. The app's “archived” state is a user confirmation, not an online verification. Historical May–September and earlier tabs are outside the app's write scope. The app itself has no Google credentials or API access.

The prepared workbook supports 10,000 transaction display rows per month. If exceeding that during a future expansion, extend the view sheets before importing. This pilot is intentionally limited to three months.

## Privacy and recovery

IndexedDB stores the ledger on the device. No analytics, third-party fonts, remote financial API or backend is used. The service worker caches only application assets and never deletes the ledger during updates. Export a JSON backup regularly: deleting website data, using private browsing, device loss or browser eviction can remove local data. ZIP/JSON/CSV/XLSX files contain private financial information; keep them outside this public repository. `.private/` is ignored and excluded from the Vite public assets.

## Development and deployment

```sh
npm ci
npm run dev
npm test
npm run build
```

GitHub Settings → Pages → Source: **GitHub Actions**. The included workflow tests, builds and publishes `dist`. Relative asset paths support a project Pages URL. The app prompts before activating a new service worker version.

Tests cover savings isolation, funded spending/refunds, exact-cent allocations, sequential closing, correction roll-forward, invalid imports, duplicate snapshots, CSV escaping and ZIP/XLSX round-trips. Physical iPhone keyboard, VoiceOver and Home Screen behavior still require device acceptance testing.

Design references: [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials), [iPhone user guide](https://support.apple.com/guide/iphone/whats-new-in-ios-27-iphfed2c4091/27/ios/27).
