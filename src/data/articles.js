// ============================================================================
// Blog / informational articles — top-of-funnel content that catches the
// QUESTION behind a search ("how much house can I afford?") and funnels the
// reader into the calculator that answers it. Distinct from the per-calculator
// guides (src/data/guides.js): guides explain the tool a visitor already opened;
// these articles capture the informational query and route it to the tool.
//
// Same depth-first discipline as the guides: money topics are YMYL, so this is a
// handful of genuinely useful, reviewed articles — NOT bulk-generated volume,
// which Google's scaled-content-abuse policy targets. Expand in reviewed batches.
// Each `calc`/`related` id is resolved through CALC_INDEX at render time, so a
// renamed calculator can never leave a dead link in an article.
//
// Strings carry inline <a>/<strong>; authored here (not user input), rendered via
// set:html.
// ============================================================================

export const ARTICLES_REVIEWED = "20 July 2026";

export const ARTICLES = {
  "how-much-house-can-i-afford": {
    title: "How much house can I afford?",
    description:
      "A clear framework for the home price you can truly afford — the 28/36 rule, what lenders check, the costs beyond the mortgage, and how to run your own numbers.",
    published: "2026-07-20",
    updated: "2026-07-20",
    calc: "home_afford",
    related: ["home_afford", "loan_basic", "rent_vs_buy", "mortgage_tax"],
    intro:
      "The honest answer is: it depends — on your income, your existing debts, your down payment, and the interest rate. But there's a simple framework lenders use, and once you know it you can estimate your number in a couple of minutes.",
    sections: [
      {
        h: "The 28/36 rule",
        body:
          "<p>Most lenders size a mortgage against two ratios. The <strong>front-end ratio</strong> says your total monthly housing payment shouldn't exceed about <strong>28%</strong> of your gross (pre-tax) monthly income. The <strong>back-end ratio</strong> — your debt-to-income, or DTI — says <em>all</em> your monthly debt payments together (housing plus car loans, student loans, credit-card minimums) shouldn't exceed about <strong>36%</strong>.</p><p>Some loan programs stretch the back-end limit to 43% or higher, but a higher ratio means a tighter monthly budget and less cushion for surprises.</p>",
      },
      {
        h: "What lenders actually look at",
        body:
          "<p>Beyond those ratios, four things move the number: your <strong>gross income</strong>, your <strong>other monthly debts</strong> (they eat directly into what's left for housing), your <strong>down payment</strong> (it lifts your price ceiling dollar-for-dollar and can remove mortgage insurance at 20%), and the <strong>interest rate</strong> (a one-point rate change can swing your buying power by tens of thousands of dollars).</p>",
      },
      {
        h: "Don't forget the costs beyond the mortgage",
        body:
          "<p>Principal and interest are only part of the monthly cost. Budget for <strong>property taxes</strong>, <strong>homeowners insurance</strong>, <strong>PMI</strong> (if you put down less than 20%), <strong>HOA dues</strong>, and ongoing <strong>maintenance</strong> — a common rule of thumb sets aside 1% of the home's value per year. These are why the maximum a lender approves is usually more than you should actually spend.</p>",
      },
      {
        h: "Estimate your number",
        body:
          "<p>Put your figures into the <a href=\"/calc/home_afford\">Home Affordability Calculator</a>: it works backward from a DTI limit to a maximum loan and price. As an example, a $90,000 income with $500 of other monthly debts, $40,000 saved, a 6.5% rate and a 36% DTI supports a home price of roughly <strong>$388,000</strong>. Then pressure-test it with the <a href=\"/calc/loan_basic\">Loan Calculator</a> to see the real monthly payment, and — if you're not sure buying is right — the <a href=\"/calc/rent_vs_buy\">Rent vs Buy Calculator</a>.</p>",
      },
    ],
    faqs: [
      ["What percentage of income should go to a mortgage?", "A common guideline is no more than 28% of gross monthly income on housing, and no more than 36% on total debt. Lower is safer."],
      ["How much down payment do I need?", "20% avoids private mortgage insurance and lowers your payment, but many loans allow far less down. A bigger down payment raises your price ceiling and cuts total interest."],
      ["Should I borrow the maximum I'm approved for?", "Rarely. The approved maximum is a ceiling, not a target — buying below it leaves room for taxes, maintenance, and life."],
    ],
  },

  "how-compound-interest-works": {
    title: "How compound interest works (and why starting early wins)",
    description:
      "Compound interest is interest earning interest — the engine behind long-term investing. Here's the intuition, the Rule of 72, and why time matters more than the amount.",
    published: "2026-07-20",
    updated: "2026-07-20",
    calc: "compound",
    related: ["compound", "savings_goal", "401k_contribution", "rule72"],
    intro:
      "Compound interest is often called the most powerful force in personal finance. The idea is simple — your returns earn returns of their own — but the consequence is dramatic: given enough time, the growth dwarfs what you actually put in.",
    sections: [
      {
        h: "Simple vs compound interest",
        body:
          "<p><strong>Simple interest</strong> is paid only on your original principal. <strong>Compound interest</strong> is paid on your principal <em>plus</em> all the interest already added — so the balance you earn on keeps getting bigger. Over one year the difference is tiny. Over thirty, it's the whole game.</p>",
      },
      {
        h: "Why time beats amount",
        body:
          "<p>Because growth is exponential, the dollars invested <em>earliest</em> do the most work. Investing $10,000 and adding $200 a month at a 7% annual return grows to about <strong>$144,600</strong> over 20 years — of which roughly <strong>$86,600 is interest</strong>, more than the $58,000 you contributed. Start ten years later and you don't just lose ten years of contributions; you lose the years when compounding would have been largest.</p>",
      },
      {
        h: "The Rule of 72",
        body:
          "<p>Want a quick estimate of how long money takes to double? Divide 72 by the annual return. At 8% a year, money doubles in about 72 ÷ 8 = <strong>9 years</strong>. It's an approximation, but a remarkably good one for everyday rates — try it in the <a href=\"/calc/rule72\">Rule of 72 Calculator</a>.</p>",
      },
      {
        h: "It cuts both ways",
        body:
          "<p>Compounding works just as relentlessly <em>against</em> you on debt. A credit-card balance at 22% APR compounds monthly, which is why carrying a balance is so expensive. The same math that builds a retirement fund also grows what you owe — see the <a href=\"/calc/cc_payoff\">Credit Card Payoff Calculator</a>.</p>",
      },
      {
        h: "See it for yourself",
        body:
          "<p>Enter your own starting balance, contribution, rate and time horizon in the <a href=\"/calc/compound\">Compound Interest Calculator</a> — it shows the projected balance and charts the growth curve. To work backward from a target instead, use the <a href=\"/calc/savings_goal\">Savings Goal Calculator</a>.</p>",
      },
    ],
    faqs: [
      ["How often does interest compound?", "It varies — daily, monthly, or annually. More frequent compounding earns slightly more, but the rate and time horizon matter far more."],
      ["Is compound growth guaranteed?", "No. A fixed savings rate is predictable, but investment returns vary year to year. Projections are estimates, not promises."],
      ["What's the single biggest lever?", "Time. Starting earlier usually beats contributing more later, because the earliest dollars compound the longest."],
    ],
  },

  "apr-vs-interest-rate": {
    title: "APR vs interest rate: what's the difference?",
    description:
      "They look interchangeable, but they cost you differently. Here's what the interest rate and APR each measure, when APR can mislead, and how to compare loan offers.",
    published: "2026-07-20",
    updated: "2026-07-20",
    calc: "apr",
    related: ["apr", "apr_advanced", "loan_basic", "discount_points"],
    intro:
      "Every loan quotes two numbers that look almost the same — the interest rate and the APR — and the gap between them is where a lot of money hides. Knowing which is which is the difference between comparing offers fairly and being fooled by a low headline rate.",
    sections: [
      {
        h: "The interest rate: the cost of the money",
        body:
          "<p>The <strong>interest rate</strong> is what the lender charges on the balance you borrow. It sets your monthly payment, but it says nothing about the fees you pay to get the loan.</p>",
      },
      {
        h: "The APR: the cost of the loan",
        body:
          "<p>The <strong>APR</strong> (Annual Percentage Rate) rolls the upfront fees — origination charges, points — into a single annual figure, so it reflects the true yearly cost. Because you receive less than the face amount (fees come out) but repay on the full amount, the APR is always <em>higher</em> than the interest rate whenever fees exist. A loan with no fees has an APR equal to its rate.</p><p>A $300,000 mortgage at a 6.5% rate with $6,000 in fees carries an effective APR of about <strong>6.70%</strong> — that 0.20% gap is the fees, made comparable.</p>",
      },
      {
        h: "When APR can mislead you",
        body:
          "<p>APR assumes you keep the loan for its <em>entire</em> term. If you'll sell or refinance in a few years, a loan with low fees and a slightly higher rate can actually cost you less than a low-APR loan whose fees you never fully amortize. APR is the right comparison for a loan you'll hold to the end — not always for one you won't.</p>",
      },
      {
        h: "How to compare offers",
        body:
          "<p>Compare loans by <strong>APR, not headline rate</strong>, and weigh it against how long you'll actually keep the loan. Run the numbers in the <a href=\"/calc/apr\">APR Calculator</a> (or the <a href=\"/calc/apr_advanced\">APR Advanced Calculator</a> for multiple fees and points), and use the <a href=\"/calc/loan_basic\">Loan Calculator</a> to see the monthly payment each rate produces. Thinking about buying down your rate? The <a href=\"/calc/discount_points\">Discount Points Calculator</a> finds the breakeven.</p>",
      },
    ],
    faqs: [
      ["Why is the APR higher than the interest rate?", "Because it includes fees. If a loan has no fees, its APR equals its interest rate; every fee pushes the APR above the rate."],
      ["Which number should I compare?", "APR, for an apples-to-apples cost comparison — but adjust for how long you'll keep the loan, since APR assumes you hold it the full term."],
      ["Does APR include every cost?", "It includes finance charges like points and origination fees, but not always every third-party cost (appraisal, title). Always read the official loan estimate."],
    ],
  },
};
