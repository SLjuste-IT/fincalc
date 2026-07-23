// Per-page calculator interactivity. The form markup and the initial result are
// already in the HTML from the build; this only takes over re-computation once
// the user edits an input, so the page is useful before this file loads.
import { CALC_INDEX } from "../lib/calculators.js";
import { fieldHtml, resultHtml } from "../lib/render.js";
import { resultChart } from "../lib/charts.js";
import { fieldsWithExamples } from "../data/examples.js";
import { parseFigure, tweenFigure } from "../lib/animate.js";

const calcForm = document.getElementById("calcForm");
const calcResult = document.getElementById("calcResult");
if (calcForm && calcResult) {
  const calc = CALC_INDEX[calcForm.dataset.calcId];
  if (calc) {
    const readFormValues = () => {
      const values = {};
      calc.fields.forEach((f) => {
        const el = document.getElementById("f_" + f.key);
        if (!el) return;
        if (f.type === "select" || f.type === "date" || f.type === "text") values[f.key] = el.value;
        else values[f.key] = parseFloat(el.value);
      });
      return values;
    };

    // resultHtml() rebuilds the panel wholesale, so the outgoing figure can't be
    // read off the element afterwards — it is kept here instead.
    let lastFigure = null;
    const paint = (html) => {
      // Marks the panel as user-driven, which switches off the one-shot rule-draw
      // entrance so it doesn't re-fire on every keystroke.
      calcResult.classList.add("live");
      calcResult.innerHTML = html;
      const el = calcResult.querySelector(".result-primary .value");
      if (!el) {
        lastFigure = null;
        return;
      }
      const next = parseFigure(el.textContent);
      if (next && lastFigure !== null) tweenFigure(el, lastFigure, next.value, el.textContent);
      lastFigure = next ? next.value : null;
    };
    // Seed from the server-rendered result so the first edit tweens from what the
    // visitor was actually looking at rather than jumping from zero.
    lastFigure = (() => {
      const el = calcResult.querySelector(".result-primary .value");
      const f = el && parseFigure(el.textContent);
      return f ? f.value : null;
    })();

    const recompute = () => {
      try {
        const values = readFormValues();
        for (const f of calc.fields) {
          if (f.type !== "select" && f.type !== "date" && f.type !== "text" && isNaN(values[f.key])) {
            paint(resultHtml({ error: `Please enter a valid number for "${f.label}".` }));
            return;
          }
        }
        const result = calc.compute(values);
        paint(resultHtml(result) + resultChart(calc, values, result));
      } catch (e) {
        paint(resultHtml({ error: "Unable to calculate — please check your inputs." }));
      }
    };

    calcForm.addEventListener("input", recompute);
    calcForm.addEventListener("change", recompute);
    document.getElementById("calcBtn")?.addEventListener("click", recompute);
    document.getElementById("resetBtn")?.addEventListener("click", () => {
      // Rebuild the fields from the same example-filled builder the server used, so
      // a reset lands on exactly the markup the page shipped with — the worked
      // example — rather than clearing every field back to zero.
      const btnRow = calcForm.querySelector(".btn-row");
      calcForm.innerHTML = fieldsWithExamples(calc).map(fieldHtml).join("");
      calcForm.appendChild(btnRow);
      recompute();
    });
  }
}
