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
      ["Does it reinvest the income?", "No — it assumes you take the income as cash. To compound reinvested income, use the <a href=\"/calc/compound\">compound interest calculator</a>."],
      ["Is the income taxable?", "Usually yes — interest and non-qualified dividends are generally taxed as income. This shows the pre-tax figure."],
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
