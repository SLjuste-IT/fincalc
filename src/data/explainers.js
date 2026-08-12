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
export const EXPLAINERS_REVIEWED = "8 August 2026";

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
      ["What if I can't afford the required amount?", "Push the target date out, lower the goal, or raise the assumed return (which usually means taking more risk). Small increases to the monthly deposit compound surprisingly fast over long horizons — see the <a href=\"/calc/compound/\">compound interest calculator</a>."],
      ["Does it account for taxes or inflation?", "No — it works in today's dollars and ignores tax on gains. If the goal is far off, set the goal higher to preserve purchasing power, or check the <a href=\"/calc/inflation/\">inflation calculator</a>."],
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
      note: "APY restates all of this as a single effective annual rate, so two CDs with different compounding can be compared on one number. See the <a href=\"/calc/effective_rate/\">effective rate calculator</a>.",
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

  tvm: {
    method: {
      lead: "The calculator holds four of the five time-value-of-money variables fixed and solves for the fifth, using the single equation that ties a present sum, a stream of level payments and a future sum together at one rate:",
      expression: "PV·(1 + r)ⁿ + PMT·((1 + r)ⁿ − 1)/r·(1 + r·type) + FV = 0",
      where: [
        ["N", "the number of periods"],
        ["r", "the interest rate per period"],
        ["PV / FV", "the present value (today) and future value (at the end)"],
        ["PMT", "the level payment made each period"],
        ["type", "0 if payments fall at period-end, 1 if at the start"],
      ],
      note: "There is no closed form for the rate, so it is found numerically (bisection between −99% and 500%). The sign convention matters: money you pay out is negative, money you receive is positive — mixing the signs is the usual reason \"solve for rate\" returns no answer.",
    },
    terms: [
      ["Present value", "What a future amount is worth today, discounted at a given rate."],
      ["Future value", "What a present amount, plus any payments, grows to by the end."],
      ["Period", "The unit the rate and the count share — the rate must match the periods (a 6% annual rate is 0.5% a month)."],
      ["Annuity due", "Payments made at the start of each period rather than the end."],
    ],
    faqs: [
      ["What's the sign convention?", "Outflows are negative, inflows positive — e.g. deposit PV as −1,000 and expect FV 2,000. Getting the signs wrong is what makes a \"solve for rate\" fail with no answer."],
      ["Do the rate and N have to use the same units?", "Yes. If N is in months, the rate must be the monthly rate (annual ÷ 12). Pairing 6% with 360 months treats 6% as a <em>monthly</em> rate."],
      ["What does payment timing change?", "Beginning-of-period (annuity due) payments each earn one extra period of interest, so they produce a higher future value and require a smaller payment than end-of-period."],
    ],
  },

  bond: {
    method: {
      lead: "A bond's price is the present value of everything it pays: each coupon, plus the face value returned at maturity, all discounted at the market's required yield.",
      expression: "Price = C·(1 − (1 + r)⁻ⁿ)/r + Face·(1 + r)⁻ⁿ",
      where: [
        ["C", "the coupon paid each period = coupon rate × face ÷ payments per year"],
        ["r", "the market yield per period = required annual yield ÷ payments per year"],
        ["n", "the number of coupon periods = years × payments per year"],
        ["Face", "the amount repaid at maturity"],
      ],
      note: "When the market yield equals the coupon rate the price equals face (par). A higher required yield discounts the fixed coupons harder, so the price drops below face (a discount); a lower yield pushes it above (a premium).",
    },
    terms: [
      ["Coupon rate", "The fixed annual interest a bond pays, as a percentage of face value."],
      ["Required yield / YTM", "The market return used to discount the bond's cash flows."],
      ["Current yield", "Annual coupon ÷ current price — the income return, ignoring any gain or loss to maturity."],
      ["Par / premium / discount", "Priced at, above, or below face value."],
    ],
    faqs: [
      ["Why does the price fall when yields rise?", "A bond's coupons are fixed. If newly issued bonds pay more, buyers will only take the old one at a lower price — so its yield rises to match the market. Prices and yields always move in opposite directions."],
      ["Current yield vs yield to maturity?", "Current yield counts only the coupon against today's price. Yield to maturity also counts the pull toward par at maturity, so for a discount bond it is higher, and for a premium bond lower."],
      ["Does this include accrued interest or tax?", "No — it is a clean price and ignores tax. Treat it as the theoretical value, not a live dealer quote."],
    ],
  },

  tax_equiv_yield: {
    method: {
      lead: "A tax-free municipal bond and a taxable bond are only comparable after tax. This grosses the tax-free yield up to the taxable yield that would leave you the same amount once your marginal rate is taken out:",
      expression: "Taxable-equivalent yield = Tax-free yield ÷ (1 − tax rate)",
      where: [
        ["Tax-free yield", "the muni's yield, which you keep in full"],
        ["tax rate", "your marginal (top-bracket) rate, as a decimal"],
      ],
      note: "The higher your bracket, the more a tax-free yield is worth — which is why munis favour higher earners. Use your marginal rate (the rate on your next dollar), not your average rate.",
    },
    terms: [
      ["Municipal bond", "Debt issued by a state or local government, often exempt from federal tax."],
      ["Marginal tax rate", "The rate applied to your last dollar of income."],
      ["Taxable-equivalent yield", "The pre-tax yield a taxable bond needs to match a tax-free one after tax."],
    ],
    faqs: [
      ["Which tax rate do I use?", "Your marginal rate — the bracket your next dollar of interest would fall in — not your effective or average rate. Add state tax too if the muni is also state-exempt for you."],
      ["So a 4% muni beats a 5% corporate?", "In a 24% bracket, 4% tax-free equals about 5.3% taxable, so yes — it would beat a 5% taxable bond after tax. Enter your own bracket to check."],
      ["Are munis ever taxable?", "Some are (for example subject to AMT, or bought out of state), and a capital gain on any bond is taxable. This compares coupon yield only."],
    ],
  },

  college_savings: {
    method: {
      lead: "It inflates today's annual cost forward to enrolment, multiplies by the years in school for the total bill, then grows your savings — current balance plus monthly deposits — to the same date and reports the gap:",
      expression: "Future cost = Cost·(1 + i)^Y\nSavings  = Balance·(1 + r)ⁿ + PMT·((1 + r)ⁿ − 1)/r",
      where: [
        ["Cost, i, Y", "today's annual cost, annual college-cost inflation, years until enrolment"],
        ["Balance, PMT", "current savings and the monthly deposit"],
        ["r, n", "the monthly return and the number of months until enrolment"],
      ],
      note: "It compounds savings monthly up to enrolment but treats the whole bill as due then — it doesn't model the balance continuing to earn (or costs continuing to inflate) during the years in school, so read it as a planning estimate, not a drawdown schedule.",
    },
    terms: [
      ["529 plan", "A tax-advantaged US education account; earnings grow tax-free when used for qualified expenses."],
      ["College-cost inflation", "Tuition has historically risen faster than general inflation."],
      ["Shortfall / surplus", "The gap between the projected bill and projected savings."],
    ],
    faqs: [
      ["What inflation rate should I use?", "College costs have often risen a few points faster than general CPI. A higher assumption is the conservative choice — try a range."],
      ["Does it assume savings keep growing during school?", "No — it compares the total cost at enrolment against savings at enrolment. In reality the unspent balance keeps earning, so a small projected shortfall may be manageable."],
      ["Should I count financial aid or scholarships?", "It models the sticker cost. Aid, scholarships and tax credits reduce what you actually pay, so treat the result as a worst case."],
    ],
  },

  investment_income: {
    method: {
      lead: "Straightforward yield arithmetic: it applies the annual yield to your principal for the yearly income, then splits that evenly across the payout periods:",
      expression: "Annual income = Principal × Yield\nPer payment  = Annual income ÷ payouts per year",
      where: [
        ["Principal", "the amount invested"],
        ["Yield", "the annual income rate — a bond coupon, dividend yield, or savings APY"],
        ["payouts per year", "monthly = 12, quarterly = 4, and so on"],
      ],
      note: "This is simple income only: it assumes the yield is paid out rather than reinvested, and that principal and yield stay constant. It's a snapshot of income, not a growth projection.",
    },
    terms: [
      ["Yield", "Annual income as a percentage of the amount invested."],
      ["Principal", "The capital producing the income."],
      ["Payout frequency", "How often income is paid — monthly, quarterly, semi-annually or annually."],
    ],
    faqs: [
      ["Is this the same as total return?", "No — it's income only. Total return also includes any change in the investment's price, which can be positive or negative."],
      ["Does it reinvest the income?", "No — it assumes you take the income as cash. To compound reinvested income, use the <a href=\"/calc/compound/\">compound interest calculator</a>."],
      ["Is the income taxable?", "Usually yes — interest and non-qualified dividends are generally taxed as income. This shows the pre-tax figure."],
    ],
  },

  irr_npv: {
    method: {
      lead: "It reads your cash flows in order (Year 0 first, usually the negative outlay) and discounts each back to today. NPV sums those present values at the rate you choose; IRR is the rate that makes that sum exactly zero:",
      expression: "NPV = Σ CFₜ / (1 + r)ᵗ   (t = 0…n)\nIRR is the rate r that makes NPV = 0",
      where: [
        ["CFₜ", "the cash flow in period t — Year 0 first, and typically negative"],
        ["r", "the discount rate per period"],
        ["IRR", "the rate at which the project's NPV is exactly zero"],
      ],
      note: "A positive NPV means the cash flows are worth more than the discount rate demands — the project adds value at that rate. IRR says the same thing as a single break-even rate, found numerically. The two can disagree when ranking projects, and IRR misbehaves when the cash flows change sign more than once.",
    },
    terms: [
      ["Net present value (NPV)", "The sum of future cash flows discounted to today, net of the initial outlay."],
      ["Internal rate of return (IRR)", "The discount rate that makes NPV zero — the project's implied annual return."],
      ["Discount rate", "The required return (or cost of capital) used to value future cash."],
      ["Cash flow", "Money in (positive) or out (negative) in a given period."],
    ],
    faqs: [
      ["How do I enter the cash flows?", "In order, Year 0 first, comma-separated. Year 0 is usually the initial cost as a negative number; later inflows are positive — e.g. −10000, 3000, 4000, 4000, 5000."],
      ["NPV or IRR — which should I trust?", "NPV, generally. It's stated in money at your actual required return and adds up across projects. IRR is a convenient single rate but can mislead when projects differ in size or timing."],
      ["Why might IRR show N/A?", "If the cash flows never cross zero (all one sign), or switch sign several times, there may be no single IRR — a known limitation of the measure."],
    ],
  },

  hsa: {
    method: {
      lead: "It values an HSA's twin benefits separately. The tax saving is your contribution times your marginal rate — the money you don't hand over in tax. The balance is the future value of each year's total contribution, yours plus the employer's, compounded at your return:",
      expression: "Annual tax saving = Your contribution × tax rate\nBalance = Total annual · ((1 + r)^years − 1) / r",
      where: [
        ["Total annual", "your contribution + the employer's contribution"],
        ["r", "the expected annual return"],
        ["years", "the number of years you contribute"],
      ],
      note: "An HSA is triple tax-advantaged — contributions are pre-tax, growth is untaxed, and withdrawals for qualified medical expenses are tax-free. This models a level annual contribution; it doesn't add a starting balance or enforce the annual IRS contribution limit.",
    },
    terms: [
      ["HSA (Health Savings Account)", "A tax-advantaged account for medical costs, paired with a qualifying high-deductible health plan."],
      ["Triple tax advantage", "Pre-tax contributions, tax-free growth, and tax-free qualified withdrawals."],
      ["Marginal tax rate", "The rate your contribution saves you up front."],
      ["Qualified medical expense", "A cost the IRS lets you pay from an HSA tax-free."],
    ],
    faqs: [
      ["Why is an HSA called triple-tax-advantaged?", "Three breaks in one account: you contribute pre-tax, the balance grows untaxed, and withdrawals for qualified medical costs are tax-free — a combination no other account offers."],
      ["Can I invest the balance?", "Many HSAs let you invest above a cash threshold, which is what makes the long-run growth here realistic. Unused funds roll over every year, unlike an FSA."],
      ["What if I use it for non-medical costs?", "Before 65, non-qualified withdrawals are taxed and penalized; after 65 they're taxed like an IRA. This projection assumes qualified use."],
    ],
  },

  currency: {
    method: {
      lead: "It converts through a common base: your amount is divided by the source currency's reference rate to a base value, then multiplied by the target currency's rate. The quoted exchange rate is simply the ratio of the two:",
      expression: "Converted = Amount × (rate_to ÷ rate_from)",
      where: [
        ["rate_from / rate_to", "each currency's reference rate against the common base"],
      ],
      note: "These are reference (mid-market) rates refreshed daily — not the price you'll actually transact at. Banks and card networks add a spread and sometimes a fee, so the real cost of exchanging money is usually a percent or two worse than the mid-market figure shown.",
    },
    terms: [
      ["Exchange rate", "How much of one currency you get for one unit of another."],
      ["Mid-market rate", "The midpoint between the buy and sell price — the \"true\" rate before any margin."],
      ["Spread", "The gap a provider adds around the mid-market rate as its margin."],
    ],
    faqs: [
      ["Why isn't this the rate my bank gives me?", "These are mid-market reference rates. Banks, exchanges and cards add a spread (and sometimes a flat fee), so you'll typically get a slightly worse rate in practice."],
      ["How current are the rates?", "They're refreshed daily. Currencies move continuously, so for anything time-sensitive check a live quote before acting."],
      ["Which currency is the base?", "It converts through a common reference internally, so any listed currency can be the \"from\" or \"to\" — the result is the same either way."],
    ],
  },

  tbill: {
    method: {
      lead: "A Treasury bill pays no coupon — you buy it below face value and receive face at maturity. The calculator expresses that gain two standard ways: the discount yield (against face value, on a 360-day basis) and the investment/bond-equivalent yield (against your actual price, on a 365-day basis):",
      expression: "Discount yield = (Face − Price)/Face × 360/days\nBond-equivalent yield = (Face − Price)/Price × 365/days",
      where: [
        ["Face − Price", "the discount, which is your entire return"],
        ["days", "days to maturity"],
      ],
      note: "The two conventions exist for good reasons but aren't directly comparable to a normal bond yield. The bond-equivalent (investment) yield — measured against the price you actually pay and a 365-day year — is the fairer number for comparing a T-bill to other investments.",
    },
    terms: [
      ["Treasury bill (T-bill)", "A short-term (≤1 year) US government debt security sold at a discount."],
      ["Discount yield", "Return stated against face value on a 360-day year — the quoting convention."],
      ["Bond-equivalent yield", "Return against the purchase price on a 365-day year — better for comparison."],
      ["Discount", "Face value minus purchase price; the T-bill's entire return."],
    ],
    faqs: [
      ["Why are there two yields?", "Convention. The discount yield (360-day, vs face) is how bills are quoted; the bond-equivalent yield (365-day, vs price) restates it so you can compare to coupon bonds and other investments."],
      ["Which yield should I compare?", "The bond-equivalent (investment) yield. It's measured against what you actually paid, so it reflects your real return more honestly than the discount yield."],
      ["Is T-bill interest taxable?", "It's subject to federal income tax but exempt from state and local tax — a modest advantage for investors in high-tax states."],
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

  rent_vs_buy: {
    method: {
      lead: "It runs both paths over your comparison window and nets them out. Renting is simply the sum of rent, grown each year. Buying totals the mortgage payments plus the down payment, then subtracts the equity you'd hold at the end — the home's appreciated value minus the loan balance still owed:",
      expression: "Net cost of buying = (Payments + Down payment) − (Future home value − Loan balance)",
      where: [
        ["Payments", "the mortgage payments made within the window (it stops billing once the loan is repaid)"],
        ["Future home value", "Price·(1 + appreciation)^years"],
        ["Loan balance", "the principal still owed at the end of the window"],
      ],
      note: "It's a cash-cost comparison. It doesn't model property tax, insurance, maintenance or transaction costs on the buy side, nor what a renter might earn by investing the down payment — all of which matter. Read the winner as directional.",
    },
    terms: [
      ["Equity", "The share of the home you own outright — market value minus the loan balance."],
      ["Appreciation", "The annual rate at which the home's value is assumed to rise."],
      ["Amortization", "The split of each mortgage payment between interest and principal over the term."],
    ],
    faqs: [
      ["Why can buying win even though I pay more in payments?", "Because you keep the house. The equity you hold at the end — appreciated value minus the remaining loan — is subtracted from the cost of buying. Renting builds no such asset."],
      ["What's missing from the buy side?", "Property tax, insurance, maintenance and closing/selling costs, which this doesn't include. Add them and the breakeven shifts toward renting."],
      ["Does it credit the renter for investing the down payment?", "No. A renter who invests the down payment and the monthly difference could do better than this simple comparison suggests — worth modelling separately."],
    ],
  },

  mortgage_tax: {
    method: {
      lead: "It builds the loan's amortization schedule, adds up the interest paid in the loan year you pick, and multiplies that interest by your marginal tax rate — a deduction is worth your tax rate times the interest, not the interest itself:",
      expression: "Tax saving = Interest paid that year × marginal tax rate",
      where: [
        ["Interest paid that year", "from the amortization schedule — high early, falling over time"],
        ["marginal tax rate", "the bracket your top dollar of income falls in"],
      ],
      note: "The benefit only exists if you itemize and your total itemized deductions beat the standard deduction — for many filers they don't, so the real benefit is the extra above the standard deduction, or zero. It also assumes all the interest qualifies (the loan is within the deductible-balance limit).",
    },
    terms: [
      ["Mortgage interest deduction", "A US itemized deduction for interest on a qualified home loan."],
      ["Itemizing", "Claiming actual deductions instead of the flat standard deduction — worthwhile only when they add up to more."],
      ["Marginal tax rate", "The rate on your last dollar of income — the rate a deduction actually saves you."],
      ["Amortization", "Interest is front-loaded, so the deduction is largest in the early years."],
    ],
    faqs: [
      ["Does everyone get this saving?", "No. Only if you itemize, and only to the extent your itemized deductions exceed the standard deduction. Many households take the standard deduction and get no marginal benefit."],
      ["Why does the saving shrink each year?", "A mortgage is front-loaded with interest, so later years have less interest to deduct. Change the loan year to see this fall."],
      ["Is there a limit?", "Yes — interest is deductible only on mortgage debt up to a cap set by law. This assumes your balance is within it; consult a tax professional for your situation."],
    ],
  },

  discount_points: {
    method: {
      lead: "Each point costs 1% of the loan and buys a small rate cut. It prices the payment with and without the points, then divides what the points cost by the monthly payment they save to find how long you must keep the loan to break even:",
      expression: "Breakeven months = Cost of points ÷ Monthly payment saved",
      where: [
        ["Cost of points", "loan amount × points × 1%"],
        ["Monthly payment saved", "payment at the base rate − payment at the reduced rate"],
      ],
      note: "Points pay off only if you keep the mortgage past the breakeven point. Sell or refinance before then and you've spent more on points than you got back. The cost is also usually paid in cash at closing.",
    },
    terms: [
      ["Discount point", "An upfront fee equal to 1% of the loan that lowers the interest rate."],
      ["Breakeven point", "The month at which cumulative payment savings equal the points' cost."],
      ["Buying down the rate", "Paying points to secure a lower rate for the life of the loan."],
    ],
    faqs: [
      ["When are points worth it?", "When you'll hold the loan well beyond the breakeven month. The longer you keep the mortgage past that point, the more the points pay off."],
      ["Are points tax-deductible?", "Points on a home purchase are often deductible as prepaid interest, though rules vary. This calculator ignores any tax effect."],
      ["Is one point always the same rate cut?", "No — the reduction per point varies by lender and market. Enter the actual reduction your lender quotes."],
    ],
  },

  arm: {
    method: {
      lead: "An ARM is fixed for an initial period, then resets. It computes the initial payment as if the starting rate ran the whole term, tracks the balance down to the reset date, then re-amortizes that remaining balance over the remaining months at the adjusted rate:",
      expression: "Payment after reset = amortize(balance at reset, adjusted rate, remaining term)",
      where: [
        ["balance at reset", "the principal still owed when the fixed period ends"],
        ["remaining term", "total term − initial fixed period"],
      ],
      note: "This models a single adjustment to a rate you specify. A real ARM can adjust repeatedly against an index plus margin, bounded by periodic and lifetime caps — so treat the \"after adjustment\" figure as one scenario, not a ceiling.",
    },
    terms: [
      ["ARM", "Adjustable-rate mortgage — a fixed introductory rate that later floats."],
      ["Initial fixed period", "The years the starting rate is locked (the \"5\" in a 5/1 ARM)."],
      ["Rate reset / adjustment", "When and how the rate changes after the fixed period."],
      ["Rate cap", "The limit on how much the rate can rise per adjustment and over the loan's life."],
    ],
    faqs: [
      ["What do numbers like 5/1 mean?", "The first is the years the rate is fixed; the second is how often it adjusts afterward. A 5/1 ARM is fixed for five years, then adjusts yearly."],
      ["Could my payment rise more than shown?", "Possibly. Real ARMs adjust against an index and can move each period up to a cap. This shows one adjustment to the rate you enter — check your loan's caps for the worst case."],
      ["Why choose an ARM?", "The intro rate is usually lower than a comparable fixed rate — useful if you'll sell or refinance before it adjusts. The risk is being caught by higher rates if you don't."],
    ],
  },

  fixed_vs_arm: {
    method: {
      lead: "It amortizes the fixed loan straight through, and builds the ARM in two phases — the intro rate for the fixed period, then the remaining balance re-amortized at the adjusted rate — and compares total interest across both:",
      expression: "Difference = Total paid (fixed) − Total paid (ARM)",
      where: [
        ["Total paid (fixed)", "principal + all interest at the fixed rate over the term"],
        ["Total paid (ARM)", "principal + intro-period interest + interest on the reset balance at the adjusted rate"],
      ],
      note: "It assumes exactly one adjustment, to the rate you enter, held for the rest of the term. If rates rise more (or less) than that single assumption, the comparison changes — the ARM's cost is only as good as your rate guess.",
    },
    terms: [
      ["Fixed-rate mortgage", "One rate for the entire term; the payment never changes."],
      ["ARM", "A lower intro rate that later adjusts, trading certainty for a cheaper start."],
      ["Total interest", "The figure to compare — the true lifetime cost of each loan."],
    ],
    faqs: [
      ["Which is cheaper?", "It depends entirely on the adjusted rate you assume. At the intro rate the ARM starts cheaper; if it resets much higher, the fixed loan can win over the full term."],
      ["Is a positive difference good for the ARM?", "The result is fixed total minus ARM total, so a positive number means the ARM costs less under your assumptions. Change the adjusted rate to see how fragile that is."],
      ["What's the safe choice?", "A fixed rate removes the rate risk entirely, at the cost of a higher starting rate. An ARM bets that you'll move or refinance early, or that rates stay tame."],
    ],
  },

  interest_only: {
    method: {
      lead: "During the interest-only period you pay just the monthly interest, so the balance never falls. When that period ends, the full original balance must amortize over the years left — a payment jump the calculator makes explicit:",
      expression: "IO payment    = Balance × rate ÷ 12\nLater payment = amortize(Balance, rate, remaining years)",
      where: [
        ["Balance", "the loan amount, unchanged through the interest-only period"],
        ["remaining years", "total term − interest-only period"],
      ],
      note: "Because no principal is paid during the IO period, the later payment amortizes the whole balance over a shorter span — so it is markedly higher than a normal payment would have been. Paying only interest builds no equity.",
    },
    terms: [
      ["Interest-only period", "An opening phase where payments cover interest only and the balance holds steady."],
      ["Payment shock", "The jump when the IO period ends and principal repayment begins."],
      ["Amortization", "Repaying principal and interest together in level installments."],
    ],
    faqs: [
      ["Do I owe less after the interest-only period?", "No — the balance is unchanged, because you paid no principal. That's exactly why the payment jumps: the full amount now amortizes over fewer years."],
      ["Why take an interest-only loan?", "Lower payments up front — useful for irregular income, or if you expect to sell or refinance before principal kicks in. The risks are the later payment shock and building no equity meanwhile."],
      ["How big is the jump?", "Often substantial, because principal is squeezed into a shorter term. The \"payment increase\" figure shows exactly how much."],
    ],
  },

  rental_property: {
    method: {
      lead: "It works up from rent to the three numbers investors watch. Effective rent nets out vacancy; net operating income subtracts operating expenses; cash flow then subtracts the mortgage. Cap rate and cash-on-cash express the return against price and against cash invested:",
      expression: "NOI = (Rent·(1 − vacancy) − Expenses)·12\nCap rate = NOI ÷ Price      Cash-on-cash = Cash flow ÷ Down payment",
      where: [
        ["NOI", "net operating income — rental income after vacancy and operating costs, before the mortgage"],
        ["Cash flow", "NOI − annual mortgage payments"],
      ],
      note: "NOI deliberately excludes the mortgage (so cap rate compares properties regardless of financing); cash flow and cash-on-cash include it. It doesn't model income tax, depreciation, capital expenses or appreciation — all central to a full return picture.",
    },
    terms: [
      ["NOI (net operating income)", "Rental income minus operating expenses, before financing."],
      ["Cap rate", "NOI ÷ price — the unlevered yield, used to compare properties."],
      ["Cash-on-cash return", "Annual cash flow ÷ cash invested — the levered cash yield."],
      ["Vacancy rate", "The share of the year the unit is assumed empty."],
    ],
    faqs: [
      ["Cap rate vs cash-on-cash?", "Cap rate ignores the mortgage (NOI ÷ price), so it compares properties on their own merits. Cash-on-cash counts the mortgage and measures return on the actual cash you put in."],
      ["What counts as operating expenses?", "Taxes, insurance, management, maintenance and any utilities you pay — but not the mortgage (that's financing) and not capital improvements. Underestimating these flatters the result."],
      ["Does it include appreciation or tax?", "No — it's a cash-flow snapshot. Long-run returns also come from appreciation, principal paydown and tax effects like depreciation, none of which are modelled here."],
    ],
  },

  loan_compare: {
    method: {
      lead: "It fully amortizes each loan and compares their total cost — every scheduled payment over the whole term — so a lower monthly payment can't hide a higher lifetime bill:",
      expression: "Difference = Total paid (A) − Total paid (B)\nTotal paid = monthly payment × number of months",
      where: [
        ["Each payment", "from M = P·r(1 + r)ⁿ / ((1 + r)ⁿ − 1)"],
        ["Total paid", "the payment times the number of months in that loan's term"],
      ],
      note: "The comparison is on total dollars paid, interest included. Two loans can have similar payments but very different total costs when their terms differ — a longer term lowers the payment while raising lifetime interest.",
    },
    terms: [
      ["Amortization", "Repaying a loan in level installments split between interest and principal."],
      ["Total cost", "Principal plus all interest over the full term — the true basis for comparison."],
      ["Term", "The number of years over which the loan is repaid."],
    ],
    faqs: [
      ["Should I just pick the lower monthly payment?", "Not necessarily. A lower payment often comes from a longer term, which can cost more in total interest. Compare the total-cost figure, not just the monthly one."],
      ["Does it account for fees or APR?", "No — it compares rate, amount and term. To fold fees and points into a single rate, use the <a href=\"/calc/apr/\">APR calculator</a>."],
      ["The two loan amounts differ — is the comparison still fair?", "It compares total dollars paid, so different amounts are handled; but a like-for-like rate comparison is clearest when the amounts match."],
    ],
  },

  commercial_loan: {
    method: {
      lead: "A commercial loan often amortizes on a long schedule but comes due early with a lump-sum balloon. It sizes the monthly payment from the full amortization period, then reads off the balance still owed at the balloon date:",
      expression: "Payment = amortize(amount, rate, amortization years)\nBalloon due = balance remaining at the balloon year",
      where: [
        ["Amortization years", "the (longer) schedule the payment is based on, e.g. 25"],
        ["Balloon year", "when the remaining balance falls due in one payment, e.g. 5"],
      ],
      note: "Because the payment is stretched over a long amortization but the loan matures early, only a fraction of the principal is repaid before the balloon — so the balloon can be a large share of the original loan, usually refinanced or paid from a sale.",
    },
    terms: [
      ["Balloon payment", "A large lump sum of remaining principal due at the end of the loan's term."],
      ["Amortization period", "The longer schedule used to size the monthly payment."],
      ["Loan term / balloon year", "When the balance actually comes due."],
    ],
    faqs: [
      ["Why is the balloon so large?", "Because the payment is based on a long amortization (say 25 years) while the loan matures early (say 5). Little principal is repaid in between, so most of the balance remains — that's the balloon."],
      ["How is a balloon repaid?", "Usually by refinancing into a new loan, or from the sale of the property. It relies on credit or asset value being available at maturity, which is the main risk."],
      ["Is this how home mortgages work?", "No — standard residential mortgages fully amortize over their term with no balloon. Balloons are common in commercial and some short-term financing."],
    ],
  },

  apr_advanced: {
    method: {
      lead: "APR restates a loan's true cost as a single rate by treating the fees as money you never received. It keeps the payment set by your stated rate, subtracts every fee and point from the amount you actually get, and solves for the rate that links the two:",
      expression: "APR = the rate where Payment = amortize(net amount, APR, term)\nNet amount = Loan − origination − other fees − points cost",
      where: [
        ["Payment", "computed from the stated rate on the full loan"],
        ["Net amount", "the loan minus all fees and points — what actually reaches you"],
      ],
      note: "Because the payment is fixed but the amount financed is effectively smaller, the APR comes out above the stated rate — the more you pay in fees and points, the wider that gap. This advanced version itemizes origination, other closing fees and discount points separately.",
    },
    terms: [
      ["APR (annual percentage rate)", "A loan's cost as a rate, including fees — the legally comparable figure."],
      ["Stated (note) rate", "The headline interest rate before fees."],
      ["Discount points", "An upfront fee (1% of the loan each) that buys a lower rate."],
      ["Origination fee", "The lender's charge for processing the loan."],
    ],
    faqs: [
      ["Why is the APR higher than the stated rate?", "Because fees and points are money you pay but don't get to borrow. Spread over the loan, they raise the effective rate above the note rate."],
      ["Is APR the best way to compare loans?", "It's the standard, and better than comparing rates alone. But it assumes you keep the loan its full term — if you'll repay or refinance early, upfront fees weigh more heavily than APR suggests."],
      ["Do points and fees count the same?", "In APR, yes — both are upfront costs subtracted from what you receive. This calculator lets you enter points and fee items separately for clarity."],
    ],
  },

  loan_analysis: {
    method: {
      lead: "It amortizes the loan twice — once as scheduled, once with your extra monthly payment applied straight to principal — and reports the interest and time the extra payments save:",
      expression: "Interest saved = Interest (scheduled) − Interest (with extra)\nMonths saved = Payoff months (scheduled) − Payoff months (with extra)",
      where: [
        ["Extra", "an additional amount added to every monthly payment, all applied to principal"],
      ],
      note: "Every extra dollar cuts the balance that future interest is charged on, so the savings compound — a modest extra payment can shorten a long loan by years. The gain is largest early in the loan, when interest makes up most of the payment.",
    },
    terms: [
      ["Principal prepayment", "An extra payment applied directly to the balance, not interest."],
      ["Amortization", "The scheduled split of each payment between interest and principal."],
      ["Payoff time", "How long until the balance reaches zero."],
    ],
    faqs: [
      ["Why does a small extra payment save so much?", "Because it goes entirely to principal, and every dollar of principal removed saves all the future interest it would have generated. Over a long term those savings compound."],
      ["When do extra payments help most?", "Early in the loan, when the balance — and therefore the interest portion of each payment — is highest. The same extra payment later saves less."],
      ["Should I always prepay?", "Not necessarily. Compare the loan's rate to what the money could earn elsewhere, and check for prepayment penalties. High-rate debt is usually worth prepaying; low-rate debt may not be."],
    ],
  },

  auto_lease: {
    method: {
      lead: "A lease payment has two parts: depreciation (the value the car loses while you drive it) and a rent charge (the financing cost). It spreads depreciation over the term and applies the money factor to the sum of the cap cost and residual, then adds sales tax:",
      expression: "Depreciation = (Adjusted cap cost − Residual) ÷ months\nRent charge = (Adjusted cap cost + Residual) × money factor\nPayment = (Depreciation + Rent charge) × (1 + tax)",
      where: [
        ["Adjusted cap cost", "negotiated price minus any down payment (cap reduction)"],
        ["Residual", "the car's forecast value at lease end = price × residual %"],
        ["money factor", "the lease's interest rate in disguise — multiply by 2,400 for the approximate APR"],
      ],
      note: "The money factor is a small decimal (e.g. 0.00125); × 2,400 gives the equivalent APR. A higher residual lowers depreciation and your payment — you're financing less of the car's value over the term.",
    },
    terms: [
      ["Capitalized cost", "The agreed price of the vehicle being leased (negotiable)."],
      ["Residual value", "The car's predicted worth at lease end; you pay for the drop from cap cost to residual."],
      ["Money factor", "The lease's financing rate; multiply by 2,400 for the approximate APR."],
      ["Depreciation", "The portion of the payment covering the car's loss in value."],
    ],
    faqs: [
      ["What is the money factor?", "It's the lease equivalent of an interest rate, written as a small decimal. Multiply by 2,400 to convert it to an approximate APR — the calculator shows this."],
      ["Why does a higher residual mean a lower payment?", "Because you only pay for the depreciation — the gap between cap cost and residual. A higher residual means a smaller gap, so a smaller payment."],
      ["Is a down payment on a lease worth it?", "It lowers the payment (by reducing the adjusted cap cost) but is generally at risk if the car is totaled early. Many advise minimizing lease down payments for that reason."],
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
      ["How much extra should I pay?", "Any fixed amount above the minimum helps enormously, because the extra goes straight to principal. Even a small fixed monthly payment beats a shrinking percentage. See the <a href=\"/calc/cc_payoff/\">payoff calculator</a>."],
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

  annuity: {
    method: {
      lead: "A fixed annuity is a level payment stream earning a constant rate. The calculator either grows your payments to a future value, or solves for the payment that reaches a target — both from the standard future-value-of-an-annuity relationship:",
      expression: "FV = PMT · ((1 + r)ⁿ − 1) / r · (1 + r·type)",
      where: [
        ["PMT", "the periodic (monthly) payment"],
        ["r", "the monthly rate = annual rate ÷ 12"],
        ["n", "the number of payments = years × 12"],
        ["type", "0 for ordinary (period-end), 1 for annuity due (period-start)"],
      ],
      note: "\"Annuity due\" payments arrive one period earlier, so each earns an extra period of interest — raising the future value, or lowering the payment needed to hit a target. Solving for the required payment simply inverts the same formula for PMT.",
    },
    terms: [
      ["Annuity", "A series of equal payments made at regular intervals."],
      ["Ordinary annuity", "Payments at the end of each period (most loans, many savings plans)."],
      ["Annuity due", "Payments at the start of each period (rent, some insurance premiums)."],
      ["Future value of an annuity", "What the whole payment stream grows to by the end."],
    ],
    faqs: [
      ["Ordinary annuity vs annuity due?", "Timing. Due payments happen at the start of each period and so earn one more period of growth; ordinary payments happen at the end. For the same payment, an annuity due always yields a slightly higher future value."],
      ["Is this the same as an insurance annuity product?", "No. This is the time-value math of a level payment stream. A commercial annuity contract layers on fees, options and guarantees that this doesn't model."],
      ["How is the required payment found?", "By inverting the future-value formula for PMT — the deposit that, compounded at your rate for the term, lands exactly on the target."],
    ],
  },

  retirement_planner: {
    method: {
      lead: "It grows your savings to retirement, then works out the lump sum those retirement years require. The nest egg is your balance plus contributions compounded; the need is the present value, at retirement, of your desired income across your retirement years:",
      expression: "Nest egg = Savings·(1 + r)ⁿ + PMT·((1 + r)ⁿ − 1)/r\nNeed = Income · (1 − (1 + R)⁻ʸ) / R",
      where: [
        ["r, n, PMT", "the monthly return, months until retirement, and monthly contribution"],
        ["R, y, Income", "the annual return, the number of years in retirement, and desired annual income"],
      ],
      note: "The \"need\" treats the balance as still earning your return through retirement (a present-value annuity), not sitting in cash. It doesn't inflate the desired income, so for a distant retirement set the income target in future dollars — or read the surplus as a rough cushion.",
    },
    terms: [
      ["Nest egg", "The total savings you're projected to have at retirement."],
      ["Present value of an annuity", "The lump sum today that funds a stream of future withdrawals at a given return."],
      ["Surplus / shortfall", "Nest egg minus the lump sum your retirement income requires."],
    ],
    faqs: [
      ["Does it account for inflation?", "Not directly — it works in the dollars you enter. For a retirement decades away, set the desired income in future dollars, or use a real (after-inflation) return."],
      ["What return should I assume in retirement?", "The \"need\" figure assumes the balance keeps earning your rate while you draw it down. A more cautious plan uses a lower retirement-phase return, which raises the amount needed."],
      ["Is a small surplus enough?", "Treat it as a cushion, not a guarantee. Market sequence, longevity and inflation all add uncertainty, so a comfortable margin is wise."],
    ],
  },

  "401k_max": {
    method: {
      lead: "To \"max out\" is to hit the annual IRS elective-deferral limit. It converts that limit into the contribution percentage and the per-paycheck amount you'd need, and shows how far your current rate falls short:",
      expression: "% needed = IRS limit ÷ salary\nPer paycheck = IRS limit ÷ pay periods",
      where: [
        ["IRS limit", "the annual elective-deferral cap you enter"],
        ["pay periods", "how many paychecks a year (bi-weekly = 26, and so on)"],
      ],
      note: "The limit is on your own elective deferrals; the employer match doesn't count toward it. Spreading contributions evenly avoids hitting the cap early and missing match on later paychecks — some plans \"true up\", many don't.",
    },
    terms: [
      ["Elective deferral limit", "The IRS cap on what you can contribute to a 401(k) from salary each year."],
      ["Maxing out", "Contributing the full annual limit."],
      ["True-up", "An employer provision that pays any match missed by hitting the cap early — not universal."],
    ],
    faqs: [
      ["Does the employer match count toward the limit?", "No — the elective-deferral limit is on your own contributions. Employer match sits under a separate, higher overall limit."],
      ["Why spread contributions across the year?", "If you hit the cap early, contributions stop — and on many plans so does the per-paycheck match on the remaining checks. Even pacing protects the full match unless your plan trues up."],
      ["What is the current limit?", "It's set by the IRS and rises most years, with an extra catch-up amount at 50+. Enter the current year's figure; this calculator doesn't hard-code it."],
    ],
  },

  ss_estimator: {
    method: {
      lead: "Social Security replaces a progressively smaller share of higher earnings. It runs your average indexed monthly earnings through the benefit \"bend points\" to get your full-retirement-age benefit (PIA), then adjusts for when you claim:",
      expression: "PIA = 90%·(first $1,174) + 32%·(next tier to $7,078) + 15%·(rest)",
      where: [
        ["AIME", "your average indexed monthly earnings"],
        ["bend points", "the 2024 thresholds ($1,174 and $7,078) where the replacement rate steps down"],
        ["claim adjustment", "62 ≈ 70% of PIA, 67 (FRA) = 100%, 70 ≈ 124%"],
      ],
      note: "A simplified estimate using one year's bend points and three claiming ages; your real benefit depends on your full 35-year indexed earnings history and your exact full-retirement age. Treat it as a ballpark, not your official figure.",
    },
    terms: [
      ["AIME", "Average indexed monthly earnings — your career earnings, inflation-adjusted and averaged."],
      ["PIA (Primary Insurance Amount)", "The monthly benefit at full retirement age."],
      ["Bend points", "The income thresholds where the replacement rate drops (90% → 32% → 15%)."],
      ["Full retirement age (FRA)", "The age (66–67 for most) at which you receive 100% of your PIA."],
    ],
    faqs: [
      ["Why do the percentages fall as earnings rise?", "By design — Social Security replaces more of a low earner's income than a high earner's. The 90/32/15% bend points make it progressive."],
      ["How much does claiming age matter?", "A lot. Claiming at 62 permanently cuts the benefit to about 70% of PIA; waiting to 70 raises it to about 124%. The trade-off is fewer years of a larger check."],
      ["Is this my official benefit?", "No — it's a simplified estimate. Your real figure comes from your Social Security statement, based on your complete earnings record."],
    ],
  },

  asset_allocation: {
    method: {
      lead: "It starts from a common rule of thumb — hold roughly (110 − your age)% in stocks — then tilts the mix for your risk tolerance and fills the rest with bonds and a slice of cash:",
      expression: "Stocks % = clamp(110 − age ± risk adjustment, 10, 95)",
      where: [
        ["110 − age", "the baseline stock share, which falls as you age"],
        ["risk adjustment", "−15 for conservative, +15 for aggressive"],
        ["remainder", "split across bonds and cash"],
      ],
      note: "This is a starting template, not advice. The old \"100 − age\" rule has drifted higher (110, even 120) as lifespans lengthen. Your own horizon, other income and comfort with volatility should shape the final mix.",
    },
    terms: [
      ["Asset allocation", "How a portfolio is divided among stocks, bonds and cash."],
      ["Risk tolerance", "Your capacity and willingness to endure ups and downs for higher expected return."],
      ["Rebalancing", "Periodically returning to your target mix as markets move it."],
      ["Glide path", "The way a target allocation shifts toward bonds as you approach a goal."],
    ],
    faqs: [
      ["Where does 110 − age come from?", "It's a rule of thumb: younger investors, with time to recover, hold more stocks; the share falls with age. Older \"100 − age\" versions have been nudged up as retirements lengthen."],
      ["Should I follow this exactly?", "Treat it as a starting point. Your time horizon, job stability, pensions and stomach for volatility all justify moving away from a generic template."],
      ["How often should I rebalance?", "Commonly once or twice a year, or when a holding drifts a set amount from target. Rebalancing sells what's risen and buys what's lagged, keeping risk in check."],
    ],
  },

  retirement_calc: {
    method: {
      lead: "An all-in-one readiness check. It grows your savings to retirement, then computes the level monthly income that would draw that balance down to zero over your retirement years, assuming it keeps earning a fixed 4% while you spend it:",
      expression: "Sustainable monthly = the payment that amortizes the nest egg over the retirement months at 4%/yr",
      where: [
        ["Nest egg", "savings compounded at your pre-retirement return, plus contributions"],
        ["retirement months", "(life expectancy − retirement age) × 12"],
      ],
      note: "The drawdown uses a fixed 4% annual return through retirement — a planning assumption, not a promise. It fully depletes the balance by your life-expectancy age, so living longer than expected would exhaust it; build in a margin.",
    },
    terms: [
      ["Nest egg", "Projected savings at the moment you retire."],
      ["Sustainable income", "The level withdrawal that empties the balance over your planning horizon."],
      ["Drawdown", "Spending down accumulated savings during retirement."],
      ["Life expectancy", "The age to which the plan funds income — outliving it is the risk."],
    ],
    faqs: [
      ["Why 4% in retirement?", "It's a common, cautious planning return for a balanced retirement portfolio — an assumption you can't control precisely. A lower rate produces a safer, smaller sustainable income."],
      ["Does it leave anything behind?", "No — it draws the balance to zero at your life-expectancy age. To leave an estate, or guard against a long life, target income below the sustainable figure."],
      ["How is this different from the Retirement Planner?", "Similar inputs, different output: the planner compares your nest egg to a lump-sum need; this one turns the nest egg into a monthly income figure."],
    ],
  },

  retirement_savings_analysis: {
    method: {
      lead: "It grows your savings to retirement, then converts that nest egg into the level annual income it can sustain across your withdrawal years — the payment that draws the balance to zero while it keeps earning your retirement-phase return — and compares it to your goal:",
      expression: "Nest egg = Savings·(1 + r)ⁿ + PMT·((1 + r)ⁿ − 1)/r\nSustainable income = Nest egg · wr / (1 − (1 + wr)⁻ʸ)",
      where: [
        ["r, n, PMT", "the monthly return, months to retirement, and monthly saving"],
        ["wr, y", "the retirement-phase annual return and the number of withdrawal years"],
      ],
      note: "It uses two different returns — one while saving, a usually lower one while drawing down. The sustainable income empties the balance exactly over your withdrawal years, so outliving that horizon is the risk; a lower withdrawal return gives a safer, smaller figure.",
    },
    terms: [
      ["Accumulation vs decumulation", "The saving phase vs the spending-down phase of retirement."],
      ["Sustainable income", "The annual withdrawal that exhausts the balance over the planned years."],
      ["Nest egg", "Projected savings at the moment you retire."],
    ],
    faqs: [
      ["Why two different return rates?", "Portfolios are usually shifted toward safer, lower-returning assets in retirement, so the withdrawal-phase return is typically lower than the accumulation return. Using one rate for both would overstate income."],
      ["Does it leave a cushion?", "No — it draws the balance to zero over your withdrawal years. To guard against a long life or bad markets, target income below the sustainable figure."],
      ["What if I fall short?", "Save more monthly, retire later, or trim the income goal. Small increases early compound most; the shortfall note flags when your rate won't meet the target."],
    ],
  },

  retirement_income_analysis: {
    method: {
      lead: "It runs your nest egg forward year by year: each year the balance earns your return, then a withdrawal is taken out, and the withdrawal itself grows with inflation. The calculator reports whether the money survives the period, or the year it runs dry:",
      expression: "Each year:  Balance = Balance·(1 + return) − Withdrawal\n            Withdrawal = Withdrawal·(1 + inflation)",
      where: [
        ["Withdrawal", "starts at nest egg × withdrawal rate, then rises with inflation each year"],
        ["return, inflation", "the annual investment return and the rate the withdrawal grows"],
      ],
      note: "Because the withdrawal is inflation-adjusted, it rises every year while the balance may not keep up — the classic sequence-of-returns risk. This is a fixed-return simulation; real markets vary year to year, and a bad early stretch is far more damaging than a bad late one.",
    },
    terms: [
      ["Withdrawal rate", "The first year's withdrawal as a percentage of the starting nest egg (the \"4% rule\" idea)."],
      ["Sequence-of-returns risk", "The danger that poor returns early in retirement deplete a portfolio faster."],
      ["Real (inflation-adjusted) withdrawal", "Spending that rises each year to preserve purchasing power."],
    ],
    faqs: [
      ["What's a safe withdrawal rate?", "A common rule of thumb is around 4% of the starting balance, rising with inflation — but it's a guideline, not a guarantee, and depends on returns, horizon and how much variability you can tolerate."],
      ["Why does inflation matter so much?", "Because the withdrawal grows every year. Over a long retirement, an inflation-adjusted income can far exceed the starting figure, draining the balance faster than a flat withdrawal would."],
      ["Does this model market ups and downs?", "No — it uses a fixed annual return. Real sequences vary; a run of early losses (sequence risk) can deplete savings even when the average return looks fine."],
    ],
  },

  retirement_income_calc: {
    method: {
      lead: "It solves for the level monthly income your savings can pay over your retirement years, using a real (inflation-adjusted) return so the figure holds its purchasing power. That income is the annuity payment that amortizes the nest egg to zero:",
      expression: "Real rate = (1 + return) ÷ (1 + inflation) − 1\nMonthly income = the payment that amortizes the nest egg over the months at the real rate",
      where: [
        ["Real rate", "the return after stripping out inflation"],
        ["months", "years in retirement × 12"],
      ],
      note: "Using the real rate means the monthly income is stated in today's dollars and stays constant in purchasing power — in nominal terms you'd actually withdraw a little more each year. It draws the balance to zero over the horizon, so build in a margin against a longer life.",
    },
    terms: [
      ["Real rate of return", "The growth rate after inflation is removed — what actually grows your purchasing power."],
      ["Sustainable income", "The withdrawal that empties the balance over the chosen horizon."],
      ["Nominal vs real", "Nominal is the raw dollar figure; real holds constant buying power."],
    ],
    faqs: [
      ["Why use a real return instead of the nominal one?", "So the income keeps its purchasing power. A real-rate payment stays constant in today's dollars; in actual dollars you'd withdraw a bit more each year to keep pace with prices."],
      ["Does the money last forever?", "No — it's sized to run out exactly at the end of your horizon. For income that could last indefinitely, withdraw less than the balance's real return."],
      ["What return and inflation should I use?", "A diversified portfolio's long-run return and a long-run inflation estimate. The gap between them — the real rate — drives the result, so be conservative with both."],
    ],
  },

  ss_analysis: {
    method: {
      lead: "It computes the lifetime total each claiming age would pay — the annual benefit times the years you'd collect it up to your life expectancy — and picks the age with the biggest cumulative total:",
      expression: "Lifetime total = Annual benefit × (life expectancy − claiming age)\nBenefit: 62 → 70% of PIA, 67 → 100%, 70 → 124%",
      where: [
        ["PIA", "your full-retirement-age benefit (Primary Insurance Amount)"],
        ["claiming age", "62 (reduced), 67 (full), or 70 (delayed)"],
      ],
      note: "Claiming early means more years of smaller checks; delaying means fewer years of larger ones. The crossover depends entirely on how long you live — which is why life expectancy is the pivotal input. It ignores taxes, spousal benefits, and the time value of money.",
    },
    terms: [
      ["Claiming age", "When you start Social Security, between 62 and 70."],
      ["Break-even age", "The age at which delaying overtakes claiming early in cumulative benefits."],
      ["PIA (Primary Insurance Amount)", "The benefit payable at full retirement age."],
      ["Delayed retirement credits", "The ~8%/year increase for claiming after full retirement age, up to 70."],
    ],
    faqs: [
      ["Is claiming later always better?", "Only if you live long enough. Delaying buys a bigger check but you collect it for fewer years; the longer your life expectancy, the more delaying wins."],
      ["What's not included?", "Taxes on benefits, spousal and survivor benefits, and the time value of money (a dollar today vs later). Those can shift the real-world answer."],
      ["How much does waiting from 67 to 70 add?", "Roughly 8% a year in delayed credits — about 24% more at 70 than at full retirement age, as reflected in the calculator."],
    ],
  },

  ss_distribution: {
    method: {
      lead: "Whether your Social Security is taxed depends on \"provisional income\" — your other income plus half your benefit. It's compared to two thresholds; below the first none is taxable, and the taxable share climbs toward a cap of 85% of the benefit:",
      expression: "Provisional income = Other income + ½ × Annual benefit\nThresholds (single): $25,000 and $34,000  ·  (married): $32,000 and $44,000",
      where: [
        ["Below the first threshold", "0% of the benefit is taxable"],
        ["Between the thresholds", "up to 50% of the benefit becomes taxable"],
        ["Above the second", "up to 85% of the benefit becomes taxable"],
      ],
      note: "At most 85% of your benefit is ever taxable — never 100% — and that portion is then taxed at your ordinary rate, not a flat 85% tax. This mirrors the IRS worksheet; the actual figure also depends on deductions and your full return.",
    },
    terms: [
      ["Provisional (combined) income", "Other income plus half your Social Security benefit — the figure the thresholds test."],
      ["Taxable portion", "The share of benefits added to taxable income (0%, up to 50%, or up to 85%)."],
      ["Base thresholds", "The income levels ($25k/$32k and $34k/$44k) that set the tiers."],
    ],
    faqs: [
      ["Is 85% the tax rate?", "No — it's the maximum share of your benefit that can be taxed. That portion is then taxed at your ordinary income rate. Most people owe far less than 85% of their benefit in tax."],
      ["Why is only half my benefit counted for the threshold?", "That's how the IRS defines provisional income — other income plus one-half of benefits. It's a formula quirk, not a statement about how much is taxable."],
      ["How can I reduce the tax on benefits?", "Managing other income (e.g. Roth withdrawals, which don't count) can keep provisional income below a threshold. The thresholds aren't inflation-indexed, so more retirees cross them over time."],
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
      ["Is a raise that matches inflation really a raise?", "Only in nominal terms — it holds your purchasing power flat. A raise below inflation is a real-terms pay cut; compare with the <a href=\"/calc/salary_increase/\">salary increase calculator</a>."],
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
      ["Is APY the same as APR?", "Not quite. APY (like EAR) includes compounding and describes what you earn on savings. APR describes borrowing cost and, by convention, usually excludes intra-year compounding — see the <a href=\"/calc/apr/\">APR calculator</a>."],
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
      note: "This is gross pay, before taxes and deductions. To estimate take-home from a salary, see the <a href=\"/calc/paycheck_tax/\">paycheck tax calculator</a>.",
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
      ["Does a raise keep up with inflation?", "Only if it meets or beats the inflation rate. Check the gap with the <a href=\"/calc/inflation/\">inflation calculator</a> — below-inflation raises quietly erode purchasing power."],
      ["How is a raise taxed?", "Only the additional income is taxed, at your marginal rate — a raise never lowers your overall take-home. Withholding on bonuses can look higher, but it evens out at filing."],
    ],
  },

  paycheck_tax: {
    method: {
      lead: "It works from gross pay down to take-home. The standard deduction comes off first, federal tax is applied through the 2024 brackets, then FICA (Social Security + Medicare) and an optional flat state rate are subtracted, and the remainder is split across your pay periods:",
      expression: "Net = Gross − Federal tax − Social Security − Medicare − State tax\nSocial Security = min(Gross, $168,600) × 6.2%      Medicare = Gross × 1.45%",
      where: [
        ["Federal tax", "the 2024 brackets applied to (gross − standard deduction)"],
        ["Social Security", "6.2% up to the annual wage base; Medicare is 1.45% on all wages"],
      ],
      note: "A simplified 2024-law estimate. It uses the standard deduction and ignores pre-tax deductions (401k, health premiums), tax credits, the extra Medicare tax on high earners, and local taxes — so real take-home can differ. State tax is a flat estimate, not bracketed.",
    },
    terms: [
      ["Gross vs net pay", "Earnings before deductions vs the amount that reaches your account."],
      ["FICA", "The combined Social Security (6.2%) and Medicare (1.45%) payroll taxes."],
      ["Standard deduction", "A flat amount subtracted from income before federal tax."],
      ["Wage base", "The earnings ceiling above which Social Security tax stops (Medicare has none)."],
    ],
    faqs: [
      ["Why doesn't Social Security apply to my whole salary?", "It's capped at an annual wage base ($168,600 in 2024); earnings above it aren't taxed for Social Security. Medicare's 1.45% has no such cap."],
      ["Why is my real paycheck different?", "This ignores pre-tax deductions (retirement, health insurance), tax credits and local taxes, and treats state tax as a flat rate. Those can move take-home either way."],
      ["Is the state tax accurate?", "It's a flat estimate you enter. Many states use brackets, and some have no income tax at all, so treat it as an approximation."],
    ],
  },

  discount_tax: {
    method: {
      lead: "It applies the discount first, then charges sales tax on the reduced price — the order a register rings up a sale:",
      expression: "Final = Price × (1 − discount%) × (1 + tax%)",
      where: [
        ["discount%", "the markdown off the original price"],
        ["tax%", "the sales-tax rate applied after the discount"],
      ],
      note: "Order matters. Tax is charged on the discounted price, not the original — so a coupon lowers the tax too. (A few jurisdictions and certain coupon types tax the pre-discount price; this uses the common case.)",
    },
    terms: [
      ["Discount", "An amount or percentage off the original price."],
      ["Sales tax", "A percentage added at purchase, here applied to the after-discount price."],
      ["List price", "The original price before any markdown."],
    ],
    faqs: [
      ["Is tax applied before or after the discount?", "After, in the usual case — you're taxed on what you actually pay. This calculator discounts first, then taxes."],
      ["Does a coupon reduce the tax too?", "Usually yes, because the tax is on the lower price. Some manufacturer coupons and jurisdictions are exceptions and tax the original price."],
      ["Can I stack multiple discounts?", "This handles a single percentage. For stacked discounts, apply them one at a time — the second comes off the already-reduced price."],
    ],
  },

  date_calc: {
    method: {
      lead: "It converts both dates to a day count and subtracts them, then expresses the gap in weeks and approximate months and business days:",
      expression: "Days = End date − Start date\nWeeks = Days ÷ 7   ·   Months ≈ Days ÷ 30.44   ·   Business days ≈ Days × 5/7",
      where: [
        ["Months", "uses 30.44, the average days per month across a year"],
        ["Business days", "≈ 5/7 of calendar days (weekends removed by ratio, holidays not)"],
      ],
      note: "Months and business days are approximations — real months run 28 to 31 days, and the business-day figure removes weekends by ratio but not public holidays. The day count itself is exact.",
    },
    terms: [
      ["Calendar days", "Every day in the span, weekends and holidays included."],
      ["Business days", "Weekdays only; this estimates them as 5/7 of the total."],
      ["Average month length", "30.44 days, i.e. 365.25 ÷ 12, used for the month estimate."],
    ],
    faqs: [
      ["Is the day count exact?", "Yes — it's a direct difference between the two dates. The weeks, months and business-day figures derived from it are approximations."],
      ["Are holidays removed from business days?", "No — the estimate removes weekends by ratio (5/7) but not public holidays, so the true number of working days may be slightly lower."],
      ["Why is a month 30.44 days here?", "That's the yearly average (365.25 ÷ 12). Using it avoids picking a specific 28–31-day month, at the cost of being approximate for any single month."],
    ],
  },

  unit_conversion: {
    method: {
      lead: "Each category converts through a base unit. Length passes through metres and weight through kilograms — multiply into the base, then divide into the target. Temperature isn't a simple ratio, so it converts via Celsius:",
      expression: "Length/Weight: Result = Value × (base_from ÷ base_to)\nTemperature: convert to Celsius, then to the target scale",
      where: [
        ["base_from / base_to", "each unit's size in the base unit (metres or kilograms)"],
      ],
      note: "Length and weight are linear (a simple ratio), but temperature scales have different zero points — 0 °C isn't 0 °F — so they can't be done by ratio and route through Celsius. Converting between unrelated categories (say metres to kilograms) is rejected rather than silently mishandled.",
    },
    terms: [
      ["Base unit", "The reference each category converts through (metre for length, kilogram for weight)."],
      ["Linear conversion", "A straight multiply-by-ratio, valid for length and weight."],
      ["Temperature offset", "The reason °C↔°F needs addition, not just scaling (freezing is 0 °C = 32 °F)."],
    ],
    faqs: [
      ["Why can't I convert metres to pounds?", "They measure different things (length vs mass), so there's no valid conversion. The calculator flags cross-category conversions instead of returning a meaningless number."],
      ["Why is temperature handled differently?", "Temperature scales have different zero points, so you can't just multiply by a ratio. Converting through Celsius applies the right offset and scaling."],
      ["How precise are the factors?", "It uses standard definitions (1 inch = 0.0254 m exactly, 1 lb = 0.453592 kg). Results are rounded for display but computed at full precision."],
    ],
  },

  margin_markup: {
    method: {
      lead: "Margin and markup describe the same profit against different bases. Margin measures it against the selling price; markup measures it against the cost:",
      expression: "Profit = Price − Cost\nMargin = Profit ÷ Price      Markup = Profit ÷ Cost",
      where: [
        ["Profit", "selling price minus cost"],
      ],
      note: "They're easy to confuse but never equal (except at zero). Because cost is smaller than price, markup is always the larger percentage — a 50% margin is a 100% markup. Quoting one when you mean the other is a common pricing mistake.",
    },
    terms: [
      ["Gross margin", "Profit as a percentage of the selling price."],
      ["Markup", "Profit as a percentage of the cost."],
      ["Cost of goods", "What the item cost you — the base for markup."],
    ],
    faqs: [
      ["What's the difference between margin and markup?", "The base. Margin is profit ÷ price; markup is profit ÷ cost. Same profit, different denominator — so the percentages differ."],
      ["Why is markup always bigger than margin?", "Because cost is less than price, and the smaller denominator yields a larger percentage. A 50% margin equals a 100% markup."],
      ["Which should I use to set prices?", "Markup is handy for pricing up from a known cost; margin is what shows on financial statements. Know which one a supplier or report means before comparing."],
    ],
  },

  business_forecast: {
    method: {
      lead: "It compounds your current revenue forward at a constant annual growth rate, year on year, to project the figure at the end of your forecast horizon:",
      expression: "Revenue in year n = Current revenue × (1 + growth)ⁿ",
      where: [
        ["growth", "the assumed constant annual growth rate"],
        ["n", "the forecast year"],
      ],
      note: "Constant-growth compounding is a clean baseline, but real revenue rarely grows at one steady rate — markets saturate, competition arrives, cycles turn. Treat the projection as one scenario, and test a range of growth rates rather than banking on a single line.",
    },
    terms: [
      ["Compound growth", "Growth applied to a rising base each period, producing an exponential curve."],
      ["Growth rate", "The assumed year-over-year percentage increase."],
      ["Forecast horizon", "How many years out the projection runs."],
    ],
    faqs: [
      ["Is constant growth realistic?", "As a baseline over short horizons, often roughly. Over longer spans growth usually slows as a business matures — so a single high rate can overstate later years."],
      ["What growth rate should I use?", "Base it on recent history and market conditions, and test a low, medium and high case rather than one figure. The compounding makes small rate differences huge over time."],
      ["Does it account for costs or profit?", "No — it projects top-line revenue only. Profit depends on costs and margins, which this doesn't model."],
    ],
  },

  fuel: {
    method: {
      lead: "It works out how much fuel a trip needs from your distance and fuel economy, then multiplies by the price per gallon for the total — and divides back out for the cost per mile:",
      expression: "Gallons = Distance ÷ MPG\nCost = Gallons × Price per gallon      Cost per mile = Cost ÷ Distance",
      where: [
        ["MPG", "miles per gallon — your vehicle's fuel economy"],
      ],
      note: "Real-world economy varies with speed, load, terrain, weather and driving style, so use a realistic MPG — your recent average beats the sticker figure. For an electric vehicle the same logic applies with miles-per-kWh and the price of electricity.",
    },
    terms: [
      ["Fuel economy (MPG)", "Miles travelled per gallon of fuel."],
      ["Cost per mile", "Total fuel cost divided by distance — handy for comparing trips or vehicles."],
      ["Gallons needed", "Distance divided by fuel economy."],
    ],
    faqs: [
      ["What MPG should I enter?", "Your recent real-world average, not the window-sticker rating — actual economy is usually lower, especially in city driving or cold weather."],
      ["Can I use this for a round trip?", "Yes — enter the total distance (both ways). For mixed city/highway driving, use a blended MPG."],
      ["Does it work for electric vehicles?", "Not directly, but the same idea applies: swap MPG for miles-per-kWh and fuel price for the electricity rate to get cost per mile."],
    ],
  },

  net_distribution: {
    method: {
      lead: "To end up with a target amount after tax and fees are taken out, you have to withdraw more than that — this \"grosses up\" the figure by dividing your desired net by the fraction you get to keep:",
      expression: "Required gross = Desired net ÷ (1 − tax% − fees%)",
      where: [
        ["tax% + fees%", "the combined share taken off the top"],
        ["1 − tax% − fees%", "the fraction that actually reaches you"],
      ],
      note: "Grossing up divides rather than adds back, which is why the required gross rises steeply as the deductions approach 100%. Taking 40% off means you must withdraw about 1.67× your target, not 1.4×.",
    },
    terms: [
      ["Gross-up", "Solving for the pre-deduction amount that yields a desired after-deduction figure."],
      ["Net amount", "What you actually receive after tax and fees."],
      ["Withholding", "Tax taken out of a distribution before you receive it."],
    ],
    faqs: [
      ["Why can't I just add the tax back?", "Because the tax is charged on the larger gross amount, not your net. You have to divide by the fraction you keep, which gives a bigger figure than adding the percentage back."],
      ["What's this useful for?", "Sizing a retirement-account withdrawal, bonus, or payout so the after-tax cash hits a specific number."],
      ["Does it use my real tax rate?", "It uses the flat rate you enter. Actual withholding and marginal rates vary, so treat the result as an estimate and confirm with your provider."],
    ],
  },

  balance_sheet: {
    method: {
      lead: "It applies the accounting identity and a few headline ratios. Equity is what's left of assets after liabilities; net income is revenue minus expenses; the ratios then gauge profitability and leverage:",
      expression: "Equity = Assets − Liabilities      Net income = Revenue − Expenses\nNet margin = Net income ÷ Revenue     Return on assets = Net income ÷ Assets",
      where: [
        ["Debt-to-assets", "liabilities ÷ assets — how much of the firm is financed by debt"],
      ],
      note: "This is a snapshot from summary totals, not a full statement analysis. The accounting identity (Assets = Liabilities + Equity) always holds; the ratios are only as meaningful as the figures you feed in, and are best read against prior periods or peers.",
    },
    terms: [
      ["Owners' equity", "Assets minus liabilities — the residual claim of the owners."],
      ["Net margin", "Net income as a percentage of revenue — profitability per dollar of sales."],
      ["Return on assets (ROA)", "Net income relative to total assets — how efficiently assets generate profit."],
      ["Debt-to-assets", "The share of assets funded by liabilities — a leverage gauge."],
    ],
    faqs: [
      ["What is owners' equity?", "What would remain for the owners if all assets were used to pay off all liabilities: Assets − Liabilities. It's the bottom line of the accounting identity."],
      ["Is a high return on assets always good?", "Generally it signals efficient use of assets, but it varies hugely by industry — asset-light businesses show higher ROA than capital-intensive ones, so compare like with like."],
      ["What's a healthy debt-to-assets ratio?", "It depends on the sector. Lower means less leverage and risk; some stable industries carry more debt comfortably. Trend and peer comparison matter more than any single number."],
    ],
  },

  financial_ratios: {
    method: {
      lead: "It computes five staple ratios across the three families analysts watch — liquidity, leverage and profitability — from your balance-sheet and income figures:",
      expression: "Current ratio = Current assets ÷ Current liabilities\nDebt-to-equity = Total debt ÷ Total equity\nROA = Net income ÷ Total assets   ·   ROE = Net income ÷ Total equity   ·   Net margin = Net income ÷ Revenue",
      where: [
        ["Liquidity", "the current ratio — ability to cover short-term bills"],
        ["Leverage", "debt-to-equity — reliance on debt vs owners' capital"],
        ["Profitability", "ROA, ROE and net margin"],
      ],
      note: "Ratios mean little in isolation — their value is in comparison, against the same firm over time or against industry peers. A \"good\" current ratio for a supermarket differs from one for a software firm.",
    },
    terms: [
      ["Current ratio", "Current assets ÷ current liabilities; above 1 means short-term assets cover short-term debts."],
      ["Debt-to-equity", "Total debt relative to shareholders' equity — a core leverage measure."],
      ["Return on equity (ROE)", "Net income as a percentage of equity — the return to owners."],
      ["Net profit margin", "Net income as a percentage of revenue."],
    ],
    faqs: [
      ["What's a good current ratio?", "Often cited as around 1.5–3, but it's industry-specific. Below 1 can signal liquidity strain; very high may mean idle assets. Compare to peers."],
      ["ROA vs ROE — what's the difference?", "ROA measures profit against all assets; ROE against just the owners' equity. Leverage (debt) lifts ROE above ROA, which is why ROE alone can flatter a heavily indebted firm."],
      ["Can I compare these across industries?", "Cautiously. Capital structures and asset intensity vary widely, so a ratio that's strong in one sector can be weak in another. Same-sector and over-time comparisons are the most reliable."],
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
      note: "HPR is the return for the <em>whole</em> period, not per year. To compare holdings of different lengths, annualize it or use the <a href=\"/calc/roi/\">ROI calculator</a>'s CAGR.",
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

  stock_return: {
    method: {
      lead: "It totals what you got back against what you put in. Cost basis is the purchase price plus fees; total return adds the capital gain and any dividends; the annualized figure converts that to a compound yearly rate:",
      expression: "Total return = (Sale − Cost basis) + Dividends\nAnnualized = ((Proceeds + Dividends) / Cost basis)^(1/years) − 1",
      where: [
        ["Cost basis", "purchase price × shares + fees"],
        ["Proceeds", "sale price × shares"],
      ],
      note: "Total return counts both price gain and income, which is the honest measure. The annualized (compound) rate lets you compare holdings of different lengths — a 30% gain over three years is about 9% a year, not 10%.",
    },
    terms: [
      ["Cost basis", "Total amount invested, including commissions — the base for gain and tax."],
      ["Capital gain", "Sale proceeds minus cost basis, before dividends."],
      ["Total return", "Capital gain plus dividends — the complete result."],
      ["Annualized return", "The equivalent steady yearly compound rate."],
    ],
    faqs: [
      ["Why include dividends?", "Because they're part of what you earned. Leaving them out understates the return, especially for income stocks held a long time."],
      ["Total return or annualized — which matters?", "Total return is the raw dollars and percent. Annualized restates it per year, so you can compare investments held for different lengths of time."],
      ["Does it handle taxes?", "No — it's a pre-tax result. Capital gains and dividends are usually taxable, at a rate that depends on your bracket and how long you held."],
    ],
  },

  stock_constant_growth: {
    method: {
      lead: "This is the Gordon Growth (dividend discount) model: a stock whose dividend grows at a steady rate forever is worth next year's dividend divided by the gap between your required return and that growth rate:",
      expression: "Value = D₁ / (r − g)     where D₁ = D₀·(1 + g)",
      where: [
        ["D₀ / D₁", "this year's and next year's annual dividend"],
        ["g", "the constant dividend growth rate"],
        ["r", "your required rate of return"],
      ],
      note: "The model only works when r > g — otherwise the value is infinite or negative, which is why the calculator requires it. It's exquisitely sensitive near r ≈ g: a small change in either assumption swings the value hugely, so treat the output as a scenario, not a price.",
    },
    terms: [
      ["Dividend discount model", "Valuing a stock as the present value of its future dividends."],
      ["Gordon Growth Model", "The constant-growth version — value = D₁ ÷ (r − g)."],
      ["Required return (r)", "The annual return you demand to hold the stock."],
      ["Constant growth (g)", "The assumed perpetual dividend growth rate."],
    ],
    faqs: [
      ["Why must the required return exceed the growth rate?", "If dividends grew as fast as (or faster than) your discount rate forever, their present value wouldn't converge — the formula would return an infinite or negative value. Perpetual growth above the discount rate isn't realistic."],
      ["Why is the value so sensitive to the inputs?", "Because it divides by the small gap (r − g). When r and g are close, tiny changes in either produce large swings in value — a key caution with this model."],
      ["What stocks does it suit?", "Mature, steady dividend payers whose growth is plausibly stable. It fits fast-growing or non-dividend stocks poorly; a two-stage model (the <a href=\"/calc/stock_nonconstant_growth/\">non-constant growth calculator</a>) handles a high-growth phase."],
    ],
  },

  stock_nonconstant_growth: {
    method: {
      lead: "A two-stage dividend discount model. It discounts each dividend through an explicit high-growth phase, then values everything after as a Gordon-growth \"terminal value\" and discounts that lump back too:",
      expression: "Value = Σ Dₜ/(1 + r)ᵗ  (high-growth years)  +  Terminal ÷ (1 + r)ⁿ\nTerminal = D₍ₙ₊₁₎ / (r − g_stable)",
      where: [
        ["Dₜ", "the dividend in year t of the high-growth phase"],
        ["r, g_stable", "the required return and the perpetual growth rate after the high-growth years"],
        ["n", "the number of high-growth years"],
      ],
      note: "This suits companies expected to grow fast for a while, then settle to a steady mature rate — a better fit than single-stage growth for young firms. As with any dividend model it needs r > stable g, and the terminal value (often most of the total) is very sensitive to that stable-growth assumption.",
    },
    terms: [
      ["Two-stage DDM", "A dividend model with an explicit high-growth phase followed by stable perpetual growth."],
      ["Terminal value", "The value, at the end of the high-growth phase, of all dividends thereafter."],
      ["Required return (r)", "The annual return you demand to hold the stock."],
      ["Present value", "Future dividends and the terminal value discounted to today."],
    ],
    faqs: [
      ["When is a two-stage model better than constant growth?", "When a company is growing quickly now but will plausibly slow to a mature rate later — most young or fast-growing firms. Constant growth can't capture that transition."],
      ["Why does the terminal value dominate?", "It captures every dividend beyond the explicit years, so it's often the majority of the total — which also makes the result very sensitive to the stable-growth and required-return assumptions."],
      ["What if the company pays no dividend?", "Dividend models fit poorly. For non-payers, analysts often use discounted free cash flow or valuation multiples instead."],
    ],
  },

  expected_return: {
    method: {
      lead: "It combines three scenarios into a probability-weighted average return, then measures the spread around that average — the standard deviation — as a proxy for risk:",
      expression: "Expected return = Σ (probability × return)\nVariance = Σ probability × (return − expected)²   ·   Risk = √Variance",
      where: [
        ["probability", "each scenario's likelihood (should total 100%)"],
        ["return", "the outcome in each scenario"],
      ],
      note: "Expected return is the mean outcome, not the most likely one, and standard deviation treats upside and downside swings equally. For the figures to be valid the probabilities should sum to 100% — the calculator warns when they don't.",
    },
    terms: [
      ["Expected return", "The probability-weighted average of all scenario returns."],
      ["Variance / standard deviation", "How far outcomes spread from the average — a common risk measure."],
      ["Probability distribution", "The set of outcomes and their likelihoods."],
    ],
    faqs: [
      ["Is the expected return the most likely outcome?", "No — it's the weighted average across scenarios. The actual result will be one of the scenarios; the expected value may not equal any single one of them."],
      ["Why measure standard deviation?", "It quantifies risk as the spread of outcomes. Two investments with the same expected return can have very different standard deviations — the higher one is riskier."],
      ["Do the probabilities have to add to 100%?", "Yes, for the math to be valid. If they don't, the weighted average is distorted; the calculator flags a total that isn't 100%."],
    ],
  },

  black_scholes: {
    method: {
      lead: "The Black-Scholes model prices a European option from five inputs — the stock and strike prices, time to expiry, the risk-free rate and volatility — by weighing the odds the option finishes in the money against the discounted cost of exercising:",
      expression: "Call = S·N(d₁) − K·e^(−rT)·N(d₂)     (put by symmetry)\nd₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T),   d₂ = d₁ − σ√T",
      where: [
        ["S, K", "the stock (spot) and strike prices"],
        ["T, r, σ", "time to expiry in years, the risk-free rate, and volatility"],
        ["N()", "the standard normal cumulative distribution"],
      ],
      note: "It assumes European exercise (only at expiry), no dividends, and constant volatility — simplifications real markets break. Volatility is the one input you can't observe directly and the one the price is most sensitive to; the model splits the premium into intrinsic value and time value.",
    },
    terms: [
      ["Call / put", "The right to buy (call) or sell (put) at the strike price."],
      ["Strike price (K)", "The price at which the option can be exercised."],
      ["Volatility (σ)", "How much the stock's returns swing — the key, unobservable input."],
      ["Intrinsic vs time value", "Intrinsic is the in-the-money amount now; time value is the rest of the premium."],
    ],
    faqs: [
      ["What is volatility and why does it matter so much?", "It's the expected variability of the stock's returns. Higher volatility raises both call and put prices because it widens the range of favourable outcomes — and it's the input the price is most sensitive to."],
      ["Does this handle American options or dividends?", "No — it's the plain European, no-dividend model. American options (exercisable any time) and dividend-payers need adjusted models."],
      ["What's the difference between intrinsic and time value?", "Intrinsic value is what the option is worth if exercised now; time value is the extra premium for the chance it moves further in your favour before expiry. They sum to the option price."],
    ],
  },

  pivot_points: {
    method: {
      lead: "Pivot points project intraday support and resistance from the prior session's high, low and close. The central pivot is their average, and the support/resistance levels step out from it using the prior range:",
      expression: "P = (High + Low + Close) ÷ 3\nR1 = 2P − Low,  S1 = 2P − High\nR2 = P + (High − Low),  S2 = P − (High − Low)",
      where: [
        ["High, Low, Close", "the previous period's price extremes and closing price"],
        ["R1–R3 / S1–S3", "successive resistance and support levels"],
      ],
      note: "These are a mechanical charting tool, not a forecast — they mark price levels some traders watch, which can become self-fulfilling. They say nothing about direction, and work best combined with other signals rather than in isolation.",
    },
    terms: [
      ["Pivot point (P)", "The average of the prior high, low and close — the central reference level."],
      ["Support / resistance", "Price levels where declines or advances have tended to stall."],
      ["Intraday", "Within a single trading day, the usual timeframe for standard pivots."],
    ],
    faqs: [
      ["What are pivot points used for?", "Day traders use them to mark potential intraday turning points — levels where price might find support or resistance — and to set entries, targets or stops around them."],
      ["Do they predict price?", "No — they're derived purely from the prior session's numbers. Any tendency for price to react at them is partly because many traders watch the same levels."],
      ["Which inputs do I use?", "The previous period's high, low and close (usually the prior day for intraday trading). This uses the standard formula; variants (Fibonacci, Camarilla, Woodie) weight them differently."],
    ],
  },

  fibonacci: {
    method: {
      lead: "It marks the classic Fibonacci retracement levels across a price swing. Each level is a fraction of the high-to-low range measured back from the extreme, in the direction a pullback would move:",
      expression: "Level price (uptrend) = High − (High − Low) × ratio\nRatios: 23.6%, 38.2%, 50%, 61.8%, 78.6%",
      where: [
        ["High, Low", "the swing's extremes"],
        ["ratio", "the Fibonacci retracement fraction"],
      ],
      note: "The key ratios (notably 61.8%, the \"golden ratio\") come from the Fibonacci sequence; 50% is included by convention though it isn't a Fibonacci number. These are levels some traders watch for a pullback to pause or reverse — a charting aid, not a prediction.",
    },
    terms: [
      ["Retracement", "A temporary counter-move within a larger trend."],
      ["Fibonacci ratios", "23.6%, 38.2%, 61.8% (and 78.6%) — derived from the Fibonacci sequence."],
      ["Golden ratio", "~61.8%, the most watched Fibonacci retracement level."],
      ["Swing high / low", "The extremes of the price move being measured."],
    ],
    faqs: [
      ["Where do the ratios come from?", "From the Fibonacci sequence: dividing terms gives ~61.8%, ~38.2%, and so on. 50% isn't a true Fibonacci ratio but is included by long-standing convention."],
      ["Do prices really respect these levels?", "Sometimes price pauses or reverses near them, but there's no guarantee. Their influence is partly self-fulfilling because so many traders plot the same lines."],
      ["Uptrend vs downtrend — what changes?", "The direction the retracement is measured. In an uptrend levels are measured down from the high; in a downtrend, up from the low."],
    ],
  },

  dividend_tax: {
    method: {
      lead: "It taxes your two kinds of dividends differently. Qualified dividends get the lower long-term capital-gains rate tied to your bracket; ordinary (non-qualified) dividends are taxed at your full income rate:",
      expression: "Tax = Qualified × qualified rate + Ordinary × income rate\nQualified rate: 0% (10–12% brackets), 15% (22–35%), 20% (37%)",
      where: [
        ["Qualified rate", "the long-term capital-gains rate for your bracket"],
        ["income rate", "your ordinary marginal bracket, applied to non-qualified dividends"],
      ],
      note: "Qualifying requires the payer and a holding-period test to be met; otherwise a dividend is ordinary. This maps brackets to the 0/15/20% capital-gains rates and ignores the additional 3.8% net investment income tax on higher earners.",
    },
    terms: [
      ["Qualified dividend", "A dividend meeting IRS holding-period and payer rules, taxed at capital-gains rates."],
      ["Ordinary (non-qualified) dividend", "Taxed at your regular income rate."],
      ["Long-term capital-gains rates", "The 0%, 15% and 20% tiers qualified dividends use."],
      ["Holding period", "The minimum time you must own the shares for a dividend to qualify."],
    ],
    faqs: [
      ["What makes a dividend 'qualified'?", "It must be paid by a US or qualifying foreign corporation and you must hold the shares long enough (generally more than 60 days around the ex-dividend date). If not, it's taxed as ordinary income."],
      ["Why are qualified dividends taxed less?", "They get the same preferential 0/15/20% rates as long-term capital gains, to encourage longer-term investing. Ordinary dividends get no such break."],
      ["Is there any extra tax?", "Higher earners may owe an additional 3.8% net investment income tax on dividends, which this calculator doesn't include."],
    ],
  },

  commodities_futures: {
    method: {
      lead: "Futures profit is the price move in your favour, scaled by the contract's point value and the number of contracts. Going long you profit when price rises; going short, when it falls:",
      expression: "P/L = Price move × Value per point × Contracts\nPrice move = Exit − Entry (long)  or  Entry − Exit (short)",
      where: [
        ["Value per point", "the dollar value of a one-point move in one contract"],
        ["Contracts", "how many you hold"],
      ],
      note: "Futures are leveraged — you control a large contract value for a small margin deposit, so both gains and losses are magnified relative to the cash you put up. This is gross P/L before commissions, exchange fees and any overnight financing.",
    },
    terms: [
      ["Futures contract", "An agreement to buy or sell an asset at a set price on a future date."],
      ["Long / short", "A position that profits from a rising (long) or falling (short) price."],
      ["Point value / tick value", "The money one unit of price movement is worth per contract."],
      ["Leverage", "Controlling a large contract value with a small margin deposit."],
    ],
    faqs: [
      ["How is futures profit calculated?", "The price move times the contract's value-per-point times the number of contracts — with the move sign flipped for short positions."],
      ["Why are futures considered risky?", "Leverage. A small margin controls a large notional value, so a modest price move is a large percentage gain or loss on your deposit — and losses can exceed the margin."],
      ["Does this include fees?", "No — it's gross profit or loss. Commissions, exchange fees and financing costs reduce the net, so factor them in separately."],
    ],
  },
};
