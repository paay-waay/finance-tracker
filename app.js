const APP_VERSION = "V3.5.2 Daily Cockpit Cleanup";
const SCHEMA_VERSION = 8;
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
    planEditorScope: "year",
    planActionType: "",
    editingTransactionId: null,
    setupComplete: false,
    expandedProjects: {},
    lastTransactionTemplate: null
  },
  settings: {
    yearPlan: {
      blocks: [],
      updatedAtISO: null
    },
    monthlyPlans: {}
  },
  transactions: []
};

let state = loadState();
let toastTimer = null;
let pendingCsvImport = null;
let sheetContext = null;

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
  if (Array.isArray(input.settings?.yearPlan) || isObject(input.settings?.yearPlan) || isObject(input.settings?.monthlyPlans)) return normalizePlanState(input);
  if (Array.isArray(input.settings?.projects)) return migrateCurrentProjectsState(input);
  return migrateToProjects(input);
}

function normalizeProjectState(raw) {
  return normalizeState(raw);
}

function normalizePlanState(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.appVersion = APP_VERSION;
  next.schemaVersion = SCHEMA_VERSION;
  next.ui = { ...next.ui, ...(isObject(input.ui) ? input.ui : {}) };
  next.ui.activeTab = ["monitor", "planning"].includes(next.ui.activeTab) ? next.ui.activeTab : "monitor";
  next.ui.selectedMonth = normalizeMonthValue(next.ui.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.txFilter = ["week", "month", "all"].includes(next.ui.txFilter) ? next.ui.txFilter : next.ui.monitorScope;
  next.ui.planEditorScope = next.ui.planEditorScope === "month" ? "month" : "year";
  next.ui.planActionType = normalizeProjectType(next.ui.planActionType) || "";
  next.ui.setupComplete = Boolean(next.ui.setupComplete);
  next.ui.expandedProjects = isObject(input.ui?.expandedProjects || input.ui?.expandedGroups) ? (input.ui.expandedProjects || input.ui.expandedGroups) : {};
  next.ui.lastTransactionTemplate = normalizeTemplate(input.ui?.lastTransactionTemplate);
  next.settings.yearPlan = normalizeYearPlanRecord(input.settings?.yearPlan);
  next.settings.monthlyPlans = normalizeMonthlyPlans(input.settings?.monthlyPlans);
  next.transactions = Array.isArray(input.transactions) ? input.transactions.map(normalizeTransaction).filter(Boolean) : [];
  return next;
}

function migrateCurrentProjectsState(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.appVersion = APP_VERSION;
  next.schemaVersion = SCHEMA_VERSION;
  next.ui = { ...next.ui, ...(isObject(input.ui) ? input.ui : {}) };
  next.ui.activeTab = ["monitor", "planning"].includes(next.ui.activeTab) ? next.ui.activeTab : "monitor";
  next.ui.selectedMonth = normalizeMonthValue(next.ui.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.txFilter = ["week", "month", "all"].includes(next.ui.txFilter) ? next.ui.txFilter : next.ui.monitorScope;
  next.ui.planEditorScope = next.ui.planEditorScope === "month" ? "month" : "year";
  next.ui.planActionType = normalizeProjectType(next.ui.planActionType) || "";
  next.ui.expandedProjects = isObject(input.ui?.expandedProjects || input.ui?.expandedGroups) ? (input.ui.expandedProjects || input.ui.expandedGroups) : {};
  next.ui.lastTransactionTemplate = normalizeTemplate(input.ui?.lastTransactionTemplate);
  const projects = Array.isArray(input.settings?.projects) ? input.settings.projects.map(normalizeProject).filter(Boolean).sort(byDisplayOrder) : [];
  next.settings.yearPlan = makeYearPlanRecord(cloneProjects(projects, true));
  next.settings.monthlyPlans = { [next.ui.selectedMonth]: makeMonthlyPlanRecord(cloneProjects(projects, true), input.settings?.monthlyPlans?.[next.ui.selectedMonth]) };
  next.transactions = Array.isArray(input.transactions) ? input.transactions.map(normalizeTransaction).filter(Boolean) : [];
  next.ui.setupComplete = calculateAllocationForProjects(next.settings.monthlyPlans[next.ui.selectedMonth].blocks).isReady;
  return next;
}

function migrateToProjects(input) {
  const next = structuredClone(DEFAULT_STATE);
  next.ui.selectedMonth = normalizeMonthValue(input.ui?.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = input.ui?.monitorScope === "month" ? "month" : "week";
  next.ui.planEditorScope = input.ui?.planEditorScope === "month" ? "month" : "year";
  next.ui.planActionType = "";
  const itemMap = new Map();

  const ensureProject = (label, type) => {
    const existing = next.settings.yearPlan.blocks.find((project) => project.label === label && project.type === type);
    if (existing) return existing;
    const project = normalizeProject({
      id: uniqueId(slugify(label), next.settings.yearPlan.blocks.map((item) => item.id)),
      label,
      type,
      displayOrder: next.settings.yearPlan.blocks.length + 1,
      subItems: []
    });
    next.settings.yearPlan.blocks.push(project);
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
    input.settings.reserveVaults.forEach((vault) => addItem(save, {
      ...vault,
      label: vault.name,
      monthlyAmount: vault.monthlyAmount || 0,
      currentBalance: vault.currentAmount ?? vault.currentBalance,
      currentBalanceInput: vault.currentAmountInput ?? vault.currentBalanceInput ?? vault.currentAmount ?? vault.currentBalance,
      targetAmount: vault.targetAmount,
      targetAmountInput: vault.targetAmountInput ?? vault.targetAmount,
      showAsVault: vault.includeInMonitor !== false
    }, vault.name, vault.monthlyAmount || 0, false, false));
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
  next.settings.monthlyPlans = { [next.ui.selectedMonth]: makeMonthlyPlanRecord(cloneProjects(next.settings.yearPlan.blocks, true)) };
  next.ui.setupComplete = calculateAllocationForProjects(next.settings.monthlyPlans[next.ui.selectedMonth].blocks).isReady;
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
  const amountInput = String(raw.amountInput ?? raw.monthlyAmountInput ?? raw.monthlyBudgetInput ?? raw.monthlyAmount ?? raw.monthlyBudget ?? "0");
  const parsedAmount = parseFormula(amountInput);
  const frequency = normalizeFrequency(raw.frequency);
  const baseAmount = roundCents(parsedAmount.ok ? parsedAmount.value : Number(raw.amount ?? raw.monthlyAmount ?? raw.monthlyBudget) || 0);
  const monthlyAmount = roundCents(frequency === "biweekly" ? baseAmount * 26 / 12 : baseAmount);
  const pinToMonitor = Boolean(raw.pinToMonitor ?? raw.showOnDashboard ?? raw.recordable ?? false);
  const targetAmountInput = raw.targetAmountInput == null || raw.targetAmountInput === "" ? "" : String(raw.targetAmountInput ?? raw.targetAmount ?? "");
  const parsedTarget = targetAmountInput ? parseFormula(targetAmountInput) : { ok: true, value: 0 };
  const currentBalanceInput = raw.currentBalanceInput == null || raw.currentBalanceInput === "" ? "" : String(raw.currentBalanceInput ?? raw.currentBalance ?? raw.currentAmount ?? "");
  const parsedCurrent = currentBalanceInput ? parseFormula(currentBalanceInput) : { ok: true, value: 0 };
  return {
    id: id || uid("item"),
    parentProjectId: String(raw.parentProjectId || raw.groupId || ""),
    label: label || startCase(id),
    amountInput,
    monthlyAmountInput: amountInput,
    frequency,
    monthlyAmount,
    recordable: pinToMonitor,
    showOnDashboard: pinToMonitor,
    pinToMonitor,
    targetAmountInput,
    targetAmount: roundCents(parsedTarget.ok ? parsedTarget.value : Number(raw.targetAmount) || 0),
    currentBalanceInput,
    currentBalance: roundCents(parsedCurrent.ok ? parsedCurrent.value : Number(raw.currentBalance ?? raw.currentAmount) || 0),
    showAsVault: Boolean(raw.showAsVault ?? raw.includeInMonitor ?? false),
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    displayOrder: Number(raw.displayOrder) || 1
  };
}

function normalizeTransaction(raw) {
  if (!isObject(raw)) return null;
  const amountInput = String(raw.amountInput ?? raw.amount ?? "");
  const parsedAmount = parseFormula(amountInput);
  const amount = roundCents(Number(raw.amount) || (parsedAmount.ok ? parsedAmount.value : 0));
  const subItemId = String(raw.subItemId || raw.subcategoryId || raw.category || "").trim();
  const dateISO = normalizeDateValue(raw.dateISO || raw.date);
  if (!amount || !subItemId || !dateISO) return null;
  return { id: String(raw.id || uid("txn")), dateISO, amountInput, amount, subItemId, note: String(raw.note || "").trim() };
}

function normalizeTemplate(raw) {
  if (!isObject(raw)) return null;
  return { amountInput: String(raw.amountInput ?? raw.amount ?? ""), amount: Number(raw.amount) || 0, subItemId: String(raw.subItemId || raw.subcategoryId || ""), note: String(raw.note || "").trim() };
}

function normalizeMonthlyPlans(raw) {
  const result = {};
  if (!isObject(raw)) return result;
  Object.entries(raw).forEach(([monthKey, projects]) => {
    const normalizedMonth = normalizeMonthValue(monthKey);
    if (!normalizedMonth) return;
    result[normalizedMonth] = makeMonthlyPlanRecord(getBlocksFromPlan(projects), projects);
  });
  return result;
}

function normalizeYearPlanRecord(raw) {
  return makeYearPlanRecord(getBlocksFromPlan(raw), raw);
}

function getBlocksFromPlan(raw) {
  if (Array.isArray(raw)) return raw.map(normalizeProject).filter(Boolean).sort(byDisplayOrder);
  if (isObject(raw) && Array.isArray(raw.blocks)) return raw.blocks.map(normalizeProject).filter(Boolean).sort(byDisplayOrder);
  return [];
}

function makeYearPlanRecord(blocks = [], raw = {}) {
  return {
    blocks: (blocks || []).map(normalizeProject).filter(Boolean).sort(byDisplayOrder),
    updatedAtISO: isObject(raw) ? raw.updatedAtISO || null : null
  };
}

function makeMonthlyPlanRecord(blocks = [], raw = {}) {
  const source = isObject(raw) ? raw : {};
  return {
    blocks: (blocks || []).map(normalizeProject).filter(Boolean).sort(byDisplayOrder),
    actualOverrides: normalizeActualOverrides(source.actualOverrides),
    createdFromYearPlanAtISO: source.createdFromYearPlanAtISO || null,
    updatedAtISO: source.updatedAtISO || null
  };
}

function normalizeActualOverrides(raw) {
  const result = {};
  if (!isObject(raw)) return result;
  Object.entries(raw).forEach(([rowId, override]) => {
    if (!isObject(override)) return;
    const amountInput = String(override.amountInput ?? override.amount ?? "");
    const parsed = parseFormula(amountInput);
    const amount = roundCents(Number(override.amount) || (parsed.ok ? parsed.value : 0));
    if (!amountInput || !Number.isFinite(amount)) return;
    result[rowId] = {
      amountInput,
      amount,
      note: String(override.note || ""),
      updatedAtISO: override.updatedAtISO || null
    };
  });
  return result;
}

function cloneProjects(projects, preserveIds = false) {
  const projectIds = [];
  const rowIds = [];
  return (projects || []).map((project, projectIndex) => {
    const nextProjectId = preserveIds ? project.id : uniqueId(slugify(project.label), projectIds);
    projectIds.push(nextProjectId);
    const clonedItems = (project.subItems || []).map((item, itemIndex) => {
      const nextItemId = preserveIds ? item.id : uniqueId(slugify(item.label), rowIds);
      rowIds.push(nextItemId);
      return normalizeSubItem({
        ...item,
        id: nextItemId,
        parentProjectId: nextProjectId,
        displayOrder: itemIndex + 1
      });
    });
    return normalizeProject({
      ...project,
      id: nextProjectId,
      displayOrder: projectIndex + 1,
      subItems: clonedItems
    });
  });
}

function getYearPlan() {
  return state.settings.yearPlan.blocks;
}

function getYearBlocksFrom(source) {
  return getBlocksFromPlan(source.settings?.yearPlan);
}

function hasYearPlan() {
  return getYearPlan().length > 0;
}

function getMonthPlan(monthKey, createIfMissing = false) {
  const normalizedMonth = normalizeMonthValue(monthKey) || currentMonthKey();
  if (!state.settings.monthlyPlans[normalizedMonth] && createIfMissing && hasYearPlan()) {
    state.settings.monthlyPlans[normalizedMonth] = makeMonthlyPlanRecord(cloneProjects(getYearPlan(), false), { createdFromYearPlanAtISO: new Date().toISOString() });
    saveState();
  }
  return state.settings.monthlyPlans[normalizedMonth]?.blocks || [];
}

function getMonthPlanRecord(monthKey = state.ui.selectedMonth, createIfMissing = false) {
  const normalizedMonth = normalizeMonthValue(monthKey) || currentMonthKey();
  getMonthPlan(normalizedMonth, createIfMissing);
  return state.settings.monthlyPlans[normalizedMonth] || makeMonthlyPlanRecord([]);
}

function getPlanForScope(scope, monthKey = state.ui.selectedMonth, createIfMissing = false) {
  return scope === "year" ? getYearPlan() : getMonthPlan(monthKey, createIfMissing);
}

function replacePlanForScope(scope, projects, monthKey = state.ui.selectedMonth) {
  const now = new Date().toISOString();
  if (scope === "year") state.settings.yearPlan = makeYearPlanRecord(projects, { updatedAtISO: now });
  else {
    const normalizedMonth = normalizeMonthValue(monthKey) || currentMonthKey();
    const existing = state.settings.monthlyPlans[normalizedMonth] || {};
    state.settings.monthlyPlans[normalizedMonth] = makeMonthlyPlanRecord(projects, { ...existing, updatedAtISO: now });
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  if (state.ui.activeTab === "monitor") getMonthPlan(state.ui.selectedMonth, true);
  if (state.ui.activeTab === "planning" && state.ui.planEditorScope === "month" && hasYearPlan()) getMonthPlan(state.ui.selectedMonth, true);
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
    ${state.ui.activeTab === "planning" ? `<span class="header-mode-label">${escapeHtml(state.ui.planEditorScope === "year" ? "Default Plan" : "This Month")}</span>` : ""}
  `;
  controls.querySelector("#monthInputLive")?.addEventListener("change", (event) => {
    state.ui.selectedMonth = normalizeMonthValue(event.target.value) || currentMonthKey();
    saveState();
    render();
  });
}

function renderHeaderStatus() {
  const allocation = state.ui.activeTab === "planning"
    ? calculateAllocationForProjects(getPlanForScope(state.ui.planEditorScope, state.ui.selectedMonth, false))
    : calculateAllocationForProjects(getPlanForScope("month", state.ui.selectedMonth, false));
  headerStatus.className = `header-status-pill ${allocation.isReady ? "safe" : allocation.status === "overallocated" ? "freeze" : "neutral"}`;
  headerStatus.textContent = state.ui.activeTab === "planning" ? "Plan" : allocation.displayLabel;
}

function renderNav() {
  bottomNav.innerHTML = `
    <button class="tab-button ${state.ui.activeTab === "monitor" ? "is-active" : ""}" type="button" data-tab="monitor">Monitor</button>
    <button class="quick-add-button" type="button" data-quick-add aria-label="Quick Add">+</button>
    <button class="tab-button ${state.ui.activeTab === "planning" ? "is-active" : ""}" type="button" data-tab="planning">Planning</button>
  `;
}

function bindPageEvents() {
  document.querySelectorAll("[data-open-setup]").forEach((button) => button.addEventListener("click", () => {
    state.ui.activeTab = "planning";
    if (button.dataset.planScope) state.ui.planEditorScope = button.dataset.planScope === "month" ? "month" : "year";
    saveState();
    render();
  }));
  document.querySelectorAll("[data-open-data]").forEach((button) => button.addEventListener("click", openDataCenter));
  document.querySelectorAll("[data-toggle-project]").forEach((button) => button.addEventListener("click", () => {
    state.ui.expandedProjects[button.dataset.toggleProject] = !state.ui.expandedProjects[button.dataset.toggleProject];
    saveState();
    render();
  }));
  document.querySelectorAll("[data-toggle-monitor-row]").forEach((button) => button.addEventListener("click", (event) => {
    event.stopPropagation();
    state.ui.expandedProjects[button.dataset.toggleMonitorRow] = !state.ui.expandedProjects[button.dataset.toggleMonitorRow];
    saveState();
    render();
  }));
  document.querySelectorAll("[data-plan-scope]").forEach((button) => button.addEventListener("click", () => {
    state.ui.planEditorScope = button.dataset.planScope === "month" ? "month" : "year";
    saveState();
    render();
  }));
  document.querySelectorAll("[data-add-block]").forEach((button) => button.addEventListener("click", () => openAddBlockSheet(button.dataset.addBlock || state.ui.planEditorScope, button.dataset.defaultType)));
  document.querySelectorAll("[data-open-block]").forEach((button) => button.addEventListener("click", () => openBlockDetailSheet(button.dataset.blockScope || state.ui.planEditorScope, button.dataset.openBlock)));
  document.querySelectorAll("[data-open-plan-type]").forEach((button) => button.addEventListener("click", () => openPlanTypeSheet(button.dataset.openPlanType, button.dataset.typeScope || state.ui.planEditorScope)));
  document.querySelector("[data-open-plan-actions]")?.addEventListener("click", openPlanActionsSheet);
  document.querySelector("[data-open-more-pinned]")?.addEventListener("click", openMorePinnedSheet);
  document.querySelectorAll("[data-update-year-plan]").forEach((button) => button.addEventListener("click", updateYearPlanFromThisMonth));
  document.querySelectorAll("[data-apply-year-plan]").forEach((button) => button.addEventListener("click", applyYearPlanToThisMonth));
  document.querySelectorAll("[data-manage-transactions]").forEach((button) => button.addEventListener("click", openTransactionsManager));
  document.querySelector("[data-balance-plan]")?.addEventListener("click", openBalancePlanSheet);
}

function renderMonitorPage() {
  const projects = getPlanForScope("month", state.ui.selectedMonth, true);
  const allocation = calculateAllocationForProjects(projects);
  const allPinnedSpendRows = getPinnedSpendRows(projects);
  const pinnedSpendRows = allPinnedSpendRows.slice(0, 6);
  const vaults = getSavingsVaultRows(projects);
  return `
    <section class="page monitor-page">
      ${renderAllocationStatusCard(allocation)}
      ${pinnedSpendRows.length ? renderDashboardSummary() : renderMonitorEmpty()}
      ${pinnedSpendRows.length ? `<section class="monitor-card-grid">${pinnedSpendRows.map(renderSpendMonitorCard).join("")}${allPinnedSpendRows.length > 6 ? renderMorePinnedCard(allPinnedSpendRows.length - 6) : ""}</section>` : ""}
      ${renderSavingsVaultSection(vaults)}
      ${renderRecentActivity()}
    </section>
  `;
}

function renderPlanningPage() {
  const scope = state.ui.planEditorScope;
  const canEditMonth = hasYearPlan();
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month" && canEditMonth);
  const allocation = calculateAllocationForProjects(projects);
  const monthLabel = formatMonthLabel(state.ui.selectedMonth);
  const overrides = scope === "month" ? Object.keys(getMonthPlanRecord(state.ui.selectedMonth, false).actualOverrides).length : 0;
  const pinnedCount = getAllSubItems(projects).filter((item) => item.active && !item.archived && item.pinToMonitor).length;
  return `
    <section class="page planning-page">
      <article class="planning-card monthly-setup-card ${allocation.isReady ? "balanced" : allocation.status}">
        <div class="planning-accordion-head">
          <div><p class="section-kicker">${escapeHtml(scope === "year" ? "Template" : "This month")}</p><h2>${scope === "year" ? "Default Plan" : `${monthLabel} Plan`}</h2></div>
          <span class="header-status-pill ${allocation.isReady ? "safe" : allocation.status === "overallocated" ? "freeze" : "neutral"}">${escapeHtml(allocation.displayLabel)}</span>
        </div>
        <div class="scope-switch plan-scope-switch" role="tablist" aria-label="Plan scope">
          <button class="scope-button ${scope === "year" ? "is-active" : ""}" type="button" data-plan-scope="year">Default Plan</button>
          <button class="scope-button ${scope === "month" ? "is-active" : ""}" type="button" data-plan-scope="month" ${canEditMonth ? "" : "disabled"}>${escapeHtml(monthLabel)}</button>
        </div>
        ${renderAllocationMap(allocation)}
        ${renderAllocationMetrics(allocation)}
        ${pinnedCount || overrides ? `<div class="plan-meta-strip">${pinnedCount ? `<span>${pinnedCount}/6 pinned</span>` : ""}${overrides ? `<span>${overrides} overrides</span>` : ""}</div>` : ""}
        ${renderBalancePlanAction(allocation)}
        ${allocation.difference === 0 && allocation.income > 0 ? "" : `<p class="settings-note">${escapeHtml(allocation.message)}</p>`}
        <div class="plan-actions-row"><button class="overflow-button" type="button" data-open-plan-actions aria-label="Plan actions">•••</button></div>
      </article>
      ${scope === "month" && !canEditMonth ? `<section class="empty-state hero-empty"><strong>Default Plan needed.</strong><span>Create the template first.</span><button class="action-button" type="button" data-plan-scope="year">Open Default Plan</button></section>` : ""}
      ${scope === "month" && canEditMonth && !projects.length ? `<section class="empty-state hero-empty"><strong>${escapeHtml(monthLabel)} can copy the Default Plan.</strong><button class="action-button" type="button" data-add-block="month">Add Category</button></section>` : ""}
      ${projects.length ? renderPlanCategoryOverview(projects, scope) : ""}
      <div class="data-link-row"><button class="mini-button" type="button" data-open-data>Data / Backup</button></div>
    </section>
  `;
}

function renderAllocationStatusCard(allocation) {
  if (allocation.isReady) return "";
  const gapText = allocation.difference === 0 ? "" : ` · ${money(allocation.difference)} gap`;
  return `
    <section class="setup-status-card premium-status-strip ${allocation.isReady ? "balanced" : allocation.status}">
      <div>
        <p class="section-kicker">${escapeHtml(formatMonthLabel(state.ui.selectedMonth))} Plan</p>
        <h2>${escapeHtml(allocation.displayLabel)}${gapText}</h2>
      </div>
      <button class="ghost-button status-edit-action" type="button" data-open-setup data-plan-scope="${hasYearPlan() ? "month" : "year"}">${allocation.isReady ? "Edit" : "Review"}</button>
    </section>
  `;
}

function renderAllocationMetrics(allocation) {
  const metrics = [
    ["Income", allocation.income],
    ["Allocation", allocation.allocation],
    ...(allocation.difference === 0 ? [] : [["Gap", allocation.difference]])
  ];
  return `
    <div class="setup-metrics allocation-metrics">
      ${metrics.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${money(value)}</strong></div>`).join("")}
    </div>
  `;
}

function renderBalancePlanAction(allocation) {
  if (allocation.difference === 0) return "";
  const isSmallSurplus = allocation.difference > 0 && allocation.difference < 10;
  const label = allocation.difference < 0 ? "Review Allocation" : isSmallSurplus ? "Balance Plan" : "Review Allocation";
  return `
    <div class="notice-strip ${allocation.difference > 0 ? "success" : "danger"} almost-balanced-helper">
      <span>${allocation.difference > 0 ? `${money(allocation.difference)} left unallocated.` : `${money(Math.abs(allocation.difference))} overallocated.`}</span>
      <button class="action-button" type="button" data-balance-plan>${escapeHtml(label)}</button>
    </div>
  `;
}

function renderAllocationMap(allocation) {
  const income = Math.max(0, allocation.income);
  const base = Math.max(income, allocation.allocation, 1);
  const segments = [
    ["Spend", allocation.spend, "spend"],
    ["Debt", allocation.debt, "debt"],
    ["Save", allocation.save, "save"],
    ["Investment", allocation.investment, "investment"]
  ].filter(([, value]) => value > 0);
  const unallocated = allocation.difference > 0 ? allocation.difference : 0;
  const overallocated = allocation.difference < 0 ? Math.abs(allocation.difference) : 0;
  return `
    <section class="allocation-map ${allocation.status}">
      <div class="allocation-map-head"><span>Allocation Map</span><strong>${escapeHtml(allocation.displayLabel)}</strong></div>
      <div class="allocation-track" aria-label="Allocation map">
        ${segments.map(([label, value, type]) => `<span class="allocation-segment type-${type}" style="width:${clampPercent(value / base * 100)}%" title="${escapeHtml(label)} ${money(value)}"></span>`).join("")}
        ${unallocated ? `<span class="allocation-segment type-gap" style="width:${clampPercent(unallocated / base * 100)}%" title="Unallocated ${money(unallocated)}"></span>` : ""}
        ${overallocated ? `<span class="allocation-overflow" style="width:${clampPercent(overallocated / base * 100)}%" title="Overallocated ${money(overallocated)}"></span>` : ""}
      </div>
      <div class="allocation-legend">${segments.map(([label, value, type]) => `<span><i class="type-${type}"></i>${escapeHtml(label)} ${money(value)}</span>`).join("")}${unallocated ? `<span><i class="type-gap"></i>Unallocated ${money(unallocated)}</span>` : ""}${overallocated ? `<span><i class="type-over"></i>Over ${money(overallocated)}</span>` : ""}</div>
    </section>
  `;
}

function renderDashboardSummary() {
  const totals = calculateDashboardTotals();
  const allocation = calculateAllocationForProjects(getPlanForScope("month", state.ui.selectedMonth, false));
  const hasSpend = totals.monthSpent > 0;
  const pressure = totals.spendBudget ? totals.monthSpent / totals.spendBudget * 100 : 0;
  return `
    <section class="dashboard-summary premium-summary-strip compact-monitor-summary">
      <div class="summary-pressure"><span>Month pressure</span><div class="budget-bar"><div class="budget-fill" style="width:${clampPercent(pressure)}%"></div></div></div>
      <div><span>${hasSpend ? "Remaining" : "Available"}</span><strong>${money(totals.monthRemaining)}</strong></div>
      ${allocation.isReady ? "" : `<div><span>Plan</span><strong>${escapeHtml(allocation.displayLabel)}</strong></div>`}
    </section>
  `;
}

function renderSpendMonitorCard(entry) {
  const { item, project } = entry;
  const stats = calculateSubItemStats(item.id);
  const budget = item.monthlyAmount || 0;
  const spent = stats.monthSpent;
  const remaining = Math.max(0, budget - spent);
  const percent = budget ? spent / budget * 100 : 0;
  const rhythm = calculateWeeklyRhythm(item.id, budget);
  const status = getSpendStatus(spent, budget);
  const expanded = Boolean(state.ui.expandedProjects[item.id]);
  const recent = state.transactions.filter((tx) => tx.subItemId === item.id && tx.dateISO.startsWith(state.ui.selectedMonth)).sort(byDateDesc).slice(0, 3);
  return `
    <article class="monitor-spend-card ${status.key}" data-toggle-monitor-row="${item.id}">
      <div class="monitor-card-head">
        <div><h2>${escapeHtml(item.label)}</h2><span>${escapeHtml(project.label)}</span></div>
        <em class="monitor-status">${escapeHtml(status.label)}</em>
      </div>
      <div class="visual-spend">
        <div class="budget-bar"><div class="budget-fill" style="width:${clampPercent(percent)}%"></div></div>
        <div class="spend-figures"><strong>${money(spent)} / ${money(budget)}</strong><span>${money(remaining)} remaining</span></div>
      </div>
      <div class="weekly-visual" aria-label="Weekly pace">
        <span>Rhythm</span>
        <div class="week-rhythm">${rhythm.map((segment) => `<i class="${segment.status}" title="${escapeHtml(segment.label)}"></i>`).join("")}</div>
      </div>
      ${expanded ? `<div class="monitor-details">
        <span><em>Status</em><strong>${escapeHtml(status.note)}</strong></span>
        <span><em>This week</em><strong>${money(stats.weekSpent)} / ${money(stats.weeklyAllowance)}</strong></span>
        <span><em>Left this week</em><strong>${money(stats.weekRemaining)}</strong></span>
        <span><em>Month remaining</em><strong>${money(stats.monthRemaining)}</strong></span>
        ${recent.length ? `<div class="mini-activity">${recent.map((tx) => `<small>${formatDate(tx.dateISO)} · ${money(tx.amount)}${tx.note ? ` · ${escapeHtml(tx.note)}` : ""}</small>`).join("")}</div>` : `<small>No transactions this month.</small>`}
      </div>` : ""}
      <button class="details-affordance" type="button" data-toggle-monitor-row="${item.id}">${expanded ? "Hide ˄" : "Details ˅"}</button>
    </article>
  `;
}

function renderMorePinnedCard(count) {
  return `
    <button class="more-pinned-card" type="button" data-open-more-pinned>
      <strong>+${count} more</strong>
      <span>pinned items</span>
    </button>
  `;
}

function openMorePinnedSheet() {
  const rows = getPinnedSpendRows(getPlanForScope("month", state.ui.selectedMonth, false)).slice(6);
  modalRoot.innerHTML = renderSheet("More Pinned Items", `
    <div class="manager-list">
      ${rows.map(({ item, project }) => {
        const stats = calculateSubItemStats(item.id);
        return `<button class="manager-row" type="button" data-toggle-monitor-row="${item.id}"><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(project.label)} · ${money(stats.monthSpent)} / ${money(item.monthlyAmount)}</small></span><b>View</b></button>`;
      }).join("")}
    </div>
  `, "Monitor");
  bindSheetEvents();
}

function renderSavingsVaultSection(vaults) {
  if (!vaults.length) return "";
  return `
    <section class="savings-vault-section">
      <div class="section-head"><div><p class="section-kicker">Savings</p><h2>Vaults</h2></div><span class="reserve-pill gold">${vaults.length} active</span></div>
      <div class="vault-card-grid">${vaults.map(renderSavingsVaultCard).join("")}</div>
    </section>
  `;
}

function renderSavingsVaultCard(entry) {
  const { item, project } = entry;
  const target = Number(item.targetAmount) || 0;
  const current = Number(item.currentBalance) || 0;
  const percent = target ? current / target * 100 : 0;
  const remaining = Math.max(0, target - current);
  const label = target ? current >= target ? "Complete" : "Building" : "Tracking";
  return `
    <article class="savings-vault-card">
      <div class="vault-preview-head"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(label)}</span></div>
      <div class="vault-amount">${target ? `${money(current)} / ${money(target)}` : money(current)}</div>
      <div class="budget-bar vault-bar"><div class="budget-fill gold-fill" style="width:${clampPercent(percent)}%"></div></div>
      <p>Monthly plan: ${money(item.monthlyAmount)}</p>
      <p>${target ? `Balance: ${money(current)} / ${money(target)} · ${money(remaining)} to go` : `Balance: ${money(current)} · no target`}</p>
    </article>
  `;
}

function renderMonitorEmpty() {
  return `
    <section class="empty-state hero-empty">
      <strong>No dashboard items yet.</strong>
      <span>${hasYearPlan() ? "Pin Spend items from Planning." : "Create the Default Plan first."}</span>
      <button class="action-button" type="button" data-open-setup data-plan-scope="${hasYearPlan() ? "month" : "year"}">${hasYearPlan() ? "Open Planning" : "Open Default Plan"}</button>
    </section>
  `;
}

function renderPlanStrip(project, scope) {
  const stats = calculateProjectStats(project.id, getPlanForScope(scope, state.ui.selectedMonth, false));
  return `
    <article class="plan-strip type-${project.type}">
      <button class="plan-strip-main" type="button" data-open-block="${project.id}" data-block-scope="${scope}">
        <div>
          <strong>${escapeHtml(project.label)}</strong>
          <span>${escapeHtml(blockTypeLabel(project.type))}</span>
        </div>
        <div>
          <b>${money(stats.budget)}</b>
          <small>${project.subItems.length} items</small>
        </div>
        <em>Edit</em>
      </button>
    </article>
  `;
}

function renderGroupedPlanSections(projects, scope) {
  return `
    <section class="monthly-plan-sheet compact-plan-sheet">
      ${PROJECT_TYPES.map((type) => renderPlanTypeSection(type, projects.filter((project) => project.active && !project.archived && project.type === type).sort(byDisplayOrder), scope)).join("")}
    </section>
  `;
}

function renderPlanCategoryOverview(projects, scope) {
  const allocation = calculateAllocationForProjects(projects);
  const income = Math.max(1, allocation.income);
  return `
    <section class="plan-category-grid">
      ${PROJECT_TYPES.map((type) => {
        const blocks = projects.filter((project) => project.active && !project.archived && project.type === type).sort(byDisplayOrder);
        const total = sum(blocks.map((project) => calculateProjectStats(project.id, projects).budget));
        const rows = sum(blocks.map((project) => project.subItems.filter((item) => item.active && !item.archived).length));
        return `
          <button class="plan-category-card type-${type}" type="button" data-open-plan-type="${type}" data-type-scope="${scope}">
            <div class="plan-category-head"><span class="type-pill">${escapeHtml(blockTypeLabel(type))}</span><em>${money(total)}</em></div>
            <strong>${blocks.length ? `${blocks.length} categories` : "Empty"}</strong>
            <div class="type-share-bar"><span style="width:${clampPercent(total / income * 100)}%"></span></div>
            <small>${rows} items</small>
          </button>
        `;
      }).join("")}
    </section>
  `;
}

function openPlanTypeSheet(type, scope = state.ui.planEditorScope) {
  const normalizedType = normalizeProjectType(type) || "spend";
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const blocks = projects.filter((project) => project.active && !project.archived && project.type === normalizedType).sort(byDisplayOrder);
  const total = sum(blocks.map((project) => calculateProjectStats(project.id, projects).budget));
  sheetContext = { kind: "plan-type", scope, type: normalizedType };
  modalRoot.innerHTML = renderSheet(`${blockTypeLabel(normalizedType)} Categories`, `
    <div class="readonly-card weak-card">
      <div class="section-head"><h3>${money(total)}</h3><span class="tiny-label">${blocks.length} categories</span></div>
      <div class="type-share-bar"><span style="width:${clampPercent(total / Math.max(1, calculateAllocationForProjects(projects).income) * 100)}%"></span></div>
    </div>
    <div class="manager-list plan-type-list">
      ${blocks.length ? blocks.map((project) => renderPlanStrip(project, scope)).join("") : `<div class="empty-state">No ${escapeHtml(blockTypeLabel(normalizedType).toLowerCase())} categories yet.</div>`}
    </div>
    <button class="action-button" type="button" data-add-block="${scope}" data-default-type="${normalizedType}">Add ${escapeHtml(blockTypeLabel(normalizedType))} Category</button>
  `, "Plan");
  bindSheetEvents();
}

function openPlanActionsSheet() {
  const scope = state.ui.planEditorScope;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  modalRoot.innerHTML = renderSheet("Plan Actions", `
    <div class="manager-list">
      <button class="manager-row" type="button" data-add-block="${scope}"><span><strong>Add Category</strong><small>Create a new plan category.</small></span><b>Open</b></button>
      ${scope === "month" && hasYearPlan() ? `<button class="manager-row" type="button" data-apply-year-plan><span><strong>Reset This Month from Default</strong><small>Replace only this month.</small></span><b>Apply</b></button>` : ""}
      ${scope === "month" && projects.length ? `<button class="manager-row" type="button" data-update-year-plan><span><strong>Use This Month as Default</strong><small>Only future uncreated months use it.</small></span><b>Set</b></button>` : ""}
      <button class="manager-row" type="button" data-open-data><span><strong>Data / Backup</strong><small>CSV export, import, reset.</small></span><b>Open</b></button>
    </div>
  `, "Plan");
  bindSheetEvents();
}

function renderPlanTypeSection(type, projects, scope) {
  const plan = getPlanForScope(scope, state.ui.selectedMonth, false);
  const total = sum(projects.map((project) => calculateProjectStats(project.id, plan).budget));
  const income = Math.max(1, calculateAllocationForProjects(plan).income);
  return `
    <section class="plan-type-section type-${type}">
      <div class="plan-type-head">
        <div><span class="type-pill">${escapeHtml(blockTypeLabel(type))}</span><strong>${money(total)}</strong></div>
        <em>${projects.length} blocks</em>
      </div>
      <div class="type-share-bar"><span style="width:${clampPercent(total / income * 100)}%"></span></div>
      ${projects.length ? projects.map((project) => renderPlanStrip(project, scope)).join("") : `<div class="plan-type-empty">No ${escapeHtml(blockTypeLabel(type).toLowerCase())} blocks yet.</div>`}
    </section>
  `;
}

function renderProjectCard(project) {
  const stats = calculatePinnedProjectStats(project.id);
  const expanded = state.ui.expandedProjects[project.id] !== false;
  const items = project.subItems.filter((item) => item.active && !item.archived && item.pinToMonitor);
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

function calculatePinnedProjectStats(projectId, projects = getPlanForScope("month", state.ui.selectedMonth, false), monthKey = state.ui.selectedMonth) {
  const project = getProjectById(projectId, projects);
  if (!project) return { budget: 0, spent: 0, remaining: 0 };
  const items = project.subItems.filter((item) => item.active && !item.archived && item.pinToMonitor);
  const budget = sum(items.map((item) => item.monthlyAmount));
  const spent = sum(items.map((item) => getRowActual(item, projects, monthKey)));
  return { budget, spent, remaining: Math.max(0, budget - spent) };
}

function renderSubItemProgress(project, item) {
  const stats = calculateSubItemStats(item.id);
  const percent = item.monthlyAmount ? stats.monthSpent / item.monthlyAmount * 100 : 0;
  const weekly = project.type === "spend" && item.pinToMonitor
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
  if (!recent.length) return "";
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
        <strong>No pinned Spend items.</strong>
        <span>Pin up to 6 items from Planning.</span>
        <button class="action-button" type="button" data-open-setup data-plan-scope="${hasYearPlan() ? "month" : "year"}">${hasYearPlan() ? "Open Planning" : "Open Default Plan"}</button>
      </div>
    `, "Entry");
  }
  const template = state.ui.lastTransactionTemplate;
  const selected = editing?.subItemId || (template && items.some((item) => item.id === template.subItemId) ? template.subItemId : items[0]?.id);
  const amountValue = editing?.amountInput || editing?.amount || "";
  return renderSheet(editing ? "Edit Entry" : "Quick Add", `
    <form id="transactionForm" class="quick-form">
      <input name="id" type="hidden" value="${escapeHtml(editing?.id || "")}" />
      <label class="amount-field formula-field"><span>Amount</span><input name="amount" type="text" inputmode="decimal" value="${escapeHtml(amountValue)}" data-formula-input required /><small class="formula-preview"></small></label>
      <input name="subItemId" type="hidden" value="${escapeHtml(selected)}" />
      <div class="category-chip-grid">${items.map((item) => `<button class="category-chip ${item.id === selected ? "is-active" : ""}" type="button" data-item-chip="${item.id}">${escapeHtml(item.label)}</button>`).join("")}</div>
      <label class="field"><span>Date</span><input name="dateISO" type="date" value="${escapeHtml(editing?.dateISO || defaultDateForMonth(state.ui.selectedMonth))}" required /></label>
      <details class="optional-entry"><summary>Note</summary><label class="field"><span>Optional</span><input name="note" type="text" value="${escapeHtml(editing?.note || "")}" placeholder="Optional note" /></label></details>
      <button class="action-button sheet-save" type="submit">${editing ? "Save Entry" : "Add Entry"}</button>
    </form>
  `, "Entry");
}

function openAddBlockSheet(scope = state.ui.planEditorScope, defaultType = "") {
  sheetContext = { kind: "add-block", scope, defaultType: normalizeProjectType(defaultType) };
  modalRoot.innerHTML = renderAddBlockSheet(scope, defaultType);
  bindSheetEvents();
}

function renderAddBlockSheet(scope, defaultType = "") {
  const selectedType = normalizeProjectType(defaultType) || "spend";
  return renderSheet(scope === "year" ? "Add Default Category" : `Add ${formatMonthLabel(state.ui.selectedMonth)} Category`, `
    <form id="projectForm" class="quick-form" data-plan-scope="${scope}">
      <label class="field"><span>Category name</span><input name="label" required /></label>
      <label class="field"><span>Type</span><select name="type">${PROJECT_TYPES.map((type) => `<option value="${type}" ${type === selectedType ? "selected" : ""}>${escapeHtml(blockTypeLabel(type))}</option>`).join("")}</select></label>
      <button class="action-button sheet-save" type="submit">Add Category</button>
    </form>
  `, "Plan");
}

function openBlockDetailSheet(scope, blockId, options = {}) {
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const project = getProjectById(blockId, projects);
  if (!project) return;
  sheetContext = { kind: "block-detail", scope, blockId };
  modalRoot.innerHTML = renderBlockDetailSheet(scope, project);
  bindSheetEvents();
  if (options.focusRowInput) {
    requestAnimationFrame(() => modalRoot.querySelector("#blockRowName")?.focus());
  }
}

function renderBlockDetailSheet(scope, project) {
  const stats = calculateProjectStats(project.id, getPlanForScope(scope, state.ui.selectedMonth, false));
  const actualTotal = scope === "year" ? stats.budget : stats.spent;
  return renderSheet(scope === "year" ? "Default Category" : `${formatMonthLabel(state.ui.selectedMonth)} Category`, `
    <div class="section-head"><div><h3>${escapeHtml(project.label)}</h3><p class="settings-note">${escapeHtml(blockTypeLabel(project.type))} · ${project.subItems.length} items${project.type === "spend" ? ` · ${getPinnedSpendCount(getPlanForScope(scope, state.ui.selectedMonth, false))}/6 pinned` : ""}</p></div><strong>${money(stats.budget)}</strong></div>
    <div class="plan-table">
      <div class="plan-row plan-header"><span>Item</span><span>Plan</span><span>Actual</span><span>Status</span><span></span></div>
      ${project.subItems.length ? project.subItems.map((item) => renderBlockDetailRow(project, item, scope)).join("") : `<div class="plan-row plan-empty"><span>No items yet.</span><span></span><span></span><span></span><span></span></div>`}
      <div class="plan-row plan-total"><span>Total</span><span>${money(stats.budget)}</span><span>${money(actualTotal)}</span><span></span><span></span></div>
    </div>
    <form class="quick-form block-detail-form" data-add-row-form="${project.id}" data-plan-scope="${scope}">
      <div class="section-head"><h3>Add Item</h3><span class="tiny-label">Stay here</span></div>
      <label class="field"><span>Item name</span><input id="blockRowName" name="label" required /></label>
      <label class="field formula-field"><span>Amount</span><input name="monthlyAmount" type="text" inputmode="decimal" data-formula-input required /><small class="formula-preview"></small></label>
      <label class="field"><span>Frequency</span><select name="frequency"><option value="monthly">Monthly</option><option value="biweekly">Biweekly</option></select></label>
      ${project.type === "spend" ? renderPinField(project, null, scope) : ""}
      ${project.type === "save" ? renderVaultFields() : ""}
      <button class="action-button sheet-save" type="submit">Add Item</button>
    </form>
    <details class="advanced-actions"><summary>More category actions</summary><div class="button-row">
      <button class="ghost-button" type="button" data-open-paste-rows="${project.id}" data-block-scope="${scope}">Paste Items</button>
      <button class="ghost-button" type="button" data-rename-block="${project.id}" data-block-scope="${scope}">Rename</button>
      <button class="ghost-button" type="button" data-change-block-type="${project.id}" data-block-scope="${scope}">Change Type</button>
      <button class="ghost-button" type="button" data-move-block="${project.id}" data-direction="-1" data-block-scope="${scope}">Move Up</button>
      <button class="ghost-button" type="button" data-move-block="${project.id}" data-direction="1" data-block-scope="${scope}">Move Down</button>
      <button class="danger-button" type="button" data-delete-project="${project.id}" data-block-scope="${scope}">Delete</button>
    </div></details>
    <div class="button-row">
      <button class="action-button" type="button" data-close-sheet>Done</button>
    </div>
  `, "Plan");
}

function renderBlockDetailRow(project, item, scope) {
  const actual = scope === "year" ? item.monthlyAmount : getRowActual(item, getPlanForScope(scope, state.ui.selectedMonth, false), state.ui.selectedMonth);
  const status = scope === "month" && getActualOverride(item.id) ? "Override" : item.showAsVault && project.type === "save" ? "Vault" : item.pinToMonitor ? "Pinned" : "Plan";
  return `
    <div class="plan-row">
      <span>${escapeHtml(item.label)}</span>
      <span>${money(item.monthlyAmount)}<small>${escapeHtml(frequencyLabel(item.frequency))}</small></span>
      <span>${money(actual)}</span>
      <span><em class="row-status">${escapeHtml(status)}</em></span>
      <span class="row-action-cell">
        <button class="mini-button" type="button" data-edit-row="${item.id}" data-row-scope="${scope}">Edit</button>
        <details class="row-more-actions"><summary>More</summary><div>${scope === "month" ? `<button class="mini-button" type="button" data-override-row="${item.id}">Override Actual</button>` : ""}<button class="mini-button danger-text" type="button" data-delete-item="${item.id}" data-row-scope="${scope}">Delete</button></div></details>
      </span>
    </div>
  `;
}

function renderVaultFields(item = {}) {
  return `
    <label class="checkbox-row"><input name="showAsVault" type="checkbox" ${item.showAsVault ? "checked" : ""} /><span>Show as Savings Vault</span></label>
    <label class="field formula-field"><span>Target amount</span><input name="targetAmount" type="text" inputmode="decimal" value="${escapeHtml(item.targetAmountInput || "")}" data-formula-input /><small class="formula-preview"></small></label>
    <label class="field formula-field"><span>Current balance</span><input name="currentBalance" type="text" inputmode="decimal" value="${escapeHtml(item.currentBalanceInput || "")}" data-formula-input /><small class="formula-preview"></small></label>
  `;
}

function renderPinField(project, item = null, scope = state.ui.planEditorScope) {
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  const isPinned = Boolean(item?.pinToMonitor);
  const limitReached = !isPinned && getPinnedSpendCount(projects) >= 6;
  return `
    <label class="checkbox-row ${limitReached ? "is-disabled" : ""}">
      <input name="pinToMonitor" type="checkbox" ${isPinned ? "checked" : ""} ${limitReached ? "disabled" : ""} />
      <span>Pin to Monitor${limitReached ? " · limit 6" : ""}</span>
    </label>
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
        <label class="formula-stack"><input name="monthlyAmount" type="text" inputmode="decimal" placeholder="Plan amount" data-formula-input required /><small class="formula-preview"></small></label>
        <button class="mini-button" type="submit">+ Add Item</button>
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
      <span><button class="mini-button" type="button" data-edit-row="${item.id}">Edit</button><button class="mini-button danger-text" type="button" data-delete-item="${item.id}">×</button></span>
    </div>
  `;
}

function openEditRowSheet(id, scope = state.ui.planEditorScope) {
  const item = getSubItemById(id, getPlanForScope(scope, state.ui.selectedMonth, false));
  if (!item) return;
  const project = getProjectById(item.parentProjectId, getPlanForScope(scope, state.ui.selectedMonth, false));
  sheetContext = { kind: "row-edit", scope, rowId: id, blockId: item.parentProjectId };
  modalRoot.innerHTML = renderSheet("Edit Item", `
    <form id="rowEditForm" class="quick-form" data-row-id="${escapeHtml(item.id)}" data-row-scope="${scope}">
      <label class="field"><span>Item name</span><input name="label" value="${escapeHtml(item.label)}" required /></label>
      <label class="field formula-field"><span>Amount</span><input name="monthlyAmount" type="text" inputmode="decimal" value="${escapeHtml(item.amountInput || item.monthlyAmountInput || item.monthlyAmount)}" data-formula-input required /><small class="formula-preview"></small></label>
      <label class="field"><span>Frequency</span><select name="frequency"><option value="monthly" ${item.frequency === "monthly" ? "selected" : ""}>Monthly</option><option value="biweekly" ${item.frequency === "biweekly" ? "selected" : ""}>Biweekly</option></select></label>
      ${project?.type === "spend" ? renderPinField(project, item, scope) : ""}
      ${project?.type === "save" ? renderVaultFields(item) : ""}
      <button class="action-button sheet-save" type="submit">Save Item</button>
    </form>
  `, "Plan");
  bindSheetEvents();
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
  bindFormulaInputs(modalRoot);
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  modalRoot.querySelectorAll("[data-open-data]").forEach((button) => button.addEventListener("click", openDataCenter));
  modalRoot.querySelectorAll("[data-open-block]").forEach((button) => button.addEventListener("click", () => openBlockDetailSheet(button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope, button.dataset.openBlock)));
  modalRoot.querySelectorAll("[data-toggle-monitor-row]").forEach((button) => button.addEventListener("click", () => {
    state.ui.expandedProjects[button.dataset.toggleMonitorRow] = true;
    saveState();
    closeSheet();
  }));
  modalRoot.querySelectorAll("[data-add-block]").forEach((button) => button.addEventListener("click", () => openAddBlockSheet(button.dataset.addBlock || sheetContext?.scope || state.ui.planEditorScope, button.dataset.defaultType)));
  modalRoot.querySelectorAll("[data-update-year-plan]").forEach((button) => button.addEventListener("click", updateYearPlanFromThisMonth));
  modalRoot.querySelectorAll("[data-apply-year-plan]").forEach((button) => button.addEventListener("click", applyYearPlanToThisMonth));
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeSheet();
  });
  modalRoot.querySelector("[data-finish-setup]")?.addEventListener("click", finishSetup);
  modalRoot.querySelector("#projectForm")?.addEventListener("submit", addProject);
  modalRoot.querySelectorAll("[data-add-row-form]").forEach((form) => form.addEventListener("submit", addSubItem));
  modalRoot.querySelector("#rowEditForm")?.addEventListener("submit", saveRowEdit);
  modalRoot.querySelectorAll("[data-delete-project]").forEach((button) => button.addEventListener("click", () => deleteProject(button.dataset.deleteProject, button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-delete-item]").forEach((button) => button.addEventListener("click", () => deleteSubItem(button.dataset.deleteItem, button.dataset.rowScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-edit-row]").forEach((button) => button.addEventListener("click", () => openEditRowSheet(button.dataset.editRow, button.dataset.rowScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-rename-block]").forEach((button) => button.addEventListener("click", () => renameBlock(button.dataset.renameBlock, button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-change-block-type]").forEach((button) => button.addEventListener("click", () => changeBlockType(button.dataset.changeBlockType, button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-move-block]").forEach((button) => button.addEventListener("click", () => moveBlock(button.dataset.moveBlock, Number(button.dataset.direction), button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-override-row]").forEach((button) => button.addEventListener("click", () => openOverrideSheet(button.dataset.overrideRow)));
  modalRoot.querySelectorAll("[data-open-paste-rows]").forEach((button) => button.addEventListener("click", () => openPasteRowsSheet(button.dataset.openPasteRows, button.dataset.blockScope || sheetContext?.scope || state.ui.planEditorScope)));
  modalRoot.querySelectorAll("[data-allocate-to-row]").forEach((button) => button.addEventListener("click", () => allocateGapToRow(button.dataset.allocateToRow)));
  modalRoot.querySelector("[data-create-save-row]")?.addEventListener("click", createSaveRowForGap);
  modalRoot.querySelector("#overrideForm")?.addEventListener("submit", saveOverride);
  modalRoot.querySelector("#clearOverrideButton")?.addEventListener("click", clearOverride);
  modalRoot.querySelector("#pasteRowsForm")?.addEventListener("submit", pasteRows);
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
}

function closeSheet() {
  pendingCsvImport = null;
  sheetContext = null;
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  saveState();
  render();
}

function addProject(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  const scope = event.currentTarget.dataset.planScope || state.ui.planEditorScope;
  if (!label) return;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  projects.push(normalizeProject({ id: uniqueId(slugify(label), projects.map((item) => item.id)), label, type: form.get("type"), displayOrder: projects.length + 1, subItems: [] }));
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  openBlockDetailSheet(scope, projects[projects.length - 1].id, { focusRowInput: true });
}

function addSubItem(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const scope = event.currentTarget.dataset.planScope || sheetContext?.scope || state.ui.planEditorScope;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const project = getProjectById(event.currentTarget.dataset.addRowForm, projects);
  const label = String(form.get("label") || "").trim();
  const parsedAmount = parseAmountField(event.currentTarget.querySelector("input[name='monthlyAmount']"));
  const parsedTarget = parseOptionalAmountField(event.currentTarget.querySelector("input[name='targetAmount']"));
  const parsedCurrent = parseOptionalAmountField(event.currentTarget.querySelector("input[name='currentBalance']"));
  const frequency = normalizeFrequency(form.get("frequency"));
  const monthlyAmount = monthlyAmountFromParsed(parsedAmount, frequency);
  if (!project || !label) return;
  if (!parsedAmount.ok || !parsedTarget.ok || !parsedCurrent.ok) {
    showToast("Invalid formula.");
    return;
  }
  const pinToMonitor = project.type === "spend" && Boolean(form.get("pinToMonitor"));
  if (pinToMonitor && getPinnedSpendCount(projects) >= 6) {
    showToast("Monitor is limited to 6 pinned Spend items.");
    return;
  }
  project.subItems.push(normalizeSubItem({
    id: uniqueId(slugify(label), getAllSubItems(projects).map((item) => item.id)),
    parentProjectId: project.id,
    label,
    amountInput: parsedAmount.input,
    monthlyAmountInput: parsedAmount.input,
    frequency,
    monthlyAmount,
    pinToMonitor,
    recordable: pinToMonitor,
    showOnDashboard: pinToMonitor,
    showAsVault: project.type === "save" && Boolean(form.get("showAsVault")),
    targetAmountInput: parsedTarget.input,
    targetAmount: parsedTarget.value,
    currentBalanceInput: parsedCurrent.input,
    currentBalance: parsedCurrent.value,
    displayOrder: project.subItems.length + 1
  }));
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  openBlockDetailSheet(scope, project.id, { focusRowInput: true });
}

function saveRowEdit(event) {
  event.preventDefault();
  const scope = event.currentTarget.dataset.rowScope || sheetContext?.scope || state.ui.planEditorScope;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const item = getSubItemById(event.currentTarget.dataset.rowId, projects);
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  const parsedAmount = parseAmountField(event.currentTarget.querySelector("input[name='monthlyAmount']"));
  const parsedTarget = parseOptionalAmountField(event.currentTarget.querySelector("input[name='targetAmount']"));
  const parsedCurrent = parseOptionalAmountField(event.currentTarget.querySelector("input[name='currentBalance']"));
  const frequency = normalizeFrequency(form.get("frequency"));
  const project = getProjectById(item.parentProjectId, projects);
  const pinToMonitor = project?.type === "spend" && Boolean(form.get("pinToMonitor"));
  if (!item || !label) return;
  if (!parsedAmount.ok || !parsedTarget.ok || !parsedCurrent.ok) {
    showToast("Invalid formula.");
    return;
  }
  if (pinToMonitor && !item.pinToMonitor && getPinnedSpendCount(projects) >= 6) {
    showToast("Monitor is limited to 6 pinned Spend items.");
    return;
  }
  const realItem = project?.subItems.find((row) => row.id === item.id);
  if (!realItem) return;
  realItem.label = label;
  realItem.amountInput = parsedAmount.input;
  realItem.monthlyAmountInput = parsedAmount.input;
  realItem.frequency = frequency;
  realItem.monthlyAmount = monthlyAmountFromParsed(parsedAmount, frequency);
  realItem.pinToMonitor = pinToMonitor;
  realItem.recordable = pinToMonitor && project.type === "spend";
  realItem.showOnDashboard = pinToMonitor;
  realItem.showAsVault = project.type === "save" && Boolean(form.get("showAsVault"));
  realItem.targetAmountInput = parsedTarget.input;
  realItem.targetAmount = parsedTarget.value;
  realItem.currentBalanceInput = parsedCurrent.input;
  realItem.currentBalance = parsedCurrent.value;
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  openBlockDetailSheet(scope, project.id);
}

function deleteProject(id, scope = state.ui.planEditorScope) {
  if (!window.confirm("Delete this category and its items?")) return;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  const ids = new Set((getProjectById(id, projects)?.subItems || []).map((item) => item.id));
  const nextProjects = projects.filter((project) => project.id !== id);
  replacePlanForScope(scope, nextProjects, state.ui.selectedMonth);
  if (scope === "month") state.transactions = state.transactions.filter((tx) => !ids.has(tx.subItemId));
  saveState();
  closeSheet();
}

function deleteSubItem(id, scope = state.ui.planEditorScope) {
  if (!window.confirm("Delete this row and its transactions?")) return;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  projects.forEach((project) => {
    project.subItems = project.subItems.filter((item) => item.id !== id);
  });
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  if (scope === "month") state.transactions = state.transactions.filter((tx) => tx.subItemId !== id);
  if (scope === "month") delete getMonthPlanRecord(state.ui.selectedMonth, true).actualOverrides[id];
  saveState();
  if (sheetContext?.kind === "block-detail" && sheetContext.blockId) openBlockDetailSheet(scope, sheetContext.blockId);
  else closeSheet();
}

function renameBlock(id, scope = state.ui.planEditorScope) {
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  const project = getProjectById(id, projects);
  if (!project) return;
  const label = window.prompt("Category name", project.label);
  if (!label || !label.trim()) return;
  project.label = label.trim();
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  if (sheetContext?.kind === "block-detail") openBlockDetailSheet(scope, id);
  else render();
}

function changeBlockType(id, scope = state.ui.planEditorScope) {
  const projects = getPlanForScope(scope, state.ui.selectedMonth, false);
  const project = getProjectById(id, projects);
  if (!project) return;
  const type = window.prompt("Type: Income, Spend, Debt, Save, or Investment", blockTypeLabel(project.type));
  const normalized = normalizeProjectType(type);
  if (!normalized) {
    showToast("Choose Income, Spend, Debt, Save, or Investment.");
    return;
  }
  project.type = normalized;
  project.subItems.forEach((item) => {
    item.pinToMonitor = item.pinToMonitor && normalized === "spend";
    item.recordable = item.pinToMonitor;
    item.showOnDashboard = item.pinToMonitor;
  });
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  if (sheetContext?.kind === "block-detail") openBlockDetailSheet(scope, id);
  else render();
}

function moveBlock(id, direction, scope = state.ui.planEditorScope) {
  const projects = [...getPlanForScope(scope, state.ui.selectedMonth, false)].sort(byDisplayOrder);
  const index = projects.findIndex((project) => project.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) return;
  [projects[index].displayOrder, projects[nextIndex].displayOrder] = [projects[nextIndex].displayOrder, projects[index].displayOrder];
  replacePlanForScope(scope, projects.sort(byDisplayOrder), state.ui.selectedMonth);
  saveState();
  if (sheetContext?.kind === "block-detail") openBlockDetailSheet(scope, id);
  else render();
}

function finishSetup() {
  const allocation = calculateAllocationForProjects(getPlanForScope(state.ui.planEditorScope, state.ui.selectedMonth, false));
  if (!allocation.isReady) {
    showToast("Setup can finish only when income exists and equals total allocation.");
    return;
  }
  state.ui.setupComplete = true;
  saveState();
  showToast("Monthly setup complete.");
  closeSheet();
}

function openBalancePlanSheet() {
  const scope = state.ui.activeTab === "planning" ? state.ui.planEditorScope : "month";
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const allocation = calculateAllocationForProjects(projects);
  if (allocation.difference === 0) return;
  const isSurplus = allocation.difference > 0;
  const amount = Math.abs(allocation.difference);
  sheetContext = { kind: "balance-plan", scope, amount: allocation.difference };
  const saveRows = getAllSubItems(projects).filter((item) => item.active && !item.archived && getProjectById(item.parentProjectId, projects)?.type === "save");
  modalRoot.innerHTML = renderSheet("Balance Plan", `
    <div class="readonly-card weak-card"><div class="section-head"><h3>${isSurplus ? `${money(amount)} available` : `${money(amount)} shortage`}</h3><span class="tiny-label">${isSurplus ? "Add to Save" : "Reduce Save"}</span></div></div>
    <div class="manager-list">
      ${saveRows.length ? saveRows.map((item) => `<button class="manager-row" type="button" data-allocate-to-row="${item.id}"><span><strong>${escapeHtml(item.label)}</strong><small>${money(item.monthlyAmount)} planned</small></span><b>${isSurplus ? "Add surplus" : "Reduce"}</b></button>`).join("") : `<div class="empty-state">No Save rows yet.</div>`}
    </div>
    ${isSurplus ? `<button class="action-button" type="button" data-create-save-row>+ Create New Save Item</button>` : `<p class="settings-note">Create or edit a Save row manually if no row can absorb the shortage.</p>`}
  `, "Plan");
  bindSheetEvents();
}

function allocateGapToRow(rowId) {
  const scope = sheetContext?.scope || state.ui.planEditorScope;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const allocation = calculateAllocationForProjects(projects);
  const project = projects.find((block) => block.subItems.some((row) => row.id === rowId));
  const item = project?.subItems.find((row) => row.id === rowId);
  if (!item || allocation.difference === 0) return;
  if (allocation.difference < 0 && item.monthlyAmount < Math.abs(allocation.difference)) {
    showToast("That Save row would become negative. Choose another row or edit manually.");
    return;
  }
  item.monthlyAmount = roundCents(item.monthlyAmount + allocation.difference);
  item.amountInput = String(item.monthlyAmount);
  item.monthlyAmountInput = item.amountInput;
  item.frequency = "monthly";
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  showToast("Plan balanced.");
  closeSheet();
}

function createSaveRowForGap() {
  const scope = sheetContext?.scope || state.ui.planEditorScope;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const allocation = calculateAllocationForProjects(projects);
  if (!(allocation.difference > 0)) return;
  let project = projects.find((item) => item.active && !item.archived && item.type === "save");
  if (!project) {
    project = normalizeProject({ id: uniqueId("savings", projects.map((item) => item.id)), label: "Savings", type: "save", displayOrder: projects.length + 1, subItems: [] });
    projects.push(project);
  }
  project.subItems.push(normalizeSubItem({ id: uniqueId("allocated-gap", getAllSubItems(projects).map((item) => item.id)), parentProjectId: project.id, label: "Allocated Gap", amountInput: String(allocation.difference), frequency: "monthly", monthlyAmount: allocation.difference, pinToMonitor: false, active: true, archived: false, displayOrder: project.subItems.length + 1 }));
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  showToast("Save row created.");
  closeSheet();
}

function updateYearPlanFromThisMonth() {
  const monthProjects = getPlanForScope("month", state.ui.selectedMonth, false);
  if (!monthProjects.length) {
    showToast("Create this month before updating the Default Plan.");
    return;
  }
  state.settings.yearPlan = makeYearPlanRecord(cloneProjects(monthProjects, true), { updatedAtISO: new Date().toISOString() });
  saveState();
  showToast("Default Plan updated.");
  render();
}

function applyYearPlanToThisMonth() {
  if (!hasYearPlan()) return;
  const monthKey = state.ui.selectedMonth;
  const existing = getMonthPlanRecord(monthKey, false);
  const hasMonthData = existing.blocks.length || Object.keys(existing.actualOverrides || {}).length || state.transactions.some((tx) => tx.dateISO.startsWith(monthKey));
  if (hasMonthData && !window.confirm("Reset this month from the Default Plan? Transactions stay saved, but this month’s categories and overrides will be replaced.")) return;
  state.settings.monthlyPlans[monthKey] = makeMonthlyPlanRecord(cloneProjects(getYearPlan(), false), {
    createdFromYearPlanAtISO: new Date().toISOString(),
    updatedAtISO: new Date().toISOString()
  });
  saveState();
  showToast("Default Plan applied to this month.");
  render();
}

function openOverrideSheet(rowId) {
  const projects = getPlanForScope("month", state.ui.selectedMonth, true);
  const item = getSubItemById(rowId, projects);
  if (!item) return;
  const actual = getRowActual(item, projects, state.ui.selectedMonth);
  const override = getActualOverride(rowId);
  sheetContext = { kind: "override", scope: "month", rowId, blockId: item.parentProjectId };
  modalRoot.innerHTML = renderSheet("Override Actual", `
    <form id="overrideForm" class="quick-form" data-row-id="${escapeHtml(rowId)}">
      <div class="readonly-card weak-card"><div class="section-head"><h3>${escapeHtml(item.label)}</h3><span class="tiny-label">Actual</span></div><p class="settings-note">Plan ${money(item.monthlyAmount)} · Current ${money(actual)}</p></div>
      <label class="field formula-field"><span>Override actual</span><input name="amount" type="text" inputmode="decimal" value="${escapeHtml(override?.amountInput || "")}" data-formula-input required /><small class="formula-preview"></small></label>
      <label class="field"><span>Note</span><input name="note" type="text" value="${escapeHtml(override?.note || "")}" /></label>
      <div class="button-row"><button class="action-button" type="submit">Save Override</button><button id="clearOverrideButton" class="ghost-button" type="button">Clear Override</button></div>
    </form>
  `, "Plan");
  bindSheetEvents();
}

function saveOverride(event) {
  event.preventDefault();
  const rowId = event.currentTarget.dataset.rowId;
  const parsed = parseAmountField(event.currentTarget.querySelector("input[name='amount']"));
  if (!parsed.ok) {
    showToast("Invalid formula.");
    return;
  }
  const month = getMonthPlanRecord(state.ui.selectedMonth, true);
  month.actualOverrides[rowId] = {
    amountInput: parsed.input,
    amount: parsed.value,
    note: String(new FormData(event.currentTarget).get("note") || "").trim(),
    updatedAtISO: new Date().toISOString()
  };
  saveState();
  showToast("Actual override saved.");
  openBlockDetailSheet("month", sheetContext?.blockId);
}

function clearOverride() {
  const rowId = sheetContext?.rowId;
  const blockId = sheetContext?.blockId;
  if (!rowId) return;
  const month = getMonthPlanRecord(state.ui.selectedMonth, true);
  delete month.actualOverrides[rowId];
  month.updatedAtISO = new Date().toISOString();
  saveState();
  showToast("Override cleared.");
  openBlockDetailSheet("month", blockId);
}

function openPasteRowsSheet(blockId, scope) {
  const project = getProjectById(blockId, getPlanForScope(scope, state.ui.selectedMonth, scope === "month"));
  if (!project) return;
  sheetContext = { kind: "paste-rows", scope, blockId };
  modalRoot.innerHTML = renderSheet("Paste Items", `
    <form id="pasteRowsForm" class="quick-form">
      <p class="settings-note">One item per line: item name, amount, frequency, optional pin.</p>
      <label class="field"><span>Items</span><textarea name="rows" rows="8" placeholder="Groceries,750,monthly,pin&#10;Paycheque,2300,biweekly"></textarea></label>
      <button class="action-button" type="submit">Add Items</button>
    </form>
  `, "Plan");
  bindSheetEvents();
}

function pasteRows(event) {
  event.preventDefault();
  const scope = sheetContext?.scope || state.ui.planEditorScope;
  const blockId = sheetContext?.blockId;
  const projects = getPlanForScope(scope, state.ui.selectedMonth, scope === "month");
  const project = getProjectById(blockId, projects);
  if (!project) return;
  const lines = String(new FormData(event.currentTarget).get("rows") || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let added = 0;
  let skipped = 0;
  lines.forEach((line) => {
    const [labelRaw, amountRaw, frequencyRaw, pinRaw] = line.split(",").map((part) => String(part || "").trim());
    const parsed = parseFormula(amountRaw);
    if (!labelRaw || !parsed.ok) {
      skipped += 1;
      return;
    }
    const frequency = normalizeFrequency(frequencyRaw);
    let pinToMonitor = /^pin|yes|true|monitor$/i.test(pinRaw || "");
    if (pinToMonitor && project.type === "spend" && getPinnedSpendCount(projects) >= 6) pinToMonitor = false;
    project.subItems.push(normalizeSubItem({
      id: uniqueId(slugify(labelRaw), getAllSubItems(projects).map((item) => item.id)),
      parentProjectId: project.id,
      label: labelRaw,
      amountInput: parsed.input,
      frequency,
      monthlyAmount: monthlyAmountFromParsed(parsed, frequency),
      pinToMonitor,
      recordable: pinToMonitor && project.type === "spend",
      showOnDashboard: pinToMonitor,
      displayOrder: project.subItems.length + 1
    }));
    added += 1;
  });
  replacePlanForScope(scope, projects, state.ui.selectedMonth);
  saveState();
  showToast(skipped ? `${added} items added, ${skipped} skipped.` : `${added} items added.`);
  openBlockDetailSheet(scope, blockId, { focusRowInput: true });
}

function saveTransaction(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subItemId = String(form.get("subItemId") || "");
  if (!getRecordableItems().some((item) => item.id === subItemId)) {
    showToast("Choose a Spend row.");
    return;
  }
  const parsedAmount = parseAmountField(event.currentTarget.querySelector("input[name='amount']"));
  if (!parsedAmount.ok) {
    showToast("Invalid formula.");
    return;
  }
  const transaction = { id: String(form.get("id") || uid("txn")), dateISO: normalizeDateValue(form.get("dateISO")), amountInput: parsedAmount.input, amount: parsedAmount.value, subItemId, note: String(form.get("note") || "").trim() };
  if (!transaction.dateISO || transaction.amount <= 0) {
    showToast("Date and amount are required.");
    return;
  }
  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) state.transactions[index] = transaction;
  else state.transactions.push(transaction);
  state.ui.lastTransactionTemplate = { amountInput: transaction.amountInput, amount: transaction.amount, subItemId: transaction.subItemId, note: transaction.note };
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  state.ui.activeTab = "monitor";
  saveState();
  showToast(index >= 0 ? "Transaction updated." : "Transaction added.");
  render();
}

function openTransactionsManager() {
  state.ui.txFilter = "month";
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
  const monthlyBlockCount = Object.values(imported.settings.monthlyPlans || {}).reduce((total, plan) => total + getBlocksFromPlan(plan).length, 0);
  const stats = [["Default Categories", getYearBlocksFrom(imported).length], ["Month Categories", monthlyBlockCount], ["Items", getAllSubItems(getYearBlocksFrom(imported)).length + Object.values(imported.settings.monthlyPlans || {}).reduce((total, plan) => total + getAllSubItems(getBlocksFromPlan(plan)).length, 0)], ["Transactions", imported.transactions.length], ["Skipped rows", pendingCsvImport.skipped]];
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
  sample.settings.yearPlan.blocks.push(normalizeProject({ id: "income", label: "Income", type: "income", displayOrder: 1, subItems: [{ id: "salary", parentProjectId: "income", label: "Salary", amountInput: "1000", frequency: "monthly", monthlyAmount: 1000, active: true }] }));
  sample.settings.yearPlan.blocks.push(normalizeProject({ id: "spend", label: "Spend", type: "spend", displayOrder: 2, subItems: [{ id: "groceries", parentProjectId: "spend", label: "Groceries", amountInput: "1000", frequency: "monthly", monthlyAmount: 1000, pinToMonitor: true, active: true }] }));
  sample.settings.yearPlan.blocks.push(normalizeProject({ id: "save", label: "Savings", type: "save", displayOrder: 3, subItems: [{ id: "travel", parentProjectId: "save", label: "Travel Fund", amountInput: "0", frequency: "monthly", monthlyAmount: 0, showAsVault: true, currentBalanceInput: "300", currentBalance: 300, targetAmountInput: "1000", targetAmount: 1000, active: true }] }));
  sample.settings.monthlyPlans[state.ui.selectedMonth] = makeMonthlyPlanRecord(cloneProjects(sample.settings.yearPlan.blocks, true));
  sample.transactions.push({ id: "sample-transaction", dateISO: `${state.ui.selectedMonth}-01`, amount: 25, subItemId: "groceries", note: "Example transaction" });
  downloadText("finance-tracker-v3-sample.csv", serializeStateToCSV(sample), "text/csv");
  showToast("Sample CSV downloaded.");
}

function serializeStateToCSV(source) {
  const columns = ["record_type", "plan_scope", "plan_month", "id", "parent_id", "label", "amount", "amount_input", "monthly_amount", "monthly_amount_input", "frequency", "date", "sub_item_id", "project_type", "pin_to_monitor", "show_as_vault", "target_amount", "target_amount_input", "current_balance", "current_balance_input", "active", "archived", "display_order", "note"];
  const rows = [columns];
  getYearBlocksFrom(source).forEach((project) => {
    rows.push(["project", "year", "", project.id, "", project.label, "", "", "", "", "", "", "", project.type, "", "", "", "", "", "", project.active, project.archived, project.displayOrder, ""]);
    project.subItems.forEach((item) => rows.push(["sub_item", "year", "", item.id, project.id, item.label, "", "", item.monthlyAmount, item.amountInput || item.monthlyAmountInput || item.monthlyAmount, item.frequency || "monthly", "", "", "", item.pinToMonitor, item.showAsVault, item.targetAmount || "", item.targetAmountInput || "", item.currentBalance || "", item.currentBalanceInput || "", item.active, item.archived, item.displayOrder, ""]));
  });
  Object.entries(source.settings.monthlyPlans || {}).forEach(([monthKey, projects]) => {
    getBlocksFromPlan(projects).forEach((project) => {
      rows.push(["project", "month", monthKey, project.id, "", project.label, "", "", "", "", "", "", "", project.type, "", "", "", "", "", "", project.active, project.archived, project.displayOrder, ""]);
      project.subItems.forEach((item) => rows.push(["sub_item", "month", monthKey, item.id, project.id, item.label, "", "", item.monthlyAmount, item.amountInput || item.monthlyAmountInput || item.monthlyAmount, item.frequency || "monthly", "", "", "", item.pinToMonitor, item.showAsVault, item.targetAmount || "", item.targetAmountInput || "", item.currentBalance || "", item.currentBalanceInput || "", item.active, item.archived, item.displayOrder, ""]));
    });
    Object.entries(projects.actualOverrides || {}).forEach(([rowId, override]) => rows.push(["actual_override", "month", monthKey, rowId, "", "", override.amount, override.amountInput || override.amount, "", "", "", "", "", "", "", "", "", "", "", "", true, false, "", override.note || ""]));
  });
  source.transactions.forEach((tx) => rows.push(["transaction", "", "", tx.id, "", "", tx.amount, tx.amountInput || tx.amount, "", "", "", tx.dateISO, tx.subItemId, "", "", "", "", "", "", "", true, false, "", tx.note || ""]));
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function parseCSVToState(text) {
  const records = csvParse(text);
  if (!records.length) return { state: structuredClone(DEFAULT_STATE), skipped: 0 };
  const headers = records[0].map((item) => String(item).trim());
  const next = structuredClone(DEFAULT_STATE);
  const projectMaps = { year: new Map(), month: {} };
  let skipped = 0;
  records.slice(1).forEach((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    try {
      const scope = row.plan_scope === "month" ? "month" : "year";
      const monthKey = normalizeMonthValue(row.plan_month) || state.ui.selectedMonth;
      const targetProjects = scope === "year"
        ? next.settings.yearPlan.blocks
        : ((next.settings.monthlyPlans[monthKey] ||= makeMonthlyPlanRecord([])).blocks);
      const targetMap = scope === "year"
        ? projectMaps.year
        : (projectMaps.month[monthKey] ||= new Map());
      if (row.record_type === "project" || row.record_type === "budget_group") {
        const project = normalizeProject({ id: row.id, label: row.label, type: row.project_type || row.group_type || "spend", active: row.active === "" ? true : bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1, subItems: [] });
        targetProjects.push(project);
        targetMap.set(project.id, project);
      } else if (row.record_type === "sub_item" || row.record_type === "subcategory") {
        const project = targetMap.get(row.parent_id);
        const item = normalizeSubItem({ id: row.id, parentProjectId: row.parent_id, label: row.label, amountInput: row.monthly_amount_input || row.amount_input || row.monthly_amount || row.monthly_budget, frequency: row.frequency, monthlyAmount: number(row.monthly_amount || row.monthly_budget), pinToMonitor: row.pin_to_monitor === "" ? bool(row.recordable) || bool(row.show_on_dashboard) : bool(row.pin_to_monitor), showAsVault: bool(row.show_as_vault), targetAmount: number(row.target_amount), targetAmountInput: row.target_amount_input || row.target_amount, currentBalance: number(row.current_balance), currentBalanceInput: row.current_balance_input || row.current_balance, active: row.active === "" ? true : bool(row.active), archived: bool(row.archived), displayOrder: number(row.display_order) || 1 });
        if (project && item) project.subItems.push(item);
        else skipped += 1;
      } else if (row.record_type === "actual_override") {
        const plan = next.settings.monthlyPlans[monthKey] ||= makeMonthlyPlanRecord([]);
        plan.actualOverrides[row.id] = { amountInput: row.amount_input || row.amount, amount: number(row.amount), note: row.note || "", updatedAtISO: new Date().toISOString() };
      } else if (row.record_type === "transaction") {
        const tx = normalizeTransaction({ id: row.id, amountInput: row.amount_input || row.amount, amount: number(row.amount), dateISO: row.date, subItemId: row.sub_item_id || row.subcategory_id });
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

function calculateAllocationForProjects(projects = []) {
  const totals = { income: 0, spend: 0, debt: 0, save: 0, investment: 0 };
  const activeProjects = (projects || []).filter((project) => project.active && !project.archived);
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

function calculateAllocation(source = state) {
  const monthKey = source.ui?.selectedMonth || state.ui.selectedMonth;
  const plan = source === state ? getPlanForScope("month", monthKey, false) : getBlocksFromPlan(source.settings?.monthlyPlans?.[monthKey]);
  return calculateAllocationForProjects(plan);
}

function calculateDashboardTotals() {
  const month = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(month));
  const weekEnd = getWeekEnd(weekKey);
  const monthProjects = getPlanForScope("month", month, false);
  const spendItems = new Set(getAllSubItems(monthProjects).filter((item) => item.pinToMonitor && getProjectById(item.parentProjectId, monthProjects)?.type === "spend").map((item) => item.id));
  const monthSpent = sum(state.transactions.filter((tx) => spendItems.has(tx.subItemId) && tx.dateISO.startsWith(month)).map((tx) => tx.amount));
  const weekSpent = sum(state.transactions.filter((tx) => spendItems.has(tx.subItemId) && tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const spendBudget = calculateAllocation().spend;
  return { weekSpent, monthSpent, monthRemaining: Math.max(0, spendBudget - monthSpent), spendBudget };
}

function calculateWeeklyRhythm(subItemId, monthlyBudget) {
  const weeks = getWeeksOverlappingMonth(state.ui.selectedMonth);
  const allowance = (Number(monthlyBudget) || 0) / Math.max(1, weeks.length);
  const referenceDate = getReferenceDateISO(state.ui.selectedMonth);
  const buckets = [0, 1, 2, 3].map((index) => {
    const bucketWeeks = index === 3 ? weeks.slice(3) : weeks.slice(index, index + 1);
    const weekStart = bucketWeeks[0] || weeks[weeks.length - 1] || `${state.ui.selectedMonth}-01`;
    const weekEnd = bucketWeeks.length ? getWeekEnd(bucketWeeks[bucketWeeks.length - 1]) : weekStart;
    const spent = sum(state.transactions.filter((tx) => tx.subItemId === subItemId && bucketWeeks.some((week) => tx.dateISO >= week && tx.dateISO <= getWeekEnd(week))).map((tx) => tx.amount));
    const bucketAllowance = allowance * Math.max(1, bucketWeeks.length);
    let status = "empty";
    if (weekStart > referenceDate) status = "future";
    else if (spent === 0) status = "empty";
    else {
      const ratio = bucketAllowance ? spent / bucketAllowance : 0;
      status = ratio > 1 ? "over" : ratio > 0.9 ? "risk" : ratio > 0.7 ? "watch" : "on-track";
    }
    return { status, label: `${formatDate(weekStart)}-${formatDate(weekEnd)} ${money(spent)}` };
  });
  return buckets;
}

function calculateProjectStats(projectId, projects = getPlanForScope("month", state.ui.selectedMonth, false), monthKey = state.ui.selectedMonth) {
  const project = getProjectById(projectId, projects);
  if (!project) return { budget: 0, spent: 0, remaining: 0 };
  const budget = sum(project.subItems.filter((item) => item.active && !item.archived).map((item) => item.monthlyAmount));
  const spent = sum(project.subItems.filter((item) => item.active && !item.archived).map((item) => getRowActual(item, projects, monthKey)));
  return { budget, spent, remaining: Math.max(0, budget - spent) };
}

function calculateSubItemStats(subItemId, projects = getPlanForScope("month", state.ui.selectedMonth, false), monthKey = state.ui.selectedMonth) {
  const item = getSubItemById(subItemId, projects);
  if (!item) return { monthSpent: 0, weekSpent: 0, weeklyAllowance: 0, weekRemaining: 0, monthRemaining: 0 };
  const monthSpent = getRowActual(item, projects, monthKey);
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const weekEnd = getWeekEnd(weekKey);
  const weekSpent = sum(state.transactions.filter((tx) => tx.subItemId === subItemId && tx.dateISO >= weekKey && tx.dateISO <= weekEnd).map((tx) => tx.amount));
  const weeks = getWeeksOverlappingMonth(monthKey).length || 1;
  const weeklyAllowance = (item?.monthlyAmount || 0) / weeks;
  return { monthSpent, weekSpent, weeklyAllowance, weekRemaining: Math.max(0, weeklyAllowance - weekSpent), monthRemaining: Math.max(0, (item?.monthlyAmount || 0) - monthSpent) };
}

function getActiveProjects() {
  return getPlanForScope("month", state.ui.selectedMonth, false).filter((project) => project.active && !project.archived).sort(byDisplayOrder);
}

function getDashboardProjects(projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return (projects || []).filter((project) => project.active && !project.archived && project.subItems.some((item) => item.active && !item.archived && item.pinToMonitor));
}

function getPinnedSpendRows(projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return (projects || [])
    .filter((project) => project.active && !project.archived && project.type === "spend")
    .sort(byDisplayOrder)
    .flatMap((project) => project.subItems
      .filter((item) => item.active && !item.archived && item.pinToMonitor)
      .sort(byDisplayOrder)
      .map((item) => ({ project, item })));
}

function getPinnedSpendCount(projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return getPinnedSpendRows(projects).length;
}

function getSavingsVaultRows(projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return (projects || [])
    .filter((project) => project.active && !project.archived && project.type === "save")
    .sort(byDisplayOrder)
    .flatMap((project) => project.subItems
      .filter((item) => item.active && !item.archived && item.showAsVault)
      .sort(byDisplayOrder)
      .map((item) => ({ project, item })));
}

function getSpendStatus(spent, budget) {
  if (!budget) return { key: "info", label: "On track", note: "No monthly budget set." };
  const ratio = spent / budget;
  if (ratio > 1) return { key: "over", label: "Over", note: "Budget is over plan." };
  if (ratio >= 0.9) return { key: "risk", label: "Risk", note: "Close to monthly limit." };
  if (ratio >= 0.7) return { key: "watch", label: "Watch", note: "Spending is building." };
  return { key: "ok", label: "On track", note: "Pressure is low." };
}

function getProjectById(id, projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return (projects || []).find((project) => project.id === id) || null;
}

function getAllSubItems(source = getPlanForScope("month", state.ui.selectedMonth, false)) {
  const projects = Array.isArray(source) ? source : Array.isArray(source.settings?.projects) ? source.settings.projects : getBlocksFromPlan(source.settings?.yearPlan);
  return projects.flatMap((project) => project.subItems.map((item) => ({ ...item, parentProjectId: project.id, projectLabel: project.label, projectType: project.type })));
}

function getRecordableItems() {
  const monthProjects = getPlanForScope("month", state.ui.selectedMonth, true);
  return getAllSubItems(monthProjects).filter((item) => item.active && !item.archived && item.pinToMonitor && getProjectById(item.parentProjectId, monthProjects)?.type === "spend").sort(byDisplayOrder);
}

function getSubItemById(id, projects = getPlanForScope("month", state.ui.selectedMonth, false)) {
  return getAllSubItems(projects).find((item) => item.id === id) || null;
}

function getSubItemLabel(id) {
  return getSubItemById(id)?.label || startCase(id || "Unknown");
}

function getActualOverride(rowId, monthKey = state.ui.selectedMonth) {
  return getMonthPlanRecord(monthKey, false).actualOverrides?.[rowId] || null;
}

function getRowActual(item, projects = getPlanForScope("month", state.ui.selectedMonth, false), monthKey = state.ui.selectedMonth) {
  const override = getActualOverride(item.id, monthKey);
  if (override) return override.amount;
  if (item.pinToMonitor) return sum(state.transactions.filter((tx) => tx.subItemId === item.id && tx.dateISO.startsWith(monthKey)).map((tx) => tx.amount));
  return item.monthlyAmount;
}

function getScopedTransactions() {
  const month = state.ui.selectedMonth;
  return state.transactions.filter((tx) => tx.dateISO.startsWith(month)).sort(byDateDesc);
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

function normalizeFrequency(value) {
  return String(value || "").toLowerCase() === "biweekly" ? "biweekly" : "monthly";
}

function frequencyLabel(value) {
  return normalizeFrequency(value) === "biweekly" ? "Biweekly" : "Monthly";
}

function monthlyAmountFromParsed(parsed, frequency) {
  return roundCents(normalizeFrequency(frequency) === "biweekly" ? parsed.value * 26 / 12 : parsed.value);
}

function bindFormulaInputs(root = document) {
  root.querySelectorAll("[data-formula-input]").forEach((input) => {
    const update = () => updateFormulaPreview(input);
    input.addEventListener("input", update);
    input.closest("form")?.querySelector("select[name='frequency']")?.addEventListener("change", update);
    update();
  });
}

function parseAmountField(input) {
  const parsed = parseFormula(input?.value || "");
  updateFormulaPreview(input, parsed);
  return parsed;
}

function parseOptionalAmountField(input) {
  const value = String(input?.value || "").trim();
  if (!value) {
    updateFormulaPreview(input, { ok: true, input: "", value: 0 });
    return { ok: true, input: "", value: 0 };
  }
  return parseAmountField(input);
}

function updateFormulaPreview(input, parsed = parseFormula(input?.value || "")) {
  if (!input) return;
  const preview = input.parentElement?.querySelector(".formula-preview");
  if (!preview) return;
  preview.classList.toggle("is-error", !parsed.ok && Boolean(parsed.input));
  if (!parsed.input) {
    preview.textContent = "";
  } else if (parsed.ok) {
    const frequency = normalizeFrequency(input.closest("form")?.querySelector("select[name='frequency']")?.value);
    preview.textContent = frequency === "biweekly" ? `${money(parsed.value)} biweekly = ${money(monthlyAmountFromParsed(parsed, frequency))} monthly` : `= ${money(parsed.value)}`;
  } else {
    preview.textContent = "Invalid formula";
  }
}

function parseFormula(raw) {
  const input = String(raw ?? "").trim();
  if (!input) return { ok: false, input, value: 0, error: "empty" };
  const expression = input.startsWith("=") ? input.slice(1).trim() : input;
  if (!expression || /[^0-9+\-*/().\s]/.test(expression)) return { ok: false, input, value: 0, error: "unsupported" };
  let index = 0;

  const skip = () => {
    while (/\s/.test(expression[index] || "")) index += 1;
  };
  const parseNumber = () => {
    skip();
    const start = index;
    while (/[0-9.]/.test(expression[index] || "")) index += 1;
    const text = expression.slice(start, index);
    if (!text || (text.match(/\./g) || []).length > 1) throw new Error("number");
    const value = Number(text);
    if (!Number.isFinite(value)) throw new Error("number");
    return value;
  };
  const parseFactor = () => {
    skip();
    if (expression[index] === "+") {
      index += 1;
      return parseFactor();
    }
    if (expression[index] === "-") {
      index += 1;
      return -parseFactor();
    }
    if (expression[index] === "(") {
      index += 1;
      const value = parseExpression();
      skip();
      if (expression[index] !== ")") throw new Error("paren");
      index += 1;
      return value;
    }
    return parseNumber();
  };
  const parseTerm = () => {
    let value = parseFactor();
    while (true) {
      skip();
      const op = expression[index];
      if (op !== "*" && op !== "/") return value;
      index += 1;
      const right = parseFactor();
      if (op === "/" && right === 0) throw new Error("divide");
      value = op === "*" ? value * right : value / right;
    }
  };
  const parseExpression = () => {
    let value = parseTerm();
    while (true) {
      skip();
      const op = expression[index];
      if (op !== "+" && op !== "-") return value;
      index += 1;
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
  };

  try {
    const value = parseExpression();
    skip();
    if (index !== expression.length || !Number.isFinite(value)) throw new Error("invalid");
    return { ok: true, input, value: roundCents(value) };
  } catch (error) {
    return { ok: false, input, value: 0, error: error.message };
  }
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

function formatMonthLabel(monthKey) {
  if (!normalizeMonthValue(monthKey)) return "Month";
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-CA", { month: "short", year: "numeric" });
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
