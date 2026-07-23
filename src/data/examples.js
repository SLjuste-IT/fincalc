// ============================================================================
// Realistic example inputs, one set per calculator. These pre-fill the form AND
// drive the build-time prerender in src/pages/calc/[id].astro, so every page
// ships a genuine worked example in its static HTML — a real computed figure a
// crawler can index and a visitor sees on arrival — instead of the "$0.00" /
// "Enter your figures" shell that 72 of 77 pages used to ship (DEPLOY.md §5).
//
// Astro-only, like the guide layer: this is a presentation concern, so it stays
// out of the DOM-free engine (src/lib/calculators.js) and its app.js twin. The
// retiring standalone SPA keeps its 0 defaults — see [[finsuite-two-apps-fork]].
//
// The 8 calculators that also have a guide (src/data/guides.js) use the guide's
// exact scenario here, so the pre-filled calculator demonstrates the very example
// the guide walks through.
//
// CONTRACT: every set below must produce a valid, non-error, finite primary
// result. That is enforced by the "example defaults" block in
// scripts/verify-math.mjs — if a formula or field ever changes such that an
// example would render blank or error, the suite fails. Values were chosen from
// the verified scenarios in that same suite. Numbers for numeric fields; strings
// for select/date/text fields (they must match a real option value).
// ============================================================================

export const EXAMPLES = {
  /* -------------------------------------------------- Finance & Investment */
  tvm: { solveFor: "fv", nper: 10, rate: 6, pv: -10000, pmt: 0, fv: 0, type: "0" },
  currency: { amount: 1000, from: "USD", to: "EUR" },
  compound: { principal: 10000, rate: 7, freq: "12", years: 20, contribution: 200 },
  roi: { initial: 10000, final: 18000, years: 5 },
  irr_npv: { rate: 10, cashflows: "-10000, 3000, 4000, 4000, 5000" },
  bond: { face: 1000, coupon: 5, market: 6, years: 10, freq: "2" },
  tax_equiv_yield: { taxFreeYield: 3, taxBracket: 32 },
  rule72: { rate: 8, principal: 10000 },
  college_savings: { currentCost: 25000, yearsUntil: 10, inflation: 5, yearsInSchool: 4, currentSavings: 20000, monthly: 400, returnRate: 6 },
  investment_income: { principal: 500000, yieldRate: 4, freq: "4" },
  mutual_fund_fee: { investment: 10000, returnRate: 7, expenseRatio: 1, years: 20 },
  hsa: { contribution: 3000, employer: 1000, taxBracket: 24, returnRate: 5, years: 10 },
  savings_goal: { goal: 50000, current: 10000, years: 10, returnRate: 6 },
  cd: { deposit: 10000, rate: 5, termMonths: 18, freq: "365" },

  /* ------------------------------------------------------- Loan & Mortgage */
  loan_basic: { amount: 25000, rate: 7, years: 5, freq: "12", extra: 0 },
  loan_compare: { amountA: 20000, rateA: 7, termA: 5, amountB: 20000, rateB: 6, termB: 5 },
  loan_refi: { balance: 250000, currentRate: 7, remainingYears: 25, newRate: 5.5, newTerm: 30, closingCosts: 5000 },
  apr: { amount: 300000, rate: 6.5, years: 30, fees: 6000 },
  apr_advanced: { amount: 300000, rate: 6.5, years: 30, originationFee: 3000, otherFees: 2500, points: 1 },
  commercial_loan: { amount: 1000000, rate: 6.5, amortYears: 25, balloonYears: 5 },
  loan_analysis: { amount: 300000, rate: 6.5, years: 30, extra: 300 },
  home_afford: { income: 90000, monthlyDebts: 500, downPayment: 40000, rate: 6.5, years: 30, dti: 36 },
  rent_vs_buy: { rent: 2000, rentGrowth: 3, homePrice: 350000, downPayment: 70000, rate: 6.5, term: 30, appreciation: 3, years: 7 },
  mortgage_tax: { amount: 300000, rate: 6.5, years: 30, loanYear: 1, taxBracket: 24 },
  discount_points: { amount: 300000, baseRate: 6.5, rateReduction: 0.25, points: 2, years: 30 },
  arm: { amount: 300000, initialRate: 5, initialYears: 5, adjustedRate: 7, years: 30 },
  fixed_vs_arm: { amount: 300000, fixedRate: 6.5, armInitialRate: 5.5, armInitialYears: 5, armAdjustedRate: 7.5, years: 30 },
  biweekly: { amount: 250000, rate: 6, years: 30 },
  interest_only: { amount: 300000, rate: 6, ioYears: 10, totalYears: 30 },
  rental_property: { price: 300000, downPayment: 60000, rate: 6.5, term: 30, rent: 2500, expenses: 800, vacancy: 5 },

  /* ------------------------------------------------------------- Retirement */
  retirement_planner: { currentAge: 30, retireAge: 65, currentSavings: 50000, monthly: 500, returnRate: 7, desiredIncome: 60000, lifeExpectancy: 90 },
  "401k_contribution": { salary: 70000, contribPct: 6, matchPct: 50, matchLimit: 6, currentBalance: 20000, years: 30, returnRate: 7 },
  "401k_max": { salary: 120000, currentContribPct: 8, irsLimit: 23000, payPeriods: "26" },
  retirement_savings_analysis: { currentSavings: 50000, monthly: 400, yearsToRetire: 20, returnRate: 6, desiredIncome: 40000, withdrawalYears: 25, withdrawalReturn: 4 },
  retirement_income_analysis: { nestEgg: 1000000, withdrawalRate: 4, returnRate: 5, inflation: 2, years: 30 },
  ira: { annualContribution: 6000, years: 20, currentTaxRate: 24, retirementTaxRate: 22, returnRate: 6 },
  rmd: { balance: 500000, age: 75 },
  ss_estimator: { aime: 6000, claimAge: "67" },
  ss_analysis: { pia: 2000, lifeExpectancy: 85 },
  ss_distribution: { annualBenefit: 24000, otherIncome: 40000, filing: "single" },
  asset_allocation: { age: 40, risk: "moderate" },
  retirement_income_calc: { nestEgg: 1000000, years: 25, returnRate: 5, inflation: 2 },
  retirement_calc: { currentAge: 40, retireAge: 65, currentSavings: 20000, monthly: 300, returnRate: 7, lifeExpectancy: 90, desiredMonthlyIncome: 4000 },
  annuity: { solveFor: "fv", payment: 500, targetFV: 0, rate: 6, years: 10, type: "ordinary" },

  /* ------------------------------------------------------------ Credit Card */
  cc_payoff: { balance: 6000, apr: 22, payment: 250 },
  cc_minimum: { balance: 5000, apr: 22, minPct: 3, minFloor: 25 },

  /* ------------------------------------------------------- Auto Loan & Lease */
  auto_loan: { price: 35000, downPayment: 5000, tradeIn: 0, rate: 6.5, termMonths: 60, salesTax: 6 },
  auto_lease: { capCost: 40000, capReduction: 2000, residualPct: 55, moneyFactor: 0.00125, termMonths: 36, salesTax: 8 },

  /* ----------------------------------------------------------- Miscellaneous */
  tip: { bill: 120, tipPct: 20, people: 4 },
  discount_tax: { price: 80, discount: 25, tax: 10 },
  percentage: { mode: "of", x: 15, y: 240 },
  // date_calc omitted on purpose: its fields default to today / today+30 days, so
  // it already ships a real "30 days" result rather than a zero.
  unit_conversion: { category: "length", value: 10, from: "mi", to: "km" },
  inflation: { amount: 1000, startYear: "2000", endYear: "2024" },
  tbill: { faceValue: 10000, purchasePrice: 9800, daysToMaturity: 182 },
  margin_markup: { cost: 60, price: 100 },
  business_forecast: { currentRevenue: 100000, growthRate: 10, years: 3 },
  fuel: { distance: 300, mpg: 25, fuelPrice: 3.5 },
  hourly_salary: { mode: "toSalary", hourly: 25, salary: 0, hoursPerWeek: 40, weeksPerYear: 50 },
  salary_increase: { currentSalary: 85000, raisePct: 4 },
  paycheck_tax: { grossIncome: 100000, filing: "single", frequency: "26", stateTax: 5 },
  net_distribution: { desiredNet: 10000, taxRate: 20, fees: 2 },
  effective_rate: { nominal: 12, compounding: "12" },
  balance_sheet: { assets: 500000, liabilities: 300000, revenue: 400000, expenses: 350000 },
  financial_ratios: { currentAssets: 200000, currentLiabilities: 100000, totalDebt: 150000, totalEquity: 250000, netIncome: 50000, revenue: 400000, totalAssets: 400000 },

  /* -------------------------------------------------------------------- Stock */
  stock_return: { buyPrice: 50, sellPrice: 70, shares: 100, dividends: 200, fees: 50, years: 3 },
  stock_constant_growth: { d0: 2, growth: 4, requiredReturn: 9 },
  stock_nonconstant_growth: { d0: 2, highGrowth: 10, highGrowthYears: 3, stableGrowth: 3, requiredReturn: 9 },
  capm: { riskFree: 3, beta: 1.2, marketReturn: 10 },
  expected_return: { p1: 30, r1: 10, p2: 50, r2: 6, p3: 20, r3: -4 },
  holding_period_return: { beginValue: 100, endValue: 110, income: 5 },
  wacc: { equityValue: 600000, debtValue: 400000, costEquity: 10, costDebt: 6, taxRate: 25 },
  black_scholes: { spot: 100, strike: 100, time: 1, riskFree: 5, volatility: 20, type: "call" },
  pivot_points: { high: 110, low: 90, close: 100 },
  fibonacci: { high: 100, low: 50, trend: "up" },
  dividend_tax: { qualified: 10000, ordinary: 5000, bracket: "35" },
  commodities_futures: { entryPrice: 50, exitPrice: 55, contracts: 3, tickValue: 1000, position: "long" },
};

// Returns calc.fields with example values substituted as the field default, so a
// single source drives the server prerender, the pre-filled form, and Reset. A
// field without an example keeps its original default; a calculator without an
// entry is returned unchanged.
export function fieldsWithExamples(calc) {
  const ex = EXAMPLES[calc.id];
  if (!ex) return calc.fields;
  return calc.fields.map((f) => (ex[f.key] !== undefined ? { ...f, default: ex[f.key] } : f));
}
