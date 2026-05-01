const APP_VERSION = "V3.2.0 Envelope Budget Setup";
const SCHEMA_VERSION = 4;
const STORAGE_KEY = "financeTracker_v3";

const GROUP_TYPES = ["income", "fixed", "flexible", "savings", "debtInvestment", "other"];
const SETUP_STEPS = ["income", "groups", "subcategories", "check", "finish"];

const DEFAULT_STATE = {
  appVersion: APP_VERSION,
  schemaVersion: SCHEMA_VERSION,
  ui: {
    activeTab: "monitor",
    selectedMonth: currentMonthKey(),
    monitorScope: "week",
    txFilter: "month",
    editingTransactionId: null,
    setupStep: "income",
    setupComplete: false,
    expandedGroups: {},
    lastTransactionTemplate: null
  },
  settings: {
    incomeSources: [],
    budgetGroups: []
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
  ["gesturestart", "gesturechange", "gestureend"].forEach((name) => {
    document.addEventListener(name, prevent, { passive: false });
  });
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
    const quickAdd = event.target.closest("[data-quick-add]");
    if (quickAdd) {
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
  if (input.settings?.incomeSources || input.settings?.budgetGroups) return normalizeEnvelopeState(input);
  return migrateLegacyV3(input);
}

function normalizeEnvelopeState(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.appVersion = APP_VERSION;
  next.schemaVersion = SCHEMA_VERSION;
  next.ui = {
    ...next.ui,
    ...(isObject(input.ui) ? input.ui : {})
  };
  next.ui.activeTab = ["monitor", "planning"].includes(next.ui.activeTab) ? next.ui.activeTab : "monitor";
  next.ui.selectedMonth = normalizeMonthValue(next.ui.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.txFilter = ["week", "month", "all"].includes(next.ui.txFilter) ? next.ui.txFilter : next.ui.monitorScope;
  next.ui.setupStep = SETUP_STEPS.includes(next.ui.setupStep) ? next.ui.setupStep : "income";
  next.ui.setupComplete = Boolean(next.ui.setupComplete);
  next.ui.expandedGroups = isObject(input.ui?.expandedGroups) ? input.ui.expandedGroups : {};
  next.ui.lastTransactionTemplate = normalizeTemplate(input.ui?.lastTransactionTemplate);

  const settings = isObject(input.settings) ? input.settings : {};
  next.settings.incomeSources = Array.isArray(settings.incomeSources)
    ? settings.incomeSources.map(normalizeIncomeSource).filter(Boolean).sort(byDisplayOrder)
    : [];
  next.settings.budgetGroups = Array.isArray(settings.budgetGroups)
    ? settings.budgetGroups.map(normalizeBudgetGroup).filter(Boolean).sort(byDisplayOrder)
    : [];
  next.transactions = Array.isArray(input.transactions)
    ? input.transactions.map(normalizeTransaction).filter(Boolean)
    : [];
  return next;
}

function migrateLegacyV3(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.ui.selectedMonth = normalizeMonthValue(input.ui?.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = input.ui?.monitorScope === "month" ? "month" : "week";
  const subcategoryMap = new Map();

  const ensureGroup = (label, type = "other") => {
    const existing = next.settings.budgetGroups.find((group) => group.label === label);
    if (existing) return existing;
    const group = normalizeBudgetGroup({
      id: uniqueId(slugify(label), next.settings.budgetGroups.map((item) => item.id)),
      label,
      type,
      displayOrder: next.settings.budgetGroups.length + 1,
      subcategories: []
    });
    next.settings.budgetGroups.push(group);
    return group;
  };

  const addSubcategory = (group, source, fallbackLabel, budget = 0, recordable = true) => {
    const label = String(source?.label || source?.name || fallbackLabel || "Untitled").trim();
    const id = uniqueId(slugify(label), allSubcategories(next).map((item) => item.id));
    const sub = normalizeSubcategory({
      id,
      label,
      monthlyBudget: Number(source?.monthlyBudget ?? source?.currentAmount ?? source?.amount ?? budget) || 0,
      recordable,
      showOnDashboard: source?.monitor ?? source?.includeInMonitor ?? true,
      active: source?.active !== false,
      archived: Boolean(source?.archived)
    });
    group.subcategories.push(sub);
    if (source?.id) subcategoryMap.set(source.id, sub.id);
    return sub;
  };

  if (Array.isArray(input.settings?.backgroundSections)) {
    input.settings.backgroundSections.forEach((section) => {
      if (section?.type === "income") {
        (section.items || []).forEach((item) => {
          next.settings.incomeSources.push(normalizeIncomeSource({
            id: uniqueId(slugify(item.label), next.settings.incomeSources.map((source) => source.id)),
            label: item.label,
            amount: monthlyEquivalent(item),
            active: item.active !== false && !item.archived
          }));
        });
      } else {
        const group = ensureGroup(section.label || startCase(section.type || "other"), mapLegacyGroupType(section.type));
        (section.items || []).forEach((item) => addSubcategory(group, item, item.label, monthlyEquivalent(item), false));
      }
    });
  }

  if (Array.isArray(input.settings?.monitorCategories) && input.settings.monitorCategories.length) {
    input.settings.monitorCategories.forEach((category) => {
      const group = ensureGroup(mapLegacyCategoryGroupLabel(category.group), mapLegacyCategoryType(category.group));
      addSubcategory(group, category, category.label, category.monthlyBudget, category.allowTransactions !== false);
    });
  }

  if (Array.isArray(input.settings?.reserveVaults) && input.settings.reserveVaults.length) {
    const savings = ensureGroup("Savings", "savings");
    input.settings.reserveVaults.forEach((vault) => addSubcategory(savings, {
      ...vault,
      label: vault.name || vault.label,
      monthlyBudget: vault.currentAmount || 0,
      monitor: vault.includeInMonitor
    }, vault.name, vault.currentAmount || 0, false));
  }

  next.transactions = Array.isArray(input.transactions)
    ? input.transactions.map((transaction) => normalizeTransaction({
      id: transaction.id,
      dateISO: transaction.dateISO,
      amount: transaction.amount,
      subcategoryId: subcategoryMap.get(transaction.category) || transaction.subcategoryId || transaction.category,
      note: transaction.note
    })).filter(Boolean)
    : [];

  next.settings.budgetGroups = next.settings.budgetGroups.map((group) => ({
    ...group,
    subcategories: group.subcategories.sort(byDisplayOrder)
  })).sort(byDisplayOrder);
  next.ui.setupComplete = calculateSetupStatus(next).status === "balanced";
  return next;
}

function normalizeIncomeSource(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("income"),
    label: label || startCase(id),
    amount: Number(raw.amount) || 0,
    active: raw.active !== false,
    displayOrder: Number(raw.displayOrder) || 1
  };
}

function normalizeBudgetGroup(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("group"),
    label: label || startCase(id),
    type: GROUP_TYPES.includes(raw.type) ? raw.type : "other",
    displayOrder: Number(raw.displayOrder) || 1,
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    subcategories: Array.isArray(raw.subcategories)
      ? raw.subcategories.map(normalizeSubcategory).filter(Boolean).sort(byDisplayOrder)
      : []
  };
}

function normalizeSubcategory(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("sub"),
    label: label || startCase(id),
    monthlyBudget: Number(raw.monthlyBudget) || 0,
    recordable: raw.recordable !== false,
    showOnDashboard: raw.showOnDashboard !== false,
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    displayOrder: Number(raw.displayOrder) || 1
  };
}

function normalizeTransaction(raw) {
  if (!isObject(raw)) return null;
  const amount = Number(raw.amount) || 0;
  const subcategoryId = String(raw.subcategoryId || raw.category || "").trim();
  const dateISO = normalizeDateValue(raw.dateISO || raw.date);
  if (!amount || !subcategoryId || !dateISO) return null;
  return {
    id: String(raw.id || uid("txn")),
    dateISO,
    amount,
    subcategoryId,
    note: String(raw.note || "").trim()
  };
}

function normalizeTemplate(raw) {
  if (!isObject(raw)) return null;
  return {
    amount: Number(raw.amount) || 0,
    subcategoryId: String(raw.subcategoryId || raw.category || ""),
    note: String(raw.note || "").trim()
  };
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
  const setup = calculateSetupStatus();
  if (state.ui.activeTab === "planning") {
    headerStatus.className = `header-status-pill ${setup.status === "balanced" ? "safe" : setup.status === "overallocated" ? "freeze" : "neutral"}`;
    headerStatus.textContent = "Plan";
    return;
  }
  headerStatus.className = `header-status-pill ${setup.status === "balanced" ? "safe" : setup.status === "overallocated" ? "freeze" : "neutral"}`;
  headerStatus.textContent = setup.label;
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
  document.querySelectorAll("[data-open-setup]").forEach((button) => button.addEventListener("click", () => openSetupSheet(button.dataset.openSetup || state.ui.setupStep)));
  document.querySelectorAll("[data-open-data]").forEach((button) => button.addEventListener("click", openDataCenter));
  document.querySelectorAll("[data-toggle-group]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.expandedGroups[button.dataset.toggleGroup] = !state.ui.expandedGroups[button.dataset.toggleGroup];
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-manage-transactions]").forEach((button) => button.addEventListener("click", openTransactionsManager));
}

function renderMonitorPage() {
  const setup = calculateSetupStatus();
  const recordable = getRecordableSubcategories();
  const totals = calculateDashboardTotals();
  return `
    <section class="page monitor-page">
      <section class="setup-status-card ${setup.status}">
        <div>
          <p class="section-kicker">Setup status</p>
          <h2>${escapeHtml(setup.label)}</h2>
          <span>${escapeHtml(setup.message)}</span>
        </div>
        <button class="action-button" type="button" data-open-setup="${setup.nextStep}">${setup.status === "balanced" ? "Edit Setup" : "Continue Setup"}</button>
      </section>
      ${recordable.length ? renderDashboardSummary(totals) : renderFreshMonitorEmpty()}
      ${recordable.length ? renderGroupDashboard() : ""}
      ${renderRecentActivity()}
    </section>
  `;
}

function renderFreshMonitorEmpty() {
  return `
    <section class="empty-state hero-empty">
      <strong>No budget envelopes yet.</strong>
      <span>Create income, groups, and subcategories in Monthly Setup. Then use + to record spending.</span>
      <button class="action-button" type="button" data-open-setup="income">Start Monthly Setup</button>
    </section>
  `;
}

function renderDashboardSummary(totals) {
  return `
    <section class="dashboard-summary">
      <div><span>This week spent</span><strong>${money(totals.weekSpent)}</strong></div>
      <div><span>This month spent</span><strong>${money(totals.monthSpent)}</strong></div>
      <div><span>Month remaining</span><strong>${money(totals.monthRemaining)}</strong></div>
    </section>
  `;
}

function renderGroupDashboard() {
  const groups = getActiveGroups().filter((group) => group.subcategories.some((sub) => sub.active && !sub.archived && sub.showOnDashboard));
  if (!groups.length) return `<section class="empty-state hero-empty"><strong>No dashboard groups yet.</strong><span>Turn on Show on Dashboard for at least one subcategory.</span><button class="action-button" type="button" data-open-setup="subcategories">Edit Setup</button></section>`;
  return `
    <section class="group-dashboard">
      ${groups.map(renderGroupCard).join("")}
    </section>
  `;
}

function renderGroupCard(group) {
  const stats = calculateGroupStats(group.id);
  const expanded = state.ui.expandedGroups[group.id] !== false;
  const subs = group.subcategories.filter((sub) => sub.active && !sub.archived && sub.showOnDashboard);
  return `
    <article class="group-card">
      <button class="group-card-head" type="button" data-toggle-group="${group.id}">
        <span>
          <strong>${escapeHtml(group.label)}</strong>
          <em>${escapeHtml(startCase(group.type))}</em>
        </span>
        <b>${money(stats.spent)} / ${money(stats.budget)}</b>
      </button>
      <div class="group-meta">
        <span>Remaining ${money(stats.remaining)}</span>
        <span>${subs.length} subcategories</span>
      </div>
      ${expanded ? `<div class="subcategory-list">${subs.map((sub) => renderSubcategoryProgress(group, sub)).join("")}</div>` : ""}
    </article>
  `;
}

function renderSubcategoryProgress(group, sub) {
  const stats = calculateSubcategoryStats(sub.id);
  const percent = sub.monthlyBudget ? stats.monthSpent / sub.monthlyBudget * 100 : 0;
  return `
    <div class="subcategory-progress">
      <div>
        <strong>${escapeHtml(sub.label)}</strong>
        <span>${money(stats.monthSpent)} / ${money(sub.monthlyBudget)}</span>
      </div>
      <div class="budget-bar">
        <div class="budget-fill" style="width:${clampPercent(percent)}%"></div>
      </div>
      <small>${state.ui.monitorScope === "week" ? `${money(stats.weekSpent)} this week · ${money(stats.weekRemaining)} left this week · ${money(stats.monthRemaining)} left this month` : `${money(stats.monthRemaining)} left this month`}</small>
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
      <div class="recent-feed">
        ${recent.length ? recent.map(renderRecentTransaction).join("") : `<div class="empty-state">No activity yet. Add your first entry with +.</div>`}
      </div>
    </section>
  `;
}

function renderRecentTransaction(transaction) {
  return `
    <div class="recent-item">
      <span>${escapeHtml(getSubcategoryLabel(transaction.subcategoryId))}</span>
      <strong>${money(transaction.amount)}</strong>
      <em>${formatDate(transaction.dateISO)}</em>
    </div>
  `;
}

function renderPlanningPage() {
  const setup = calculateSetupStatus();
  return `
    <section class="page planning-page">
      <article class="planning-card monthly-setup-card ${setup.status}">
        <div class="planning-accordion-head">
          <div>
            <p class="section-kicker">Envelope budget</p>
            <h2>Monthly Setup</h2>
          </div>
          <span class="header-status-pill ${setup.status === "balanced" ? "safe" : setup.status === "overallocated" ? "freeze" : "neutral"}">${escapeHtml(setup.label)}</span>
        </div>
        <div class="setup-metrics">
          <div><span>Monthly income</span><strong>${money(setup.income)}</strong></div>
          <div><span>Allocated budget</span><strong>${money(setup.allocated)}</strong></div>
          <div><span>Difference</span><strong>${money(setup.difference)}</strong></div>
        </div>
        <p class="settings-note">${escapeHtml(setup.message)}</p>
        <button class="action-button" type="button" data-open-setup="${setup.nextStep}">${setup.status === "balanced" ? "Edit Setup" : "Continue Setup"}</button>
      </article>
      <article class="planning-card is-weak data-center-card">
        <div class="planning-accordion-head">
          <div>
            <p class="section-kicker">CSV Backup</p>
            <h2>Data Center</h2>
          </div>
          <button class="mini-button" type="button" data-open-data>Open</button>
        </div>
        <div class="accordion-inline-summary"><strong>CSV import / export</strong><span>Backup and restore envelope data.</span></div>
      </article>
    </section>
  `;
}

function openQuickAdd() {
  modalRoot.innerHTML = renderQuickAddSheet();
  bindSheetEvents();
  requestAnimationFrame(() => modalRoot.querySelector("input[name='amount']")?.focus());
}

function renderQuickAddSheet() {
  const subs = getRecordableSubcategories();
  const editing = getEditingTransaction();
  if (!subs.length && !editing) {
    return renderSheet("Quick Add", `
      <div class="empty-state">
        <strong>Create a subcategory first.</strong>
        <span>Transactions are recorded against subcategories.</span>
        <button class="action-button" type="button" data-open-setup="subcategories">Open Setup</button>
      </div>
    `, "Entry");
  }
  const template = state.ui.lastTransactionTemplate;
  const selected = editing?.subcategoryId || (template && getRecordableSubcategories().some((sub) => sub.id === template.subcategoryId) ? template.subcategoryId : subs[0]?.id);
  return renderSheet(editing ? "Edit Entry" : "Quick Add", `
    <form id="transactionForm" class="quick-form">
      <input name="id" type="hidden" value="${escapeHtml(editing?.id || "")}" />
      <label class="amount-field"><span>Amount</span><input name="amount" type="number" inputmode="decimal" step="0.01" min="0" value="${editing?.amount || ""}" required /></label>
      <input name="subcategoryId" type="hidden" value="${escapeHtml(selected)}" />
      <div class="category-chip-grid">
        ${subs.map((sub) => `<button class="category-chip ${sub.id === selected ? "is-active" : ""}" type="button" data-subcategory-chip="${sub.id}">${escapeHtml(sub.label)}</button>`).join("")}
      </div>
      <label class="field"><span>Date</span><input name="dateISO" type="date" value="${escapeHtml(editing?.dateISO || defaultDateForMonth(state.ui.selectedMonth))}" required /></label>
      <label class="field"><span>Note</span><input name="note" type="text" value="${escapeHtml(editing?.note || "")}" placeholder="Optional note" /></label>
      <button class="action-button sheet-save" type="submit">${editing ? "Save Entry" : "Add Entry"}</button>
    </form>
  `, "Entry");
}

function openSetupSheet(step = state.ui.setupStep) {
  state.ui.setupStep = SETUP_STEPS.includes(step) ? step : "income";
  modalRoot.innerHTML = renderSetupSheet();
  bindSheetEvents();
}

function renderSetupSheet() {
  const step = state.ui.setupStep;
  const setup = calculateSetupStatus();
  return renderSheet("Monthly Setup", `
    <div class="setup-stepper">
      ${SETUP_STEPS.map((item, index) => `<button class="${item === step ? "is-active" : ""}" type="button" data-setup-step="${item}">${index + 1}</button>`).join("")}
    </div>
    ${step === "income" ? renderIncomeStep() : ""}
    ${step === "groups" ? renderGroupsStep() : ""}
    ${step === "subcategories" ? renderSubcategoriesStep() : ""}
    ${step === "check" ? renderAllocationCheckStep(setup) : ""}
    ${step === "finish" ? renderFinishStep(setup) : ""}
    <div class="button-row">
      ${step !== "income" ? `<button class="ghost-button" type="button" data-prev-step>Back</button>` : ""}
      ${step !== "finish" ? `<button class="action-button" type="button" data-next-step>Next</button>` : ""}
    </div>
  `, "Envelope");
}

function renderIncomeStep() {
  return `
    <section class="setup-step">
      <h3>Step 1 · Income</h3>
      <div class="manager-list">${state.settings.incomeSources.length ? state.settings.incomeSources.map((source) => `
        <div class="manager-row">
          <div><strong>${escapeHtml(source.label)}</strong><div class="settings-note">${money(source.amount)} monthly</div></div>
          <button class="mini-button danger-text" type="button" data-delete-income="${source.id}">Delete</button>
        </div>
      `).join("") : `<div class="empty-state">No income sources yet.</div>`}</div>
      <form id="incomeForm" class="quick-form inline-form">
        <label class="field"><span>Name</span><input name="label" required /></label>
        <label class="field"><span>Monthly Amount</span><input name="amount" type="number" step="0.01" value="0" /></label>
        <button class="action-button" type="submit">Add Income</button>
      </form>
    </section>
  `;
}

function renderGroupsStep() {
  return `
    <section class="setup-step">
      <h3>Step 2 · Budget Groups</h3>
      <div class="manager-list">${state.settings.budgetGroups.length ? state.settings.budgetGroups.map((group) => `
        <div class="manager-row">
          <div><strong>${escapeHtml(group.label)}</strong><div class="settings-note">${escapeHtml(startCase(group.type))} · ${group.subcategories.length} subcategories</div></div>
          <button class="mini-button danger-text" type="button" data-delete-group="${group.id}">Delete</button>
        </div>
      `).join("") : `<div class="empty-state">No groups yet.</div>`}</div>
      <form id="groupForm" class="quick-form inline-form">
        <label class="field"><span>Group Name</span><input name="label" required /></label>
        <label class="field"><span>Type</span><select name="type">${GROUP_TYPES.filter((type) => type !== "income").map((type) => `<option value="${type}">${escapeHtml(startCase(type))}</option>`).join("")}</select></label>
        <button class="action-button" type="submit">Add Group</button>
      </form>
    </section>
  `;
}

function renderSubcategoriesStep() {
  return `
    <section class="setup-step">
      <h3>Step 3 · Subcategories</h3>
      ${state.settings.budgetGroups.length ? state.settings.budgetGroups.map((group) => `
        <div class="readonly-card">
          <div class="section-head"><h3>${escapeHtml(group.label)}</h3><span class="tiny-label">${escapeHtml(startCase(group.type))}</span></div>
          <div class="manager-list" style="margin-top:10px;">${group.subcategories.length ? group.subcategories.map((sub) => `
            <div class="manager-row">
              <div><strong>${escapeHtml(sub.label)}</strong><div class="settings-note">${money(sub.monthlyBudget)} · ${sub.recordable ? "Recordable" : "Plan only"} · ${sub.showOnDashboard ? "Dashboard" : "Hidden"}</div></div>
              <button class="mini-button danger-text" type="button" data-delete-subcategory="${sub.id}">Delete</button>
            </div>
          `).join("") : `<div class="empty-state">No subcategories in this group.</div>`}</div>
        </div>
      `).join("") : `<div class="empty-state">Create a group before adding subcategories.</div>`}
      <form id="subcategoryForm" class="quick-form inline-form">
        <label class="field"><span>Name</span><input name="label" required /></label>
        <label class="field"><span>Parent Group</span><select name="groupId">${state.settings.budgetGroups.map((group) => `<option value="${group.id}">${escapeHtml(group.label)}</option>`).join("")}</select></label>
        <label class="field"><span>Monthly Budget</span><input name="monthlyBudget" type="number" step="0.01" value="0" /></label>
        <div class="boolean-grid">
          ${renderCheckbox("recordable", "Recordable", true)}
          ${renderCheckbox("showOnDashboard", "Show on Dashboard", true)}
        </div>
        <button class="action-button" type="submit">Add Subcategory</button>
      </form>
    </section>
  `;
}

function renderAllocationCheckStep(setup) {
  return `
    <section class="setup-step">
      <h3>Step 4 · Allocation Check</h3>
      <div class="setup-metrics">
        <div><span>Monthly income</span><strong>${money(setup.income)}</strong></div>
        <div><span>Total allocated</span><strong>${money(setup.allocated)}</strong></div>
        <div><span>Difference</span><strong>${money(setup.difference)}</strong></div>
      </div>
      <div class="notice-strip ${setup.status === "balanced" ? "success" : setup.status === "overallocated" ? "danger" : "warning"}">${escapeHtml(setup.message)}</div>
    </section>
  `;
}

function renderFinishStep(setup) {
  return `
    <section class="setup-step">
      <h3>Step 5 · Finish Setup</h3>
      <div class="notice-strip ${setup.status === "balanced" ? "success" : "warning"}">${escapeHtml(setup.status === "balanced" ? "Balanced and ready." : "Finish is available only when income equals allocated budget.")}</div>
      <button class="action-button" type="button" data-finish-setup ${setup.status === "balanced" ? "" : "disabled"}>Finish Setup</button>
    </section>
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
    <section class="readonly-card weak-card danger-zone">
      <div class="section-head"><h3>Reset</h3><span class="tiny-label">Danger</span></div>
      <button id="resetButton" class="danger-button" type="button">Reset local data</button>
    </section>
    <details class="about-details"><summary>About</summary><div class="about-body"><p class="settings-note">${escapeHtml(APP_VERSION)}</p><p class="settings-note">Storage key: ${escapeHtml(STORAGE_KEY)}</p></div></details>
  `, "CSV");
  bindSheetEvents();
}

function renderSheet(title, body, kicker = "Setup") {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet setup-sheet" role="dialog" aria-label="${escapeHtml(title)}">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <div><p class="section-kicker">${escapeHtml(kicker)}</p><h2>${escapeHtml(title)}</h2></div>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
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
  modalRoot.querySelectorAll("[data-setup-step]").forEach((button) => button.addEventListener("click", () => {
    state.ui.setupStep = button.dataset.setupStep;
    saveState();
    openSetupSheet(state.ui.setupStep);
  }));
  modalRoot.querySelector("[data-next-step]")?.addEventListener("click", () => moveSetupStep(1));
  modalRoot.querySelector("[data-prev-step]")?.addEventListener("click", () => moveSetupStep(-1));
  modalRoot.querySelector("[data-finish-setup]")?.addEventListener("click", finishSetup);
  modalRoot.querySelector("#incomeForm")?.addEventListener("submit", addIncomeSource);
  modalRoot.querySelector("#groupForm")?.addEventListener("submit", addBudgetGroup);
  modalRoot.querySelector("#subcategoryForm")?.addEventListener("submit", addSubcategory);
  modalRoot.querySelectorAll("[data-delete-income]").forEach((button) => button.addEventListener("click", () => deleteIncomeSource(button.dataset.deleteIncome)));
  modalRoot.querySelectorAll("[data-delete-group]").forEach((button) => button.addEventListener("click", () => deleteBudgetGroup(button.dataset.deleteGroup)));
  modalRoot.querySelectorAll("[data-delete-subcategory]").forEach((button) => button.addEventListener("click", () => deleteSubcategory(button.dataset.deleteSubcategory)));
  modalRoot.querySelector("#transactionForm")?.addEventListener("submit", saveTransaction);
  modalRoot.querySelectorAll("[data-subcategory-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      modalRoot.querySelector("input[name='subcategoryId']").value = button.dataset.subcategoryChip;
      modalRoot.querySelectorAll("[data-subcategory-chip]").forEach((chip) => chip.classList.toggle("is-active", chip === button));
    });
  });
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
}

function closeSheet() {
  pendingCsvImport = null;
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  saveState();
  render();
}

function moveSetupStep(delta) {
  const index = SETUP_STEPS.indexOf(state.ui.setupStep);
  state.ui.setupStep = SETUP_STEPS[Math.max(0, Math.min(SETUP_STEPS.length - 1, index + delta))];
  saveState();
  openSetupSheet(state.ui.setupStep);
}

function addIncomeSource(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  if (!label) return;
  state.settings.incomeSources.push(normalizeIncomeSource({
    id: uniqueId(slugify(label), state.settings.incomeSources.map((item) => item.id)),
    label,
    amount: Number(form.get("amount")) || 0,
    displayOrder: state.settings.incomeSources.length + 1
  }));
  saveState();
  openSetupSheet("income");
}

function addBudgetGroup(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  if (!label) return;
  state.settings.budgetGroups.push(normalizeBudgetGroup({
    id: uniqueId(slugify(label), state.settings.budgetGroups.map((item) => item.id)),
    label,
    type: form.get("type"),
    displayOrder: state.settings.budgetGroups.length + 1,
    subcategories: []
  }));
  saveState();
  openSetupSheet("groups");
}

function addSubcategory(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const group = getGroupById(form.get("groupId"));
  const label = String(form.get("label") || "").trim();
  if (!group || !label) return;
  group.subcategories.push(normalizeSubcategory({
    id: uniqueId(slugify(label), getAllSubcategories().map((item) => item.id)),
    label,
    monthlyBudget: Number(form.get("monthlyBudget")) || 0,
    recordable: form.has("recordable"),
    showOnDashboard: form.has("showOnDashboard"),
    displayOrder: group.subcategories.length + 1
  }));
  saveState();
  openSetupSheet("subcategories");
}

function deleteIncomeSource(id) {
  state.settings.incomeSources = state.settings.incomeSources.filter((item) => item.id !== id);
  saveState();
  openSetupSheet("income");
}

function deleteBudgetGroup(id) {
  if (!window.confirm("Delete this group and its subcategories?")) return;
  const subIds = new Set((getGroupById(id)?.subcategories || []).map((sub) => sub.id));
  state.settings.budgetGroups = state.settings.budgetGroups.filter((group) => group.id !== id);
  state.transactions = state.transactions.filter((tx) => !subIds.has(tx.subcategoryId));
  saveState();
  openSetupSheet("groups");
}

function deleteSubcategory(id) {
  if (!window.confirm("Delete this subcategory and its transactions?")) return;
  state.settings.budgetGroups.forEach((group) => {
    group.subcategories = group.subcategories.filter((sub) => sub.id !== id);
  });
  state.transactions = state.transactions.filter((tx) => tx.subcategoryId !== id);
  saveState();
  openSetupSheet("subcategories");
}

function finishSetup() {
  const setup = calculateSetupStatus();
  if (setup.status !== "balanced") {
    showToast("Setup can finish only when income equals allocated budget.");
    return;
  }
  state.ui.setupComplete = true;
  saveState();
  showToast("Monthly setup complete.");
  closeSheet();
}

function saveTransaction(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subcategoryId = String(form.get("subcategoryId") || "");
  if (!getRecordableSubcategories().some((sub) => sub.id === subcategoryId)) {
    showToast("Choose a recordable subcategory.");
    return;
  }
  const transaction = {
    id: String(form.get("id") || uid("txn")),
    dateISO: normalizeDateValue(form.get("dateISO")),
    amount: Number(form.get("amount")) || 0,
    subcategoryId,
    note: String(form.get("note") || "").trim()
  };
  if (!transaction.dateISO || transaction.amount <= 0) {
    showToast("Date and amount are required.");
    return;
  }
  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) state.transactions[index] = transaction;
  else state.transactions.push(transaction);
  state.ui.lastTransactionTemplate = { amount: transaction.amount, subcategoryId: transaction.subcategoryId, note: transaction.note };
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
    <div class="tx-filter">
      ${renderFilter("week", "This Week")}
      ${renderFilter("month", "This Month")}
      ${renderFilter("all", "All")}
    </div>
    <div class="tx-list">
      ${transactions.length ? transactions.map(renderManagedTransaction).join("") : `<div class="empty-state">No transactions recorded yet.</div>`}
    </div>
  `, "Manage");
}

function renderFilter(filter, label) {
  return `<button class="filter-chip ${state.ui.txFilter === filter ? "is-active" : ""}" type="button" data-filter="${filter}">${escapeHtml(label)}</button>`;
}

function renderManagedTransaction(transaction) {
  return `
    <div class="tx-item">
      <div><strong>${escapeHtml(getSubcategoryLabel(transaction.subcategoryId))}</strong><span>${formatDate(transaction.dateISO)} · ${escapeHtml(transaction.note || "No note")}</span></div>
      <b>${money(transaction.amount)}</b>
      <button class="mini-button" type="button" data-edit-transaction="${transaction.id}">Edit</button>
      <button class="mini-button danger-text" type="button" data-delete-transaction="${transaction.id}">Delete</button>
    </div>
  `;
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
      pendingCsvImport = { state: normalizeEnvelopeState(imported), skipped };
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
  const stats = [
    ["Income sources", imported.settings.incomeSources.length],
    ["Budget groups", imported.settings.budgetGroups.length],
    ["Subcategories", getAllSubcategories(imported).length],
    ["Transactions", imported.transactions.length],
    ["Skipped rows", pendingCsvImport.skipped]
  ];
  return renderSheet("Import Preview", `
    <div class="import-preview-grid">${stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("")}</div>
    <div class="notice-strip warning">Importing will replace current local data.</div>
    <div class="button-row">
      <button id="confirmCsvImportButton" class="action-button" type="button">Confirm Import</button>
      <button id="cancelCsvImportButton" class="ghost-button" type="button">Cancel</button>
    </div>
  `, "CSV");
}

function confirmCsvImport() {
  if (!pendingCsvImport) return;
  state = normalizeEnvelopeState(pendingCsvImport.state);
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
  sample.settings.incomeSources.push(normalizeIncomeSource({ id: "sample-income", label: "Sample Income", amount: 1000 }));
  sample.settings.budgetGroups.push(normalizeBudgetGroup({
    id: "sample-group",
    label: "Sample Group",
    type: "flexible",
    subcategories: [{ id: "sample-subcategory", label: "Sample Subcategory", monthlyBudget: 1000, recordable: true, showOnDashboard: true }]
  }));
  sample.transactions.push({ id: "sample-transaction", dateISO: `${state.ui.selectedMonth}-01`, amount: 25, subcategoryId: "sample-subcategory", note: "Example transaction" });
  downloadText("finance-tracker-v3-sample.csv", serializeStateToCSV(sample), "text/csv");
  showToast("Sample CSV downloaded.");
}

function serializeStateToCSV(source) {
  const columns = ["record_type", "id", "parent_id", "group_type", "label", "amount", "monthly_budget", "date", "subcategory_id", "active", "archived", "display_order"];
  const rows = [columns];
  source.settings.incomeSources.forEach((item) => rows.push(["income_source", item.id, "", "", item.label, item.amount, "", "", "", item.active, false, item.displayOrder]));
  source.settings.budgetGroups.forEach((group) => {
    rows.push(["budget_group", group.id, "", group.type, group.label, "", "", "", "", group.active, group.archived, group.displayOrder]);
    group.subcategories.forEach((sub) => {
      rows.push(["subcategory", sub.id, group.id, "", sub.label, "", sub.monthlyBudget, "", "", sub.active, sub.archived, sub.displayOrder]);
    });
  });
  source.transactions.forEach((tx) => rows.push(["transaction", tx.id, "", "", "", tx.amount, "", tx.dateISO, tx.subcategoryId, true, false, ""]));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function parseCSVToState(text) {
  const records = csvParse(text);
  if (!records.length) return { state: structuredClone(DEFAULT_STATE), skipped: 0 };
  const headers = records[0].map((item) => String(item).trim());
  const next = structuredClone(DEFAULT_STATE);
  const groupMap = new Map();
  let skipped = 0;
  records.slice(1).forEach((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    try {
      if (row.record_type === "income_source") next.settings.incomeSources.push(normalizeIncomeSource({ id: row.id, label: row.label, amount: number(row.amount), active: bool(row.active), displayOrder: number(row.display_order) || 1 }));
      else if (row.record_type === "budget_group") {
        const group = normalizeBudgetGroup({ id: row.id, label: row.label, type: row.group_type || row.subcategory_id || "other", active: bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1, subcategories: [] });
        if (group) {
          next.settings.budgetGroups.push(group);
          groupMap.set(group.id, group);
        }
      } else if (row.record_type === "subcategory") {
        const group = groupMap.get(row.parent_id);
        const sub = normalizeSubcategory({ id: row.id, label: row.label, monthlyBudget: number(row.monthly_budget), active: bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1, recordable: true, showOnDashboard: true });
        if (group && sub) group.subcategories.push(sub);
        else skipped += 1;
      } else if (row.record_type === "transaction") {
        const tx = normalizeTransaction({ id: row.id, amount: number(row.amount), dateISO: row.date, subcategoryId: row.subcategory_id });
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

function calculateSetupStatus(source = state) {
  const income = sum(source.settings.incomeSources.filter((item) => item.active).map((item) => item.amount));
  const allocated = sum(source.settings.budgetGroups.filter((group) => group.active && !group.archived).flatMap((group) => group.subcategories.filter((sub) => sub.active && !sub.archived).map((sub) => sub.monthlyBudget)));
  const difference = income - allocated;
  const hasBasics = source.settings.incomeSources.length && source.settings.budgetGroups.length && getAllSubcategories(source).length;
  const status = !hasBasics || difference > 0 ? "unallocated" : difference < 0 ? "overallocated" : "balanced";
  return {
    income,
    allocated,
    difference,
    status,
    label: status === "balanced" ? "Balanced" : status === "overallocated" ? "Overallocated" : "Unallocated",
    message: status === "balanced" ? "Income equals allocated budget. Ready to use." : status === "overallocated" ? `${money(Math.abs(difference))} over income. Reduce allocations.` : `${money(difference)} still unallocated.`,
    nextStep: !source.settings.incomeSources.length ? "income" : !source.settings.budgetGroups.length ? "groups" : !getAllSubcategories(source).length ? "subcategories" : difference === 0 ? "finish" : "check"
  };
}

function calculateDashboardTotals() {
  const month = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(month));
  const monthSpent = sum(state.transactions.filter((tx) => tx.dateISO.startsWith(month)).map((tx) => tx.amount));
  const weekEnd = getWeekEnd(weekKey);
  const weekSpent = sum(state.transactions.filter((tx) => tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const monthBudget = sum(getActiveGroups().flatMap((group) => group.subcategories.filter((sub) => sub.active && !sub.archived).map((sub) => sub.monthlyBudget)));
  return { weekSpent, monthSpent, monthRemaining: Math.max(0, monthBudget - monthSpent) };
}

function calculateGroupStats(groupId) {
  const group = getGroupById(groupId);
  const budget = sum(group.subcategories.filter((sub) => sub.active && !sub.archived).map((sub) => sub.monthlyBudget));
  const spent = sum(state.transactions.filter((tx) => group.subcategories.some((sub) => sub.id === tx.subcategoryId) && tx.dateISO.startsWith(state.ui.selectedMonth)).map((tx) => tx.amount));
  return { budget, spent, remaining: Math.max(0, budget - spent) };
}

function calculateSubcategoryStats(subcategoryId) {
  const sub = getSubcategoryById(subcategoryId);
  const monthSpent = sum(state.transactions.filter((tx) => tx.subcategoryId === subcategoryId && tx.dateISO.startsWith(state.ui.selectedMonth)).map((tx) => tx.amount));
  const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
  const weekEnd = getWeekEnd(weekKey);
  const weekSpent = sum(state.transactions.filter((tx) => tx.subcategoryId === subcategoryId && tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const weeks = getWeeksOverlappingMonth(state.ui.selectedMonth).length || 1;
  const weekAllowance = (sub?.monthlyBudget || 0) / weeks;
  return { monthSpent, weekSpent, weekAllowance, weekRemaining: Math.max(0, weekAllowance - weekSpent), monthRemaining: Math.max(0, (sub?.monthlyBudget || 0) - monthSpent) };
}

function getActiveGroups() {
  return state.settings.budgetGroups.filter((group) => group.active && !group.archived).sort(byDisplayOrder);
}

function getGroupById(id) {
  return state.settings.budgetGroups.find((group) => group.id === id) || null;
}

function getAllSubcategories(source = state) {
  return source.settings.budgetGroups.flatMap((group) => group.subcategories.map((sub) => ({ ...sub, groupId: group.id, groupLabel: group.label, groupType: group.type })));
}

function allSubcategories(source = state) {
  return getAllSubcategories(source);
}

function getRecordableSubcategories() {
  return getAllSubcategories().filter((sub) => sub.active && !sub.archived && sub.recordable).sort(byDisplayOrder);
}

function getSubcategoryById(id) {
  return getAllSubcategories().find((sub) => sub.id === id) || null;
}

function getSubcategoryLabel(id) {
  return getSubcategoryById(id)?.label || startCase(id || "Unknown");
}

function getScopedTransactions() {
  const month = state.ui.selectedMonth;
  if (state.ui.monitorScope === "month") return state.transactions.filter((tx) => tx.dateISO.startsWith(month)).sort(byDateDesc);
  const weekKey = getWeekKey(getReferenceDateISO(month));
  const weekEnd = getWeekEnd(weekKey);
  return state.transactions.filter((tx) => tx.dateISO >= weekKey && tx.dateISO <= weekEnd).sort(byDateDesc);
}

function getFilteredTransactions() {
  const filter = state.ui.txFilter || "month";
  if (filter === "all") return [...state.transactions].sort(byDateDesc);
  if (filter === "week") {
    const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
    const weekEnd = getWeekEnd(weekKey);
    return state.transactions.filter((tx) => tx.dateISO >= weekKey && tx.dateISO <= weekEnd).sort(byDateDesc);
  }
  return state.transactions.filter((tx) => tx.dateISO.startsWith(state.ui.selectedMonth)).sort(byDateDesc);
}

function mapLegacyGroupType(type) {
  if (type === "fixed") return "fixed";
  if (type === "debt" || type === "investment") return "debtInvestment";
  return "other";
}

function mapLegacyCategoryType(group) {
  if (group === "essentials") return "fixed";
  if (group === "discretionary") return "flexible";
  return "flexible";
}

function mapLegacyCategoryGroupLabel(group) {
  if (group === "essentials") return "Fixed / Essentials";
  if (group === "discretionary") return "Flexible Spending";
  return "Flexible Spending";
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
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    weeks.add(getWeekKey(d.toISOString().slice(0, 10)));
  }
  return [...weeks];
}

function money(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
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
  return String(value || "").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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
