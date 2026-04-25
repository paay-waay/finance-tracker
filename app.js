const APP_VERSION = "v10.0-github-pages";
const GITHUB_PAGES_BASE = "/finance-tracker/";
const STORAGE_KEY = "finance-box-budget-v3";
const APP_MONTH = "2026-04";

const wallets = {
  vewu: { label: "VEWU", reserveLabel: "Cash Reserve", hasAssets: true },
  pw: { label: "PW", reserveLabel: "Saved Money Reserve", hasAssets: false }
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "review", label: "Review" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" }
];

const boxMeta = {
  groceries: { wallet: "vewu", name: "Food & Groceries" },
  car407: { wallet: "vewu", name: "Car Energy & Tolls" },
  misc: { wallet: "vewu", name: "Household Misc" },
  eatOut: { wallet: "pw", name: "Food & RTO" },
  personal: { wallet: "pw", name: "Personal Spending" }
};

const debtFixedAliases = {
  mortgage: ["mortgage"],
  "car-loan": ["carPayment"],
  ikea: ["ikea"]
};

const demoState = {
  appVersion: APP_VERSION,
  currentMonth: APP_MONTH,
  activeWallet: "vewu",
  activeTab: "overview",
  manageSettings: false,
  manageReports: false,
  settingsSection: "plan",
  activeReport: "dashboard",
  selectedBox: "",
  highlightBox: "",
  debtPlans: [
    { debtId: "mortgage", wallet: "vewu", name: "Mortgage", startingBalance: 0, currentBalance: 0, monthlyPayment: 2000, interestRate: 0, status: "active", notes: "Tracked as debt payment with payoff tracking." },
    { debtId: "car-loan", wallet: "vewu", name: "Car Loan", startingBalance: 0, currentBalance: 0, monthlyPayment: 682, interestRate: 0, status: "active", notes: "Tracked as debt payment with payoff tracking." },
    { debtId: "ikea", wallet: "vewu", name: "Ikea Payment", startingBalance: 0, currentBalance: 0, monthlyPayment: 113, interestRate: 0, status: "active", notes: "Can be archived when paid off." }
  ],
  yearPlanVersions: [
    {
      versionId: "v1",
      effectiveFrom: "2026-01",
      createdAt: "2026-01-01",
      plan: {
        vewu: {
          incomeDefaults: [
            { id: "pwSalary", name: "PW Salary", amount: 5443 },
            { id: "mvContribution", name: "MV Contribution", amount: 100 },
            { id: "leoDebt", name: "Leo's Debt Payment", amount: 700 }
          ],
          autoFixedItems: [
            { id: "mortgage", name: "Mortgage", amount: 2000 },
            { id: "carPayment", name: "Car Payment", amount: 682 },
            { id: "ikea", name: "Ikea Payment", amount: 113 },
            { id: "condo", name: "Condo Admin", amount: 564 },
            { id: "propertyTax", name: "Property Tax", amount: 267 },
            { id: "insurance", name: "Insurance", amount: 558 },
            { id: "internet", name: "Internet / Phone / Utilities", amount: 49 },
            { id: "subscriptions", name: "Subscriptions", amount: 25 },
            { id: "pwAllowance", name: "PW Allowance", amount: 600 }
          ],
          baselineSavingItems: [
            { id: "investment", name: "Baseline Investment / Saving", amount: 200 }
          ],
          boxes: {
            groceries: { name: "Food & Groceries", budget: 800 },
            car407: { name: "Car Energy & Tolls", budget: 150 },
            misc: { name: "Household Misc", budget: 200 }
          },
          pool: {
            name: "Cash Reserve",
            startingBalance: 3805
          },
          extraIncomeRule: "Extra income defaults to Cash Reserve."
        },
        pw: {
          incomeDefaults: [
            { id: "allowance", name: "PW Allowance income", amount: 600 }
          ],
          autoFixedItems: [
            { id: "phone", name: "Phone", amount: 45 },
            { id: "gpt", name: "GPT", amount: 20 },
            { id: "youtube", name: "YouTube", amount: 16 },
            { id: "apple", name: "Apple One", amount: 24 },
            { id: "amex", name: "AMEX monthly fee", amount: 35 }
          ],
          baselineSavingItems: [],
          boxes: {
            eatOut: { name: "Food & RTO", budget: 200 },
            personal: { name: "Personal Spending", budget: 100 }
          },
          pool: {
            name: "Saved Money Reserve",
            startingBalance: 0
          },
          extraIncomeRule: "Personal refunds default to Saved Money Reserve."
        }
      }
    }
  ],
  monthlyOverrides: {},
  transactions: [
    t("2026-04-01", "vewu", 22, "groceries", "Oceans"),
    t("2026-04-05", "vewu", 145, "groceries", "Costco"),
    t("2026-04-05", "vewu", 30, "groceries", "Shoppers"),
    t("2026-04-06", "vewu", 84, "groceries", "Oceans"),
    t("2026-04-12", "vewu", 48, "groceries", "Arepa"),
    t("2026-04-14", "vewu", 83, "groceries", "Costco"),
    t("2026-04-14", "vewu", 43, "groceries", "Asia mart"),
    t("2026-04-15", "vewu", 10, "groceries", "Walmart"),
    t("2026-04-19", "vewu", 31, "groceries", "Oceans"),
    t("2026-04-19", "vewu", 11, "groceries", "Walmart"),
    t("2026-04-02", "vewu", 100, "car407", "Charging #1"),
    t("2026-04-04", "vewu", 10, "car407", "Charging #2"),
    t("2026-04-05", "vewu", 52, "car407", "Hwy 407"),
    t("2026-04-04", "vewu", 108, "misc", "Gusto + parking"),
    t("2026-04-10", "vewu", 23, "misc", "Marisela food"),
    t("2026-04-11", "vewu", 37, "misc", "Phone mount"),
    t("2026-04-11", "vewu", 52, "misc", "The Fry"),
    t("2026-04-12", "vewu", 300, "misc", "Half PC sell", "refund", { refundTarget: "box" }),
    t("2026-04-12", "vewu", 17, "misc", "Chicha"),
    t("2026-04-14", "vewu", 79, "misc", "Wok costco"),
    t("2026-04-17", "vewu", 8, "misc", "Dairy Cream"),
    t("2026-04-18", "vewu", 52, "misc", "Autospa"),
    t("2026-04-19", "vewu", 11, "misc", "Ordinary"),
    t("2026-04-21", "vewu", 7, "misc", "Shoppers"),
    t("2026-04-09", "pw", 35, "eatOut", "RTO Tue"),
    t("2026-04-10", "pw", 42, "eatOut", "RTO Wed"),
    t("2026-04-11", "pw", 38, "eatOut", "RTO Thurs"),
    t("2026-04-14", "pw", 64, "eatOut", "Dinner"),
    t("2026-04-16", "pw", 55, "personal", "Haircut"),
    t("2026-04-18", "pw", 45, "personal", "Small shopping")
  ],
  poolEntries: [
    p("2026-01-01", "vewu", "inflow", 2045, "Extra Paycheque", "PW Jan Extra"),
    p("2026-01-15", "vewu", "spend", 1743, "Big Spend", "Extra mortgage"),
    p("2026-02-10", "vewu", "spend", 3665, "Big Spend", "Costco membership / annual"),
    p("2026-03-11", "vewu", "inflow", 7355, "Bonus / Retro Pay", "PW Bonus + retro"),
    p("2026-03-31", "vewu", "inflow", 3598, "Tax Return", "PW Tax return"),
    p("2026-04-12", "vewu", "spend", 1220, "Big Spend", "Mateo screen"),
    p("2026-04-12", "pw", "inflow", 300, "Refund / resale", "Half PC sell"),
    p("2026-04-30", "pw", "inflow", 91, "Monthly leftover", "April saved allowance")
  ],
  historicalMonths: [
    hm("2026-01", "vewu", { incomeActual: 6243, autoLockedActual: 4858, savedAmount: 200, boxes: { groceries: 845, car407: 118, misc: 265 }, poolInflows: 2045, poolOutflows: 1743, poolEnding: 4107 }),
    hm("2026-02", "vewu", { incomeActual: 6243, autoLockedActual: 4858, savedAmount: 200, boxes: { groceries: 825, car407: 132, misc: 218 }, poolInflows: 0, poolOutflows: 3665, poolEnding: 442 }),
    hm("2026-03", "vewu", { incomeActual: 6243, autoLockedActual: 4858, savedAmount: 200, boxes: { groceries: 872, car407: 140, misc: 248 }, poolInflows: 10953, poolOutflows: 0, poolEnding: 11195 }),
    hm("2026-04", "vewu", { incomeActual: 6243, autoLockedActual: 4858, savedAmount: 200, boxes: { groceries: 612, car407: 162, misc: 213 }, poolInflows: 0, poolOutflows: 1220, poolEnding: 2560 }),
    hm("2026-01", "pw", { incomeActual: 600, autoLockedActual: 140, savedAmount: 0, boxes: { eatOut: 197, personal: 198 }, poolInflows: 0, poolOutflows: 0, poolEnding: 0 }),
    hm("2026-02", "pw", { incomeActual: 600, autoLockedActual: 140, savedAmount: 20, boxes: { eatOut: 155, personal: 92 }, poolInflows: 20, poolOutflows: 0, poolEnding: 20 }),
    hm("2026-03", "pw", { incomeActual: 600, autoLockedActual: 140, savedAmount: 0, boxes: { eatOut: 195, personal: 202 }, poolInflows: 0, poolOutflows: 0, poolEnding: 20 }),
    hm("2026-04", "pw", { incomeActual: 600, autoLockedActual: 140, savedAmount: 391, boxes: { eatOut: 179, personal: 100 }, poolInflows: 391, poolOutflows: 0, poolEnding: 411 })
  ],
  receivables: [
    { receivableId: "cecilia", debtor: "Cecilia", startingBalance: 7700, currentBalance: 7756, expectedPayment: 19, interestRate: 0, expectedPayoffMonth: "2030-12", status: "active", notes: "Monthly snapshot balance." },
    { receivableId: "noe", debtor: "Noe", startingBalance: 10896, currentBalance: 6728, expectedPayment: 1401, interestRate: 0, expectedPayoffMonth: "2026-08", status: "active", notes: "Default allocation: Cash Reserve when received." },
    { receivableId: "leonardo", debtor: "Leonardo", startingBalance: 60000, currentBalance: 60000, expectedPayment: 0, interestRate: 0, expectedPayoffMonth: "TBD", status: "active", notes: "Longer-term receivable." }
  ],
  receivablePayments: [],
  investmentSnapshots: [
    inv("2026-01-31", "Liquid Emergency", "Emergency", 10042, 0, 0),
    inv("2026-02-28", "Liquid Emergency", "Emergency", 8555, 0, 0),
    inv("2026-03-31", "Liquid Emergency", "Emergency", 10000, 0, 0),
    inv("2026-01-31", "Low Risk", "Low Risk", 45035, 0, 0),
    inv("2026-02-28", "Low Risk", "Low Risk", 45191, 0, 0),
    inv("2026-03-31", "Low Risk", "Low Risk", 45017, 0, 0),
    inv("2026-01-31", "VFV", "Equity", 562, 0, 0),
    inv("2026-02-28", "VFV", "Equity", 643, 0, 0),
    inv("2026-03-31", "VFV", "Equity", 712, 0, 0),
    inv("2026-01-31", "QQC", "Equity", 453, 0, 0),
    inv("2026-02-28", "QQC", "Equity", 539, 0, 0),
    inv("2026-03-31", "QQC", "Equity", 654, 0, 0)
  ],
  netWorthSnapshots: [
    { snapshotDate: "2026-03-31", cashPool: 11195, receivables: 75866, investments: 56383, homeEquity: 0, otherAssets: 0, mortgageBalance: 0, carLoanBalance: 0, otherLiabilities: 0, netWorth: 143444 }
  ],
  closedMonths: {}
};

let state = loadState();
const app = document.querySelector("#app");
const monthInput = document.querySelector("#monthInput");
const bottomNav = document.querySelector("#bottomNav");
const walletToggle = document.querySelector("#walletToggle");
const pageTitle = document.querySelector("#pageTitle");
const modalRoot = document.querySelector("#modalRoot");
let toastTimer;

init();

function t(date, wallet, amount, box, note, type = "spending", extra = {}) {
  return {
    transactionId: uid("txn"),
    wallet,
    date,
    month: date.slice(0, 7),
    amount,
    box,
    note,
    type,
    excludedFromBudget: false,
    ...extra
  };
}

function p(date, wallet, type, amount, sourceOrUse, note, extra = {}) {
  return {
    poolEntryId: uid("pool"),
    pool: wallet === "pw" ? "PW Saved Money Reserve" : "VEWU Cash Reserve",
    wallet,
    date,
    month: date.slice(0, 7),
    type,
    amount,
    sourceOrUse,
    note,
    linkedBox: "",
    linkedTransactionId: "",
    ...extra
  };
}

function hm(month, wallet, data) {
  return { month, wallet, closed: month !== APP_MONTH, ...data };
}

function inv(date, accountName, bucketType, marketValue, contribution, withdrawal, notes = "") {
  return { snapshotId: uid("snap"), date, accountName, bucketType, marketValue, contribution, withdrawal, notes };
}

function init() {
  bindGlobalEvents();
  renderChrome();
  render();
}

function bindGlobalEvents() {
  monthInput.addEventListener("change", () => {
    state.currentMonth = monthInput.value;
    save();
    renderChrome();
    render();
  });

  walletToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-wallet]");
    if (!button) return;
    state.activeWallet = button.dataset.wallet;
    save();
    renderChrome();
    render();
  });

  bottomNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    state.activeTab = button.dataset.tab;
    save();
    renderChrome();
    render();
  });
}

function renderChrome() {
  monthInput.value = state.currentMonth;
  walletToggle.classList.remove("single-wallet");
  walletToggle.innerHTML = Object.entries(wallets).map(([id, wallet]) => `
      <button class="wallet-button ${state.activeWallet === id ? "is-active" : ""}" type="button" data-wallet="${id}">
        ${escapeHtml(wallet.label)}
      </button>
    `).join("");

  const visibleTabs = tabs;
  bottomNav.style.gridTemplateColumns = `repeat(${visibleTabs.length}, 1fr)`;
  bottomNav.innerHTML = visibleTabs.map((tab) => `
    <button class="nav-item ${state.activeTab === tab.id ? "is-active" : ""}" type="button" data-tab="${tab.id}">
      ${escapeHtml(tab.label)}
    </button>
  `).join("");
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(demoState);
  try {
    const loaded = normalizeState(JSON.parse(saved));
    if (loaded.activeTab === "today" || loaded.activeTab === "month") loaded.activeTab = "overview";
    if (loaded.activeTab === "boxes" || loaded.activeTab === "pool") loaded.activeTab = "overview";
    if (loaded.activeTab === "assets" || loaded.activeTab === "year" || loaded.activeTab === "analysis") loaded.activeTab = "reports";
    if (loaded.activeTab === "plan" || loaded.activeTab === "close" || loaded.activeTab === "more") loaded.activeTab = "settings";
    if (!tabs.some((tab) => tab.id === loaded.activeTab)) loaded.activeTab = "overview";
    loaded.manageSettings = Boolean(loaded.manageSettings);
    loaded.manageReports = Boolean(loaded.manageReports);
    loaded.settingsSection ||= "plan";
    loaded.activeReport ||= "dashboard";
    loaded.appVersion = APP_VERSION;
    return loaded;
  } catch {
    return structuredClone(demoState);
  }
}

function normalizeState(next) {
  const merged = {
    ...structuredClone(demoState),
    ...next,
    yearPlanVersions: Array.isArray(next.yearPlanVersions) ? next.yearPlanVersions : demoState.yearPlanVersions,
    monthlyOverrides: next.monthlyOverrides || {},
    transactions: Array.isArray(next.transactions) ? next.transactions : demoState.transactions,
    poolEntries: Array.isArray(next.poolEntries) ? next.poolEntries : demoState.poolEntries,
    historicalMonths: Array.isArray(next.historicalMonths) ? next.historicalMonths : demoState.historicalMonths,
    debtPlans: Array.isArray(next.debtPlans) ? next.debtPlans : demoState.debtPlans
  };
  migrateState(merged);
  return merged;
}

function migrateState(next) {
  next.appVersion = APP_VERSION;
  next.manageSettings = Boolean(next.manageSettings);
  next.manageReports = Boolean(next.manageReports);
  next.settingsSection ||= "plan";
  next.activeReport ||= "dashboard";
  next.yearPlanVersions.forEach((version) => {
    const vewu = version.plan?.vewu;
    const pw = version.plan?.pw;
    if (vewu) {
      vewu.pool.name = "Cash Reserve";
      if (vewu.incomeDefaults?.length === 1 && vewu.incomeDefaults[0]?.id === "income" && Number(vewu.incomeDefaults[0].amount) === 6243) {
        vewu.incomeDefaults = [
          { id: "pwSalary", name: "PW Salary", amount: 5443 },
          { id: "mvContribution", name: "MV Contribution", amount: 100 },
          { id: "leoDebt", name: "Leo's Debt Payment", amount: 700 }
        ];
      }
      if (vewu.boxes?.groceries) vewu.boxes.groceries.name = "Food & Groceries";
      if (vewu.boxes?.car407) vewu.boxes.car407.name = "Car Energy & Tolls";
      if (vewu.boxes?.misc) vewu.boxes.misc.name = "Household Misc";
    }
    if (pw) {
      pw.pool.name = "Saved Money Reserve";
      if (pw.boxes?.eatOut) pw.boxes.eatOut.name = "Food & RTO";
      if (pw.boxes?.personal) pw.boxes.personal.name = "Personal Spending";
    }
    Object.entries(version.plan || {}).forEach(([walletId, plan]) => {
      Object.entries(plan.boxes || {}).forEach(([boxId, box]) => {
        boxMeta[boxId] = { wallet: walletId, name: box.name };
      });
    });
  });
  next.debtPlans.forEach((item) => {
    item.interestRate = Number(item.interestRate) || 0;
  });
  next.receivables.forEach((item) => {
    item.interestRate = Number(item.interestRate) || 0;
  });
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  pageTitle.textContent = tabs.find((tab) => tab.id === state.activeTab)?.label || "Overview";
  const routes = {
    overview: renderOverview,
    month: renderOverview,
    today: renderOverview,
    review: renderReview,
    reports: renderReports,
    settings: renderSettings
  };
  app.innerHTML = (routes[state.activeTab] || renderOverview)();
  bindPage();
}

function bindPage() {
  document.querySelector("#addForm")?.addEventListener("submit", addTransaction);
  document.querySelector("#quickAddButton")?.addEventListener("click", openAddEntryModal);
  document.querySelector("#boxSelect")?.addEventListener("change", updateRefundControls);
  document.querySelector("#typeSelect")?.addEventListener("change", updateRefundControls);
  document.querySelector("#refundTarget")?.addEventListener("change", updateRefundControls);
  document.querySelector("#advancedTypeSelect")?.addEventListener("change", (event) => {
    const value = event.target.value;
    const select = document.querySelector("#boxSelect");
    if (select) select.value = value;
    document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("is-active", chip.dataset.categoryValue === value));
    updateRefundControls();
  });
  document.querySelectorAll(".category-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const select = document.querySelector("#boxSelect");
      const advanced = document.querySelector("#advancedTypeSelect");
      if (select) select.value = button.dataset.categoryValue;
      if (advanced) advanced.value = button.dataset.categoryValue;
      document.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
      updateRefundControls();
    });
  });

  document.querySelectorAll("[data-settings-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.settingsSection = button.dataset.settingsSection;
      save();
      render();
    });
  });

  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeReport = button.dataset.report;
      save();
      render();
    });
  });

  document.querySelector("#manageSettingsButton")?.addEventListener("click", () => {
    state.manageSettings = !state.manageSettings;
    save();
    render();
  });

  document.querySelector("#manageReportsButton")?.addEventListener("click", () => {
    state.manageReports = !state.manageReports;
    save();
    render();
  });

  document.querySelectorAll("[data-view-box]").forEach((button) => {
    button.addEventListener("click", () => openCategoryDetail(button.dataset.viewBox));
  });

  document.querySelectorAll("[data-set-box]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedBox = button.dataset.setBox;
      save();
      render();
    });
  });

  document.querySelectorAll("[data-delete-txn]").forEach((button) => {
    button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTxn));
  });

  document.querySelectorAll("[data-edit-txn]").forEach((button) => {
    button.addEventListener("click", () => editTransaction(button.dataset.editTxn));
  });

  document.querySelectorAll("[data-current-override]").forEach((input) => {
    input.addEventListener("change", () => setCurrentOverride(input.dataset.currentOverride, Number(input.value)));
  });

  document.querySelectorAll("[data-year-plan]").forEach((input) => {
    input.addEventListener("change", () => setFutureYearPlan(input.dataset.yearPlan, Number(input.value)));
  });

  document.querySelector("#investmentForm")?.addEventListener("submit", addInvestmentSnapshot);
  document.querySelectorAll("[data-edit-investment]").forEach((button) => {
    button.addEventListener("click", () => editInvestmentSnapshot(button.dataset.editInvestment));
  });
  document.querySelector("#receivableForm")?.addEventListener("submit", addReceivable);
  document.querySelectorAll("[data-edit-receivable]").forEach((button) => {
    button.addEventListener("click", () => editReceivable(button.dataset.editReceivable));
  });
  document.querySelectorAll("[data-edit-debt]").forEach((button) => {
    button.addEventListener("click", () => editDebtPlan(button.dataset.editDebt));
  });
  document.querySelectorAll("[data-delete-debt]").forEach((button) => {
    button.addEventListener("click", () => deleteDebtPlan(button.dataset.deleteDebt));
  });
  document.querySelector("#debtForm")?.addEventListener("submit", addDebtPlan);
  document.querySelector("#planItemForm")?.addEventListener("submit", addPlanItem);
  document.querySelector("#openPlanItemButton")?.addEventListener("click", openPlanItemModal);
  document.querySelectorAll("[data-edit-plan]").forEach((button) => {
    button.addEventListener("click", () => editPlanItem(button.dataset.editPlan));
  });
  document.querySelectorAll("[data-delete-plan]").forEach((button) => {
    button.addEventListener("click", () => deletePlanItem(button.dataset.deletePlan));
  });

  document.querySelector("#exportButton")?.addEventListener("click", exportCsv);
  document.querySelector("#importCsvInput")?.addEventListener("change", importCsv);
  document.querySelector("#exportJsonButton")?.addEventListener("click", exportJson);
  document.querySelector("#importJsonInput")?.addEventListener("change", importJson);
  document.querySelector("#resetButton")?.addEventListener("click", resetDemo);
  document.querySelector("#closeWalletButton")?.addEventListener("click", () => closeWalletMonth(state.activeWallet));
  document.querySelector("#reopenWalletButton")?.addEventListener("click", () => reopenWalletMonth(state.activeWallet));
}

function renderOverview() {
  const wallet = state.activeWallet;
  const dashboard = getDashboard(wallet);
  const warnings = getWarnings(wallet).slice(0, 3);
  const boxes = getBoxes(wallet);
  const status = getMonthStatus(dashboard);

  return `
    <section class="hero overview-hero">
      <div class="hero-main">
        <p class="eyebrow">${formatMonthLabel(state.currentMonth)} · ${escapeHtml(wallets[wallet].label)}</p>
        <div class="hero-number">${money(dashboard.monthRemaining)}</div>
        <p class="hero-sub">${money(dashboard.dailySafeSpend)} / day available</p>
        <div class="hero-pills">
          <span class="status-pill ${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>
          <span>Projected ${money(dashboard.projectedMonthEnd)}</span>
        </div>
      </div>
      <div class="hero-strip">
        <div class="strip-item"><span>Reserve</span><strong>${money(dashboard.pool.available)}</strong></div>
        <div class="strip-item"><span>Uncovered</span><strong class="${dashboard.pool.unfundedOverspend ? "risk-text" : ""}">${money(dashboard.pool.unfundedOverspend)}</strong></div>
        <div class="strip-item"><span>Categories</span><strong>${boxes.length}</strong></div>
      </div>
    </section>

    <section class="card compact-card">
      <div class="section-head">
        <div><h2>Watch These</h2></div>
      </div>
      <div class="warning-list compact-list">
        ${warnings.length ? warnings.map(renderWarning).join("") : `<div class="warning-item good"><span><strong>On track</strong></span><strong>Good</strong></div>`}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div><h2>Category Progress</h2></div>
      </div>
      <div class="box-grid overview-categories">
        ${boxes.length ? boxes.map(renderOverviewCategoryCard).join("") : renderEmptyState("No spending categories yet.", "Add categories in Settings.")}
      </div>
    </section>

    <button id="quickAddButton" class="fab-button" type="button" aria-label="Add entry">+</button>
  `;
}

function renderReview() {
  const wallet = state.activeWallet;
  const dashboard = getDashboard(wallet);
  const weekly = getWeeklyStats(wallet);
  const boxes = getBoxes(wallet).slice().sort((a, b) => b.paceRatio - a.paceRatio);
  const recommendations = getRecommendations(wallet);

  return `
    <section class="hero review-hero">
      <div class="hero-main">
        <p class="eyebrow">This Week · ${escapeHtml(wallets[wallet].label)}</p>
        <div class="hero-number">${money(weekly.thisWeekSpend)}</div>
        <p class="hero-sub">${money(weekly.last7Average)} / day recently · ${weekly.last7Average > dashboard.dailySafeSpend ? "above" : "under"} safe pace</p>
      </div>
      <div class="hero-strip">
        <div class="strip-item"><span>Safe Daily</span><strong>${money(dashboard.dailySafeSpend)}</strong></div>
        <div class="strip-item"><span>Last 7 Days</span><strong>${money(weekly.last7Spend)}</strong></div>
        <div class="strip-item"><span>Status</span><strong>${weekly.last7Average > dashboard.dailySafeSpend ? "Review" : "OK"}</strong></div>
      </div>
    </section>

    <section class="desktop-grid">
      <div class="card">
        <div class="section-head"><div><h2>Fastest Categories</h2></div></div>
        <div class="warning-list compact-list">
          ${boxes.slice(0, 3).map((box) => `<div class="warning-item ${box.status}"><span><strong>${escapeHtml(box.name)}</strong><br><span class="muted">${paceText(box)} · ${money(box.visibleRemaining)} left</span></span><strong>${escapeHtml(getBoxStatusLabel(box).label)}</strong></div>`).join("")}
        </div>
      </div>
      <div class="card">
        <div class="section-head"><div><h2>Last 7 Days</h2></div></div>
        ${renderDailySpendChart(weekly.dailyRows)}
      </div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Budget Suggestions</h2></div></div>
      <div class="recommendation-list">
        ${recommendations.length ? recommendations.map((item) => `<div class="recommendation-item">${escapeHtml(item)}</div>`).join("") : renderEmptyState("No budget changes suggested.", "Current category budgets look reasonable.")}
      </div>
    </section>
  `;
}

function renderReports() {
  const wallet = state.activeWallet;
  const reportTabs = wallet === "vewu"
    ? [["dashboard", "Dashboard"], ["year", "Year"], ["networth", "Net Worth"], ["receivables", "Receivables"], ["investments", "Investments"]]
    : [["dashboard", "Dashboard"], ["year", "Year"], ["saved", "Saved Reserve"]];
  const active = reportTabs.some(([id]) => id === state.activeReport) ? state.activeReport : "dashboard";
  state.activeReport = active;

  return `
    <section class="card">
      <div class="section-head">
        <div><h2>Reports</h2></div>
        ${wallet === "vewu" ? `<button id="manageReportsButton" class="ghost-button section-action" type="button">${state.manageReports ? "Done" : "Manage"}</button>` : ""}
      </div>
      <div class="segmented report-switch">
        ${reportTabs.map(([id, label]) => `<button class="segmented-button ${active === id ? "is-active" : ""}" type="button" data-report="${id}">${escapeHtml(label)}</button>`).join("")}
      </div>
    </section>
    ${renderReportPanel(active, wallet)}
  `;
}

function renderSettings() {
  const sections = [["plan", "Budget"], ["reserve", "Reserve"], ["close", "Month End"], ["data", "Data"], ["danger", "Danger"]];
  const active = sections.some(([id]) => id === state.settingsSection) ? state.settingsSection : "plan";
  state.settingsSection = active;
  return `
    <section class="card">
      <div class="section-head">
        <div><h2>Settings</h2></div>
        <button id="manageSettingsButton" class="ghost-button section-action" type="button">${state.manageSettings ? "Done" : "Manage"}</button>
      </div>
      <div class="segmented settings-switch">
        ${sections.map(([id, label]) => `<button class="segmented-button ${active === id ? "is-active" : ""}" type="button" data-settings-section="${id}">${escapeHtml(label)}</button>`).join("")}
      </div>
    </section>
    ${renderSettingsPanel(active)}
  `;
}

function renderReportPanel(active, wallet) {
  if (active === "year") return renderYear();
  if (wallet === "pw") return renderSavedReserveReport(wallet);
  if (active === "receivables") return renderReceivableReport();
  if (active === "investments") return renderInvestmentReport();
  if (active === "networth") return renderNetWorthReport();
  return renderAssetDashboard();
}

function renderSettingsPanel(active) {
  if (active === "reserve") return renderReserveSettings();
  if (active === "close") return renderMonthClose();
  if (active === "data") return renderDataSettings();
  if (active === "danger") return renderDangerSettings();
  return renderPlan();
}

function renderAssetDashboard() {
  if (state.activeWallet === "pw") return renderSavedReserveReport("pw");
  const receivables = state.receivables.reduce((acc, item) => acc + Number(item.currentBalance || 0), 0);
  const latestInvestments = getLatestInvestments();
  const investments = latestInvestments.reduce((acc, item) => acc + item.marketValue, 0);
  const pool = getDashboard("vewu").pool.available;
  const latestNetWorth = state.netWorthSnapshots[state.netWorthSnapshots.length - 1];
  const computedNetWorth = pool + receivables + investments + (latestNetWorth?.homeEquity || 0) + (latestNetWorth?.otherAssets || 0) - (latestNetWorth?.mortgageBalance || 0) - (latestNetWorth?.carLoanBalance || 0) - (latestNetWorth?.otherLiabilities || 0);
  return `
    <section class="card">
      <div class="section-head"><div><h2>Financial Position</h2></div></div>
      <div class="asset-grid">
        <article class="metric-card olive"><span>Cash Reserve</span><strong>${money(pool)}</strong></article>
        <article class="metric-card blue"><span>Receivables</span><strong>${money(receivables)}</strong></article>
        <article class="metric-card sage"><span>Investments</span><strong>${money(investments)}</strong></article>
        <article class="metric-card grey"><span>Net Worth Estimate</span><strong>${money(computedNetWorth)}</strong></article>
      </div>
    </section>
    ${renderYear()}
  `;
}

function renderReceivableReport() {
  return `<section class="card">${renderReceivableTracker()}</section>`;
}

function renderInvestmentReport() {
  return `<section class="card">${renderInvestmentTracker()}</section>`;
}

function renderNetWorthReport() {
  return renderAssetDashboard();
}

function renderSavedReserveReport(wallet) {
  const rows = getPoolMonthSummaries(wallet);
  return `
    <section class="card">
      <div class="section-head"><div><h2>Saved Reserve Trend</h2></div></div>
      ${renderBarChart(`${wallets[wallet].reserveLabel}`, "Ending balance", rows.map((item) => item.month.slice(5)), rows.map((item) => item.ending), "olive")}
    </section>
  `;
}

function renderReceivableTracker() {
  const receivables = state.receivables.reduce((acc, item) => acc + Number(item.currentBalance || 0), 0);
  const manage = Boolean(state.manageReports);
  return `
    <div class="section-head">
      <div><h2>Receivables</h2><p>Total ${money(receivables)}</p></div>
    </div>
    <div class="asset-list">
      ${state.receivables.map((item) => `
        <div class="asset-row">
          <span><strong>${escapeHtml(item.debtor)}</strong><br><span class="muted">${escapeHtml(item.status)} · expected ${money(item.expectedPayment)} · ${escapeHtml(getPayoffLabel(item.currentBalance, item.expectedPayment, item.interestRate, item.expectedPayoffMonth))}</span></span>
          <span><strong>${money(item.currentBalance)}</strong>${manage ? `<br><button class="mini-button" type="button" data-edit-receivable="${item.receivableId}">Edit</button>` : ""}</span>
        </div>
      `).join("")}
    </div>
    ${manage ? `<form id="receivableForm" class="tracker-form">
      <h3>Add / Track Receivable</h3>
      <div class="asset-edit-grid">
        <label class="field"><span>Debtor</span><input id="receivableDebtor" required /></label>
        <label class="field"><span>Current Balance</span><input id="receivableBalance" type="number" step="0.01" required /></label>
        <label class="field"><span>Expected Payment</span><input id="receivableExpected" type="number" step="0.01" value="0" /></label>
        <label class="field"><span>Interest Rate %</span><input id="receivableInterest" type="number" step="0.01" value="0" /></label>
        <label class="field"><span>Status</span><select id="receivableStatus"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option><option value="paid-off">Paid Off</option></select></label>
        <label class="field"><span>Notes</span><input id="receivableNotes" /></label>
      </div>
      <button class="primary-button" type="submit">Save Receivable</button>
    </form>` : ""}
  `;
}

function renderInvestmentTracker() {
  const latestInvestments = getLatestInvestments();
  const investments = latestInvestments.reduce((acc, item) => acc + item.marketValue, 0);
  const manage = Boolean(state.manageReports);
  return `
    <div class="section-head">
      <div><h2>Investments</h2><p>Total ${money(investments)}</p></div>
    </div>
    ${renderInvestmentVisualizer(latestInvestments)}
    <div class="asset-list" style="margin-top: 12px;">
      ${latestInvestments.map((item) => `
        <div class="asset-row">
          <span><strong>${escapeHtml(item.accountName)}</strong><br><span class="muted">${escapeHtml(item.bucketType)} · ${escapeHtml(item.date)}</span></span>
          <span><strong>${money(item.marketValue)}</strong>${manage ? `<br><button class="mini-button" type="button" data-edit-investment="${item.snapshotId}">Edit</button>` : ""}</span>
        </div>
      `).join("")}
    </div>
    ${manage ? `<form id="investmentForm" class="tracker-form">
      <h3>Add Investment Snapshot</h3>
      <div class="asset-edit-grid">
        <label class="field"><span>Date</span><input id="investmentDate" type="date" value="${state.currentMonth}-28" required /></label>
        <label class="field"><span>Account / Bucket</span><input id="investmentAccount" placeholder="VFV, QQC..." required /></label>
        <label class="field"><span>Bucket Type</span><select id="investmentType"><option>Emergency</option><option>Low Risk</option><option>Equity</option><option>Other</option></select></label>
        <label class="field"><span>Market Value</span><input id="investmentValue" type="number" step="0.01" required /></label>
        <label class="field"><span>Contribution</span><input id="investmentContribution" type="number" step="0.01" value="0" /></label>
        <label class="field"><span>Withdrawal</span><input id="investmentWithdrawal" type="number" step="0.01" value="0" /></label>
        <label class="field"><span>Notes</span><input id="investmentNotes" /></label>
      </div>
      <button class="primary-button" type="submit">Save Snapshot</button>
    </form>` : ""}
  `;
}

function renderReserveSettings() {
  return `
    ${renderPool()}
  `;
}

function renderDataSettings() {
  return `
    <section class="card">
      <div class="section-head"><div><h2>Data Backup</h2><p>Export regularly. Safari website data can be cleared by iOS.</p></div></div>
      <div class="action-row">
        <button id="exportJsonButton" class="primary-button" type="button">Export JSON</button>
        <label class="ghost-button">Import JSON<input id="importJsonInput" class="hidden" type="file" accept=".json,application/json" /></label>
      </div>
      <div class="action-row" style="margin-top: 10px;">
        <button id="exportButton" class="ghost-button" type="button">Export CSV</button>
        <label class="ghost-button">Import CSV<input id="importCsvInput" class="hidden" type="file" accept=".csv,text/csv" /></label>
      </div>
    </section>
  `;
}

function renderDangerSettings() {
  return `
    <section class="card danger-zone">
      <div class="section-head"><div><h2>Danger Zone</h2><p>These actions change saved local data.</p></div></div>
      <div class="action-row">
        <button id="reopenWalletButton" class="ghost-button" type="button">Reopen Current Month</button>
        <button id="resetButton" class="danger-button" type="button">Reset Demo Data</button>
      </div>
    </section>
  `;
}

function renderAdd() {
  return `
    <section class="form-card">
      <div class="section-head">
        <div><h2>Add ${escapeHtml(wallets[state.activeWallet].label)} Entry</h2><p>No payment method. No card repayment. Choose the real spending box.</p></div>
      </div>
      ${renderAddEntryForm(state.activeWallet)}
    </section>
  `;
}

function renderAddEntryForm(wallet) {
  const plan = getPlan(state.currentMonth, wallet);
  const closed = isClosed(state.currentMonth, wallet);
  const dailyOptions = Object.entries(plan.boxes).map(([id, box]) => [`spending:${id}`, box.name]);
  const firstOption = dailyOptions[0]?.[0] || "refund:refund";
  const optionGroups = wallet === "vewu"
    ? [
        { label: "Daily Spend", options: dailyOptions },
        { label: "Cash Reserve Entries", options: [["pool_spend:pool", "Paid From Reserve"], ["pool_inflow:pool", "Reserve Inflow"], ["refund:refund", "Refund"]] }
      ]
    : [
        { label: "Daily Spend", options: dailyOptions },
        { label: "Saved Reserve Entries", options: [["pool_inflow:pool", "Saved Reserve Inflow"], ["pool_spend:pool", "Paid From Saved Reserve"], ["refund:refund", "Refund"]] }
      ];

  return `
      ${closed ? `<div class="warning-item risk"><span><strong>This month is closed.</strong></span><strong>Locked</strong></div>` : ""}
      <form id="addForm" class="form-card">
        <label class="field">
          <span>Amount</span>
          <input class="amount-input" id="amountInput" type="number" inputmode="decimal" min="0" step="0.01" required ${closed ? "disabled" : ""} />
        </label>
        <label class="field">
          <span>Category</span>
          <div class="chip-grid category-chip-grid">
            ${dailyOptions.map(([value, label], index) => `<button class="chip category-chip ${index === 0 ? "is-active" : ""}" type="button" data-category-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`).join("")}
          </div>
          <select id="boxSelect" class="hidden" ${closed ? "disabled" : ""}>
            ${dailyOptions.map(([value, label]) => `<option value="${value}" ${value === firstOption ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
            ${optionGroups.slice(1).flatMap((group) => group.options).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Note</span>
          <textarea id="noteInput" rows="2" placeholder="Costco, RTO lunch, refund..." ${closed ? "disabled" : ""}></textarea>
        </label>
        <label class="field">
          <span>Date</span>
          <input id="dateInput" type="date" value="${defaultDate()}" required ${closed ? "disabled" : ""} />
        </label>
        <details class="advanced-entry">
          <summary>Advanced</summary>
          <label class="field">
            <span>Entry type</span>
            <select id="advancedTypeSelect" ${closed ? "disabled" : ""}>
              <option value="${escapeHtml(firstOption)}">Regular spending</option>
              ${optionGroups.map((group) => `
                <optgroup label="${escapeHtml(group.label)}">
                  ${group.options.map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("")}
                </optgroup>
              `).join("")}
            </select>
          </label>
        </details>
        <div id="refundControls" class="split-grid hidden">
          <label class="field">
            <span>Refund applies to</span>
            <select id="refundTarget">
              <option value="pool">Reserve</option>
              <option value="box">Offset a box</option>
            </select>
          </label>
          <label class="field">
            <span>Offset box</span>
            <select id="refundBox">
              ${Object.entries(plan.boxes).map(([id, box]) => `<option value="${id}">${escapeHtml(box.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <button class="primary-button" type="submit" ${closed ? "disabled" : ""}>Add Entry</button>
      </form>
  `;
}

function renderBoxes() {
  const wallet = state.activeWallet;
  const boxes = getBoxes(wallet);
  const selected = state.selectedBox || boxes[0]?.boxId || "";
  const transactions = getBoxTransactions(wallet, selected);
  const box = boxes.find((item) => item.boxId === selected);

  return `
    <section class="card">
      <div class="section-head">
        <div><h2>Daily Spending Boxes</h2><p>Only boxes you manually record. Fixed bills, debt, and assets stay out of this view.</p></div>
      </div>
      <div class="box-grid">
        ${boxes.map((item) => `<button class="box-card ${selected === item.boxId ? "sage is-selected" : ""}" type="button" data-set-box="${item.boxId}">${renderBoxCardInner(item)}</button>`).join("")}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div><h2>${escapeHtml(box?.name || "Box")} Details</h2><p>Review, edit, or delete manual entries.</p></div>
      </div>
      ${box ? renderBoxDetail(box) : ""}
      <div class="transaction-list" style="margin-top: 12px;">
        ${transactions.length ? transactions.map(renderTransaction).join("") : `<div class="transaction-item"><span>No entries yet.</span><strong>$0</strong></div>`}
      </div>
    </section>
  `;
}

function renderPool() {
  const wallet = state.activeWallet;
  const dashboard = getDashboard(wallet);
  const entries = getPoolEntries(wallet);
  const monthly = getPoolMonthSummaries(wallet);

  return `
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">${escapeHtml(wallets[wallet].reserveLabel)}</p>
        <div class="hero-number">${money(dashboard.pool.available)}</div>
        <p class="hero-sub">Available after ${money(dashboard.pool.committed)} already used or committed this month</p>
      </div>
      <div class="hero-strip">
        <div class="strip-item"><span>Starting</span><strong>${money(dashboard.pool.startingBalance)}</strong></div>
        <div class="strip-item"><span>Inflows</span><strong>${money(dashboard.pool.inflows)}</strong></div>
        <div class="strip-item"><span>Already Used</span><strong>${money(dashboard.pool.committed)}</strong></div>
      </div>
    </section>

    <section class="metric-grid">
      <article class="metric-card olive"><span>Reserve Available</span><strong>${money(dashboard.pool.available)}</strong><p>Flexibility left after spending and overage coverage.</p></article>
      <article class="metric-card blue"><span>Paid From Reserve</span><strong>${money(dashboard.pool.outflows)}</strong><p>Big spend and one-off reserve use.</p></article>
      <article class="metric-card amber"><span>Covered Overages</span><strong>${money(dashboard.pool.overageCoverage)}</strong><p>Box overages absorbed by reserve.</p></article>
      <article class="metric-card ${dashboard.pool.unfundedOverspend ? "terra" : "sage"}"><span>Overspend Not Covered</span><strong>${money(dashboard.pool.unfundedOverspend)}</strong><p>Only appears when reserve cannot cover overages.</p></article>
    </section>

    <section class="desktop-grid">
      <div class="card">
        <div class="section-head"><div><h2>This Month Reserve Entries</h2><p>Reserve spending, inflows, and direct adjustments.</p></div></div>
        <div class="pool-list">${entries.map(renderPoolEntry).join("") || `<div class="pool-item"><span>No reserve entries this month.</span><strong>$0</strong></div>`}</div>
      </div>
      <div class="card">
        <div class="section-head"><div><h2>Month Summaries</h2><p>Reserve resilience by month.</p></div></div>
        <div class="pool-list">${monthly.map((item) => `<div class="pool-item"><span>${escapeHtml(item.month)}<br><span class="muted">In ${money(item.inflow)} · Out ${money(item.outflow)} · Coverage ${money(item.coverage)}</span></span><strong>${money(item.ending)}</strong></div>`).join("")}</div>
      </div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Reserve Health</h2><p>How much flexibility remains after direct spending and covered overages.</p></div></div>
      ${renderReserveAnalysis(wallet)}
    </section>
  `;
}

function renderYear() {
  const wallet = state.activeWallet;
  const months = getRecentActualMonths(wallet, 12);
  return `
    <section class="hero">
      <div class="hero-main">
        <p class="eyebrow">${escapeHtml(wallets[wallet].label)} Year Review</p>
        <div class="hero-number">${money(months.at(-1)?.poolEnding || 0)}</div>
        <p class="hero-sub">Latest ${escapeHtml(wallets[wallet].reserveLabel)} ending balance · month-over-month review</p>
      </div>
      <div class="hero-strip">
        <div class="strip-item"><span>Months</span><strong>${months.length}</strong></div>
        <div class="strip-item"><span>Avg Box Spend</span><strong>${money(average(months.map((item) => Object.values(item.boxes || {}).reduce((acc, value) => acc + value, 0))))}</strong></div>
        <div class="strip-item"><span>Avg Saved</span><strong>${money(average(months.map((item) => item.savedAmount || 0)))}</strong></div>
      </div>
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Month-Over-Month Review</h2><p>Longer-term patterns stay here, separate from current-month decisions.</p></div></div>
      ${renderYearBreakdown(wallet)}
    </section>
  `;
}

function renderAnalysis() {
  return `
    ${renderYear()}
    ${renderAssets()}
  `;
}

function renderAssets() {
  if (state.activeWallet === "pw") {
    return `<section class="card"><h2>PW Asset Tracking Is Off</h2><p class="muted" style="margin-top: 8px;">PW is a personal allowance tracker only. The analysis above focuses on saved reserve and spending trends.</p></section>`;
  }

  const receivables = state.receivables.reduce((acc, item) => acc + Number(item.currentBalance || 0), 0);
  const latestInvestments = getLatestInvestments();
  const investments = latestInvestments.reduce((acc, item) => acc + item.marketValue, 0);
  const pool = getDashboard("vewu").pool.available;
  const latestNetWorth = state.netWorthSnapshots[state.netWorthSnapshots.length - 1];
  const computedNetWorth = pool + receivables + investments + (latestNetWorth?.homeEquity || 0) + (latestNetWorth?.otherAssets || 0) - (latestNetWorth?.mortgageBalance || 0) - (latestNetWorth?.carLoanBalance || 0) - (latestNetWorth?.otherLiabilities || 0);
  const editMode = Boolean(state.manageReports);

  return `
    <section class="card">
      <div class="section-head"><div><h2>Asset Dashboard</h2><p>Assets are analysis-only. They do not increase monthly spending capacity.</p></div></div>
      <div class="asset-grid">
        <article class="metric-card olive"><span>Cash Reserve</span><strong>${money(pool)}</strong><p>Only this affects budget flexibility.</p></article>
        <article class="metric-card blue"><span>Receivables</span><strong>${money(receivables)}</strong><p>Tracked separately until received.</p></article>
        <article class="metric-card sage"><span>Investments</span><strong>${money(investments)}</strong><p>Latest saved snapshots.</p></article>
        <article class="metric-card grey"><span>Net Worth Estimate</span><strong>${money(computedNetWorth)}</strong><p>Independent from monthly spendable money.</p></article>
      </div>
    </section>

    <section class="desktop-grid">
      <div class="card">
        <div class="section-head">
          <div><h2>Receivable Tracker</h2><p>Total ${money(receivables)} · independent from budget plan.</p></div>
        </div>
        <div class="asset-list">
          ${state.receivables.map((item) => `
            <div class="asset-row">
              <span><strong>${escapeHtml(item.debtor)}</strong><br><span class="muted">${escapeHtml(item.status)} · expected ${money(item.expectedPayment)} · ${escapeHtml(getPayoffLabel(item.currentBalance, item.expectedPayment, item.interestRate, item.expectedPayoffMonth))}</span></span>
              <span><strong>${money(item.currentBalance)}</strong>${editMode ? `<br><button class="mini-button" type="button" data-edit-receivable="${item.receivableId}">Edit</button>` : ""}</span>
            </div>
          `).join("")}
        </div>
        ${editMode ? `<form id="receivableForm" class="tracker-form">
          <h3>Add / Track Receivable</h3>
          <div class="asset-edit-grid">
            <label class="field"><span>Debtor</span><input id="receivableDebtor" required /></label>
            <label class="field"><span>Current Balance</span><input id="receivableBalance" type="number" step="0.01" required /></label>
            <label class="field"><span>Expected Payment</span><input id="receivableExpected" type="number" step="0.01" value="0" /></label>
            <label class="field"><span>Interest Rate %</span><input id="receivableInterest" type="number" step="0.01" value="0" /></label>
            <label class="field"><span>Status</span><select id="receivableStatus"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option><option value="paid-off">Paid Off</option></select></label>
            <label class="field"><span>Notes</span><input id="receivableNotes" /></label>
          </div>
          <button class="primary-button" type="submit">Save Receivable</button>
        </form>` : ""}
      </div>
      <div class="card">
        <div class="section-head">
          <div><h2>Investment Tracker</h2><p>Total ${money(investments)} · snapshots, not portfolio trading.</p></div>
        </div>
        ${renderInvestmentVisualizer(latestInvestments)}
        <div class="asset-list" style="margin-top: 12px;">
          ${latestInvestments.map((item) => `
            <div class="asset-row">
              <span><strong>${escapeHtml(item.accountName)}</strong><br><span class="muted">${escapeHtml(item.bucketType)} · ${escapeHtml(item.date)} · contribution ${money(item.contribution)} · withdrawal ${money(item.withdrawal)}</span></span>
              <span><strong>${money(item.marketValue)}</strong>${editMode ? `<br><button class="mini-button" type="button" data-edit-investment="${item.snapshotId}">Edit</button>` : ""}</span>
            </div>
          `).join("")}
        </div>
        ${editMode ? `<form id="investmentForm" class="tracker-form">
          <h3>Add Investment Snapshot</h3>
          <div class="asset-edit-grid">
            <label class="field"><span>Date</span><input id="investmentDate" type="date" value="${state.currentMonth}-28" required /></label>
            <label class="field"><span>Account / Bucket</span><input id="investmentAccount" placeholder="VFV, QQC..." required /></label>
            <label class="field"><span>Bucket Type</span><select id="investmentType"><option>Emergency</option><option>Low Risk</option><option>Equity</option><option>Other</option></select></label>
            <label class="field"><span>Market Value</span><input id="investmentValue" type="number" step="0.01" required /></label>
            <label class="field"><span>Contribution</span><input id="investmentContribution" type="number" step="0.01" value="0" /></label>
            <label class="field"><span>Withdrawal</span><input id="investmentWithdrawal" type="number" step="0.01" value="0" /></label>
            <label class="field"><span>Notes</span><input id="investmentNotes" /></label>
          </div>
          <button class="primary-button" type="submit">Save Snapshot</button>
        </form>` : ""}
      </div>
    </section>
  `;
}

function renderPlan() {
  const wallet = state.activeWallet;
  const plan = getPlan(state.currentMonth, wallet);
  const base = getEditableYearPlan(wallet);
  const closed = isClosed(state.currentMonth, wallet);
  const manage = Boolean(state.manageSettings);

  return `
    <section class="card">
      <div class="section-head">
        <div><h2>Monthly Plan</h2><p>${manage ? "Changes apply from next month forward. Closed months are never overwritten." : "Turn on Manage to change names, categories, or amounts."}</p></div>
      </div>
      <div class="plan-section">
        ${renderPlanInputs(base, "year")}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div><h2>This Month Changes</h2><p>${closed ? "This month is closed. Reopen before editing." : manage ? "Only changes this month; next month returns to the monthly plan." : "Current month view."}</p></div>
      </div>
      <div class="plan-section">
        ${renderPlanInputs(plan, "current", closed)}
      </div>
    </section>

    ${manage ? `<section class="card">
      <div class="section-head">
        <div><h2>Add or Change Plan Items</h2><p>Add income, fixed bills, debt payments, spending boxes, or planned saving.</p></div>
      </div>
      <div class="action-row">
        <button id="openPlanItemButton" class="primary-button" type="button" ${closed ? "disabled" : ""}>Add Plan Item</button>
      </div>
    </section>` : ""}

    <section class="card">
      <div class="section-head"><div><h2>Debt Payments</h2><p>Debt payments are locked plan items with payoff tracking. Edit, pause, or archive when done.</p></div></div>
      <div class="asset-list">
        ${state.debtPlans.filter((item) => item.wallet === wallet).map((item) => `
          <div class="asset-row">
            <span><strong>${escapeHtml(item.name)}</strong><br><span class="muted">${escapeHtml(item.status)} · balance ${money(item.currentBalance)} · monthly ${money(item.monthlyPayment)} · ${escapeHtml(getPayoffLabel(item.currentBalance, item.monthlyPayment, item.interestRate))}</span></span>
            <span>${manage ? `<button class="mini-button" type="button" data-edit-debt="${item.debtId}">Edit</button> <button class="mini-button" type="button" data-delete-debt="${item.debtId}">Delete</button>` : `<strong>${money(item.monthlyPayment)}</strong>`}</span>
          </div>
        `).join("") || `<div class="asset-row"><span>No debt payment items.</span><strong>$0</strong></div>`}
      </div>
      ${manage ? `<form id="debtForm" class="tracker-form">
        <h3>Add Debt Payment</h3>
        <div class="asset-edit-grid">
          <label class="field"><span>Name</span><input id="debtName" required /></label>
          <label class="field"><span>Current Balance</span><input id="debtBalance" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Monthly Payment</span><input id="debtPayment" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Interest Rate %</span><input id="debtInterest" type="number" step="0.01" value="0" /></label>
          <label class="field"><span>Status</span><select id="debtStatus"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option><option value="paid-off">Paid Off</option></select></label>
          <label class="field"><span>Notes</span><input id="debtNotes" /></label>
        </div>
        <button class="primary-button" type="submit">Save Debt Payment</button>
      </form>` : ""}
    </section>
  `;
}

function renderMonthClose() {
  const wallet = state.activeWallet;
  const dashboard = getDashboard(wallet);
  const closed = isClosed(state.currentMonth, wallet);
  const unclosed = getUnclosedMonths();
  const reminder = getCloseReminder();
  const closeSummary = getCloseSummary(wallet);
  const manage = Boolean(state.manageSettings);

  return `
    ${reminder ? `<section class="warning-item watch"><span><strong>Close reminder</strong><br><span class="muted">${escapeHtml(reminder)}</span></span><strong>Close</strong></section>` : ""}
    <section class="card">
      <div class="section-head">
        <div><h2>Close This Month</h2><p>Freeze ${escapeHtml(wallets[wallet].label)} budget so future plan changes cannot overwrite it.</p></div>
      </div>
      <div class="checklist">
        <div class="check-item">Review unusual transactions</div>
        <div class="check-item">Confirm over-budget categories</div>
        <div class="check-item">Confirm reserve coverage</div>
        <div class="check-item">Export backup from Data</div>
      </div>
      <div class="metric-grid">
        <article class="metric-card sage"><span>Income / Allowance</span><strong>${money(dashboard.income)}</strong><p>Plan-default monthly inflow.</p></article>
        <article class="metric-card blue"><span>Fixed Bills</span><strong>${money(dashboard.fixedBills)}</strong><p>Fixed operating costs.</p></article>
        <article class="metric-card grey"><span>Debt Payments</span><strong>${money(dashboard.debtPayments)}</strong><p>Debt-like fixed costs with payoff tracking.</p></article>
        <article class="metric-card olive"><span>Reserve Ending</span><strong>${money(dashboard.pool.available)}</strong><p>After inflows, outflows, and overage coverage.</p></article>
        <article class="metric-card ${dashboard.pool.unfundedOverspend ? "terra" : "sage"}"><span>Overspend Not Covered</span><strong>${money(dashboard.pool.unfundedOverspend)}</strong><p>Only appears when reserve cannot cover overages.</p></article>
      </div>
      <div class="action-row" style="margin-top: 14px;">
        <button id="closeWalletButton" class="primary-button" type="button">${closed ? "Closed" : `Close ${wallets[wallet].label}`}</button>
        ${manage ? `<button id="reopenWalletButton" class="ghost-button" type="button">Reopen</button>` : ""}
      </div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Month-End Summary</h2><p>${escapeHtml(closeSummary.text)}</p></div></div>
      ${renderCloseVisualization(wallet)}
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Months Not Closed</h2><p>Tracked months that still need closing.</p></div></div>
      <div class="unclosed-grid">
        ${unclosed.length ? unclosed.map((item) => `<div class="asset-row"><span>${escapeHtml(item.month)} · ${escapeHtml(wallets[item.wallet].label)}</span><strong>Open</strong></div>`).join("") : `<div class="asset-row"><span>All tracked months are closed.</span><strong>Done</strong></div>`}
      </div>
    </section>
  `;
}

function renderPlanInputs(plan, mode, disabled = false) {
  const attr = mode === "year" ? "data-year-plan" : "data-current-override";
  const fixedItems = getFixedItems(plan, state.activeWallet);
  return `
    ${planGroup("Income Sources", plan.incomeDefaults.map((item) => planRow(item.name, "Income Source", `${mode}:income:${item.id}`, item.amount, attr, disabled)))}
    ${planGroup("Fixed Bills", fixedItems.map((item) => planRow(item.name, "Fixed Bill", `${mode}:fixed:${item.id}`, item.amount, attr, disabled)))}
    ${planGroup("Spending Boxes", Object.entries(plan.boxes).map(([id, box]) => planRow(box.name, "Spending Box", `${mode}:box:${id}`, box.budget, attr, disabled)))}
    ${planGroup("Planned Saving", plan.baselineSavingItems.map((item) => planRow(item.name, "Planned Saving", `${mode}:saving:${item.id}`, item.amount, attr, disabled)))}
    ${planGroup("Reserve", [planRow(`${plan.pool.name} Starting Balance`, "Reserve", `${mode}:pool:startingBalance`, plan.pool.startingBalance, attr, disabled, false)])}
  `;
}

function planGroup(title, rows) {
  return `
    <div class="plan-group">
      <h3>${escapeHtml(title)}</h3>
      ${rows.length ? rows.join("") : `<div class="asset-row"><span>No items.</span><strong>$0</strong></div>`}
    </div>
  `;
}

function planRow(label, typeLabel, key, value, attr, disabled, canDelete = true) {
  const editable = state.manageSettings && !disabled;
  return `
    <div class="plan-row ${editable ? "is-editable" : "is-readonly"}">
      <span><strong>${escapeHtml(label)}</strong><br><span class="muted">${escapeHtml(typeLabel)}</span></span>
      ${editable ? `<input class="small-input" ${attr}="${escapeHtml(key)}" type="number" step="0.01" value="${Number(value) || 0}" />` : `<strong class="plan-amount">${money(value)}</strong>`}
      ${editable && canDelete ? `<button class="mini-button" type="button" data-edit-plan="${escapeHtml(key)}">Edit</button>` : ""}
      ${editable && canDelete ? `<button class="mini-button" type="button" data-delete-plan="${escapeHtml(key)}">Delete</button>` : ""}
    </div>
  `;
}

function addTransaction(event) {
  event.preventDefault();
  const wallet = state.activeWallet;
  if (isClosed(state.currentMonth, wallet)) return showToast("Month is closed");
  const amount = Number(document.querySelector("#amountInput").value) || 0;
  const date = document.querySelector("#dateInput").value;
  const note = document.querySelector("#noteInput").value.trim();
  const [type, box] = document.querySelector("#boxSelect").value.split(":");
  if (!amount || !date) return;

  if (type === "spending") {
    state.transactions.push(t(date, wallet, amount, box, note || boxMeta[box]?.name || "Spending"));
    state.highlightBox = box;
  }

  if (type === "pool_inflow") {
    state.poolEntries.push(p(date, wallet, "inflow", amount, "Manual Reserve Inflow", note || "Reserve inflow"));
  }

  if (type === "pool_spend") {
    state.poolEntries.push(p(date, wallet, "spend", amount, "Paid From Reserve", note || "Reserve spend"));
  }

  if (type === "refund") {
    const target = document.querySelector("#refundTarget").value;
    if (target === "pool") {
      state.poolEntries.push(p(date, wallet, "inflow", amount, "Refund / Reimbursement", note || "Refund"));
    } else {
      const refundBox = document.querySelector("#refundBox").value;
      state.transactions.push(t(date, wallet, amount, refundBox, note || "Refund", "refund", { refundTarget: "box" }));
    }
  }

  save();
  const updatedBox = type === "spending" ? getBoxes(wallet).find((item) => item.boxId === box) : null;
  showToast(updatedBox ? `Added to ${updatedBox.name} · ${money(updatedBox.visibleRemaining)} left` : "Entry added");
  closeEditModal();
  render();
  if (state.highlightBox) {
    window.setTimeout(() => {
      state.highlightBox = "";
      save();
      render();
    }, 900);
  }
}

function updateRefundControls() {
  const selected = document.querySelector("#boxSelect")?.value || "";
  const show = selected.startsWith("refund:");
  document.querySelector("#refundControls")?.classList.toggle("hidden", !show);
}

function openAddEntryModal() {
  const wallet = state.activeWallet;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="addEntryModalTitle">
        <div class="modal-head">
          <div>
            <h2 id="addEntryModalTitle">Add ${escapeHtml(wallets[wallet].label)} Entry</h2>
            <p>Fast manual entry. Choose the real box, not a payment method.</p>
          </div>
          <button class="icon-button" type="button" data-close-modal aria-label="Close">×</button>
        </div>
        ${renderAddEntryForm(wallet)}
      </section>
    </div>
  `;
  const backdrop = modalRoot.querySelector(".modal-backdrop");
  const form = modalRoot.querySelector("#addForm");
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeEditModal();
  });
  modalRoot.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeEditModal);
  });
  form?.addEventListener("submit", addTransaction);
  modalRoot.querySelector("#boxSelect")?.addEventListener("change", updateRefundControls);
  modalRoot.querySelector("#refundTarget")?.addEventListener("change", updateRefundControls);
  modalRoot.querySelector("#advancedTypeSelect")?.addEventListener("change", (event) => {
    const value = event.target.value;
    const select = modalRoot.querySelector("#boxSelect");
    if (select) select.value = value;
    modalRoot.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("is-active", chip.dataset.categoryValue === value));
    updateRefundControls();
  });
  modalRoot.querySelectorAll(".category-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const select = modalRoot.querySelector("#boxSelect");
      const advanced = modalRoot.querySelector("#advancedTypeSelect");
      if (select) select.value = button.dataset.categoryValue;
      if (advanced) advanced.value = button.dataset.categoryValue;
      modalRoot.querySelectorAll(".category-chip").forEach((chip) => chip.classList.toggle("is-active", chip === button));
      updateRefundControls();
    });
  });
  requestAnimationFrame(() => modalRoot.querySelector("#amountInput")?.focus());
}

function deleteTransaction(id) {
  if (!confirm("Delete this entry?")) return;
  state.transactions = state.transactions.filter((item) => item.transactionId !== id);
  save();
  showToast("Entry deleted");
  render();
}

function editTransaction(id) {
  const entry = state.transactions.find((item) => item.transactionId === id);
  if (!entry) return;
  openEditModal({
    title: "Edit Entry",
    description: `${wallets[entry.wallet]?.label || entry.wallet} · ${formatDate(entry.date)}`,
    submitLabel: "Save Entry",
    fields: [
      { name: "amount", label: "Amount", type: "number", value: entry.amount, step: "0.01", required: true },
      { name: "date", label: "Date", type: "date", value: entry.date, required: true },
      { name: "box", label: "Box", type: "select", value: entry.box, options: getBoxOptions(entry.wallet, entry.month, entry.box) },
      { name: "type", label: "Type", type: "select", value: entry.type, options: [["spending", "Spending"], ["refund", "Refund"]] },
      { name: "note", label: "Note", type: "textarea", value: entry.note || "" }
    ],
    onSubmit(values) {
      const amount = Number(values.amount);
      if (!Number.isFinite(amount) || amount < 0) {
        showToast("Invalid amount");
        return false;
      }
      entry.amount = amount;
      entry.date = values.date;
      entry.month = values.date.slice(0, 7);
      entry.box = values.box;
      entry.type = values.type;
      entry.note = values.note.trim();
      save();
      showToast("Entry updated");
      render();
    }
  });
}

function addInvestmentSnapshot(event) {
  event.preventDefault();
  state.investmentSnapshots.push(inv(
    document.querySelector("#investmentDate").value,
    document.querySelector("#investmentAccount").value.trim(),
    document.querySelector("#investmentType").value,
    Number(document.querySelector("#investmentValue").value) || 0,
    Number(document.querySelector("#investmentContribution").value) || 0,
    Number(document.querySelector("#investmentWithdrawal").value) || 0,
    document.querySelector("#investmentNotes").value.trim()
  ));
  save();
  showToast("Investment snapshot saved");
  render();
}

function editInvestmentSnapshot(id) {
  const item = state.investmentSnapshots.find((entry) => entry.snapshotId === id);
  if (!item) return;
  openEditModal({
    title: "Edit Investment Snapshot",
    description: "Update this snapshot without touching budget plans.",
    submitLabel: "Save Snapshot",
    fields: [
      { name: "date", label: "Date", type: "date", value: item.date, required: true },
      { name: "accountName", label: "Account / Bucket", value: item.accountName, required: true },
      { name: "bucketType", label: "Bucket Type", type: "select", value: item.bucketType, options: [["Emergency", "Emergency"], ["Low Risk", "Low Risk"], ["Equity", "Equity"], ["Other", "Other"]] },
      { name: "marketValue", label: "Market Value", type: "number", value: item.marketValue, step: "0.01", required: true },
      { name: "contribution", label: "Contribution", type: "number", value: item.contribution, step: "0.01" },
      { name: "withdrawal", label: "Withdrawal", type: "number", value: item.withdrawal, step: "0.01" },
      { name: "notes", label: "Notes", type: "textarea", value: item.notes || "" }
    ],
    onSubmit(values) {
      const marketValue = Number(values.marketValue);
      const contribution = Number(values.contribution) || 0;
      const withdrawal = Number(values.withdrawal) || 0;
      if (!Number.isFinite(marketValue)) {
        showToast("Invalid market value");
        return false;
      }
      item.date = values.date;
      item.accountName = values.accountName.trim();
      item.bucketType = values.bucketType;
      item.marketValue = marketValue;
      item.contribution = contribution;
      item.withdrawal = withdrawal;
      item.notes = values.notes.trim();
      save();
      showToast("Investment snapshot updated");
      render();
    }
  });
}

function addReceivable(event) {
  event.preventDefault();
  state.receivables.push({
    receivableId: uid("recv"),
    debtor: document.querySelector("#receivableDebtor").value.trim(),
    startingBalance: Number(document.querySelector("#receivableBalance").value) || 0,
    currentBalance: Number(document.querySelector("#receivableBalance").value) || 0,
    expectedPayment: Number(document.querySelector("#receivableExpected").value) || 0,
    interestRate: Number(document.querySelector("#receivableInterest").value) || 0,
    expectedPayoffMonth: "TBD",
    status: document.querySelector("#receivableStatus").value,
    notes: document.querySelector("#receivableNotes").value.trim()
  });
  save();
  showToast("Receivable saved");
  render();
}

function editReceivable(id) {
  const item = state.receivables.find((entry) => entry.receivableId === id);
  if (!item) return;
  openEditModal({
    title: "Edit Receivable",
    description: "Independent tracker. Does not change monthly plan.",
    submitLabel: "Save Receivable",
    fields: [
      { name: "debtor", label: "Debtor", value: item.debtor, required: true },
      { name: "startingBalance", label: "Starting Balance", type: "number", value: item.startingBalance, step: "0.01" },
      { name: "currentBalance", label: "Current Balance", type: "number", value: item.currentBalance, step: "0.01", required: true },
      { name: "expectedPayment", label: "Expected Payment", type: "number", value: item.expectedPayment, step: "0.01" },
      { name: "interestRate", label: "Interest Rate %", type: "number", value: item.interestRate || 0, step: "0.01" },
      { name: "expectedPayoffMonth", label: "Expected Payoff Month", value: item.expectedPayoffMonth || "TBD" },
      { name: "status", label: "Status", type: "select", value: item.status, options: [["active", "Active"], ["paused", "Paused"], ["archived", "Archived"], ["paid-off", "Paid Off"]] },
      { name: "notes", label: "Notes", type: "textarea", value: item.notes || "" }
    ],
    onSubmit(values) {
      const startingBalance = Number(values.startingBalance) || 0;
      const currentBalance = Number(values.currentBalance);
      const expectedPayment = Number(values.expectedPayment) || 0;
      const interestRate = Number(values.interestRate) || 0;
      if (!Number.isFinite(currentBalance)) {
        showToast("Invalid current balance");
        return false;
      }
      item.debtor = values.debtor.trim();
      item.startingBalance = startingBalance;
      item.currentBalance = currentBalance;
      item.expectedPayment = expectedPayment;
      item.interestRate = interestRate;
      item.expectedPayoffMonth = values.expectedPayoffMonth.trim() || "TBD";
      item.status = values.status;
      item.notes = values.notes.trim();
      save();
      showToast("Receivable updated");
      render();
    }
  });
}

function addDebtPlan(event) {
  event.preventDefault();
  const debt = {
    debtId: uid("debt"),
    wallet: state.activeWallet,
    name: document.querySelector("#debtName").value.trim(),
    startingBalance: Number(document.querySelector("#debtBalance").value) || 0,
    currentBalance: Number(document.querySelector("#debtBalance").value) || 0,
    monthlyPayment: Number(document.querySelector("#debtPayment").value) || 0,
    interestRate: Number(document.querySelector("#debtInterest").value) || 0,
    status: document.querySelector("#debtStatus").value,
    notes: document.querySelector("#debtNotes").value.trim()
  };
  state.debtPlans.push(debt);
  addDebtToYearPlan(debt);
  save();
  showToast("Debt plan saved");
  render();
}

function editDebtPlan(id) {
  const debt = state.debtPlans.find((item) => item.debtId === id);
  if (!debt) return;
  openEditModal({
    title: "Edit Debt Payment",
    description: "Debt payment is locked money with payoff tracking, not daily spend.",
    submitLabel: "Save Debt Payment",
    fields: [
      { name: "name", label: "Name", value: debt.name, required: true },
      { name: "startingBalance", label: "Starting Balance", type: "number", value: debt.startingBalance, step: "0.01" },
      { name: "currentBalance", label: "Current Balance", type: "number", value: debt.currentBalance, step: "0.01" },
      { name: "monthlyPayment", label: "Monthly Payment", type: "number", value: debt.monthlyPayment, step: "0.01" },
      { name: "interestRate", label: "Interest Rate %", type: "number", value: debt.interestRate || 0, step: "0.01" },
      { name: "status", label: "Status", type: "select", value: debt.status, options: [["active", "Active"], ["paused", "Paused"], ["archived", "Archived"], ["paid-off", "Paid Off"]] },
      { name: "notes", label: "Notes", type: "textarea", value: debt.notes || "" }
    ],
    onSubmit(values) {
      const startingBalance = Number(values.startingBalance) || 0;
      const currentBalance = Number(values.currentBalance) || 0;
      const monthlyPayment = Number(values.monthlyPayment) || 0;
      const interestRate = Number(values.interestRate) || 0;
      debt.name = values.name.trim();
      debt.startingBalance = startingBalance;
      debt.currentBalance = currentBalance;
      debt.monthlyPayment = monthlyPayment;
      debt.interestRate = interestRate;
      debt.status = values.status;
      debt.notes = values.notes.trim();
      syncDebtPaymentToPlan(debt);
      save();
      showToast("Debt plan updated");
      render();
    }
  });
}

function deleteDebtPlan(id) {
  const debt = state.debtPlans.find((item) => item.debtId === id);
  if (!debt || !confirm(`Delete debt plan "${debt.name}"?`)) return;
  const aliases = {
    mortgage: ["mortgage"],
    "car-loan": ["carPayment"],
    ikea: ["ikea"]
  };
  const ids = [debt.debtId, ...(aliases[debt.debtId] || [])];
  state.debtPlans = state.debtPlans.filter((item) => item.debtId !== id);
  removeFixedItemsFromPlans(debt.wallet, ids);
  save();
  showToast("Debt plan deleted");
  render();
}

function openEditModal({ title, description, fields, submitLabel, onSubmit }) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="editModalTitle">
        <div class="modal-head">
          <div>
            <h2 id="editModalTitle">${escapeHtml(title)}</h2>
            ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          </div>
          <button class="icon-button" type="button" data-close-modal aria-label="Close">×</button>
        </div>
        <form id="editModalForm" class="modal-form">
          <div class="asset-edit-grid">
            ${fields.map(renderModalField).join("")}
          </div>
          <div class="modal-actions">
            <button class="ghost-button" type="button" data-close-modal>Cancel</button>
            <button class="primary-button" type="submit">${escapeHtml(submitLabel || "Save")}</button>
          </div>
        </form>
      </section>
    </div>
  `;

  const backdrop = modalRoot.querySelector(".modal-backdrop");
  const form = modalRoot.querySelector("#editModalForm");
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeEditModal();
  });
  modalRoot.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeEditModal);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {};
    fields.forEach((field) => {
      values[field.name] = form.elements[field.name]?.value ?? "";
    });
    const result = onSubmit(values);
    if (result !== false) closeEditModal();
  });
  requestAnimationFrame(() => {
    form.querySelector("input, select, textarea")?.focus();
  });
}

function closeEditModal() {
  modalRoot.innerHTML = "";
}

function renderModalField(field) {
  const id = `modal-${field.name}`;
  const required = field.required ? "required" : "";
  if (field.type === "select") {
    return `
      <label class="field">
        <span>${escapeHtml(field.label)}</span>
        <select id="${escapeHtml(id)}" name="${escapeHtml(field.name)}" ${required}>
          ${(field.options || []).map(([value, label]) => `<option value="${escapeHtml(value)}" ${String(value) === String(field.value) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
      </label>
    `;
  }
  if (field.type === "textarea") {
    return `
      <label class="field modal-wide">
        <span>${escapeHtml(field.label)}</span>
        <textarea id="${escapeHtml(id)}" name="${escapeHtml(field.name)}" rows="3" ${required}>${escapeHtml(field.value || "")}</textarea>
      </label>
    `;
  }
  const step = field.type === "number" ? `step="${escapeHtml(field.step || "1")}" inputmode="decimal"` : "";
  return `
    <label class="field">
      <span>${escapeHtml(field.label)}</span>
      <input id="${escapeHtml(id)}" name="${escapeHtml(field.name)}" type="${escapeHtml(field.type || "text")}" ${step} value="${escapeHtml(field.value ?? "")}" ${required} />
    </label>
  `;
}

function getBoxOptions(wallet, month, currentBox) {
  const plan = getPlan(month || state.currentMonth, wallet);
  const options = Object.entries(plan.boxes || {}).map(([id, box]) => [id, box.name]);
  if (currentBox && !options.some(([id]) => id === currentBox)) options.push([currentBox, boxMeta[currentBox]?.name || currentBox]);
  return options;
}

function addPlanItem(event) {
  event.preventDefault();
  addPlanItemFromValues({
    name: document.querySelector("#planItemName").value.trim(),
    amount: Number(document.querySelector("#planItemAmount").value) || 0,
    type: document.querySelector("#planItemType").value,
    scope: document.querySelector("#planItemScope").value,
    notes: document.querySelector("#planItemNotes").value.trim()
  });
}

function openPlanItemModal() {
  const closed = isClosed(state.currentMonth, state.activeWallet);
  if (closed) return showToast("Month is closed");
  openEditModal({
    title: "Add Plan Item",
    description: "Choose where this item belongs. Debt payments get their own payoff tracking.",
    submitLabel: "Add Plan Item",
    fields: planItemModalFields({ name: "", amount: 0, type: "box", scope: "current", notes: "" }),
    onSubmit(values) {
      addPlanItemFromValues({
        name: values.name.trim(),
        amount: Number(values.amount) || 0,
        type: values.type,
        scope: values.scope,
        notes: values.notes.trim()
      });
    }
  });
}

function addPlanItemFromValues({ name, amount, type, scope, notes }) {
  const wallet = state.activeWallet;
  if (isClosed(state.currentMonth, wallet)) return showToast("Month is closed");
  if (!name) return;

  const basePlan = scope === "future" ? getOrCreateFuturePlanVersion().plan[wallet] : getPlan(state.currentMonth, wallet);
  const id = uniquePlanItemId(basePlan, name);

  if (scope === "future") {
    const version = getOrCreateFuturePlanVersion();
    addPlanItemToPlan(version.plan[wallet], id, name, amount, type);
    if (type === "debt") upsertDebtPlan({ debtId: id, wallet, name, monthlyPayment: amount, notes });
    save();
    showToast(`Future plan item starts ${version.effectiveFrom}`);
    render();
    return;
  }

  state.monthlyOverrides[state.currentMonth] ||= {};
  state.monthlyOverrides[state.currentMonth][wallet] ||= {};
  const patch = state.monthlyOverrides[state.currentMonth][wallet];
  addPlanItemToPatch(patch, id, name, amount, type);
  if (type === "debt") upsertDebtPlan({ debtId: id, wallet, name, monthlyPayment: amount, notes });
  save();
  showToast("Current month plan item added");
  render();
}

function editPlanItem(key) {
  const wallet = state.activeWallet;
  const item = getPlanItemForEdit(key, wallet);
  if (!item) return showToast("Plan item not found");
  if (item.mode === "current" && isClosed(state.currentMonth, wallet)) return showToast("Month is closed");
  openEditModal({
    title: "Edit Plan Item",
    description: "Rename, change amount, or move it to another plan category.",
    submitLabel: "Save Plan Item",
    fields: planItemModalFields({
      name: item.name,
      amount: item.amount,
      type: item.type,
      scope: item.mode,
      notes: ""
    }, item.mode),
    onSubmit(values) {
      const name = values.name.trim();
      const amount = Number(values.amount) || 0;
      const nextType = values.type;
      const scope = values.scope;
      if (!name) {
        showToast("Name is required");
        return false;
      }
      applyEditedPlanItem(key, { name, amount, type: nextType, scope, notes: values.notes.trim() });
    }
  });
}

function planItemModalFields(values, forcedScope = "") {
  return [
    { name: "name", label: "Name", value: values.name, required: true },
    { name: "amount", label: "Amount", type: "number", value: values.amount, step: "0.01", required: true },
    { name: "type", label: "Category", type: "select", value: values.type, options: [["box", "Spending Box"], ["fixed", "Fixed Bill"], ["debt", "Debt Payment"], ["income", "Income Source"], ["saving", "Planned Saving"]] },
    { name: "scope", label: "Apply To", type: "select", value: forcedScope || values.scope, options: [["current", "Current Month Only"], ["future", "Future Year Plan"]] },
    { name: "notes", label: "Notes", type: "textarea", value: values.notes || "" }
  ];
}

function getPlanItemForEdit(key, wallet) {
  const [mode, section, id] = key.split(":");
  const plan = mode === "year" ? getEditableYearPlan(wallet) : getPlan(state.currentMonth, wallet);
  if (section === "box" && plan.boxes[id]) return { mode, section, id, type: "box", name: plan.boxes[id].name, amount: plan.boxes[id].budget };
  if (section === "pool") return null;
  const sectionName = sectionToPlanSection(section);
  const row = plan[sectionName]?.find((item) => item.id === id);
  if (!row) return null;
  return { mode, section, id, type: section === "income" ? "income" : section === "fixed" ? "fixed" : "saving", name: row.name, amount: row.amount };
}

function applyEditedPlanItem(oldKey, item) {
  const [oldMode, oldSection, oldId] = oldKey.split(":");
  const wallet = state.activeWallet;
  const oldSectionName = sectionToPlanSection(oldSection);
  if (item.scope === "future") {
    const version = getOrCreateFuturePlanVersion();
    removePlanItemFromPlan(version.plan[wallet], oldSectionName, oldId);
    addPlanItemToPlan(version.plan[wallet], oldId, item.name, item.amount, item.type);
    if (item.type === "debt") upsertDebtPlan({ debtId: oldId, wallet, name: item.name, monthlyPayment: item.amount, notes: item.notes });
    save();
    showToast(`Future plan item updated from ${version.effectiveFrom}`);
    render();
    return;
  }

  state.monthlyOverrides[state.currentMonth] ||= {};
  state.monthlyOverrides[state.currentMonth][wallet] ||= {};
  const patch = state.monthlyOverrides[state.currentMonth][wallet];
  removePlanItemFromPatch(patch, oldSectionName, oldId);
  patch.deleted ||= {};
  patch.deleted[oldSectionName] ||= [];
  if (!patch.deleted[oldSectionName].includes(oldId)) patch.deleted[oldSectionName].push(oldId);
  addPlanItemToPatch(patch, oldId, item.name, item.amount, item.type);
  if (item.type === "debt") upsertDebtPlan({ debtId: oldId, wallet, name: item.name, monthlyPayment: item.amount, notes: item.notes });
  save();
  showToast("Current month plan item updated");
  render();
}

function deletePlanItem(key) {
  const [mode, section, id] = key.split(":");
  const wallet = state.activeWallet;
  if (section === "pool") return;
  if (mode === "current" && isClosed(state.currentMonth, wallet)) return showToast("Month is closed");
  if (!confirm("Delete this plan item?")) return;

  const sectionName = sectionToPlanSection(section);
  if (mode === "year") {
    const version = getOrCreateFuturePlanVersion();
    removePlanItemFromPlan(version.plan[wallet], sectionName, id);
    showToast(`Future plan item removed from ${version.effectiveFrom}`);
  } else {
    state.monthlyOverrides[state.currentMonth] ||= {};
    state.monthlyOverrides[state.currentMonth][wallet] ||= {};
    const patch = state.monthlyOverrides[state.currentMonth][wallet];
    removePlanItemFromPatch(patch, sectionName, id);
    patch.deleted ||= {};
    patch.deleted[sectionName] ||= [];
    if (!patch.deleted[sectionName].includes(id)) patch.deleted[sectionName].push(id);
    showToast("Current month plan item removed");
  }

  save();
  render();
}

function addPlanItemToPlan(plan, id, name, amount, type) {
  if (type === "box") {
    plan.boxes[id] = { name, budget: amount };
    boxMeta[id] = { wallet: state.activeWallet, name };
    return;
  }
  if (type === "debt") return;
  const section = type === "income" ? "incomeDefaults" : type === "saving" ? "baselineSavingItems" : "autoFixedItems";
  const existing = plan[section].find((item) => item.id === id);
  if (existing) {
    existing.name = name;
    existing.amount = amount;
  } else {
    plan[section].push({ id, name, amount });
  }
}

function addPlanItemToPatch(patch, id, name, amount, type) {
  patch.additions ||= {};
  if (type === "box") {
    patch.additions.boxes ||= {};
    patch.additions.boxes[id] = { name, budget: amount };
    patch.boxes ||= {};
    patch.boxes[id] = amount;
    boxMeta[id] = { wallet: state.activeWallet, name };
    return;
  }
  if (type === "debt") return;
  const section = type === "income" ? "incomeDefaults" : type === "saving" ? "baselineSavingItems" : "autoFixedItems";
  patch.additions[section] ||= [];
  const existing = patch.additions[section].find((item) => item.id === id);
  if (existing) {
    existing.name = name;
    existing.amount = amount;
  } else {
    patch.additions[section].push({ id, name, amount });
  }
  patch[section] ||= {};
  patch[section][id] = amount;
}

function removePlanItemFromPlan(plan, sectionName, id) {
  if (sectionName === "boxes") {
    delete plan.boxes[id];
    return;
  }
  plan[sectionName] = plan[sectionName].filter((item) => item.id !== id);
}

function removePlanItemFromPatch(patch, sectionName, id) {
  if (sectionName === "boxes") {
    if (patch.additions?.boxes) delete patch.additions.boxes[id];
    if (patch.boxes) delete patch.boxes[id];
    return;
  }
  if (patch.additions?.[sectionName]) {
    patch.additions[sectionName] = patch.additions[sectionName].filter((item) => item.id !== id);
  }
  if (patch[sectionName]) delete patch[sectionName][id];
}

function removeFixedItemsFromPlans(wallet, ids) {
  state.yearPlanVersions.forEach((version) => {
    const plan = version.plan?.[wallet];
    if (!plan) return;
    plan.autoFixedItems = plan.autoFixedItems.filter((item) => !ids.includes(item.id));
  });
  Object.values(state.monthlyOverrides || {}).forEach((walletOverrides) => {
    const patch = walletOverrides[wallet];
    if (!patch) return;
    ids.forEach((id) => {
      if (patch.autoFixedItems) delete patch.autoFixedItems[id];
      if (patch.additions?.autoFixedItems) {
        patch.additions.autoFixedItems = patch.additions.autoFixedItems.filter((item) => item.id !== id);
      }
    });
    patch.deleted ||= {};
    patch.deleted.autoFixedItems ||= [];
    ids.forEach((id) => {
      if (!patch.deleted.autoFixedItems.includes(id)) patch.deleted.autoFixedItems.push(id);
    });
  });
}

function upsertDebtPlan(debt) {
  const existing = state.debtPlans.find((item) => item.debtId === debt.debtId);
  if (existing) {
    existing.name = debt.name;
    existing.monthlyPayment = debt.monthlyPayment;
    existing.interestRate = Number(debt.interestRate) || Number(existing.interestRate) || 0;
    existing.status = "active";
    if (debt.notes) existing.notes = debt.notes;
    return;
  }
  state.debtPlans.push({
    debtId: debt.debtId,
    wallet: debt.wallet,
    name: debt.name,
    startingBalance: 0,
    currentBalance: 0,
    monthlyPayment: debt.monthlyPayment,
    interestRate: Number(debt.interestRate) || 0,
    status: "active",
    notes: debt.notes || "Created from Plan."
  });
}

function getOrCreateFuturePlanVersion() {
  const effectiveFrom = nextMonthKey(state.currentMonth);
  let version = state.yearPlanVersions.find((item) => item.effectiveFrom === effectiveFrom);
  if (version) return version;
  const currentVersion = state.yearPlanVersions
    .filter((item) => item.effectiveFrom <= state.currentMonth)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  version = {
    versionId: uid("plan"),
    effectiveFrom,
    createdAt: new Date().toISOString(),
    plan: structuredClone(currentVersion.plan)
  };
  state.yearPlanVersions.push(version);
  return version;
}

function uniquePlanItemId(plan, name) {
  const base = slugify(name);
  const ids = new Set([
    ...Object.keys(plan.boxes || {}),
    ...(plan.incomeDefaults || []).map((item) => item.id),
    ...(plan.autoFixedItems || []).map((item) => item.id),
    ...(plan.baselineSavingItems || []).map((item) => item.id)
  ]);
  if (!ids.has(base)) return base;
  let index = 2;
  while (ids.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function sectionToPlanSection(section) {
  if (section === "box") return "boxes";
  if (section === "income") return "incomeDefaults";
  if (section === "fixed") return "autoFixedItems";
  return "baselineSavingItems";
}

function getDebtPlanIds(wallet) {
  const ids = new Set();
  state.debtPlans.filter((item) => item.wallet === wallet).forEach((debt) => {
    ids.add(debt.debtId);
    (debtFixedAliases[debt.debtId] || []).forEach((id) => ids.add(id));
  });
  return ids;
}

function getFixedItems(plan, wallet) {
  const debtIds = getDebtPlanIds(wallet);
  return (plan.autoFixedItems || []).filter((item) => !debtIds.has(item.id));
}

function getDebtPaymentTotal(wallet) {
  return state.debtPlans
    .filter((item) => item.wallet === wallet && item.status === "active")
    .reduce((acc, item) => acc + (Number(item.monthlyPayment) || 0), 0);
}

function getDashboard(wallet) {
  const plan = getPlan(state.currentMonth, wallet);
  const boxes = getBoxes(wallet);
  const pool = getPoolStatus(wallet, boxes);
  const income = sumAmounts(plan.incomeDefaults);
  const fixedBills = sumAmounts(getFixedItems(plan, wallet));
  const debtPayments = getDebtPaymentTotal(wallet);
  const autoLocked = fixedBills + debtPayments;
  const plannedSaving = sumAmounts(plan.baselineSavingItems);
  const cappedBoxSpend = boxes.reduce((acc, box) => acc + Math.min(box.actualSpent, box.budget), 0);
  const projectedManualSpending = boxes.reduce((acc, box) => acc + box.projectedSpend, 0);
  const totalBudgetAvailable = income - autoLocked - plannedSaving;
  const monthRemaining = totalBudgetAvailable - cappedBoxSpend;
  const projectedMonthEnd = income - autoLocked - plannedSaving - projectedManualSpending;
  const daysLeft = getDaysLeft(state.currentMonth);

  return {
    wallet,
    plan,
    income,
    fixedBills,
    debtPayments,
    autoLocked,
    plannedSaving,
    totalBudgetAvailable,
    monthRemaining,
    dailySafeSpend: monthRemaining / daysLeft,
    projectedMonthEnd,
    pool
  };
}

function getMonthStatus(dashboard) {
  if (dashboard.pool.unfundedOverspend > 0 || dashboard.projectedMonthEnd < 0) return { label: "Review", tone: "terra" };
  if (dashboard.monthRemaining < dashboard.dailySafeSpend * 3) return { label: "Watch", tone: "amber" };
  return { label: "On Track", tone: "sage" };
}

function getBoxStatusLabel(box) {
  if (box.overage > 0 && box.coveredByPool < box.overage) return { label: "Uncovered", tone: "terra" };
  if (box.overage > 0) return { label: "Covered", tone: "olive" };
  if (box.usedPercent >= 1) return { label: "Over Budget", tone: "terra" };
  if (box.paceRatio > 1.35) return { label: "Over Pace", tone: "terra" };
  if (box.paceRatio > 1.15) return { label: "Watch", tone: "amber" };
  return { label: "On Track", tone: "sage" };
}

function paceText(box) {
  if (box.overage > 0) return `Over by ${money(box.overage)}`;
  const delta = Math.round(Math.abs(box.paceRatio - 1) * 100);
  if (box.paceRatio > 1.08) return `${delta}% faster than pace`;
  if (box.paceRatio < 0.92) return `${delta}% under pace`;
  return "On pace";
}

function getBoxes(wallet) {
  const plan = getPlan(state.currentMonth, wallet);
  const monthElapsed = getMonthElapsedPercent(state.currentMonth);
  const elapsedDays = getElapsedDays(state.currentMonth);
  const daysInMonth = getDaysInMonth(state.currentMonth);
  const prelim = Object.entries(plan.boxes).map(([boxId, box]) => {
    const spending = state.transactions
      .filter((item) => item.wallet === wallet && item.month === state.currentMonth && item.box === boxId && item.type === "spending")
      .reduce((acc, item) => acc + item.amount, 0);
    const refunds = state.transactions
      .filter((item) => item.wallet === wallet && item.month === state.currentMonth && item.box === boxId && item.type === "refund" && item.refundTarget === "box")
      .reduce((acc, item) => acc + item.amount, 0);
    const actualSpent = Math.max(0, spending - refunds);
    const budget = Number(box.budget) || 0;
    const usedPercent = budget ? actualSpent / budget : 0;
    const paceRatio = monthElapsed ? usedPercent / monthElapsed : 0;
    const projectedSpend = elapsedDays ? (actualSpent / elapsedDays) * daysInMonth : actualSpent;
    const overage = Math.max(0, actualSpent - budget);
    const visibleRemaining = Math.max(0, budget - actualSpent);
    const status = overage > 0 || paceRatio > 1.35 ? "risk" : paceRatio > 1.15 ? "watch" : "good";
    return {
      boxId,
      name: box.name,
      budget,
      actualSpent,
      refunds,
      visibleRemaining,
      usedPercent,
      monthElapsedPercent: monthElapsed,
      paceRatio,
      projectedSpend,
      overage,
      coveredByPool: overage,
      status
    };
  });

  const poolBase = getPoolBase(wallet);
  const totalOverage = prelim.reduce((acc, box) => acc + box.overage, 0);
  if (poolBase.availableBeforeCoverage < totalOverage && totalOverage > 0) {
    const ratio = Math.max(0, poolBase.availableBeforeCoverage) / totalOverage;
    prelim.forEach((box) => {
      box.coveredByPool = box.overage * ratio;
    });
  }
  return prelim;
}

function getPoolStatus(wallet, boxes = getBoxes(wallet)) {
  const plan = getPlan(state.currentMonth, wallet);
  const base = getPoolBase(wallet);
  const overageCoverage = boxes.reduce((acc, box) => acc + box.overage, 0);
  const available = base.startingBalance + base.inflows - base.outflows - overageCoverage;
  const poolCapacity = base.startingBalance + base.inflows;
  const poolUsed = base.outflows + overageCoverage;
  return {
    startingBalance: plan.pool.startingBalance,
    inflows: base.inflows,
    outflows: base.outflows,
    overageCoverage,
    committed: poolUsed,
    available: Math.max(0, available),
    unfundedOverspend: Math.max(0, -available),
    pressure: poolCapacity ? poolUsed / poolCapacity : 0
  };
}

function getPoolBase(wallet) {
  const plan = getPlan(state.currentMonth, wallet);
  const entries = getPoolEntries(wallet);
  const inflows = entries.filter((item) => item.type === "inflow" || item.type === "adjustment").reduce((acc, item) => acc + item.amount, 0);
  const outflows = entries.filter((item) => item.type === "spend").reduce((acc, item) => acc + item.amount, 0);
  return {
    startingBalance: Number(plan.pool.startingBalance) || 0,
    inflows,
    outflows,
    availableBeforeCoverage: (Number(plan.pool.startingBalance) || 0) + inflows - outflows
  };
}

function getPoolEntries(wallet) {
  return state.poolEntries.filter((item) => item.wallet === wallet && item.month === state.currentMonth);
}

function getWarnings(wallet) {
  const boxes = getBoxes(wallet);
  const dashboard = getDashboard(wallet);
  const day = getDayOfMonth(state.currentMonth);
  const warnings = [];
  boxes.forEach((box) => {
    if (box.paceRatio > 1.35) warnings.push({ level: "risk", title: `${box.name} is too fast`, text: `Speed is ${box.paceRatio.toFixed(1)}x. Expected spend is ${money(box.projectedSpend)} if this pace continues.` });
    else if (box.paceRatio > 1.15) warnings.push({ level: "watch", title: `${box.name} is ahead of the month`, text: `Speed is ${box.paceRatio.toFixed(1)}x compared with month progress.` });
    if (box.projectedSpend > box.budget) warnings.push({ level: "watch", title: `${box.name} may exceed budget`, text: `Expected ${money(box.projectedSpend)} vs budget ${money(box.budget)} if this pace continues.` });
    if (box.projectedSpend > box.budget + dashboard.pool.available) warnings.push({ level: "risk", title: `${box.name} may not be covered by reserve`, text: `Expected spend exceeds budget plus available reserve.` });
    if (day <= 10 && box.actualSpent > box.budget * 0.45) warnings.push({ level: "risk", title: `${box.name} is heavy early`, text: `${money(box.actualSpent)} used in the first 10 days.` });
  });

  const eatOut = boxes.find((box) => box.boxId === "eatOut");
  if (eatOut) {
    const eatCount = getBoxTransactions(wallet, "eatOut").filter((item) => item.type === "spending").length;
    const weekCount = getBoxTransactions(wallet, "eatOut").filter((item) => isThisWeek(item.date)).length;
    if (day <= 10 && eatCount >= 5) warnings.push({ level: "watch", title: "Eating out frequency is high", text: `${eatCount} Eat Out entries by day ${day}.` });
    if (weekCount >= 4) warnings.push({ level: "watch", title: "This week has many Eat Out entries", text: `${weekCount} Eat Out entries this week.` });
  }

  if (dashboard.pool.pressure > 0.75) warnings.push({ level: "risk", title: `${wallets[wallet].reserveLabel} is heavily used`, text: `${Math.round(dashboard.pool.pressure * 100)}% of available reserve has already been used this month.` });
  else if (dashboard.pool.pressure > 0.5) warnings.push({ level: "watch", title: `${wallets[wallet].reserveLabel} is being used quickly`, text: `${Math.round(dashboard.pool.pressure * 100)}% of available reserve has already been used this month.` });

  if (dashboard.pool.unfundedOverspend > 0) warnings.push({ level: "risk", title: "Overspend Not Covered", text: `${money(dashboard.pool.unfundedOverspend)} is not covered by reserve.` });
  return warnings;
}

function getWeeklyStats(wallet) {
  const today = getReferenceDate();
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  const rows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const amount = state.transactions
      .filter((item) => item.wallet === wallet && item.type === "spending" && item.date === key)
      .reduce((acc, item) => acc + item.amount, 0);
    return { date: key, label: date.toLocaleDateString("en-CA", { weekday: "short" }), amount };
  });
  const last7Spend = rows.reduce((acc, item) => acc + item.amount, 0);
  return {
    dailyRows: rows,
    thisWeekSpend: rows.reduce((acc, item) => acc + item.amount, 0),
    last7Spend,
    last7Average: last7Spend / 7
  };
}

function getRecommendations(wallet) {
  const months = getRecentActualMonths(wallet, 4);
  const recs = [];
  const plan = getPlan(state.currentMonth, wallet);
  Object.entries(plan.boxes).forEach(([boxId, box]) => {
    const values = months.map((month) => month.boxes?.[boxId] || 0);
    const budget = Number(box.budget) || 0;
    if (!budget || values.length < 2) return;
    const lastTwo = values.slice(-2);
    if (lastTwo.every((value) => value > budget * 1.1)) recs.push(`${box.name} exceeded budget by more than 10% for 2 consecutive months. Increase by ${money(50)} or change behavior.`);
    const lastThree = values.slice(-3);
    if (lastThree.length === 3 && lastThree.every((value) => value < budget * 0.75)) recs.push(`${box.name} used less than 75% for 3 months. Move surplus to ${wallets[wallet].reserveLabel}.`);
    if (lastThree.length === 3 && Math.max(...lastThree) - Math.min(...lastThree) > budget * 0.5) recs.push(`${box.name} is volatile. Keep base budget lower and use the reserve for one-offs.`);
    const coveredMonths = values.filter((value) => value > budget).length;
    if (coveredMonths >= 3) recs.push(`${box.name} needed reserve coverage in ${coveredMonths} of the last 4 months. Review this budget.`);
    if (getDayOfMonth(state.currentMonth) >= 25) {
      const current = getBoxes(wallet).find((item) => item.boxId === boxId);
      if (current && current.visibleRemaining > budget * 0.4) recs.push(`${box.name} has more than 40% left near month-end. Consider lowering next month or moving surplus to the reserve.`);
    }
  });
  return [...new Set(recs)].slice(0, 5);
}

function getCloseSummary(wallet) {
  const dashboard = getDashboard(wallet);
  const boxes = getBoxes(wallet);
  const overages = boxes.filter((box) => box.overage > 0);
  const biggestRemaining = boxes.slice().sort((a, b) => b.visibleRemaining - a.visibleRemaining)[0];
  const status = dashboard.pool.unfundedOverspend > 0 || dashboard.projectedMonthEnd < 0 ? "needs review" : "on track";
  const overageText = overages.length
    ? `${overages.map((box) => `${box.name} ${money(box.overage)} over`).join(", ")} covered by reserve`
    : "no box overages";
  const remainingText = biggestRemaining ? `${biggestRemaining.name} has ${money(biggestRemaining.visibleRemaining)} left` : "no active boxes";
  return {
    text: `${state.currentMonth} ${wallets[wallet].label}: ${status}. Income ${money(dashboard.income)} from ${dashboard.plan.incomeDefaults.length} source${dashboard.plan.incomeDefaults.length === 1 ? "" : "s"}, fixed bills ${money(dashboard.fixedBills)}, debt payments ${money(dashboard.debtPayments)}, ${overageText}, ${remainingText}, reserve available ${money(dashboard.pool.available)}.`
  };
}

function renderCloseVisualization(wallet) {
  const boxes = getBoxes(wallet);
  const dashboard = getDashboard(wallet);
  return `
    <div class="visual-grid close-visuals">
      <article class="visual-card">
        <span>Box Close</span>
        <div class="visual-list">
          ${boxes.map(renderBudgetVisualRow).join("")}
        </div>
      </article>
      <article class="visual-card">
        <span>Locked Money</span>
        <div class="close-stack">
          ${renderCloseStackRow("Income", dashboard.income, dashboard.income, "sage")}
          ${renderCloseStackRow("Fixed Bills", dashboard.fixedBills, dashboard.income, "blue")}
          ${renderCloseStackRow("Debt Payments", dashboard.debtPayments, dashboard.income, "grey")}
          ${renderCloseStackRow("Manual Boxes Used", boxes.reduce((acc, box) => acc + box.actualSpent, 0), dashboard.income, "amber")}
          ${renderCloseStackRow("Planned Saving", dashboard.plannedSaving, dashboard.income, "olive")}
        </div>
      </article>
      <article class="visual-card wide-visual">
        <span>Reserve Close</span>
        <div class="reserve-month">
          <strong>${escapeHtml(wallets[wallet].reserveLabel)}</strong>
          <div class="reserve-bars">
            <i class="in" style="width:${barWidth(dashboard.pool.inflows, [{ inflow: dashboard.pool.inflows, outflow: dashboard.pool.committed, coverage: 0 }])}%"></i>
            <i class="out" style="width:${barWidth(dashboard.pool.committed, [{ inflow: dashboard.pool.inflows, outflow: dashboard.pool.committed, coverage: 0 }])}%"></i>
          </div>
          <small>Starting ${money(dashboard.pool.startingBalance)} · In ${money(dashboard.pool.inflows)} · Used ${money(dashboard.pool.committed)} · Available ${money(dashboard.pool.available)}</small>
        </div>
      </article>
    </div>
  `;
}

function renderCloseStackRow(label, value, max, tone) {
  const width = Math.max(2, Math.min(100, max ? (Math.abs(value) / Math.abs(max)) * 100 : 2));
  return `
    <div class="close-stack-row">
      <div class="row"><strong>${escapeHtml(label)}</strong><span>${money(value)}</span></div>
      <div class="dual-bar"><i class="${escapeHtml(tone)}" style="width:${width}%"></i></div>
    </div>
  `;
}

function renderWarning(item) {
  return `<div class="warning-item ${item.level}"><span><strong>${escapeHtml(item.title)}</strong>${item.text ? `<br><span class="muted">${escapeHtml(item.text)}</span>` : ""}</span><strong>${item.level === "risk" ? "Review" : "Watch"}</strong></div>`;
}

function renderBoxCard(box) {
  return `<article class="box-card">${renderBoxCardInner(box)}</article>`;
}

function renderOverviewCategoryCard(box) {
  const fill = Math.min(box.usedPercent * 100, 100);
  const marker = Math.min(box.monthElapsedPercent * 100, 100);
  const status = getBoxStatusLabel(box);
  return `
    <button class="box-card category-card ${state.highlightBox === box.boxId ? "just-updated" : ""}" type="button" data-view-box="${escapeHtml(box.boxId)}">
      <div class="box-top">
        <div><span class="${escapeHtml(status.tone)}-text">${escapeHtml(status.label)}</span><strong>${escapeHtml(box.name)}</strong></div>
        <strong>${money(box.actualSpent)} / ${money(box.budget)}</strong>
      </div>
      <div class="box-meta single-line">
        <span>${money(box.visibleRemaining)} left</span>
        <span>${paceText(box)}</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar"><div class="progress-fill ${box.status}" style="width:${fill}%"></div></div>
        <i class="today-marker" style="left:${marker}%"></i>
      </div>
      ${box.overage ? `<span class="covered">${money(box.coveredByPool)} covered</span>` : ""}
    </button>
  `;
}

function renderBoxCardInner(box) {
  const fill = Math.min(box.usedPercent * 100, 100);
  const marker = Math.min(box.monthElapsedPercent * 100, 100);
  return `
    <div class="box-top">
      <div><span>${escapeHtml(getBoxStatusLabel(box).label)}</span><strong>${escapeHtml(box.name)}</strong></div>
      <strong>${money(box.actualSpent)} / ${money(box.budget)}</strong>
    </div>
    <div class="progress-wrap">
      <div class="progress-bar"><div class="progress-fill ${box.status}" style="width:${fill}%"></div></div>
      <i class="today-marker" style="left:${marker}%"></i>
    </div>
    <div class="box-meta">
      <span>${money(box.visibleRemaining)} left</span>
      <span>${Math.round(box.usedPercent * 100)}% used</span>
      <span>${paceText(box)}</span>
      <span>Expected ${money(box.projectedSpend)}</span>
    </div>
    ${box.overage ? `<span class="covered">${money(box.coveredByPool)} covered by reserve</span>` : ""}
  `;
}

function renderBoxDetail(box) {
  return `
    <div class="metric-grid">
      <article class="metric-card grey"><span>Budget</span><strong>${money(box.budget)}</strong><p>Current month plan after overrides.</p></article>
      <article class="metric-card blue"><span>Actual Spent</span><strong>${money(box.actualSpent)}</strong><p>Refunds applied to this box are offset.</p></article>
      <article class="metric-card olive"><span>Covered by Reserve</span><strong>${money(box.coveredByPool)}</strong><p>Regular boxes never show negative remaining.</p></article>
      <article class="metric-card ${box.status === "risk" ? "terra" : box.status === "watch" ? "amber" : "sage"}"><span>Speed vs Month</span><strong>${box.paceRatio.toFixed(1)}x</strong><p>Expected ${money(box.projectedSpend)} if this pace continues.</p></article>
    </div>
  `;
}

function openCategoryDetail(boxId) {
  const box = getBoxes(state.activeWallet).find((item) => item.boxId === boxId);
  if (!box) return;
  const transactions = getBoxTransactions(state.activeWallet, boxId).slice().sort((a, b) => b.date.localeCompare(a.date));
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="categoryDetailTitle">
        <div class="modal-head">
          <div>
            <h2 id="categoryDetailTitle">${escapeHtml(box.name)}</h2>
            <p>${money(box.actualSpent)} spent of ${money(box.budget)} · ${money(box.visibleRemaining)} left · ${paceText(box)}</p>
          </div>
          <button class="icon-button" type="button" data-close-modal aria-label="Close">×</button>
        </div>
        ${renderBoxDetail(box)}
        <div class="transaction-list" style="margin-top: 12px;">
          ${transactions.length ? transactions.map(renderTransaction).join("") : `<div class="transaction-item"><span>No entries yet.</span><strong>$0</strong></div>`}
        </div>
      </section>
    </div>
  `;
  const backdrop = modalRoot.querySelector(".modal-backdrop");
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeEditModal();
  });
  modalRoot.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeEditModal));
  modalRoot.querySelectorAll("[data-edit-txn]").forEach((button) => button.addEventListener("click", () => editTransaction(button.dataset.editTxn)));
  modalRoot.querySelectorAll("[data-delete-txn]").forEach((button) => button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTxn)));
}

function renderTransaction(item) {
  return `
    <div class="transaction-item">
      <span><strong>${escapeHtml(item.note || boxMeta[item.box]?.name || "Entry")}</strong><br><span class="muted">${formatDate(item.date)} · ${escapeHtml(item.type)}</span></span>
      <span><strong>${money(item.amount)}</strong><br><button class="mini-button" type="button" data-edit-txn="${item.transactionId}">Edit</button> <button class="mini-button" type="button" data-delete-txn="${item.transactionId}">Delete</button></span>
    </div>
  `;
}

function renderPoolEntry(item) {
  return `<div class="pool-item"><span><strong>${escapeHtml(item.sourceOrUse)}</strong><br><span class="muted">${formatDate(item.date)} · ${escapeHtml(item.note)}</span></span><strong class="${item.type === "spend" ? "negative" : "positive"}">${item.type === "spend" ? "-" : "+"}${money(item.amount)}</strong></div>`;
}

function renderCurrentMonthAnalysis(wallet) {
  const dashboard = getDashboard(wallet);
  const boxes = getBoxes(wallet);
  return `
    <div class="visual-grid">
      <article class="visual-card">
        <span>Box Progress</span>
        <div class="visual-list">
          ${boxes.map(renderBudgetVisualRow).join("")}
        </div>
      </article>
      <article class="visual-card">
        <span>This Month Breakdown</span>
        <div class="close-stack">
          ${renderCloseStackRow("Income Sources", dashboard.income, dashboard.income, "sage")}
          ${renderCloseStackRow("Fixed Bills", dashboard.fixedBills, dashboard.income, "blue")}
          ${renderCloseStackRow("Debt Payments", dashboard.debtPayments, dashboard.income, "grey")}
          ${renderCloseStackRow("Box Spending", boxes.reduce((acc, box) => acc + box.actualSpent, 0), dashboard.income, "amber")}
          ${renderCloseStackRow("Planned Saving", dashboard.plannedSaving, dashboard.income, "olive")}
        </div>
      </article>
    </div>
  `;
}

function renderReserveAnalysis(wallet) {
  const dashboard = getDashboard(wallet);
  const rows = getPoolMonthSummaries(wallet);
  return `
    <div class="visual-grid">
      <article class="visual-card">
        <span>Reserve Used This Month</span>
        <div class="close-stack">
          ${renderCloseStackRow("Starting Reserve", dashboard.pool.startingBalance, dashboard.pool.startingBalance + dashboard.pool.inflows || 1, "olive")}
          ${renderCloseStackRow("Inflows", dashboard.pool.inflows, dashboard.pool.startingBalance + dashboard.pool.inflows || 1, "sage")}
          ${renderCloseStackRow("Paid From Reserve", dashboard.pool.outflows, dashboard.pool.startingBalance + dashboard.pool.inflows || 1, "terra")}
          ${renderCloseStackRow("Covered Overages", dashboard.pool.overageCoverage, dashboard.pool.startingBalance + dashboard.pool.inflows || 1, "amber")}
          ${renderCloseStackRow("Reserve Available", dashboard.pool.available, dashboard.pool.startingBalance + dashboard.pool.inflows || 1, "blue")}
        </div>
      </article>
      <article class="visual-card">
        <span>Reserve Ending Trend</span>
        ${renderBarChart(`${wallets[wallet].reserveLabel} Ending`, "Recent month-end balances", rows.map((item) => item.month.slice(5)), rows.map((item) => item.ending), "olive")}
      </article>
      <article class="visual-card wide-visual">
        <span>Reserve Flow</span>
        <div class="reserve-flow">
          ${rows.map((row) => `
            <div class="reserve-month">
              <strong>${escapeHtml(row.month.slice(5))}</strong>
              <div class="reserve-bars">
                <i class="in" style="width:${barWidth(row.inflow, rows)}%"></i>
                <i class="out" style="width:${barWidth(row.outflow + row.coverage, rows)}%"></i>
              </div>
              <small>In ${money(row.inflow)} · Out ${money(row.outflow)} · Coverage ${money(row.coverage)} · End ${money(row.ending)}</small>
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderYearBreakdown(wallet) {
  const boxes = getBoxes(wallet);
  const months = getRecentActualMonths(wallet, 12);
  const manualTotals = months.map((month) => Object.values(month.boxes || {}).reduce((acc, value) => acc + value, 0));
  return `
    <div class="visual-grid">
      <article class="visual-card">
        <span>Manual Spending Trend</span>
        ${renderBarChart("Box Spend", "All spending boxes", months.map((item) => item.month.slice(5)), manualTotals, "sage")}
      </article>
      <article class="visual-card">
        <span>Reserve Trend</span>
        ${renderBarChart(`${wallets[wallet].reserveLabel}`, "Ending balance", months.map((item) => item.month.slice(5)), months.map((item) => item.poolEnding || 0), "olive")}
      </article>
      <article class="visual-card wide-visual">
        <span>Box Actuals</span>
        <div class="trend-matrix">
          <div></div>${months.map((month) => `<strong>${escapeHtml(month.month.slice(5))}</strong>`).join("")}
          ${boxes.map((box) => `
            <b>${escapeHtml(box.name)}</b>
            ${months.map((month) => `<em>${money(month.boxes?.[box.boxId] || 0)}</em>`).join("")}
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderDecisionVisuals(wallet) {
  const boxes = getBoxes(wallet);
  const months = getRecentActualMonths(wallet, 4);
  const reserveRows = getPoolMonthSummaries(wallet);
  return `
    <div class="visual-grid">
      <article class="visual-card">
        <span>Actual vs Budget</span>
        <div class="visual-list">
          ${boxes.map(renderBudgetVisualRow).join("")}
        </div>
      </article>
      <article class="visual-card">
        <span>4-Month Actuals</span>
        <div class="trend-matrix">
          <div></div>${months.map((month) => `<strong>${escapeHtml(month.month.slice(5))}</strong>`).join("")}
          ${boxes.map((box) => `
            <b>${escapeHtml(box.name)}</b>
            ${months.map((month) => `<em>${money(month.boxes?.[box.boxId] || 0)}</em>`).join("")}
          `).join("")}
        </div>
      </article>
      <article class="visual-card wide-visual">
        <span>${escapeHtml(wallets[wallet].reserveLabel)} Flow</span>
        <div class="reserve-flow">
          ${reserveRows.map((row) => `
            <div class="reserve-month">
              <strong>${escapeHtml(row.month.slice(5))}</strong>
              <div class="reserve-bars">
                <i class="in" style="width:${barWidth(row.inflow, reserveRows)}%"></i>
                <i class="out" style="width:${barWidth(row.outflow + row.coverage, reserveRows)}%"></i>
              </div>
              <small>In ${money(row.inflow)} · Out ${money(row.outflow)} · End ${money(row.ending)}</small>
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderBudgetVisualRow(box) {
  const actualWidth = Math.min(100, box.budget ? (box.actualSpent / box.budget) * 100 : 0);
  const projectedWidth = Math.min(100, box.budget ? (box.projectedSpend / box.budget) * 100 : 0);
  return `
    <div class="budget-visual-row">
      <div class="row">
        <strong>${escapeHtml(box.name)}</strong>
        <span>${money(box.actualSpent)} / ${money(box.budget)}</span>
      </div>
      <div class="dual-bar">
        <i class="${box.status}" style="width:${actualWidth}%"></i>
        <b style="left:${projectedWidth}%"></b>
      </div>
      <small class="muted">Expected ${money(box.projectedSpend)} if this pace continues · marker shows expected month-end</small>
    </div>
  `;
}

function renderDailySpendChart(rows) {
  const max = Math.max(...rows.map((row) => row.amount), 1);
  return `
    <div class="mini-chart daily-chart">
      ${rows.map((row) => `<div class="bar-col"><i class="amber" style="height:${Math.max(4, row.amount / max * 72)}px"></i><em>${escapeHtml(row.label)}</em><strong>${money(row.amount)}</strong></div>`).join("")}
    </div>
  `;
}

function renderEmptyState(title, action = "") {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong>${action ? `<span>${escapeHtml(action)}</span>` : ""}</div>`;
}

function barWidth(value, rows) {
  const max = Math.max(...rows.map((row) => row.inflow), ...rows.map((row) => row.outflow + row.coverage), 1);
  return Math.max(3, Math.min(100, (Math.abs(value) / max) * 100));
}

function renderMonthlySpendingTrend(wallet) {
  const months = getRecentActualMonths(wallet, 4);
  const totals = months.map((item) => Object.values(item.boxes || {}).reduce((acc, value) => acc + value, 0));
  return renderBarChart("Monthly Spending", "Manual boxes only", months.map((item) => item.month.slice(5)), totals, "sage");
}

function renderBudgetAccuracy(wallet) {
  const months = getRecentActualMonths(wallet, 4);
  const boxes = Object.entries(getPlan(state.currentMonth, wallet).boxes);
  const firstBox = boxes[0];
  if (!firstBox) return "";
  const [boxId, box] = firstBox;
  const variances = months.map((item) => {
    const actual = item.boxes?.[boxId] || 0;
    return box.budget ? ((actual - box.budget) / box.budget) * 100 : 0;
  });
  return `
    <article class="chart-card">
      <span>Budget Accuracy</span>
      <h3>${escapeHtml(box.name)}</h3>
      <div class="variance-row">
        ${variances.map((value, index) => `<div class="variance-pill ${value > 0 ? "terra" : "sage"}">${months[index].month.slice(5)} ${value > 0 ? "+" : ""}${Math.round(value)}%</div>`).join("")}
      </div>
    </article>
  `;
}

function renderPoolTrend(wallet) {
  const months = getRecentActualMonths(wallet, 4);
  const values = months.map((item) => item.poolEnding || 0);
  return renderBarChart(`${wallets[wallet].reserveLabel} Trend`, "Ending balance", months.map((item) => item.month.slice(5)), values, "olive");
}

function renderSavedTrend(wallet) {
  const months = getRecentActualMonths(wallet, 4);
  const values = months.map((item) => item.savedAmount || item.poolInflows || 0);
  return renderBarChart(wallet === "pw" ? "Saved Money Trend" : "Saved / Investment Trend", "Monthly saved amount", months.map((item) => item.month.slice(5)), values, "blue");
}

function renderBarChart(title, subtitle, labels, values, tone) {
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  return `
    <article class="chart-card">
      <span>${escapeHtml(title)}</span>
      <h3>${escapeHtml(subtitle)}</h3>
      <div class="mini-chart">
        ${values.map((value, index) => `<div class="bar-col"><i class="${tone}" style="height:${Math.max(4, Math.abs(value) / max * 72)}px"></i><em>${escapeHtml(labels[index])}</em></div>`).join("")}
      </div>
    </article>
  `;
}

function renderInvestmentVisualizer(items) {
  const rows = items.map((item) => {
    const previous = getPreviousInvestmentSnapshot(item.accountName, item.date);
    const change = previous ? item.marketValue - previous.marketValue - item.contribution + item.withdrawal : 0;
    return { ...item, change };
  });
  const maxChange = Math.max(...rows.map((item) => Math.abs(item.change)), 1);
  return `
    <div class="investment-visual">
      ${rows.map((item) => `
        <div class="investment-line">
          <div class="row"><strong>${escapeHtml(item.accountName)}</strong><span>${money(item.marketValue)} · change ${money(item.change)}</span></div>
          <div class="investment-track"><i class="${item.change < 0 ? "loss" : ""}" style="width:${Math.max(2, Math.abs(item.change) / maxChange * 100)}%"></i></div>
        </div>
      `).join("")}
    </div>
  `;
}

function getPreviousInvestmentSnapshot(accountName, beforeDate) {
  return state.investmentSnapshots
    .filter((item) => item.accountName === accountName && item.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

function getPlan(month, wallet) {
  const plan = structuredClone(getBasePlan(month, wallet));
  const override = state.monthlyOverrides?.[month]?.[wallet];
  if (!override) return plan;
  applyPlanPatch(plan, override);
  return plan;
}

function getBasePlan(month, wallet) {
  const version = state.yearPlanVersions
    .filter((item) => item.effectiveFrom <= month)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0] || state.yearPlanVersions[0];
  return structuredClone(version.plan[wallet]);
}

function getEditableYearPlan(wallet) {
  const future = state.yearPlanVersions.find((item) => item.effectiveFrom === nextMonthKey(state.currentMonth));
  if (future) return structuredClone(future.plan[wallet]);
  return getBasePlan(state.currentMonth, wallet);
}

function applyPlanPatch(plan, patch) {
  Object.entries(patch.deleted || {}).forEach(([section, ids]) => {
    if (section === "boxes") {
      ids.forEach((id) => delete plan.boxes[id]);
      return;
    }
    plan[section] = plan[section].filter((item) => !ids.includes(item.id));
  });

  Object.entries(patch.additions || {}).forEach(([section, additions]) => {
    if (section === "boxes") {
      Object.entries(additions || {}).forEach(([id, box]) => {
        plan.boxes[id] = { name: box.name, budget: Number(box.budget) || 0 };
      });
      return;
    }
    additions.forEach((item) => {
      if (!plan[section].some((row) => row.id === item.id)) plan[section].push({ ...item });
    });
  });

  ["incomeDefaults", "autoFixedItems", "baselineSavingItems"].forEach((section) => {
    Object.entries(patch[section] || {}).forEach(([id, amount]) => {
      const item = plan[section].find((row) => row.id === id);
      if (item) item.amount = amount;
    });
  });
  Object.entries(patch.boxes || {}).forEach(([id, budget]) => {
    if (plan.boxes[id]) plan.boxes[id].budget = budget;
  });
  if (patch.pool?.startingBalance !== undefined) plan.pool.startingBalance = patch.pool.startingBalance;
}

function setCurrentOverride(key, amount) {
  const [, section, id] = key.split(":");
  const wallet = state.activeWallet;
  state.monthlyOverrides[state.currentMonth] ||= {};
  state.monthlyOverrides[state.currentMonth][wallet] ||= {};
  const patch = state.monthlyOverrides[state.currentMonth][wallet];
  if (section === "box") {
    patch.boxes ||= {};
    patch.boxes[id] = amount;
  } else if (section === "pool") {
    patch.pool ||= {};
    patch.pool.startingBalance = amount;
  } else {
    const sectionName = section === "income" ? "incomeDefaults" : section === "fixed" ? "autoFixedItems" : "baselineSavingItems";
    patch[sectionName] ||= {};
    patch[sectionName][id] = amount;
  }
  save();
  showToast("This month plan changes saved");
  render();
}

function setFutureYearPlan(key, amount) {
  const [, section, id] = key.split(":");
  const wallet = state.activeWallet;
  const effectiveFrom = nextMonthKey(state.currentMonth);
  let version = state.yearPlanVersions.find((item) => item.effectiveFrom === effectiveFrom);
  if (!version) {
    const currentVersion = state.yearPlanVersions
      .filter((item) => item.effectiveFrom <= state.currentMonth)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
    version = {
      versionId: uid("plan"),
      effectiveFrom,
      createdAt: new Date().toISOString(),
      plan: structuredClone(currentVersion.plan)
    };
    state.yearPlanVersions.push(version);
  }
  const plan = version.plan[wallet];
  if (section === "box") plan.boxes[id].budget = amount;
  else if (section === "pool") plan.pool.startingBalance = amount;
  else {
    const sectionName = section === "income" ? "incomeDefaults" : section === "fixed" ? "autoFixedItems" : "baselineSavingItems";
    const item = plan[sectionName].find((row) => row.id === id);
    if (item) item.amount = amount;
  }
  save();
  showToast(`Future year plan starts ${effectiveFrom}`);
  render();
}

function addDebtToYearPlan(debt) {
  upsertDebtPlan(debt);
}

function syncDebtPaymentToPlan(debt) {
  const amount = debt.status === "active" ? debt.monthlyPayment : 0;
  const aliases = {
    mortgage: ["mortgage"],
    "car-loan": ["carPayment"],
    ikea: ["ikea"]
  };
  const ids = [debt.debtId, ...(aliases[debt.debtId] || [])];
  state.yearPlanVersions.forEach((version) => {
    const plan = version.plan?.[debt.wallet];
    if (!plan) return;
    plan.autoFixedItems.forEach((item) => {
      if (ids.includes(item.id)) {
        item.name = debt.name;
        item.amount = amount;
      }
    });
  });
  Object.values(state.monthlyOverrides || {}).forEach((walletOverrides) => {
    const patch = walletOverrides[debt.wallet];
    if (!patch?.autoFixedItems) return;
    ids.forEach((id) => {
      if (patch.autoFixedItems[id] !== undefined) patch.autoFixedItems[id] = amount;
    });
  });
}

function getBoxTransactions(wallet, boxId) {
  return state.transactions.filter((item) => item.wallet === wallet && item.month === state.currentMonth && item.box === boxId);
}

function getPoolMonthSummaries(wallet) {
  return getRecentActualMonths(wallet, 4).map((month) => ({
    month: month.month,
    inflow: month.poolInflows || 0,
    outflow: month.poolOutflows || 0,
    coverage: getMonthOverageFromSnapshot(month, wallet),
    ending: month.poolEnding || 0
  }));
}

function getRecentActualMonths(wallet, limit) {
  const snapshots = state.historicalMonths.filter((item) => item.wallet === wallet && item.month <= state.currentMonth);
  const current = getSnapshotForCurrentMonth(wallet);
  const merged = snapshots.filter((item) => item.month !== state.currentMonth).concat(current);
  return merged.sort((a, b) => a.month.localeCompare(b.month)).slice(-limit);
}

function getSnapshotForCurrentMonth(wallet) {
  const dashboard = getDashboardNoHistory(wallet);
  const boxes = {};
  getBoxes(wallet).forEach((box) => {
    boxes[box.boxId] = box.actualSpent;
  });
  return {
    month: state.currentMonth,
    wallet,
    incomeActual: dashboard.income,
    fixedBillsActual: dashboard.fixedBills,
    debtPaymentsActual: dashboard.debtPayments,
    autoLockedActual: dashboard.autoLocked,
    savedAmount: dashboard.plannedSaving + dashboard.pool.inflows,
    boxes,
    poolInflows: dashboard.pool.inflows,
    poolOutflows: dashboard.pool.outflows,
    poolEnding: dashboard.pool.available,
    closed: isClosed(state.currentMonth, wallet)
  };
}

function getDashboardNoHistory(wallet) {
  const plan = getPlan(state.currentMonth, wallet);
  const boxes = getBoxes(wallet);
  const pool = getPoolStatus(wallet, boxes);
  const fixedBills = sumAmounts(getFixedItems(plan, wallet));
  const debtPayments = getDebtPaymentTotal(wallet);
  return {
    income: sumAmounts(plan.incomeDefaults),
    fixedBills,
    debtPayments,
    autoLocked: fixedBills + debtPayments,
    plannedSaving: sumAmounts(plan.baselineSavingItems),
    pool
  };
}

function getMonthOverageFromSnapshot(month, wallet) {
  const plan = getPlan(month.month, wallet);
  return Object.entries(month.boxes || {}).reduce((acc, [boxId, actual]) => {
    const budget = plan.boxes?.[boxId]?.budget || 0;
    return acc + Math.max(0, actual - budget);
  }, 0);
}

function closeWalletMonth(wallet) {
  const closeSummary = getCloseSummary(wallet);
  state.closedMonths[state.currentMonth] ||= {};
  state.closedMonths[state.currentMonth][wallet] = {
    closed: true,
    closedAt: new Date().toISOString(),
    summaryText: closeSummary.text,
    summary: getSnapshotForCurrentMonth(wallet)
  };
  const snapshot = getSnapshotForCurrentMonth(wallet);
  state.historicalMonths = state.historicalMonths.filter((item) => !(item.month === state.currentMonth && item.wallet === wallet));
  state.historicalMonths.push({ ...snapshot, closed: true });
  save();
  showToast(`${wallets[wallet].label} month closed`);
  render();
}

function reopenWalletMonth(wallet) {
  if (state.closedMonths[state.currentMonth]) delete state.closedMonths[state.currentMonth][wallet];
  save();
  showToast(`${wallets[wallet].label} reopened`);
  render();
}

function isClosed(month, wallet) {
  if (state.closedMonths?.[month]?.[wallet]) return Boolean(state.closedMonths[month][wallet].closed);
  return Boolean(state.historicalMonths.find((item) => item.month === month && item.wallet === wallet && item.closed));
}

function getUnclosedMonths() {
  const months = [...new Set(state.historicalMonths.map((item) => item.month).concat(state.currentMonth))].sort();
  return months.flatMap((month) => Object.keys(wallets).map((wallet) => ({ month, wallet }))).filter((item) => !isClosed(item.month, item.wallet));
}

function getCloseReminder() {
  const today = new Date();
  if (today.getDate() > 7) return "";
  const previous = previousMonthKey(state.currentMonth);
  const needs = Object.keys(wallets).filter((wallet) => !isClosed(previous, wallet));
  if (!needs.length) return "";
  return `${previous} still needs closing for ${needs.map((wallet) => wallets[wallet].label).join(" and ")}.`;
}

function getLatestInvestments() {
  const latest = {};
  state.investmentSnapshots.forEach((item) => {
    if (!latest[item.accountName] || latest[item.accountName].date < item.date) latest[item.accountName] = item;
  });
  return Object.values(latest);
}

function getPayoffLabel(balance, payment, annualRate, fallbackMonth = "") {
  const months = estimatePayoffMonths(balance, payment, annualRate);
  if (months === 0) return "paid off";
  if (!Number.isFinite(months)) return fallbackMonth && fallbackMonth !== "TBD" ? `payoff ${fallbackMonth}` : "payoff unknown";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const pieces = [];
  if (years) pieces.push(`${years}y`);
  if (rest || !pieces.length) pieces.push(`${rest}m`);
  return `est. payoff ${pieces.join(" ")}`;
}

function estimatePayoffMonths(balance, payment, annualRate) {
  const principal = Number(balance) || 0;
  const monthlyPayment = Number(payment) || 0;
  const monthlyRate = (Number(annualRate) || 0) / 100 / 12;
  if (principal <= 0) return 0;
  if (monthlyPayment <= 0) return Infinity;
  if (monthlyRate <= 0) return Math.ceil(principal / monthlyPayment);
  if (monthlyPayment <= principal * monthlyRate) return Infinity;
  return Math.ceil(-Math.log(1 - (principal * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
}

function sumAmounts(rows) {
  return rows.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  if (!clean.length) return 0;
  return clean.reduce((acc, value) => acc + Number(value), 0) / clean.length;
}

function exportCsv() {
  const rows = [];
  const add = (recordType, record) => {
    rows.push({
      app_version: APP_VERSION,
      exported_at: new Date().toISOString(),
      record_type: recordType,
      ...record
    });
  };
  state.transactions.forEach((item) => add("transaction", item));
  state.poolEntries.forEach((item) => add("reserve_entry", item));
  state.historicalMonths.forEach((item) => add("budget_month", { ...item, boxes: JSON.stringify(item.boxes || {}) }));
  state.receivables.forEach((item) => add("receivable", item));
  state.receivablePayments.forEach((item) => add("receivable_payment", item));
  state.investmentSnapshots.forEach((item) => add("investment_snapshot", item));
  state.netWorthSnapshots.forEach((item) => add("net_worth_snapshot", item));
  state.debtPlans.forEach((item) => add("debt_plan", item));
  state.yearPlanVersions.forEach((item) => add("year_plan_version", { versionId: item.versionId, effectiveFrom: item.effectiveFrom, createdAt: item.createdAt, plan: JSON.stringify(item.plan) }));
  state.yearPlanVersions.forEach((version) => {
    Object.entries(version.plan || {}).forEach(([wallet, plan]) => {
      (plan.incomeDefaults || []).forEach((item) => add("plan_item", { versionId: version.versionId, effectiveFrom: version.effectiveFrom, wallet, section: "income_sources", itemId: item.id, name: item.name, amount: item.amount }));
      getFixedItems(plan, wallet).forEach((item) => add("plan_item", { versionId: version.versionId, effectiveFrom: version.effectiveFrom, wallet, section: "fixed_bills", itemId: item.id, name: item.name, amount: item.amount }));
      (plan.baselineSavingItems || []).forEach((item) => add("plan_item", { versionId: version.versionId, effectiveFrom: version.effectiveFrom, wallet, section: "baseline_saving", itemId: item.id, name: item.name, amount: item.amount }));
      Object.entries(plan.boxes || {}).forEach(([itemId, box]) => add("plan_item", { versionId: version.versionId, effectiveFrom: version.effectiveFrom, wallet, section: "spending_boxes", itemId, name: box.name, amount: box.budget }));
      add("plan_item", { versionId: version.versionId, effectiveFrom: version.effectiveFrom, wallet, section: "reserve", itemId: "startingBalance", name: `${plan.pool.name} Starting Balance`, amount: plan.pool.startingBalance });
    });
  });
  Object.entries(state.monthlyOverrides || {}).forEach(([month, walletsById]) => {
    Object.entries(walletsById).forEach(([wallet, patch]) => add("monthly_override", { month, wallet, patch: JSON.stringify(patch) }));
  });
  Object.entries(state.closedMonths || {}).forEach(([month, walletsById]) => {
    Object.entries(walletsById).forEach(([wallet, close]) => add("month_close", { month, wallet, closed: close.closed, closedAt: close.closedAt, summaryText: close.summaryText || "", summary: JSON.stringify(close.summary) }));
  });

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const csv = [headers.join(",")]
    .concat(rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")))
    .join("\n");
  downloadText(`box-budget-${state.currentMonth}-${APP_VERSION}.csv`, csv, "text/csv");
  showToast("CSV export ready");
}

function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCsv(String(reader.result || ""));
      const next = emptyImportState();
      rows.forEach((row) => importCsvRow(next, row));
      if (next._planItems.length) next.yearPlanVersions = buildPlanVersionsFromPlanItems(next._planItems);
      delete next._planItems;
      if (!next.yearPlanVersions.length) next.yearPlanVersions = structuredClone(demoState.yearPlanVersions);
      const months = rows.map((row) => row.month || row.date?.slice(0, 7) || row.effectiveFrom).filter(Boolean).sort();
      if (months.length) next.currentMonth = months.at(-1);
      state = normalizeState(next);
      save();
      showToast("CSV import complete");
      renderChrome();
      render();
    } catch {
      showToast("CSV import failed");
    }
  };
  reader.readAsText(file);
}

function exportJson() {
  const backup = {
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    data: state
  };
  downloadText(`finance-tracker-${state.currentMonth}-${APP_VERSION}.json`, JSON.stringify(backup, null, 2), "application/json");
  showToast("JSON export ready");
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state = normalizeState(parsed.data || parsed);
      save();
      showToast("JSON import complete");
      renderChrome();
      render();
    } catch {
      showToast("JSON import failed");
    }
  };
  reader.readAsText(file);
}

function emptyImportState() {
  return {
    ...structuredClone(demoState),
    appVersion: APP_VERSION,
    activeTab: "overview",
    activeWallet: "vewu",
    selectedBox: "",
    yearPlanVersions: [],
    monthlyOverrides: {},
    transactions: [],
    poolEntries: [],
    historicalMonths: [],
    receivables: [],
    receivablePayments: [],
    investmentSnapshots: [],
    netWorthSnapshots: [],
    debtPlans: [],
    closedMonths: {},
    _planItems: []
  };
}

function importCsvRow(next, row) {
  const type = row.record_type;
  if (type === "transaction") next.transactions.push(coerceRecord(row, ["amount"], ["excludedFromBudget"]));
  if (type === "reserve_entry") next.poolEntries.push(coerceRecord(row, ["amount"], []));
  if (type === "budget_month") next.historicalMonths.push({ ...coerceRecord(row, ["incomeActual", "fixedBillsActual", "debtPaymentsActual", "autoLockedActual", "savedAmount", "poolInflows", "poolOutflows", "poolEnding"], ["closed"]), boxes: parseJsonCell(row.boxes, {}) });
  if (type === "receivable") next.receivables.push(coerceRecord(row, ["startingBalance", "currentBalance", "expectedPayment", "interestRate"], []));
  if (type === "receivable_payment") next.receivablePayments.push(coerceRecord(row, ["amount"], []));
  if (type === "investment_snapshot") next.investmentSnapshots.push(coerceRecord(row, ["marketValue", "contribution", "withdrawal"], []));
  if (type === "net_worth_snapshot") next.netWorthSnapshots.push(coerceRecord(row, ["cashPool", "receivables", "investments", "homeEquity", "otherAssets", "mortgageBalance", "carLoanBalance", "otherLiabilities", "netWorth"], []));
  if (type === "debt_plan") next.debtPlans.push(coerceRecord(row, ["startingBalance", "currentBalance", "monthlyPayment", "interestRate"], []));
  if (type === "year_plan_version") next.yearPlanVersions.push({ versionId: row.versionId, effectiveFrom: row.effectiveFrom, createdAt: row.createdAt, plan: parseJsonCell(row.plan, {}) });
  if (type === "plan_item") next._planItems.push(row);
  if (type === "monthly_override") {
    next.monthlyOverrides[row.month] ||= {};
    next.monthlyOverrides[row.month][row.wallet] = parseJsonCell(row.patch, {});
  }
  if (type === "month_close") {
    next.closedMonths[row.month] ||= {};
    next.closedMonths[row.month][row.wallet] = {
      closed: parseBoolean(row.closed),
      closedAt: row.closedAt,
      summaryText: row.summaryText || "",
      summary: parseJsonCell(row.summary, {})
    };
  }
}

function buildPlanVersionsFromPlanItems(rows) {
  const versions = new Map();
  rows.forEach((row) => {
    const versionId = row.versionId || `${row.effectiveFrom || APP_MONTH}-plan`;
    const effectiveFrom = row.effectiveFrom || APP_MONTH;
    if (!versions.has(versionId)) {
      versions.set(versionId, {
        versionId,
        effectiveFrom,
        createdAt: new Date().toISOString(),
        plan: {
          vewu: blankWalletPlan("vewu"),
          pw: blankWalletPlan("pw")
        }
      });
    }
    const version = versions.get(versionId);
    const wallet = row.wallet || "vewu";
    version.plan[wallet] ||= blankWalletPlan(wallet);
    const plan = version.plan[wallet];
    const amount = Number(row.amount) || 0;
    const itemId = row.itemId || slugify(row.name);
    if (row.section === "income_sources") plan.incomeDefaults.push({ id: itemId, name: row.name, amount });
    if (row.section === "fixed_bills") plan.autoFixedItems.push({ id: itemId, name: row.name, amount });
    if (row.section === "baseline_saving") plan.baselineSavingItems.push({ id: itemId, name: row.name, amount });
    if (row.section === "spending_boxes") plan.boxes[itemId] = { name: row.name, budget: amount };
    if (row.section === "reserve") plan.pool.startingBalance = amount;
  });
  return [...versions.values()].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
}

function blankWalletPlan(wallet) {
  return {
    incomeDefaults: [],
    autoFixedItems: [],
    baselineSavingItems: [],
    boxes: {},
    pool: {
      name: wallets[wallet]?.reserveLabel || "Reserve",
      startingBalance: 0
    },
    extraIncomeRule: wallet === "pw" ? "Personal refunds default to Saved Money Reserve." : "Extra income defaults to Cash Reserve."
  };
}

function coerceRecord(row, numberFields, booleanFields) {
  const record = { ...row };
  delete record.app_version;
  delete record.exported_at;
  delete record.record_type;
  Object.keys(record).forEach((key) => {
    if (record[key] === "") delete record[key];
  });
  numberFields.forEach((field) => {
    if (record[field] !== undefined && record[field] !== "") record[field] = Number(record[field]) || 0;
  });
  booleanFields.forEach((field) => {
    record[field] = parseBoolean(record[field]);
  });
  return record;
}

function parseBoolean(value) {
  return value === true || value === "true" || value === "1";
}

function parseJsonCell(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift() || [];
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  if (!confirm("Reset demo data?")) return;
  state = structuredClone(demoState);
  save();
  showToast("Demo restored");
  renderChrome();
  render();
}

function defaultDate() {
  const today = getReferenceDate();
  const month = today.toISOString().slice(0, 7);
  if (month === state.currentMonth) return today.toISOString().slice(0, 10);
  return `${state.currentMonth}-01`;
}

function getReferenceDate() {
  const today = new Date();
  const month = today.toISOString().slice(0, 7);
  if (month === state.currentMonth) return today;
  const [year, monthIndex] = state.currentMonth.split("-").map(Number);
  return new Date(year, monthIndex, 0);
}

function getDaysInMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

function getElapsedDays(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const today = new Date();
  if (today.getFullYear() === year && today.getMonth() + 1 === monthIndex) return today.getDate();
  if (today < new Date(year, monthIndex - 1, 1)) return 1;
  return getDaysInMonth(month);
}

function getDayOfMonth(month) {
  return getElapsedDays(month);
}

function getDaysLeft(month) {
  return Math.max(1, getDaysInMonth(month) - getElapsedDays(month) + 1);
}

function getMonthElapsedPercent(month) {
  return getElapsedDays(month) / getDaysInMonth(month);
}

function isThisWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function nextMonthKey(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const next = monthIndex === 12 ? { year: year + 1, month: 1 } : { year, month: monthIndex + 1 };
  return `${next.year}-${String(next.month).padStart(2, "0")}`;
}

function money(value) {
  const amount = Number(value) || 0;
  const displayAmount = Math.round(Math.abs(amount));
  const formatted = displayAmount.toLocaleString("en-CA", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatMonthLabel(month) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || uid("item");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const template = document.querySelector("#toastTemplate");
  const toast = template.content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.remove(), 1900);
}
