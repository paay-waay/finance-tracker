const APP_VERSION = "V3.1.1 UX Polish";
const SCHEMA_VERSION = 3;
const STORAGE_KEY = "financeTracker_v3";

const DEFAULT_STATE = {
  appVersion: APP_VERSION,
  schemaVersion: SCHEMA_VERSION,
  ui: {
    activeTab: "monitor",
    selectedMonth: currentMonthKey(),
    monitorScope: "week",
    txFilter: "month",
    editingTransactionId: null,
    monitorExpandedCards: {},
    lastTransactionTemplate: null,
    weeklyCloseExpanded: false,
    returnToQuickAddAfterCategoryCreate: false
  },
  settings: {
    weeklyRules: {
      weekStart: "MON",
      penaltyMultiplier: 1.5,
      minPenaltyUnit: 5,
      defaultSoftCapMultiplier: 1.1
    },
    monitorCategories: [],
    reserveVaults: [],
    backgroundSections: []
  },
  transactions: [],
  weeklyBudgetAdjustments: {},
  weeklyClosures: {},
  monthReviews: {}
};

const TABS = [
  { id: "monitor", label: "Monitor" },
  { id: "planning", label: "Planning" }
];

const CATEGORY_GROUPS = ["essentials", "discretionary", "custom"];
const RULE_TYPES = ["softCap", "penalty", "trackOnly"];
const VAULT_COLORS = ["gold", "green", "slate", "red", "neutral"];
const REVIEW_KEYS = ["reviewSpendingDone", "adjustBudgetsDone", "updateVaultsDone", "backupDone"];

let state = loadState();
let toastTimer = null;
let pendingCsvImport = null;

const app = document.querySelector("#app");
const monthInput = document.querySelector("#monthInput");
const bottomNav = document.querySelector("#bottomNav");
const pageTitle = document.querySelector("#pageTitle");
const headerStatus = document.querySelector("#headerStatus");
const modalRoot = document.querySelector("#modalRoot");

init();

function init() {
  lockMobileZoom();
  monthInput.value = state.ui.selectedMonth;
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
    const target = event.target;
    if (target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const now = Date.now();
    if (now - lastTouchEnd < 300) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
}

function bindShellEvents() {
  monthInput.addEventListener("change", () => {
    state.ui.selectedMonth = monthInput.value || currentMonthKey();
    saveState();
    render();
  });

  bottomNav.addEventListener("click", (event) => {
    const quickAdd = event.target.closest("[data-quick-add]");
    if (quickAdd) {
      openQuickAdd();
      return;
    }
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    state.ui.activeTab = button.dataset.tab;
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
  const next = structuredClone(DEFAULT_STATE);
  const input = isObject(raw) ? raw : {};

  next.appVersion = APP_VERSION;
  next.schemaVersion = SCHEMA_VERSION;
  next.ui = {
    ...next.ui,
    ...(isObject(input.ui) ? input.ui : {})
  };
  next.ui.activeTab = TABS.some((tab) => tab.id === next.ui.activeTab) ? next.ui.activeTab : "monitor";
  next.ui.selectedMonth = normalizeMonthValue(next.ui.selectedMonth) || currentMonthKey();
  next.ui.monitorScope = next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.txFilter ||= next.ui.monitorScope === "month" ? "month" : "week";
  next.ui.editingTransactionId ||= null;
  next.ui.monitorExpandedCards = isObject(input.ui?.monitorExpandedCards) ? input.ui.monitorExpandedCards : {};
  next.ui.lastTransactionTemplate = normalizeTemplate(input.ui?.lastTransactionTemplate);
  next.ui.weeklyCloseExpanded = Boolean(input.ui?.weeklyCloseExpanded);
  next.ui.returnToQuickAddAfterCategoryCreate = Boolean(input.ui?.returnToQuickAddAfterCategoryCreate);

  const settings = isObject(input.settings) ? input.settings : {};
  next.settings.weeklyRules = normalizeWeeklyRules(settings.weeklyRules);
  next.settings.monitorCategories = Array.isArray(settings.monitorCategories)
    ? settings.monitorCategories.map(normalizeCategory).filter(Boolean).sort(byDisplayOrder)
    : [];
  next.settings.reserveVaults = Array.isArray(settings.reserveVaults)
    ? settings.reserveVaults.map(normalizeVault).filter(Boolean).sort(byDisplayOrder)
    : [];
  next.settings.backgroundSections = Array.isArray(settings.backgroundSections)
    ? settings.backgroundSections.map(normalizeBackgroundSection).filter(Boolean).sort(byDisplayOrder)
    : [];

  next.transactions = Array.isArray(input.transactions)
    ? input.transactions.map(normalizeTransaction).filter(Boolean)
    : [];
  next.weeklyBudgetAdjustments = normalizeWeekMap(input.weeklyBudgetAdjustments);
  next.weeklyClosures = normalizeWeekMap(input.weeklyClosures);
  next.monthReviews = normalizeMonthReviews(input.monthReviews);
  return next;
}

function normalizeWeeklyRules(raw) {
  const defaults = DEFAULT_STATE.settings.weeklyRules;
  return {
    weekStart: "MON",
    penaltyMultiplier: Number(raw?.penaltyMultiplier ?? defaults.penaltyMultiplier) || defaults.penaltyMultiplier,
    minPenaltyUnit: Number(raw?.minPenaltyUnit ?? defaults.minPenaltyUnit) || defaults.minPenaltyUnit,
    defaultSoftCapMultiplier: Number(raw?.defaultSoftCapMultiplier ?? defaults.defaultSoftCapMultiplier) || defaults.defaultSoftCapMultiplier
  };
}

function normalizeCategory(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("cat"),
    label: label || startCase(id),
    icon: String(raw.icon || "◼").trim() || "◼",
    group: CATEGORY_GROUPS.includes(raw.group) ? raw.group : "custom",
    monthlyBudget: Number(raw.monthlyBudget) || 0,
    monitor: raw.monitor !== false,
    allowTransactions: raw.allowTransactions !== false,
    includeInVariableTotal: raw.includeInVariableTotal !== false,
    includeInWeeklyDiscipline: raw.includeInWeeklyDiscipline !== false,
    ruleType: RULE_TYPES.includes(raw.ruleType) ? raw.ruleType : "trackOnly",
    softCapMultiplier: raw.softCapMultiplier === null || raw.softCapMultiplier === "" ? null : Number(raw.softCapMultiplier ?? state?.settings?.weeklyRules?.defaultSoftCapMultiplier ?? 1.1),
    penaltyMultiplier: raw.penaltyMultiplier === null || raw.penaltyMultiplier === "" ? null : Number(raw.penaltyMultiplier ?? state?.settings?.weeklyRules?.penaltyMultiplier ?? 1.5),
    minPenaltyUnit: raw.minPenaltyUnit === null || raw.minPenaltyUnit === "" ? null : Number(raw.minPenaltyUnit ?? state?.settings?.weeklyRules?.minPenaltyUnit ?? 5),
    priority: ["primary", "secondary", "hidden"].includes(raw.priority) ? raw.priority : "primary",
    displayOrder: Number(raw.displayOrder) || 1,
    active: raw.active !== false,
    archived: Boolean(raw.archived)
  };
}

function normalizeVault(raw) {
  if (!isObject(raw)) return null;
  const name = String(raw.name || raw.label || "").trim();
  const id = String(raw.id || slugify(name)).trim();
  if (!id && !name) return null;
  return {
    id: id || uid("vault"),
    name: name || startCase(id),
    currentAmount: Number(raw.currentAmount ?? raw.balance) || 0,
    targetAmount: raw.targetAmount === "" || raw.targetAmount == null ? null : Number(raw.targetAmount) || null,
    note: String(raw.note || "").trim(),
    includeInMonitor: raw.includeInMonitor !== false,
    colorToken: VAULT_COLORS.includes(raw.colorToken) ? raw.colorToken : "gold",
    displayOrder: Number(raw.displayOrder) || 1,
    active: raw.active !== false,
    archived: Boolean(raw.archived)
  };
}

function normalizeBackgroundSection(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("section"),
    label: label || startCase(id),
    type: ["income", "fixed", "debt", "investment", "other"].includes(raw.type) ? raw.type : "other",
    displayOrder: Number(raw.displayOrder) || 1,
    active: raw.active !== false,
    archived: Boolean(raw.archived),
    items: Array.isArray(raw.items) ? raw.items.map(normalizeBackgroundItem).filter(Boolean) : []
  };
}

function normalizeBackgroundItem(raw) {
  if (!isObject(raw)) return null;
  const label = String(raw.label || raw.name || "").trim();
  const id = String(raw.id || slugify(label)).trim();
  if (!id && !label) return null;
  return {
    id: id || uid("item"),
    label: label || startCase(id),
    amount: Number(raw.amount) || 0,
    frequency: ["monthly", "annual", "oneTime"].includes(raw.frequency) ? raw.frequency : "monthly",
    active: raw.active !== false,
    archived: Boolean(raw.archived)
  };
}

function normalizeTransaction(raw) {
  if (!isObject(raw)) return null;
  const amount = Number(raw.amount) || 0;
  const category = String(raw.category || "").trim();
  const dateISO = normalizeDateValue(raw.dateISO || raw.date);
  if (!amount || !category || !dateISO) return null;
  return {
    id: String(raw.id || uid("txn")),
    dateISO,
    amount,
    category,
    note: String(raw.note || "").trim()
  };
}

function normalizeTemplate(raw) {
  if (!isObject(raw)) return null;
  return {
    amount: Number(raw.amount) || 0,
    category: String(raw.category || ""),
    note: String(raw.note || "").trim()
  };
}

function normalizeWeekMap(raw) {
  if (!isObject(raw)) return {};
  const out = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (isObject(value)) out[key] = value;
  });
  return out;
}

function normalizeMonthReviews(raw) {
  if (!isObject(raw)) return {};
  const out = {};
  Object.entries(raw).forEach(([month, review]) => {
    if (!normalizeMonthValue(month)) return;
    out[month] = normalizeMonthReview(review);
  });
  return out;
}

function normalizeMonthReview(raw = {}) {
  return {
    reviewSpendingDone: Boolean(raw.reviewSpendingDone || raw.reviewed),
    reviewSpendingDoneAtISO: raw.reviewSpendingDoneAtISO || raw.reviewedAtISO || null,
    adjustBudgetsDone: Boolean(raw.adjustBudgetsDone),
    adjustBudgetsDoneAtISO: raw.adjustBudgetsDoneAtISO || null,
    updateVaultsDone: Boolean(raw.updateVaultsDone),
    updateVaultsDoneAtISO: raw.updateVaultsDoneAtISO || null,
    backupDone: Boolean(raw.backupDone),
    backupDoneAtISO: raw.backupDoneAtISO || null
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  monthInput.value = state.ui.selectedMonth;
  pageTitle.textContent = state.ui.activeTab === "planning" ? "Planning" : "Monitor";
  renderHeaderControls();
  renderHeaderStatus();
  renderNav();
  app.innerHTML = state.ui.activeTab === "planning" ? renderPlanningPage() : renderMonitorPage();
  bindPageEvents();
}

function renderHeaderControls() {
  const controls = document.querySelector(".topbar-controls");
  if (!controls) return;
  controls.classList.remove("is-hidden");
  controls.innerHTML = `
    <label class="month-field month-chip">
      <span>Month</span>
      <input id="monthInputLive" type="month" value="${state.ui.selectedMonth}" />
    </label>
    ${state.ui.activeTab === "monitor" ? renderScopeSwitch() : ""}
  `;
  const liveMonth = controls.querySelector("#monthInputLive");
  liveMonth?.addEventListener("change", () => {
    state.ui.selectedMonth = normalizeMonthValue(liveMonth.value) || currentMonthKey();
    saveState();
    render();
  });
}

function renderHeaderStatus() {
  if (state.ui.activeTab === "planning") {
    headerStatus.className = "header-status-pill neutral";
    headerStatus.textContent = "Plan";
    return;
  }
  const cards = getMonitorCards();
  if (!cards.length) {
    headerStatus.className = "header-status-pill neutral";
    headerStatus.textContent = "Setup";
    return;
  }
  const status = calculateOverallMonitorStatus(cards, state.ui.monitorScope);
  headerStatus.className = `header-status-pill ${status.key}`;
  headerStatus.textContent = status.label;
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
  document.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => setMonitorScope(button.dataset.scope));
  });
  document.querySelectorAll("[data-open-planning-section]").forEach((button) => {
    button.addEventListener("click", () => openPlanningSheet(button.dataset.openPlanningSection));
  });
  document.querySelectorAll("[data-monitor-card]").forEach((card) => {
    card.addEventListener("click", () => toggleMonitorCardDetails(card.dataset.monitorCard));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMonitorCardDetails(card.dataset.monitorCard);
      }
    });
  });
  document.querySelectorAll("[data-toggle-monitor-details]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMonitorCardDetails(button.dataset.toggleMonitorDetails);
    });
  });
  document.querySelectorAll("[data-manage-categories]").forEach((button) => button.addEventListener("click", openManageBudgetCategories));
  document.querySelectorAll("[data-add-category]").forEach((button) => button.addEventListener("click", openAddCategorySheet));
  document.querySelectorAll("[data-edit-category]").forEach((button) => button.addEventListener("click", () => openEditCategory(button.dataset.editCategory)));
  document.querySelectorAll("[data-manage-vaults]").forEach((button) => button.addEventListener("click", openManageVaults));
  document.querySelectorAll("[data-add-vault]").forEach((button) => button.addEventListener("click", openAddVaultSheet));
  document.querySelectorAll("[data-edit-vault]").forEach((button) => button.addEventListener("click", () => openEditVault(button.dataset.editVault)));
  document.querySelectorAll("[data-manage-background]").forEach((button) => button.addEventListener("click", openManageBackground));
  document.querySelectorAll("[data-edit-background-item]").forEach((button) => button.addEventListener("click", () => openEditBackgroundItem(button.dataset.sectionId, button.dataset.editBackgroundItem)));
  document.querySelectorAll("[data-manage-transactions]").forEach((button) => button.addEventListener("click", openTransactionsManager));
  document.querySelectorAll("[data-review-toggle]").forEach((input) => {
    input.addEventListener("change", () => toggleMonthReviewItem(state.ui.selectedMonth, input.dataset.reviewToggle));
  });
  document.querySelectorAll("[data-review-action]").forEach((button) => {
    button.addEventListener("click", () => runReviewAction(button.dataset.reviewAction));
  });
  document.querySelector("#closeWeekButton")?.addEventListener("click", closeWeek);
  document.querySelector("#reopenWeekButton")?.addEventListener("click", reopenWeek);
  document.querySelector("[data-toggle-weekly-close]")?.addEventListener("click", toggleWeeklyCloseDetails);
  document.querySelector("#reviewLastWeekButton")?.addEventListener("click", reviewLastWeek);
  document.querySelector("#exportCsvButton")?.addEventListener("click", exportCSV);
  document.querySelector("#importCsvInput")?.addEventListener("change", importCSV);
  document.querySelector("#sampleCsvButton")?.addEventListener("click", downloadSampleCSV);
  document.querySelector("#resetButton")?.addEventListener("click", resetData);
  document.querySelectorAll("[data-edit-transaction]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.editingTransactionId = button.dataset.editTransaction;
      saveState();
      openQuickAdd();
    });
  });
  document.querySelectorAll("[data-delete-transaction]").forEach((button) => {
    button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction));
  });
}

function setMonitorScope(scope) {
  state.ui.monitorScope = scope === "month" ? "month" : "week";
  state.ui.txFilter = state.ui.monitorScope === "month" ? "month" : "week";
  saveState();
  render();
}

function renderMonitorPage() {
  const cards = getMonitorCards();
  return `
    <section class="page monitor-page">
      ${renderReserveVaultHero()}
      ${cards.length ? renderOverallMonitorStatus(calculateOverallMonitorStatus(cards, state.ui.monitorScope)) : ""}
      <section class="monitor-grid" aria-label="Variable monitors">
        ${cards.length ? cards.map(renderMonitorBox).join("") : renderMonitorCategoryEmptyState()}
      </section>
      ${cards.length ? (state.ui.monitorScope === "month" ? renderMonthOutlook(calculateMonthOutlook()) : renderWeeklyDiscipline(calculateWeeklyDiscipline())) : ""}
      ${renderRecentActivity()}
    </section>
  `;
}

function renderReserveVaultHero() {
  const vaults = getMonitorReserveVaults();
  const activeVaults = getActiveReserveVaults();
  const extra = Math.max(0, vaults.length - 2);
  const shown = vaults.slice(0, 2);
  if (!activeVaults.length) {
    return `
      <section class="compact-reserve-hero vault-hero empty-vault">
        <div class="empty-state">
          <strong>No reserve vaults yet.</strong>
          <span>Create a vault for travel, renovation, emergency buffer, or any savings goal.</span>
          <button class="action-button" type="button" data-add-vault>Create reserve vault</button>
        </div>
      </section>
    `;
  }
  if (!vaults.length) {
    return `
      <section class="compact-reserve-hero vault-hero empty-vault">
        <div class="empty-state">
          <strong>No vaults pinned to Monitor.</strong>
          <span>Pin up to 2 vaults from Reserve Setup.</span>
          <button class="action-button" type="button" data-open-planning-section="reserve">Open Reserve Setup</button>
        </div>
      </section>
    `;
  }
  return `
    <section class="compact-reserve-hero vault-hero">
      <div class="compact-reserve-top">
        <span><i class="plain-icon diamond"></i>Reserve Vaults</span>
        <em class="reserve-pill gold">Saved ${money(calculateVaultTotal())}</em>
      </div>
      <div class="vault-preview-grid">
        ${shown.map(renderReserveVaultPreview).join("")}
      </div>
      ${extra > 0 ? `<p class="settings-note">+${extra} more vaults in Planning</p>` : ""}
    </section>
  `;
}

function renderReserveVaultPreview(vault) {
  const progress = calculateVaultProgress(vault);
  return `
    <article class="vault-preview ${escapeHtml(vault.colorToken)}">
      <div class="vault-preview-head">
        <strong>${escapeHtml(vault.name)}</strong>
        <span>${escapeHtml(progress.status)}</span>
      </div>
      <div class="vault-amount">${money(vault.currentAmount)}${vault.targetAmount ? ` / ${money(vault.targetAmount)}` : ""}</div>
      <div class="budget-bar trackOnly neutral">
        <div class="budget-fill gold-fill" style="width:${clampPercent(progress.percent)}%"></div>
      </div>
      <p class="vault-remaining">${escapeHtml(getVaultRemainingText(vault))}</p>
      ${vault.note ? `<p>${escapeHtml(vault.note)}</p>` : `<p>No note yet.</p>`}
    </article>
  `;
}

function renderMonitorCategoryEmptyState() {
  return `
    <article class="monitor-box empty span-grid">
      <div class="empty-state">
        <strong>No monitor categories yet.</strong>
        <span>Create categories you want to watch, such as groceries, pets, shopping, or charging.</span>
        <button class="action-button" type="button" data-add-category>Create monitor category</button>
      </div>
    </article>
  `;
}

function renderMonitorBox(card) {
  const expanded = Boolean(state.ui.monitorExpandedCards?.[card.category]);
  return `
    <article class="monitor-box ${card.status.key}" data-monitor-card="${escapeHtml(card.category)}" tabindex="0" aria-expanded="${expanded ? "true" : "false"}">
      <div class="monitor-box-head">
        <h2><span class="category-icon text-icon" aria-hidden="true">${escapeHtml(card.icon)}</span>${escapeHtml(card.label)}</h2>
        <span class="monitor-status">${escapeHtml(card.status.label)}</span>
      </div>
      <div class="monitor-spend">${money(card.primarySpent)} / ${money(card.primaryBudget)}</div>
      ${renderProgressBar(card)}
      <p class="monitor-warning">${escapeHtml(getMonitorShortLine(card))}</p>
      ${expanded ? renderMonitorCardDetails(card) : ""}
      <button class="details-affordance" type="button" data-toggle-monitor-details="${escapeHtml(card.category)}">${expanded ? "Hide ˄" : "Details ˅"}</button>
    </article>
  `;
}

function renderProgressBar(card) {
  const maxValue = Math.max(card.primaryBudget * 1.3, card.projectedAmount, card.actualAmount, 1);
  const actualFill = card.actualAmount / maxValue * 100;
  const projectedFill = Math.max(0, card.projectedAmount - card.actualAmount) / maxValue * 100;
  const marker = card.primaryBudget / maxValue * 100;
  const penaltyWidth = card.ruleType === "penalty" && card.projectedOvershoot > 0
    ? Math.min(100 - marker, card.projectedOvershoot / maxValue * 100)
    : 0;
  return `
    <div class="budget-bar ${card.ruleType} ${card.status.tone} ${card.scope}">
      ${card.ruleType === "softCap" ? `<div class="budget-zone" style="left:${clampPercent(marker)}%; width:${clampPercent(100 - marker)}%"></div>` : ""}
      ${card.ruleType === "penalty" ? `<div class="penalty-zone" style="left:${clampPercent(marker)}%; width:${clampPercent(penaltyWidth)}%"></div>` : ""}
      <div class="budget-fill" style="width:${clampPercent(actualFill)}%"></div>
      <div class="projected-fill" style="left:${clampPercent(actualFill)}%; width:${clampPercent(projectedFill)}%"></div>
      <i class="budget-marker" style="left:${clampPercent(marker)}%"></i>
    </div>
  `;
}

function getMonitorShortLine(card) {
  if (card.status.key === "info") return "Track only.";
  if (card.status.key === "watch") return "Ahead of pace.";
  if (card.status.key === "risk") return "Soft cap risk.";
  if (card.status.key === "freeze") return "Penalty active.";
  return "On pace.";
}

function renderMonitorCardDetails(card) {
  return `
    <div class="monitor-details">
      <span>Spent so far <strong>${money(card.scope === "month" ? card.monthSpent : card.weekSpent)}</strong></span>
      <span>Remaining this month <strong>${money(card.monthRemaining)}</strong></span>
      <span>${card.scope === "month" ? "Monthly budget" : "Current week budget"} <strong>${money(card.primaryBudget)}</strong></span>
      <span>Projected overshoot <strong>${money(card.projectedOvershoot)}</strong></span>
      ${card.penalty > 0 ? `<span>Penalty detail <strong>-${money(card.penalty)} next week</strong></span>` : ""}
    </div>
  `;
}

function renderOverallMonitorStatus(status) {
  return `
    <section class="overall-status-strip ${status.key}">
      <div>
        <strong>${escapeHtml(status.label)}</strong>
        <span>${escapeHtml(status.action)}</span>
      </div>
      <b>${money(status.projectedSpend)} / ${money(status.budget)}</b>
    </section>
  `;
}

function renderWeeklyDiscipline(discipline) {
  const closeStatus = getWeeklyCloseStatus(discipline.weekKey);
  const expanded = Boolean(state.ui.weeklyCloseExpanded);
  return `
    <article class="weekly-close-strip tone-${closeStatus.tone}">
      <button class="weekly-close-main" type="button" data-toggle-weekly-close aria-expanded="${expanded ? "true" : "false"}">
        <span>
          <strong>Weekly Close</strong>
          <em>${escapeHtml(closeStatus.label)} · ${escapeHtml(closeStatus.message)}</em>
        </span>
        <b>-${money(discipline.nextWeekReduction)}</b>
      </button>
      <div class="weekly-close-actions">
        <button class="mini-button" type="button" data-toggle-weekly-close>${expanded ? "Hide details" : "Details"}</button>
        ${closeStatus.key === "last-week-open" ? `<button id="reviewLastWeekButton" class="ghost-button" type="button">Review Last Week</button>` : ""}
        ${closeStatus.key === "ready" ? `<button id="closeWeekButton" class="action-button" type="button">Close Week</button>` : ""}
        ${closeStatus.key === "closed" ? `<button id="reopenWeekButton" class="ghost-button" type="button">Reopen Week</button>` : ""}
      </div>
      ${expanded ? renderWeeklyCloseDetails(discipline) : ""}
    </article>
  `;
}

function renderWeeklyCloseDetails(discipline) {
  return `
    <div class="weekly-close-details">
      <div><span>Overshoot</span><strong>${money(discipline.discretionaryOvershoot)}</strong></div>
      <div><span>Penalty</span><strong>${money(discipline.nextWeekReduction)}</strong></div>
      <div><span>Projected by Sunday</span><strong>${money(discipline.projectedDiscretionaryOvershoot)}</strong></div>
      ${discipline.penaltyRows.length ? `<p>${discipline.penaltyRows.map((row) => `${escapeHtml(row.label)} ${money(row.penalty)}`).join(" · ")}</p>` : `<p>No penalty rows yet.</p>`}
    </div>
  `;
}

function renderMonthOutlook(outlook) {
  const tone = outlook.status.key === "safe" ? "green" : outlook.status.key === "watch" ? "yellow" : "red";
  const diffLabel = outlook.projectedDiff >= 0 ? `${money(outlook.projectedDiff)} over` : `${money(Math.abs(outlook.projectedDiff))} under`;
  return `
    <article class="month-outlook-card weekly-close-strip tone-${tone}">
      <div class="visual-head">
        <h2>Month Outlook</h2>
        <span>${escapeHtml(outlook.status.label)}</span>
      </div>
      <div class="weekly-close-details is-static">
        <div><span>Projected</span><strong>${money(outlook.projectedMonthEndVariableSpend)}</strong></div>
        <div><span>Budget</span><strong>${money(outlook.monthlyVariableBudget)}</strong></div>
        <div><span>Result</span><strong>${diffLabel}</strong></div>
        <p>${escapeHtml(outlook.status.action)} ${outlook.atRisk.length ? outlook.atRisk.map((item) => `${escapeHtml(item.label)} ${money(item.projectedOvershoot)} over`).join(" · ") : "No categories at risk."}</p>
      </div>
    </article>
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
      <span>${escapeHtml(getCategoryLabel(transaction.category))}</span>
      <strong>${money(transaction.amount)}</strong>
      <em>${formatDate(transaction.dateISO)}</em>
    </div>
  `;
}

function renderPlanningPage() {
  const reviewStatus = getMonthReviewStatus(state.ui.selectedMonth);
  return `
    <section class="page planning-page">
      <section class="stack">
        <article class="planning-card">
          <div class="planning-accordion-head">
            <div>
              <p class="section-kicker">Status</p>
              <h2>Planning Summary</h2>
            </div>
          </div>
          ${renderPlanningSummary()}
        </article>
        ${reviewStatus.doneCount < 4 ? renderMonthSetupReminder(reviewStatus) : ""}
        <article class="planning-card is-weak data-center-card">
          <div class="planning-accordion-head">
            <div>
              <p class="section-kicker">CSV Backup</p>
              <h2>Data Center</h2>
            </div>
            <button class="mini-button" type="button" data-open-planning-section="data">Open</button>
          </div>
          <div class="accordion-inline-summary"><strong>CSV import / export</strong><span>Reset and app details live here.</span></div>
        </article>
      </section>
    </section>
  `;
}

function renderPlanningSummary() {
  const review = getMonthReviewStatus(state.ui.selectedMonth);
  return `
    <div class="planning-summary-grid status-nav-grid">
      ${renderPlanningStatusTile("◼", "Budget", `${getActiveCategories().length} active categories`, getActiveCategories().length ? "Ready" : "Empty", "budget", "Setup")}
      ${renderPlanningStatusTile("◆", "Reserve", `${getActiveReserveVaults().length} vaults · ${money(calculateVaultTotal())} saved`, getActiveReserveVaults().length ? "Ready" : "Empty", "reserve", "Setup")}
      ${renderPlanningStatusTile("◇", "Background", `${getActiveBackgroundSections().length} sections · ${getActiveBackgroundItems().length} items`, getActiveBackgroundSections().length ? "Ready" : "Empty", "background", "Setup")}
      ${renderPlanningStatusTile("□", "Month Setup", `${review.doneCount}/4 done`, review.doneCount === 4 ? "Done" : review.doneCount ? "In progress" : "Not started", "monthSetup", "Review")}
    </div>
  `;
}

function renderPlanningStatusTile(icon, title, summary, status, sectionKey, action = "Open") {
  return `
    <div class="planning-status-tile">
      <span><i class="text-icon">${escapeHtml(icon)}</i>${escapeHtml(title)}</span>
      <strong>${escapeHtml(summary)}</strong>
      <em>${escapeHtml(status)}</em>
      <button class="mini-button" type="button" data-open-planning-section="${sectionKey}">${escapeHtml(action)}</button>
    </div>
  `;
}

function renderMonthSetupReminder(status) {
  return `
    <article class="month-setup-reminder">
      <div>
        <strong>Month Setup: ${status.doneCount}/4 done</strong>
        <span>${escapeHtml(formatMonthLabel(state.ui.selectedMonth))} · ${escapeHtml(status.label)}</span>
      </div>
      <button class="mini-button" type="button" data-open-planning-section="monthSetup">Review</button>
    </article>
  `;
}

function renderReviewChecklistItem(key, title, description, action) {
  const review = getMonthReview(state.ui.selectedMonth);
  return `
    <div class="checklist-item">
      <label>
        <input type="checkbox" data-review-toggle="${key}" ${review[key] ? "checked" : ""} />
        <span>${escapeHtml(title)}</span>
      </label>
      <p>${escapeHtml(description)}</p>
      <button class="mini-button" type="button" data-review-action="${key}">${escapeHtml(action)}</button>
    </div>
  `;
}

function renderBudgetSummary() {
  const categories = getActiveCategories();
  if (!categories.length) {
    return `<div class="accordion-inline-summary"><strong>No categories yet.</strong><span>Add category.</span></div>`;
  }
  const total = sum(categories.filter(isVariableTotalCategory).map((item) => item.monthlyBudget));
  return `<div class="accordion-inline-summary"><strong>${categories.length} active categories</strong><span>Monthly budget ${money(total)}</span></div>`;
}

function renderBudgetPlanningBody() {
  const categories = getCategories().filter((item) => !item.archived);
  if (!categories.length) {
    return `<div class="empty-state"><strong>No budget categories yet.</strong><span>Add category.</span><button class="action-button" type="button" data-add-category>Add category</button></div>`;
  }
  return `
    <div class="planning-metrics">
      ${categories.map(renderBudgetCard).join("")}
    </div>
    <p class="settings-note">Weekly discipline uses active categories that are included in weekly discipline.</p>
  `;
}

function renderBudgetCard(category) {
  const weekly = getCurrentWeekBudget(category.id, getWeekKey(getReferenceDateISO(state.ui.selectedMonth)));
  return `
    <div class="budget-input-card">
      <div class="budget-card-head">
        <strong><span class="text-icon">${escapeHtml(category.icon)}</span>${escapeHtml(category.label)}</strong>
        <button class="mini-button" type="button" data-edit-category="${category.id}" aria-label="Edit category settings">⚙</button>
      </div>
      <small>${money(category.monthlyBudget)} monthly · ${money(weekly)} estimated weekly</small>
    </div>
  `;
}

function renderReserveSummary() {
  const vaults = getActiveReserveVaults();
  const pinned = getMonitorReserveVaults().length;
  const first = vaults[0];
  if (!vaults.length) {
    return `<div class="accordion-inline-summary"><strong>No vaults yet.</strong><span>Add vault.</span></div>`;
  }
  return `
    <div class="accordion-inline-summary">
      <strong>${vaults.length} active vaults · ${pinned} pinned to Monitor</strong>
      <span>Total saved ${money(calculateVaultTotal())}</span>
      <span>${first ? `${escapeHtml(first.name)} ${money(first.currentAmount)}` : "No priority vault"}</span>
    </div>
  `;
}

function renderReservePlanningBody() {
  const vaults = getReserveVaults().filter((vault) => !vault.archived);
  if (!vaults.length) {
    return `<div class="empty-state"><strong>No reserve vaults yet.</strong><span>Create a vault for a savings goal.</span><button class="action-button" type="button" data-add-vault>Add vault</button></div>`;
  }
  return `
    <div class="settings-grid">
      ${vaults.map(renderVaultPlanningCard).join("")}
    </div>
    <p class="settings-note">Only the first 2 pinned vaults appear on Monitor.</p>
  `;
}

function renderVaultPlanningCard(vault) {
  const progress = calculateVaultProgress(vault);
  return `
    <article class="vault-planning-card ${escapeHtml(vault.colorToken)}">
      <div class="budget-card-head">
        <strong>◆ ${escapeHtml(vault.name)}</strong>
        <button class="mini-button" type="button" data-edit-vault="${vault.id}" aria-label="Edit reserve vault">⚙</button>
      </div>
      <span>${money(vault.currentAmount)}${vault.targetAmount ? ` / ${money(vault.targetAmount)}` : ""} · ${escapeHtml(progress.status)}</span>
      <span class="settings-note">${escapeHtml(getVaultRemainingText(vault))}</span>
      ${vault.note ? `<p>${escapeHtml(vault.note)}</p>` : `<p>No note yet.</p>`}
      <small>${vault.includeInMonitor ? "Pinned to Monitor" : "Planning only"}</small>
    </article>
  `;
}

function renderBackgroundSummary() {
  const sections = getActiveBackgroundSections();
  const items = getActiveBackgroundItems();
  return `<div class="accordion-inline-summary"><strong>${sections.length ? `${sections.length} sections · ${items.length} items` : "No background sections yet."}</strong><span>${sections.length ? "Ready" : "Add section."}</span></div>`;
}

function renderBackgroundBody() {
  const sections = getActiveBackgroundSections();
  if (!sections.length) {
    return `<div class="empty-state"><strong>No background sections yet.</strong><span>Add section.</span><button class="action-button" type="button" data-manage-background>Add background section</button></div>`;
  }
  return `
    <div class="stack">
      ${sections.map(renderBackgroundSection).join("")}
    </div>
  `;
}

function renderBackgroundSection(section) {
  const items = section.items.filter((item) => item.active && !item.archived);
  return `
    <section class="readonly-card">
      <div class="section-head">
        <h3>${escapeHtml(section.label)}</h3>
        <span class="tiny-label">${escapeHtml(section.type)}</span>
      </div>
      <div class="settings-grid" style="margin-top:10px;">
        ${items.length ? items.map((item) => `
          <div class="background-item-card">
            <div class="field"><span>${escapeHtml(item.label)}</span><input type="text" value="${money(monthlyEquivalent(item))}" readonly /></div>
            <button class="mini-button" type="button" data-section-id="${section.id}" data-edit-background-item="${item.id}" aria-label="Edit background item">⚙</button>
          </div>
        `).join("") : `<div class="empty-state">No items in this section.</div>`}
      </div>
    </section>
  `;
}

function renderDataBody() {
  return `
    <section class="readonly-card weak-card">
      <div class="section-head">
        <h3>CSV Backup</h3>
        <span class="tiny-label">Portable</span>
      </div>
      <div class="button-row">
        <button id="exportCsvButton" class="action-button" type="button">Export CSV</button>
        <label class="ghost-button">Import CSV<input id="importCsvInput" class="hidden" type="file" accept=".csv,text/csv" /></label>
        <button id="sampleCsvButton" class="ghost-button" type="button">Download sample CSV</button>
      </div>
      <p class="settings-note">CSV is the primary backup format for V3.</p>
    </section>
    <section class="readonly-card weak-card danger-zone">
      <div class="section-head"><h3>Reset</h3><span class="tiny-label">Danger</span></div>
      <button id="resetButton" class="danger-button" type="button">Reset local data</button>
    </section>
    <details class="about-details">
      <summary>About</summary>
      <div class="about-body">
        <p class="settings-note">${escapeHtml(APP_VERSION)}</p>
        <p class="settings-note">Storage key: ${escapeHtml(STORAGE_KEY)}</p>
      </div>
    </details>
  `;
}

function renderSetupSheet(title, body, label = "Setup") {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet setup-sheet" role="dialog" aria-label="${escapeHtml(title)}">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <div>
            <p class="section-kicker">${escapeHtml(label)}</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        ${body}
      </section>
    </div>
  `;
}

function renderBudgetSetupSheet() {
  return renderSetupSheet("Budget Setup", `
    ${renderBudgetPlanningBody()}
    <div class="button-row">
      <button class="action-button" type="button" data-add-category>Add Category</button>
      <button class="action-button" type="button" data-manage-categories>Manage Categories</button>
    </div>
    <p class="settings-note">Use Add Category for a guided preset. Use Manage Categories for order, restore, and structure.</p>
  `);
}

function renderReserveSetupSheet() {
  const pinnedCount = getMonitorReserveVaults().length;
  return renderSetupSheet("Reserve Vaults", `
    ${renderReservePlanningBody()}
    ${pinnedCount > 2 ? `<div class="notice-strip warning">Only the first 2 pinned vaults appear on Monitor. Reorder vaults to change priority.</div>` : ""}
    <div class="button-row">
      <button class="action-button" type="button" data-add-vault>Add Vault</button>
      <button class="action-button" type="button" data-manage-vaults>Manage Vaults</button>
    </div>
  `);
}

function renderBackgroundSetupSheet() {
  return renderSetupSheet("Background Setup", `
    ${renderBackgroundBody()}
    <div class="button-row">
      <button class="action-button" type="button" data-manage-background>Manage Background</button>
    </div>
  `);
}

function renderMonthSetupSheet() {
  const status = getMonthReviewStatus(state.ui.selectedMonth);
  return renderSetupSheet("Month Setup", `
    <div class="accordion-inline-summary">
      <strong>${escapeHtml(formatMonthLabel(state.ui.selectedMonth))} · ${status.doneCount}/4 done</strong>
      <span>${escapeHtml(status.label)}</span>
    </div>
    <div class="review-checklist">
      ${renderReviewChecklistItem("reviewSpendingDone", "Review previous month spending", "Check where spending ran over or under.", "Review month")}
      ${renderReviewChecklistItem("adjustBudgetsDone", "Adjust current month budgets", "Update category budgets if needed.", "Adjust budgets")}
      ${renderReviewChecklistItem("updateVaultsDone", "Update reserve vault balances", "Refresh vault balances and notes.", "Update vaults")}
      ${renderReviewChecklistItem("backupDone", "Export CSV backup", "Save a local CSV backup for this month.", "Export CSV backup")}
    </div>
  `, "Checklist");
}

function renderDataCenterSheet() {
  return renderSetupSheet("Data Center", renderDataBody(), "CSV Backup");
}

function openQuickAdd() {
  modalRoot.innerHTML = renderQuickAddSheet();
  bindSheetEvents();
  requestAnimationFrame(() => modalRoot.querySelector("input[name='amount']")?.focus());
}

function renderQuickAddSheet() {
  const categories = getActiveTransactionCategories();
  const editing = getEditingTransaction();
  if (!categories.length && !editing) {
    return `
      <div class="sheet-backdrop" role="presentation">
        <section class="quick-sheet" role="dialog" aria-label="Quick Add">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <h2>Quick Add</h2>
            <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
          </div>
          <div class="empty-state">
            <strong>Create a category first.</strong>
            <span>Transactions need a monitor category before they can be recorded.</span>
            <button class="action-button" type="button" data-create-category-from-quick-add>Create category</button>
          </div>
        </section>
      </div>
    `;
  }

  const template = state.ui.lastTransactionTemplate;
  const selectedCategory = editing?.category || (template && isCategoryAllowedForTransaction(template.category) ? template.category : categories[0]?.id);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet" role="dialog" aria-label="Quick Add">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>${editing ? "Edit Entry" : "Quick Add"}</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="transactionForm" class="quick-form">
          <input name="id" type="hidden" value="${escapeHtml(editing?.id || "")}" />
          <label class="amount-field">
            <span>Amount</span>
            <input name="amount" type="number" inputmode="decimal" step="0.01" min="0" value="${editing?.amount || ""}" placeholder="$0" required />
          </label>
          <div class="quick-amounts">
            ${[10, 20, 50, 100].map((amount) => `<button class="amount-chip" type="button" data-quick-amount="${amount}">${money(amount)}</button>`).join("")}
            ${template && !editing ? `<button class="amount-chip" type="button" data-repeat-last>Repeat Last</button>` : ""}
          </div>
          <input name="category" type="hidden" value="${escapeHtml(selectedCategory)}" />
          <div class="category-chip-grid" aria-label="Category">
            ${categories.map((category) => `<button class="category-chip ${category.id === selectedCategory ? "is-active" : ""}" type="button" data-category-chip="${category.id}"><span class="text-icon">${escapeHtml(category.icon)}</span>${escapeHtml(category.label)}</button>`).join("")}
          </div>
          <label class="field"><span>Date</span><input name="dateISO" type="date" value="${escapeHtml(editing?.dateISO || defaultDateForMonth(state.ui.selectedMonth))}" required /></label>
          <label class="field"><span>Note</span><input name="note" type="text" value="${escapeHtml(editing?.note || "")}" placeholder="Optional note" /></label>
          <button class="action-button sheet-save" type="submit">${editing ? "Save Entry" : "Add Entry"}</button>
        </form>
      </section>
    </div>
  `;
}

function bindSheetEvents() {
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeSheet();
  });
  modalRoot.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.txFilter = button.dataset.filter;
      saveState();
      modalRoot.innerHTML = renderTransactionsManagerSheet();
      bindSheetEvents();
    });
  });
  modalRoot.querySelector("#transactionForm")?.addEventListener("submit", saveTransaction);
  modalRoot.querySelectorAll("[data-quick-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = modalRoot.querySelector("input[name='amount']");
      if (input) input.value = button.dataset.quickAmount;
    });
  });
  modalRoot.querySelectorAll("[data-category-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      modalRoot.querySelector("input[name='category']").value = button.dataset.categoryChip;
      modalRoot.querySelectorAll("[data-category-chip]").forEach((item) => item.classList.toggle("is-active", item === button));
    });
  });
  modalRoot.querySelector("[data-repeat-last]")?.addEventListener("click", () => {
    const template = state.ui.lastTransactionTemplate;
    if (!template) return;
    const amount = modalRoot.querySelector("input[name='amount']");
    const note = modalRoot.querySelector("input[name='note']");
    const category = modalRoot.querySelector("input[name='category']");
    if (amount) amount.value = template.amount || "";
    if (note) note.value = template.note || "";
    if (category && isCategoryAllowedForTransaction(template.category)) {
      category.value = template.category;
      modalRoot.querySelectorAll("[data-category-chip]").forEach((item) => item.classList.toggle("is-active", item.dataset.categoryChip === template.category));
    }
  });
  modalRoot.querySelectorAll("[data-manage-categories]").forEach((button) => button.addEventListener("click", openManageBudgetCategories));
  modalRoot.querySelectorAll("[data-add-category]").forEach((button) => button.addEventListener("click", openAddCategorySheet));
  modalRoot.querySelectorAll("[data-edit-category]").forEach((button) => button.addEventListener("click", () => openEditCategory(button.dataset.editCategory)));
  modalRoot.querySelectorAll("[data-manage-vaults]").forEach((button) => button.addEventListener("click", openManageVaults));
  modalRoot.querySelectorAll("[data-add-vault]").forEach((button) => button.addEventListener("click", openAddVaultSheet));
  modalRoot.querySelectorAll("[data-edit-vault]").forEach((button) => button.addEventListener("click", () => openEditVault(button.dataset.editVault)));
  modalRoot.querySelectorAll("[data-manage-background]").forEach((button) => button.addEventListener("click", openManageBackground));
  modalRoot.querySelectorAll("[data-edit-background-item]").forEach((button) => button.addEventListener("click", () => openEditBackgroundItem(button.dataset.sectionId, button.dataset.editBackgroundItem)));
  modalRoot.querySelectorAll("[data-edit-transaction]").forEach((button) => button.addEventListener("click", () => {
    state.ui.editingTransactionId = button.dataset.editTransaction;
    saveState();
    openQuickAdd();
  }));
  modalRoot.querySelectorAll("[data-delete-transaction]").forEach((button) => button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction)));
  modalRoot.querySelector("#categoryEditorForm")?.addEventListener("submit", saveCategoryEditor);
  modalRoot.querySelector("#categoryManagerForm")?.addEventListener("submit", saveCategoryManager);
  modalRoot.querySelector("#addCategoryForm")?.addEventListener("submit", addCategory);
  modalRoot.querySelector("[data-archive-category]")?.addEventListener("click", archiveCurrentCategory);
  modalRoot.querySelector("[data-delete-category]")?.addEventListener("click", deleteCurrentCategory);
  modalRoot.querySelectorAll("[data-restore-category]").forEach((button) => button.addEventListener("click", () => restoreCategory(button.dataset.restoreCategory)));
  modalRoot.querySelector("#vaultEditorForm")?.addEventListener("submit", saveVaultEditor);
  modalRoot.querySelector("#vaultManagerForm")?.addEventListener("submit", saveVaultManager);
  modalRoot.querySelector("#addVaultForm")?.addEventListener("submit", addVault);
  modalRoot.querySelector("[data-archive-vault]")?.addEventListener("click", archiveCurrentVault);
  modalRoot.querySelector("[data-delete-vault]")?.addEventListener("click", deleteCurrentVault);
  modalRoot.querySelectorAll("[data-restore-vault]").forEach((button) => button.addEventListener("click", () => restoreVault(button.dataset.restoreVault)));
  modalRoot.querySelector("#backgroundManagerForm")?.addEventListener("submit", saveBackgroundManager);
  modalRoot.querySelector("#addBackgroundSectionForm")?.addEventListener("submit", addBackgroundSection);
  modalRoot.querySelector("#addBackgroundItemForm")?.addEventListener("submit", addBackgroundItem);
  modalRoot.querySelector("#backgroundItemEditorForm")?.addEventListener("submit", saveBackgroundItemEditor);
  modalRoot.querySelector("[data-archive-background-item]")?.addEventListener("click", archiveCurrentBackgroundItem);
  modalRoot.querySelector("#exportCsvButton")?.addEventListener("click", exportCSV);
  modalRoot.querySelector("#importCsvInput")?.addEventListener("change", importCSV);
  modalRoot.querySelector("#sampleCsvButton")?.addEventListener("click", downloadSampleCSV);
  modalRoot.querySelector("#resetButton")?.addEventListener("click", resetData);
  modalRoot.querySelector("#confirmCsvImportButton")?.addEventListener("click", confirmCsvImport);
  modalRoot.querySelector("#cancelCsvImportButton")?.addEventListener("click", cancelCsvImport);
  modalRoot.querySelectorAll("[data-open-planning-section]").forEach((button) => {
    button.addEventListener("click", () => openPlanningSheet(button.dataset.openPlanningSection));
  });
  modalRoot.querySelector("[data-create-category-from-quick-add]")?.addEventListener("click", () => {
    state.ui.returnToQuickAddAfterCategoryCreate = true;
    saveState();
    openAddCategorySheet();
  });
  modalRoot.querySelectorAll("[data-review-toggle]").forEach((input) => {
    input.addEventListener("change", () => toggleMonthReviewItem(state.ui.selectedMonth, input.dataset.reviewToggle));
  });
  modalRoot.querySelectorAll("[data-review-action]").forEach((button) => {
    button.addEventListener("click", () => runReviewAction(button.dataset.reviewAction));
  });
}

function closeSheet() {
  state.ui.editingTransactionId = null;
  pendingCsvImport = null;
  modalRoot.innerHTML = "";
  saveState();
  render();
}

function openManageBudgetCategories() {
  modalRoot.innerHTML = renderCategoryManagerSheet();
  bindSheetEvents();
}

function openAddCategorySheet() {
  modalRoot.innerHTML = renderAddCategorySheet();
  bindSheetEvents();
}

function openEditCategory(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) return;
  modalRoot.innerHTML = renderCategoryEditorSheet(category);
  bindSheetEvents();
}

function renderCategoryManagerSheet() {
  const categories = getCategories();
  const active = categories.filter((item) => !item.archived);
  const archived = categories.filter((item) => item.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Categories">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Categories</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="categoryManagerForm" class="quick-form">
          <div class="manager-list">
            ${active.length ? active.map((category, index) => `
              <div class="manager-row">
                <div><strong><span class="text-icon">${escapeHtml(category.icon)}</span>${escapeHtml(category.label)}</strong><div class="settings-note">${escapeHtml(category.group)} · ${escapeHtml(category.ruleType)}</div></div>
                <input class="order-input" name="order.${category.id}" type="number" step="1" value="${category.displayOrder || index + 1}" />
                <button class="mini-button" type="button" data-edit-category="${category.id}">Edit</button>
              </div>
            `).join("") : `<div class="empty-state">No active categories.</div>`}
          </div>
          <button class="action-button" type="submit">Save Order</button>
        </form>
        <button class="action-button" type="button" data-add-category>Add Category</button>
        ${archived.length ? `<div class="manager-archived"><h3>Archived</h3>${archived.map((category) => `<button class="ghost-button" type="button" data-restore-category="${category.id}">Restore ${escapeHtml(category.label)}</button>`).join("")}</div>` : ""}
      </section>
    </div>
  `;
}

function renderAddCategorySheet() {
  return renderSetupSheet("Add Category", `
    ${renderAddCategoryForm()}
    <p class="settings-note">Essential uses a soft cap. Discretionary uses weekly penalties. Track only records activity without warnings.</p>
  `, "Budget");
}

function renderAddCategoryForm() {
  return `
    <form id="addCategoryForm" class="quick-form add-form">
      <h3>Add Category</h3>
      <label class="field"><span>Name</span><input name="label" type="text" required /></label>
      <label class="field"><span>Monthly Budget</span><input name="monthlyBudget" type="number" step="0.01" value="0" /></label>
      <label class="field"><span>Type Preset</span><select name="preset">
        <option value="essential">Essential variable</option>
        <option value="discretionary">Discretionary variable</option>
        <option value="trackOnly">Track only</option>
      </select></label>
      <div class="boolean-grid">
        ${renderCheckbox("monitor", "Show on Monitor", true)}
        ${renderCheckbox("allowTransactions", "Allow transactions", true)}
      </div>
      <button class="action-button" type="submit">Add Category</button>
    </form>
  `;
}

function renderCategoryEditorSheet(category) {
  const used = categoryHasTransactions(category.id);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit category settings">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Category</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="categoryEditorForm" class="quick-form" data-category-id="${category.id}">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(category.label)}" required /></label>
          <label class="field"><span>Icon</span><input name="icon" type="text" value="${escapeHtml(category.icon)}" /></label>
          <label class="field"><span>Group</span><select name="group">${CATEGORY_GROUPS.map((group) => `<option value="${group}" ${category.group === group ? "selected" : ""}>${startCase(group)}</option>`).join("")}</select></label>
          <label class="field"><span>Monthly Budget</span><input name="monthlyBudget" type="number" step="0.01" value="${category.monthlyBudget}" /></label>
          <label class="field"><span>Rule Type</span><select name="ruleType">${RULE_TYPES.map((rule) => `<option value="${rule}" ${category.ruleType === rule ? "selected" : ""}>${startCase(rule)}</option>`).join("")}</select></label>
          <label class="field"><span>Soft Cap Multiplier</span><input name="softCapMultiplier" type="number" step="0.01" value="${category.softCapMultiplier ?? ""}" /></label>
          <label class="field"><span>Penalty Multiplier</span><input name="penaltyMultiplier" type="number" step="0.01" value="${category.penaltyMultiplier ?? ""}" /></label>
          <label class="field"><span>Minimum Penalty Unit</span><input name="minPenaltyUnit" type="number" step="0.01" value="${category.minPenaltyUnit ?? ""}" /></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${category.displayOrder}" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("monitor", "Show on Monitor", category.monitor)}
            ${renderCheckbox("allowTransactions", "Allow transactions", category.allowTransactions)}
            ${renderCheckbox("includeInVariableTotal", "Include in variable total", category.includeInVariableTotal)}
            ${renderCheckbox("includeInWeeklyDiscipline", "Include in weekly discipline", category.includeInWeeklyDiscipline)}
            ${renderCheckbox("active", "Active", category.active)}
          </div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Category</button>
            <button class="ghost-button" type="button" data-archive-category>Archive</button>
            ${used ? "" : `<button class="danger-button" type="button" data-delete-category>Delete</button>`}
          </div>
        </form>
      </section>
    </div>
  `;
}

function openManageVaults() {
  modalRoot.innerHTML = renderVaultManagerSheet();
  bindSheetEvents();
}

function openAddVaultSheet() {
  modalRoot.innerHTML = renderAddVaultSheet();
  bindSheetEvents();
}

function openEditVault(vaultId) {
  const vault = getVaultById(vaultId);
  if (!vault) return;
  modalRoot.innerHTML = renderVaultEditorSheet(vault);
  bindSheetEvents();
}

function renderVaultManagerSheet() {
  const vaults = getReserveVaults();
  const active = vaults.filter((item) => !item.archived);
  const archived = vaults.filter((item) => item.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Vaults">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Vaults</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="vaultManagerForm" class="quick-form">
          <div class="manager-list">
            ${active.length ? active.map((vault, index) => `
              <div class="manager-row">
                <div><strong>◆ ${escapeHtml(vault.name)}</strong><div class="settings-note">${money(vault.currentAmount)}${vault.targetAmount ? ` / ${money(vault.targetAmount)}` : ""}</div></div>
                <input class="order-input" name="order.${vault.id}" type="number" step="1" value="${vault.displayOrder || index + 1}" />
                <button class="mini-button" type="button" data-edit-vault="${vault.id}">Edit</button>
              </div>
            `).join("") : `<div class="empty-state">No active vaults.</div>`}
          </div>
          <button class="action-button" type="submit">Save Order</button>
        </form>
        <button class="action-button" type="button" data-add-vault>Add Vault</button>
        ${archived.length ? `<div class="manager-archived"><h3>Archived</h3>${archived.map((vault) => `<button class="ghost-button" type="button" data-restore-vault="${vault.id}">Restore ${escapeHtml(vault.name)}</button>`).join("")}</div>` : ""}
      </section>
    </div>
  `;
}

function renderAddVaultSheet() {
  return renderSetupSheet("Add Vault", `
    ${renderAddVaultForm()}
  `, "Reserve");
}

function renderAddVaultForm() {
  const pinnedCount = getMonitorReserveVaults().length;
  return `
    <form id="addVaultForm" class="quick-form add-form">
      <h3>Add Vault</h3>
      <label class="field"><span>Name</span><input name="name" type="text" required /></label>
      <label class="field"><span>Current Amount</span><input name="currentAmount" type="number" step="0.01" value="0" /></label>
      <label class="field"><span>Target Amount</span><input name="targetAmount" type="number" step="0.01" placeholder="Optional" /></label>
      <label class="field"><span>Note</span><input name="note" type="text" placeholder="Purpose" /></label>
      <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${getReserveVaults().length + 1}" /></label>
      <div class="boolean-grid">
        ${renderCheckbox("includeInMonitor", "Show on Monitor", pinnedCount < 2)}
      </div>
      <p class="settings-note">Only the first 2 pinned vaults appear on Monitor.</p>
      ${pinnedCount >= 2 ? `<p class="settings-note warning-text">This vault may not appear on Monitor unless it is within the first 2 pinned vaults.</p>` : ""}
      <button class="action-button" type="submit">Add Vault</button>
    </form>
  `;
}

function renderVaultEditorSheet(vault) {
  const pinnedCount = getMonitorReserveVaults().filter((item) => item.id !== vault.id).length;
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit reserve vault">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Vault</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="vaultEditorForm" class="quick-form" data-vault-id="${vault.id}">
          <label class="field"><span>Name</span><input name="name" type="text" value="${escapeHtml(vault.name)}" required /></label>
          <label class="field"><span>Current Amount</span><input name="currentAmount" type="number" step="0.01" value="${vault.currentAmount}" /></label>
          <label class="field"><span>Target Amount</span><input name="targetAmount" type="number" step="0.01" value="${vault.targetAmount ?? ""}" placeholder="Optional" /></label>
          <label class="field"><span>Note</span><input name="note" type="text" value="${escapeHtml(vault.note)}" /></label>
          <label class="field"><span>Color Token</span><select name="colorToken">${VAULT_COLORS.map((color) => `<option value="${color}" ${vault.colorToken === color ? "selected" : ""}>${startCase(color)}</option>`).join("")}</select></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${vault.displayOrder}" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("includeInMonitor", "Show on Monitor", vault.includeInMonitor)}
            ${renderCheckbox("active", "Active", vault.active)}
          </div>
          ${pinnedCount >= 2 ? `<p class="settings-note warning-text">This vault may not appear on Monitor unless it is within the first 2 pinned vaults.</p>` : ""}
          <div class="button-row">
            <button class="action-button" type="submit">Save Vault</button>
            <button class="ghost-button" type="button" data-archive-vault>Archive</button>
            <button class="danger-button" type="button" data-delete-vault>Delete</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function openManageBackground() {
  modalRoot.innerHTML = renderBackgroundManagerSheet();
  bindSheetEvents();
}

function openEditBackgroundItem(sectionId, itemId) {
  const section = getBackgroundSectionById(sectionId);
  const item = section?.items.find((candidate) => candidate.id === itemId);
  if (!section || !item) return;
  modalRoot.innerHTML = renderBackgroundItemEditorSheet(section, item);
  bindSheetEvents();
}

function renderBackgroundManagerSheet() {
  const sections = getBackgroundSections();
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Background Sections">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Background</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="backgroundManagerForm" class="quick-form">
          <div class="manager-list">
            ${sections.filter((section) => !section.archived).map((section, index) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(section.label)}</strong><div class="settings-note">${escapeHtml(section.type)} · ${section.items.length} items</div></div>
                <input class="order-input" name="order.${section.id}" type="number" step="1" value="${section.displayOrder || index + 1}" />
              </div>
            `).join("") || `<div class="empty-state">No background sections yet.</div>`}
          </div>
          <button class="action-button" type="submit">Save Sections</button>
        </form>
        <form id="addBackgroundSectionForm" class="quick-form add-form">
          <h3>Add Section</h3>
          <label class="field"><span>Section Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Type</span><select name="type"><option value="income">Income</option><option value="fixed">Fixed</option><option value="debt">Debt</option><option value="investment">Investment</option><option value="other">Other</option></select></label>
          <button class="action-button" type="submit">Add Section</button>
        </form>
        <form id="addBackgroundItemForm" class="quick-form add-form">
          <h3>Add Item</h3>
          <label class="field"><span>Section</span><select name="sectionId">${sections.filter((section) => !section.archived).map((section) => `<option value="${section.id}">${escapeHtml(section.label)}</option>`).join("")}</select></label>
          <label class="field"><span>Item Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="0" /></label>
          <button class="action-button" type="submit">Add Item</button>
        </form>
      </section>
    </div>
  `;
}

function renderBackgroundItemEditorSheet(section, item) {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit background item">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Background Item</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="backgroundItemEditorForm" class="quick-form" data-section-id="${section.id}" data-item-id="${item.id}">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(item.label)}" required /></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="${item.amount}" /></label>
          <label class="field"><span>Frequency</span><select name="frequency"><option value="monthly" ${item.frequency === "monthly" ? "selected" : ""}>Monthly</option><option value="annual" ${item.frequency === "annual" ? "selected" : ""}>Annual</option><option value="oneTime" ${item.frequency === "oneTime" ? "selected" : ""}>One Time</option></select></label>
          <div class="boolean-grid">${renderCheckbox("active", "Active", item.active)}</div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Item</button>
            <button class="ghost-button" type="button" data-archive-background-item>Archive</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function openTransactionsManager() {
  state.ui.txFilter = state.ui.monitorScope === "month" ? "month" : "week";
  modalRoot.innerHTML = renderTransactionsManagerSheet();
  bindSheetEvents();
}

function renderTransactionsManagerSheet() {
  const transactions = getFilteredTransactions();
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage activity">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Activity</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <div class="tx-filter">
          ${renderFilter("week", "This Week")}
          ${renderFilter("month", "This Month")}
          ${renderFilter("all", "All")}
        </div>
        <div class="tx-list">
          ${transactions.length ? transactions.map(renderManagedTransaction).join("") : `<div class="empty-state">No transactions recorded yet.</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderFilter(filter, label) {
  return `<button class="filter-chip ${state.ui.txFilter === filter ? "is-active" : ""}" type="button" data-filter="${filter}">${escapeHtml(label)}</button>`;
}

function renderManagedTransaction(transaction) {
  return `
    <div class="tx-item">
      <div><strong>${escapeHtml(getCategoryLabel(transaction.category))}</strong><span>${formatDate(transaction.dateISO)} · ${escapeHtml(transaction.note || "No note")}</span></div>
      <b>${money(transaction.amount)}</b>
      <button class="mini-button" type="button" data-edit-transaction="${transaction.id}">Edit</button>
      <button class="mini-button danger-text" type="button" data-delete-transaction="${transaction.id}">Delete</button>
    </div>
  `;
}

function renderCheckbox(name, label, checked) {
  return `
    <label class="checkbox-row">
      <input name="${name}" type="checkbox" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function getMonitorCards() {
  const scope = state.ui.monitorScope;
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  return getMonitorCategories().map((category) => scope === "month"
    ? calculateMonthCategoryStatus(category.id, monthKey, weekKey)
    : calculateWeekCategoryStatus(category.id, monthKey, weekKey)
  );
}

function calculateWeekCategoryStatus(categoryId, monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  const category = getCategoryById(categoryId);
  const timing = getWeekTiming(getReferenceDateISO(monthKey));
  const monthlyBudget = Number(category.monthlyBudget) || 0;
  const currentWeekBudget = getCurrentWeekBudget(categoryId, weekKey, monthKey);
  const weekSpent = getWeekSpent(categoryId, weekKey, monthKey);
  const monthSpent = getMonthSpent(categoryId, monthKey);
  const monthRemaining = Math.max(0, monthlyBudget - monthSpent);
  const expectedSpendByToday = currentWeekBudget * timing.weekProgress;
  const paceRatio = expectedSpendByToday > 0 ? weekSpent / expectedSpendByToday : 0;
  const projectedWeekEndSpend = timing.weekProgress > 0 ? weekSpent / timing.weekProgress : weekSpent;
  const projectedOvershoot = Math.max(0, projectedWeekEndSpend - currentWeekBudget);
  const penaltyData = calculatePenalty(categoryId, weekSpent, currentWeekBudget);
  const softCap = currentWeekBudget * getSoftCapMultiplier(category);
  const status = calculateStatus(category, {
    scope: "week",
    weekSpent,
    currentWeekBudget,
    paceRatio,
    softCap,
    projected: projectedWeekEndSpend,
    monthSpent,
    monthlyBudget
  });
  return {
    category: category.id,
    label: category.label,
    icon: category.icon,
    group: category.group,
    ruleType: category.ruleType,
    scope: "week",
    monthlyBudget,
    weekSpent,
    currentWeekBudget,
    monthSpent,
    monthRemaining,
    primarySpent: projectedWeekEndSpend,
    primaryBudget: currentWeekBudget,
    projectedAmount: projectedWeekEndSpend,
    actualAmount: weekSpent,
    projectedOvershoot,
    overshoot: penaltyData.overshoot,
    penalty: penaltyData.penalty,
    actualExceededBudget: category.ruleType === "penalty" && weekSpent > currentWeekBudget,
    status
  };
}

function calculateMonthCategoryStatus(categoryId, monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  const category = getCategoryById(categoryId);
  const timing = getMonthTiming(monthKey);
  const monthlyBudget = Number(category.monthlyBudget) || 0;
  const monthSpent = getMonthSpent(categoryId, monthKey);
  const currentWeekBudget = getCurrentWeekBudget(categoryId, weekKey, monthKey);
  const weekSpent = getWeekSpent(categoryId, weekKey, monthKey);
  const monthRemaining = Math.max(0, monthlyBudget - monthSpent);
  const projectedMonthEndSpend = timing.monthProgress > 0 ? monthSpent / timing.monthProgress : monthSpent;
  const projectedOvershoot = Math.max(0, projectedMonthEndSpend - monthlyBudget);
  const penaltyData = calculatePenalty(categoryId, weekSpent, currentWeekBudget);
  const expectedSpendByToday = monthlyBudget * timing.monthProgress;
  const paceRatio = expectedSpendByToday > 0 ? monthSpent / expectedSpendByToday : 0;
  const status = calculateStatus(category, {
    scope: "month",
    weekSpent,
    currentWeekBudget,
    paceRatio,
    softCap: monthlyBudget * 1.15,
    projected: projectedMonthEndSpend,
    monthSpent,
    monthlyBudget
  });
  return {
    category: category.id,
    label: category.label,
    icon: category.icon,
    group: category.group,
    ruleType: category.ruleType,
    scope: "month",
    monthlyBudget,
    weekSpent,
    currentWeekBudget,
    monthSpent,
    monthRemaining,
    primarySpent: projectedMonthEndSpend,
    primaryBudget: monthlyBudget,
    projectedAmount: projectedMonthEndSpend,
    actualAmount: monthSpent,
    projectedOvershoot,
    overshoot: Math.max(0, monthSpent - monthlyBudget),
    penalty: penaltyData.penalty,
    actualExceededBudget: category.ruleType === "penalty" && monthSpent > monthlyBudget,
    status
  };
}

function calculateStatus(category, values) {
  if (category.ruleType === "trackOnly") return { key: "info", label: "Track", tone: "neutral" };
  if (category.ruleType === "softCap") {
    if (values.scope === "week" && (values.paceRatio > 1.25 || values.weekSpent > values.softCap)) return { key: "risk", label: "Risk", tone: "red" };
    if (values.scope === "month" && (values.monthSpent > values.monthlyBudget || values.projected > values.monthlyBudget * 1.15)) return { key: "risk", label: "Risk", tone: "red" };
    if (values.paceRatio > 1.05 || values.projected > values.monthlyBudget || values.weekSpent > values.currentWeekBudget) return { key: "watch", label: "Watch", tone: "yellow" };
    return { key: "ok", label: "OK", tone: "green" };
  }
  if (category.ruleType === "penalty") {
    if (values.scope === "week" && (values.weekSpent > values.currentWeekBudget || values.paceRatio > 1.5)) return { key: "freeze", label: "Freeze", tone: "red" };
    if (values.scope === "month" && (values.monthSpent > values.monthlyBudget || values.projected > values.monthlyBudget * 1.25)) return { key: "freeze", label: "Freeze", tone: "red" };
    if (values.paceRatio > 1 || values.projected > values.monthlyBudget) return { key: "watch", label: "Watch", tone: "yellow" };
    return { key: "ok", label: "OK", tone: "green" };
  }
  return { key: "ok", label: "OK", tone: "green" };
}

function calculateOverallMonitorStatus(cards, scope) {
  const included = cards.filter((card) => isVariableTotalCategory(getCategoryById(card.category)));
  const projectedSpend = sum(included.map((card) => card.primarySpent));
  const budget = sum(included.map((card) => card.primaryBudget));
  const discretionaryExceeded = included.some((card) => card.group === "discretionary" && card.actualExceededBudget);
  if (!included.length) return { key: "neutral", label: "Setup", action: "Create categories to start monitoring.", projectedSpend: 0, budget: 0 };
  if (discretionaryExceeded) return { key: "freeze", label: "Freeze", action: scope === "month" ? "Discretionary budget is already exceeded this month." : "Discretionary spending should stop this week.", projectedSpend, budget };
  if (projectedSpend > budget) return { key: "watch", label: "Watch", action: scope === "month" ? "Month-end projection is over budget." : "Spending pace is running ahead.", projectedSpend, budget };
  return { key: "safe", label: "Safe", action: scope === "month" ? "On pace this month." : "On pace this week.", projectedSpend, budget };
}

function calculateWeeklyDiscipline() {
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const rows = getActiveCategories()
    .filter((category) => category.includeInWeeklyDiscipline && category.ruleType === "penalty")
    .map((category) => calculateWeekCategoryStatus(category.id, monthKey, weekKey))
    .filter((card) => card.penalty > 0)
    .map((card) => ({ categoryId: card.category, label: card.label, overshoot: card.overshoot, penalty: card.penalty }));
  return {
    weekKey,
    penaltyRows: rows,
    discretionaryOvershoot: sum(rows.map((row) => row.overshoot)),
    projectedDiscretionaryOvershoot: sum(getActiveCategories().filter((cat) => cat.ruleType === "penalty").map((cat) => calculateWeekCategoryStatus(cat.id, monthKey, weekKey).projectedOvershoot)),
    nextWeekReduction: sum(rows.map((row) => row.penalty))
  };
}

function calculateMonthOutlook() {
  const cards = getMonitorCategories().map((category) => calculateMonthCategoryStatus(category.id));
  const included = cards.filter((card) => isVariableTotalCategory(getCategoryById(card.category)));
  const projectedMonthEndVariableSpend = sum(included.map((card) => card.primarySpent));
  const monthlyVariableBudget = sum(included.map((card) => card.primaryBudget));
  const projectedDiff = projectedMonthEndVariableSpend - monthlyVariableBudget;
  const freeze = included.some((card) => card.group === "discretionary" && card.monthSpent > card.monthlyBudget);
  const statusKey = freeze ? "freeze" : projectedDiff > 0 ? "watch" : "safe";
  return {
    projectedMonthEndVariableSpend,
    monthlyVariableBudget,
    projectedDiff,
    atRisk: included.filter((card) => card.projectedOvershoot > 0).sort((a, b) => b.projectedOvershoot - a.projectedOvershoot).slice(0, 3),
    status: {
      key: statusKey,
      label: statusKey === "safe" ? "Safe" : statusKey === "watch" ? "Watch" : "Freeze",
      action: statusKey === "safe" ? "Month is on pace." : statusKey === "watch" ? "Month-end projection is over budget." : "Discretionary budget is already exceeded this month."
    }
  };
}

function getWeeklyCloseStatus(weekKey) {
  if (state.weeklyClosures[weekKey]) return { key: "closed", label: "Closed", tone: "green", message: "This week has already been closed." };
  const day = new Date(`${getReferenceDateISO(state.ui.selectedMonth)}T00:00:00`).getDay();
  const previousWeekKey = getPreviousWeekKey(weekKey);
  if (day === 1 && !state.weeklyClosures[previousWeekKey] && previousWeekNeedsClose(previousWeekKey)) {
    return { key: "last-week-open", label: "Last week not closed", tone: "yellow", message: "Review last week before continuing." };
  }
  if (day === 0) return { key: "ready", label: "Ready to close", tone: "yellow", message: "Ready to close this week." };
  return { key: "in-progress", label: "In progress", tone: "neutral", message: "Week is still in progress." };
}

function getPreviousWeekKey(weekKey) {
  return shiftDateISO(weekKey, -7);
}

function previousWeekNeedsClose(weekKey) {
  const weekEnd = getWeekEnd(weekKey);
  const hasTransactions = state.transactions.some((item) => item.dateISO >= weekKey && item.dateISO <= weekEnd);
  if (hasTransactions) return true;
  return getActiveCategories()
    .filter((category) => category.ruleType === "penalty")
    .some((category) => {
      const budget = getCurrentWeekBudget(category.id, weekKey, state.ui.selectedMonth);
      const spent = getWeekSpent(category.id, weekKey, state.ui.selectedMonth);
      return spent > budget;
    });
}

function closeWeek() {
  const discipline = calculateWeeklyDiscipline();
  if (state.weeklyClosures[discipline.weekKey]) {
    showToast("This week has already been closed.");
    return;
  }
  const nextWeekKey = shiftDateISO(discipline.weekKey, 7);
  const categoryPenalties = Object.fromEntries(discipline.penaltyRows.map((row) => [row.categoryId, row.penalty]));
  state.weeklyBudgetAdjustments[nextWeekKey] = {
    weekStartISO: nextWeekKey,
    sourceWeekStartISO: discipline.weekKey,
    categoryPenalties,
    totalPenalty: discipline.nextWeekReduction
  };
  state.weeklyClosures[discipline.weekKey] = {
    weekStartISO: discipline.weekKey,
    closedAtISO: new Date().toISOString(),
    categoryPenalties,
    totalPenalty: discipline.nextWeekReduction
  };
  saveState();
  showToast(`Week closed. Next week reduced by ${money(discipline.nextWeekReduction)}.`);
  render();
}

function reopenWeek() {
  const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
  if (!state.weeklyClosures[weekKey]) {
    showToast("No week close to reopen.");
    return;
  }
  if (!window.confirm("Reopen this week? This removes the week closure and the next-week budget adjustment created from it.")) return;
  delete state.weeklyClosures[weekKey];
  delete state.weeklyBudgetAdjustments[shiftDateISO(weekKey, 7)];
  saveState();
  showToast("Week reopened.");
  render();
}

function reviewLastWeek() {
  state.ui.txFilter = "week";
  showToast("Review last week from Activity.");
  openTransactionsManager();
}

function saveTransaction(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const category = String(form.get("category") || "");
  if (!isCategoryAllowedForTransaction(category)) {
    showToast("Create a category first.");
    return;
  }
  const tx = {
    id: String(form.get("id") || uid("txn")),
    dateISO: normalizeDateValue(form.get("dateISO")),
    amount: Number(form.get("amount")) || 0,
    category,
    note: String(form.get("note") || "").trim()
  };
  if (!tx.dateISO || tx.amount <= 0) {
    showToast("Date and amount are required.");
    return;
  }
  const index = state.transactions.findIndex((item) => item.id === tx.id);
  if (index >= 0) state.transactions[index] = tx;
  else state.transactions.push(tx);
  state.ui.lastTransactionTemplate = { amount: tx.amount, category: tx.category, note: tx.note };
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  state.ui.activeTab = "monitor";
  saveState();
  showToast(index >= 0 ? "Transaction updated." : "Transaction added.");
  render();
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

function saveCategoryEditor(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.categoryId;
  const category = getCategoryById(id);
  if (!category) return;
  const form = new FormData(event.currentTarget);
  Object.assign(category, {
    label: String(form.get("label") || category.label).trim(),
    icon: String(form.get("icon") || "◼").trim() || "◼",
    group: CATEGORY_GROUPS.includes(form.get("group")) ? form.get("group") : "custom",
    monthlyBudget: Number(form.get("monthlyBudget")) || 0,
    ruleType: RULE_TYPES.includes(form.get("ruleType")) ? form.get("ruleType") : "trackOnly",
    softCapMultiplier: form.get("softCapMultiplier") === "" ? null : Number(form.get("softCapMultiplier")),
    penaltyMultiplier: form.get("penaltyMultiplier") === "" ? null : Number(form.get("penaltyMultiplier")),
    minPenaltyUnit: form.get("minPenaltyUnit") === "" ? null : Number(form.get("minPenaltyUnit")),
    displayOrder: Number(form.get("displayOrder")) || category.displayOrder,
    monitor: form.has("monitor"),
    allowTransactions: form.has("allowTransactions"),
    includeInVariableTotal: form.has("includeInVariableTotal"),
    includeInWeeklyDiscipline: form.has("includeInWeeklyDiscipline"),
    active: form.has("active")
  });
  state.settings.monitorCategories.sort(byDisplayOrder);
  saveState();
  showToast("Category saved.");
  closeSheet();
}

function saveCategoryManager(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  getCategories().forEach((category) => {
    const value = form.get(`order.${category.id}`);
    if (value != null) category.displayOrder = Number(value) || category.displayOrder;
  });
  state.settings.monitorCategories.sort(byDisplayOrder);
  saveState();
  showToast("Category order saved.");
  openManageBudgetCategories();
}

function addCategory(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  if (!label) return;
  const id = uniqueId(slugify(label), getCategories().map((item) => item.id));
  const preset = String(form.get("preset") || "discretionary");
  const presetConfig = preset === "essential"
    ? { group: "essentials", ruleType: "softCap", includeInVariableTotal: true, includeInWeeklyDiscipline: true }
    : preset === "trackOnly"
      ? { group: "custom", ruleType: "trackOnly", includeInVariableTotal: false, includeInWeeklyDiscipline: false }
      : { group: "discretionary", ruleType: "penalty", includeInVariableTotal: true, includeInWeeklyDiscipline: true };
  state.settings.monitorCategories.push(normalizeCategory({
    id,
    label,
    icon: "◼",
    monthlyBudget: Number(form.get("monthlyBudget")) || 0,
    ...presetConfig,
    monitor: form.has("monitor"),
    allowTransactions: form.has("allowTransactions"),
    displayOrder: getCategories().length + 1
  }));
  saveState();
  showToast("Category added. Mark the checklist step done if complete.");
  if (state.ui.returnToQuickAddAfterCategoryCreate) {
    state.ui.returnToQuickAddAfterCategoryCreate = false;
    saveState();
    openQuickAdd();
  } else {
    modalRoot.innerHTML = renderBudgetSetupSheet();
    bindSheetEvents();
  }
}

function archiveCurrentCategory() {
  const id = modalRoot.querySelector("#categoryEditorForm")?.dataset.categoryId;
  const category = getCategoryById(id);
  if (!category) return;
  category.active = false;
  category.archived = true;
  saveState();
  showToast("Category archived.");
  closeSheet();
}

function deleteCurrentCategory() {
  const id = modalRoot.querySelector("#categoryEditorForm")?.dataset.categoryId;
  if (!id || categoryHasTransactions(id)) return;
  if (!window.confirm("Delete this category?")) return;
  state.settings.monitorCategories = state.settings.monitorCategories.filter((item) => item.id !== id);
  saveState();
  showToast("Category deleted.");
  closeSheet();
}

function restoreCategory(id) {
  const category = getCategoryById(id);
  if (!category) return;
  category.active = true;
  category.archived = false;
  saveState();
  openManageBudgetCategories();
}

function saveVaultEditor(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.vaultId;
  const vault = getVaultById(id);
  if (!vault) return;
  const form = new FormData(event.currentTarget);
  Object.assign(vault, {
    name: String(form.get("name") || vault.name).trim(),
    currentAmount: Number(form.get("currentAmount")) || 0,
    targetAmount: form.get("targetAmount") === "" ? null : Number(form.get("targetAmount")) || null,
    note: String(form.get("note") || "").trim(),
    colorToken: VAULT_COLORS.includes(form.get("colorToken")) ? form.get("colorToken") : "gold",
    displayOrder: Number(form.get("displayOrder")) || vault.displayOrder,
    includeInMonitor: form.has("includeInMonitor"),
    active: form.has("active")
  });
  state.settings.reserveVaults.sort(byDisplayOrder);
  saveState();
  showToast("Vault saved. Mark the checklist step done if complete.");
  closeSheet();
}

function saveVaultManager(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  getReserveVaults().forEach((vault) => {
    const value = form.get(`order.${vault.id}`);
    if (value != null) vault.displayOrder = Number(value) || vault.displayOrder;
  });
  state.settings.reserveVaults.sort(byDisplayOrder);
  saveState();
  showToast("Vault order saved.");
  openManageVaults();
}

function addVault(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  if (!name) return;
  const id = uniqueId(slugify(name), getReserveVaults().map((item) => item.id));
  state.settings.reserveVaults.push(normalizeVault({
    id,
    name,
    currentAmount: Number(form.get("currentAmount")) || 0,
    targetAmount: form.get("targetAmount") === "" ? null : Number(form.get("targetAmount")) || null,
    note: String(form.get("note") || "").trim(),
    includeInMonitor: form.has("includeInMonitor"),
    colorToken: "gold",
    displayOrder: Number(form.get("displayOrder")) || getReserveVaults().length + 1
  }));
  saveState();
  showToast("Vault added. Mark the checklist step done if complete.");
  modalRoot.innerHTML = renderReserveSetupSheet();
  bindSheetEvents();
}

function archiveCurrentVault() {
  const id = modalRoot.querySelector("#vaultEditorForm")?.dataset.vaultId;
  const vault = getVaultById(id);
  if (!vault) return;
  vault.active = false;
  vault.archived = true;
  saveState();
  showToast("Vault archived.");
  closeSheet();
}

function deleteCurrentVault() {
  const id = modalRoot.querySelector("#vaultEditorForm")?.dataset.vaultId;
  if (!id || !window.confirm("Delete this vault?")) return;
  state.settings.reserveVaults = state.settings.reserveVaults.filter((item) => item.id !== id);
  saveState();
  showToast("Vault deleted.");
  closeSheet();
}

function restoreVault(id) {
  const vault = getVaultById(id);
  if (!vault) return;
  vault.active = true;
  vault.archived = false;
  saveState();
  openManageVaults();
}

function saveBackgroundManager(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  getBackgroundSections().forEach((section) => {
    const value = form.get(`order.${section.id}`);
    if (value != null) section.displayOrder = Number(value) || section.displayOrder;
  });
  state.settings.backgroundSections.sort(byDisplayOrder);
  saveState();
  showToast("Background order saved.");
  openManageBackground();
}

function addBackgroundSection(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const label = String(form.get("label") || "").trim();
  if (!label) return;
  const id = uniqueId(slugify(label), getBackgroundSections().map((item) => item.id));
  state.settings.backgroundSections.push(normalizeBackgroundSection({
    id,
    label,
    type: form.get("type"),
    displayOrder: getBackgroundSections().length + 1,
    items: []
  }));
  saveState();
  showToast("Background section added.");
  openManageBackground();
}

function addBackgroundItem(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const section = getBackgroundSectionById(form.get("sectionId"));
  const label = String(form.get("label") || "").trim();
  if (!section || !label) return;
  section.items.push(normalizeBackgroundItem({
    id: uniqueId(slugify(label), section.items.map((item) => item.id)),
    label,
    amount: Number(form.get("amount")) || 0,
    frequency: "monthly"
  }));
  saveState();
  showToast("Background item added.");
  openManageBackground();
}

function saveBackgroundItemEditor(event) {
  event.preventDefault();
  const section = getBackgroundSectionById(event.currentTarget.dataset.sectionId);
  const item = section?.items.find((candidate) => candidate.id === event.currentTarget.dataset.itemId);
  if (!item) return;
  const form = new FormData(event.currentTarget);
  item.label = String(form.get("label") || item.label).trim();
  item.amount = Number(form.get("amount")) || 0;
  item.frequency = form.get("frequency");
  item.active = form.has("active");
  saveState();
  showToast("Background item saved.");
  closeSheet();
}

function archiveCurrentBackgroundItem() {
  const form = modalRoot.querySelector("#backgroundItemEditorForm");
  const section = getBackgroundSectionById(form?.dataset.sectionId);
  const item = section?.items.find((candidate) => candidate.id === form?.dataset.itemId);
  if (!item) return;
  item.active = false;
  item.archived = true;
  saveState();
  showToast("Background item archived.");
  closeSheet();
}

function toggleMonthReviewItem(monthKey, key) {
  const review = ensureMonthReview(monthKey);
  markMonthReviewItem(monthKey, key, !review[key]);
  saveState();
  render();
}

function runReviewAction(key) {
  if (key === "reviewSpendingDone") {
    state.ui.activeTab = "monitor";
    state.ui.monitorScope = "month";
    saveState();
    render();
    closeSheet();
    return;
  }
  if (key === "adjustBudgetsDone") {
    openPlanningSheet("budget");
    return;
  }
  if (key === "updateVaultsDone") {
    openPlanningSheet("reserve");
    return;
  }
  if (key === "backupDone") exportCSV();
}

function markMonthReviewItem(monthKey, key, value = true) {
  const review = ensureMonthReview(monthKey);
  review[key] = Boolean(value);
  review[`${key}AtISO`] = value ? new Date().toISOString() : null;
}

function ensureMonthReview(monthKey) {
  state.monthReviews ||= {};
  state.monthReviews[monthKey] = normalizeMonthReview(state.monthReviews[monthKey]);
  return state.monthReviews[monthKey];
}

function getMonthReview(monthKey) {
  return normalizeMonthReview(state.monthReviews?.[monthKey]);
}

function getMonthReviewStatus(monthKey) {
  const review = getMonthReview(monthKey);
  const doneCount = REVIEW_KEYS.filter((key) => review[key]).length;
  return {
    ...review,
    doneCount,
    label: doneCount === 4 ? "Done" : doneCount ? "In progress" : "Not started"
  };
}

function openPlanningSheet(sectionKey) {
  state.ui.activeTab = "planning";
  saveState();
  if (sectionKey === "budget") modalRoot.innerHTML = renderBudgetSetupSheet();
  else if (sectionKey === "reserve") modalRoot.innerHTML = renderReserveSetupSheet();
  else if (sectionKey === "background") modalRoot.innerHTML = renderBackgroundSetupSheet();
  else if (sectionKey === "monthSetup") modalRoot.innerHTML = renderMonthSetupSheet();
  else if (sectionKey === "data") modalRoot.innerHTML = renderDataCenterSheet();
  else return;
  bindSheetEvents();
}

function toggleMonitorCardDetails(categoryId) {
  state.ui.monitorExpandedCards[categoryId] = !state.ui.monitorExpandedCards[categoryId];
  saveState();
  render();
}

function toggleWeeklyCloseDetails() {
  state.ui.weeklyCloseExpanded = !state.ui.weeklyCloseExpanded;
  saveState();
  render();
}

function exportCSV() {
  markMonthReviewItem(state.ui.selectedMonth, "backupDone", true);
  saveState();
  downloadText(`finance-tracker-v3-${state.ui.selectedMonth}.csv`, serializeStateToCSV(state), "text/csv");
  showToast("CSV backup exported.");
  render();
}

function importCSV(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  event.target.value = "";
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const { state: imported, skipped } = parseCSVToState(String(reader.result || ""));
      openCsvImportPreview(imported, skipped);
    } catch {
      showToast("Invalid CSV import.");
    }
  };
  reader.readAsText(file);
}

function openCsvImportPreview(imported, skipped) {
  pendingCsvImport = { state: normalizeState(imported), skipped };
  modalRoot.innerHTML = renderCsvImportPreviewSheet();
  bindSheetEvents();
}

function renderCsvImportPreviewSheet() {
  if (!pendingCsvImport) return "";
  const imported = pendingCsvImport.state;
  const stats = [
    ["Categories", imported.settings.monitorCategories.length],
    ["Vaults", imported.settings.reserveVaults.length],
    ["Background sections", imported.settings.backgroundSections.length],
    ["Background items", imported.settings.backgroundSections.flatMap((section) => section.items || []).length],
    ["Transactions", imported.transactions.length],
    ["Month reviews", Object.keys(imported.monthReviews || {}).length],
    ["Weekly adjustments", Object.keys(imported.weeklyBudgetAdjustments || {}).length],
    ["Weekly closures", Object.keys(imported.weeklyClosures || {}).length],
    ["Skipped rows", pendingCsvImport.skipped]
  ];
  return renderSetupSheet("Import Preview", `
    <div class="import-preview-grid">
      ${stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("")}
    </div>
    <div class="notice-strip warning">Importing will replace current local data.</div>
    <div class="button-row">
      <button id="confirmCsvImportButton" class="action-button" type="button">Confirm Import</button>
      <button id="cancelCsvImportButton" class="ghost-button" type="button">Cancel</button>
    </div>
  `, "CSV");
}

function confirmCsvImport() {
  if (!pendingCsvImport) return;
  state = normalizeState(pendingCsvImport.state);
  const skipped = pendingCsvImport.skipped;
  pendingCsvImport = null;
  saveState();
  showToast(skipped ? `CSV imported with ${skipped} skipped rows.` : "CSV imported.");
  modalRoot.innerHTML = "";
  render();
}

function cancelCsvImport() {
  pendingCsvImport = null;
  modalRoot.innerHTML = "";
  showToast("CSV import canceled.");
}

function downloadSampleCSV() {
  downloadText("finance-tracker-v3-sample.csv", getSampleCSV(), "text/csv");
  showToast("Sample CSV downloaded.");
}

function getSampleCSV() {
  const sample = structuredClone(DEFAULT_STATE);
  sample.settings.monitorCategories.push(normalizeCategory({
    id: "sample-category",
    label: "Sample Category",
    group: "discretionary",
    ruleType: "penalty",
    monthlyBudget: 100,
    monitor: true,
    allowTransactions: true,
    displayOrder: 1
  }));
  sample.settings.reserveVaults.push(normalizeVault({
    id: "sample-vault",
    name: "Sample Vault",
    currentAmount: 0,
    targetAmount: 100,
    note: "Example savings goal",
    includeInMonitor: true,
    displayOrder: 1
  }));
  sample.settings.backgroundSections.push(normalizeBackgroundSection({
    id: "sample-background",
    label: "Sample Background",
    type: "other",
    displayOrder: 1,
    items: [{ id: "sample-item", label: "Sample Item", amount: 0, frequency: "monthly", active: true, archived: false }]
  }));
  sample.transactions.push({ id: "sample-transaction", dateISO: `${state.ui.selectedMonth}-01`, amount: 1, category: "sample-category", note: "Example transaction" });
  sample.monthReviews[state.ui.selectedMonth] = normalizeMonthReview({ backupDone: true, backupDoneAtISO: new Date().toISOString() });
  return serializeStateToCSV(sample);
}

function serializeStateToCSV(source) {
  const columns = ["record_type", "id", "parent_id", "name", "label", "date", "amount", "current_amount", "target_amount", "category", "group", "rule_type", "monthly_budget", "note", "frequency", "active", "archived", "include_in_monitor", "allow_transactions", "display_order"];
  const rows = [columns];
  source.settings.monitorCategories.forEach((item) => rows.push([
    "category", item.id, "", "", item.label, "", "", "", "", "", item.group, item.ruleType, item.monthlyBudget, "", "", item.active, item.archived, item.monitor, item.allowTransactions, item.displayOrder
  ]));
  source.settings.reserveVaults.forEach((item) => rows.push([
    "vault", item.id, "", item.name, "", "", "", item.currentAmount, item.targetAmount ?? "", "", "", "", "", item.note, "", item.active, item.archived, item.includeInMonitor, "", item.displayOrder
  ]));
  source.settings.backgroundSections.forEach((section) => {
    rows.push(["background_section", section.id, "", section.label, "", "", "", "", "", "", section.type, "", "", "", "", section.active, section.archived, "", "", section.displayOrder]);
    section.items.forEach((item) => rows.push(["background_item", item.id, section.id, "", item.label, "", item.amount, "", "", "", "", "", "", "", item.frequency, item.active, item.archived, "", "", ""]));
  });
  source.transactions.forEach((item) => rows.push(["transaction", item.id, "", "", "", item.dateISO, item.amount, "", "", item.category, "", "", "", item.note, "", true, false, "", "", ""]));
  Object.entries(source.monthReviews || {}).forEach(([month, review]) => {
    rows.push(["month_review", month, "", "", "", month, "", "", "", "", "", "", "", JSON.stringify(review), "", true, false, "", "", ""]);
  });
  Object.entries(source.weeklyBudgetAdjustments || {}).forEach(([week, adjustment]) => {
    rows.push(["weekly_adjustment", week, "", "", "", week, adjustment.totalPenalty || 0, "", "", "", "", "", "", JSON.stringify(adjustment.categoryPenalties || {}), "", true, false, "", "", ""]);
  });
  Object.entries(source.weeklyClosures || {}).forEach(([week, closure]) => {
    rows.push(["weekly_closure", week, "", "", "", week, closure.totalPenalty || 0, "", "", "", "", "", "", JSON.stringify(closure.categoryPenalties || {}), "", true, false, "", "", ""]);
  });
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

function parseCSVToState(text) {
  const records = csvParse(text);
  if (!records.length) return { state: structuredClone(DEFAULT_STATE), skipped: 0 };
  const headers = records[0].map((item) => String(item).trim());
  const next = structuredClone(DEFAULT_STATE);
  const sectionMap = new Map();
  let skipped = 0;
  records.slice(1).forEach((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    try {
      if (row.record_type === "category") next.settings.monitorCategories.push(normalizeCategory(rowToCategory(row)));
      else if (row.record_type === "vault") next.settings.reserveVaults.push(normalizeVault(rowToVault(row)));
      else if (row.record_type === "background_section") {
        const section = normalizeBackgroundSection(rowToBackgroundSection(row));
        if (section) {
          next.settings.backgroundSections.push(section);
          sectionMap.set(section.id, section);
        }
      } else if (row.record_type === "background_item") {
        const section = sectionMap.get(row.parent_id);
        const item = normalizeBackgroundItem(rowToBackgroundItem(row));
        if (section && item) section.items.push(item);
        else skipped += 1;
      } else if (row.record_type === "transaction") {
        const tx = normalizeTransaction(rowToTransaction(row));
        if (tx) next.transactions.push(tx);
        else skipped += 1;
      } else if (row.record_type === "month_review") {
        next.monthReviews[row.id || row.date] = normalizeMonthReview(safeJson(row.note));
      } else if (row.record_type === "weekly_adjustment") {
        next.weeklyBudgetAdjustments[row.id || row.date] = { weekStartISO: row.id || row.date, categoryPenalties: safeJson(row.note), totalPenalty: number(row.amount) };
      } else if (row.record_type === "weekly_closure") {
        next.weeklyClosures[row.id || row.date] = { weekStartISO: row.id || row.date, closedAtISO: new Date().toISOString(), categoryPenalties: safeJson(row.note), totalPenalty: number(row.amount) };
      } else if (row.record_type) skipped += 1;
    } catch {
      skipped += 1;
    }
  });
  return { state: next, skipped };
}

function rowToCategory(row) {
  return {
    id: row.id,
    label: row.label,
    group: row.group,
    ruleType: row.rule_type,
    monthlyBudget: number(row.monthly_budget),
    active: bool(row.active),
    archived: bool(row.archived),
    monitor: bool(row.include_in_monitor),
    allowTransactions: bool(row.allow_transactions),
    displayOrder: number(row.display_order) || 1,
    icon: "◼"
  };
}

function rowToVault(row) {
  return {
    id: row.id,
    name: row.name,
    currentAmount: number(row.current_amount),
    targetAmount: row.target_amount === "" ? null : number(row.target_amount),
    note: row.note,
    includeInMonitor: bool(row.include_in_monitor),
    active: bool(row.active),
    archived: bool(row.archived),
    displayOrder: number(row.display_order) || 1,
    colorToken: "gold"
  };
}

function rowToBackgroundSection(row) {
  return {
    id: row.id,
    label: row.name || row.label,
    type: row.group || "other",
    active: bool(row.active),
    archived: bool(row.archived),
    displayOrder: number(row.display_order) || 1,
    items: []
  };
}

function rowToBackgroundItem(row) {
  return {
    id: row.id,
    label: row.label,
    amount: number(row.amount),
    frequency: row.frequency || "monthly",
    active: bool(row.active),
    archived: bool(row.archived)
  };
}

function rowToTransaction(row) {
  return {
    id: row.id,
    dateISO: row.date,
    amount: number(row.amount),
    category: row.category,
    note: row.note
  };
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
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

function resetData() {
  if (!window.confirm("Reset local data? This clears the V3 tracker data stored in this browser.")) return;
  state = structuredClone(DEFAULT_STATE);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  showToast("Local data reset.");
  render();
}

function getCategories() {
  return state.settings.monitorCategories || [];
}

function getActiveCategories() {
  return getCategories().filter((item) => item.active && !item.archived);
}

function getMonitorCategories() {
  return getActiveCategories()
    .filter((item) => item.monitor)
    .sort(byDisplayOrder)
    .slice(0, 6);
}

function getActiveTransactionCategories() {
  return getActiveCategories().filter((item) => item.allowTransactions).sort(byDisplayOrder);
}

function getCategoryById(id) {
  return getCategories().find((item) => item.id === id) || {
    id,
    label: id ? startCase(id) : "Unknown",
    icon: "◼",
    group: "custom",
    monthlyBudget: 0,
    ruleType: "trackOnly",
    active: false,
    archived: true
  };
}

function getCategoryLabel(id) {
  return getCategoryById(id).label;
}

function isCategoryAllowedForTransaction(id) {
  return getActiveTransactionCategories().some((item) => item.id === id);
}

function isVariableTotalCategory(category) {
  return category?.active !== false && !category?.archived && category?.includeInVariableTotal !== false;
}

function categoryHasTransactions(categoryId) {
  return state.transactions.some((item) => item.category === categoryId);
}

function getReserveVaults() {
  return state.settings.reserveVaults || [];
}

function getActiveReserveVaults() {
  return getReserveVaults().filter((item) => item.active && !item.archived).sort(byDisplayOrder);
}

function getMonitorReserveVaults() {
  return getActiveReserveVaults().filter((item) => item.includeInMonitor).sort(byDisplayOrder);
}

function getVaultById(id) {
  return getReserveVaults().find((item) => item.id === id) || null;
}

function calculateVaultTotal() {
  return sum(getActiveReserveVaults().map((vault) => vault.currentAmount));
}

function calculateVaultProgress(vault) {
  if (!vault.targetAmount) return { percent: Math.min(100, vault.currentAmount > 0 ? 100 : 0), status: "Tracking" };
  const percent = Math.max(0, Math.min(100, vault.currentAmount / vault.targetAmount * 100));
  return {
    percent,
    status: vault.currentAmount >= vault.targetAmount ? "Complete" : "Building"
  };
}

function getVaultRemainingText(vault) {
  if (!vault.targetAmount) return "Tracking";
  const remaining = Math.max(0, vault.targetAmount - vault.currentAmount);
  return remaining <= 0 ? "Target reached" : `${money(remaining)} left`;
}

function getBackgroundSections() {
  return state.settings.backgroundSections || [];
}

function getActiveBackgroundSections() {
  return getBackgroundSections().filter((item) => item.active && !item.archived).sort(byDisplayOrder);
}

function getActiveBackgroundItems() {
  return getActiveBackgroundSections().flatMap((section) => section.items.filter((item) => item.active && !item.archived));
}

function getBackgroundSectionById(id) {
  return getBackgroundSections().find((item) => item.id === id) || null;
}

function getCurrentWeekBudget(categoryId, weekKey, monthKey = state.ui.selectedMonth) {
  const category = getCategoryById(categoryId);
  const weeks = getWeeksOverlappingMonth(monthKey);
  const base = weeks.length ? (Number(category.monthlyBudget) || 0) / weeks.length : 0;
  return Math.max(0, base - getWeekAdjustmentPenalty(weekKey, categoryId));
}

function getWeekAdjustmentPenalty(weekKey, categoryId) {
  const adjustment = state.weeklyBudgetAdjustments?.[weekKey];
  return Number(adjustment?.categoryPenalties?.[categoryId]) || 0;
}

function calculatePenalty(categoryId, actual, budget) {
  const category = getCategoryById(categoryId);
  if (category.ruleType !== "penalty") return { overshoot: 0, penalty: 0 };
  const overshoot = Math.max(0, actual - budget);
  const multiplier = Number(category.penaltyMultiplier ?? state.settings.weeklyRules.penaltyMultiplier) || 1.5;
  const min = Number(category.minPenaltyUnit ?? state.settings.weeklyRules.minPenaltyUnit) || 5;
  return { overshoot, penalty: overshoot > 0 ? Math.max(min, overshoot * multiplier) : 0 };
}

function getSoftCapMultiplier(category) {
  return Number(category.softCapMultiplier ?? state.settings.weeklyRules.defaultSoftCapMultiplier) || 1.1;
}

function getMonthSpent(categoryId, monthKey = state.ui.selectedMonth) {
  return sum(state.transactions.filter((item) => item.category === categoryId && item.dateISO.slice(0, 7) === monthKey).map((item) => item.amount));
}

function getWeekSpent(categoryId, weekKey, monthKey = state.ui.selectedMonth) {
  const weekEnd = getWeekEnd(weekKey);
  return sum(state.transactions.filter((item) => item.category === categoryId && item.dateISO.slice(0, 7) === monthKey && item.dateISO >= weekKey && item.dateISO <= weekEnd).map((item) => item.amount));
}

function getScopedTransactions() {
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const weekEnd = getWeekEnd(weekKey);
  return state.transactions
    .filter((item) => state.ui.monitorScope === "month"
      ? item.dateISO.slice(0, 7) === monthKey
      : item.dateISO.slice(0, 7) === monthKey && item.dateISO >= weekKey && item.dateISO <= weekEnd)
    .sort(sortTransactionsDesc);
}

function getFilteredTransactions() {
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const weekEnd = getWeekEnd(weekKey);
  let list = state.transactions.slice();
  if (state.ui.txFilter === "month") list = list.filter((item) => item.dateISO.slice(0, 7) === monthKey);
  if (state.ui.txFilter === "week") list = list.filter((item) => item.dateISO.slice(0, 7) === monthKey && item.dateISO >= weekKey && item.dateISO <= weekEnd);
  if (state.ui.txFilter === "essentials") list = list.filter((item) => getCategoryById(item.category).group === "essentials");
  if (state.ui.txFilter === "discretionary") list = list.filter((item) => getCategoryById(item.category).group === "discretionary");
  return list.sort(sortTransactionsDesc);
}

function getReferenceDateISO(monthKey) {
  const today = currentDateISO();
  if (today.slice(0, 7) === monthKey) return today;
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).toISOString().slice(0, 10);
}

function getMonthTiming(monthKey) {
  const today = currentDateISO();
  const daysInMonth = getDaysInMonth(monthKey);
  let dayOfMonth = daysInMonth;
  if (today.slice(0, 7) === monthKey) dayOfMonth = Number(today.slice(8, 10));
  if (monthKey > today.slice(0, 7)) dayOfMonth = 1;
  return {
    daysInMonth,
    dayOfMonth,
    monthProgress: Math.min(1, Math.max(1 / daysInMonth, dayOfMonth / daysInMonth))
  };
}

function getWeekTiming(referenceDateISO) {
  const weekStartISO = getWeekStart(referenceDateISO);
  const elapsed = Math.floor((new Date(`${referenceDateISO}T00:00:00`) - new Date(`${weekStartISO}T00:00:00`)) / 86400000) + 1;
  const daysElapsedInWeek = Math.min(7, Math.max(1, elapsed));
  return { weekStartISO, daysElapsedInWeek, weekProgress: daysElapsedInWeek / 7 };
}

function getWeeksOverlappingMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const days = new Date(year, month, 0).getDate();
  const seen = new Set();
  for (let day = 1; day <= days; day += 1) {
    seen.add(getWeekKey(new Date(year, month - 1, day).toISOString().slice(0, 10)));
  }
  return Array.from(seen).sort();
}

function getWeekStart(dateISO) {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().slice(0, 10);
}

function getWeekEnd(dateISO) {
  return shiftDateISO(getWeekStart(dateISO), 6);
}

function getWeekKey(dateISO) {
  return getWeekStart(dateISO);
}

function getDaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function defaultDateForMonth(monthKey) {
  const today = currentDateISO();
  return today.slice(0, 7) === monthKey ? today : `${monthKey}-01`;
}

function currentDateISO() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthKey() {
  return currentDateISO().slice(0, 7);
}

function normalizeMonthValue(value) {
  return /^\d{4}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function normalizeDateValue(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : "";
}

function shiftDateISO(dateISO, days) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function sortTransactionsDesc(a, b) {
  return `${b.dateISO}-${b.id}`.localeCompare(`${a.dateISO}-${a.id}`);
}

function byDisplayOrder(a, b) {
  return (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0) || String(a.label || a.name || a.id).localeCompare(String(b.label || b.name || b.id));
}

function monthlyEquivalent(item) {
  if (item.frequency === "annual") return (Number(item.amount) || 0) / 12;
  if (item.frequency === "oneTime") return 0;
  return Number(item.amount) || 0;
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function number(value) {
  return Number(value) || 0;
}

function bool(value) {
  if (typeof value === "boolean") return value;
  const text = String(value || "").toLowerCase();
  return ["true", "1", "yes", "y"].includes(text);
}

function safeJson(value) {
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

function money(value) {
  const amount = Number(value) || 0;
  const rounded = Math.round(Math.abs(amount));
  const formatted = rounded.toLocaleString("en-CA", { maximumFractionDigits: 0 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(dateISO) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatMonthLabel(monthKey) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-CA", { month: "short", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function startCase(value) {
  return String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase())
    .trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function uniqueId(base, existing) {
  let id = base || "item";
  let index = 2;
  while (existing.includes(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  return id;
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
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
  clearTimeout(toastTimer);
  const template = document.querySelector("#toastTemplate");
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}
