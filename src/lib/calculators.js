// Shared calculator engine — extracted verbatim from the original app.js.
// This module is deliberately DOM-free so it runs in BOTH places: in Node at
// build time (to prerender each calculator page) and in the browser (to make
// the form interactive). Do not reference document/window from this file.

/* ============ Finance math helpers ============ */
function pmt(rate, nper, pv, fv = 0, type = 0) {
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  let p = (rate / (pvif - 1)) * -(pv * pvif + fv);
  if (type === 1) p /= 1 + rate;
  return p;
}
function fvCalc(rate, nper, pmtv, pv, type = 0) {
  if (rate === 0) return -(pv + pmtv * nper);
  const pvif = Math.pow(1 + rate, nper);
  return -(pv * pvif + pmtv * (1 + rate * type) * ((pvif - 1) / rate));
}
function pvCalc(rate, nper, pmtv, fv = 0, type = 0) {
  if (rate === 0) return -(fv + pmtv * nper);
  const pvif = Math.pow(1 + rate, nper);
  return -(fv + pmtv * (1 + rate * type) * ((pvif - 1) / rate)) / pvif;
}
function nperCalc(rate, pmtv, pv, fv = 0, type = 0) {
  if (rate === 0) return -(pv + fv) / pmtv;
  const num = pmtv * (1 + rate * type) - fv * rate;
  const den = pmtv * (1 + rate * type) + pv * rate;
  return Math.log(num / den) / Math.log(1 + rate);
}
function npv(rate, cfs) { return cfs.reduce((a, cf, i) => a + cf / Math.pow(1 + rate, i), 0); }
// Returns NaN when the cash flows have no IRR (no sign change in NPV), which
// callers must treat as "not available". Newton's method was used here before,
// but it diverges silently on rootless input and on roots near -100%, returning
// absurd values (e.g. 1e252) that still pass an isFinite check. Bracketing the
// sign change and bisecting cannot diverge: it either finds a real root or
// reports that none exists.
function irr(cfs) {
  const f = (r) => npv(r, cfs);
  // Scan just above -100% (near-total-loss roots), across the everyday range,
  // then geometrically outward for extreme returns.
  const scan = [-0.9999];
  for (let r = -0.99; r <= 1.0001; r += 0.01) scan.push(r);
  for (let r = 1.1; r <= 1e6; r *= 1.1) scan.push(r);

  let lo = null, hi = null, fLo = 0;
  let prevR = scan[0], prevF = f(prevR);
  if (isFinite(prevF) && Math.abs(prevF) < 1e-9) return prevR;
  for (let i = 1; i < scan.length; i++) {
    const r = scan[i], v = f(r);
    if (!isFinite(v)) { prevR = r; prevF = v; continue; }
    if (Math.abs(v) < 1e-9) return r;
    if (isFinite(prevF) && prevF * v < 0) { lo = prevR; hi = r; fLo = prevF; break; }
    prevR = r; prevF = v;
  }
  if (lo === null) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2, v = f(mid);
    if (!isFinite(v)) return NaN;
    if (v === 0) return mid;
    if (fLo * v < 0) hi = mid; else { lo = mid; fLo = v; }
  }
  return (lo + hi) / 2;
}
// Solves for the annual rate (as a percent) at which `payment` over `nper`
// months discounts back to `netAmount`. Returns NaN rather than clamping when
// the answer falls outside the bracket: a fixed ceiling silently reported high-fee
// short-term loans as exactly "100.00%" when the true APR was far higher, and
// those are precisely the loans where APR matters most. The ceiling is raised
// until it brackets the root, so the range adapts instead of truncating.
function solveApr(payment, nper, netAmount) {
  if (!(netAmount > 0) || !(payment > 0) || !(nper > 0)) return NaN;
  const pvAt = (annual) => pvCalc(annual / 12, nper, -payment, 0);
  if (pvAt(0) < netAmount) return NaN; // even a 0% rate undershoots
  let hi = 1;
  while (pvAt(hi) > netAmount) {
    hi *= 2;
    if (hi > 1e4) return NaN; // >1,000,000% APR — inputs are not a real loan
  }
  let lo = 0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (pvAt(mid) > netAmount) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
}
function amortize(principal, annualRatePct, years, perYear = 12, extra = 0) {
  const n = Math.round(years * perYear);
  const r = annualRatePct / 100 / perYear;
  const payment = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  let balance = principal, totalInterest = 0;
  const rows = [];
  let period = 0;
  while (balance > 0.01 && period < n * 3 + 12) {
    period++;
    const interest = balance * r;
    let principalPaid = payment - interest + extra;
    if (principalPaid > balance) principalPaid = balance;
    balance -= principalPaid;
    totalInterest += interest;
    rows.push({ period, principal: principalPaid, interest, payment: principalPaid + interest, balance });
    if (balance <= 0) break;
  }
  return { payment, rows, totalInterest, totalPaid: principal + totalInterest, periods: rows.length, n, r };
}
function annualize(rows, perYear) {
  const out = [];
  for (let i = 0; i < rows.length; i += perYear) {
    const slice = rows.slice(i, i + perYear);
    out.push({
      year: Math.floor(i / perYear) + 1,
      principal: slice.reduce((a, r) => a + r.principal, 0),
      interest: slice.reduce((a, r) => a + r.interest, 0),
      balance: slice[slice.length - 1].balance,
    });
  }
  return out;
}
function normCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) p = 1 - p;
  return p;
}
function blackScholes(S, K, T, r, sigma, type) {
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  if (type === "call") return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

/* ============ Formatting ============ */
// Figures are USD, so grouping/decimal separators are pinned to en-US. Using the
// visitor's locale would render "$1.000,00" for a German reader — a dollar sign
// with European separators, which reads as a different number.
const LOCALE = "en-US";
const fmt = {
  cur: (v, d = 2) => { v = Number.isFinite(v) ? v : 0; return (v < 0 ? "-" : "") + "$" + Math.abs(v).toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d }); },
  pct: (v, d = 2) => { v = Number.isFinite(v) ? v : 0; return v.toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d }) + "%"; },
  num: (v, d = 2) => { v = Number.isFinite(v) ? v : 0; return v.toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d }); },
  int: (v) => Number.isFinite(v) ? Math.round(v).toLocaleString(LOCALE) : "0",
};

/* ============ Reference data ============ */
// scripts/fetch-data.mjs refreshes src/data/reference.json at build time and the
// values below are the fallback if that fetch fails or has never run. The app
// therefore always builds, and never silently ships a table it cannot date.
import reference from "../data/reference.json" with { type: "json" };

const CPI_FALLBACK = { 1980: 82.4,1981: 90.9,1982: 96.5,1983: 99.6,1984: 103.9,1985: 107.6,1986: 109.6,1987: 113.6,1988: 118.3,1989: 124.0,1990: 130.7,1991: 136.2,1992: 140.3,1993: 144.5,1994: 148.2,1995: 152.4,1996: 156.9,1997: 160.5,1998: 163.0,1999: 166.6,2000: 172.2,2001: 177.1,2002: 179.9,2003: 184.0,2004: 188.9,2005: 195.3,2006: 201.6,2007: 207.3,2008: 215.3,2009: 214.5,2010: 218.1,2011: 224.9,2012: 229.6,2013: 233.0,2014: 236.7,2015: 237.0,2016: 240.0,2017: 245.1,2018: 251.1,2019: 255.7,2020: 258.8,2021: 271.0,2022: 292.7,2023: 304.7,2024: 313.7,2025: 320.6 };
// Per 1 USD. Consistent with roughly mid-2024 (JPY ~156, EUR ~0.92) — kept only
// as a floor so a failed refresh degrades to labelled-stale rather than broken.
const FX_FALLBACK = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 156.2, CAD: 1.37, AUD: 1.52, CHF: 0.91, CNY: 7.25, INR: 83.4, MXN: 18.1, BRL: 5.4, ZAR: 18.6 };

const CPI = reference.CPI ?? CPI_FALLBACK;
const FX = reference.FX ?? FX_FALLBACK;
// Surfaced in the Currency Converter so a visitor can judge staleness rather than
// assume the rates are current. Never asserts a date the data cannot support.
const FX_AS_OF = reference.FX_AS_OF ?? "mid-2024 (not refreshed)";
// Derived from the table rather than hardcoded, so the UI copy and the year
// dropdown cannot drift apart from the data when a new year is appended.
const CPI_LATEST_YEAR = Math.max(...Object.keys(CPI).map(Number));
const RMD_TABLE ={ 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4 };
const FED_BRACKETS_2024 = {
  single: [[0,0.10],[11600,0.12],[47150,0.22],[100525,0.24],[191950,0.32],[243725,0.35],[609350,0.37]],
  married: [[0,0.10],[23200,0.12],[94300,0.22],[201050,0.24],[383900,0.32],[487450,0.35],[731200,0.37]],
};
const STD_DEDUCTION_2024 = { single: 14600, married: 29200 };

function taxFromBrackets(income, brackets) {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const [floor, rate] = brackets[i];
    const cap = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
    if (income > floor) tax += (Math.min(income, cap) - floor) * rate;
    else break;
  }
  return tax;
}

/* ============ Field helpers ============ */
const CUR = (key, label, def, o = {}) => ({ key, label, type: "currency", default: def, ...o });
const PCT = (key, label, def, o = {}) => ({ key, label, type: "percent", default: def, ...o });
const NUM = (key, label, def, o = {}) => ({ key, label, type: "number", default: def, ...o });
const SEL = (key, label, def, options, o = {}) => ({ key, label, type: "select", default: def, options, ...o });
const DTE = (key, label, def, o = {}) => ({ key, label, type: "date", default: def, ...o });
const TXT = (key, label, def, o = {}) => ({ key, label, type: "text", default: def, ...o });

/* ============ Category: Finance & Investment ============ */
const CAT_INVEST = {
  id: "invest", name: "Finance & Investment", icon: "💹",
  calcs: [
    {
      id: "tvm", name: "TVM Calculator", desc: "Solve for any single Time Value of Money variable given the other four.",
      fields: [
        SEL("solveFor", "Solve For", "fv", [["fv","Future Value"],["pv","Present Value"],["pmt","Payment"],["nper","Number of Periods"],["rate","Interest Rate"]]),
        NUM("nper", "Number of Periods (N)", 0),
        PCT("rate", "Interest Rate per Period", 0),
        CUR("pv", "Present Value", 0),
        CUR("pmt", "Payment per Period", 0),
        CUR("fv", "Future Value", 0),
        SEL("type", "Payment Timing", "0", [["0","End of Period"],["1","Beginning of Period"]]),
      ],
      compute(v) {
        const r = v.rate / 100, type = Number(v.type);
        let result, label;
        if (v.solveFor === "fv") { result = fvCalc(r, v.nper, v.pmt, v.pv, type); label = "Future Value"; }
        else if (v.solveFor === "pv") { result = pvCalc(r, v.nper, v.pmt, v.fv, type); label = "Present Value"; }
        else if (v.solveFor === "pmt") { result = pmt(r, v.nper, v.pv, v.fv, type); label = "Payment per Period"; }
        else if (v.solveFor === "nper") { result = nperCalc(r, v.pmt, v.pv, v.fv, type); label = "Number of Periods"; }
        else { // rate via bisection on the sign change of fvCalc(r) − FV target.
          // Direction-aware: with investor signs (pv<0) the curve rises with the
          // rate, with borrower signs (pv>0) it falls — assuming one direction
          // silently returned the bracket edge (500%) for the other.
          const fAt = (r0) => fvCalc(r0, v.nper, v.pmt, v.pv, type) - v.fv;
          let lo = -0.99, hi = 5, fLo = fAt(lo), fHi = fAt(hi);
          if (!isFinite(fLo) || !isFinite(fHi) || fLo * fHi > 0) {
            return { error: "No rate between -99% and 500% fits these inputs. Check the signs: outflows negative (e.g. PV -1,000), inflows positive (e.g. FV 2,000)." };
          }
          for (let i = 0; i < 200; i++) {
            const mid = (lo + hi) / 2, fMid = fAt(mid);
            if (fMid === 0) { lo = mid; hi = mid; break; }
            if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
          }
          result = ((lo + hi) / 2) * 100; label = "Interest Rate per Period (%)";
        }
        return { primary: { label, value: v.solveFor === "rate" ? fmt.pct(result) : fmt.cur(result) },
          cells: [
            { k: "N", v: fmt.num(v.nper, 2) }, { k: "Rate", v: fmt.pct(v.rate) },
            { k: "PV", v: fmt.cur(v.pv) }, { k: "PMT", v: fmt.cur(v.pmt) }, { k: "FV", v: fmt.cur(v.fv) },
          ],
          note: "Convention follows standard financial calculators: cash outflows are negative, inflows positive." };
      },
    },
    {
      id: "currency", name: "Currency Converter", desc: "Convert between major currencies using reference exchange rates.",
      fields: [ CUR("amount", "Amount", 0), SEL("from", "From", "USD", Object.keys(FX).map(c=>[c,c])), SEL("to", "To", "EUR", Object.keys(FX).map(c=>[c,c])) ],
      compute(v) {
        const usd = v.amount / FX[v.from];
        const out = usd * FX[v.to];
        const rate = FX[v.to] / FX[v.from];
        return { primary: { label: `${v.from} → ${v.to}`, value: fmt.num(out,2) + " " + v.to },
          cells: [ { k: "Exchange Rate", v: `1 ${v.from} = ${fmt.num(rate,4)} ${v.to}` }, { k: "Inverse", v: `1 ${v.to} = ${fmt.num(1/rate,4)} ${v.from}` } ],
          note: `Reference rates as of ${FX_AS_OF}, refreshed daily via <a href="https://www.exchangerate-api.com" rel="noopener">ExchangeRate-API</a>. Rates move continuously between updates, so treat these as indicative — check a live source before acting on any figure.` };
      },
    },
    {
      id: "compound", name: "Compound Interest Calculator", desc: "Project growth of a lump sum (plus optional regular contributions) over time.",
      fields: [ CUR("principal", "Initial Principal", 0), PCT("rate", "Annual Interest Rate", 0),
        SEL("freq", "Compounding Frequency", "12", [["1","Annually"],["2","Semi-Annually"],["4","Quarterly"],["12","Monthly"],["365","Daily"]]),
        NUM("years", "Years", 0), CUR("contribution", "Additional Contribution per Period", 0) ],
      compute(v) {
        const n = Number(v.freq), r = v.rate/100/n, periods = v.years*n;
        const fvLump = v.principal*Math.pow(1+r,periods);
        const fvContrib = v.contribution*(r===0? periods : ((Math.pow(1+r,periods)-1)/r));
        const total = fvLump+fvContrib;
        const totalContrib = v.principal + v.contribution*periods;
        const interestEarned = total-totalContrib;
        return { primary: { label: "Future Value", value: fmt.cur(total) },
          cells: [ { k: "Total Contributions", v: fmt.cur(totalContrib) }, { k: "Interest Earned", v: fmt.cur(interestEarned) },
            { k: "From Lump Sum", v: fmt.cur(fvLump) }, { k: "From Contributions", v: fmt.cur(fvContrib) } ],
          bars: [ { label:"Principal", pct: totalContrib/total*100, value: fmt.cur(totalContrib) }, { label:"Interest", pct: interestEarned/total*100, value: fmt.cur(interestEarned) } ] };
      },
    },
    {
      id: "roi", name: "Return On Investment (ROI) Calculator", desc: "Calculate total and annualized return on an investment.",
      fields: [ CUR("initial", "Initial Investment", 0), CUR("final", "Final Value", 0), NUM("years", "Holding Period (Years)", 0) ],
      compute(v) {
        const gain = v.final - v.initial;
        const roi = (gain/v.initial)*100;
        const annualized = (Math.pow(v.final/v.initial, 1/v.years)-1)*100;
        return { primary: { label: "Total ROI", value: fmt.pct(roi) },
          cells: [ { k: "Net Gain/Loss", v: fmt.cur(gain) }, { k: "Annualized ROI (CAGR)", v: fmt.pct(annualized) },
            { k: "Initial Investment", v: fmt.cur(v.initial) }, { k: "Final Value", v: fmt.cur(v.final) } ] };
      },
    },
    {
      id: "irr_npv", name: "IRR NPV Calculator", desc: "Compute Net Present Value and Internal Rate of Return for a series of cash flows.",
      fields: [ PCT("rate", "Discount Rate", 0), TXT("cashflows", "Cash Flows (comma-separated, Year 0 first)", "-10000, 3000, 4000, 4000, 5000") ],
      compute(v) {
        const cfs = v.cashflows.split(/[,\n]/).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n));
        if (cfs.length<2) return { error: "Enter at least two cash flows (Year 0 and Year 1)." };
        const npvVal = npv(v.rate/100, cfs);
        const irrVal = irr(cfs)*100;
        return { primary: { label: "Net Present Value", value: fmt.cur(npvVal) },
          cells: [ { k: "IRR", v: isFinite(irrVal)? fmt.pct(irrVal):"N/A" }, { k: "Periods", v: cfs.length-1 }, { k: "Discount Rate", v: fmt.pct(v.rate) }, { k: "Sum of Cash Flows", v: fmt.cur(cfs.reduce((a,b)=>a+b,0)) } ],
          bars: cfs.map((cf,i)=>({label:"Yr "+i, pct: Math.min(100, Math.abs(cf)/Math.max(...cfs.map(Math.abs))*100), value: fmt.cur(cf)})) };
      },
    },
    {
      id: "bond", name: "Bond Calculator", desc: "Estimate bond price and yield to maturity from coupon and market rate inputs.",
      fields: [ CUR("face", "Face Value", 0), PCT("coupon", "Annual Coupon Rate", 0), PCT("market", "Market / Required Yield", 0),
        NUM("years", "Years to Maturity", 0), SEL("freq", "Coupon Frequency", "2", [["1","Annual"],["2","Semi-Annual"]]) ],
      compute(v) {
        const n = v.years*Number(v.freq);
        const couponPmt = (v.coupon/100*v.face)/Number(v.freq);
        const r = v.market/100/Number(v.freq);
        const price = r===0? couponPmt*n + v.face : couponPmt*((1-Math.pow(1+r,-n))/r) + v.face*Math.pow(1+r,-n);
        const currentYield = (couponPmt*Number(v.freq))/price*100;
        const premiumDiscount = price-v.face;
        return { primary: { label: "Bond Price", value: fmt.cur(price) },
          cells: [ { k: "Current Yield", v: fmt.pct(currentYield) }, { k: "Premium/Discount", v: fmt.cur(premiumDiscount) },
            { k: "Coupon Payment", v: fmt.cur(couponPmt) }, { k: "Total Periods", v: n } ],
          note: price>v.face? "Trading at a premium (market yield below coupon rate)." : price<v.face? "Trading at a discount (market yield above coupon rate).":"Trading at par." };
      },
    },
    {
      id: "tax_equiv_yield", name: "Tax Equivalent Yield Calculator", desc: "Compare tax-free municipal bond yields to taxable equivalents.",
      fields: [ PCT("taxFreeYield", "Tax-Free Yield", 0), PCT("taxBracket", "Marginal Tax Rate", 0) ],
      compute(v) {
        if (v.taxBracket>=100) return { error: "Marginal tax rate must be less than 100%." };
        const teq = v.taxFreeYield/(1-v.taxBracket/100);
        return { primary: { label: "Taxable-Equivalent Yield", value: fmt.pct(teq) },
          cells: [ { k: "Tax-Free Yield", v: fmt.pct(v.taxFreeYield) }, { k: "Tax Bracket", v: fmt.pct(v.taxBracket) } ],
          note: "A taxable bond must yield this much to match the after-tax return of the tax-free bond." };
      },
    },
    {
      id: "rule72", name: "Rule of 72 Calculator", desc: "Quickly estimate years required to double an investment.",
      fields: [ PCT("rate", "Annual Interest Rate", 0), CUR("principal", "Principal (optional, for reference)", 0) ],
      compute(v) {
        const years72 = 72/v.rate;
        const yearsExact = Math.log(2)/Math.log(1+v.rate/100);
        return { primary: { label: "Years to Double (Rule of 72)", value: fmt.num(years72,1)+" yrs" },
          cells: [ { k: "Exact Doubling Time", v: fmt.num(yearsExact,2)+" yrs" }, { k: "Rule of 114 (Triple)", v: fmt.num(114/v.rate,1)+" yrs" }, { k: "Rule of 144 (Quadruple)", v: fmt.num(144/v.rate,1)+" yrs" }, { k: "Doubled Value", v: fmt.cur(v.principal*2) } ] };
      },
    },
    {
      id: "college_savings", name: "College Savings Calculator", desc: "Project future college costs and the savings needed to fund them.",
      fields: [ CUR("currentCost", "Current Annual Cost", 0), NUM("yearsUntil", "Years Until Enrollment", 0),
        PCT("inflation", "College Cost Inflation", 0), NUM("yearsInSchool", "Years in School", 0),
        CUR("currentSavings", "Current Savings", 0), CUR("monthly", "Monthly Contribution", 0), PCT("returnRate", "Expected Return", 0) ],
      compute(v) {
        const futureAnnualCost = v.currentCost*Math.pow(1+v.inflation/100, v.yearsUntil);
        const totalNeeded = futureAnnualCost*v.yearsInSchool;
        const r = v.returnRate/100/12, n = v.yearsUntil*12;
        const fvSavings = v.currentSavings*Math.pow(1+r,n) + v.monthly*(r===0? n : (Math.pow(1+r,n)-1)/r);
        const shortfall = totalNeeded-fvSavings;
        return { primary: { label: shortfall>0?"Projected Shortfall":"Projected Surplus", value: fmt.cur(Math.abs(shortfall)) },
          cells: [ { k: "Future Annual Cost", v: fmt.cur(futureAnnualCost) }, { k: "Total Cost (all years)", v: fmt.cur(totalNeeded) },
            { k: "Projected Savings", v: fmt.cur(fvSavings) }, { k: "Years to Save", v: v.yearsUntil } ] };
      },
    },
    {
      id: "investment_income", name: "Investment Income Calculator", desc: "Estimate periodic income generated from an income-producing investment.",
      fields: [ CUR("principal", "Investment Amount", 0), PCT("yieldRate", "Annual Yield", 0),
        SEL("freq", "Payout Frequency", "12", [["12","Monthly"],["4","Quarterly"],["2","Semi-Annual"],["1","Annual"]]) ],
      compute(v) {
        const annualIncome = v.principal*v.yieldRate/100;
        const perPeriod = annualIncome/Number(v.freq);
        return { primary: { label: "Income per Period", value: fmt.cur(perPeriod) },
          cells: [ { k: "Annual Income", v: fmt.cur(annualIncome) }, { k: "Monthly Equivalent", v: fmt.cur(annualIncome/12) } ] };
      },
    },
    {
      id: "mutual_fund_fee", name: "Mutual Fund Fee Calculator", desc: "See the long-term cost of mutual fund expense ratios on your returns.",
      fields: [ CUR("investment", "Investment Amount", 0), PCT("returnRate", "Expected Annual Return", 0),
        PCT("expenseRatio", "Expense Ratio", 0), NUM("years", "Years Invested", 0) ],
      compute(v) {
        const grossRate = v.returnRate/100, netRate = Math.max(-0.99, grossRate - v.expenseRatio/100);
        const grossFV = v.investment*Math.pow(1+grossRate, v.years);
        const netFV = v.investment*Math.pow(1+netRate, v.years);
        const feeCost = grossFV-netFV;
        return { primary: { label: "Total Cost of Fees", value: fmt.cur(feeCost) },
          cells: [ { k: "Value w/o Fees", v: fmt.cur(grossFV) }, { k: "Value with Fees", v: fmt.cur(netFV) },
            { k: "Net Annual Return", v: fmt.pct(netRate*100) }, { k: "% of Final Value Lost to Fees", v: fmt.pct(feeCost/grossFV*100) } ] };
      },
    },
    {
      id: "hsa", name: "US Health Savings Account Calculator", desc: "Estimate tax savings and growth of HSA contributions.",
      fields: [ CUR("contribution", "Your Annual Contribution", 0), CUR("employer", "Employer Contribution", 0),
        PCT("taxBracket", "Marginal Tax Rate", 0), PCT("returnRate", "Expected Annual Return", 0), NUM("years", "Years", 0) ],
      compute(v) {
        const taxSavings = v.contribution*v.taxBracket/100;
        const totalAnnual = v.contribution+v.employer;
        const r = v.returnRate/100;
        const fv = totalAnnual*(r===0? v.years : (Math.pow(1+r,v.years)-1)/r);
        return { primary: { label: "Projected HSA Balance", value: fmt.cur(fv) },
          cells: [ { k: "Annual Tax Savings", v: fmt.cur(taxSavings) }, { k: "Total Annual Contribution", v: fmt.cur(totalAnnual) },
            { k: "Total Contributed", v: fmt.cur(totalAnnual*v.years) }, { k: "Total Tax Savings", v: fmt.cur(taxSavings*v.years) } ],
          note: "HSA contributions are pre-tax (or tax-deductible), grow tax-free, and withdrawals for qualified medical expenses are tax-free." };
      },
    },
    {
      id: "savings_goal", name: "Savings Goal Calculator", desc: "Find the monthly contribution needed to reach a savings target.",
      fields: [ CUR("goal", "Savings Goal", 0), CUR("current", "Current Savings", 0), NUM("years", "Years to Goal", 0), PCT("returnRate", "Expected Annual Return", 0) ],
      compute(v) {
        const r = v.returnRate/100/12, n = v.years*12;
        const fvCurrent = v.current*Math.pow(1+r,n);
        const remaining = v.goal-fvCurrent;
        const monthly = r===0? remaining/n : remaining*r/(Math.pow(1+r,n)-1);
        return { primary: { label: "Required Monthly Contribution", value: fmt.cur(Math.max(0,monthly)) },
          cells: [ { k: "Goal", v: fmt.cur(v.goal) }, { k: "Future Value of Current Savings", v: fmt.cur(fvCurrent) }, { k: "Amount Still Needed", v: fmt.cur(Math.max(0,remaining)) }, { k: "Months", v: n } ] };
      },
    },
    {
      id: "cd", name: "Certificate of Deposit (CD) Calculator", desc: "Calculate maturity value and interest earned on a CD.",
      fields: [ CUR("deposit", "Deposit Amount", 0), PCT("rate", "Nominal Annual Interest Rate", 0),
        NUM("termMonths", "Term (Months)", 0), SEL("freq", "Compounding", "365", [["365","Daily"],["12","Monthly"],["4","Quarterly"],["1","Annually"]]) ],
      compute(v) {
        const n = Number(v.freq), r = v.rate/100/n, periods = n*(v.termMonths/12);
        const maturity = v.deposit*Math.pow(1+r,periods);
        const interest = maturity-v.deposit;
        return { primary: { label: "Maturity Value", value: fmt.cur(maturity) },
          cells: [ { k: "Interest Earned", v: fmt.cur(interest) }, { k: "Term", v: v.termMonths+" months" }, { k: "Effective Annual Yield (APY)", v: fmt.pct((Math.pow(maturity/v.deposit, 12/v.termMonths)-1)*100) }, { k: "Total Return over Term", v: fmt.pct((maturity/v.deposit-1)*100) } ] };
      },
    },
  ],
};

/* ============ Category: Loan & Mortgage ============ */
const CAT_LOAN = {
  id: "loan", name: "Loan & Mortgage", icon: "🏠",
  calcs: [
    {
      id: "loan_basic", name: "Loan Calculator", desc: "Calculate payment, total interest and amortization for any loan.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Annual Interest Rate", 0), NUM("years", "Loan Term (Years)", 0),
        SEL("freq", "Payments per Year", "12", [["12","Monthly"],["26","Bi-Weekly"],["52","Weekly"]]), CUR("extra", "Extra Payment per Period", 0) ],
      compute(v) {
        const perYear = Number(v.freq);
        const am = amortize(v.amount, v.rate, v.years, perYear, v.extra);
        const yearly = annualize(am.rows, perYear);
        return { primary: { label: "Payment per Period", value: fmt.cur(am.payment+v.extra) },
          cells: [ { k: "Total Interest", v: fmt.cur(am.totalInterest) }, { k: "Total Paid", v: fmt.cur(am.totalPaid) },
            { k: "Payoff Time", v: fmt.num(am.periods/perYear,1)+" yrs" }, { k: "Number of Payments", v: am.periods } ],
          table: { headers: ["Year","Principal","Interest","Balance"], rows: yearly.slice(0,40).map(y=>[y.year, fmt.cur(y.principal), fmt.cur(y.interest), fmt.cur(Math.max(0,y.balance))]) } };
      },
    },
    {
      id: "loan_compare", name: "Loan Comparison Calculator", desc: "Compare two loan offers side-by-side.",
      fields: [ CUR("amountA", "Loan A — Amount", 0), PCT("rateA", "Loan A — Rate", 0), NUM("termA", "Loan A — Term (yrs)", 0),
        CUR("amountB", "Loan B — Amount", 0), PCT("rateB", "Loan B — Rate", 0), NUM("termB", "Loan B — Term (yrs)", 0) ],
      compute(v) {
        const a = amortize(v.amountA, v.rateA, v.termA), b = amortize(v.amountB, v.rateB, v.termB);
        const diff = a.totalPaid-b.totalPaid;
        return { primary: { label: "Total Cost Difference (A − B)", value: fmt.cur(diff) },
          cells: [ { k: "Loan A Payment", v: fmt.cur(a.payment) }, { k: "Loan B Payment", v: fmt.cur(b.payment) },
            { k: "Loan A Total Interest", v: fmt.cur(a.totalInterest) }, { k: "Loan B Total Interest", v: fmt.cur(b.totalInterest) } ],
          note: diff>0? "Loan B costs less overall.":"Loan A costs less overall." };
      },
    },
    {
      id: "loan_refi", name: "Loan Refinance Calculator", desc: "See if refinancing your loan will save you money, and find the breakeven point.",
      fields: [ CUR("balance", "Current Balance", 0), PCT("currentRate", "Current Rate", 0), NUM("remainingYears", "Remaining Term (yrs)", 0),
        PCT("newRate", "New Rate", 0), NUM("newTerm", "New Term (yrs)", 0), CUR("closingCosts", "Closing Costs", 0) ],
      compute(v) {
        const current = amortize(v.balance, v.currentRate, v.remainingYears);
        const refi = amortize(v.balance, v.newRate, v.newTerm);
        const monthlySavings = current.payment-refi.payment;
        const breakeven = monthlySavings>0? v.closingCosts/monthlySavings : Infinity;
        return { primary: { label: "Monthly Payment Savings", value: fmt.cur(monthlySavings) },
          cells: [ { k: "Current Payment", v: fmt.cur(current.payment) }, { k: "New Payment", v: fmt.cur(refi.payment) },
            { k: "Breakeven", v: isFinite(breakeven)? fmt.num(breakeven,1)+" months": "N/A" }, { k: "Lifetime Interest Saved", v: fmt.cur(current.totalInterest-refi.totalInterest) } ] };
      },
    },
    {
      id: "apr", name: "APR Calculator", desc: "Convert a loan's stated rate plus fees into an effective Annual Percentage Rate.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Stated Interest Rate", 0), NUM("years", "Term (Years)", 0), CUR("fees", "Total Fees / Points Cost", 0) ],
      compute(v) {
        const netAmount = v.amount-v.fees;
        const payment = -pmt(v.rate/100/12, v.years*12, v.amount, 0);
        const apr = solveApr(payment, v.years*12, netAmount);
        if (!isFinite(apr)) return { error: "APR is out of range for these inputs. Check that fees are less than the loan amount." };
        return { primary: { label: "Effective APR", value: fmt.pct(apr) },
          cells: [ { k: "Stated Rate", v: fmt.pct(v.rate) }, { k: "Monthly Payment", v: fmt.cur(payment) }, { k: "Fees Financed Effect", v: fmt.cur(v.fees) } ] };
      },
    },
    {
      id: "apr_advanced", name: "APR Advanced Calculator", desc: "Calculate APR including multiple fee items and discount points.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Stated Interest Rate", 0), NUM("years", "Term (Years)", 0),
        CUR("originationFee", "Origination Fee", 0), CUR("otherFees", "Other Closing Fees", 0), PCT("points", "Discount Points", 0) ],
      compute(v) {
        const pointsCost = v.amount*v.points/100;
        const totalFees = v.originationFee+v.otherFees+pointsCost;
        const netAmount = v.amount-totalFees;
        const payment = -pmt(v.rate/100/12, v.years*12, v.amount, 0);
        const apr = solveApr(payment, v.years*12, netAmount);
        if (!isFinite(apr)) return { error: "APR is out of range for these inputs. Check that fees and points are less than the loan amount." };
        return { primary: { label: "Effective APR", value: fmt.pct(apr) },
          cells: [ { k: "Total Fees + Points", v: fmt.cur(totalFees) }, { k: "Points Cost", v: fmt.cur(pointsCost) }, { k: "Monthly Payment", v: fmt.cur(payment) }, { k: "Stated Rate", v: fmt.pct(v.rate) } ] };
      },
    },
    {
      id: "commercial_loan", name: "Commercial Loan Calculator", desc: "Calculate payments for a commercial loan with a balloon payment structure.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Annual Interest Rate", 0), NUM("amortYears", "Amortization Period (yrs)", 0), NUM("balloonYears", "Balloon / Loan Term (yrs)", 0) ],
      compute(v) {
        const am = amortize(v.amount, v.rate, v.amortYears);
        const balloonPeriod = Math.min(v.balloonYears*12, am.rows.length);
        const balloonBalance = am.rows[balloonPeriod-1] ? am.rows[balloonPeriod-1].balance : 0;
        const interestPaid = am.rows.slice(0,balloonPeriod).reduce((a,r)=>a+r.interest,0);
        return { primary: { label: "Monthly Payment", value: fmt.cur(am.payment) },
          cells: [ { k: "Balloon Payment Due", v: fmt.cur(balloonBalance) }, { k: "At End of (Years)", v: v.balloonYears },
            { k: "Interest Paid Before Balloon", v: fmt.cur(interestPaid) }, { k: "Amortization Period", v: v.amortYears+" yrs" } ] };
      },
    },
    {
      id: "loan_analysis", name: "Loan Analysis Calculator", desc: "Analyze the impact of extra payments on a loan's payoff time and cost.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Annual Interest Rate", 0), NUM("years", "Term (Years)", 0), CUR("extra", "Extra Monthly Payment", 0) ],
      compute(v) {
        const base = amortize(v.amount, v.rate, v.years, 12, 0);
        const withExtra = amortize(v.amount, v.rate, v.years, 12, v.extra);
        const interestSaved = base.totalInterest-withExtra.totalInterest;
        const timeSaved = base.periods-withExtra.periods;
        return { primary: { label: "Interest Saved", value: fmt.cur(interestSaved) },
          cells: [ { k: "Months Saved", v: timeSaved }, { k: "New Payoff Time", v: fmt.num(withExtra.periods/12,1)+" yrs" },
            { k: "Original Total Interest", v: fmt.cur(base.totalInterest) }, { k: "New Total Interest", v: fmt.cur(withExtra.totalInterest) } ] };
      },
    },
    {
      id: "home_afford", name: "Home Affordability Calculator", desc: "Estimate the maximum home price you can afford based on income and debts.",
      fields: [ CUR("income", "Annual Gross Income", 0), CUR("monthlyDebts", "Other Monthly Debts", 0), CUR("downPayment", "Down Payment", 0),
        PCT("rate", "Interest Rate", 0), NUM("years", "Loan Term (Years)", 0), PCT("dti", "Max Debt-to-Income Ratio", 0) ],
      compute(v) {
        const monthlyIncome = v.income/12;
        const maxTotalDebt = monthlyIncome*v.dti/100;
        const maxHousingPayment = Math.max(0, maxTotalDebt-v.monthlyDebts);
        const r = v.rate/100/12, n = v.years*12;
        const maxLoan = pvCalc(r,n,-maxHousingPayment,0);
        const maxPrice = maxLoan+v.downPayment;
        return { primary: { label: "Maximum Home Price", value: fmt.cur(maxPrice) },
          cells: [ { k: "Max Monthly Payment", v: fmt.cur(maxHousingPayment) }, { k: "Max Loan Amount", v: fmt.cur(maxLoan) }, { k: "Down Payment", v: fmt.cur(v.downPayment) } ] };
      },
    },
    {
      id: "rent_vs_buy", name: "Rent vs Buy Calculator", desc: "Compare the long-term net cost of renting vs. buying a home.",
      fields: [ CUR("rent", "Current Monthly Rent", 0), PCT("rentGrowth", "Annual Rent Growth", 0),
        CUR("homePrice", "Home Price", 0), CUR("downPayment", "Down Payment", 0), PCT("rate", "Mortgage Rate", 0),
        NUM("term", "Mortgage Term (yrs)", 0), PCT("appreciation", "Home Appreciation Rate", 0), NUM("years", "Years to Compare", 0) ],
      compute(v) {
        const loan = v.homePrice-v.downPayment;
        const am = amortize(loan, v.rate, v.term);
        let rentTotal = 0, rentPmt = v.rent;
        for (let y=0;y<v.years;y++){ rentTotal += rentPmt*12; rentPmt *= (1+v.rentGrowth/100); }
        const monthsCompare = v.years*12;
        const interestPaid = am.rows.slice(0, monthsCompare).reduce((a,r)=>a+r.interest,0);
        // Sum actual scheduled payments: a horizon longer than the mortgage term
        // must not keep billing payments after the loan is repaid.
        const mortgagePaid = am.rows.slice(0, monthsCompare).reduce((a,r)=>a+r.payment,0);
        const buyCost = mortgagePaid + v.downPayment;
        const futureHomeValue = v.homePrice*Math.pow(1+v.appreciation/100, v.years);
        const remainingBalance = am.rows[monthsCompare-1]? am.rows[monthsCompare-1].balance : 0;
        const equity = futureHomeValue-remainingBalance;
        const netBuyCost = buyCost-equity;
        return { primary: { label: netBuyCost<rentTotal? "Buying Saves You":"Renting Saves You", value: fmt.cur(Math.abs(rentTotal-netBuyCost)) },
          cells: [ { k: "Total Rent Paid", v: fmt.cur(rentTotal) }, { k: "Net Cost of Buying", v: fmt.cur(netBuyCost) },
            { k: "Home Equity Built", v: fmt.cur(equity) }, { k: "Interest Paid (period)", v: fmt.cur(interestPaid) } ] };
      },
    },
    {
      id: "mortgage_tax", name: "Mortgage Tax Saving Calculator", desc: "Estimate the value of the mortgage interest tax deduction.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Interest Rate", 0), NUM("years", "Term (Years)", 0), NUM("loanYear", "Which Loan Year", 0), PCT("taxBracket", "Marginal Tax Rate", 0) ],
      compute(v) {
        const am = amortize(v.amount, v.rate, v.years);
        const yearly = annualize(am.rows,12);
        if (!yearly.length) return { error: "Enter a loan amount and term to see the deduction." };
        // Clamp into range at both ends: the field defaults to 0, and an
        // unclamped 0 - 1 indexes off the front of the array, so an otherwise
        // valid mortgage failed with a misleading "check your inputs".
        const yr = yearly[Math.min(Math.max(v.loanYear-1, 0), yearly.length-1)];
        const taxSavings = yr.interest*v.taxBracket/100;
        return { primary: { label: "Tax Savings This Year", value: fmt.cur(taxSavings) },
          cells: [ { k: "Interest Paid This Year", v: fmt.cur(yr.interest) }, { k: "Principal Paid This Year", v: fmt.cur(yr.principal) }, { k: "Tax Bracket", v: fmt.pct(v.taxBracket) } ],
          note: "Assumes itemizing deductions and that the full interest amount qualifies; consult a tax professional for your situation." };
      },
    },
    {
      id: "discount_points", name: "Discount Points Calculator", desc: "Find the breakeven point for buying mortgage discount points.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("baseRate", "Rate Without Points", 0), PCT("rateReduction", "Rate Reduction per Point", 0),
        NUM("points", "Points Purchased", 0), NUM("years", "Loan Term (Years)", 0) ],
      compute(v) {
        const pointCost = v.amount*v.points/100;
        const newRate = v.baseRate-v.rateReduction*v.points;
        const basePayment = -pmt(v.baseRate/100/12, v.years*12, v.amount,0);
        const newPayment = -pmt(newRate/100/12, v.years*12, v.amount,0);
        const monthlySavings = basePayment-newPayment;
        const breakeven = monthlySavings>0? pointCost/monthlySavings : Infinity;
        return { primary: { label: "Breakeven Period", value: isFinite(breakeven)? fmt.num(breakeven,1)+" months":"N/A" },
          cells: [ { k: "Cost of Points", v: fmt.cur(pointCost) }, { k: "New Rate", v: fmt.pct(newRate) }, { k: "Monthly Savings", v: fmt.cur(monthlySavings) }, { k: "Original Payment", v: fmt.cur(basePayment) } ] };
      },
    },
    {
      id: "arm", name: "Adjustable Rate Calculator", desc: "Project payments through an ARM's initial fixed period and first adjustment.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("initialRate", "Initial Rate", 0), NUM("initialYears", "Initial Fixed Period (yrs)", 0),
        PCT("adjustedRate", "Rate After Adjustment", 0), NUM("years", "Total Term (Years)", 0) ],
      compute(v) {
        const n = v.years*12, r1 = v.initialRate/100/12;
        const payment1 = -pmt(r1, n, v.amount, 0);
        const am1 = amortize(v.amount, v.initialRate, v.years).rows.slice(0, v.initialYears*12);
        const balanceAtAdjust = am1.length? am1[am1.length-1].balance : v.amount;
        const remainingMonths = n-v.initialYears*12;
        const payment2 = -pmt(v.adjustedRate/100/12, remainingMonths, balanceAtAdjust, 0);
        return { primary: { label: "Initial Payment", value: fmt.cur(payment1) },
          cells: [ { k: "Balance at Adjustment", v: fmt.cur(balanceAtAdjust) }, { k: "Payment After Adjustment", v: fmt.cur(payment2) },
            { k: "Payment Change", v: fmt.cur(payment2-payment1) }, { k: "Initial Period", v: v.initialYears+" yrs" } ] };
      },
    },
    {
      id: "fixed_vs_arm", name: "Fixed vs Adjustable Rate Calculator", desc: "Compare total cost of a fixed-rate loan vs. an ARM over the comparison horizon.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("fixedRate", "Fixed Rate", 0), PCT("armInitialRate", "ARM Initial Rate", 0),
        NUM("armInitialYears", "ARM Initial Period (yrs)", 0), PCT("armAdjustedRate", "ARM Rate After Adjustment", 0), NUM("years", "Term (Years)", 0) ],
      compute(v) {
        const fixed = amortize(v.amount, v.fixedRate, v.years);
        const armPhase1 = amortize(v.amount, v.armInitialRate, v.years).rows.slice(0, v.armInitialYears*12);
        const balance = armPhase1.length? armPhase1[armPhase1.length-1].balance : v.amount;
        const interest1 = armPhase1.reduce((a,r)=>a+r.interest,0);
        const phase2 = amortize(balance, v.armAdjustedRate, v.years-v.armInitialYears);
        const armTotalInterest = interest1+phase2.totalInterest;
        const armTotalPaid = v.amount+armTotalInterest;
        return { primary: { label: "Total Cost Difference (Fixed − ARM)", value: fmt.cur(fixed.totalPaid-armTotalPaid) },
          cells: [ { k: "Fixed Total Interest", v: fmt.cur(fixed.totalInterest) }, { k: "ARM Total Interest", v: fmt.cur(armTotalInterest) },
            { k: "Fixed Payment", v: fmt.cur(fixed.payment) }, { k: "ARM Initial Payment", v: fmt.cur(-pmt(v.armInitialRate/100/12, v.years*12, v.amount,0)) } ] };
      },
    },
    {
      id: "biweekly", name: "Bi-weekly Payment Calculator", desc: "See how switching to bi-weekly payments accelerates payoff and cuts interest.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Annual Interest Rate", 0), NUM("years", "Loan Term (Years)", 0) ],
      compute(v) {
        const monthly = amortize(v.amount, v.rate, v.years, 12, 0);
        const biweeklyPayment = monthly.payment/2;
        // Direct bi-weekly schedule: 26 payments/year of half the monthly payment.
        let balance=v.amount, totalInterest=0, period=0;
        const rPeriod = v.rate/100/26;
        while (balance>0.01 && period<v.years*26+52) {
          period++;
          const interest = balance*rPeriod;
          let principalPaid = biweeklyPayment-interest;
          if (principalPaid>balance) principalPaid=balance;
          balance-=principalPaid; totalInterest+=interest;
          if (balance<=0) break;
        }
        return { primary: { label: "Interest Saved", value: fmt.cur(monthly.totalInterest-totalInterest) },
          cells: [ { k: "Bi-Weekly Payment", v: fmt.cur(biweeklyPayment) }, { k: "Payoff Time", v: fmt.num(period/26,1)+" yrs" },
            { k: "Monthly Plan Payoff", v: fmt.num(monthly.periods/12,1)+" yrs" }, { k: "Monthly Plan Interest", v: fmt.cur(monthly.totalInterest) } ] };
      },
    },
    {
      id: "interest_only", name: "Interest Only Calculator", desc: "Compare interest-only payments to fully amortizing payments after the IO period.",
      fields: [ CUR("amount", "Loan Amount", 0), PCT("rate", "Annual Interest Rate", 0), NUM("ioYears", "Interest-Only Period (yrs)", 0), NUM("totalYears", "Total Loan Term (Years)", 0) ],
      compute(v) {
        const ioPayment = v.amount*(v.rate/100)/12;
        const remainingYears = v.totalYears-v.ioYears;
        const amortizingPayment = -pmt(v.rate/100/12, remainingYears*12, v.amount, 0);
        return { primary: { label: "Interest-Only Payment", value: fmt.cur(ioPayment) },
          cells: [ { k: "Payment After IO Period", v: fmt.cur(amortizingPayment) }, { k: "Payment Increase", v: fmt.cur(amortizingPayment-ioPayment) },
            { k: "IO Period", v: v.ioYears+" yrs" }, { k: "Remaining Amortization", v: remainingYears+" yrs" } ] };
      },
    },
    {
      id: "rental_property", name: "Rental Property Calculator", desc: "Analyze cash flow, cap rate and cash-on-cash return for a rental property.",
      fields: [ CUR("price", "Purchase Price", 0), CUR("downPayment", "Down Payment", 0), PCT("rate", "Mortgage Rate", 0), NUM("term", "Mortgage Term (yrs)", 0),
        CUR("rent", "Monthly Rent Income", 0), CUR("expenses", "Monthly Operating Expenses", 0), PCT("vacancy", "Vacancy Rate", 0) ],
      compute(v) {
        const loan = v.price-v.downPayment;
        const am = amortize(loan, v.rate, v.term);
        const effectiveRent = v.rent*(1-v.vacancy/100);
        const noi = (effectiveRent-v.expenses)*12;
        const annualDebtService = am.payment*12;
        const cashFlow = noi-annualDebtService;
        const capRate = noi/v.price*100;
        const cocReturn = cashFlow/v.downPayment*100;
        return { primary: { label: "Monthly Cash Flow", value: fmt.cur(cashFlow/12) },
          cells: [ { k: "Cap Rate", v: fmt.pct(capRate) }, { k: "Cash-on-Cash Return", v: fmt.pct(cocReturn) },
            { k: "NOI (Annual)", v: fmt.cur(noi) }, { k: "Mortgage Payment", v: fmt.cur(am.payment) } ] };
      },
    },
  ],
};

/* ============ Category: Retirement ============ */
const CAT_RETIRE = {
  id: "retirement", name: "Retirement", icon: "🌅",
  calcs: [
    {
      id: "retirement_planner", name: "Retirement Planner", desc: "Project your retirement nest egg and compare it to what you'll need.",
      fields: [ NUM("currentAge", "Current Age", 0), NUM("retireAge", "Retirement Age", 0), CUR("currentSavings", "Current Savings", 0),
        CUR("monthly", "Monthly Contribution", 0), PCT("returnRate", "Expected Annual Return", 0), CUR("desiredIncome", "Desired Annual Retirement Income", 0), NUM("lifeExpectancy", "Life Expectancy (Age)", 0) ],
      compute(v) {
        const years = v.retireAge-v.currentAge, r = v.returnRate/100/12, n = years*12;
        const fv = v.currentSavings*Math.pow(1+r,n) + v.monthly*(r===0? n : (Math.pow(1+r,n)-1)/r);
        const retirementYears = v.lifeExpectancy-v.retireAge;
        const R = v.returnRate/100;
        const needed = v.desiredIncome*(R===0? retirementYears : (1-Math.pow(1+R,-retirementYears))/R);
        return { primary: { label: "Projected Nest Egg at Retirement", value: fmt.cur(fv) },
          cells: [ { k: "Estimated Need", v: fmt.cur(needed) }, { k: "Surplus / (Shortfall)", v: fmt.cur(fv-needed) },
            { k: "Years to Save", v: years }, { k: "Years in Retirement", v: retirementYears } ] };
      },
    },
    {
      id: "401k_contribution", name: "401k Contribution Calculator", desc: "Project your 401(k) balance including employer match.",
      fields: [ CUR("salary", "Annual Salary", 0), PCT("contribPct", "Your Contribution %", 0), PCT("matchPct", "Employer Match %", 0),
        PCT("matchLimit", "Match Limit (% of salary)", 0), CUR("currentBalance", "Current 401k Balance", 0), NUM("years", "Years to Retirement", 0), PCT("returnRate", "Expected Annual Return", 0) ],
      compute(v) {
        const yourContrib = v.salary*v.contribPct/100;
        const matchedPct = Math.min(v.contribPct, v.matchLimit);
        const employerContrib = v.salary*matchedPct/100*(v.matchPct/100);
        const totalAnnual = yourContrib+employerContrib;
        const r = v.returnRate/100;
        const fv = v.currentBalance*Math.pow(1+r,v.years) + totalAnnual*(r===0? v.years : (Math.pow(1+r,v.years)-1)/r);
        return { primary: { label: "Projected Balance at Retirement", value: fmt.cur(fv) },
          cells: [ { k: "Your Annual Contribution", v: fmt.cur(yourContrib) }, { k: "Employer Match (Annual)", v: fmt.cur(employerContrib) },
            { k: "Total Annual Contribution", v: fmt.cur(totalAnnual) }, { k: "Free Employer Money (Lifetime)", v: fmt.cur(employerContrib*v.years) } ] };
      },
    },
    {
      id: "401k_max", name: "401k Save the Max Calculator", desc: "Find the contribution % needed to max out your 401(k) this year.",
      fields: [ CUR("salary", "Annual Salary", 0), PCT("currentContribPct", "Current Contribution %", 0), CUR("irsLimit", "Annual IRS Limit", 0), SEL("payPeriods", "Pay Periods per Year", "26", [["12","Monthly"],["24","Semi-Monthly"],["26","Bi-Weekly"],["52","Weekly"]]) ],
      compute(v) {
        const pctNeeded = v.irsLimit/v.salary*100;
        const perPaycheckMax = v.irsLimit/Number(v.payPeriods);
        const currentAnnual = v.salary*v.currentContribPct/100;
        const shortfall = v.irsLimit-currentAnnual;
        return { primary: { label: "Contribution % Needed to Max Out", value: fmt.pct(pctNeeded) },
          cells: [ { k: "Per-Paycheck Amount", v: fmt.cur(perPaycheckMax) }, { k: "Current Annual Contribution", v: fmt.cur(currentAnnual) },
            { k: "Remaining to Max", v: fmt.cur(Math.max(0,shortfall)) }, { k: "IRS Limit", v: fmt.cur(v.irsLimit) } ] };
      },
    },
    {
      id: "retirement_savings_analysis", name: "Retirement Savings Analysis", desc: "Check whether your current savings rate will meet your retirement income goal.",
      fields: [ CUR("currentSavings", "Current Savings", 0), CUR("monthly", "Monthly Savings", 0), NUM("yearsToRetire", "Years to Retirement", 0),
        PCT("returnRate", "Expected Return (Pre-Retirement)", 0), CUR("desiredIncome", "Desired Annual Income", 0), NUM("withdrawalYears", "Withdrawal Years", 0), PCT("withdrawalReturn", "Expected Return (Retirement)", 0) ],
      compute(v) {
        const r = v.returnRate/100/12, n=v.yearsToRetire*12;
        const fv = v.currentSavings*Math.pow(1+r,n)+v.monthly*(r===0? n : (Math.pow(1+r,n)-1)/r);
        const wr = v.withdrawalReturn/100;
        const sustainableIncome = wr===0? fv/v.withdrawalYears : fv*wr/(1-Math.pow(1+wr,-v.withdrawalYears));
        const gap = v.desiredIncome-sustainableIncome;
        return { primary: { label: "Sustainable Annual Income", value: fmt.cur(sustainableIncome) },
          cells: [ { k: "Projected Nest Egg", v: fmt.cur(fv) }, { k: "Desired Income", v: fmt.cur(v.desiredIncome) },
            { k: "Surplus / (Gap)", v: fmt.cur(-gap) } ],
          note: gap>0? "You may fall short of your goal — consider increasing monthly savings.":"You're on track to meet or exceed your goal." };
      },
    },
    {
      id: "retirement_income_analysis", name: "Retirement Income Analysis", desc: "Analyze how long your retirement income will last under a fixed withdrawal rate.",
      fields: [ CUR("nestEgg", "Nest Egg at Retirement", 0), PCT("withdrawalRate", "Annual Withdrawal Rate", 0), PCT("returnRate", "Expected Return", 0), PCT("inflation", "Inflation Rate", 0), NUM("years", "Years to Project", 0) ],
      compute(v) {
        let balance = v.nestEgg, withdrawal = v.nestEgg*v.withdrawalRate/100;
        let yearsLasted = 0;
        for (let y=0;y<v.years;y++) {
          balance = balance*(1+v.returnRate/100) - withdrawal;
          withdrawal *= (1+v.inflation/100);
          if (balance<=0) { yearsLasted=y+1; break; }
          yearsLasted=y+1;
        }
        return { primary: { label: balance>0? "Balance After Period":"Funds Depleted After", value: balance>0? fmt.cur(balance) : yearsLasted+" yrs" },
          cells: [ { k: "Initial Annual Withdrawal", v: fmt.cur(v.nestEgg*v.withdrawalRate/100) }, { k: "Years Projected", v: v.years },
            { k: "Sustainable?", v: balance>0? "Yes":"No" } ] };
      },
    },
    {
      id: "ira", name: "Traditional IRA vs Roth IRA", desc: "Compare after-tax outcomes of Traditional vs. Roth IRA contributions.",
      fields: [ CUR("annualContribution", "Annual Contribution", 0), NUM("years", "Years Until Withdrawal", 0), PCT("currentTaxRate", "Current Tax Rate", 0), PCT("retirementTaxRate", "Retirement Tax Rate", 0), PCT("returnRate", "Expected Annual Return", 0) ],
      compute(v) {
        const r = v.returnRate/100;
        const factor = r===0? v.years : (Math.pow(1+r,v.years)-1)/r;
        const fvGross = v.annualContribution*factor;
        const traditionalAfterTax = fvGross*(1-v.retirementTaxRate/100);
        const rothContribution = v.annualContribution*(1-v.currentTaxRate/100);
        const rothFV = rothContribution*factor;
        return { primary: { label: rothFV>traditionalAfterTax? "Roth Wins By":"Traditional Wins By", value: fmt.cur(Math.abs(rothFV-traditionalAfterTax)) },
          cells: [ { k: "Traditional (after-tax)", v: fmt.cur(traditionalAfterTax) }, { k: "Roth (after-tax)", v: fmt.cur(rothFV) },
            { k: "Pre-Tax Future Value", v: fmt.cur(fvGross) } ],
          note: "Roth contributions are made after-tax; Traditional contributions are pre-tax but taxed on withdrawal." };
      },
    },
    {
      id: "rmd", name: "Required Minimum Distribution (RMD)", desc: "Calculate your IRS-required minimum distribution from a retirement account.",
      fields: [ CUR("balance", "Account Balance (Dec 31 prior year)", 0), NUM("age", "Age This Year", 0) ],
      compute(v) {
        if (v.age < 73) return { error: "No RMD is required before age 73 under current law (SECURE 2.0, effective 2023). Enter age 73 or older." };
        const age = Math.min(100, Math.round(v.age));
        const divisor = RMD_TABLE[age] || 6.4;
        const rmd = v.balance/divisor;
        return { primary: { label: "Required Minimum Distribution", value: fmt.cur(rmd) },
          cells: [ { k: "Life Expectancy Divisor", v: divisor }, { k: "Monthly Equivalent", v: fmt.cur(rmd/12) } ],
          note: "Based on the IRS Uniform Lifetime Table (ages above 100 use the age-100 divisor here). Use the Joint Life Table instead if your spouse is the sole beneficiary and more than 10 years younger." };
      },
    },
    {
      id: "ss_estimator", name: "Social Security Estimator", desc: "Estimate your monthly Social Security benefit from average indexed earnings.",
      fields: [ CUR("aime", "Average Indexed Monthly Earnings (AIME)", 0), SEL("claimAge", "Claiming Age", "67", [["62","62 (Early)"],["67","67 (Full Retirement Age)"],["70","70 (Delayed)"]]) ],
      compute(v) {
        let pia = 0.9*Math.min(v.aime,1174) + 0.32*Math.max(0,Math.min(v.aime,7078)-1174) + 0.15*Math.max(0,v.aime-7078);
        const age = Number(v.claimAge);
        let benefit = pia;
        if (age===62) benefit = pia*0.70;
        else if (age===70) benefit = pia*1.24;
        return { primary: { label: "Estimated Monthly Benefit", value: fmt.cur(benefit) },
          cells: [ { k: "Primary Insurance Amount (FRA)", v: fmt.cur(pia) }, { k: "Claiming Age", v: age }, { k: "Annual Benefit", v: fmt.cur(benefit*12) } ],
          note: "Simplified estimate using 2024 bend points; actual benefits depend on your full earnings history." };
      },
    },
    {
      id: "ss_analysis", name: "Social Security Analysis", desc: "Compare total lifetime benefits across different claiming ages.",
      fields: [ CUR("pia", "Primary Insurance Amount (at FRA)", 0), NUM("lifeExpectancy", "Life Expectancy (Age)", 0) ],
      compute(v) {
        const benefits = { 62: v.pia*0.70, 67: v.pia, 70: v.pia*1.24 };
        const totals = {}; Object.keys(benefits).forEach(age=>{ totals[age]=benefits[age]*12*Math.max(0, v.lifeExpectancy-Number(age)); });
        const best = Object.keys(totals).reduce((a,b)=> totals[a]>totals[b]?a:b);
        return { primary: { label: "Best Claiming Age (Lifetime Total)", value: "Age "+best },
          cells: [ { k: "Claim at 62 (lifetime)", v: fmt.cur(totals[62]) }, { k: "Claim at 67 (lifetime)", v: fmt.cur(totals[67]) }, { k: "Claim at 70 (lifetime)", v: fmt.cur(totals[70]) } ],
          bars: [62,67,70].map(age=>({label:"Age "+age, pct: totals[age]/Math.max(...Object.values(totals))*100, value: fmt.cur(totals[age])})) };
      },
    },
    {
      id: "ss_distribution", name: "Social Security Distribution", desc: "Estimate what portion of your Social Security benefits may be taxable.",
      fields: [ CUR("annualBenefit", "Annual SS Benefit", 0), CUR("otherIncome", "Other Annual Income", 0), SEL("filing", "Filing Status", "single", [["single","Single"],["married","Married Filing Jointly"]]) ],
      compute(v) {
        const provisional = v.otherIncome + v.annualBenefit/2;
        const t1 = v.filing==="single"? 25000 : 32000;
        const t2 = v.filing==="single"? 34000 : 44000;
        // Mirrors the IRS worksheet: the 50%-tier amounts are themselves capped
        // at half the benefit before the overall 85% cap applies.
        let taxableAmount = 0;
        if (provisional>t2) taxableAmount = Math.min((t2-t1)*0.5, v.annualBenefit*0.5) + (provisional-t2)*0.85;
        else if (provisional>t1) taxableAmount = Math.min((provisional-t1)*0.5, v.annualBenefit*0.5);
        taxableAmount = Math.min(taxableAmount, v.annualBenefit*0.85);
        const effectivePct = taxableAmount/v.annualBenefit*100;
        return { primary: { label: "Estimated Taxable Portion", value: fmt.cur(taxableAmount) },
          cells: [ { k: "Provisional Income", v: fmt.cur(provisional) }, { k: "Effective Taxable %", v: fmt.pct(effectivePct) }, { k: "Non-Taxable Portion", v: fmt.cur(v.annualBenefit-taxableAmount) } ],
          note: "Approximates IRS provisional income worksheets; actual taxable amount depends on deductions and the full return." };
      },
    },
    {
      id: "asset_allocation", name: "Asset Allocation Calculator", desc: "Get a suggested stock/bond/cash mix based on age and risk tolerance.",
      fields: [ NUM("age", "Your Age", 0), SEL("risk", "Risk Tolerance", "moderate", [["conservative","Conservative"],["moderate","Moderate"],["aggressive","Aggressive"]]) ],
      compute(v) {
        let stockPct = Math.max(20, 110-v.age);
        if (v.risk==="conservative") stockPct -= 15;
        if (v.risk==="aggressive") stockPct += 15;
        stockPct = Math.min(95, Math.max(10, stockPct));
        const bondPct = Math.max(0, 90-stockPct);
        const cashPct = 100-stockPct-bondPct;
        return { primary: { label: "Suggested Stock Allocation", value: fmt.pct(stockPct,0) },
          cells: [ { k: "Bonds", v: fmt.pct(bondPct,0) }, { k: "Cash", v: fmt.pct(cashPct,0) } ],
          donut: { segments: [ {label:"Stocks", value:stockPct, color:"var(--primary)"}, {label:"Bonds", value:bondPct, color:"var(--accent)"}, {label:"Cash", value:cashPct, color:"var(--muted)"} ] } };
      },
    },
    {
      id: "retirement_income_calc", name: "Retirement Income Calculator", desc: "Determine sustainable monthly income your retirement savings can generate.",
      fields: [ CUR("nestEgg", "Retirement Savings", 0), NUM("years", "Years in Retirement", 0), PCT("returnRate", "Expected Annual Return", 0), PCT("inflation", "Inflation Adjustment", 0) ],
      compute(v) {
        const realRate = (1+v.returnRate/100)/(1+v.inflation/100)-1;
        const monthlyRate = realRate/12, n=v.years*12;
        const monthlyIncome = pmt(monthlyRate, n, v.nestEgg, 0)*-1;
        return { primary: { label: "Sustainable Monthly Income", value: fmt.cur(monthlyIncome) },
          cells: [ { k: "Annual Income", v: fmt.cur(monthlyIncome*12) }, { k: "Real Rate of Return", v: fmt.pct(realRate*100) }, { k: "Years Covered", v: v.years } ] };
      },
    },
    {
      id: "retirement_calc", name: "Retirement Calculator", desc: "All-in-one retirement readiness summary.",
      fields: [ NUM("currentAge", "Current Age", 0), NUM("retireAge", "Retirement Age", 0), CUR("currentSavings", "Current Savings", 0),
        CUR("monthly", "Monthly Contribution", 0), PCT("returnRate", "Pre-Retirement Return", 0), NUM("lifeExpectancy", "Life Expectancy", 0), CUR("desiredMonthlyIncome", "Desired Monthly Income", 0) ],
      compute(v) {
        const years = v.retireAge-v.currentAge, r=v.returnRate/100/12, n=years*12;
        const fv = v.currentSavings*Math.pow(1+r,n)+v.monthly*(r===0? n : (Math.pow(1+r,n)-1)/r);
        const retirementMonths = (v.lifeExpectancy-v.retireAge)*12;
        const sustainableMonthly = pmt(0.04/12, retirementMonths, fv,0)*-1;
        const gap = v.desiredMonthlyIncome-sustainableMonthly;
        return { primary: { label: "Projected Savings at Retirement", value: fmt.cur(fv) },
          cells: [ { k: "Sustainable Monthly Income", v: fmt.cur(sustainableMonthly) }, { k: "Desired Monthly Income", v: fmt.cur(v.desiredMonthlyIncome) },
            { k: "Monthly Surplus/(Gap)", v: fmt.cur(-gap) } ],
          note: "Retirement-phase income assumes the balance keeps earning a fixed 4% annual return while being drawn down." };
      },
    },
    {
      id: "annuity", name: "Annuity Calculator", desc: "Calculate future value or required payment for a fixed annuity.",
      fields: [ SEL("solveFor", "Solve For", "fv", [["fv","Future Value"],["pmt","Required Payment"]]), CUR("payment", "Periodic Payment", 0),
        CUR("targetFV", "Target Future Value", 0), PCT("rate", "Annual Interest Rate", 0), NUM("years", "Years", 0), SEL("type", "Annuity Type", "ordinary", [["ordinary","Ordinary (End of Period)"],["due","Annuity Due (Beginning)"]]) ],
      compute(v) {
        const r = v.rate/100/12, n = v.years*12, type = v.type==="due"?1:0;
        if (v.solveFor==="fv") {
          const fv = fvCalc(r,n,-v.payment,0,type);
          return { primary: { label: "Future Value", value: fmt.cur(fv) }, cells: [ { k: "Total Contributions", v: fmt.cur(v.payment*n) }, { k: "Interest Earned", v: fmt.cur(fv-v.payment*n) } ] };
        } else {
          const req = -pmt(r,n,0,v.targetFV,type);
          return { primary: { label: "Required Periodic Payment", value: fmt.cur(req) }, cells: [ { k: "Target Future Value", v: fmt.cur(v.targetFV) }, { k: "Total Contributions", v: fmt.cur(req*n) } ] };
        }
      },
    },
  ],
};

/* ============ Category: Credit Card ============ */
const CAT_CREDIT = {
  id: "credit", name: "Credit Card", icon: "💳",
  calcs: [
    {
      id: "cc_payoff", name: "Credit Card Payoff Calculator", desc: "Find how long it will take to pay off a balance with fixed payments.",
      fields: [ CUR("balance", "Current Balance", 0), PCT("apr", "Annual Percentage Rate (APR)", 0), CUR("payment", "Fixed Monthly Payment", 0) ],
      compute(v) {
        const r = v.apr/100/12;
        const minPayment = v.balance*r;
        if (v.payment<=minPayment) return { error: "Payment is too low to ever pay off this balance — increase your monthly payment." };
        // r === 0 (a 0% promo APR) sends the closed-form log expression to 0/0.
        const months = r===0 ? v.balance/v.payment : -Math.log(1-(v.balance*r)/v.payment)/Math.log(1+r);
        const totalPaid = v.payment*months;
        return { primary: { label: "Time to Pay Off", value: fmt.num(months,1)+" months" },
          cells: [ { k: "Total Interest Paid", v: fmt.cur(totalPaid-v.balance) }, { k: "Total Paid", v: fmt.cur(totalPaid) }, { k: "Years", v: fmt.num(months/12,1) } ] };
      },
    },
    {
      id: "cc_minimum", name: "Credit Card Minimum Calculator", desc: "See the true cost of paying only the minimum each month.",
      fields: [ CUR("balance", "Current Balance", 0), PCT("apr", "Annual Percentage Rate (APR)", 0), PCT("minPct", "Minimum Payment % of Balance", 0), CUR("minFloor", "Minimum Payment Floor", 0) ],
      compute(v) {
        let balance = v.balance, r = v.apr/100/12, totalPaid=0, totalInterest=0, months=0;
        while (balance>0.01 && months<600) {
          months++;
          const interest = balance*r;
          let payment = Math.max(balance*v.minPct/100, v.minFloor);
          if (payment>balance+interest) payment = balance+interest;
          const principal = payment-interest;
          balance -= principal;
          totalPaid += payment; totalInterest += interest;
        }
        return { primary: { label: "Time to Pay Off (Minimums Only)", value: months>=600? "50+ years":fmt.num(months,0)+" months" },
          cells: [ { k: "Total Interest Paid", v: fmt.cur(totalInterest) }, { k: "Total Paid", v: fmt.cur(totalPaid) }, { k: "Years", v: fmt.num(months/12,1) } ],
          note: "Paying only minimums dramatically increases total interest — consider paying more than the minimum." };
      },
    },
  ],
};

/* ============ Category: Auto Loan & Lease ============ */
const CAT_AUTO = {
  id: "auto", name: "Auto Loan & Lease", icon: "🚗",
  calcs: [
    {
      id: "auto_loan", name: "Auto Loan Calculator", desc: "Calculate monthly payment and total cost for a vehicle loan.",
      fields: [ CUR("price", "Vehicle Price", 0), CUR("downPayment", "Down Payment", 0), CUR("tradeIn", "Trade-In Value", 0),
        PCT("rate", "Annual Interest Rate", 0), NUM("termMonths", "Loan Term (Months)", 0), PCT("salesTax", "Sales Tax Rate", 0) ],
      compute(v) {
        const taxable = v.price-v.tradeIn;
        const tax = taxable*v.salesTax/100;
        const amountFinanced = v.price+tax-v.downPayment-v.tradeIn;
        const payment = -pmt(v.rate/100/12, v.termMonths, amountFinanced, 0);
        const totalPaid = payment*v.termMonths;
        return { primary: { label: "Monthly Payment", value: fmt.cur(payment) },
          cells: [ { k: "Amount Financed", v: fmt.cur(amountFinanced) }, { k: "Sales Tax", v: fmt.cur(tax) },
            { k: "Total Interest", v: fmt.cur(totalPaid-amountFinanced) }, { k: "Total Cost", v: fmt.cur(totalPaid+v.downPayment+v.tradeIn) } ] };
      },
    },
    {
      id: "auto_lease", name: "Auto Lease Calculator", desc: "Estimate your monthly lease payment from cap cost and residual value.",
      fields: [ CUR("capCost", "Negotiated Price (Cap Cost)", 0), CUR("capReduction", "Down Payment / Cap Reduction", 0), PCT("residualPct", "Residual Value %", 0),
        NUM("moneyFactor", "Money Factor (e.g. 0.00125)", 0, { step: "0.00001" }), NUM("termMonths", "Lease Term (Months)", 0), PCT("salesTax", "Sales Tax Rate", 0) ],
      compute(v) {
        const adjustedCapCost = v.capCost-v.capReduction;
        const residualValue = v.capCost*v.residualPct/100;
        const depreciation = (adjustedCapCost-residualValue)/v.termMonths;
        const rentCharge = (adjustedCapCost+residualValue)*v.moneyFactor;
        const basePayment = depreciation+rentCharge;
        const tax = basePayment*v.salesTax/100;
        const monthlyPayment = basePayment+tax;
        return { primary: { label: "Monthly Lease Payment", value: fmt.cur(monthlyPayment) },
          cells: [ { k: "Depreciation Portion", v: fmt.cur(depreciation) }, { k: "Rent Charge (Finance Fee)", v: fmt.cur(rentCharge) },
            { k: "Residual Value", v: fmt.cur(residualValue) }, { k: "Equivalent APR", v: fmt.pct(v.moneyFactor*2400,2) } ] };
      },
    },
  ],
};

/* ============ Category: Miscellaneous ============ */
const CAT_MISC = {
  id: "misc", name: "Miscellaneous", icon: "🧮",
  calcs: [
    {
      id: "tip", name: "Tip Calculator", desc: "Calculate tip amount and split the bill among multiple people.",
      fields: [ CUR("bill", "Bill Amount", 0), PCT("tipPct", "Tip Percentage", 0), NUM("people", "Split Between (people)", 0) ],
      compute(v) {
        const tip = v.bill*v.tipPct/100;
        const total = v.bill+tip;
        return { primary: { label: "Tip Amount", value: fmt.cur(tip) },
          cells: [ { k: "Total Bill", v: fmt.cur(total) }, { k: "Per Person", v: fmt.cur(total/v.people) }, { k: "Tip Per Person", v: fmt.cur(tip/v.people) } ] };
      },
    },
    {
      id: "discount_tax", name: "Discount and Tax Calculator", desc: "Calculate final price after applying a discount and sales tax.",
      fields: [ CUR("price", "Original Price", 0), PCT("discount", "Discount %", 0), PCT("tax", "Sales Tax %", 0) ],
      compute(v) {
        const discounted = v.price*(1-v.discount/100);
        const taxAmount = discounted*v.tax/100;
        const final = discounted+taxAmount;
        return { primary: { label: "Final Price", value: fmt.cur(final) },
          cells: [ { k: "Discount Amount", v: fmt.cur(v.price-discounted) }, { k: "Price After Discount", v: fmt.cur(discounted) }, { k: "Tax Amount", v: fmt.cur(taxAmount) } ] };
      },
    },
    {
      id: "percentage", name: "Percentage Calculator", desc: "Solve common percentage problems.",
      fields: [ SEL("mode", "Calculation Type", "of", [["of","X% of Y"],["isWhatPct","X is what % of Y"],["change","% Change from X to Y"]]), NUM("x", "X", 0), NUM("y", "Y", 0) ],
      compute(v) {
        if (v.mode==="of") { const r=v.x/100*v.y; return { primary: { label: `${v.x}% of ${v.y}`, value: fmt.num(r,2) } }; }
        if (v.mode==="isWhatPct") {
          if (v.y===0) return { error: "Y cannot be zero." };
          const r=v.x/v.y*100; return { primary: { label: `${v.x} is what % of ${v.y}`, value: fmt.pct(r) } };
        }
        if (v.x===0) return { error: "Initial value (X) cannot be zero." };
        const r = (v.y-v.x)/v.x*100;
        return { primary: { label: "% Change", value: fmt.pct(r) }, cells: [ { k: "Difference", v: fmt.num(v.y-v.x,2) } ] };
      },
    },
    {
      id: "date_calc", name: "Date Calculator", desc: "Calculate days between two dates, or add/subtract days from a date.",
      fields: [ DTE("startDate", "Start Date", new Date().toISOString().slice(0,10)), DTE("endDate", "End Date", new Date(Date.now()+30*86400000).toISOString().slice(0,10)) ],
      compute(v) {
        const d1 = new Date(v.startDate), d2 = new Date(v.endDate);
        const days = Math.round((d2-d1)/86400000);
        const weeks = days/7;
        return { primary: { label: "Days Between Dates", value: fmt.int(days)+" days" },
          cells: [ { k: "Weeks", v: fmt.num(weeks,1) }, { k: "Months (approx)", v: fmt.num(days/30.44,1) }, { k: "Business Days (approx)", v: fmt.int(days*5/7) } ] };
      },
    },
    {
      id: "unit_conversion", name: "Unit Conversion", desc: "Convert between common length, weight and temperature units.",
      fields: [ SEL("category", "Category", "length", [["length","Length"],["weight","Weight"],["temperature","Temperature"]]),
        NUM("value", "Value", 0), SEL("from", "From Unit", "m", [["m","Meters"],["km","Kilometers"],["ft","Feet"],["mi","Miles"],["in","Inches"],["kg","Kilograms"],["lb","Pounds"],["oz","Ounces"],["g","Grams"],["c","Celsius"],["f","Fahrenheit"],["k","Kelvin"]]),
        SEL("to", "To Unit", "ft", [["m","Meters"],["km","Kilometers"],["ft","Feet"],["mi","Miles"],["in","Inches"],["kg","Kilograms"],["lb","Pounds"],["oz","Ounces"],["g","Grams"],["c","Celsius"],["f","Fahrenheit"],["k","Kelvin"]]) ],
      compute(v) {
        const lengthToM = { m:1, km:1000, ft:0.3048, mi:1609.34, in:0.0254 };
        const weightToKg = { kg:1, lb:0.453592, oz:0.0283495, g:0.001 };
        const isTemp = (u) => u==="c" || u==="f" || u==="k";
        let out;
        if (lengthToM[v.from] && lengthToM[v.to]) out = v.value*lengthToM[v.from]/lengthToM[v.to];
        else if (weightToKg[v.from] && weightToKg[v.to]) out = v.value*weightToKg[v.from]/weightToKg[v.to];
        else if (isTemp(v.from) && isTemp(v.to)) {
          // Guarded: the temperature path used to be the catch-all, so "meters
          // to kilograms" fell through and returned the input via Kelvin math.
          let celsius;
          if (v.from==="c") celsius=v.value; else if (v.from==="f") celsius=(v.value-32)*5/9; else celsius=v.value-273.15;
          if (v.to==="c") out=celsius; else if (v.to==="f") out=celsius*9/5+32; else out=celsius+273.15;
        }
        if (out===undefined) return { error: "Cannot convert between unrelated unit categories." };
        return { primary: { label: `${v.value} ${v.from} =`, value: fmt.num(out,4)+" "+v.to } };
      },
    },
    {
      id: "inflation", name: "US Inflation Calculator", desc: "See how much purchasing power has changed between two years using CPI data.",
      fields: [ CUR("amount", "Amount", 0), SEL("startYear", "Start Year", "2000", Object.keys(CPI).map(y=>[y,y])), SEL("endYear", "End Year", String(CPI_LATEST_YEAR), Object.keys(CPI).map(y=>[y,y])) ],
      compute(v) {
        const cpiStart = CPI[v.startYear], cpiEnd = CPI[v.endYear];
        const adjusted = v.amount*(cpiEnd/cpiStart);
        const totalInflation = (cpiEnd/cpiStart-1)*100;
        const years = Number(v.endYear)-Number(v.startYear);
        const annualized = (Math.pow(cpiEnd/cpiStart, 1/Math.abs(years||1))-1)*100;
        return { primary: { label: `Value in ${v.endYear}`, value: fmt.cur(adjusted) },
          cells: [ { k: "Total Inflation", v: fmt.pct(totalInflation) }, { k: "Avg. Annual Inflation", v: fmt.pct(annualized) } ],
          note: `Based on approximate annual average CPI-U index values through ${CPI_LATEST_YEAR}; for educational use. A given year's figure is an annual average, so it only exists once that year has finished — add the new year each January.` };
      },
    },
    {
      id: "tbill", name: "US Treasury Bill Calculator", desc: "Calculate the discount yield and investment (bond-equivalent) yield of a T-Bill.",
      fields: [ CUR("faceValue", "Face Value", 0), CUR("purchasePrice", "Purchase Price", 0), NUM("daysToMaturity", "Days to Maturity", 0) ],
      compute(v) {
        const discount = v.faceValue-v.purchasePrice;
        const discountYield = (discount/v.faceValue)*(360/v.daysToMaturity)*100;
        const investmentYield = (discount/v.purchasePrice)*(365/v.daysToMaturity)*100;
        return { primary: { label: "Bond-Equivalent Yield", value: fmt.pct(investmentYield) },
          cells: [ { k: "Discount Yield", v: fmt.pct(discountYield) }, { k: "Discount Amount", v: fmt.cur(discount) }, { k: "Days to Maturity", v: v.daysToMaturity } ] };
      },
    },
    {
      id: "margin_markup", name: "Margin and Markup Calculator", desc: "Calculate gross margin and markup percentage from cost and price.",
      fields: [ CUR("cost", "Cost", 0), CUR("price", "Selling Price", 0) ],
      compute(v) {
        const profit = v.price-v.cost;
        const margin = profit/v.price*100;
        const markup = profit/v.cost*100;
        return { primary: { label: "Gross Margin", value: fmt.pct(margin) },
          cells: [ { k: "Markup", v: fmt.pct(markup) }, { k: "Profit", v: fmt.cur(profit) } ] };
      },
    },
    {
      id: "business_forecast", name: "Business Forecast Calculator", desc: "Project future revenue using a constant annual growth rate.",
      fields: [ CUR("currentRevenue", "Current Annual Revenue", 0), PCT("growthRate", "Annual Growth Rate", 0), NUM("years", "Years to Forecast", 0) ],
      compute(v) {
        const projections = [];
        let rev = v.currentRevenue;
        for (let y=1;y<=v.years;y++) { rev*=(1+v.growthRate/100); projections.push(rev); }
        return { primary: { label: `Revenue in Year ${v.years}`, value: fmt.cur(projections[projections.length-1]) },
          cells: [ { k: "Total Growth", v: fmt.pct((projections[projections.length-1]/v.currentRevenue-1)*100) }, { k: "Current Revenue", v: fmt.cur(v.currentRevenue) } ],
          bars: projections.map((p,i)=>({label:"Yr "+(i+1), pct: p/projections[projections.length-1]*100, value: fmt.cur(p)})) };
      },
    },
    {
      id: "fuel", name: "Fuel Calculator", desc: "Calculate trip fuel cost and cost per mile.",
      fields: [ NUM("distance", "Distance (miles)", 0), NUM("mpg", "Fuel Economy (MPG)", 0), CUR("fuelPrice", "Fuel Price per Gallon", 0) ],
      compute(v) {
        const gallons = v.distance/v.mpg;
        const cost = gallons*v.fuelPrice;
        return { primary: { label: "Total Fuel Cost", value: fmt.cur(cost) },
          cells: [ { k: "Gallons Needed", v: fmt.num(gallons,2) }, { k: "Cost per Mile", v: fmt.cur(cost/v.distance,3) } ] };
      },
    },
    {
      id: "hourly_salary", name: "Hourly to Salary Calculator", desc: "Convert an hourly wage to an equivalent annual salary, or vice versa.",
      fields: [ SEL("mode", "Convert", "toSalary", [["toSalary","Hourly → Annual Salary"],["toHourly","Annual Salary → Hourly"]]), CUR("hourly", "Hourly Rate", 0), CUR("salary", "Annual Salary", 0), NUM("hoursPerWeek", "Hours per Week", 0), NUM("weeksPerYear", "Weeks Worked per Year", 0) ],
      compute(v) {
        if (v.mode==="toSalary") {
          const annual = v.hourly*v.hoursPerWeek*v.weeksPerYear;
          return { primary: { label: "Equivalent Annual Salary", value: fmt.cur(annual) }, cells: [ { k: "Monthly", v: fmt.cur(annual/12) }, { k: "Weekly", v: fmt.cur(v.hourly*v.hoursPerWeek) } ] };
        }
        const hourly = v.salary/(v.hoursPerWeek*v.weeksPerYear);
        return { primary: { label: "Equivalent Hourly Rate", value: fmt.cur(hourly) }, cells: [ { k: "Weekly", v: fmt.cur(hourly*v.hoursPerWeek) }, { k: "Monthly", v: fmt.cur(v.salary/12) } ] };
      },
    },
    {
      id: "salary_increase", name: "Salary Increase Calculator", desc: "Calculate your new salary and raise amount after a percentage increase.",
      fields: [ CUR("currentSalary", "Current Salary", 0), PCT("raisePct", "Raise Percentage", 0) ],
      compute(v) {
        const newSalary = v.currentSalary*(1+v.raisePct/100);
        return { primary: { label: "New Salary", value: fmt.cur(newSalary) },
          cells: [ { k: "Raise Amount", v: fmt.cur(newSalary-v.currentSalary) }, { k: "Monthly Increase", v: fmt.cur((newSalary-v.currentSalary)/12) } ] };
      },
    },
    {
      id: "paycheck_tax", name: "US Paycheck Tax Calculator", desc: "Estimate federal tax, FICA, and net pay from gross income.",
      fields: [ CUR("grossIncome", "Annual Gross Income", 0), SEL("filing", "Filing Status", "single", [["single","Single"],["married","Married Filing Jointly"]]),
        SEL("frequency", "Pay Frequency", "26", [["12","Monthly"],["24","Semi-Monthly"],["26","Bi-Weekly"],["52","Weekly"]]), PCT("stateTax", "State Tax Rate (flat est.)", 0) ],
      compute(v) {
        const stdDed = STD_DEDUCTION_2024[v.filing];
        const taxableIncome = Math.max(0, v.grossIncome-stdDed);
        const fedTax = taxFromBrackets(taxableIncome, FED_BRACKETS_2024[v.filing]);
        const ss = Math.min(v.grossIncome,168600)*0.062;
        const medicare = v.grossIncome*0.0145;
        const stateTax = v.grossIncome*v.stateTax/100;
        const netAnnual = v.grossIncome-fedTax-ss-medicare-stateTax;
        const perPeriod = netAnnual/Number(v.frequency);
        return { primary: { label: "Net Pay per Period", value: fmt.cur(perPeriod) },
          cells: [ { k: "Federal Tax (Annual)", v: fmt.cur(fedTax) }, { k: "Social Security + Medicare", v: fmt.cur(ss+medicare) },
            { k: "State Tax (est.)", v: fmt.cur(stateTax) }, { k: "Net Annual Pay", v: fmt.cur(netAnnual) } ],
          note: "Simplified 2024 federal brackets with standard deduction; ignores credits, pre-tax deductions, and local taxes." };
      },
    },
    {
      id: "net_distribution", name: "Net Distribution Calculator", desc: "Gross-up a desired net amount to find the required gross distribution.",
      fields: [ CUR("desiredNet", "Desired Net Amount", 0), PCT("taxRate", "Tax Rate", 0), PCT("fees", "Fees %", 0) ],
      compute(v) {
        if (v.taxRate+v.fees>=100) return { error: "Tax rate plus fees must total less than 100%." };
        const requiredGross = v.desiredNet/(1-v.taxRate/100-v.fees/100);
        const taxAmount = requiredGross*v.taxRate/100;
        const feeAmount = requiredGross*v.fees/100;
        return { primary: { label: "Required Gross Distribution", value: fmt.cur(requiredGross) },
          cells: [ { k: "Tax Withheld", v: fmt.cur(taxAmount) }, { k: "Fees", v: fmt.cur(feeAmount) }, { k: "Net Received", v: fmt.cur(requiredGross-taxAmount-feeAmount) } ] };
      },
    },
    {
      id: "effective_rate", name: "Effective Rate Calculator", desc: "Convert a nominal annual rate into its effective annual rate (APY).",
      fields: [ PCT("nominal", "Nominal Annual Rate", 0), SEL("compounding", "Compounding Frequency", "12", [["1","Annually"],["2","Semi-Annually"],["4","Quarterly"],["12","Monthly"],["365","Daily"]]) ],
      compute(v) {
        const n = Number(v.compounding);
        const effective = (Math.pow(1+v.nominal/100/n, n)-1)*100;
        return { primary: { label: "Effective Annual Rate (APY)", value: fmt.pct(effective) },
          cells: [ { k: "Nominal Rate", v: fmt.pct(v.nominal) }, { k: "Compounding Periods/Year", v: n } ] };
      },
    },
    {
      id: "balance_sheet", name: "Balance Sheet and Income Statement Analysis", desc: "Summarize basic balance sheet and income statement health.",
      fields: [ CUR("assets", "Total Assets", 0), CUR("liabilities", "Total Liabilities", 0), CUR("revenue", "Total Revenue", 0), CUR("expenses", "Total Expenses", 0) ],
      compute(v) {
        const equity = v.assets-v.liabilities;
        const netIncome = v.revenue-v.expenses;
        const netMargin = netIncome/v.revenue*100;
        const debtToAssets = v.liabilities/v.assets*100;
        return { primary: { label: "Owners' Equity", value: fmt.cur(equity) },
          cells: [ { k: "Net Income", v: fmt.cur(netIncome) }, { k: "Net Margin", v: fmt.pct(netMargin) },
            { k: "Debt-to-Assets", v: fmt.pct(debtToAssets) }, { k: "Return on Assets", v: fmt.pct(netIncome/v.assets*100) } ] };
      },
    },
    {
      id: "financial_ratios", name: "Financial Ratios", desc: "Calculate key liquidity, leverage, and profitability ratios.",
      fields: [ CUR("currentAssets", "Current Assets", 0), CUR("currentLiabilities", "Current Liabilities", 0), CUR("totalDebt", "Total Debt", 0),
        CUR("totalEquity", "Total Equity", 0), CUR("netIncome", "Net Income", 0), CUR("revenue", "Revenue", 0), CUR("totalAssets", "Total Assets", 0) ],
      compute(v) {
        const currentRatio = v.currentAssets/v.currentLiabilities;
        const debtToEquity = v.totalDebt/v.totalEquity;
        const roa = v.netIncome/v.totalAssets*100;
        const roe = v.netIncome/v.totalEquity*100;
        const netMargin = v.netIncome/v.revenue*100;
        return { primary: { label: "Current Ratio", value: fmt.num(currentRatio,2) },
          cells: [ { k: "Debt-to-Equity", v: fmt.num(debtToEquity,2) }, { k: "Return on Assets (ROA)", v: fmt.pct(roa) },
            { k: "Return on Equity (ROE)", v: fmt.pct(roe) }, { k: "Net Profit Margin", v: fmt.pct(netMargin) } ] };
      },
    },
  ],
};

/* ============ Category: Stock ============ */
const CAT_STOCK = {
  id: "stock", name: "Stock", icon: "📈",
  calcs: [
    {
      id: "stock_return", name: "Stock Return and Capital Gain Calculator", desc: "Calculate total return including capital gains and dividends.",
      fields: [ CUR("buyPrice", "Purchase Price per Share", 0), CUR("sellPrice", "Sale Price per Share", 0), NUM("shares", "Number of Shares", 0),
        CUR("dividends", "Total Dividends Received", 0), CUR("fees", "Total Fees/Commissions", 0), NUM("years", "Holding Period (Years)", 0) ],
      compute(v) {
        const costBasis = v.buyPrice*v.shares+v.fees;
        const proceeds = v.sellPrice*v.shares;
        const capitalGain = proceeds-costBasis;
        const totalReturn = capitalGain+v.dividends;
        const totalReturnPct = totalReturn/costBasis*100;
        const annualized = (Math.pow((proceeds+v.dividends)/costBasis, 1/v.years)-1)*100;
        return { primary: { label: "Total Return", value: fmt.cur(totalReturn) },
          cells: [ { k: "Total Return %", v: fmt.pct(totalReturnPct) }, { k: "Capital Gain", v: fmt.cur(capitalGain) },
            { k: "Annualized Return", v: fmt.pct(annualized) }, { k: "Cost Basis", v: fmt.cur(costBasis) } ] };
      },
    },
    {
      id: "stock_constant_growth", name: "Stock Constant Growth Calculator", desc: "Value a stock using the Gordon Growth (Dividend Discount) Model.",
      fields: [ CUR("d0", "Most Recent Annual Dividend (D0)", 0), PCT("growth", "Constant Growth Rate (g)", 0), PCT("requiredReturn", "Required Rate of Return (r)", 0) ],
      compute(v) {
        if (v.requiredReturn<=v.growth) return { error: "Required return must be greater than growth rate." };
        const d1 = v.d0*(1+v.growth/100);
        const value = d1/((v.requiredReturn-v.growth)/100);
        return { primary: { label: "Intrinsic Value per Share", value: fmt.cur(value) },
          cells: [ { k: "Next Year's Dividend (D1)", v: fmt.cur(d1) }, { k: "Growth Rate", v: fmt.pct(v.growth) }, { k: "Required Return", v: fmt.pct(v.requiredReturn) } ] };
      },
    },
    {
      id: "stock_nonconstant_growth", name: "Stock Non-constant Growth Calculator", desc: "Two-stage Dividend Discount Model for stocks with a high-growth phase.",
      fields: [ CUR("d0", "Current Dividend (D0)", 0), PCT("highGrowth", "High-Growth Rate", 0), NUM("highGrowthYears", "Years of High Growth", 0),
        PCT("stableGrowth", "Stable (Terminal) Growth Rate", 0), PCT("requiredReturn", "Required Rate of Return", 0) ],
      compute(v) {
        if (v.requiredReturn<=v.stableGrowth) return { error: "Required return must be greater than the stable growth rate." };
        const r = v.requiredReturn/100;
        let pvDividends = 0, dt = v.d0;
        for (let t=1;t<=v.highGrowthYears;t++) { dt = dt*(1+v.highGrowth/100); pvDividends += dt/Math.pow(1+r,t); }
        const dNext = dt*(1+v.stableGrowth/100);
        const terminalValue = dNext/(r-v.stableGrowth/100);
        const pvTerminal = terminalValue/Math.pow(1+r, v.highGrowthYears);
        const intrinsicValue = pvDividends+pvTerminal;
        return { primary: { label: "Intrinsic Value per Share", value: fmt.cur(intrinsicValue) },
          cells: [ { k: "PV of High-Growth Dividends", v: fmt.cur(pvDividends) }, { k: "PV of Terminal Value", v: fmt.cur(pvTerminal) }, { k: "Terminal Value", v: fmt.cur(terminalValue) } ] };
      },
    },
    {
      id: "capm", name: "CAPM Calculator", desc: "Calculate expected return using the Capital Asset Pricing Model.",
      fields: [ PCT("riskFree", "Risk-Free Rate", 0), NUM("beta", "Beta", 0), PCT("marketReturn", "Expected Market Return", 0) ],
      compute(v) {
        const expectedReturn = v.riskFree+v.beta*(v.marketReturn-v.riskFree);
        return { primary: { label: "Expected Return", value: fmt.pct(expectedReturn) },
          cells: [ { k: "Equity Risk Premium", v: fmt.pct(v.marketReturn-v.riskFree) }, { k: "Risk Premium × Beta", v: fmt.pct(v.beta*(v.marketReturn-v.riskFree)) } ] };
      },
    },
    {
      id: "expected_return", name: "Expected Return Calculator", desc: "Calculate weighted expected return and risk across three scenarios.",
      fields: [ PCT("p1", "Scenario 1 Probability", 0), PCT("r1", "Scenario 1 Return", 0), PCT("p2", "Scenario 2 Probability", 0), PCT("r2", "Scenario 2 Return", 0), PCT("p3", "Scenario 3 Probability", 0), PCT("r3", "Scenario 3 Return", 0) ],
      compute(v) {
        const probs=[v.p1,v.p2,v.p3], rets=[v.r1,v.r2,v.r3];
        const totalProb = probs.reduce((a,b)=>a+b,0);
        const expected = probs.reduce((a,p,i)=>a+(p/100)*rets[i],0);
        const variance = probs.reduce((a,p,i)=>a+(p/100)*Math.pow(rets[i]-expected,2),0);
        const stdDev = Math.sqrt(variance);
        return { primary: { label: "Expected Return", value: fmt.pct(expected) },
          cells: [ { k: "Standard Deviation (Risk)", v: fmt.pct(stdDev) }, { k: "Total Probability", v: fmt.pct(totalProb) } ],
          note: Math.abs(totalProb-100)>0.5? "Warning: probabilities should sum to 100%.":undefined };
      },
    },
    {
      id: "holding_period_return", name: "Holding Period Return Calculator", desc: "Calculate total return over a holding period including income.",
      fields: [ CUR("beginValue", "Beginning Value", 0), CUR("endValue", "Ending Value", 0), CUR("income", "Income Received (Dividends/Interest)", 0) ],
      compute(v) {
        const hpr = ((v.endValue-v.beginValue+v.income)/v.beginValue)*100;
        return { primary: { label: "Holding Period Return", value: fmt.pct(hpr) },
          cells: [ { k: "Capital Gain", v: fmt.cur(v.endValue-v.beginValue) }, { k: "Income", v: fmt.cur(v.income) }, { k: "Total Gain", v: fmt.cur(v.endValue-v.beginValue+v.income) } ] };
      },
    },
    {
      id: "wacc", name: "Weighted Average Cost of Capital Calculator", desc: "Calculate a company's blended cost of capital.",
      fields: [ CUR("equityValue", "Market Value of Equity", 0), CUR("debtValue", "Market Value of Debt", 0), PCT("costEquity", "Cost of Equity", 0), PCT("costDebt", "Cost of Debt", 0), PCT("taxRate", "Corporate Tax Rate", 0) ],
      compute(v) {
        const total = v.equityValue+v.debtValue;
        const weE = v.equityValue/total, weD = v.debtValue/total;
        const wacc = weE*v.costEquity + weD*v.costDebt*(1-v.taxRate/100);
        return { primary: { label: "WACC", value: fmt.pct(wacc) },
          cells: [ { k: "Equity Weight", v: fmt.pct(weE*100) }, { k: "Debt Weight", v: fmt.pct(weD*100) }, { k: "After-Tax Cost of Debt", v: fmt.pct(v.costDebt*(1-v.taxRate/100)) } ] };
      },
    },
    {
      id: "black_scholes", name: "Black-Scholes Option Calculator", desc: "Price European call and put options using the Black-Scholes model.",
      fields: [ CUR("spot", "Stock Price (S)", 0), CUR("strike", "Strike Price (K)", 0), NUM("time", "Time to Expiration (Years)", 0),
        PCT("riskFree", "Risk-Free Rate", 0), PCT("volatility", "Volatility (σ)", 0), SEL("type", "Option Type", "call", [["call","Call"],["put","Put"]]) ],
      compute(v) {
        const price = blackScholes(v.spot, v.strike, v.time, v.riskFree/100, v.volatility/100, v.type);
        const otherType = v.type==="call"?"put":"call";
        const otherPrice = blackScholes(v.spot, v.strike, v.time, v.riskFree/100, v.volatility/100, otherType);
        return { primary: { label: (v.type==="call"?"Call":"Put")+" Option Price", value: fmt.cur(price) },
          cells: [ { k: (otherType==="call"?"Call":"Put")+" Price (other side)", v: fmt.cur(otherPrice) }, { k: "Intrinsic Value", v: fmt.cur(v.type==="call"? Math.max(0,v.spot-v.strike):Math.max(0,v.strike-v.spot)) }, { k: "Time Value", v: fmt.cur(price-(v.type==="call"? Math.max(0,v.spot-v.strike):Math.max(0,v.strike-v.spot))) } ] };
      },
    },
    {
      id: "pivot_points", name: "Pivot Point Calculator", desc: "Calculate standard support and resistance pivot levels.",
      fields: [ CUR("high", "Previous High", 0), CUR("low", "Previous Low", 0), CUR("close", "Previous Close", 0) ],
      compute(v) {
        const p = (v.high+v.low+v.close)/3;
        const r1 = 2*p-v.low, s1 = 2*p-v.high;
        const r2 = p+(v.high-v.low), s2 = p-(v.high-v.low);
        const r3 = v.high+2*(p-v.low), s3 = v.low-2*(v.high-p);
        return { primary: { label: "Pivot Point (P)", value: fmt.cur(p) },
          cells: [ { k: "R1", v: fmt.cur(r1) }, { k: "S1", v: fmt.cur(s1) }, { k: "R2", v: fmt.cur(r2) }, { k: "S2", v: fmt.cur(s2) }, { k: "R3", v: fmt.cur(r3) }, { k: "S3", v: fmt.cur(s3) } ] };
      },
    },
    {
      id: "fibonacci", name: "Fibonacci Calculator", desc: "Calculate Fibonacci retracement and extension levels for a price swing.",
      fields: [ CUR("high", "Swing High", 0), CUR("low", "Swing Low", 0), SEL("trend", "Trend Direction", "up", [["up","Uptrend (retracement down)"],["down","Downtrend (retracement up)"]]) ],
      compute(v) {
        const range = v.high-v.low;
        const levels = [0,0.236,0.382,0.5,0.618,0.786,1];
        const cells = levels.map(l=>{
          const price = v.trend==="up"? v.high-range*l : v.low+range*l;
          return { k: (l*100).toFixed(1)+"%", v: fmt.cur(price) };
        });
        return { primary: { label: "61.8% Retracement", value: fmt.cur(v.trend==="up"? v.high-range*0.618 : v.low+range*0.618) }, cells };
      },
    },
    {
      id: "dividend_tax", name: "Dividend Tax Calculator", desc: "Estimate tax owed on qualified and ordinary dividends.",
      fields: [ CUR("qualified", "Qualified Dividends", 0), CUR("ordinary", "Ordinary (Non-Qualified) Dividends", 0), SEL("bracket", "Ordinary Income Tax Bracket", "24", [["10","10%"],["12","12%"],["22","22%"],["24","24%"],["32","32%"],["35","35%"],["37","37%"]]) ],
      compute(v) {
        const bracket = Number(v.bracket);
        // 0% for the 10/12% brackets, 20% only at the top: the 20% threshold
        // ($518,900 single in 2024) sits near the top of the 35% bracket, so
        // 15% is the accurate mapping for nearly all of it.
        const qualRate = bracket>=37? 20 : bracket>=22? 15 : 0;
        const qualTax = v.qualified*qualRate/100;
        const ordTax = v.ordinary*bracket/100;
        return { primary: { label: "Total Dividend Tax", value: fmt.cur(qualTax+ordTax) },
          cells: [ { k: "Qualified Div. Tax Rate", v: fmt.pct(qualRate) }, { k: "Tax on Qualified", v: fmt.cur(qualTax) }, { k: "Tax on Ordinary", v: fmt.cur(ordTax) } ] };
      },
    },
    {
      id: "commodities_futures", name: "Commodities and Futures Calculator", desc: "Calculate profit/loss on a futures contract position.",
      fields: [ CUR("entryPrice", "Entry Price", 0), CUR("exitPrice", "Exit Price", 0), NUM("contracts", "Number of Contracts", 0),
        CUR("tickValue", "Value per Full Point", 0), SEL("position", "Position", "long", [["long","Long"],["short","Short"]]) ],
      compute(v) {
        const priceDiff = v.position==="long"? v.exitPrice-v.entryPrice : v.entryPrice-v.exitPrice;
        const pl = priceDiff*v.tickValue*v.contracts;
        return { primary: { label: "Profit / Loss", value: fmt.cur(pl) },
          cells: [ { k: "Price Movement", v: fmt.cur(priceDiff) }, { k: "Per Contract P/L", v: fmt.cur(priceDiff*v.tickValue) } ] };
      },
    },
  ],
};

/* ============ Registry ============ */
const CATEGORIES = [CAT_INVEST, CAT_LOAN, CAT_RETIRE, CAT_STOCK, CAT_CREDIT, CAT_AUTO, CAT_MISC];
const CALC_INDEX = {};
CATEGORIES.forEach(cat => cat.calcs.forEach(c => { CALC_INDEX[c.id] = { ...c, catId: cat.id, catName: cat.name, catIcon: cat.icon }; }));


export { CATEGORIES, CALC_INDEX, fmt, FX, FX_AS_OF, CPI, CPI_LATEST_YEAR };
