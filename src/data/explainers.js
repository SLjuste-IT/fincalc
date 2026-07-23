// ============================================================================
// Hand-written "The formula" + "Key terms" + "FAQ" depth for calculators that do
// not (yet) have a full guide in src/data/guides.js. This is the reviewed-in-
// batches half of the content plan: src/lib/explain.js already gives EVERY
// calculator a "How to use" (from its real fields) and a "Worked example" (from
// the engine's real numbers); the entries here layer accurate, topic-specific
// formula/terms/FAQ prose on top for the batch reviewed so far.
//
// SAME DISCIPLINE AS THE GUIDES: financial calculators are YMYL. Each formula
// below is written to match the calculator's own compute() in
// src/lib/calculators.js (verified by reading the engine), not a generic template.
// Every entry is a genuinely different topic — no page is a spun copy of another,
// which is what keeps this on the right side of scaled-content-abuse. Expand it in
// reviewed batches; a calculator with no entry simply renders How-to-use + Worked
// example until its depth is written.
//
// FORMAT (all optional except at least one section):
//   method: { lead, expression, where: [[sym, meaning], …], note }
//   terms:  [[term, definition], …]
//   faqs:   [[question, answer], …]
// Strings may carry inline <a>/<strong>/<em>; the content is authored here, not
// user input, so explain.js injects it as-is. `expression` is plain text (it is
// escaped and rendered in a <pre>), and may use \n for multi-line formulas.
// ============================================================================

// Bumped when this copy is reviewed for accuracy — the E-E-A-T "who checked, when".
export const EXPLAINERS_REVIEWED = "23 July 2026";

export const EXPLAINERS = {
  /* ------------------------------------------------ Finance & Investment */
  savings_goal: {
    method: {
      lead: "The calculator grows your current savings forward, then solves for the level monthly deposit that covers whatever gap remains — a sinking-fund payment:",
      expression: "PMT = (Goal − Current·(1 + r)ⁿ) · r ÷ ((1 + r)ⁿ − 1)",
      where: [
        ["Goal", "the target amount you want to reach"],
        ["Current", "what you have saved today"],
        ["r", "monthly return = annual return ÷ 12"],
        ["n", "number of months = years × 12"],
      ],
      note: "If your current savings already grow past the goal on their own, the required contribution is zero — the calculator floors it there rather than showing a negative deposit.",
    },
    terms: [
      ["Future value", "What a sum today grows to at a given return over time."],
      ["Sinking-fund payment", "The regular deposit needed to accumulate a set amount by a set date."],
      ["Expected return", "The average annual growth you assume — an estimate, not a guarantee."],
    ],
    faqs: [
      ["What return should I assume?", "Use a rate that matches how the money is invested: near-zero for a savings account, higher (and less certain) for a diversified stock portfolio. A lower assumption is the safer plan — try it to stress-test the goal."],
      ["What if I can't afford the required amount?", "Push the target date out, lower the goal, or raise the assumed return (which usually means taking more risk). Small increases to the monthly deposit compound surprisingly fast over long horizons — see the <a href=\"/calc/compound\">compound interest calculator</a>."],
      ["Does it account for taxes or inflation?", "No — it works in today's dollars and ignores tax on gains. If the goal is far off, set the goal higher to preserve purchasing power, or check the <a href=\"/calc/inflation\">inflation calculator</a>."],
    ],
  },

  cd: {
    method: {
      lead: "A CD pays compound interest at a fixed rate for a fixed term. The maturity value is the standard compound-interest formula:",
      expression: "Maturity = Deposit · (1 + r/n)^(n · t)",
      where: [
        ["r", "the nominal annual interest rate"],
        ["n", "compounding periods per year (daily = 365, monthly = 12)"],
        ["t", "the term in years (months ÷ 12)"],
      ],
      note: "APY restates all of this as a single effective annual rate, so two CDs with different compounding can be compared on one number. See the <a href=\"/calc/effective_rate\">effective rate calculator</a>.",
    },
    terms: [
      ["APY", "Annual percentage yield — the effective yearly return once compounding is counted."],
      ["Term", "How long your money is locked in, from a few months to several years."],
      ["Compounding", "How often earned interest is added back to the balance to itself earn interest."],
      ["Early-withdrawal penalty", "Interest forfeited if you cash out a CD before it matures."],
    ],
    faqs: [
      ["What's the difference between the rate and the APY?", "The rate is the headline nominal figure; the APY folds in compounding, so it's slightly higher and is the number to compare across banks."],
      ["Is CD interest taxed?", "Yes — CD interest is taxable in the year it's credited, even if the CD hasn't matured, and is reported on a 1099-INT."],
      ["What happens if I withdraw early?", "Most CDs charge an early-withdrawal penalty of several months' interest, which this calculator does not deduct. Check the specific CD's terms."],
    ],
  },

  mutual_fund_fee: {
    method: {
      lead: "The calculator grows your investment twice — once at the gross return, once at the return after the expense ratio is subtracted — and reports the gap:",
      expression: "Fee cost = P·(1 + g)^y − P·(1 + (g − e))^y",
      where: [
        ["P", "the amount invested"],
        ["g", "the gross annual return before fees"],
        ["e", "the expense ratio (annual fee as a % of assets)"],
        ["y", "years invested"],
      ],
      note: "The fee is charged on your whole balance every year, so its drag compounds: a seemingly small percentage can cost a large share of the final balance over decades.",
    },
    terms: [
      ["Expense ratio", "A fund's annual operating cost, charged as a percentage of the money you have invested."],
      ["Net return", "Your return after the expense ratio is deducted from the gross return."],
      ["Compounding drag", "The way an annual fee reduces not just this year's balance but all future growth on it."],
    ],
    faqs: [
      ["Is a 1% fee really that much?", "Over a long horizon, yes. Because it compounds, a 1% expense ratio can consume a fifth or more of your final balance versus an otherwise identical fee-free fund."],
      ["What's a reasonable expense ratio?", "Broad index funds commonly charge under 0.10%; actively managed funds often charge 0.5–1%+. Lower fees are one of the few reliably controllable factors in investing."],
      ["Does this include sales loads or trading costs?", "No — it models only the expense ratio. Front/back-end loads and trading commissions are extra, so treat the result as a floor on total costs."],
    ],
  },

  rule72: {
    method: {
      lead: "The Rule of 72 is a mental-math shortcut for compound growth: divide 72 by the annual percentage rate to approximate the years needed to double.",
      expression: "Years to double ≈ 72 ÷ rate(%)",
      where: [["rate", "the annual growth (or interest) rate, in percent"]],
      note: "The exact answer is ln(2) ÷ ln(1 + r); 72 is chosen because it divides cleanly by many rates and tracks the exact figure closely for everyday rates (roughly 5–12%). The companion Rule of 114 triples a sum and 144 quadruples it.",
    },
    terms: [
      ["Doubling time", "How long it takes a sum to grow to twice its size at a steady rate."],
      ["Compound growth", "Growth that itself earns growth, producing an exponential (not straight-line) curve."],
      ["Rule of 114 / 144", "The same shortcut for tripling (114) and quadrupling (144)."],
    ],
    faqs: [
      ["Why 72 and not 70 or 71?", "70 is actually more accurate for continuous compounding, but 72 has more whole-number divisors (2, 3, 4, 6, 8, 9, 12…), which makes the mental arithmetic easier."],
      ["How accurate is it?", "Very close in the everyday 6–10% range. It drifts at very high or very low rates, where the exact doubling-time figure (also shown) is worth using."],
      ["Does it work for inflation or debt?", "Yes — the same math tells you how fast inflation halves your purchasing power, or how fast a debt balance doubles at a given interest rate."],
    ],
  },

  /* ------------------------------------------------------ Loan & Mortgage */
  loan_refi: {
    method: {
      lead: "The calculator amortizes your balance twice — at the old rate/term and the new one — and divides the upfront closing costs by the monthly saving to find the breakeven point:",
      expression: "Breakeven months = Closing costs ÷ (Old payment − New payment)",
      where: [
        ["Old / New payment", "each from the standard amortization formula M = P·r(1+r)ⁿ ÷ ((1+r)ⁿ − 1)"],
        ["Closing costs", "the fees to refinance (origination, appraisal, title…)"],
      ],
      note: "A lower monthly payment isn't automatically a saving: resetting the clock to a fresh 30-year term can raise <em>lifetime</em> interest even as the payment falls. Compare the lifetime-interest figure, not just the monthly one.",
    },
    terms: [
      ["Breakeven point", "How many months of savings it takes to recoup the closing costs."],
      ["Closing costs", "The upfront fees charged to complete a refinance."],
      ["Amortization", "Repaying a loan in level installments split between interest and principal."],
      ["Lifetime interest", "Total interest paid over the whole loan — the true cost to compare."],
    ],
    faqs: [
      ["When is refinancing worth it?", "Generally when you'll keep the loan well past the breakeven point and the lifetime interest actually falls. A move or another refinance before breakeven means the closing costs weren't recovered."],
      ["Does a lower payment always save money?", "No. Extending the term lowers the payment but can increase total interest. Watch the \"lifetime interest saved\" figure — if it's negative, the lower payment is costing you overall."],
      ["What counts as closing costs?", "Origination or application fees, appraisal, title insurance and recording fees. Rolling them into the loan avoids upfront cash but adds to the balance you pay interest on."],
    ],
  },

  biweekly: {
    method: {
      lead: "Instead of 12 monthly payments, you pay half the monthly amount every two weeks. Because a year has 26 fortnights, that's 26 half-payments:",
      expression: "26 × (Monthly payment ÷ 2) = 13 monthly payments per year",
      where: [
        ["Monthly payment", "the normal fully-amortizing payment for the loan"],
        ["26", "bi-weekly periods in a year (52 weeks ÷ 2)"],
      ],
      note: "Twenty-six half-payments equal thirteen monthly payments — one extra month's worth each year, and every extra dollar lands straight on principal, so the balance (and the interest charged on it) falls faster.",
    },
    terms: [
      ["Bi-weekly", "Every two weeks — 26 times a year, not twice a month (which would be 24)."],
      ["Principal", "The remaining loan balance that interest is charged on."],
      ["Amortization", "The schedule by which a loan is paid down to zero."],
    ],
    faqs: [
      ["Why does bi-weekly save so much?", "The extra 13th payment each year goes entirely to principal, shrinking the balance early — and on a long mortgage, early principal reductions save the most interest."],
      ["Is it the same as just paying extra?", "Effectively yes. Paying one extra monthly payment a year (split across 12 months, or as one lump) achieves nearly the same result. Bi-weekly just automates it."],
      ["Does my lender allow it?", "Many do, but some charge a fee to set up bi-weekly drafting, and a few apply the extra only at month-end. Confirm extra amounts are applied to principal immediately."],
    ],
  },

  /* ---------------------------------------------------------- Credit Card */
  cc_minimum: {
    method: {
      lead: "There's no single formula — the calculator simulates the balance month by month, because the minimum payment shrinks as the balance does:",
      expression: "Each month:\n  interest = Balance · (APR ÷ 12)\n  payment = max(Balance · min%, floor)\n  Balance = Balance − (payment − interest)",
      where: [
        ["APR", "the card's annual percentage rate"],
        ["min%", "the minimum payment as a percentage of the balance"],
        ["floor", "the smallest dollar minimum the issuer will accept"],
      ],
      note: "Because the minimum is a percentage of a falling balance, each payment gets smaller and a shrinking share goes to principal — which is why minimum-only payoff stretches on for years or decades.",
    },
    terms: [
      ["Minimum payment", "The least the issuer will accept — deliberately low, so most of it is interest."],
      ["APR", "Annual percentage rate; divided by 12 it gives the monthly rate charged."],
      ["Revolving balance", "The amount carried month to month, on which interest keeps compounding."],
    ],
    faqs: [
      ["Why do minimum payments take so long?", "Early on, most of each minimum covers interest, so the balance barely moves — and as it does fall, the minimum falls with it, dragging out the tail for years."],
      ["How much extra should I pay?", "Any fixed amount above the minimum helps enormously, because the extra goes straight to principal. Even a small fixed monthly payment beats a shrinking percentage. See the <a href=\"/calc/cc_payoff\">payoff calculator</a>."],
      ["Can the minimum fail to cover the interest?", "On very high APRs with a low percentage minimum, early payments can barely exceed the interest, so the balance falls at a crawl. Paying more than the minimum is the only fix."],
    ],
  },

  /* -------------------------------------------------------------- Retirement */
  ira: {
    method: {
      lead: "Both accounts grow the same contribution at the same return; the difference is purely <em>when</em> tax is paid. The calculator grows each and taxes it in the right place:",
      expression: "Traditional = C · F · (1 − t_ret)\nRoth        = C · (1 − t_now) · F\nF = ((1 + r)ⁿ − 1) ÷ r",
      where: [
        ["C", "annual contribution"],
        ["F", "growth factor for a stream of yearly contributions"],
        ["r, n", "annual return, and years until withdrawal"],
        ["t_now / t_ret", "your tax rate now vs. in retirement"],
      ],
      note: "With the same contribution and return, the algebra collapses to one thing: the account taxed at the lower rate wins. Traditional bets your rate is lower in retirement; Roth bets it's lower now.",
    },
    terms: [
      ["Traditional IRA", "Contributions may be pre-tax (deductible now); withdrawals are taxed in retirement."],
      ["Roth IRA", "Contributions are after-tax now; qualified withdrawals are entirely tax-free."],
      ["Marginal tax rate", "The rate on your next dollar of income — what actually applies to a contribution or withdrawal."],
      ["Tax-deferred", "Growth that isn't taxed until money is withdrawn (Traditional) — or never, for qualified Roth withdrawals."],
    ],
    faqs: [
      ["Which is better, Traditional or Roth?", "Whichever taxes you at the lower rate. Expect a lower rate in retirement → Traditional; expect a higher rate later (or want tax-free flexibility) → Roth."],
      ["What if my tax rate is the same now and later?", "The after-tax result is identical — that's the mathematical symmetry of the two accounts. Tie-breakers are then things like Roth having no required distributions."],
      ["Are there income or contribution limits?", "Yes. The IRS caps annual IRA contributions and phases out Roth eligibility (and Traditional deductibility) at higher incomes. Check the current year's limits."],
    ],
  },

  rmd: {
    method: {
      lead: "A required minimum distribution divides your prior year-end balance by a life-expectancy factor from an IRS table:",
      expression: "RMD = Balance (Dec 31 prior year) ÷ Life-expectancy divisor",
      where: [
        ["Balance", "the account value on December 31 of the previous year"],
        ["Divisor", "the factor for your age from the IRS Uniform Lifetime Table"],
      ],
      note: "The divisor shrinks as you age, so the required percentage rises over time. This uses the Uniform Lifetime Table; a different table applies if your sole beneficiary is a spouse more than 10 years younger.",
    },
    terms: [
      ["RMD", "Required minimum distribution — the amount the IRS makes you withdraw each year from certain retirement accounts."],
      ["Uniform Lifetime Table", "The IRS table of life-expectancy divisors used for most account holders."],
      ["SECURE 2.0", "The 2022 law that raised the RMD starting age to 73 (effective 2023)."],
    ],
    faqs: [
      ["When do RMDs start?", "Under current law (SECURE 2.0) they begin at age 73. Your first RMD can be delayed to April 1 of the following year, but then you take two that year."],
      ["Which accounts require RMDs?", "Traditional IRAs and most employer plans (401(k), 403(b)). Roth IRAs have no RMDs for the original owner, and Roth 401(k)s no longer require them either under recent rules."],
      ["What if I don't take it?", "The shortfall is penalized — 25% under SECURE 2.0, reduced to 10% if corrected promptly. Take at least the RMD each year to avoid it."],
    ],
  },

  /* ----------------------------------------------------------- Miscellaneous */
  inflation: {
    method: {
      lead: "The calculator scales an amount by the ratio of the Consumer Price Index between the two years:",
      expression: "Adjusted value = Amount × (CPI_end ÷ CPI_start)",
      where: [
        ["Amount", "the sum in the start year's dollars"],
        ["CPI", "the Consumer Price Index (CPI-U annual average) for each year"],
      ],
      note: "CPI measures the average price of a broad basket of consumer goods and services. Your personal inflation can differ if your spending skews toward faster-rising categories like housing, healthcare or tuition.",
    },
    terms: [
      ["CPI", "Consumer Price Index — the standard gauge of average consumer price changes over time."],
      ["Purchasing power", "How much a fixed amount of money can actually buy."],
      ["Real vs. nominal", "Nominal is the face amount; real is adjusted for inflation into constant purchasing power."],
    ],
    faqs: [
      ["What is CPI?", "A government index tracking the average price of a fixed basket of goods and services. The change in CPI between two years is the headline inflation rate over that span."],
      ["Why doesn't it match my experience?", "CPI is an average across the whole economy. If you spend more than average on categories rising faster than the index (rent, medical care), your felt inflation will be higher."],
      ["Is a raise that matches inflation really a raise?", "Only in nominal terms — it holds your purchasing power flat. A raise below inflation is a real-terms pay cut; compare with the <a href=\"/calc/salary_increase\">salary increase calculator</a>."],
    ],
  },

  effective_rate: {
    method: {
      lead: "Compounding makes a stated (nominal) rate worth more than its face value. The effective annual rate captures the true yearly return:",
      expression: "EAR = (1 + i/n)ⁿ − 1",
      where: [
        ["i", "the nominal annual rate"],
        ["n", "the number of compounding periods per year"],
      ],
      note: "The more often interest compounds, the higher the effective rate for the same nominal figure. On deposits this same number is called APY.",
    },
    terms: [
      ["Nominal rate", "The stated annual rate, before compounding is taken into account."],
      ["Effective annual rate (EAR)", "The true annual return once intra-year compounding is included."],
      ["APY", "Annual percentage yield — the deposit-world name for the effective annual rate."],
      ["Compounding", "Adding earned interest back to the balance so it, too, earns interest."],
    ],
    faqs: [
      ["What's the difference between nominal and effective?", "Nominal ignores compounding; effective includes it. 12% compounded monthly is an effective 12.68% — the extra comes from interest earning interest during the year."],
      ["Is APY the same as APR?", "Not quite. APY (like EAR) includes compounding and describes what you earn on savings. APR describes borrowing cost and, by convention, usually excludes intra-year compounding — see the <a href=\"/calc/apr\">APR calculator</a>."],
      ["Why does compounding frequency matter?", "Each compounding adds interest sooner, which then earns its own interest. Daily beats monthly beats annual — though the gap narrows as frequency rises."],
    ],
  },

  tip: {
    method: {
      lead: "Straightforward arithmetic: apply the tip percentage to the bill, then split the total across the party:",
      expression: "Tip = Bill × (Tip% ÷ 100)\nPer person = (Bill + Tip) ÷ People",
      where: [
        ["Bill", "the amount before the tip"],
        ["Tip%", "the gratuity percentage"],
        ["People", "how many ways to split the total"],
      ],
      note: "US convention is to tip on the pre-tax subtotal, though many people tip on the full total for simplicity — on a normal bill the difference is small.",
    },
    terms: [
      ["Gratuity", "A tip — a voluntary payment for service, on top of the bill."],
      ["Pre-tax bill", "The subtotal before sales tax, the customary base for calculating a tip."],
    ],
    faqs: [
      ["What's a standard tip?", "In US restaurants, 15–20% for sit-down service is typical, with 20%+ for excellent service. Norms vary widely by country — many include service in the price."],
      ["Do I tip on tax?", "Customarily you tip on the pre-tax amount, but tipping on the total is common and only slightly more. Either is fine."],
      ["How do I split unevenly?", "This tool splits evenly. For uneven shares, apply the tip percentage to each person's own portion of the bill instead."],
    ],
  },

  percentage: {
    method: {
      lead: "Three everyday percentage problems, each a one-line calculation:",
      expression: "X% of Y      = (X ÷ 100) × Y\nX is what % of Y = (X ÷ Y) × 100\n% change     = ((Y − X) ÷ X) × 100",
      where: [
        ["X, Y", "the two numbers you enter"],
        ["% change", "measured relative to the starting value X"],
      ],
      note: "Percentage change always uses the starting value as its base, which is why a rise then an equal-percent fall doesn't return to the original number.",
    },
    terms: [
      ["Percent", "A fraction out of 100 — 25% means 25 per hundred, or 0.25."],
      ["Base value", "The number a percentage is taken of (the \"Y\" in \"X% of Y\")."],
      ["Percentage points", "The plain difference between two percentages — distinct from percent change."],
    ],
    faqs: [
      ["What's the difference between percent and percentage points?", "Going from 10% to 12% is a rise of 2 percentage points, but a 20% increase. Points are the absolute gap; percent change is relative to the start."],
      ["How is percent change calculated?", "Subtract the old value from the new, divide by the old value, and multiply by 100. A negative result is a decrease."],
      ["Why isn't a 50% drop undone by a 50% rise?", "Because the base changes. 100 down 50% is 50; 50 up 50% is only 75 — the rise is taken on the smaller number."],
    ],
  },

  hourly_salary: {
    method: {
      lead: "An annual salary is just an hourly wage multiplied out over a working year (and the reverse divides it back down):",
      expression: "Annual salary = Hourly × Hours per week × Weeks per year",
      where: [
        ["Hourly", "your hourly wage"],
        ["Hours per week", "typically 40 for full-time"],
        ["Weeks per year", "52 if paid time off is included; fewer to model unpaid weeks"],
      ],
      note: "This is gross pay, before taxes and deductions. To estimate take-home from a salary, see the <a href=\"/calc/paycheck_tax\">paycheck tax calculator</a>.",
    },
    terms: [
      ["Gross pay", "Earnings before any taxes or deductions."],
      ["Hourly rate", "Pay per hour worked."],
      ["Annualization", "Scaling a shorter-period figure up to a full-year equivalent."],
    ],
    faqs: [
      ["How many weeks should I use?", "Use 52 to assume paid vacation (salary keeps coming while you're off). Use ~50 if you take two unpaid weeks, or fewer for seasonal work."],
      ["Is this before or after tax?", "Before. It converts gross figures; your actual take-home is lower after income tax, FICA and any benefit deductions."],
      ["How do I convert a salary back to hourly?", "Switch the mode to \"Annual Salary → Hourly\": the calculator divides the salary by your yearly hours (hours per week × weeks per year)."],
    ],
  },

  salary_increase: {
    method: {
      lead: "A raise scales your current salary up by the raise percentage:",
      expression: "New salary = Current × (1 + Raise% ÷ 100)",
      where: [
        ["Current", "your salary before the raise"],
        ["Raise%", "the percentage increase"],
      ],
      note: "Compare the raise against inflation: a raise below the inflation rate is a cut in real (purchasing-power) terms even though the number went up.",
    },
    terms: [
      ["Gross salary", "Annual pay before taxes and deductions."],
      ["Cost-of-living adjustment", "A raise intended purely to keep pace with inflation."],
      ["Real vs. nominal", "Nominal is the headline number; real subtracts inflation to show true buying power."],
    ],
    faqs: [
      ["What's a typical annual raise?", "Merit raises often land in the low single digits; larger jumps usually come with promotions or job changes. It varies widely by industry and year."],
      ["Does a raise keep up with inflation?", "Only if it meets or beats the inflation rate. Check the gap with the <a href=\"/calc/inflation\">inflation calculator</a> — below-inflation raises quietly erode purchasing power."],
      ["How is a raise taxed?", "Only the additional income is taxed, at your marginal rate — a raise never lowers your overall take-home. Withholding on bonuses can look higher, but it evens out at filing."],
    ],
  },

  /* -------------------------------------------------------------------- Stock */
  capm: {
    method: {
      lead: "The Capital Asset Pricing Model estimates the return investors should demand for an asset's market risk:",
      expression: "E(R) = R_f + β · (R_m − R_f)",
      where: [
        ["R_f", "the risk-free rate (e.g. a Treasury yield)"],
        ["β", "beta — the asset's sensitivity to market moves"],
        ["R_m", "the expected return of the overall market"],
        ["R_m − R_f", "the equity risk premium"],
      ],
      note: "Beta is the engine: β = 1 moves with the market, β > 1 amplifies its swings (more risk, higher demanded return), and β < 1 dampens them.",
    },
    terms: [
      ["Beta", "How much an asset's return moves relative to the market as a whole."],
      ["Risk-free rate", "The return on a theoretically risk-free asset, usually a government bond yield."],
      ["Equity risk premium", "The extra return investors demand for holding stocks over the risk-free rate."],
      ["Expected return", "The return the model says compensates fairly for the asset's market risk."],
    ],
    faqs: [
      ["What is beta?", "A measure of systematic risk. A stock with β = 1.2 has tended to move 1.2% for each 1% market move — so CAPM demands a higher return for it."],
      ["Where do I get the risk-free rate?", "Practitioners commonly use a current Treasury yield — a 3-month T-bill for short horizons, or the 10-year note for long-term valuation."],
      ["What are CAPM's limitations?", "It assumes a single risk factor and relies on estimates (beta, the market premium) that shift over time. It's a widely used baseline, not a precise prediction."],
    ],
  },

  wacc: {
    method: {
      lead: "WACC blends the cost of a company's equity and debt, weighted by how much of each it uses, with debt adjusted for its tax deductibility:",
      expression: "WACC = (E/V)·R_e + (D/V)·R_d·(1 − T_c)",
      where: [
        ["E, D", "market value of equity and of debt"],
        ["V", "total capital, E + D"],
        ["R_e, R_d", "the cost of equity and the cost of debt"],
        ["T_c", "the corporate tax rate"],
      ],
      note: "Interest on debt is tax-deductible, so its effective cost is R_d·(1 − T_c) — the \"tax shield\" that makes debt cheaper than its headline rate.",
    },
    terms: [
      ["Cost of equity", "The return shareholders require — often estimated with CAPM."],
      ["Cost of debt", "The effective interest rate a company pays on its borrowing."],
      ["Tax shield", "The reduction in cost from interest being tax-deductible."],
      ["Capital structure", "The mix of debt and equity a company uses to finance itself."],
    ],
    faqs: [
      ["What is WACC used for?", "It's the standard discount rate for valuing a company or project — the blended return all its investors require, and the hurdle a new investment must clear."],
      ["Why is the cost of debt multiplied by (1 − tax)?", "Because interest is tax-deductible: every dollar of interest lowers taxable income, so the government effectively subsidizes part of the borrowing cost."],
      ["Should I use book or market values?", "Market values of equity and debt, in principle — they reflect what capital is worth today. Book values are a rough substitute when market figures aren't available."],
    ],
  },

  holding_period_return: {
    method: {
      lead: "Holding period return is the total gain over the time you held an investment, counting both price change and any income:",
      expression: "HPR = (End value − Begin value + Income) ÷ Begin value",
      where: [
        ["Begin / End value", "the investment's worth at the start and the end"],
        ["Income", "dividends or interest received while holding"],
      ],
      note: "HPR is the return for the <em>whole</em> period, not per year. To compare holdings of different lengths, annualize it or use the <a href=\"/calc/roi\">ROI calculator</a>'s CAGR.",
    },
    terms: [
      ["Holding period return", "Total return over the full time an asset was held, price plus income."],
      ["Capital gain", "The change in an asset's price, excluding income."],
      ["Income yield", "The dividends or interest component of the return."],
    ],
    faqs: [
      ["Does HPR include dividends?", "Yes — that's the point. Including income (dividends or interest) makes it a total-return figure, not just price appreciation."],
      ["How do I annualize it?", "Convert to a compound annual rate: (1 + HPR)^(1 ÷ years) − 1. A 21% return over three years is about 6.6% a year, not 7%."],
      ["Can it be negative?", "Yes — if the ending value plus income is less than what you started with, the holding period return is negative."],
    ],
  },
};
