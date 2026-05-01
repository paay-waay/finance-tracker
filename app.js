const APP_VERSION = "V3.3.0 Monthly Plan Sheet";
const SCHEMA_VERSION = 6;
const STORAGE_KEY = "financeTracker_v3";

const PROJECT_TYPES = ["income", "spend", "debt", "save", "investment"];

const DEFAULT_STATE = {
  appVersion: APP_VERSION,
  schemaVersion: SCHEMA_VERSION,
  ui: {
    activeTab: "monitor",
    selectedMonth: currentMonthKey(),
    monitorScope: "week",
    txFilter: "month",
    editingTransactionId: null,
    setupComplete: false,
    expandedProjects: {},
    lastTransactionTemplate: null
  },
  settings: {
    projects: []
  },
  transactions: []
};

let state = loadState();
let toastTimer = null;
let pendingCsvImport = null;

const app = document.querySelector("#app");
const bottomNav = document.querySelector("#bottomNav");
const pageTitle = document.querySelector("#pageTitle");
const headerStatus = document.querySelector("#headerStatus");
const modalRoot = document.querySelector("#modalRoot");

init();

function init() {
  lockMobileZoom();
  bindShellEvents();
  render();
}

function lockMobileZoom() {
  const prevent = (event) => event.preventDefault();
  ["gesturestart", "gesturechange", "gestureend"].forEach((name) => document.addEventListener(name, prevent, { passive: false }));
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const now = Date.now();
    if (now - lastTouchEnd < 300) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

function bindShellEvents() {
  bottomNav.addEventListener("click", (event) => {
    if (event.target.closest("[data-quick-add]")) {
      openQuickAdd();
      return;
    }
    const tab = event.target.closest("[data-tab]");
    if (!tab) return;
    state.ui.activeTab = tab.dataset.tab;
    saveState();
    render();
  });
}

function loadState() {
  const stored = parseStored(STORAGE_KEY);
  if (!stored) return structuredClone(DEFAULT_STATE);
  return normalizeState(stored);
}

function parseStored(key) {
  try {
    const text = localStorage.getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function normalizeState(raw) {
  const input = isObject(raw) ? raw : {};
  if (Array.isArray(input.settings?.projects)) return normalizeProjectState(input);
  return migrateToProjects(input);
}

function normalizeProjectState(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.appVersion = APP_VERSION;
  next.schemaVersion = SCHEMA_VERSION;
  next.ui = { ...next.ui, ...(isObject(input.ui) ? input.ui : {}) };
  next.ui.activeTab = ["monitor", "planning"].includes(next.ui.activeTab) ? next.ui.activeTab : "monitor";
  next.ui.selectedMonth = normalizeMonthValue(next.ui.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.txFilter = ["week", "month", "all"].includes(next.ui.txFilter) ? next.ui.txFilter : next.ui.monitorScope;
  next.ui.setupComplete = Boolean(next.ui.setupComplete);
  next.ui.expandedProjects = isObject(input.ui?.expandedProjects || input.ui?.expandedGroups) ? (input.ui.expandedProjects || input.ui.expandedGroups) : {};
  next.ui.lastTransactionTemplate = normalizeTemplate(input.ui?.lastTransactionTemplate);
  next.settings.projects = input.settings.projects.map(normalizeProject).filter(Boolean).sort(byDisplayOrder);
  next.transactions = Array.isArray(input.transactions) ? input.transactions.map(normalizeTransaction).filter(Boolean) : [];
  return next;
}

function migrateToProjects(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.ui.selectedMonth = normalizeMonthValue(input.ui?.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = input.ui?.monitorScope === "month" ? "month" : "week";
  const itemMap = new Map();

  const ensureProject = (label, type) => {
    const existing = next.settings.projects.find((project) => project.label === label && project.type === type);
    if (existing) return existing;
    const project = normalizeProject({
      id: uniqueId(slugify(label), next.settings.projects.map((item) => item.id)),
      label,
      type,
      displayOrder: next.settings.projects.length + 1,
      subItems: []
    });
    next.settings.projects.push(project);
    return project;
  };

  const addItem = (project, raw, fallbackLabel, amount, recordable = false, showOnDashboard = true) => {
    const label = String(raw?.label || raw?.name || fallbackLabel || "Untitled").trim();
    const subItem = normalizeSubItem({
      id: uniqueId(slugify(label), getAllSubItems(next).map((item) => item.id)),
      parentProjectId: project.id,
      label,
      monthlyAmount: Number(raw?.monthlyAmount ?? raw?.monthlyBudget ?? raw?.amount ?? amount) || 0,
      recordable,
      showOnDashboard,
      active: raw?.active !== false,
      archived: Boolean(raw?.archived),
      displayOrder: project.subItems.length + 1
    });
    project.subItems.push(subItem);
    if (raw?.id) itemMap.set(raw.id, subItem.id);
    return subItem;
  };

  if (Array.isArray(input.settings?.incomeSources)) {
    const income = ensureProject("Income", "income");
    input.settings.incomeSources.forEach((source) => addItem(income, source, source.label, source.amount, false, true));
  }

  if (Array.isArray(input.settings?.budgetGroups)) {
    input.settings.budgetGroups.forEach((group) => {
      const project = ensureProject(group.label || startCase(group.type), mapGroupType(group.type));
      (group.subcategories || []).forEach((sub) => addItem(project, sub, sub.label, sub.monthlyBudget, Boolean(sub.recordable), sub.showOnDashboard !== false));
    });
  }

  if (Array.isArray(input.settings?.monitorCategories)) {
    const spend = ensureProject("Spend", "spend");
    input.settings.monitorCategories.forEach((category) => addItem(spend, category, category.label, category.monthlyBudget, category.allowTransactions !== false, category.monitor !== false));
  }

  if (Array.isArray(input.settings?.reserveVaults)) {
    const save = ensureProject("Savings", "save");
    input.settings.reserveVaults.forEach((vault) => addItem(save, { ...vault, label: vault.name, monthlyAmount: vault.currentAmount }, vault.name, vault.currentAmount, false, vault.includeInMonitor !== false));
  }

  if (Array.isArray(input.settings?.backgroundSections)) {
    input.settings.backgroundSections.forEach((section) => {
      const type = section.type === "income" ? "income" : mapGroupType(section.type);
      const project = ensureProject(section.label || startCase(section.type), type);
      (section.items || []).forEach((item) => addItem(project, item, item.label, monthlyEquivalent(item), false, true));
    });
  }

  next.transactions = Array.isArray(input.transactions)
    ? input.transactions.map((transaction) => normalizeTransaction({
      id: transaction.id,
      dateISO: transaction.dateISO,
      amount: transaction.amount,
      subItemId: itemMap.get(transaction.subItemId || transaction.subcategoryId || transaction.category) || transaction.subItemId || transaction.subcategoryId || transaction.category,
      note: transaction.note
    })).filter(Boolean)
    : [];
  next.ui.setupComplete = calculateAllocation(next).isReady;
  return next;
}

function normalizeProject(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("project"),
    label: label || startCase(id),
    type: normalizeProjectType(raw.type) || "spend",
    displayOrder: Number(raw.displayOrder) || 1,
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    subItems: Array.isArray(raw.subItems || raw.subcategories)
      ? (raw.subItems || raw.subcategories).map((item) => normalizeSubItem({ ...item, parentProjectId: id || raw.id })).filter(Boolean).sort(byDisplayOrder)
      : []
  };
}

function normalizeSubItem(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("item"),
    parentProjectId: String(raw.parentProjectId || raw.groupId || ""),
    label: label || startCase(id),
    monthlyAmount: Number(raw.monthlyAmount ?? raw.monthlyBudget) || 0,
    recordable: Boolean(raw.recordable),
    showOnDashboard: raw.showOnDashboard !== false,
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    displayOrder: Number(raw.displayOrder) || 1
  };
}

function normalizeTransaction(raw) {
  if (!isObject(raw)) return null;
  const amount = Number(raw.amount) || 0;
  const subItemId = String(raw.subItemId || raw.subcategoryId || raw.category || "").trim();
  const dateISO = normalizeDateValue(raw.dateISO || raw.date);
  if (!amount || !subItemId || !dateISO) return null;
  return { id: String(raw.id || uid("txn")), dateISO, amount, subItemId, note: String(raw.note || "").trim() };
}

function normalizeTemplate(raw) {
  if (!isObject(raw)) return null;
  return { amount: Number(raw.amount) || 0, subItemId: String(raw.subItemId || raw.subcategoryId || ""), note: String(raw.note || "").trim() };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  pageTitle.textContent = state.ui.activeTab === "planning" ? "Planning" : "Monitor";
  renderHeaderControls();
  renderHeaderStatus();
  renderNav();
  app.innerHTML = state.ui.activeTab === "planning" ? renderPlanningPage() : renderMonitorPage();
  bindPageEvents();
}

function renderHeaderControls() {
  const controls = document.querySelector(".topbar-controls");
  controls.innerHTML = `
    <label class="month-field month-chip">
      <span>Month</span>
      <input id="monthInputLive" type="month" value="${state.ui.selectedMonth}" />
    </label>
    ${state.ui.activeTab === "monitor" ? renderScopeSwitch() : ""}
  `;
  controls.querySelector("#monthInputLive")?.addEventListener("change", (event) => {
    state.ui.selectedMonth = normalizeMonthValue(event.target.value) || currentMonthKey();
    saveState();
    render();
  });
}

function renderHeaderStatus() {
  const allocation = calculateAllocation();
  headerStatus.className = `header-status-pill ${allocation.isReady ? "safe" : allocation.status === "overallocated" ? "freeze" : "neutral"}`;
  headerStatus.textContent = state.ui.activeTab === "planning" ? "Plan" : allocation.displayLabel;
}

function renderScopeSwitch() {
  return `
    <div class="scope-switch" role="tablist" aria-label="Monitor scope">
      <button class="scope-button ${state.ui.monitorScope === "week" ? "is-active" : ""}" type="button" data-scope="week">Week</button>
      <button class="scope-button ${state.ui.monitorScope === "month" ? "is-active" : ""}" type="button" data-scope="month">Month</button>
    </div>
  `;
}

function renderNav() {
  bottomNav.innerHTML = `
    <button class="tab-button ${state.ui.activeTab === "monitor" ? "is-active" : ""}" type="button" data-tab="monitor">Monitor</button>
    <button class="quick-add-button" type="button" data-quick-add aria-label="Quick Add">+</button>
    <button class="tab-button ${state.ui.activeTab === "planning" ? "is-active" : ""}" type="button" data-tab="planning">Planning</button>
  `;
}

function bindPageEvents() {
  document.querySelectorAll("[data-scope]").forEach((button) => button.addEventListener("click", () => {
    state.ui.monitorScope = button.dataset.scope === "month" ? "month" : "week";
    saveState();
    render();
  }));
  document.querySelectorAll("[data-open-setup]").forEach((button) => button.addEventListener("click", () => openSetupSheet(button.dataset.openSetup || "projects")));
  document.querySelectorAll("[data-open-data]").forEach((button) => button.addEventListener("click", openDataCenter));
  document.querySelectorAll("[data-toggle-project]").forEach((button) => button.addEventListener("click", () => {
    state.ui.expandedProjects[button.dataset.toggleProject] = !state.ui.expandedProjects[button.dataset.toggleProject];
    saveState();
    render();
  }));
  document.querySelectorAll("[data-manage-transactions]").forEach((button) => button.addEventListener("click", openTransactionsManager));
  document.querySelector("[data-add-rounding-buffer]")?.addEventListener("click", addUnallocatedToSavings);
}

function renderMonitorPage() {
  const allocation = calculateAllocation();
  const tracked = getDashboardProjects();
  return `
    <section class="page monitor-page">
      ${renderAllocationStatusCard(allocation)}
      ${tracked.length ? renderDashboardSummary() : renderMonitorEmpty()}
      ${tracked.length ? `<section class="group-dashboard">${tracked.map(renderProjectCard).join("")}</section>` : ""}
      ${renderRecentActivity()}
    </section>
  `;
}

function renderPlanningPage() {
  const allocation = calculateAllocation();
  return `
    <section class="page planning-page">
      <article class="planning-card monthly-setup-card ${allocation.isReady ? "balanced" : allocation.status}">
        <div class="planning-accordion-head">
          <div><p class="section-kicker">Monthly plan</p><h2>Monthly Allocation Setup</h2></div>
          <span class="header-status-pill ${allocation.isReady ? "safe" : allocation.status === "overallocated" ? "freeze" : "neutral"}">${escapeHtml(allocation.displayLabel)}</span>
        </div>
        ${renderAllocationMetrics(allocation)}
        ${renderAlmostBalancedHelper(allocation)}
        <p class="settings-note">${escapeHtml(allocation.message)}</p>
        <button class="action-button" type="button" data-open-setup>${allocation.isReady ? "Edit Plan" : "Continue Setup"}</button>
      </article>
      <article class="planning-card is-weak data-center-card">
        <div class="planning-accordion-head">
          <div><p class="section-kicker">CSV Backup</p><h2>Data Center</h2></div>
          <button class="mini-button" type="button" data-open-data>Open</button>
        </div>
        <div class="accordion-inline-summary"><strong>CSV import / export</strong><span>Backup and restore monthly allocations.</span></div>
      </article>
    </section>
  `;
}

function renderAllocationStatusCard(allocation) {
  return `
    <section class="setup-status-card ${allocation.isReady ? "balanced" : allocation.status}">
      <div>
        <p class="section-kicker">Setup status</p>
        <h2>${escapeHtml(allocation.displayLabel)}</h2>
        <span>${escapeHtml(allocation.message)}</span>
      </div>
      <button class="action-button" type="button" data-open-setup>${allocation.isReady ? "Edit Plan" : "Continue Setup"}</button>
    </section>
  `;
}

function renderAllocationMetrics(allocation) {
  return `
    <div class="setup-metrics allocation-metrics">
      <div><span>Total Income</span><strong>${money(allocation.income)}</strong></div>
      <div><span>Total Spend</span><strong>${money(allocation.spend)}</strong></div>
      <div><span>Total Debt</span><strong>${money(allocation.debt)}</strong></div>
      <div><span>Total Save</span><strong>${money(allocation.save)}</strong></div>
      <div><span>Total Investment</span><strong>${money(allocation.investment)}</strong></div>
      <div><span>Total Allocation</span><strong>${money(allocation.allocation)}</strong></div>
      <div><span>Gap</span><strong>${money(allocation.difference)}</strong></div>
    </div>
  `;
}

function renderAlmostBalancedHelper(allocation) {
  if (!(allocation.difference > 0 && allocation.difference < 10)) return "";
  return `
    <div class="notice-strip success almost-balanced-helper">
      <span>${money(allocation.difference)} left unallocated. Add to Savings?</span>
      <button class="action-button" type="button" data-add-rounding-buffer>Add to Savings</button>
    </div>
  `;
}

function renderDashboardSummary() {
  const totals = calculateDashboardTotals();
  return `
    <section class="dashboard-summary">
      <div><span>Setup</span><strong>${escapeHtml(calculateAllocation().label)}</strong></div>
      <div><span>This week spent</span><strong>${money(totals.weekSpent)}</strong></div>
      <div><span>This month spent</span><strong>${money(totals.monthSpent)}</strong></div>
      <div><span>Month remaining</span><strong>${money(totals.monthRemaining)}</strong></div>
    </section>
  `;
}

function renderMonitorEmpty() {
  return `
    <section class="empty-state hero-empty">
      <strong>No dashboard items yet.</strong>
      <span>Create blocks and rows in your monthly plan.</span>
      <button class="action-button" type="button" data-open-setup>Open Monthly Plan</button>
    </section>
  `;
}

function renderProjectCard(project) {
  const stats = calculateProjectStats(project.id);
  const expanded = state.ui.expandedProjects[project.id] !== false;
  const items = project.subItems.filter((item) => item.active && !item.archived && item.showOnDashboard);
  return `
    <article class="group-card">
      <button class="group-card-head" type="button" data-toggle-project="${project.id}">
        <span><strong>${escapeHtml(project.label)}</strong><em>${escapeHtml(startCase(project.type))}</em></span>
        <b>${money(stats.spent)} / ${money(stats.budget)}</b>
      </button>
      <div class="group-meta"><span>Remaining ${money(stats.remaining)}</span><span>${items.length} rows</span></div>
      ${expanded ? `<div class="subcategory-list">${items.map((item) => renderSubItemProgress(project, item)).join("")}</div>` : ""}
    </article>
  `;
}

function renderSubItemProgress(project, item) {
  const stats = calculateSubItemStats(item.id);
  const percent = item.monthlyAmount ? stats.monthSpent / item.monthlyAmount * 100 : 0;
  const weekly = project.type === "spend" && item.recordable
    ? `${money(stats.weekSpent)} this week · ${money(stats.weekRemaining)} left this week · ${money(stats.monthRemaining)} left this month`
    : `${money(stats.monthRemaining)} remaining`;
  return `
    <div class="subcategory-progress">
      <div><strong>${escapeHtml(item.label)}</strong><span>${money(stats.monthSpent)} / ${money(item.monthlyAmount)}</span></div>
      <div class="budget-bar"><div class="budget-fill" style="width:${clampPercent(percent)}%"></div></div>
      <small>${weekly}</small>
    </div>
  `;
}

function renderRecentActivity() {
  const recent = getScopedTransactions().slice(0, 5);
  return `
    <section class="recent-preview">
      <div class="recent-head">
        <h2>Recent Activity</h2>
        <button class="mini-button" type="button" data-manage-transactions>View / Edit Activity</button>
      </div>
      <div class="recent-feed">${recent.length ? recent.map(renderRecentTransaction).join("") : `<div class="empty-state">No activity yet. Add your first entry with +.</div>`}</div>
    </section>
  `;
}

function renderRecentTransaction(transaction) {
  return `<div class="recent-item"><span>${escapeHtml(getSubItemLabel(transaction.subItemId))}</span><strong>${money(transaction.amount)}</strong><em>${formatDate(transaction.dateISO)}</em></div>`;
}

function openQuickAdd() {
  modalRoot.innerHTML = renderQuickAddSheet();
  bindSheetEvents();
  requestAnimationFrame(() => modalRoot.querySelector("input[name='amount']")?.focus());
}

function renderQuickAddSheet() {
  const items = getRecordableItems();
  const editing = getEditingTransaction();
  if (!items.length && !editing) {
    return renderSheet("Quick Add", `
      <div class="empty-state">
        <strong>Create a Spend row first.</strong>
        <span>Quick Add only records against rows inside Spend blocks.</span>
        <button class="action-button" type="button" data-open-setup>Open Monthly Plan</button>
      </div>
    `, "Entry");
  }
  const template = state.ui.lastTransactionTemplate;
  const selected = editing?.subItemId || (template && items.some((item) => item.id === template.subItemId) ? template.subItemId : items[0]?.id);
  return renderSheet(editing ? "Edit Entry" : "Quick Add", `
    <form id="transactionForm" class="quick-form">
      <input name="id" type="hidden" value="${escapeHtml(editing?.id || "")}" />
      <label class="amount-field"><span>Amount</span><input name="amount" type="number" inputmode="decimal" step="0.01" min="0" value="${editing?.amount || ""}" required /></label>
      <input name="subItemId" type="hidden" value="${escapeHtml(selected)}" />
      <div class="category-chip-grid">${items.map((item) => `<button class="category-chip ${item.id === selected ? "is-active" : ""}" type="button" data-item-chip="${item.id}">${escapeHtml(item.label)}</button>`).join("")}</div>
      <label class="field"><span>Date</span><input name="dateISO" type="date" value="${escapeHtml(editing?.dateISO || defaultDateForMonth(state.ui.selectedMonth))}" required /></label>
      <label class="field"><span>Note</span><input name="note" type="text" value="${escapeHtml(editing?.note || "")}" placeholder="Optional note" /></label>
      <button class="action-button sheet-save" type="submit">${editing ? "Save Entry" : "Add Entry"}</button>
    </form>
  `, "Entry");
}

function openSetupSheet() {
  modalRoot.innerHTML = renderSetupSheet();
  bindSheetEvents();
}

function renderSetupSheet() {
  const allocation = calculateAllocation();
  return renderSheet("Monthly Plan Sheet", `
    ${renderAllocationMetrics(allocation)}
    ${renderAlmostBalancedHelper(allocation)}
    <div class="notice-strip ${allocation.isReady ? "success" : allocation.status === "overallocated" ? "danger" : "warning"}">${escapeHtml(allocation.message)}</div>
    ${renderMonthlyPlanSheet()}
    <form id="projectForm" class="quick-form inline-form">
      <div class="section-head"><h3>Add Block</h3><span class="tiny-label">Required type</span></div>
      <label class="field"><span>Block Name</span><input name="label" required /></label>
      <label class="field"><span>Type</span><select name="type">${PROJECT_TYPES.map((type) => `<option value="${type}">${escapeHtml(blockTypeLabel(type))}</option>`).join("")}</select></label>
      <button class="action-button" type="submit">Add Block</button>
    </form>
    <div class="button-row">
      <button class="action-button" type="button" data-finish-setup ${allocation.isReady ? "" : "disabled"}>Finish Setup</button>
    </div>
  `, "Plan");
}

function renderMonthlyPlanSheet() {
  return `
    <section class="monthly-plan-sheet">
      ${state.settings.projects.length ? state.settings.projects.map(renderPlanBlock).join("") : `<div class="empty-state">No blocks yet. Add Income, Spend, Debt, Save, or Investment blocks.</div>`}
    </section>
  `;
}

function renderPlanBlock(project) {
  const stats = calculateProjectStats(project.id);
  return `
    <article class="plan-block">
      <div class="plan-block-head">
        <div><h3>${escapeHtml(project.label)}</h3><span class="type-pill">${escapeHtml(blockTypeLabel(project.type))}</span></div>
        <div class="block-menu">
          <button class="mini-button" type="button" data-rename-block="${project.id}">Rename</button>
          <button class="mini-button" type="button" data-change-block-type="${project.id}">Change Type</button>
          <button class="mini-button" type="button" data-move-block="${project.id}" data-direction="-1">↑</button>
          <button class="mini-button" type="button" data-move-block="${project.id}" data-direction="1">↓</button>
          <button class="mini-button danger-text" type="button" data-delete-project="${project.id}">Delete</button>
        </div>
      </div>
      <div class="plan-table">
        <div class="plan-row plan-header"><span>Item</span><span>Plan</span><span>Actual</span><span></span></div>
        ${project.subItems.length ? project.subItems.map((item) => renderPlanRow(project, item)).join("") : `<div class="plan-row plan-empty"><span>No rows yet.</span><span></span><span></span><span></span></div>`}
        <div class="plan-row plan-total"><span>Total</span><span>${money(stats.budget)}</span><span>${money(stats.spent)}</span><span></span></div>
      </div>
      <form class="add-row-form" data-add-row-form="${project.id}">
        <input name="label" placeholder="Item name" required />
        <input name="monthlyAmount" type="number" step="0.01" placeholder="Plan amount" required />
        <button class="mini-button" type="submit">+ Add Row</button>
      </form>
    </article>
  `;
}

function renderPlanRow(project, item) {
  const stats = calculateSubItemStats(item.id);
  const actual = project.type === "income" ? 0 : stats.monthSpent;
  return `
    <div class="plan-row">
      <span>${escapeHtml(item.label)}</span>
      <span>${money(item.monthlyAmount)}</span>
      <span>${money(actual)}</span>
      <button class="mini-button danger-text" type="button" data-delete-item="${item.id}">×</button>
    </div>
  `;
}

function renderCheckbox(name, label, checked) {
  return `<label class="checkbox-row"><input name="${name}" type="checkbox" ${checked ? "checked" : ""} /><span>${escapeHtml(label)}</span></label>`;
}

function openDataCenter() {
  modalRoot.innerHTML = renderSheet("Data Center", `
    <section class="readonly-card weak-card">
      <div class="section-head"><h3>CSV Backup</h3><span class="tiny-label">Portable</span></div>
      <div class="button-row">
        <button id="exportCsvButton" class="action-button" type="button">Export CSV</button>
        <label class="ghost-button">Import CSV<input id="importCsvInput" class="hidden" type="file" accept=".csv,text/csv" /></label>
        <button id="sampleCsvButton" class="ghost-button" type="button">Download sample CSV</button>
      </div>
    </section>
    <section class="readonly-card weak-card danger-zone"><div class="section-head"><h3>Reset</h3><span class="tiny-label">Danger</span></div><button id="resetButton" class="danger-button" type="button">Reset local data</button></section>
    <details class="about-details"><summary>About</summary><div class="about-body"><p class="settings-note">${escapeHtml(APP_VERSION)}</p><p class="settings-note">Storage key: ${escapeHtml(STORAGE_KEY)}</p></div></details>
  `, "CSV");
  bindSheetEvents();
}

function renderSheet(title, body, kicker = "Setup") {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet setup-sheet" role="dialog" aria-label="${escapeHtml(title)}">
        <div class="sheet-handle"></div>
        <div class="sheet-head"><div><p class="section-kicker">${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2></div><button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button></div>
        ${body}
      </section>
    </div>
  `;
}

function bindSheetEvents() {
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeSheet();
  });
  modalRoot.querySelector("[data-finish-setup]")?.addEventListener("click", finishSetup);
  modalRoot.querySelector("#projectForm")?.addEventListener("submit", addProject);
  modalRoot.querySelectorAll("[data-add-row-form]").forEach((form) => form.addEventListener("submit", addSubItem));
  modalRoot.querySelectorAll("[data-delete-project]").forEach((button) => button.addEventListener("click", () => deleteProject(button.dataset.deleteProject)));
  modalRoot.querySelectorAll("[data-delete-item]").forEach((button) => button.addEventListener("click", () => deleteSubItem(button.dataset.deleteItem)));
  modalRoot.querySelectorAll("[data-rename-block]").forEach((button) => button.addEventListener("click", () => renameBlock(button.dataset.renameBlock)));
  modalRoot.querySelectorAll("[data-change-block-type]").forEach((button) => button.addEventListener("click", () => changeBlockType(button.dataset.changeBlockType)));
  modalRoot.querySelectorAll("[data-move-block]").forEach((button) => button.addEventListener("click", () => moveBlock(button.dataset.moveBlock, Number(button.dataset.direction))));
  modalRoot.querySelector("#transactionForm")?.addEventListener("submit", saveTransaction);
  modalRoot.querySelectorAll("[data-item-chip]").forEach((button) => button.addEventListener("click", () => {
    modalRoot.querySelector("input[name='subItemId']").value = button.dataset.itemChip;
    modalRoot.querySelectorAll("[data-item-chip]").forEach((chip) => chip.classList.toggle("is-active", chip === button));
  }));
  modalRoot.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    state.ui.txFilter = button.dataset.filter;
    saveState();
    modalRoot.innerHTML = renderTransactionsManagerSheet();
    bindSheetEvents();
  }));
  modalRoot.querySelectorAll("[data-edit-transaction]").forEach((button) => button.addEventListener("click", () => {
    state.ui.editingTransactionId = button.dataset.editTransaction;
    saveState();
    openQuickAdd();
  }));
  modalRoot.querySelectorAll("[data-delete-transaction]").forEach((button) => button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction)));
  modalRoot.querySelector("#exportCsvButton")?.addEventListener("click", exportCSV);
  modalRoot.querySelector("#importCsvInput")?.addEventListener("change", importCSV);
  modalRoot.querySelector("#sampleCsvButton")?.addEventListener("click", downloadSampleCSV);
  modalRoot.querySelector("#resetButton")?.addEventListener("click", resetData);
  modalRoot.querySelector("#confirmCsvImportButton")?.addEventListener("click", confirmCsvImport);
  modalRoot.querySelector("#cancelCsvImportButton")?.addEventListener("click", cancelCsvImport);
  modalRoot.querySelector("[data-add-rounding-buffer]")?.addEventListener("click", addUnallocatedToSavings);
}

function closeSheet() {
  pendingCsvImport = null;
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  saveState();
  render();
}

function addProject(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  if (!label) return;
  state.settings.projects.push(normalizeProject({ id: uniqueId(slugify(label), state.settings.projects.map((item) => item.id)), label, type: form.get("type"), displayOrder: state.settings.projects.length + 1, subItems: [] }));
  saveState();
  openSetupSheet();
}

function addSubItem(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const project = getProjectById(event.currentTarget.dataset.addRowForm);
  const label = String(form.get("label") || "").trim();
  if (!project || !label) return;
  project.subItems.push(normalizeSubItem({
    id: uniqueId(slugify(label), getAllSubItems().map((item) => item.id)),
    parentProjectId: project.id,
    label,
    monthlyAmount: Number(form.get("monthlyAmount")) || 0,
    recordable: project.type === "spend",
    showOnDashboard: true,
    displayOrder: project.subItems.length + 1
  }));
  saveState();
  openSetupSheet();
}

function deleteProject(id) {
  if (!window.confirm("Delete this block and its rows?")) return;
  const ids = new Set((getProjectById(id)?.subItems || []).map((item) => item.id));
  state.settings.projects = state.settings.projects.filter((project) => project.id !== id);
  state.transactions = state.transactions.filter((tx) => !ids.has(tx.subItemId));
  saveState();
  openSetupSheet();
}

function deleteSubItem(id) {
  if (!window.confirm("Delete this row and its transactions?")) return;
  state.settings.projects.forEach((project) => {
    project.subItems = project.subItems.filter((item) => item.id !== id);
  });
  state.transactions = state.transactions.filter((tx) => tx.subItemId !== id);
  saveState();
  openSetupSheet();
}

function renameBlock(id) {
  const project = getProjectById(id);
  if (!project) return;
  const label = window.prompt("Block name", project.label);
  if (!label || !label.trim()) return;
  project.label = label.trim();
  saveState();
  openSetupSheet();
}

function changeBlockType(id) {
  const project = getProjectById(id);
  if (!project) return;
  const type = window.prompt("Type: Income, Spend, Debt, Save, or Investment", blockTypeLabel(project.type));
  const normalized = normalizeProjectType(type);
  if (!normalized) {
    showToast("Choose Income, Spend, Debt, Save, or Investment.");
    return;
  }
  project.type = normalized;
  project.subItems.forEach((item) => {
    item.recordable = normalized === "spend";
    item.showOnDashboard = true;
  });
  saveState();
  openSetupSheet();
}

function moveBlock(id, direction) {
  const projects = state.settings.projects.sort(byDisplayOrder);
  const index = projects.findIndex((project) => project.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) return;
  [projects[index].displayOrder, projects[nextIndex].displayOrder] = [projects[nextIndex].displayOrder, projects[index].displayOrder];
  state.settings.projects = projects.sort(byDisplayOrder);
  saveState();
  openSetupSheet();
}

function finishSetup() {
  const allocation = calculateAllocation();
  if (!allocation.isReady) {
    showToast("Setup can finish only when income exists and equals total allocation.");
    return;
  }
  state.ui.setupComplete = true;
  saveState();
  showToast("Monthly setup complete.");
  closeSheet();
}

function addUnallocatedToSavings() {
  const allocation = calculateAllocation();
  if (!(allocation.difference > 0 && allocation.difference < 10)) return;
  let project = getActiveProjects().find((item) => item.type === "save");
  if (!project) {
    project = normalizeProject({ id: uniqueId("savings", state.settings.projects.map((item) => item.id)), label: "Savings", type: "save", displayOrder: state.settings.projects.length + 1, subItems: [] });
    state.settings.projects.push(project);
  }
  let buffer = project.subItems.find((item) => item.active && !item.archived && item.label.toLowerCase() === "rounding buffer");
  if (!buffer) {
    buffer = normalizeSubItem({ id: uniqueId("rounding-buffer", getAllSubItems().map((item) => item.id)), parentProjectId: project.id, label: "Rounding Buffer", monthlyAmount: 0, recordable: false, showOnDashboard: false, active: true, archived: false, displayOrder: project.subItems.length + 1 });
    project.subItems.push(buffer);
  }
  buffer.monthlyAmount = roundCents(buffer.monthlyAmount + allocation.difference);
  state.ui.setupComplete = calculateAllocation().isReady;
  saveState();
  showToast("Rounding Buffer updated.");
  render();
}

function saveTransaction(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subItemId = String(form.get("subItemId") || "");
  if (!getRecordableItems().some((item) => item.id === subItemId)) {
    showToast("Choose a Spend row.");
    return;
  }
  const transaction = { id: String(form.get("id") || uid("txn")), dateISO: normalizeDateValue(form.get("dateISO")), amount: Number(form.get("amount")) || 0, subItemId, note: String(form.get("note") || "").trim() };
  if (!transaction.dateISO || transaction.amount <= 0) {
    showToast("Date and amount are required.");
    return;
  }
  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) state.transactions[index] = transaction;
  else state.transactions.push(transaction);
  state.ui.lastTransactionTemplate = { amount: transaction.amount, subItemId: transaction.subItemId, note: transaction.note };
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  state.ui.activeTab = "monitor";
  saveState();
  showToast(index >= 0 ? "Transaction updated." : "Transaction added.");
  render();
}

function openTransactionsManager() {
  state.ui.txFilter = state.ui.monitorScope === "month" ? "month" : "week";
  modalRoot.innerHTML = renderTransactionsManagerSheet();
  bindSheetEvents();
}

function renderTransactionsManagerSheet() {
  const transactions = getFilteredTransactions();
  return renderSheet("Activity", `
    <div class="tx-filter">${renderFilter("week", "This Week")}${renderFilter("month", "This Month")}${renderFilter("all", "All")}</div>
    <div class="tx-list">${transactions.length ? transactions.map(renderManagedTransaction).join("") : `<div class="empty-state">No transactions recorded yet.</div>`}</div>
  `, "Manage");
}

function renderFilter(filter, label) {
  return `<button class="filter-chip ${state.ui.txFilter === filter ? "is-active" : ""}" type="button" data-filter="${filter}">${escapeHtml(label)}</button>`;
}

function renderManagedTransaction(transaction) {
  return `<div class="tx-item"><div><strong>${escapeHtml(getSubItemLabel(transaction.subItemId))}</strong><span>${formatDate(transaction.dateISO)} · ${escapeHtml(transaction.note || "No note")}</span></div><b>${money(transaction.amount)}</b><button class="mini-button" type="button" data-edit-transaction="${transaction.id}">Edit</button><button class="mini-button danger-text" type="button" data-delete-transaction="${transaction.id}">Delete</button></div>`;
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((item) => item.id !== id);
  saveState();
  showToast("Transaction deleted.");
  modalRoot.innerHTML = renderTransactionsManagerSheet();
  bindSheetEvents();
  render();
}

function getEditingTransaction() {
  return state.transactions.find((item) => item.id === state.ui.editingTransactionId) || null;
}

function exportCSV() {
  downloadText(`finance-tracker-v3-${state.ui.selectedMonth}.csv`, serializeStateToCSV(state), "text/csv");
  showToast("CSV backup exported.");
}

function importCSV(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  event.target.value = "";
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { state: imported, skipped } = parseCSVToState(String(reader.result || ""));
      pendingCsvImport = { state: normalizeProjectState(imported), skipped };
      modalRoot.innerHTML = renderImportPreviewSheet();
      bindSheetEvents();
    } catch {
      showToast("Invalid CSV import.");
    }
  };
  reader.readAsText(file);
}

function renderImportPreviewSheet() {
  const imported = pendingCsvImport.state;
  const stats = [["Blocks", imported.settings.projects.length], ["Rows", getAllSubItems(imported).length], ["Transactions", imported.transactions.length], ["Skipped rows", pendingCsvImport.skipped]];
  return renderSheet("Import Preview", `
    <div class="import-preview-grid">${stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("")}</div>
    <div class="notice-strip warning">Importing will replace current local data.</div>
    <div class="button-row"><button id="confirmCsvImportButton" class="action-button" type="button">Confirm Import</button><button id="cancelCsvImportButton" class="ghost-button" type="button">Cancel</button></div>
  `, "CSV");
}

function confirmCsvImport() {
  if (!pendingCsvImport) return;
  state = normalizeProjectState(pendingCsvImport.state);
  const skipped = pendingCsvImport.skipped;
  pendingCsvImport = null;
  saveState();
  modalRoot.innerHTML = "";
  showToast(skipped ? `CSV imported with ${skipped} skipped rows.` : "CSV imported.");
  render();
}

function cancelCsvImport() {
  pendingCsvImport = null;
  modalRoot.innerHTML = "";
  showToast("CSV import canceled.");
}

function downloadSampleCSV() {
  const sample = structuredClone(DEFAULT_STATE);
  sample.settings.projects.push(normalizeProject({ id: "income", label: "Income", type: "income", displayOrder: 1, subItems: [{ id: "salary", parentProjectId: "income", label: "Salary", monthlyAmount: 1000, active: true }] }));
  sample.settings.projects.push(normalizeProject({ id: "spend", label: "Spend", type: "spend", displayOrder: 2, subItems: [{ id: "groceries", parentProjectId: "spend", label: "Groceries", monthlyAmount: 1000, recordable: true, showOnDashboard: true, active: true }] }));
  sample.transactions.push({ id: "sample-transaction", dateISO: `${state.ui.selectedMonth}-01`, amount: 25, subItemId: "groceries", note: "Example transaction" });
  downloadText("finance-tracker-v3-sample.csv", serializeStateToCSV(sample), "text/csv");
  showToast("Sample CSV downloaded.");
}

function serializeStateToCSV(source) {
  const columns = ["record_type", "id", "parent_id", "label", "amount", "monthly_amount", "date", "sub_item_id", "project_type", "recordable", "show_on_dashboard", "active", "archived", "display_order"];
  const rows = [columns];
  source.settings.projects.forEach((project) => {
    rows.push(["project", project.id, "", project.label, "", "", "", "", project.type, "", "", project.active, project.archived, project.displayOrder]);
    project.subItems.forEach((item) => rows.push(["sub_item", item.id, project.id, item.label, "", item.monthlyAmount, "", "", "", item.recordable, item.showOnDashboard, item.active, item.archived, item.displayOrder]));
  });
  source.transactions.forEach((tx) => rows.push(["transaction", tx.id, "", "", tx.amount, "", tx.dateISO, tx.subItemId, "", "", "", true, false, ""]));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function parseCSVToState(text) {
  const records = csvParse(text);
  if (!records.length) return { state: structuredClone(DEFAULT_STATE), skipped: 0 };
  const headers = records[0].map((item) => String(item).trim());
  const next = structuredClone(DEFAULT_STATE);
  const projectMap = new Map();
  let skipped = 0;
  records.slice(1).forEach((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    try {
      if (row.record_type === "project" || row.record_type === "budget_group") {
        const project = normalizeProject({ id: row.id, label: row.label, type: row.project_type || row.group_type || "spend", active: bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1, subItems: [] });
        next.settings.projects.push(project);
        projectMap.set(project.id, project);
      } else if (row.record_type === "sub_item" || row.record_type === "subcategory") {
        const project = projectMap.get(row.parent_id);
        const item = normalizeSubItem({ id: row.id, parentProjectId: row.parent_id, label: row.label, monthlyAmount: number(row.monthly_amount || row.monthly_budget), recordable: bool(row.recordable), showOnDashboard: row.show_on_dashboard === "" ? true : bool(row.show_on_dashboard), active: bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1 });
        if (project && item) project.subItems.push(item);
        else skipped += 1;
      } else if (row.record_type === "transaction") {
        const tx = normalizeTransaction({ id: row.id, amount: number(row.amount), dateISO: row.date, subItemId: row.sub_item_id || row.subcategory_id });
        if (tx) next.transactions.push(tx);
        else skipped += 1;
      } else if (row.record_type) skipped += 1;
    } catch {
      skipped += 1;
    }
  });
  return { state: next, skipped };
}

function resetData() {
  if (!window.confirm("Reset all local data?")) return;
  state = structuredClone(DEFAULT_STATE);
  saveState();
  modalRoot.innerHTML = "";
  showToast("Local data reset.");
  render();
}

function calculateAllocation(source = state) {
  const totals = { income: 0, spend: 0, debt: 0, save: 0, investment: 0 };
  const activeProjects = source.settings.projects.filter((project) => project.active && !project.archived);
  const activeItems = [];
  activeProjects.forEach((project) => {
    const projectItems = project.subItems.filter((item) => item.active && !item.archived);
    activeItems.push(...projectItems);
    const total = sum(projectItems.map((item) => item.monthlyAmount));
    if (project.type === "income") totals.income += total;
    if (project.type === "spend") totals.spend += total;
    if (project.type === "debt") totals.debt += total;
    if (project.type === "save") totals.save += total;
    if (project.type === "investment") totals.investment += total;
  });
  const allocation = totals.spend + totals.debt + totals.save + totals.investment;
  const difference = roundCents(totals.income - allocation);
  const status = difference === 0 ? "balanced" : difference > 0 ? "unallocated" : "overallocated";
  const hasSetupData = activeItems.length > 0 && totals.income > 0;
  const isReady = status === "balanced" && hasSetupData;
  const label = status === "balanced" ? "Balanced" : status === "overallocated" ? "Overallocated" : "Unallocated";
  return {
    ...totals,
    allocation,
    difference,
    status,
    label,
    displayLabel: hasSetupData ? label : "Setup",
    isReady,
    message: !hasSetupData ? "Create income and allocations to start." : status === "balanced" ? "Income equals allocation. Ready." : status === "overallocated" ? `${money(Math.abs(difference))} over income.` : `${money(difference)} left unallocated.`,
    nextStep: "plan"
  };
}

function calculateDashboardTotals() {
  const month = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(month));
  const weekEnd = getWeekEnd(weekKey);
  const spendItems = new Set(getAllSubItems().filter((item) => getProjectById(item.parentProjectId)?.type === "spend").map((item) => item.id));
  const monthSpent = sum(state.transactions.filter((tx) => spendItems.has(tx.subItemId) && tx.dateISO.startsWith(month)).map((tx) => tx.amount));
  const weekSpent = sum(state.transactions.filter((tx) => spendItems.has(tx.subItemId) && tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const spendBudget = calculateAllocation().spend;
  return { weekSpent, monthSpent, monthRemaining: Math.max(0, spendBudget - monthSpent) };
}

function calculateProjectStats(projectId) {
  const project = getProjectById(projectId);
  const budget = sum(project.subItems.filter((item) => item.active && !item.archived).map((item) => item.monthlyAmount));
  const spent = project.type === "income" ? 0 : sum(state.transactions.filter((tx) => project.subItems.some((item) => item.id === tx.subItemId) && tx.dateISO.startsWith(state.ui.selectedMonth)).map((tx) => tx.amount));
  return { budget, spent, remaining: Math.max(0, budget - spent) };
}

function calculateSubItemStats(subItemId) {
  const item = getSubItemById(subItemId);
  const monthSpent = sum(state.transactions.filter((tx) => tx.subItemId === subItemId && tx.dateISO.startsWith(state.ui.selectedMonth)).map((tx) => tx.amount));
  const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
  const weekEnd = getWeekEnd(weekKey);
  const weekSpent = sum(state.transactions.filter((tx) => tx.subItemId === subItemId && tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const weeks = getWeeksOverlappingMonth(state.ui.selectedMonth).length || 1;
  const weeklyAllowance = (item?.monthlyAmount || 0) / weeks;
  return { monthSpent, weekSpent, weeklyAllowance, weekRemaining: Math.max(0, weeklyAllowance - weekSpent), monthRemaining: Math.max(0, (item?.monthlyAmount || 0) - monthSpent) };
}

function getActiveProjects() {
  return state.settings.projects.filter((project) => project.active && !project.archived).sort(byDisplayOrder);
}

function getDashboardProjects() {
  return getActiveProjects().filter((project) => project.subItems.some((item) => item.active && !item.archived && item.showOnDashboard));
}

function getProjectById(id) {
  return state.settings.projects.find((project) => project.id === id) || null;
}

function getAllSubItems(source = state) {
  return source.settings.projects.flatMap((project) => project.subItems.map((item) => ({ ...item, parentProjectId: project.id, projectLabel: project.label, projectType: project.type })));
}

function getRecordableItems() {
  return getAllSubItems().filter((item) => item.active && !item.archived && item.recordable && getProjectById(item.parentProjectId)?.type === "spend").sort(byDisplayOrder);
}

function getSubItemById(id) {
  return getAllSubItems().find((item) => item.id === id) || null;
}

function getSubItemLabel(id) {
  return getSubItemById(id)?.label || startCase(id || "Unknown");
}

function getScopedTransactions() {
  const month = state.ui.selectedMonth;
  if (state.ui.monitorScope === "month") return state.transactions.filter((tx) => tx.dateISO.startsWith(month)).sort(byDateDesc);
  const weekKey = getWeekKey(getReferenceDateISO(month));
  const weekEnd = getWeekEnd(weekKey);
  return state.transactions.filter((tx) => tx.dateISO >= weekKey && tx.dateISO <= weekEnd).sort(byDateDesc);
}

function getFilteredTransactions() {
  if (state.ui.txFilter === "all") return [...state.transactions].sort(byDateDesc);
  if (state.ui.txFilter === "week") {
    const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
    const weekEnd = getWeekEnd(weekKey);
    return state.transactions.filter((tx) => tx.dateISO >= weekKey && tx.dateISO <= weekEnd).sort(byDateDesc);
  }
  return state.transactions.filter((tx) => tx.dateISO.startsWith(state.ui.selectedMonth)).sort(byDateDesc);
}

function mapGroupType(type) {
  const normalized = normalizeProjectType(type);
  if (normalized) return normalized;
  if (type === "income") return "income";
  if (type === "savings" || type === "save") return "save";
  if (type === "debt") return "debt";
  if (type === "investment" || type === "debtInvestment") return "investment";
  if (type === "fixed" || type === "flexible" || type === "essentials" || type === "discretionary") return "spend";
  return "spend";
}

function normalizeProjectType(value) {
  const normalized = String(value || "").toLowerCase().replace(/\s+/g, "");
  if (normalized === "income") return "income";
  if (normalized === "spend" || normalized === "spending") return "spend";
  if (normalized === "debt") return "debt";
  if (normalized === "save" || normalized === "saving" || normalized === "savings") return "save";
  if (normalized === "investment" || normalized === "invest" || normalized === "debtinvestment") return "investment";
  return "";
}

function blockTypeLabel(type) {
  return type === "save" ? "Save" : startCase(type);
}

function monthlyEquivalent(item) {
  const amount = Number(item?.amount) || 0;
  return item?.frequency === "annual" ? amount / 12 : item?.frequency === "oneTime" ? 0 : amount;
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function normalizeMonthValue(value) {
  return /^\d{4}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function normalizeDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function defaultDateForMonth(month) {
  const today = new Date().toISOString().slice(0, 10);
  return today.startsWith(month) ? today : `${month}-01`;
}

function getReferenceDateISO(month) {
  const today = new Date().toISOString().slice(0, 10);
  return today.startsWith(month) ? today : `${month}-01`;
}

function getWeekKey(dateISO) {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getWeekEnd(weekKey) {
  const date = new Date(`${weekKey}T00:00:00`);
  date.setDate(date.getDate() + 6);
  return date.toISOString().slice(0, 10);
}

function getWeeksOverlappingMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const weeks = new Set();
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) weeks.add(getWeekKey(d.toISOString().slice(0, 10)));
  return [...weeks];
}

function formatDate(dateISO) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function money(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function roundCents(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function byDisplayOrder(a, b) {
  return (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || String(a.label || a.name).localeCompare(String(b.label || b.name));
}

function byDateDesc(a, b) {
  return String(b.dateISO).localeCompare(String(a.dateISO));
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function uniqueId(base, existing) {
  const fallback = base || "item";
  let id = fallback;
  let index = 2;
  while (existing.includes(id)) id = `${fallback}-${index++}`;
  return id;
}

function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function startCase(value) {
  return String(value || "").replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function number(value) {
  return Number(value) || 0;
}

function bool(value) {
  return value === true || value === "true" || value === "1" || value === "yes";
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvParse(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        index += 1;
      } else if (char === "\"") quoted = false;
      else cell += char;
    } else if (char === "\"") quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  row.push(cell);
  if (row.some((item) => item !== "")) rows.push(row);
  return rows;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.role = "status";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
