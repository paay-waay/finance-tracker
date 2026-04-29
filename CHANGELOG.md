# Changelog

## 2026-04-29 · v13.1 Planning Edit Mode

- Added Budget Planning manage flows with category gear sheets, add-category flow, archive/restore support, and simple display-order management.
- Added Background Data manage flows with item gear sheets, add-section flow, add-item flow, archive/restore support, and section order management.
- Preserved dynamic Quick Add categories from active transaction-enabled monitor categories, with archived/disabled fallback protection for Repeat Last.
- Kept archived categories hidden from Monitor and Quick Add while preserving historical transaction labels.
- Updated service worker cache version to `finance-tracker-cache-v13-1`.

## 2026-04-29 · v13.0 Configurable Finance Model

- Migrated fixed four-category budgeting into config-driven `settings.monitorCategories` while preserving the existing Monitor experience.
- Migrated fixed background objects into config-driven `settings.backgroundSections` with section/item totals and legacy fallback support.
- Refactored Monitor, Quick Add, transaction rendering, and Planning budget/background rendering to read from configuration helpers instead of hardcoded category maps.
- Preserved compatibility with v12.3 and older imports through migration from legacy `budgetsMonthly` and `background` structures.
- Kept the storage key `financeCashflowOS_v11` and updated the service worker cache version to `finance-tracker-cache-v13-0`.

## 2026-04-29 · v12.3 Planning Collapse + Monitor Scope + Gold Reserve

- Added a persistent `Week | Month` monitor scope switch with separate week-end and month-end projection logic.
- Moved Monitor header controls into a more compact app-style bar with scope-aware overall status.
- Reworked Monitor cards to keep fixed category positions while switching the main number between projected week-end and projected month-end spend.
- Introduced a gold Reserve Vault identity with a gold runway meter and lightweight health pill instead of full-card warning colors.
- Rebuilt Planning into collapsed summary-first accordion cards for budgets, reserve, ledger, background data, and data tools.
- Added persistent planning section open/closed state in local storage.
- Added Quick Add last-category preselection plus Repeat Last prefilling.
- Kept Recent transactions scope-aware and preserved transaction management via bottom sheet.
- Updated service worker cache version to `finance-tracker-cache-v12-3`.

## 2026-04-29 · v12.2 Monitor Logic + Mobile UI Refinement

- Changed the weekly monitor from actual-vs-budget settlement to projected week-end pace monitoring.
- Added compact reserve hero, overall weekly status strip, and recent transactions preview on Monitor.
- Updated monitor boxes to show projected week-end spend / weekly budget with OK / Watch / Risk / Freeze states.
- Added actual fill plus projected fill to budget bars, with soft-cap and penalty zones.
- Reworked Quick Add into category chips and quick amount chips.
- Added transaction management through a bottom sheet from the Monitor recent feed.
- Refined Planning into summary, budget controls, reserve controls, folded background data, and data management.
- Updated service worker cache version to `finance-tracker-cache-v12-2`.

## 2026-04-29 · v12.1 Mobile App Layout Rewrite

- Replaced the three-tab Home / Transactions / Settings structure with Monitor / Planning plus a centered Quick Add bottom sheet.
- Rebuilt Monitor as a four-card variable spending wall for Groceries, Charging/407, Entertainment, and Misc.
- Moved reserve and budget controls into Planning, with Background Data remaining folded by default.
- Added a floating rounded bottom navigation with a prominent center add button.
- Added a half-screen Quick Add sheet that saves and returns immediately to Monitor.
- Updated service worker cache version to `finance-tracker-cache-v12-1`.

## 2026-04-28 · v12.0 Visual Dashboard Rewrite

- Rewrote Home as a visualization-first dashboard while preserving v11 state and calculations.
- Replaced the Reserve Hero with a 12-block Reserve Runway Meter.
- Replaced projection cards with a three-node reserve timeline: Now, Sep 1, Jan 1.
- Rebuilt variable category cards around budget bars with budget markers, soft-cap zones, and penalty zones.
- Reworked Weekly Discipline into a cause-and-effect impact display.
- Tightened transaction rows into a compact color-coded feed.
- Updated visible version to `v12.0 Visual Dashboard Rewrite` and service worker cache to `finance-tracker-cache-v12`.

## 2026-04-28 · v11.0 Cashflow OS Rewrite

- Rebuilt the app into a three-tab Household Cashflow Operating System: Home, Transactions, and Settings.
- Removed Home-level income, fixed, debt, investment, net worth, receivables, and generic reports breakdowns.
- Added a reserve-first Home with Reserve Hero, Projection Strip, Variable Pace Board, and Weekly Discipline Summary.
- Limited transaction capture to four variable categories only: Groceries, Charging/407, Entertainment, and Misc.
- Added migration to new storage key `financeCashflowOS_v11` with compatibility for `financePlanner_v2` and `finance-box-budget-v3`.
- Moved all non-decision background data into Settings, including editable reserve schedule, fixed, debt, income, and investment data.
- Added dynamic weekly budget logic, discretionary penalty carryover, and reopenable weekly close records.
- Corrected reserve projection stepping so `Projected Reserve @ Sep 1` and `@ Jan 1` do not count the target month twice.
- Updated service worker cache version to `finance-tracker-cache-v11-1`.

## 2026-04-24 · v10.0-github-pages

- Reorganized primary navigation into Overview, Review, Reports, and Settings.
- Moved category progress into Overview and removed standalone daily box navigation.
- Moved reserve management into Settings and long-term finance modules into Reports.
- Added Review page with weekly spending context, fastest categories, recent daily chart, and budget suggestions.
- Added Reports dashboard with year review, net worth context, receivables, and investment snapshots.
- Added Settings sections for budget setup, reserve, month end, data backup, and danger zone.
- Removed the global edit mode pattern in favor of local Manage controls.
- Added JSON export/import alongside CSV backup.
- Updated visible version to `v10.0-github-pages`.

## 2026-04-24 · GitHub-ready package

- Added GitHub Pages support files: `.nojekyll`, `.gitignore`, `README.md`, `AGENTS.md`, `CHANGELOG.md`.
- Added PWA icon files: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
- Updated `manifest.json` so the installed app name is `Finance Tracker`.
- Updated HTML metadata so Safari home screen uses `Finance Tracker` and the custom icon.
- Added/updated `sw.js` for GitHub Pages-friendly caching.
- No intentional changes were made to the app's business logic or visual layout.
