// Math verification suite for every KakouCalc calculator.
// Run with: node scripts/verify-math.mjs
//
// Expected values are computed here INDEPENDENTLY of src/lib/calculators.js —
// closed forms typed from the standard finance formulas, or brute-force
// month-by-month simulation loops — so a shared bug cannot hide by agreeing
// with itself. Where a canonical textbook value exists (e.g. Black-Scholes
// S=K=100, T=1, r=5%, sigma=20% => call 10.4506) it is asserted directly.

import { CALC_INDEX, CATEGORIES } from "../src/lib/calculators.js";
import { EXAMPLES, fieldsWithExamples } from "../src/data/examples.js";
import { chartData } from "../src/lib/charts.js";
import { GUIDES } from "../src/data/guides.js";
import { EXPLAINERS } from "../src/data/explainers.js";
import { explainerHtml } from "../src/lib/explain.js";

let pass = 0, fail = 0;
const failures = [];
function ok(cond, label, detail = "") {
  if (cond) { pass++; }
  else { fail++; failures.push(label + (detail ? `  [${detail}]` : "")); }
}
function close(actual, expected, tol, label) {
  const good = Number.isFinite(actual) && Math.abs(actual - expected) <= tol;
  ok(good, label, `expected ${expected}, got ${actual}`);
}
// Parse "$1,234.56", "-$12.00", "12.34%", "1,234", "9.0 yrs" back to a number.
function num(s) {
  const m = String(s).replace(/[$,]/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}
function defaultsFor(id) {
  const v = {};
  for (const f of CALC_INDEX[id].fields) v[f.key] = f.type === "select" || f.type === "date" || f.type === "text" ? f.default : Number(f.default);
  return v;
}
function run(id, overrides = {}) {
  return CALC_INDEX[id].compute({ ...defaultsFor(id), ...overrides });
}
function cell(res, key) {
  const c = (res.cells || []).find((c) => String(c.k).toLowerCase().includes(key.toLowerCase()));
  return c ? c.v : undefined;
}

/* ---------- independent reference implementations ---------- */
// Level monthly payment on a loan (standard annuity formula).
const loanPmt = (P, annualPct, years, perYear = 12) => {
  const r = annualPct / 100 / perYear, n = Math.round(years * perYear);
  return r === 0 ? P / n : P * r / (1 - (1 + r) ** -n);
};
// Simulate an amortization to payoff; returns { months, totalInterest, balanceAt: (k) => ... }
function simLoan(P, annualPct, years, perYear = 12, extra = 0) {
  const r = annualPct / 100 / perYear;
  const pay = loanPmt(P, annualPct, years, perYear);
  let bal = P, ti = 0, k = 0;
  const balances = [];
  while (bal > 0.01 && k < 100000) {
    k++;
    const i = bal * r;
    let pr = pay - i + extra;
    if (pr > bal) pr = bal;
    bal -= pr; ti += i;
    balances.push(bal);
  }
  return { periods: k, totalInterest: ti, payment: pay, balanceAt: (j) => (j <= 0 ? P : balances[Math.min(j, balances.length) - 1]) };
}
// Future value by brute-force simulation: start lump, add c per period, grow at r per period.
function simFV(lump, c, rPerPeriod, periods) {
  let b = lump;
  for (let i = 0; i < periods; i++) b = b * (1 + rPerPeriod) + c;
  return b;
}
const annuityFactor = (r, n) => (r === 0 ? n : ((1 + r) ** n - 1) / r); // FV of $1/period
const pvAnnuity = (r, n) => (r === 0 ? n : (1 - (1 + r) ** -n) / r);    // PV of $1/period

/* ================================================================
   2. No calculator throws or emits NaN/Infinity on plausible inputs
   ================================================================ */
{
  const generic = { currency: 10000, percent: 5, number: 10 };
  for (const cat of CATEGORIES) {
    for (const c of cat.calcs) {
      const v = defaultsFor(c.id);
      for (const f of c.fields) if (f.type in generic) v[f.key] = generic[f.type];
      let res, threw = false;
      try { res = c.compute(v); } catch (e) { threw = true; }
      ok(!threw, `${c.id}: compute() must not throw on plausible inputs`);
      if (!threw && res && !res.error && res.primary) {
        const bad = /NaN|Infinity|undefined|null/.test(String(res.primary.value));
        ok(!bad, `${c.id}: primary value must be a real figure`, String(res.primary.value));
      }
    }
  }
  ok(Object.keys(CALC_INDEX).length === 77, "registry: 77 calculators present", `got ${Object.keys(CALC_INDEX).length}`);
}

/* ================================================================
   3. Known-bug regression tests (these are the RED cases)
   ================================================================ */

// --- annuity: "Required Payment" must be a positive figure -------------------
{
  // Save $100,000 in 10 years at 6%/yr compounded monthly:
  // required deposit = FV * r / ((1+r)^n - 1)
  const r = 0.06 / 12, n = 120;
  const expected = 100000 * r / ((1 + r) ** n - 1); // ≈ $610.21
  const res = run("annuity", { solveFor: "pmt", targetFV: 100000, rate: 6, years: 10, type: "ordinary" });
  close(num(res.primary.value), expected, 0.02, "annuity: required payment is positive and correct");
  close(num(cell(res, "Total Contributions")), expected * n, 2, "annuity: total contributions positive");
  // FV mode (already correct): $500/mo at 6% for 10y
  const res2 = run("annuity", { solveFor: "fv", payment: 500, rate: 6, years: 10, type: "ordinary" });
  close(num(res2.primary.value), simFV(0, 500, r, n), 0.02, "annuity: future value matches simulation");
  // Annuity due: each deposit earns one extra period
  const res3 = run("annuity", { solveFor: "fv", payment: 500, rate: 6, years: 10, type: "due" });
  close(num(res3.primary.value), simFV(0, 500, r, n) * (1 + r), 0.02, "annuity: due-mode FV = ordinary × (1+r)");
}

// --- TVM: solve-for-rate must work for BOTH sign conventions -----------------
{
  // Lender view: deposit 1000 (outflow, -1000), receive 2000 in 10 periods.
  const resA = run("tvm", { solveFor: "rate", nper: 10, pv: -1000, pmt: 0, fv: 2000 });
  close(num(resA.primary.value), (2 ** 0.1 - 1) * 100, 0.01, "tvm rate: investor signs (pv<0, fv>0)");
  // Borrower view: receive 1000 now (+1000), repay 2000 (-2000) in 10 periods.
  const resB = run("tvm", { solveFor: "rate", nper: 10, pv: 1000, pmt: 0, fv: -2000 });
  close(num(resB.primary.value), (2 ** 0.1 - 1) * 100, 0.01, "tvm rate: borrower signs (pv>0, fv<0)");
  // No solution: all cash flows positive — must say so, not report 500%.
  const resC = run("tvm", { solveFor: "rate", nper: 10, pv: 1000, pmt: 0, fv: 2000 });
  ok(!!resC.error, "tvm rate: impossible inputs produce an error, not a number");
}

// --- unit_conversion: cross-category conversion must error -------------------
{
  const res = run("unit_conversion", { category: "length", value: 10, from: "m", to: "kg" });
  ok(!!res.error, "unit_conversion: meters → kilograms is an error, not a number");
  const res2 = run("unit_conversion", { value: 10, from: "mi", to: "km" });
  close(num(res2.primary.value), 16.0934, 0.001, "unit_conversion: 10 mi = 16.0934 km");
  const res3 = run("unit_conversion", { value: 212, from: "f", to: "c" });
  close(num(res3.primary.value), 100, 0.0001, "unit_conversion: 212°F = 100°C");
  const res4 = run("unit_conversion", { value: 5, from: "lb", to: "oz" });
  close(num(res4.primary.value), 80, 0.01, "unit_conversion: 5 lb = 80 oz");
}

// --- cc_payoff: 0% APR must divide, not NaN ---------------------------------
{
  const res = run("cc_payoff", { balance: 1200, apr: 0, payment: 100 });
  close(num(res.primary.value), 12, 0.01, "cc_payoff: $1,200 at 0% APR, $100/mo = 12 months");
  close(num(cell(res, "Total Interest")), 0, 0.01, "cc_payoff: 0% APR pays zero interest");
  // Standard case: closed form n = -ln(1 - Br/P)/ln(1+r)
  const r = 0.18 / 12;
  const months = -Math.log(1 - (5000 * r) / 150) / Math.log(1 + r);
  const res2 = run("cc_payoff", { balance: 5000, apr: 18, payment: 150 });
  close(num(res2.primary.value), months, 0.05, "cc_payoff: 18% APR case matches closed form");
  ok(!!run("cc_payoff", { balance: 5000, apr: 18, payment: 70 }).error, "cc_payoff: payment below interest errors");
}

// --- 0% expected-return inputs must not NaN out to $0 ------------------------
{
  const res = run("retirement_planner", { currentAge: 30, retireAge: 60, currentSavings: 10000, monthly: 100, returnRate: 0, desiredIncome: 40000, lifeExpectancy: 85 });
  close(num(res.primary.value), 10000 + 100 * 360, 0.01, "retirement_planner: 0% return = savings + contributions");
  close(num(cell(res, "Estimated Need")), 40000 * 25, 0.01, "retirement_planner: 0% return need = income × years");

  const res2 = run("401k_contribution", { salary: 100000, contribPct: 10, matchPct: 50, matchLimit: 6, currentBalance: 50000, years: 20, returnRate: 0 });
  close(num(res2.primary.value), 50000 + 13000 * 20, 0.01, "401k_contribution: 0% return = balance + contributions");

  const res3 = run("retirement_savings_analysis", { currentSavings: 10000, monthly: 200, yearsToRetire: 10, returnRate: 0, desiredIncome: 20000, withdrawalYears: 20, withdrawalReturn: 0 });
  const egg = 10000 + 200 * 120;
  close(num(cell(res3, "Projected Nest Egg")), egg, 0.01, "retirement_savings_analysis: 0% nest egg");
  close(num(res3.primary.value), egg / 20, 0.01, "retirement_savings_analysis: 0% sustainable income = egg / years");

  const res4 = run("ira", { annualContribution: 6000, years: 20, currentTaxRate: 24, retirementTaxRate: 22, returnRate: 0 });
  close(num(cell(res4, "Traditional")), 6000 * 20 * 0.78, 0.01, "ira: 0% return traditional after-tax");
  close(num(cell(res4, "Roth")), 6000 * 0.76 * 20, 0.01, "ira: 0% return roth after-tax");

  const res5 = run("hsa", { contribution: 3000, employer: 1000, taxBracket: 24, returnRate: 0, years: 10 });
  close(num(res5.primary.value), 40000, 0.01, "hsa: 0% return = sum of contributions");

  const res6 = run("retirement_calc", { currentAge: 40, retireAge: 65, currentSavings: 20000, monthly: 300, returnRate: 0, lifeExpectancy: 90, desiredMonthlyIncome: 3000 });
  close(num(res6.primary.value), 20000 + 300 * 300, 0.01, "retirement_calc: 0% return accumulation");

  const res7 = run("bond", { face: 1000, coupon: 5, market: 0, years: 10, freq: "2" });
  close(num(res7.primary.value), 1000 + 25 * 20, 0.01, "bond: 0% market yield = face + sum of coupons");
}

// --- ss_distribution: match the IRS worksheet tiers --------------------------
{
  // Middle tier is capped at 50% of the benefit, not 85%.
  const res = run("ss_distribution", { annualBenefit: 1000, otherIncome: 30000, filing: "single" });
  close(num(res.primary.value), 500, 0.01, "ss_distribution: tier-1 capped at 50% of benefit");
  // Just over the second threshold, small benefit.
  const res2 = run("ss_distribution", { annualBenefit: 1000, otherIncome: 33800, filing: "single" });
  close(num(res2.primary.value), Math.min(0.85 * 300 + Math.min(4500, 500), 850), 0.01, "ss_distribution: tier-2 inner 50% cap");
  // Large benefit, high income → 85% cap binds (unchanged behavior).
  const res3 = run("ss_distribution", { annualBenefit: 30000, otherIncome: 80000, filing: "single" });
  close(num(res3.primary.value), 25500, 0.01, "ss_distribution: 85% overall cap");
  // Below first threshold → $0 taxable.
  const res4 = run("ss_distribution", { annualBenefit: 20000, otherIncome: 10000, filing: "single" });
  close(num(res4.primary.value), 0, 0.01, "ss_distribution: below threshold nothing taxable");
}

// --- rmd: no RMD before age 73 (SECURE 2.0) ----------------------------------
{
  ok(!!run("rmd", { balance: 500000, age: 65 }).error, "rmd: age 65 → no RMD, explain instead of a figure");
  ok(!!run("rmd", { balance: 500000, age: 72 }).error, "rmd: age 72 → no RMD under current law");
  const res = run("rmd", { balance: 500000, age: 75 });
  close(num(res.primary.value), 500000 / 24.6, 0.01, "rmd: age 75 divisor 24.6");
  const res2 = run("rmd", { balance: 500000, age: 104 });
  close(num(res2.primary.value), 500000 / 6.4, 0.01, "rmd: ages past 100 clamp to the table end");
}

// --- rent_vs_buy: mortgage payments stop at payoff ---------------------------
{
  // 15-year mortgage compared over 20 years: only 180 payments exist.
  const v = { rent: 2000, rentGrowth: 0, homePrice: 300000, downPayment: 60000, rate: 6, term: 15, appreciation: 0, years: 20 };
  // Full schedule sums to exactly principal + interest (last payment partial).
  const sim = simLoan(240000, 6, 15);
  const buyCost = 240000 + sim.totalInterest + 60000;
  const equity = 300000 - 0; // loan fully repaid, no appreciation
  const expectedNetBuy = buyCost - equity;
  const res = run("rent_vs_buy", v);
  close(num(cell(res, "Net Cost of Buying")), expectedNetBuy, 5, "rent_vs_buy: no phantom payments after payoff");
}

// --- stock_nonconstant_growth: terminal growth must be < required return -----
{
  ok(!!run("stock_nonconstant_growth", { d0: 2, highGrowth: 10, highGrowthYears: 3, stableGrowth: 8, requiredReturn: 7 }).error,
    "stock_nonconstant_growth: g ≥ r is an error, not a negative price");
  // Hand-computed two-stage DDM: D0=2, 10% × 3y, then 3% forever, r=9%.
  const r = 0.09;
  let pv = 0, d = 2;
  for (let t = 1; t <= 3; t++) { d *= 1.10; pv += d / (1 + r) ** t; }
  const tv = (d * 1.03) / (r - 0.03);
  const expected = pv + tv / (1 + r) ** 3;
  const res = run("stock_nonconstant_growth", { d0: 2, highGrowth: 10, highGrowthYears: 3, stableGrowth: 3, requiredReturn: 9 });
  close(num(res.primary.value), expected, 0.01, "stock_nonconstant_growth: two-stage DDM value");
}

// --- dividend_tax: 35% bracket maps to the 15% qualified rate ----------------
{
  const res = run("dividend_tax", { qualified: 10000, ordinary: 5000, bracket: "35" });
  close(num(cell(res, "Qualified Div. Tax Rate")), 15, 0.01, "dividend_tax: 35% bracket → 15% qualified rate");
  const res2 = run("dividend_tax", { qualified: 10000, ordinary: 0, bracket: "37" });
  close(num(cell(res2, "Qualified Div. Tax Rate")), 20, 0.01, "dividend_tax: 37% bracket → 20% qualified rate");
  const res3 = run("dividend_tax", { qualified: 10000, ordinary: 0, bracket: "12" });
  close(num(res3.primary.value), 0, 0.01, "dividend_tax: 12% bracket → 0% on qualified");
}

// --- cd: yield figure must be annualized (APY), not total-term ---------------
{
  // 18-month CD at 5% nominal, daily compounding.
  const maturity = 10000 * (1 + 0.05 / 365) ** (365 * 1.5);
  const apy = ((maturity / 10000) ** (12 / 18) - 1) * 100; // ≈ 5.127%
  const res = run("cd", { deposit: 10000, rate: 5, termMonths: 18, freq: "365" });
  close(num(res.primary.value), maturity, 0.02, "cd: maturity value (daily compounding, 18mo)");
  close(num(cell(res, "APY")), apy, 0.01, "cd: yield cell is annualized APY");
}

// --- guards that used to emit garbage figures --------------------------------
{
  ok(!!run("net_distribution", { desiredNet: 10000, taxRate: 80, fees: 25 }).error, "net_distribution: tax+fees ≥ 100% errors");
  ok(!!run("tax_equiv_yield", { taxFreeYield: 3, taxBracket: 100 }).error, "tax_equiv_yield: 100% bracket errors");
  const res = run("ss_analysis", { pia: 2000, lifeExpectancy: 65 });
  ok(num(cell(res, "Claim at 67")) >= 0, "ss_analysis: lifetime totals never negative");
}

/* ================================================================
   4. Spot checks of every remaining calculator against
      independent formulas / simulations / canonical values
   ================================================================ */

// TVM solves (Excel conventions)
{
  const r = 0.005, n = 120;
  close(num(run("tvm", { solveFor: "fv", nper: n, rate: 0.5, pv: -10000, pmt: -100 }).primary.value),
    simFV(10000, 100, r, n), 0.02, "tvm: FV of 10k + 100/period at 0.5%/period");
  close(num(run("tvm", { solveFor: "pv", nper: n, rate: 0.5, pmt: -500, fv: 0 }).primary.value),
    500 * pvAnnuity(r, n), 0.02, "tvm: PV of 500/period annuity");
  close(num(run("tvm", { solveFor: "pmt", nper: 360, rate: 0.5, pv: 200000, fv: 0 }).primary.value),
    -loanPmt(200000, 6, 30), 0.02, "tvm: payment on 200k loan (negative = outflow)");
  const nper = Math.log(2) / Math.log(1.005);
  close(num(run("tvm", { solveFor: "nper", rate: 0.5, pv: -1000, pmt: 0, fv: 2000 }).primary.value),
    nper, 0.01, "tvm: periods to double at 0.5%/period");
}

// Currency converter: pure cross-rate arithmetic on the live table
{
  const { FX } = await import("../src/lib/calculators.js");
  const res = run("currency", { amount: 100, from: "EUR", to: "JPY" });
  close(num(res.primary.value), (100 / FX.EUR) * FX.JPY, 0.01, "currency: EUR→JPY cross rate");
}

// Compound interest
{
  const res = run("compound", { principal: 10000, rate: 6, freq: "12", years: 10, contribution: 100 });
  close(num(res.primary.value), simFV(10000, 100, 0.005, 120), 0.02, "compound: matches month-by-month simulation");
  const res2 = run("compound", { principal: 5000, rate: 0, freq: "12", years: 5, contribution: 50 });
  close(num(res2.primary.value), 5000 + 50 * 60, 0.01, "compound: 0% rate = principal + contributions");
}

// ROI
{
  const res = run("roi", { initial: 10000, final: 18000, years: 5 });
  close(num(res.primary.value), 80, 0.01, "roi: total ROI 80%");
  close(num(cell(res, "Annualized")), ((18000 / 10000) ** 0.2 - 1) * 100, 0.01, "roi: CAGR");
}

// IRR / NPV
{
  const cfs = [-10000, 3000, 4000, 4000, 5000];
  const myNPV = (rate) => cfs.reduce((a, cf, i) => a + cf / (1 + rate) ** i, 0);
  const res = run("irr_npv", { rate: 10, cashflows: "-10000, 3000, 4000, 4000, 5000" });
  close(num(res.primary.value), myNPV(0.10), 0.01, "irr_npv: NPV at 10%");
  const irrPct = num(cell(res, "IRR"));
  close(myNPV(irrPct / 100), 0, 0.5, "irr_npv: NPV at reported IRR ≈ 0");
  ok(cell(run("irr_npv", { rate: 10, cashflows: "1000, 2000, 3000" }), "IRR") === "N/A", "irr_npv: no sign change → IRR N/A");
}

// Bond pricing
{
  const res = run("bond", { face: 1000, coupon: 5, market: 6, years: 10, freq: "2" });
  const expected = 25 * pvAnnuity(0.03, 20) + 1000 * 1.03 ** -20; // 925.61
  close(num(res.primary.value), expected, 0.01, "bond: semi-annual discount bond price");
  close(num(cell(res, "Current Yield")), 50 / expected * 100, 0.01, "bond: current yield");
}

// Tax-equivalent yield, Rule of 72
{
  close(num(run("tax_equiv_yield", { taxFreeYield: 3, taxBracket: 32 }).primary.value), 3 / 0.68, 0.01, "tax_equiv_yield: 3% at 32% bracket");
  const res = run("rule72", { rate: 8, principal: 1000 });
  close(num(res.primary.value), 9, 0.01, "rule72: 72/8 = 9 years");
  close(num(cell(res, "Exact")), Math.log(2) / Math.log(1.08), 0.01, "rule72: exact doubling time");
}

// College savings
{
  const v = { currentCost: 25000, yearsUntil: 10, inflation: 5, yearsInSchool: 4, currentSavings: 20000, monthly: 400, returnRate: 6 };
  const futureCost = 25000 * 1.05 ** 10;
  const fv = simFV(20000, 400, 0.005, 120);
  const res = run("college_savings", v);
  close(num(cell(res, "Future Annual Cost")), futureCost, 0.02, "college_savings: inflated annual cost");
  close(num(cell(res, "Projected Savings")), fv, 0.02, "college_savings: projected savings");
  close(num(res.primary.value), Math.abs(futureCost * 4 - fv), 0.05, "college_savings: shortfall");
}

// Investment income, mutual fund fees, HSA (nonzero rate), savings goal
{
  const res = run("investment_income", { principal: 500000, yieldRate: 4, freq: "4" });
  close(num(res.primary.value), 5000, 0.01, "investment_income: 4% of 500k quarterly");
  const mf = run("mutual_fund_fee", { investment: 10000, returnRate: 7, expenseRatio: 1, years: 20 });
  close(num(mf.primary.value), 10000 * 1.07 ** 20 - 10000 * 1.06 ** 20, 0.02, "mutual_fund_fee: 20-year fee drag");
  const hsa = run("hsa", { contribution: 3000, employer: 1000, taxBracket: 24, returnRate: 5, years: 10 });
  close(num(hsa.primary.value), simFV(0, 4000, 0.05, 10), 0.02, "hsa: annual-compounding growth");
  const sg = run("savings_goal", { goal: 50000, current: 10000, years: 10, returnRate: 6 });
  const needMonthly = (50000 - 10000 * 1.005 ** 120) * 0.005 / (1.005 ** 120 - 1);
  close(num(sg.primary.value), needMonthly, 0.02, "savings_goal: required monthly deposit");
}

// Loans
{
  const res = run("loan_basic", { amount: 200000, rate: 6, years: 30, freq: "12", extra: 0 });
  const sim = simLoan(200000, 6, 30);
  close(num(res.primary.value), sim.payment, 0.01, "loan_basic: 200k @6% 30y payment ($1,199.10)");
  close(num(cell(res, "Total Interest")), sim.totalInterest, 1, "loan_basic: total interest vs simulation");
  const extra = run("loan_basic", { amount: 200000, rate: 6, years: 30, freq: "12", extra: 200 });
  const simX = simLoan(200000, 6, 30, 12, 200);
  close(num(cell(extra, "Total Interest")), simX.totalInterest, 1, "loan_basic: extra payments cut interest correctly");
  ok(num(cell(extra, "Number of Payments")) === simX.periods, "loan_basic: payoff period count with extra payments");

  const cmp = run("loan_compare", { amountA: 20000, rateA: 7, termA: 5, amountB: 20000, rateB: 6, termB: 5 });
  const a = simLoan(20000, 7, 5), b = simLoan(20000, 6, 5);
  close(num(cmp.primary.value), (20000 + a.totalInterest) - (20000 + b.totalInterest), 0.5, "loan_compare: total cost difference");

  const refi = run("loan_refi", { balance: 250000, currentRate: 7, remainingYears: 25, newRate: 5.5, newTerm: 30, closingCosts: 5000 });
  const cur = loanPmt(250000, 7, 25), neu = loanPmt(250000, 5.5, 30);
  close(num(refi.primary.value), cur - neu, 0.02, "loan_refi: monthly savings");
  close(num(cell(refi, "Breakeven")), 5000 / (cur - neu), 0.1, "loan_refi: breakeven months");
}

// APR with fees: solved rate must discount the payment stream back to net cash
{
  const res = run("apr", { amount: 200000, rate: 6, years: 30, fees: 4000 });
  const apr = num(res.primary.value);
  const payment = loanPmt(200000, 6, 30);
  const pvAtApr = payment * pvAnnuity(apr / 100 / 12, 360);
  close(pvAtApr, 196000, 25, "apr: PV of payments at solved APR = net amount received");
  ok(apr > 6, "apr: APR with fees exceeds the stated rate");
  const adv = run("apr_advanced", { amount: 300000, rate: 6.5, years: 30, originationFee: 3000, otherFees: 2500, points: 1 });
  const pay2 = loanPmt(300000, 6.5, 30);
  const net2 = 300000 - 3000 - 2500 - 3000;
  // Displayed APR is rounded to 2dp; ±0.005% on a 300k/30y stream moves PV ~$100.
  close(pay2 * pvAnnuity(num(adv.primary.value) / 100 / 12, 360), net2, 150, "apr_advanced: PV property holds");
}

// Commercial loan balloon
{
  const res = run("commercial_loan", { amount: 1000000, rate: 6.5, amortYears: 25, balloonYears: 5 });
  const sim = simLoan(1000000, 6.5, 25);
  close(num(res.primary.value), sim.payment, 0.02, "commercial_loan: payment on 25y amortization");
  close(num(cell(res, "Balloon")), sim.balanceAt(60), 1, "commercial_loan: balloon = balance after 60 payments");
}

// Loan analysis (extra payment impact)
{
  const res = run("loan_analysis", { amount: 300000, rate: 6.5, years: 30, extra: 300 });
  const base = simLoan(300000, 6.5, 30), withX = simLoan(300000, 6.5, 30, 12, 300);
  close(num(res.primary.value), base.totalInterest - withX.totalInterest, 1, "loan_analysis: interest saved");
  ok(num(cell(res, "Months Saved")) === base.periods - withX.periods, "loan_analysis: months saved");
}

// Home affordability
{
  const res = run("home_afford", { income: 120000, monthlyDebts: 500, downPayment: 40000, rate: 6, years: 30, dti: 36 });
  const housing = 120000 / 12 * 0.36 - 500;
  const maxLoan = housing * pvAnnuity(0.005, 360);
  close(num(res.primary.value), maxLoan + 40000, 1, "home_afford: max price = PV of payment + down");
}

// Mortgage tax deduction: year-1 interest × bracket
{
  const res = run("mortgage_tax", { amount: 200000, rate: 6, years: 30, loanYear: 1, taxBracket: 24 });
  const sim = simLoan(200000, 6, 30);
  let y1 = 0, bal = 200000;
  for (let m = 0; m < 12; m++) { const i = bal * 0.005; y1 += i; bal -= sim.payment - i; }
  close(num(cell(res, "Interest Paid")), y1, 0.5, "mortgage_tax: first-year interest");
  close(num(res.primary.value), y1 * 0.24, 0.5, "mortgage_tax: deduction value");
}

// Discount points
{
  const res = run("discount_points", { amount: 300000, baseRate: 6.5, rateReduction: 0.25, points: 2, years: 30 });
  const base = loanPmt(300000, 6.5, 30), reduced = loanPmt(300000, 6.0, 30);
  close(num(cell(res, "Monthly Savings")), base - reduced, 0.02, "discount_points: monthly savings");
  close(num(res.primary.value), 6000 / (base - reduced), 0.1, "discount_points: breakeven months");
}

// ARM
{
  const res = run("arm", { amount: 300000, initialRate: 5, initialYears: 5, adjustedRate: 7, years: 30 });
  const sim = simLoan(300000, 5, 30);
  close(num(res.primary.value), sim.payment, 0.02, "arm: initial payment");
  const balAt60 = sim.balanceAt(60);
  close(num(cell(res, "Balance at Adjustment")), balAt60, 1, "arm: balance at first adjustment");
  const p2 = balAt60 * (0.07 / 12) / (1 - (1 + 0.07 / 12) ** -300);
  close(num(cell(res, "Payment After Adjustment")), p2, 0.5, "arm: adjusted payment over remaining term");
}

// Fixed vs ARM
{
  const res = run("fixed_vs_arm", { amount: 300000, fixedRate: 6.5, armInitialRate: 5.5, armInitialYears: 5, armAdjustedRate: 7.5, years: 30 });
  const fixed = simLoan(300000, 6.5, 30);
  const armSim = simLoan(300000, 5.5, 30);
  let int1 = 0, bal = 300000;
  for (let m = 0; m < 60; m++) { const i = bal * (0.055 / 12); int1 += i; bal -= armSim.payment - i; }
  const phase2 = simLoan(bal, 7.5, 25);
  const armPaid = 300000 + int1 + phase2.totalInterest;
  close(num(res.primary.value), fixed.payment * 0 + (300000 + fixed.totalInterest) - armPaid, 2, "fixed_vs_arm: total cost difference");
}

// Bi-weekly acceleration
{
  const res = run("biweekly", { amount: 250000, rate: 6, years: 30 });
  const monthly = simLoan(250000, 6, 30);
  const half = monthly.payment / 2;
  let bal = 250000, ti = 0, k = 0;
  const rBi = 0.06 / 26;
  while (bal > 0.01 && k < 2000) { k++; const i = bal * rBi; let pr = half - i; if (pr > bal) pr = bal; bal -= pr; ti += i; }
  close(num(res.primary.value), monthly.totalInterest - ti, 1, "biweekly: interest saved vs monthly plan");
  close(num(cell(res, "Payoff Time")), k / 26, 0.1, "biweekly: payoff years");
}

// Interest-only
{
  const res = run("interest_only", { amount: 300000, rate: 6, ioYears: 10, totalYears: 30 });
  close(num(res.primary.value), 1500, 0.01, "interest_only: IO payment = balance × rate / 12");
  close(num(cell(res, "Payment After")), loanPmt(300000, 6, 20), 0.02, "interest_only: amortizing payment after IO period");
}

// Rental property
{
  const res = run("rental_property", { price: 300000, downPayment: 60000, rate: 6.5, term: 30, rent: 2500, expenses: 800, vacancy: 5 });
  const noi = (2500 * 0.95 - 800) * 12;
  const pay = loanPmt(240000, 6.5, 30);
  close(num(cell(res, "Cap Rate")), noi / 300000 * 100, 0.01, "rental_property: cap rate");
  close(num(res.primary.value), (noi - pay * 12) / 12, 0.02, "rental_property: monthly cash flow");
  close(num(cell(res, "Cash-on-Cash")), (noi - pay * 12) / 60000 * 100, 0.01, "rental_property: cash-on-cash return");
}

// Retirement planner (nonzero rate)
{
  const res = run("retirement_planner", { currentAge: 30, retireAge: 65, currentSavings: 50000, monthly: 500, returnRate: 7, desiredIncome: 60000, lifeExpectancy: 90 });
  close(num(res.primary.value), simFV(50000, 500, 0.07 / 12, 420), 0.5, "retirement_planner: nest egg vs simulation");
  close(num(cell(res, "Estimated Need")), 60000 * pvAnnuity(0.07, 25), 0.5, "retirement_planner: need = PV of income stream");
}

// 401k (nonzero), 401k max
{
  const res = run("401k_contribution", { salary: 100000, contribPct: 10, matchPct: 50, matchLimit: 6, currentBalance: 50000, years: 20, returnRate: 7 });
  close(num(res.primary.value), simFV(50000, 13000, 0.07, 20), 1, "401k_contribution: balance vs annual simulation");
  close(num(cell(res, "Employer Match")), 3000, 0.01, "401k_contribution: employer match amount");
  const mx = run("401k_max", { salary: 120000, currentContribPct: 8, irsLimit: 23000, payPeriods: "26" });
  close(num(mx.primary.value), 23000 / 120000 * 100, 0.01, "401k_max: percent needed");
  close(num(cell(mx, "Per-Paycheck")), 23000 / 26, 0.01, "401k_max: per-paycheck amount");
}

// Retirement income analysis (year-loop drawdown)
{
  const res = run("retirement_income_analysis", { nestEgg: 1000000, withdrawalRate: 4, returnRate: 5, inflation: 2, years: 30 });
  let bal = 1000000, w = 40000;
  for (let y = 0; y < 30; y++) { bal = bal * 1.05 - w; w *= 1.02; }
  close(num(res.primary.value), bal, 1, "retirement_income_analysis: 30-year balance");
}

// Social Security estimator / analysis
{
  const res = run("ss_estimator", { aime: 5000, claimAge: "62" });
  const pia = 0.9 * 1174 + 0.32 * (5000 - 1174);
  close(num(cell(res, "Primary Insurance")), pia, 0.01, "ss_estimator: PIA bend points");
  close(num(res.primary.value), pia * 0.70, 0.01, "ss_estimator: 30% reduction at 62");
  const res2 = run("ss_estimator", { aime: 9000, claimAge: "70" });
  const pia2 = 0.9 * 1174 + 0.32 * (7078 - 1174) + 0.15 * (9000 - 7078);
  close(num(res2.primary.value), pia2 * 1.24, 0.01, "ss_estimator: delayed credits at 70");
  const an = run("ss_analysis", { pia: 2000, lifeExpectancy: 85 });
  close(num(cell(an, "Claim at 62")), 1400 * 12 * 23, 0.5, "ss_analysis: lifetime total at 62");
  ok(String(an.primary.value).includes("70"), "ss_analysis: age 70 wins to 85");
}

// Asset allocation
{
  const res = run("asset_allocation", { age: 40, risk: "moderate" });
  ok(num(res.primary.value) === 70 && num(cell(res, "Bonds")) === 20 && num(cell(res, "Cash")) === 10,
    "asset_allocation: age 40 moderate = 70/20/10");
}

// Retirement income calculator (real-rate annuity)
{
  const res = run("retirement_income_calc", { nestEgg: 1000000, years: 25, returnRate: 5, inflation: 2 });
  const real = 1.05 / 1.02 - 1;
  const m = real / 12;
  close(num(res.primary.value), 1000000 * m / (1 - (1 + m) ** -300), 0.5, "retirement_income_calc: real-rate payout");
}

// Retirement calc (4% payout phase disclosed)
{
  const res = run("retirement_calc", { currentAge: 40, retireAge: 65, currentSavings: 20000, monthly: 300, returnRate: 7, lifeExpectancy: 90, desiredMonthlyIncome: 4000 });
  const egg = simFV(20000, 300, 0.07 / 12, 300);
  close(num(res.primary.value), egg, 1, "retirement_calc: projected savings");
  const sust = egg * (0.04 / 12) / (1 - (1 + 0.04 / 12) ** -300);
  close(num(cell(res, "Sustainable")), sust, 1, "retirement_calc: 4% payout annuity");
  ok(/4%/.test(res.note || ""), "retirement_calc: 4% assumption disclosed in note");
}

// Credit card minimum payments (independent loop)
{
  const res = run("cc_minimum", { balance: 5000, apr: 22, minPct: 3, minFloor: 25 });
  let bal = 5000, r = 0.22 / 12, ti = 0, tp = 0, m = 0;
  while (bal > 0.01 && m < 600) {
    m++;
    const i = bal * r;
    let p = Math.max(bal * 0.03, 25);
    if (p > bal + i) p = bal + i;
    bal -= p - i; ti += i; tp += p;
  }
  close(num(res.primary.value), m, 0.5, "cc_minimum: months to payoff");
  close(num(cell(res, "Total Interest")), ti, 1, "cc_minimum: total interest");
}

// Auto loan & lease
{
  const res = run("auto_loan", { price: 35000, downPayment: 5000, tradeIn: 3000, rate: 5, termMonths: 60, salesTax: 8 });
  const tax = (35000 - 3000) * 0.08;
  const financed = 35000 + tax - 5000 - 3000;
  close(num(cell(res, "Amount Financed")), financed, 0.01, "auto_loan: amount financed");
  const pay = financed * (0.05 / 12) / (1 - (1 + 0.05 / 12) ** -60);
  close(num(res.primary.value), pay, 0.01, "auto_loan: monthly payment");
  const lease = run("auto_lease", { capCost: 40000, capReduction: 2000, residualPct: 55, moneyFactor: 0.00125, termMonths: 36, salesTax: 8 });
  const dep = (38000 - 22000) / 36, rent = (38000 + 22000) * 0.00125;
  close(num(lease.primary.value), (dep + rent) * 1.08, 0.01, "auto_lease: standard money-factor formula");
  close(num(cell(lease, "Equivalent APR")), 3, 0.01, "auto_lease: money factor × 2400");
}

// Misc: tip, discount+tax, percentage, dates, inflation, T-bill
{
  const tip = run("tip", { bill: 120, tipPct: 20, people: 4 });
  close(num(tip.primary.value), 24, 0.01, "tip: 20% of $120");
  close(num(cell(tip, "Per Person")), 36, 0.01, "tip: split 4 ways");
  const dt = run("discount_tax", { price: 80, discount: 25, tax: 10 });
  close(num(dt.primary.value), 80 * 0.75 * 1.10, 0.01, "discount_tax: discount then tax");
  close(num(run("percentage", { mode: "of", x: 15, y: 240 }).primary.value), 36, 0.001, "percentage: 15% of 240");
  close(num(run("percentage", { mode: "isWhatPct", x: 30, y: 150 }).primary.value), 20, 0.001, "percentage: 30 is 20% of 150");
  close(num(run("percentage", { mode: "change", x: 50, y: 65 }).primary.value), 30, 0.001, "percentage: 50→65 is +30%");
  const dc = run("date_calc", { startDate: "2026-01-01", endDate: "2026-03-01" });
  close(num(dc.primary.value), 59, 0.001, "date_calc: Jan 1 → Mar 1 2026 = 59 days");
  const inf = run("inflation", { amount: 100, startYear: "2000", endYear: "2024" });
  close(num(inf.primary.value), 100 * 313.7 / 172.2, 0.01, "inflation: $100 of 2000 in 2024 dollars");
  const tb = run("tbill", { faceValue: 10000, purchasePrice: 9800, daysToMaturity: 182 });
  close(num(tb.primary.value), (200 / 9800) * (365 / 182) * 100, 0.01, "tbill: bond-equivalent yield");
  close(num(cell(tb, "Discount Yield")), (200 / 10000) * (360 / 182) * 100, 0.01, "tbill: discount yield");
}

// Misc: margin, forecast, fuel, wages, paycheck, distributions, rates, ratios
{
  const mm = run("margin_markup", { cost: 60, price: 100 });
  close(num(mm.primary.value), 40, 0.01, "margin_markup: margin on price");
  close(num(cell(mm, "Markup")), 66.67, 0.01, "margin_markup: markup on cost");
  const bf = run("business_forecast", { currentRevenue: 100000, growthRate: 10, years: 3 });
  close(num(bf.primary.value), 133100, 0.5, "business_forecast: compounded revenue");
  const fu = run("fuel", { distance: 300, mpg: 25, fuelPrice: 3.5 });
  close(num(fu.primary.value), 42, 0.01, "fuel: 300mi at 25mpg, $3.50/gal");
  const hs = run("hourly_salary", { mode: "toSalary", hourly: 25, hoursPerWeek: 40, weeksPerYear: 50 });
  close(num(hs.primary.value), 50000, 0.01, "hourly_salary: 25/hr → 50k");
  const hs2 = run("hourly_salary", { mode: "toHourly", salary: 100000, hoursPerWeek: 40, weeksPerYear: 52 });
  close(num(hs2.primary.value), 100000 / 2080, 0.01, "hourly_salary: 100k → 48.08/hr");
  const si = run("salary_increase", { currentSalary: 85000, raisePct: 4 });
  close(num(si.primary.value), 88400, 0.01, "salary_increase: 4% raise");

  // Paycheck: 2024 single, $100k gross. Hand-computed federal tax on $85,400 taxable.
  const fed = 11600 * 0.10 + (47150 - 11600) * 0.12 + (85400 - 47150) * 0.22;
  const pc = run("paycheck_tax", { grossIncome: 100000, filing: "single", frequency: "26", stateTax: 5 });
  close(num(cell(pc, "Federal Tax")), fed, 0.5, "paycheck_tax: 2024 single federal tax on 100k");
  close(num(cell(pc, "Social Security")), 6200 + 1450, 0.5, "paycheck_tax: FICA at 6.2% + 1.45%");
  close(num(pc.primary.value), (100000 - fed - 7650 - 5000) / 26, 0.05, "paycheck_tax: net per bi-weekly period");
  // SS wage base cap
  const pc2 = run("paycheck_tax", { grossIncome: 300000, filing: "single", frequency: "12", stateTax: 0 });
  const ficaCapped = 168600 * 0.062 + 300000 * 0.0145;
  close(num(cell(pc2, "Social Security")), ficaCapped, 1, "paycheck_tax: SS taxed only to wage base");

  const nd = run("net_distribution", { desiredNet: 10000, taxRate: 20, fees: 2 });
  close(num(nd.primary.value), 10000 / 0.78, 0.01, "net_distribution: gross-up");
  const er = run("effective_rate", { nominal: 12, compounding: "12" });
  close(num(er.primary.value), ((1 + 0.01) ** 12 - 1) * 100, 0.006, "effective_rate: 12% monthly → 12.68% APY");
  const bs = run("balance_sheet", { assets: 500000, liabilities: 300000, revenue: 400000, expenses: 350000 });
  close(num(bs.primary.value), 200000, 0.01, "balance_sheet: equity");
  close(num(cell(bs, "Net Margin")), 12.5, 0.01, "balance_sheet: net margin");
  const fr = run("financial_ratios", { currentAssets: 200000, currentLiabilities: 100000, totalDebt: 150000, totalEquity: 250000, netIncome: 50000, revenue: 400000, totalAssets: 400000 });
  ok(num(fr.primary.value) === 2 && num(cell(fr, "Debt-to-Equity")) === 0.6, "financial_ratios: current ratio & D/E");
  close(num(cell(fr, "Return on Equity")), 20, 0.01, "financial_ratios: ROE");
}

// Stocks
{
  const sr = run("stock_return", { buyPrice: 50, sellPrice: 70, shares: 100, dividends: 200, fees: 50, years: 3 });
  const basis = 5050, proceeds = 7000;
  close(num(sr.primary.value), proceeds - basis + 200, 0.01, "stock_return: total return");
  close(num(cell(sr, "Annualized")), ((7200 / 5050) ** (1 / 3) - 1) * 100, 0.01, "stock_return: annualized");
  const gg = run("stock_constant_growth", { d0: 2, growth: 4, requiredReturn: 9 });
  close(num(gg.primary.value), 2.08 / 0.05, 0.01, "stock_constant_growth: Gordon model");
  ok(!!run("stock_constant_growth", { d0: 2, growth: 9, requiredReturn: 9 }).error, "stock_constant_growth: r ≤ g errors");
  const capm = run("capm", { riskFree: 3, beta: 1.2, marketReturn: 10 });
  close(num(capm.primary.value), 11.4, 0.001, "capm: 3 + 1.2×7");
  const exp = run("expected_return", { p1: 30, r1: 10, p2: 50, r2: 6, p3: 20, r3: -4 });
  close(num(exp.primary.value), 5.2, 0.001, "expected_return: probability-weighted mean");
  close(num(cell(exp, "Standard Deviation")), Math.sqrt(0.3 * 4.8 ** 2 + 0.5 * 0.8 ** 2 + 0.2 * 9.2 ** 2), 0.01, "expected_return: std dev");
  const hpr = run("holding_period_return", { beginValue: 100, endValue: 110, income: 5 });
  close(num(hpr.primary.value), 15, 0.001, "holding_period_return: (10+5)/100");
  const wacc = run("wacc", { equityValue: 600000, debtValue: 400000, costEquity: 10, costDebt: 6, taxRate: 25 });
  close(num(wacc.primary.value), 7.8, 0.001, "wacc: blended cost of capital");
  // Canonical Black-Scholes: S=100, K=100, T=1, r=5%, σ=20% → C=10.4506, P=5.5735
  const call = run("black_scholes", { spot: 100, strike: 100, time: 1, riskFree: 5, volatility: 20, type: "call" });
  close(num(call.primary.value), 10.4506, 0.006, "black_scholes: canonical call price");
  const put = run("black_scholes", { spot: 100, strike: 100, time: 1, riskFree: 5, volatility: 20, type: "put" });
  close(num(put.primary.value), 5.5735, 0.006, "black_scholes: canonical put price");
  const pp = run("pivot_points", { high: 110, low: 90, close: 100 });
  ok(num(pp.primary.value) === 100 && num(cell(pp, "R1")) === 110 && num(cell(pp, "S1")) === 90, "pivot_points: P/R1/S1");
  const fib = run("fibonacci", { high: 100, low: 50, trend: "up" });
  close(num(fib.primary.value), 100 - 50 * 0.618, 0.01, "fibonacci: 61.8% retracement in uptrend");
  const fut = run("commodities_futures", { entryPrice: 50, exitPrice: 55, contracts: 3, tickValue: 1000, position: "long" });
  close(num(fut.primary.value), 15000, 0.01, "commodities_futures: long P/L");
  ok(num(run("commodities_futures", { entryPrice: 50, exitPrice: 55, contracts: 3, tickValue: 1000, position: "short" }).primary.value) === -15000, "commodities_futures: short P/L mirrors");
}

/* ================================================================
   5. Published guide examples: every headline figure quoted in the
      on-page guides (src/data/guides.js) must still match the engine,
      so the prose can never quietly drift from what the calculator does.
      If one of these fails, regenerate the example and update the guide —
      do not just move the expected value.
   ================================================================ */
{
  const guideExamples = [
    ["loan_basic",        { amount: 25000, rate: 7, years: 5, freq: "12", extra: 0 },                                            "$495.03"],
    ["compound",          { principal: 10000, rate: 7, freq: "12", years: 20, contribution: 200 },                               "$144,572.72"],
    ["auto_loan",         { price: 35000, downPayment: 5000, tradeIn: 0, rate: 6.5, termMonths: 60, salesTax: 6 },               "$628.07"],
    ["apr",               { amount: 300000, rate: 6.5, years: 30, fees: 6000 },                                                  "6.70%"],
    ["roi",               { initial: 10000, final: 18000, years: 5 },                                                            "80.00%"],
    ["401k_contribution", { salary: 70000, contribPct: 6, matchPct: 50, matchLimit: 6, currentBalance: 20000, years: 30, returnRate: 7 }, "$747,348.05"],
    ["home_afford",       { income: 90000, monthlyDebts: 500, downPayment: 40000, rate: 6.5, years: 30, dti: 36 },               "$388,063.80"],
    ["cc_payoff",         { balance: 6000, apr: 22, payment: 250 },                                                              "31.9 months"],
  ];
  for (const [id, inputs, expected] of guideExamples) {
    const res = run(id, inputs);
    const got = res && res.primary ? String(res.primary.value) : "(error)";
    ok(got === expected, `guide example: ${id} headline figure still matches guides.js prose`, `guide quotes ${expected}, engine now ${got}`);
  }
}

/* ================================================================
   6. Example defaults: every calculator's prefilled example
      (src/data/examples.js) must render a valid, finite, non-error
      primary — that is the whole point of shipping a worked example
      instead of "$0.00". Also verifies each example only sets real
      field keys, so a renamed field can't silently fall back to 0.
   ================================================================ */
{
  for (const [id, ex] of Object.entries(EXAMPLES)) {
    const calc = CALC_INDEX[id];
    ok(!!calc, `example: ${id} is a real calculator id`);
    if (!calc) continue;
    const keys = new Set(calc.fields.map((f) => f.key));
    const strayKeys = Object.keys(ex).filter((k) => !keys.has(k));
    ok(strayKeys.length === 0, `example: ${id} sets only real field keys`, strayKeys.join(", "));
    const res = run(id, ex);
    const primary = res && res.primary ? String(res.primary.value) : "(none)";
    const good = res && res.primary && !res.error && !/NaN|Infinity|undefined|null/.test(primary);
    ok(good, `example: ${id} prerenders a valid worked example`, res && res.error ? res.error : primary);
  }
}

/* ================================================================
   7. Result charts: the chart series (src/lib/charts.js) must be
      engine-sourced, finite, and trend the right way — a growth curve
      up, an amortization curve down to ~0.
   ================================================================ */
{
  const chartCase = (id) => {
    const calc = CALC_INDEX[id];
    const v = { ...defaultsFor(id), ...(EXAMPLES[id] || {}) };
    const res = calc.compute(v);
    return { calc, v, res, data: chartData(calc, v, res) };
  };
  const growthUp = (id) => {
    const { data } = chartCase(id);
    const good = data && data.pts.length >= 3 && data.pts.every((p) => Number.isFinite(p.y));
    ok(good, `chart: ${id} growth series is finite`, data ? `len ${data.pts.length}` : "null");
    if (good) ok(data.pts[data.pts.length - 1].y > data.pts[0].y, `chart: ${id} grows over time`);
  };
  ["compound", "401k_contribution", "hsa", "mutual_fund_fee", "cd", "retirement_planner", "retirement_calc", "business_forecast", "inflation"].forEach(growthUp);

  // The growth series must be the engine's own numbers: its last point is the
  // headline result computed over the full horizon.
  {
    const { res, data } = chartCase("compound");
    close(data.pts[data.pts.length - 1].y, num(res.primary.value), 1, "chart: compound end point equals the computed result");
  }

  // Amortization starts at the principal, descends, and ends at (near) zero.
  {
    const { v, data } = chartCase("loan_basic");
    const good = data && data.pts.length >= 3;
    ok(good, "chart: loan_basic amortization series present", data ? `len ${data.pts.length}` : "null");
    if (good) {
      close(data.pts[0].y, v.amount, 1, "chart: loan_basic starts at the loan principal");
      ok(data.pts[data.pts.length - 1].y < v.amount * 0.05, "chart: loan_basic balance amortizes to ~0");
    }
  }
}

/* ================================================================
   8. Explainer layer: src/lib/explain.js must render a substantial,
      non-throwing explanatory section for EVERY calculator (the "no
      thin page" guarantee behind AdSense/SEO), and each hand-written
      entry in src/data/explainers.js must be well-formed and target a
      real, non-guided calculator.
   ================================================================ */
{
  // Every calculator renders a valid explainer without throwing, driven by the
  // same data the page uses (example-filled fields + the engine's real result).
  for (const cat of CATEGORIES) {
    for (const c of cat.calcs) {
      const calc = CALC_INDEX[c.id];
      const displayFields = fieldsWithExamples(calc);
      const defaults = {};
      for (const f of displayFields) {
        defaults[f.key] =
          f.type === "select" || f.type === "date" || f.type === "text" ? f.default : Number(f.default);
      }
      let result = null;
      try {
        const r = calc.compute(defaults);
        if (r && r.primary && !r.error) result = r;
      } catch (e) {
        /* a calculator without an example may legitimately not compute here */
      }
      let html = "";
      let threw = false;
      try { html = explainerHtml(calc, displayFields, result); } catch (e) { threw = true; }
      ok(!threw, `explainer: ${c.id} renders without throwing`);
      ok(typeof html === "string" && html.length > 200, `explainer: ${c.id} produces substantial text`, `len ${html.length}`);
      ok(html.includes("How to use"), `explainer: ${c.id} has a How-to-use section`);
      if (result) ok(html.includes("Worked example"), `explainer: ${c.id} narrates a worked example`);
    }
  }

  // Every hand-written explainer targets a real id, is not a duplicate of a full
  // guide (the guide would override it — dead content), and is well-formed.
  for (const [id, e] of Object.entries(EXPLAINERS)) {
    ok(!!CALC_INDEX[id], `explainer: ${id} is a real calculator id`);
    ok(!GUIDES[id], `explainer: ${id} is not already a full guide (guide overrides it)`);
    ok(!!(e.method || e.terms || e.faqs), `explainer: ${id} has at least one authored section`);
    if (e.method) {
      ok(typeof e.method.lead === "string" && typeof e.method.expression === "string",
        `explainer: ${id} method has a lead and an expression`);
      if (e.method.where)
        ok(Array.isArray(e.method.where) && e.method.where.every((w) => Array.isArray(w) && w.length === 2),
          `explainer: ${id} method.where is [symbol, meaning] pairs`);
    }
    if (e.faqs) ok(e.faqs.every((f) => Array.isArray(f) && f.length === 2), `explainer: ${id} faqs are [question, answer] pairs`);
    if (e.terms) ok(e.terms.every((t) => Array.isArray(t) && t.length === 2), `explainer: ${id} terms are [term, definition] pairs`);
  }
}

/* ---------------- summary ---------------- */
console.log(`\n${pass} passed, ${fail} failed\n`);
if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) console.log("  ✗ " + f);
  process.exitCode = 1;
} else {
  console.log("All calculator math verified.");
}
