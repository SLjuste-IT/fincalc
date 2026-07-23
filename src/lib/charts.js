// ============================================================================
// Result charts — a lightweight, dependency-free SVG line/area chart under the
// numeric result, so a visitor sees the shape of the answer (a loan balance
// falling to zero, a nest egg compounding) not just a figure. Competitors lean on
// heavy chart libraries; this is a few hundred bytes of inline SVG that inherits
// the page's theme via CSS variables and needs no client runtime.
//
// Astro-only, like render.js (the retiring SPA has its own result renderer), so
// nothing here touches the DOM-free engine or its app.js twin.
//
// HOW THE DATA IS SOURCED — two honest paths, never hand-typed numbers:
//   * amort  — reads the balance column straight out of the calculator's own
//              prerendered table (loan_basic), so the curve is the engine's numbers.
//   * growth — RE-RUNS the calculator's own compute() across its time axis and
//              reads the primary each step. The engine stays the single source of
//              truth; this never re-implements a formula, so it can't drift from it.
//
// Axes always start at zero (no truncated baseline) — a truncated y-axis
// exaggerates growth, which on a money site would be misleading.
// ============================================================================

// Which calculators get a chart, and how to build its series. Curated rather than
// automatic: a chart is only added where it is unambiguously meaningful and the
// series is monotonic in a single time field. Easy to extend — add an entry.
const CHARTS = {
  // Amortization — balance falling to zero, read from the calculator's own table.
  loan_basic: { kind: "amort", title: "Loan balance over time", xUnit: "yr" },

  // Growth — series built by re-running compute() across a time field. Only added
  // where the primary is genuinely a function of that field and the curve is
  // monotonic; `startKey` sets a non-zero x origin (e.g. an age).
  compound: { kind: "growth", timeKey: "years", title: "Projected growth", xUnit: "yr" },
  "401k_contribution": { kind: "growth", timeKey: "years", title: "Projected balance", xUnit: "yr" },
  hsa: { kind: "growth", timeKey: "years", title: "Projected HSA value", xUnit: "yr" },
  mutual_fund_fee: { kind: "growth", timeKey: "years", title: "Cost of fees over time", xUnit: "yr" },
  cd: { kind: "growth", timeKey: "termMonths", title: "Projected value", xUnit: "mo" },
  retirement_planner: { kind: "growth", timeKey: "retireAge", startKey: "currentAge", title: "Projected nest egg", xUnit: "" },
  retirement_calc: { kind: "growth", timeKey: "retireAge", startKey: "currentAge", title: "Projected savings", xUnit: "" },
  business_forecast: { kind: "growth", timeKey: "years", title: "Projected revenue", xUnit: "yr" },
  inflation: { kind: "growth", timeKey: "endYear", startKey: "startYear", title: "Inflation-adjusted value", xUnit: "" },
};

function toNum(s) {
  const m = String(s).replace(/[$,]/g, "").match(/-?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

// Compact currency for axis ticks: $1.2M, $150k, $980.
function abbrevCur(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return "$" + (n / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (a >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return "$" + Math.round(n);
}

// Build the {x,y} series for a calculator, or null if it isn't chartable / the
// current inputs don't yield a clean curve. Exported for the verify-math guard.
export function chartData(calc, values, result) {
  const cfg = CHARTS[calc.id];
  if (!cfg) return null;

  if (cfg.kind === "amort") {
    const t = result && result.table;
    if (!t || !t.headers) return null;
    const bi = t.headers.findIndex((h) => /balance/i.test(h));
    const yi = t.headers.findIndex((h) => /year|period/i.test(h));
    if (bi < 0 || !t.rows.length) return null;
    // Seed the curve at (0, original principal) so it descends from the full loan.
    const pts = [{ x: 0, y: Number(values.amount) }];
    t.rows.forEach((row, i) => {
      const x = yi >= 0 ? toNum(row[yi]) : i + 1;
      const y = toNum(row[bi]);
      if (isFinite(x) && isFinite(y)) pts.push({ x, y });
    });
    return pts.length >= 2 && pts.every((p) => isFinite(p.y)) ? { cfg, pts } : null;
  }

  // growth: re-run compute() across the time field.
  const end = Number(values[cfg.timeKey]);
  const start = cfg.startKey ? Number(values[cfg.startKey]) : 0;
  if (!isFinite(end) || !isFinite(start) || end <= start) return null;
  const span = end - start;
  const steps = Math.min(Math.max(Math.round(span), 2), 60);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const x = start + (span * i) / steps;
    const r = calc.compute({ ...values, [cfg.timeKey]: x });
    if (!r || !r.primary || r.error) return null;
    const y = toNum(r.primary.value);
    if (!isFinite(y)) return null;
    pts.push({ x, y });
  }
  return { cfg, pts };
}

// Render the chart as an inline SVG string, or "" if the calculator has no chart.
export function resultChart(calc, values, result) {
  const data = chartData(calc, values, result);
  if (!data) return "";
  const { cfg, pts } = data;

  // viewBox sized near the result panel's real render width so SVG text (which
  // scales with the viewBox) lands close to its nominal pixel size.
  const W = 480, H = 210, padL = 50, padR = 12, padT = 12, padB = 26;
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMax = Math.max(...ys) * 1.08 || 1; // headroom; baseline is always 0
  const plotW = W - padL - padR, plotH = H - padT - padB, base = H - padB;
  const xAt = (x) => padL + (xMax === xMin ? 0 : (x - xMin) / (xMax - xMin)) * plotW;
  const yAt = (y) => base - (y / yMax) * plotH;

  // Horizontal value gridlines + left-edge tick labels.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const grid = ticks
    .map((v) => {
      const y = yAt(v).toFixed(1);
      return `<line class="grid" x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" /><text class="tick" x="${padL - 8}" y="${(Number(y) + 3).toFixed(1)}" text-anchor="end">${abbrevCur(v)}</text>`;
    })
    .join("");

  const line = pts.map((p, i) => `${i ? "L" : "M"}${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`).join(" ");
  const area = `M${xAt(pts[0].x).toFixed(1)} ${base} ${pts.map((p) => `L${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`).join(" ")} L${xAt(pts[pts.length - 1].x).toFixed(1)} ${base} Z`;

  const last = pts[pts.length - 1];
  const fmtX = (x) => `${Math.round(x)}${cfg.xUnit ? " " + cfg.xUnit : ""}`;
  const xLabels = `<text class="tick" x="${padL}" y="${H - 8}" text-anchor="start">${fmtX(xMin)}</text><text class="tick" x="${W - padR}" y="${H - 8}" text-anchor="end">${fmtX(xMax)}</text>`;
  const endDot = `<circle class="dot" cx="${xAt(last.x).toFixed(1)}" cy="${yAt(last.y).toFixed(1)}" r="3.2" />`;

  const aria = `${cfg.title}: from ${abbrevCur(pts[0].y)} at ${fmtX(xMin)} to ${abbrevCur(last.y)} at ${fmtX(xMax)}.`;

  return `<figure class="result-chart">
    <figcaption class="result-chart-title">${cfg.title}</figcaption>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${aria}" preserveAspectRatio="none">
      ${grid}
      <path class="area" d="${area}" />
      <path class="line" d="${line}" />
      ${endDot}
      ${xLabels}
    </svg>
  </figure>`;
}
