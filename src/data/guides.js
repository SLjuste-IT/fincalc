// ============================================================================
// Per-calculator explanatory content — the editorial layer competitors have and
// KakouCalc did not. Each guide gives a crawler (and a reader) something to rank
// beyond a title and a form: what the tool is, the formula behind it, a worked
// example, the vocabulary, and the questions people actually ask.
//
// DELIBERATELY NOT all 77 at once. Financial calculators are YMYL, where Google's
// scaled-content-abuse policy is pattern-based (volume + thin depth + no review).
// The safe, effective play is depth on the highest-traffic calculators first,
// each reviewed for accuracy before shipping, then expansion in reviewed batches.
// A calculator with no entry here simply renders without the guide section.
//
// ACCURACY CONTRACT: every figure quoted in a `example` is produced by this
// project's own engine (src/lib/calculators.js) on the stated inputs, and is
// re-checked by the "published guide examples" block in scripts/verify-math.mjs.
// If a formula ever changes, that test fails loudly rather than letting the prose
// quietly start lying. Do not hand-edit an example figure — regenerate it.
//
// Strings may contain inline <a>/<strong>; the content is authored here, not user
// input, so it renders through set:html safely.
// ============================================================================

// Bumped when the copy is reviewed for accuracy. Surfaced on the page as an
// E-E-A-T signal — the "who checked this and when" that money-topic pages need.
export const GUIDES_REVIEWED = "20 July 2026";

export const GUIDES = {
  /* ------------------------------------------------------------------ Loans */
  loan_basic: {
    intro:
      "A loan calculator turns a loan's three defining numbers — the amount you borrow (the <strong>principal</strong>), the annual interest rate, and the term — into the fixed periodic payment that clears it, plus the total interest you'll pay along the way. The same math drives any fully amortizing installment loan, so personal loans, student loans, car loans and mortgages all run through this one formula.",
    formula: {
      lead: "Each payment is the level amount that pays the loan to exactly zero over its term (the standard amortization formula):",
      expression: "M = P · r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)",
      where: [
        ["M", "payment per period"],
        ["P", "principal — the amount borrowed"],
        ["r", "periodic interest rate = annual rate ÷ payments per year"],
        ["n", "total number of payments = years × payments per year"],
      ],
      note: "When the rate is 0%, this collapses to simply P ÷ n.",
    },
    example: {
      scenario:
        "Borrow <strong>$25,000</strong> at <strong>7%</strong> annual interest over <strong>5 years</strong>, paid monthly. Here r = 0.07 ÷ 12 and n = 60.",
      result:
        "The monthly payment works out to <strong>$495.03</strong>. Across all 60 payments you repay <strong>$29,701.80</strong>, of which <strong>$4,701.80</strong> is interest.",
    },
    terms: [
      ["Principal", "The amount you originally borrow, before any interest."],
      ["Term", "How long you have to repay the loan, usually in years or months."],
      ["Amortization", "Paying a loan off in equal installments, each part interest and part principal."],
      ["Total interest", "The sum of every interest charge over the life of the loan — the true cost of borrowing."],
    ],
    faqs: [
      ["Does a shorter term save money?", "Yes. A shorter term raises the monthly payment but sharply cuts total interest, because you're borrowing the money for less time."],
      ["What's the difference between the interest rate and the APR?", "The interest rate prices the loan itself; the <a href=\"/calc/apr\">APR</a> also folds in fees to show the true annual cost. Compare offers by APR, not headline rate."],
      ["Do extra payments help?", "A lot. Every extra dollar goes straight to principal, shrinking the balance that future interest is charged on. The <a href=\"/calc/loan_analysis\">Loan Analysis calculator</a> shows the effect."],
    ],
    related: ["apr", "loan_analysis", "auto_loan", "home_afford"],
  },

  apr: {
    intro:
      "APR (Annual Percentage Rate) expresses the <strong>true yearly cost</strong> of a loan by folding upfront fees into the rate. Two loans can share the same headline interest rate yet cost very different amounts once origination fees and points are counted — APR is the number that makes them comparable, which is why U.S. lenders are legally required to disclose it.",
    formula: {
      lead: "APR is the rate that makes the present value of the actual payments equal the cash you actually receive (loan minus fees). There is no closed form — it's solved numerically:",
      expression: "Net proceeds = Σ  Payment ÷ (1 + APR/12)ᵏ   for k = 1…n",
      where: [
        ["Payment", "the monthly payment implied by the stated rate"],
        ["Net proceeds", "loan amount − fees (what actually reaches you)"],
        ["n", "number of monthly payments"],
        ["APR", "the rate that balances the equation"],
      ],
      note: "Because you receive less than the face amount but repay on the full amount, the APR always lands above the stated rate whenever fees exist.",
    },
    example: {
      scenario:
        "A <strong>$300,000</strong> mortgage at a <strong>6.5%</strong> stated rate over <strong>30 years</strong>, with <strong>$6,000</strong> in fees.",
      result:
        "The monthly payment (set by the stated rate) is <strong>$1,896.20</strong>, but because you only net $294,000 after fees, the effective <strong>APR is 6.70%</strong> — meaningfully above the 6.5% sticker.",
    },
    terms: [
      ["APR", "The yearly cost of a loan including fees, expressed as a percentage."],
      ["Stated (nominal) rate", "The headline interest rate before any fees are considered."],
      ["Points", "Optional upfront fees paid to lower the interest rate; 1 point = 1% of the loan."],
      ["Origination fee", "A charge the lender adds for processing the loan."],
      ["Present value", "What a future stream of payments is worth today at a given discount rate."],
    ],
    faqs: [
      ["Why is APR higher than the interest rate?", "Because it counts fees. A loan with no fees has an APR equal to its interest rate; every fee pushes the APR above it."],
      ["Is the lowest APR always the best deal?", "Usually — but APR assumes you keep the loan for its full term. If you'll refinance or move soon, a lower-fee loan with a slightly higher rate can cost less in practice."],
      ["Does APR include everything?", "It includes finance charges like points and origination fees, but not always every third-party cost (appraisal, title). Always read the official loan estimate."],
    ],
    related: ["apr_advanced", "loan_basic", "discount_points", "loan_refi"],
  },

  home_afford: {
    intro:
      "A home affordability calculator estimates the most expensive home you can responsibly buy from your income, existing debts, down payment and the mortgage rate. It works backward from a <strong>debt-to-income (DTI)</strong> limit — the share of your income lenders let you spend on debt — to a maximum loan, then a maximum price.",
    formula: {
      lead: "The chain runs from your income down to a price ceiling:",
      expression: "Max price = PV(max housing payment, rate, term) + Down payment",
      where: [
        ["Max total debt", "monthly income × DTI limit"],
        ["Max housing payment", "max total debt − other monthly debts"],
        ["Max loan", "present value of that payment at the mortgage rate and term"],
        ["Max price", "max loan + down payment"],
      ],
      note: "The estimate covers loan principal and interest — not property tax, insurance or HOA dues, which eat into the same budget.",
    },
    example: {
      scenario:
        "A <strong>$90,000</strong> income ($7,500/month), <strong>$500</strong> in other monthly debts, <strong>$40,000</strong> saved, at a <strong>6.5%</strong> rate over 30 years, using a <strong>36%</strong> DTI limit.",
      result:
        "That leaves <strong>$2,200</strong> a month for housing, which supports a loan of about <strong>$348,064</strong>. Add the down payment and the maximum home price is roughly <strong>$388,064</strong>.",
    },
    terms: [
      ["Debt-to-income ratio (DTI)", "The percentage of your gross monthly income that goes to debt payments."],
      ["Down payment", "Cash you pay upfront; it lifts your price ceiling dollar for dollar."],
      ["Gross income", "Income before taxes and deductions — the figure lenders use for DTI."],
      ["Back-end DTI", "DTI counting all debts (housing plus car, cards, student loans)."],
    ],
    faqs: [
      ["What DTI should I use?", "36% is a common conservative back-end limit. Some programs allow 43% or higher, but a higher DTI means a tighter monthly budget."],
      ["Does this include taxes and insurance?", "No — it covers principal and interest. Property taxes, homeowners insurance and HOA dues reduce what you can truly afford, so budget for them separately."],
      ["Is the maximum the amount I should spend?", "Treat it as a ceiling, not a target. Borrowing below your maximum leaves room for savings, maintenance and surprises."],
    ],
    related: ["loan_basic", "rent_vs_buy", "mortgage_tax", "discount_points"],
  },

  /* ------------------------------------------------ Finance & Investment */
  compound: {
    intro:
      "Compound interest is interest earning interest. This calculator projects how a starting balance — plus any regular contributions — grows when returns are reinvested period after period. It's the engine behind savings accounts, retirement funds and long-term investing, and the reason starting <em>early</em> matters more than starting <em>big</em>.",
    formula: {
      lead: "Future value combines a growing lump sum with a growing stream of contributions:",
      expression: "FV = P(1 + r)ⁿ + C · ((1 + r)ⁿ − 1) ÷ r",
      where: [
        ["P", "initial principal"],
        ["C", "contribution added each period"],
        ["r", "periodic rate = annual rate ÷ compounding periods per year"],
        ["n", "total periods = years × periods per year"],
      ],
      note: "The first term grows what you start with; the second grows everything you add along the way.",
    },
    example: {
      scenario:
        "Start with <strong>$10,000</strong>, add <strong>$200</strong> every month, and earn <strong>7%</strong> a year compounded monthly for <strong>20 years</strong>.",
      result:
        "The balance grows to <strong>$144,572.72</strong>. You contributed <strong>$58,000</strong> of that — the other <strong>$86,572.72</strong> is compound interest, more than the money you put in.",
    },
    terms: [
      ["Compounding frequency", "How often interest is added back to the balance — annually, monthly, daily."],
      ["Principal", "The initial amount you invest before any growth."],
      ["Contribution", "Money you add on a regular schedule, which itself starts compounding."],
      ["Future value", "What the balance is projected to be worth at the end of the term."],
    ],
    faqs: [
      ["Does compounding frequency matter?", "More frequent compounding earns slightly more, but the effect is small next to the rate and the time horizon."],
      ["Why does time matter so much?", "Growth is exponential, so the earliest dollars do the most work. Ten years of a head start usually beats a larger contribution later."],
      ["Is the result guaranteed?", "No. A fixed rate is an assumption; real investment returns vary year to year. Treat the figure as a projection, not a promise."],
    ],
    related: ["roi", "savings_goal", "401k_contribution", "cd"],
  },

  roi: {
    intro:
      "Return on investment (ROI) measures how much an investment gained or lost relative to what it cost. This calculator reports both the <strong>total ROI</strong> over the whole holding period and the <strong>annualized</strong> return (CAGR) — which lets you compare investments held for different lengths of time on equal footing.",
    formula: {
      lead: "Two views of the same investment:",
      expression: "Total ROI = (Final − Initial) ÷ Initial × 100\nCAGR = ((Final ÷ Initial)^(1/years) − 1) × 100",
      where: [
        ["Initial", "what you originally put in"],
        ["Final", "what the investment is worth at the end"],
        ["years", "how long you held it"],
      ],
      note: "Total ROI answers \"how much did it grow?\"; CAGR answers \"at what steady yearly rate?\"",
    },
    example: {
      scenario:
        "Invest <strong>$10,000</strong> and it grows to <strong>$18,000</strong> after <strong>5 years</strong>.",
      result:
        "The net gain is <strong>$8,000</strong>, a total ROI of <strong>80%</strong>. Spread across 5 years, that's a compound annual growth rate of <strong>12.47%</strong> — the steady yearly return that produces the same result.",
    },
    terms: [
      ["ROI", "The total percentage gain or loss on an investment relative to its cost."],
      ["CAGR", "Compound annual growth rate — the equivalent smooth yearly return."],
      ["Holding period", "How long the investment was held, start to finish."],
      ["Net gain", "Final value minus initial investment, in dollars."],
    ],
    faqs: [
      ["Why report both ROI and CAGR?", "An 80% total return sounds large, but over 5 years it's 12.47% a year. CAGR stops long holding periods from flattering an investment."],
      ["Does ROI account for risk, fees or taxes?", "No. Basic ROI ignores volatility, fees and taxes — subtract those separately for a true picture."],
      ["Can ROI be negative?", "Yes. If the final value is below what you invested, both ROI and CAGR are negative."],
    ],
    related: ["compound", "holding_period_return", "stock_return", "irr_npv"],
  },

  /* --------------------------------------------------------- Retirement */
  "401k_contribution": {
    intro:
      "A 401(k) is an employer-sponsored retirement account, often with a company <strong>match</strong> — money your employer adds on top of what you contribute. This calculator projects your balance at retirement from your salary, contribution rate, the employer match and your expected investment return, and highlights how much of the result is free match money.",
    formula: {
      lead: "Your current balance and each year's total contribution both compound to retirement:",
      expression: "FV = B(1 + r)ⁿ + C · ((1 + r)ⁿ − 1) ÷ r",
      where: [
        ["B", "current 401(k) balance"],
        ["C", "annual contribution = your amount + employer match"],
        ["Employer match", "salary × min(your %, match limit) × match rate"],
        ["r, n", "annual return, and years to retirement"],
      ],
      note: "The match is the highest-return money in the whole calculation — it's an instant gain before any market growth.",
    },
    example: {
      scenario:
        "On a <strong>$70,000</strong> salary, contributing <strong>6%</strong> with a <strong>50%</strong> match up to 6% of salary, starting from a <strong>$20,000</strong> balance, at a <strong>7%</strong> return for <strong>30 years</strong>.",
      result:
        "You add <strong>$4,200</strong> a year and your employer adds <strong>$2,100</strong> — <strong>$6,300</strong> total. After 30 years the account is projected to reach <strong>$747,348</strong>, with <strong>$63,000</strong> of that coming from the match before growth.",
    },
    terms: [
      ["Employer match", "Money your employer contributes based on what you put in — effectively free money."],
      ["Match limit", "The cap on how much of your salary the employer will match, e.g. up to 6%."],
      ["Vesting", "How long you must stay before employer contributions are fully yours to keep."],
      ["Expected return", "The average annual growth you assume for the account's investments."],
    ],
    faqs: [
      ["Should I always contribute enough to get the full match?", "Almost always — passing up a match is turning down a guaranteed 50–100% return on that money."],
      ["What return should I assume?", "Long-run diversified stock returns have historically averaged roughly 7% after inflation, but the future isn't guaranteed. Try a lower rate to stress-test the plan."],
      ["Are there contribution limits?", "Yes. The IRS caps annual 401(k) contributions and adjusts the limit yearly, so check the current figure."],
    ],
    related: ["401k_max", "retirement_planner", "ira", "compound"],
  },

  /* --------------------------------------------------------- Credit Card */
  cc_payoff: {
    intro:
      "A credit card payoff calculator shows how long it takes to clear a balance at a fixed monthly payment, and how much interest you'll pay getting there. Because card APRs are high and interest compounds monthly, the payoff time is extremely sensitive to how far <strong>above the minimum</strong> you pay.",
    formula: {
      lead: "Months to clear a balance at a fixed payment:",
      expression: "n = − ln(1 − B·r ÷ M) ÷ ln(1 + r)",
      where: [
        ["B", "current balance"],
        ["M", "fixed monthly payment"],
        ["r", "monthly rate = APR ÷ 12"],
        ["n", "months to reach a zero balance"],
      ],
      note: "If the payment M is not greater than the monthly interest (B·r), the balance never falls — payoff time is infinite, and the calculator flags it.",
    },
    example: {
      scenario:
        "A <strong>$6,000</strong> balance at <strong>22%</strong> APR, paying <strong>$250</strong> a month.",
      result:
        "It takes <strong>31.9 months</strong> — about 2.7 years — to clear, and you pay <strong>$1,978.87</strong> in interest, for <strong>$7,978.87</strong> total. Raising the payment shortens this dramatically.",
    },
    terms: [
      ["APR", "The card's annual percentage rate; divided by 12 it gives the monthly rate."],
      ["Minimum payment", "The smallest amount the issuer will accept — set low, so it stretches payoff for years."],
      ["Revolving balance", "The amount carried month to month, on which interest keeps accruing."],
      ["Compounding", "Interest charged on interest already added to the balance."],
    ],
    faqs: [
      ["Why does paying only the minimum cost so much?", "Minimums are set low, so most of each one covers interest and the balance barely moves. The <a href=\"/calc/cc_minimum\">Credit Card Minimum calculator</a> shows just how long it drags on."],
      ["Does a higher payment really help that much?", "Yes. Interest is charged on the remaining balance, so paying it down faster compounds in your favor."],
      ["What if my payment is too low?", "If it doesn't exceed the monthly interest, the balance grows instead of shrinking. Raising the payment is the only fix."],
    ],
    related: ["cc_minimum", "loan_basic", "apr", "effective_rate"],
  },

  /* -------------------------------------------------------------- Auto */
  auto_loan: {
    intro:
      "An auto loan calculator estimates the monthly payment and total cost of financing a vehicle. Unlike a plain loan calculator it accounts for the <strong>down payment</strong>, a <strong>trade-in</strong>, and <strong>sales tax</strong> on the purchase — the pieces that decide how much you actually finance.",
    formula: {
      lead: "Find the amount financed, then apply the standard loan payment formula:",
      expression: "Amount financed = Price + Sales tax − Down payment − Trade-in\nM = A · r(1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)",
      where: [
        ["A", "amount financed"],
        ["r", "monthly rate = annual rate ÷ 12"],
        ["n", "number of monthly payments (the term in months)"],
      ],
      note: "In most U.S. states sales tax is charged on the price after the trade-in credit, which lowers the tax.",
    },
    example: {
      scenario:
        "A <strong>$35,000</strong> car with <strong>$5,000</strong> down, no trade-in, <strong>6%</strong> sales tax, financed at <strong>6.5%</strong> over <strong>60 months</strong>.",
      result:
        "Tax is $2,100, so the amount financed is <strong>$32,100</strong>. The monthly payment is <strong>$628.07</strong>, total interest is <strong>$5,584.40</strong>, and the all-in cost is <strong>$42,684.40</strong>.",
    },
    terms: [
      ["Amount financed", "The loan balance after down payment, trade-in and tax are applied."],
      ["Trade-in", "The value your old vehicle knocks off the price (and often the taxable amount)."],
      ["Negative equity", "Owing more on the loan than the car is worth — common early in long terms."],
      ["Term", "Loan length in months; longer terms lower the payment but raise total interest."],
    ],
    faqs: [
      ["Does a longer term lower the payment?", "Yes, but it raises total interest and keeps you underwater — owing more than the car is worth — for longer."],
      ["Should I put more down?", "A larger down payment lowers both the payment and total interest, and reduces the risk of negative equity."],
      ["Is sales tax charged on the trade-in?", "In most U.S. states tax applies to the price minus the trade-in value, which lowers it — but rules vary by state."],
    ],
    related: ["auto_lease", "loan_basic", "apr", "loan_compare"],
  },
};
