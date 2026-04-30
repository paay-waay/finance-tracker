const APP_VERSION = "v13.3 Workflow Simplification + Review Rituals";
const SCHEMA_VERSION = 11;
const STORAGE_KEY = "financeCashflowOS_v11";
const LEGACY_KEYS = ["financePlanner_v2", "finance-box-budget-v3"];
const BASE_PATH = "/finance-tracker/";

const DEFAULT_MONITOR_CATEGORIES = [
  {
    id: "groceries",
    label: "Groceries",
    icon: "🧺",
    group: "essentials",
    monthlyBudget: 750,
    monitor: true,
    allowTransactions: true,
    includeInVariableTotal: true,
    includeInWeeklyDiscipline: true,
    ruleType: "softCap",
    softCapMultiplier: 1.1,
    penaltyMultiplier: null,
    minPenaltyUnit: null,
    priority: "primary",
    displayOrder: 1,
    active: true,
    archived: false
  },
  {
    id: "charging",
    label: "Charging/407",
    icon: "⚡",
    group: "essentials",
    monthlyBudget: 150,
    monitor: true,
    allowTransactions: true,
    includeInVariableTotal: true,
    includeInWeeklyDiscipline: true,
    ruleType: "softCap",
    softCapMultiplier: 1.1,
    penaltyMultiplier: null,
    minPenaltyUnit: null,
    priority: "primary",
    displayOrder: 2,
    active: true,
    archived: false
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "🎟",
    group: "discretionary",
    monthlyBudget: 300,
    monitor: true,
    allowTransactions: true,
    includeInVariableTotal: true,
    includeInWeeklyDiscipline: true,
    ruleType: "penalty",
    softCapMultiplier: null,
    penaltyMultiplier: 1.5,
    minPenaltyUnit: 5,
    priority: "primary",
    displayOrder: 3,
    active: true,
    archived: false
  },
  {
    id: "misc",
    label: "Misc",
    icon: "◼",
    group: "discretionary",
    monthlyBudget: 150,
    monitor: true,
    allowTransactions: true,
    includeInVariableTotal: true,
    includeInWeeklyDiscipline: true,
    ruleType: "penalty",
    softCapMultiplier: null,
    penaltyMultiplier: 1.5,
    minPenaltyUnit: 5,
    priority: "primary",
    displayOrder: 4,
    active: true,
    archived: false
  }
];

const DEFAULT_BACKGROUND_SECTIONS = [
  {
    id: "core-income",
    label: "Core Income",
    type: "income",
    displayOrder: 1,
    active: true,
    archived: false,
    items: [
      { id: "pw-salary", label: "PW Salary", amount: 5897, frequency: "monthly", includeInGap: false, includeInProjection: false, includeInSummary: true, active: true, archived: false }
    ]
  },
  {
    id: "reserve-income",
    label: "Reserve Income",
    type: "income",
    displayOrder: 2,
    active: true,
    archived: false,
    items: [
      { id: "mv-contrib", label: "MV Contrib", amount: 1500, frequency: "monthly", includeInGap: false, includeInProjection: true, includeInSummary: true, active: true, archived: false },
      { id: "leo-debt", label: "Leo Debt", amount: 700, frequency: "monthly", includeInGap: false, includeInProjection: true, includeInSummary: true, active: true, archived: false }
    ]
  },
  {
    id: "investment",
    label: "Investment",
    type: "investment",
    displayOrder: 3,
    active: true,
    archived: false,
    items: [
      { id: "investment", label: "Investment", amount: 217, frequency: "monthly", includeInGap: false, includeInProjection: false, includeInSummary: true, active: true, archived: false }
    ]
  },
  {
    id: "fixed",
    label: "Fixed",
    type: "fixed",
    displayOrder: 4,
    active: true,
    archived: false,
    items: [
      { id: "insurance", label: "Insurance", amount: 558, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "condo-admin", label: "Condo Admin", amount: 564, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "property-tax", label: "Property Tax", amount: 267, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "internet", label: "Internet", amount: 49, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "pw-trust", label: "PW Trust", amount: 600, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false, systemNote: "Background only. Never appears in Quick Add or Monitor." }
    ]
  },
  {
    id: "debt",
    label: "Debt",
    type: "debt",
    displayOrder: 5,
    active: true,
    archived: false,
    items: [
      { id: "mortgage", label: "Mortgage", amount: 2167, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "car-payment", label: "Car Payment", amount: 682, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false },
      { id: "ikea-payment", label: "IKEA Payment", amount: 113, frequency: "monthly", includeInGap: true, includeInProjection: false, includeInSummary: true, active: true, archived: false }
    ]
  }
];

const DEFAULT_RESERVE = {
  projectionAnchorMonth: currentMonthKey(),
  accounts: [
    {
      id: "cash-reserve",
      label: "Cash Reserve",
      balance: 4231,
      includeInRunway: true,
      includeInVaultTotal: true,
      active: true,
      archived: false,
      displayOrder: 1
    }
  ],
  events: [
    {
      id: "stable-gap",
      label: "Stable Base Gap",
      type: "monthly",
      amount: -669,
      startMonth: "2026-05",
      endMonth: null,
      active: true,
      archived: false,
      affectsProjection: true,
      displayOrder: 1
    },
    {
      id: "mv-contrib-may-aug",
      label: "MV Contrib",
      type: "monthly",
      amount: 1500,
      startMonth: "2026-05",
      endMonth: "2026-08",
      active: true,
      archived: false,
      affectsProjection: true,
      displayOrder: 2
    },
    {
      id: "leo-debt-2026",
      label: "Leo Debt",
      type: "monthly",
      amount: 700,
      startMonth: "2026-05",
      endMonth: "2026-12",
      active: true,
      archived: false,
      affectsProjection: true,
      displayOrder: 3
    }
  ]
};

const LEGACY_CATEGORY_ALIASES = {
  groceries: ["groceries", "grocery", "food & groceries"],
  charging: ["charging", "charging/407", "car407", "407", "car / charging / 407"],
  entertainment: ["entertainment", "eat out", "dining", "food & rto", "eatout"],
  misc: ["misc", "household misc", "personal spending"]
};

const TABS = [
  { id: "monitor", label: "Monitor" },
  { id: "planning", label: "Planning" }
];

const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  appVersion: APP_VERSION,
  ui: {
    activeTab: "monitor",
    selectedMonth: currentMonthKey(),
    txFilter: "month",
    editingTransactionId: null,
    monitorScope: "week",
    planningOpenSections: {
      summary: true,
      review: false,
      budget: false,
      reserve: false,
      ledger: false,
      background: false,
      data: false
    },
    lastTransactionTemplate: null,
    monitorExpandedCards: {}
  },
  settings: {
    systemCore: {
      reserveBalanceNow: 4231,
      stableBaseGapMonthly: 669
    },
    budgetsMonthly: {
      groceries: 750,
      charging: 150,
      entertainment: 300,
      misc: 150
    },
    weeklyRules: {
      weekStart: "MON",
      penaltyMultiplier: 1.5,
      minPenaltyUnit: 5,
      defaultSoftCapMultiplier: 1.1,
      grocerySoftCapMultiplier: 1.1,
      chargingSoftCapMultiplier: 1.1
    },
    monitorCategories: structuredClone(DEFAULT_MONITOR_CATEGORIES),
    reserveSchedule: {
      preMay: 2700,
      may: 1531,
      june: null,
      july: null,
      august: null,
      september: null,
      october: null,
      november: null,
      december: null,
      mayToAugMonthlyNet: 1531,
      sepToDecMonthlyNet: 31,
      janPlusMonthlyNet: -669
    },
    reserve: structuredClone(DEFAULT_RESERVE),
    background: {
      coreIncome: {
        pwSalary: 5897
      },
      reserveIncome: {
        mvContrib: 1500,
        leoDebt: 700
      },
      investment: {
        investment: 217
      },
      fixed: {
        insurance: 558,
        condoAdmin: 564,
        propertyTax: 267,
        internet: 49,
        pwTrust: 600
      },
      debt: {
        mortgage: 2167,
        carPayment: 682,
        ikeaPayment: 113
      }
    },
    backgroundSections: structuredClone(DEFAULT_BACKGROUND_SECTIONS)
  },
  transactions: [],
  weeklyBudgetAdjustments: {},
  weeklyClosures: {},
  monthReviews: {}
};

let state = loadState();

const app = document.querySelector("#app");
const monthInput = document.querySelector("#monthInput");
const bottomNav = document.querySelector("#bottomNav");
const pageTitle = document.querySelector("#pageTitle");
const headerStatus = document.querySelector("#headerStatus");
const modalRoot = document.querySelector("#modalRoot");
let toastTimer = null;

init();

function init() {
  monthInput.value = state.ui.selectedMonth;
  bindShellEvents();
  render();
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
  const primary = parseStored(STORAGE_KEY);
  if (primary) return normalizeState(primary);

  for (const key of LEGACY_KEYS) {
    const legacy = parseStored(key);
    if (legacy) {
      const migrated = normalizeState(migrateLegacyState(legacy, key));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  }

  return structuredClone(DEFAULT_STATE);
}

function parseStored(key) {
  try {
    const text = localStorage.getItem(key);
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeState(raw) {
  const merged = deepMerge(structuredClone(DEFAULT_STATE), raw || {});
  merged.schemaVersion = SCHEMA_VERSION;
  merged.appVersion = APP_VERSION;
  merged.ui ||= {};
  if (["home", "transactions"].includes(merged.ui.activeTab)) merged.ui.activeTab = "monitor";
  if (merged.ui.activeTab === "settings") merged.ui.activeTab = "planning";
  merged.ui.activeTab = TABS.some((tab) => tab.id === merged.ui.activeTab) ? merged.ui.activeTab : "monitor";
  merged.ui.selectedMonth ||= currentMonthKey();
  merged.ui.txFilter ||= "month";
  merged.ui.editingTransactionId ||= null;
  merged.ui.monitorScope = merged.ui.monitorScope === "month" ? "month" : "week";
  merged.ui.planningOpenSections = deepMerge(
    structuredClone(DEFAULT_STATE.ui.planningOpenSections),
    merged.ui.planningOpenSections || {}
  );
  merged.ui.lastTransactionTemplate = normalizeTemplate(merged.ui.lastTransactionTemplate);
  merged.ui.monitorExpandedCards = isObject(merged.ui.monitorExpandedCards) ? merged.ui.monitorExpandedCards : {};
  merged.settings ||= structuredClone(DEFAULT_STATE.settings);
  merged.settings.weeklyRules ||= structuredClone(DEFAULT_STATE.settings.weeklyRules);
  merged.settings.weeklyRules.defaultSoftCapMultiplier ||= 1.1;
  merged.settings.monitorCategories = normalizeMonitorCategories(
    Array.isArray(raw?.settings?.monitorCategories) && raw.settings.monitorCategories.length
      ? raw.settings.monitorCategories
      : buildMonitorCategoriesFromLegacy(merged.settings)
  );
  merged.settings.backgroundSections = normalizeBackgroundSections(
    Array.isArray(raw?.settings?.backgroundSections) && raw.settings.backgroundSections.length
      ? raw.settings.backgroundSections
      : buildBackgroundSectionsFromLegacy(merged.settings.background)
  );
  merged.settings.reserve = normalizeReserve(
    isObject(raw?.settings?.reserve) ? raw.settings.reserve : buildReserveFromLegacy(merged.settings, merged.ui.selectedMonth)
  );
  merged.settings.systemCore.reserveBalanceNow = calculateReserveVaultTotalFromSettings(merged.settings);
  merged.settings.systemCore.stableBaseGapMonthly = getStableGapFromSettings(merged.settings);
  merged.settings.budgetsMonthly = buildLegacyBudgetsMonthly(merged.settings.monitorCategories);
  merged.settings.background = buildLegacyBackgroundFromSections(merged.settings.backgroundSections, merged.settings.background);
  merged.transactions = Array.isArray(merged.transactions) ? merged.transactions.map(normalizeTransaction).filter(Boolean) : [];
  merged.weeklyBudgetAdjustments = normalizeAdjustments(merged.weeklyBudgetAdjustments);
  merged.weeklyClosures = normalizeClosures(merged.weeklyClosures);
  merged.monthReviews = isObject(merged.monthReviews) ? merged.monthReviews : {};
  return merged;
}

function normalizeTemplate(raw) {
  if (!isObject(raw)) return null;
  const category = normalizeCategory(raw.category);
  return {
    amount: Number(raw.amount) || 0,
    category: category || getActiveTransactionCategoriesFromState(DEFAULT_STATE).at(0)?.id || "groceries",
    note: String(raw.note || "").trim()
  };
}

function normalizeMonitorCategories(items) {
  const source = Array.isArray(items) && items.length ? items : DEFAULT_MONITOR_CATEGORIES;
  return source
    .map((item, index) => ({
      id: String(item?.id || slugify(item?.label || `category-${index + 1}`)),
      label: String(item?.label || startCase(item?.id || `Category ${index + 1}`)),
      icon: String(item?.icon || "•"),
      group: item?.group === "essentials" ? "essentials" : item?.group === "custom" ? "custom" : "discretionary",
      monthlyBudget: Number(item?.monthlyBudget) || 0,
      monitor: item?.monitor !== false,
      allowTransactions: item?.allowTransactions !== false,
      includeInVariableTotal: item?.includeInVariableTotal !== false,
      includeInWeeklyDiscipline: item?.includeInWeeklyDiscipline !== false,
      ruleType: item?.ruleType === "trackOnly" ? "trackOnly" : item?.ruleType === "softCap" ? "softCap" : "penalty",
      softCapMultiplier: item?.softCapMultiplier == null ? null : Number(item.softCapMultiplier) || null,
      penaltyMultiplier: item?.penaltyMultiplier == null ? null : Number(item.penaltyMultiplier) || null,
      minPenaltyUnit: item?.minPenaltyUnit == null ? null : Number(item.minPenaltyUnit) || null,
      priority: item?.priority === "secondary" ? "secondary" : item?.priority === "hidden" ? "hidden" : "primary",
      displayOrder: Number(item?.displayOrder ?? index + 1) || index + 1,
      active: item?.active !== false,
      archived: Boolean(item?.archived)
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function normalizeBackgroundSections(sections) {
  const source = Array.isArray(sections) && sections.length ? sections : DEFAULT_BACKGROUND_SECTIONS;
  return source
    .map((section, sectionIndex) => ({
      id: String(section?.id || slugify(section?.label || `section-${sectionIndex + 1}`)),
      label: String(section?.label || startCase(section?.id || `Section ${sectionIndex + 1}`)),
      type: String(section?.type || "other"),
      displayOrder: Number(section?.displayOrder ?? sectionIndex + 1) || sectionIndex + 1,
      active: section?.active !== false,
      archived: Boolean(section?.archived),
      items: Array.isArray(section?.items)
        ? section.items.map((item, itemIndex) => ({
            id: String(item?.id || slugify(item?.label || `item-${itemIndex + 1}`)),
            label: String(item?.label || startCase(item?.id || `Item ${itemIndex + 1}`)),
            amount: Number(item?.amount) || 0,
            frequency: item?.frequency === "annual" ? "annual" : item?.frequency === "oneTime" ? "oneTime" : "monthly",
            type: String(item?.type || section?.type || "other"),
            includeInGap: Boolean(item?.includeInGap),
            includeInProjection: Boolean(item?.includeInProjection),
            includeInSummary: item?.includeInSummary !== false,
            active: item?.active !== false,
            archived: Boolean(item?.archived),
            systemNote: item?.systemNote || ""
          }))
        : []
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function normalizeReserve(reserve) {
  const source = isObject(reserve) ? reserve : DEFAULT_RESERVE;
  const accounts = Array.isArray(source.accounts) && source.accounts.length ? source.accounts : DEFAULT_RESERVE.accounts;
  const events = Array.isArray(source.events) && source.events.length ? source.events : DEFAULT_RESERVE.events;
  return {
    projectionAnchorMonth: normalizeMonthValue(source.projectionAnchorMonth || source.anchorMonth) || currentMonthKey(),
    accounts: accounts
      .map((account, index) => ({
        id: String(account?.id || slugify(account?.label || `reserve-account-${index + 1}`)),
        label: String(account?.label || `Reserve Account ${index + 1}`),
        balance: Number(account?.balance) || 0,
        includeInRunway: account?.includeInRunway !== false,
        includeInVaultTotal: account?.includeInVaultTotal !== false,
        active: account?.active !== false,
        archived: Boolean(account?.archived),
        displayOrder: Number(account?.displayOrder ?? index + 1) || index + 1
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
    events: events
      .map((event, index) => ({
        id: String(event?.id || slugify(event?.label || `reserve-event-${index + 1}`)),
        label: String(event?.label || `Reserve Event ${index + 1}`),
        type: event?.type === "oneTime" ? "oneTime" : "monthly",
        amount: Number(event?.amount) || 0,
        startMonth: normalizeMonthValue(event?.startMonth) || currentMonthKey(),
        endMonth: normalizeMonthValue(event?.endMonth),
        month: normalizeMonthValue(event?.month),
        active: event?.active !== false,
        archived: Boolean(event?.archived),
        affectsProjection: event?.affectsProjection !== false,
        displayOrder: Number(event?.displayOrder ?? index + 1) || index + 1
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder)
  };
}

function buildReserveFromLegacy(settings = {}, selectedMonth = currentMonthKey()) {
  const background = settings?.background || {};
  const reserveIncome = background.reserveIncome || {};
  return {
    projectionAnchorMonth: currentMonthKey(),
    accounts: [
      {
        id: "cash-reserve",
        label: "Cash Reserve",
        balance: Number(settings?.systemCore?.reserveBalanceNow) || 4231,
        includeInRunway: true,
        includeInVaultTotal: true,
        active: true,
        archived: false,
        displayOrder: 1
      }
    ],
    events: [
      {
        id: "stable-gap",
        label: "Stable Base Gap",
        type: "monthly",
        amount: -(Number(settings?.systemCore?.stableBaseGapMonthly) || 669),
        startMonth: selectedMonth || currentMonthKey(),
        endMonth: null,
        active: true,
        archived: false,
        affectsProjection: true,
        displayOrder: 1
      },
      {
        id: "mv-contrib-may-aug",
        label: "MV Contrib",
        type: "monthly",
        amount: Number(reserveIncome.mvContrib) || 1500,
        startMonth: "2026-05",
        endMonth: "2026-08",
        active: true,
        archived: false,
        affectsProjection: true,
        displayOrder: 2
      },
      {
        id: "leo-debt-2026",
        label: "Leo Debt",
        type: "monthly",
        amount: Number(reserveIncome.leoDebt) || 700,
        startMonth: "2026-05",
        endMonth: "2026-12",
        active: true,
        archived: false,
        affectsProjection: true,
        displayOrder: 3
      }
    ]
  };
}

function normalizeAdjustments(raw) {
  const result = {};
  if (!isObject(raw)) return result;
  Object.entries(raw).forEach(([weekStartISO, item]) => {
    const categoryPenalties = normalizeCategoryPenalties(item);
    const legacy = {
      entertainmentPenalty: Number(item?.entertainmentPenalty ?? item?.entertainment ?? 0) || 0,
      miscPenalty: Number(item?.miscPenalty ?? item?.misc ?? 0) || 0
    };
    result[weekStartISO] = {
      weekStartISO,
      sourceWeekStartISO: item?.sourceWeekStartISO || item?.sourceWeekKey || weekStartISO,
      categoryPenalties,
      totalPenalty: Number(item?.totalPenalty ?? item?.total) || sum(Object.values(categoryPenalties)),
      legacy
    };
  });
  return result;
}

function normalizeClosures(raw) {
  const result = {};
  if (!isObject(raw)) return result;
  Object.entries(raw).forEach(([weekStartISO, item]) => {
    const categoryPenalties = normalizeCategoryPenalties(item);
    const legacy = {
      entertainmentPenalty: Number(item?.entertainmentPenalty ?? 0) || 0,
      miscPenalty: Number(item?.miscPenalty ?? 0) || 0
    };
    result[weekStartISO] = {
      weekStartISO,
      closedAtISO: item?.closedAtISO || item?.closedAt || new Date().toISOString(),
      categoryPenalties,
      totalPenalty: Number(item?.totalPenalty) || sum(Object.values(categoryPenalties)),
      legacy
    };
  });
  return result;
}

function normalizeCategoryPenalties(item) {
  const penalties = {};
  if (isObject(item?.categoryPenalties)) {
    Object.entries(item.categoryPenalties).forEach(([categoryId, amount]) => {
      const value = Number(amount) || 0;
      if (value > 0) penalties[categoryId] = value;
    });
  }
  const entertainmentPenalty = Number(item?.entertainmentPenalty ?? item?.entertainment ?? 0) || 0;
  const miscPenalty = Number(item?.miscPenalty ?? item?.misc ?? 0) || 0;
  if (entertainmentPenalty > 0 && penalties.entertainment == null) penalties.entertainment = entertainmentPenalty;
  if (miscPenalty > 0 && penalties.misc == null) penalties.misc = miscPenalty;
  return penalties;
}

function buildMonitorCategoriesFromLegacy(settings = {}) {
  const budgets = settings?.budgetsMonthly || {};
  const weeklyRules = settings?.weeklyRules || {};
  return DEFAULT_MONITOR_CATEGORIES.map((item) => {
    const next = structuredClone(item);
    if (budgets[item.id] != null) next.monthlyBudget = Number(budgets[item.id]) || 0;
    if (item.id === "groceries") next.softCapMultiplier = Number(weeklyRules.grocerySoftCapMultiplier ?? weeklyRules.defaultSoftCapMultiplier ?? item.softCapMultiplier) || 1.1;
    if (item.id === "charging") next.softCapMultiplier = Number(weeklyRules.chargingSoftCapMultiplier ?? weeklyRules.defaultSoftCapMultiplier ?? item.softCapMultiplier) || 1.1;
    if (item.ruleType === "penalty") {
      next.penaltyMultiplier = Number(weeklyRules.penaltyMultiplier ?? item.penaltyMultiplier) || 1.5;
      next.minPenaltyUnit = Number(weeklyRules.minPenaltyUnit ?? item.minPenaltyUnit) || 5;
    }
    return next;
  });
}

function buildBackgroundSectionsFromLegacy(background = {}) {
  const sections = structuredClone(DEFAULT_BACKGROUND_SECTIONS);
  const legacyMap = {
    "core-income": background?.coreIncome || {},
    "reserve-income": background?.reserveIncome || {},
    investment: background?.investment || {},
    fixed: background?.fixed || {},
    debt: background?.debt || {}
  };
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const legacySection = legacyMap[section.id] || {};
      const legacyKey = item.id
        .replaceAll("-", "")
        .replace("pwsalary", "pwSalary")
        .replace("mvcontrib", "mvContrib")
        .replace("leodebt", "leoDebt")
        .replace("condoadmin", "condoAdmin")
        .replace("propertytax", "propertyTax")
        .replace("pwtrust", "pwTrust")
        .replace("carpayment", "carPayment")
        .replace("ikeapayment", "ikeaPayment");
      const legacyAmount = legacySection[legacyKey];
      return {
        ...item,
        amount: legacyAmount == null ? item.amount : Number(legacyAmount) || 0
      };
    })
  }));
}

function buildLegacyBudgetsMonthly(categories) {
  const result = { groceries: 0, charging: 0, entertainment: 0, misc: 0 };
  normalizeMonitorCategories(categories).forEach((item) => {
    if (Object.hasOwn(result, item.id)) result[item.id] = Number(item.monthlyBudget) || 0;
  });
  return result;
}

function buildLegacyBackgroundFromSections(sections, fallback = {}) {
  const result = {
    coreIncome: { ...(fallback?.coreIncome || {}) },
    reserveIncome: { ...(fallback?.reserveIncome || {}) },
    investment: { ...(fallback?.investment || {}) },
    fixed: { ...(fallback?.fixed || {}) },
    debt: { ...(fallback?.debt || {}) }
  };
  normalizeBackgroundSections(sections).forEach((section) => {
    const bucket = section.id === "core-income"
      ? result.coreIncome
      : section.id === "reserve-income"
        ? result.reserveIncome
        : section.id === "investment"
          ? result.investment
          : section.id === "fixed"
            ? result.fixed
            : section.id === "debt"
              ? result.debt
              : null;
    if (!bucket) return;
    section.items.forEach((item) => {
      bucket[toLegacyBackgroundKey(item.id)] = Number(item.amount) || 0;
    });
  });
  return result;
}

function toLegacyBackgroundKey(id) {
  const slug = String(id || "");
  if (slug === "pw-salary") return "pwSalary";
  if (slug === "mv-contrib") return "mvContrib";
  if (slug === "leo-debt") return "leoDebt";
  if (slug === "condo-admin") return "condoAdmin";
  if (slug === "property-tax") return "propertyTax";
  if (slug === "pw-trust") return "pwTrust";
  if (slug === "car-payment") return "carPayment";
  if (slug === "ikea-payment") return "ikeaPayment";
  return camelCaseFromSlug(slug);
}

function migrateLegacyState(raw, sourceKey) {
  if (sourceKey === "financePlanner_v2") return migrateFromPlannerV2(raw);
  if (sourceKey === "finance-box-budget-v3") return migrateFromBoxBudgetV3(raw);
  return raw;
}

function migrateFromPlannerV2(raw) {
  const settings = raw?.settings || {};
  const month = raw?.ui?.selectedMonth || currentMonthKey();
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    ui: {
      activeTab: "monitor",
      selectedMonth: month,
      txFilter: "month",
      editingTransactionId: null
    },
    settings: {
      systemCore: {
        reserveBalanceNow: Number(settings.reserveBalanceNow ?? settings.systemCore?.reserveBalanceNow ?? calculateReserveFromLedger(settings.reserveLedger || DEFAULT_STATE.settings.reserveSchedule)) || 4231,
        stableBaseGapMonthly: Number(settings.stableBaseGapMonthly ?? settings.systemCore?.stableBaseGapMonthly) || 669
      },
      budgetsMonthly: {
        groceries: Number(settings.budgetsMonthly?.groceries ?? 750) || 0,
        charging: Number(settings.budgetsMonthly?.charging ?? 150) || 0,
        entertainment: Number(settings.budgetsMonthly?.entertainment ?? 300) || 0,
        misc: Number(settings.budgetsMonthly?.misc ?? 150) || 0
      },
      weeklyRules: {
        weekStart: "MON",
        penaltyMultiplier: Number(settings.penaltyMultiplier ?? settings.weeklyRules?.penaltyMultiplier) || 1.5,
        minPenaltyUnit: Number(settings.minPenaltyUnit ?? settings.weeklyRules?.minPenaltyUnit) || 5,
        defaultSoftCapMultiplier: Number(settings.weeklyRules?.defaultSoftCapMultiplier ?? settings.grocerySoftCapMultiplier ?? settings.chargingSoftCapMultiplier) || 1.1,
        grocerySoftCapMultiplier: Number(settings.grocerySoftCapMultiplier ?? settings.weeklyRules?.grocerySoftCapMultiplier) || 1.1,
        chargingSoftCapMultiplier: Number(settings.chargingSoftCapMultiplier ?? settings.weeklyRules?.chargingSoftCapMultiplier) || 1.1
      },
      reserveSchedule: {
        ...structuredClone(DEFAULT_STATE.settings.reserveSchedule),
        ...pickReserveSchedule(settings.reserveLedger)
      },
      background: {
        coreIncome: {
          pwSalary: Number(settings.coreIncome?.pwSalary ?? settings.income?.pwMonthlyEq) || 5897
        },
        reserveIncome: {
          mvContrib: Number(settings.reserveIncome?.mvContrib ?? settings.income?.mvContribMonthly) || 1500,
          leoDebt: Number(settings.reserveIncome?.leoDebt ?? settings.income?.leoInterestMonthly) || 700
        },
        investment: {
          investment: Number(settings.investment?.investment ?? settings.investment?.monthlyEq) || 217
        },
        fixed: {
          insurance: Number(settings.fixed?.insurance) || 558,
          condoAdmin: Number(settings.fixed?.condoAdmin) || 564,
          propertyTax: Number(settings.fixed?.propertyTax) || 267,
          internet: Number(settings.fixed?.internet) || 49,
          pwTrust: Number(settings.fixed?.pwTrust) || 600
        },
        debt: {
          mortgage: Number(settings.debt?.mortgage ?? settings.debt?.mortgageMonthlyEq) || 2167,
          carPayment: Number(settings.debt?.carPayment) || 682,
          ikeaPayment: Number(settings.debt?.ikeaPayment) || 113
        }
      }
    },
    transactions: migrateTransactions(raw?.transactions),
    weeklyBudgetAdjustments: normalizeAdjustments(raw?.weeklyBudgetAdjustments),
    weeklyClosures: normalizeClosures(raw?.weeklyClosures)
  };
}

function migrateFromBoxBudgetV3(raw) {
  const currentMonth = raw?.currentMonth || currentMonthKey();
  const latestPlan = Array.isArray(raw?.yearPlanVersions) ? raw.yearPlanVersions[raw.yearPlanVersions.length - 1] : null;
  const vewuPlan = latestPlan?.plan?.vewu || {};
  const pwPlan = latestPlan?.plan?.pw || {};
  const incomeDefaults = vewuPlan.incomeDefaults || [];
  const fixedItems = vewuPlan.autoFixedItems || [];
  const baselineSavingItems = vewuPlan.baselineSavingItems || [];
  const background = {
    coreIncome: {
      pwSalary: findAmount(incomeDefaults, ["pwSalary", "PW Salary"], 5897)
    },
    reserveIncome: {
      mvContrib: findAmount(incomeDefaults, ["mvContribution", "MV Contribution"], 1500),
      leoDebt: findAmount(incomeDefaults, ["leoDebt", "Leo"], 700)
    },
    investment: {
      investment: findAmount(baselineSavingItems, ["investment", "Baseline Investment / Saving"], 217)
    },
    fixed: {
      insurance: findAmount(fixedItems, ["insurance", "Insurance"], 558),
      condoAdmin: findAmount(fixedItems, ["condo", "Condo"], 564),
      propertyTax: findAmount(fixedItems, ["propertyTax", "Property Tax"], 267),
      internet: findAmount(fixedItems, ["internet", "Internet"], 49),
      pwTrust: findAmount(fixedItems, ["pwAllowance", "PW Allowance"], 600)
    },
    debt: {
      mortgage: findAmount(raw?.debtPlans, ["mortgage", "Mortgage"], 2167),
      carPayment: findAmount(raw?.debtPlans, ["car-loan", "Car"], 682),
      ikeaPayment: findAmount(raw?.debtPlans, ["ikea", "Ikea"], 113)
    }
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    ui: {
      activeTab: "monitor",
      selectedMonth: currentMonth,
      txFilter: "month",
      editingTransactionId: null
    },
    settings: {
      systemCore: {
        reserveBalanceNow: deriveReserveFromBoxBudget(raw),
        stableBaseGapMonthly: 669
      },
      budgetsMonthly: {
        groceries: Number(vewuPlan.boxes?.groceries?.budget) || 750,
        charging: Number(vewuPlan.boxes?.car407?.budget) || 150,
        entertainment: Number(pwPlan.boxes?.eatOut?.budget) || 300,
        misc: Number(vewuPlan.boxes?.misc?.budget) || 150
      },
      weeklyRules: structuredClone(DEFAULT_STATE.settings.weeklyRules),
      reserveSchedule: structuredClone(DEFAULT_STATE.settings.reserveSchedule),
      background
    },
    transactions: migrateTransactions(raw?.transactions),
    weeklyBudgetAdjustments: {},
    weeklyClosures: {}
  };
}

function migrateTransactions(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const category = normalizeCategory(item?.category ?? item?.box);
      if (!category) return null;
      return {
        id: item.id || item.transactionId || uid("txn"),
        dateISO: item.dateISO || item.date,
        amount: Number(item.amount) || 0,
        category,
        note: item.note || ""
      };
    })
    .filter((item) => item && item.dateISO && item.amount >= 0);
}

function normalizeTransaction(item) {
  const category = normalizeCategory(item?.category);
  const dateISO = item?.dateISO || item?.date;
  if (!category || !dateISO) return null;
  return {
    id: item.id || uid("txn"),
    dateISO,
    amount: Number(item.amount) || 0,
    category,
    note: item.note || ""
  };
}

function normalizeCategory(value, categoriesSource = null) {
  const text = String(value || "").trim();
  if (!text) return null;
  const normalized = slugify(text).replace(/-/g, "");
  const categories = normalizeMonitorCategories(categoriesSource || getCurrentMonitorCategoriesSource());
  const exact = categories.find((item) => item.id === text || item.id === text.toLowerCase());
  if (exact) return exact.id;
  const bySlug = categories.find((item) => slugify(item.id).replace(/-/g, "") === normalized);
  if (bySlug) return bySlug.id;
  for (const [id, aliases] of Object.entries(LEGACY_CATEGORY_ALIASES)) {
    if (aliases.map((alias) => slugify(alias).replace(/-/g, "")).includes(normalized)) return id;
  }
  return text.toLowerCase().replace(/\s+/g, "-");
}

function getCategories() {
  return normalizeMonitorCategories(getCurrentMonitorCategoriesSource());
}

function getCategoriesFromStateLike(stateLike) {
  return normalizeMonitorCategories(stateLike?.settings?.monitorCategories || DEFAULT_MONITOR_CATEGORIES);
}

function getCurrentMonitorCategoriesSource() {
  try {
    return state?.settings?.monitorCategories || DEFAULT_MONITOR_CATEGORIES;
  } catch {
    return DEFAULT_MONITOR_CATEGORIES;
  }
}

function getCategoryById(categoryId) {
  const id = String(categoryId || "");
  const found = getCategories().find((item) => item.id === id);
  if (found) return found;
  return {
    id,
    label: startCase(id || "Unknown"),
    icon: "•",
    group: "custom",
    monthlyBudget: 0,
    monitor: false,
    allowTransactions: false,
    includeInVariableTotal: false,
    includeInWeeklyDiscipline: false,
    ruleType: "trackOnly",
    softCapMultiplier: null,
    penaltyMultiplier: null,
    minPenaltyUnit: null,
    priority: "hidden",
    displayOrder: 999,
    active: false,
    archived: true,
    unknown: true
  };
}

function getActiveTransactionCategories() {
  return getActiveTransactionCategoriesFromState(state);
}

function getActiveTransactionCategoriesFromState(stateLike) {
  return getCategoriesFromStateLike(stateLike)
    .filter((item) => item.active && !item.archived && item.allowTransactions)
    .sort(compareCategoryOrder);
}

function getMonitorCategories() {
  return getCategories()
    .filter((item) => item.active && !item.archived && item.monitor)
    .sort(compareCategoryOrder);
}

function getPrimaryMonitorCategories() {
  const primary = getMonitorCategories().filter((item) => item.priority === "primary");
  if (primary.length) return primary.slice(0, 6);
  return getMonitorCategories().slice(0, 4);
}

function getCategoryLabel(categoryId) {
  return getCategoryById(categoryId).label;
}

function getCategoryIcon(categoryId) {
  return getCategoryById(categoryId).icon || "•";
}

function getCategoryGroup(categoryId) {
  return getCategoryById(categoryId).group;
}

function isCategoryAllowedForTransaction(categoryId) {
  const item = getCategoryById(categoryId);
  return item.active && !item.archived && item.allowTransactions;
}

function isCategoryArchived(categoryId) {
  return Boolean(getCategoryById(categoryId).archived);
}

function compareCategoryOrder(a, b) {
  const priorityRank = { primary: 0, secondary: 1, hidden: 2 };
  return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
    || (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
    || a.label.localeCompare(b.label);
}

function getMonitorBehaviorType(category) {
  return getCategoryDisplayGroup(category);
}

function getCategoryDisplayGroup(category) {
  const group = category?.group || "custom";
  return ["essentials", "discretionary", "custom"].includes(group) ? group : "custom";
}

function getCategoryRuleType(category) {
  const ruleType = category?.ruleType || "trackOnly";
  return ["softCap", "penalty", "trackOnly"].includes(ruleType) ? ruleType : "trackOnly";
}

function isPenaltyCategory(category) {
  return getCategoryRuleType(category) === "penalty";
}

function isSoftCapCategory(category) {
  return getCategoryRuleType(category) === "softCap";
}

function isTrackOnlyCategory(category) {
  return getCategoryRuleType(category) === "trackOnly";
}

function isWeeklyDisciplineCategory(category) {
  return category?.active !== false && !category?.archived && category?.includeInWeeklyDiscipline === true;
}

function isVariableTotalCategory(category) {
  return category?.active !== false && !category?.archived && category?.includeInVariableTotal === true;
}

function getBackgroundSections() {
  return normalizeBackgroundSections(state?.settings?.backgroundSections || DEFAULT_BACKGROUND_SECTIONS);
}

function getBackgroundSectionById(sectionId) {
  return getBackgroundSections().find((section) => section.id === sectionId) || null;
}

function getBackgroundItems(sectionId) {
  return getBackgroundSectionById(sectionId)?.items || [];
}

function calculateSectionTotal(sectionId) {
  return sum(getBackgroundItems(sectionId).filter(isActiveBackgroundItem).map(monthlyEquivalentAmount));
}

function calculateBackgroundTotals() {
  const sections = getBackgroundSections().filter((section) => section.active && !section.archived);
  const totals = {};
  sections.forEach((section) => {
    totals[section.id] = sum(section.items.filter(isActiveBackgroundItem).map(monthlyEquivalentAmount));
  });
  return totals;
}

function calculateTotalByType(type) {
  return sum(
    getBackgroundSections()
      .filter((section) => section.active && !section.archived)
      .flatMap((section) => section.items.map((item) => ({ ...item, __sectionType: section.type })))
      .filter((item) => (item.type || item.__sectionType) === type)
      .filter(isActiveBackgroundItem)
      .map(monthlyEquivalentAmount)
  );
}

function calculateFixedDebtTotal() {
  return calculateTotalByType("fixed") + calculateTotalByType("debt");
}

function calculateIncomeTotal() {
  return calculateTotalByType("income");
}

function calculateInvestmentTotal() {
  return calculateTotalByType("investment");
}

function getReserveAccounts() {
  return normalizeReserve(state?.settings?.reserve || DEFAULT_RESERVE).accounts;
}

function getReserveAccountById(accountId) {
  return getReserveAccounts().find((account) => account.id === accountId) || null;
}

function getActiveReserveAccounts() {
  return getReserveAccounts().filter((account) => account.active && !account.archived);
}

function getProjectionEvents() {
  return normalizeReserve(state?.settings?.reserve || DEFAULT_RESERVE).events;
}

function getProjectionEventById(eventId) {
  return getProjectionEvents().find((event) => event.id === eventId) || null;
}

function getActiveProjectionEvents() {
  return getProjectionEvents().filter((event) => event.active && !event.archived);
}

function calculateReserveVaultTotal() {
  return calculateReserveVaultTotalFromSettings(state.settings);
}

function calculateReserveVaultTotalFromSettings(settings) {
  return sum(
    normalizeReserve(settings?.reserve || DEFAULT_RESERVE).accounts
      .filter((account) => account.active && !account.archived && account.includeInVaultTotal)
      .map((account) => Number(account.balance) || 0)
  );
}

function calculateReserveRunwayBalance() {
  return calculateReserveRunwayBalanceFromSettings(state.settings);
}

function calculateReserveRunwayBalanceFromSettings(settings) {
  return sum(
    normalizeReserve(settings?.reserve || DEFAULT_RESERVE).accounts
      .filter((account) => account.active && !account.archived && account.includeInRunway)
      .map((account) => Number(account.balance) || 0)
  );
}

function getStableGapFromSettings(settings) {
  const stableGapEvent = normalizeReserve(settings?.reserve || DEFAULT_RESERVE).events.find(
    (event) => event.active && !event.archived && event.id === "stable-gap"
  );
  if (stableGapEvent) return Math.abs(Number(stableGapEvent.amount) || 0) || Number(settings?.systemCore?.stableBaseGapMonthly) || 669;
  return Number(settings?.systemCore?.stableBaseGapMonthly) || 669;
}

function calculateActiveProjectionMonthlyNet(monthKey) {
  return calculateProjectionMonthlyNet(monthKey, state.settings);
}

function calculateProjectionMonthlyNet(monthKey, settings) {
  return sum(
    normalizeReserve(settings?.reserve || DEFAULT_RESERVE).events
      .filter((event) => event.active && !event.archived && event.affectsProjection)
      .filter((event) => reserveEventAppliesToMonth(event, monthKey))
      .map((event) => Number(event.amount) || 0)
  );
}

function reserveEventAppliesToMonth(event, monthKey) {
  if (event.type === "oneTime") return event.month === monthKey;
  if (!event.startMonth || monthKey < event.startMonth) return false;
  if (event.endMonth && monthKey > event.endMonth) return false;
  return true;
}

function isActiveBackgroundItem(item) {
  return item?.active !== false && !item?.archived;
}

function monthlyEquivalentAmount(item) {
  const amount = Number(item?.amount) || 0;
  if (item?.frequency === "annual") return amount / 12;
  if (item?.frequency === "oneTime") return 0;
  return amount;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  monthInput.value = state.ui.selectedMonth;
  pageTitle.textContent = TABS.find((tab) => tab.id === state.ui.activeTab)?.label || "Monitor";
  renderHeaderControls();
  renderHeaderStatus();
  renderNav();
  const activeTab = state.ui.activeTab || "monitor";
  if (activeTab === "monitor") app.innerHTML = renderMonitorPage();
  if (activeTab === "planning") app.innerHTML = renderPlanningPage();
  bindPageEvents();
}

function renderHeaderControls() {
  document.querySelectorAll("[data-scope]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scope === state.ui.monitorScope);
  });
  document.querySelector(".topbar-controls")?.classList.toggle("is-hidden", state.ui.activeTab !== "monitor");
}

function renderHeaderStatus() {
  if (!headerStatus) return;
  if (state.ui.activeTab !== "monitor") {
    headerStatus.className = "header-status-pill neutral";
    headerStatus.textContent = "Plan";
    return;
  }
  const status = getDashboard().overallStatus;
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

function setMonitorScope(scope) {
  const nextScope = scope === "month" ? "month" : "week";
  if (state.ui.monitorScope === nextScope) return;
  state.ui.monitorScope = nextScope;
  state.ui.txFilter = nextScope === "month" ? "month" : "week";
  saveState();
  render();
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
  document.querySelector("#transactionForm")?.addEventListener("submit", saveTransaction);
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.txFilter = button.dataset.filter;
      saveState();
      render();
    });
  });
  document.querySelectorAll("[data-edit-transaction]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.activeTab = "monitor";
      state.ui.editingTransactionId = button.dataset.editTransaction;
      saveState();
      openQuickAdd();
    });
  });
  document.querySelectorAll("[data-delete-transaction]").forEach((button) => {
    button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction));
  });
  document.querySelectorAll("[data-manage-transactions]").forEach((button) => {
    button.addEventListener("click", openTransactionsManager);
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
  document.querySelector("#cancelEditButton")?.addEventListener("click", cancelEditingTransaction);
  document.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeQuickAdd);
  });
  document.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeQuickAdd();
  });
  document.querySelector("#closeWeekButton")?.addEventListener("click", closeWeek);
  document.querySelector("#reopenWeekButton")?.addEventListener("click", reopenWeek);
  document.querySelector("#reviewLastWeekButton")?.addEventListener("click", reviewLastWeek);
  document.querySelector("#markMonthReviewedButton")?.addEventListener("click", () => markMonthReviewed(state.ui.selectedMonth));
  document.querySelector("#markBackupDoneButton")?.addEventListener("click", () => markMonthBackupDone(state.ui.selectedMonth));
  document.querySelector("#settingsForm")?.addEventListener("submit", saveSettings);
  document.querySelector("#recalcReserveButton")?.addEventListener("click", recalcReserveFromLedger);
  document.querySelector("#exportJsonButton")?.addEventListener("click", exportJSON);
  document.querySelector("#importJsonInput")?.addEventListener("change", importJSON);
  document.querySelector("#resetButton")?.addEventListener("click", resetData);
  document.querySelectorAll("[data-planning-section]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.target.closest("input, button, label, summary, textarea, select")) return;
      togglePlanningSection(button.dataset.planningSection);
    });
  });
  document.querySelectorAll("[data-toggle-planning]").forEach((button) => {
    button.addEventListener("click", () => togglePlanningSection(button.dataset.togglePlanning));
  });
  document.querySelectorAll("[data-open-planning-section]").forEach((button) => {
    button.addEventListener("click", () => openPlanningSection(button.dataset.openPlanningSection));
  });
  document.querySelectorAll("[data-manage-budget-categories]").forEach((button) => {
    button.addEventListener("click", openManageBudgetCategories);
  });
  document.querySelectorAll("[data-edit-category]").forEach((button) => {
    button.addEventListener("click", () => openManageCategory(button.dataset.editCategory));
  });
  document.querySelectorAll("[data-manage-background]").forEach((button) => {
    button.addEventListener("click", openManageBackgroundSections);
  });
  document.querySelectorAll("[data-edit-background-item]").forEach((button) => {
    button.addEventListener("click", () => openManageBackgroundItem(button.dataset.sectionId, button.dataset.editBackgroundItem));
  });
  document.querySelectorAll("[data-manage-reserve-accounts]").forEach((button) => {
    button.addEventListener("click", openManageReserveAccounts);
  });
  document.querySelectorAll("[data-manage-projection-events]").forEach((button) => {
    button.addEventListener("click", openManageProjectionEvents);
  });
  document.querySelectorAll("[data-edit-reserve-account]").forEach((button) => {
    button.addEventListener("click", () => openManageReserveAccount(button.dataset.editReserveAccount));
  });
  document.querySelectorAll("[data-edit-projection-event]").forEach((button) => {
    button.addEventListener("click", () => openManageProjectionEvent(button.dataset.editProjectionEvent));
  });
}

function renderMonitorPage() {
  const dashboard = getDashboard();
  const cards = dashboard.monitorCards;
  return `
    <section class="page monitor-page">
      ${renderCompactReserveHero(dashboard.reserve, dashboard.projections)}
      ${renderOverallMonitorStatus(dashboard.overallStatus)}
      <section class="monitor-grid" aria-label="Variable monitors">
        ${cards.length ? cards.map(renderMonitorBox).join("") : `<article class="monitor-box empty"><div class="empty-state">No monitor categories configured. Add one in Planning.</div></article>`}
      </section>
      ${dashboard.scope === "month" ? renderMonthOutlook(dashboard.monthOutlook) : renderWeeklyDiscipline(dashboard.discipline)}
      ${renderRecentTransactionsPreview(dashboard.scope)}
    </section>
  `;
}

function renderMonitorBox(card) {
  const isExpanded = Boolean(state.ui.monitorExpandedCards?.[card.category]);
  return `
    <article class="monitor-box ${card.status.key}" data-monitor-card="${escapeHtml(card.category)}" tabindex="0" aria-expanded="${isExpanded ? "true" : "false"}">
      <div class="monitor-box-head">
        <h2><span class="category-icon" aria-hidden="true">${escapeHtml(card.icon)}</span>${escapeHtml(card.label)}</h2>
        <span class="monitor-status">${escapeHtml(card.status.label)}</span>
      </div>
      <div class="monitor-spend">${money(card.primarySpent)} / ${money(card.primaryBudget)}</div>
      ${renderProgressBar(card)}
      <p class="monitor-warning">${escapeHtml(getMonitorShortLine(card))}</p>
      ${isExpanded ? renderMonitorCardDetails(card) : ""}
    </article>
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

function renderCompactReserveHero(reserve, projections) {
  const filled = Math.max(0, Math.min(12, reserve.runwayMonths));
  const pill = reserve.status.tone === "green"
    ? "Healthy"
    : reserve.status.tone === "yellow"
      ? "Below target"
      : "Critical";
  return `
    <section class="compact-reserve-hero">
      <div class="compact-reserve-top">
        <span>Reserve Vault</span>
        <em class="reserve-pill ${reserve.status.tone}">${pill}</em>
      </div>
      <strong class="reserve-balance">${money(reserve.balance)}</strong>
      <div class="compact-runway-row">
        <span>Runway ${reserve.runwayMonths}/12</span>
        <div class="mini-runway gold" aria-hidden="true">
          ${Array.from({ length: 12 }, (_, index) => `<i class="${index < filled ? "is-filled" : ""}"></i>`).join("")}
        </div>
      </div>
      <div class="compact-projection-line">
        <span>Gap -${money(reserve.gap)}/mo</span>
        <span>${escapeHtml(projections.sep.label)} ${money(projections.sep.value)} · ${escapeHtml(projections.jan.label)} ${money(projections.jan.value)}</span>
      </div>
    </section>
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

function renderReserveMiniStrip(reserve, projections) {
  const filled = Math.max(0, Math.min(12, reserve.runwayMonths));
  return `
    <section class="reserve-mini-strip">
      <span>Runway ${reserve.runwayMonths}/12</span>
      <div class="mini-runway gold" aria-hidden="true">
        ${Array.from({ length: 12 }, (_, index) => `<i class="${index < filled ? "is-filled" : ""}"></i>`).join("")}
      </div>
      <span>${escapeHtml(projections.sep.label)} ${money(projections.sep.value)} · ${escapeHtml(projections.jan.label)} ${money(projections.jan.value)}</span>
    </section>
  `;
}

function renderRunwayMeter(reserve) {
  const filled = Math.max(0, Math.min(12, reserve.runwayMonths));
  const blocks = Array.from({ length: 12 }, (_, index) => `
    <i class="runway-block ${index < filled ? "is-filled" : ""}"></i>
  `).join("");
  return `
    <section class="runway-meter tone-${reserve.status.tone}" aria-label="Reserve runway">
      <div class="visual-head">
        <h2>Reserve Runway</h2>
        <span>${reserve.runwayMonths} / 12 months</span>
      </div>
      <div class="runway-blocks" aria-hidden="true">${blocks}</div>
      <div class="runway-lines">
        <strong>${money(reserve.balance)}</strong>
        <span>-${money(reserve.gap)} / month gap</span>
      </div>
      <p class="visual-note">${escapeHtml(reserve.conclusion)} ${escapeHtml(reserve.nextAction)}</p>
    </section>
  `;
}

function renderProjectionTimeline(reserve, projections) {
  const nodes = [
    { label: "Now", value: reserve.balance },
    { label: projections.sep.label, value: projections.sep.value },
    { label: projections.jan.label, value: projections.jan.value }
  ];
  return `
    <section class="projection-timeline" aria-label="Reserve projection timeline">
      <div class="timeline-line" aria-hidden="true"></div>
      ${nodes.map((node) => `
        <div class="timeline-node ${projectionTone(node.value)}">
          <i></i>
          <strong>${money(node.value)}</strong>
          <span>${escapeHtml(node.label)}</span>
        </div>
      `).join("")}
    </section>
  `;
}

function renderVariablePaceBoard(dashboard) {
  return `
    <section class="stack">
      <div class="visual-section-title">Variable Control Grid</div>
      <section class="pace-board">
        <div class="pace-group">
          <h3>Essentials Variable</h3>
          ${renderCategoryCard(dashboard.categories.groceries)}
          ${renderCategoryCard(dashboard.categories.charging)}
        </div>
        <div class="pace-group">
          <h3>Discretionary Variable</h3>
          ${renderCategoryCard(dashboard.categories.entertainment)}
          ${renderCategoryCard(dashboard.categories.misc)}
        </div>
      </section>
    </section>
  `;
}

function renderCategoryCard(card) {
  return `
    <article class="pace-card visual-category ${card.status.tone}">
      <div class="pace-card-head">
        <h3>${escapeHtml(card.label)}</h3>
        <span class="status-dot ${card.status.tone}"><i></i></span>
      </div>
      <div class="pace-money">${money(card.thisWeekSpent)} / ${money(card.thisWeekBudget)}</div>
      ${renderProgressBar(card)}
      <div class="remaining-line">Remaining: ${money(card.remainingThisMonth)}</div>
      <p class="visual-note">${escapeHtml(card.conclusion)}</p>
    </article>
  `;
}

function renderProgressBar(card) {
  const isSoft = card.ruleType === "softCap";
  const isPenalty = card.ruleType === "penalty";
  const maxValue = isSoft
    ? Math.max(card.zoneSoftCap, card.markerBudget, card.projectedAmount, card.actualAmount, 1)
    : Math.max(card.markerBudget * 1.35, card.projectedAmount, card.actualAmount, 1);
  const actualFill = card.actualAmount / maxValue * 100;
  const projectedFill = Math.max(0, card.projectedAmount - card.actualAmount) / maxValue * 100;
  const budgetMarker = card.markerBudget / maxValue * 100;
  const softMarker = isSoft ? card.zoneSoftCap / maxValue * 100 : budgetMarker;
  const zoneEnd = isSoft ? softMarker : 100;
  const penaltyWidth = isPenalty && card.projectedOvershoot > 0
    ? Math.min(100 - budgetMarker, card.projectedOvershoot / maxValue * 100)
    : 0;

  return `
    <div class="budget-bar ${card.ruleType} ${card.status.tone} ${card.scope}">
      ${card.ruleType !== "trackOnly" ? `<div class="budget-zone" style="left:${clampPercent(budgetMarker)}%; width:${clampPercent(zoneEnd - budgetMarker)}%"></div>` : ""}
      ${isPenalty ? `<div class="penalty-zone" style="left:${clampPercent(budgetMarker)}%; width:${clampPercent(penaltyWidth)}%"></div>` : ""}
      <div class="budget-fill" style="width:${clampPercent(actualFill)}%"></div>
      <div class="projected-fill" style="left:${clampPercent(actualFill)}%; width:${clampPercent(projectedFill)}%"></div>
      <i class="budget-marker" style="left:${clampPercent(budgetMarker)}%"></i>
      ${isSoft && card.scope === "week" ? `<i class="soft-marker" style="left:${clampPercent(softMarker)}%"></i>` : ""}
    </div>
  `;
}

function renderWeeklyDiscipline(discipline) {
  const closeStatus = discipline.closeStatus || getWeeklyCloseStatus(discipline.weekKey);
  const weakClose = closeStatus.key === "in-progress" || closeStatus.key === "last-week-open";
  return `
    <article class="discipline-card impact-card tone-${closeStatus.tone}">
      <div class="visual-head">
        <h2>Weekly Close</h2>
        <span>${escapeHtml(closeStatus.label)}</span>
      </div>
      <div class="impact-main">${discipline.nextWeekReduction > 0 ? "-" : ""}${money(discipline.nextWeekReduction)} if closed now</div>
      <div class="impact-flow">
        <span>${money(discipline.discretionaryOvershoot)} overshoot</span>
        <i></i>
        <span>${money(discipline.nextWeekReduction)} penalty</span>
        <i></i>
        <span>next week reduced</span>
      </div>
      ${discipline.penaltyRows?.length ? `<p class="visual-note">${discipline.penaltyRows.map((row) => `${escapeHtml(row.label)} ${money(row.penalty)}`).join(" · ")}</p>` : ""}
      <p class="visual-note">Projected discretionary overshoot by Sunday: ${money(discipline.projectedDiscretionaryOvershoot)}</p>
      <div class="button-row">
        ${closeStatus.key === "last-week-open" ? `<button id="reviewLastWeekButton" class="ghost-button" type="button">Review Last Week</button>` : ""}
        <button id="closeWeekButton" class="${weakClose ? "ghost-button" : "action-button"}" type="button" ${closeStatus.key === "closed" ? "disabled" : ""}>Close Week</button>
        ${closeStatus.key === "closed" ? `<button id="reopenWeekButton" class="ghost-button" type="button">Reopen Week</button>` : ""}
      </div>
      <p class="visual-note">${escapeHtml(closeStatus.message)}</p>
    </article>
  `;
}

function renderMonthOutlook(outlook) {
  const diffLabel = outlook.projectedDiff >= 0 ? `${money(outlook.projectedDiff)} over` : `${money(Math.abs(outlook.projectedDiff))} under`;
  const tone = outlook.status.key === "safe" ? "green" : outlook.status.key === "watch" ? "yellow" : "red";
  return `
    <article class="discipline-card impact-card month-outlook-card tone-${tone}">
      <div class="visual-head">
        <h2>Month Outlook</h2>
        <span>${escapeHtml(outlook.status.label)}</span>
      </div>
      <div class="impact-main">${money(outlook.projectedMonthEndVariableSpend)} projected</div>
      <div class="impact-flow">
        <span>${money(outlook.monthlyVariableBudget)} budget</span>
        <i></i>
        <span>${diffLabel}</span>
        <i></i>
        <span>${escapeHtml(outlook.status.action)}</span>
      </div>
      <p class="visual-note">${outlook.atRisk.length ? outlook.atRisk.map((item) => `${escapeHtml(item.label)} ${money(item.projectedOvershoot)} over`).join(" · ") : "No categories at risk."}</p>
    </article>
  `;
}

function openQuickAdd() {
  modalRoot.innerHTML = renderQuickAddSheet();
  bindQuickAddEvents();
  requestAnimationFrame(() => modalRoot.querySelector("input[name='amount']")?.focus());
}

function bindQuickAddEvents() {
  modalRoot.querySelector("#transactionForm")?.addEventListener("submit", saveTransaction);
  modalRoot.querySelectorAll("[data-quick-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = modalRoot.querySelector("input[name='amount']");
      if (input) input.value = button.dataset.quickAmount;
    });
  });
  modalRoot.querySelectorAll("[data-pick-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = modalRoot.querySelector("#quickCategoryInput");
      if (!input) return;
      input.value = button.dataset.pickCategory;
      modalRoot.querySelectorAll("[data-pick-category]").forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });
  modalRoot.querySelector("[data-repeat-last]")?.addEventListener("click", () => {
    const template = state.ui.lastTransactionTemplate;
    if (!template) return;
    const amountInput = modalRoot.querySelector("input[name='amount']");
    const noteInput = modalRoot.querySelector("input[name='note']");
    const categoryInput = modalRoot.querySelector("#quickCategoryInput");
    if (amountInput) amountInput.value = template.amount || "";
    if (noteInput) noteInput.value = template.note || "";
    if (categoryInput) categoryInput.value = template.category || "groceries";
    modalRoot.querySelectorAll("[data-pick-category]").forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.pickCategory === (template.category || "groceries"));
    });
  });
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeQuickAdd);
  });
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeQuickAdd();
  });
}

function closeQuickAdd() {
  modalRoot.innerHTML = "";
  if (state.ui.editingTransactionId) {
    state.ui.editingTransactionId = null;
    saveState();
  }
}

function openTransactionsManager() {
  state.ui.txFilter = state.ui.monitorScope === "month" ? "month" : "week";
  saveState();
  modalRoot.innerHTML = renderTransactionsManagerSheet();
  bindTransactionManagerEvents();
}

function openManageCategory(categoryId) {
  const category = getCategoryById(categoryId);
  modalRoot.innerHTML = renderCategoryEditorSheet(category);
  bindManageCategoryEvents(categoryId);
}

function bindManageCategoryEvents(categoryId) {
  modalRoot.querySelector("#categoryEditorForm")?.addEventListener("submit", (event) => saveCategoryEdits(event, categoryId));
  modalRoot.querySelector("[data-archive-category]")?.addEventListener("click", () => archiveCategory(categoryId));
  modalRoot.querySelector("[data-delete-category]")?.addEventListener("click", () => deleteCategory(categoryId));
  bindSheetCloseOnly();
}

function openManageBudgetCategories() {
  modalRoot.innerHTML = renderBudgetCategoriesManagerSheet();
  bindManageBudgetCategoriesEvents();
}

function bindManageBudgetCategoriesEvents() {
  modalRoot.querySelector("#budgetCategoriesManagerForm")?.addEventListener("submit", saveBudgetCategoriesManager);
  modalRoot.querySelector("#addCategoryForm")?.addEventListener("submit", addMonitorCategory);
  modalRoot.querySelectorAll("[data-restore-category]").forEach((button) => {
    button.addEventListener("click", () => restoreCategory(button.dataset.restoreCategory));
  });
  modalRoot.querySelectorAll("[data-edit-category]").forEach((button) => {
    button.addEventListener("click", () => openManageCategory(button.dataset.editCategory));
  });
  bindSheetCloseOnly();
}

function openManageBackgroundItem(sectionId, itemId) {
  const section = getBackgroundSectionById(sectionId);
  const item = section?.items?.find((entry) => entry.id === itemId);
  if (!section || !item) return;
  modalRoot.innerHTML = renderBackgroundItemEditorSheet(section, item);
  bindManageBackgroundItemEvents(sectionId, itemId);
}

function bindManageBackgroundItemEvents(sectionId, itemId) {
  modalRoot.querySelector("#backgroundItemEditorForm")?.addEventListener("submit", (event) => saveBackgroundItemEdits(event, sectionId, itemId));
  modalRoot.querySelector("[data-archive-background-item]")?.addEventListener("click", () => archiveBackgroundItem(sectionId, itemId));
  bindSheetCloseOnly();
}

function openManageBackgroundSections() {
  modalRoot.innerHTML = renderBackgroundSectionsManagerSheet();
  bindManageBackgroundSectionsEvents();
}

function bindManageBackgroundSectionsEvents() {
  modalRoot.querySelector("#backgroundSectionsManagerForm")?.addEventListener("submit", saveBackgroundSectionsManager);
  modalRoot.querySelector("#addBackgroundSectionForm")?.addEventListener("submit", addBackgroundSection);
  modalRoot.querySelector("#addBackgroundItemForm")?.addEventListener("submit", addBackgroundItem);
  modalRoot.querySelectorAll("[data-restore-section]").forEach((button) => {
    button.addEventListener("click", () => restoreBackgroundSection(button.dataset.restoreSection));
  });
  modalRoot.querySelectorAll("[data-archive-section]").forEach((button) => {
    button.addEventListener("click", () => archiveBackgroundSection(button.dataset.archiveSection));
  });
  modalRoot.querySelectorAll("[data-edit-background-item]").forEach((button) => {
    button.addEventListener("click", () => openManageBackgroundItem(button.dataset.sectionId, button.dataset.editBackgroundItem));
  });
  bindSheetCloseOnly();
}

function openManageReserveAccount(accountId) {
  const account = getReserveAccountById(accountId);
  if (!account) return;
  modalRoot.innerHTML = renderReserveAccountEditorSheet(account);
  bindManageReserveAccountEvents(accountId);
}

function bindManageReserveAccountEvents(accountId) {
  modalRoot.querySelector("#reserveAccountEditorForm")?.addEventListener("submit", (event) => saveReserveAccountEdits(event, accountId));
  modalRoot.querySelector("[data-archive-reserve-account]")?.addEventListener("click", () => archiveReserveAccount(accountId));
  bindSheetCloseOnly();
}

function openManageReserveAccounts() {
  modalRoot.innerHTML = renderReserveAccountsManagerSheet();
  bindManageReserveAccountsEvents();
}

function bindManageReserveAccountsEvents() {
  modalRoot.querySelector("#reserveAccountsManagerForm")?.addEventListener("submit", saveReserveAccountsManager);
  modalRoot.querySelector("#addReserveAccountForm")?.addEventListener("submit", addReserveAccount);
  modalRoot.querySelectorAll("[data-edit-reserve-account]").forEach((button) => {
    button.addEventListener("click", () => openManageReserveAccount(button.dataset.editReserveAccount));
  });
  modalRoot.querySelectorAll("[data-restore-reserve-account]").forEach((button) => {
    button.addEventListener("click", () => restoreReserveAccount(button.dataset.restoreReserveAccount));
  });
  bindSheetCloseOnly();
}

function openManageProjectionEvent(eventId) {
  const item = getProjectionEventById(eventId);
  if (!item) return;
  modalRoot.innerHTML = renderProjectionEventEditorSheet(item);
  bindManageProjectionEventEvents(eventId);
}

function bindManageProjectionEventEvents(eventId) {
  modalRoot.querySelector("#projectionEventEditorForm")?.addEventListener("submit", (event) => saveProjectionEventEdits(event, eventId));
  modalRoot.querySelector("[data-archive-projection-event]")?.addEventListener("click", () => archiveProjectionEvent(eventId));
  bindSheetCloseOnly();
}

function openManageProjectionEvents() {
  modalRoot.innerHTML = renderProjectionEventsManagerSheet();
  bindManageProjectionEventsEvents();
}

function bindManageProjectionEventsEvents() {
  modalRoot.querySelector("#projectionEventsManagerForm")?.addEventListener("submit", saveProjectionEventsManager);
  modalRoot.querySelector("#addProjectionEventForm")?.addEventListener("submit", addProjectionEvent);
  modalRoot.querySelectorAll("[data-edit-projection-event]").forEach((button) => {
    button.addEventListener("click", () => openManageProjectionEvent(button.dataset.editProjectionEvent));
  });
  modalRoot.querySelectorAll("[data-restore-projection-event]").forEach((button) => {
    button.addEventListener("click", () => restoreProjectionEvent(button.dataset.restoreProjectionEvent));
  });
  bindSheetCloseOnly();
}

function bindSheetCloseOnly() {
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeQuickAdd);
  });
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeQuickAdd();
  });
}

function bindTransactionManagerEvents() {
  modalRoot.querySelectorAll("[data-sheet-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.txFilter = button.dataset.sheetFilter;
      saveState();
      openTransactionsManager();
    });
  });
  modalRoot.querySelectorAll("[data-edit-transaction]").forEach((button) => {
    button.addEventListener("click", () => {
      state.ui.editingTransactionId = button.dataset.editTransaction;
      saveState();
      openQuickAdd();
    });
  });
  modalRoot.querySelectorAll("[data-delete-transaction]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTransaction(button.dataset.deleteTransaction);
      openTransactionsManager();
    });
  });
  modalRoot.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", closeQuickAdd);
  });
  modalRoot.querySelector(".sheet-backdrop")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("sheet-backdrop")) closeQuickAdd();
  });
}

function renderRecentTransactionsPreview(scope = state.ui.monitorScope || "week") {
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const weekEnd = getWeekEnd(weekKey);
  const recent = state.transactions
    .filter((item) => {
      if (scope === "month") return item.dateISO.slice(0, 7) === monthKey;
      return item.dateISO.slice(0, 7) === monthKey && item.dateISO >= weekKey && item.dateISO <= weekEnd;
    })
    .sort((a, b) => `${b.dateISO}-${b.id}`.localeCompare(`${a.dateISO}-${a.id}`))
    .slice(0, 5);
  return `
    <section class="recent-preview">
      <div class="recent-head">
        <h2>Recent Activity</h2>
        <button class="mini-button" type="button" data-manage-transactions>View / Edit</button>
      </div>
      <div class="recent-feed">
        ${recent.length ? recent.map(renderRecentTransaction).join("") : `<div class="empty-state">No activity yet. Add your first entry with +.</div>`}
      </div>
    </section>
  `;
}

function renderRecentTransaction(transaction) {
  return `
    <div class="recent-item ${transaction.category}">
      <span>${escapeHtml(getCategoryLabel(transaction.category))}</span>
      <strong>${money(transaction.amount)}</strong>
      <em>${formatDate(transaction.dateISO)}</em>
    </div>
  `;
}

function renderTransactionsManagerSheet() {
  const transactions = getFilteredTransactions();
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage transactions">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Transactions</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <div class="tx-filter">
          ${renderSheetFilter("week", "This Week")}
          ${renderSheetFilter("month", "This Month")}
          ${renderSheetFilter("essentials", "Essentials")}
          ${renderSheetFilter("discretionary", "Discretionary")}
          ${renderSheetFilter("all", "All")}
        </div>
        <div class="tx-list">
          ${transactions.length ? transactions.map(renderManagedTransaction).join("") : `<div class="empty-state">No transactions recorded yet.</div>`}
        </div>
      </section>
    </div>
  `;
}

function renderCategoryEditorSheet(category) {
  const used = categoryHasTransactions(category.id);
  const canDelete = !used;
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit Monitor Category">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Monitor Category</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="categoryEditorForm" class="quick-form">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(category.label)}" required /></label>
          <label class="field"><span>Icon</span><input name="icon" type="text" value="${escapeHtml(category.icon || "")}" /></label>
          <label class="field"><span>Group</span><select name="group"><option value="essentials" ${category.group === "essentials" ? "selected" : ""}>Essentials</option><option value="discretionary" ${category.group === "discretionary" ? "selected" : ""}>Discretionary</option><option value="custom" ${category.group === "custom" ? "selected" : ""}>Custom</option></select></label>
          <label class="field"><span>Monthly Budget</span><input name="monthlyBudget" type="number" step="0.01" value="${category.monthlyBudget}" /></label>
          <label class="field"><span>Rule Type</span><select name="ruleType"><option value="softCap" ${category.ruleType === "softCap" ? "selected" : ""}>Soft Cap</option><option value="penalty" ${category.ruleType === "penalty" ? "selected" : ""}>Penalty</option><option value="trackOnly" ${category.ruleType === "trackOnly" ? "selected" : ""}>Track Only</option></select></label>
          <label class="field"><span>Soft Cap Multiplier</span><input name="softCapMultiplier" type="number" step="0.01" value="${category.softCapMultiplier ?? ""}" /></label>
          <label class="field"><span>Penalty Multiplier</span><input name="penaltyMultiplier" type="number" step="0.01" value="${category.penaltyMultiplier ?? ""}" /></label>
          <label class="field"><span>Minimum Penalty Unit</span><input name="minPenaltyUnit" type="number" step="0.01" value="${category.minPenaltyUnit ?? ""}" /></label>
          <label class="field"><span>Priority</span><select name="priority"><option value="primary" ${category.priority === "primary" ? "selected" : ""}>Primary</option><option value="secondary" ${category.priority === "secondary" ? "selected" : ""}>Secondary</option><option value="hidden" ${category.priority === "hidden" ? "selected" : ""}>Hidden</option></select></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${category.displayOrder}" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("monitor", "Monitor visibility", category.monitor)}
            ${renderCheckbox("allowTransactions", "Allow transactions", category.allowTransactions)}
            ${renderCheckbox("includeInVariableTotal", "Include in variable total", category.includeInVariableTotal)}
            ${renderCheckbox("includeInWeeklyDiscipline", "Include in weekly discipline", category.includeInWeeklyDiscipline)}
            ${renderCheckbox("active", "Active", category.active)}
          </div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Category</button>
            <button class="ghost-button" type="button" data-archive-category>${used ? "Archive Category" : "Archive"}</button>
            ${canDelete ? `<button class="danger-button" type="button" data-delete-category>Delete</button>` : ""}
          </div>
          ${used ? `<p class="settings-note">This category already has transactions, so it can be archived but not hard-deleted.</p>` : ""}
        </form>
      </section>
    </div>
  `;
}

function renderBudgetCategoriesManagerSheet() {
  const active = getCategories().filter((item) => !item.archived);
  const archived = getCategories().filter((item) => item.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Budget Categories">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Budget Categories</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="budgetCategoriesManagerForm" class="quick-form">
          <div class="manager-list">
            ${active.map((category) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(category.icon || "•")} ${escapeHtml(category.label)}</strong><div class="settings-note">${escapeHtml(category.priority)} · ${escapeHtml(category.group)}</div></div>
                <div class="manager-actions">
                  <input class="order-input" name="order:${category.id}" type="number" step="1" value="${category.displayOrder}" />
                  <button class="mini-button" type="button" data-edit-category="${category.id}">Edit</button>
                </div>
              </div>
            `).join("")}
          </div>
          <button class="action-button" type="submit">Save Order</button>
        </form>
        <form id="addCategoryForm" class="quick-form add-form">
          <h3>Add Category</h3>
          <label class="field"><span>Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Icon</span><input name="icon" type="text" value="•" /></label>
          <label class="field"><span>Group</span><select name="group"><option value="discretionary">Discretionary</option><option value="essentials">Essentials</option><option value="custom">Custom</option></select></label>
          <label class="field"><span>Monthly Budget</span><input name="monthlyBudget" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Rule preset</span><select name="rulePreset"><option value="penalty">Penalty Discipline</option><option value="softCap">Soft Cap Only</option><option value="trackOnly">Track Only</option></select></label>
          <label class="field"><span>Priority</span><select name="priority"><option value="secondary">Secondary</option><option value="primary">Primary</option><option value="hidden">Hidden</option></select></label>
          <div class="boolean-grid">
            ${renderCheckbox("monitor", "Monitor visibility", true)}
            ${renderCheckbox("allowTransactions", "Allow transactions", true)}
          </div>
          <button class="action-button" type="submit">Add Category</button>
        </form>
        ${archived.length ? `
          <section class="manager-archived">
            <h3>Archived</h3>
            ${archived.map((category) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(category.icon || "•")} ${escapeHtml(category.label)}</strong></div>
                <button class="mini-button" type="button" data-restore-category="${category.id}">Restore</button>
              </div>
            `).join("")}
          </section>
        ` : ""}
      </section>
    </div>
  `;
}

function renderBackgroundItemEditorSheet(section, item) {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit Background Item">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Background Item</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="backgroundItemEditorForm" class="quick-form">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(item.label)}" required /></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="${item.amount}" /></label>
          <label class="field"><span>Frequency</span><select name="frequency"><option value="monthly" ${item.frequency === "monthly" ? "selected" : ""}>Monthly</option><option value="annual" ${item.frequency === "annual" ? "selected" : ""}>Annual</option><option value="oneTime" ${item.frequency === "oneTime" ? "selected" : ""}>One Time</option></select></label>
          <label class="field"><span>Type</span><select name="type"><option value="income" ${item.type === "income" ? "selected" : ""}>Income</option><option value="fixed" ${item.type === "fixed" ? "selected" : ""}>Fixed</option><option value="debt" ${item.type === "debt" ? "selected" : ""}>Debt</option><option value="investment" ${item.type === "investment" ? "selected" : ""}>Investment</option><option value="other" ${item.type === "other" ? "selected" : ""}>Other</option></select></label>
          <div class="boolean-grid">
            ${renderCheckbox("includeInGap", "Include in gap", item.includeInGap)}
            ${renderCheckbox("includeInProjection", "Include in projection", item.includeInProjection)}
            ${renderCheckbox("includeInSummary", "Include in summary", item.includeInSummary)}
            ${renderCheckbox("active", "Active", item.active)}
          </div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Item</button>
            <button class="ghost-button" type="button" data-archive-background-item>Archive</button>
          </div>
          <p class="settings-note">Annual values are monthly-equivalent in summaries.</p>
        </form>
      </section>
    </div>
  `;
}

function renderBackgroundSectionsManagerSheet() {
  const activeSections = getBackgroundSections().filter((section) => !section.archived);
  const archivedSections = getBackgroundSections().filter((section) => section.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Background Sections">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Background Sections</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="backgroundSectionsManagerForm" class="quick-form">
          <div class="manager-list">
            ${activeSections.map((section) => `
              <div class="manager-row">
                <div class="manager-stack">
                  <label class="field">
                    <span>Section name</span>
                    <input name="section-label:${section.id}" type="text" value="${escapeHtml(section.label)}" />
                  </label>
                  <div class="manager-inline-fields">
                    <label class="field">
                      <span>Type</span>
                      <select name="section-type:${section.id}">
                        ${renderBackgroundTypeOptions(section.type)}
                      </select>
                    </label>
                    <label class="field">
                      <span>Order</span>
                      <input class="order-input" name="section-order:${section.id}" type="number" step="1" value="${section.displayOrder}" />
                    </label>
                  </div>
                  <div class="settings-note">${money(calculateSectionTotal(section.id))} monthly-equivalent</div>
                </div>
                <div class="manager-actions">
                  <button class="mini-button" type="button" data-archive-section="${section.id}">Archive</button>
                </div>
              </div>
            `).join("")}
          </div>
          <button class="action-button" type="submit">Save Sections</button>
        </form>
        <form id="addBackgroundSectionForm" class="quick-form add-form">
          <h3>Add Section</h3>
          <label class="field"><span>Section Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Section Type</span><select name="type"><option value="income">Income</option><option value="fixed">Fixed</option><option value="debt">Debt</option><option value="investment">Investment</option><option value="other">Other</option></select></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${activeSections.length + 1}" /></label>
          <button class="action-button" type="submit">Add Section</button>
        </form>
        <form id="addBackgroundItemForm" class="quick-form add-form">
          <h3>Add Item</h3>
          <label class="field"><span>Section</span><select name="sectionId">${activeSections.map((section) => `<option value="${section.id}">${escapeHtml(section.label)}</option>`).join("")}</select></label>
          <label class="field"><span>Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Frequency</span><select name="frequency"><option value="monthly">Monthly</option><option value="annual">Annual</option><option value="oneTime">One Time</option></select></label>
          <label class="field"><span>Type</span><select name="type"><option value="income">Income</option><option value="fixed">Fixed</option><option value="debt">Debt</option><option value="investment">Investment</option><option value="other">Other</option></select></label>
          <div class="boolean-grid">
            ${renderCheckbox("includeInGap", "Include in gap", false)}
            ${renderCheckbox("includeInProjection", "Include in projection", false)}
            ${renderCheckbox("includeInSummary", "Include in summary", true)}
            ${renderCheckbox("active", "Active", true)}
          </div>
          <button class="action-button" type="submit">Add Item</button>
        </form>
        ${archivedSections.length ? `
          <section class="manager-archived">
            <h3>Archived Sections</h3>
            ${archivedSections.map((section) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(section.label)}</strong></div>
                <button class="mini-button" type="button" data-restore-section="${section.id}">Restore</button>
              </div>
            `).join("")}
          </section>
        ` : ""}
      </section>
    </div>
  `;
}

function renderReserveAccountEditorSheet(account) {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit Reserve Account">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Reserve Account</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="reserveAccountEditorForm" class="quick-form">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(account.label)}" required /></label>
          <label class="field"><span>Balance</span><input name="balance" type="number" step="0.01" value="${account.balance}" /></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${account.displayOrder}" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("includeInRunway", "Include in runway", account.includeInRunway)}
            ${renderCheckbox("includeInVaultTotal", "Include in vault total", account.includeInVaultTotal)}
            ${renderCheckbox("active", "Active", account.active)}
          </div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Account</button>
            <button class="ghost-button" type="button" data-archive-reserve-account>Archive</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderReserveAccountsManagerSheet() {
  const active = getReserveAccounts().filter((account) => !account.archived);
  const archived = getReserveAccounts().filter((account) => account.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Reserve Accounts">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Reserve Accounts</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="reserveAccountsManagerForm" class="quick-form">
          <div class="manager-list">
            ${active.map((account) => `
              <div class="manager-row">
                <div class="manager-stack">
                  <strong>${escapeHtml(account.label)}</strong>
                  <div class="settings-note">${money(account.balance)} · ${account.includeInVaultTotal ? "in vault" : "excluded"} · ${account.includeInRunway ? "in runway" : "excluded"}</div>
                </div>
                <div class="manager-actions">
                  <input class="order-input" name="account-order:${account.id}" type="number" step="1" value="${account.displayOrder}" />
                  <button class="mini-button" type="button" data-edit-reserve-account="${account.id}">Edit</button>
                </div>
              </div>
            `).join("")}
          </div>
          <button class="action-button" type="submit">Save Account Order</button>
        </form>
        <form id="addReserveAccountForm" class="quick-form add-form">
          <h3>Add Account</h3>
          <label class="field"><span>Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Balance</span><input name="balance" type="number" step="0.01" value="0" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("includeInRunway", "Include in runway", true)}
            ${renderCheckbox("includeInVaultTotal", "Include in vault total", true)}
            ${renderCheckbox("active", "Active", true)}
          </div>
          <button class="action-button" type="submit">Add Account</button>
        </form>
        ${archived.length ? `
          <section class="manager-archived">
            <h3>Archived Accounts</h3>
            ${archived.map((account) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(account.label)}</strong></div>
                <button class="mini-button" type="button" data-restore-reserve-account="${account.id}">Restore</button>
              </div>
            `).join("")}
          </section>
        ` : ""}
      </section>
    </div>
  `;
}

function renderProjectionEventEditorSheet(event) {
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Edit Projection Event">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Edit Projection Event</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="projectionEventEditorForm" class="quick-form">
          <label class="field"><span>Name</span><input name="label" type="text" value="${escapeHtml(event.label)}" required /></label>
          <label class="field"><span>Type</span><select name="type"><option value="monthly" ${event.type === "monthly" ? "selected" : ""}>Monthly</option><option value="oneTime" ${event.type === "oneTime" ? "selected" : ""}>One Time</option></select></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="${event.amount}" /></label>
          <label class="field"><span>Start Month</span><input name="startMonth" type="month" value="${event.startMonth || ""}" /></label>
          <label class="field"><span>End Month</span><input name="endMonth" type="month" value="${event.endMonth || ""}" /></label>
          <label class="field"><span>One-time Month</span><input name="month" type="month" value="${event.month || ""}" /></label>
          <label class="field"><span>Display Order</span><input name="displayOrder" type="number" step="1" value="${event.displayOrder}" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("affectsProjection", "Affects projection", event.affectsProjection)}
            ${renderCheckbox("active", "Active", event.active)}
          </div>
          <div class="button-row">
            <button class="action-button" type="submit">Save Event</button>
            <button class="ghost-button" type="button" data-archive-projection-event>Archive</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderProjectionEventsManagerSheet() {
  const active = getProjectionEvents().filter((event) => !event.archived);
  const archived = getProjectionEvents().filter((event) => event.archived);
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet manager-sheet" role="dialog" aria-label="Manage Projection Events">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>Manage Projection Events</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="projectionEventsManagerForm" class="quick-form">
          <div class="manager-list">
            ${active.map((event) => `
              <div class="manager-row">
                <div class="manager-stack">
                  <strong>${escapeHtml(event.label)}</strong>
                  <div class="settings-note">${money(event.amount)} · ${event.type} · ${escapeHtml(event.startMonth || "—")}${event.endMonth ? ` to ${escapeHtml(event.endMonth)}` : ""}${event.type === "oneTime" && event.month ? ` · ${escapeHtml(event.month)}` : ""}</div>
                </div>
                <div class="manager-actions">
                  <input class="order-input" name="event-order:${event.id}" type="number" step="1" value="${event.displayOrder}" />
                  <button class="mini-button" type="button" data-edit-projection-event="${event.id}">Edit</button>
                </div>
              </div>
            `).join("")}
          </div>
          <button class="action-button" type="submit">Save Event Order</button>
        </form>
        <form id="addProjectionEventForm" class="quick-form add-form">
          <h3>Add Event</h3>
          <label class="field"><span>Name</span><input name="label" type="text" required /></label>
          <label class="field"><span>Type</span><select name="type"><option value="monthly">Monthly</option><option value="oneTime">One Time</option></select></label>
          <label class="field"><span>Amount</span><input name="amount" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Start Month</span><input name="startMonth" type="month" value="${state.ui.selectedMonth}" /></label>
          <label class="field"><span>End Month</span><input name="endMonth" type="month" value="" /></label>
          <label class="field"><span>One-time Month</span><input name="month" type="month" value="" /></label>
          <div class="boolean-grid">
            ${renderCheckbox("affectsProjection", "Affects projection", true)}
            ${renderCheckbox("active", "Active", true)}
          </div>
          <button class="action-button" type="submit">Add Event</button>
        </form>
        ${archived.length ? `
          <section class="manager-archived">
            <h3>Archived Events</h3>
            ${archived.map((event) => `
              <div class="manager-row">
                <div><strong>${escapeHtml(event.label)}</strong></div>
                <button class="mini-button" type="button" data-restore-projection-event="${event.id}">Restore</button>
              </div>
            `).join("")}
          </section>
        ` : ""}
      </section>
    </div>
  `;
}

function renderSheetFilter(key, label) {
  return `<button class="filter-chip ${state.ui.txFilter === key ? "is-active" : ""}" type="button" data-sheet-filter="${key}">${escapeHtml(label)}</button>`;
}

function renderManagedTransaction(transaction) {
  return `
    <div class="tx-item ${transaction.category}">
      <div>
        <strong>${escapeHtml(getCategoryLabel(transaction.category))}</strong>
        <div class="settings-note">${formatDate(transaction.dateISO)} · ${escapeHtml(transaction.note || "No note")}</div>
      </div>
      <div>
        <div class="pace-money">${money(transaction.amount)}</div>
        <div class="tx-actions">
          <button class="mini-button" type="button" data-edit-transaction="${transaction.id}">Edit</button>
          <button class="mini-button" type="button" data-delete-transaction="${transaction.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function renderQuickAddSheet() {
  const editing = getEditingTransaction();
  const template = state.ui.lastTransactionTemplate;
  const availableCategories = getActiveTransactionCategories();
  const fallbackCategory = availableCategories.at(0)?.id || "groceries";
  const templateCategory = template?.category && isCategoryAllowedForTransaction(template.category) ? template.category : fallbackCategory;
  const selectedCategory = editing?.category || templateCategory || fallbackCategory;
  const selectedAmount = editing ? editing.amount : "";
  const selectedNote = editing?.note || "";
  return `
    <div class="sheet-backdrop" role="presentation">
      <section class="quick-sheet" role="dialog" aria-label="Quick Add">
        <div class="sheet-handle"></div>
        <div class="sheet-head">
          <h2>${editing ? "Edit Entry" : "Quick Add"}</h2>
          <button class="icon-close" type="button" data-close-sheet aria-label="Close">×</button>
        </div>
        <form id="transactionForm" class="quick-form">
          <input type="hidden" name="id" value="${editing?.id || ""}" />
          <label class="field amount-field">
            <span>Amount</span>
            <input name="amount" type="number" step="0.01" min="0" value="${selectedAmount}" required />
          </label>
          ${!editing && template ? `<div class="repeat-last-row"><button class="ghost-button" type="button" data-repeat-last>Repeat Last</button></div>` : ""}
          <div class="quick-amount-row">
            ${[10, 20, 50, 100].map((amount) => `<button class="amount-chip" type="button" data-quick-amount="${amount}">${money(amount)}</button>`).join("")}
          </div>
          <input id="quickCategoryInput" type="hidden" name="category" value="${selectedCategory}" />
          <div class="category-chip-row">
            ${availableCategories.map((meta) => `
              <button class="category-chip ${selectedCategory === meta.id ? "is-active" : ""}" type="button" data-pick-category="${meta.id}">
                ${escapeHtml(meta.label === "Charging/407" ? "Charging" : meta.label)}
              </button>
            `).join("")}
          </div>
          <label class="field">
            <span>Date</span>
            <input name="dateISO" type="date" value="${escapeHtml(editing?.dateISO || defaultDateForMonth(state.ui.selectedMonth))}" required />
          </label>
          <label class="field">
            <span>Note</span>
            <input name="note" type="text" value="${escapeHtml(selectedNote)}" placeholder="Optional note" />
          </label>
          <button class="action-button sheet-save" type="submit">${editing ? "Save Entry" : "Add Entry"}</button>
        </form>
      </section>
    </div>
  `;
}

function renderPlanningPage() {
  const core = getReservePlanningCore();
  const runway = calculateReserveRunway(core.runwayBalance, core.stableBaseGapMonthly);
  const projections = buildProjectionData();
  const totals = calculateTotals();
  const reserveAccounts = getActiveReserveAccounts();
  const projectionEvents = getActiveProjectionEvents();
  return `
    <section class="page planning-page">
      <form id="settingsForm" class="stack">
        ${renderPlanningAccordionCard({
          sectionKey: "summary",
          title: "Planning Summary",
          eyebrow: "Planning Summary",
          summary: renderPlanningSectionSummary("summary", { core, totals }),
          expanded: ``
        })}

        ${renderMonthlyReviewCard()}

        ${renderPlanningAccordionCard({
          sectionKey: "budget",
          title: "Budget Planning",
          eyebrow: "Budget Planning",
          summary: renderPlanningSectionSummary("budget", { totals }),
          accentClass: "budget-planning-card",
          manageAction: `<button class="mini-button" type="button" data-manage-budget-categories aria-label="Manage Budget Categories">Manage</button>`,
          expanded: `
            <div class="planning-metrics">
              ${getCategories().filter((category) => category.active && !category.archived).map((category) => {
                const actualIndex = state.settings.monitorCategories.findIndex((item) => item.id === category.id);
                return renderBudgetField(category, actualIndex);
              }).join("")}
              <label class="field"><span>Penalty Multiplier</span><input name="settings.weeklyRules.penaltyMultiplier" type="number" step="0.01" value="${state.settings.weeklyRules.penaltyMultiplier}" /></label>
              <label class="field"><span>Minimum Penalty Unit</span><input name="settings.weeklyRules.minPenaltyUnit" type="number" step="0.01" value="${state.settings.weeklyRules.minPenaltyUnit}" /></label>
              <label class="field"><span>Default Soft Cap Multiplier</span><input name="settings.weeklyRules.defaultSoftCapMultiplier" type="number" step="0.01" value="${state.settings.weeklyRules.defaultSoftCapMultiplier}" /></label>
            </div>
            <p class="settings-note">Current week uses monthly budget divided by weeks overlapping this month; future weeks use remaining monthly budget after this week and apply closed-week penalties.</p>
          `
        })}

        ${renderPlanningAccordionCard({
          sectionKey: "reserve",
          title: "Reserve Planning",
          eyebrow: "Reserve Planning",
          summary: renderPlanningSectionSummary("reserve", { core, runway, projections }),
          accentClass: "reserve-planning-card",
          manageAction: `
            <button class="mini-button" type="button" data-manage-reserve-accounts aria-label="Manage Reserve Accounts">Accounts</button>
            <button class="mini-button" type="button" data-manage-projection-events aria-label="Manage Projection Events">Events</button>
          `,
          expanded: `
            <div class="planning-metrics">
              <div class="readonly-card"><span class="tiny-label">Reserve Vault Total</span><strong>${money(core.reserveBalanceNow)}</strong></div>
              <div class="readonly-card"><span class="tiny-label">Runway Balance</span><strong>${money(core.runwayBalance)}</strong></div>
              <div class="readonly-card"><span class="tiny-label">Stable Gap Source</span><strong>${money(core.stableBaseGapMonthly)}/mo</strong></div>
              <label class="field"><span>Projection Anchor Month</span><input name="settings.reserve.projectionAnchorMonth" type="month" value="${state.settings.reserve.projectionAnchorMonth}" /></label>
              <div class="readonly-card"><span class="tiny-label">Runway Months</span><strong>${runway.months}</strong></div>
              <div class="readonly-card"><span class="tiny-label">${escapeHtml(projections.sep.label)} Projection</span><strong>${money(projections.sep.value)}</strong></div>
              <div class="readonly-card"><span class="tiny-label">${escapeHtml(projections.jan.label)} Projection</span><strong>${money(projections.jan.value)}</strong></div>
            </div>
            <p class="settings-note">Vault total includes accounts marked “Include in vault total.” Runway only uses accounts marked “Include in runway.”</p>
            <div class="stack">
              <section class="readonly-card">
                <div class="section-head">
                  <h3>Reserve Accounts</h3>
                  <span class="tiny-label">${reserveAccounts.length} active</span>
                </div>
                <div class="settings-grid" style="margin-top:10px;">
                  ${reserveAccounts.map((account) => `
                    <div class="background-item-card">
                      <div class="field">
                        <span>${escapeHtml(account.label)}</span>
                        <input type="text" value="${money(account.balance)}" readonly />
                      </div>
                      <button class="mini-button" type="button" data-edit-reserve-account="${account.id}" aria-label="Edit reserve account: ${escapeHtml(account.label)}">⚙</button>
                    </div>
                  `).join("") || `<div class="empty-state">No reserve accounts yet.</div>`}
                </div>
              </section>
              <section class="readonly-card">
                <div class="section-head">
                  <h3>Projection Events</h3>
                  <span class="tiny-label">${projectionEvents.length} active</span>
                </div>
                <div class="settings-grid" style="margin-top:10px;">
                  ${projectionEvents.map((event) => `
                    <div class="background-item-card">
                      <div class="field">
                        <span>${escapeHtml(event.label)}</span>
                        <input type="text" value="${money(event.amount)} · ${escapeHtml(event.type)}" readonly />
                      </div>
                      <button class="mini-button" type="button" data-edit-projection-event="${event.id}" aria-label="Edit projection event: ${escapeHtml(event.label)}">⚙</button>
                    </div>
                  `).join("") || `<div class="empty-state">No projection events yet.</div>`}
                </div>
              </section>
              <p class="settings-note">Background income is descriptive. Reserve projection is controlled by Reserve Events.</p>
            </div>
          `
        })}

        ${renderPlanningAccordionCard({
          sectionKey: "background",
          title: "Background Data",
          eyebrow: "Background Data",
          summary: renderPlanningSectionSummary("background", { totals }),
          manageAction: `<button class="mini-button" type="button" data-manage-background aria-label="Manage Background Sections">Manage</button>`,
          expanded: `
            <div class="stack">
              ${getBackgroundSections().filter((section) => section.active && !section.archived).map((section) => {
                const actualIndex = state.settings.backgroundSections.findIndex((item) => item.id === section.id);
                return renderBackgroundGroup(section, actualIndex, calculateSectionTotal(section.id));
              }).join("")}
            </div>
            <div class="totals-grid">
              ${renderTotalChip("Total Core Income", totals.coreIncome)}
              ${renderTotalChip("Total Reserve Income", totals.reserveIncome)}
              ${renderTotalChip("Total Fixed", totals.fixed)}
              ${renderTotalChip("Total Debt", totals.debt)}
              ${renderTotalChip("Total Investment", totals.investment)}
              ${renderTotalChip("Total Variable Essentials", totals.variableEssentials)}
              ${renderTotalChip("Total Discretionary", totals.discretionary)}
              ${renderTotalChip("Total Custom Variable", totals.customVariable)}
              ${renderTotalChip("Total Reserve Ledger", totals.reserveLedger)}
            </div>
          `
        })}

        ${renderPlanningAccordionCard({
          sectionKey: "data",
          title: "Data / Compatibility",
          eyebrow: "Backup & Restore",
          summary: renderPlanningSectionSummary("data"),
          weak: true,
          expanded: renderDataCompatibilityBody()
        })}

        <div class="button-row">
          <button class="action-button" type="submit">Save Settings</button>
        </div>
      </form>
    </section>
  `;
}

function renderBudgetField(category, index) {
  const weekly = getCurrentWeekBudget(category.id, getWeekKey(getReferenceDateISO(state.ui.selectedMonth)), state.ui.selectedMonth);
  return `
    <div class="budget-input-card">
      <div class="budget-card-head">
        <strong>${escapeHtml(category.label)}</strong>
        <button class="mini-button" type="button" data-edit-category="${category.id}" aria-label="Edit category settings: ${escapeHtml(category.label)}">⚙</button>
      </div>
      <label class="field"><span>${escapeHtml(category.label)}</span><input name="settings.monitorCategories.${index}.monthlyBudget" type="number" step="0.01" value="${category.monthlyBudget}" /></label>
      <small>Est. weekly ${money(weekly)}</small>
    </div>
  `;
}

function renderPlanningAccordionCard({ sectionKey, title, eyebrow, summary, expanded, accentClass = "", weak = false, manageAction = "" }) {
  const isOpen = Boolean(state.ui.planningOpenSections?.[sectionKey]);
  const expandedMarkup = String(expanded || "").trim();
  return `
    <article class="planning-card planning-accordion ${accentClass} ${isOpen ? "is-open" : ""} ${weak ? "is-weak" : ""}" data-planning-section="${sectionKey}">
      <div class="planning-accordion-head">
        <div>
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <div class="planning-card-actions">
          ${manageAction}
          <button class="mini-button" type="button" data-toggle-planning="${sectionKey}">${isOpen ? "Close" : "Open"}</button>
        </div>
      </div>
      <div class="planning-accordion-summary">
        ${summary}
      </div>
      ${isOpen && expandedMarkup ? `<div class="planning-accordion-body">${expandedMarkup}</div>` : ""}
    </article>
  `;
}

function renderMonthlyReviewCard() {
  const status = getMonthReviewStatus(state.ui.selectedMonth);
  return renderPlanningAccordionCard({
    sectionKey: "review",
    title: "Month Setup",
    eyebrow: "Monthly Review",
    summary: `
      <div class="accordion-inline-summary">
        <strong>${escapeHtml(formatMonthLabel(state.ui.selectedMonth))} · ${status.reviewed ? "Reviewed" : "Not reviewed"}</strong>
        <span>Last month ${escapeHtml(status.lastMonthResult.label)} · Reserve ${escapeHtml(status.reserveUpdate)}</span>
        <span>Backup ${status.backupDone ? "done" : "due"}</span>
      </div>
    `,
    expanded: `
      <div class="review-checklist">
        <span>1. Review previous month spending</span>
        <span>2. Adjust current month category budgets</span>
        <span>3. Update reserve account balance</span>
        <span>4. Export JSON backup</span>
        <span>5. Mark month reviewed</span>
      </div>
      <div class="button-row">
        <button id="markMonthReviewedButton" class="action-button" type="button">Mark Month Reviewed</button>
        <button id="markBackupDoneButton" class="ghost-button" type="button">Mark Backup Done</button>
        <button class="ghost-button" type="button" data-open-planning-section="budget">Open Budget Planning</button>
        <button class="ghost-button" type="button" data-open-planning-section="reserve">Open Reserve Planning</button>
      </div>
    `
  });
}

function renderDataCompatibilityBody() {
  return `
    <section class="readonly-card weak-card">
      <div class="section-head">
        <h3>Backup & Restore</h3>
        <span class="tiny-label">Low frequency</span>
      </div>
      <div class="button-row">
        <button id="exportJsonButton" class="action-button" type="button">Export JSON</button>
        <label class="ghost-button">Import JSON<input id="importJsonInput" class="hidden" type="file" accept=".json,application/json" /></label>
        <button id="resetButton" class="danger-button" type="button">Reset local data</button>
      </div>
    </section>
    <details class="readonly-card weak-card legacy-details">
      <summary>
        <span>Legacy Reserve Ledger</span>
        <em>Compatibility</em>
      </summary>
      <div class="settings-grid" style="margin-top:10px;">
          ${renderReserveField("preMay", "Pre May reserve")}
          ${renderReserveField("may", "May reserved")}
          ${renderReserveField("june", "Jun reserved")}
          ${renderReserveField("july", "Jul reserved")}
          ${renderReserveField("august", "Aug reserved")}
          ${renderReserveField("september", "Sep reserved")}
          ${renderReserveField("october", "Oct reserved")}
          ${renderReserveField("november", "Nov reserved")}
          ${renderReserveField("december", "Dec reserved")}
          <label class="field"><span>May to Aug monthly net</span><input name="settings.reserveSchedule.mayToAugMonthlyNet" type="number" step="0.01" value="${state.settings.reserveSchedule.mayToAugMonthlyNet}" /></label>
          <label class="field"><span>Sep to Dec monthly net</span><input name="settings.reserveSchedule.sepToDecMonthlyNet" type="number" step="0.01" value="${state.settings.reserveSchedule.sepToDecMonthlyNet}" /></label>
          <label class="field"><span>Jan+ monthly net</span><input name="settings.reserveSchedule.janPlusMonthlyNet" type="number" step="0.01" value="${state.settings.reserveSchedule.janPlusMonthlyNet}" /></label>
        </div>
        <div class="button-row">
          <button id="recalcReserveButton" class="ghost-button" type="button">Recalculate Reserve From Ledger</button>
        </div>
        <p class="settings-note">Legacy ledger is preserved for compatibility. Reserve Vault now uses accounts and projection events.</p>
    </details>
  `;
}

function renderPlanningStatusTile(title, summary, status, sectionKey) {
  return `
    <div class="planning-status-tile">
      <span>${escapeHtml(title)}</span>
      <strong>${escapeHtml(summary)}</strong>
      <em>${escapeHtml(status)}</em>
      <button class="mini-button" type="button" data-open-planning-section="${sectionKey}">Open</button>
    </div>
  `;
}

function renderPlanningSectionSummary(sectionKey, context = {}) {
  const totals = context.totals || calculateTotals();
  const core = context.core || getReservePlanningCore();
  const projections = context.projections || buildProjectionData();
  const runway = context.runway || calculateReserveRunway(core.runwayBalance, core.stableBaseGapMonthly);

  if (sectionKey === "summary") {
    return `
      <div class="planning-summary-grid status-nav-grid">
        ${renderPlanningStatusTile("Budget", `${getCategories().filter((item) => item.active && !item.archived).length} active categories`, totals.variableTotal > 0 ? "OK" : "Needs review", "budget")}
        ${renderPlanningStatusTile("Reserve", `${getActiveReserveAccounts().length} vault accounts · ${getActiveProjectionEvents().length} projection events`, runway.months >= 12 ? "Healthy" : runway.months >= 6 ? "Below target" : "Critical", "reserve")}
        ${renderPlanningStatusTile("Background", `${getBackgroundSections().filter((item) => item.active && !item.archived).length} active sections · ${getBackgroundSections().flatMap((section) => section.items || []).filter((item) => item.active && !item.archived).length} active items`, "Configured", "background")}
        ${renderPlanningStatusTile("Data", getMonthReviewStatus(state.ui.selectedMonth).backupDone ? "Backup done" : "Backup due", "Backup", "data")}
      </div>
    `;
  }
  if (sectionKey === "budget") {
    return `
      <div class="accordion-inline-summary">
        <strong>Monthly Variable Budget: ${money(totals.variableTotal)}</strong>
        <span>Essentials ${money(totals.variableEssentials)} · Discretionary ${money(totals.discretionary)}</span>
        <span>Rules: penalty ${state.settings.weeklyRules.penaltyMultiplier}x · soft cap ${state.settings.weeklyRules.defaultSoftCapMultiplier}x</span>
      </div>
    `;
  }
  if (sectionKey === "reserve") {
    const net = calculateActiveProjectionMonthlyNet(state.settings.reserve.projectionAnchorMonth || currentMonthKey());
    return `
      <div class="accordion-inline-summary">
        <strong>Reserve Vault ${money(core.reserveBalanceNow)} · Gap ${money(core.stableBaseGapMonthly)}/mo</strong>
        <span>Runway ${runway.months} months</span>
        <span>Active monthly net ${money(net)}</span>
        <span>${escapeHtml(projections.sep.label)} ${money(projections.sep.value)} · ${escapeHtml(projections.jan.label)} ${money(projections.jan.value)}</span>
      </div>
    `;
  }
  if (sectionKey === "ledger") {
    return `
      <div class="accordion-inline-summary">
        <strong>Ledger Total ${money(totals.reserveLedger)}</strong>
        <span>Pre-May ${money(state.settings.reserveSchedule.preMay)} · May ${money(state.settings.reserveSchedule.may)}</span>
        <span>Legacy compatibility only</span>
      </div>
    `;
  }
  if (sectionKey === "background") {
    return `
      <div class="accordion-inline-summary">
        <strong>Income ${money(totals.coreIncome + totals.reserveIncome)} · Fixed+Debt ${money(totals.fixed + totals.debt)}</strong>
        <span>Investment ${money(totals.investment)} · PW Trust background only</span>
      </div>
    `;
  }
  return `
    <div class="accordion-inline-summary">
      <strong>Backup & Restore</strong>
      <span>Legacy ledger preserved for compatibility</span>
    </div>
  `;
}

function togglePlanningSection(sectionKey) {
  const next = !Boolean(state.ui.planningOpenSections?.[sectionKey]);
  state.ui.planningOpenSections[sectionKey] = next;
  saveState();
  render();
}

function openPlanningSection(sectionKey) {
  state.ui.activeTab = "planning";
  state.ui.planningOpenSections[sectionKey] = true;
  saveState();
  render();
}

function toggleMonitorCardDetails(categoryId) {
  if (!categoryId) return;
  state.ui.monitorExpandedCards[categoryId] = !Boolean(state.ui.monitorExpandedCards?.[categoryId]);
  saveState();
  render();
}

function renderReserveField(key, label) {
  const value = state.settings.reserveSchedule[key];
  return `<label class="field"><span>${escapeHtml(label)}</span><input name="settings.reserveSchedule.${key}" type="number" step="0.01" value="${value == null ? "" : value}" /></label>`;
}

function renderBackgroundGroup(section, sectionIndex, total) {
  const items = section.items.filter((item) => item.active && !item.archived);
  return `
    <section class="readonly-card">
      <div class="section-head">
        <h3>${escapeHtml(section.label)}</h3>
        <span class="tiny-label">Total ${money(total)}</span>
      </div>
      <div class="settings-grid" style="margin-top:10px;">
        ${items.map((item) => {
          const itemIndex = section.items.findIndex((candidate) => candidate.id === item.id);
          return `
          <div class="background-item-card">
            <label class="field">
              <span>${escapeHtml(item.label)}</span>
              <input name="settings.backgroundSections.${sectionIndex}.items.${itemIndex}.amount" type="number" step="0.01" value="${item.amount}" />
            </label>
            <button class="mini-button" type="button" data-section-id="${section.id}" data-edit-background-item="${item.id}" aria-label="Edit background item: ${escapeHtml(item.label)}">⚙</button>
          </div>
        `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderTotalChip(label, amount) {
  return `<div class="total-chip"><span class="tiny-label">${escapeHtml(label)}</span><strong>${money(amount)}</strong></div>`;
}

function renderCheckbox(name, label, checked) {
  return `
    <label class="checkbox-row">
      <input name="${name}" type="checkbox" ${checked ? "checked" : ""} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function getDashboard() {
  const monthKey = state.ui.selectedMonth;
  const referenceDateISO = getReferenceDateISO(monthKey);
  const currentWeekKey = getWeekKey(referenceDateISO);
  const reserve = buildReserveHeroData();
  const projections = buildProjectionData(referenceDateISO);
  const categories = {};
  const scope = state.ui.monitorScope || "week";
  const monitorDefs = getPrimaryMonitorCategories();

  monitorDefs.forEach((categoryDef) => {
    categories[categoryDef.id] = calculateCategoryDisplay(categoryDef.id, scope, monthKey, currentWeekKey);
  });

  return {
    scope,
    reserve,
    projections,
    categories,
    monitorCards: monitorDefs.map((item) => categories[item.id]).filter(Boolean),
    discipline: calculateWeeklyDiscipline(monthKey, currentWeekKey),
    monthOutlook: calculateMonthOutlook(monthKey, categories),
    overallStatus: calculateOverallMonitorStatus(categories, scope)
  };
}

function getReservePlanningCore() {
  const reserveBalanceNow = calculateReserveVaultTotal();
  const runwayBalance = calculateReserveRunwayBalance();
  const stableBaseGapMonthly = getStableGapFromSettings(state.settings);
  return {
    reserveBalanceNow,
    runwayBalance,
    stableBaseGapMonthly
  };
}

function buildReserveHeroData() {
  const core = getReservePlanningCore();
  const reserveBalanceNow = Number(core.reserveBalanceNow) || 0;
  const runwayBalance = Number(core.runwayBalance) || 0;
  const stableBaseGapMonthly = Math.max(1, Number(core.stableBaseGapMonthly) || 0);
  const runway = calculateReserveRunway(runwayBalance, stableBaseGapMonthly);
  const tone = runway.months >= 12 ? "green" : runway.months >= 6 ? "yellow" : "red";
  return {
    balance: reserveBalanceNow,
    runwayBalance,
    gap: stableBaseGapMonthly,
    runwayMonths: runway.months,
    runwayDays: runway.days,
    status: tone === "green"
      ? { label: "Green", tone }
      : tone === "yellow"
        ? { label: "Yellow", tone }
        : { label: "Red", tone },
    conclusion: tone === "green"
      ? "Reserve is above the 12-month threshold."
      : tone === "yellow"
        ? "Reserve runway is below target. Do not expand fixed lifestyle."
        : "Reserve runway is critical. Structural reduction is required.",
    nextAction: tone === "green"
      ? "Maintain reserve building."
      : tone === "yellow"
        ? "Hold discretionary growth and protect monthly surplus."
        : "Reduce stable gap and freeze discretionary spending."
  };
}

function buildProjectionData() {
  const anchorDateISO = getProjectionAnchorDateISO();
  const targets = getProjectionTargets(anchorDateISO);
  const sepValue = calculateReserveProjection(targets.sep.targetDateISO);
  const janValue = calculateReserveProjection(targets.jan.targetDateISO);
  return {
    sep: {
      label: targets.sep.label,
      value: sepValue,
      targetDateISO: targets.sep.targetDateISO,
      summary: `${countProjectionSteps(anchorDateISO, targets.sep.targetDateISO)} months using reserve events.`
    },
    jan: {
      label: targets.jan.label,
      value: janValue,
      targetDateISO: targets.jan.targetDateISO,
      summary: `${countProjectionSteps(anchorDateISO, targets.jan.targetDateISO)} months using reserve events.`
    }
  };
}

function calculateOverallMonitorStatus(categories, scope = state.ui.monitorScope || "week") {
  const items = Object.values(categories);
  const totalItems = items.filter((item) => isVariableTotalCategory(getCategoryById(item.category)));
  const projectedSpend = sum(totalItems.map((item) => item.primarySpent));
  const budget = sum(totalItems.map((item) => item.primaryBudget));
  const discretionaryExceeded = totalItems.some((item) => item.group === "discretionary" && item.actualExceededBudget);
  let key = "safe";
  let label = "Safe";
  let action = scope === "month" ? "On pace this month." : "On pace this week.";

  if (discretionaryExceeded) {
    key = "freeze";
    label = "Freeze";
    action = scope === "month"
      ? "Discretionary budget is already exceeded this month."
      : "Discretionary spending should stop this week.";
  } else if (projectedSpend > budget) {
    key = "watch";
    label = "Watch";
    action = scope === "month"
      ? "Month-end projection is over budget."
      : "Spending pace is running ahead.";
  }

  return { key, label, action, projectedSpend, budget };
}

function calculateCategoryDisplay(category, scope = state.ui.monitorScope || "week", monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  return scope === "month"
    ? calculateMonthCategoryStatus(category, monthKey, weekKey)
    : calculateWeekCategoryStatus(category, monthKey, weekKey);
}

function calculateWeekCategoryStatus(category, monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  const categoryDef = getCategoryById(category);
  const label = categoryDef.label;
  const group = getCategoryDisplayGroup(categoryDef);
  const ruleType = getCategoryRuleType(categoryDef);
  const icon = categoryDef.icon;
  const referenceDateISO = getReferenceDateISO(monthKey);
  const timing = getWeekTiming(referenceDateISO);
  const monthlyBudget = Number(categoryDef.monthlyBudget) || 0;
  const monthSpent = getMonthSpent(category, monthKey);
  const currentWeekBudget = getCurrentWeekBudget(category, weekKey, monthKey);
  const weekSpent = getWeekSpent(category, weekKey, monthKey);
  const monthRemaining = Math.max(0, monthlyBudget - monthSpent);
  const nextWeekBudget = getNextWeekBudget(category, weekKey, monthKey);
  const expectedSpendByToday = currentWeekBudget * timing.weekProgress;
  const paceRatio = expectedSpendByToday > 0 ? weekSpent / expectedSpendByToday : 0;
  const projectedWeekEndSpend = timing.weekProgress > 0 ? weekSpent / timing.weekProgress : weekSpent;
  const projectedOvershoot = Math.max(0, projectedWeekEndSpend - currentWeekBudget);
  const dailyAllowanceRemaining = monthRemaining / Math.max(1, timing.daysRemainingInWeek);
  const penalty = isPenaltyCategory(categoryDef)
    ? calculateDiscretionaryPenalty(category, weekSpent, currentWeekBudget).penalty
    : 0;
  const overshoot = isPenaltyCategory(categoryDef)
    ? calculateDiscretionaryPenalty(category, weekSpent, currentWeekBudget).overshoot
    : Math.max(0, weekSpent - currentWeekBudget);
  const softCapMultiplier = Number(categoryDef.softCapMultiplier ?? state.settings.weeklyRules.defaultSoftCapMultiplier ?? 1.1) || 1.1;
  const softCap = isSoftCapCategory(categoryDef) ? currentWeekBudget * softCapMultiplier : currentWeekBudget;
  const riskSentence = isSoftCapCategory(categoryDef) ? "Soft cap risk. Slow non-urgent spending." : isPenaltyCategory(categoryDef) ? "Penalty active. Freeze this category." : "Track only. No warning or penalty.";

  let statusKey = "ok";
  let statusTone = "green";
  let statusLabel = "OK";
  let conclusion = "";

  if (isTrackOnlyCategory(categoryDef)) {
    statusKey = "info";
    statusTone = "neutral";
    statusLabel = "Track";
    conclusion = "Track only. No warning or penalty.";
  } else if (isSoftCapCategory(categoryDef)) {
    if (paceRatio > 1.25 || weekSpent > softCap) {
      statusKey = "risk";
      statusTone = "red";
      statusLabel = "Risk";
    } else if (paceRatio > 1.05 || weekSpent > currentWeekBudget) {
      statusKey = "watch";
      statusTone = "yellow";
      statusLabel = "Watch";
    } else {
      statusKey = "ok";
      statusTone = "green";
      statusLabel = "OK";
    }
    conclusion = statusKey === "ok" ? "On pace." : statusKey === "watch" ? "Running ahead of weekly pace." : "Soft cap risk. Slow non-urgent spending.";
  } else if (isPenaltyCategory(categoryDef)) {
    if (weekSpent > currentWeekBudget || paceRatio > 1.5) {
      statusKey = "freeze";
      statusTone = "red";
      statusLabel = "Freeze";
    } else if (paceRatio > 1 && weekSpent <= currentWeekBudget) {
      statusKey = "watch";
      statusTone = "yellow";
      statusLabel = "Watch";
    } else {
      statusKey = "ok";
      statusTone = "green";
      statusLabel = "OK";
    }
    conclusion = statusKey === "ok" ? "On pace." : statusKey === "watch" ? "Ahead of pace. Stop early if possible." : "Penalty active. Freeze this category.";
  }

  return {
    category,
    scope: "week",
    label,
    icon,
    type: ruleType,
    group,
    ruleType,
    monthlyBudget,
    weekSpent,
    currentWeekBudget,
    expectedSpendByToday,
    paceRatio,
    projectedWeekEndSpend,
    projectedOvershoot,
    monthSpent,
    monthRemaining,
    dailyAllowanceRemaining,
    nextWeekBudget,
    overshoot,
    penalty,
    softCap,
    riskSentence,
    conclusion,
    primarySpent: projectedWeekEndSpend,
    primaryBudget: currentWeekBudget,
    secondaryLine: isTrackOnlyCategory(categoryDef)
      ? "Track only. No warning or penalty."
      : isPenaltyCategory(categoryDef) && penalty > 0
      ? `Penalty active: -${money(penalty)} next week`
      : weekSpent === 0
        ? "No spend yet. Full budget available."
        : `Spent ${money(weekSpent)} so far · ${money(monthRemaining)} left this month`,
    actualExceededBudget: isPenaltyCategory(categoryDef) && weekSpent > currentWeekBudget,
    actualAmount: weekSpent,
    projectedAmount: projectedWeekEndSpend,
    markerBudget: currentWeekBudget,
    zoneBudget: currentWeekBudget,
    zoneSoftCap: softCap,
    displayRemaining: monthRemaining,
    empty: weekSpent === 0,
    secondaryHint: isTrackOnlyCategory(categoryDef)
      ? "Track only. No warning or penalty."
      : isPenaltyCategory(categoryDef) && penalty > 0
      ? `Penalty active: -${money(penalty)} next week`
      : `Spent ${money(weekSpent)} so far · ${money(monthRemaining)} left this month`,
    status: {
      key: statusKey,
      label: statusLabel,
      tone: statusTone
    }
  };
}

function calculateMonthCategoryStatus(category, monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  const categoryDef = getCategoryById(category);
  const label = categoryDef.label;
  const group = getCategoryDisplayGroup(categoryDef);
  const ruleType = getCategoryRuleType(categoryDef);
  const icon = categoryDef.icon;
  const monthlyBudget = Number(categoryDef.monthlyBudget) || 0;
  const monthSpent = getMonthSpent(category, monthKey);
  const timing = getMonthTiming(monthKey);
  const monthRemaining = Math.max(0, monthlyBudget - monthSpent);
  const projectedMonthEndSpend = timing.monthProgress > 0 ? monthSpent / timing.monthProgress : monthSpent;
  const projectedMonthOvershoot = Math.max(0, projectedMonthEndSpend - monthlyBudget);
  const currentWeekBudget = getCurrentWeekBudget(category, weekKey, monthKey);
  const weekSpent = getWeekSpent(category, weekKey, monthKey);
  const expectedSpendByToday = monthlyBudget * timing.monthProgress;
  const paceRatio = expectedSpendByToday > 0 ? monthSpent / expectedSpendByToday : 0;
  const penalty = isPenaltyCategory(categoryDef)
    ? calculateDiscretionaryPenalty(category, weekSpent, currentWeekBudget).penalty
    : 0;
  const softCapMultiplier = Number(categoryDef.softCapMultiplier ?? state.settings.weeklyRules.defaultSoftCapMultiplier ?? 1.1) || 1.1;
  const softCap = currentWeekBudget * softCapMultiplier;

  let statusKey = "ok";
  let statusTone = "green";
  let statusLabel = "OK";
  let conclusion = "On pace.";

  if (isTrackOnlyCategory(categoryDef)) {
    statusKey = "info";
    statusTone = "neutral";
    statusLabel = "Track";
    conclusion = "Track only. No budget enforcement.";
  } else if (isSoftCapCategory(categoryDef)) {
    if (monthSpent > monthlyBudget || projectedMonthEndSpend > monthlyBudget * 1.15) {
      statusKey = "risk";
      statusTone = "red";
      statusLabel = "Risk";
      conclusion = "Month-end risk is elevated.";
    } else if (projectedMonthEndSpend > monthlyBudget) {
      statusKey = "watch";
      statusTone = "yellow";
      statusLabel = "Watch";
      conclusion = "Month-end projection is running high.";
    }
  } else if (isPenaltyCategory(categoryDef)) {
    if (monthSpent > monthlyBudget || projectedMonthEndSpend > monthlyBudget * 1.25) {
      statusKey = "freeze";
      statusTone = "red";
      statusLabel = "Freeze";
      conclusion = "Discretionary month budget is at risk.";
    } else if (projectedMonthEndSpend > monthlyBudget) {
      statusKey = "watch";
      statusTone = "yellow";
      statusLabel = "Watch";
      conclusion = "Month-end projection is over budget.";
    }
  }

  return {
    category,
    scope: "month",
    label,
    icon,
    type: ruleType,
    group,
    ruleType,
    monthlyBudget,
    weekSpent,
    currentWeekBudget,
    expectedSpendByToday,
    paceRatio,
    projectedWeekEndSpend: weekSpent,
    projectedOvershoot: projectedMonthOvershoot,
    monthSpent,
    monthRemaining,
    dailyAllowanceRemaining: timing.daysRemainingInMonth > 0 ? monthRemaining / timing.daysRemainingInMonth : monthRemaining,
    nextWeekBudget: getNextWeekBudget(category, weekKey, monthKey),
    overshoot: Math.max(0, monthSpent - monthlyBudget),
    penalty,
    softCap,
    riskSentence: conclusion,
    conclusion,
    primarySpent: projectedMonthEndSpend,
    primaryBudget: monthlyBudget,
    secondaryLine: monthSpent === 0
      ? "No spend yet. Full budget available."
      : `Spent ${money(monthSpent)} so far · ${money(monthRemaining)} left this month`,
    actualExceededBudget: isPenaltyCategory(categoryDef) && monthSpent > monthlyBudget,
    actualAmount: monthSpent,
    projectedAmount: projectedMonthEndSpend,
    markerBudget: monthlyBudget,
    zoneBudget: monthlyBudget,
    zoneSoftCap: isSoftCapCategory(categoryDef) ? monthlyBudget * 1.15 : monthlyBudget,
    displayRemaining: monthRemaining,
    empty: monthSpent === 0,
    projectedMonthEndSpend,
    projectedMonthOvershoot,
    status: {
      key: statusKey,
      label: statusLabel,
      tone: statusTone
    }
  };
}

function calculateMonthOutlook(monthKey = state.ui.selectedMonth, categoryMap = null) {
  const categories = categoryMap
    ? Object.values(categoryMap)
    : getCategories().filter(isVariableTotalCategory).map((category) => calculateMonthCategoryStatus(category.id, monthKey));
  const included = categories.filter((item) => isVariableTotalCategory(getCategoryById(item.category)));
  const projectedMonthEndVariableSpend = sum(included.map((item) => item.primarySpent));
  const monthlyVariableBudget = sum(included.map((item) => item.primaryBudget));
  const projectedDiff = projectedMonthEndVariableSpend - monthlyVariableBudget;
  const freeze = included.some((item) => item.group === "discretionary" && item.monthSpent > item.monthlyBudget);
  const atRisk = included
    .filter((item) => item.projectedOvershoot > 0)
    .sort((a, b) => b.projectedOvershoot - a.projectedOvershoot)
    .slice(0, 3);
  const statusKey = freeze ? "freeze" : projectedDiff > 0 ? "watch" : "safe";
  return {
    projectedMonthEndVariableSpend,
    monthlyVariableBudget,
    projectedDiff,
    atRisk,
    status: {
      key: statusKey,
      label: statusKey === "safe" ? "Safe" : statusKey === "watch" ? "Watch" : "Freeze",
      action: statusKey === "safe"
        ? "Month is on pace."
        : statusKey === "watch"
          ? "Month-end projection is over budget."
          : "Discretionary budget is already exceeded this month."
    }
  };
}

function getMonthReviewStatus(monthKey) {
  const review = state.monthReviews?.[monthKey] || {};
  const lastMonthResult = calculateLastMonthResult(monthKey);
  return {
    reviewed: Boolean(review.reviewed),
    backupDone: Boolean(review.backupDone),
    lastMonthResult,
    reserveUpdate: review.reviewed ? "ok" : "suggested"
  };
}

function markMonthReviewed(monthKey) {
  state.monthReviews ||= {};
  state.monthReviews[monthKey] = {
    ...(state.monthReviews[monthKey] || {}),
    reviewed: true,
    reviewedAtISO: new Date().toISOString()
  };
  saveState();
  showToast("Month marked reviewed.");
  render();
}

function markMonthBackupDone(monthKey) {
  state.monthReviews ||= {};
  state.monthReviews[monthKey] = {
    ...(state.monthReviews[monthKey] || {}),
    backupDone: true,
    backupDoneAtISO: new Date().toISOString()
  };
  saveState();
  showToast("Backup marked done.");
  render();
}

function calculateLastMonthResult(monthKey) {
  const lastMonth = shiftMonthKey(monthKey, -1);
  const categories = getCategories().filter(isVariableTotalCategory).map((category) => calculateMonthCategoryStatus(category.id, lastMonth));
  if (!categories.some((item) => item.monthSpent > 0)) return { key: "none", label: "no data", amount: 0 };
  const spent = sum(categories.map((item) => item.monthSpent));
  const budget = sum(categories.map((item) => item.monthlyBudget));
  const diff = spent - budget;
  return {
    key: diff > 0 ? "over" : "under",
    label: diff > 0 ? `${money(diff)} over` : `${money(Math.abs(diff))} under`,
    amount: diff
  };
}

function calculateWeeklyDiscipline(monthKey = state.ui.selectedMonth, weekKey = getWeekKey(getReferenceDateISO(monthKey))) {
  const tracked = getCategories()
    .filter(isWeeklyDisciplineCategory);
  const categories = tracked.map((item) => calculateWeekCategoryStatus(item.id, monthKey, weekKey));
  const penaltyRows = categories
    .filter((item) => isPenaltyCategory(getCategoryById(item.category)))
    .filter((item) => item.penalty > 0)
    .map((item) => ({
      categoryId: item.category,
      label: item.label,
      overshoot: item.overshoot,
      penalty: item.penalty
    }));
  const penaltyCategories = categories.filter((item) => isPenaltyCategory(getCategoryById(item.category)));
  const categoryPenalties = Object.fromEntries(penaltyRows.map((row) => [row.categoryId, row.penalty]));
  const thisWeekVariableBudget = sum(categories.map((item) => item.currentWeekBudget));
  const thisWeekVariableSpent = sum(categories.map((item) => item.weekSpent));
  const discretionaryOvershoot = sum(penaltyCategories.map((item) => item.overshoot));
  const projectedDiscretionaryOvershoot = sum(penaltyCategories.map((item) => item.projectedOvershoot));
  const nextWeekReduction = sum(Object.values(categoryPenalties));
  const isClosed = Boolean(state.weeklyClosures[weekKey]);
  const closeStatus = getWeeklyCloseStatus(weekKey);
  const penaltyBudgetBase = sum(penaltyCategories.map((item) => item.currentWeekBudget));
  const statusTone = nextWeekReduction === 0 ? "green" : nextWeekReduction <= penaltyBudgetBase * 0.2 ? "yellow" : "red";
  return {
    weekKey,
    thisWeekVariableBudget,
    thisWeekVariableSpent,
    discretionaryOvershoot,
    projectedDiscretionaryOvershoot,
    nextWeekReduction,
    categoryPenalties,
    penaltyRows,
    isClosed,
    closeStatus,
    status: {
      label: statusTone === "green" ? "Green" : statusTone === "yellow" ? "Yellow" : "Red",
      tone: statusTone
    },
    conclusion: statusTone === "green"
      ? "No penalty is projected for next week."
      : statusTone === "yellow"
        ? "A moderate penalty will reduce next week's discretionary budget."
        : "A large penalty will materially reduce next week's discretionary budget.",
    nextAction: statusTone === "green"
      ? "Maintain current pace."
      : statusTone === "yellow"
        ? "Protect the remaining discretionary budget."
        : "Treat discretionary spending as frozen."
  };
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

  if (today.slice(0, 7) === monthKey) {
    dayOfMonth = Number(today.slice(8, 10));
  } else if (monthKey > today.slice(0, 7)) {
    dayOfMonth = 1;
  }

  const monthProgress = Math.min(1, Math.max(1 / daysInMonth, dayOfMonth / daysInMonth));
  return {
    daysInMonth,
    dayOfMonth,
    daysRemainingInMonth: Math.max(0, daysInMonth - dayOfMonth),
    monthProgress
  };
}

function getDaysInMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function shiftMonthKey(monthKey, offset) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}

function getWeekTiming(referenceDateISO) {
  const weekStartISO = getWeekStart(referenceDateISO);
  const weekEndISO = getWeekEnd(referenceDateISO);
  const elapsed = Math.floor((new Date(`${referenceDateISO}T00:00:00`) - new Date(`${weekStartISO}T00:00:00`)) / 86400000) + 1;
  const daysElapsedInWeek = Math.min(7, Math.max(1, elapsed));
  const daysRemainingInWeek = Math.min(7, Math.max(1, 8 - daysElapsedInWeek));
  return {
    weekStartISO,
    weekEndISO,
    daysElapsedInWeek,
    daysRemainingInWeek,
    weekProgress: daysElapsedInWeek / 7
  };
}

function getCurrentWeekBudget(category, weekKey, monthKey = state.ui.selectedMonth) {
  const monthlyBudget = Number(getCategoryById(category).monthlyBudget) || 0;
  const weeks = getWeeksOverlappingMonth(monthKey);
  const baseBudget = weeks.length ? monthlyBudget / weeks.length : monthlyBudget;
  const adjustment = getWeekAdjustmentPenalty(weekKey, category);
  return Math.max(0, baseBudget - adjustment);
}

function getNextWeekBudget(category, weekKey, monthKey = state.ui.selectedMonth) {
  const monthlyBudget = Number(getCategoryById(category).monthlyBudget) || 0;
  const weekEnd = getWeekEnd(weekKey);
  const spentThroughCurrentWeek = getMonthSpentThroughDate(category, monthKey, weekEnd);
  const remainingMonthlyBudget = Math.max(0, monthlyBudget - spentThroughCurrentWeek);
  const weeks = getWeeksOverlappingMonth(monthKey);
  const remainingWeeksAfterCurrentWeek = weeks.filter((startISO) => startISO > weekKey).length;
  const nextWeekBaseBudget = Math.max(0, remainingMonthlyBudget / Math.max(1, remainingWeeksAfterCurrentWeek));
  const nextWeekKey = shiftDateISO(weekKey, 7);
  const adjustment = getWeekAdjustmentPenalty(nextWeekKey, category);
  return Math.max(0, nextWeekBaseBudget - adjustment);
}

function getMonthSpent(category, monthKey = state.ui.selectedMonth) {
  return sum(
    state.transactions
      .filter((item) => item.category === category && item.dateISO.slice(0, 7) === monthKey)
      .map((item) => item.amount)
  );
}

function getMonthSpentThroughDate(category, monthKey, dateISO) {
  return sum(
    state.transactions
      .filter((item) => item.category === category && item.dateISO.slice(0, 7) === monthKey && item.dateISO <= dateISO)
      .map((item) => item.amount)
  );
}

function getWeekSpent(category, weekKey, monthKey = state.ui.selectedMonth) {
  const weekEnd = getWeekEnd(weekKey);
  return sum(
    state.transactions
      .filter((item) => item.category === category && item.dateISO.slice(0, 7) === monthKey && item.dateISO >= weekKey && item.dateISO <= weekEnd)
      .map((item) => item.amount)
  );
}

function calculateDiscretionaryPenalty(category, actual, budget) {
  const categoryDef = getCategoryById(category);
  if (!isPenaltyCategory(categoryDef)) {
    return { overshoot: 0, penalty: 0 };
  }
  const overshoot = Math.max(0, actual - budget);
  const penaltyMultiplier = Number(categoryDef.penaltyMultiplier ?? state.settings.weeklyRules.penaltyMultiplier) || 1.5;
  const minPenaltyUnit = Number(categoryDef.minPenaltyUnit ?? state.settings.weeklyRules.minPenaltyUnit) || 5;
  const penalty = overshoot > 0 ? Math.max(minPenaltyUnit, penaltyMultiplier * overshoot) : 0;
  return { overshoot, penalty };
}

function calculateReserveRunway(reserveBalance, stableGap) {
  const safeGap = Math.max(1, Number(stableGap) || 0);
  const months = Math.floor((Number(reserveBalance) || 0) / safeGap);
  return {
    months,
    days: months * 30
  };
}

function calculateReserveProjection(targetDateISO) {
  const startDateISO = getProjectionAnchorDateISO();
  let balance = calculateReserveVaultTotal();
  if (targetDateISO <= startDateISO) return balance;
  let cursor = firstOfNextMonth(startDateISO);

  while (cursor < targetDateISO) {
    balance += calculateProjectionMonthlyNet(cursor.slice(0, 7), state.settings);
    cursor = firstOfNextMonth(cursor);
  }

  return balance;
}

function getProjectionAnchorDateISO() {
  const anchorMonth = normalizeMonthValue(state.settings.reserve?.projectionAnchorMonth) || currentMonthKey();
  return `${anchorMonth}-01`;
}

function projectionTone(value) {
  const amount = Number(value) || 0;
  const gap = Math.max(1, getStableGapFromSettings(state.settings) || 0);
  if (amount < 0) return "red";
  if (amount <= gap * 2) return "yellow";
  return "green";
}

function getProjectionTargets(referenceDateISO) {
  const [year] = referenceDateISO.slice(0, 7).split("-").map(Number);
  const sepThisYear = `${year}-09-01`;
  const janNext = `${year + 1}-01-01`;
  const sepTarget = referenceDateISO < sepThisYear ? sepThisYear : `${year + 1}-09-01`;
  const janTarget = janNext;
  return {
    sep: { targetDateISO: sepTarget, label: formatProjectionLabel(sepTarget) },
    jan: { targetDateISO: janTarget, label: formatProjectionLabel(janTarget) }
  };
}

function getWeekStart(dateISO) {
  const date = new Date(`${dateISO}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

function getWeekEnd(dateISO) {
  return shiftDateISO(getWeekStart(dateISO), 6);
}

function getWeekKey(dateISO) {
  return getWeekStart(dateISO);
}

function getPreviousWeekKey(weekKey) {
  return shiftDateISO(weekKey, -7);
}

function getWeeklyCloseStatus(weekKey) {
  if (state.weeklyClosures[weekKey]) {
    return {
      key: "closed",
      label: "Closed",
      tone: "green",
      message: "This week has already been closed."
    };
  }
  const referenceDateISO = getReferenceDateISO(state.ui.selectedMonth);
  const day = new Date(`${referenceDateISO}T00:00:00`).getDay();
  const previousWeekKey = getPreviousWeekKey(weekKey);
  if (day === 1 && !state.weeklyClosures[previousWeekKey]) {
    return {
      key: "last-week-open",
      label: "Last week not closed",
      tone: "yellow",
      message: "Last week was not closed. Review before continuing."
    };
  }
  if (day === 0) {
    return {
      key: "ready",
      label: "Ready to close",
      tone: "yellow",
      message: "Ready to close this week."
    };
  }
  return {
    key: "in-progress",
    label: "In progress",
    tone: "neutral",
    message: "Week is still in progress."
  };
}

function getWeeksOverlappingMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const seen = new Set();
  const weeks = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateISO = new Date(year, month - 1, day).toISOString().slice(0, 10);
    const weekKey = getWeekKey(dateISO);
    if (!seen.has(weekKey)) {
      seen.add(weekKey);
      weeks.push(weekKey);
    }
  }
  return weeks.sort();
}

function getWeekAdjustmentPenalty(weekKey, category) {
  const item = state.weeklyBudgetAdjustments[weekKey];
  if (!item) return 0;
  if (item.categoryPenalties && item.categoryPenalties[category] != null) {
    return Number(item.categoryPenalties[category]) || 0;
  }
  if (category === "entertainment") return Number(item.entertainmentPenalty ?? item.legacy?.entertainmentPenalty) || 0;
  if (category === "misc") return Number(item.miscPenalty ?? item.legacy?.miscPenalty) || 0;
  return 0;
}

function getFilteredTransactions() {
  const monthKey = state.ui.selectedMonth;
  const filter = state.ui.txFilter || "month";
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  const weekEnd = getWeekEnd(weekKey);
  let list = state.transactions.filter((item) => item.dateISO.slice(0, 7) === monthKey);

  if (filter === "week") {
    list = list.filter((item) => item.dateISO >= weekKey && item.dateISO <= weekEnd);
  }
  if (filter === "essentials") {
    list = list.filter((item) => getCategoryDisplayGroup(getCategoryById(item.category)) === "essentials");
  }
  if (filter === "discretionary") {
    list = list.filter((item) => getCategoryDisplayGroup(getCategoryById(item.category)) === "discretionary");
  }
  if (filter === "all") {
    list = state.transactions.slice();
  }

  return list.sort((a, b) => `${b.dateISO}-${b.id}`.localeCompare(`${a.dateISO}-${a.id}`));
}

function getEditingTransaction() {
  return state.transactions.find((item) => item.id === state.ui.editingTransactionId) || null;
}

function saveTransaction(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = Object.fromEntries(formData.entries());
  const category = normalizeCategory(payload.category);
  if (!category || !isCategoryAllowedForTransaction(category)) {
    showToast("Invalid category.");
    return;
  }
  const transaction = {
    id: payload.id || uid("txn"),
    dateISO: payload.dateISO,
    amount: Number(payload.amount) || 0,
    category,
    note: String(payload.note || "").trim()
  };
  if (!transaction.dateISO || transaction.amount <= 0) {
    showToast("Date and amount are required.");
    return;
  }

  const index = state.transactions.findIndex((item) => item.id === transaction.id);
  if (index >= 0) {
    state.transactions[index] = transaction;
  } else {
    state.transactions.push(transaction);
  }

  state.ui.lastTransactionTemplate = {
    amount: transaction.amount,
    category: transaction.category,
    note: transaction.note
  };
  state.ui.editingTransactionId = null;
  modalRoot.innerHTML = "";
  state.ui.activeTab = "monitor";
  saveState();
  showToast(index >= 0 ? "Transaction updated." : "Transaction added.");
  render();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((item) => item.id !== id);
  if (state.ui.editingTransactionId === id) state.ui.editingTransactionId = null;
  saveState();
  showToast("Transaction deleted.");
  render();
}

function categoryHasTransactions(categoryId) {
  return state.transactions.some((item) => item.category === categoryId);
}

function cancelEditingTransaction() {
  state.ui.editingTransactionId = null;
  saveState();
  render();
}

function closeWeek() {
  const monthKey = state.ui.selectedMonth;
  const weekKey = getWeekKey(getReferenceDateISO(monthKey));
  if (state.weeklyClosures[weekKey]) {
    showToast("This week has already been closed.");
    return;
  }

  const nextWeekKey = shiftDateISO(weekKey, 7);
  const categoryPenalties = {};
  getCategories()
    .filter(isWeeklyDisciplineCategory)
    .filter(isPenaltyCategory)
    .forEach((category) => {
      const status = calculateWeekCategoryStatus(category.id, monthKey, weekKey);
      if (status.penalty > 0) categoryPenalties[category.id] = status.penalty;
    });
  const totalPenalty = sum(Object.values(categoryPenalties));

  state.weeklyBudgetAdjustments[nextWeekKey] = {
    weekStartISO: nextWeekKey,
    sourceWeekStartISO: weekKey,
    categoryPenalties,
    totalPenalty
  };

  state.weeklyClosures[weekKey] = {
    weekStartISO: weekKey,
    closedAtISO: new Date().toISOString(),
    categoryPenalties,
    totalPenalty
  };

  saveState();
  showToast(`Week closed. Next week reduced by ${money(totalPenalty)}.`);
  render();
}

function reopenWeek() {
  const weekKey = getWeekKey(getReferenceDateISO(state.ui.selectedMonth));
  const closure = state.weeklyClosures[weekKey];
  if (!closure) {
    showToast("No week close to reopen.");
    return;
  }
  const ok = window.confirm("Reopen this week? This removes the week closure and the next-week budget adjustment created from it.");
  if (!ok) return;
  const nextWeekKey = shiftDateISO(weekKey, 7);
  delete state.weeklyClosures[weekKey];
  delete state.weeklyBudgetAdjustments[nextWeekKey];
  saveState();
  showToast("Week reopened.");
  render();
}

function reviewLastWeek() {
  state.ui.txFilter = "week";
  showToast("Review last week's activity, then close when ready.");
  saveState();
  render();
}

function saveSettings(event) {
  event.preventDefault();
  const next = structuredClone(state);
  const formData = new FormData(event.currentTarget);
  for (const [path, rawValue] of formData.entries()) {
    const value = path === "settings.reserve.projectionAnchorMonth"
      ? normalizeMonthValue(rawValue) || currentMonthKey()
      : rawValue === "" ? null : Number(rawValue);
    setByPath(next, path, value);
  }
  state = normalizeState(next);
  saveState();
  showToast("Settings saved.");
  render();
}

function saveCategoryEdits(event, categoryId) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const next = structuredClone(state);
  const index = next.settings.monitorCategories.findIndex((item) => item.id === categoryId);
  if (index < 0) return;
  const current = next.settings.monitorCategories[index];
  next.settings.monitorCategories[index] = {
    ...current,
    label: String(formData.get("label") || current.label).trim() || current.label,
    icon: String(formData.get("icon") || current.icon).trim() || "•",
    group: String(formData.get("group") || current.group),
    monthlyBudget: Number(formData.get("monthlyBudget")) || 0,
    ruleType: String(formData.get("ruleType") || current.ruleType),
    softCapMultiplier: nullableNumber(formData.get("softCapMultiplier")),
    penaltyMultiplier: nullableNumber(formData.get("penaltyMultiplier")),
    minPenaltyUnit: nullableNumber(formData.get("minPenaltyUnit")),
    priority: String(formData.get("priority") || current.priority),
    displayOrder: Number(formData.get("displayOrder")) || current.displayOrder,
    monitor: formData.has("monitor"),
    allowTransactions: formData.has("allowTransactions"),
    includeInVariableTotal: formData.has("includeInVariableTotal"),
    includeInWeeklyDiscipline: formData.has("includeInWeeklyDiscipline"),
    active: formData.has("active")
  };
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Category updated.");
  render();
}

function archiveCategory(categoryId) {
  const next = structuredClone(state);
  const category = next.settings.monitorCategories.find((item) => item.id === categoryId);
  if (!category) return;
  category.active = false;
  category.archived = true;
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Category archived.");
  render();
}

function deleteCategory(categoryId) {
  if (categoryHasTransactions(categoryId)) {
    showToast("This category has transactions and cannot be deleted.");
    return;
  }
  if (!confirm("Delete this category permanently?")) return;
  const next = structuredClone(state);
  next.settings.monitorCategories = next.settings.monitorCategories.filter((item) => item.id !== categoryId);
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Category deleted.");
  render();
}

function restoreCategory(categoryId) {
  const next = structuredClone(state);
  const category = next.settings.monitorCategories.find((item) => item.id === categoryId);
  if (!category) return;
  category.active = true;
  category.archived = false;
  state = normalizeState(next);
  saveState();
  openManageBudgetCategories();
}

function saveBudgetCategoriesManager(event) {
  event.preventDefault();
  const next = structuredClone(state);
  const formData = new FormData(event.currentTarget);
  next.settings.monitorCategories.forEach((category) => {
    const raw = formData.get(`order:${category.id}`);
    if (raw != null) category.displayOrder = Number(raw) || category.displayOrder;
  });
  state = normalizeState(next);
  saveState();
  openManageBudgetCategories();
  showToast("Category order saved.");
}

function addMonitorCategory(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  const next = structuredClone(state);
  const id = uniqueCategoryId(label, next.settings.monitorCategories);
  const rulePreset = String(formData.get("rulePreset") || "penalty");
  next.settings.monitorCategories.push({
    id,
    label,
    icon: String(formData.get("icon") || "•").trim() || "•",
    group: String(formData.get("group") || "discretionary"),
    monthlyBudget: Number(formData.get("monthlyBudget")) || 0,
    monitor: formData.has("monitor"),
    allowTransactions: formData.has("allowTransactions"),
    includeInVariableTotal: true,
    includeInWeeklyDiscipline: true,
    ruleType: rulePreset,
    softCapMultiplier: rulePreset === "softCap" ? Number(state.settings.weeklyRules.defaultSoftCapMultiplier) || 1.1 : null,
    penaltyMultiplier: rulePreset === "penalty" ? Number(state.settings.weeklyRules.penaltyMultiplier) || 1.5 : null,
    minPenaltyUnit: rulePreset === "penalty" ? Number(state.settings.weeklyRules.minPenaltyUnit) || 5 : null,
    priority: String(formData.get("priority") || "secondary"),
    displayOrder: next.settings.monitorCategories.length + 1,
    active: true,
    archived: false
  });
  state = normalizeState(next);
  saveState();
  openManageBudgetCategories();
  showToast("Category added.");
}

function saveBackgroundItemEdits(event, sectionId, itemId) {
  event.preventDefault();
  const next = structuredClone(state);
  const section = next.settings.backgroundSections.find((entry) => entry.id === sectionId);
  const item = section?.items?.find((entry) => entry.id === itemId);
  if (!section || !item) return;
  const formData = new FormData(event.currentTarget);
  item.label = String(formData.get("label") || item.label).trim() || item.label;
  item.amount = Number(formData.get("amount")) || 0;
  item.frequency = String(formData.get("frequency") || item.frequency);
  item.type = String(formData.get("type") || item.type || section.type);
  item.includeInGap = formData.has("includeInGap");
  item.includeInProjection = formData.has("includeInProjection");
  item.includeInSummary = formData.has("includeInSummary");
  item.active = formData.has("active");
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Background item updated.");
  render();
}

function archiveBackgroundItem(sectionId, itemId) {
  const next = structuredClone(state);
  const item = next.settings.backgroundSections.find((entry) => entry.id === sectionId)?.items?.find((entry) => entry.id === itemId);
  if (!item) return;
  item.active = false;
  item.archived = true;
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Background item archived.");
  render();
}

function saveBackgroundSectionsManager(event) {
  event.preventDefault();
  const next = structuredClone(state);
  const formData = new FormData(event.currentTarget);
  next.settings.backgroundSections.forEach((section) => {
    const raw = formData.get(`section-order:${section.id}`);
    const label = String(formData.get(`section-label:${section.id}`) || section.label).trim();
    const type = String(formData.get(`section-type:${section.id}`) || section.type);
    if (raw != null) section.displayOrder = Number(raw) || section.displayOrder;
    section.label = label || section.label;
    section.type = type || section.type;
  });
  state = normalizeState(next);
  saveState();
  openManageBackgroundSections();
  showToast("Sections updated.");
}

function addBackgroundSection(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  const next = structuredClone(state);
  next.settings.backgroundSections.push({
    id: uniqueSectionId(label, next.settings.backgroundSections),
    label,
    type: String(formData.get("type") || "other"),
    displayOrder: Number(formData.get("displayOrder")) || next.settings.backgroundSections.length + 1,
    active: true,
    archived: false,
    items: []
  });
  state = normalizeState(next);
  saveState();
  openManageBackgroundSections();
  showToast("Background section added.");
}

function addBackgroundItem(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const sectionId = String(formData.get("sectionId") || "");
  const label = String(formData.get("label") || "").trim();
  if (!sectionId || !label) return;
  const next = structuredClone(state);
  const section = next.settings.backgroundSections.find((entry) => entry.id === sectionId);
  if (!section) return;
  section.items.push({
    id: uniqueBackgroundItemId(label, section.items),
    label,
    amount: Number(formData.get("amount")) || 0,
    frequency: String(formData.get("frequency") || "monthly"),
    type: String(formData.get("type") || section.type || "other"),
    includeInGap: formData.has("includeInGap"),
    includeInProjection: formData.has("includeInProjection"),
    includeInSummary: formData.has("includeInSummary"),
    active: formData.has("active"),
    archived: false
  });
  state = normalizeState(next);
  saveState();
  openManageBackgroundSections();
  showToast("Background item added.");
}

function renderBackgroundTypeOptions(selected = "other") {
  const options = [
    ["income", "Income"],
    ["fixed", "Fixed"],
    ["debt", "Debt"],
    ["investment", "Investment"],
    ["other", "Other"]
  ];
  return options
    .map(([value, label]) => `<option value="${value}" ${selected === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

function archiveBackgroundSection(sectionId) {
  const next = structuredClone(state);
  const section = next.settings.backgroundSections.find((entry) => entry.id === sectionId);
  if (!section) return;
  section.active = false;
  section.archived = true;
  state = normalizeState(next);
  saveState();
  openManageBackgroundSections();
}

function restoreBackgroundSection(sectionId) {
  const next = structuredClone(state);
  const section = next.settings.backgroundSections.find((entry) => entry.id === sectionId);
  if (!section) return;
  section.active = true;
  section.archived = false;
  state = normalizeState(next);
  saveState();
  openManageBackgroundSections();
}

function saveReserveAccountEdits(event, accountId) {
  event.preventDefault();
  const next = structuredClone(state);
  const account = next.settings.reserve.accounts.find((entry) => entry.id === accountId);
  if (!account) return;
  const formData = new FormData(event.currentTarget);
  account.label = String(formData.get("label") || account.label).trim() || account.label;
  account.balance = Number(formData.get("balance")) || 0;
  account.displayOrder = Number(formData.get("displayOrder")) || account.displayOrder;
  account.includeInRunway = formData.has("includeInRunway");
  account.includeInVaultTotal = formData.has("includeInVaultTotal");
  account.active = formData.has("active");
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Reserve account updated.");
  render();
}

function archiveReserveAccount(accountId) {
  const next = structuredClone(state);
  const account = next.settings.reserve.accounts.find((entry) => entry.id === accountId);
  if (!account) return;
  account.active = false;
  account.archived = true;
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Reserve account archived.");
  render();
}

function restoreReserveAccount(accountId) {
  const next = structuredClone(state);
  const account = next.settings.reserve.accounts.find((entry) => entry.id === accountId);
  if (!account) return;
  account.active = true;
  account.archived = false;
  state = normalizeState(next);
  saveState();
  openManageReserveAccounts();
}

function saveReserveAccountsManager(event) {
  event.preventDefault();
  const next = structuredClone(state);
  const formData = new FormData(event.currentTarget);
  next.settings.reserve.accounts.forEach((account) => {
    const raw = formData.get(`account-order:${account.id}`);
    if (raw != null) account.displayOrder = Number(raw) || account.displayOrder;
  });
  state = normalizeState(next);
  saveState();
  openManageReserveAccounts();
  showToast("Reserve account order saved.");
}

function addReserveAccount(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  const next = structuredClone(state);
  next.settings.reserve.accounts.push({
    id: uniqueReserveAccountId(label, next.settings.reserve.accounts),
    label,
    balance: Number(formData.get("balance")) || 0,
    includeInRunway: formData.has("includeInRunway"),
    includeInVaultTotal: formData.has("includeInVaultTotal"),
    active: formData.has("active"),
    archived: false,
    displayOrder: next.settings.reserve.accounts.length + 1
  });
  state = normalizeState(next);
  saveState();
  openManageReserveAccounts();
  showToast("Reserve account added.");
}

function saveProjectionEventEdits(event, eventId) {
  event.preventDefault();
  const next = structuredClone(state);
  const item = next.settings.reserve.events.find((entry) => entry.id === eventId);
  if (!item) return;
  const formData = new FormData(event.currentTarget);
  item.label = String(formData.get("label") || item.label).trim() || item.label;
  item.type = String(formData.get("type") || item.type) === "oneTime" ? "oneTime" : "monthly";
  item.amount = Number(formData.get("amount")) || 0;
  item.startMonth = normalizeMonthValue(formData.get("startMonth")) || item.startMonth || state.ui.selectedMonth;
  item.endMonth = normalizeMonthValue(formData.get("endMonth"));
  item.month = normalizeMonthValue(formData.get("month"));
  item.displayOrder = Number(formData.get("displayOrder")) || item.displayOrder;
  item.affectsProjection = formData.has("affectsProjection");
  item.active = formData.has("active");
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Projection event updated.");
  render();
}

function archiveProjectionEvent(eventId) {
  const next = structuredClone(state);
  const item = next.settings.reserve.events.find((entry) => entry.id === eventId);
  if (!item) return;
  item.active = false;
  item.archived = true;
  state = normalizeState(next);
  saveState();
  closeQuickAdd();
  showToast("Projection event archived.");
  render();
}

function restoreProjectionEvent(eventId) {
  const next = structuredClone(state);
  const item = next.settings.reserve.events.find((entry) => entry.id === eventId);
  if (!item) return;
  item.active = true;
  item.archived = false;
  state = normalizeState(next);
  saveState();
  openManageProjectionEvents();
}

function saveProjectionEventsManager(event) {
  event.preventDefault();
  const next = structuredClone(state);
  const formData = new FormData(event.currentTarget);
  next.settings.reserve.events.forEach((item) => {
    const raw = formData.get(`event-order:${item.id}`);
    if (raw != null) item.displayOrder = Number(raw) || item.displayOrder;
  });
  state = normalizeState(next);
  saveState();
  openManageProjectionEvents();
  showToast("Projection event order saved.");
}

function addProjectionEvent(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const label = String(formData.get("label") || "").trim();
  if (!label) return;
  const next = structuredClone(state);
  const type = String(formData.get("type") || "monthly") === "oneTime" ? "oneTime" : "monthly";
  next.settings.reserve.events.push({
    id: uniqueReserveEventId(label, next.settings.reserve.events),
    label,
    type,
    amount: Number(formData.get("amount")) || 0,
    startMonth: normalizeMonthValue(formData.get("startMonth")) || state.ui.selectedMonth,
    endMonth: normalizeMonthValue(formData.get("endMonth")),
    month: normalizeMonthValue(formData.get("month")),
    active: formData.has("active"),
    archived: false,
    affectsProjection: formData.has("affectsProjection"),
    displayOrder: next.settings.reserve.events.length + 1
  });
  state = normalizeState(next);
  saveState();
  openManageProjectionEvents();
  showToast("Projection event added.");
}

function recalcReserveFromLedger() {
  const ledgerTotal = calculateReserveFromLedger(state.settings.reserveSchedule);
  const next = structuredClone(state);
  const account = next.settings.reserve.accounts.find((entry) => entry.id === "cash-reserve") || next.settings.reserve.accounts[0];
  if (account) account.balance = ledgerTotal;
  next.settings.systemCore.reserveBalanceNow = ledgerTotal;
  state = normalizeState(next);
  saveState();
  showToast("Reserve recalculated from ledger.");
  render();
}

function exportJSON() {
  state.monthReviews ||= {};
  state.monthReviews[state.ui.selectedMonth] = {
    ...(state.monthReviews[state.ui.selectedMonth] || {}),
    backupDone: true,
    backupDoneAtISO: new Date().toISOString()
  };
  saveState();
  downloadText(`finance-cashflow-os-v11-${state.ui.selectedMonth}.json`, JSON.stringify(state, null, 2), "application/json");
  showToast("JSON exported. Backup marked done.");
  render();
}

function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const candidate = adaptImportedPayload(parsed.data || parsed);
      state = normalizeState(deepMerge(state, candidate));
      saveState();
      showToast("JSON imported.");
      render();
    } catch {
      showToast("Invalid JSON import.");
    }
  };
  reader.readAsText(file);
}

function adaptImportedPayload(raw) {
  if (!isObject(raw)) return {};
  if (raw.schemaVersion === SCHEMA_VERSION || raw.appVersion === APP_VERSION) return raw;
  if (raw.currentMonth || raw.yearPlanVersions || raw.poolEntries) return migrateFromBoxBudgetV3(raw);
  if (raw.settings?.income || raw.settings?.coreIncome || raw.settings?.reserveIncome || raw.weeklyBudgetAdjustments) {
    return migrateFromPlannerV2(raw);
  }
  return raw;
}

function resetData() {
  if (!confirm("Reset local tracker data?")) return;
  state = structuredClone(DEFAULT_STATE);
  saveState();
  showToast("Local data reset.");
  render();
}

function calculateReserveFromLedger(schedule) {
  return sum([
    schedule?.preMay,
    schedule?.may,
    schedule?.june,
    schedule?.july,
    schedule?.august,
    schedule?.september,
    schedule?.october,
    schedule?.november,
    schedule?.december
  ]);
}

function calculateTotals() {
  const categories = getCategories().filter((item) => item.active && !item.archived);
  return {
    coreIncome: calculateSectionTotal("core-income"),
    reserveIncome: calculateSectionTotal("reserve-income"),
    investment: calculateInvestmentTotal(),
    fixed: calculateTotalByType("fixed"),
    debt: calculateTotalByType("debt"),
    variableEssentials: sum(categories.filter((item) => isVariableTotalCategory(item) && getCategoryDisplayGroup(item) === "essentials").map((item) => Number(item.monthlyBudget) || 0)),
    discretionary: sum(categories.filter((item) => isVariableTotalCategory(item) && getCategoryDisplayGroup(item) === "discretionary").map((item) => Number(item.monthlyBudget) || 0)),
    customVariable: sum(categories.filter((item) => isVariableTotalCategory(item) && getCategoryDisplayGroup(item) === "custom").map((item) => Number(item.monthlyBudget) || 0)),
    variableTotal: sum(categories.filter(isVariableTotalCategory).map((item) => Number(item.monthlyBudget) || 0)),
    reserveLedger: calculateReserveFromLedger(state.settings.reserveSchedule),
    reserveAccountsTotal: calculateReserveVaultTotal(),
    fixedDebtTotal: calculateFixedDebtTotal(),
    incomeTotal: calculateIncomeTotal()
  };
}

function deepMerge(base, extra) {
  if (Array.isArray(base) || Array.isArray(extra)) {
    return structuredClone(extra ?? base);
  }
  if (!isObject(base) || !isObject(extra)) {
    return extra === undefined ? structuredClone(base) : structuredClone(extra);
  }
  const result = structuredClone(base);
  Object.entries(extra).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = structuredClone(value);
    } else if (isObject(value) && isObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = structuredClone(value);
    }
  });
  return result;
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let ref = target;
  while (parts.length > 1) {
    const key = parts.shift();
    ref[key] ||= {};
    ref = ref[key];
  }
  ref[parts[0]] = value;
}

function findAmount(items, aliases, fallback) {
  if (!Array.isArray(items)) return fallback;
  const match = items.find((item) => aliases.some((alias) => item?.id === alias || String(item?.name || "").includes(alias)));
  return Number(match?.amount ?? match?.monthlyPayment) || fallback;
}

function pickReserveSchedule(ledger) {
  if (!ledger || !isObject(ledger)) return {};
  return {
    preMay: ledger.preMay ?? 2700,
    may: ledger.may ?? 1531,
    june: ledger.june ?? null,
    july: ledger.july ?? null,
    august: ledger.august ?? null,
    september: ledger.september ?? null,
    october: ledger.october ?? null,
    november: ledger.november ?? null,
    december: ledger.december ?? null
  };
}

function deriveReserveFromBoxBudget(raw) {
  const poolEntries = Array.isArray(raw?.poolEntries) ? raw.poolEntries : [];
  const net = poolEntries.reduce((acc, entry) => {
    const amount = Number(entry?.amount) || 0;
    const type = String(entry?.type || "").toLowerCase();
    return acc + (type === "spend" ? -amount : amount);
  }, 4231);
  return Math.round(net);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function currentMonthKey() {
  return currentDateISO().slice(0, 7);
}

function currentDateISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDateForMonth(monthKey) {
  return monthKey === currentMonthKey() ? currentDateISO() : `${monthKey}-01`;
}

function normalizeMonthValue(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : null;
}

function firstOfNextMonth(dateISO) {
  const [year, month] = dateISO.slice(0, 7).split("-").map(Number);
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  return `${next[0]}-${String(next[1]).padStart(2, "0")}-01`;
}

function monthDiffExclusive(startDateISO, targetDateISO) {
  const startMonth = startDateISO.slice(0, 7);
  const targetMonth = targetDateISO.slice(0, 7);
  const [startYear, startMonthNumber] = startMonth.split("-").map(Number);
  const [targetYear, targetMonthNumber] = targetMonth.split("-").map(Number);
  const diff = (targetYear - startYear) * 12 + (targetMonthNumber - startMonthNumber);
  return Math.max(0, diff);
}

function countProjectionSteps(startDateISO, targetDateISO) {
  let steps = 0;
  let cursor = firstOfNextMonth(startDateISO);
  while (cursor < targetDateISO) {
    steps += 1;
    cursor = firstOfNextMonth(cursor);
  }
  return steps;
}

function shiftDateISO(dateISO, days) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function showToast(message) {
  clearTimeout(toastTimer);
  document.querySelectorAll(".toast").forEach((node) => node.remove());
  const template = document.querySelector("#toastTemplate");
  const node = template.content.firstElementChild.cloneNode(true);
  node.textContent = message;
  document.body.appendChild(node);
  toastTimer = setTimeout(() => node.remove(), 2200);
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function money(value) {
  const amount = Number(value) || 0;
  const rounded = Math.round(Math.abs(amount));
  const formatted = rounded.toLocaleString("en-CA", { maximumFractionDigits: 0 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function percent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDate(dateISO) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric"
  });
}

function formatMonthLabel(monthKey) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric"
  });
}

function formatProjectionLabel(dateISO) {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric"
  });
}

function startCase(value) {
  return String(value)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase())
    .trim();
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function camelCaseFromSlug(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join("");
}

function uniqueCategoryId(label, existing) {
  return uniqueSlug(label, existing.map((item) => item.id));
}

function uniqueSectionId(label, existing) {
  return uniqueSlug(label, existing.map((item) => item.id));
}

function uniqueBackgroundItemId(label, existing) {
  return uniqueSlug(label, existing.map((item) => item.id));
}

function uniqueReserveAccountId(label, existing) {
  return uniqueSlug(label, existing.map((item) => item.id));
}

function uniqueReserveEventId(label, existing) {
  return uniqueSlug(label, existing.map((item) => item.id));
}

function uniqueSlug(label, usedIds) {
  const base = slugify(label) || "item";
  let candidate = base;
  let index = 2;
  const used = new Set(usedIds);
  while (used.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

function nullableNumber(value) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function sum(values) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
