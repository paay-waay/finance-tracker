# Changelog

## 2026-05-02 · V3.5.4 Mobile Layout Repair

- Repaired mobile header controls so the month chip no longer overlaps with planning state labels.
- Made the Default Plan / selected month switch responsive, full-width, and safe on narrow screens.
- Tightened Planning and Monitor card headers with mobile-first wrapping and `min-width: 0` safeguards.
- Reworked compact row tables and row action menus so detail sheets do not overflow on iPhone-sized screens.
- Added narrow-screen fallbacks for summary strips, category grids, vault cards, and pinned Spend cards.
- Updated service worker cache to `finance-tracker-cache-v3-5-4`.

## 2026-05-02 · V3.5.3 Premium Signal System

- Refined the visual system around warm ivory, near-black, graphite, muted gold, and restrained clay signal colors.
- Changed status pills toward small signal-dot labels instead of tinted badges.
- Reworked Monitor card state treatment to use subtle top lines, borders, and rhythm colors rather than large colored surfaces.
- Reduced default shadows and color fills across ordinary cards while preserving depth for sheets, navigation, and gold vault moments.
- Tuned Allocation Map, category accents, weekly rhythm, and danger states into a quieter private-wealth visual language.
- Updated service worker cache to `finance-tracker-cache-v3-5-3`.

## 2026-05-02 · V3.5.2 Daily Cockpit Cleanup

- Hid the Monitor plan status card when the monthly plan is already balanced, keeping attention on pinned Spend cards.
- Added a hard six-item cap for pinned Spend items so Monitor remains a 4-6 card daily cockpit.
- Moved Plan actions behind a compact overflow button and renamed user-facing planning language from blocks/rows/year plan toward categories/items/default plan.
- Hid empty Savings Vault and Recent Activity sections on Monitor to reduce zero-state noise.
- Collapsed advanced category actions and Actual Override behind secondary controls inside item detail.
- Made Planning category overview cards more visual-first by leading with category state and proportion bars instead of large totals.
- Updated service worker cache to `finance-tracker-cache-v3-5-2`.

## 2026-05-02 · V3.5.1 Visual Noise Cleanup

- Reduced Monitor card default text and moved pressure notes, exact weekly numbers, and transaction detail behind tap-to-expand details.
- Replaced the single weekly pace bar with a restrained 4-segment weekly rhythm indicator on each pinned Spend card.
- Simplified the Monitor summary strip and hid zero-gap / zero-spend noise where it does not help the opening view.
- Added a `+X more pinned items` entry so pinned Spend rows beyond the first six are discoverable in a sheet.
- Clarified Savings Vault wording around monthly plan, manually maintained balance, target, and remaining amount.
- Updated README for the V3 planning model, CSV backup, `financeTracker_v3` storage key, and current Monitor / Quick Add / Planning structure.
- Updated service worker cache to `finance-tracker-cache-v3-5-1`.

## 2026-05-01 · V3.5.0 Visual Monitor + Savings Dashboard

- Rebuilt Monitor around visual pinned Spend cards with progress bars, remaining budget, pressure status, and expandable transaction detail.
- Added Savings Vaults powered by Save rows, including current balance, target, progress, remaining-to-target, and muted gold vault styling.
- Replaced Allocate Gap with Balance Plan, supporting both surplus allocation into Save rows and shortage reduction from Save rows.
- Added a visual Planning Allocation Map with Spend, Debt, Save, Investment, unallocated, and overallocated segments.
- Extended CSV and row editing to preserve Savings Vault fields; updated service worker cache to `finance-tracker-cache-v3-5-0`.

## 2026-05-01 · V3.4.0 Premium Planning System

- Migrated planning data into `yearPlan.blocks` plus independent monthly plan records with per-month actual overrides.
- Added frequency-aware rows with monthly and biweekly conversion while preserving formula input text.
- Replaced row tracking internals with the user-facing `Pin to Monitor` toggle; pinned rows appear in Monitor and Quick Add, unpinned rows use Plan as Actual.
- Added per-month Actual Override sheets, Apply Year Plan to This Month, Set as Future Default, Allocate Gap, and Paste Rows.
- Grouped Planning blocks into restrained Income, Spend, Debt, Save, and Investment sections with premium compact strips.
- Updated service worker cache version to `finance-tracker-cache-v3-4-0`.

## 2026-05-01 · V3.3.4 Premium UI Restyle

- Restyled the app with a restrained black, ivory, graphite, and muted gold visual system inspired by private wealth dashboards.
- Replaced the large Monitor status and summary cards with compact status and metric strips.
- Reduced typography weight, card radius, status color intensity, and button/nav bulk across the app.
- Refined block strips, row tables, sheets, and activity rows toward a quieter premium account-list feel.
- Updated service worker cache version to `finance-tracker-cache-v3-3-4`.

## 2026-05-01 · V3.3.3 Year Plan Template

- Split planning into a shared Year Plan template plus independent monthly copies that are created only when a month is first opened.
- Replaced the broad plan editor with compact block strips and focused block detail sheets, keeping row entry inside the current block.
- Added an explicit `Update Year Plan from This Month` action so future uncreated months can inherit the current month's refined plan without rewriting existing months.
- Kept formula-capable amount inputs across rows and transactions while preserving original formula text and calculated numeric values.
- Updated service worker cache version to `finance-tracker-cache-v3-3-3`.

## 2026-05-01 · V3.3.1 Formula Inputs

- Added safe formula-capable amount inputs for plan rows, row edits, and Quick Add transactions.
- Preserved original formula strings as `monthlyAmountInput` / `amountInput` while storing calculated numeric values rounded to two decimals.
- Added live calculated previews and invalid formula blocking without using `eval()`.
- Extended CSV export/import with formula input columns and updated service worker cache to `finance-tracker-cache-v3-3-1`.

## 2026-05-01 · V3.3.0 Monthly Plan Sheet

- Replaced the guided setup wizard with a single compact Monthly Plan Sheet made of Blocks and Rows.
- Added the Debt block type and updated the allocation equation to include Spend, Debt, Save, and Investment against Income.
- Simplified row creation to item name plus plan amount, with Actual calculated from transactions where applicable.
- Changed Quick Add to show only rows inside Spend blocks, keeping Debt, Save, Investment, and Income out of daily spending entry.
- Kept the under-$10 Add to Savings helper, now allocating small gaps into a Save block row named Rounding Buffer, and updated service worker cache to `finance-tracker-cache-v3-3-0`.

## 2026-05-01 · V3.2.1 Free-form Monthly Allocation Planner

- Reworked the planning model into free-form monthly projects/envelopes with `income`, `spend`, `save`, and `investment` project types.
- Changed transactions to reference recordable sub-items, while weekly tracking focuses on recordable spend items by default.
- Added the allocation equation: income minus spend/save/investment allocation, with Balanced, Unallocated, and Overallocated setup states.
- Added the Almost Balanced helper for small unallocated balances under $10, with one-tap allocation into a Savings / Rounding Buffer sub-item.
- Updated Monitor and CSV backup around projects, sub-items, and transaction records; updated service worker cache to `finance-tracker-cache-v3-2-1`.

## 2026-05-01 · V3.2.0 Envelope Budget Setup

- Rebuilt the user-facing budget model around income sources, budget groups, subcategories, and transactions recorded against subcategories.
- Added a guided Monthly Setup sheet with Income, Groups, Subcategories, Allocation Check, and Finish steps.
- Added allocation status: Balanced, Unallocated, and Overallocated, with setup completion allowed only when income equals allocated budget.
- Reworked Monitor into envelope group cards with weekly/monthly totals, month remaining, and subcategory progress bars.
- Updated CSV import/export for `income_source`, `budget_group`, `subcategory`, and `transaction` records; migrated existing V3.1.1 data into the new envelope model where possible.
- Removed weekly close / penalty UI from the main experience and updated service worker cache to `finance-tracker-cache-v3-2-0`.

## 2026-04-30 · V3.1.1 UX Polish

- Suppressed empty Monitor $0 / $0 status, Weekly Close, and Month Outlook when no monitor categories exist; the header now shows Setup.
- Kept Weekly Close compact in every state unless Details is opened manually.
- Changed Planning into cleaner entry tiles with only a lightweight Month Setup reminder when incomplete.
- Moved Add Category and Add Vault into dedicated sheets, added Quick Add return flow, and clarified pinned vault expectations.
- Added CSV import preview, sample CSV download, folded About details, lighter card shadows, and updated service worker cache to `finance-tracker-cache-v3-1-1`.

## 2026-04-30 · V3.1 Planning Sheets + CSV Backup + Compact Weekly Close

- Changed Planning from long accordion sections into status tiles that open dedicated setup sheets for Budget, Reserve, Background, Month Setup, and Data Center.
- Replaced the large Weekly Close card with a compact workflow strip and expandable penalty details.
- Made CSV the primary backup format with full-state CSV export/import and automatic Month Setup backup completion after export.
- Clarified Add Category presets, Reserve Vault setup, unpinned vault empty states, and Month Setup checklist semantics.
- Removed main JSON backup controls, compatibility wording, and header version/eyebrow DOM; updated service worker cache to `finance-tracker-cache-v3-1`.

## 2026-04-30 · V3.0.0 Empty-State Vault Finance OS

- Promoted the tracker to a clean formal V3 app with the new `financeTracker_v3` storage key and no legacy migration or demo defaults.
- Replaced reserve runway/projection logic with user-defined Reserve Vaults, including vault notes, targets, pinned Monitor previews, and vault management.
- Rebuilt fresh empty states for Monitor, Planning, Quick Add, categories, vaults, background data, and activity.
- Converted Month Setup into a four-step checklist ritual and kept Planning Summary as 2x2 status navigation.
- Added mobile zoom locking, updated the visible app version, and updated the service worker cache to `finance-tracker-cache-v3-0-0`.

## 2026-04-29 · v13.3 Workflow Simplification + Review Rituals

- Reworked Weekly Impact into a scoped weekly close workflow with in-progress, ready, closed, reopen, and last-week reminder states.
- Added Month Outlook for Month scope so monthly trend review no longer shows weekly close controls.
- Added a lightweight Month Setup review ritual with reviewed/backup status, and moved legacy reserve ledger into Data / Compatibility.
- Simplified Planning Summary into status navigation tiles and reduced Monitor card default detail density with expandable card details.
- Renamed Recent to Recent Activity, clarified View / Edit transaction management, and updated service worker cache to `finance-tracker-cache-v13-3`.

## 2026-04-29 · v13.2.1 Stability + True Dynamic Discipline

- Converted weekly close carryover from hardcoded entertainment/misc fields to dynamic `categoryPenalties` maps for all penalty-rule categories.
- Added compatibility migration for old `entertainmentPenalty` / `miscPenalty` adjustment and closure records.
- Decoupled category display group from rule type, with dedicated track-only behavior that does not trigger warnings, freeze states, or penalties.
- Split Reserve Vault total from Reserve Runway balance so `includeInRunway` now affects runway calculations correctly.
- Added a reserve projection anchor month and year-aware Sep/Jan projection labels so reserve projections no longer shift when the spending month changes.
- Updated service worker cache version to `finance-tracker-cache-v13-2-1`.

## 2026-04-29 · v13.2 Flexible Reserve Engine

- Added config-driven Reserve Vault accounts and projection events while preserving the existing storage key and legacy reserve fields.
- Migrated reserve calculations so runway, vault total, and Sep/Jan projections now read from active reserve accounts and projection events by default.
- Reworked Planning Reserve into account and event summaries with dedicated manage sheets, while downgrading the old reserve ledger into a legacy compatibility section.
- Kept the legacy reserve ledger and recalculation path intact, with recalculation now updating the primary cash reserve account.
- Updated service worker cache version to `finance-tracker-cache-v13-2`.

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
