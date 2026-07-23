// ============================================================================
// Auto-generated explanatory content for every calculator that lacks a full
// hand-written guide (src/data/guides.js). Unlike the guides, NOTHING here is
// invented per page: the "How to use" section is derived from the calculator's
// real field list, and the "Worked example" is narrated from the engine's own
// computed result on the pre-filled example inputs. So each page gains specific,
// accurate, indexable prose — what every input is and a real worked example —
// while staying impossible to drift from the tool it describes.
//
// On top of this, src/data/explainers.js supplies hand-written "The formula" +
// "Key terms" + "FAQ" depth for the calculators reviewed so far; where present it
// is layered in below. A calculator with neither a guide nor an explainers entry
// still gets How-to-use + Worked example, so no page is left as an empty shell.
//
// DOM-free and dependency-light (only fmt + the EXPLAINERS data) so it runs at
// build time inside src/pages/calc/[id].astro. Authored strings in EXPLAINERS may
// carry inline <a>/<strong> and are injected as-is (trusted, authored here); all
// values derived from data are escaped.
// ============================================================================

import { fmt } from "./calculators.js";
import { EXPLAINERS } from "../data/explainers.js";

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// A whole number shows no decimals; otherwise up to two. Keeps example inputs
// reading like a person wrote them ("6", "6.5", "10,000") rather than "6.00".
const trimNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : esc(String(v));
};

// Plain-language description of what a field expects, inferred from its type and
// (for selects) its options. Specific enough to be useful; the specificity of the
// page comes from the field list itself, which differs for every calculator.
function fieldHint(f) {
  switch (f.type) {
    case "currency":
      return "a dollar amount";
    case "percent":
      return "a percentage (enter 6 for 6%)";
    case "select": {
      const opts = (f.options || []).map((o) => esc(o[1]));
      return opts.length <= 4
        ? `choose one — ${opts.join(", ")}`
        : `choose from ${opts.length} options (${opts.slice(0, 3).join(", ")}, …)`;
    }
    case "date":
      return "a calendar date";
    case "text":
      return "typed in directly, in the format shown";
    default:
      return "a number";
  }
}

// Format one field's example value for prose: option label for selects, currency
// with a $ for money, a trailing % for rates, plain trimmed numbers otherwise.
function fieldValueText(f, value) {
  if (value === undefined || value === null || value === "") return null;
  if (f.type === "select") {
    const opt = (f.options || []).find((o) => String(o[0]) === String(value));
    return esc(opt ? opt[1] : value);
  }
  if (f.type === "currency") return esc(fmt.cur(Number(value)));
  if (f.type === "percent") return trimNum(value) + "%";
  if (f.type === "number") return trimNum(value);
  return esc(String(value)); // text, date
}

// "How to use" — an intro plus the real input list. Present for every calculator.
function howToUseHtml(calc) {
  const items = calc.fields
    .map((f) => `<li><strong>${esc(f.label)}</strong> — ${fieldHint(f)}.</li>`)
    .join("");
  return `<div class="guide-block">
    <h2 id="how-to-use">How to use the ${esc(calc.name)}</h2>
    <p>The ${esc(calc.name)} is free and runs entirely in your browser — no sign-up, and nothing you enter leaves your device. It opens pre-filled with a realistic example, so you can see how it works before replacing any figure with your own; the results update as you type. Press <strong>Calculate</strong> to refresh the result panel, or <strong>Reset</strong> to return to the example.</p>
    <p>The inputs it asks for:</p>
    <ul class="guide-inputs">${items}</ul>
  </div>`;
}

// "The formula" — hand-written in EXPLAINERS. Same markup as the guide layer.
function methodHtml(m) {
  const vars = (m.where || [])
    .map(([sym, mean]) => `<div class="guide-var"><dt>${esc(sym)}</dt><dd>${mean}</dd></div>`)
    .join("");
  return `<div class="guide-block">
    <h2 id="formula">The formula</h2>
    <p>${m.lead}</p>
    <pre class="guide-formula"><code>${esc(m.expression)}</code></pre>
    ${vars ? `<dl class="guide-vars">${vars}</dl>` : ""}
    ${m.note ? `<p class="guide-aside">${m.note}</p>` : ""}
  </div>`;
}

// "Worked example" — narrated from the pre-filled inputs and the engine's real
// result. Rendered only when the example actually computed a primary figure, so a
// calculator with no example (or an error) never narrates a bogus one.
function workedExampleHtml(calc, displayFields, result) {
  if (!result || result.error || !result.primary) return "";
  const CAP = 6;
  const parts = [];
  for (const f of displayFields) {
    const t = fieldValueText(f, f.default);
    if (t !== null) parts.push(`<em>${esc(f.label)}</em> ${t}`);
  }
  let inputsText = parts.slice(0, CAP).join(", ");
  if (parts.length > CAP) inputsText += `, and ${parts.length - CAP} more`;

  const cells = (result.cells || [])
    .slice(0, 3)
    .map((c) => `${esc(c.k)} (${esc(c.v)})`);
  const breakdown = cells.length ? ` It also reports ${cells.join(", ")}.` : "";

  return `<div class="guide-block">
    <h2 id="example">Worked example</h2>
    <p>Using the example values — ${inputsText} — the ${esc(calc.name)} returns a <strong>${esc(result.primary.label)}</strong> of <strong>${esc(result.primary.value)}</strong>.${breakdown}</p>
    <p class="guide-aside">Prefer your own numbers? Change any field above and this recomputes instantly.</p>
  </div>`;
}

// "Key terms" — hand-written glossary in EXPLAINERS. Optional.
function termsHtml(terms) {
  const rows = terms
    .map(([t, d]) => `<div class="guide-term"><dt>${esc(t)}</dt><dd>${d}</dd></div>`)
    .join("");
  return `<div class="guide-block">
    <h2>Key terms</h2>
    <dl class="guide-glossary">${rows}</dl>
  </div>`;
}

// "FAQ" — hand-written in EXPLAINERS. Semantic h3/p per question.
function faqHtml(faqs) {
  const items = faqs
    .map(([q, a]) => `<div class="guide-faq-item"><h3>${esc(q)}</h3><p>${a}</p></div>`)
    .join("");
  return `<div class="guide-block">
    <h2 id="faq">Frequently asked questions</h2>
    <div class="guide-faq">${items}</div>
  </div>`;
}

// Compose the full explanatory section for a non-guide calculator, in the order
// AdSense/readers expect: How to use → The formula → Worked example → Key terms →
// FAQ. Generated sections always render; authored ones render where written.
export function explainerHtml(calc, displayFields, result) {
  const a = EXPLAINERS[calc.id] || {};
  let html = howToUseHtml(calc);
  if (a.method) html += methodHtml(a.method);
  html += workedExampleHtml(calc, displayFields, result);
  if (a.terms && a.terms.length) html += termsHtml(a.terms);
  if (a.faqs && a.faqs.length) html += faqHtml(a.faqs);
  html += `<p class="guide-meta">Educational information, not financial advice. See our <a href="/methodology">methodology</a> for how these tools are built and checked.</p>`;
  return html;
}
